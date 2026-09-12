<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaystackWebhookEvent;
use App\Models\User;
use App\Models\VirtualAccount;
use App\Services\PaystackPaymentConfirmationService;
use App\Services\PaystackWalletFundingService;
use App\Services\VirtualAccountProvisioningService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use InvalidArgumentException;

class PaystackWebhookController extends Controller
{
    public function __construct(
        private readonly PaystackPaymentConfirmationService $paymentConfirmation,
        private readonly VirtualAccountProvisioningService $virtualAccounts,
        private readonly PaystackWalletFundingService $walletFunding,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $signature = (string) $request->header('x-paystack-signature', '');
        $secretKey = (string) config('services.paystack.secret_key', '');
        $computedSignature = hash_hmac('sha512', $payload, $secretKey);

        if ($secretKey === '' || $signature === '' || ! hash_equals($computedSignature, $signature)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid Paystack signature.',
            ], 401);
        }

        /** @var array<string, mixed> $event */
        $event = $request->json()->all();

        $eventName = (string) ($event['event'] ?? '');

        if ($eventName === 'dedicatedaccount.assign.success') {
            return $this->handleDedicatedAccountAssigned($event);
        }

        if ($eventName === 'dedicatedaccount.assign.failed') {
            return $this->handleDedicatedAccountFailed($event);
        }

        if ($eventName !== 'charge.success') {
            return response()->json([
                'status' => true,
                'message' => 'Event ignored.',
            ]);
        }

        return $this->handleChargeSuccess($event);
    }

    private function handleChargeSuccess(array $event): JsonResponse
    {
        try {
            $result = $this->walletFunding->processChargeSuccess($event);
        } catch (InvalidArgumentException $exception) {
            return response()->json([
                'status' => false,
                'message' => $exception->getMessage(),
            ], 422);
        }

        $creditedUser = $result['user'];

        if ($creditedUser && ! $result['alreadyProcessed']) {
            $paymentEvent = $result['paymentEvent'];

            if ($paymentEvent) {
                $reference = (string) data_get($event, 'data.reference', '');
                $order = Schema::hasTable('orders')
                    ? Order::query()->where('payment_reference', $reference)->first()
                    : null;

                if ($order) {
                    $order->forceFill([
                        'status' => 'PAID',
                        'payment_channel' => (string) data_get($event, 'data.channel', ''),
                        'gateway_response' => (string) data_get($event, 'data.gateway_response', ''),
                        'paid_at' => data_get($event, 'data.paid_at') ? \Carbon\Carbon::parse((string) data_get($event, 'data.paid_at')) : now(),
                        'total_paid' => $result['amount'],
                        'metadata' => array_merge($order->metadata ?? [], (array) data_get($event, 'data.metadata', [])),
                    ])->save();
                }

                $this->paymentConfirmation->send(
                    user: $creditedUser,
                    paymentEvent: $paymentEvent,
                    eventPayload: $event,
                    walletBalance: (float) $creditedUser->wallet_balance,
                    order: $order ?? null,
                );
            }
        }

        return response()->json([
            'status' => true,
            'message' => $creditedUser ? 'Wallet funded successfully.' : 'Webhook received.',
        ]);
    }

    private function handleDedicatedAccountAssigned(array $event): JsonResponse
    {
        $user = $this->findUserForDedicatedAccountEvent($event);
        $accountNumber = $this->extractAccountNumber($event);

        if ($user) {
            $this->virtualAccounts->storePaystackAccount($user, (array) data_get($event, 'data', []));
        }

        $this->recordWebhookEvent(
            event: 'dedicatedaccount.assign.success',
            reference: $this->assignmentEventReference($event, 'success'),
            accountNumber: $accountNumber,
            amount: 0,
            payload: $event,
            processed: (bool) $user,
        );

        return response()->json([
            'status' => true,
            'message' => $user ? 'Dedicated virtual account saved.' : 'Dedicated virtual account event received.',
        ]);
    }

    private function handleDedicatedAccountFailed(array $event): JsonResponse
    {
        $user = $this->findUserForDedicatedAccountEvent($event);
        $accountNumber = $this->extractAccountNumber($event);

        if ($user) {
            $this->virtualAccounts->markAssignmentFailed($user, (array) data_get($event, 'data', []));
        }

        $this->recordWebhookEvent(
            event: 'dedicatedaccount.assign.failed',
            reference: $this->assignmentEventReference($event, 'failed'),
            accountNumber: $accountNumber,
            amount: 0,
            payload: $event,
            processed: (bool) $user,
        );

        return response()->json([
            'status' => true,
            'message' => 'Dedicated virtual account failure recorded.',
        ]);
    }

    private function recordWebhookEvent(string $event, ?string $reference, string $accountNumber, float $amount, array $payload, bool $processed): void
    {
        $attributes = [
            'event' => $event,
            'account_number' => $accountNumber ?: null,
            'amount' => $amount,
            'payload' => $payload,
            'processed_at' => $processed ? now() : null,
        ];

        if ($reference) {
            PaystackWebhookEvent::query()->firstOrCreate(['reference' => $reference], $attributes);

            return;
        }

        PaystackWebhookEvent::query()->create(array_merge($attributes, ['reference' => null]));
    }

    private function findUserForDedicatedAccountEvent(array $event): ?User
    {
        $email = strtolower((string) data_get($event, 'data.customer.email', ''));

        if ($email !== '') {
            $user = User::query()
                ->whereRaw('lower(email) = ?', [$email])
                ->first();

            if ($user) {
                return $user;
            }
        }

        $customerCode = (string) data_get($event, 'data.customer.customer_code', '');

        if ($customerCode !== '') {
            $user = User::query()->where('paystack_customer_code', $customerCode)->first();

            if ($user) {
                return $user;
            }
        }

        $accountNumber = $this->extractAccountNumber($event);

        if ($accountNumber !== '') {
            return VirtualAccount::query()
                ->where('provider', 'paystack')
                ->where('account_number', $accountNumber)
                ->first()
                ?->user;
        }

        return null;
    }

    private function assignmentEventReference(array $event, string $status): ?string
    {
        $id = (string) data_get($event, 'data.id', '');
        $accountNumber = $this->extractAccountNumber($event);
        $customer = (string) data_get($event, 'data.customer.customer_code', '');
        $parts = array_filter(['dva', $status, $id ?: null, $accountNumber ?: null, $customer ?: null]);

        return $parts ? implode('-', $parts) : null;
    }

    private function extractAccountNumber(array $event): string
    {
        $paths = [
            'data.account_number',
            'data.accountNumber',
            'data.account.number',
            'data.dedicated_account.account_number',
            'data.metadata.account_number',
            'data.metadata.dedicated_account.account_number',
            'data.customer.dedicated_account.account_number',
            'data.authorization.receiver_bank_account_number',
            'data.authorization.receiverBankAccountNumber',
            'data.recipient.account_number',
        ];

        foreach ($paths as $path) {
            $value = data_get($event, $path);

            if ((is_string($value) || is_numeric($value)) && (string) $value !== '') {
                return (string) $value;
            }
        }

        return '';
    }
}

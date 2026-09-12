<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaystackWebhookEvent;
use App\Services\PaystackPaymentConfirmationService;
use App\Services\PaystackService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaystackPaymentReturnController extends Controller
{
    public function __construct(
        private readonly PaystackService $paystack,
        private readonly PaystackPaymentConfirmationService $paymentConfirmation,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'reference' => ['required', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:50'],
        ]);

        $status = strtolower((string) ($data['status'] ?? 'success'));

        if ($status !== '' && ! in_array($status, ['success', 'successful'], true)) {
            return response()->json([
                'status' => false,
                'message' => 'Payment was not completed successfully.',
            ], 422);
        }

        $transaction = $this->paystack->verifyTransaction($data['reference']);

        if (strtolower((string) data_get($transaction, 'status')) !== 'success') {
            return response()->json([
                'status' => false,
                'message' => 'Paystack has not confirmed this payment as successful yet.',
            ], 422);
        }

        $user = $request->user();
        $customerEmail = strtolower((string) data_get($transaction, 'customer.email', ''));
        $reference = (string) data_get($transaction, 'reference', $data['reference']);
        $order = Order::query()
            ->where('payment_reference', $reference)
            ->where('user_id', $user->id)
            ->first();

        if ($customerEmail !== '' && strtolower($user->email) !== $customerEmail) {
            return response()->json([
                'status' => false,
                'message' => 'This payment does not belong to the logged in user.',
            ], 403);
        }

        if (! $order) {
            return response()->json([
                'status' => false,
                'message' => 'No matching order was found for this payment reference.',
            ], 404);
        }

        $payload = [
            'event' => 'transaction.success',
            'data' => $transaction,
        ];

        $paymentEvent = PaystackWebhookEvent::query()->firstOrCreate(
            ['reference' => $reference],
            [
                'event' => 'transaction.success',
                'account_number' => $this->extractAccountNumber($payload) ?: $this->primaryVirtualAccountNumber($user),
                'amount' => $this->normalizeAmount((float) data_get($transaction, 'amount', 0)),
                'payload' => $payload,
                'processed_at' => now(),
            ]
        );

        if (! $paymentEvent->payload) {
            $paymentEvent->forceFill([
                'payload' => $payload,
            ])->save();
        }

        $order->forceFill([
            'status' => 'PAID',
            'payment_channel' => (string) data_get($transaction, 'channel', ''),
            'gateway_response' => (string) data_get($transaction, 'gateway_response', ''),
            'paid_at' => data_get($transaction, 'paid_at') ? Carbon::parse((string) data_get($transaction, 'paid_at')) : now(),
            'total_paid' => $this->normalizeAmount((float) data_get($transaction, 'amount', $order->total_paid)),
            'metadata' => array_merge($order->metadata ?? [], (array) data_get($transaction, 'metadata', [])),
        ])->save();

        $emailSent = $this->paymentConfirmation->send(
            user: $user,
            paymentEvent: $paymentEvent,
            eventPayload: $payload,
            walletBalance: (float) $user->wallet_balance,
            order: $order,
        );

        return response()->json([
            'status' => true,
            'message' => $emailSent
                ? 'Payment confirmed and confirmation email sent.'
                : 'Payment confirmed. Confirmation email was already sent earlier.',
            'emailSent' => $emailSent,
            'reference' => $paymentEvent->reference,
            'orderNumber' => $order->order_number,
        ]);
    }

    private function normalizeAmount(float $amount): float
    {
        return $amount > 9999 ? $amount / 100 : $amount;
    }

    private function primaryVirtualAccountNumber($user): ?string
    {
        return $user->virtualAccounts()
            ->where('provider', 'paystack')
            ->whereNotNull('account_number')
            ->orderByRaw("case when status = 'active' then 0 else 1 end")
            ->value('account_number');
    }

    private function extractAccountNumber(array $event): string
    {
        $paths = [
            'data.account_number',
            'data.accountNumber',
            'data.dedicated_account.account_number',
            'data.metadata.account_number',
            'data.metadata.dedicated_account.account_number',
            'data.customer.dedicated_account.account_number',
            'data.authorization.receiver_bank_account_number',
            'data.recipient.account_number',
        ];

        foreach ($paths as $path) {
            $value = data_get($event, $path);

            if (is_string($value) && $value !== '') {
                return $value;
            }
        }

        return '';
    }
}

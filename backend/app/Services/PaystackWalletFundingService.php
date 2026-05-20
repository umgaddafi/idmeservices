<?php

namespace App\Services;

use App\Models\PaystackWebhookEvent;
use App\Models\Transaction;
use App\Models\User;
use App\Models\VirtualAccount;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class PaystackWalletFundingService
{
    /**
     * @return array{user: ?User, paymentEvent: PaystackWebhookEvent, alreadyProcessed: bool, amount: float, accountNumber: string}
     */
    public function processChargeSuccess(array $event): array
    {
        $reference = (string) data_get($event, 'data.reference', '');
        $accountNumber = $this->extractAccountNumber($event);
        $amountKobo = (int) data_get($event, 'data.amount', 0);

        if ($reference === '' || $amountKobo <= 0) {
            throw new InvalidArgumentException('Required webhook fields are missing.');
        }

        $amount = $amountKobo / 100;

        return DB::transaction(function () use ($accountNumber, $amount, $event, $reference): array {
            $existingEvent = PaystackWebhookEvent::query()->where('reference', $reference)->first();
            $existingTransaction = Transaction::query()->where('reference', $reference)->first();

            if ($existingTransaction || ($existingEvent && $existingEvent->processed_at)) {
                return [
                    'user' => $existingTransaction?->user,
                    'paymentEvent' => $existingEvent ?? $this->createWebhookEvent($reference, $accountNumber, $amount, $event),
                    'alreadyProcessed' => true,
                    'amount' => $amount,
                    'accountNumber' => $accountNumber,
                ];
            }

            [$user, $virtualAccount] = $this->resolveUserAndAccount($event, $accountNumber);

            if ($user) {
                $user->increment('wallet_balance', $amount);
                $user->refresh();

                Transaction::query()->firstOrCreate(
                    ['reference' => $reference],
                    [
                        'user_id' => $user->id,
                        'type' => 'Wallet Deposit',
                        'direction' => 'credit',
                        'amount' => $amount,
                        'status' => 'Completed',
                        'description' => 'Wallet funded via dedicated virtual account',
                        'metadata' => [
                            'provider' => 'paystack',
                            'account_number' => $accountNumber ?: null,
                            'bank_name' => data_get($event, 'data.authorization.receiver_bank'),
                            'channel' => data_get($event, 'data.channel'),
                            'customer_email' => data_get($event, 'data.customer.email'),
                        ],
                        'processed_at' => data_get($event, 'data.paid_at')
                            ? Carbon::parse((string) data_get($event, 'data.paid_at'))
                            : now(),
                    ]
                );

                $virtualAccount?->forceFill([
                    'status' => 'active',
                    'active' => true,
                    'assigned' => true,
                    'last_synced_at' => now(),
                ])->save();
            }

            if ($existingEvent) {
                $existingEvent->forceFill([
                    'event' => 'charge.success',
                    'account_number' => $accountNumber ?: $existingEvent->account_number,
                    'amount' => $amount,
                    'payload' => $event,
                    'processed_at' => $user ? now() : null,
                ])->save();

                $paymentEvent = $existingEvent->fresh();
            } else {
                $paymentEvent = $this->createWebhookEvent($reference, $accountNumber, $amount, $event, $user !== null);
            }

            return [
                'user' => $user,
                'paymentEvent' => $paymentEvent,
                'alreadyProcessed' => false,
                'amount' => $amount,
                'accountNumber' => $accountNumber,
            ];
        });
    }

    public function extractAccountNumber(array $event): string
    {
        $paths = [
            'data.account_number',
            'data.accountNumber',
            'data.account.number',
            'data.account_details.account_number',
            'data.accountDetails.accountNumber',
            'data.dedicated_account.account_number',
            'data.dedicatedAccount.accountNumber',
            'data.metadata.account_number',
            'data.metadata.accountNumber',
            'data.metadata.dedicated_account.account_number',
            'data.metadata.dedicatedAccount.accountNumber',
            'data.customer.dedicated_account.account_number',
            'data.customer.dedicatedAccount.accountNumber',
            'data.authorization.receiver_bank_account_number',
            'data.authorization.receiverBankAccountNumber',
            'data.recipient.account_number',
            'data.recipient.accountNumber',
        ];

        foreach ($paths as $path) {
            $value = data_get($event, $path);

            if ((is_string($value) || is_numeric($value)) && (string) $value !== '') {
                return (string) $value;
            }
        }

        return '';
    }

    /**
     * @return array{0: ?User, 1: ?VirtualAccount}
     */
    private function resolveUserAndAccount(array $event, string $accountNumber): array
    {
        if ($accountNumber !== '') {
            $virtualAccount = VirtualAccount::query()
                ->where('provider', 'paystack')
                ->where('account_number', $accountNumber)
                ->lockForUpdate()
                ->first();

            if ($virtualAccount) {
                $user = User::query()->whereKey($virtualAccount->user_id)->lockForUpdate()->first();

                return [$user, $virtualAccount];
            }
        }

        $customerCode = $this->extractCustomerCode($event);

        if ($customerCode !== '') {
            $virtualAccount = VirtualAccount::query()
                ->where('provider', 'paystack')
                ->where(function ($query) use ($customerCode): void {
                    $query->where('reservation_reference', $customerCode)
                        ->orWhere('account_reference', $customerCode);
                })
                ->lockForUpdate()
                ->first();

            if ($virtualAccount) {
                $user = User::query()->whereKey($virtualAccount->user_id)->lockForUpdate()->first();

                return [$user, $virtualAccount];
            }

            $user = User::query()
                ->where('paystack_customer_code', $customerCode)
                ->lockForUpdate()
                ->first();

            if ($user) {
                $virtualAccount = VirtualAccount::query()
                    ->where('provider', 'paystack')
                    ->where('user_id', $user->id)
                    ->lockForUpdate()
                    ->first();

                return [$user, $virtualAccount];
            }
        }

        $email = strtolower((string) data_get($event, 'data.customer.email', ''));

        if ($email === '') {
            return [null, null];
        }

        $user = User::query()
            ->whereRaw('lower(email) = ?', [$email])
            ->lockForUpdate()
            ->first();

        if (! $user) {
            return [null, null];
        }

        $virtualAccount = VirtualAccount::query()
            ->where('provider', 'paystack')
            ->where('user_id', $user->id)
            ->lockForUpdate()
            ->first();

        return [$user, $virtualAccount];
    }

    private function extractCustomerCode(array $event): string
    {
        $paths = [
            'data.customer.customer_code',
            'data.customer.customerCode',
            'data.dedicated_account.customer.customer_code',
            'data.dedicatedAccount.customer.customerCode',
            'data.metadata.customer_code',
            'data.metadata.customerCode',
        ];

        foreach ($paths as $path) {
            $value = data_get($event, $path);

            if ((is_string($value) || is_numeric($value)) && (string) $value !== '') {
                return (string) $value;
            }
        }

        return '';
    }

    private function createWebhookEvent(string $reference, string $accountNumber, float $amount, array $event, bool $processed = false): PaystackWebhookEvent
    {
        return PaystackWebhookEvent::query()->create([
            'event' => 'charge.success',
            'reference' => $reference,
            'account_number' => $accountNumber ?: null,
            'amount' => $amount,
            'payload' => $event,
            'processed_at' => $processed ? now() : null,
        ]);
    }
}

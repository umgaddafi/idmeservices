<?php

namespace App\Services;

use App\Models\PaystackWebhookEvent;
use App\Models\Transaction;
use App\Models\User;
use App\Models\VirtualAccount;
use Illuminate\Support\Facades\Log;

class PaystackWalletReconciliationService
{
    public function __construct(
        private readonly PaystackService $paystack,
        private readonly PaystackWalletFundingService $walletFunding,
    ) {
    }

    /**
     * @return array{checked: int, credited: int, skipped: int, alreadyProcessed: int, credits: array<int, array<string, mixed>>}
     */
    public function reconcileRecent(?User $user = null, int $limit = 100): array
    {
        $limit = max(1, min($limit, 200));
        $transactions = $this->paystack->listTransactions([
            'perPage' => $limit,
            'page' => 1,
            'status' => 'success',
        ]);

        $summary = [
            'checked' => 0,
            'credited' => 0,
            'skipped' => 0,
            'alreadyProcessed' => 0,
            'credits' => [],
        ];

        foreach ((array) $transactions as $transaction) {
            $reference = (string) data_get($transaction, 'reference', '');

            if ($reference === '') {
                $summary['skipped']++;
                continue;
            }

            $summary['checked']++;

            $existingEvent = PaystackWebhookEvent::query()->where('reference', $reference)->first();
            $existingTransaction = Transaction::query()->where('reference', $reference)->exists();

            if ($existingTransaction || ($existingEvent && $existingEvent->processed_at)) {
                $summary['alreadyProcessed']++;
                continue;
            }

            try {
                $verified = $this->paystack->verifyTransaction($reference);
            } catch (\Throwable $exception) {
                Log::warning('Unable to verify Paystack transaction during wallet reconciliation.', [
                    'reference' => $reference,
                    'message' => $exception->getMessage(),
                ]);
                $summary['skipped']++;
                continue;
            }

            if (strtolower((string) data_get($verified, 'status')) !== 'success') {
                $summary['skipped']++;
                continue;
            }

            $event = [
                'event' => 'charge.success',
                'data' => $verified,
            ];

            if (! $this->matchesKnownWallet($event, $user)) {
                $summary['skipped']++;
                continue;
            }

            $result = $this->walletFunding->processChargeSuccess($event);

            if ($result['alreadyProcessed']) {
                $summary['alreadyProcessed']++;
                continue;
            }

            if (! $result['user']) {
                $summary['skipped']++;
                continue;
            }

            $summary['credited']++;
            $summary['credits'][] = [
                'userId' => (string) $result['user']->id,
                'email' => $result['user']->email,
                'amount' => (float) $result['amount'],
                'reference' => $reference,
                'accountNumber' => $result['accountNumber'],
            ];
        }

        return $summary;
    }

    /**
     * @return array{reference: string, status: string, amount: float, accountNumber: string, alreadyProcessed: bool, credited: bool, matched: bool, user: ?User, transaction: array<string, mixed>}
     */
    public function reconcileReference(string $reference, ?User $user = null): array
    {
        $reference = trim($reference);

        if ($reference === '') {
            throw new \InvalidArgumentException('Paystack reference is required.');
        }

        $verified = $this->paystack->verifyTransaction($reference);
        $event = [
            'event' => 'charge.success',
            'data' => $verified,
        ];
        $status = strtolower((string) data_get($verified, 'status'));
        $amount = ((int) data_get($verified, 'amount', 0)) / 100;
        $accountNumber = $this->walletFunding->extractAccountNumber($event);

        if ($status !== 'success') {
            return [
                'reference' => $reference,
                'status' => $status ?: 'unknown',
                'amount' => $amount,
                'accountNumber' => $accountNumber,
                'alreadyProcessed' => false,
                'credited' => false,
                'matched' => false,
                'user' => null,
                'transaction' => $this->transactionDetails($verified),
            ];
        }

        if (! $this->matchesKnownWallet($event, $user)) {
            return [
                'reference' => $reference,
                'status' => 'success',
                'amount' => $amount,
                'accountNumber' => $accountNumber,
                'alreadyProcessed' => false,
                'credited' => false,
                'matched' => false,
                'user' => null,
                'transaction' => $this->transactionDetails($verified),
            ];
        }

        $result = $this->walletFunding->processChargeSuccess($event);
        $creditedUser = $result['user'];
        $alreadyProcessed = (bool) $result['alreadyProcessed'];

        if ($alreadyProcessed) {
            $existingTransaction = Transaction::query()
                ->with('user')
                ->where('reference', $reference)
                ->first();
            $creditedUser = $existingTransaction?->user;
        }

        return [
            'reference' => $reference,
            'status' => 'success',
            'amount' => $amount,
            'accountNumber' => $accountNumber,
            'alreadyProcessed' => $alreadyProcessed,
            'credited' => (bool) ($creditedUser && ! $alreadyProcessed),
            'matched' => (bool) $creditedUser,
            'user' => $creditedUser,
            'transaction' => $this->transactionDetails($verified),
        ];
    }

    private function matchesKnownWallet(array $event, ?User $user = null): bool
    {
        $accountNumber = $this->walletFunding->extractAccountNumber($event);

        if ($accountNumber !== '') {
            $query = VirtualAccount::query()
                ->where('provider', 'paystack')
                ->where('account_number', $accountNumber);

            if ($user) {
                $query->where('user_id', $user->id);
            }

            if ($query->exists()) {
                return true;
            }
        }

        if ((string) data_get($event, 'data.channel') !== 'dedicated_nuban') {
            return false;
        }

        $email = strtolower((string) data_get($event, 'data.customer.email', ''));

        if ($email === '') {
            return false;
        }

        $query = User::query()->whereRaw('lower(email) = ?', [$email]);

        if ($user) {
            $query->whereKey($user->id);
        }

        return $query->exists();
    }

    /**
     * @return array<string, mixed>
     */
    private function transactionDetails(array $transaction): array
    {
        return [
            'reference' => (string) data_get($transaction, 'reference', ''),
            'status' => (string) data_get($transaction, 'status', ''),
            'amount' => ((int) data_get($transaction, 'amount', 0)) / 100,
            'currency' => (string) data_get($transaction, 'currency', 'NGN'),
            'channel' => (string) data_get($transaction, 'channel', ''),
            'gatewayResponse' => (string) data_get($transaction, 'gateway_response', ''),
            'paidAt' => data_get($transaction, 'paid_at'),
            'customerEmail' => (string) data_get($transaction, 'customer.email', ''),
            'receiverBank' => (string) data_get($transaction, 'authorization.receiver_bank', ''),
            'receiverAccountNumber' => (string) data_get($transaction, 'authorization.receiver_bank_account_number', ''),
        ];
    }
}

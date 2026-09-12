<?php

use App\Models\User;
use App\Models\VirtualAccount;
use App\Services\PaystackPaymentConfirmationService;
use App\Services\PaystackService;
use App\Services\PaystackWalletFundingService;
use App\Services\VirtualAccountProvisioningService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('wallet:provision-virtual-accounts {--user= : Provision one user id or email} {--force : Re-request accounts even when an active one exists} {--dry-run : Show the users that would be processed}', function (VirtualAccountProvisioningService $virtualAccounts): int {
    $userFilter = trim((string) $this->option('user'));
    $force = (bool) $this->option('force');
    $dryRun = (bool) $this->option('dry-run');

    $query = User::query()
        ->where('role', 'MEMBER')
        ->orderBy('id');

    if ($userFilter !== '') {
        $query->where(function ($builder) use ($userFilter): void {
            $builder->whereKey($userFilter)->orWhere('email', $userFilter);
        });
    } elseif (! $force) {
        $query->whereDoesntHave('virtualAccounts', function ($builder): void {
            $builder
                ->where('provider', 'paystack')
                ->where('status', 'active')
                ->whereNotNull('account_number');
        });
    }

    $users = $query->get();

    if ($users->isEmpty()) {
        $this->info('No member accounts need virtual account provisioning.');

        return 0;
    }

    if ($dryRun) {
        $this->table(['ID', 'Email', 'Name'], $users->map(fn (User $user): array => [
            $user->id,
            $user->email,
            $user->name,
        ])->all());

        return 0;
    }

    $created = 0;
    $failed = 0;

    foreach ($users as $user) {
        $this->line("Provisioning {$user->email}...");
        $accounts = $virtualAccounts->provisionForUser($user, $force);
        $activeCount = collect($accounts)->filter(fn (VirtualAccount $account): bool => $account->status === 'active' && filled($account->account_number))->count();

        if ($activeCount > 0) {
            $created += $activeCount;
            $this->info("  Saved {$activeCount} active account(s).");
            continue;
        }

        $failed++;
        $reason = collect($accounts)->pluck('failure_reason')->filter()->first() ?: 'No active account was returned.';
        $this->warn("  Pending/failed: {$reason}");
    }

    $this->info("Provisioning complete. Active accounts saved: {$created}. Members pending or failed: {$failed}.");

    return $failed === 0 ? 0 : 1;
})->purpose('Provision Paystack dedicated virtual accounts for member wallets');

Artisan::command('wallet:reconcile-paystack-reference {reference : Paystack transaction reference}', function (string $reference): int {
    $paystack = app(PaystackService::class);
    $walletFunding = app(PaystackWalletFundingService::class);
    $paymentConfirmation = app(PaystackPaymentConfirmationService::class);

    $transaction = $paystack->verifyTransaction($reference);

    if (strtolower((string) data_get($transaction, 'status')) !== 'success') {
        $this->error('Paystack has not marked this transaction as successful.');

        return 1;
    }

    $result = $walletFunding->processChargeSuccess([
        'event' => 'charge.success',
        'data' => $transaction,
    ]);

    if ($result['alreadyProcessed']) {
        $this->info('This Paystack reference has already been processed.');

        return 0;
    }

    if (! $result['user']) {
        $this->warn('The transaction was saved, but no matching member wallet was found.');

        return 1;
    }

    $paymentConfirmation->send(
        user: $result['user'],
        paymentEvent: $result['paymentEvent'],
        eventPayload: [
            'event' => 'charge.success',
            'data' => $transaction,
        ],
        walletBalance: (float) $result['user']->wallet_balance,
    );

    $this->info("Credited {$result['user']->email} with NGN ".number_format((float) $result['amount'], 2).'.');

    return 0;
})->purpose('Verify and credit a successful Paystack dedicated-account transfer by reference');

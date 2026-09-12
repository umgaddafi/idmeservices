<?php

namespace App\Support\Api;

use App\Models\User;
use App\Models\VirtualAccount;
use Illuminate\Support\Collection;

class UserPayload
{
    public static function from(User $user): array
    {
        $virtualAccounts = self::virtualAccountsFor($user);

        return [
            'id' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'nin' => $user->nin,
            'bvn' => $user->bvn,
            'role' => $user->role,
            'memberId' => $user->member_id,
            'totalSavings' => (float) $user->total_savings,
            'walletBalance' => (float) $user->wallet_balance,
            'joinDate' => optional($user->join_date)->toDateString(),
            'status' => $user->status,
            'walletProfile' => [
                'label' => $user->wallet_label ?: 'NINVerify Wallet',
                'reference' => $user->wallet_reference,
                'note' => $user->funding_note,
                'accounts' => $virtualAccounts,
            ],
            'virtualAccounts' => $virtualAccounts,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private static function virtualAccountsFor(User $user): array
    {
        /** @var Collection<int, VirtualAccount> $accounts */
        $accounts = $user->relationLoaded('virtualAccounts')
            ? $user->virtualAccounts
            : $user->virtualAccounts()
                ->orderByRaw("case when status = 'active' then 0 when status = 'pending' then 1 else 2 end")
                ->orderBy('bank_name')
                ->get();

        return $accounts
            ->map(fn (VirtualAccount $account): array => [
                'id' => (string) $account->id,
                'provider' => $account->provider,
                'status' => $account->status,
                'accountReference' => $account->account_reference,
                'reservationReference' => $account->reservation_reference,
                'accountName' => $account->account_name,
                'accountNumber' => $account->account_number,
                'bankName' => $account->bank_name,
                'bankCode' => $account->bank_code,
                'providerSlug' => $account->provider_slug,
                'currency' => $account->currency ?: config('idmeservices.currency.code', 'USD'),
                'customerName' => $account->customer_name,
                'customerEmail' => $account->customer_email,
                'failureReason' => $account->failure_reason,
                'active' => (bool) $account->active,
                'assigned' => (bool) $account->assigned,
                'lastSyncedAt' => optional($account->last_synced_at)->toIso8601String(),
            ])
            ->values()
            ->all();
    }
}

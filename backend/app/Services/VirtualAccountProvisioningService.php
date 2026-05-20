<?php

namespace App\Services;

use App\Models\User;
use App\Models\VirtualAccount;
use Illuminate\Support\Arr;
use RuntimeException;

class VirtualAccountProvisioningService
{
    private const PROVIDER = 'paystack';

    public function __construct(private readonly PaystackService $paystack)
    {
    }

    /**
     * @return array<int, VirtualAccount>
     */
    public function provisionForUser(User $user, bool $force = false): array
    {
        if (! $this->paystack->isConfigured()) {
            return $this->markConfiguredBanksAsFailed($user, 'PAYSTACK_SECRET_KEY is not configured.');
        }

        $name = $this->splitName($user->name);

        try {
            $customer = $this->ensurePaystackCustomer($user, $name);
        } catch (RuntimeException $exception) {
            return $this->markConfiguredBanksAsFailed($user, $exception->getMessage());
        }

        $accounts = [];

        foreach ($this->preferredBanks() as $bankSlug) {
            $account = $this->pendingAccountFor($user, $bankSlug);

            if (! $force && $account->account_number && $account->status === 'active') {
                $accounts[] = $account;
                continue;
            }

            try {
                $response = $this->paystack->createDedicatedAccount([
                    'customer' => $customer,
                    'preferred_bank' => $bankSlug,
                    'first_name' => $name['first_name'],
                    'last_name' => $name['last_name'],
                    'phone' => $user->phone,
                ]);

                $accounts[] = $this->storePaystackAccount($user, $response, $bankSlug);
            } catch (RuntimeException $exception) {
                $account->forceFill([
                    'status' => 'failed',
                    'failure_reason' => $exception->getMessage(),
                    'last_synced_at' => now(),
                ])->save();

                $accounts[] = $account->fresh();
            }
        }

        return $accounts;
    }

    public function storePaystackAccount(User $user, array $payload, ?string $fallbackBankSlug = null): VirtualAccount
    {
        $accountNumber = (string) data_get($payload, 'account_number', '');
        $providerSlug = (string) (
            data_get($payload, 'bank.slug')
            ?: data_get($payload, 'bank.provider_slug')
            ?: $fallbackBankSlug
            ?: ''
        );

        $account = $this->findAccount($user, $accountNumber, $providerSlug) ?? new VirtualAccount([
            'user_id' => $user->id,
            'provider' => self::PROVIDER,
        ]);

        $customerEmail = (string) (data_get($payload, 'customer.email') ?: $user->email);
        $customerName = $this->customerNameFromPayload($payload, $user);
        $isActive = (bool) data_get($payload, 'active', true);
        $isAssigned = (bool) data_get($payload, 'assigned', true);

        $account->forceFill([
            'user_id' => $user->id,
            'provider' => self::PROVIDER,
            'status' => $accountNumber !== '' && $isActive && $isAssigned ? 'active' : 'pending',
            'account_reference' => (string) data_get($payload, 'id', $account->account_reference),
            'reservation_reference' => (string) (data_get($payload, 'customer.customer_code') ?: $user->paystack_customer_code ?: $account->reservation_reference),
            'account_name' => (string) data_get($payload, 'account_name', $account->account_name),
            'account_number' => $accountNumber !== '' ? $accountNumber : $account->account_number,
            'bank_name' => (string) (data_get($payload, 'bank.name') ?: data_get($payload, 'bank.bank_name') ?: $account->bank_name),
            'bank_code' => (string) (data_get($payload, 'bank.code') ?: data_get($payload, 'bank.id') ?: data_get($payload, 'bank.bank_id') ?: $account->bank_code),
            'provider_slug' => $providerSlug !== '' ? $providerSlug : $account->provider_slug,
            'currency' => (string) data_get($payload, 'currency', $account->currency ?: 'NGN'),
            'customer_name' => $customerName,
            'customer_email' => $customerEmail,
            'raw_accounts' => Arr::wrap($payload),
            'raw_response' => $payload,
            'failure_reason' => null,
            'active' => $isActive,
            'assigned' => $isAssigned,
            'last_synced_at' => now(),
        ])->save();

        if (! $user->paystack_customer_code || ! $user->paystack_customer_id) {
            $user->forceFill(array_filter([
                'paystack_customer_id' => data_get($payload, 'customer.id'),
                'paystack_customer_code' => data_get($payload, 'customer.customer_code'),
            ], static fn (mixed $value): bool => $value !== null && $value !== ''))->save();
        }

        return $account->fresh();
    }

    public function markAssignmentFailed(User $user, array $payload): VirtualAccount
    {
        $providerSlug = (string) (data_get($payload, 'preferred_bank') ?: data_get($payload, 'bank.slug') ?: $this->preferredBanks()[0]);
        $account = $this->pendingAccountFor($user, $providerSlug);

        $account->forceFill([
            'status' => 'failed',
            'failure_reason' => (string) (data_get($payload, 'reason') ?: data_get($payload, 'message') ?: 'Paystack could not assign a dedicated account.'),
            'raw_response' => $payload,
            'last_synced_at' => now(),
        ])->save();

        return $account->fresh();
    }

    /**
     * @return array<int, string>
     */
    public function preferredBanks(): array
    {
        $banks = config('services.paystack.dedicated_account_banks', ['wema-bank']);

        if (is_string($banks)) {
            $banks = explode(',', $banks);
        }

        $banks = array_values(array_filter(array_map(
            static fn (mixed $bank): string => trim((string) $bank),
            is_array($banks) ? $banks : []
        )));

        return $banks ?: ['wema-bank'];
    }

    /**
     * @return array{first_name: string, last_name: string}
     */
    private function splitName(string $name): array
    {
        $normalized = trim((string) preg_replace('/\s+/', ' ', $name));
        $parts = $normalized !== '' ? explode(' ', $normalized, 2) : [];
        $firstName = $parts[0] ?? 'NINVerify';
        $lastName = $parts[1] ?? 'Customer';

        return [
            'first_name' => $firstName,
            'last_name' => $lastName,
        ];
    }

    /**
     * @param array{first_name: string, last_name: string} $name
     */
    private function ensurePaystackCustomer(User $user, array $name): string
    {
        if ($user->paystack_customer_code) {
            return (string) $user->paystack_customer_code;
        }

        if ($user->paystack_customer_id) {
            return (string) $user->paystack_customer_id;
        }

        $customer = $this->paystack->createCustomer([
            'email' => $user->email,
            'first_name' => $name['first_name'],
            'last_name' => $name['last_name'],
            'phone' => $user->phone,
            'metadata' => [
                'user_id' => (string) $user->id,
                'member_id' => $user->member_id,
            ],
        ]);

        $customerCode = (string) data_get($customer, 'customer_code', '');
        $customerId = data_get($customer, 'id');

        if ($customerCode === '' && ! $customerId) {
            throw new RuntimeException('Paystack did not return a customer code for this member.');
        }

        $user->forceFill(array_filter([
            'paystack_customer_id' => $customerId,
            'paystack_customer_code' => $customerCode,
        ], static fn (mixed $value): bool => $value !== null && $value !== ''))->save();

        return $customerCode !== '' ? $customerCode : (string) $customerId;
    }

    private function pendingAccountFor(User $user, string $bankSlug): VirtualAccount
    {
        $account = VirtualAccount::query()->firstOrNew([
            'user_id' => $user->id,
            'provider' => self::PROVIDER,
            'provider_slug' => $bankSlug,
        ]);

        if (! $account->exists) {
            $account->forceFill([
                'status' => 'pending',
                'currency' => 'NGN',
                'customer_name' => $user->name,
                'customer_email' => $user->email,
            ])->save();
        }

        return $account;
    }

    private function findAccount(User $user, string $accountNumber, string $providerSlug): ?VirtualAccount
    {
        if ($accountNumber !== '') {
            $account = VirtualAccount::query()
                ->where('provider', self::PROVIDER)
                ->where('account_number', $accountNumber)
                ->first();

            if ($account) {
                return $account;
            }
        }

        if ($providerSlug !== '') {
            return VirtualAccount::query()
                ->where('user_id', $user->id)
                ->where('provider', self::PROVIDER)
                ->where('provider_slug', $providerSlug)
                ->first();
        }

        return null;
    }

    private function customerNameFromPayload(array $payload, User $user): string
    {
        $firstName = (string) data_get($payload, 'customer.first_name', '');
        $lastName = (string) data_get($payload, 'customer.last_name', '');
        $name = trim($firstName.' '.$lastName);

        return $name !== '' ? $name : $user->name;
    }

    /**
     * @return array<int, VirtualAccount>
     */
    private function markConfiguredBanksAsFailed(User $user, string $reason): array
    {
        return array_map(function (string $bankSlug) use ($reason, $user): VirtualAccount {
            $account = $this->pendingAccountFor($user, $bankSlug);

            $account->forceFill([
                'status' => 'failed',
                'failure_reason' => $reason,
                'last_synced_at' => now(),
            ])->save();

            return $account->fresh();
        }, $this->preferredBanks());
    }
}

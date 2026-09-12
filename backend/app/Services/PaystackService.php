<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Factory as HttpFactory;
use RuntimeException;

class PaystackService
{
    public function __construct(private readonly HttpFactory $http)
    {
    }

    public function createCustomer(array $payload): array
    {
        return $this->post('/customer', array_filter([
            'email' => $payload['email'],
            'first_name' => $payload['first_name'] ?? null,
            'last_name' => $payload['last_name'] ?? null,
            'phone' => $payload['phone'] ?? null,
            'metadata' => $payload['metadata'] ?? null,
        ], static fn (mixed $value): bool => $value !== null && $value !== ''));
    }

    public function createDedicatedAccount(array $payload): array
    {
        return $this->post('/dedicated_account', array_filter([
            'customer' => $payload['customer'],
            'preferred_bank' => $payload['preferred_bank'] ?? 'wema-bank',
            'first_name' => $payload['first_name'] ?? null,
            'last_name' => $payload['last_name'] ?? null,
            'phone' => $payload['phone'] ?? null,
            'subaccount' => $payload['subaccount'] ?? null,
            'split_code' => $payload['split_code'] ?? null,
        ], static fn (mixed $value): bool => $value !== null && $value !== ''));
    }

    public function assignDedicatedAccount(array $payload): array
    {
        return $this->post('/dedicated_account/assign', array_filter([
            'email' => $payload['email'],
            'first_name' => $payload['first_name'],
            'last_name' => $payload['last_name'],
            'phone' => $payload['phone'],
            'preferred_bank' => $payload['preferred_bank'] ?? 'wema-bank',
            'country' => $payload['country'] ?? 'NG',
            'account_number' => $payload['account_number'] ?? null,
            'bvn' => $payload['bvn'] ?? null,
            'bank_code' => $payload['bank_code'] ?? null,
            'subaccount' => $payload['subaccount'] ?? null,
            'split_code' => $payload['split_code'] ?? null,
        ], static fn (mixed $value): bool => $value !== null && $value !== ''));
    }

    public function listDedicatedAccounts(array $query = []): array
    {
        return $this->get('/dedicated_account'.($query ? '?'.http_build_query($query) : ''));
    }

    public function availableDedicatedAccountProviders(): array
    {
        return $this->get('/dedicated_account/available_providers');
    }

    public function verifyTransaction(string $reference): array
    {
        return $this->get('/transaction/verify/'.urlencode($reference));
    }

    public function listTransactions(array $query = []): array
    {
        return $this->get('/transaction'.($query ? '?'.http_build_query($query) : ''));
    }

    public function initializeTransaction(array $payload): array
    {
        return $this->post('/transaction/initialize', [
            'email' => $payload['email'],
            'amount' => $payload['amount'],
            'reference' => $payload['reference'],
            'callback_url' => $payload['callback_url'] ?? null,
            'metadata' => $payload['metadata'] ?? [],
        ]);
    }

    public function secretKey(): string
    {
        return (string) config('services.paystack.secret_key', '');
    }

    public function isConfigured(): bool
    {
        return $this->secretKey() !== '';
    }

    private function post(string $uri, array $payload): array
    {
        return $this->request('POST', $uri, $payload);
    }

    private function get(string $uri): array
    {
        return $this->request('GET', $uri);
    }

    private function request(string $method, string $uri, array $payload = []): array
    {
        $secretKey = $this->secretKey();

        if ($secretKey === '') {
            throw new RuntimeException('PAYSTACK_SECRET_KEY is not configured.');
        }

        try {
            $response = $this->http
                ->baseUrl(rtrim((string) config('services.paystack.base_url', 'https://api.paystack.co'), '/'))
                ->withToken($secretKey)
                ->acceptJson()
                ->connectTimeout(3)
                ->timeout(8)
                ->send($method, $uri, $payload === [] ? [] : ['json' => $payload]);
        } catch (ConnectionException $exception) {
            throw new RuntimeException(
                'Unable to reach Paystack right now. Please confirm the server has outbound internet access and try again.'
            );
        }

        if ($response->failed()) {
            if ($response->status() >= 500) {
                throw new RuntimeException('Paystack is temporarily unavailable. Please try again in a moment.');
            }

            throw new RuntimeException($this->extractErrorMessage($response->json()));
        }

        $data = $response->json();

        if (! data_get($data, 'status')) {
            throw new RuntimeException($this->extractErrorMessage($data));
        }

        return (array) data_get($data, 'data', []);
    }

    private function extractErrorMessage(mixed $data): string
    {
        return (string) data_get($data, 'message', 'Paystack request failed.');
    }
}

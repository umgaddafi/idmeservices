<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Factory as HttpFactory;
use RuntimeException;

class KhadVerifyService
{
    public function __construct(private readonly HttpFactory $http)
    {
    }

    public function verifyNin(string $nin, bool $consent = true): array
    {
        return $this->post('/verifyNIN', [
            'nin' => $nin,
            'consent' => $consent,
        ]);
    }

    public function verifyBvn(string $bvn, bool $consent = true): array
    {
        return $this->post('/verifyBVN', [
            'bvn' => $bvn,
            'consent' => $consent,
        ]);
    }

    public function verifyPhone(string $phone, bool $consent = true): array
    {
        return $this->post((string) config('services.khadverify.phone_verify_path', '/verifyPhone'), [
            'phone' => $phone,
            'consent' => $consent,
        ]);
    }

    public function getBalance(): array
    {
        return $this->get('/getBalance');
    }

    public function apiKey(): string
    {
        return (string) config('services.khadverify.api_key', '');
    }

    private function get(string $uri): array
    {
        return $this->request('GET', $uri);
    }

    private function post(string $uri, array $payload): array
    {
        return $this->request('POST', $uri, $payload);
    }

    private function request(string $method, string $uri, array $payload = []): array
    {
        $apiKey = $this->apiKey();

        if ($apiKey === '') {
            throw new RuntimeException('KHADVERIFY_API_KEY is not configured.');
        }

        try {
            $request = $this->http
                ->baseUrl(rtrim((string) config('services.khadverify.base_url', 'https://khadverify.com.ng/api'), '/'))
                ->withToken($apiKey)
                ->acceptJson()
                ->connectTimeout(5)
                ->timeout(20)
                ->retry(2, 500, throw: false);

            $response = $method === 'GET'
                ? $request->get($uri)
                : $request->post($uri, $payload);
        } catch (ConnectionException) {
            throw new RuntimeException(
                'Unable to reach KhadVerify right now. Please confirm the server has outbound internet access and try again.'
            );
        }

        $data = $response->json();

        if ($response->failed()) {
            if ($response->status() >= 500) {
                throw new RuntimeException('KhadVerify is temporarily unavailable. Please try again in a moment.');
            }

            throw new RuntimeException($this->extractErrorMessage($data));
        }

        if (! data_get($data, 'success')) {
            throw new RuntimeException($this->extractErrorMessage($data));
        }

        return (array) data_get($data, 'data', []);
    }

    private function extractErrorMessage(mixed $data): string
    {
        return (string) data_get($data, 'message', 'KhadVerify request failed.');
    }
}

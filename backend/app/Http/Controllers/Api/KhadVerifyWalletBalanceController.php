<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class KhadVerifyWalletBalanceController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $baseUrl = rtrim((string) config('services.khadverify.base_url', 'https://khadverify.com.ng/api'), '/');
        $apiKey = (string) config('services.khadverify.api_key', '');
        $path = '/getBalance';

        if ($apiKey === '') {
            throw new RuntimeException('KhadVerify API key is not configured.');
        }

        $response = Http::acceptJson()
            ->withToken($apiKey)
            ->contentType('application/json')
            ->connectTimeout(5)
            ->timeout(15)
            ->get($baseUrl.$path);

        if ($response->failed()) {
            $message = (string) data_get($response->json(), 'message', 'Failed to retrieve wallet balance.');
            return response()->json([
                'message' => $message,
            ], $response->status() >= 400 ? $response->status() : 502);
        }

        return response()->json([
            'success' => (bool) data_get($response->json(), 'success', true),
            'message' => (string) data_get($response->json(), 'message', 'Wallet balance retrieved successfully.'),
            'balance' => (float) data_get($response->json(), 'data.balance', 0),
            'currency' => (string) data_get($response->json(), 'data.currency', 'NGN'),
            'userId' => data_get($response->json(), 'data.user_id'),
            'fetchedAt' => now()->toIso8601String(),
        ]);
    }
}

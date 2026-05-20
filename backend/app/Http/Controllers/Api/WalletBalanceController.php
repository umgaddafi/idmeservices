<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\Api\CurrencyPayload;
use App\Support\Api\UserPayload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletBalanceController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user()->fresh('virtualAccounts');

        return response()->json([
            'message' => 'Wallet balance retrieved successfully.',
            'balance' => (float) $user->wallet_balance,
            'currency' => CurrencyPayload::code(),
            'user' => UserPayload::from($user),
        ]);
    }
}

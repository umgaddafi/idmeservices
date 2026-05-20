<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PaystackWalletReconciliationService;
use App\Support\Api\UserPayload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletReconciliationController extends Controller
{
    public function __construct(private readonly PaystackWalletReconciliationService $reconciliation)
    {
    }

    public function member(Request $request): JsonResponse
    {
        $user = $request->user()->fresh('virtualAccounts');

        try {
            $summary = $this->reconciliation->reconcileRecent($user, 50);
        } catch (\Throwable $exception) {
            return response()->json([
                'message' => 'Unable to reach Paystack for wallet reconciliation right now. Please try again later.',
                'summary' => [
                    'checked' => 0,
                    'credited' => 0,
                    'skipped' => 0,
                    'alreadyProcessed' => 0,
                    'credits' => [],
                ],
                'balance' => (float) $user->wallet_balance,
                'user' => UserPayload::from($user),
            ], 200);
        }

        $user = $request->user()->fresh('virtualAccounts');

        return response()->json([
            'message' => $summary['credited'] > 0
                ? 'Wallet payment reconciled successfully.'
                : 'No new wallet payment was found yet.',
            'summary' => $summary,
            'balance' => (float) $user->wallet_balance,
            'user' => UserPayload::from($user),
        ]);
    }

    public function memberReference(Request $request): JsonResponse
    {
        $data = $request->validate([
            'reference' => ['required', 'string', 'max:255'],
        ]);
        $user = $request->user()->fresh('virtualAccounts');

        try {
            $result = $this->reconciliation->reconcileReference($data['reference'], $user);
        } catch (\InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        } catch (\Throwable $exception) {
            return response()->json([
                'message' => 'Unable to retrieve this Paystack payment right now. Please try again later.',
                'balance' => (float) $user->wallet_balance,
                'user' => UserPayload::from($user),
            ], 200);
        }

        $user = $request->user()->fresh('virtualAccounts');

        return response()->json([
            'message' => $this->referenceMessage($result),
            'balance' => (float) $user->wallet_balance,
            'user' => UserPayload::from($user),
            'result' => [
                'reference' => $result['reference'],
                'status' => $result['status'],
                'amount' => $result['amount'],
                'accountNumber' => $result['accountNumber'],
                'alreadyProcessed' => $result['alreadyProcessed'],
                'credited' => $result['credited'],
                'matched' => $result['matched'],
                'transaction' => $result['transaction'],
            ],
        ]);
    }

    public function admin(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        try {
            $summary = $this->reconciliation->reconcileRecent(null, 100);
        } catch (\Throwable $exception) {
            return response()->json([
                'message' => 'Unable to reach Paystack for wallet reconciliation right now. Please try again later.',
                'summary' => [
                    'checked' => 0,
                    'credited' => 0,
                    'skipped' => 0,
                    'alreadyProcessed' => 0,
                    'credits' => [],
                ],
            ], 200);
        }

        return response()->json([
            'message' => $summary['credited'] > 0
                ? 'Missed wallet payments reconciled successfully.'
                : 'No missed wallet payments were found.',
            'summary' => $summary,
        ]);
    }

    public function adminReference(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'reference' => ['required', 'string', 'max:255'],
        ]);

        try {
            $result = $this->reconciliation->reconcileReference($data['reference']);
        } catch (\InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        } catch (\Throwable $exception) {
            return response()->json([
                'message' => 'Unable to retrieve this Paystack payment right now. Please try again later.',
            ], 200);
        }

        return response()->json([
            'message' => $this->referenceMessage($result),
            'result' => [
                'reference' => $result['reference'],
                'status' => $result['status'],
                'amount' => $result['amount'],
                'accountNumber' => $result['accountNumber'],
                'alreadyProcessed' => $result['alreadyProcessed'],
                'credited' => $result['credited'],
                'matched' => $result['matched'],
                'user' => $result['user'] ? UserPayload::from($result['user']->fresh('virtualAccounts')) : null,
                'transaction' => $result['transaction'],
            ],
        ]);
    }

    private function ensureAdmin(Request $request): void
    {
        abort_unless(strtoupper((string) $request->user()?->role) === 'ADMIN', 403, 'Forbidden.');
    }

    /**
     * @param array{status: string, alreadyProcessed: bool, credited: bool, matched: bool} $result
     */
    private function referenceMessage(array $result): string
    {
        if ($result['status'] !== 'success') {
            return 'Paystack has not marked this payment as successful.';
        }

        if (! $result['matched']) {
            return 'Payment found on Paystack, but it does not match any member virtual account.';
        }

        if ($result['alreadyProcessed']) {
            return 'Payment has already been credited to the member wallet.';
        }

        if ($result['credited']) {
            return 'Payment found and credited to the member wallet.';
        }

        return 'Payment retrieved from Paystack.';
    }
}

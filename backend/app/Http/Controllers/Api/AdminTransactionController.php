<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Support\Api\TransactionPayload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminTransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $limit = max(1, min((int) $request->query('limit', 50), 200));
        $transactions = Transaction::query()
            ->orderByDesc('processed_at')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (Transaction $transaction): array => TransactionPayload::from($transaction))
            ->values()
            ->all();

        return response()->json(['transactions' => $transactions]);
    }

    private function ensureAdmin(Request $request): void
    {
        abort_unless(strtoupper((string) $request->user()?->role) === 'ADMIN', 403, 'Forbidden.');
    }
}

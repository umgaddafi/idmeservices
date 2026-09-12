<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\Transaction;
use App\Models\Verification;
use App\Support\Api\TransactionPayload;
use App\Support\Api\UserPayload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberPortalController extends Controller
{
    public function overview(Request $request): JsonResponse
    {
        $user = $request->user();
        $transactions = $this->transactionQuery($user->id)->limit(5)->get();
        $depositCount = Transaction::query()->where('user_id', $user->id)->where('direction', 'credit')->count();
        $verificationCount = Verification::query()->where('user_id', $user->id)->count();
        $supportCount = SupportTicket::query()->where('user_id', $user->id)->count();
        $supportTickets = SupportTicket::query()
            ->where('user_id', $user->id)
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (SupportTicket $ticket): array => [
                'id' => (string) $ticket->id,
                'subject' => $ticket->subject,
                'priority' => $ticket->priority,
                'status' => $ticket->status,
                'channel' => $ticket->channel,
                'updatedAt' => optional($ticket->updated_at)->toDateTimeString(),
            ])
            ->values()
            ->all();

        return response()->json([
            'user' => UserPayload::from($user),
            'stats' => [
                'walletBalance' => (float) $user->wallet_balance,
                'totalSavings' => (float) $user->total_savings,
                'depositCount' => $depositCount,
                'contributionCount' => $verificationCount,
                'loanCount' => $supportCount,
            ],
            'recentActivity' => $transactions->map(
                fn (Transaction $transaction): array => TransactionPayload::from($transaction)
            )->values()->all(),
            'supportTickets' => $supportTickets,
        ]);
    }

    public function transactions(Request $request): JsonResponse
    {
        $limit = max(1, min((int) $request->query('limit', 25), 100));

        return response()->json([
            'transactions' => $this->transactionQuery($request->user()->id)
                ->limit($limit)
                ->get()
                ->map(fn (Transaction $transaction): array => TransactionPayload::from($transaction))
                ->values()
                ->all(),
        ]);
    }

    private function transactionQuery(int $userId)
    {
        return Transaction::query()
            ->where('user_id', $userId)
            ->orderByDesc('processed_at')
            ->orderByDesc('created_at');
    }
}

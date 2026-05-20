<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contribution;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContributionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Contribution::query()->orderByDesc('date');

        if (($request->query('scope') === 'mine') || $request->user()?->role === 'MEMBER') {
            $query->where('user_id', $request->user()->id);
        }

        return response()->json([
            'contributions' => $query->get()->map(fn (Contribution $contribution) => [
                'id' => (string) $contribution->id,
                'userId' => (string) $contribution->user_id,
                'amount' => (float) $contribution->amount,
                'type' => $contribution->type,
                'date' => optional($contribution->date)->toIso8601String(),
                'status' => $contribution->status,
            ])->values(),
        ]);
    }
}

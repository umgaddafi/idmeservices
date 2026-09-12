<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Verification;
use App\Support\Api\VerificationPayload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminVerificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $limit = max(1, min((int) $request->query('limit', 50), 200));
        $verifications = Verification::query()
            ->with('user')
            ->orderByDesc('requested_at')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (Verification $verification): array => VerificationPayload::from($verification))
            ->values()
            ->all();

        return response()->json(['verifications' => $verifications]);
    }

    private function ensureAdmin(Request $request): void
    {
        abort_unless(strtoupper((string) $request->user()?->role) === 'ADMIN', 403, 'Forbidden.');
    }
}

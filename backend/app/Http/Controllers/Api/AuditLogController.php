<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless(strtoupper((string) $request->user()?->role) === 'ADMIN', 403, 'Forbidden.');

        $logs = AuditLog::query()
            ->orderByDesc('timestamp')
            ->limit(max(1, min((int) $request->query('limit', 50), 100)))
            ->get()
            ->map(fn (AuditLog $log) => [
                'id' => (string) $log->id,
                'action' => $log->action,
                'actor' => $log->actor,
                'actorRole' => $log->actor_role,
                'target' => $log->target,
                'timestamp' => optional($log->timestamp)->toIso8601String(),
                'status' => $log->status,
                'metadata' => $log->metadata,
            ])->values()->all();

        return response()->json(['logs' => $logs]);
    }
}

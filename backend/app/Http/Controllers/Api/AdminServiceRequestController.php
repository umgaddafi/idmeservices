<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\ServiceRequest;
use App\Support\Api\ServiceRequestPayload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminServiceRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $limit = max(1, min((int) $request->query('limit', 100), 200));
        $requests = ServiceRequest::query()
            ->with('user')
            ->orderByDesc('submitted_at')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (ServiceRequest $serviceRequest): array => ServiceRequestPayload::from($serviceRequest))
            ->values()
            ->all();

        return response()->json(['requests' => $requests]);
    }

    public function update(Request $request, ServiceRequest $serviceRequest): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'status' => ['required', 'string', 'max:100'],
        ]);

        $serviceRequest->fill([
            'status' => $data['status'],
            'reviewed_by_user_id' => $request->user()->id,
            'completed_at' => str_contains(strtolower($data['status']), 'completed') ? now() : null,
        ])->save();

        AuditLog::query()->create([
            'actor_user_id' => $request->user()->id,
            'target_user_id' => $serviceRequest->user_id,
            'actor' => $request->user()->name,
            'actor_role' => $request->user()->role,
            'target' => $serviceRequest->reference,
            'action' => 'Service Request Status Updated',
            'status' => $serviceRequest->status,
            'timestamp' => now(),
            'metadata' => ['serviceRequestStatus' => $serviceRequest->status],
        ]);

        return response()->json([
            'request' => ServiceRequestPayload::from($serviceRequest->fresh('user')),
        ]);
    }

    private function ensureAdmin(Request $request): void
    {
        abort_unless(strtoupper((string) $request->user()?->role) === 'ADMIN', 403, 'Forbidden.');
    }
}

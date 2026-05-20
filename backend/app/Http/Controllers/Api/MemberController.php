<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use App\Services\VirtualAccountProvisioningService;
use App\Support\Api\UserPayload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class MemberController extends Controller
{
    public function __construct(private readonly VirtualAccountProvisioningService $virtualAccounts)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $members = User::query()
            ->with('virtualAccounts')
            ->orderByDesc('role')
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => UserPayload::from($user))
            ->values();

        return response()->json(['members' => $members]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'role' => ['required', Rule::in(['MEMBER', 'ADMIN'])],
            'status' => ['nullable', 'string', 'max:255'],
        ]);

        $identifier = $this->nextIdentifierForRole($data['role']);
        $user = User::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?: 'N/A',
            'password' => Hash::make($data['role'] === 'ADMIN' ? 'admin12345' : 'password12345'),
            'role' => $data['role'],
            'member_id' => $identifier,
            'status' => $data['status'] ?? 'Active',
            'join_date' => now()->toDateString(),
            'total_savings' => 0,
            'wallet_balance' => 0,
            'wallet_label' => 'Primary Wallet',
            'wallet_reference' => 'NINV-'.$identifier,
            'funding_note' => 'Use this wallet reference when requesting a manual balance update.',
        ]);

        $this->logAudit($request, 'Manual Enrollment', $user->name);

        if ($user->role === 'MEMBER') {
            $this->virtualAccounts->provisionForUser($user);
        }

        return response()->json(['member' => UserPayload::from($user->fresh('virtualAccounts'))], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:20'],
            'role' => ['sometimes', Rule::in(['MEMBER', 'ADMIN'])],
            'status' => ['sometimes', 'string', 'max:255'],
        ]);

        $user->fill([
            'name' => $data['name'] ?? $user->name,
            'phone' => $data['phone'] ?? $user->phone,
            'role' => $data['role'] ?? $user->role,
            'status' => $data['status'] ?? $user->status,
        ])->save();

        $this->logAudit($request, 'Member Data Modified', $user->name);

        return response()->json(['member' => UserPayload::from($user->fresh('virtualAccounts'))]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->ensureAdmin($request);

        abort_if(
            (string) $request->user()->id === (string) $user->id,
            422,
            'You cannot delete the currently signed-in admin account.'
        );

        $targetName = $user->name;
        $targetId = (string) $user->id;

        $this->logAudit($request, 'Member Deleted', $targetName);
        $user->delete();

        return response()->json([
            'message' => 'Member deleted successfully.',
            'memberId' => $targetId,
        ]);
    }

    private function ensureAdmin(Request $request): void
    {
        abort_unless(strtoupper((string) $request->user()?->role) === 'ADMIN', 403, 'Forbidden.');
    }

    private function nextIdentifierForRole(string $role): string
    {
        $normalizedRole = strtoupper($role);
        $prefix = $normalizedRole === 'ADMIN' ? 'ADM' : 'MB';
        $seed = $normalizedRole === 'ADMIN' ? 1 : 1000;
        $latest = User::query()
            ->where('member_id', 'like', $prefix.'-%')
            ->orderByDesc('member_id')
            ->value('member_id');
        $next = $latest ? ((int) str_replace($prefix.'-', '', $latest)) + 1 : $seed;

        return $prefix.'-'.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    private function logAudit(Request $request, string $action, string $target): void
    {
        AuditLog::query()->create([
            'actor_user_id' => $request->user()->id,
            'action' => $action,
            'actor' => $request->user()->name,
            'actor_role' => $request->user()->role,
            'target' => $target,
            'timestamp' => now(),
            'status' => 'Completed',
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiToken;
use App\Models\AuditLog;
use App\Models\User;
use App\Services\VirtualAccountProvisioningService;
use App\Support\Api\UserPayload;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class AuthController extends Controller
{
    public function __construct(private readonly VirtualAccountProvisioningService $virtualAccounts)
    {
    }

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $memberId = $this->nextMemberId();
        $user = User::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'password' => $data['password'],
            'role' => 'MEMBER',
            'member_id' => $memberId,
            'status' => 'Active',
            'join_date' => now()->toDateString(),
            'wallet_balance' => 0,
            'total_savings' => 0,
            'wallet_label' => 'Primary Wallet',
            'wallet_reference' => 'NINV-'.$memberId,
            'funding_note' => 'Use this wallet reference when requesting a manual balance update.',
        ]);

        AuditLog::query()->create([
            'actor_user_id' => $user->id,
            'target_user_id' => $user->id,
            'actor' => $user->name,
            'actor_role' => $user->role,
            'target' => $user->email,
            'action' => 'Member Registered',
            'status' => 'Completed',
            'timestamp' => now(),
            'metadata' => ['memberId' => $user->member_id],
        ]);

        $this->virtualAccounts->provisionForUser($user);
        $user = $user->fresh('virtualAccounts');

        return response()->json([
            'status' => true,
            'message' => 'User created',
            'user' => UserPayload::from($user),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        try {
            $user = User::query()->where('email', $data['email'])->first();
        } catch (Throwable) {
            return response()->json([
                'message' => 'The backend is online, but the database connection is not ready. Please check the Bluehost MySQL username, password, and database privileges.',
            ], 503);
        }

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'The credentials provided do not match our records.'], 422);
        }

        if ($user->status === 'Pending') {
            return response()->json(['message' => 'Your membership application is still pending approval.'], 403);
        }

        $plainTextToken = Str::random(64);

        try {
            $token = ApiToken::query()->create([
                'user_id' => $user->id,
                'name' => 'web',
                'token_hash' => hash('sha256', $plainTextToken),
                'expires_at' => now()->addDays(7),
            ]);
        } catch (Throwable) {
            return response()->json([
                'message' => 'Login was accepted, but the backend could not create a session token. Please confirm the api_tokens table exists and the database user can write to it.',
            ], 503);
        }

        return response()->json([
            'token' => $plainTextToken,
            'user' => UserPayload::from($user),
            'expiresAt' => optional($token->expires_at)->toIso8601String(),
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $status = Password::sendResetLink([
            'email' => $data['email'],
        ]);

        if ($status === Password::RESET_THROTTLED) {
            return response()->json([
                'message' => 'Please wait a little before requesting another reset email.',
            ], 429);
        }

        if (in_array($status, [Password::RESET_LINK_SENT, Password::INVALID_USER], true)) {
            return response()->json([
                'message' => 'If an account exists for that email address, reset instructions have been sent.',
            ]);
        }

        return response()->json([
            'message' => __($status),
        ], 422);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string', 'min:8'],
        ]);

        $status = Password::reset(
            [
                'email' => $data['email'],
                'token' => $data['token'],
                'password' => $data['password'],
                'password_confirmation' => $data['password_confirmation'],
            ],
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => $password,
                ])->save();

                ApiToken::query()
                    ->where('user_id', $user->id)
                    ->delete();

                AuditLog::query()->create([
                    'actor_user_id' => $user->id,
                    'target_user_id' => $user->id,
                    'actor' => $user->name,
                    'actor_role' => $user->role,
                    'target' => $user->email,
                    'action' => 'Password Reset',
                    'status' => 'Completed',
                    'timestamp' => now(),
                ]);

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [$this->passwordResetStatusMessage($status)],
            ]);
        }

        return response()->json([
            'message' => 'Password reset successful. You can now sign in with your new password.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => UserPayload::from($request->user()),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:20'],
            'nin' => ['sometimes', 'nullable', 'digits:11'],
            'bvn' => ['sometimes', 'nullable', 'digits:11'],
        ]);

        $user->fill([
            'name' => $data['name'] ?? $user->name,
            'phone' => $data['phone'] ?? $user->phone,
            'nin' => array_key_exists('nin', $data) ? $data['nin'] : $user->nin,
            'bvn' => array_key_exists('bvn', $data) ? $data['bvn'] : $user->bvn,
        ])->save();

        return response()->json([
            'message' => 'Profile updated.',
            'user' => UserPayload::from($user->fresh()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->attributes->get('apiToken')?->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    private function nextMemberId(): string
    {
        $latest = User::query()
            ->whereNotNull('member_id')
            ->where('member_id', 'like', 'MB-%')
            ->orderByDesc('member_id')
            ->value('member_id');

        $next = $latest ? ((int) str_replace('MB-', '', $latest)) + 1 : 1000;

        return 'MB-'.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    private function passwordResetStatusMessage(string $status): string
    {
        return match ($status) {
            Password::INVALID_TOKEN => 'The reset token is invalid or has expired.',
            Password::INVALID_USER => 'We could not find an account that matches those reset details.',
            default => __($status),
        };
    }
}

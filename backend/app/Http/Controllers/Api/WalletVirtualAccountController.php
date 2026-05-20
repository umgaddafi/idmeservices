<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\VirtualAccountProvisioningService;
use App\Support\Api\UserPayload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletVirtualAccountController extends Controller
{
    public function __construct(private readonly VirtualAccountProvisioningService $virtualAccounts)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $shouldProvision = $request->boolean('provision') || ! $user->virtualAccounts()->exists();

        if ($shouldProvision) {
            $this->virtualAccounts->provisionForUser($user);
        }

        $freshUser = $user->fresh('virtualAccounts');
        $payload = UserPayload::from($freshUser);

        return response()->json([
            'user' => $payload,
            'virtualAccounts' => $payload['virtualAccounts'],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $this->virtualAccounts->provisionForUser($user, force: $request->boolean('force'));

        $freshUser = $user->fresh('virtualAccounts');
        $payload = UserPayload::from($freshUser);

        return response()->json([
            'message' => 'Virtual account provisioning refreshed.',
            'user' => $payload,
            'virtualAccounts' => $payload['virtualAccounts'],
        ]);
    }
}

<?php

namespace App\Support\Api;

use App\Models\Verification;

class VerificationPayload
{
    public static function from(Verification $verification): array
    {
        return [
            'id' => (string) $verification->id,
            'customer' => $verification->user?->name,
            'channel' => $verification->channel,
            'reference' => $verification->reference,
            'amount' => (float) $verification->amount,
            'status' => $verification->status,
            'createdAt' => optional($verification->requested_at ?? $verification->created_at)->toIso8601String(),
        ];
    }
}

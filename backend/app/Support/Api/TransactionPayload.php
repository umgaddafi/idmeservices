<?php

namespace App\Support\Api;

use App\Models\Transaction;

class TransactionPayload
{
    public static function from(Transaction $transaction): array
    {
        return [
            'id' => (string) $transaction->id,
            'date' => optional($transaction->processed_at ?? $transaction->created_at)->toIso8601String(),
            'type' => $transaction->type,
            'reference' => $transaction->reference,
            'amount' => (float) $transaction->amount,
            'direction' => $transaction->direction,
            'status' => $transaction->status,
            'description' => $transaction->description,
        ];
    }
}

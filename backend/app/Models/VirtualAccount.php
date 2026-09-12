<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VirtualAccount extends Model
{
    protected $fillable = [
        'user_id',
        'provider',
        'status',
        'account_reference',
        'reservation_reference',
        'account_name',
        'account_number',
        'bank_name',
        'bank_code',
        'provider_slug',
        'currency',
        'customer_name',
        'customer_email',
        'raw_accounts',
        'raw_response',
        'failure_reason',
        'active',
        'assigned',
        'last_synced_at',
    ];

    protected function casts(): array
    {
        return [
            'raw_accounts' => 'array',
            'raw_response' => 'array',
            'active' => 'boolean',
            'assigned' => 'boolean',
            'last_synced_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

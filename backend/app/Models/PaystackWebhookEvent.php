<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaystackWebhookEvent extends Model
{
    protected $fillable = [
        'event',
        'reference',
        'account_number',
        'amount',
        'payload',
        'processed_at',
        'email_sent_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'float',
            'payload' => 'array',
            'processed_at' => 'datetime',
            'email_sent_at' => 'datetime',
        ];
    }
}

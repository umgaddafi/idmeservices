<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Verification extends Model
{
    protected $fillable = [
        'user_id',
        'reviewed_by_user_id',
        'reference',
        'channel',
        'identifier',
        'amount',
        'status',
        'result',
        'requested_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'float',
            'result' => 'array',
            'requested_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}

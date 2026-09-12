<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceRequest extends Model
{
    protected $fillable = [
        'user_id',
        'reviewed_by_user_id',
        'category',
        'type',
        'reference',
        'identifier',
        'email',
        'amount',
        'status',
        'picture_path',
        'details',
        'submitted_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'float',
            'details' => 'array',
            'submitted_at' => 'datetime',
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
}

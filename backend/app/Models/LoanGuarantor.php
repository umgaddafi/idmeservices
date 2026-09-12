<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanGuarantor extends Model
{
    protected $fillable = [
        'loan_id',
        'user_id',
        'name',
        'email',
        'status',
        'notified_at',
        'confirmed_at',
    ];

    protected function casts(): array
    {
        return [
            'notified_at' => 'datetime',
            'confirmed_at' => 'datetime',
        ];
    }

    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

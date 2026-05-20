<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = [
        'actor_user_id',
        'target_user_id',
        'action',
        'actor',
        'actor_role',
        'target',
        'timestamp',
        'status',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'timestamp' => 'datetime',
            'metadata' => 'array',
        ];
    }
}

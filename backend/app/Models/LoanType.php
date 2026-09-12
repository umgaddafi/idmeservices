<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoanType extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'interest_rate',
        'interest_type',
        'max_duration_months',
        'min_savings_months',
        'guarantors_required',
    ];

    protected function casts(): array
    {
        return [
            'interest_rate' => 'float',
            'max_duration_months' => 'integer',
            'min_savings_months' => 'integer',
            'guarantors_required' => 'integer',
        ];
    }
}

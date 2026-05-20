<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        'branding',
        'smtp',
        'support_email',
        'support_phone',
        'default_nin_price',
        'default_bvn_price',
        'default_phone_price',
        'template_pricing',
        'registration_mode',
        'auto_debit_date',
        'is_auto_debit_active',
        'total_pool_liquidity',
    ];

    protected function casts(): array
    {
        return [
            'is_auto_debit_active' => 'boolean',
            'total_pool_liquidity' => 'float',
            'default_nin_price' => 'float',
            'default_bvn_price' => 'float',
            'default_phone_price' => 'float',
            'template_pricing' => 'array',
            'branding' => 'array',
            'smtp' => 'array',
        ];
    }
}

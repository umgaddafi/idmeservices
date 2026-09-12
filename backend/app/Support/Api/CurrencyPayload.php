<?php

namespace App\Support\Api;

use App\Models\SystemSetting;

class CurrencyPayload
{
    public static function current(): array
    {
        return [
            'code' => 'NGN',
            'symbol' => '₦',
            'locale' => 'en-NG',
            'rate' => 1.0,
        ];
    }

    public static function code(): string
    {
        return 'NGN';
    }

    public static function symbol(): string
    {
        return '₦';
    }
}

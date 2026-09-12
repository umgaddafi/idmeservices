<?php

namespace App\Support\Api;

use App\Models\SystemSetting;

class CurrencyPayload
{
    public static function current(): array
    {
        $default = config('idmeservices.currency', [
            'code' => 'USD',
            'locale' => 'en-US',
            'rate' => 1,
        ]);

        $branding = SystemSetting::query()->first()?->branding ?? [];
        $currency = is_array($branding['currency'] ?? null)
            ? array_merge($default, $branding['currency'])
            : $default;

        return [
            'code' => strtoupper((string) ($currency['code'] ?? 'USD')),
            'locale' => (string) ($currency['locale'] ?? 'en-US'),
            'rate' => (float) ($currency['rate'] ?? 1),
        ];
    }

    public static function code(): string
    {
        return self::current()['code'];
    }
}

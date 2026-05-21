<?php

namespace App\Support\Api;

use App\Models\SystemSetting;
use Throwable;

class CurrencyPayload
{
    public static function current(): array
    {
        $default = self::defaults();

        try {
            $branding = SystemSetting::query()->first()?->branding ?? [];
        } catch (Throwable) {
            $branding = [];
        }

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

    public static function defaults(): array
    {
        return config('idmeservices.currency', [
            'code' => 'USD',
            'locale' => 'en-US',
            'rate' => 1,
        ]);
    }
}

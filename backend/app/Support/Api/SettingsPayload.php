<?php

namespace App\Support\Api;

use App\Models\SystemSetting;
use App\Models\User;
use App\Support\PricingCatalog;

class SettingsPayload
{
    public static function from(SystemSetting $settings): array
    {
        $brandingDefaults = [
            'systemName' => config('idmeservices.branding.system_name', 'IDM e-Services'),
            'logoUrl' => null,
        ];
        $branding = $settings->branding ?? $brandingDefaults;
        $currency = CurrencyPayload::current();

        return [
            'minMonthlyContribution' => 0,
            'defaultPenaltyRate' => 0,
            'loanToSavingsMultiplier' => 0,
            'emergencyLoanInterest' => 0,
            'loanEligibilityMonths' => 0,
            'autoDebitDate' => (int) $settings->auto_debit_date,
            'isAutoDebitActive' => (bool) $settings->is_auto_debit_active,
            'totalPoolLiquidity' => (float) User::query()->sum('wallet_balance'),
            'branding' => UrlPayload::branding($branding),
            'currency' => [
                'code' => strtoupper((string) ($currency['code'] ?? 'USD')),
                'locale' => (string) ($currency['locale'] ?? 'en-US'),
                'rate' => (float) ($currency['rate'] ?? 1),
            ],
            'pricingSource' => config('idmeservices.pricing_source', 'env'),
            'smtp' => $settings->smtp ?? [
                'host' => '',
                'port' => 587,
                'user' => '',
                'pass' => '',
                'fromName' => config('idmeservices.branding.system_name', 'IDM e-Services'),
                'fromEmail' => $settings->support_email ?: '',
            ],
            'supportEmail' => $settings->support_email,
            'supportPhone' => $settings->support_phone,
            'defaultNinPrice' => (float) $settings->default_nin_price,
            'defaultBvnPrice' => (float) $settings->default_bvn_price,
            'defaultPhonePrice' => (float) $settings->default_phone_price,
            'templatePricing' => PricingCatalog::fromSettings($settings),
            'registrationMode' => $settings->registration_mode,
        ];
    }
}


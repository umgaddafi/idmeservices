<?php

namespace App\Support\Api;

use App\Models\SystemSetting;
use App\Models\User;
use App\Support\PricingCatalog;
use Throwable;

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
        $totalPoolLiquidity = (float) $settings->total_pool_liquidity;

        try {
            $totalPoolLiquidity = (float) User::query()->sum('wallet_balance');
        } catch (Throwable) {
            //
        }

        return [
            'minMonthlyContribution' => 0,
            'defaultPenaltyRate' => 0,
            'loanToSavingsMultiplier' => 0,
            'emergencyLoanInterest' => 0,
            'loanEligibilityMonths' => 0,
            'autoDebitDate' => (int) $settings->auto_debit_date,
            'isAutoDebitActive' => (bool) $settings->is_auto_debit_active,
            'totalPoolLiquidity' => $totalPoolLiquidity,
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

    public static function fallback(): array
    {
        $currency = CurrencyPayload::defaults();
        $supportEmail = config('idmeservices.branding.support_email', 'support@idmeservices.com.ng');

        return [
            'minMonthlyContribution' => 0,
            'defaultPenaltyRate' => 0,
            'loanToSavingsMultiplier' => 0,
            'emergencyLoanInterest' => 0,
            'loanEligibilityMonths' => 0,
            'autoDebitDate' => 1,
            'isAutoDebitActive' => false,
            'totalPoolLiquidity' => 0,
            'branding' => UrlPayload::branding([
                'systemName' => config('idmeservices.branding.system_name', 'IDM e-Services'),
                'logoUrl' => null,
                'homepageWallpaperUrl' => null,
            ]),
            'currency' => [
                'code' => strtoupper((string) ($currency['code'] ?? 'USD')),
                'locale' => (string) ($currency['locale'] ?? 'en-US'),
                'rate' => (float) ($currency['rate'] ?? 1),
            ],
            'pricingSource' => config('idmeservices.pricing_source', 'env'),
            'smtp' => [
                'host' => '',
                'port' => 587,
                'user' => '',
                'pass' => '',
                'fromName' => config('idmeservices.branding.system_name', 'IDM e-Services'),
                'fromEmail' => $supportEmail,
            ],
            'supportEmail' => $supportEmail,
            'supportPhone' => config('idmeservices.branding.support_phone', '+2348000000000'),
            'defaultNinPrice' => (float) config('idmeservices.pricing.nin_premium', 150),
            'defaultBvnPrice' => (float) config('idmeservices.pricing.bvn_premium', 170),
            'defaultPhonePrice' => (float) config('idmeservices.pricing.phone_premium', 200),
            'templatePricing' => PricingCatalog::defaults(),
            'registrationMode' => 'OPEN',
        ];
    }
}


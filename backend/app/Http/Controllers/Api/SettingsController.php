<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\SystemSetting;
use App\Support\Api\SettingsPayload;
use App\Support\PricingCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class SettingsController extends Controller
{
    public function show(): JsonResponse
    {
        $settings = SystemSetting::query()->firstOrCreate(
            ['id' => 1],
            [
                'branding' => ['systemName' => config('idmeservices.branding.system_name', 'IDM e-Services'), 'logoUrl' => null, 'homepageWallpaperUrl' => null],
                'smtp' => ['host' => '', 'port' => 587, 'user' => '', 'pass' => '', 'fromName' => config('idmeservices.branding.system_name', 'IDM e-Services'), 'fromEmail' => config('idmeservices.branding.support_email', 'support@idmeservices.com.ng')],
                'support_email' => config('idmeservices.branding.support_email', 'support@idmeservices.com.ng'),
                'support_phone' => config('idmeservices.branding.support_phone', '+2348000000000'),
                'template_pricing' => PricingCatalog::defaults(),
            ]
        );

        if (! is_array($settings->template_pricing)) {
            $settings->template_pricing = PricingCatalog::defaults();
            $settings->save();
        }

        return response()->json(['settings' => SettingsPayload::from($settings)]);
    }

    public function update(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'autoDebitDate' => ['nullable', 'integer', 'between:1,31'],
            'isAutoDebitActive' => ['nullable', 'boolean'],
            'supportEmail' => ['nullable', 'email', 'max:255'],
            'supportPhone' => ['nullable', 'string', 'max:255'],
            'defaultNinPrice' => ['nullable', 'numeric', 'min:0'],
            'defaultBvnPrice' => ['nullable', 'numeric', 'min:0'],
            'defaultPhonePrice' => ['nullable', 'numeric', 'min:0'],
            'templatePricing' => ['nullable', 'array'],
            'registrationMode' => ['nullable', Rule::in(['OPEN', 'INVITE_ONLY', 'PAUSED'])],
            'branding.systemName' => ['nullable', 'string', 'max:255'],
            'branding.logoUrl' => ['nullable', 'string', 'max:2048'],
            'branding.currency.code' => ['nullable', Rule::in(['USD', 'NGN'])],
            'branding.currency.locale' => ['nullable', 'string', 'max:32'],
            'branding.currency.rate' => ['nullable', 'numeric', 'min:0.000001'],
            'logo' => ['nullable', 'image', 'max:4096'],
            'homepageWallpaper' => ['nullable', 'image', 'max:8192'],
            'smtp.host' => ['nullable', 'string', 'max:255'],
            'smtp.port' => ['nullable', 'integer', 'min:1'],
            'smtp.user' => ['nullable', 'string', 'max:255'],
            'smtp.pass' => ['nullable', 'string', 'max:255'],
            'smtp.fromName' => ['nullable', 'string', 'max:255'],
            'smtp.fromEmail' => ['nullable', 'email', 'max:255'],
        ]);

        $settings = SystemSetting::query()->firstOrCreate(['id' => 1]);
        $templatePricing = array_key_exists('templatePricing', $data)
            ? PricingCatalog::normalize($data['templatePricing'])
            : PricingCatalog::fromSettings($settings);

        $branding = $settings->branding ?? ['systemName' => config('idmeservices.branding.system_name', 'IDM e-Services'), 'logoUrl' => null];
        if (isset($data['branding']) && is_array($data['branding'])) {
            $branding = array_merge($branding, $data['branding']);
        }
        if ($request->hasFile('logo')) {
            $logoPath = $this->storeBrandingImage($request->file('logo'), 'logo');
            $branding['logoUrl'] = $logoPath;
            $branding['faviconUrl'] = $logoPath;
        }
        if ($request->hasFile('homepageWallpaper')) {
            $wallpaperPath = $this->storeBrandingImage($request->file('homepageWallpaper'), 'homepage');
            $branding['homepageWallpaperUrl'] = $wallpaperPath;
        }

        $settings->fill([
            'auto_debit_date' => $data['autoDebitDate'] ?? $settings->auto_debit_date,
            'is_auto_debit_active' => $data['isAutoDebitActive'] ?? $settings->is_auto_debit_active,
            'support_email' => $data['supportEmail'] ?? $settings->support_email,
            'support_phone' => $data['supportPhone'] ?? $settings->support_phone,
            'default_nin_price' => $data['defaultNinPrice'] ?? PricingCatalog::amount($settings, 'nin', 'premium', (float) $settings->default_nin_price),
            'default_bvn_price' => $data['defaultBvnPrice'] ?? PricingCatalog::amount($settings, 'bvn', 'premium-bvn', (float) $settings->default_bvn_price),
            'default_phone_price' => $data['defaultPhonePrice'] ?? PricingCatalog::amount($settings, 'phone', 'premium-phone', (float) $settings->default_phone_price),
            'template_pricing' => $templatePricing,
            'registration_mode' => $data['registrationMode'] ?? $settings->registration_mode,
            'branding' => $branding,
            'smtp' => $data['smtp'] ?? $settings->smtp,
        ]);

        $settings->default_nin_price = PricingCatalog::amount($settings, 'nin', 'premium', (float) $settings->default_nin_price);
        $settings->default_bvn_price = PricingCatalog::amount($settings, 'bvn', 'premium-bvn', (float) $settings->default_bvn_price);
        $settings->default_phone_price = PricingCatalog::amount($settings, 'phone', 'premium-phone', (float) $settings->default_phone_price);
        $settings->save();

        $this->logAudit($request, 'System Settings Updated', 'Global Config');

        return response()->json(['settings' => SettingsPayload::from($settings->fresh())]);
    }

    private function storeBrandingImage(UploadedFile $image, string $prefix): string
    {
        $directory = public_path('uploads/branding');

        if (! is_dir($directory)) {
            mkdir($directory, 0775, true);
        }

        $filename = $prefix.'-'.now()->format('YmdHis').'-'.Str::random(8).'.'.$image->getClientOriginalExtension();
        $image->move($directory, $filename);

        return '/uploads/branding/'.$filename;
    }

    private function ensureAdmin(Request $request): void
    {
        abort_unless(strtoupper((string) $request->user()?->role) === 'ADMIN', 403, 'Forbidden.');
    }

    private function logAudit(Request $request, string $action, string $target): void
    {
        AuditLog::query()->create([
            'actor_user_id' => $request->user()->id,
            'action' => $action,
            'actor' => $request->user()->name,
            'actor_role' => $request->user()->role,
            'target' => $target,
            'timestamp' => now(),
            'status' => 'Completed',
        ]);
    }
}


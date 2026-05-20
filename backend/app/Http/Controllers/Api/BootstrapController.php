<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Support\Api\SettingsPayload;
use App\Support\PricingCatalog;
use Illuminate\Http\JsonResponse;

class BootstrapController extends Controller
{
    public function __invoke(): JsonResponse
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

        return response()->json([
            'settings' => SettingsPayload::from($settings),
        ]);
    }
}


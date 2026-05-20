<?php

namespace Tests\Feature;

use App\Models\ApiToken;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class SettingsPricingPersistenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_persist_template_pricing_and_bootstrap_returns_it(): void
    {
        $admin = User::query()->create([
            'name' => 'Admin Officer',
            'email' => 'admin@idmeservices.com.ng',
            'phone' => '08000000000',
            'password' => 'admin12345',
            'role' => 'ADMIN',
            'member_id' => 'ADM-0001',
            'status' => 'Active',
            'join_date' => now()->toDateString(),
            'wallet_balance' => 125000,
            'wallet_label' => 'Admin Wallet',
            'wallet_reference' => 'NINV-ADM-0001',
        ]);

        SystemSetting::query()->create([
            'id' => 1,
            'branding' => ['systemName' => 'IDM e-Services', 'logoUrl' => null],
            'smtp' => ['host' => '', 'port' => 587, 'user' => '', 'pass' => '', 'fromName' => 'IDM e-Services', 'fromEmail' => 'support@idmeservices.com.ng'],
            'support_email' => 'support@idmeservices.com.ng',
            'support_phone' => '+2348000000000',
        ]);

        $token = 'plain-api-token';
        ApiToken::query()->create([
            'user_id' => $admin->id,
            'name' => 'web',
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addHour(),
        ]);

        $headers = [
            'HTTP_ACCEPT' => 'application/json',
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ];

        $updatePayload = [
            'templatePricing' => [
                'modification' => [
                    ['id' => 'name-modification', 'title' => 'Name Modification', 'amount' => 19, 'status' => 'Live'],
                ],
            ],
        ];

        $updateResponse = $this->app->make(Kernel::class)->handle(
            Request::create(
                '/api/settings',
                'PUT',
                $updatePayload,
                [],
                [],
                $headers,
                json_encode($updatePayload, JSON_THROW_ON_ERROR)
            )
        );

        $this->assertSame(200, $updateResponse->getStatusCode());

        $settings = SystemSetting::query()->findOrFail(1);
        $this->assertIsArray($settings->template_pricing);
        $this->assertSame(19.0, (float) $settings->template_pricing['modification'][3]['amount']);

        $bootstrapResponse = $this->app->make(Kernel::class)->handle(
            Request::create('/api/bootstrap', 'GET', [], [], [], [
                'HTTP_ACCEPT' => 'application/json',
            ])
        );

        $this->assertSame(200, $bootstrapResponse->getStatusCode());
        $bootstrapPayload = json_decode($bootstrapResponse->getContent(), true, 512, JSON_THROW_ON_ERROR);
        $this->assertSame(19.0, (float) $bootstrapPayload['settings']['templatePricing']['modification'][3]['amount']);
    }
}



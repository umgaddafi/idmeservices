<?php

namespace Tests\Feature;

use App\Models\ApiToken;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\KhadVerifyService;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class PhoneVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_records_a_successful_phone_verification_and_charges_the_wallet(): void
    {
        $user = User::query()->create([
            'name' => 'Gaddafi Umar',
            'email' => 'um@gmail.com',
            'phone' => '09042340091',
            'password' => '12345678',
            'role' => 'MEMBER',
            'member_id' => 'MB-1000',
            'status' => 'Active',
            'join_date' => now()->toDateString(),
            'wallet_balance' => 1000,
            'wallet_label' => 'Primary Wallet',
            'wallet_reference' => 'NINV-MB-1000',
        ]);

        SystemSetting::query()->create([
            'id' => 1,
            'default_phone_price' => 200,
            'branding' => ['systemName' => 'IDM e-Services', 'logoUrl' => null],
        ]);

        $token = 'plain-api-token';
        ApiToken::query()->create([
            'user_id' => $user->id,
            'name' => 'web',
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addHour(),
        ]);

        $this->mock(KhadVerifyService::class, function ($mock): void {
            $mock->shouldReceive('verifyPhone')
                ->once()
                ->with('09042340091', true)
                ->andReturn([
                    'phone_number' => '09042340091',
                    'status' => 'found',
                    'carrier' => 'MTN Nigeria',
                    'line_type' => 'Mobile',
                    'personal_details' => [
                        'first_name' => 'Gaddafi',
                        'middle_name' => '',
                        'last_name' => 'Umar',
                        'date_of_birth' => '1998-12-27',
                        'gender' => 'male',
                        'address' => 'Bachure Village Jimeta, Yola North, Adamawa',
                    ],
                    'verification_metadata' => [
                        'tracking_id' => 'PHONE-TRACK-001',
                    ],
                ]);
        });

        $payload = [
            'phone' => '09042340091',
            'consent' => true,
        ];

        $response = $this->app->make(Kernel::class)->handle(
            Request::create(
                '/api/verify/phone',
                'POST',
                $payload,
                [],
                [],
                [
                    'HTTP_ACCEPT' => 'application/json',
                    'CONTENT_TYPE' => 'application/json',
                    'HTTP_AUTHORIZATION' => 'Bearer '.$token,
                ],
                json_encode($payload, JSON_THROW_ON_ERROR)
            )
        );

        $this->assertSame(200, $response->getStatusCode());
        $data = json_decode($response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        $this->assertSame('Phone verification successful.', $data['message']);
        $this->assertEquals(800.0, $data['user']['walletBalance']);
        $this->assertSame('09042340091', $data['record']['phoneNumber']);
        $this->assertSame('MTN Nigeria', $data['record']['carrier']);
        $this->assertSame('Phone Verification', $data['verification']['channel']);

        $this->assertDatabaseHas('verifications', [
            'user_id' => $user->id,
            'status' => 'Completed',
            'channel' => 'Phone Verification',
        ]);
        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'type' => 'Phone Verification',
            'amount' => 200.00,
        ]);
    }
}


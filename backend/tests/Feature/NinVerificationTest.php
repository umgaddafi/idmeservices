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

class NinVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_records_a_successful_nin_verification_and_charges_the_wallet(): void
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
            'default_nin_price' => 150,
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
            $mock->shouldReceive('verifyNin')
                ->once()
                ->andReturn([
                    'identity_number' => '12345678901',
                    'personal_details' => [
                        'first_name' => 'Gaddafi',
                        'surname' => 'Umar',
                        'date_of_birth' => '1998-12-27',
                        'gender' => 'male',
                        'address' => 'Bachure Village Jimeta, Yola North, Adamawa',
                        'nationality' => 'NGA',
                    ],
                    'verification_metadata' => [
                        'tracking_id' => 'TRACK-001',
                    ],
                    'biometric_data' => [
                        'photo' => '',
                    ],
                ]);
        });

        $payload = [
            'nin' => '12345678901',
            'consent' => true,
        ];

        $response = $this->app->make(Kernel::class)->handle(
            Request::create(
                '/api/verify/nin',
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

        $this->assertSame('NIN verification successful.', $data['message']);
        $this->assertEquals(850.0, $data['user']['walletBalance']);
        $this->assertSame('Completed', $data['transaction']['status']);
        $this->assertSame('NIN Verification', $data['verification']['channel']);

        $this->assertDatabaseHas('verifications', [
            'user_id' => $user->id,
            'status' => 'Completed',
            'channel' => 'NIN Verification',
        ]);
        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'type' => 'NIN Verification',
            'amount' => 150.00,
        ]);
    }
}


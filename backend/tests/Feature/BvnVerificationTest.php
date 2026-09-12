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

class BvnVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_records_a_successful_bvn_verification_and_charges_the_wallet(): void
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
            'default_bvn_price' => 170,
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
            $mock->shouldReceive('verifyBvn')
                ->once()
                ->andReturn([
                    'identity_number' => '12345678901',
                    'personal_details' => [
                        'first_name' => 'Gaddafi',
                        'middle_name' => '',
                        'last_name' => 'Umar',
                        'date_of_birth' => '1998-12-27',
                        'gender' => 'male',
                        'address' => 'Bachure Village Jimeta, Yola North, Adamawa',
                    ],
                    'contact_details' => [
                        'phone_number' => '09035067771',
                    ],
                    'biometric_data' => [
                        'photo' => '',
                    ],
                ]);
        });

        $payload = [
            'bvn' => '12345678901',
            'consent' => true,
        ];

        $response = $this->app->make(Kernel::class)->handle(
            Request::create(
                '/api/verify/bvn',
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

        $this->assertSame('BVN verification successful.', $data['message']);
        $this->assertEquals(830.0, $data['user']['walletBalance']);
        $this->assertSame('09035067771', $data['record']['phoneNumber']);
        $this->assertSame('BVN Verification', $data['verification']['channel']);

        $this->assertDatabaseHas('verifications', [
            'user_id' => $user->id,
            'status' => 'Completed',
            'channel' => 'BVN Verification',
        ]);
        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'type' => 'BVN Verification',
            'amount' => 170.00,
        ]);
    }
}


<?php

namespace Tests\Feature;

use App\Models\ApiToken;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword as ResetPasswordNotification;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AuthFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_registers_a_member_and_returns_a_wallet_profile(): void
    {
        config([
            'services.paystack.secret_key' => 'sk_test_virtual_accounts',
            'services.paystack.dedicated_account_banks' => ['wema-bank'],
        ]);

        Http::fake([
            'https://api.paystack.co/customer' => Http::response([
                'status' => true,
                'data' => [
                    'id' => 101,
                    'customer_code' => 'CUS_test_jane',
                    'email' => 'jane@example.com',
                ],
            ]),
            'https://api.paystack.co/dedicated_account' => Http::response([
                'status' => true,
                'data' => [
                    'id' => 202,
                    'account_name' => 'NINOFFICIALCHECK JANE DOE',
                    'account_number' => '1234567890',
                    'currency' => 'NGN',
                    'active' => true,
                    'assigned' => true,
                    'bank' => [
                        'name' => 'Wema Bank',
                        'slug' => 'wema-bank',
                        'code' => '035',
                    ],
                    'customer' => [
                        'id' => 101,
                        'customer_code' => 'CUS_test_jane',
                        'email' => 'jane@example.com',
                        'first_name' => 'Jane',
                        'last_name' => 'Doe',
                    ],
                ],
            ]),
        ]);

        $payload = [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '08030000000',
            'password' => 'password123',
        ];

        $response = $this->app->make(Kernel::class)->handle(
            Request::create(
                '/api/register',
                'POST',
                $payload,
                [],
                [],
                [
                    'HTTP_ACCEPT' => 'application/json',
                    'CONTENT_TYPE' => 'application/json',
                ],
                json_encode($payload, JSON_THROW_ON_ERROR)
            )
        );

        $this->assertSame(201, $response->getStatusCode());
        $data = json_decode($response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        $this->assertTrue($data['status']);
        $this->assertSame('User created', $data['message']);
        $this->assertSame('jane@example.com', $data['user']['email']);
        $this->assertSame('Primary Wallet', $data['user']['walletProfile']['label']);
        $this->assertStringStartsWith('NINV-MB-', $data['user']['walletProfile']['reference']);
        $this->assertSame('1234567890', $data['user']['virtualAccounts'][0]['accountNumber']);
        $this->assertSame('Wema Bank', $data['user']['virtualAccounts'][0]['bankName']);

        $this->assertDatabaseHas('users', [
            'email' => 'jane@example.com',
            'phone' => '08030000000',
            'role' => 'MEMBER',
            'wallet_balance' => 0,
            'paystack_customer_code' => 'CUS_test_jane',
        ]);

        $this->assertDatabaseHas('virtual_accounts', [
            'provider' => 'paystack',
            'status' => 'active',
            'account_number' => '1234567890',
            'bank_name' => 'Wema Bank',
        ]);
    }

    public function test_it_logs_a_registered_member_in(): void
    {
        User::query()->create([
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '08030000000',
            'password' => 'password123',
            'role' => 'MEMBER',
            'member_id' => 'MB-1000',
            'status' => 'Active',
            'join_date' => now()->toDateString(),
            'wallet_balance' => 2500,
            'total_savings' => 0,
            'wallet_label' => 'Primary Wallet',
            'wallet_reference' => 'NINV-MB-1000',
            'funding_note' => 'Use this wallet reference when requesting a manual balance update.',
        ]);

        $payload = [
            'email' => 'jane@example.com',
            'password' => 'password123',
        ];

        $response = $this->app->make(Kernel::class)->handle(
            Request::create(
                '/api/auth/login',
                'POST',
                $payload,
                [],
                [],
                [
                    'HTTP_ACCEPT' => 'application/json',
                    'CONTENT_TYPE' => 'application/json',
                ],
                json_encode($payload, JSON_THROW_ON_ERROR)
            )
        );

        $this->assertSame(200, $response->getStatusCode());
        $data = json_decode($response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        $this->assertNotEmpty($data['token']);
        $this->assertSame('MEMBER', $data['user']['role']);
        $this->assertEquals(2500.0, $data['user']['walletBalance']);
        $this->assertDatabaseCount('api_tokens', 1);
    }

    public function test_it_sends_a_password_reset_notification_for_existing_members(): void
    {
        Notification::fake();

        $user = User::query()->create([
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '08030000000',
            'password' => 'password123',
            'role' => 'MEMBER',
            'member_id' => 'MB-1000',
            'status' => 'Active',
            'join_date' => now()->toDateString(),
            'wallet_balance' => 2500,
            'total_savings' => 0,
            'wallet_label' => 'Primary Wallet',
            'wallet_reference' => 'NINV-MB-1000',
            'funding_note' => 'Use this wallet reference when requesting a manual balance update.',
        ]);

        $payload = [
            'email' => 'jane@example.com',
        ];

        $response = $this->app->make(Kernel::class)->handle(
            Request::create(
                '/api/auth/forgot-password',
                'POST',
                $payload,
                [],
                [],
                [
                    'HTTP_ACCEPT' => 'application/json',
                    'CONTENT_TYPE' => 'application/json',
                ],
                json_encode($payload, JSON_THROW_ON_ERROR)
            )
        );

        $this->assertSame(200, $response->getStatusCode());
        $data = json_decode($response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        $this->assertSame('If an account exists for that email address, reset instructions have been sent.', $data['message']);

        Notification::assertSentTo($user, ResetPasswordNotification::class);
    }

    public function test_it_resets_a_members_password_with_a_valid_token(): void
    {
        Notification::fake();

        $user = User::query()->create([
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '08030000000',
            'password' => 'password123',
            'role' => 'MEMBER',
            'member_id' => 'MB-1000',
            'status' => 'Active',
            'join_date' => now()->toDateString(),
            'wallet_balance' => 2500,
            'total_savings' => 0,
            'wallet_label' => 'Primary Wallet',
            'wallet_reference' => 'NINV-MB-1000',
            'funding_note' => 'Use this wallet reference when requesting a manual balance update.',
        ]);

        ApiToken::query()->create([
            'user_id' => $user->id,
            'name' => 'web',
            'token_hash' => hash('sha256', 'existing-session-token'),
            'expires_at' => now()->addHour(),
        ]);

        $forgotPayload = [
            'email' => 'jane@example.com',
        ];

        $forgotResponse = $this->app->make(Kernel::class)->handle(
            Request::create(
                '/api/auth/forgot-password',
                'POST',
                $forgotPayload,
                [],
                [],
                [
                    'HTTP_ACCEPT' => 'application/json',
                    'CONTENT_TYPE' => 'application/json',
                ],
                json_encode($forgotPayload, JSON_THROW_ON_ERROR)
            )
        );

        $this->assertSame(200, $forgotResponse->getStatusCode());

        $resetToken = null;
        Notification::assertSentTo(
            $user,
            ResetPasswordNotification::class,
            function (ResetPasswordNotification $notification) use (&$resetToken): bool {
                $resetToken = $notification->token;

                return true;
            }
        );

        $this->assertNotNull($resetToken);

        $resetPayload = [
            'email' => 'jane@example.com',
            'token' => $resetToken,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ];

        $resetResponse = $this->app->make(Kernel::class)->handle(
            Request::create(
                '/api/auth/reset-password',
                'POST',
                $resetPayload,
                [],
                [],
                [
                    'HTTP_ACCEPT' => 'application/json',
                    'CONTENT_TYPE' => 'application/json',
                ],
                json_encode($resetPayload, JSON_THROW_ON_ERROR)
            )
        );

        $this->assertSame(200, $resetResponse->getStatusCode());
        $data = json_decode($resetResponse->getContent(), true, 512, JSON_THROW_ON_ERROR);
        $this->assertSame('Password reset successful. You can now sign in with your new password.', $data['message']);

        $user->refresh();

        $this->assertTrue(Hash::check('newpassword123', $user->password));
        $this->assertDatabaseCount('api_tokens', 0);
        $this->assertDatabaseHas('audit_logs', [
            'target_user_id' => $user->id,
            'action' => 'Password Reset',
            'status' => 'Completed',
        ]);
    }
}

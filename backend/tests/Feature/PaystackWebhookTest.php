<?php

namespace Tests\Feature;

use App\Models\ApiToken;
use App\Models\PaystackWebhookEvent;
use App\Models\User;
use App\Models\VirtualAccount;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PaystackWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_charge_success_webhook_credits_virtual_account_owner_once(): void
    {
        Mail::fake();
        config(['services.paystack.secret_key' => 'sk_test_webhook_secret']);

        $user = User::query()->create([
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '08030000000',
            'password' => 'password123',
            'role' => 'MEMBER',
            'member_id' => 'MB-1000',
            'status' => 'Active',
            'join_date' => now()->toDateString(),
            'wallet_balance' => 0,
            'total_savings' => 0,
            'wallet_label' => 'Primary Wallet',
            'wallet_reference' => 'NINV-MB-1000',
            'funding_note' => 'Use your dedicated virtual account for automatic wallet funding.',
            'paystack_customer_code' => 'CUS_test_jane',
        ]);

        VirtualAccount::query()->create([
            'user_id' => $user->id,
            'provider' => 'paystack',
            'status' => 'active',
            'account_reference' => '202',
            'reservation_reference' => 'CUS_test_jane',
            'account_name' => 'NINOFFICIALCHECK JANE DOE',
            'account_number' => '1234567890',
            'bank_name' => 'Wema Bank',
            'bank_code' => '035',
            'provider_slug' => 'wema-bank',
            'customer_name' => 'Jane Doe',
            'customer_email' => 'jane@example.com',
            'active' => true,
            'assigned' => true,
        ]);

        $event = [
            'event' => 'charge.success',
            'data' => [
                'reference' => 'PSK-DVA-0001',
                'amount' => 25000,
                'currency' => 'NGN',
                'channel' => 'dedicated_nuban',
                'gateway_response' => 'Approved',
                'paid_at' => now()->toIso8601String(),
                'authorization' => [
                    'receiver_bank' => 'Wema Bank',
                    'receiver_bank_account_number' => '1234567890',
                ],
                'customer' => [
                    'email' => 'jane@example.com',
                ],
            ],
        ];
        $json = json_encode($event, JSON_THROW_ON_ERROR);
        $headers = [
            'HTTP_ACCEPT' => 'application/json',
            'CONTENT_TYPE' => 'application/json',
            'HTTP_X_PAYSTACK_SIGNATURE' => hash_hmac('sha512', $json, 'sk_test_webhook_secret'),
        ];

        $firstResponse = $this->app->make(Kernel::class)->handle(
            Request::create('/api/paystack/webhook', 'POST', [], [], [], $headers, $json)
        );
        $secondResponse = $this->app->make(Kernel::class)->handle(
            Request::create('/api/paystack/webhook', 'POST', [], [], [], $headers, $json)
        );

        $this->assertSame(200, $firstResponse->getStatusCode());
        $this->assertSame(200, $secondResponse->getStatusCode());
        $this->assertEquals(250.0, $user->fresh()->wallet_balance);

        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'reference' => 'PSK-DVA-0001',
            'type' => 'Wallet Deposit',
            'direction' => 'credit',
            'amount' => 250,
        ]);
        $this->assertDatabaseCount('transactions', 1);
        $this->assertDatabaseHas('paystack_webhook_events', [
            'reference' => 'PSK-DVA-0001',
            'account_number' => '1234567890',
            'amount' => 250,
        ]);
    }

    public function test_member_can_reconcile_missed_dedicated_account_transfer(): void
    {
        Mail::fake();
        config(['services.paystack.secret_key' => 'sk_test_reconcile_secret']);

        $user = User::query()->create([
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '08030000000',
            'password' => 'password123',
            'role' => 'MEMBER',
            'member_id' => 'MB-1000',
            'status' => 'Active',
            'join_date' => now()->toDateString(),
            'wallet_balance' => 0,
            'total_savings' => 0,
            'wallet_label' => 'Primary Wallet',
            'wallet_reference' => 'NINV-MB-1000',
            'funding_note' => 'Use your dedicated virtual account for automatic wallet funding.',
            'paystack_customer_code' => 'CUS_test_jane',
        ]);

        VirtualAccount::query()->create([
            'user_id' => $user->id,
            'provider' => 'paystack',
            'status' => 'active',
            'account_reference' => '202',
            'reservation_reference' => 'CUS_test_jane',
            'account_name' => 'NINOFFICIALCHECK JANE DOE',
            'account_number' => '1234567890',
            'bank_name' => 'Wema Bank',
            'bank_code' => '035',
            'provider_slug' => 'wema-bank',
            'customer_name' => 'Jane Doe',
            'customer_email' => 'jane@example.com',
            'active' => true,
            'assigned' => true,
        ]);

        $token = 'member-token';
        ApiToken::query()->create([
            'user_id' => $user->id,
            'name' => 'web',
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addHour(),
        ]);

        Http::fake([
            'https://api.paystack.co/transaction/verify/OPAY-DVA-0001' => Http::response([
                'status' => true,
                'data' => [
                    'reference' => 'OPAY-DVA-0001',
                    'amount' => 12000,
                    'currency' => 'NGN',
                    'status' => 'success',
                    'channel' => 'bank_transfer',
                    'gateway_response' => 'Approved',
                    'paid_at' => now()->toIso8601String(),
                    'authorization' => [
                        'receiver_bank' => 'Wema Bank',
                        'receiver_bank_account_number' => '1234567890',
                    ],
                    'customer' => [
                        'email' => 'jane@example.com',
                    ],
                ],
            ]),
            'https://api.paystack.co/transaction*' => Http::response([
                'status' => true,
                'data' => [
                    ['reference' => 'OPAY-DVA-0001'],
                ],
            ]),
        ]);

        $headers = [
            'HTTP_ACCEPT' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ];

        $response = $this->app->make(Kernel::class)->handle(
            Request::create('/api/wallet/reconcile-paystack', 'POST', [], [], [], $headers)
        );

        $this->assertSame(200, $response->getStatusCode());
        $this->assertEquals(120.0, $user->fresh()->wallet_balance);
        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'reference' => 'OPAY-DVA-0001',
            'type' => 'Wallet Deposit',
            'direction' => 'credit',
            'amount' => 120,
        ]);
    }

    public function test_admin_can_lookup_and_credit_paystack_reference(): void
    {
        Mail::fake();
        config(['services.paystack.secret_key' => 'sk_test_reconcile_secret']);

        $admin = User::query()->create([
            'name' => 'Admin Officer',
            'email' => 'admin@example.com',
            'phone' => '08000000000',
            'password' => 'admin12345',
            'role' => 'ADMIN',
            'member_id' => 'ADM-0001',
            'status' => 'Active',
            'join_date' => now()->toDateString(),
            'wallet_balance' => 0,
            'wallet_label' => 'Admin Wallet',
            'wallet_reference' => 'NINV-ADM-0001',
        ]);

        $user = User::query()->create([
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '08030000000',
            'password' => 'password123',
            'role' => 'MEMBER',
            'member_id' => 'MB-1000',
            'status' => 'Active',
            'join_date' => now()->toDateString(),
            'wallet_balance' => 0,
            'total_savings' => 0,
            'wallet_label' => 'Primary Wallet',
            'wallet_reference' => 'NINV-MB-1000',
            'paystack_customer_code' => 'CUS_test_jane',
        ]);

        VirtualAccount::query()->create([
            'user_id' => $user->id,
            'provider' => 'paystack',
            'status' => 'active',
            'account_name' => 'NINOFFICIALCHECK JANE DOE',
            'account_number' => '1234567890',
            'bank_name' => 'Wema Bank',
            'provider_slug' => 'wema-bank',
            'customer_email' => 'jane@example.com',
            'active' => true,
            'assigned' => true,
        ]);

        $token = 'admin-token';
        ApiToken::query()->create([
            'user_id' => $admin->id,
            'name' => 'web',
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addHour(),
        ]);

        Http::fake([
            'https://api.paystack.co/transaction/verify/ADMIN-LOOKUP-0001' => Http::response([
                'status' => true,
                'data' => [
                    'reference' => 'ADMIN-LOOKUP-0001',
                    'amount' => 50000,
                    'currency' => 'NGN',
                    'status' => 'success',
                    'channel' => 'bank_transfer',
                    'gateway_response' => 'Approved',
                    'paid_at' => now()->toIso8601String(),
                    'authorization' => [
                        'receiver_bank' => 'Wema Bank',
                        'receiver_bank_account_number' => '1234567890',
                    ],
                    'customer' => [
                        'email' => 'jane@example.com',
                    ],
                ],
            ]),
        ]);

        $headers = [
            'HTTP_ACCEPT' => 'application/json',
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ];
        $body = json_encode(['reference' => 'ADMIN-LOOKUP-0001'], JSON_THROW_ON_ERROR);

        $response = $this->app->make(Kernel::class)->handle(
            Request::create('/api/admin/wallet/reconcile-paystack/reference', 'POST', [], [], [], $headers, $body)
        );
        $payload = json_decode($response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertTrue($payload['result']['credited']);
        $this->assertSame('jane@example.com', $payload['result']['user']['email']);
        $this->assertEquals(500.0, $user->fresh()->wallet_balance);
    }

    public function test_reconciliation_can_credit_a_webhook_that_was_saved_before_member_match(): void
    {
        Mail::fake();
        config(['services.paystack.secret_key' => 'sk_test_reconcile_secret']);

        $user = User::query()->create([
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '08030000000',
            'password' => 'password123',
            'role' => 'MEMBER',
            'member_id' => 'MB-1000',
            'status' => 'Active',
            'join_date' => now()->toDateString(),
            'wallet_balance' => 0,
            'total_savings' => 0,
            'wallet_label' => 'Primary Wallet',
            'wallet_reference' => 'NINV-MB-1000',
            'paystack_customer_code' => 'CUS_test_jane',
        ]);

        PaystackWebhookEvent::query()->create([
            'event' => 'charge.success',
            'reference' => 'LATE-MATCH-0001',
            'account_number' => null,
            'amount' => 330,
            'payload' => [
                'event' => 'charge.success',
                'data' => [
                    'reference' => 'LATE-MATCH-0001',
                    'amount' => 33000,
                    'currency' => 'NGN',
                    'channel' => 'bank_transfer',
                    'customer' => [
                        'email' => 'unknown@example.com',
                    ],
                ],
            ],
            'processed_at' => null,
        ]);

        VirtualAccount::query()->create([
            'user_id' => $user->id,
            'provider' => 'paystack',
            'status' => 'active',
            'account_reference' => '202',
            'reservation_reference' => 'CUS_test_jane',
            'account_name' => 'NINOFFICIALCHECK JANE DOE',
            'account_number' => '1234567890',
            'bank_name' => 'Wema Bank',
            'bank_code' => '035',
            'provider_slug' => 'wema-bank',
            'customer_name' => 'Jane Doe',
            'customer_email' => 'jane@example.com',
            'active' => true,
            'assigned' => true,
        ]);

        $token = 'member-token';
        ApiToken::query()->create([
            'user_id' => $user->id,
            'name' => 'web',
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addHour(),
        ]);

        Http::fake([
            'https://api.paystack.co/transaction/verify/LATE-MATCH-0001' => Http::response([
                'status' => true,
                'data' => [
                    'reference' => 'LATE-MATCH-0001',
                    'amount' => 33000,
                    'currency' => 'NGN',
                    'status' => 'success',
                    'channel' => 'bank_transfer',
                    'gateway_response' => 'Approved',
                    'paid_at' => now()->toIso8601String(),
                    'authorization' => [
                        'receiver_bank' => 'Wema Bank',
                        'receiver_bank_account_number' => '1234567890',
                    ],
                    'customer' => [
                        'email' => 'jane@example.com',
                        'customer_code' => 'CUS_test_jane',
                    ],
                ],
            ]),
        ]);

        $headers = [
            'HTTP_ACCEPT' => 'application/json',
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ];
        $body = json_encode(['reference' => 'LATE-MATCH-0001'], JSON_THROW_ON_ERROR);

        $response = $this->app->make(Kernel::class)->handle(
            Request::create('/api/wallet/reconcile-paystack/reference', 'POST', [], [], [], $headers, $body)
        );
        $payload = json_decode($response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertTrue($payload['result']['credited']);
        $this->assertFalse($payload['result']['alreadyProcessed']);
        $this->assertEquals(330.0, $user->fresh()->wallet_balance);
        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'reference' => 'LATE-MATCH-0001',
            'type' => 'Wallet Deposit',
            'direction' => 'credit',
            'amount' => 330,
        ]);
        $this->assertDatabaseHas('paystack_webhook_events', [
            'reference' => 'LATE-MATCH-0001',
            'account_number' => '1234567890',
            'amount' => 330,
        ]);
    }
}

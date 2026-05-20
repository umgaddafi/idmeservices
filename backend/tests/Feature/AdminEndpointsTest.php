<?php

namespace Tests\Feature;

use App\Models\ApiToken;
use App\Models\AuditLog;
use App\Models\SupportTicket;
use App\Models\SystemSetting;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Verification;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class AdminEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_fetch_member_and_activity_endpoints(): void
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

        $member = User::query()->create([
            'name' => 'Member User',
            'email' => 'member@idmeservices.com.ng',
            'phone' => '08030000000',
            'password' => 'password123',
            'role' => 'MEMBER',
            'member_id' => 'MB-1000',
            'status' => 'Active',
            'join_date' => now()->toDateString(),
            'wallet_balance' => 49000,
            'wallet_label' => 'Primary Wallet',
            'wallet_reference' => 'NINV-MB-1000',
        ]);

        $token = 'plain-api-token';
        ApiToken::query()->create([
            'user_id' => $admin->id,
            'name' => 'web',
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addHour(),
        ]);

        SystemSetting::query()->create([
            'id' => 1,
            'branding' => ['systemName' => 'IDM e-Services', 'logoUrl' => null],
            'smtp' => ['host' => '', 'port' => 587, 'user' => '', 'pass' => '', 'fromName' => 'IDM e-Services', 'fromEmail' => 'support@idmeservices.com.ng'],
            'support_email' => 'support@idmeservices.com.ng',
            'support_phone' => '+2348000000000',
        ]);

        $verification = Verification::query()->create([
            'user_id' => $member->id,
            'reviewed_by_user_id' => $admin->id,
            'reference' => 'NIN-0001',
            'channel' => 'NIN Verification',
            'identifier' => '12345678901',
            'amount' => 150,
            'status' => 'Completed',
            'requested_at' => now(),
            'completed_at' => now(),
        ]);

        Transaction::query()->create([
            'user_id' => $member->id,
            'verification_id' => $verification->id,
            'reference' => 'TXN-0001',
            'type' => 'NIN Verification',
            'direction' => 'debit',
            'amount' => 150,
            'status' => 'Completed',
            'description' => 'NIN verification charge',
            'processed_at' => now(),
        ]);

        SupportTicket::query()->create([
            'user_id' => $member->id,
            'assigned_admin_id' => $admin->id,
            'subject' => 'Verification mismatch',
            'channel' => 'Verification',
            'priority' => 'High',
            'status' => 'Investigating',
        ]);

        AuditLog::query()->create([
            'actor_user_id' => $admin->id,
            'target_user_id' => $member->id,
            'actor' => $admin->name,
            'actor_role' => $admin->role,
            'target' => $member->email,
            'action' => 'Member Reviewed',
            'status' => 'Completed',
            'timestamp' => now(),
        ]);

        $headers = [
            'HTTP_ACCEPT' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ];

        $membersResponse = $this->app->make(Kernel::class)->handle(Request::create('/api/members', 'GET', [], [], [], $headers));
        $transactionsResponse = $this->app->make(Kernel::class)->handle(Request::create('/api/admin/transactions', 'GET', [], [], [], $headers));
        $verificationsResponse = $this->app->make(Kernel::class)->handle(Request::create('/api/admin/verifications', 'GET', [], [], [], $headers));
        $ticketsResponse = $this->app->make(Kernel::class)->handle(Request::create('/api/admin/support-tickets', 'GET', [], [], [], $headers));
        $logsResponse = $this->app->make(Kernel::class)->handle(Request::create('/api/audit-logs', 'GET', [], [], [], $headers));
        $settingsResponse = $this->app->make(Kernel::class)->handle(Request::create('/api/settings', 'GET', [], [], [], $headers));

        $this->assertSame(200, $membersResponse->getStatusCode());
        $this->assertSame(200, $transactionsResponse->getStatusCode());
        $this->assertSame(200, $verificationsResponse->getStatusCode());
        $this->assertSame(200, $ticketsResponse->getStatusCode());
        $this->assertSame(200, $logsResponse->getStatusCode());
        $this->assertSame(200, $settingsResponse->getStatusCode());

        $membersPayload = json_decode($membersResponse->getContent(), true, 512, JSON_THROW_ON_ERROR);
        $transactionsPayload = json_decode($transactionsResponse->getContent(), true, 512, JSON_THROW_ON_ERROR);
        $verificationsPayload = json_decode($verificationsResponse->getContent(), true, 512, JSON_THROW_ON_ERROR);
        $ticketsPayload = json_decode($ticketsResponse->getContent(), true, 512, JSON_THROW_ON_ERROR);
        $logsPayload = json_decode($logsResponse->getContent(), true, 512, JSON_THROW_ON_ERROR);
        $settingsPayload = json_decode($settingsResponse->getContent(), true, 512, JSON_THROW_ON_ERROR);

        $this->assertContains('Member User', array_column($membersPayload['members'], 'name'));
        $this->assertSame('NIN Verification', $transactionsPayload['transactions'][0]['type']);
        $this->assertSame('NIN-0001', $verificationsPayload['verifications'][0]['reference']);
        $this->assertSame('Verification mismatch', $ticketsPayload['tickets'][0]['subject']);
        $this->assertSame('Member Reviewed', $logsPayload['logs'][0]['action']);
        $this->assertSame('IDM e-Services', $settingsPayload['settings']['branding']['systemName']);
    }

    public function test_admin_can_update_and_delete_a_member(): void
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

        $member = User::query()->create([
            'name' => 'Member User',
            'email' => 'member@idmeservices.com.ng',
            'phone' => '08030000000',
            'password' => 'password123',
            'role' => 'MEMBER',
            'member_id' => 'MB-1000',
            'status' => 'Active',
            'join_date' => now()->toDateString(),
            'wallet_balance' => 49000,
            'wallet_label' => 'Primary Wallet',
            'wallet_reference' => 'NINV-MB-1000',
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
            'name' => 'Updated Member',
            'phone' => '08031112222',
            'status' => 'Suspended',
            'role' => 'MEMBER',
        ];

        $updateResponse = $this->app->make(Kernel::class)->handle(
            Request::create(
                '/api/members/'.$member->id,
                'PUT',
                $updatePayload,
                [],
                [],
                $headers,
                json_encode($updatePayload, JSON_THROW_ON_ERROR)
            )
        );

        $this->assertSame(200, $updateResponse->getStatusCode());
        $updateResponsePayload = json_decode($updateResponse->getContent(), true, 512, JSON_THROW_ON_ERROR);
        $this->assertSame('Updated Member', $updateResponsePayload['member']['name']);
        $this->assertSame('Suspended', $updateResponsePayload['member']['status']);

        $this->assertDatabaseHas('users', [
            'id' => $member->id,
            'name' => 'Updated Member',
            'phone' => '08031112222',
            'status' => 'Suspended',
        ]);

        $deleteResponse = $this->app->make(Kernel::class)->handle(
            Request::create('/api/members/'.$member->id, 'DELETE', [], [], [], $headers)
        );

        $this->assertSame(200, $deleteResponse->getStatusCode());
        $deleteResponsePayload = json_decode($deleteResponse->getContent(), true, 512, JSON_THROW_ON_ERROR);
        $this->assertSame('Member deleted successfully.', $deleteResponsePayload['message']);
        $this->assertSame((string) $member->id, $deleteResponsePayload['memberId']);

        $this->assertDatabaseMissing('users', [
            'id' => $member->id,
        ]);
    }
}



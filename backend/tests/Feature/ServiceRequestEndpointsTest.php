<?php

namespace Tests\Feature;

use App\Models\ApiToken;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class ServiceRequestEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_can_submit_and_list_service_requests_and_admin_can_update_status(): void
    {
        $member = User::query()->create([
            'name' => 'Member User',
            'email' => 'member@idmeservices.com.ng',
            'phone' => '08030000000',
            'password' => 'password123',
            'role' => 'MEMBER',
            'member_id' => 'MB-1000',
            'status' => 'Active',
            'join_date' => now()->toDateString(),
            'wallet_balance' => 5000,
            'wallet_label' => 'Primary Wallet',
            'wallet_reference' => 'NINV-MB-1000',
        ]);

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

        $memberToken = 'member-api-token';
        $adminToken = 'admin-api-token';

        ApiToken::query()->create([
            'user_id' => $member->id,
            'name' => 'web',
            'token_hash' => hash('sha256', $memberToken),
            'expires_at' => now()->addHour(),
        ]);

        ApiToken::query()->create([
            'user_id' => $admin->id,
            'name' => 'web',
            'token_hash' => hash('sha256', $adminToken),
            'expires_at' => now()->addHour(),
        ]);

        $memberHeaders = [
            'HTTP_ACCEPT' => 'application/json',
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer '.$memberToken,
        ];

        $submitPayload = [
            'category' => 'resolutions',
            'type' => 'tracking',
            'trackingId' => 'TRK-44556677',
        ];

        $submitResponse = $this->app->make(Kernel::class)->handle(
            Request::create(
                '/api/service-requests',
                'POST',
                $submitPayload,
                [],
                [],
                $memberHeaders,
                json_encode($submitPayload, JSON_THROW_ON_ERROR)
            )
        );

        $this->assertSame(201, $submitResponse->getStatusCode());
        $submitResponsePayload = json_decode($submitResponse->getContent(), true, 512, JSON_THROW_ON_ERROR);
        $this->assertSame('SUBMIT TRACKING ID', $submitResponsePayload['request']['type']);
        $this->assertSame('New Request', $submitResponsePayload['request']['status']);
        $this->assertEquals(4000.0, $submitResponsePayload['wallet']['balance']);

        $listResponse = $this->app->make(Kernel::class)->handle(
            Request::create('/api/service-requests?category=resolutions', 'GET', [], [], [], [
                'HTTP_ACCEPT' => 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer '.$memberToken,
            ])
        );

        $this->assertSame(200, $listResponse->getStatusCode());
        $listPayload = json_decode($listResponse->getContent(), true, 512, JSON_THROW_ON_ERROR);
        $this->assertCount(1, $listPayload['requests']);
        $this->assertSame('TRK-44556677', $listPayload['requests'][0]['identifier']);

        $serviceRequest = ServiceRequest::query()->firstOrFail();

        $adminHeaders = [
            'HTTP_ACCEPT' => 'application/json',
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer '.$adminToken,
        ];

        $processingPayload = ['status' => 'Processing'];

        $processingResponse = $this->app->make(Kernel::class)->handle(
            Request::create(
                '/api/admin/service-requests/'.$serviceRequest->id,
                'PATCH',
                $processingPayload,
                [],
                [],
                $adminHeaders,
                json_encode($processingPayload, JSON_THROW_ON_ERROR)
            )
        );

        $this->assertSame(200, $processingResponse->getStatusCode());
        $processingResponsePayload = json_decode($processingResponse->getContent(), true, 512, JSON_THROW_ON_ERROR);
        $this->assertSame('Processing', $processingResponsePayload['request']['status']);

        $this->assertDatabaseHas('service_requests', [
            'id' => $serviceRequest->id,
            'status' => 'Processing',
            'completed_at' => null,
        ]);

        $updatePayload = ['status' => 'Completed'];

        $updateResponse = $this->app->make(Kernel::class)->handle(
            Request::create(
                '/api/admin/service-requests/'.$serviceRequest->id,
                'PATCH',
                $updatePayload,
                [],
                [],
                $adminHeaders,
                json_encode($updatePayload, JSON_THROW_ON_ERROR)
            )
        );

        $this->assertSame(200, $updateResponse->getStatusCode());
        $updateResponsePayload = json_decode($updateResponse->getContent(), true, 512, JSON_THROW_ON_ERROR);
        $this->assertSame('Completed', $updateResponsePayload['request']['status']);

        $adminListResponse = $this->app->make(Kernel::class)->handle(
            Request::create('/api/admin/service-requests', 'GET', [], [], [], [
                'HTTP_ACCEPT' => 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer '.$adminToken,
            ])
        );

        $this->assertSame(200, $adminListResponse->getStatusCode());
        $adminListPayload = json_decode($adminListResponse->getContent(), true, 512, JSON_THROW_ON_ERROR);
        $this->assertCount(1, $adminListPayload['requests']);
        $this->assertSame('Completed', $adminListPayload['requests'][0]['status']);

        $this->assertDatabaseHas('service_requests', [
            'id' => $serviceRequest->id,
            'status' => 'Completed',
        ]);
    }
}


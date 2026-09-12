<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\Service;
use App\Models\SystemSetting;
use App\Models\SupportTicket;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Verification;
use App\Support\PricingCatalog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@idmeservices.com.ng'],
            [
                'name' => 'Admin Officer',
                'phone' => '08000000000',
                'password' => Hash::make('admin12345'),
                'role' => 'ADMIN',
                'member_id' => 'ADM-0001',
                'wallet_balance' => 125000,
                'total_savings' => 0,
                'join_date' => '2026-01-02',
                'status' => 'Active',
                'wallet_label' => 'Admin Wallet',
                'wallet_reference' => 'NINV-ADM-0001',
                'funding_note' => 'Use this wallet reference when logging internal treasury adjustments.',
            ]
        );

        $member = User::query()->updateOrCreate(
            ['email' => 'um@gmail.com'],
            [
                'name' => 'Gaddafi Umar',
                'phone' => '09042340091',
                'nin' => '12345678901',
                'bvn' => '12345678901',
                'password' => Hash::make('12345678'),
                'role' => 'MEMBER',
                'member_id' => 'MB-1000',
                'wallet_balance' => 49000,
                'total_savings' => 4800,
                'join_date' => '2025-12-19',
                'status' => 'Active',
                'wallet_label' => 'Primary Wallet',
                'wallet_reference' => 'NINV-MB-1000',
                'funding_note' => 'Share this reference when requesting a wallet funding review.',
            ]
        );

        SystemSetting::query()->updateOrCreate(
            ['id' => 1],
            [
                'branding' => [
                    'systemName' => 'IDM e-Services',
                    'logoUrl' => null,
                ],
                'smtp' => [
                    'host' => '',
                    'port' => 587,
                    'user' => '',
                    'pass' => '',
                    'fromName' => 'IDM e-Services',
                    'fromEmail' => 'support@idmeservices.com.ng',
                ],
                'support_email' => 'support@idmeservices.com.ng',
                'support_phone' => '+2348000000000',
                'default_nin_price' => 150,
                'default_bvn_price' => 170,
                'default_phone_price' => 200,
                'template_pricing' => PricingCatalog::defaults(),
                'registration_mode' => 'OPEN',
                'auto_debit_date' => 1,
                'is_auto_debit_active' => false,
                'total_pool_liquidity' => 174000,
            ]
        );

        foreach ([
            ['title' => 'NIN Verification', 'slug' => 'nin-verification', 'category' => 'verification', 'type' => 'nin', 'route_path' => '/select_nin_template', 'description' => 'Verify National Identification Number details with wallet-based processing.', 'amount' => 150, 'image_path' => '/assets/marketing/identity-phone.jpg', 'sort_order' => 1],
            ['title' => 'BVN Verification', 'slug' => 'bvn-verification', 'category' => 'verification', 'type' => 'bvn', 'route_path' => '/verify_bvn', 'description' => 'Validate Bank Verification Number details from a dedicated service flow.', 'amount' => 170, 'image_path' => '/assets/marketing/laptop-tablet-workflow.jpg', 'sort_order' => 2],
            ['title' => 'NIN Modification', 'slug' => 'nin-modification', 'category' => 'ninModifications', 'type' => 'name', 'route_path' => '/modification/nin', 'description' => 'Submit NIN name, phone, date of birth, or address modification requests.', 'amount' => 8000, 'image_path' => '/assets/template-based.png', 'sort_order' => 3],
            ['title' => 'Birth Attestation', 'slug' => 'birth-attestation', 'category' => 'birthAttestations', 'type' => 'permanent', 'route_path' => '/birth-attestation', 'description' => 'Open permanent and temporary birth attestation requests.', 'amount' => 1500, 'image_path' => '/assets/dashboard/attestion.png', 'sort_order' => 4],
            ['title' => 'IPE / Error 50 Resolution', 'slug' => 'ipe-error-50-resolution', 'category' => 'resolutions', 'type' => 'tracking', 'route_path' => '/ipe-error-50-resolution', 'description' => 'Submit a tracking ID for IPE, Error 50, or related resolution processing.', 'amount' => 1000, 'image_path' => '/assets/marketing/nigerian-professional.jpg', 'sort_order' => 5],
            ['title' => 'Diaspora Child Birth Notification', 'slug' => 'diaspora-child-birth-notification', 'category' => 'diasporaBirth', 'type' => 'child', 'route_path' => '/diaspora-child-birth-notification', 'description' => 'Parent-linked child identity request for diaspora birth notification.', 'amount' => 2000, 'image_path' => '/assets/dashboard/diaspora_child.png', 'sort_order' => 6],
        ] as $service) {
            Service::query()->updateOrCreate(
                ['slug' => $service['slug']],
                $service + ['status' => 'Live', 'show_on_homepage' => true]
            );
        }

        $completedVerification = Verification::query()->updateOrCreate(
            ['reference' => 'NIN-0001'],
            [
                'user_id' => $member->id,
                'reviewed_by_user_id' => $admin->id,
                'channel' => 'NIN Verification',
                'identifier' => '12345678901',
                'amount' => 150,
                'status' => 'Completed',
                'result' => [
                    'nin' => '12345678901',
                    'surname' => 'UMAR',
                    'firstName' => 'GADDAFI',
                    'middleName' => '',
                    'givenNames' => 'GADDAFI',
                    'dateOfBirth' => '1998-12-27',
                    'sex' => 'M',
                    'gender' => 'Male',
                    'issueDate' => '2025-11-17',
                    'trackingId' => 'S2N6NVERAB0AX4',
                    'addressLines' => ['BACHURE VILLAGE JIMETA', 'Yola North', 'Adamawa'],
                    'nationalityCode' => 'NGA',
                ],
                'requested_at' => '2026-05-08 09:15:00',
                'completed_at' => '2026-05-08 09:16:00',
            ]
        );

        Verification::query()->updateOrCreate(
            ['reference' => 'BVN-0008'],
            [
                'user_id' => $member->id,
                'reviewed_by_user_id' => $admin->id,
                'channel' => 'BVN Verification',
                'identifier' => '12345678901',
                'amount' => 170,
                'status' => 'Pending Review',
                'result' => null,
                'requested_at' => '2026-05-08 10:05:00',
            ]
        );

        Transaction::query()->updateOrCreate(
            ['reference' => 'FUND-62220724837'],
            [
                'user_id' => $member->id,
                'type' => 'Wallet Funding',
                'direction' => 'credit',
                'amount' => 49150,
                'status' => 'Completed',
                'description' => 'Manual wallet funding approved by admin',
                'processed_at' => '2026-05-08 08:45:00',
            ]
        );

        Transaction::query()->updateOrCreate(
            ['reference' => 'NIN-0001'],
            [
                'user_id' => $member->id,
                'verification_id' => $completedVerification->id,
                'type' => 'NIN Verification',
                'direction' => 'debit',
                'amount' => 150,
                'status' => 'Completed',
                'description' => 'NIN verification charge',
                'processed_at' => '2026-05-08 09:16:00',
            ]
        );

        SupportTicket::query()->updateOrCreate(
            ['subject' => 'BVN response mismatch'],
            [
                'user_id' => $member->id,
                'assigned_admin_id' => $admin->id,
                'channel' => 'Verification',
                'priority' => 'High',
                'status' => 'Investigating',
                'message' => 'Member reported a mismatch during BVN review.',
            ]
        );

        AuditLog::query()->updateOrCreate(
            ['action' => 'System Initialized', 'target' => 'Bootstrap Seed'],
            [
                'actor_user_id' => $admin->id,
                'target_user_id' => $member->id,
                'actor' => $admin->name,
                'actor_role' => $admin->role,
                'timestamp' => now(),
                'status' => 'Completed',
                'metadata' => ['seeded' => true],
            ]
        );

        AuditLog::query()->updateOrCreate(
            ['action' => 'Support Ticket Assigned', 'target' => 'BVN response mismatch'],
            [
                'actor_user_id' => $admin->id,
                'target_user_id' => $member->id,
                'actor' => $admin->name,
                'actor_role' => $admin->role,
                'timestamp' => now()->subHour(),
                'status' => 'Completed',
                'metadata' => ['channel' => 'Verification'],
            ]
        );
    }
}



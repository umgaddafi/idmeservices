<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

$requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$requestMethod = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($requestMethod === 'GET' && in_array($requestPath, ['/api/bootstrap', '/api/services'], true)) {
    try {
        require __DIR__.'/../vendor/autoload.php';

        /** @var Application $app */
        $app = require_once __DIR__.'/../bootstrap/app.php';
        $app->handleRequest(Request::capture());
        return;
    } catch (Throwable) {
        header('Content-Type: application/json; charset=utf-8');

        if ($requestPath === '/api/bootstrap') {
            echo json_encode([
                'settings' => [
                    'minMonthlyContribution' => 0,
                    'defaultPenaltyRate' => 0,
                    'loanToSavingsMultiplier' => 0,
                    'emergencyLoanInterest' => 0,
                    'loanEligibilityMonths' => 0,
                    'autoDebitDate' => 1,
                    'isAutoDebitActive' => false,
                    'totalPoolLiquidity' => 0,
                    'branding' => [
                        'systemName' => 'IDM e-Services',
                        'logoUrl' => null,
                        'homepageWallpaperUrl' => null,
                    ],
                    'currency' => [
                        'code' => 'NGN',
                        'locale' => 'en-NG',
                        'rate' => 1,
                    ],
                    'pricingSource' => 'env',
                    'smtp' => [
                        'host' => '',
                        'port' => 587,
                        'user' => '',
                        'pass' => '',
                        'fromName' => 'IDM e-Services',
                        'fromEmail' => 'support@idmeservices.com.ng',
                    ],
                    'supportEmail' => 'support@idmeservices.com.ng',
                    'supportPhone' => '+2348000000000',
                    'defaultNinPrice' => 150,
                    'defaultBvnPrice' => 170,
                    'defaultPhonePrice' => 200,
                    'templatePricing' => [
                        'nin' => [
                            ['id' => 'premium', 'title' => 'Premium Template', 'amount' => 150, 'status' => 'Live'],
                            ['id' => 'regular', 'title' => 'Regular Template', 'amount' => 150, 'status' => 'Ready'],
                        ],
                        'phone' => [
                            ['id' => 'premium-phone', 'title' => 'Premium', 'amount' => 200, 'status' => 'Live'],
                            ['id' => 'regular-phone', 'title' => 'Regular', 'amount' => 200, 'status' => 'Ready'],
                            ['id' => 'standard-phone', 'title' => 'Standard', 'amount' => 200, 'status' => 'Ready'],
                        ],
                        'bvn' => [
                            ['id' => 'premium-bvn', 'title' => 'Premium', 'amount' => 170, 'status' => 'Live'],
                            ['id' => 'regular-bvn', 'title' => 'Regular', 'amount' => 170, 'status' => 'Ready'],
                        ],
                        'modification' => [
                            ['id' => 'dob-modification', 'title' => 'DOB Modification', 'amount' => 43000, 'status' => 'Live'],
                            ['id' => 'phone-modification', 'title' => 'Phone Number Modification', 'amount' => 8000, 'status' => 'Live'],
                            ['id' => 'address-modification', 'title' => 'Address Modification', 'amount' => 8000, 'status' => 'Live'],
                            ['id' => 'name-modification', 'title' => 'Name Modification', 'amount' => 8000, 'status' => 'Live'],
                        ],
                        'birthAttestation' => [
                            ['id' => 'permanent-attestation', 'title' => 'Permanent Birth Attestation', 'amount' => 1500, 'status' => 'Live'],
                            ['id' => 'temporary-attestation', 'title' => 'Temporary Birth Attestation', 'amount' => 1000, 'status' => 'Live'],
                        ],
                        'diaspora' => [
                            ['id' => 'diaspora-child-birth', 'title' => 'Diaspora Child Birth Notification', 'amount' => 2000, 'status' => 'Live'],
                        ],
                        'resolutions' => [
                            ['id' => 'ipe-error-50', 'title' => 'IPE / Error 50 / Resolution', 'amount' => 1000, 'status' => 'Live'],
                        ],
                        'others' => [
                            ['id' => 'express-other', 'title' => 'Express Verification', 'amount' => 250, 'status' => 'Ready'],
                            ['id' => 'default-other', 'title' => 'Default Verification', 'amount' => 180, 'status' => 'Ready'],
                        ],
                    ],
                    'registrationMode' => 'OPEN',
                ],
            ], JSON_THROW_ON_ERROR);
            exit;
        }

        echo json_encode([
            'services' => [
                ['id' => '1', 'title' => 'NIN Verification', 'slug' => 'nin-verification', 'category' => 'verification', 'type' => 'nin', 'routePath' => '/select_nin_template', 'description' => 'Verify National Identification Number details with wallet-based processing.', 'amount' => 150, 'price' => 'N150.00', 'status' => 'Live', 'imageUrl' => '/assets/marketing/identity-phone.jpg', 'sortOrder' => 1, 'showOnHomepage' => true],
                ['id' => '2', 'title' => 'BVN Verification', 'slug' => 'bvn-verification', 'category' => 'verification', 'type' => 'bvn', 'routePath' => '/verify_bvn', 'description' => 'Validate Bank Verification Number details from a dedicated service flow.', 'amount' => 170, 'price' => 'N170.00', 'status' => 'Live', 'imageUrl' => '/assets/marketing/laptop-tablet-workflow.jpg', 'sortOrder' => 2, 'showOnHomepage' => true],
                ['id' => '3', 'title' => 'NIN Modification', 'slug' => 'nin-modification', 'category' => 'ninModifications', 'type' => 'name', 'routePath' => '/modification/nin', 'description' => 'Submit NIN name, phone, date of birth, or address modification requests.', 'amount' => 8000, 'price' => 'N8,000.00', 'status' => 'Live', 'imageUrl' => '/assets/template-based.png', 'sortOrder' => 3, 'showOnHomepage' => true],
                ['id' => '4', 'title' => 'Birth Attestation', 'slug' => 'birth-attestation', 'category' => 'birthAttestations', 'type' => 'permanent', 'routePath' => '/birth-attestation', 'description' => 'Open permanent and temporary birth attestation requests.', 'amount' => 1500, 'price' => 'N1,500.00', 'status' => 'Live', 'imageUrl' => '/assets/dashboard/attestion.png', 'sortOrder' => 4, 'showOnHomepage' => true],
                ['id' => '5', 'title' => 'IPE / Error 50 Resolution', 'slug' => 'ipe-error-50-resolution', 'category' => 'resolutions', 'type' => 'tracking', 'routePath' => '/ipe-error-50-resolution', 'description' => 'Submit a tracking ID for IPE, Error 50, or related resolution processing.', 'amount' => 1000, 'price' => 'N1,000.00', 'status' => 'Live', 'imageUrl' => '/assets/marketing/nigerian-professional.jpg', 'sortOrder' => 5, 'showOnHomepage' => true],
                ['id' => '6', 'title' => 'Diaspora Child Birth Notification', 'slug' => 'diaspora-child-birth-notification', 'category' => 'diasporaBirth', 'type' => 'child', 'routePath' => '/diaspora-child-birth-notification', 'description' => 'Parent-linked child identity request for diaspora birth notification.', 'amount' => 2000, 'price' => 'N2,000.00', 'status' => 'Live', 'imageUrl' => '/assets/dashboard/diaspora_child.png', 'sortOrder' => 6, 'showOnHomepage' => true],
            ],
        ], JSON_THROW_ON_ERROR);
        exit;
    }
}

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());

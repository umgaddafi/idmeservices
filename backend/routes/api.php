<?php

use App\Http\Controllers\Api\AdminTransactionController;
use App\Http\Controllers\Api\AdminVerificationController;
use App\Http\Controllers\Api\AdminServiceRequestController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BootstrapController;
use App\Http\Controllers\Api\BvnVerificationController;
use App\Http\Controllers\Api\KhadVerifyWalletBalanceController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\MemberPortalController;
use App\Http\Controllers\Api\NinVerificationController;
use App\Http\Controllers\Api\PaystackWebhookController;
use App\Http\Controllers\Api\PhoneVerificationController;
use App\Http\Controllers\Api\ServiceRequestController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\SupportTicketController;
use App\Http\Controllers\Api\WalletBalanceController;
use App\Http\Controllers\Api\WalletReconciliationController;
use App\Http\Controllers\Api\WalletVirtualAccountController;
use Illuminate\Support\Facades\Route;

Route::get('/bootstrap', BootstrapController::class);
Route::get('/services', [ServiceController::class, 'index']);
Route::post('/support-tickets', [SupportTicketController::class, 'store']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/paystack/webhook', PaystackWebhookController::class);

Route::prefix('auth')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    Route::middleware('api.token')->group(function (): void {
        Route::get('/me', [AuthController::class, 'me']);
        Route::patch('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::middleware('api.token')->group(function (): void {
    Route::post('/verify/nin', NinVerificationController::class);
    Route::post('/verify/bvn', BvnVerificationController::class);
    Route::post('/verify/phone', PhoneVerificationController::class);
    Route::get('/wallet/balance', WalletBalanceController::class);
    Route::get('/wallet/api-balance', KhadVerifyWalletBalanceController::class);
    Route::post('/wallet/reconcile-paystack', [WalletReconciliationController::class, 'member']);
    Route::post('/wallet/reconcile-paystack/reference', [WalletReconciliationController::class, 'memberReference']);
    Route::get('/wallet/virtual-accounts', [WalletVirtualAccountController::class, 'index']);
    Route::post('/wallet/virtual-accounts', [WalletVirtualAccountController::class, 'store']);
    Route::get('/portal/overview', [MemberPortalController::class, 'overview']);
    Route::get('/portal/transactions', [MemberPortalController::class, 'transactions']);
    Route::get('/portal/support-tickets', [SupportTicketController::class, 'memberIndex']);
    Route::post('/portal/support-tickets', [SupportTicketController::class, 'storeMember']);
    Route::get('/service-requests', [ServiceRequestController::class, 'index']);
    Route::post('/service-requests', [ServiceRequestController::class, 'store']);
    Route::post('/admin/services', [ServiceController::class, 'store']);
    Route::post('/admin/services/{service}', [ServiceController::class, 'update']);
    Route::delete('/admin/services/{service}', [ServiceController::class, 'destroy']);

    Route::get('/settings', [SettingsController::class, 'show']);
    Route::post('/settings', [SettingsController::class, 'update']);
    Route::put('/settings', [SettingsController::class, 'update']);

    Route::get('/members', [MemberController::class, 'index']);
    Route::post('/members', [MemberController::class, 'store']);
    Route::put('/members/{user}', [MemberController::class, 'update']);
    Route::delete('/members/{user}', [MemberController::class, 'destroy']);

    Route::get('/audit-logs', [AuditLogController::class, 'index']);
    Route::get('/admin/transactions', [AdminTransactionController::class, 'index']);
    Route::post('/admin/wallet/reconcile-paystack', [WalletReconciliationController::class, 'admin']);
    Route::post('/admin/wallet/reconcile-paystack/reference', [WalletReconciliationController::class, 'adminReference']);
    Route::get('/admin/verifications', [AdminVerificationController::class, 'index']);
    Route::get('/admin/service-requests', [AdminServiceRequestController::class, 'index']);
    Route::patch('/admin/service-requests/{serviceRequest}', [AdminServiceRequestController::class, 'update']);
    Route::get('/admin/support-tickets', [SupportTicketController::class, 'index']);
    Route::patch('/admin/support-tickets/{supportTicket}', [SupportTicketController::class, 'update']);
});

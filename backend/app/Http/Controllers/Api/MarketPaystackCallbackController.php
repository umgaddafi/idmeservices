<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Services\PaystackPaymentConfirmationService;
use App\Services\PaystackService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MarketPaystackCallbackController extends Controller
{
    public function __construct(
        private readonly PaystackService $paystack,
        private readonly PaystackPaymentConfirmationService $paymentConfirmation,
    ) {
    }

    public function __invoke(Request $request): RedirectResponse
    {
        $reference = trim((string) ($request->query('reference') ?: $request->query('trxref') ?: ''));
        $status = strtolower(trim((string) $request->query('status', 'success')));

        if ($reference === '' || ($status !== '' && ! in_array($status, ['success', 'successful'], true))) {
            return redirect()->away($this->fallbackRedirect($request));
        }

        $transaction = $this->paystack->verifyTransaction($reference);

        if (strtolower((string) data_get($transaction, 'status')) !== 'success') {
            return redirect()->away($this->fallbackRedirect($request));
        }

        $payment = Payment::query()->where('reference', $reference)->first();

        if (! $payment) {
            return redirect()->away($this->fallbackRedirect($request));
        }

        $orderId = $payment->order_id ?: (int) data_get($transaction, 'metadata.order_id', 0);
        $order = Order::query()->with('items')->find($orderId);

        if (! $order) {
            return redirect()->away($this->fallbackRedirect($request));
        }

        $user = $payment->user ?: $order->user ?: User::query()->find($payment->user_id ?: $order->user_id);

        if (! $user) {
            return redirect()->away($this->fallbackRedirect($request));
        }

        $payload = [
            'status' => true,
            'message' => 'Verification successful',
            'data' => $transaction,
        ];

        $payment->forceFill([
            'status' => 'Success',
            'gateway_response' => (string) data_get($transaction, 'gateway_response', ''),
            'paid_at' => data_get($transaction, 'paid_at') ? Carbon::parse((string) data_get($transaction, 'paid_at')) : now(),
            'raw_response' => $payload,
            'authorization_url' => $payment->authorization_url ?: (string) data_get($transaction, 'authorization.authorization_url', ''),
        ])->save();

        $order->forceFill([
            'status' => 'Paid',
        ])->save();

        $this->paymentConfirmation->sendForMarketPayment($user, $payment->fresh(), $order->fresh('items'));

        return redirect()->away($this->successRedirect($request, $order->order_number, $transaction));
    }

    private function successRedirect(Request $request, string $orderNumber, array $transaction): string
    {
        $base = (string) (
            $request->query('redirect')
            ?: data_get($transaction, 'metadata.referrer')
            ?: rtrim((string) config('app.frontend_url', config('app.url')), '/').'/orders/'.$orderNumber
        );

        $separator = str_contains($base, '?') ? '&' : '?';

        return $base.$separator.'payment=success&reference='.urlencode((string) data_get($transaction, 'reference', ''));
    }

    private function fallbackRedirect(Request $request): string
    {
        $base = (string) ($request->query('redirect') ?: rtrim((string) config('app.frontend_url', config('app.url')), '/').'/orders');
        $separator = str_contains($base, '?') ? '&' : '?';

        return $base.$separator.'payment=failed';
    }
}

<?php

namespace App\Services;

use App\Mail\WalletFundedMail;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\PaystackWebhookEvent;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class PaystackPaymentConfirmationService
{
    public function send(User $user, PaystackWebhookEvent $paymentEvent, array $eventPayload, ?float $walletBalance = null, ?Order $order = null): bool
    {
        if ($paymentEvent->email_sent_at) {
            return false;
        }

        $amount = (float) data_get($eventPayload, 'data.amount', $paymentEvent->amount);
        $amount = $amount > 9999 ? $amount / 100 : $amount;
        $order?->loadMissing('items');

        try {
            Mail::to($user->email)->send(new WalletFundedMail(
                user: $user,
                amount: $amount,
                reference: $paymentEvent->reference,
                walletBalance: $walletBalance ?? (float) $user->wallet_balance,
                details: $this->buildPaymentDetails($eventPayload, $user, $paymentEvent, $walletBalance, $order),
                items: $this->buildOrderItems($eventPayload, $order),
                totals: $this->buildTotals($eventPayload, $amount, $order),
                delivery: $this->buildDelivery($eventPayload, $user, $order),
                ctaUrl: $this->buildOrderUrl($order),
            ));

            $paymentEvent->forceFill([
                'email_sent_at' => now(),
            ])->save();

            return true;
        } catch (\Throwable $exception) {
            Log::error('Payment confirmation email failed.', [
                'user_id' => $user->id,
                'email' => $user->email,
                'reference' => $paymentEvent->reference,
                'error' => $exception->getMessage(),
            ]);

            return false;
        }
    }

    public function sendForMarketPayment(User $user, Payment $payment, Order $order): bool
    {
        if ($payment->confirmation_email_sent_at) {
            return false;
        }

        $order->loadMissing('items');
        $eventPayload = $this->extractPaymentPayload($payment);

        try {
            Mail::to($user->email)->send(new WalletFundedMail(
                user: $user,
                amount: (float) $payment->amount,
                reference: (string) $payment->reference,
                walletBalance: 0,
                details: $this->buildMarketPaymentDetails($eventPayload, $user, $payment, $order),
                items: $this->buildOrderItems($eventPayload, $order),
                totals: [
                    'itemsTotal' => (float) $order->items_total,
                    'shippingFee' => (float) $order->shipping_fee,
                    'totalPaid' => (float) $order->total_paid,
                ],
                delivery: [
                    'name' => $order->delivery_name,
                    'address' => $order->delivery_address,
                    'phone' => $order->delivery_phone,
                ],
                ctaUrl: $this->buildOrderUrl($order),
            ));

            $payment->forceFill([
                'confirmation_email_sent_at' => now(),
            ])->save();

            return true;
        } catch (\Throwable $exception) {
            Log::error('Market payment confirmation email failed.', [
                'user_id' => $user->id,
                'email' => $user->email,
                'reference' => $payment->reference,
                'error' => $exception->getMessage(),
            ]);

            return false;
        }
    }

    public function buildPaymentDetails(array $eventPayload, User $user, PaystackWebhookEvent $paymentEvent, ?float $walletBalance = null, ?Order $order = null): array
    {
        $customFields = data_get($eventPayload, 'data.metadata.custom_fields', []);
        $details = [
            'Order Number' => (string) (
                $order?->order_number
                ?: data_get($eventPayload, 'data.metadata.order_number')
                ?: data_get($eventPayload, 'data.metadata.order_id')
                ?: data_get($eventPayload, 'data.reference')
            ),
            'Payment Reference' => $paymentEvent->reference,
            'Order Status' => 'Paid',
            'Customer Name' => $user->name,
            'Customer Email' => $user->email,
            'Payment Channel' => (string) ($order?->payment_channel ?: data_get($eventPayload, 'data.channel', '')),
            'Gateway Response' => (string) ($order?->gateway_response ?: data_get($eventPayload, 'data.gateway_response', '')),
            'Paid At' => (string) ($order?->paid_at?->toIso8601String() ?: data_get($eventPayload, 'data.paid_at', '')),
            'Currency' => (string) data_get($eventPayload, 'data.currency', 'NGN'),
            'Description' => (string) (
                data_get($eventPayload, 'data.metadata.description')
                ?: data_get($eventPayload, 'data.metadata.note')
            ),
            'Wallet Balance' => $walletBalance !== null ? 'NGN '.number_format($walletBalance, 2) : '',
        ];

        if (is_array($customFields)) {
            foreach ($customFields as $field) {
                $label = trim((string) data_get($field, 'display_name', data_get($field, 'variable_name', '')));
                $value = data_get($field, 'value');

                if ($label !== '' && $value !== null && $value !== '') {
                    $details[$label] = is_scalar($value) ? (string) $value : json_encode($value);
                }
            }
        }

        return array_filter($details, static fn ($value) => $value !== null && $value !== '');
    }

    public function buildOrderItems(array $eventPayload, ?Order $order = null): array
    {
        if ($order && $order->items->isNotEmpty()) {
            return $order->items->map(fn (OrderItem $item): array => [
                'name' => $item->item_name,
                'quantity' => (float) $item->quantity,
                'unitPrice' => (float) $item->unit_price,
                'subtotal' => (float) $item->subtotal,
            ])->values()->all();
        }

        $sources = [
            data_get($eventPayload, 'data.metadata.items'),
            data_get($eventPayload, 'data.metadata.order_items'),
            data_get($eventPayload, 'data.metadata.cart_items'),
        ];

        foreach ($sources as $source) {
            if (! is_array($source) || $source === []) {
                continue;
            }

            $items = [];

            foreach ($source as $item) {
                if (! is_array($item)) {
                    continue;
                }

                $name = (string) (
                    data_get($item, 'name')
                    ?: data_get($item, 'title')
                    ?: data_get($item, 'item')
                    ?: 'Item'
                );
                $quantity = (float) data_get($item, 'quantity', 1);
                $unitPrice = (float) (
                    data_get($item, 'unit_price')
                    ?: data_get($item, 'price')
                    ?: 0
                );

                if ($unitPrice > 9999) {
                    $unitPrice /= 100;
                }

                $subtotal = (float) data_get($item, 'subtotal', $quantity * $unitPrice);

                if ($subtotal > 9999) {
                    $subtotal /= 100;
                }

                $items[] = [
                    'name' => $name,
                    'quantity' => $quantity,
                    'unitPrice' => $unitPrice,
                    'subtotal' => $subtotal,
                ];
            }

            if ($items !== []) {
                return $items;
            }
        }

        return [];
    }

    public function buildMarketPaymentDetails(array $eventPayload, User $user, Payment $payment, Order $order): array
    {
        return array_filter([
            'Order Number' => $order->order_number,
            'Payment Reference' => $payment->reference,
            'Order Status' => 'Paid',
            'Customer Name' => $user->name,
            'Customer Email' => $user->email,
            'Payment Channel' => (string) (data_get($eventPayload, 'data.channel', '') ?: $payment->provider),
            'Gateway Response' => (string) ($payment->gateway_response ?: data_get($eventPayload, 'data.gateway_response', '')),
            'Paid At' => (string) ($payment->paid_at?->toIso8601String() ?: data_get($eventPayload, 'data.paid_at', '')),
            'Currency' => (string) ($payment->currency ?: data_get($eventPayload, 'data.currency', 'NGN')),
            'Description' => 'Afro Village Market order payment',
        ], static fn ($value) => $value !== null && $value !== '');
    }

    public function buildTotals(array $eventPayload, float $amount, ?Order $order = null): array
    {
        $itemsTotal = $order?->items_total ?? array_sum(array_map(
            static fn (array $item): float => (float) ($item['subtotal'] ?? 0),
            $this->buildOrderItems($eventPayload, $order)
        ));
        $shippingFee = $order?->shipping_fee ?? (float) data_get($eventPayload, 'data.metadata.shipping_fee', 0);
        $totalPaid = $order?->total_paid ?? (float) data_get($eventPayload, 'data.metadata.total_paid', $amount);

        return [
            'itemsTotal' => (float) $itemsTotal,
            'shippingFee' => (float) $shippingFee,
            'totalPaid' => (float) $totalPaid,
        ];
    }

    public function buildDelivery(array $eventPayload, User $user, ?Order $order = null): array
    {
        return array_filter([
            'name' => $order?->delivery_name ?: data_get($eventPayload, 'data.metadata.delivery_name', $user->name),
            'address' => $order?->delivery_address ?: data_get($eventPayload, 'data.metadata.delivery_address', ''),
            'phone' => $order?->delivery_phone ?: data_get($eventPayload, 'data.metadata.delivery_phone', $user->phone),
        ], static fn ($value) => $value !== null && $value !== '');
    }

    public function buildOrderUrl(?Order $order = null): ?string
    {
        if (! $order) {
            return null;
        }

        return rtrim((string) config('app.frontend_url', config('app.url')), '/').'/orders/'.$order->order_number;
    }

    private function extractPaymentPayload(Payment $payment): array
    {
        $rawResponse = $payment->raw_response;

        if (is_array($rawResponse)) {
            return $rawResponse;
        }

        if (is_string($rawResponse) && $rawResponse !== '') {
            $decoded = json_decode($rawResponse, true);

            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return [];
    }
}

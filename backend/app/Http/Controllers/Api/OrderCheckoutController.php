<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Services\PaystackService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class OrderCheckoutController extends Controller
{
    public function __construct(private readonly PaystackService $paystack)
    {
    }

    public function initialize(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.name' => ['required', 'string', 'max:255'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'items.*.unitPrice' => ['required', 'numeric', 'min:0'],
            'shippingFee' => ['nullable', 'numeric', 'min:0'],
            'deliveryName' => ['required', 'string', 'max:255'],
            'deliveryPhone' => ['nullable', 'string', 'max:30'],
            'deliveryAddress' => ['required', 'string', 'max:2000'],
            'callbackUrl' => ['nullable', 'url', 'max:2000'],
        ]);

        $user = $request->user();
        $items = array_map(function (array $item): array {
            $quantity = (float) $item['quantity'];
            $unitPrice = (float) $item['unitPrice'];

            return [
                'name' => $item['name'],
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'subtotal' => round($quantity * $unitPrice, 2),
            ];
        }, $data['items']);

        $itemsTotal = round(array_sum(array_column($items, 'subtotal')), 2);
        $shippingFee = round((float) ($data['shippingFee'] ?? 0), 2);
        $totalPaid = round($itemsTotal + $shippingFee, 2);
        $orderNumber = $this->nextOrderNumber();
        $reference = $this->nextPaymentReference();
        $frontendRedirect = $data['callbackUrl'] ?? rtrim((string) config('app.frontend_url', config('app.url')), '/').'/dashboard';
        $callbackUrl = rtrim((string) config('app.url'), '/').'/api/paystack/callback?redirect='.urlencode($frontendRedirect);

        $metadata = [
            'order_number' => $orderNumber,
            'description' => 'Afro Village Market order payment',
            'items' => array_map(fn (array $item): array => [
                'name' => $item['name'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'subtotal' => $item['subtotal'],
            ], $items),
            'shipping_fee' => $shippingFee,
            'delivery_name' => $data['deliveryName'],
            'delivery_phone' => $data['deliveryPhone'] ?? '',
            'delivery_address' => $data['deliveryAddress'],
            'total_paid' => $totalPaid,
        ];

        $paystackTransaction = $this->paystack->initializeTransaction([
            'email' => $user->email,
            'amount' => (int) round($totalPaid * 100),
            'reference' => $reference,
            'callback_url' => $callbackUrl,
            'metadata' => $metadata,
        ]);

        $order = DB::transaction(function () use ($data, $items, $itemsTotal, $shippingFee, $totalPaid, $orderNumber, $reference, $paystackTransaction, $user, $metadata): Order {
            $order = Order::query()->create([
                'user_id' => $user->id,
                'order_number' => $orderNumber,
                'payment_reference' => $reference,
                'status' => 'PENDING_PAYMENT',
                'currency' => 'NGN',
                'items_total' => $itemsTotal,
                'shipping_fee' => $shippingFee,
                'total_paid' => $totalPaid,
                'delivery_name' => $data['deliveryName'],
                'delivery_phone' => $data['deliveryPhone'] ?? null,
                'delivery_address' => $data['deliveryAddress'],
                'paystack_access_code' => (string) data_get($paystackTransaction, 'access_code', ''),
                'paystack_authorization_url' => (string) data_get($paystackTransaction, 'authorization_url', ''),
                'metadata' => $metadata,
            ]);

            foreach ($items as $item) {
                OrderItem::query()->create([
                    'order_id' => $order->id,
                    'item_name' => $item['name'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['subtotal'],
                ]);
            }

            if (Schema::hasTable('payments')) {
                Payment::query()->create([
                    'order_id' => $order->id,
                    'user_id' => $user->id,
                    'provider' => 'paystack',
                    'reference' => $reference,
                    'authorization_url' => (string) data_get($paystackTransaction, 'authorization_url', ''),
                    'amount' => $totalPaid,
                    'currency' => 'NGN',
                    'status' => 'Initialized',
                    'raw_response' => [
                        'status' => true,
                        'message' => 'Checkout initialized',
                        'data' => [
                            'reference' => $reference,
                            'metadata' => [
                                'order_id' => (string) $order->id,
                                'order_number' => $order->order_number,
                                'referrer' => $frontendRedirect,
                            ],
                        ],
                    ],
                ]);
            }

            return $order->load('items');
        });

        return response()->json([
            'status' => true,
            'message' => 'Checkout initialized successfully.',
            'order' => $this->transformOrder($order),
            'payment' => [
                'reference' => $reference,
                'authorizationUrl' => (string) data_get($paystackTransaction, 'authorization_url', ''),
                'accessCode' => (string) data_get($paystackTransaction, 'access_code', ''),
            ],
        ], 201);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        abort_unless($order->user_id === $request->user()->id, 403, 'Forbidden.');

        return response()->json([
            'order' => $this->transformOrder($order->load('items')),
        ]);
    }

    private function transformOrder(Order $order): array
    {
        return [
            'id' => (string) $order->id,
            'orderNumber' => $order->order_number,
            'paymentReference' => $order->payment_reference,
            'status' => $order->status,
            'currency' => $order->currency,
            'itemsTotal' => (float) $order->items_total,
            'shippingFee' => (float) $order->shipping_fee,
            'totalPaid' => (float) $order->total_paid,
            'deliveryName' => $order->delivery_name,
            'deliveryPhone' => $order->delivery_phone,
            'deliveryAddress' => $order->delivery_address,
            'paidAt' => optional($order->paid_at)->toIso8601String(),
            'items' => $order->items->map(fn (OrderItem $item): array => [
                'name' => $item->item_name,
                'quantity' => (float) $item->quantity,
                'unitPrice' => (float) $item->unit_price,
                'subtotal' => (float) $item->subtotal,
            ])->values()->all(),
        ];
    }

    private function nextOrderNumber(): string
    {
        return 'AFV-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
    }

    private function nextPaymentReference(): string
    {
        return 'AFVPAY-'.Str::upper(Str::random(14));
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'order_number',
        'payment_reference',
        'status',
        'currency',
        'items_total',
        'subtotal',
        'shipping_fee',
        'total_paid',
        'total',
        'delivery_name',
        'delivery_phone',
        'delivery_address',
        'shipping_name',
        'shipping_phone',
        'shipping_address',
        'shipping_city',
        'shipping_state',
        'shipping_country',
        'paystack_access_code',
        'paystack_authorization_url',
        'payment_channel',
        'gateway_response',
        'paid_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'items_total' => 'float',
            'subtotal' => 'float',
            'shipping_fee' => 'float',
            'total_paid' => 'float',
            'total' => 'float',
            'paid_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function getRouteKeyName(): string
    {
        return 'order_number';
    }

    public function getItemsTotalAttribute($value): float
    {
        return (float) ($value ?? $this->attributes['subtotal'] ?? 0);
    }

    public function getTotalPaidAttribute($value): float
    {
        return (float) ($value ?? $this->attributes['total'] ?? 0);
    }

    public function getDeliveryNameAttribute($value): string
    {
        return (string) ($value ?? $this->attributes['shipping_name'] ?? '');
    }

    public function getDeliveryPhoneAttribute($value): string
    {
        return (string) ($value ?? $this->attributes['shipping_phone'] ?? '');
    }

    public function getDeliveryAddressAttribute($value): string
    {
        if ($value) {
            return (string) $value;
        }

        return trim(implode(', ', array_filter([
            $this->attributes['shipping_address'] ?? '',
            $this->attributes['shipping_city'] ?? '',
            $this->attributes['shipping_state'] ?? '',
            $this->attributes['shipping_country'] ?? '',
        ])));
    }
}

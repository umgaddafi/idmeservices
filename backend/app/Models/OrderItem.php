<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'item_name',
        'product_name',
        'product_id',
        'quantity',
        'unit_price',
        'subtotal',
        'line_total',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'float',
            'unit_price' => 'float',
            'subtotal' => 'float',
            'line_total' => 'float',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function getItemNameAttribute($value): string
    {
        return (string) ($value ?? $this->attributes['product_name'] ?? '');
    }

    public function getSubtotalAttribute($value): float
    {
        return (float) ($value ?? $this->attributes['line_total'] ?? 0);
    }
}

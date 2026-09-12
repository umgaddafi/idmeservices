<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'category',
        'type',
        'route_path',
        'description',
        'amount',
        'status',
        'image_path',
        'sort_order',
        'show_on_homepage',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'float',
            'sort_order' => 'integer',
            'show_on_homepage' => 'boolean',
        ];
    }
}

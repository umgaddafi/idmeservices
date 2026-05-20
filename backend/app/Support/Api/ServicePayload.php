<?php

namespace App\Support\Api;

use App\Models\Service;

class ServicePayload
{
    public static function from(Service $service): array
    {
        return [
            'id' => (string) $service->id,
            'title' => $service->title,
            'slug' => $service->slug,
            'category' => $service->category,
            'type' => $service->type,
            'routePath' => $service->route_path,
            'description' => $service->description,
            'amount' => (float) $service->amount,
            'price' => 'N'.number_format((float) $service->amount, 2),
            'status' => $service->status,
            'imageUrl' => UrlPayload::upload($service->image_path),
            'sortOrder' => (int) $service->sort_order,
            'showOnHomepage' => (bool) $service->show_on_homepage,
        ];
    }
}

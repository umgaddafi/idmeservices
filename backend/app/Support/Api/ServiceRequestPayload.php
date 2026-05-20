<?php

namespace App\Support\Api;

use App\Models\ServiceRequest;

class ServiceRequestPayload
{
    public static function from(ServiceRequest $serviceRequest): array
    {
        $details = (array) ($serviceRequest->details ?? []);

        return [
            'id' => (string) $serviceRequest->id,
            'category' => $serviceRequest->category,
            'type' => $serviceRequest->type,
            'customer' => $serviceRequest->user?->name,
            'email' => $serviceRequest->email ?: $serviceRequest->user?->email,
            'reference' => $serviceRequest->reference,
            'identifier' => $serviceRequest->identifier,
            'amount' => (float) $serviceRequest->amount,
            'status' => $serviceRequest->status,
            'submittedAt' => optional($serviceRequest->submitted_at ?? $serviceRequest->created_at)->toIso8601String(),
            'completedAt' => optional($serviceRequest->completed_at)->toIso8601String(),
            'pictureUrl' => UrlPayload::upload($serviceRequest->picture_path),
            'passportUrl' => UrlPayload::upload($serviceRequest->picture_path),
            'details' => $details,
            'detailRows' => self::detailRows($details),
        ];
    }

    /**
     * @param  array<string, mixed>  $details
     * @return array<int, array{label: string, value: string}>
     */
    private static function detailRows(array $details): array
    {
        $rows = [];

        foreach ($details as $key => $value) {
            if ($value === null || $value === '') {
                continue;
            }

            $rows[] = [
                'label' => self::labelize($key),
                'value' => is_scalar($value) ? (string) $value : json_encode($value),
            ];
        }

        return $rows;
    }

    private static function labelize(string $key): string
    {
        return strtoupper((string) preg_replace('/\s+/', ' ', trim((string) preg_replace('/([a-z])([A-Z])/', '$1 $2', $key))));
    }
}

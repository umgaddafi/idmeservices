<?php

namespace App\Support;

use App\Models\SystemSetting;

class PricingCatalog
{
    /**
     * @return array<string, array<int, array<string, mixed>>>
     */
    public static function defaults(): array
    {
        $prices = config('idmeservices.pricing', []);

        return [
            'nin' => [
                ['id' => 'premium', 'title' => 'Premium Template', 'amount' => (float) ($prices['nin_premium'] ?? 150), 'status' => 'Live'],
                ['id' => 'regular', 'title' => 'Regular Template', 'amount' => (float) ($prices['nin_regular'] ?? 150), 'status' => 'Ready'],
            ],
            'phone' => [
                ['id' => 'premium-phone', 'title' => 'Premium', 'amount' => (float) ($prices['phone_premium'] ?? 200), 'status' => 'Live'],
                ['id' => 'regular-phone', 'title' => 'Regular', 'amount' => (float) ($prices['phone_regular'] ?? 200), 'status' => 'Ready'],
                ['id' => 'standard-phone', 'title' => 'Standard', 'amount' => (float) ($prices['phone_standard'] ?? 200), 'status' => 'Ready'],
            ],
            'bvn' => [
                ['id' => 'premium-bvn', 'title' => 'Premium', 'amount' => (float) ($prices['bvn_premium'] ?? 170), 'status' => 'Live'],
                ['id' => 'regular-bvn', 'title' => 'Regular', 'amount' => (float) ($prices['bvn_regular'] ?? 170), 'status' => 'Ready'],
            ],
            'modification' => [
                ['id' => 'dob-modification', 'title' => 'DOB Modification', 'amount' => (float) ($prices['modification_dob'] ?? 43000), 'status' => 'Live'],
                ['id' => 'phone-modification', 'title' => 'Phone Number Modification', 'amount' => (float) ($prices['modification_phone'] ?? 8000), 'status' => 'Live'],
                ['id' => 'address-modification', 'title' => 'Address Modification', 'amount' => (float) ($prices['modification_address'] ?? 8000), 'status' => 'Live'],
                ['id' => 'name-modification', 'title' => 'Name Modification', 'amount' => (float) ($prices['modification_name'] ?? 8000), 'status' => 'Live'],
            ],
            'birthAttestation' => [
                ['id' => 'permanent-attestation', 'title' => 'Permanent Birth Attestation', 'amount' => (float) ($prices['birth_attestation_permanent'] ?? 1500), 'status' => 'Live'],
                ['id' => 'temporary-attestation', 'title' => 'Temporary Birth Attestation', 'amount' => (float) ($prices['birth_attestation_temporary'] ?? 1000), 'status' => 'Live'],
            ],
            'diaspora' => [
                ['id' => 'diaspora-child-birth', 'title' => 'Diaspora Child Birth Notification', 'amount' => (float) ($prices['diaspora_child_birth'] ?? 2000), 'status' => 'Live'],
            ],
            'resolutions' => [
                ['id' => 'ipe-error-50', 'title' => 'IPE / Error 50 / Resolution', 'amount' => (float) ($prices['ipe_error_50'] ?? 1000), 'status' => 'Live'],
            ],
            'others' => [
                ['id' => 'express-other', 'title' => 'Express Verification', 'amount' => (float) ($prices['other_express'] ?? 250), 'status' => 'Ready'],
                ['id' => 'default-other', 'title' => 'Default Verification', 'amount' => (float) ($prices['other_default'] ?? 180), 'status' => 'Ready'],
            ],
        ];
    }

    /**
     * @return array<string, array<int, array<string, mixed>>>
     */
    public static function fromSettings(?SystemSetting $settings): array
    {
        if (config('idmeservices.pricing_source', 'env') === 'env') {
            return self::defaults();
        }

        return self::normalize($settings?->template_pricing);
    }

    /**
     * @param  mixed  $pricing
     * @return array<string, array<int, array<string, mixed>>>
     */
    public static function normalize(mixed $pricing): array
    {
        $defaults = self::defaults();
        $normalized = $defaults;

        if (! is_array($pricing)) {
            return $normalized;
        }

        foreach ($defaults as $group => $items) {
            $incomingItems = is_array($pricing[$group] ?? null) ? $pricing[$group] : [];
            $incomingById = [];

            foreach ($incomingItems as $item) {
                if (! is_array($item) || empty($item['id'])) {
                    continue;
                }

                $incomingById[(string) $item['id']] = $item;
            }

            $normalized[$group] = array_map(static function (array $defaultItem) use ($incomingById): array {
                $incoming = $incomingById[$defaultItem['id']] ?? [];
                $amount = isset($incoming['amount']) ? max(0, (float) $incoming['amount']) : (float) $defaultItem['amount'];

                return [
                    'id' => $defaultItem['id'],
                    'title' => (string) ($incoming['title'] ?? $defaultItem['title']),
                    'amount' => $amount,
                    'status' => (string) ($incoming['status'] ?? $defaultItem['status']),
                ];
            }, $items);
        }

        return $normalized;
    }

    public static function amount(?SystemSetting $settings, string $group, string $id, float $fallback = 0): float
    {
        $pricing = self::fromSettings($settings);

        foreach (($pricing[$group] ?? []) as $item) {
            if (($item['id'] ?? null) === $id) {
                return (float) ($item['amount'] ?? $fallback);
            }
        }

        return $fallback;
    }
}

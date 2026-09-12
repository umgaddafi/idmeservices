<?php

namespace App\Support\Api;

class UrlPayload
{
    public static function upload(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        $normalizedPath = self::normalizeUploadPath($path);

        return $normalizedPath ? url($normalizedPath) : $path;
    }

    public static function branding(array $branding): array
    {
        foreach (['logoUrl', 'faviconUrl', 'homepageWallpaperUrl'] as $key) {
            if (array_key_exists($key, $branding)) {
                $branding[$key] = self::upload($branding[$key]);
            }
        }

        return $branding;
    }

    private static function normalizeUploadPath(string $path): ?string
    {
        $parsedPath = parse_url($path, PHP_URL_PATH);
        $candidate = $parsedPath ?: $path;
        $position = strpos($candidate, '/uploads/');

        if ($position === false) {
            return str_starts_with($candidate, '/uploads/') ? $candidate : null;
        }

        return substr($candidate, $position);
    }
}

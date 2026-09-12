<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Polyfill for mb_split if host PHP installation lacks oniguruma/mbstring regex support
if (!function_exists('mb_split')) {
    function mb_split(string $pattern, string $string, int $limit = -1): array|false {
        $clean = str_replace(['\\s+', '[-_\\s]+'], ['\s+', '[-_\s]+'], $pattern);
        $regex = '/' . str_replace('/', '\/', $clean) . '/u';
        $res = @preg_split($regex, $string, $limit);
        if ($res === false) {
            $regex = '/' . str_replace('/', '\/', $clean) . '/';
            $res = preg_split($regex, $string, $limit);
        }
        return $res;
    }
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());

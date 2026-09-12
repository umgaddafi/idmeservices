<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

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

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(\Illuminate\Http\Middleware\HandleCors::class);
        $middleware->alias([
            'api.token' => \App\Http\Middleware\ApiTokenAuth::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();

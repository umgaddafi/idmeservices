<?php

$frontendEntry = __DIR__ . '/app/index.html';

if (! is_file($frontendEntry)) {
    http_response_code(503);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Frontend build not found in /app. Build the frontend before deploying.";
    exit;
}

header('Content-Type: text/html; charset=utf-8');
readfile($frontendEntry);

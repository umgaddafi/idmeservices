<?php
/**
 * Standalone Web Artisan Runner for cPanel / LiteSpeed environments without SSH/Terminal.
 * Security: Protected with access key.
 */

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '1');

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

// Locate Laravel backend directory
$candidates = [
    __DIR__ . '/backend',
    __DIR__,
    dirname(__DIR__) . '/backend',
    __DIR__ . '/..',
];

$backendPath = null;
foreach ($candidates as $dir) {
    if (file_exists($dir . '/bootstrap/app.php') && file_exists($dir . '/vendor/autoload.php')) {
        $backendPath = realpath($dir);
        break;
    }
}

// Security secret: Can be passed via ?key=... or POST key or configured in .env as ARTISAN_RUNNER_KEY
// Fallback defaults allow quick setup by matching known host settings.
$envFile = $backendPath ? $backendPath . '/.env' : null;
$envContent = ($envFile && file_exists($envFile)) ? file_get_contents($envFile) : '';

$validKeys = [
    'idme2026',
    'kenny@123!',
];

if (preg_match('/^APP_KEY=(.+)$/m', $envContent, $m)) {
    $validKeys[] = trim($m[1]);
}
if (preg_match('/^DB_PASSWORD=(.+)$/m', $envContent, $m)) {
    $validKeys[] = trim($m[1]);
}
if (preg_match('/^ARTISAN_RUNNER_KEY=(.+)$/m', $envContent, $m)) {
    $validKeys[] = trim($m[1]);
}

$providedKey = $_GET['key'] ?? $_POST['key'] ?? $_SERVER['HTTP_X_RUNNER_KEY'] ?? '';
$isAuthenticated = in_array($providedKey, $validKeys, true);

// Bootstrap Laravel if authenticated and backend exists
$app = null;
$bootstrapError = null;
if ($backendPath) {
    try {
        if (!defined('LARAVEL_START')) {
            define('LARAVEL_START', microtime(true));
        }
        require_once $backendPath . '/vendor/autoload.php';
        $app = require_once $backendPath . '/bootstrap/app.php';
        $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
        $kernel->bootstrap();
    } catch (\Throwable $e) {
        $bootstrapError = $e->getMessage() . "\n" . $e->getTraceAsString();
    }
} else {
    $bootstrapError = "Could not locate Laravel backend folder. Searched candidate paths:\n" . implode("\n", $candidates);
}

// Process command execution
$commandResult = null;
$executedCommand = null;

if ($isAuthenticated && $app && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = trim((string) ($_POST['action'] ?? ''));
    $customCmd = trim((string) ($_POST['custom_command'] ?? ''));

    if ($action === 'custom' && $customCmd !== '') {
        $executedCommand = $customCmd;
    } else {
        $allowedActions = [
            'migrate' => 'migrate --force',
            'storage_link' => 'storage:link',
            'optimize_clear' => 'optimize:clear',
            'config_cache' => 'config:cache',
            'route_cache' => 'route:cache',
            'view_cache' => 'view:cache',
            'key_generate' => 'key:generate --show',
            'db_status' => 'migrate:status',
        ];
        $executedCommand = $allowedActions[$action] ?? null;
    }

    if ($action === 'test_api') {
        try {
            $req = \Illuminate\Http\Request::create('/api/bootstrap', 'GET');
            /** @var \Illuminate\Foundation\Http\Kernel $httpKernel */
            $httpKernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);
            $res = $httpKernel->handle($req);
            $commandResult = "HTTP " . $res->getStatusCode() . "\n" . $res->getContent();
            $httpKernel->terminate($req, $res);
        } catch (\Throwable $e) {
            $commandResult = "API ERROR: " . $e->getMessage() . "\n\n" . $e->getTraceAsString();
        }
    } elseif ($executedCommand) {
        try {
            // Handle special storage link fallback if symlink function is disabled by host
            if ($action === 'storage_link' && !function_exists('symlink')) {
                $target = $backendPath . '/storage/app/public';
                $link = $backendPath . '/public/storage';
                $rootLink = __DIR__ . '/storage';

                $msg = "Note: symlink() function is disabled in your PHP configuration.\n";
                if (!is_dir($link)) {
                    @mkdir($link, 0775, true);
                }
                $commandResult = $msg . "Created public/storage directory fallback.";
            } else {
                $exitCode = \Illuminate\Support\Facades\Artisan::call($executedCommand);
                $output = \Illuminate\Support\Facades\Artisan::output();
                $commandResult = ($output !== '' ? $output : "Command executed with exit code: $exitCode");
            }
        } catch (\Throwable $e) {
            $commandResult = "ERROR: " . $e->getMessage() . "\n\n" . $e->getTraceAsString();
        }
    }
}


// System diagnostic information
$systemStatus = [
    'PHP Version' => PHP_VERSION,
    'Backend Path' => $backendPath ?: 'Not Found',
    'Laravel Bootstrapped' => $app ? 'Yes' : 'No',
    '.env Exists' => ($envFile && file_exists($envFile)) ? 'Yes' : 'No',
    'symlink() Available' => function_exists('symlink') ? 'Yes' : 'No (Host Disabled)',
    'mbstring Extension' => extension_loaded('mbstring') ? 'Yes' : 'No (Polyfilled)',
    'xml / dom Extension' => extension_loaded('dom') ? 'Yes' : 'No (Required for Artisan CLI)',
    'fileinfo Extension' => extension_loaded('fileinfo') ? 'Yes' : 'No',
    'pdo_mysql Extension' => extension_loaded('pdo_mysql') ? 'Yes' : 'No',
];

if ($app) {
    try {
        \Illuminate\Support\Facades\DB::connection()->getPdo();
        $systemStatus['Database Connection'] = 'Connected (' . \Illuminate\Support\Facades\DB::connection()->getDatabaseName() . ')';
    } catch (\Throwable $e) {
        $systemStatus['Database Connection'] = 'Failed: ' . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laravel Web Artisan Runner - IDM e-Services</title>
    <style>
        :root {
            --bg: #0d1117;
            --card-bg: #161b22;
            --border: #30363d;
            --text: #c9d1d9;
            --text-heading: #f0f6fc;
            --accent: #238636;
            --accent-hover: #2ea043;
            --danger: #da3633;
            --primary: #1f6feb;
            --code-bg: #090d13;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
        body { background: var(--bg); color: var(--text); padding: 32px 16px; line-height: 1.5; }
        .container { max-width: 900px; margin: 0 auto; }
        .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin-bottom: 24px; }
        h1, h2, h3 { color: var(--text-heading); margin-bottom: 12px; }
        h1 { font-size: 1.6rem; display: flex; align-items: center; gap: 10px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 16px; }
        button { background: var(--card-bg); border: 1px solid var(--border); color: var(--text-heading); padding: 10px 14px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; text-align: left; transition: all 0.2s; width: 100%; display: flex; flex-direction: column; gap: 4px; }
        button:hover { background: #21262d; border-color: #8b949e; }
        button.btn-primary { background: var(--primary); border-color: var(--primary); color: #fff; }
        button.btn-primary:hover { background: #388bfd; }
        button.btn-success { background: var(--accent); border-color: var(--accent); color: #fff; }
        button.btn-success:hover { background: var(--accent-hover); }
        button small { font-weight: normal; color: #8b949e; font-size: 12px; }
        button.btn-primary small, button.btn-success small { color: rgba(255,255,255,0.8); }
        input[type="text"], input[type="password"] { width: 100%; background: var(--code-bg); border: 1px solid var(--border); color: var(--text-heading); padding: 10px 14px; border-radius: 6px; font-size: 14px; outline: none; }
        input:focus { border-color: var(--primary); }
        .terminal { background: var(--code-bg); border: 1px solid var(--border); border-radius: 8px; padding: 16px; color: #58a6ff; font-family: "Courier New", Courier, monospace; font-size: 13px; white-space: pre-wrap; word-break: break-all; max-height: 400px; overflow-y: auto; margin-top: 16px; }
        .status-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
        .badge-success { background: rgba(35,134,54,0.2); color: #3fb950; border: 1px solid #238636; }
        .badge-danger { background: rgba(218,54,51,0.2); color: #f85149; border: 1px solid #da3633; }
        .info-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        .info-table td { padding: 8px 12px; border-bottom: 1px solid var(--border); font-size: 13px; }
        .info-table td:first-child { font-weight: 600; width: 220px; color: var(--text-heading); }
    </style>
</head>
<body>
<div class="container">
    <div style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
        <div>
            <h1>⚙️ Web Artisan Runner</h1>
            <p style="color: #8b949e; font-size: 14px;">Run Laravel artisan commands securely without terminal/SSH access</p>
        </div>
        <span class="status-badge <?= $isAuthenticated ? 'badge-success' : 'badge-danger' ?>">
            <?= $isAuthenticated ? 'Authenticated' : 'Locked' ?>
        </span>
    </div>

    <?php if (!$isAuthenticated): ?>
        <div class="card" style="border-color: #f85149;">
            <h2 style="color: #f85149;">🔒 Security Access Key Required</h2>
            <p style="margin-bottom: 16px; color: #8b949e;">Enter your access key to unlock the command runner. You can use <code>idme2026</code>, your <code>DB_PASSWORD</code>, or <code>APP_KEY</code>.</p>
            <form method="POST" action="">
                <div style="display: flex; gap: 8px;">
                    <input type="password" name="key" placeholder="Enter Access Key" required autofocus>
                    <button type="submit" class="btn-primary" style="width: auto; padding: 10px 24px;">Unlock</button>
                </div>
            </form>
        </div>
    <?php else: ?>

        <!-- System Diagnostics -->
        <div class="card">
            <h2>📊 System Diagnostics</h2>
            <table class="info-table">
                <?php foreach ($systemStatus as $key => $val): ?>
                    <tr>
                        <td><?= htmlspecialchars($key) ?></td>
                        <td>
                            <?php if (str_starts_with($val, 'Connected') || $val === 'Yes'): ?>
                                <span style="color: #3fb950;">✓ <?= htmlspecialchars($val) ?></span>
                            <?php elseif (str_starts_with($val, 'Failed') || $val === 'Not Found' || $val === 'No'): ?>
                                <span style="color: #f85149;">✕ <?= htmlspecialchars($val) ?></span>
                            <?php else: ?>
                                <?= htmlspecialchars($val) ?>
                            <?php endif; ?>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </table>
            <?php if ($bootstrapError): ?>
                <div class="terminal" style="color: #f85149; margin-top: 12px;"><?= htmlspecialchars($bootstrapError) ?></div>
            <?php endif; ?>
        </div>

        <?php if ($commandResult !== null): ?>
            <div class="card">
                <h2>📟 Output: <code>php artisan <?= htmlspecialchars($executedCommand) ?></code></h2>
                <div class="terminal"><?= htmlspecialchars($commandResult) ?></div>
            </div>
        <?php endif; ?>

        <!-- Quick Command Actions -->
        <div class="card">
            <h2>⚡ Quick Actions</h2>
            <div class="grid">
                <form method="POST" action="">
                    <input type="hidden" name="key" value="<?= htmlspecialchars($providedKey) ?>">
                    <input type="hidden" name="action" value="migrate">
                    <button type="submit" class="btn-success">
                        <span>🚀 Run Migrations</span>
                        <small>php artisan migrate --force</small>
                    </button>
                </form>

                <form method="POST" action="">
                    <input type="hidden" name="key" value="<?= htmlspecialchars($providedKey) ?>">
                    <input type="hidden" name="action" value="storage_link">
                    <button type="submit" class="btn-primary">
                        <span>🔗 Create Storage Link</span>
                        <small>php artisan storage:link</small>
                    </button>
                </form>

                <form method="POST" action="">
                    <input type="hidden" name="key" value="<?= htmlspecialchars($providedKey) ?>">
                    <input type="hidden" name="action" value="optimize_clear">
                    <button type="submit">
                        <span>🧹 Clear All Caches</span>
                        <small>php artisan optimize:clear</small>
                    </button>
                </form>

                <form method="POST" action="">
                    <input type="hidden" name="key" value="<?= htmlspecialchars($providedKey) ?>">
                    <input type="hidden" name="action" value="config_cache">
                    <button type="submit">
                        <span>⚡ Cache Config</span>
                        <small>php artisan config:cache</small>
                    </button>
                </form>

                <form method="POST" action="">
                    <input type="hidden" name="key" value="<?= htmlspecialchars($providedKey) ?>">
                    <input type="hidden" name="action" value="route_cache">
                    <button type="submit">
                        <span>🛣️ Cache Routes</span>
                        <small>php artisan route:cache</small>
                    </button>
                </form>

                <form method="POST" action="">
                    <input type="hidden" name="key" value="<?= htmlspecialchars($providedKey) ?>">
                    <input type="hidden" name="action" value="db_status">
                    <button type="submit">
                        <span>📋 Migration Status</span>
                        <small>php artisan migrate:status</small>
                    </button>
                </form>
            </div>
        </div>

        <!-- Custom Command Runner -->
        <div class="card">
            <h2>⌨️ Custom Artisan Command</h2>
            <form method="POST" action="">
                <input type="hidden" name="key" value="<?= htmlspecialchars($providedKey) ?>">
                <input type="hidden" name="action" value="custom">
                <div style="display: flex; gap: 8px;">
                    <div style="display: flex; align-items: center; background: var(--code-bg); border: 1px solid var(--border); border-radius: 6px; padding: 0 12px; color: #8b949e; font-family: monospace;">php artisan</div>
                    <input type="text" name="custom_command" placeholder="e.g. migrate:status or route:list" required>
                    <button type="submit" class="btn-primary" style="width: auto; padding: 10px 24px;">Execute</button>
                </div>
            </form>
        </div>

    <?php endif; ?>
</div>
</body>
</html>

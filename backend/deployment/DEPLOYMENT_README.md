# Bluehost Test Deployment

This repository is arranged for a shared-host deployment with this root layout:

- `backend/`
- `frontend/`
- `app/`
- `index.php`
- `.htaccess`

## 1. Web Root

Point the Bluehost domain or subdomain document root to the repository root that contains:

- `app/`
- `backend/`
- `index.php`
- `.htaccess`

Do not point the domain directly to `backend/public`.

## 2. Backend Environment

Create or update `backend/.env` on the server with the real production or test values.

Important values:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://www.idmeservices.com.ng`
- `FRONTEND_URL=https://www.idmeservices.com.ng`
- Bluehost MySQL credentials
- Paystack and KhadVerify keys

If you are testing on a temporary Bluehost URL first, replace both `APP_URL` and `FRONTEND_URL` with that temporary HTTPS URL for the test.

## 3. Required Artisan Commands

Run these inside `backend/` on the server:

```bash
php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan config:clear
php artisan cache:clear
```

Only run `php artisan key:generate` if `APP_KEY` is empty or invalid.

## 4. Frontend Build

Build the frontend from `frontend/`:

```bash
npm install
npm run build
```

The Vite build outputs directly into `/app`.

## 5. Common 500 Error Causes

If `/api/bootstrap`, `/api/services`, or `/api/auth/login` return `500` on Bluehost, check these first:

1. `backend/.env` contains malformed URLs such as `https:https://...`
2. `APP_KEY` is empty
3. MySQL credentials are wrong
4. Required database tables have not been migrated
5. `backend/storage` and `backend/bootstrap/cache` are not writable
6. PHP version or extensions on the server do not satisfy Laravel requirements

## 6. Log File

Primary Laravel error log:

- `backend/storage/logs/laravel.log`

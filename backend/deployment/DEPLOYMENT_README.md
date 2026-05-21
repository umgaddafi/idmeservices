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

This repo includes `backend/.env.host` as a Bluehost template. After Git updates the server, copy or rename it:

```bash
cd backend
cp .env.host .env
```

Then edit `backend/.env` on Bluehost and replace every `REPLACE_WITH_...` value with the real server value. Do not use `backend/.env.host` directly without filling the placeholders.

Important values:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://kump.jostumservices.com` during Bluehost testing
- `FRONTEND_URL=https://kump.jostumservices.com` during Bluehost testing
- `DB_HOST=localhost`
- Bluehost MySQL credentials
- Paystack and KhadVerify keys

For Bluehost/cPanel MySQL, the database and database user are different things:

- `DB_DATABASE` must be the database, for example `wdlgdgmy_ninverify`
- `DB_USERNAME` must be a cPanel MySQL user, for example `wdlgdgmy_someuser`
- That user must be added to `wdlgdgmy_ninverify` with `ALL PRIVILEGES` in cPanel's MySQL Databases screen
- If Laravel logs `SQLSTATE[HY000] [1045] Access denied`, the configured `DB_USERNAME`/`DB_PASSWORD` is wrong, or the user has not been assigned to the database

If you are testing on a temporary Bluehost URL first, replace both `APP_URL` and `FRONTEND_URL` with that temporary HTTPS URL for the test.

## 3. Required Artisan Commands

Run these inside `backend/` on the server:

```bash
php artisan key:generate
php artisan config:clear
php artisan cache:clear
php artisan migrate --force
php artisan storage:link
```

Only run `php artisan key:generate` if `APP_KEY` is empty or invalid.

If you are using `backend/.env.host`, `APP_KEY` starts empty, so run `php artisan key:generate --force` after renaming it to `.env`.

After changing `backend/.env`, always clear cached configuration:

```bash
php artisan optimize:clear
```

Then verify the database credentials from the server:

```bash
php artisan migrate:status
```

If that command reports an access denied error, fix the cPanel MySQL user/password or assign the user to the database before testing the website again.

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
4. `DB_HOST` should be `localhost` on Bluehost instead of `127.0.0.1`
5. Required database tables have not been migrated
6. `backend/storage` and `backend/bootstrap/cache` are not writable
7. PHP version or extensions on the server do not satisfy Laravel requirements

## 6. Log File

Primary Laravel error log:

- `backend/storage/logs/laravel.log`

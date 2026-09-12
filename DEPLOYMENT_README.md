# Deployment Package

Zip layout:

- `index.html`, `assets/`, and other root files are the built frontend.
- `backend/` is the Laravel API backend.

Backend setup:

1. Upload the full zip contents.
2. Point the frontend/domain web root to the folder containing `index.html`.
3. Point the backend/API web root to `backend/public`.
4. In `backend/.env`, set only server/runtime values:
   - `APP_KEY`, `APP_URL`, `FRONTEND_URL`
   - database credentials
   - Paystack and KhadVerify API keys
   - CORS/domain values as needed
5. Do not add SMTP or display branding to `.env`. Those values are loaded from the database admin System Settings.
6. Run on the server:
   - `php artisan key:generate` if `APP_KEY` is empty
   - `php artisan migrate --force`
   - `php artisan storage:link`

Frontend API note:

The frontend is built to call `/api`. Configure your hosting rewrite/proxy so `/api` reaches the Laravel backend API.

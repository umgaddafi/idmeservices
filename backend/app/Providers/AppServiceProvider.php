<?php

namespace App\Providers;

use App\Models\SystemSetting;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Schema;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\ServiceProvider;
use Throwable;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureMailFromDatabase();

        ResetPassword::createUrlUsing(function (object $notifiable, string $token): string {
            $frontendUrl = rtrim((string) config('app.frontend_url'), '/');

            return $frontendUrl.'/reset-password?token='
                .urlencode($token)
                .'&email='
                .urlencode((string) $notifiable->getEmailForPasswordReset());
        });

        ResetPassword::toMailUsing(function (object $notifiable, string $token): MailMessage {
            $frontendUrl = rtrim((string) config('app.frontend_url'), '/');
            $resetUrl = $frontendUrl.'/reset-password?token='
                .urlencode($token)
                .'&email='
                .urlencode((string) $notifiable->getEmailForPasswordReset());
            $expiresInMinutes = (int) config('auth.passwords.'.config('auth.defaults.passwords').'.expire');
            $recipientName = trim((string) ($notifiable->name ?? ''));

            return (new MailMessage)
                ->subject('Password Reset Token')
                ->greeting('Hello '.($recipientName !== '' ? $recipientName : 'there').',')
                ->line('We received a request to reset your '.config('app.name', 'account').' password.')
                ->line('Use the reset token below in the reset password form, or open the button to continue directly.')
                ->line('Reset Token: '.$token)
                ->action('Reset Password', $resetUrl)
                ->line("This reset token expires in {$expiresInMinutes} minutes.")
                ->line('If you did not request a password reset, no further action is required.');
        });
    }

    private function configureMailFromDatabase(): void
    {
        try {
            if (! Schema::hasTable('system_settings')) {
                return;
            }

            $settings = SystemSetting::query()->first();
            $smtp = is_array($settings?->smtp) ? $settings->smtp : [];

            if (empty($smtp['host']) || empty($smtp['fromEmail'])) {
                return;
            }

            Config::set('mail.default', 'smtp');
            Config::set('mail.mailers.smtp.host', $smtp['host']);
            Config::set('mail.mailers.smtp.port', (int) ($smtp['port'] ?? 587));
            Config::set('mail.mailers.smtp.username', $smtp['user'] ?? null);
            Config::set('mail.mailers.smtp.password', $smtp['pass'] ?? null);
            Config::set('mail.mailers.smtp.scheme', ((int) ($smtp['port'] ?? 587)) === 465 ? 'smtps' : 'smtp');
            Config::set('mail.from.address', $smtp['fromEmail']);
            Config::set('mail.from.name', $smtp['fromName'] ?: ($settings->branding['systemName'] ?? config('app.name')));
            Config::set('app.name', $settings->branding['systemName'] ?? config('app.name'));
        } catch (Throwable) {
            // Keep CLI commands and first-time installs from failing before the database is ready.
        }
    }
}

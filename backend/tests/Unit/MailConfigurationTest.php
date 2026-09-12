<?php

namespace Tests\Unit;

use Illuminate\Mail\MailManager;
use Tests\TestCase;

class MailConfigurationTest extends TestCase
{
    public function test_smtp_mailer_uses_a_supported_scheme(): void
    {
        $scheme = config('mail.mailers.smtp.scheme');

        $this->assertContains($scheme, ['smtp', 'smtps', null], 'SMTP mail scheme must be smtp, smtps, or null.');

        $transport = $this->app->make(MailManager::class)
            ->mailer('smtp')
            ->getSymfonyTransport();

        $this->assertNotNull($transport);
    }
}

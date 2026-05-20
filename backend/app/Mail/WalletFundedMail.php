<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WalletFundedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly User $user,
        public readonly float $amount,
        public readonly string $reference,
        public readonly float $walletBalance,
        public readonly array $details = [],
        public readonly array $items = [],
        public readonly array $totals = [],
        public readonly array $delivery = [],
        public readonly ?string $ctaUrl = null,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Payment confirmed'
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.wallet-funded'
        );
    }
}

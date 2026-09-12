<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'nin',
        'bvn',
        'password',
        'role',
        'member_id',
        'total_savings',
        'join_date',
        'status',
        'wallet_balance',
        'wallet_label',
        'wallet_reference',
        'funding_note',
        'paystack_customer_id',
        'paystack_customer_code',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'join_date' => 'date',
            'total_savings' => 'float',
            'wallet_balance' => 'float',
            'paystack_customer_id' => 'integer',
        ];
    }

    public function getNameAttribute(): string
    {
        $name = trim((string) ($this->attributes['name'] ?? ''));

        if ($name !== '') {
            return $name;
        }

        return trim(implode(' ', array_filter([
            $this->attributes['first_name'] ?? '',
            $this->attributes['last_name'] ?? '',
        ])));
    }

    public function getPhoneAttribute(): ?string
    {
        return $this->attributes['phone'] ?? null;
    }

    public function apiTokens(): HasMany
    {
        return $this->hasMany(ApiToken::class);
    }

    public function verifications(): HasMany
    {
        return $this->hasMany(Verification::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function virtualAccounts(): HasMany
    {
        return $this->hasMany(VirtualAccount::class);
    }

    public function supportTickets(): HasMany
    {
        return $this->hasMany(SupportTicket::class);
    }

    public function serviceRequests(): HasMany
    {
        return $this->hasMany(ServiceRequest::class);
    }

    public function assignedSupportTickets(): HasMany
    {
        return $this->hasMany(SupportTicket::class, 'assigned_admin_id');
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (! Schema::hasColumn('users', 'paystack_customer_id')) {
                $table->unsignedBigInteger('paystack_customer_id')->nullable()->after('funding_note')->index();
            }

            if (! Schema::hasColumn('users', 'paystack_customer_code')) {
                $table->string('paystack_customer_code')->nullable()->after('paystack_customer_id')->index();
            }
        });

        if (! Schema::hasTable('virtual_accounts')) {
            Schema::create('virtual_accounts', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->string('provider')->default('paystack')->index();
                $table->string('status')->default('pending')->index();
                $table->string('account_reference')->nullable()->index();
                $table->string('reservation_reference')->nullable()->index();
                $table->string('account_name')->nullable();
                $table->string('account_number')->nullable();
                $table->string('bank_name')->nullable();
                $table->string('bank_code')->nullable();
                $table->string('provider_slug')->nullable()->index();
                $table->string('currency', 3)->default('NGN');
                $table->string('customer_name')->nullable();
                $table->string('customer_email')->nullable();
                $table->json('raw_accounts')->nullable();
                $table->json('raw_response')->nullable();
                $table->text('failure_reason')->nullable();
                $table->boolean('active')->default(false);
                $table->boolean('assigned')->default(false);
                $table->timestamp('last_synced_at')->nullable();
                $table->timestamps();

                $table->unique(['provider', 'account_number']);
            });
        }

        if (! Schema::hasTable('paystack_webhook_events')) {
            Schema::create('paystack_webhook_events', function (Blueprint $table): void {
                $table->id();
                $table->string('event')->index();
                $table->string('reference')->nullable()->unique();
                $table->string('account_number')->nullable()->index();
                $table->decimal('amount', 12, 2)->default(0);
                $table->json('payload')->nullable();
                $table->timestamp('processed_at')->nullable();
                $table->timestamp('email_sent_at')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('paystack_webhook_events');
        Schema::dropIfExists('virtual_accounts');

        Schema::table('users', function (Blueprint $table): void {
            if (Schema::hasColumn('users', 'paystack_customer_code')) {
                $table->dropColumn('paystack_customer_code');
            }

            if (Schema::hasColumn('users', 'paystack_customer_id')) {
                $table->dropColumn('paystack_customer_id');
            }
        });
    }
};

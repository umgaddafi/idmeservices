<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_settings', function (Blueprint $table): void {
            $table->id();
            $table->json('branding')->nullable();
            $table->json('smtp')->nullable();
            $table->string('support_email')->nullable();
            $table->string('support_phone')->nullable();
            $table->decimal('default_nin_price', 12, 2)->default(150);
            $table->decimal('default_bvn_price', 12, 2)->default(170);
            $table->decimal('default_phone_price', 12, 2)->default(200);
            $table->string('registration_mode')->default('OPEN');
            $table->unsignedTinyInteger('auto_debit_date')->default(1);
            $table->boolean('is_auto_debit_active')->default(false);
            $table->decimal('total_pool_liquidity', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};

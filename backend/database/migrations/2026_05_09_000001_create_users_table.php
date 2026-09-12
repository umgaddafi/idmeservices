<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone', 20);
            $table->string('nin', 11)->nullable();
            $table->string('bvn', 11)->nullable();
            $table->string('password');
            $table->string('role')->default('MEMBER');
            $table->string('member_id')->unique();
            $table->string('status')->default('Active');
            $table->decimal('wallet_balance', 12, 2)->default(0);
            $table->decimal('total_savings', 12, 2)->default(0);
            $table->date('join_date')->nullable();
            $table->string('wallet_label')->nullable();
            $table->string('wallet_reference')->nullable()->unique();
            $table->text('funding_note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};

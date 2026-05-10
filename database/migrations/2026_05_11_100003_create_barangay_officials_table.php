<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barangay_officials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barangay_id')->constrained('barangays')->cascadeOnDelete();
            $table->foreignId('resident_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('official_position_id')->constrained('barangay_official_positions')->restrictOnDelete();
            $table->string('full_name');
            $table->string('contact_number')->nullable();
            $table->string('email')->nullable();
            $table->date('term_start');
            $table->date('term_end')->nullable();
            $table->boolean('is_current')->default(false);
            $table->string('photo_path')->nullable();
            $table->string('signature_path')->nullable();
            $table->timestamps();

            $table->index(['barangay_id', 'is_current']);
            $table->index(['barangay_id', 'official_position_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barangay_officials');
    }
};

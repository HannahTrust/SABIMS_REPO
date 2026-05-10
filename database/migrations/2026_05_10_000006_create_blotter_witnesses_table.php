<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blotter_witnesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('blotter_report_id')->constrained('blotter_reports')->cascadeOnDelete();
            $table->string('name');
            $table->string('contact')->nullable();
            $table->longText('statement')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blotter_witnesses');
    }
};

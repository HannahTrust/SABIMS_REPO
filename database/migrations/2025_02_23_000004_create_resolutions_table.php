<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resolutions', function (Blueprint $table) {
            $table->id();
            $table->string('resolution_number')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('session_id')->constrained('council_sessions')->cascadeOnDelete();
            $table->foreignId('committee_id')->constrained('committees')->cascadeOnDelete();
            $table->string('status', 20); // draft, approved, archived
            $table->string('voting_result')->nullable();
            $table->string('file_path')->nullable();
            $table->integer('year');
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resolutions');
    }
};

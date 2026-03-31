<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ordinances', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('ordinance_number')->unique()->nullable();
            $table->text('description')->nullable();

            $table->foreignId('committee_id')->constrained('committees')->cascadeOnDelete();
            $table->foreignId('session_id')->nullable()->constrained('council_sessions')->nullOnDelete();

            $table->enum('status', ['draft', 'reviewed', 'approved', 'archived'])->default('draft');

            $table->string('file_path')->nullable();

            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'committee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ordinances');
    }
};


<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blotter_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barangay_id')->constrained('barangays')->cascadeOnDelete();
            $table->unsignedBigInteger('purok_id')->nullable()->index();
            $table->string('blotter_number', 32);
            $table->foreignId('incident_type_id')->constrained('incident_types')->restrictOnDelete();
            $table->foreignId('complainant_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('respondent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('respondent_name')->nullable();
            $table->dateTime('incident_datetime');
            $table->string('incident_location');
            $table->longText('narrative');
            $table->longText('action_taken')->nullable();
            $table->longText('remarks')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', [
                'pending',
                'under_mediation',
                'scheduled',
                'resolved',
                'elevated',
                'archived',
            ])->default('pending');
            $table->date('settlement_date')->nullable();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('updated_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['barangay_id', 'blotter_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blotter_reports');
    }
};

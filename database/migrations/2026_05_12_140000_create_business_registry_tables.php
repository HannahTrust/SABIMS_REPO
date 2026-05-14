<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 64)->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('is_active');
        });

        Schema::create('businesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barangay_id')->constrained('barangays')->cascadeOnDelete();
            $table->foreignId('purok_id')->constrained('puroks')->cascadeOnDelete();
            $table->foreignId('business_category_id')->constrained('business_categories')->restrictOnDelete();

            $table->string('business_name');
            $table->string('business_code', 32)->unique();

            $table->foreignId('owner_resident_id')
                ->nullable()
                ->constrained('residents')
                ->nullOnDelete();

            $table->string('owner_name');
            $table->string('owner_contact', 64);
            $table->string('owner_email')->nullable();

            $table->string('business_type', 32);
            $table->text('address');
            $table->text('business_description')->nullable();

            $table->date('date_started');

            $table->string('permit_number')->nullable();
            $table->date('permit_issue_date')->nullable();
            $table->date('permit_expiration_date')->nullable();

            $table->string('status', 32)->default('pending');

            $table->decimal('monthly_income_estimate', 14, 2)->nullable();

            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            $table->string('logo_path')->nullable();
            $table->text('remarks')->nullable();

            $table->timestamps();

            $table->index(['barangay_id', 'purok_id']);
            $table->index(['barangay_id', 'status']);
            $table->index(['business_category_id']);
            $table->index('permit_expiration_date');
            $table->index(['barangay_id', 'business_category_id']);
        });

        Schema::create('business_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnDelete();
            $table->string('document_type', 64);
            $table->string('file_path');
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->index(['business_id', 'document_type']);
        });

        Schema::create('business_owners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnDelete();
            $table->foreignId('resident_id')
                ->nullable()
                ->constrained('residents')
                ->nullOnDelete();
            $table->string('full_name');
            $table->string('contact_number', 64);
            $table->string('email')->nullable();
            $table->unsignedTinyInteger('ownership_percentage')->nullable();
            $table->timestamps();

            $table->index(['business_id', 'resident_id']);
        });

        Schema::create('business_clearances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnDelete();
            $table->string('clearance_number')->unique();
            $table->foreignId('issued_by')->constrained('users')->cascadeOnDelete();
            $table->date('issue_date');
            $table->date('expiration_date')->nullable();
            $table->string('status', 32)->default('active');
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->index(['business_id', 'issue_date']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('business_clearances');
        Schema::dropIfExists('business_owners');
        Schema::dropIfExists('business_documents');
        Schema::dropIfExists('businesses');
        Schema::dropIfExists('business_categories');
    }
};

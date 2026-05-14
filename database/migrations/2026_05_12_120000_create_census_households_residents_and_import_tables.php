<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('households', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barangay_id')->constrained('barangays')->cascadeOnDelete();
            $table->foreignId('purok_id')->constrained('puroks')->cascadeOnDelete();
            $table->string('household_code');
            $table->text('address')->nullable();
            $table->decimal('monthly_income', 12, 2)->nullable();
            $table->string('housing_type', 64)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['barangay_id', 'household_code']);
            $table->index(['barangay_id', 'purok_id']);
        });

        Schema::create('residents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barangay_id')->constrained('barangays')->cascadeOnDelete();
            $table->foreignId('purok_id')->constrained('puroks')->cascadeOnDelete();
            $table->foreignId('household_id')->nullable()->constrained('households')->nullOnDelete();

            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('suffix', 32)->nullable();

            $table->date('birth_date');
            $table->unsignedSmallInteger('age');
            $table->string('gender', 32);

            $table->string('civil_status', 64);
            $table->string('nationality', 64)->default('Filipino');

            $table->string('contact_number', 32)->nullable();
            $table->string('email')->nullable();

            $table->string('occupation')->nullable();
            $table->string('educational_attainment')->nullable();

            $table->boolean('voter_status')->default(false);
            $table->boolean('senior_citizen')->default(false);
            $table->boolean('pwd_status')->default(false);

            $table->string('profile_photo')->nullable();

            $table->string('status', 32)->default('active');
            $table->text('remarks')->nullable();

            $table->timestamps();

            $table->index(['barangay_id', 'purok_id']);
            $table->index(['barangay_id', 'status']);
            $table->index(['household_id']);

            $table->index(
                ['barangay_id', 'first_name', 'last_name', 'birth_date'],
                'residents_dup_lookup_idx'
            );
        });

        Schema::table('households', function (Blueprint $table) {
            $table->foreignId('household_head_resident_id')
                ->nullable()
                ->after('household_code')
                ->constrained('residents')
                ->nullOnDelete();
        });

        Schema::create('resident_import_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barangay_id')->constrained('barangays')->cascadeOnDelete();
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->string('file_name');
            $table->unsignedInteger('total_rows')->default(0);
            $table->unsignedInteger('successful_imports')->default(0);
            $table->unsignedInteger('failed_imports')->default(0);
            $table->string('status', 32)->default('pending');
            $table->timestamps();

            $table->index(['barangay_id', 'created_at']);
        });

        Schema::create('resident_import_errors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('import_log_id')->constrained('resident_import_logs')->cascadeOnDelete();
            $table->unsignedInteger('row_number');
            $table->text('error_message');
            $table->json('raw_data')->nullable();
            $table->timestamps();

            $table->index(['import_log_id', 'row_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resident_import_errors');

        Schema::table('households', function (Blueprint $table) {
            $table->dropForeign(['household_head_resident_id']);
            $table->dropColumn('household_head_resident_id');
        });

        Schema::dropIfExists('residents');
        Schema::dropIfExists('resident_import_logs');
        Schema::dropIfExists('households');
    }
};

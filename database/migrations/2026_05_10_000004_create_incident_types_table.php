<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incident_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        DB::table('incident_types')->insert([
            ['name' => 'Theft', 'description' => null, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Physical Injury', 'description' => null, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Noise Complaint', 'description' => null, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Domestic Conflict', 'description' => null, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Public Disturbance', 'description' => null, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Property Damage', 'description' => null, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'VAWC', 'description' => null, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Others', 'description' => null, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('incident_types');
    }
};

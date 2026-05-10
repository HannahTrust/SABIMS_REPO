<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barangays', function (Blueprint $table) {
            $table->string('municipality')->default('')->after('name');
            $table->string('province')->default('')->after('municipality');
            $table->string('region')->default('')->after('province');
            $table->string('logo_path')->nullable()->after('region');
            $table->text('address')->nullable()->after('logo_path');
            $table->string('contact_number')->nullable()->after('address');
            $table->string('email')->nullable()->after('contact_number');
        });

        Schema::table('barangays', function (Blueprint $table) {
            $table->dropColumn('captain_id');
        });
    }

    public function down(): void
    {
        Schema::table('barangays', function (Blueprint $table) {
            $table->unsignedBigInteger('captain_id')->nullable()->index()->after('name');
        });

        Schema::table('barangays', function (Blueprint $table) {
            $table->dropColumn([
                'municipality',
                'province',
                'region',
                'logo_path',
                'address',
                'contact_number',
                'email',
            ]);
        });
    }
};

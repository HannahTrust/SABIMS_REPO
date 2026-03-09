<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->timestamp('time_scanned')->nullable()->after('status');
            $table->foreignId('marked_by')->nullable()->after('time_scanned')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropForeign(['marked_by']);
            $table->dropColumn(['time_scanned', 'marked_by']);
        });
    }
};

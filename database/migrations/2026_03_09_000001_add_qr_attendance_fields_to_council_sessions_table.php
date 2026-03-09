<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('council_sessions', function (Blueprint $table) {
            $table->string('session_title')->nullable()->after('id');
            $table->foreignId('committee_id')->nullable()->after('session_date')->constrained('committees')->nullOnDelete();
            $table->enum('attendance_status', ['open', 'closed'])->default('closed')->after('committee_id');
            $table->string('qr_token')->nullable()->unique()->after('attendance_status');
        });
    }

    public function down(): void
    {
        Schema::table('council_sessions', function (Blueprint $table) {
            $table->dropForeign(['committee_id']);
            $table->dropColumn(['session_title', 'committee_id', 'attendance_status', 'qr_token']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Rename the legislative "secretary" role to "sb_secretary" so that the
     * generic "secretary" name can later be used by the Barangay Secretary role.
     */
    public function up(): void
    {
        DB::table('users')
            ->where('role', 'secretary')
            ->update(['role' => 'sb_secretary']);
    }

    public function down(): void
    {
        DB::table('users')
            ->where('role', 'sb_secretary')
            ->update(['role' => 'secretary']);
    }
};

<?php

use App\Models\Municipality;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $defaultId = Municipality::query()->where('code', 'default-lgu')->value('id')
            ?? Municipality::query()->value('id');

        if ($defaultId === null) {
            return;
        }

        $municipalRoles = [
            'admin',
            'vice_mayor',
            'sb_secretary',
            'sb_member',
        ];

        User::query()
            ->whereNull('municipality_id')
            ->whereNull('barangay_id')
            ->whereIn('role', $municipalRoles)
            ->update(['municipality_id' => $defaultId]);
    }

    public function down(): void
    {
        //
    }
};

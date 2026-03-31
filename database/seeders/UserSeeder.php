<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Carbon;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $password = Hash::make('password');
        $verifiedAt = Carbon::now();

        $existingSuperAdmin = User::query()
            ->where('role', 'super_admin')
            ->first();

        if (! $existingSuperAdmin) {
            User::updateOrCreate(
                ['email' => 'superadmin@sabims.test'],
                [
                    'name' => 'Super Admin',
                    'password' => $password,
                    'role' => 'super_admin',
                    'is_active' => true,
                    'email_verified_at' => $verifiedAt,
                ]
            );
        }

        User::updateOrCreate(
            ['email' => 'admin@sabims.test'],
            [
                'name' => 'System Admin',
                'password' => $password,
                'role' => 'admin',
                'is_active' => true,
                'email_verified_at' => $verifiedAt,
            ]
        );

        User::updateOrCreate(
            ['email' => 'vm@sabims.test'],
            [
                'name' => 'Vice Mayor',
                'password' => $password,
                'role' => 'vice_mayor',
                'is_active' => true,
                'email_verified_at' => $verifiedAt,
            ]
        );

        User::updateOrCreate(
            ['email' => 'secretary@sabims.test'],
            [
                'name' => 'SB Secretary',
                'password' => $password,
                'role' => 'secretary',
                'is_active' => true,
                'email_verified_at' => $verifiedAt,
            ]
        );

        $sbMembers = [
            ['name' => 'Maria Santos', 'email' => 'maria.santos@sabims.test'],
            ['name' => 'Juan Dela Cruz', 'email' => 'juan.delacruz@sabims.test'],
            ['name' => 'Rosa Garcia', 'email' => 'rosa.garcia@sabims.test'],
            ['name' => 'Pedro Reyes', 'email' => 'pedro.reyes@sabims.test'],
            ['name' => 'Ana Mendoza', 'email' => 'ana.mendoza@sabims.test'],
            ['name' => 'Carlos Bautista', 'email' => 'carlos.bautista@sabims.test'],
        ];

        foreach ($sbMembers as $member) {
            User::updateOrCreate(
                ['email' => $member['email']],
                [
                    'name' => $member['name'],
                    'password' => $password,
                    'role' => 'sb_member',
                    'is_active' => true,
                    'email_verified_at' => $verifiedAt,
                ]
            );
        }
    }
}

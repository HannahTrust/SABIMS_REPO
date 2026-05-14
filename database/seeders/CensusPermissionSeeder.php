<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class CensusPermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'resident.view',
            'resident.create',
            'resident.update',
            'resident.import',
            'household.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $superAdmin = Role::findOrCreate('super_admin', 'web');
        $brgyAdmin = Role::findOrCreate('brgy_admin', 'web');
        $brgySecretary = Role::findOrCreate('brgy_secretary', 'web');
        $purokLeader = Role::findOrCreate('purok_leader', 'web');

        foreach ($permissions as $permission) {
            $superAdmin->givePermissionTo($permission);
        }

        foreach ($permissions as $permission) {
            $brgyAdmin->givePermissionTo($permission);
        }

        foreach ($permissions as $permission) {
            $brgySecretary->givePermissionTo($permission);
        }

        foreach (['resident.view', 'household.manage'] as $permission) {
            $purokLeader->givePermissionTo($permission);
        }

        User::query()->each(function (User $user): void {
            $role = User::normalizeRole($user->role);

            if (! $role) {
                return;
            }

            if (Role::query()->where('name', $role)->exists()) {
                $user->syncRoles([$role]);
            }
        });
    }
}

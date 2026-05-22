<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class BarangayPermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'barangay.view',
            'barangay.create',
            'barangay.update',
            'barangay.delete',
            'purok.view',
            'purok.create',
            'purok.update',
            'purok.delete',
            'official.view',
            'official.create',
            'official.update',
            'official.assign',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $superAdmin = Role::findOrCreate('super_admin', 'web');
        $municipalAdmin = Role::findOrCreate('admin', 'web');
        $brgyAdmin = Role::findOrCreate('brgy_admin', 'web');

        foreach ($permissions as $permission) {
            $superAdmin->givePermissionTo($permission);
            $municipalAdmin->givePermissionTo($permission);
        }

        $brgyBarangayPermissions = [
            'barangay.view',
            'barangay.update',
            'purok.view',
            'purok.create',
            'purok.update',
            'purok.delete',
            'official.view',
            'official.create',
            'official.update',
            'official.assign',
        ];

        foreach ($brgyBarangayPermissions as $permission) {
            $brgyAdmin->givePermissionTo($permission);
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

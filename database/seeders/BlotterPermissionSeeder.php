<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class BlotterPermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'view_blotter',
            'create_blotter',
            'update_blotter',
            'resolve_blotter',
            'archive_blotter',
            'print_blotter',
            'assign_blotter',
            'upload_blotter_attachment',
            'manage_incident_types',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $superAdmin = Role::findOrCreate('super_admin', 'web');
        $brgyAdmin = Role::findOrCreate('brgy_admin', 'web');
        $brgySecretary = Role::findOrCreate('brgy_secretary', 'web');
        $luponOfficer = Role::findOrCreate('lupon_officer', 'web');
        $purokLeader = Role::findOrCreate('purok_leader', 'web');

        $superAdmin->syncPermissions($permissions);

        $brgyAdmin->syncPermissions([
            'view_blotter',
            'create_blotter',
            'update_blotter',
            'resolve_blotter',
            'archive_blotter',
            'print_blotter',
            'assign_blotter',
            'upload_blotter_attachment',
        ]);

        $brgySecretary->syncPermissions([
            'view_blotter',
            'create_blotter',
            'update_blotter',
            'print_blotter',
            'upload_blotter_attachment',
        ]);

        $luponOfficer->syncPermissions([
            'view_blotter',
            'resolve_blotter',
            'print_blotter',
        ]);

        $purokLeader->syncPermissions([
            'view_blotter',
            'create_blotter',
        ]);

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

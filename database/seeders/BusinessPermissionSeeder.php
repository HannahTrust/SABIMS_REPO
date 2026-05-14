<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class BusinessPermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'business.view',
            'business.create',
            'business.update',
            'business.delete',
            'business.clearance.generate',
            'business.permit.renew',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $superAdmin = Role::findOrCreate('super_admin', 'web');
        $admin = Role::findOrCreate('admin', 'web');
        $viceMayor = Role::findOrCreate('vice_mayor', 'web');
        $brgyAdmin = Role::findOrCreate('brgy_admin', 'web');
        $brgySecretary = Role::findOrCreate('brgy_secretary', 'web');
        $brgyCaptain = Role::findOrCreate('brgy_captain', 'web');
        $purokLeader = Role::findOrCreate('purok_leader', 'web');

        foreach ($permissions as $permission) {
            $superAdmin->givePermissionTo($permission);
        }

        foreach (['business.view'] as $permission) {
            $admin->givePermissionTo($permission);
            $viceMayor->givePermissionTo($permission);
        }

        foreach ($permissions as $permission) {
            $brgyAdmin->givePermissionTo($permission);
            $brgySecretary->givePermissionTo($permission);
        }

        foreach (['business.view', 'business.clearance.generate', 'business.permit.renew'] as $permission) {
            $brgyCaptain->givePermissionTo($permission);
        }

        foreach (['business.view'] as $permission) {
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

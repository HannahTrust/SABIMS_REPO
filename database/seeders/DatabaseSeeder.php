<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            BarangaySeeder::class,
            BarangayOfficialPositionSeeder::class,
            UserSeeder::class,
            BlotterPermissionSeeder::class,
            BarangayPermissionSeeder::class,
            CensusPermissionSeeder::class,
            BusinessPermissionSeeder::class,
            CommitteeSeeder::class,
            CensusSeeder::class,
            BusinessCategorySeeder::class,
        ]);
    }
}

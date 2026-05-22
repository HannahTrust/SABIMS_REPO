<?php

namespace Database\Seeders;

use App\Models\Municipality;
use Illuminate\Database\Seeder;

class MunicipalitySeeder extends Seeder
{
    public function run(): void
    {
        Municipality::updateOrCreate(
            ['code' => 'default-lgu'],
            [
                'name' => 'Default Local Government Unit',
                'system_name' => 'eBarangayHub',
                'module_name' => 'SABIMS Module',
                'is_active' => true,
            ]
        );

        Municipality::updateOrCreate(
            ['code' => 'demo-city'],
            [
                'name' => 'Demo City',
                'system_name' => 'Demo City Portal',
                'module_name' => 'Legislative Module',
                'is_active' => true,
            ]
        );
    }
}

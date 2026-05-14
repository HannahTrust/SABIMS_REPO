<?php

namespace Database\Seeders;

use App\Models\BusinessCategory;
use Illuminate\Database\Seeder;

class BusinessCategorySeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['name' => 'Retail', 'code' => 'RETAIL', 'description' => 'General merchandise and retail trade'],
            ['name' => 'Food', 'code' => 'FOOD', 'description' => 'Food service, eateries, and related'],
            ['name' => 'Pharmacy', 'code' => 'PHARMACY', 'description' => 'Drugstores and pharmaceutical retail'],
            ['name' => 'Hardware', 'code' => 'HARDWARE', 'description' => 'Hardware and construction supplies'],
            ['name' => 'Internet Cafe', 'code' => 'INTERNET_CAFE', 'description' => 'Computer rental and connectivity services'],
            ['name' => 'Water Refilling', 'code' => 'WATER_REFILLING', 'description' => 'Potable water refilling stations'],
            ['name' => 'Salon', 'code' => 'SALON', 'description' => 'Hair and beauty services'],
            ['name' => 'Agriculture', 'code' => 'AGRICULTURE', 'description' => 'Farming, fisheries, and agri-supplies'],
            ['name' => 'Services', 'code' => 'SERVICES', 'description' => 'Professional and personal services'],
        ];

        foreach ($rows as $row) {
            BusinessCategory::query()->updateOrCreate(
                ['code' => $row['code']],
                [
                    'name' => $row['name'],
                    'description' => $row['description'],
                    'is_active' => true,
                ]
            );
        }
    }
}

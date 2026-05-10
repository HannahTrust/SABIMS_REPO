<?php

namespace Database\Seeders;

use App\Models\BarangayOfficialPosition;
use Illuminate\Database\Seeder;

class BarangayOfficialPositionSeeder extends Seeder
{
    /**
     * Master list of barangay positions (codes stable for business rules, e.g. single captain).
     */
    public function run(): void
    {
        $positions = [
            ['name' => 'Barangay Captain', 'code' => 'captain', 'hierarchy_level' => 100],
            ['name' => 'Barangay Secretary', 'code' => 'secretary', 'hierarchy_level' => 90],
            ['name' => 'Barangay Treasurer', 'code' => 'treasurer', 'hierarchy_level' => 80],
            ['name' => 'Kagawad', 'code' => 'kagawad', 'hierarchy_level' => 70],
            ['name' => 'SK Chairperson', 'code' => 'sk_chair', 'hierarchy_level' => 60],
            ['name' => 'Other appointed official', 'code' => 'other', 'hierarchy_level' => 10],
        ];

        foreach ($positions as $row) {
            BarangayOfficialPosition::updateOrCreate(
                ['code' => $row['code']],
                ['name' => $row['name'], 'hierarchy_level' => $row['hierarchy_level']]
            );
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\Barangay;
use App\Models\Municipality;
use Illuminate\Database\Seeder;

class BarangaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Seeds 25 generic Filipino barangay names common across many municipalities.
     * Replace these with the actual barangay roster of the LGU when known.
     */
    public function run(): void
    {
        $municipalityId = Municipality::query()
            ->where('code', 'default-lgu')
            ->value('id');

        $barangays = [
            ['code' => 'B-01', 'name' => 'Barangay Poblacion'],
            ['code' => 'B-02', 'name' => 'Barangay San Isidro'],
            ['code' => 'B-03', 'name' => 'Barangay San Roque'],
            ['code' => 'B-04', 'name' => 'Barangay Santa Cruz'],
            ['code' => 'B-05', 'name' => 'Barangay San Antonio'],
            ['code' => 'B-06', 'name' => 'Barangay San Vicente'],
            ['code' => 'B-07', 'name' => 'Barangay San Jose'],
            ['code' => 'B-08', 'name' => 'Barangay Santa Rosa'],
            ['code' => 'B-09', 'name' => 'Barangay Santo Niño'],
            ['code' => 'B-10', 'name' => 'Barangay San Pedro'],
            ['code' => 'B-11', 'name' => 'Barangay Santa Maria'],
            ['code' => 'B-12', 'name' => 'Barangay San Juan'],
            ['code' => 'B-13', 'name' => 'Barangay Bagong Silang'],
            ['code' => 'B-14', 'name' => 'Barangay Mabini'],
            ['code' => 'B-15', 'name' => 'Barangay Rizal'],
            ['code' => 'B-16', 'name' => 'Barangay Bonifacio'],
            ['code' => 'B-17', 'name' => 'Barangay Maharlika'],
            ['code' => 'B-18', 'name' => 'Barangay Bayanihan'],
            ['code' => 'B-19', 'name' => 'Barangay Malaya'],
            ['code' => 'B-20', 'name' => 'Barangay Masagana'],
            ['code' => 'B-21', 'name' => 'Barangay Bagumbayan'],
            ['code' => 'B-22', 'name' => 'Barangay Lagundi'],
            ['code' => 'B-23', 'name' => 'Barangay Banilad'],
            ['code' => 'B-24', 'name' => 'Barangay Tibungco'],
            ['code' => 'B-25', 'name' => 'Barangay Calumpang'],
        ];

        foreach ($barangays as $b) {
            Barangay::updateOrCreate(
                ['code' => $b['code']],
                [
                    'name' => $b['name'],
                    'municipality_id' => $municipalityId,
                    'is_active' => true,
                ]
            );
        }
    }
}

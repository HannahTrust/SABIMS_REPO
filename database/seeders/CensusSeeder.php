<?php

namespace Database\Seeders;

use App\Models\Barangay;
use App\Models\Household;
use App\Models\Purok;
use App\Models\Resident;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

/**
 * Seeds census {@see Household} and {@see Resident} rows so population dashboards show non-zero totals.
 * Safe to run once; skips if census residents already exist.
 */
class CensusSeeder extends Seeder
{
    /** @var list<int> */
    private const DEMO_AGES = [6, 14, 28, 41, 58, 71];

    private const FIRST_NAMES = ['Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Rosa', 'Marcos', 'Luz'];

    private const LAST_NAMES = ['Dela Cruz', 'Reyes', 'Santos', 'Garcia', 'Mendoza', 'Aquino', 'Torres', 'Ramos'];

    public function run(): void
    {
        if (Resident::query()->exists()) {
            return;
        }

        $barangays = Barangay::query()->where('is_active', true)->orderBy('id')->get();

        foreach ($barangays as $barangay) {
            $purok = Purok::query()
                ->where('barangay_id', $barangay->id)
                ->first();

            if ($purok === null) {
                $purok = Purok::query()->create([
                    'barangay_id' => $barangay->id,
                    'name' => 'Purok Central',
                    'code' => 'PC',
                    'description' => 'Default purok for census demo data.',
                    'is_active' => true,
                ]);
            }

            $householdCode = 'HH-'.preg_replace('/[^A-Za-z0-9]/', '', $barangay->code).'-001';

            $household = Household::query()->create([
                'barangay_id' => $barangay->id,
                'purok_id' => $purok->id,
                'household_code' => $householdCode,
                'address' => $barangay->name.', sample street',
                'monthly_income' => null,
                'housing_type' => 'single_family',
                'is_active' => true,
            ]);

            $headId = null;

            foreach (self::DEMO_AGES as $idx => $age) {
                $birthDate = Carbon::now()->startOfDay()->subYears($age)->subDays(($barangay->id + $idx) % 180);

                $fn = self::FIRST_NAMES[($barangay->id + $idx) % count(self::FIRST_NAMES)];
                $ln = self::LAST_NAMES[($barangay->id + $idx * 2) % count(self::LAST_NAMES)];

                $gender = ($idx % 2 === 0) ? 'Male' : 'Female';
                $voter = $age >= 18 && ($idx !== 2);
                $pwd = $idx === 4;

                $resident = Resident::query()->create([
                    'barangay_id' => $barangay->id,
                    'purok_id' => $purok->id,
                    'household_id' => $household->id,
                    'first_name' => $fn,
                    'middle_name' => $idx === 0 ? 'Roberto' : null,
                    'last_name' => $ln,
                    'suffix' => null,
                    'birth_date' => $birthDate->toDateString(),
                    'age' => $age,
                    'gender' => $gender,
                    'civil_status' => $age >= 18 ? 'Married' : 'Single',
                    'nationality' => 'Filipino',
                    'contact_number' => '09'.str_pad((string) (($barangay->id * 100) + $idx), 9, '0', STR_PAD_LEFT),
                    'email' => null,
                    'occupation' => $age >= 18 ? 'Various' : null,
                    'educational_attainment' => null,
                    'voter_status' => $voter,
                    'senior_citizen' => $age >= 60,
                    'pwd_status' => $pwd,
                    'profile_photo' => null,
                    'status' => Resident::STATUS_ACTIVE,
                    'remarks' => null,
                ]);

                if ($age >= 18 && $age < 60 && $headId === null) {
                    $headId = $resident->id;
                }
            }

            if ($headId !== null) {
                $household->update(['household_head_resident_id' => $headId]);
            }
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\Barangay;
use App\Models\Municipality;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Realistic Filipino names per barangay (index-aligned to BarangaySeeder).
     *
     * @var list<array{captain: string, admin: string, secretary: string, purok_leader: string}>
     */
    private array $barangayOfficials = [
        ['captain' => 'Hon. Jose Reyes',          'admin' => 'Engr. Roel Macaraig',     'secretary' => 'Lourdes Magpantay',  'purok_leader' => 'Tatay Mang Ben Sarmiento'],
        ['captain' => 'Hon. Maria Santos',        'admin' => 'Engr. Joel Buenavista',   'secretary' => 'Corazon Diaz',       'purok_leader' => 'Aling Nena Cabading'],
        ['captain' => 'Hon. Pedro Cruz',          'admin' => 'Atty. Glenda Pineda',     'secretary' => 'Imelda Hernandez',   'purok_leader' => 'Mang Goryo Pajarillo'],
        ['captain' => 'Hon. Antonio Mendoza',     'admin' => 'Engr. Mark Soriano',      'secretary' => 'Teresita Ramos',     'purok_leader' => 'Aling Selma Buenaventura'],
        ['captain' => 'Hon. Eduardo Tan',         'admin' => 'Atty. Jasmin Calingasan', 'secretary' => 'Esperanza Reyes',    'purok_leader' => 'Mang Tonyo Macapagal'],
        ['captain' => 'Hon. Ricardo Gonzales',    'admin' => 'Engr. Dexter Almario',    'secretary' => 'Consuelo Pineda',    'purok_leader' => 'Aling Marta Sandoval'],
        ['captain' => 'Hon. Manuel Aquino',       'admin' => 'Atty. Joanne Manalili',   'secretary' => 'Remedios Bautista',  'purok_leader' => 'Mang Lito Punzalan'],
        ['captain' => 'Hon. Roberto Bautista',    'admin' => 'Engr. Patrick Morales',   'secretary' => 'Trinidad Concepcion', 'purok_leader' => 'Aling Pilar Esguerra'],
        ['captain' => 'Hon. Ferdinand Garcia',    'admin' => 'Atty. Karen Espinosa',    'secretary' => 'Carmela Torres',     'purok_leader' => 'Mang Berto Calderon'],
        ['captain' => 'Hon. Carlos Villanueva',   'admin' => 'Engr. Allan Briones',     'secretary' => 'Rosario Estrada',    'purok_leader' => 'Aling Gloria Jimenez'],
        ['captain' => 'Hon. Francisco Lim',       'admin' => 'Atty. Liza Sandoval',     'secretary' => 'Aurora Manalo',      'purok_leader' => 'Mang Anding Hermosa'],
        ['captain' => 'Hon. Ramon Aguilar',       'admin' => 'Engr. Noel Hidalgo',      'secretary' => 'Felicidad Sarmiento', 'purok_leader' => 'Aling Bing Trinidad'],
        ['captain' => 'Hon. Leonardo Castro',     'admin' => 'Atty. Rachel Buendia',    'secretary' => 'Aida Mariano',       'purok_leader' => 'Mang Boy Caballero'],
        ['captain' => 'Hon. Rodrigo Pascual',     'admin' => 'Engr. Vincent Tagle',     'secretary' => 'Norma Macaraeg',     'purok_leader' => 'Aling Letty Espiritu'],
        ['captain' => 'Hon. Alfredo Ramos',       'admin' => 'Atty. Faye Constantino',  'secretary' => 'Erlinda Bonifacio',  'purok_leader' => 'Mang Dindo Pagaduan'],
        ['captain' => 'Hon. Benjamin Dela Cruz',  'admin' => 'Engr. Carlo Trinidad',    'secretary' => 'Lydia Aldueza',      'purok_leader' => 'Aling Vicky Manansala'],
        ['captain' => 'Hon. Mario Domingo',       'admin' => 'Atty. Hazel Avenido',     'secretary' => 'Marivic Estrella',   'purok_leader' => 'Mang Eddie Rosales'],
        ['captain' => 'Hon. Cesar Navarro',       'admin' => 'Engr. Russel Caballero',  'secretary' => 'Susan Caballes',     'purok_leader' => 'Aling Tess Briones'],
        ['captain' => 'Hon. Renato Fernandez',    'admin' => 'Atty. Mae Nicolas',       'secretary' => 'Cynthia Mojica',     'purok_leader' => 'Mang Rudy Catacutan'],
        ['captain' => 'Hon. Ernesto Lopez',       'admin' => 'Engr. Bryan Aldovino',    'secretary' => 'Helen Ortiz',        'purok_leader' => 'Aling Baby Salonga'],
        ['captain' => 'Hon. Domingo Salazar',     'admin' => 'Atty. Yvette Padilla',    'secretary' => 'Marites Llanes',     'purok_leader' => 'Mang Ramon Buendia'],
        ['captain' => 'Hon. Augusto Marquez',     'admin' => 'Engr. Christian Bayot',   'secretary' => 'Nenita Ferrer',      'purok_leader' => 'Aling Nora Magsaysay'],
        ['captain' => 'Hon. Vicente Velasco',     'admin' => 'Atty. Mariel Encarnacion', 'secretary' => 'Lolita Valenzuela',  'purok_leader' => 'Mang Kanor Tinio'],
        ['captain' => 'Hon. Anastacio Tolentino', 'admin' => 'Engr. Edmond Quiambao',   'secretary' => 'Gloria Cabanilla',   'purok_leader' => 'Aling Linda Robles'],
        ['captain' => 'Hon. Bernabe Ocampo',      'admin' => 'Atty. Cecille Ynares',    'secretary' => 'Veronica Rivera',    'purok_leader' => 'Mang Pepe Quizon'],
    ];

    /**
     * Filipino first names used to generate sample residents.
     *
     * @var list<string>
     */
    private array $residentFirstNames = [
        'Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Rosa', 'Antonio', 'Elena',
        'Manuel', 'Luzviminda', 'Ricardo', 'Cristina', 'Eduardo', 'Lourdes',
        'Roberto', 'Teresa', 'Carlos', 'Josefina', 'Francisco', 'Angelica',
        'Ramon', 'Marilyn', 'Leonardo', 'Divina', 'Rodrigo', 'Catalina',
        'Alfredo', 'Liwayway', 'Benjamin', 'Estrella', 'Mario', 'Mercedes',
        'Cesar', 'Pilar', 'Renato', 'Bonifacia', 'Ernesto', 'Caridad',
    ];

    /**
     * Filipino last names used to generate sample residents.
     *
     * @var list<string>
     */
    private array $residentLastNames = [
        'Dela Cruz', 'Reyes', 'Santos', 'Garcia', 'Mendoza', 'Cruz', 'Bautista',
        'Aquino', 'Gonzales', 'Tan', 'Ramos', 'Pascual', 'Castro', 'Aguilar',
        'Villanueva', 'Domingo', 'Fernandez', 'Lopez', 'Salazar', 'Marquez',
        'Velasco', 'Tolentino', 'Ocampo', 'Magpantay', 'Diaz', 'Hernandez',
        'Bonifacio', 'Estrella', 'Mojica', 'Ortiz', 'Llanes', 'Ferrer',
        'Valenzuela', 'Cabanilla', 'Rivera', 'Concepcion', 'Torres', 'Estrada',
    ];

    /**
     * Number of sample residents to seed per barangay.
     */
    private const RESIDENTS_PER_BARANGAY = 5;

    public function run(): void
    {
        $password = Hash::make('password');
        $verifiedAt = Carbon::now();

        $defaultMunicipalityId = Municipality::query()
            ->where('code', 'default-lgu')
            ->value('id');

        $this->seedSystemUsers($password, $verifiedAt);
        $this->seedSbMembers($password, $verifiedAt, $defaultMunicipalityId);
        $this->seedBarangayUsers($password, $verifiedAt);
    }

    /**
     * System-level users (no barangay scope): super_admin, admin, vice_mayor, sb_secretary.
     */
    private function seedSystemUsers(string $password, Carbon $verifiedAt): void
    {
        $defaultMunicipalityId = Municipality::query()
            ->where('code', 'default-lgu')
            ->value('id');

        $existingSuperAdmin = User::query()->where('role', 'super_admin')->first();

        if (! $existingSuperAdmin) {
            User::updateOrCreate(
                ['email' => 'superadmin@sabims.test'],
                [
                    'name' => 'Super Admin',
                    'password' => $password,
                    'role' => 'super_admin',
                    'municipality_id' => null,
                    'barangay_id' => null,
                    'is_active' => true,
                    'email_verified_at' => $verifiedAt,
                ]
            );
        }

        User::updateOrCreate(
            ['email' => 'admin@sabims.test'],
            [
                'name' => 'Municipal Administrator',
                'password' => $password,
                'role' => 'admin',
                'municipality_id' => $defaultMunicipalityId,
                'barangay_id' => null,
                'is_active' => true,
                'email_verified_at' => $verifiedAt,
            ]
        );

        User::updateOrCreate(
            ['email' => 'vm@sabims.test'],
            [
                'name' => 'Vice Mayor',
                'password' => $password,
                'role' => 'vice_mayor',
                'municipality_id' => $defaultMunicipalityId,
                'barangay_id' => null,
                'is_active' => true,
                'email_verified_at' => $verifiedAt,
            ]
        );

        User::updateOrCreate(
            ['email' => 'sb.secretary@sabims.test'],
            [
                'name' => 'SB Secretary',
                'password' => $password,
                'role' => 'sb_secretary',
                'municipality_id' => $defaultMunicipalityId,
                'barangay_id' => null,
                'is_active' => true,
                'email_verified_at' => $verifiedAt,
            ]
        );
    }

    /**
     * 6 SB members (legislative council members).
     */
    private function seedSbMembers(string $password, Carbon $verifiedAt, ?int $defaultMunicipalityId): void
    {
        $sbMembers = [
            ['name' => 'Maria Santos',      'email' => 'maria.santos@sabims.test'],
            ['name' => 'Juan Dela Cruz',    'email' => 'juan.delacruz@sabims.test'],
            ['name' => 'Rosa Garcia',       'email' => 'rosa.garcia@sabims.test'],
            ['name' => 'Pedro Reyes',       'email' => 'pedro.reyes@sabims.test'],
            ['name' => 'Ana Mendoza',       'email' => 'ana.mendoza@sabims.test'],
            ['name' => 'Carlos Bautista',   'email' => 'carlos.bautista@sabims.test'],
        ];

        foreach ($sbMembers as $member) {
            User::updateOrCreate(
                ['email' => $member['email']],
                [
                    'name' => $member['name'],
                    'password' => $password,
                    'role' => 'sb_member',
                    'municipality_id' => $defaultMunicipalityId,
                    'barangay_id' => null,
                    'is_active' => true,
                    'email_verified_at' => $verifiedAt,
                ]
            );
        }
    }

    /**
     * For each barangay: 1 captain + 1 secretary + N residents (all with Filipino names).
     */
    private function seedBarangayUsers(string $password, Carbon $verifiedAt): void
    {
        $barangays = Barangay::query()->orderBy('code')->get();

        if ($barangays->isEmpty()) {
            return;
        }

        foreach ($barangays as $index => $barangay) {
            $official = $this->barangayOfficials[$index] ?? null;
            $captainName = $official['captain'] ?? "Hon. Captain of {$barangay->name}";
            $adminName = $official['admin'] ?? "Admin of {$barangay->name}";
            $secretaryName = $official['secretary'] ?? "Secretary of {$barangay->name}";
            $purokLeaderName = $official['purok_leader'] ?? "Purok Leader of {$barangay->name}";
            $slug = strtolower($barangay->code);

            $captain = User::updateOrCreate(
                ['email' => "captain.{$slug}@sabims.test"],
                [
                    'name' => $captainName,
                    'password' => $password,
                    'role' => 'brgy_captain',
                    'barangay_id' => $barangay->id,
                    'is_active' => true,
                    'email_verified_at' => $verifiedAt,
                ]
            );

            User::updateOrCreate(
                ['email' => "admin.{$slug}@sabims.test"],
                [
                    'name' => $adminName,
                    'password' => $password,
                    'role' => 'brgy_admin',
                    'barangay_id' => $barangay->id,
                    'is_active' => true,
                    'email_verified_at' => $verifiedAt,
                ]
            );

            User::updateOrCreate(
                ['email' => "secretary.{$slug}@sabims.test"],
                [
                    'name' => $secretaryName,
                    'password' => $password,
                    'role' => 'brgy_secretary',
                    'barangay_id' => $barangay->id,
                    'is_active' => true,
                    'email_verified_at' => $verifiedAt,
                ]
            );

            User::updateOrCreate(
                ['email' => "purok.{$slug}@sabims.test"],
                [
                    'name' => $purokLeaderName,
                    'password' => $password,
                    'role' => 'purok_leader',
                    'barangay_id' => $barangay->id,
                    'is_active' => true,
                    'email_verified_at' => $verifiedAt,
                ]
            );

            $this->seedResidentsForBarangay($barangay, $slug, $password, $verifiedAt);
        }
    }

    /**
     * Generate deterministic but realistic-looking Filipino residents for a barangay.
     */
    private function seedResidentsForBarangay(
        Barangay $barangay,
        string $slug,
        string $password,
        Carbon $verifiedAt,
    ): void {
        for ($i = 1; $i <= self::RESIDENTS_PER_BARANGAY; $i++) {
            // Deterministic pick so re-seeding produces stable rows.
            $firstIdx = ($barangay->id * 7 + $i * 3) % count($this->residentFirstNames);
            $lastIdx = ($barangay->id * 11 + $i * 5) % count($this->residentLastNames);

            $firstName = $this->residentFirstNames[$firstIdx];
            $lastName = $this->residentLastNames[$lastIdx];
            $emailLocal = Str::slug($firstName.' '.$lastName, '.');

            User::updateOrCreate(
                ['email' => "resident.{$slug}.{$i}@sabims.test"],
                [
                    'name' => "{$firstName} {$lastName}",
                    'password' => $password,
                    'role' => 'resident',
                    'barangay_id' => $barangay->id,
                    'is_active' => true,
                    'email_verified_at' => $verifiedAt,
                    // Note: $emailLocal kept for documentation; we use a deterministic
                    // address scheme above to guarantee uniqueness across barangays.
                ]
            );
            unset($emailLocal);
        }
    }
}

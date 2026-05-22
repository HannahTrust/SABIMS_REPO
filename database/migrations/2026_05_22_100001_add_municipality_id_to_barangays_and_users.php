<?php

use App\Models\Barangay;
use App\Models\Municipality;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barangays', function (Blueprint $table) {
            $table->foreignId('municipality_id')
                ->nullable()
                ->after('id')
                ->constrained()
                ->nullOnDelete();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('municipality_id')
                ->nullable()
                ->after('role')
                ->constrained()
                ->nullOnDelete();
        });

        $default = Municipality::query()->create([
            'code' => 'default-lgu',
            'name' => 'Default Local Government Unit',
            'system_name' => config('app.name', 'eBarangayHub'),
            'module_name' => 'SABIMS Module',
            'is_active' => true,
        ]);

        $municipalityNames = Barangay::query()
            ->whereNotNull('municipality')
            ->where('municipality', '!=', '')
            ->distinct()
            ->pluck('municipality');

        $nameToId = ['' => $default->id];

        foreach ($municipalityNames as $name) {
            $code = Str::slug((string) $name);
            if ($code === '') {
                continue;
            }

            $municipality = Municipality::query()->firstOrCreate(
                ['code' => $code],
                [
                    'name' => $name,
                    'system_name' => $name,
                    'module_name' => 'SABIMS Module',
                    'is_active' => true,
                ]
            );

            $nameToId[$name] = $municipality->id;
        }

        Barangay::query()->each(function (Barangay $barangay) use ($nameToId, $default): void {
            $key = (string) ($barangay->municipality ?? '');
            $barangay->update([
                'municipality_id' => $nameToId[$key] ?? $default->id,
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('municipality_id');
        });

        Schema::table('barangays', function (Blueprint $table) {
            $table->dropConstrainedForeignId('municipality_id');
        });
    }
};

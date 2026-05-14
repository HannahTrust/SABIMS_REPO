<?php

namespace App\Services;

use App\Models\Barangay;
use App\Models\Household;
use App\Models\Resident;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class PopulationAnalyticsService
{
    /**
     * Dashboard metrics scoped by barangay (and optionally purok for purok leaders).
     *
     * @return array{
     *     total_residents: int,
     *     total_households: int,
     *     active_residents: int,
     *     male: int,
     *     female: int,
     *     seniors: int,
     *     minors: int,
     *     pwd: int,
     *     voters: int,
     *     by_purok: list<array{name: string, count: int}>,
     *     gender_distribution: array{male: int, female: int, other: int},
     *     age_brackets: list<array{label: string, count: int}>,
     * }
     */
    public function dashboardForBarangay(Barangay $barangay, User $user): array
    {
        $residentScope = $this->scopedResidents($barangay, $user);

        $totalResidents = (clone $residentScope)->count();
        $householdScope = Household::query()->where('barangay_id', $barangay->id);
        if ($this->restrictToPurok($user)) {
            $householdScope->where('purok_id', $user->purok_id);
        }
        $totalHouseholds = $householdScope->count();

        $activeResidents = (clone $residentScope)->where('status', Resident::STATUS_ACTIVE)->count();

        $male = (clone $residentScope)->whereRaw('LOWER(TRIM(gender)) = ?', ['male'])->count();
        $female = (clone $residentScope)->whereRaw('LOWER(TRIM(gender)) = ?', ['female'])->count();
        $otherGender = max(0, $totalResidents - $male - $female);

        $seniors = (clone $residentScope)->where(function ($q): void {
            $q->where('senior_citizen', true)
                ->orWhere('age', '>=', 60);
        })->count();

        $minors = (clone $residentScope)->where('age', '<', 18)->count();

        $pwd = (clone $residentScope)->where('pwd_status', true)->count();
        $voters = (clone $residentScope)->where('voter_status', true)->count();

        $byPurok = $this->populationByPurok($barangay, $user);

        $brackets = $this->ageBrackets($residentScope);

        return [
            'total_residents' => $totalResidents,
            'total_households' => $totalHouseholds,
            'active_residents' => $activeResidents,
            'male' => $male,
            'female' => $female,
            'seniors' => $seniors,
            'minors' => $minors,
            'pwd' => $pwd,
            'voters' => $voters,
            'by_purok' => $byPurok,
            'by_barangay' => [],
            'gender_distribution' => [
                'male' => $male,
                'female' => $female,
                'other' => $otherGender,
            ],
            'age_brackets' => $brackets,
        ];
    }

    /**
     * System-wide aggregates for super admin overview (all barangays).
     *
     * @return array{
     *     total_residents: int,
     *     total_households: int,
     *     active_residents: int,
     *     male: int,
     *     female: int,
     *     seniors: int,
     *     minors: int,
     *     pwd: int,
     *     voters: int,
     *     by_purok: list<array{name: string, count: int}>,
     *     by_barangay: list<array{name: string, count: int}>,
     *     gender_distribution: array{male: int, female: int, other: int},
     *     age_brackets: list<array{label: string, count: int}>,
     * }
     */
    public function dashboardForAllBarangays(): array
    {
        $residentScope = Resident::query();

        $totalResidents = (clone $residentScope)->count();
        $totalHouseholds = Household::query()->count();

        $activeResidents = (clone $residentScope)->where('status', Resident::STATUS_ACTIVE)->count();

        $male = (clone $residentScope)->whereRaw('LOWER(TRIM(gender)) = ?', ['male'])->count();
        $female = (clone $residentScope)->whereRaw('LOWER(TRIM(gender)) = ?', ['female'])->count();
        $otherGender = max(0, $totalResidents - $male - $female);

        $seniors = (clone $residentScope)->where(function ($q): void {
            $q->where('senior_citizen', true)
                ->orWhere('age', '>=', 60);
        })->count();

        $minors = (clone $residentScope)->where('age', '<', 18)->count();

        $pwd = (clone $residentScope)->where('pwd_status', true)->count();
        $voters = (clone $residentScope)->where('voter_status', true)->count();

        $byBarangay = Resident::query()
            ->select(['barangays.name', DB::raw('count(*) as cnt')])
            ->join('barangays', 'barangays.id', '=', 'residents.barangay_id')
            ->groupBy('barangays.id', 'barangays.name')
            ->orderBy('barangays.name')
            ->get()
            ->map(fn ($row) => [
                'name' => (string) $row->name,
                'count' => (int) $row->cnt,
            ])
            ->all();

        $brackets = $this->ageBrackets($residentScope);

        return [
            'total_residents' => $totalResidents,
            'total_households' => $totalHouseholds,
            'active_residents' => $activeResidents,
            'male' => $male,
            'female' => $female,
            'seniors' => $seniors,
            'minors' => $minors,
            'pwd' => $pwd,
            'voters' => $voters,
            'by_purok' => [],
            'by_barangay' => $byBarangay,
            'gender_distribution' => [
                'male' => $male,
                'female' => $female,
                'other' => $otherGender,
            ],
            'age_brackets' => $brackets,
        ];
    }

    /**
     * @return list<array{name: string, count: int}>
     */
    protected function populationByPurok(Barangay $barangay, User $user): array
    {
        $q = Resident::query()
            ->select(['puroks.name', DB::raw('count(*) as cnt')])
            ->join('puroks', 'puroks.id', '=', 'residents.purok_id')
            ->where('residents.barangay_id', $barangay->id)
            ->groupBy('puroks.id', 'puroks.name')
            ->orderBy('puroks.name');

        if ($this->restrictToPurok($user)) {
            $q->where('residents.purok_id', $user->purok_id);
        }

        return $q->get()->map(fn ($row) => [
            'name' => (string) $row->name,
            'count' => (int) $row->cnt,
        ])->all();
    }

    /**
     * @param  Builder<Resident>  $residentScope
     * @return list<array{label: string, count: int}>
     */
    protected function ageBrackets(Builder $residentScope): array
    {
        $ranges = [
            ['label' => '0–5', 'min' => 0, 'max' => 5],
            ['label' => '6–12', 'min' => 6, 'max' => 12],
            ['label' => '13–17', 'min' => 13, 'max' => 17],
            ['label' => '18–59', 'min' => 18, 'max' => 59],
            ['label' => '60+', 'min' => 60, 'max' => 200],
        ];

        $out = [];
        foreach ($ranges as $r) {
            $out[] = [
                'label' => $r['label'],
                'count' => (clone $residentScope)
                    ->whereBetween('age', [$r['min'], $r['max']])
                    ->count(),
            ];
        }

        return $out;
    }

    /**
     * @return Builder<Resident>
     */
    protected function scopedResidents(Barangay $barangay, User $user): Builder
    {
        $q = Resident::query()->where('barangay_id', $barangay->id);

        if ($this->restrictToPurok($user)) {
            $q->where('purok_id', $user->purok_id);
        }

        return $q;
    }

    protected function restrictToPurok(User $user): bool
    {
        if ($user->isSuperAdmin()) {
            return false;
        }

        return User::normalizeRole($user->role ?? '') === 'purok_leader'
            && $user->purok_id !== null;
    }
}

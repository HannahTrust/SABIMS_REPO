<?php

namespace Modules\Blotter\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Blotter\Models\BlotterAttachment;
use Modules\Blotter\Models\BlotterReport;
use Modules\Blotter\Models\BlotterWitness;
use Modules\Blotter\Models\IncidentType;

class BlotterReportController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', BlotterReport::class);

        $user = $request->user();

        $filters = [
            'search' => trim((string) $request->query('search', '')),
            'status' => trim((string) $request->query('status', '')),
            'incident_type' => trim((string) $request->query('incident_type', '')),
            'purok' => trim((string) $request->query('purok', '')),
            'date_from' => trim((string) $request->query('date_from', '')),
            'date_to' => trim((string) $request->query('date_to', '')),
        ];

        $query = BlotterReport::query()->with([
            'incidentType:id,name',
            'complainant:id,name',
            'respondent:id,name',
        ]);

        if ($user && ! $user->hasRole('super_admin')) {
            $query->where('barangay_id', $user->barangay_id);
        }

        if ($user && $user->hasRole('purok_leader')) {
            $query->where(function (Builder $scope) use ($user): void {
                $scope->where('created_by', $user->id);

                if (isset($user->purok_id) && $user->purok_id !== null) {
                    $scope->orWhere('purok_id', $user->purok_id);
                }
            });
        }

        if ($filters['search'] !== '') {
            $term = $filters['search'];
            $query->where(function (Builder $searchQuery) use ($term): void {
                $searchQuery->where('blotter_number', 'like', "%{$term}%")
                    ->orWhere('respondent_name', 'like', "%{$term}%")
                    ->orWhereHas('incidentType', fn (Builder $incidentTypeQuery) => $incidentTypeQuery->where('name', 'like', "%{$term}%"))
                    ->orWhereHas('complainant', fn (Builder $complainantQuery) => $complainantQuery->where('name', 'like', "%{$term}%"))
                    ->orWhereHas('respondent', fn (Builder $respondentQuery) => $respondentQuery->where('name', 'like', "%{$term}%"));
            });
        }

        if ($filters['status'] !== '') {
            $query->where('status', $filters['status']);
        }

        if ($filters['incident_type'] !== '') {
            $query->whereHas('incidentType', fn (Builder $incidentTypeQuery) => $incidentTypeQuery->where('name', $filters['incident_type']));
        }

        if ($filters['purok'] !== '') {
            $query->where('purok_id', $filters['purok']);
        }

        if ($filters['date_from'] !== '') {
            $query->whereDate('incident_datetime', '>=', $filters['date_from']);
        }

        if ($filters['date_to'] !== '') {
            $query->whereDate('incident_datetime', '<=', $filters['date_to']);
        }

        $blotterReports = $query
            ->latest('incident_datetime')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (BlotterReport $report): array => [
                'id' => $report->id,
                'blotter_number' => $report->blotter_number,
                'incident_type' => $report->incidentType?->name ?? 'N/A',
                'complainant' => $report->complainant?->name ?? 'N/A',
                'respondent' => $report->respondent?->name ?? $report->respondent_name,
                'incident_datetime' => $report->incident_datetime?->toDateTimeString() ?? $report->created_at?->toDateTimeString(),
                'status' => $report->status,
                'purok' => $report->purok_id ? (string) $report->purok_id : null,
            ]);

        $incidentTypes = IncidentType::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->pluck('name')
            ->values()
            ->all();

        $puroks = BlotterReport::query()
            ->select('purok_id')
            ->when($user && ! $user->hasRole('super_admin'), fn (Builder $builder) => $builder->where('barangay_id', $user->barangay_id))
            ->whereNotNull('purok_id')
            ->distinct()
            ->orderBy('purok_id')
            ->pluck('purok_id')
            ->map(fn ($purokId) => (string) $purokId)
            ->values()
            ->all();

        return Inertia::render('Blotter/Index', [
            'blotterReports' => $blotterReports,
            'incidentTypes' => $incidentTypes,
            'puroks' => $puroks,
            'filters' => $filters,
        ]);
    }

    public function create(Request $request): Response
    {
        Gate::authorize('create', BlotterReport::class);

        $user = $request->user();

        $residents = Resident::query()
            ->when($user && ! $user->hasRole('super_admin'), fn (Builder $builder) => $builder->where('barangay_id', $user->barangay_id))
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Resident $resident): array => ['id' => $resident->id, 'name' => $resident->name])
            ->values()
            ->all();

        $incidentTypes = IncidentType::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (IncidentType $type): array => ['id' => $type->id, 'name' => $type->name])
            ->values()
            ->all();

        $officers = User::query()
            ->when($user && ! $user->hasRole('super_admin'), fn (Builder $builder) => $builder->where('barangay_id', $user->barangay_id))
            ->whereIn('role', ['brgy_admin', 'brgy_secretary', 'lupon_officer', 'purok_leader'])
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (User $officer): array => ['id' => $officer->id, 'name' => $officer->name])
            ->values()
            ->all();

        return Inertia::render('Blotter/Create', [
            'incidentTypes' => $incidentTypes,
            'residents' => $residents,
            'officers' => $officers,
            'purokOptions' => collect(range(1, 10))
                ->map(fn (int $value): string => (string) $value)
                ->values()
                ->all(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('create', BlotterReport::class);

        $user = $request->user();

        if (! $user) {
            abort(401);
        }

        $validated = $request->validate([
            'purok_id' => ['nullable', 'integer', 'min:1'],
            'incident_type_id' => ['required', 'integer', 'exists:incident_types,id'],
            'complainant_id' => ['required', 'integer', 'exists:users,id'],
            'respondent_id' => ['nullable', 'integer', 'exists:users,id'],
            'respondent_name' => ['nullable', 'string', 'max:255'],
            'incident_datetime' => ['required', 'date'],
            'incident_location' => ['required', 'string', 'max:255'],
            'narrative' => ['required', 'string'],
            'action_taken' => ['nullable', 'string'],
            'remarks' => ['nullable', 'string'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
            'status' => ['required', Rule::in(['pending', 'under_mediation', 'scheduled', 'resolved', 'elevated', 'archived'])],
            'settlement_date' => ['nullable', 'date'],
            'witnesses' => ['array'],
            'witnesses.*.name' => ['required', 'string', 'max:255'],
            'witnesses.*.contact' => ['nullable', 'string', 'max:255'],
            'witnesses.*.statement' => ['nullable', 'string'],
            'attachments' => ['array'],
            'attachments.*' => ['file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
        ]);

        if (empty($validated['respondent_id']) && empty($validated['respondent_name'])) {
            throw ValidationException::withMessages([
                'respondent_name' => 'Provide a respondent resident or outsider name.',
            ]);
        }

        $complainantUser = User::query()->findOrFail((int) $validated['complainant_id']);

        if ($user->isSuperAdmin()) {
            $barangayId = (int) $complainantUser->barangay_id;
            if ($barangayId === 0) {
                throw ValidationException::withMessages([
                    'complainant_id' => 'Complainant must belong to a barangay.',
                ]);
            }
        } else {
            if ((int) $complainantUser->barangay_id !== (int) $user->barangay_id) {
                abort(403);
            }

            if (! empty($validated['respondent_id'])) {
                $respondent = User::query()->findOrFail((int) $validated['respondent_id']);
                if ((int) $respondent->barangay_id !== (int) $user->barangay_id) {
                    abort(403);
                }
            }
            $barangayId = (int) $user->barangay_id;
        }

        $report = BlotterReport::query()->create([
            'barangay_id' => $barangayId,
            'purok_id' => $validated['purok_id'] ?? null,
            'blotter_number' => $this->generateBlotterNumber($barangayId),
            'incident_type_id' => (int) $validated['incident_type_id'],
            'complainant_id' => (int) $validated['complainant_id'],
            'respondent_id' => ! empty($validated['respondent_id']) ? (int) $validated['respondent_id'] : null,
            'respondent_name' => $validated['respondent_name'] ?? null,
            'incident_datetime' => $validated['incident_datetime'],
            'incident_location' => $validated['incident_location'],
            'narrative' => $validated['narrative'],
            'action_taken' => $validated['action_taken'] ?? null,
            'remarks' => $validated['remarks'] ?? null,
            'assigned_to' => ! empty($validated['assigned_to']) ? (int) $validated['assigned_to'] : null,
            'status' => $validated['status'],
            'settlement_date' => $validated['settlement_date'] ?? null,
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);

        foreach ($validated['witnesses'] ?? [] as $witness) {
            BlotterWitness::query()->create([
                'blotter_report_id' => $report->id,
                'name' => $witness['name'],
                'contact' => $witness['contact'] ?? null,
                'statement' => $witness['statement'] ?? null,
            ]);
        }

        /** @var array<int, UploadedFile> $attachmentFiles */
        $attachmentFiles = $request->file('attachments', []);
        foreach ($attachmentFiles as $file) {
            $filePath = $file->store('blotter', 'public');

            BlotterAttachment::query()->create([
                'blotter_report_id' => $report->id,
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $filePath,
                'uploaded_by' => $user->id,
            ]);
        }

        logActivity('create', 'blotter', $report->id, "Created blotter report {$report->blotter_number}.");

        return redirect()->route('blotter-reports.index')->with('status', "Blotter report {$report->blotter_number} created successfully.");
    }

    public function show(BlotterReport $blotter_report): void
    {
        Gate::authorize('view', $blotter_report);
        abort(501, 'Blotter show not implemented yet.');
    }

    public function edit(BlotterReport $blotter_report): void
    {
        Gate::authorize('update', $blotter_report);
        abort(501, 'Blotter edit not implemented yet.');
    }

    public function update(Request $request, BlotterReport $blotter_report): RedirectResponse
    {
        Gate::authorize('update', $blotter_report);
        abort(501, 'Blotter update not implemented yet.');
    }

    public function destroy(BlotterReport $blotter_report): RedirectResponse
    {
        Gate::authorize('delete', $blotter_report);
        abort(501, 'Blotter delete not implemented yet.');
    }

    public function archive(BlotterReport $blotter_report): RedirectResponse
    {
        Gate::authorize('archive', $blotter_report);
        abort(501, 'Blotter archive not implemented yet.');
    }

    public function resolve(BlotterReport $blotter_report): RedirectResponse
    {
        Gate::authorize('resolve', $blotter_report);
        abort(501, 'Blotter resolve not implemented yet.');
    }

    public function print(BlotterReport $blotter_report): void
    {
        Gate::authorize('print', $blotter_report);
        abort(501, 'Blotter print not implemented yet.');
    }

    private function generateBlotterNumber(int $barangayId): string
    {
        $year = now()->year;
        $prefix = "BLT-{$year}-";

        $latestNumber = BlotterReport::query()
            ->where('barangay_id', $barangayId)
            ->where('blotter_number', 'like', "{$prefix}%")
            ->selectRaw('MAX(CAST(SUBSTRING(blotter_number, -4) AS UNSIGNED)) as max_suffix')
            ->value('max_suffix');

        $next = ((int) $latestNumber) + 1;

        return $prefix.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }
}

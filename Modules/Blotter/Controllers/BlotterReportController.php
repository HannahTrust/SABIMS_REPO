<?php

namespace Modules\Blotter\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ResidentUser;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
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

        $this->scopeReportsForUser($query, $user);
        $this->applyListFilters($query, $filters);

        $incidentReports = $query
            ->latest('incident_datetime')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (BlotterReport $report): array => [
                'id' => $report->id,
                'report_number' => $report->blotter_number,
                'incident_type' => $report->incidentType?->name ?? 'N/A',
                'complainant' => $report->complainant?->name ?? 'N/A',
                'respondent' => $report->respondent?->name ?? $report->respondent_name,
                'incident_datetime' => $report->incident_datetime?->toDateTimeString() ?? $report->created_at?->toDateTimeString(),
                'status' => $report->status,
                'purok' => $report->purok_id ? (string) $report->purok_id : null,
            ]);

        return Inertia::render('IncidentReport/Index', [
            'incidentReports' => $incidentReports,
            'incidentTypes' => $this->activeIncidentTypeNames(),
            'puroks' => $this->distinctPurokIds($user),
            'filters' => $filters,
            'canCreate' => $user ? Gate::forUser($user)->allows('create', BlotterReport::class) : false,
        ]);
    }

    public function create(Request $request): Response
    {
        Gate::authorize('create', BlotterReport::class);

        return Inertia::render('IncidentReport/Create', $this->formOptions($request));
    }

    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('create', BlotterReport::class);

        $user = $request->user();

        if (! $user) {
            abort(401);
        }

        $validated = $request->validate($this->validationRules());

        $barangayId = $this->resolveBarangayIdForSubmission($user, $validated);

        $report = BlotterReport::query()->create([
            'barangay_id' => $barangayId,
            'purok_id' => $validated['purok_id'] ?? null,
            'blotter_number' => $this->generateReportNumber($barangayId),
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

        $this->syncWitnesses($report, $validated['witnesses'] ?? []);
        $this->storeAttachments($request, $report, $user->id);

        logActivity('create', 'incident_report', $report->id, "Created incident report {$report->blotter_number}.");

        return redirect()
            ->route('incident-reports.show', $report)
            ->with('status', "Incident report {$report->blotter_number} created successfully.");
    }

    public function show(Request $request, BlotterReport $blotter_report): Response
    {
        Gate::authorize('view', $blotter_report);

        $blotter_report->load([
            'incidentType:id,name',
            'complainant:id,name',
            'respondent:id,name',
            'assignedOfficer:id,name',
            'barangay:id,name,code',
            'witnesses',
            'attachments.uploader:id,name',
        ]);

        $user = $request->user();

        return Inertia::render('IncidentReport/Show', [
            'report' => $this->formatReport($blotter_report),
            'canEdit' => $user ? Gate::forUser($user)->allows('update', $blotter_report) : false,
            'canResolve' => $user ? Gate::forUser($user)->allows('resolve', $blotter_report) : false,
            'canArchive' => $user ? Gate::forUser($user)->allows('archive', $blotter_report) : false,
            'canDelete' => $user ? Gate::forUser($user)->allows('delete', $blotter_report) : false,
            'canPrint' => $user ? Gate::forUser($user)->allows('print', $blotter_report) : false,
        ]);
    }

    public function edit(Request $request, BlotterReport $blotter_report): Response
    {
        Gate::authorize('update', $blotter_report);

        $blotter_report->load(['witnesses', 'incidentType:id,name']);

        return Inertia::render('IncidentReport/Edit', array_merge(
            $this->formOptions($request),
            ['report' => $this->formatReportForEdit($blotter_report)],
        ));
    }

    public function update(Request $request, BlotterReport $blotter_report): RedirectResponse
    {
        Gate::authorize('update', $blotter_report);

        $user = $request->user();

        if (! $user) {
            abort(401);
        }

        $validated = $request->validate($this->validationRules());

        $this->resolveBarangayIdForSubmission($user, $validated, $blotter_report);

        $blotter_report->update([
            'purok_id' => $validated['purok_id'] ?? null,
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
            'updated_by' => $user->id,
        ]);

        $blotter_report->witnesses()->delete();
        $this->syncWitnesses($blotter_report, $validated['witnesses'] ?? []);
        $this->storeAttachments($request, $blotter_report, $user->id);

        logActivity('update', 'incident_report', $blotter_report->id, "Updated incident report {$blotter_report->blotter_number}.");

        return redirect()
            ->route('incident-reports.show', $blotter_report)
            ->with('status', "Incident report {$blotter_report->blotter_number} updated successfully.");
    }

    public function destroy(BlotterReport $blotter_report): RedirectResponse
    {
        Gate::authorize('delete', $blotter_report);

        $number = $blotter_report->blotter_number;
        $id = $blotter_report->id;

        $blotter_report->delete();

        logActivity('delete', 'incident_report', $id, "Deleted incident report {$number}.");

        return redirect()
            ->route('incident-reports.index')
            ->with('status', "Incident report {$number} deleted successfully.");
    }

    public function archive(Request $request, BlotterReport $blotter_report): RedirectResponse
    {
        Gate::authorize('archive', $blotter_report);

        $user = $request->user();

        $blotter_report->update([
            'status' => 'archived',
            'updated_by' => $user?->id ?? $blotter_report->updated_by,
        ]);

        logActivity('archive', 'incident_report', $blotter_report->id, "Archived incident report {$blotter_report->blotter_number}.");

        return redirect()
            ->route('incident-reports.show', $blotter_report)
            ->with('status', "Incident report {$blotter_report->blotter_number} archived.");
    }

    public function resolve(Request $request, BlotterReport $blotter_report): RedirectResponse
    {
        Gate::authorize('resolve', $blotter_report);

        $user = $request->user();

        $validated = $request->validate([
            'settlement_date' => ['nullable', 'date'],
            'remarks' => ['nullable', 'string'],
        ]);

        $blotter_report->update([
            'status' => 'resolved',
            'settlement_date' => $validated['settlement_date'] ?? now()->toDateString(),
            'remarks' => $validated['remarks'] ?? $blotter_report->remarks,
            'updated_by' => $user?->id ?? $blotter_report->updated_by,
        ]);

        logActivity('resolve', 'incident_report', $blotter_report->id, "Resolved incident report {$blotter_report->blotter_number}.");

        return redirect()
            ->route('incident-reports.show', $blotter_report)
            ->with('status', "Incident report {$blotter_report->blotter_number} marked as resolved.");
    }

    public function print(BlotterReport $blotter_report): Response
    {
        Gate::authorize('print', $blotter_report);

        $blotter_report->load([
            'incidentType:id,name',
            'complainant:id,name',
            'respondent:id,name',
            'assignedOfficer:id,name',
            'barangay:id,name,code',
            'witnesses',
        ]);

        return Inertia::render('IncidentReport/Print', [
            'report' => $this->formatReport($blotter_report),
            'printed_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function formOptions(Request $request): array
    {
        $user = $request->user();

        $residents = ResidentUser::query()
            ->when($user && ! $user->hasRole('super_admin'), fn (Builder $builder) => $builder->where('barangay_id', $user->barangay_id))
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (ResidentUser $resident): array => ['id' => $resident->id, 'name' => $resident->name])
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

        return [
            'incidentTypes' => $incidentTypes,
            'residents' => $residents,
            'officers' => $officers,
            'purokOptions' => collect(range(1, 10))
                ->map(fn (int $value): string => (string) $value)
                ->values()
                ->all(),
        ];
    }

    /**
     * @return array<string, array<int, mixed>|string>
     */
    private function validationRules(): array
    {
        return [
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
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    private function resolveBarangayIdForSubmission(User $user, array $validated, ?BlotterReport $existing = null): int
    {
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

            if ($existing !== null && (int) $existing->barangay_id !== $barangayId) {
                abort(403);
            }
        }

        return $barangayId;
    }

    private function scopeReportsForUser(Builder $query, ?User $user): void
    {
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
    }

    /**
     * @param  array<string, string>  $filters
     */
    private function applyListFilters(Builder $query, array $filters): void
    {
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
    }

    /**
     * @return list<string>
     */
    private function activeIncidentTypeNames(): array
    {
        return IncidentType::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->pluck('name')
            ->values()
            ->all();
    }

    /**
     * @return list<string>
     */
    private function distinctPurokIds(?User $user): array
    {
        return BlotterReport::query()
            ->select('purok_id')
            ->when($user && ! $user->hasRole('super_admin'), fn (Builder $builder) => $builder->where('barangay_id', $user->barangay_id))
            ->whereNotNull('purok_id')
            ->distinct()
            ->orderBy('purok_id')
            ->pluck('purok_id')
            ->map(fn ($purokId) => (string) $purokId)
            ->values()
            ->all();
    }

    /**
     * @param  list<array{name: string, contact?: string|null, statement?: string|null}>  $witnesses
     */
    private function syncWitnesses(BlotterReport $report, array $witnesses): void
    {
        foreach ($witnesses as $witness) {
            BlotterWitness::query()->create([
                'blotter_report_id' => $report->id,
                'name' => $witness['name'],
                'contact' => $witness['contact'] ?? null,
                'statement' => $witness['statement'] ?? null,
            ]);
        }
    }

    private function storeAttachments(Request $request, BlotterReport $report, int $userId): void
    {
        /** @var array<int, UploadedFile> $attachmentFiles */
        $attachmentFiles = $request->file('attachments', []);

        foreach ($attachmentFiles as $file) {
            $filePath = $file->store('incident-reports', 'public');

            BlotterAttachment::query()->create([
                'blotter_report_id' => $report->id,
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $filePath,
                'uploaded_by' => $userId,
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function formatReport(BlotterReport $report): array
    {
        return [
            'id' => $report->id,
            'report_number' => $report->blotter_number,
            'purok_id' => $report->purok_id,
            'incident_type' => $report->incidentType ? [
                'id' => $report->incidentType->id,
                'name' => $report->incidentType->name,
            ] : null,
            'complainant' => $report->complainant ? [
                'id' => $report->complainant->id,
                'name' => $report->complainant->name,
            ] : null,
            'respondent' => $report->respondent ? [
                'id' => $report->respondent->id,
                'name' => $report->respondent->name,
            ] : null,
            'respondent_name' => $report->respondent_name,
            'incident_datetime' => $report->incident_datetime?->toDateTimeString(),
            'incident_location' => $report->incident_location,
            'narrative' => $report->narrative,
            'action_taken' => $report->action_taken,
            'remarks' => $report->remarks,
            'assigned_officer' => $report->assignedOfficer ? [
                'id' => $report->assignedOfficer->id,
                'name' => $report->assignedOfficer->name,
            ] : null,
            'status' => $report->status,
            'settlement_date' => $report->settlement_date?->toDateString(),
            'barangay' => $report->barangay ? [
                'id' => $report->barangay->id,
                'name' => $report->barangay->name,
                'code' => $report->barangay->code,
            ] : null,
            'witnesses' => $report->witnesses?->map(fn (BlotterWitness $witness): array => [
                'id' => $witness->id,
                'name' => $witness->name,
                'contact' => $witness->contact,
                'statement' => $witness->statement,
            ])->values()->all() ?? [],
            'attachments' => $report->attachments?->map(fn (BlotterAttachment $attachment): array => [
                'id' => $attachment->id,
                'file_name' => $attachment->file_name,
                'file_url' => Storage::disk('public')->url($attachment->file_path),
            ])->values()->all() ?? [],
            'created_at' => $report->created_at?->toDateTimeString(),
            'updated_at' => $report->updated_at?->toDateTimeString(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatReportForEdit(BlotterReport $report): array
    {
        $formatted = $this->formatReport($report);
        $formatted['incident_type_id'] = (string) ($report->incident_type_id ?? '');
        $formatted['complainant_id'] = (string) ($report->complainant_id ?? '');
        $formatted['respondent_id'] = $report->respondent_id ? (string) $report->respondent_id : '';
        $formatted['respondent_mode'] = $report->respondent_id ? 'resident' : 'outsider';
        $formatted['assigned_to'] = $report->assigned_to ? (string) $report->assigned_to : '';
        $formatted['purok_id'] = $report->purok_id ? (string) $report->purok_id : '';
        $formatted['incident_datetime'] = $report->incident_datetime?->format('Y-m-d\TH:i') ?? '';

        return $formatted;
    }

    private function generateReportNumber(int $barangayId): string
    {
        $year = now()->year;
        $prefix = "INC-{$year}-";

        $latestNumber = BlotterReport::query()
            ->where('barangay_id', $barangayId)
            ->where(function (Builder $query) use ($prefix, $year): void {
                $query->where('blotter_number', 'like', "{$prefix}%")
                    ->orWhere('blotter_number', 'like', "BLT-{$year}-%");
            })
            ->selectRaw('MAX(CAST(SUBSTRING(blotter_number, -4) AS UNSIGNED)) as max_suffix')
            ->value('max_suffix');

        $next = ((int) $latestNumber) + 1;

        return $prefix.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrdinanceRequest;
use App\Http\Requests\UpdateOrdinanceRequest;
use App\Models\Committee;
use App\Models\CouncilSession;
use App\Models\Ordinance;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OrdinanceController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Ordinance::query()->with([
            'committee:id,name',
            'session:id,session_date',
            'creator:id,name',
            'approver:id,name',
        ]);

        if ($user && $user->hasRole('sb_member') && ! $user->isSuperAdmin()) {
            $committeeIds = $user->committees()->pluck('committees.id');
            $query->whereIn('committee_id', $committeeIds);
        }

        $filters = [
            'q' => (string) $request->query('q', ''),
            'status' => (string) $request->query('status', ''),
            'committee_id' => (string) $request->query('committee_id', ''),
            'year' => (string) $request->query('year', ''),
        ];

        if ($filters['q'] !== '') {
            $q = $filters['q'];
            $query->where(function ($sub) use ($q) {
                $sub->where('title', 'like', "%{$q}%")
                    ->orWhere('ordinance_number', 'like', "%{$q}%");
            });
        }

        if ($filters['status'] !== '') {
            $query->where('status', $filters['status']);
        }

        if ($filters['committee_id'] !== '' && is_numeric($filters['committee_id'])) {
            $query->where('committee_id', (int) $filters['committee_id']);
        }

        if ($filters['year'] !== '' && is_numeric($filters['year'])) {
            $query->whereYear('created_at', (int) $filters['year']);
        }

        $ordinances = $query
            ->orderByDesc('created_at')
            ->get();

        $canCreate = $user && ($user->isSuperAdmin() || $user->hasRole('sb_secretary'));

        return Inertia::render('Ordinances/Index', [
            'ordinances' => $ordinances->map(fn (Ordinance $o) => [
                'id' => $o->id,
                'title' => $o->title,
                'ordinance_number' => $o->ordinance_number,
                'status' => $o->status,
                'created_at' => $o->created_at?->toDateString(),
                'committee' => $o->committee ? ['id' => $o->committee->id, 'name' => $o->committee->name] : null,
            ])->values()->all(),
            'filters' => $filters,
            'committees' => Committee::query()->orderBy('name')->get(['id', 'name']),
            'statuses' => Ordinance::statuses(),
            'canCreate' => $canCreate,
        ]);
    }

    public function create(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        if (! $user || ! ($user->isSuperAdmin() || $user->hasRole('sb_secretary'))) {
            abort(403);
        }

        $sessions = CouncilSession::query()->orderByDesc('session_date')->get(['id', 'session_date']);
        $committees = Committee::query()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Ordinances/Create', [
            'sessions' => $sessions->map(fn ($s) => ['id' => $s->id, 'session_date' => $s->session_date->toDateString()])->values()->all(),
            'committees' => $committees->map(fn ($c) => ['id' => $c->id, 'name' => $c->name])->values()->all(),
            'statuses' => [Ordinance::STATUS_DRAFT, Ordinance::STATUS_REVIEWED],
        ]);
    }

    public function store(StoreOrdinanceRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if (in_array($validated['status'], [Ordinance::STATUS_APPROVED, Ordinance::STATUS_ARCHIVED], true)) {
            throw ValidationException::withMessages([
                'status' => 'Use Approve/Archive actions to set this status.',
            ]);
        }

        $filePath = null;
        if ($request->hasFile('document')) {
            $filePath = $request->file('document')->store('ordinances', 'public');
        }

        $ordinance = Ordinance::create([
            'title' => $validated['title'],
            'ordinance_number' => $validated['ordinance_number'] ?? null,
            'description' => $validated['description'] ?? null,
            'committee_id' => (int) $validated['committee_id'],
            'session_id' => $validated['session_id'] ? (int) $validated['session_id'] : null,
            'status' => $validated['status'],
            'file_path' => $filePath,
            'created_by' => $request->user()->id,
        ]);

        logActivity(
            'create',
            'ordinance',
            $ordinance->id,
            'Created ordinance: '.($ordinance->ordinance_number ? "{$ordinance->ordinance_number} — " : '').$ordinance->title,
        );

        return redirect()->route('ordinances.index')->with('status', 'Ordinance created successfully.');
    }

    public function show(Request $request, Ordinance $ordinance): Response
    {
        $ordinance->load([
            'committee:id,name',
            'session:id,session_date',
            'creator:id,name',
            'approver:id,name',
        ]);

        $user = $request->user();
        $isSecretary = (bool) ($user && ($user->isSuperAdmin() || $user->hasRole('sb_secretary')));

        $fileUrl = $ordinance->file_path ? Storage::disk('public')->url($ordinance->file_path) : null;

        return Inertia::render('Ordinances/Show', [
            'ordinance' => [
                'id' => $ordinance->id,
                'title' => $ordinance->title,
                'ordinance_number' => $ordinance->ordinance_number,
                'description' => $ordinance->description,
                'committee_id' => $ordinance->committee_id,
                'session_id' => $ordinance->session_id,
                'status' => $ordinance->status,
                'file_path' => $ordinance->file_path,
                'file_url' => $fileUrl,
                'committee' => $ordinance->committee ? ['id' => $ordinance->committee->id, 'name' => $ordinance->committee->name] : null,
                'session' => $ordinance->session ? ['id' => $ordinance->session->id, 'session_date' => $ordinance->session->session_date->toDateString()] : null,
                'created_by' => $ordinance->creator ? ['id' => $ordinance->creator->id, 'name' => $ordinance->creator->name] : null,
                'approved_by' => $ordinance->approver ? ['id' => $ordinance->approver->id, 'name' => $ordinance->approver->name] : null,
                'approved_at' => $ordinance->approved_at?->toDateTimeString(),
                'created_at' => $ordinance->created_at?->toDateTimeString(),
                'updated_at' => $ordinance->updated_at?->toDateTimeString(),
            ],
            'canEdit' => $isSecretary && $ordinance->isEditable(),
            'canApprove' => $isSecretary && $ordinance->status !== Ordinance::STATUS_APPROVED && $ordinance->status !== Ordinance::STATUS_ARCHIVED,
            'canArchive' => $isSecretary && $ordinance->status === Ordinance::STATUS_APPROVED,
        ]);
    }

    public function edit(Request $request, Ordinance $ordinance): Response|RedirectResponse
    {
        $user = $request->user();
        if (! $user || ! ($user->isSuperAdmin() || $user->hasRole('sb_secretary'))) {
            abort(403);
        }
        if (! $ordinance->isEditable()) {
            abort(403, 'This ordinance is read-only.');
        }

        $sessions = CouncilSession::query()->orderByDesc('session_date')->get(['id', 'session_date']);
        $committees = Committee::query()->orderBy('name')->get(['id', 'name']);

        $fileUrl = $ordinance->file_path ? Storage::disk('public')->url($ordinance->file_path) : null;

        return Inertia::render('Ordinances/Edit', [
            'ordinance' => [
                'id' => $ordinance->id,
                'title' => $ordinance->title,
                'ordinance_number' => $ordinance->ordinance_number,
                'description' => $ordinance->description,
                'committee_id' => $ordinance->committee_id,
                'session_id' => $ordinance->session_id,
                'status' => $ordinance->status,
                'file_path' => $ordinance->file_path,
                'file_url' => $fileUrl,
            ],
            'sessions' => $sessions->map(fn ($s) => ['id' => $s->id, 'session_date' => $s->session_date->toDateString()])->values()->all(),
            'committees' => $committees->map(fn ($c) => ['id' => $c->id, 'name' => $c->name])->values()->all(),
            'statuses' => [Ordinance::STATUS_DRAFT, Ordinance::STATUS_REVIEWED],
        ]);
    }

    public function update(UpdateOrdinanceRequest $request, Ordinance $ordinance): RedirectResponse
    {
        if (! $ordinance->isEditable()) {
            abort(403, 'This ordinance is read-only.');
        }

        $validated = $request->validated();

        if (in_array($validated['status'], [Ordinance::STATUS_APPROVED, Ordinance::STATUS_ARCHIVED], true)) {
            throw ValidationException::withMessages([
                'status' => 'Use Approve/Archive actions to set this status.',
            ]);
        }

        $filePath = $ordinance->file_path;
        $remove = (bool) ($validated['remove_document'] ?? false);

        if ($remove && $filePath) {
            Storage::disk('public')->delete($filePath);
            $filePath = null;
        }

        if ($request->hasFile('document')) {
            if ($filePath) {
                Storage::disk('public')->delete($filePath);
            }
            $filePath = $request->file('document')->store('ordinances', 'public');
        }

        $ordinance->update([
            'title' => $validated['title'],
            'ordinance_number' => $validated['ordinance_number'] ?? null,
            'description' => $validated['description'] ?? null,
            'committee_id' => (int) $validated['committee_id'],
            'session_id' => $validated['session_id'] ? (int) $validated['session_id'] : null,
            'status' => $validated['status'],
            'file_path' => $filePath,
        ]);

        logActivity(
            'update',
            'ordinance',
            $ordinance->id,
            'Updated ordinance: '.($ordinance->ordinance_number ? "{$ordinance->ordinance_number} — " : '').$ordinance->title,
        );

        return redirect()->route('ordinances.index')->with('status', 'Ordinance updated successfully.');
    }

    public function destroy(Request $request, Ordinance $ordinance): RedirectResponse
    {
        $user = $request->user();
        if (! $user || ! ($user->isSuperAdmin() || $user->hasRole('sb_secretary'))) {
            abort(403);
        }
        if (! $ordinance->isEditable()) {
            abort(403, 'This ordinance cannot be deleted.');
        }

        $ordinanceId = $ordinance->id;
        $label = ($ordinance->ordinance_number ? "{$ordinance->ordinance_number} — " : '').$ordinance->title;

        $ordinance->delete();

        logActivity('delete', 'ordinance', $ordinanceId, "Deleted ordinance: {$label}");

        return redirect()->route('ordinances.index')->with('status', 'Ordinance deleted successfully.');
    }

    public function approve(Request $request, Ordinance $ordinance): RedirectResponse
    {
        $user = $request->user();
        if (! $user || ! ($user->isSuperAdmin() || $user->hasRole('sb_secretary'))) {
            abort(403);
        }
        if ($ordinance->status === Ordinance::STATUS_ARCHIVED) {
            abort(422, 'Archived ordinances cannot be approved.');
        }
        if ($ordinance->status === Ordinance::STATUS_APPROVED) {
            return redirect()->route('ordinances.show', $ordinance)->with('status', 'Ordinance already approved.');
        }

        $ordinance->update([
            'status' => Ordinance::STATUS_APPROVED,
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        logActivity(
            'approve',
            'ordinance',
            $ordinance->id,
            'Approved ordinance: '.($ordinance->ordinance_number ? "{$ordinance->ordinance_number} — " : '').$ordinance->title,
        );

        return redirect()->route('ordinances.show', $ordinance)->with('status', 'Ordinance approved successfully.');
    }

    public function archive(Request $request, Ordinance $ordinance): RedirectResponse
    {
        $user = $request->user();
        if (! $user || ! ($user->isSuperAdmin() || $user->hasRole('sb_secretary'))) {
            abort(403);
        }
        if ($ordinance->status !== Ordinance::STATUS_APPROVED) {
            abort(422, 'Only approved ordinances can be archived.');
        }

        $ordinance->update(['status' => Ordinance::STATUS_ARCHIVED]);

        logActivity(
            'archive',
            'ordinance',
            $ordinance->id,
            'Archived ordinance: '.($ordinance->ordinance_number ? "{$ordinance->ordinance_number} — " : '').$ordinance->title,
        );

        return redirect()->route('ordinances.show', $ordinance)->with('status', 'Ordinance archived successfully.');
    }
}

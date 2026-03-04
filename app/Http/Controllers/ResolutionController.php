<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreResolutionRequest;
use App\Http\Requests\UpdateResolutionRequest;
use App\Models\Committee;
use App\Models\CouncilSession;
use App\Models\Resolution;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ResolutionController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $query = Resolution::query()->with(['session:id,session_date', 'committee:id,name', 'createdBy:id,name']);

        if ($user && $user->role === 'sb_member') {
            $committeeIds = $user->committees()->pluck('committees.id');
            $query->whereIn('committee_id', $committeeIds);
        }

        $resolutions = $query->orderByDesc('year')->orderBy('resolution_number')->get();
        $canCreate = $user && $user->role === 'secretary';

        return Inertia::render('Resolutions/Index', [
            'resolutions' => $resolutions,
            'canCreate' => $canCreate,
        ]);
    }

    public function create(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        if (! $user || $user->role !== 'secretary') {
            abort(403);
        }
        $sessions = CouncilSession::query()->orderByDesc('session_date')->get(['id', 'session_date']);
        $committees = Committee::query()->orderBy('name')->get(['id', 'name']);
        return Inertia::render('Resolutions/Create', [
            'sessions' => $sessions->map(fn ($s) => ['id' => $s->id, 'session_date' => $s->session_date->toDateString()])->values()->all(),
            'committees' => $committees->map(fn ($c) => ['id' => $c->id, 'name' => $c->name])->values()->all(),
        ]);
    }

    public function store(StoreResolutionRequest $request): RedirectResponse
    {
        Resolution::create([
            'resolution_number' => $request->validated('resolution_number'),
            'title' => $request->validated('title'),
            'description' => $request->validated('description'),
            'session_id' => $request->validated('session_id'),
            'committee_id' => $request->validated('committee_id'),
            'status' => $request->validated('status'),
            'voting_result' => $request->validated('voting_result'),
            'file_path' => $request->validated('file_path'),
            'year' => $request->validated('year'),
            'created_by' => $request->user()->id,
        ]);
        return redirect()->route('resolutions.index')->with('status', 'Resolution created successfully.');
    }

    public function edit(Request $request, Resolution $resolution): Response|RedirectResponse
    {
        $user = $request->user();
        if (! $user || $user->role !== 'secretary') {
            abort(403);
        }
        $sessions = CouncilSession::query()->orderByDesc('session_date')->get(['id', 'session_date']);
        $committees = Committee::query()->orderBy('name')->get(['id', 'name']);
        return Inertia::render('Resolutions/Edit', [
            'resolution' => [
                'id' => $resolution->id,
                'resolution_number' => $resolution->resolution_number,
                'title' => $resolution->title,
                'description' => $resolution->description,
                'session_id' => $resolution->session_id,
                'committee_id' => $resolution->committee_id,
                'status' => $resolution->status,
                'voting_result' => $resolution->voting_result,
                'file_path' => $resolution->file_path,
                'year' => $resolution->year,
            ],
            'sessions' => $sessions->map(fn ($s) => ['id' => $s->id, 'session_date' => $s->session_date->toDateString()])->values()->all(),
            'committees' => $committees->map(fn ($c) => ['id' => $c->id, 'name' => $c->name])->values()->all(),
        ]);
    }

    public function update(UpdateResolutionRequest $request, Resolution $resolution): RedirectResponse
    {
        $resolution->update($request->validated());
        return redirect()->route('resolutions.index')->with('status', 'Resolution updated successfully.');
    }

    public function destroy(Request $request, Resolution $resolution): RedirectResponse
    {
        $user = $request->user();
        if (! $user || $user->role !== 'secretary') {
            abort(403);
        }
        $resolution->delete();
        return redirect()->route('resolutions.index')->with('status', 'Resolution deleted successfully.');
    }
}

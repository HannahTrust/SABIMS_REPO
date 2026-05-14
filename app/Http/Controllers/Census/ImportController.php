<?php

namespace App\Http\Controllers\Census;

use App\Http\Controllers\Census\Concerns\ResolvesCensusBarangay;
use App\Http\Controllers\Controller;
use App\Models\Barangay;
use App\Models\ResidentImportLog;
use App\Services\CensusImportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ImportController extends Controller
{
    use ResolvesCensusBarangay;

    public function __construct(
        protected CensusImportService $importService
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ResidentImportLog::class);

        $user = $request->user();
        $barangay = $this->optionalCensusBarangay($request);

        $barangays = [];
        if ($user?->isSuperAdmin()) {
            $barangays = Barangay::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code'])
                ->map(fn (Barangay $b) => ['id' => $b->id, 'name' => $b->name, 'code' => $b->code])
                ->values()
                ->all();
        }

        $logsQuery = ResidentImportLog::query()
            ->with('uploadedBy:id,name')
            ->orderByDesc('created_at')
            ->limit(25);

        if ($barangay !== null) {
            $logsQuery->where('barangay_id', $barangay->id);
        } elseif (! $user?->isSuperAdmin()) {
            $logsQuery->whereRaw('1 = 0');
        }

        $logs = $logsQuery->get()->map(fn (ResidentImportLog $log) => [
            'id' => $log->id,
            'file_name' => $log->file_name,
            'status' => $log->status,
            'total_rows' => $log->total_rows,
            'successful_imports' => $log->successful_imports,
            'failed_imports' => $log->failed_imports,
            'created_at' => $log->created_at?->toIso8601String(),
            'uploaded_by' => $log->uploadedBy?->name,
        ])->all();

        return Inertia::render('Census/Import/Index', [
            'barangay_id' => $barangay?->id,
            'barangays' => $barangays,
            'logs' => $logs,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', ResidentImportLog::class);

        $user = $request->user();
        $validated = $request->validate([
            'file' => ['required', 'file', 'max:12288'],
            'barangay_id' => ['nullable', 'integer', 'exists:barangays,id'],
        ]);

        $barangayId = $validated['barangay_id'] ?? null;
        if ($user && ! $user->isSuperAdmin()) {
            $barangayId = $user->barangay_id;
        }
        if ($barangayId === null) {
            return back()->withErrors(['barangay_id' => 'Select a barangay.']);
        }

        $barangay = Barangay::query()->findOrFail($barangayId);

        $file = $request->file('file');
        if ($file === null) {
            return back()->withErrors(['file' => 'File is required.']);
        }

        $storagePath = $this->importService->storeUploadedFile($file);

        ['rows' => $rows] = $this->importService->parseStoredFile($storagePath);

        $log = ResidentImportLog::query()->create([
            'barangay_id' => $barangay->id,
            'uploaded_by' => $user->id,
            'file_name' => $file->getClientOriginalName(),
            'storage_path' => $storagePath,
            'total_rows' => count($rows),
            'successful_imports' => 0,
            'failed_imports' => 0,
            'status' => ResidentImportLog::STATUS_PREVIEW,
        ]);

        $params = ['import_log' => $log->id];
        if ($user?->isSuperAdmin()) {
            $params['barangay_id'] = $barangay->id;
        }

        return redirect()
            ->route('residents.import.show', $params)
            ->with('status', 'File uploaded. Review validation below.');
    }

    public function show(Request $request, ResidentImportLog $import_log): Response
    {
        $this->authorize('view', $import_log);

        if ($import_log->storage_path === null || $import_log->storage_path === '') {
            return Inertia::render('Census/Import/Show', [
                'log' => $this->logProps($import_log),
                'preview_rows' => [],
                'validation' => null,
                'can_commit' => false,
            ]);
        }

        ['rows' => $rows] = $this->importService->parseStoredFile($import_log->storage_path);
        $validation = $this->importService->validateImport($import_log->barangay, $rows);

        $previewRows = array_slice($rows, 0, 50);

        $canCommit = $import_log->status === ResidentImportLog::STATUS_PREVIEW;

        return Inertia::render('Census/Import/Show', [
            'log' => $this->logProps($import_log),
            'preview_rows' => $previewRows,
            'validation' => $validation,
            'can_commit' => $canCommit,
        ]);
    }

    public function commit(Request $request, ResidentImportLog $import_log): RedirectResponse
    {
        $this->authorize('commit', $import_log);

        $user = $request->user();
        if ($import_log->status !== ResidentImportLog::STATUS_PREVIEW) {
            return back()->withErrors(['status' => 'This import was already processed.']);
        }

        $this->importService->processImport($import_log->fresh());

        $params = [];
        if ($user?->isSuperAdmin()) {
            $params['barangay_id'] = $import_log->barangay_id;
        }

        return redirect()
            ->route('residents.import.index', $params)
            ->with('status', 'Import finished.');
    }

    public function downloadErrors(Request $request, ResidentImportLog $import_log): StreamedResponse
    {
        $this->authorize('downloadErrors', $import_log);

        return $this->importService->generateImportReport($import_log);
    }

    /**
     * @return array<string, mixed>
     */
    protected function logProps(ResidentImportLog $log): array
    {
        return [
            'id' => $log->id,
            'file_name' => $log->file_name,
            'status' => $log->status,
            'total_rows' => $log->total_rows,
            'successful_imports' => $log->successful_imports,
            'failed_imports' => $log->failed_imports,
            'created_at' => $log->created_at?->toIso8601String(),
        ];
    }
}

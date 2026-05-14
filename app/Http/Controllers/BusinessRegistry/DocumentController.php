<?php

namespace App\Http\Controllers\BusinessRegistry;

use App\Http\Controllers\Controller;
use App\Http\Requests\BusinessRegistry\StoreBusinessDocumentsRequest;
use App\Models\Business;
use App\Models\BusinessDocument;
use App\Services\BusinessRegistryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    public function __construct(
        protected BusinessRegistryService $registry
    ) {}

    public function store(StoreBusinessDocumentsRequest $request, Business $business): RedirectResponse
    {
        $batch = [];
        foreach ($request->input('documents', []) as $i => $row) {
            $file = $request->file("documents.$i.file");
            if (! is_array($row) || $file === null) {
                continue;
            }
            $batch[] = [
                'document_type' => (string) ($row['document_type'] ?? ''),
                'file' => $file,
            ];
        }

        if ($batch === []) {
            return redirect()->back()->withErrors(['documents' => __('No valid files were uploaded.')]);
        }

        $this->registry->uploadDocuments($business, $batch, $request->user(), $request->ip());

        return redirect()
            ->back()
            ->with('status', __('Documents uploaded.'));
    }

    public function destroy(Request $request, Business $business, BusinessDocument $document): RedirectResponse
    {
        $this->authorize('update', $business);

        if ((int) $document->business_id !== (int) $business->id) {
            abort(404);
        }

        $this->registry->deleteDocument($document, $request->user(), $request->ip());

        return redirect()
            ->back()
            ->with('status', __('Document removed.'));
    }
}

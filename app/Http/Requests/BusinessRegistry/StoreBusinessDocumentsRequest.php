<?php

namespace App\Http\Requests\BusinessRegistry;

use App\Models\Business;
use Illuminate\Foundation\Http\FormRequest;

class StoreBusinessDocumentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Business|null $business */
        $business = $this->route('business');

        return $business instanceof Business
            && ($this->user()?->can('uploadDocuments', $business) ?? false);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'documents' => ['required', 'array', 'min:1'],
            'documents.*.document_type' => ['required', 'string', 'max:64'],
            'documents.*.file' => ['required', 'file', 'max:10240'],
        ];
    }
}

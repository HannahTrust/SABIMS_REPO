<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCouncilSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user && ($user->isSuperAdmin() || $user->hasRole('sb_secretary'));
    }

    protected function prepareForValidation(): void
    {
        if ($this->committee_id === '') {
            $this->merge(['committee_id' => null]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'session_title' => ['required', 'string', 'max:255'],
            'session_date' => ['required', 'date'],
            'committee_id' => ['nullable', 'integer', 'exists:committees,id'],
            'agenda' => ['nullable', 'string', 'max:65535'],
            'minutes_type' => ['required', 'in:upload,text'],
            'minutes_file' => ['nullable', 'file', 'mimes:pdf,doc,docx'],
            'minutes_content' => ['nullable', 'string'],
        ];
    }
}

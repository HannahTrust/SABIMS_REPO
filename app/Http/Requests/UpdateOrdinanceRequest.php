<?php

namespace App\Http\Requests;

use App\Models\Ordinance;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrdinanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return (bool) ($user && ($user->isSuperAdmin() || $user->hasRole('sb_secretary')));
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Ordinance $ordinance */
        $ordinance = $this->route('ordinance');

        return [
            'title' => ['required', 'string', 'max:255'],
            'ordinance_number' => ['nullable', 'string', 'max:255', Rule::unique('ordinances', 'ordinance_number')->ignore($ordinance->id)],
            'description' => ['nullable', 'string', 'max:65535'],
            'committee_id' => ['required', 'exists:committees,id'],
            'session_id' => ['nullable', 'exists:council_sessions,id'],
            'status' => ['required', 'string', Rule::in(Ordinance::statuses())],
            'document' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:20480'],
            'remove_document' => ['nullable', 'boolean'],
        ];
    }
}

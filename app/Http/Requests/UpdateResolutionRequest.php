<?php

namespace App\Http\Requests;

use App\Models\Resolution;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateResolutionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user && ($user->isSuperAdmin() || $user->hasRole('sb_secretary'));
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $resolution = $this->route('resolution');

        return [
            'resolution_number' => ['required', 'string', 'max:255', Rule::unique('resolutions', 'resolution_number')->ignore($resolution->id)],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:65535'],
            'session_id' => ['required', 'exists:council_sessions,id'],
            'committee_id' => ['required', 'exists:committees,id'],
            'status' => ['required', 'string', Rule::in(Resolution::statuses())],
            'visibility' => ['required', 'string', Rule::in(Resolution::visibilities())],
            'voting_result' => ['nullable', 'string', 'max:255'],
            'file_path' => ['nullable', 'string', 'max:255'],
            'year' => ['required', 'integer', 'min:2000', 'max:2100'],
        ];
    }
}

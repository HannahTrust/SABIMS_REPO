<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCommitteeRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user && ($user->isSuperAdmin() || $user->hasRole('admin', 'sb_secretary'));
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $committee = $this->route('committee');

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('committees', 'name')->ignore($committee->id)],
            'description' => ['nullable', 'string', 'max:65535'],
        ];
    }
}

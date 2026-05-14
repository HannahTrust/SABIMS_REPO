<?php

namespace App\Http\Requests\Census;

use App\Models\Resident;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateResidentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'purok_id' => ['sometimes', 'integer', 'exists:puroks,id'],
            'household_id' => ['nullable', 'integer', 'exists:households,id'],
            'first_name' => ['sometimes', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:32'],
            'birth_date' => ['sometimes', 'date'],
            'gender' => ['sometimes', 'string', 'max:32'],
            'civil_status' => ['sometimes', 'string', 'max:64'],
            'nationality' => ['nullable', 'string', 'max:64'],
            'contact_number' => ['nullable', 'string', 'max:32'],
            'email' => ['nullable', 'string', 'max:255', 'email'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'educational_attainment' => ['nullable', 'string', 'max:255'],
            'voter_status' => ['boolean'],
            'senior_citizen' => ['boolean'],
            'pwd_status' => ['boolean'],
            'status' => ['sometimes', 'string', Rule::in(Resident::STATUSES)],
            'remarks' => ['nullable', 'string', 'max:65535'],
        ];
    }
}

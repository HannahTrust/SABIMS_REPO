<?php

namespace App\Http\Requests\Census;

use App\Models\Resident;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreResidentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $user = $this->user();
        if ($user && ! $user->isSuperAdmin() && $user->barangay_id) {
            $this->merge(['barangay_id' => $user->barangay_id]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'barangay_id' => ['required', 'integer', 'exists:barangays,id'],
            'purok_id' => ['required', 'integer', 'exists:puroks,id'],
            'household_id' => ['nullable', 'integer', 'exists:households,id'],
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:32'],
            'birth_date' => ['required', 'date'],
            'gender' => ['required', 'string', 'max:32'],
            'civil_status' => ['required', 'string', 'max:64'],
            'nationality' => ['nullable', 'string', 'max:64'],
            'contact_number' => ['nullable', 'string', 'max:32'],
            'email' => ['nullable', 'string', 'max:255', 'email'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'educational_attainment' => ['nullable', 'string', 'max:255'],
            'voter_status' => ['boolean'],
            'senior_citizen' => ['boolean'],
            'pwd_status' => ['boolean'],
            'status' => ['required', 'string', Rule::in(Resident::STATUSES)],
            'remarks' => ['nullable', 'string', 'max:65535'],
        ];
    }
}

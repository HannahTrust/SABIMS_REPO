<?php

namespace App\Http\Requests;

use App\Models\Barangay;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePurokRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->input('purok_leader_user_id') === '' || $this->input('purok_leader_user_id') === null) {
            $this->merge(['purok_leader_user_id' => null]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Barangay $barangay */
        $barangay = $this->route('barangay');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('puroks', 'name')->where(fn ($q) => $q->where('barangay_id', $barangay->id)),
            ],
            'code' => ['nullable', 'string', 'max:64'],
            'description' => ['nullable', 'string', 'max:65535'],
            'purok_leader_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}

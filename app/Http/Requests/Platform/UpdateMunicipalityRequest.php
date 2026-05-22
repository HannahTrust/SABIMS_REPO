<?php

namespace App\Http\Requests\Platform;

use App\Models\Municipality;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMunicipalityRequest extends FormRequest
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
        /** @var Municipality $municipality */
        $municipality = $this->route('municipality');

        return [
            'code' => ['required', 'string', 'max:64', 'alpha_dash', Rule::unique('municipalities', 'code')->ignore($municipality->id)],
            'name' => ['required', 'string', 'max:255'],
            'system_name' => ['required', 'string', 'max:255'],
            'module_name' => ['nullable', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
            'logo' => ['nullable', 'image', 'max:4096'],
        ];
    }
}

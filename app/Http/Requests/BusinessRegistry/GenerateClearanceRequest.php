<?php

namespace App\Http\Requests\BusinessRegistry;

use App\Models\Business;
use Illuminate\Foundation\Http\FormRequest;

class GenerateClearanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Business|null $business */
        $business = $this->route('business');

        return $business instanceof Business
            && ($this->user()?->can('generateClearance', $business) ?? false);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'expiration_date' => ['nullable', 'date', 'after_or_equal:today'],
            'remarks' => ['nullable', 'string'],
        ];
    }
}

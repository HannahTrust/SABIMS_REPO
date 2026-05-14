<?php

namespace App\Http\Requests\BusinessRegistry;

use App\Models\Business;
use Illuminate\Foundation\Http\FormRequest;

class RenewPermitRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Business|null $business */
        $business = $this->route('business');

        return $business instanceof Business
            && ($this->user()?->can('renewPermit', $business) ?? false);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'permit_number' => ['nullable', 'string', 'max:255'],
            'permit_issue_date' => ['nullable', 'date'],
            'permit_expiration_date' => ['nullable', 'date', 'after_or_equal:permit_issue_date'],
        ];
    }

    /**
     * @return array{permit_number?: string|null, permit_issue_date?: string|null, permit_expiration_date?: string|null}
     */
    public function permitPayload(): array
    {
        return $this->only(['permit_number', 'permit_issue_date', 'permit_expiration_date']);
    }
}

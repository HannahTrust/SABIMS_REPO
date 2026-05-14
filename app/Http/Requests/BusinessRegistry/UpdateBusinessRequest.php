<?php

namespace App\Http\Requests\BusinessRegistry;

use App\Models\Business;
use App\Models\BusinessCategory;
use App\Models\Purok;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBusinessRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->has('owner_resident_id') && $this->input('owner_resident_id') === '') {
            $this->merge(['owner_resident_id' => null]);
        }

        $owners = $this->input('additional_owners', []);
        if (! is_array($owners)) {
            return;
        }

        foreach ($owners as $i => $row) {
            if (! is_array($row)) {
                continue;
            }
            if (($row['resident_id'] ?? '') === '') {
                $owners[$i]['resident_id'] = null;
            }
        }

        $this->merge(['additional_owners' => $owners]);
    }

    public function authorize(): bool
    {
        /** @var Business|null $business */
        $business = $this->route('business');

        return $business instanceof Business
            && ($this->user()?->can('update', $business) ?? false);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Business $business */
        $business = $this->route('business');
        $barangayId = (int) $business->barangay_id;

        return [
            'purok_id' => ['sometimes', 'required', 'integer', Rule::exists('puroks', 'id')->where('barangay_id', $barangayId)],
            'business_category_id' => ['sometimes', 'required', 'integer', Rule::exists('business_categories', 'id')->where('is_active', true)],
            'business_name' => ['sometimes', 'required', 'string', 'max:255'],
            'owner_resident_id' => ['nullable', 'integer', Rule::exists('residents', 'id')->where('barangay_id', $barangayId)],
            'owner_name' => ['sometimes', 'required', 'string', 'max:255'],
            'owner_contact' => ['sometimes', 'required', 'string', 'max:64'],
            'owner_email' => ['nullable', 'email', 'max:255'],
            'business_type' => ['sometimes', 'required', 'string', Rule::in(Business::BUSINESS_TYPES)],
            'address' => ['sometimes', 'required', 'string'],
            'business_description' => ['nullable', 'string'],
            'date_started' => ['sometimes', 'required', 'date'],
            'permit_number' => ['nullable', 'string', 'max:255'],
            'permit_issue_date' => ['nullable', 'date'],
            'permit_expiration_date' => ['nullable', 'date', 'after_or_equal:permit_issue_date'],
            'status' => ['nullable', 'string', Rule::in(Business::STATUSES)],
            'monthly_income_estimate' => ['nullable', 'numeric', 'min:0'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'remarks' => ['nullable', 'string'],
            'logo' => ['nullable', 'image', 'max:5120'],
            'additional_owners' => ['nullable', 'array'],
            'additional_owners.*.resident_id' => ['nullable', 'integer', Rule::exists('residents', 'id')->where('barangay_id', $barangayId)],
            'additional_owners.*.full_name' => ['required_with:additional_owners', 'string', 'max:255'],
            'additional_owners.*.contact_number' => ['required_with:additional_owners', 'string', 'max:64'],
            'additional_owners.*.email' => ['nullable', 'email', 'max:255'],
            'additional_owners.*.ownership_percentage' => ['nullable', 'integer', 'min:0', 'max:100'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if ($this->filled('business_category_id')) {
                $exists = BusinessCategory::query()
                    ->where('id', $this->integer('business_category_id'))
                    ->where('is_active', true)
                    ->exists();
                if (! $exists) {
                    $validator->errors()->add('business_category_id', __('Invalid or inactive business category.'));
                }
            }

            /** @var Business $business */
            $business = $this->route('business');
            $barangayId = (int) $business->barangay_id;

            if ($this->filled('purok_id')) {
                $ok = Purok::query()
                    ->where('id', $this->integer('purok_id'))
                    ->where('barangay_id', $barangayId)
                    ->exists();
                if (! $ok) {
                    $validator->errors()->add('purok_id', __('The selected purok does not belong to this barangay.'));
                }
            }
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function businessPayload(): array
    {
        return $this->only([
            'purok_id',
            'business_category_id',
            'business_name',
            'owner_resident_id',
            'owner_name',
            'owner_contact',
            'owner_email',
            'business_type',
            'address',
            'business_description',
            'date_started',
            'permit_number',
            'permit_issue_date',
            'permit_expiration_date',
            'status',
            'monthly_income_estimate',
            'latitude',
            'longitude',
            'remarks',
        ]);
    }

    /**
     * @return list<array{resident_id?: int|null, full_name: string, contact_number: string, email?: string|null, ownership_percentage?: int|null}>
     */
    public function additionalOwnersPayload(): array
    {
        $rows = $this->input('additional_owners', []);

        if (! is_array($rows)) {
            return [];
        }

        $out = [];
        foreach ($rows as $row) {
            if (! is_array($row) || empty($row['full_name'])) {
                continue;
            }
            $out[] = [
                'resident_id' => isset($row['resident_id']) && $row['resident_id'] !== '' ? (int) $row['resident_id'] : null,
                'full_name' => (string) $row['full_name'],
                'contact_number' => (string) ($row['contact_number'] ?? ''),
                'email' => isset($row['email']) && $row['email'] !== '' ? (string) $row['email'] : null,
                'ownership_percentage' => isset($row['ownership_percentage']) && $row['ownership_percentage'] !== ''
                    ? (int) $row['ownership_percentage']
                    : null,
            ];
        }

        return $out;
    }
}

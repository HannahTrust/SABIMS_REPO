<?php

namespace App\Http\Requests\BusinessRegistry;

use App\Models\Business;
use App\Models\BusinessCategory;
use App\Models\Purok;
use App\Models\Resident;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBusinessRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->input('owner_resident_id') === '' || $this->input('owner_resident_id') === null) {
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
        return $this->user()?->can('create', Business::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $user = $this->user();

        return [
            'barangay_id' => [
                Rule::requiredIf(fn () => $user && $user->isSuperAdmin()),
                'nullable',
                'integer',
                'exists:barangays,id',
            ],
            'purok_id' => ['required', 'integer', 'exists:puroks,id'],
            'business_category_id' => ['required', 'integer', Rule::exists('business_categories', 'id')->where('is_active', true)],
            'business_name' => ['required', 'string', 'max:255'],
            'owner_resident_id' => ['nullable', 'integer', 'exists:residents,id'],
            'owner_name' => ['required', 'string', 'max:255'],
            'owner_contact' => ['required', 'string', 'max:64'],
            'owner_email' => ['nullable', 'email', 'max:255'],
            'business_type' => ['required', 'string', Rule::in(Business::BUSINESS_TYPES)],
            'address' => ['required', 'string'],
            'business_description' => ['nullable', 'string'],
            'date_started' => ['required', 'date'],
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
            'additional_owners.*.resident_id' => ['nullable', 'integer', 'exists:residents,id'],
            'additional_owners.*.full_name' => ['required_with:additional_owners', 'string', 'max:255'],
            'additional_owners.*.contact_number' => ['required_with:additional_owners', 'string', 'max:64'],
            'additional_owners.*.email' => ['nullable', 'email', 'max:255'],
            'additional_owners.*.ownership_percentage' => ['nullable', 'integer', 'min:0', 'max:100'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $barangayId = $this->resolveBarangayId();
            if ($barangayId === null) {
                return;
            }

            $purokId = (int) $this->input('purok_id');
            if ($purokId < 1) {
                return;
            }

            $ok = Purok::query()
                ->where('id', $purokId)
                ->where('barangay_id', $barangayId)
                ->exists();

            if (! $ok) {
                $validator->errors()->add('purok_id', __('The selected purok does not belong to this barangay.'));
            }

            if ($this->filled('business_category_id')) {
                $exists = BusinessCategory::query()
                    ->where('id', $this->integer('business_category_id'))
                    ->where('is_active', true)
                    ->exists();
                if (! $exists) {
                    $validator->errors()->add('business_category_id', __('Invalid or inactive business category.'));
                }
            }

            if ($this->filled('owner_resident_id')) {
                $residentOk = Resident::query()
                    ->where('id', $this->integer('owner_resident_id'))
                    ->where('barangay_id', $barangayId)
                    ->exists();
                if (! $residentOk) {
                    $validator->errors()->add('owner_resident_id', __('The selected resident is not in this barangay.'));
                }
            }

            foreach ($this->input('additional_owners', []) as $i => $row) {
                if (! empty($row['resident_id'])) {
                    $rOk = Resident::query()
                        ->where('id', (int) $row['resident_id'])
                        ->where('barangay_id', $barangayId)
                        ->exists();
                    if (! $rOk) {
                        $validator->errors()->add(
                            "additional_owners.{$i}.resident_id",
                            __('The selected resident is not in this barangay.')
                        );
                    }
                }
            }
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function businessAttributes(): array
    {
        $barangayId = $this->resolveBarangayId();

        return [
            'barangay_id' => $barangayId,
            'purok_id' => $this->integer('purok_id'),
            'business_category_id' => $this->integer('business_category_id'),
            'business_name' => $this->string('business_name')->toString(),
            'owner_resident_id' => $this->filled('owner_resident_id') ? $this->integer('owner_resident_id') : null,
            'owner_name' => $this->string('owner_name')->toString(),
            'owner_contact' => $this->string('owner_contact')->toString(),
            'owner_email' => $this->filled('owner_email') ? $this->string('owner_email')->toString() : null,
            'business_type' => $this->string('business_type')->toString(),
            'address' => $this->string('address')->toString(),
            'business_description' => $this->filled('business_description') ? $this->string('business_description')->toString() : null,
            'date_started' => $this->date('date_started')->format('Y-m-d'),
            'permit_number' => $this->filled('permit_number') ? $this->string('permit_number')->toString() : null,
            'permit_issue_date' => $this->filled('permit_issue_date') ? $this->date('permit_issue_date')->format('Y-m-d') : null,
            'permit_expiration_date' => $this->filled('permit_expiration_date') ? $this->date('permit_expiration_date')->format('Y-m-d') : null,
            'status' => $this->filled('status') ? $this->string('status')->toString() : Business::STATUS_PENDING,
            'monthly_income_estimate' => $this->filled('monthly_income_estimate') ? $this->input('monthly_income_estimate') : null,
            'latitude' => $this->filled('latitude') ? $this->input('latitude') : null,
            'longitude' => $this->filled('longitude') ? $this->input('longitude') : null,
            'remarks' => $this->filled('remarks') ? $this->string('remarks')->toString() : null,
        ];
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

    protected function resolveBarangayId(): ?int
    {
        $user = $this->user();
        if ($user === null) {
            return null;
        }

        if ($user->isSuperAdmin()) {
            return $this->filled('barangay_id') ? $this->integer('barangay_id') : null;
        }

        return $user->barangay_id !== null ? (int) $user->barangay_id : null;
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCommitteeMembersRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && $user->hasRole('admin', 'secretary', 'vice_mayor');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $validMemberIds = \App\Models\User::query()
            ->where('role', 'sb_member')
            ->pluck('id')
            ->toArray();

        return [
            'members' => ['required', 'array', 'min:1'],
            'members.*' => [
                'required',
                'integer',
                Rule::in($validMemberIds),
            ],
            'chair_id' => [
                'required',
                'integer',
                Rule::in($validMemberIds),
                function (string $attribute, mixed $value, \Closure $fail) {
                    $members = $this->input('members', []);
                    if (! in_array((int) $value, array_map('intval', $members), true)) {
                        $fail('The chair must be one of the selected members.');
                    }
                },
            ],
        ];
    }
}

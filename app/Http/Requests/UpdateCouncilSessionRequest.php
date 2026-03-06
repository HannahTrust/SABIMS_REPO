<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCouncilSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && $user->role === 'secretary';
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'session_date' => ['required', 'date'],
            'agenda' => ['nullable', 'string', 'max:65535'],
            'minutes_type' => ['required', 'in:upload,text'],
            'minutes_file' => ['nullable', 'file', 'mimes:pdf,doc,docx'],
            'minutes_content' => ['nullable', 'string'],
        ];
    }
}

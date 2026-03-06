<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCouncilSessionRequest extends FormRequest
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
            'minutes_type' => ['nullable', 'in:upload,text'],
            'minutes_file' => ['nullable', 'file', 'mimes:pdf,doc,docx'],
            'minutes_content' => ['nullable', 'string'],
        ];
    }
}

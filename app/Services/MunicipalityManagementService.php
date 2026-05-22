<?php

namespace App\Services;

use App\Models\Municipality;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class MunicipalityManagementService
{
    public const LOGO_DIR = 'municipalities/logos';

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, ?UploadedFile $logo = null): Municipality
    {
        if ($logo !== null) {
            $data['logo_path'] = $this->storeLogo($logo);
        }

        return Municipality::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Municipality $municipality, array $data, ?UploadedFile $logo = null): Municipality
    {
        if ($logo !== null) {
            $this->deleteLogoIfSet($municipality->logo_path);
            $data['logo_path'] = $this->storeLogo($logo);
        }

        $municipality->update($data);

        return $municipality->fresh();
    }

    public function storeLogo(UploadedFile $logo): string
    {
        return $logo->store(self::LOGO_DIR, 'public');
    }

    public function deleteLogoIfSet(?string $path): void
    {
        if ($path !== null && $path !== '' && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}

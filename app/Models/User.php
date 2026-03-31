<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /** @return list<string> */
    public static function allowedRoles(): array
    {
        return [
            'super_admin',
            'admin',
            'vice_mayor',
            'secretary',
            'sb_member',
        ];
    }

    /**
     * Normalize role for comparison (handles variants like "SB Member" -> sb_member).
     */
    public static function normalizeRole(?string $role): ?string
    {
        if ($role === null || $role === '') {
            return null;
        }

        $normalized = strtolower(str_replace([' ', '-'], '_', trim($role)));

        return match ($normalized) {
            'super_admin', 'superadmin', 'super_admin_user' => 'super_admin',
            'system_admin' => 'admin',
            'sb_member', 'sbmember' => 'sb_member',
            'vice_mayor', 'vicemayor' => 'vice_mayor',
            'secretary' => 'secretary',
            'admin' => 'admin',
            'user' => 'sb_member',
            default => $normalized,
        };
    }

    /**
     * Check if the user has one of the given roles (uses normalized role).
     */
    public function hasRole(string ...$roles): bool
    {
        $normalized = self::normalizeRole($this->role);
        if ($normalized === null || $normalized === '') {
            return false;
        }
        $allowed = array_filter(array_map(fn (string $r) => self::normalizeRole($r), $roles));

        return in_array($normalized, $allowed, true);
    }

    /**
     * Get the committees the user is a member of (pivot includes is_chair).
     */
    public function committees(): BelongsToMany
    {
        return $this->belongsToMany(Committee::class, 'committee_user')
            ->withPivot('is_chair')
            ->withTimestamps();
    }

    /**
     * Council sessions created by this user.
     */
    public function createdCouncilSessions(): HasMany
    {
        return $this->hasMany(CouncilSession::class, 'created_by');
    }

    /**
     * Attendances recorded for this user.
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Resolutions created by this user.
     */
    public function createdResolutions(): HasMany
    {
        return $this->hasMany(Resolution::class, 'created_by');
    }
}

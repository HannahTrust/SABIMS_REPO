<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, TwoFactorAuthenticatable;

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
        'barangay_id',
        'purok_id',
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
            'sb_secretary',
            'sb_member',
            'brgy_admin',
            'brgy_captain',
            'brgy_secretary',
            'lupon_officer',
            'purok_leader',
            'resident',
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
            'sb_secretary', 'sbsecretary' => 'sb_secretary',
            'secretary' => 'sb_secretary',
            'brgy_secretary', 'barangay_secretary', 'brgysecretary', 'barangaysecretary' => 'brgy_secretary',
            'lupon_officer', 'luponofficer', 'lupon' => 'lupon_officer',
            'brgy_admin', 'barangay_admin', 'brgyadmin', 'barangayadmin' => 'brgy_admin',
            'brgy_captain', 'barangay_captain', 'brgycaptain', 'barangaycaptain', 'punong_barangay', 'punongbarangay' => 'brgy_captain',
            'purok_leader', 'purokleader', 'purok' => 'purok_leader',
            'resident', 'residents', 'citizen' => 'resident',
            'admin' => 'admin',
            'user' => 'sb_member',
            default => $normalized,
        };
    }

    /**
     * System-wide administrator (bypasses module role gates via middleware / Gate::before).
     */
    public function isSuperAdmin(): bool
    {
        return self::normalizeRole($this->role) === 'super_admin';
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
     * The barangay this user belongs to (only for barangay-level roles like
     * brgy_captain, brgy_secretary, resident, purok_leader).
     */
    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    /**
     * Resident assignment to a purok within the barangay.
     */
    public function purok(): BelongsTo
    {
        return $this->belongsTo(Purok::class);
    }

    /**
     * Puroks where this user is the designated leader.
     */
    public function ledPuroks(): HasMany
    {
        return $this->hasMany(Purok::class, 'purok_leader_user_id');
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

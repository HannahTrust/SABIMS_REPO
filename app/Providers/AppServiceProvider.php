<?php

namespace App\Providers;

use App\Models\Barangay;
use App\Models\BarangayOfficial;
use App\Models\CouncilSession;
use App\Models\Purok;
use App\Models\User;
use App\Policies\BarangayOfficialPolicy;
use App\Policies\BarangayPolicy;
use App\Policies\PurokPolicy;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Modules\Blotter\Models\BlotterReport;
use Modules\Blotter\Policies\BlotterReportPolicy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        require_once app_path('helpers.php');
        Route::bind('session', fn (string $value) => CouncilSession::findOrFail($value));
        Gate::policy(BlotterReport::class, BlotterReportPolicy::class);
        Gate::policy(Barangay::class, BarangayPolicy::class);
        Gate::policy(Purok::class, PurokPolicy::class);
        Gate::policy(BarangayOfficial::class, BarangayOfficialPolicy::class);

        Gate::before(function ($user, string $ability) {
            if ($user instanceof User && $user->isSuperAdmin()) {
                return true;
            }

            return null;
        });

        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }
}

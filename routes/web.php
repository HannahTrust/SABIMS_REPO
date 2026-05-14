<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\BarangayController;
use App\Http\Controllers\BarangayOfficialController;
use App\Http\Controllers\BusinessRegistry\BusinessController as RegistryBusinessController;
use App\Http\Controllers\BusinessRegistry\ClearanceController as RegistryClearanceController;
use App\Http\Controllers\BusinessRegistry\DashboardController as RegistryDashboardController;
use App\Http\Controllers\BusinessRegistry\DocumentController as RegistryDocumentController;
use App\Http\Controllers\BusinessRegistry\PermitController as RegistryPermitController;
use App\Http\Controllers\Census\DashboardController as CensusDashboardController;
use App\Http\Controllers\Census\HouseholdController as CensusHouseholdController;
use App\Http\Controllers\Census\ImportController as CensusImportController;
use App\Http\Controllers\Census\ResidentController as CensusResidentController;
use App\Http\Controllers\CommitteeController;
use App\Http\Controllers\CouncilSessionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrdinanceController;
use App\Http\Controllers\PurokController;
use App\Http\Controllers\ResolutionController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth'])->group(function () {
    // Barangay master data — policies + permissions scope super_admin / brgy_admin
    Route::prefix('management/barangays')
        ->middleware('role:super_admin,brgy_admin')
        ->group(function () {
            Route::get('/', [BarangayController::class, 'index'])
                ->middleware('permission:barangay.view')
                ->name('management.barangays.index');
            Route::get('/create', [BarangayController::class, 'create'])
                ->middleware('permission:barangay.create')
                ->name('management.barangays.create');
            Route::post('/', [BarangayController::class, 'store'])
                ->middleware('permission:barangay.create')
                ->name('management.barangays.store');
            Route::get('/{barangay}/edit', [BarangayController::class, 'edit'])
                ->middleware('permission:barangay.view')
                ->name('management.barangays.edit');
            Route::put('/{barangay}', [BarangayController::class, 'update'])
                ->middleware('permission:barangay.update')
                ->name('management.barangays.update');
            Route::delete('/{barangay}', [BarangayController::class, 'destroy'])
                ->middleware('permission:barangay.delete')
                ->name('management.barangays.destroy');

            Route::prefix('{barangay}')->scopeBindings()->group(function () {
                Route::get('/puroks', [PurokController::class, 'index'])
                    ->middleware('permission:purok.view')
                    ->name('management.barangays.puroks.index');
                Route::post('/puroks', [PurokController::class, 'store'])
                    ->middleware('permission:purok.create')
                    ->name('management.barangays.puroks.store');
                Route::put('/puroks/{purok}', [PurokController::class, 'update'])
                    ->middleware('permission:purok.update')
                    ->name('management.barangays.puroks.update');
                Route::delete('/puroks/{purok}', [PurokController::class, 'destroy'])
                    ->middleware('permission:purok.delete')
                    ->name('management.barangays.puroks.destroy');

                Route::get('/officials', [BarangayOfficialController::class, 'index'])
                    ->middleware('permission:official.view')
                    ->name('management.barangays.officials.index');
                Route::post('/officials', [BarangayOfficialController::class, 'store'])
                    ->middleware('permission:official.create')
                    ->name('management.barangays.officials.store');
                Route::put('/officials/{official}', [BarangayOfficialController::class, 'update'])
                    ->middleware('permission:official.update')
                    ->name('management.barangays.officials.update');
                Route::post('/officials/{official}/end-term', [BarangayOfficialController::class, 'endTerm'])
                    ->middleware('permission:official.assign')
                    ->name('management.barangays.officials.end-term');
                Route::post('/officials/{official}/set-current', [BarangayOfficialController::class, 'setCurrent'])
                    ->middleware('permission:official.assign')
                    ->name('management.barangays.officials.set-current');
            });
        });

    // Committees: any authenticated user can view index/show; only admin/sb_secretary can create/edit/delete
    Route::get('committees', [CommitteeController::class, 'index'])->name('committees.index');
    Route::get('committees/create', [CommitteeController::class, 'create'])->middleware('role:admin,sb_secretary')->name('committees.create');
    Route::post('committees', [CommitteeController::class, 'store'])->middleware('role:admin,sb_secretary')->name('committees.store');
    Route::get('committees/{committee}', [CommitteeController::class, 'show'])->name('committees.show');
    Route::get('committees/{committee}/edit', [CommitteeController::class, 'edit'])->middleware('role:admin,sb_secretary')->name('committees.edit');
    Route::put('committees/{committee}', [CommitteeController::class, 'update'])->middleware('role:admin,sb_secretary')->name('committees.update');
    Route::delete('committees/{committee}', [CommitteeController::class, 'destroy'])->middleware('role:admin,sb_secretary')->name('committees.destroy');
    Route::get('committees/{committee}/manage-members', [CommitteeController::class, 'manageMembers'])->middleware('role:super_admin,admin,sb_secretary,vice_mayor')->name('committees.manage-members');
    Route::put('committees/{committee}/manage-members', [CommitteeController::class, 'updateMembers'])->middleware('role:admin,sb_secretary')->name('committees.manage-members.update');

    // Sessions: any authenticated user can view index/show/attendance; only sb_secretary can create/edit/delete
    Route::get('sessions', [CouncilSessionController::class, 'index'])->name('sessions.index');
    Route::get('sessions/create', [CouncilSessionController::class, 'create'])->middleware('role:sb_secretary')->name('sessions.create');
    Route::post('sessions', [CouncilSessionController::class, 'store'])->middleware('role:sb_secretary')->name('sessions.store');
    Route::get('sessions/{session}', [CouncilSessionController::class, 'show'])->name('sessions.show');
    Route::get('sessions/{session}/edit', [CouncilSessionController::class, 'edit'])->middleware('role:sb_secretary')->name('sessions.edit');
    Route::put('sessions/{session}', [CouncilSessionController::class, 'update'])->middleware('role:sb_secretary')->name('sessions.update');
    Route::delete('sessions/{session}', [CouncilSessionController::class, 'destroy'])->middleware('role:sb_secretary')->name('sessions.destroy');

    // Attendance: any authenticated user can view; only sb_secretary can update/open/close
    Route::get('sessions/{session}/attendance', [AttendanceController::class, 'index'])->name('sessions.attendance.index');
    Route::post('attendance/{attendance}', [AttendanceController::class, 'update'])->middleware('role:sb_secretary')->name('attendance.update');
    Route::post('sessions/{session}/attendance/open', [AttendanceController::class, 'openAttendance'])->middleware('role:sb_secretary')->name('sessions.attendance.open');
    Route::post('sessions/{session}/attendance/close', [AttendanceController::class, 'closeAttendance'])->middleware('role:sb_secretary')->name('sessions.attendance.close');

    // QR scan: any authenticated user (SB members scan to mark attendance)
    Route::get('attendance/scan/{session}/{token}', [AttendanceController::class, 'scan'])->name('attendance.scan');

    // Resolutions: any authenticated user can view index/show (controller filters by committee for sb_member); only sb_secretary can create/edit/delete
    Route::get('resolutions', [ResolutionController::class, 'index'])->name('resolutions.index');
    Route::get('resolutions/create', [ResolutionController::class, 'create'])->middleware('role:sb_secretary')->name('resolutions.create');
    Route::post('resolutions', [ResolutionController::class, 'store'])->middleware('role:sb_secretary')->name('resolutions.store');
    Route::get('resolutions/{resolution}', [ResolutionController::class, 'show'])->name('resolutions.show');
    Route::get('resolutions/{resolution}/edit', [ResolutionController::class, 'edit'])->middleware('role:sb_secretary')->name('resolutions.edit');
    Route::put('resolutions/{resolution}', [ResolutionController::class, 'update'])->middleware('role:sb_secretary')->name('resolutions.update');
    Route::delete('resolutions/{resolution}', [ResolutionController::class, 'destroy'])->middleware('role:sb_secretary')->name('resolutions.destroy');

    // Ordinances: any authenticated user can view index/show; only sb_secretary can create/edit/upload/approve/archive/delete
    Route::get('ordinances', [OrdinanceController::class, 'index'])->name('ordinances.index');
    Route::get('ordinances/create', [OrdinanceController::class, 'create'])->middleware('role:sb_secretary')->name('ordinances.create');
    Route::post('ordinances', [OrdinanceController::class, 'store'])->middleware('role:sb_secretary')->name('ordinances.store');
    Route::get('ordinances/{ordinance}', [OrdinanceController::class, 'show'])->name('ordinances.show');
    Route::get('ordinances/{ordinance}/edit', [OrdinanceController::class, 'edit'])->middleware('role:sb_secretary')->name('ordinances.edit');
    Route::put('ordinances/{ordinance}', [OrdinanceController::class, 'update'])->middleware('role:sb_secretary')->name('ordinances.update');
    Route::delete('ordinances/{ordinance}', [OrdinanceController::class, 'destroy'])->middleware('role:sb_secretary')->name('ordinances.destroy');
    Route::post('ordinances/{ordinance}/approve', [OrdinanceController::class, 'approve'])->middleware('role:sb_secretary')->name('ordinances.approve');
    Route::post('ordinances/{ordinance}/archive', [OrdinanceController::class, 'archive'])->middleware('role:sb_secretary')->name('ordinances.archive');

    // Users / Role Management: only super_admin
    Route::get('users', [UserManagementController::class, 'index'])->middleware('role:super_admin')->name('users.index');
    Route::patch('users/{user}/role', [UserManagementController::class, 'updateRole'])->middleware('role:super_admin')->name('users.update-role');
    Route::patch('users/{user}/status', [UserManagementController::class, 'updateStatus'])->middleware('role:super_admin')->name('users.update-status');

    Route::prefix('residents')->group(function () {
        Route::get('dashboard', [CensusDashboardController::class, 'index'])
            ->middleware('permission:resident.view')
            ->name('residents.dashboard');

        Route::get('/', [CensusResidentController::class, 'index'])
            ->middleware('permission:resident.view')
            ->name('residents.index');

        Route::get('create', [CensusResidentController::class, 'create'])
            ->middleware('permission:resident.create')
            ->name('residents.create');

        Route::post('/', [CensusResidentController::class, 'store'])
            ->middleware('permission:resident.create')
            ->name('residents.store');

        Route::get('export/csv', [CensusResidentController::class, 'exportCsv'])
            ->middleware('permission:resident.view')
            ->name('residents.export.csv');

        Route::get('export/print', [CensusResidentController::class, 'printList'])
            ->middleware('permission:resident.view')
            ->name('residents.export.print');

        Route::get('households', [CensusHouseholdController::class, 'index'])
            ->middleware('permission:household.manage')
            ->name('residents.households.index');

        Route::post('households', [CensusHouseholdController::class, 'store'])
            ->middleware('permission:household.manage')
            ->name('residents.households.store');

        Route::get('households/{household}', [CensusHouseholdController::class, 'show'])
            ->middleware('permission:household.manage')
            ->name('residents.households.show');

        Route::put('households/{household}', [CensusHouseholdController::class, 'update'])
            ->middleware('permission:household.manage')
            ->name('residents.households.update');

        Route::patch('households/{household}/head', [CensusHouseholdController::class, 'setHead'])
            ->middleware('permission:household.manage')
            ->name('residents.households.head');

        Route::get('import', [CensusImportController::class, 'index'])
            ->middleware('permission:resident.import')
            ->name('residents.import.index');

        Route::post('import', [CensusImportController::class, 'store'])
            ->middleware('permission:resident.import')
            ->name('residents.import.store');

        Route::get('import/{import_log}', [CensusImportController::class, 'show'])
            ->middleware('permission:resident.import')
            ->name('residents.import.show');

        Route::post('import/{import_log}/commit', [CensusImportController::class, 'commit'])
            ->middleware('permission:resident.import')
            ->name('residents.import.commit');

        Route::get('import/{import_log}/errors', [CensusImportController::class, 'downloadErrors'])
            ->middleware('permission:resident.import')
            ->name('residents.import.errors');

        Route::get('{resident}/edit', [CensusResidentController::class, 'edit'])
            ->whereNumber('resident')
            ->middleware('permission:resident.update')
            ->name('residents.edit');

        Route::put('{resident}', [CensusResidentController::class, 'update'])
            ->whereNumber('resident')
            ->middleware('permission:resident.update')
            ->name('residents.update');

        Route::patch('{resident}/archive', [CensusResidentController::class, 'archive'])
            ->whereNumber('resident')
            ->middleware('permission:resident.update')
            ->name('residents.archive');
    });

    Route::prefix('business-registry')->name('business-registry.')->group(function () {
        Route::get('dashboard', [RegistryDashboardController::class, 'index'])
            ->middleware(['permission:business.view'])
            ->name('dashboard');

        Route::get('analytics', function (Request $request) {
            return redirect()->route('business-registry.dashboard', $request->query());
        })->middleware(['permission:business.view'])->name('analytics');

        Route::get('businesses/export/csv', [RegistryBusinessController::class, 'exportCsv'])
            ->middleware(['permission:business.view'])
            ->name('businesses.export.csv');

        Route::get('businesses', [RegistryBusinessController::class, 'index'])
            ->middleware(['permission:business.view'])
            ->name('businesses.index');

        Route::get('businesses/create', [RegistryBusinessController::class, 'create'])
            ->middleware(['permission:business.create'])
            ->name('businesses.create');

        Route::post('businesses', [RegistryBusinessController::class, 'store'])
            ->middleware(['permission:business.create'])
            ->name('businesses.store');

        Route::get('businesses/{business}', [RegistryBusinessController::class, 'show'])
            ->middleware(['permission:business.view'])
            ->name('businesses.show');

        Route::get('businesses/{business}/edit', [RegistryBusinessController::class, 'edit'])
            ->middleware(['permission:business.update'])
            ->name('businesses.edit');

        Route::put('businesses/{business}', [RegistryBusinessController::class, 'update'])
            ->middleware(['permission:business.update'])
            ->name('businesses.update');

        Route::patch('businesses/{business}/archive', [RegistryBusinessController::class, 'archive'])
            ->middleware(['permission:business.delete'])
            ->name('businesses.archive');

        Route::post('businesses/{business}/permit/renew', [RegistryPermitController::class, 'renew'])
            ->middleware(['permission:business.permit.renew'])
            ->name('businesses.permit.renew');

        Route::post('businesses/{business}/clearances', [RegistryClearanceController::class, 'store'])
            ->middleware(['permission:business.clearance.generate'])
            ->name('businesses.clearances.store');

        Route::post('businesses/{business}/documents', [RegistryDocumentController::class, 'store'])
            ->middleware(['permission:business.update'])
            ->name('businesses.documents.store');

        Route::delete('businesses/{business}/documents/{document}', [RegistryDocumentController::class, 'destroy'])
            ->middleware(['permission:business.update'])
            ->name('businesses.documents.destroy');

        Route::get('clearances/{clearance}/print', [RegistryClearanceController::class, 'print'])
            ->middleware(['permission:business.view'])
            ->name('clearances.print');
    });
});

require __DIR__.'/settings.php';
require base_path('Modules/Blotter/Routes/web.php');

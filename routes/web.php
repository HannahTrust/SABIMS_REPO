<?php

use App\Http\Controllers\CommitteeController;
use App\Http\Controllers\CouncilSessionController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ResolutionController;
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

Route::middleware(['auth', 'verified'])->group(function () {
    // Committees: any authenticated user can view index/show; only admin/secretary can create/edit/delete
    Route::get('committees', [CommitteeController::class, 'index'])->name('committees.index');
    Route::get('committees/create', [CommitteeController::class, 'create'])->middleware('role:admin,secretary')->name('committees.create');
    Route::post('committees', [CommitteeController::class, 'store'])->middleware('role:admin,secretary')->name('committees.store');
    Route::get('committees/{committee}', [CommitteeController::class, 'show'])->name('committees.show');
    Route::get('committees/{committee}/edit', [CommitteeController::class, 'edit'])->middleware('role:admin,secretary')->name('committees.edit');
    Route::put('committees/{committee}', [CommitteeController::class, 'update'])->middleware('role:admin,secretary')->name('committees.update');
    Route::delete('committees/{committee}', [CommitteeController::class, 'destroy'])->middleware('role:admin,secretary')->name('committees.destroy');
    Route::get('committees/{committee}/manage-members', [CommitteeController::class, 'manageMembers'])->middleware('role:admin,secretary,vice_mayor')->name('committees.manage-members');
    Route::put('committees/{committee}/manage-members', [CommitteeController::class, 'updateMembers'])->middleware('role:admin,secretary')->name('committees.manage-members.update');

    // Sessions: any authenticated user can view index/show/attendance; only secretary can create/edit/delete
    Route::get('sessions', [CouncilSessionController::class, 'index'])->name('sessions.index');
    Route::get('sessions/create', [CouncilSessionController::class, 'create'])->middleware('role:secretary')->name('sessions.create');
    Route::post('sessions', [CouncilSessionController::class, 'store'])->middleware('role:secretary')->name('sessions.store');
    Route::get('sessions/{session}', [CouncilSessionController::class, 'show'])->name('sessions.show');
    Route::get('sessions/{session}/edit', [CouncilSessionController::class, 'edit'])->middleware('role:secretary')->name('sessions.edit');
    Route::put('sessions/{session}', [CouncilSessionController::class, 'update'])->middleware('role:secretary')->name('sessions.update');
    Route::delete('sessions/{session}', [CouncilSessionController::class, 'destroy'])->middleware('role:secretary')->name('sessions.destroy');

    // Attendance: any authenticated user can view; only secretary can update/open/close
    Route::get('sessions/{session}/attendance', [AttendanceController::class, 'index'])->name('sessions.attendance.index');
    Route::post('attendance/{attendance}', [AttendanceController::class, 'update'])->middleware('role:secretary')->name('attendance.update');
    Route::post('sessions/{session}/attendance/open', [AttendanceController::class, 'openAttendance'])->middleware('role:secretary')->name('sessions.attendance.open');
    Route::post('sessions/{session}/attendance/close', [AttendanceController::class, 'closeAttendance'])->middleware('role:secretary')->name('sessions.attendance.close');

    // QR scan: any authenticated user (SB members scan to mark attendance)
    Route::get('attendance/scan/{session}/{token}', [AttendanceController::class, 'scan'])->name('attendance.scan');

    // Resolutions: any authenticated user can view index/show (controller filters by committee for sb_member); only secretary can create/edit/delete
    Route::get('resolutions', [ResolutionController::class, 'index'])->name('resolutions.index');
    Route::get('resolutions/create', [ResolutionController::class, 'create'])->middleware('role:secretary')->name('resolutions.create');
    Route::post('resolutions', [ResolutionController::class, 'store'])->middleware('role:secretary')->name('resolutions.store');
    Route::get('resolutions/{resolution}', [ResolutionController::class, 'show'])->name('resolutions.show');
    Route::get('resolutions/{resolution}/edit', [ResolutionController::class, 'edit'])->middleware('role:secretary')->name('resolutions.edit');
    Route::put('resolutions/{resolution}', [ResolutionController::class, 'update'])->middleware('role:secretary')->name('resolutions.update');
    Route::delete('resolutions/{resolution}', [ResolutionController::class, 'destroy'])->middleware('role:secretary')->name('resolutions.destroy');
});

require __DIR__.'/settings.php';

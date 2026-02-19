<?php

use App\Http\Controllers\CommitteeController;
use App\Http\Controllers\DashboardController;
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
    Route::get('committees', [CommitteeController::class, 'index'])->name('committees.index');
    Route::get('committees/{committee}', [CommitteeController::class, 'show'])->name('committees.show');
    Route::post('committees', [CommitteeController::class, 'store'])->name('committees.store');
    Route::get('committees/{committee}/manage-members', [CommitteeController::class, 'manageMembers'])->name('committees.manage-members');
    Route::put('committees/{committee}/manage-members', [CommitteeController::class, 'updateMembers'])->name('committees.manage-members.update');
});

require __DIR__.'/settings.php';

<?php

use Illuminate\Support\Facades\Route;
use Modules\Blotter\Controllers\BlotterReportController;
use Modules\Blotter\Models\BlotterReport;

Route::middleware(['auth', 'permission:view_blotter'])->group(function () {
    Route::get('incident-reports', [BlotterReportController::class, 'index'])
        ->can('viewAny', BlotterReport::class)
        ->name('incident-reports.index');

    Route::get('incident-reports/create', [BlotterReportController::class, 'create'])
        ->middleware('permission:create_blotter')
        ->can('create', BlotterReport::class)
        ->name('incident-reports.create');

    Route::post('incident-reports', [BlotterReportController::class, 'store'])
        ->middleware('permission:create_blotter')
        ->can('create', BlotterReport::class)
        ->name('incident-reports.store');

    Route::get('incident-reports/{blotter_report}', [BlotterReportController::class, 'show'])
        ->can('view', 'blotter_report')
        ->name('incident-reports.show');

    Route::get('incident-reports/{blotter_report}/edit', [BlotterReportController::class, 'edit'])
        ->middleware('permission:update_blotter')
        ->can('update', 'blotter_report')
        ->name('incident-reports.edit');

    Route::put('incident-reports/{blotter_report}', [BlotterReportController::class, 'update'])
        ->middleware('permission:update_blotter')
        ->can('update', 'blotter_report')
        ->name('incident-reports.update');

    Route::delete('incident-reports/{blotter_report}', [BlotterReportController::class, 'destroy'])
        ->middleware('permission:archive_blotter')
        ->can('delete', 'blotter_report')
        ->name('incident-reports.destroy');

    Route::post('incident-reports/{blotter_report}/archive', [BlotterReportController::class, 'archive'])
        ->middleware('permission:archive_blotter')
        ->can('archive', 'blotter_report')
        ->name('incident-reports.archive');

    Route::post('incident-reports/{blotter_report}/resolve', [BlotterReportController::class, 'resolve'])
        ->middleware('permission:resolve_blotter')
        ->can('resolve', 'blotter_report')
        ->name('incident-reports.resolve');

    Route::get('incident-reports/{blotter_report}/print', [BlotterReportController::class, 'print'])
        ->middleware('permission:print_blotter')
        ->can('print', 'blotter_report')
        ->name('incident-reports.print');

    Route::permanentRedirect('blotter-reports', '/incident-reports')->name('blotter-reports.index');
    Route::permanentRedirect('blotter-reports/create', '/incident-reports/create');
    Route::permanentRedirect('blotter-reports/{blotter_report}', '/incident-reports/{blotter_report}');
    Route::permanentRedirect('blotter-reports/{blotter_report}/edit', '/incident-reports/{blotter_report}/edit');
    Route::permanentRedirect('blotter-reports/{blotter_report}/print', '/incident-reports/{blotter_report}/print');
});

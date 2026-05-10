<?php

use Illuminate\Support\Facades\Route;
use Modules\Blotter\Controllers\BlotterReportController;
use Modules\Blotter\Models\BlotterReport;

Route::middleware(['auth', 'permission:view_blotter'])->group(function () {
    Route::get('blotter-reports', [BlotterReportController::class, 'index'])
        ->can('viewAny', BlotterReport::class)
        ->name('blotter-reports.index');

    Route::get('blotter-reports/create', [BlotterReportController::class, 'create'])
        ->middleware('permission:create_blotter')
        ->can('create', BlotterReport::class)
        ->name('blotter-reports.create');

    Route::post('blotter-reports', [BlotterReportController::class, 'store'])
        ->middleware('permission:create_blotter')
        ->can('create', BlotterReport::class)
        ->name('blotter-reports.store');

    Route::get('blotter-reports/{blotter_report}', [BlotterReportController::class, 'show'])
        ->can('view', 'blotter_report')
        ->name('blotter-reports.show');

    Route::get('blotter-reports/{blotter_report}/edit', [BlotterReportController::class, 'edit'])
        ->middleware('permission:update_blotter')
        ->can('update', 'blotter_report')
        ->name('blotter-reports.edit');

    Route::put('blotter-reports/{blotter_report}', [BlotterReportController::class, 'update'])
        ->middleware('permission:update_blotter')
        ->can('update', 'blotter_report')
        ->name('blotter-reports.update');

    Route::delete('blotter-reports/{blotter_report}', [BlotterReportController::class, 'destroy'])
        ->middleware('permission:archive_blotter')
        ->can('delete', 'blotter_report')
        ->name('blotter-reports.destroy');

    Route::post('blotter-reports/{blotter_report}/archive', [BlotterReportController::class, 'archive'])
        ->middleware('permission:archive_blotter')
        ->can('archive', 'blotter_report')
        ->name('blotter-reports.archive');

    Route::post('blotter-reports/{blotter_report}/resolve', [BlotterReportController::class, 'resolve'])
        ->middleware('permission:resolve_blotter')
        ->can('resolve', 'blotter_report')
        ->name('blotter-reports.resolve');

    Route::get('blotter-reports/{blotter_report}/print', [BlotterReportController::class, 'print'])
        ->middleware('permission:print_blotter')
        ->can('print', 'blotter_report')
        ->name('blotter-reports.print');
});

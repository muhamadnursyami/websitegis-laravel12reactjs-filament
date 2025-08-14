<?php

use App\Http\Controllers\LaporanController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Landing page
Route::get('/', function () {
    return Inertia::render('landing');
})->name('landing');

// Laporan routes
Route::get('/laporan', function () {
    return Inertia::render('report');
})->name('report');

Route::get('/peta', function () {
    return Inertia::render('peta');
})->name('peta');

Route::get('/tren', function () {
    return Inertia::render('tren');
})->name('tren');


Route::post('/laporan', [LaporanController::class, 'store'])->name('laporan.store');

// API routes untuk mendapatkan categories
Route::get('/api/categories', [LaporanController::class, 'getCategories'])->name('api.categories');
// Route untuk mendapatkan semua laporan dan menampilkan koordinat
Route::get('/api/laporans', [LaporanController::class, 'getAll'])->name('api.laporans');




// Route lainnya
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Página principal
|--------------------------------------------------------------------------
*/

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

/*
|--------------------------------------------------------------------------
| Dashboard (solo admin)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

/*
|--------------------------------------------------------------------------
| Página de cursos
|--------------------------------------------------------------------------
*/

Route::get('/cursos', function () {
    return Inertia::render('Cursos');
});

/*
|--------------------------------------------------------------------------
| Página MIS CURSOS
|--------------------------------------------------------------------------
*/

Route::get('/mis-cursos', function () {
    return Inertia::render('MisCursos');
});

/*
|--------------------------------------------------------------------------
| Página VER CURSO
|--------------------------------------------------------------------------
*/

Route::get('/curso/{id}', function ($id) {
    return Inertia::render('VerCurso', [
        'id' => $id
    ]);
});

/*
|--------------------------------------------------------------------------
| Settings
|--------------------------------------------------------------------------
*/

require __DIR__.'/settings.php';
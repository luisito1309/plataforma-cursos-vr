<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Página principal
|--------------------------------------------------------------------------
*/

Route::inertia('/', 'Home', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

/*
|--------------------------------------------------------------------------
| Dashboard (cuando el usuario está logueado)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    Route::inertia('/dashboard', 'dashboard')->name('dashboard');

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
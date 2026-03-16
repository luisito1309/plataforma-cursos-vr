<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Página principal: redirige a login o según rol
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    if (! auth()->check()) {
        return redirect()->route('login');
    }
    $user = auth()->user();
    if ($user->role === 'admin') {
        return redirect()->route('dashboard');
    }
    if ($user->role === 'docente') {
        return redirect()->route('cursos.index');
    }
    return redirect()->route('mis-cursos');
})->name('home');

/*
|--------------------------------------------------------------------------
| Dashboard (solo rol admin)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, '__invoke'])->name('dashboard');
});

/*
|--------------------------------------------------------------------------
| Cursos (docente y estudiante autenticados)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/cursos', function () {
        return Inertia::render('Cursos');
    })->name('cursos.index');

    Route::get('/mis-cursos', function () {
        return Inertia::render('MisCursos');
    })->name('mis-cursos');

    Route::get('/curso/{id}', function ($id) {
        return Inertia::render('VerCurso', [
            'id' => (int) $id,
        ]);
    })->name('curso.show');
});

/*
|--------------------------------------------------------------------------
| Settings
|--------------------------------------------------------------------------
*/

require __DIR__.'/settings.php';
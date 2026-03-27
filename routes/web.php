<?php

use App\Http\Controllers\DashboardController;
use App\Models\Curso;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

/*
|--------------------------------------------------------------------------
| Página principal
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    $cursos = Curso::query()
        ->orderByDesc('id')
        ->limit(12)
        ->get()
        ->map(fn (Curso $c) => [
            'id' => $c->id,
            'titulo' => $c->titulo,
            'descripcion' => $c->descripcion,
            'imagen' => $c->imagen,
            'estado' => $c->estado,
            'categoria' => $c->categoria ? match ($c->categoria) {
                'medicina' => 'Medicina',
                'tecnologia' => 'Tecnología',
                'creativo' => 'Creativo',
                'play' => 'Play',
                default => ucfirst((string) $c->categoria),
            } : null,
        ])
        ->all();

    $categoriasRaw = Curso::query()
        ->whereNotNull('categoria')
        ->selectRaw('categoria, COUNT(*) as total')
        ->groupBy('categoria')
        ->get();

    $categorias = $categoriasRaw->values()->map(function ($row, int $i) {
        $cat = (string) $row->categoria;

        return [
            'id' => $i + 1,
            'nombre' => match ($cat) {
                'medicina' => 'Medicina',
                'tecnologia' => 'Tecnología',
                'creativo' => 'Creativo',
                'play' => 'Play',
                default => ucfirst($cat),
            },
            'icono' => match ($cat) {
                'medicina' => 'zap',
                'tecnologia' => 'code',
                'creativo' => 'palette',
                'play' => 'globe',
                default => 'book',
            },
            'total_cursos' => (int) $row->total,
        ];
    })->all();

    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'cursosDestacados' => $cursos,
        'categorias' => $categorias,
    ]);
})->name('home');

Route::get('/minijuego/{juego}', function (string $juego) {
    $permitidos = ['quiz_medico', 'anatomia_humana', 'computer_3d', 'creative_box'];
    if (! in_array($juego, $permitidos, true)) {
        abort(404);
    }

    return Inertia::render('MinijuegoDemo', [
        'juego' => $juego,
    ]);
})->name('minijuego.demo');

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
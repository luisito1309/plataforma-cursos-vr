<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CursoController;
use App\Http\Controllers\InscripcionController;
use App\Http\Controllers\ModuloController;
use App\Http\Controllers\VideoController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Aquí se definen todas las rutas de la API para cursos, módulos, videos
| y las inscripciones de estudiantes.
|
*/

/** ----------------- CURSOS ----------------- */

// Listar todos los cursos
Route::get('/cursos', [CursoController::class, 'index']);

// Crear curso
Route::post('/cursos', [CursoController::class, 'store']);

// Ver un curso específico
Route::get('/cursos/{id}', [CursoController::class, 'show']);

// Actualizar curso
Route::put('/cursos/{id}', [CursoController::class, 'update']);

// Eliminar curso
Route::delete('/cursos/{id}', [CursoController::class, 'destroy']);

// Obtener módulos de un curso
Route::get('/cursos/{id}/modulos', [CursoController::class, 'modulos']);


/** ----------------- MÓDULOS ----------------- */

// Crear módulo
Route::post('/modulos', [ModuloController::class, 'store']);

// Actualizar módulo
Route::put('/modulos/{id}', [ModuloController::class, 'update']);

// Eliminar módulo
Route::delete('/modulos/{id}', [ModuloController::class, 'destroy']);


/** ----------------- VIDEOS ----------------- */

// Crear video
Route::post('/videos', [VideoController::class, 'store']);

// Eliminar video
Route::delete('/videos/{id}', [VideoController::class, 'destroy']);


/** ----------------- INSCRIPCIONES ----------------- */

// Inscribirse a un curso
Route::post('/inscribirse', [InscripcionController::class, 'inscribirse']);

// Obtener cursos inscritos por usuario
Route::get('/mis-cursos', [InscripcionController::class, 'misCursos']);
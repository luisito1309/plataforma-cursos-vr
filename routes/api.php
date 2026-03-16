<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CursoController;
use App\Http\Controllers\InscripcionController;
use App\Http\Controllers\ModuloController;
use App\Http\Controllers\VideoController;

/*
|--------------------------------------------------------------------------
| API Routes (requieren auth para escritura; lectura según rol)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    /** ----------------- CURSOS ----------------- */
    Route::get('/cursos', [CursoController::class, 'index']);
    Route::post('/cursos', [CursoController::class, 'store']);
    Route::get('/cursos/{id}', [CursoController::class, 'show']);
    Route::put('/cursos/{id}', [CursoController::class, 'update']);
    Route::delete('/cursos/{id}', [CursoController::class, 'destroy']);
    Route::get('/cursos/{id}/modulos', [CursoController::class, 'modulos']);

    /** ----------------- MÓDULOS ----------------- */
    Route::post('/modulos', [ModuloController::class, 'store']);
    Route::put('/modulos/{id}', [ModuloController::class, 'update']);
    Route::delete('/modulos/{id}', [ModuloController::class, 'destroy']);

    /** ----------------- VIDEOS ----------------- */
    Route::post('/videos', [VideoController::class, 'store']);
    Route::delete('/videos/{id}', [VideoController::class, 'destroy']);

    /** ----------------- INSCRIPCIONES ----------------- */
    Route::post('/inscribirse', [InscripcionController::class, 'inscribirse']);
    Route::get('/mis-cursos', [InscripcionController::class, 'misCursos']);
});
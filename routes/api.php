<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CursoController;
use App\Http\Controllers\InscripcionController;
use App\Http\Controllers\ModuloController;
use App\Http\Controllers\VideoController;

Route::post('/modulos', [ModuloController::class,'store']);
Route::put('/modulos/{id}', [ModuloController::class,'update']);

Route::post('/videos', [VideoController::class,'store']);
Route::delete('/videos/{id}', [VideoController::class,'destroy']);

Route::get('/cursos', [CursoController::class,'index']);
Route::post('/cursos', [CursoController::class,'store']);
Route::get('/cursos/{id}', [CursoController::class,'show']);
Route::put('/cursos/{id}', [CursoController::class,'update']);
Route::delete('/cursos/{id}', [CursoController::class,'destroy']);
Route::get('/cursos/{id}/modulos', [CursoController::class,'modulos']);
Route::get('/mis-cursos', [InscripcionController::class, 'misCursos']);
Route::post('/inscribirse', [InscripcionController::class, 'inscribirse']);
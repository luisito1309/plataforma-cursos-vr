<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Curso;
use App\Models\Inscripcion;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Estadísticas para el dashboard (solo admin).
     */
    public function index(): JsonResponse
    {
        $totalCursos = Curso::count();
        $totalUsuarios = User::count();
        $totalInscripciones = Inscripcion::count();
        $cursos = Curso::orderBy('id', 'desc')->get();

        return response()->json([
            'estadisticas' => [
                'total_cursos' => $totalCursos,
                'total_usuarios' => $totalUsuarios,
                'total_inscripciones' => $totalInscripciones,
            ],
            'cursos' => $cursos,
        ]);
    }
}

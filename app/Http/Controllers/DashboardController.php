<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use App\Models\Inscripcion;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $stats = [
            'total_cursos' => Curso::count(),
            'total_usuarios' => User::count(),
            'total_inscripciones' => Inscripcion::count(),
            'usuarios_por_rol' => [
                'admin' => User::where('role', 'admin')->count(),
                'docente' => User::where('role', 'docente')->count(),
                'estudiante' => User::where('role', 'estudiante')->count(),
            ],
        ];

        return Inertia::render('dashboard', [
            'stats' => $stats,
        ]);
    }
}

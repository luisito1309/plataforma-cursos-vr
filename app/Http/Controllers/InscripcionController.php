<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Inscripcion;

class InscripcionController extends Controller
{
    public function inscribirse(Request $request)
{
    $user = $request->user();
    if (! $user || $user->role !== 'estudiante') {
        return response()->json(['error' => 'Solo los estudiantes pueden inscribirse a cursos'], 403);
    }
    try {
        $inscripcion = Inscripcion::create([
            'user_id' => $user->id,
            'curso_id' => $request->curso_id
        ]);

        return response()->json([
            'mensaje' => 'Inscripción exitosa',
            'data' => $inscripcion
        ]);

    } catch (\Exception $e) {

        return response()->json([
            'error' => $e->getMessage()
        ]);
    }
}
public function misCursos(Request $request)
{
    $user = $request->user();
    if (! $user) {
        return response()->json(['error' => 'No autenticado'], 401);
    }
    $cursos = \App\Models\Curso::join('inscripciones', 'cursos.id', '=', 'inscripciones.curso_id')
        ->where('inscripciones.user_id', $user->id)
        ->select('cursos.*')
        ->get();

    return response()->json($cursos);
}
}
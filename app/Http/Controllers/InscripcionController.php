<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Inscripcion;

class InscripcionController extends Controller
{
    public function inscribirse(Request $request)
{
    try {

        $inscripcion = Inscripcion::create([
            'user_id' => 1,
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
public function misCursos()
{
    $user_id = 1;

    $cursos = \App\Models\Curso::join('inscripciones', 'cursos.id', '=', 'inscripciones.curso_id')
        ->where('inscripciones.user_id', $user_id)
        ->select('cursos.*')
        ->get();

    return response()->json($cursos);
}
}
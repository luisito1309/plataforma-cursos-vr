<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Modulo;

class ModuloController extends Controller
{

    public function store(Request $request)
    {
        $user = $request->user();
        if (! $user || ! in_array($user->role, ['admin', 'docente'])) {
            return response()->json(['error' => 'No autorizado para crear módulos'], 403);
        }
        $modulo = Modulo::create([
            'curso_id' => $request->curso_id,
            'titulo' => $request->titulo
        ]);
        return response()->json($modulo);
    }

    public function update(Request $request, $id)
    {
        $modulo = Modulo::find($id);
        if (! $modulo) {
            return response()->json(['mensaje' => 'Modulo no encontrado'], 404);
        }
        $user = $request->user();
        if (! $user || ! in_array($user->role, ['admin', 'docente'])) {
            return response()->json(['error' => 'No autorizado'], 403);
        }
        $modulo->update(['titulo' => $request->titulo]);
        return response()->json($modulo);
    }

    public function destroy($id)
    {
        $modulo = Modulo::find($id);
        if (! $modulo) {
            return response()->json(['message' => 'Módulo no encontrado'], 404);
        }
        $user = $request->user();
        if (! $user || ! in_array($user->role, ['admin', 'docente'])) {
            return response()->json(['error' => 'No autorizado'], 403);
        }
        $modulo->delete();
        return response()->json(['message' => 'Módulo eliminado con éxito']);
    }
}
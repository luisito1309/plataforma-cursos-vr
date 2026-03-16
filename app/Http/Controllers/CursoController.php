<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Curso;

class CursoController extends Controller
{

    public function index()
    {
        $cursos = Curso::all();
        return response()->json($cursos);
    }

    public function store(Request $request)
{

    $imagenPath = null;

    if($request->hasFile('imagen')){
        $imagenPath = $request->file('imagen')->store('cursos','public');
    }

    $user = $request->user();
    if (! $user || ! in_array($user->role, ['admin', 'docente'])) {
        return response()->json(['error' => 'No autorizado para crear cursos'], 403);
    }
    $curso = Curso::create([
        'titulo' => $request->titulo,
        'descripcion' => $request->descripcion,
        'docente_id' => $user->id,
        'estado' => 'pendiente',
        'imagen' => $imagenPath
    ]);

    return response()->json($curso);

}

    public function show($id)
    {
        $curso = Curso::find($id);

        if(!$curso){
            return response()->json(['mensaje'=>'Curso no encontrado']);
        }

        return response()->json($curso);
    }

    public function update(Request $request, $id)
    {
        $curso = Curso::find($id);
        if (! $curso) {
            return response()->json(['mensaje' => 'Curso no encontrado'], 404);
        }
        $user = $request->user();
        if (! $user || ! in_array($user->role, ['admin', 'docente'])) {
            return response()->json(['error' => 'No autorizado'], 403);
        }
        if ($user->role === 'docente' && $curso->docente_id != $user->id) {
            return response()->json(['error' => 'No autorizado para editar este curso'], 403);
        }
        $curso->update($request->all());
        return response()->json($curso);
    }

    public function destroy($id)
    {
        $curso = Curso::find($id);
        if (! $curso) {
            return response()->json(['mensaje' => 'Curso no encontrado'], 404);
        }
        $user = $request->user();
        if (! $user || ! in_array($user->role, ['admin', 'docente'])) {
            return response()->json(['error' => 'No autorizado'], 403);
        }
        if ($user->role === 'docente' && $curso->docente_id != $user->id) {
            return response()->json(['error' => 'No autorizado para eliminar este curso'], 403);
        }
        $curso->delete();
        return response()->json(['mensaje' => 'Curso eliminado']);
    }
    public function modulos($id)
{
    $curso = Curso::with('modulos.videos')->find($id);

    if(!$curso){
        return response()->json([]);
    }

    return response()->json($curso->modulos);
}
}
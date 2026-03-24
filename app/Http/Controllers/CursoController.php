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

    $miniJuego = $request->input('mini_juego');
    $miniJuego = ($miniJuego !== null && $miniJuego !== '') ? $miniJuego : null;

    $curso = Curso::create([
        'titulo' => $request->titulo,
        'descripcion' => $request->descripcion,
        'docente_id' => 1,
        'estado' => 'pendiente',
        'imagen' => $imagenPath,
        'mini_juego' => $miniJuego,
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

        if(!$curso){
            return response()->json(['mensaje'=>'Curso no encontrado']);
        }

        $curso->update($request->all());

        return response()->json($curso);
    }

    public function destroy($id)
    {
        $curso = Curso::find($id);

        if(!$curso){
            return response()->json(['mensaje'=>'Curso no encontrado']);
        }

        $curso->delete();

        return response()->json(['mensaje'=>'Curso eliminado']);
    }
    public function modulos($id)
{
    $curso = Curso::with('modulos.videos', 'modulos.documentos')->find($id);

    if(!$curso){
        return response()->json([]);
    }

    return response()->json($curso->modulos);
}
}
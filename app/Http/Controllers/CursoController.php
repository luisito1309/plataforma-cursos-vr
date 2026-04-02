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

    $categoria = $request->input('categoria');
    $allowedCat = ['play', 'medicina', 'tecnologia', 'creativo', 'vr'];
    if (! is_string($categoria) || ! in_array($categoria, $allowedCat, true)) {
        $categoria = 'tecnologia';
    }

    $curso = Curso::create([
        'titulo' => $request->titulo,
        'descripcion' => $request->descripcion,
        'docente_id' => 1,
        'estado' => 'pendiente',
        'imagen' => $imagenPath,
        'mini_juego' => $miniJuego,
        'categoria' => $categoria,
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

    /** Registro opcional de acciones del minijuego Creative Box (extensible a BD). */
    public function registrarCreativeAccion(Request $request, $id)
    {
        $curso = Curso::find($id);

        if (! $curso) {
            return response()->json(['mensaje' => 'Curso no encontrado'], 404);
        }

        return response()->json(['ok' => true, 'payload' => $request->all()]);
    }
}
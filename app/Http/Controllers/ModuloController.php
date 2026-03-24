<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Modulo;

class ModuloController extends Controller
{

    public function store(Request $request)
    {

        $modulo = Modulo::create([
            'curso_id' => $request->curso_id,
            'titulo' => $request->titulo
        ]);

        return response()->json($modulo);

    }

    public function update(Request $request, $id)
    {

        $modulo = Modulo::find($id);

        if(!$modulo){
            return response()->json(['mensaje'=>'Modulo no encontrado']);
        }

        $modulo->update([
            'titulo' => $request->titulo
        ]);

        return response()->json($modulo);

    }
    public function destroy($id)
{
    $modulo = Modulo::find($id);

    if (!$modulo) {
        return response()->json(['message' => 'Módulo no encontrado'], 404);
    }

    $modulo->delete();

    return response()->json(['message' => 'Módulo eliminado con éxito']);
}
}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Video;

class VideoController extends Controller
{

    public function store(Request $request)
    {
        $user = $request->user();
        if (! $user || ! in_array($user->role, ['admin', 'docente'])) {
            return response()->json(['error' => 'No autorizado para crear videos'], 403);
        }
        $video = Video::create([
            'modulo_id' => $request->modulo_id,
            'titulo' => $request->titulo,
            'url' => $request->url
        ]);
        return response()->json($video);
    }

    public function destroy($id)
    {
        $video = Video::find($id);
        if (! $video) {
            return response()->json(['mensaje' => 'Video no encontrado'], 404);
        }
        $user = $request->user();
        if (! $user || ! in_array($user->role, ['admin', 'docente'])) {
            return response()->json(['error' => 'No autorizado'], 403);
        }
        $video->delete();
        return response()->json(['mensaje' => 'Video eliminado']);
    }

}
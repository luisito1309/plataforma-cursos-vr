<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Video;

class VideoController extends Controller
{

    public function store(Request $request)
    {
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

        if(!$video){
            return response()->json(['mensaje'=>'Video no encontrado']);
        }

        $video->delete();

        return response()->json(['mensaje'=>'Video eliminado']);
    }

}
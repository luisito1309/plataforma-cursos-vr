<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Documento;
use App\Models\Modulo;
use Illuminate\Support\Facades\Storage;

class DocumentoController extends Controller
{
    /**
     * Listar documentos de un módulo.
     * GET /api/modulos/{id}/documentos
     */
    public function index($moduloId)
    {
        $modulo = Modulo::find($moduloId);
        if (!$modulo) {
            return response()->json(['mensaje' => 'Módulo no encontrado'], 404);
        }
        $documentos = Documento::where('modulo_id', $moduloId)->orderBy('created_at', 'desc')->get();
        return response()->json($documentos);
    }

    /**
     * Subir un documento PDF al módulo.
     * POST /api/documentos
     */
    public function store(Request $request)
    {
        $request->validate([
            'modulo_id' => 'required|exists:modulos,id',
            'titulo' => 'required|string|max:255',
            'archivo' => 'required|file|mimes:pdf|max:20480', // 20MB
        ]);

        $file = $request->file('archivo');
        $path = $file->store('documentos', 'public');

        $documento = Documento::create([
            'modulo_id' => $request->modulo_id,
            'titulo' => $request->titulo,
            'archivo' => $path,
        ]);

        return response()->json($documento);
    }

    /**
     * Eliminar un documento.
     * DELETE /api/documentos/{id}
     */
    public function destroy($id)
    {
        $documento = Documento::find($id);
        if (!$documento) {
            return response()->json(['mensaje' => 'Documento no encontrado'], 404);
        }
        Storage::disk('public')->delete($documento->archivo);
        $documento->delete();
        return response()->json(['mensaje' => 'Documento eliminado']);
    }
}

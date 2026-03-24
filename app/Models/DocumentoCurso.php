<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentoCurso extends Model
{
    protected $table = 'documentos_curso';

    protected $fillable = [
        'curso_id',
        'titulo',
        'ruta',
    ];

    public function curso(): BelongsTo
    {
        return $this->belongsTo(Curso::class, 'curso_id');
    }
}

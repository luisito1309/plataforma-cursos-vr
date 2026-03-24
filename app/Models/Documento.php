<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Documento extends Model
{
    protected $table = 'documentos';

    protected $fillable = [
        'modulo_id',
        'titulo',
        'archivo',
    ];

    public function modulo(): BelongsTo
    {
        return $this->belongsTo(Modulo::class);
    }
}

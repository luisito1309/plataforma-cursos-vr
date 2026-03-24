<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Curso;
use App\Models\Video;
use App\Models\Documento;

class Modulo extends Model
{

    protected $table = 'modulos';

    protected $fillable = [
        'curso_id',
        'titulo'
    ];

    // Relación con curso
    public function curso()
    {
        return $this->belongsTo(Curso::class);
    }

    // Relación con videos
    public function videos()
    {
        return $this->hasMany(Video::class);
    }

    // Relación con documentos
    public function documentos()
    {
        return $this->hasMany(Documento::class);
    }
}
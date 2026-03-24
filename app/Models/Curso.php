<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Modulo;

class Curso extends Model
{

    protected $table = 'cursos';

    protected $fillable = [
        'titulo',
        'descripcion',
        'docente_id',
        'estado',
        'imagen',
        'mini_juego',
    ];

    public function modulos()
    {
        return $this->hasMany(Modulo::class);
    }

}
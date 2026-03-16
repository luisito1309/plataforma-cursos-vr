<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    /**
     * Redirige según el rol del usuario autenticado.
     * Uso: ->middleware('role:admin') o role:docente,role:estudiante
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user()) {
            return redirect()->route('login');
        }

        if (! in_array($request->user()->role, $roles)) {
            $role = $request->user()->role;
            if ($role === 'admin') {
                return redirect()->route('dashboard');
            }
            if ($role === 'docente') {
                return redirect()->route('cursos.index');
            }
            return redirect()->route('mis-cursos');
        }

        return $next($request);
    }
}

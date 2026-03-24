<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Comprueba que el usuario autenticado tenga uno de los roles permitidos.
     *
     * @param  string  ...$roles  Roles permitidos (ej: 'admin', 'docente')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            return redirect()->guest(route('login'));
        }

        $userRole = $request->user()->role ?? null;

        if (! $userRole || ! in_array($userRole, $roles, true)) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Forbidden. Rol no autorizado.'], 403);
            }
            return redirect('/');
        }

        return $next($request);
    }
}

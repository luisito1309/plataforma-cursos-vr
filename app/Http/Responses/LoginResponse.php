<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract
{
    /**
     * Redirige según el rol: admin → dashboard, docente/estudiante → home.
     */
    public function toResponse($request): Response
    {
        $user = $request->user();

        if ($request->wantsJson()) {
            return response()->json([
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'estudiante',
                ] : null,
            ]);
        }

        $role = $user->role ?? 'estudiante';

        if ($role === 'admin') {
            return redirect()->intended(config('fortify.home', '/dashboard'));
        }

        return redirect()->intended('/');
    }
}

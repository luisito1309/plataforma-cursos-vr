import { useEffect, type ReactNode } from 'react';
import type { User } from '@/types/auth';

type LocalStorageAuthSyncProps = {
    user?: User | null;
    token?: string | null;
    children?: ReactNode;
};

/**
 * Sincroniza user y token a localStorage.
 * NO usa usePage de Inertia: debe recibir user/token por props desde un componente
 * que sí esté dentro del contexto de Inertia (por ejemplo el layout).
 */
export function LocalStorageAuthSync({
    user,
    token,
    children,
}: LocalStorageAuthSyncProps) {
    useEffect(() => {
        if (user) {
            try {
                localStorage.setItem('user', JSON.stringify(user));
            } catch {
                // ignorar errores de localStorage (privado, cuota, etc.)
            }
        }
        if (token) {
            try {
                localStorage.setItem('token', token);
            } catch {
                // ignorar
            }
        }
    }, [user, token]);

    return <>{children}</>;
}

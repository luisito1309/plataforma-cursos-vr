/** Claves en localStorage para saber si el usuario completó un mini juego en un curso. */

export function minijuegoOkKey(cursoId: number, juego: string): string {
    return `edu_minijuego_ok_${cursoId}_${juego}`;
}

export function isMinijuegoOk(cursoId: number, juego: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
        return localStorage.getItem(minijuegoOkKey(cursoId, juego)) === '1';
    } catch {
        return false;
    }
}

export function setMinijuegoOk(cursoId: number, juego: string): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(minijuegoOkKey(cursoId, juego), '1');
        window.dispatchEvent(
            new CustomEvent('edu-minijuego-ok', { detail: { cursoId, juego } }),
        );
    } catch {
        /* ignore quota / private mode */
    }
}

export const MINIJUEGOS_CON_PROGRESO_LOCAL = [
    'computer_3d',
    'anatomia_humana',
    'quiz_medico',
    'pingpong',
    'monster_friend',
    'konterball',
    'creative_box',
    'games_fps',
    'cars',
] as const;

export function miniJuegoTieneProgresoLocal(juego: string | null | undefined): boolean {
    return Boolean(juego && MINIJUEGOS_CON_PROGRESO_LOCAL.includes(juego as (typeof MINIJUEGOS_CON_PROGRESO_LOCAL)[number]));
}

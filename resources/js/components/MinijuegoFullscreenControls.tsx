import { useCallback, useEffect, useState, type RefObject } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

/** Mini juegos de categorías Medicina, Tecnología y Creativo (excluye Play: pingpong, konterball, etc.). */
export const MINIJUEGO_IDS_PANTALLA_COMPLETA = [
    "quiz_medico",
    "anatomia_humana",
    "computer_3d",
    "creative_box",
] as const;

export function minijuegoTienePantallaCompleta(juegoId: string | null | undefined): boolean {
    if (!juegoId) return false;
    return (MINIJUEGO_IDS_PANTALLA_COMPLETA as readonly string[]).includes(juegoId);
}

function getFullscreenElement(): Element | null {
    const doc = document as Document & { webkitFullscreenElement?: Element | null };
    return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

async function requestFullscreenEl(el: HTMLElement): Promise<void> {
    const w = el as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
    if (el.requestFullscreen) {
        await el.requestFullscreen();
        return;
    }
    await Promise.resolve(w.webkitRequestFullscreen?.());
}

/** Entra en pantalla completa con el elemento raíz del minijuego (p. ej. al abrir la demo desde Home). */
export async function enterMinijuegoFullscreen(el: HTMLElement | null): Promise<void> {
    if (!el) return;
    try {
        await requestFullscreenEl(el);
    } catch {
        /* sin permiso o API no disponible */
    }
}

async function exitFullscreenDoc(): Promise<void> {
    const d = document as Document & { webkitExitFullscreen?: () => Promise<void> | void };
    if (document.exitFullscreen) {
        await document.exitFullscreen();
        return;
    }
    await Promise.resolve(d.webkitExitFullscreen?.());
}

const FS_EVENTS = ["fullscreenchange", "webkitfullscreenchange"] as const;

type ContainerRef = RefObject<HTMLElement | null>;

/**
 * Botón que pone en pantalla completa el nodo referenciado (tipico: tarjeta del minijuego).
 */
export function MinijuegoFullscreenToggleButton({
    containerRef,
    className = "",
    buttonStyle,
}: {
    containerRef: ContainerRef;
    className?: string;
    buttonStyle?: React.CSSProperties;
}) {
    const [enFs, setEnFs] = useState(false);

    const sync = useCallback(() => {
        const el = containerRef.current;
        setEnFs(!!el && getFullscreenElement() === el);
    }, [containerRef]);

    useEffect(() => {
        FS_EVENTS.forEach((ev) => document.addEventListener(ev, sync));
        return () => FS_EVENTS.forEach((ev) => document.removeEventListener(ev, sync));
    }, [sync]);

    const toggle = useCallback(async () => {
        const el = containerRef.current;
        if (!el) return;
        try {
            if (getFullscreenElement() === el) {
                await exitFullscreenDoc();
            } else {
                await requestFullscreenEl(el);
            }
        } catch {
            /* permiso denegado o API no disponible */
        }
    }, [containerRef]);

    const baseBtn: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        padding: 0,
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,.2)",
        background: "rgba(255,255,255,.08)",
        color: "rgba(255,255,255,.9)",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background .15s, border-color .15s",
        ...buttonStyle,
    };

    return (
        <button
            type="button"
            className={className}
            style={baseBtn}
            onClick={toggle}
            title={enFs ? "Salir de pantalla completa" : "Pantalla completa"}
            aria-label={enFs ? "Salir de pantalla completa" : "Ver minijuego en pantalla completa"}
        >
            {enFs ? <Minimize2 size={17} strokeWidth={2} /> : <Maximize2 size={17} strokeWidth={2} />}
        </button>
    );
}

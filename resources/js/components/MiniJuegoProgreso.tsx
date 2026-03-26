import React, { useCallback, useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { isMinijuegoOk, setMinijuegoOk } from "@/lib/minijuegoStorage";

export type MiniJuegoProgresoProps = {
    /** Si no hay curso real (vista previa), usar 0: no se persiste en localStorage. */
    cursoId?: number;
    storageKey: string;
    onCompletado?: () => void;
    children: React.ReactNode;
    /** Iframe u otro contenido donde no captamos clics en el padre: botón "Ya empecé a jugar". */
    interaccionIframe?: boolean;
    className?: string;
};

/**
 * Bloque común: pendiente → Finalizar mini juego → Mini juego completado (+ localStorage si hay cursoId &gt; 0).
 */
export default function MiniJuegoProgreso({
    cursoId = 0,
    storageKey,
    onCompletado,
    children,
    interaccionIframe = false,
    className = "",
}: MiniJuegoProgresoProps) {
    const persistOk = typeof cursoId === "number" && cursoId > 0;
    const [completado, setCompletado] = useState(false);
    const [jugado, setJugado] = useState(false);

    useEffect(() => {
        setJugado(false);
        if (persistOk && isMinijuegoOk(cursoId, storageKey)) {
            setCompletado(true);
        } else {
            setCompletado(false);
        }
    }, [cursoId, storageKey, persistOk]);

    const finalizarMinijuego = useCallback(() => {
        if (!jugado || completado) return;
        if (persistOk) setMinijuegoOk(cursoId, storageKey);
        setCompletado(true);
        onCompletado?.();
    }, [jugado, completado, persistOk, cursoId, storageKey, onCompletado]);

    const marcarArea = useCallback(() => {
        if (!completado) setJugado(true);
    }, [completado]);

    return (
        <div className={`flex w-full flex-col gap-3 ${className}`.trim()}>
            {completado && (
                <div
                    className="flex items-start gap-3 rounded-xl border border-emerald-500/35 bg-emerald-500/[0.08] px-4 py-3 text-sm dark:border-emerald-400/30 dark:bg-emerald-500/15"
                    role="status"
                    aria-label="Mini juego completado"
                >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                        <p className="font-semibold text-foreground">Mini juego completado</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                            Actividad finalizada. Puedes seguir explorando el contenido.
                        </p>
                    </div>
                </div>
            )}

            {!completado && (
                <div className="rounded-xl border border-amber-500/35 bg-amber-500/[0.07] px-4 py-3 text-sm dark:border-amber-400/25 dark:bg-amber-500/10">
                    <p className="font-semibold text-foreground">Mini juego pendiente</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {interaccionIframe ? (
                            <>
                                Juega en el área de abajo. Cuando hayas participado, pulsa{" "}
                                <strong className="text-foreground">Ya empecé a jugar</strong> y después{" "}
                                <strong className="text-foreground">Finalizar mini juego</strong>.
                            </>
                        ) : (
                            <>
                                Interactúa con el mini juego (clic o controles). Cuando quieras cerrar la actividad,
                                pulsa <strong className="text-foreground">Finalizar mini juego</strong>.
                            </>
                        )}
                    </p>
                    {interaccionIframe ? (
                        !jugado ? (
                            <button
                                type="button"
                                onClick={() => setJugado(true)}
                                className="mt-3 rounded-lg border border-amber-600/40 bg-amber-500/15 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-amber-500/25"
                            >
                                Ya empecé a jugar
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={finalizarMinijuego}
                                className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                            >
                                Finalizar mini juego
                            </button>
                        )
                    ) : jugado ? (
                        <button
                            type="button"
                            onClick={finalizarMinijuego}
                            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                        >
                            Finalizar mini juego
                        </button>
                    ) : (
                        <p className="mt-2 text-xs italic text-muted-foreground">
                            Aún no registramos interacción: haz clic en el juego o usa sus controles.
                        </p>
                    )}
                </div>
            )}

            <div
                className={interaccionIframe || completado ? undefined : "min-h-[120px]"}
                onPointerDownCapture={interaccionIframe || completado ? undefined : marcarArea}
            >
                {children}
            </div>
        </div>
    );
}

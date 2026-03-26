import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import { Crown, Sparkles, User } from "lucide-react";

const API_PERFIL = "/api/perfil";
const API_RANKING = "/api/ranking";

function normalizarRole(role) {
    return (role ?? "").toString().toLowerCase();
}

function normalizarPerfil(data, rolFallback) {
    return {
        id: Number(data?.id ?? data?.user_id ?? 0),
        nombre: data?.nombre ?? data?.name ?? "Jugador",
        foto: data?.foto ?? data?.avatar ?? null,
        role: normalizarRole(data?.role ?? data?.rol ?? rolFallback),
        nivel: Number(data?.nivel ?? data?.level ?? 1),
        xp_actual: Number(data?.xp_actual ?? data?.xp ?? 0),
        xp_siguiente_nivel: Number(data?.xp_siguiente_nivel ?? data?.xp_required ?? 1),
    };
}

function normalizarRanking(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map((u) => ({
        id: Number(u?.id ?? u?.user_id ?? 0),
        nombre: u?.nombre ?? u?.name ?? "Jugador",
        puntaje: Number(u?.puntaje ?? u?.score ?? 0),
        nivel: Number(u?.nivel ?? u?.level ?? 1),
    }));
}

function BarraXPCompact({ actual, max, nivel }) {
    const pct = max > 0 ? Math.min(100, Math.round((actual / max) * 100)) : 0;
    return (
        <div className="w-full min-w-[160px] space-y-1">
            <div className="flex items-center justify-between text-[10px] font-semibold text-violet-300/90">
                <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Nv.{nivel}
                </span>
                <span className="font-mono text-violet-200/80">
                    {actual.toLocaleString()}/{max.toLocaleString()}
                </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-900/70 ring-1 ring-violet-500/25">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 transition-[width] duration-500 ease-out shadow-[0_0_10px_rgba(139,92,246,.65)]"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <div className="text-right text-[10px] text-slate-400">{pct}%</div>
        </div>
    );
}

export default function HeaderUsuario({ topOffsetPx = 0 }) {
    const { auth } = usePage().props;
    const rolAuth = normalizarRole((auth?.user as { role?: string } | null)?.role);
    const visible = rolAuth === "docente" || rolAuth === "estudiante";

    const [perfil, setPerfil] = useState(null);
    const [ranking, setRanking] = useState([]);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (!visible) return;
        let mounted = true;
        setCargando(true);

        Promise.all([axios.get(API_PERFIL), axios.get(API_RANKING)])
            .then(([resPerfil, resRank]) => {
                if (!mounted) return;
                const p = normalizarPerfil(resPerfil?.data ?? null, rolAuth);
                const r = normalizarRanking(resRank?.data ?? []);
                setPerfil(p);
                setRanking(r);
            })
            .catch(() => {
                if (!mounted) return;
                setPerfil(
                    normalizarPerfil(
                        {
                            id: (auth?.user as { id?: number } | null)?.id ?? 1,
                            nombre: (auth?.user as { name?: string } | null)?.name ?? "Jugador",
                            role: rolAuth,
                            nivel: 1,
                            xp_actual: 0,
                            xp_siguiente_nivel: 1,
                        },
                        rolAuth,
                    ),
                );
                setRanking([
                    { id: 1, nombre: "Jugador", puntaje: 0, nivel: 1 },
                    { id: 2, nombre: "Nova", puntaje: 500, nivel: 10 },
                ]);
            })
            .finally(() => {
                if (mounted) setCargando(false);
            });

        return () => {
            mounted = false;
        };
    }, [visible, rolAuth]);

    const position = useMemo(() => {
        if (!perfil?.id || ranking.length === 0) return null;
        const ordenado = [...ranking].sort((a, b) => b.puntaje - a.puntaje);
        const idx = ordenado.findIndex((u) => u.id === perfil.id);
        return idx === -1 ? null : idx + 1;
    }, [perfil?.id, ranking]);

    if (!visible) return null;

    return (
        <header
            className="sticky top-0 z-30 border-b border-violet-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/90 shadow-[0_0_32px_rgba(139,92,246,0.12)] backdrop-blur-md"
            style={topOffsetPx ? { top: topOffsetPx } : undefined}
        >
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:gap-5">
                <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-initial sm:gap-4">
                    <div className="relative shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-violet-400/40 bg-gradient-to-br from-violet-900/60 to-slate-900 shadow-[0_0_12px_rgba(167,139,250,0.35)] ring-2 ring-violet-500/20 transition-transform duration-200 hover:scale-105">
                            {perfil?.foto ? (
                                <img src={perfil.foto} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-5 w-5 text-violet-300" />
                            )}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-md border border-slate-950 bg-gradient-to-br from-cyan-500 to-violet-600 px-1 text-[10px] font-black text-white shadow-md">
                            {perfil?.nivel ?? 1}
                        </span>
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-black text-white drop-shadow-[0_0_8px_rgba(167,139,250,0.35)]">
                            {cargando && !perfil ? "Cargando..." : perfil?.nombre ?? "—"}
                        </p>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-400/80">
                            {perfil?.role ? `Rol: ${perfil.role}` : rolAuth}
                        </p>
                    </div>
                </div>

                <div className="hidden sm:block" style={{ width: 1, height: 26, background: "rgba(139,92,246,0.25)" }} />

                <div className="flex min-w-[140px] flex-col items-end gap-1">
                    <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-950/25 px-3 py-1 text-[11px] font-bold text-violet-200/90 shadow-[0_0_18px_rgba(167,139,250,0.12)]">
                        <Crown className="h-4 w-4 text-amber-300" />
                        <span>Posición #{position ?? "—"}</span>
                    </div>
                    {perfil && (
                        <div className="w-full sm:max-w-[240px]">
                            <BarraXPCompact
                                actual={perfil.xp_actual ?? 0}
                                max={perfil.xp_siguiente_nivel ?? 1}
                                nivel={perfil.nivel ?? 1}
                            />
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}


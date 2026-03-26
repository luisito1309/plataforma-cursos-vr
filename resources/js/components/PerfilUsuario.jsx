import { useCallback, useEffect, useMemo, useState } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import {
    Trophy,
    Target,
    Timer,
    Gamepad2,
    Crown,
    ChevronUp,
    User,
    Sparkles,
} from "lucide-react";
import AdminDashboard from "@/components/AdminDashboard";

// ─── Datos simulados (fallback si la API no responde) ────────────────────────

const MOCK_USUARIO = {
    id: 1,
    nombre: "Alex VR",
    foto: null,
    role: "estudiante",
    nivel: 24,
    xp_actual: 3750,
    xp_siguiente_nivel: 5000,
    aciertos_pct: 85,
    tiempo_promedio_seg: 45,
    juegos_completados: 12,
};

const MOCK_RANKING = [
    { id: 7, nombre: "Nova", puntaje: 9840, nivel: 32 },
    { id: 3, nombre: "Kairo", puntaje: 9120, nivel: 29 },
    { id: 1, nombre: "Alex VR", puntaje: 8750, nivel: 24 },
    { id: 12, nombre: "Luna", puntaje: 8200, nivel: 22 },
    { id: 5, nombre: "Rex", puntaje: 7650, nivel: 21 },
    { id: 9, nombre: "Mika", puntaje: 7100, nivel: 19 },
    { id: 2, nombre: "Zen", puntaje: 6800, nivel: 18 },
];

const API_PERFIL = "/api/perfil";
const API_RANKING = "/api/ranking";

function normalizarRole(role) {
    return (role ?? "").toString().toLowerCase();
}

function normalizarPerfil(data, rolFallback) {
    const foto = data?.foto ?? data?.avatar ?? null;
    const role = normalizarRole(data?.role ?? data?.rol ?? rolFallback);
    return {
        id: Number(data?.id ?? data?.user_id ?? MOCK_USUARIO.id),
        nombre: data?.nombre ?? data?.name ?? MOCK_USUARIO.nombre,
        foto,
        role: role || MOCK_USUARIO.role,
        nivel: Number(data?.nivel ?? data?.level ?? MOCK_USUARIO.nivel),
        xp_actual: Number(data?.xp_actual ?? data?.xp ?? MOCK_USUARIO.xp_actual),
        xp_siguiente_nivel: Number(
            data?.xp_siguiente_nivel ??
                data?.xp_siguiente ??
                data?.xp_required ??
                data?.xp_siguiente_nivel_required ??
                MOCK_USUARIO.xp_siguiente_nivel,
        ),
        aciertos_pct: Number(data?.aciertos_pct ?? data?.aciertos ?? MOCK_USUARIO.aciertos_pct),
        tiempo_promedio_seg: Number(
            data?.tiempo_promedio_seg ?? data?.tiempo_promedio ?? data?.avg_time ?? MOCK_USUARIO.tiempo_promedio_seg,
        ),
        juegos_completados: Number(
            data?.juegos_completados ??
                data?.games_completados ??
                data?.games_completed ??
                MOCK_USUARIO.juegos_completados,
        ),
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

// ─── Subcomponentes ────────────────────────────────────────────────────────────

function Card({ children, className = "", glow = false }) {
    return (
        <div
            className={`rounded-2xl border border-violet-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/95 p-5 shadow-xl shadow-black/40 backdrop-blur-sm transition-all duration-300 hover:border-violet-400/35 hover:shadow-violet-900/20 ${glow ? "ring-1 ring-violet-500/30" : ""
                } ${className}`}
        >
            {children}
        </div>
    );
}

function BarraXP({ actual, max, nivel }) {
    const pct = max > 0 ? Math.min(100, Math.round((actual / max) * 100)) : 0;
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-medium text-violet-300">
                    <Sparkles className="h-3.5 w-3.5" /> Nivel {nivel}
                </span>
                <span>
                    {actual.toLocaleString()} / {max.toLocaleString()} XP
                </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-800/80 ring-1 ring-slate-700/50">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500 transition-[width] duration-700 ease-out"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <p className="text-right text-[11px] text-slate-500">{pct}% hacia el siguiente nivel</p>
        </div>
    );
}

function StatPill({ icon: Icon, label, value, sub }) {
    return (
        <div className="group flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-900/50 p-4 transition-all duration-200 hover:border-violet-500/40 hover:bg-slate-800/60">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-violet-600/20 text-violet-300 transition-transform group-hover:scale-105">
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
                <p className="truncate text-lg font-bold text-slate-100">{value}</p>
                {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
            </div>
        </div>
    );
}

function RankingList({ lista, usuarioActualId }) {
    const ordenado = useMemo(
        () => [...lista].sort((a, b) => b.puntaje - a.puntaje),
        [lista],
    );

    return (
        <ul className="space-y-2">
            {ordenado.map((u, idx) => {
                const pos = idx + 1;
                const esYo = u.id === usuarioActualId;
                return (
                    <li
                        key={u.id}
                        className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200 ${esYo
                                ? "border-violet-500/60 bg-violet-950/50 ring-1 ring-violet-500/30"
                                : "border-slate-700/50 bg-slate-900/40 hover:border-slate-600"
                            }`}
                    >
                        <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black ${pos === 1
                                    ? "bg-amber-500/20 text-amber-300"
                                    : pos === 2
                                        ? "bg-slate-400/20 text-slate-200"
                                        : pos === 3
                                            ? "bg-orange-700/30 text-orange-200"
                                            : "bg-slate-800 text-slate-400"
                                }`}
                        >
                            {pos === 1 ? <Crown className="h-4 w-4" /> : pos}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className={`truncate font-semibold ${esYo ? "text-violet-200" : "text-slate-200"}`}>
                                {u.nombre}
                                {esYo && (
                                    <span className="ml-2 rounded bg-violet-600/40 px-1.5 py-0.5 text-[10px] font-bold uppercase text-violet-100">
                                        Tú
                                    </span>
                                )}
                            </p>
                            <p className="text-xs text-slate-500">Nv. {u.nivel}</p>
                        </div>
                        <span className="shrink-0 font-mono text-sm font-bold text-blue-300">{u.puntaje.toLocaleString()} pts</span>
                    </li>
                );
            })}
        </ul>
    );
}

// ─── Helpers ranking ──────────────────────────────────────────────────────────

function calcularPosicionYVecinos(rankingOrdenado, usuarioId) {
    const ordenado = [...rankingOrdenado].sort((a, b) => b.puntaje - a.puntaje);
    const idx = ordenado.findIndex((u) => u.id === usuarioId);
    if (idx === -1) return null;
    const pos = idx + 1;
    const total = ordenado.length;
    const siguiente = idx > 0 ? ordenado[idx - 1] : null;
    const inferior = idx < ordenado.length - 1 ? ordenado[idx + 1] : null;
    const diffSiguiente = siguiente ? siguiente.puntaje - ordenado[idx].puntaje : 0;
    const pctTop = total > 0 ? Math.round((pos / total) * 100) : 0;
    return { pos, total, siguiente, inferior, diffSiguiente, miPuntaje: ordenado[idx].puntaje, pctTop };
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PerfilUsuario() {
    const { auth } = usePage().props;
    const roleAuth = normalizarRole((auth?.user as { role?: string } | null)?.role);

    const [usuario, setUsuario] = useState(null);
    const [ranking, setRanking] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [errorApi, setErrorApi] = useState(null);

    const cargarDatos = useCallback(async () => {
        setCargando(true);
        setErrorApi(null);
        try {
            const [resPerfil, resRank] = await Promise.all([
                axios.get(API_PERFIL, { validateStatus: (s) => s < 500 }),
                axios.get(API_RANKING, { validateStatus: (s) => s < 500 }),
            ]);
            if (resPerfil.status === 200 && resPerfil.data) {
                setUsuario(normalizarPerfil(resPerfil.data, roleAuth));
            } else {
                setUsuario(normalizarPerfil(null, roleAuth));
            }
            if (resRank.status === 200 && Array.isArray(resRank.data)) {
                setRanking(normalizarRanking(resRank.data));
            } else {
                setRanking(normalizarRanking(MOCK_RANKING));
            }
        } catch {
            setUsuario(normalizarPerfil(null, roleAuth));
            setRanking(normalizarRanking(MOCK_RANKING));
            setErrorApi("Modo demo: API no disponible.");
        } finally {
            setCargando(false);
        }
    }, [roleAuth]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const rankingOrdenado = useMemo(
        () => [...ranking].sort((a, b) => b.puntaje - a.puntaje),
        [ranking],
    );

    const statsRank = useMemo(() => {
        if (!usuario) return null;
        return calcularPosicionYVecinos(rankingOrdenado, usuario.id);
    }, [usuario, rankingOrdenado]);

    const mensajeTop = useMemo(() => {
        if (!statsRank) return "";
        const { pos, total } = statsRank;
        if (pos <= 3) return `Estás en el top 3 de ${total} jugadores.`;
        if (pos <= Math.ceil(total * 0.25)) return `Estás en el top 25% del ranking.`;
        return `Posición ${pos} de ${total} en el leaderboard.`;
    }, [statsRank]);

    const roleUsuario = normalizarRole(usuario?.role ?? roleAuth ?? "estudiante");

    if (cargando || !usuario) {
        return (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-violet-500/20 bg-slate-950 p-12">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
                    <p className="text-sm text-slate-400">Cargando perfil…</p>
                </div>
            </div>
        );
    }

    if (roleUsuario === "admin") {
        return (
            <AdminDashboard
                usuario={usuario}
                ranking={ranking}
                errorApi={errorApi}
            />
        );
    }

    return (
        <div className="min-h-0 w-full max-w-6xl space-y-6 text-slate-100">
            {errorApi && (
                <p className="rounded-lg border border-amber-500/30 bg-amber-950/40 px-3 py-2 text-center text-xs text-amber-200/90">
                    {errorApi}
                </p>
            )}

            <div className="grid gap-6 lg:grid-cols-12">
                <Card className="lg:col-span-5" glow>
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                        <div className="relative mx-auto shrink-0 sm:mx-0">
                            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-2 border-violet-500/50 bg-gradient-to-br from-violet-900/50 to-slate-900 shadow-lg shadow-violet-900/30 ring-4 ring-violet-500/10">
                                {usuario.foto ? (
                                    <img src={usuario.foto} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-14 w-14 text-violet-300/80" />
                                )}
                            </div>
                            <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-950 bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-black text-white shadow-lg">
                                {usuario.nivel}
                            </span>
                        </div>
                        <div className="min-w-0 flex-1 text-center sm:text-left">
                            <h2 className="font-['system-ui'] text-2xl font-black tracking-tight text-white drop-shadow-sm">
                                {usuario.nombre}
                            </h2>
                            <p className="mt-1 text-sm text-violet-300/80 capitalize">{usuario.role}</p>
                            <div className="mt-4">
                                <BarraXP
                                    actual={usuario.xp_actual}
                                    max={usuario.xp_siguiente_nivel}
                                    nivel={usuario.nivel}
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="space-y-6 lg:col-span-7">
                    <Card>
                        <div className="mb-4 flex items-center justify-between gap-2">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                                <Trophy className="h-5 w-5 text-amber-400" />
                                Leaderboard
                            </h3>
                            <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] text-slate-400">
                                Top {rankingOrdenado.length}
                            </span>
                        </div>
                        <RankingList lista={rankingOrdenado} usuarioActualId={usuario.id} />
                    </Card>

                    <Card>
                        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
                            <ChevronUp className="h-5 w-5 text-violet-400" />
                            Posición en ranking
                        </h3>
                        {statsRank ? (
                            <div className="rounded-xl border border-blue-500/25 bg-blue-950/30 p-4">
                                <p className="text-3xl font-black text-blue-300">
                                    #{statsRank.pos}
                                </p>
                                <p className="mt-1 text-sm text-slate-400">
                                    de {statsRank.total} jugadores
                                </p>
                                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                                    {mensajeTop}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">Sin datos de ranking.</p>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}

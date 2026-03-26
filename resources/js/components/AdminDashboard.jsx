import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import { Crown, Sparkles, Timer, Gamepad2, Target, Trophy, User, Zap } from "lucide-react";

const API_PERFIL = "/api/perfil";
const API_RANKING = "/api/ranking";

function normalizarRole(role) {
    return (role ?? "").toString().toLowerCase();
}

function normalizarPerfil(data, rolFallback = "admin") {
    const foto = data?.foto ?? data?.avatar ?? null;
    const role = normalizarRole(data?.role ?? data?.rol ?? rolFallback);
    return {
        id: Number(data?.id ?? data?.user_id ?? 0),
        nombre: data?.nombre ?? data?.name ?? "Admin",
        foto,
        role,
        nivel: Number(data?.nivel ?? data?.level ?? 1),
        xp_actual: Number(data?.xp_actual ?? data?.xp ?? 0),
        xp_siguiente_nivel: Number(data?.xp_siguiente_nivel ?? data?.xp_required ?? 1),
        aciertos_pct: Number(data?.aciertos_pct ?? data?.aciertos ?? data?.accuracy ?? 0),
        tiempo_promedio_seg: Number(data?.tiempo_promedio_seg ?? data?.tiempo_promedio ?? data?.avg_time ?? 0),
        juegos_completados: Number(data?.juegos_completados ?? data?.games_completados ?? data?.games_completed ?? 0),
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

function Card({ children, className = "", glow = false }) {
    return (
        <div
            className={`rounded-2xl border border-violet-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/95 p-5 shadow-xl shadow-black/40 backdrop-blur-sm transition-all duration-300 hover:border-violet-400/35 hover:shadow-violet-900/20 ${
                glow ? "ring-1 ring-violet-500/30" : ""
            } ${className}`}
        >
            {children}
        </div>
    );
}

function BarraXP({ actual, max, nivel, compact = false }) {
    const pct = max > 0 ? Math.min(100, Math.round((actual / max) * 100)) : 0;
    return (
        <div className={compact ? "w-full min-w-[160px]" : "space-y-2"}>
            {compact ? (
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-violet-300/90">
                        <span className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> Nv.{nivel}
                        </span>
                        <span className="font-mono">{actual.toLocaleString()}/{max.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-900/70 ring-1 ring-violet-500/25">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 transition-[width] duration-500 ease-out shadow-[0_0_10px_rgba(139,92,246,.65)]"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                </div>
            ) : (
                <>
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
                </>
            )}
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
    const ordenado = useMemo(() => [...lista].sort((a, b) => b.puntaje - a.puntaje), [lista]);
    return (
        <ul className="space-y-2">
            {ordenado.map((u, idx) => {
                const pos = idx + 1;
                const esYo = u.id === usuarioActualId;
                return (
                    <li
                        key={u.id}
                        className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200 ${
                            esYo
                                ? "border-violet-500/60 bg-violet-950/50 ring-1 ring-violet-500/30"
                                : "border-slate-700/50 bg-slate-900/40 hover:border-slate-600"
                        }`}
                    >
                        <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black ${
                                pos === 1
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

function calcularPosicion(rankingOrdenado, usuarioId) {
    const ordenado = [...rankingOrdenado].sort((a, b) => b.puntaje - a.puntaje);
    const idx = ordenado.findIndex((u) => u.id === usuarioId);
    return idx === -1 ? null : idx + 1;
}

export default function AdminDashboard({ usuario: usuarioProp, ranking: rankingProp, errorApi: errorApiProp } = {}) {
    const { auth } = usePage().props;
    const roleAuth = normalizarRole((auth?.user as { role?: string } | null)?.role);

    const [usuario, setUsuario] = useState(usuarioProp ?? null);
    const [ranking, setRanking] = useState(() => normalizarRanking(rankingProp ?? []));
    const [errorApi, setErrorApi] = useState(errorApiProp ?? null);
    const [cargando, setCargando] = useState(Boolean(!usuarioProp));

    const visible = roleAuth === "admin" || normalizarRole(usuarioProp?.role) === "admin";
    const usuarioId = usuario?.id ?? 0;

    useEffect(() => {
        let mounted = true;
        if (!visible) return;
        if (usuarioProp && Array.isArray(rankingProp) && usuario) return;

        setCargando(true);
        setErrorApi(null);

        Promise.all([axios.get(API_PERFIL), axios.get(API_RANKING)])
            .then(([resPerfil, resRank]) => {
                if (!mounted) return;
                const p = normalizarPerfil(resPerfil?.data ?? {}, "admin");
                setUsuario(p);
                setRanking(normalizarRanking(resRank?.data ?? []));
            })
            .catch(() => {
                if (!mounted) return;
                setUsuario(
                    normalizarPerfil(
                        {
                            id: 1,
                            nombre: "Admin VR",
                            role: "admin",
                            nivel: 18,
                            xp_actual: 4200,
                            xp_siguiente_nivel: 6000,
                            aciertos_pct: 92,
                            tiempo_promedio_seg: 38,
                            juegos_completados: 27,
                        },
                        "admin",
                    ),
                );
                setRanking([
                    { id: 5, nombre: "Nova", puntaje: 12000, nivel: 34 },
                    { id: 1, nombre: "Admin VR", puntaje: 10150, nivel: 18 },
                    { id: 2, nombre: "Kairo", puntaje: 9200, nivel: 29 },
                ]);
                setErrorApi("Modo demo: API no disponible.");
            })
            .finally(() => {
                if (!mounted) return;
                setCargando(false);
            });

        return () => {
            mounted = false;
        };
    }, [visible, usuarioProp, rankingProp, usuario]);

    const rankPos = useMemo(() => {
        if (!usuario) return null;
        return calcularPosicion(ranking, usuario.id);
    }, [ranking, usuario]);

    if (!visible) return null;

    if (cargando && !usuario) {
        return (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-violet-500/20 bg-slate-950 p-12">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
                    <p className="text-sm text-slate-400">Cargando admin…</p>
                </div>
            </div>
        );
    }

    if (!usuario) return null;

    return (
        <div className="min-h-0 w-full max-w-6xl space-y-6">
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
                            <p className="mt-1 text-sm text-violet-300/80">Rol: Admin · Panel gamificado</p>
                            <div className="mt-4">
                                <BarraXP actual={usuario.xp_actual} max={usuario.xp_siguiente_nivel} nivel={usuario.nivel} />
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="grid gap-4 sm:grid-cols-3 lg:col-span-7">
                    <StatPill icon={Target} label="Aciertos" value={`${usuario.aciertos_pct}%`} sub="Precisión global" />
                    <StatPill icon={Timer} label="Tiempo promedio" value={`${usuario.tiempo_promedio_seg}s`} sub="Por partida" />
                    <StatPill
                        icon={Gamepad2}
                        label="Juegos completados"
                        value={String(usuario.juegos_completados)}
                        sub="Mini juegos terminados"
                    />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
                <Card className="lg:col-span-7">
                    <div className="mb-4 flex items-center justify-between gap-2">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                            <Trophy className="h-5 w-5 text-amber-400" />
                            Ranking de usuarios
                        </h3>
                        <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] text-slate-400">
                            {rankPos ? `Tu posición #${rankPos}` : "—"}
                        </span>
                    </div>
                    <RankingList lista={ranking} usuarioActualId={usuario.id} />
                </Card>

                <Card className="lg:col-span-5">
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
                        <Zap className="h-5 w-5 text-violet-300" />
                        Experiencia del admin
                    </h3>
                    <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-slate-400">XP actual</p>
                                <p className="mt-1 text-2xl font-black text-white">{usuario.xp_actual.toLocaleString()}</p>
                            </div>
                            <div className="min-w-0 flex-1 text-right">
                                <p className="text-sm text-slate-400">XP requerido</p>
                                <p className="mt-1 text-2xl font-black text-white">{usuario.xp_siguiente_nivel.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <BarraXP actual={usuario.xp_actual} max={usuario.xp_siguiente_nivel} nivel={usuario.nivel} compact />
                        </div>
                    </div>

                    <p className="mt-4 text-xs leading-relaxed text-slate-400">
                        Panel administrativo con estilo videojuego. Integra con la API para mostrar datos reales del progreso y del leaderboard.
                    </p>
                </Card>
            </div>
        </div>
    );
}


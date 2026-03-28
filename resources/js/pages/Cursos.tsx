import React, { useEffect, useRef, useState } from "react";
import { Link } from "@inertiajs/react";
import axios from "axios";
import EduPageShell, { EduHeroBlobs, eduNavOutline } from "@/components/EduPageShell";
import { isMinijuegoOk, miniJuegoTieneProgresoLocal } from "@/lib/minijuegoStorage";
import QuizMedico3D from "@/components/QuizMedico3D";
import AnatomiaHumana3D from "@/components/AnatomiaHumana3D";
import Computer3D from "@/components/Computer3D";
import MiniJuegoProgreso from "@/components/MiniJuegoProgreso";
import CreativeBox from "@/components/CreativeBox";
import GamesFPS from "@/components/GamesFPS";
import { MinijuegoFullscreenToggleButton } from "@/components/MinijuegoFullscreenControls";
import {
    eduBadgeEyebrow,
    eduBtnDanger,
    eduBtnIcon,
    eduBtnOutline,
    eduBtnPrimary,
    eduChipCategoria,
    eduChipMiniJuego,
    eduContentSection,
    eduCourseCard,
    eduCourseImageBg,
    eduEyebrow,
    eduFormSection,
    eduHeadingHero,
    eduHeroSection,
    eduIconBoxSm,
    eduInput,
    eduLabel,
    eduModalBackdrop,
    eduModalCard,
    eduNavPrimary,
    eduSectionHeading,
    eduSpinner,
    eduStatCard,
    eduTextarea,
    eduTextMuted,
} from "@/lib/edu-ui";
import { cn } from "@/lib/utils";
import {
    BookOpen, Home, Plus, X,
    Upload, Edit2, Trash2, UserPlus, Play, Monitor,
    Gamepad2, Glasses, Cpu, Zap, ScanLine, Box, Crosshair,
} from "lucide-react";

// ─── Catálogo de mini juegos (escalable) ─────────────────────────────────────
type MiniJuegoOption = { value: string; label: string; icon: React.ReactNode; tag: string; };

const MINI_JUEGOS: MiniJuegoOption[] = [
    { value: "", label: "Sin mini juego", icon: <Gamepad2 size={14} />, tag: "—" },
    { value: "monster_friend", label: "Monster or Friend", icon: <Gamepad2 size={14} />, tag: "WEB" },
    { value: "pingpong", label: "Ping Pong (3D)", icon: <Monitor size={14} />, tag: "3D" },
    { value: "quiz_medico", label: "Quiz médico 3D", icon: <Zap size={14} />, tag: "QUIZ" },
    { value: "anatomia_humana", label: "Anatomía humana 3D", icon: <ScanLine size={14} />, tag: "3D" },
    { value: "konterball", label: "Konterball (VR web)", icon: <Glasses size={14} />, tag: "VR" },
    { value: "computer_3d", label: "Computer 3D", icon: <Cpu size={14} />, tag: "3D" },
    { value: "creative_box", label: "Creative Box", icon: <Box size={14} />, tag: "VOX" },
    { value: "games_fps", label: "Games FPS", icon: <Crosshair size={14} />, tag: "FPS" },
    // Futuros juegos — descomenta para activar:
    // { value: "vr_escape",   label: "Escape Room VR",     icon: <Glasses  size={14} />, tag: "VR"   },
    // { value: "sim_fisica",  label: "Simulación Física",  icon: <Cpu      size={14} />, tag: "SIM"  },
    // { value: "quiz_3d",     label: "Quiz Interactivo",   icon: <Zap      size={14} />, tag: "QUIZ" },
];

type Categoria = "play" | "medicina" | "tecnologia" | "creativo";

const CATEGORIA_LABELS: Record<Categoria, string> = {
    play: "Play",
    medicina: "Medicina",
    tecnologia: "Tecnología",
    creativo: "Creativo",
};

function miniJuegosPorCategoria(cat: Categoria): MiniJuegoOption[] {
    const pick = (values: string[]) =>
        values.map((v) => MINI_JUEGOS.find((j) => j.value === v)).filter((j): j is MiniJuegoOption => j != null);
    switch (cat) {
        case "play":
            return pick(["monster_friend", "pingpong", "konterball"]);
        case "medicina":
            return pick(["quiz_medico", "anatomia_humana"]);
        case "tecnologia":
            return pick(["", "computer_3d"]);
        case "creativo":
            return pick(["creative_box", "games_fps"]);
        default:
            return [];
    }
}

interface Curso {
    id: number;
    titulo: string;
    descripcion: string;
    imagen?: string;
    estado?: string;
    docente_id?: number;
    mini_juego?: string | null;
    categoria?: string | null;
}

/** Vista previa del formulario con control de pantalla completa (Medicina / Tecnología / Creativo). */
function PreviaMinijuegoConFullscreen({
    titulo,
    tituloColor,
    wrapStyle,
    botonClaro,
    children,
}: {
    titulo: string;
    tituloColor?: string;
    wrapStyle: React.CSSProperties;
    botonClaro?: boolean;
    children: React.ReactNode;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const temaBtn = botonClaro
        ? { border: "1px solid rgba(255,255,255,.28)", background: "rgba(255,255,255,.1)", color: "#e8e6ff" as const }
        : { border: "1px solid #d1d0cc", background: "#fff", color: "#1b1b18" as const };
    return (
        <div ref={ref} style={{ ...wrapStyle, position: "relative" }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 12,
                    flexWrap: "wrap",
                }}
            >
                <p className={cn(eduLabel, "mb-0")} style={tituloColor ? { color: tituloColor } : undefined}>
                    {titulo}
                </p>
                <MinijuegoFullscreenToggleButton containerRef={ref} buttonStyle={temaBtn} />
            </div>
            {children}
        </div>
    );
}

// ─── Componente ──────────────────────────────────────────────────────────────
function etiquetaEstadoCurso(curso: Curso): string {
    if (curso.mini_juego && miniJuegoTieneProgresoLocal(curso.mini_juego) && isMinijuegoOk(curso.id, curso.mini_juego)) {
        return "Completado";
    }
    return curso.estado?.trim() ?? "";
}

export default function Cursos() {
    const [, bumpMiniJuegoUi] = useState(0);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [imagen, setImagen] = useState<File | null>(null);
    const [miniJuego, setMiniJuego] = useState("");
    const [categoria, setCategoria] = useState<Categoria>("play");
    const [mostrarForm, setMostrarForm] = useState(false);
    const [modalEditar, setModalEditar] = useState<Curso | null>(null);
    const [editTitulo, setEditTitulo] = useState("");
    const [editDescripcion, setEditDescripcion] = useState("");

    useEffect(() => { cargar(); }, []);

    useEffect(() => {
        const h = () => bumpMiniJuegoUi((n) => n + 1);
        window.addEventListener("edu-minijuego-ok", h);
        return () => window.removeEventListener("edu-minijuego-ok", h);
    }, []);

    useEffect(() => {
        const opciones = miniJuegosPorCategoria(categoria);
        const permitidos = new Set(opciones.map((j) => j.value));
        if (!permitidos.has(miniJuego)) {
            setMiniJuego(opciones[0]?.value ?? "");
        }
    }, [categoria, miniJuego]);

    const cargar = () =>
        axios.get("/api/cursos")
            .then(r => setCursos(r.data))
            .catch(e => console.error(e));

    const crearCurso = () => {
        if (!titulo.trim() || !descripcion.trim()) return;
        const fd = new FormData();
        fd.append("titulo", titulo);
        fd.append("descripcion", descripcion);
        if (imagen) fd.append("imagen", imagen);
        if (miniJuego) fd.append("mini_juego", miniJuego);
        fd.append("categoria", categoria);
        axios.post("/api/cursos", fd, { headers: { "Content-Type": "multipart/form-data" } })
            .then(() => {
                cargar();
                setTitulo(""); setDescripcion(""); setImagen(null);
                setMiniJuego("");
                setCategoria("play");
                setMostrarForm(false);
            })
            .catch(e => console.error(e));
    };

    const inscribirse = (id: number) =>
        axios.post("/api/inscribirse", { curso_id: id })
            .then(() => alert("¡Te inscribiste al curso!"))
            .catch(e => console.error(e));

    const eliminar = (id: number) => {
        if (!window.confirm("¿Eliminar curso?")) return;
        axios.delete(`/api/cursos/${id}`).then(() => cargar()).catch(e => console.error(e));
    };

    const confirmarEditar = () => {
        if (!modalEditar || !editTitulo.trim() || !editDescripcion.trim()) return;
        axios.put(`/api/cursos/${modalEditar.id}`, { titulo: editTitulo, descripcion: editDescripcion })
            .then(() => { setModalEditar(null); cargar(); })
            .catch(e => console.error(e));
    };

    // Helper para obtener info del juego por value
    const getJuego = (value: string) => MINI_JUEGOS.find(j => j.value === value);

    const etiquetaCategoria = (cat: string | null | undefined) => {
        if (cat === "play" || cat === "medicina" || cat === "tecnologia" || cat === "creativo") return CATEGORIA_LABELS[cat];
        return null;
    };

    return (
        <>
            <EduPageShell
                title="Cursos — EduPlatform"
                navRight={
                    <>
                        <Link href="/" className={eduNavOutline}>
                            <Home size={14} /> Home
                        </Link>
                        <Link href="/mis-cursos" className={eduNavOutline}>
                            Mis cursos
                        </Link>
                        <button type="button" className={eduBtnPrimary} onClick={() => setMostrarForm(!mostrarForm)}>
                            {mostrarForm ? (
                                <>
                                    <X size={14} /> Cerrar
                                </>
                            ) : (
                                <>
                                    <Plus size={14} /> Nuevo curso
                                </>
                            )}
                        </button>
                    </>
                }
            >

                {/* ══ MODAL EDITAR ══ */}
                {modalEditar && (
                    <div className={eduModalBackdrop} onClick={() => setModalEditar(null)}>
                        <div onClick={(e) => e.stopPropagation()} className={eduModalCard}>
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white">Editar curso</h3>
                                <button
                                    type="button"
                                    onClick={() => setModalEditar(null)}
                                    className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className={eduLabel}>Título</label>
                                <input className={eduInput} value={editTitulo} onChange={(e) => setEditTitulo(e.target.value)} autoFocus />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className={eduLabel}>Descripción</label>
                                <textarea className={eduTextarea} style={{ minHeight: "100px" }} value={editDescripcion} onChange={(e) => setEditDescripcion(e.target.value)} />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" className={eduBtnOutline} onClick={() => setModalEditar(null)}>
                                    Cancelar
                                </button>
                                <button type="button" className={eduBtnPrimary} onClick={confirmarEditar}>
                                    Guardar cambios
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ HERO ══ */}
                <section className={eduHeroSection}>
                    <EduHeroBlobs />
                    <div className="relative mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6 px-6 pb-10 pt-14 lg:pt-16">
                        <div className="max-w-xl">
                            <div className={eduBadgeEyebrow}>
                                <Monitor className="h-3.5 w-3.5" /> Plataforma VR
                            </div>
                            <h1 className={eduHeadingHero}>Tus cursos</h1>
                            <p className={eduTextMuted}>Explora, crea y gestiona experiencias de realidad virtual como en el inicio.</p>
                        </div>
                        <div className={eduStatCard}>
                            <div className={eduIconBoxSm}>
                                <BookOpen className="h-5 w-5" strokeWidth={1.75} />
                            </div>
                            <span className="text-sm text-slate-400">
                                <strong className="text-2xl font-semibold text-white">{cursos.length}</strong>
                                <br />
                                cursos en catálogo
                            </span>
                        </div>
                    </div>
                </section>

                {/* ══ FORM CREAR ══ */}
                {mostrarForm && (
                    <div className={eduFormSection}>
                        <div className="mx-auto max-w-6xl px-6 py-8">
                            <h3 className="mb-5 text-base font-semibold text-white">Crear nuevo curso</h3>
                            <div className="mb-5 flex flex-col gap-2">
                                <label className={eduLabel}>Categoría</label>
                                <div className="flex flex-wrap gap-2.5">
                                    {(["play", "medicina", "tecnologia", "creativo"] as Categoria[]).map((c) => {
                                        const activa = categoria === c;
                                        return (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setCategoria(c)}
                                                className={cn(
                                                    "rounded-xl px-4 py-2 text-sm font-semibold transition",
                                                    activa
                                                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/25"
                                                        : "border border-white/15 bg-white/5 text-slate-300 hover:border-cyan-500/35 hover:bg-white/10",
                                                )}
                                            >
                                                {CATEGORIA_LABELS[c]}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className={eduLabel}>Título del curso</label>
                                    <input className={eduInput} placeholder="Ej: Introducción a VR con Unity" value={titulo} onChange={(e) => setTitulo(e.target.value)} autoFocus />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className={eduLabel}>Descripción</label>
                                    <textarea className={eduTextarea} style={{ minHeight: 80 }} placeholder="Describe el contenido del curso..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className={eduLabel}>Imagen del curso</label>
                                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-3.5 py-3 text-sm text-slate-400 transition hover:border-cyan-500/35">
                                        <Upload size={14} className="text-cyan-400/80" />
                                        {imagen ? imagen.name : "Seleccionar imagen"}
                                        <input id="imagenInput" type="file" accept="image/*" className="hidden" onChange={(e) => setImagen(e.target.files?.[0] ?? null)} />
                                    </label>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className={eduLabel}>Mini Juego</label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-cyan-400/90">
                                            {getJuego(miniJuego)?.icon ?? <Gamepad2 size={14} />}
                                        </div>
                                        <select
                                            className={cn(eduInput, "cursor-pointer appearance-none pl-10")}
                                            value={miniJuego}
                                            onChange={(e) => setMiniJuego(e.target.value)}
                                        >
                                            {miniJuegosPorCategoria(categoria).map((juego) => (
                                                <option key={juego.value} value={juego.value}>
                                                    {juego.label}
                                                    {juego.tag !== "—" ? ` [${juego.tag}]` : ""}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </div>
                                    </div>
                                    {miniJuego && (
                                        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                                            {getJuego(miniJuego)?.icon}
                                            <span>{getJuego(miniJuego)?.label}</span>
                                            <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] text-cyan-200">
                                                {getJuego(miniJuego)?.tag}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {miniJuego === "quiz_medico" && (
                                <PreviaMinijuegoConFullscreen
                                    titulo="Vista previa — Quiz médico 3D"
                                    wrapStyle={{
                                        marginTop: 24,
                                        padding: "24px",
                                        background: "rgb(15 23 42 / 0.75)",
                                        borderRadius: 16,
                                        border: "1px solid rgba(255,255,255,.1)",
                                    }}
                                >
                                    <div style={{ maxWidth: 720 }}>
                                        <MiniJuegoProgreso cursoId={0} storageKey="quiz_medico">
                                            <QuizMedico3D />
                                        </MiniJuegoProgreso>
                                    </div>
                                </PreviaMinijuegoConFullscreen>
                            )}

                            {miniJuego === "anatomia_humana" && (
                                <PreviaMinijuegoConFullscreen
                                    titulo="Vista previa — Anatomía humana 3D"
                                    wrapStyle={{
                                        marginTop: 24,
                                        padding: "24px",
                                        background: "rgb(15 23 42 / 0.75)",
                                        borderRadius: 16,
                                        border: "1px solid rgba(255,255,255,.1)",
                                    }}
                                >
                                    <div style={{ maxWidth: 900 }}>
                                        <AnatomiaHumana3D />
                                    </div>
                                </PreviaMinijuegoConFullscreen>
                            )}

                            {miniJuego === "konterball" && (
                                <div
                                    style={{
                                        marginTop: 24,
                                        padding: "24px",
                                        background: "rgb(15 23 42 / 0.75)",
                                        borderRadius: 16,
                                        border: "1px solid rgba(255,255,255,.1)",
                                    }}
                                >
                                    <p className={cn(eduLabel, "mb-3 text-slate-200")}>Vista previa — Konterball</p>
                                    <MiniJuegoProgreso cursoId={0} storageKey="konterball" interaccionIframe>
                                        <iframe
                                            src="https://konterball.com/"
                                            title="Konterball"
                                            style={{
                                                width: "100%",
                                                height: 520,
                                                border: "none",
                                                borderRadius: 12,
                                                background: "#0a0b12",
                                            }}
                                            allow="xr-spatial-tracking; fullscreen; gyroscope; accelerometer"
                                            loading="lazy"
                                        />
                                    </MiniJuegoProgreso>
                                    <p className="mt-2.5 text-xs text-slate-500">
                                        <a href="https://konterball.com/" target="_blank" rel="noopener noreferrer" className="font-medium text-cyan-400 hover:text-cyan-300">
                                            Abrir Konterball en pestaña nueva
                                        </a>
                                    </p>
                                </div>
                            )}

                            {miniJuego === "computer_3d" && (
                                <PreviaMinijuegoConFullscreen
                                    titulo="Vista previa — Computer 3D"
                                    wrapStyle={{
                                        marginTop: 24,
                                        padding: "24px",
                                        background: "rgb(15 23 42 / 0.75)",
                                        borderRadius: 16,
                                        border: "1px solid rgba(255,255,255,.1)",
                                    }}
                                >
                                    <div style={{ maxWidth: 900 }}>
                                        <Computer3D />
                                    </div>
                                </PreviaMinijuegoConFullscreen>
                            )}

                            {miniJuego === "creative_box" && (
                                <PreviaMinijuegoConFullscreen
                                    titulo="Vista previa — Creative Box (voxel)"
                                    tituloColor="#e8e6ff"
                                    botonClaro
                                    wrapStyle={{
                                        marginTop: 24,
                                        padding: "24px",
                                        background: "#0f1118",
                                        borderRadius: 16,
                                        border: "1px solid rgba(255,255,255,.12)",
                                    }}
                                >
                                    <CreativeBox preview cursoId={0} />
                                </PreviaMinijuegoConFullscreen>
                            )}

                            {miniJuego === "games_fps" && (
                                <PreviaMinijuegoConFullscreen
                                    titulo="Vista previa — Games FPS"
                                    wrapStyle={{
                                        marginTop: 24,
                                        padding: "12px",
                                        background: "rgb(15 23 42 / 0.75)",
                                        borderRadius: 16,
                                        border: "1px solid rgba(255,255,255,.1)",
                                    }}
                                >
                                    <div className="h-[220px] min-h-[200px] w-full max-w-3xl">
                                        <GamesFPS preview cursoId={0} />
                                    </div>
                                </PreviaMinijuegoConFullscreen>
                            )}

                            <div className="mt-5 flex justify-end">
                                <button type="button" className={eduBtnPrimary} onClick={crearCurso}>
                                    <Plus size={14} /> Crear curso
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ GRID ══ */}
                <section className={eduContentSection}>
                    <main className="mx-auto max-w-6xl px-6 pb-16">
                        <div className="mb-10">
                            <p className={eduEyebrow}>Catálogo</p>
                            <h2 className={eduSectionHeading}>Todos los cursos</h2>
                        </div>
                    {cursos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-600/15">
                                <BookOpen className="h-8 w-8 text-cyan-400/50" strokeWidth={1.25} />
                            </div>
                            <p className="text-sm text-slate-400">No hay cursos aún. ¡Crea el primero!</p>
                            <button type="button" className={eduBtnPrimary} onClick={() => setMostrarForm(true)}>
                                <Plus size={14} /> Nuevo curso
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {cursos.map((curso, i) => {
                                const juego = curso.mini_juego ? getJuego(curso.mini_juego) : null;
                                const catLabel = etiquetaCategoria(curso.categoria);
                                const estadoMostrar = etiquetaEstadoCurso(curso);
                                return (
                                    <article key={`${curso.id}-${curso.titulo}`} className={eduCourseCard}>
                                        <div className={eduCourseImageBg}>
                                            {curso.imagen ? (
                                                <img src={`/storage/${curso.imagen}`} alt={curso.titulo} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <BookOpen className="h-16 w-16 text-cyan-500/15" strokeWidth={1} />
                                                </div>
                                            )}
                                            <span className="pointer-events-none absolute bottom-1 right-3 select-none font-mono text-5xl font-light text-cyan-500/15">
                                                {String(i + 1).padStart(2, "0")}
                                            </span>
                                            {estadoMostrar && (
                                                <span className="absolute right-3 top-3 rounded-full border border-emerald-500/30 bg-emerald-950/85 px-2.5 py-1 text-[10px] font-bold text-emerald-300 backdrop-blur-sm">
                                                    {estadoMostrar}
                                                </span>
                                            )}
                                            {juego && juego.value !== "" && (
                                                <span className={cn(eduChipMiniJuego, "absolute left-3 top-3 border-cyan-400/40 bg-cyan-500/90 text-[10px] text-white")}>
                                                    {juego.icon} {juego.tag}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-1 flex-col p-5">
                                            <h2 className="mb-1.5 text-[15px] font-semibold leading-snug text-white">{curso.titulo}</h2>
                                            {catLabel && <span className={cn(eduChipCategoria, "mb-2.5 self-start")}>{catLabel}</span>}
                                            <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-400">
                                                {curso.descripcion}
                                            </p>

                                            {juego && juego.value !== "" && (
                                                <div className={cn(eduChipMiniJuego, "mb-3.5 self-start font-medium")}>
                                                    {juego.icon} {juego.label}
                                                </div>
                                            )}

                                            <div className="mt-auto flex items-center gap-2 border-t border-white/10 pt-3.5">
                                                <a
                                                    href={`/curso/${curso.id}`}
                                                    className={cn(eduBtnPrimary, "min-w-0 flex-1 justify-center text-xs")}
                                                >
                                                    <Play className="h-3.5 w-3.5" /> Ver curso
                                                </a>
                                                <button type="button" className={eduBtnIcon} onClick={() => inscribirse(curso.id)} title="Inscribirse">
                                                    <UserPlus className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className={eduBtnIcon}
                                                    onClick={() => {
                                                        setModalEditar(curso);
                                                        setEditTitulo(curso.titulo);
                                                        setEditDescripcion(curso.descripcion);
                                                    }}
                                                    title="Editar"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </button>
                                                <button type="button" className={eduBtnDanger} onClick={() => eliminar(curso.id)} title="Eliminar">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                    </main>
                </section>
            </EduPageShell>
        </>
    );
}
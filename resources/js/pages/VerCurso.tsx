import React, { useEffect, useState, useRef } from "react";
import { Link } from "@inertiajs/react";
import axios from "axios";
import EduPageShell, { EduHeroBlobs, eduNavOutline } from "@/components/EduPageShell";
import {
    eduBadgeEyebrow,
    eduBtnPrimary,
    eduBtnOutline,
    eduInput,
    eduLabel,
    eduModalBackdrop,
    eduModalCard,
    eduSpinner,
} from "@/lib/edu-ui";
import { cn } from "@/lib/utils";
import { isMinijuegoOk, miniJuegoTieneProgresoLocal } from "@/lib/minijuegoStorage";
import VRPingPong from "@/components/VRPingPong";
import QuizMedico3D from "@/components/QuizMedico3D";
import AnatomiaHumana3D from "@/components/AnatomiaHumana3D";
import Computer3D from "@/components/Computer3D";
import MiniJuegoProgreso from "@/components/MiniJuegoProgreso";
import CreativeBox from "@/components/CreativeBox";
import GamesFPS from "@/components/GamesFPS";
import {
    MinijuegoFullscreenToggleButton,
    minijuegoTienePantallaCompleta,
} from "@/components/MinijuegoFullscreenControls";
import {
    Home, ArrowLeft, Play, ChevronDown,
    Plus, X, Edit2, Trash2, FileText, Video, Layers,
    SkipBack, SkipForward, Monitor, Gamepad2, Zap, ScanLine, Glasses, Cpu, Box, Crosshair,
} from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface Video { id: number; titulo: string; url: string; modulo_id: number; }
interface Documento { id: number; modulo_id: number; titulo: string; archivo: string; }
interface Modulo { id: number; titulo: string; curso_id: number; videos: Video[]; documentos?: Documento[]; }
interface Curso { id: number; titulo: string; descripcion: string; imagen?: string; docente_id: number; estado: string; mini_juego?: string | null; categoria?: string | null; }

// ─── Catálogo de mini juegos ──────────────────────────────────────────────────
// Para agregar un juego nuevo en el futuro, solo añade una entrada aquí.
// Si tiene `url` → se muestra en iframe.
// Si no tiene `url` → se usa el componente propio (como pingpong).
const MINI_JUEGOS_INFO: Record<string, { label: string; tag: string; icon: React.ReactNode; url?: string }> = {
    monster_friend: {
        label: "Monster or Friend",
        tag: "WEB",
        icon: <Gamepad2 size={14} />,
        url: "https://codercat.xyz/monster-or-friend/",
    },
    pingpong: {
        label: "Ping Pong (3D)",
        tag: "3D",
        icon: <Monitor size={14} />,
        // sin url = usa componente <VRPingPong />
    },
    quiz_medico: {
        label: "Quiz médico 3D",
        tag: "QUIZ",
        icon: <Zap size={14} />,
        // sin url = usa componente <QuizMedico3D />
    },
    anatomia_humana: {
        label: "Anatomía humana 3D",
        tag: "3D",
        icon: <ScanLine size={14} />,
        // sin url = usa componente <AnatomiaHumana3D />
    },
    konterball: {
        label: "Konterball (VR web)",
        tag: "VR",
        icon: <Glasses size={14} />,
        url: "https://konterball.com/",
    },
    computer_3d: {
        label: "Computer 3D",
        tag: "3D",
        icon: <Cpu size={14} />,
    },
    creative_box: {
        label: "Creative Box",
        tag: "VOX",
        icon: <Box size={14} />,
    },
    // ── Juegos futuros ────────────────────────────────────────────────────────
    // quiz_vr:    { label: "Quiz VR",          tag: "VR",  icon: <Gamepad2 size={14} />, url: "https://..." },
    // escape_vr:  { label: "Escape Room VR",   tag: "VR",  icon: <Monitor  size={14} />, url: "https://..." },
    // sim_fisica: { label: "Simulación Física", tag: "SIM", icon: <Monitor  size={14} /> },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function toEmbedUrl(url: string): string {
    try {
        const u = new URL(url);
        if (u.hostname === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}?rel=0&modestbranding=1`;
        if (u.hostname.includes("youtube.com")) {
            const v = u.searchParams.get("v");
            if (v) return `https://www.youtube.com/embed/${v}?rel=0&modestbranding=1`;
            const short = u.pathname.match(/\/shorts\/([^/?]+)/);
            if (short) return `https://www.youtube.com/embed/${short[1]}?rel=0&modestbranding=1`;
            if (u.pathname.startsWith("/embed/")) return url;
        }
        if (u.hostname.includes("vimeo.com")) {
            const id = u.pathname.split("/").filter(Boolean).pop();
            if (id) return `https://player.vimeo.com/video/${id}`;
        }
        return url;
    } catch { return url; }
}
const isNativeVideo = (url: string) => /\.(mp4|webm|ogg)(\?|$)/i.test(url);

// ─── Componente ──────────────────────────────────────────────────────────────
export default function VerCurso({ id }: { id: number }) {
    const [curso, setCurso] = useState<Curso | null>(null);
    const [modulos, setModulos] = useState<Modulo[]>([]);
    const [nuevoModulo, setNuevoModulo] = useState("");
    const [videoActivo, setVideoActivo] = useState<Video | null>(null);
    const [moduloAbierto, setModuloAbierto] = useState<number | null>(null);
    const [mostrarFormModulo, setMostrarFormModulo] = useState(false);
    const [loading, setLoading] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Estado para controlar qué juego está seleccionado en la sección de mini juegos
    const [juegoSeleccionado, setJuegoSeleccionado] = useState<string | null>(null);
    /** Mini juegos con progreso en localStorage: sustituye el estado del curso por "Completado" en el chip al finalizar. */
    const [miniJuegoLocalListo, setMiniJuegoLocalListo] = useState(false);

    const [modalVideo, setModalVideo] = useState<{ modulo_id: number } | null>(null);
    const [formVideo, setFormVideo] = useState({ titulo: "", url: "" });
    const [modalEditModulo, setModalEditModulo] = useState<Modulo | null>(null);
    const [editTituloModulo, setEditTituloModulo] = useState("");
    const [modalDocumento, setModalDocumento] = useState<{ modulo_id: number } | null>(null);
    const [formDocumento, setFormDocumento] = useState({ titulo: "", archivo: null as File | null });
    const miniJuegoCardRef = useRef<HTMLDivElement>(null);

    useEffect(() => { cargarCurso(); }, []);
    useEffect(() => { if (videoRef.current) videoRef.current.load(); }, [videoActivo?.url]);

    useEffect(() => {
        if (!curso?.mini_juego || !miniJuegoTieneProgresoLocal(curso.mini_juego)) {
            setMiniJuegoLocalListo(false);
            return;
        }
        setMiniJuegoLocalListo(isMinijuegoOk(curso.id, curso.mini_juego));
    }, [curso?.id, curso?.mini_juego]);

    useEffect(() => {
        const fn = (e: Event) => {
            const ev = e as CustomEvent<{ cursoId: number; juego: string }>;
            if (!curso?.id || !curso.mini_juego) return;
            if (ev.detail?.cursoId === curso.id && ev.detail?.juego === curso.mini_juego) setMiniJuegoLocalListo(true);
        };
        window.addEventListener("edu-minijuego-ok", fn);
        return () => window.removeEventListener("edu-minijuego-ok", fn);
    }, [curso?.id, curso?.mini_juego]);

    const cargarCurso = () => {
        setLoading(true);
        Promise.all([axios.get(`/api/cursos/${id}`), axios.get(`/api/cursos/${id}/modulos`)])
            .then(([resCurso, resMods]) => {
                const cursoData: Curso = resCurso.data;
                setCurso(cursoData);
                const mods: Modulo[] = resMods.data;
                setModulos(mods);
                if (mods.length > 0) {
                    setModuloAbierto(mods[0].id);
                    if (!videoActivo && mods[0].videos?.length > 0) setVideoActivo(mods[0].videos[0]);
                }
                // Seleccionar automáticamente el juego del curso al cargar
                if (cursoData.mini_juego && MINI_JUEGOS_INFO[cursoData.mini_juego]) {
                    setJuegoSeleccionado(cursoData.mini_juego);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const agregarModulo = () => {
        if (!nuevoModulo.trim()) return;
        axios.post("/api/modulos", { curso_id: id, titulo: nuevoModulo })
            .then(() => { setNuevoModulo(""); setMostrarFormModulo(false); cargarCurso(); })
            .catch(console.error);
    };

    const confirmarEditarModulo = () => {
        if (!modalEditModulo || !editTituloModulo.trim()) return;
        axios.put(`/api/modulos/${modalEditModulo.id}`, { titulo: editTituloModulo })
            .then(() => { setModalEditModulo(null); cargarCurso(); })
            .catch(console.error);
    };

    const agregarVideo = () => {
        if (!modalVideo || !formVideo.titulo.trim() || !formVideo.url.trim()) return;
        axios.post("/api/videos", { modulo_id: modalVideo.modulo_id, titulo: formVideo.titulo, url: formVideo.url })
            .then(() => { setModalVideo(null); setFormVideo({ titulo: "", url: "" }); cargarCurso(); })
            .catch(console.error);
    };

    const eliminarVideo = (video_id: number) => {
        if (!window.confirm("¿Eliminar este video?")) return;
        axios.delete(`/api/videos/${video_id}`)
            .then(() => { if (videoActivo?.id === video_id) setVideoActivo(null); cargarCurso(); })
            .catch(console.error);
    };

    const agregarDocumento = () => {
        if (!modalDocumento || !formDocumento.titulo.trim() || !formDocumento.archivo) return;
        const fd = new FormData();
        fd.append("modulo_id", String(modalDocumento.modulo_id));
        fd.append("titulo", formDocumento.titulo);
        fd.append("archivo", formDocumento.archivo);
        axios.post("/api/documentos", fd, { headers: { "Content-Type": "multipart/form-data" } })
            .then(() => { setModalDocumento(null); setFormDocumento({ titulo: "", archivo: null }); cargarCurso(); })
            .catch(console.error);
    };

    const eliminarDocumento = (docId: number) => {
        if (!window.confirm("¿Eliminar este documento?")) return;
        axios.delete(`/api/documentos/${docId}`).then(() => cargarCurso()).catch(console.error);
    };

    const eliminarModulo = (moduloId: number) => {
        if (!window.confirm("¿Eliminar este módulo y todo su contenido?")) return;
        axios.delete(`/api/modulos/${moduloId}`)
            .then(() => { if (moduloAbierto === moduloId) setModuloAbierto(null); cargarCurso(); })
            .catch(console.error);
    };

    const todosLosVideos = modulos.flatMap(m => m.videos ?? []);
    const indiceActivo = todosLosVideos.findIndex(v => v.id === videoActivo?.id);
    const anterior = indiceActivo > 0 ? todosLosVideos[indiceActivo - 1] : null;
    const siguiente = indiceActivo < todosLosVideos.length - 1 ? todosLosVideos[indiceActivo + 1] : null;
    const irAVideo = (video: Video) => {
        setVideoActivo(video);
        const mod = modulos.find(m => m.videos?.some(v => v.id === video.id));
        if (mod) setModuloAbierto(mod.id);
    };

    // Juegos disponibles para este curso (por ahora solo el asignado, en el futuro podría ser lista)
    const juegosDisponibles = curso?.mini_juego && MINI_JUEGOS_INFO[curso.mini_juego]
        ? [curso.mini_juego]
        : [];

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <EduPageShell
                title="Curso"
                navMaxWidthClass="max-w-7xl"
                navRight={
                    <Link href="/" className={eduNavOutline}>
                        <Home size={14} /> Home
                    </Link>
                }
            >
                <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 py-24">
                    <div className={eduSpinner} aria-hidden />
                    <p className="text-sm text-slate-400">Cargando curso…</p>
                </div>
            </EduPageShell>
        );
    }

    if (!curso) return null;

    // ── Modal helper ─────────────────────────────────────────────────────────
    const Modal = ({ onClose, children }: { onClose: () => void; children: React.ReactNode }) => (
        <div className={eduModalBackdrop} onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()} className={`${eduModalCard} flex max-w-[460px] flex-col gap-4`}>
                {children}
            </div>
        </div>
    );

    return (
        <>
            <style>{hoverCss}</style>

            <EduPageShell
                title={curso.titulo}
                navMaxWidthClass="max-w-7xl"
                navMiddle={
                    <span className="block max-w-[min(100%,280px)] truncate text-sm font-semibold text-slate-200 sm:max-w-md">
                        {curso.titulo}
                    </span>
                }
                navRight={
                    <>
                        <Link href="/" className={eduNavOutline}>
                            <Home size={14} /> Home
                        </Link>
                        <Link href="/cursos" className={eduNavOutline}>
                            <ArrowLeft size={14} /> Cursos
                        </Link>
                    </>
                }
            >
                {/* ══ MODALES ══ */}

                {/* Modal agregar video */}
                {modalVideo && (
                    <Modal onClose={() => setModalVideo(null)}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">Agregar video</h3>
                            <button type="button" onClick={() => setModalVideo(null)} className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={eduLabel}>Título</label>
                            <input className={eduInput} placeholder="Ej: Introducción al módulo" value={formVideo.titulo} onChange={(e) => setFormVideo({ ...formVideo, titulo: e.target.value })} autoFocus />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={eduLabel}>URL del video</label>
                            <input className={eduInput} placeholder="https://youtube.com/watch?v=..." value={formVideo.url} onChange={(e) => setFormVideo({ ...formVideo, url: e.target.value })} />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                            <button type="button" className={eduBtnOutline} onClick={() => setModalVideo(null)}>
                                Cancelar
                            </button>
                            <button type="button" className={eduBtnPrimary} onClick={agregarVideo}>
                                Agregar
                            </button>
                        </div>
                    </Modal>
                )}

                {/* Modal editar módulo */}
                {modalEditModulo && (
                    <Modal onClose={() => setModalEditModulo(null)}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">Editar módulo</h3>
                            <button type="button" onClick={() => setModalEditModulo(null)} className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={eduLabel}>Nombre del módulo</label>
                            <input
                                className={eduInput}
                                value={editTituloModulo}
                                onChange={(e) => setEditTituloModulo(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => e.key === "Enter" && confirmarEditarModulo()}
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                            <button type="button" className={eduBtnOutline} onClick={() => setModalEditModulo(null)}>
                                Cancelar
                            </button>
                            <button type="button" className={eduBtnPrimary} onClick={confirmarEditarModulo}>
                                Guardar
                            </button>
                        </div>
                    </Modal>
                )}

                {/* Modal agregar PDF */}
                {modalDocumento && (
                    <Modal onClose={() => { setModalDocumento(null); setFormDocumento({ titulo: "", archivo: null }); }}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">Subir documento PDF</h3>
                            <button type="button" onClick={() => setModalDocumento(null)} className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={eduLabel}>Título</label>
                            <input className={eduInput} placeholder="Ej: Teoría VR" value={formDocumento.titulo} onChange={(e) => setFormDocumento({ ...formDocumento, titulo: e.target.value })} autoFocus />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={eduLabel}>Archivo PDF</label>
                            <input type="file" accept=".pdf,application/pdf" className={`${eduInput} cursor-pointer file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-cyan-200`} onChange={(e) => setFormDocumento({ ...formDocumento, archivo: e.target.files?.[0] ?? null })} />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                            <button type="button" className={eduBtnOutline} onClick={() => setModalDocumento(null)}>
                                Cancelar
                            </button>
                            <button type="button" className={eduBtnPrimary} onClick={agregarDocumento}>
                                Subir
                            </button>
                        </div>
                    </Modal>
                )}

                {/* ══ CABECERA DEL CURSO ══ */}
                <section className="relative overflow-hidden border-b border-white/10">
                    <EduHeroBlobs />
                    {curso.imagen && (
                        <>
                            <div className="pointer-events-none absolute inset-0 opacity-30">
                                <img
                                    src={`/storage/${curso.imagen}`}
                                    alt=""
                                    className="h-full w-full object-cover opacity-[0.08]"
                                />
                            </div>
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
                        </>
                    )}
                    <div className="relative mx-auto max-w-7xl px-6 py-10 lg:py-12">
                        <div className={`${eduBadgeEyebrow} mb-3 px-3 py-1 text-xs`}>
                            <Monitor size={12} /> Aula VR
                        </div>
                        <h1 className="mb-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-white lg:text-4xl">
                            {curso.titulo}
                        </h1>
                        <p className="mb-5 max-w-2xl text-sm leading-relaxed text-slate-400 lg:text-base">
                            {curso.descripcion}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { icon: <Layers size={11} />, label: `${modulos.length} módulos` },
                                { icon: <Video size={11} />, label: `${todosLosVideos.length} videos` },
                                {
                                    icon: null,
                                    label:
                                        miniJuegoLocalListo &&
                                            curso.mini_juego &&
                                            miniJuegoTieneProgresoLocal(curso.mini_juego)
                                            ? "Completado"
                                            : curso.estado,
                                    green: true,
                                },
                            ].map((chip, i) => (
                                <span
                                    key={i}
                                    className={cn(
                                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                                        chip.green
                                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                            : "border-white/10 bg-white/[0.05] text-slate-400",
                                    )}
                                >
                                    {chip.icon}
                                    {chip.label}
                                </span>
                            ))}
                            {juegosDisponibles.length > 0 && (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
                                    <Gamepad2 size={11} />
                                    {juegosDisponibles.length} mini {juegosDisponibles.length === 1 ? "juego" : "juegos"}
                                </span>
                            )}
                        </div>
                    </div>
                </section>

                {/* ══ PLAYER + SIDEBAR ══ */}
                <section className="bg-white dark:bg-[#0d0d0c]">
                    <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-[1fr_320px]">
                        {/* ── Pantalla principal ── */}
                        <div className="flex flex-col border-[#e3e3e0] md:border-r dark:border-[#2a2a26]">
                            <div className="relative w-full bg-[#f5f5f3] pt-[56.25%] dark:bg-[#161615]">
                                {videoActivo ? (
                                    isNativeVideo(videoActivo.url) ? (
                                        <video ref={videoRef} controls style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} key={videoActivo.url}>
                                            <source src={videoActivo.url} />
                                        </video>
                                    ) : (
                                        <iframe
                                            src={toEmbedUrl(videoActivo.url)}
                                            title={videoActivo.titulo}
                                            allowFullScreen
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                                        />
                                    )
                                ) : (
                                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                                        <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(34,211,238,.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <Play size={28} color="rgba(34,211,238,.3)" />
                                        </div>
                                        <p style={{ color: "#706f6c", fontSize: 14, margin: 0 }}>Selecciona un video para comenzar</p>
                                    </div>
                                )}
                            </div>

                            {videoActivo && (
                                <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(227,227,224,.6)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", background: "#fff" }}>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ margin: "0 0 3px", fontSize: 10, fontWeight: 700, color: "#22d3ee", textTransform: "uppercase", letterSpacing: ".08em" }}>Reproduciendo</p>
                                        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#1b1b18", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {videoActivo.titulo}
                                        </h2>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <button
                                            type="button"
                                            className={cn(eduBtnOutline, "text-xs")}
                                            disabled={!anterior}
                                            onClick={() => anterior && irAVideo(anterior)}
                                        >
                                            <SkipBack size={13} /> Anterior
                                        </button>
                                        <button
                                            type="button"
                                            className={cn(eduBtnPrimary, "text-xs")}
                                            disabled={!siguiente}
                                            onClick={() => siguiente && irAVideo(siguiente)}
                                        >
                                            Siguiente <SkipForward size={13} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Sidebar playlist ── */}
                        <aside className="flex min-h-[320px] flex-col border-[#e3e3e0] bg-white dark:border-[#2a2a26] dark:bg-[#111110] md:max-h-[calc(56.25vw+300px)] md:border-r">
                            <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid rgba(227,227,224,.6)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: "#706f6c", textTransform: "uppercase", letterSpacing: ".08em" }}>Contenido</span>
                                <span style={{ fontSize: 11, color: "#706f6c", background: "#f5f5f3", border: "1px solid #e3e3e0", borderRadius: 999, padding: "2px 10px" }}>
                                    {Math.max(0, indiceActivo + 1)} / {todosLosVideos.length}
                                </span>
                            </div>

                            <div style={{ overflowY: "auto", flex: 1 }}>
                                {modulos.map(modulo => {
                                    const isOpen = moduloAbierto === modulo.id;
                                    return (
                                        <div key={modulo.id} style={{ borderBottom: "1px solid rgba(227,227,224,.6)" }}>
                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                <button
                                                    className="vc-mod-toggle"
                                                    onClick={() => setModuloAbierto(isOpen ? null : modulo.id)}
                                                    style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", minWidth: 0 }}
                                                >
                                                    <ChevronDown size={13} color="#706f6c" style={{ flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }} />
                                                    <span style={{ fontSize: 12, fontWeight: 600, color: "#1b1b18", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                        {modulo.titulo}
                                                    </span>
                                                    <span style={{ fontSize: 10, color: "#706f6c", background: "#f5f5f3", border: "1px solid #e3e3e0", borderRadius: 999, padding: "2px 7px", flexShrink: 0 }}>
                                                        {modulo.videos?.length ?? 0}
                                                    </span>
                                                </button>
                                                <div style={{ display: "flex", gap: 2, paddingRight: 10, flexShrink: 0 }}>
                                                    <button className="vc-icon-btn" title="Editar módulo" onClick={() => { setModalEditModulo(modulo); setEditTituloModulo(modulo.titulo); }} style={{ width: 26, height: 26, borderRadius: 7, border: "none", background: "transparent", color: "#706f6c", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button className="vc-icon-btn-green" title="Agregar video" onClick={() => setModalVideo({ modulo_id: modulo.id })} style={{ width: 26, height: 26, borderRadius: 7, border: "none", background: "transparent", color: "#16a34a", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        <Plus size={13} />
                                                    </button>
                                                    <button className="vc-del-btn" title="Eliminar módulo" onClick={() => eliminarModulo(modulo.id)} style={{ width: 26, height: 26, borderRadius: 7, border: "none", background: "transparent", color: "#d1d0cc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>

                                            {isOpen && (
                                                <>
                                                    <ul style={{ listStyle: "none", padding: "4px 0", margin: 0, background: "#fafaf8" }}>
                                                        {(!modulo.videos || modulo.videos.length === 0) && (
                                                            <li style={{ fontSize: 12, color: "#a1a09a", padding: "8px 14px 8px 36px", fontStyle: "italic" }}>Sin videos aún</li>
                                                        )}
                                                        {modulo.videos?.map((video, idx) => {
                                                            const isActive = videoActivo?.id === video.id;
                                                            return (
                                                                <li key={video.id} style={{ display: "flex", alignItems: "center" }}>
                                                                    <button
                                                                        className={`vc-video-btn${isActive ? " active" : ""}`}
                                                                        onClick={() => irAVideo(video)}
                                                                        style={{ flex: 1, display: "flex", alignItems: "center", gap: 9, padding: "9px 14px", background: isActive ? "rgba(34,211,238,.06)" : "transparent", border: "none", cursor: "pointer", textAlign: "left", minWidth: 0, borderLeft: isActive ? "2px solid #22d3ee" : "2px solid transparent" }}
                                                                    >
                                                                        <span style={{ fontSize: 10, color: isActive ? "#22d3ee" : "#a1a09a", minWidth: 16, flexShrink: 0, fontWeight: 600 }}>{idx + 1}</span>
                                                                        <Play size={10} color={isActive ? "#22d3ee" : "#a1a09a"} style={{ flexShrink: 0 }} />
                                                                        <span style={{ fontSize: 12, color: isActive ? "#22d3ee" : "#1b1b18", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: isActive ? 600 : 400 }}>
                                                                            {video.titulo}
                                                                        </span>
                                                                    </button>
                                                                    <button className="vc-del-btn" title="Eliminar video" onClick={() => eliminarVideo(video.id)} style={{ width: 26, height: 26, borderRadius: 7, border: "none", background: "transparent", color: "#d1d0cc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 8 }}>
                                                                        <Trash2 size={11} />
                                                                    </button>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>

                                                    <div style={{ padding: "10px 14px 12px", borderTop: "1px solid rgba(227,227,224,.5)", background: "#fafaf8" }}>
                                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                                                            <span style={{ fontSize: 10, fontWeight: 700, color: "#a1a09a", textTransform: "uppercase", letterSpacing: ".07em" }}>Documentos</span>
                                                            <button className="vc-icon-btn-green" onClick={() => setModalDocumento({ modulo_id: modulo.id })} style={{ fontSize: 11, color: "#16a34a", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontWeight: 600, fontFamily: "'Instrument Sans', sans-serif" }}>
                                                                <Plus size={11} /> PDF
                                                            </button>
                                                        </div>
                                                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                                            {(!modulo.documentos || modulo.documentos.length === 0) && (
                                                                <li style={{ fontSize: 12, color: "#a1a09a", fontStyle: "italic" }}>Sin documentos</li>
                                                            )}
                                                            {modulo.documentos?.map(doc => (
                                                                <li key={doc.id} style={{ display: "flex", alignItems: "center" }}>
                                                                    <a href={`/storage/${doc.archivo}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontSize: 12, color: "#22d3ee", textDecoration: "none", padding: "5px 0", display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                                                                        <FileText size={11} style={{ flexShrink: 0 }} />
                                                                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.titulo}</span>
                                                                    </a>
                                                                    <button className="vc-del-btn" onClick={() => eliminarDocumento(doc.id)} style={{ width: 24, height: 24, borderRadius: 6, border: "none", background: "transparent", color: "#d1d0cc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                                        <Trash2 size={10} />
                                                                    </button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(227,227,224,.6)" }}>
                                {mostrarFormModulo ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        <input
                                            className={eduInput}
                                            placeholder="Nombre del módulo..."
                                            value={nuevoModulo}
                                            onChange={(e) => setNuevoModulo(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && agregarModulo()}
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                className={cn(eduBtnOutline, "h-9 w-9 shrink-0 !p-0")}
                                                onClick={() => {
                                                    setMostrarFormModulo(false);
                                                    setNuevoModulo("");
                                                }}
                                            >
                                                <X size={13} />
                                            </button>
                                            <button type="button" className={cn(eduBtnPrimary, "min-w-0 flex-1 justify-center text-xs")} onClick={agregarModulo}>
                                                Crear módulo
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        className="vc-add-mod"
                                        onClick={() => setMostrarFormModulo(true)}
                                        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "9px", background: "transparent", border: "1px dashed #d1d0cc", borderRadius: 10, color: "#a1a09a", cursor: "pointer", fontSize: 12, fontFamily: "'Instrument Sans', sans-serif", fontWeight: 500 }}
                                    >
                                        <Plus size={13} /> Nuevo módulo
                                    </button>
                                )}
                            </div>
                        </aside>
                    </div>
                </section>

                {/* ══ SECCIÓN MINI JUEGOS ══ */}
                {juegosDisponibles.length > 0 && (
                    <section className="border-t border-[#e3e3e0]/60 bg-[#FDFDFC] px-6 py-12 dark:border-[#2a2a26]/60 dark:bg-[#0a0a0a]">
                        <div className="mx-auto max-w-7xl">

                            {/* ── Encabezado de la sección ── */}
                            <div style={{ marginBottom: 28 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(34,211,238,.08)", border: "1px solid rgba(34,211,238,.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#22d3ee" }}>
                                        <Gamepad2 size={17} />
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#22d3ee", textTransform: "uppercase", letterSpacing: ".1em" }}>
                                            Actividades interactivas
                                        </p>
                                        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: "#1b1b18" }}>
                                            Mini Juegos
                                        </h3>
                                    </div>
                                </div>
                                <div style={{ height: 1, background: "linear-gradient(to right, rgba(34,211,238,.2), transparent)", marginTop: 20 }} />
                            </div>

                            {/* ── Selector de juegos (tabs) ── */}
                            <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
                                {juegosDisponibles.map(key => {
                                    const info = MINI_JUEGOS_INFO[key];
                                    const isSelected = juegoSeleccionado === key;
                                    return (
                                        <button
                                            key={key}
                                            className={isSelected ? "vc-game-tab-active" : "vc-game-tab"}
                                            onClick={() => setJuegoSeleccionado(key)}
                                            style={{
                                                display: "inline-flex", alignItems: "center", gap: 8,
                                                padding: "9px 18px", borderRadius: 12, cursor: "pointer",
                                                fontFamily: "'Instrument Sans', sans-serif", fontWeight: 600,
                                                fontSize: 13, transition: "all .18s",
                                                background: isSelected ? "#22d3ee" : "#fff",
                                                color: isSelected ? "#fff" : "#706f6c",
                                                border: isSelected ? "1px solid #22d3ee" : "1px solid #d1d0cc",
                                                boxShadow: isSelected ? "0 4px 14px rgba(34,211,238,.25)" : "none",
                                            }}
                                        >
                                            {/* Ícono del juego */}
                                            <span style={{ display: "flex", alignItems: "center" }}>{info.icon}</span>
                                            {info.label}
                                            {/* Badge de tipo */}
                                            <span style={{
                                                fontSize: 9, fontWeight: 700, letterSpacing: ".08em",
                                                padding: "2px 7px", borderRadius: 999,
                                                background: isSelected ? "rgba(255,255,255,.22)" : "rgba(34,211,238,.07)",
                                                color: isSelected ? "#fff" : "#22d3ee",
                                                border: isSelected ? "1px solid rgba(255,255,255,.3)" : "1px solid rgba(34,211,238,.2)",
                                            }}>
                                                {info.tag}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* ── Panel del juego seleccionado ── */}
                            {juegoSeleccionado && MINI_JUEGOS_INFO[juegoSeleccionado] && (() => {
                                const juego = MINI_JUEGOS_INFO[juegoSeleccionado];
                                return (
                                    <div style={{ animation: "fadeInUp .25s ease" }}>
                                        {/* Card contenedora */}
                                        <div
                                            ref={miniJuegoCardRef}
                                            style={{
                                                position: "relative",
                                                borderRadius: 20, overflow: "hidden",
                                                border: "1px solid rgba(227,227,224,.8)",
                                                boxShadow: "0 8px 40px rgba(0,0,0,.07)",
                                                background: "#1b1b18",
                                            }}
                                        >
                                            {/* Barra superior del juego */}
                                            <div style={{
                                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                                padding: "12px 20px",
                                                background: "rgba(255,255,255,.04)",
                                                borderBottom: "1px solid rgba(255,255,255,.07)",
                                            }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    {/* Botones estilo macOS */}
                                                    <div style={{ display: "flex", gap: 6 }}>
                                                        {["#ff5f56", "#ffbd2e", "#27c93f"].map((c, i) => (
                                                            <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c, opacity: .7 }} />
                                                        ))}
                                                    </div>
                                                    <span style={{ fontSize: 12, color: "rgba(255,255,255,.45)", fontWeight: 500 }}>
                                                        {juego.label}
                                                    </span>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    {minijuegoTienePantallaCompleta(juegoSeleccionado) && (
                                                        <MinijuegoFullscreenToggleButton containerRef={miniJuegoCardRef} />
                                                    )}
                                                    <span style={{
                                                        fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.4)",
                                                        background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)",
                                                        padding: "3px 10px", borderRadius: 999, letterSpacing: ".07em"
                                                    }}>
                                                        {juego.tag}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Contenido del juego */}
                                            {juego.url ? (
                                                <div style={{ padding: 24, background: "#14151c" }}>
                                                    <MiniJuegoProgreso
                                                        key={juegoSeleccionado}
                                                        cursoId={id}
                                                        storageKey={juegoSeleccionado}
                                                        onCompletado={() => setMiniJuegoLocalListo(true)}
                                                        interaccionIframe
                                                    >
                                                        <div style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}>
                                                            <iframe
                                                                src={juego.url}
                                                                title={juego.label}
                                                                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", display: "block" }}
                                                                allow="fullscreen; autoplay; xr-spatial-tracking; gyroscope; accelerometer"
                                                                loading="lazy"
                                                            />
                                                        </div>
                                                    </MiniJuegoProgreso>
                                                </div>
                                            ) : juegoSeleccionado === "pingpong" ? (
                                                <div style={{ padding: 24, background: "#14151c" }}>
                                                    <MiniJuegoProgreso
                                                        key={juegoSeleccionado}
                                                        cursoId={id}
                                                        storageKey="pingpong"
                                                        onCompletado={() => setMiniJuegoLocalListo(true)}
                                                        interaccionIframe
                                                    >
                                                        <VRPingPong />
                                                    </MiniJuegoProgreso>
                                                </div>
                                            ) : juegoSeleccionado === "quiz_medico" ? (
                                                <div style={{ padding: 24, background: "#14151c" }}>
                                                    <MiniJuegoProgreso
                                                        key={juegoSeleccionado}
                                                        cursoId={id}
                                                        storageKey="quiz_medico"
                                                        onCompletado={() => setMiniJuegoLocalListo(true)}
                                                    >
                                                        <QuizMedico3D />
                                                    </MiniJuegoProgreso>
                                                </div>
                                            ) : juegoSeleccionado === "anatomia_humana" ? (
                                                <div style={{ padding: 24, background: "#14151c" }}>
                                                    <AnatomiaHumana3D
                                                        cursoId={id}
                                                        onCompletado={() => setMiniJuegoLocalListo(true)}
                                                    />
                                                </div>
                                            ) : juegoSeleccionado === "computer_3d" ? (
                                                <div style={{ padding: 24, background: "#14151c" }}>
                                                    <Computer3D
                                                        cursoId={id}
                                                        onCompletado={() => setMiniJuegoLocalListo(true)}
                                                    />
                                                </div>
                                            ) : juegoSeleccionado === "games_fps" ? (
                                                <div style={{ padding: 24, background: "#0a0e14" }}>
                                                    <GamesFPS
                                                        cursoId={id}
                                                        onCompletado={() => {
                                                            setMiniJuegoLocalListo(true);
                                                            cargarCurso();
                                                        }}
                                                    />
                                                </div>
                                            ) : juegoSeleccionado === "creative_box" ? (
                                                <div style={{ padding: 24, background: "#0a0e14" }}>
                                                    <CreativeBox
                                                        cursoId={id}
                                                        onCompletado={() => {
                                                            setMiniJuegoLocalListo(true);
                                                            cargarCurso();
                                                        }}
                                                    />
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Placeholder si ningún juego está seleccionado */}
                            {!juegoSeleccionado && (
                                <div style={{
                                    border: "1px dashed #d1d0cc", borderRadius: 20, padding: "48px 24px",
                                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                    gap: 12, background: "#fafaf8", color: "#a1a09a", textAlign: "center",
                                }}>
                                    <div style={{ width: 56, height: 56, borderRadius: 18, background: "rgba(34,211,238,.05)", border: "1px solid rgba(34,211,238,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Gamepad2 size={24} color="rgba(34,211,238,.3)" />
                                    </div>
                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#706f6c" }}>
                                        Selecciona un juego para comenzar
                                    </p>
                                    <p style={{ margin: 0, fontSize: 12, color: "#a1a09a" }}>
                                        Haz clic en uno de los botones de arriba
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

            </EduPageShell>
        </>
    );
}

// ─── Hover CSS (fuentes vía EduPageShell) ────────────────────────────────────
const hoverCss = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .vc-mod-toggle:hover { background: rgba(34,211,238,.06) !important; }
    .vc-icon-btn:hover { background: rgba(34,211,238,.1) !important; color: #67e8f9 !important; }
    .vc-icon-btn-green:hover { background: rgba(22,163,74,.12) !important; }
    .vc-video-btn:hover { background: rgba(34,211,238,.06) !important; }
    .vc-video-btn.active { background: rgba(34,211,238,.1) !important; }
    .vc-del-btn:hover { color: #f87171 !important; background: rgba(248,113,113,.08) !important; }
    .vc-add-mod:hover { border-color: rgba(34,211,238,.45) !important; color: #22d3ee !important; }
    .vc-game-tab:hover { border-color: rgba(34,211,238,.45) !important; color: #22d3ee !important; background: rgba(34,211,238,.08) !important; }
`;
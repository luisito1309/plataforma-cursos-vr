import React, { useEffect, useState, useRef } from "react";
import { Link } from "@inertiajs/react";
import axios from "axios";
import VRPingPong from "@/components/VRPingPong";
import QuizMedico3D from "@/components/QuizMedico3D";
import AnatomiaHumana3D from "@/components/AnatomiaHumana3D";
import {
    GraduationCap, Home, ArrowLeft, Play, ChevronDown,
    Plus, X, Edit2, Trash2, FileText, Video, Layers,
    SkipBack, SkipForward, Monitor, Gamepad2, Zap, Brain,
} from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface Video { id: number; titulo: string; url: string; modulo_id: number; }
interface Documento { id: number; modulo_id: number; titulo: string; archivo: string; }
interface Modulo { id: number; titulo: string; curso_id: number; videos: Video[]; documentos?: Documento[]; }
interface Curso { id: number; titulo: string; descripcion: string; imagen?: string; docente_id: number; estado: string; mini_juego?: string | null; }

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
    anatomia_humana_pro: {
        label: "Anatomía Humana Interactiva 3D PRO",
        tag: "3D",
        icon: <Brain size={14} />,
        // sin url = usa componente <AnatomiaHumana3D />
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

// ─── Tokens ──────────────────────────────────────────────────────────────────
const btnRed: React.CSSProperties = {
    background: "#f53003", color: "#fff", border: "none", borderRadius: "10px",
    padding: "0 16px", height: "34px", fontSize: "12px",
    fontFamily: "'Instrument Sans', sans-serif", fontWeight: 600,
    cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px",
};
const btnOutline: React.CSSProperties = {
    background: "#fff", color: "#706f6c", border: "1px solid #d1d0cc",
    borderRadius: "10px", padding: "0 14px", height: "34px", fontSize: "12px",
    fontFamily: "'Instrument Sans', sans-serif", fontWeight: 500,
    cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px",
};
const inputSt: React.CSSProperties = {
    background: "#FDFDFC", border: "1px solid #d1d0cc", borderRadius: "10px",
    padding: "9px 12px", color: "#1b1b18", fontSize: "13px",
    fontFamily: "'Instrument Sans', sans-serif", width: "100%", outline: "none",
};
const labelSt: React.CSSProperties = {
    fontSize: "11px", fontWeight: 600, color: "#706f6c",
    textTransform: "uppercase", letterSpacing: ".07em",
};

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

    const [modalVideo, setModalVideo] = useState<{ modulo_id: number } | null>(null);
    const [formVideo, setFormVideo] = useState({ titulo: "", url: "" });
    const [modalEditModulo, setModalEditModulo] = useState<Modulo | null>(null);
    const [editTituloModulo, setEditTituloModulo] = useState("");
    const [modalDocumento, setModalDocumento] = useState<{ modulo_id: number } | null>(null);
    const [formDocumento, setFormDocumento] = useState({ titulo: "", archivo: null as File | null });

    useEffect(() => { cargarCurso(); }, []);
    useEffect(() => { if (videoRef.current) videoRef.current.load(); }, [videoActivo?.url]);

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
    if (loading) return (
        <>
            <style>{fonts}</style>
            <div style={{ fontFamily: "'Instrument Sans', sans-serif", background: "#FDFDFC", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", border: "2.5px solid #e3e3e0", borderTopColor: "#f53003", animation: "spin .8s linear infinite" }} />
                <p style={{ color: "#706f6c", fontSize: 14, margin: 0 }}>Cargando curso...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </>
    );

    if (!curso) return null;

    // ── Modal helper ─────────────────────────────────────────────────────────
    const Modal = ({ onClose, children }: { onClose: () => void; children: React.ReactNode }) => (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "460px", border: "1px solid #e3e3e0", boxShadow: "0 24px 60px rgba(0,0,0,.12)", display: "flex", flexDirection: "column", gap: "14px" }}>
                {children}
            </div>
        </div>
    );

    return (
        <>
            <style>{fonts + hoverCss}</style>

            <div style={{ fontFamily: "'Instrument Sans', sans-serif", background: "#FDFDFC", minHeight: "100vh", color: "#1b1b18" }}>

                {/* ══ MODALES ══ */}

                {/* Modal agregar video */}
                {modalVideo && (
                    <Modal onClose={() => setModalVideo(null)}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>Agregar video</h3>
                            <button onClick={() => setModalVideo(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#706f6c" }}><X size={18} /></button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <label style={labelSt}>Título</label>
                            <input className="vc-inp" style={inputSt} placeholder="Ej: Introducción al módulo" value={formVideo.titulo} onChange={e => setFormVideo({ ...formVideo, titulo: e.target.value })} autoFocus />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <label style={labelSt}>URL del video</label>
                            <input className="vc-inp" style={inputSt} placeholder="https://youtube.com/watch?v=..." value={formVideo.url} onChange={e => setFormVideo({ ...formVideo, url: e.target.value })} />
                        </div>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button className="vc-btn-out" onClick={() => setModalVideo(null)} style={btnOutline}>Cancelar</button>
                            <button className="vc-btn-red" onClick={agregarVideo} style={btnRed}>Agregar</button>
                        </div>
                    </Modal>
                )}

                {/* Modal editar módulo */}
                {modalEditModulo && (
                    <Modal onClose={() => setModalEditModulo(null)}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>Editar módulo</h3>
                            <button onClick={() => setModalEditModulo(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#706f6c" }}><X size={18} /></button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <label style={labelSt}>Nombre del módulo</label>
                            <input className="vc-inp" style={inputSt} value={editTituloModulo} onChange={e => setEditTituloModulo(e.target.value)} autoFocus onKeyDown={e => e.key === "Enter" && confirmarEditarModulo()} />
                        </div>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button className="vc-btn-out" onClick={() => setModalEditModulo(null)} style={btnOutline}>Cancelar</button>
                            <button className="vc-btn-red" onClick={confirmarEditarModulo} style={btnRed}>Guardar</button>
                        </div>
                    </Modal>
                )}

                {/* Modal agregar PDF */}
                {modalDocumento && (
                    <Modal onClose={() => { setModalDocumento(null); setFormDocumento({ titulo: "", archivo: null }); }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>Subir documento PDF</h3>
                            <button onClick={() => setModalDocumento(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#706f6c" }}><X size={18} /></button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <label style={labelSt}>Título</label>
                            <input className="vc-inp" style={inputSt} placeholder="Ej: Teoría VR" value={formDocumento.titulo} onChange={e => setFormDocumento({ ...formDocumento, titulo: e.target.value })} autoFocus />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <label style={labelSt}>Archivo PDF</label>
                            <input type="file" accept=".pdf,application/pdf" style={{ ...inputSt, cursor: "pointer" }} onChange={e => setFormDocumento({ ...formDocumento, archivo: e.target.files?.[0] ?? null })} />
                        </div>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button className="vc-btn-out" onClick={() => setModalDocumento(null)} style={btnOutline}>Cancelar</button>
                            <button className="vc-btn-red" onClick={agregarDocumento} style={btnRed}>Subir</button>
                        </div>
                    </Modal>
                )}

                {/* ══ NAV ══ */}
                <header style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(227,227,224,.7)", background: "rgba(253,253,252,.92)", backdropFilter: "blur(8px)" }}>
                    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: "#f53003", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <GraduationCap size={15} color="#fff" />
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "#1b1b18", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {curso.titulo}
                            </span>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <a href="/" style={{ textDecoration: "none" }}>
                                <button className="vc-btn-out" style={btnOutline}><Home size={13} /> Home</button>
                            </a>
                            <Link href="/cursos" style={{ textDecoration: "none" }}>
                                <button className="vc-btn-out" style={btnOutline}><ArrowLeft size={13} /> Volver</button>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* ══ CABECERA DEL CURSO ══ */}
                <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(227,227,224,.6)" }}>
                    {curso.imagen && (
                        <>
                            <div style={{ position: "absolute", inset: 0 }}>
                                <img src={`/storage/${curso.imagen}`} alt={curso.titulo} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .08 }} />
                            </div>
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #FDFDFC 50%, transparent 100%)" }} />
                        </>
                    )}
                    <div style={{ position: "absolute", top: -60, right: -60, width: 320, height: 320, borderRadius: "50%", background: "rgba(245,48,3,.04)", filter: "blur(50px)", pointerEvents: "none" }} />

                    <div style={{ position: "relative", maxWidth: 1400, margin: "0 auto", padding: "36px 24px 32px" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, border: "1px solid rgba(245,48,3,.25)", background: "rgba(245,48,3,.06)", padding: "3px 12px", fontSize: 11, fontWeight: 600, color: "#f53003", marginBottom: 12 }}>
                            <Monitor size={11} /> VR COURSE
                        </div>
                        <h1 style={{ margin: "0 0 8px", fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 900, fontFamily: "'Playfair Display', serif", lineHeight: 1.15, maxWidth: 700 }}>
                            {curso.titulo}
                        </h1>
                        <p style={{ margin: "0 0 16px", fontSize: 14, color: "#706f6c", maxWidth: 600, lineHeight: 1.65 }}>{curso.descripcion}</p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {[
                                { icon: <Layers size={11} />, label: `${modulos.length} módulos` },
                                { icon: <Video size={11} />, label: `${todosLosVideos.length} videos` },
                                { icon: null, label: curso.estado, green: true },
                            ].map((chip, i) => (
                                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: chip.green ? "#166534" : "#706f6c", background: chip.green ? "#f0fdf4" : "#f5f5f3", border: `1px solid ${chip.green ? "#bbf7d0" : "#e3e3e0"}`, padding: "4px 12px", borderRadius: 999 }}>
                                    {chip.icon}{chip.label}
                                </span>
                            ))}
                            {juegosDisponibles.length > 0 && (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#f53003", background: "rgba(245,48,3,.06)", border: "1px solid rgba(245,48,3,.2)", padding: "4px 12px", borderRadius: 999, fontWeight: 600 }}>
                                    <Gamepad2 size={11} />
                                    {juegosDisponibles.length} mini {juegosDisponibles.length === 1 ? "juego" : "juegos"}
                                </span>
                            )}
                        </div>
                    </div>
                </section>

                {/* ══ PLAYER + SIDEBAR ══ */}
                <section>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", maxWidth: 1400, margin: "0 auto" }}>

                        {/* ── Pantalla principal ── */}
                        <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid rgba(227,227,224,.6)" }}>
                            <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", background: "#f5f5f3" }}>
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
                                        <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(245,48,3,.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <Play size={28} color="rgba(245,48,3,.3)" />
                                        </div>
                                        <p style={{ color: "#706f6c", fontSize: 14, margin: 0 }}>Selecciona un video para comenzar</p>
                                    </div>
                                )}
                            </div>

                            {videoActivo && (
                                <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(227,227,224,.6)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", background: "#fff" }}>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ margin: "0 0 3px", fontSize: 10, fontWeight: 700, color: "#f53003", textTransform: "uppercase", letterSpacing: ".08em" }}>Reproduciendo</p>
                                        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#1b1b18", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {videoActivo.titulo}
                                        </h2>
                                    </div>
                                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                                        <button
                                            className="vc-btn-out"
                                            disabled={!anterior}
                                            onClick={() => anterior && irAVideo(anterior)}
                                            style={{ ...btnOutline, opacity: anterior ? 1 : .35 }}
                                        >
                                            <SkipBack size={13} /> Anterior
                                        </button>
                                        <button
                                            className="vc-btn-red"
                                            disabled={!siguiente}
                                            onClick={() => siguiente && irAVideo(siguiente)}
                                            style={{ ...btnRed, opacity: siguiente ? 1 : .35 }}
                                        >
                                            Siguiente <SkipForward size={13} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Sidebar playlist ── */}
                        <aside style={{ background: "#fff", display: "flex", flexDirection: "column", minHeight: 520, maxHeight: "calc(56.25vw * (320/1400 * 1) + 300px)", borderRight: "1px solid rgba(227,227,224,.6)" }}>
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
                                                                        style={{ flex: 1, display: "flex", alignItems: "center", gap: 9, padding: "9px 14px", background: isActive ? "rgba(245,48,3,.06)" : "transparent", border: "none", cursor: "pointer", textAlign: "left", minWidth: 0, borderLeft: isActive ? "2px solid #f53003" : "2px solid transparent" }}
                                                                    >
                                                                        <span style={{ fontSize: 10, color: isActive ? "#f53003" : "#a1a09a", minWidth: 16, flexShrink: 0, fontWeight: 600 }}>{idx + 1}</span>
                                                                        <Play size={10} color={isActive ? "#f53003" : "#a1a09a"} style={{ flexShrink: 0 }} />
                                                                        <span style={{ fontSize: 12, color: isActive ? "#f53003" : "#1b1b18", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: isActive ? 600 : 400 }}>
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
                                                                    <a href={`/storage/${doc.archivo}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontSize: 12, color: "#f53003", textDecoration: "none", padding: "5px 0", display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
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
                                            className="vc-inp"
                                            style={inputSt}
                                            placeholder="Nombre del módulo..."
                                            value={nuevoModulo}
                                            onChange={e => setNuevoModulo(e.target.value)}
                                            onKeyDown={e => e.key === "Enter" && agregarModulo()}
                                            autoFocus
                                        />
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <button className="vc-btn-out" onClick={() => { setMostrarFormModulo(false); setNuevoModulo(""); }} style={{ ...btnOutline, width: 34, padding: 0, justifyContent: "center", flexShrink: 0 }}>
                                                <X size={13} />
                                            </button>
                                            <button className="vc-btn-red" onClick={agregarModulo} style={{ ...btnRed, flex: 1, justifyContent: "center" }}>
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
                    <section style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 24px 56px" }}>

                        {/* ── Encabezado de la sección ── */}
                        <div style={{ marginBottom: 28 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(245,48,3,.08)", border: "1px solid rgba(245,48,3,.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f53003" }}>
                                    <Gamepad2 size={17} />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#f53003", textTransform: "uppercase", letterSpacing: ".1em" }}>
                                        Actividades interactivas
                                    </p>
                                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: "#1b1b18" }}>
                                        Mini Juegos
                                    </h3>
                                </div>
                            </div>
                            <div style={{ height: 1, background: "linear-gradient(to right, rgba(245,48,3,.2), transparent)", marginTop: 20 }} />
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
                                            background: isSelected ? "#f53003" : "#fff",
                                            color: isSelected ? "#fff" : "#706f6c",
                                            border: isSelected ? "1px solid #f53003" : "1px solid #d1d0cc",
                                            boxShadow: isSelected ? "0 4px 14px rgba(245,48,3,.25)" : "none",
                                        }}
                                    >
                                        {/* Ícono del juego */}
                                        <span style={{ display: "flex", alignItems: "center" }}>{info.icon}</span>
                                        {info.label}
                                        {/* Badge de tipo */}
                                        <span style={{
                                            fontSize: 9, fontWeight: 700, letterSpacing: ".08em",
                                            padding: "2px 7px", borderRadius: 999,
                                            background: isSelected ? "rgba(255,255,255,.22)" : "rgba(245,48,3,.07)",
                                            color: isSelected ? "#fff" : "#f53003",
                                            border: isSelected ? "1px solid rgba(255,255,255,.3)" : "1px solid rgba(245,48,3,.2)",
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
                                    <div style={{
                                        borderRadius: 20, overflow: "hidden",
                                        border: "1px solid rgba(227,227,224,.8)",
                                        boxShadow: "0 8px 40px rgba(0,0,0,.07)",
                                        background: "#1b1b18",
                                    }}>
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
                                            <span style={{
                                                fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.4)",
                                                background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)",
                                                padding: "3px 10px", borderRadius: 999, letterSpacing: ".07em"
                                            }}>
                                                {juego.tag}
                                            </span>
                                        </div>

                                        {/* Contenido del juego */}
                                        {juego.url ? (
                                            <div style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}>
                                                <iframe
                                                    src={juego.url}
                                                    title={juego.label}
                                                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", display: "block" }}
                                                    allow="fullscreen; autoplay"
                                                    loading="lazy"
                                                />
                                            </div>
                                        ) : juegoSeleccionado === "pingpong" ? (
                                            <div style={{ padding: 24 }}>
                                                <VRPingPong />
                                            </div>
                                        ) : juegoSeleccionado === "quiz_medico" ? (
                                            <div style={{ padding: 24, background: "#14151c" }}>
                                                <QuizMedico3D />
                                            </div>
                                        ) : juegoSeleccionado === "anatomia_humana_pro" ? (
                                            <div style={{ padding: 0, background: "#070a10" }}>
                                                <AnatomiaHumana3D />
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
                                <div style={{ width: 56, height: 56, borderRadius: 18, background: "rgba(245,48,3,.05)", border: "1px solid rgba(245,48,3,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Gamepad2 size={24} color="rgba(245,48,3,.3)" />
                                </div>
                                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#706f6c" }}>
                                    Selecciona un juego para comenzar
                                </p>
                                <p style={{ margin: 0, fontSize: 12, color: "#a1a09a" }}>
                                    Haz clic en uno de los botones de arriba
                                </p>
                            </div>
                        )}
                    </section>
                )}

                {/* ══ FOOTER ══ */}
                <footer style={{ borderTop: "1px solid rgba(227,227,224,.6)", padding: "20px 24px" }}>
                    <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#706f6c" }}>
                            <div style={{ width: 20, height: 20, borderRadius: 6, background: "#f53003", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <GraduationCap size={11} color="#fff" />
                            </div>
                            EduPlatform © {new Date().getFullYear()}
                        </div>
                        <a href="/" style={{ textDecoration: "none" }}>
                            <button className="vc-btn-out" style={{ ...btnOutline, fontSize: 12 }}><Home size={12} /> Volver al inicio</button>
                        </a>
                    </div>
                </footer>
            </div>
        </>
    );
}

// ─── Fonts + hover CSS ────────────────────────────────────────────────────────
const fonts = `@import url('https://fonts.bunny.net/css?family=playfair-display:700,800,900|instrument-sans:400,500,600');
* { box-sizing: border-box; }`;

const hoverCss = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .vc-btn-red { transition: background .15s; }
    .vc-btn-red:hover:not(:disabled) { background: #d42800 !important; }
    .vc-btn-red:disabled { opacity: .35 !important; cursor: not-allowed !important; }
    .vc-btn-out { transition: border-color .15s, color .15s, background .15s; }
    .vc-btn-out:hover:not(:disabled) { border-color: rgba(245,48,3,.4) !important; color: #f53003 !important; background: rgba(245,48,3,.04) !important; }
    .vc-btn-out:disabled { opacity: .35 !important; cursor: not-allowed !important; }
    .vc-inp:focus { border-color: rgba(245,48,3,.5) !important; box-shadow: 0 0 0 3px rgba(245,48,3,.08); outline: none; }
    .vc-mod-toggle:hover { background: rgba(245,48,3,.03) !important; }
    .vc-icon-btn:hover { background: rgba(245,48,3,.06) !important; color: #f53003 !important; }
    .vc-icon-btn-green:hover { background: rgba(22,163,74,.08) !important; }
    .vc-video-btn:hover { background: rgba(245,48,3,.04) !important; }
    .vc-del-btn:hover { color: #f53003 !important; background: rgba(245,48,3,.06) !important; }
    .vc-add-mod:hover { border-color: rgba(245,48,3,.4) !important; color: #f53003 !important; }
    .vc-game-tab:hover { border-color: rgba(245,48,3,.4) !important; color: #f53003 !important; background: rgba(245,48,3,.04) !important; }
`;
import React, { useEffect, useState, useRef } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import type { UserRole } from "@/types/auth";

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface Video {
    id: number;
    titulo: string;
    url: string;
    modulo_id: number;
}

interface Modulo {
    id: number;
    titulo: string;
    curso_id: number;
    videos: Video[];
}

interface Curso {
    id: number;
    titulo: string;
    descripcion: string;
    imagen?: string;
    docente_id: number;
    estado: string;
}

// ─── Helper: convierte cualquier URL a embed ──────────────────────────────────
function toEmbedUrl(url: string): string {
    try {
        const u = new URL(url);
        if (u.hostname === "youtu.be") {
            return `https://www.youtube.com/embed/${u.pathname.slice(1)}?rel=0&modestbranding=1`;
        }
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
    } catch {
        return url;
    }
}

function isNativeVideo(url: string): boolean {
    return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
}

const canEditContent = (role: UserRole | undefined) =>
    role === "admin" || role === "docente";

// ─── Componente principal ─────────────────────────────────────────────────────
export default function VerCurso({ id }: { id: number }) {
    const { auth } = usePage().props as { auth: { user?: { role: UserRole } } };
    const role = auth.user?.role;

    const [curso, setCurso] = useState<Curso | null>(null);
    const [modulos, setModulos] = useState<Modulo[]>([]);
    const [nuevoModulo, setNuevoModulo] = useState("");
    const [videoActivo, setVideoActivo] = useState<Video | null>(null);
    const [moduloAbierto, setModuloAbierto] = useState<number | null>(null);
    const [mostrarFormModulo, setMostrarFormModulo] = useState(false);
    const [loading, setLoading] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Modales inline en lugar de prompt()
    const [modalVideo, setModalVideo] = useState<{ modulo_id: number } | null>(null);
    const [formVideo, setFormVideo] = useState({ titulo: "", url: "" });
    const [modalEditModulo, setModalEditModulo] = useState<Modulo | null>(null);
    const [editTituloModulo, setEditTituloModulo] = useState("");

    useEffect(() => {
        cargarCurso();
    }, []);

    useEffect(() => {
        if (videoRef.current) videoRef.current.load();
    }, [videoActivo?.url]);

    const cargarCurso = () => {
        setLoading(true);
        Promise.all([
            axios.get(`/api/cursos/${id}`),
            axios.get(`/api/cursos/${id}/modulos`),
        ])
            .then(([resCurso, resMods]) => {
                setCurso(resCurso.data);
                const mods: Modulo[] = resMods.data;
                setModulos(mods);
                // Abrir primer módulo por defecto
                if (mods.length > 0) {
                    setModuloAbierto(mods[0].id);
                    if (!videoActivo && mods[0].videos?.length > 0) {
                        setVideoActivo(mods[0].videos[0]);
                    }
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const agregarModulo = () => {
        if (!nuevoModulo.trim()) return;
        axios.post("/api/modulos", { curso_id: id, titulo: nuevoModulo })
            .then(() => {
                setNuevoModulo("");
                setMostrarFormModulo(false);
                cargarCurso();
            })
            .catch(console.error);
    };

    const confirmarEditarModulo = () => {
        if (!modalEditModulo || !editTituloModulo.trim()) return;
        axios.put(`/api/modulos/${modalEditModulo.id}`, { titulo: editTituloModulo })
            .then(() => {
                setModalEditModulo(null);
                cargarCurso();
            })
            .catch(console.error);
    };

    const agregarVideo = () => {
        if (!modalVideo || !formVideo.titulo.trim() || !formVideo.url.trim()) return;
        axios.post("/api/videos", {
            modulo_id: modalVideo.modulo_id,
            titulo: formVideo.titulo,
            url: formVideo.url,
        })
            .then(() => {
                setModalVideo(null);
                setFormVideo({ titulo: "", url: "" });
                cargarCurso();
            })
            .catch(console.error);
    };

    const eliminarVideo = (video_id: number) => {
        if (!window.confirm("¿Eliminar este video?")) return;
        axios.delete(`/api/videos/${video_id}`)
            .then(() => {
                if (videoActivo?.id === video_id) setVideoActivo(null);
                cargarCurso();
            })
            .catch(console.error);
    };

    const todosLosVideos = modulos.flatMap((m) => m.videos ?? []);
    const indiceActivo = todosLosVideos.findIndex((v) => v.id === videoActivo?.id);
    const anterior = indiceActivo > 0 ? todosLosVideos[indiceActivo - 1] : null;
    const siguiente = indiceActivo < todosLosVideos.length - 1 ? todosLosVideos[indiceActivo + 1] : null;

    const irAVideo = (video: Video) => {
        setVideoActivo(video);
        const mod = modulos.find((m) => m.videos?.some((v) => v.id === video.id));
        if (mod) setModuloAbierto(mod.id);
    };

    if (loading) {
        return (
            <div style={s.loadingWrap}>
                <div style={s.spinner} />
                <p style={s.loadingText}>Cargando curso...</p>
                <style>{css}</style>
            </div>
        );
    }

    if (!curso) return null;

    return (
        <div style={s.page}>
            <style>{css}</style>

            {/* ── MODAL: Agregar video ─────────────────────────────────────────── */}
            {modalVideo && (
                <div style={s.overlay} onClick={() => setModalVideo(null)}>
                    <div style={s.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 style={s.modalTitle}>Agregar video</h3>
                        <label style={s.label}>Título</label>
                        <input
                            style={s.input}
                            placeholder="Ej: Introducción al módulo"
                            value={formVideo.titulo}
                            onChange={(e) => setFormVideo({ ...formVideo, titulo: e.target.value })}
                            autoFocus
                        />
                        <label style={s.label}>URL del video</label>
                        <input
                            style={s.input}
                            placeholder="https://youtube.com/watch?v=..."
                            value={formVideo.url}
                            onChange={(e) => setFormVideo({ ...formVideo, url: e.target.value })}
                        />
                        <div style={s.modalBtns}>
                            <button style={s.btnCancel} onClick={() => setModalVideo(null)}>Cancelar</button>
                            <button style={s.btnPrimary} onClick={agregarVideo}>Agregar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL: Editar módulo ─────────────────────────────────────────── */}
            {modalEditModulo && (
                <div style={s.overlay} onClick={() => setModalEditModulo(null)}>
                    <div style={s.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 style={s.modalTitle}>Editar módulo</h3>
                        <label style={s.label}>Nuevo nombre</label>
                        <input
                            style={s.input}
                            value={editTituloModulo}
                            onChange={(e) => setEditTituloModulo(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => e.key === "Enter" && confirmarEditarModulo()}
                        />
                        <div style={s.modalBtns}>
                            <button style={s.btnCancel} onClick={() => setModalEditModulo(null)}>Cancelar</button>
                            <button style={s.btnPrimary} onClick={confirmarEditarModulo}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── CABECERA DEL CURSO ───────────────────────────────────────────── */}
            <header style={s.header}>
                {curso.imagen && (
                    <div style={s.bannerWrap}>
                        <img src={`/storage/${curso.imagen}`} alt={curso.titulo} style={s.banner} />
                        <div style={s.bannerOverlay} />
                    </div>
                )}
                <div style={s.headerContent}>
                    <span style={s.badge}>VR COURSE</span>
                    <h1 style={s.cursoTitulo}>{curso.titulo}</h1>
                    <p style={s.cursoDesc}>{curso.descripcion}</p>
                    <div style={s.headerMeta}>
                        <span style={s.metaChip}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 10l-4 4-4-4" /><rect x="2" y="2" width="20" height="20" rx="4" /></svg>
                            {modulos.length} módulos
                        </span>
                        <span style={s.metaChip}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                            {todosLosVideos.length} videos
                        </span>
                        <span style={{ ...s.metaChip, ...s.estadoChip }}>
                            {curso.estado}
                        </span>
                    </div>
                </div>
            </header>

            {/* ── REPRODUCTOR + PLAYLIST ───────────────────────────────────────── */}
            <section style={s.playerSection}>
                <div style={s.playerLayout}>

                    {/* Pantalla */}
                    <div style={s.playerMain}>
                        <div style={s.screenWrap}>
                            {videoActivo ? (
                                isNativeVideo(videoActivo.url) ? (
                                    <video ref={videoRef} controls style={s.videoEl} key={videoActivo.url}>
                                        <source src={videoActivo.url} />
                                    </video>
                                ) : (
                                    <iframe
                                        src={toEmbedUrl(videoActivo.url)}
                                        title={videoActivo.titulo}
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        style={s.videoEl}
                                    />
                                )
                            ) : (
                                <div style={s.emptyScreen}>
                                    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#2e3050" strokeWidth="1.2">
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                    </svg>
                                    <p style={{ color: "#2e3050", fontSize: "14px", marginTop: "12px" }}>
                                        Selecciona un video para comenzar
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Info + navegación */}
                        {videoActivo && (
                            <div style={s.playerInfo}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={s.nowPlaying}>Reproduciendo</p>
                                    <h2 style={s.videoTitulo}>{videoActivo.titulo}</h2>
                                </div>
                                <div style={s.navBtns}>
                                    <button
                                        style={s.navBtn}
                                        disabled={!anterior}
                                        onClick={() => anterior && irAVideo(anterior)}
                                        className="nav-btn"
                                    >
                                        ← Anterior
                                    </button>
                                    <button
                                        style={{ ...s.navBtn, ...s.navBtnPrimary }}
                                        disabled={!siguiente}
                                        onClick={() => siguiente && irAVideo(siguiente)}
                                        className="nav-btn"
                                    >
                                        Siguiente →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Sidebar playlist ────────────────────────────────────────── */}
                    <aside style={s.sidebar}>
                        <div style={s.sidebarHeader}>
                            <span style={s.sidebarLabel}>Contenido</span>
                            <span style={s.sidebarCounter}>{indiceActivo + 1} / {todosLosVideos.length}</span>
                        </div>

                        <div style={{ overflowY: "auto", flex: 1 }}>
                            {modulos.map((modulo) => {
                                const isOpen = moduloAbierto === modulo.id;
                                return (
                                    <div key={modulo.id} style={s.moduloBlock}>
                                        {/* Cabecera módulo */}
                                        <div style={s.moduloHeader}>
                                            <button
                                                style={s.moduloToggle}
                                                onClick={() => setModuloAbierto(isOpen ? null : modulo.id)}
                                                className="modulo-toggle"
                                            >
                                                <span style={s.moduloTitulo}>{modulo.titulo}</span>
                                                <span style={s.moduloCount}>{modulo.videos?.length ?? 0}</span>
                                                <svg
                                                    width="13" height="13" viewBox="0 0 24 24"
                                                    fill="none" stroke="#555870" strokeWidth="2"
                                                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s", flexShrink: 0 }}
                                                >
                                                    <polyline points="6 9 12 15 18 9" />
                                                </svg>
                                            </button>
                                            {/* Acciones del módulo (solo docente/admin) */}
                                            {canEditContent(role) && (
                                                <div style={s.moduloActions}>
                                                    <button
                                                        title="Editar módulo"
                                                        style={s.iconBtn}
                                                        className="icon-btn"
                                                        onClick={() => {
                                                            setModalEditModulo(modulo);
                                                            setEditTituloModulo(modulo.titulo);
                                                        }}
                                                    >
                                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        title="Agregar video"
                                                        style={{ ...s.iconBtn, color: "#4caf7d" }}
                                                        className="icon-btn"
                                                        onClick={() => setModalVideo({ modulo_id: modulo.id })}
                                                    >
                                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <line x1="12" y1="5" x2="12" y2="19" />
                                                            <line x1="5" y1="12" x2="19" y2="12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Videos del módulo */}
                                        {isOpen && (
                                            <ul style={s.videoList}>
                                                {(!modulo.videos || modulo.videos.length === 0) && (
                                                    <li style={s.emptyVideos}>Sin videos aún</li>
                                                )}
                                                {modulo.videos?.map((video, idx) => {
                                                    const isActive = videoActivo?.id === video.id;
                                                    return (
                                                        <li key={video.id} style={s.videoItem}>
                                                            <button
                                                                style={{
                                                                    ...s.videoBtn,
                                                                    ...(isActive ? s.videoBtnActive : {}),
                                                                }}
                                                                className={`video-btn ${isActive ? "active" : ""}`}
                                                                onClick={() => irAVideo(video)}
                                                            >
                                                                <span style={s.videoIdx}>{idx + 1}</span>
                                                                <span style={s.videoName}>{video.titulo}</span>
                                                                {isActive && (
                                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#7c6fff" style={{ flexShrink: 0 }}>
                                                                        <polygon points="5 3 19 12 5 21 5 3" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                            {canEditContent(role) && (
                                                                <button
                                                                    title="Eliminar video"
                                                                    style={s.deleteBtn}
                                                                    className="delete-btn"
                                                                    onClick={() => eliminarVideo(video.id)}
                                                                >
                                                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <polyline points="3 6 5 6 21 6" />
                                                                        <path d="M19 6l-1 14H6L5 6" />
                                                                        <path d="M10 11v6M14 11v6" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Agregar módulo (solo docente/admin) */}
                        {canEditContent(role) && (
                            <div style={s.addModuloSection}>
                                {mostrarFormModulo ? (
                                    <div style={s.addModuloForm}>
                                        <input
                                            style={s.inputDark}
                                            placeholder="Nombre del módulo..."
                                            value={nuevoModulo}
                                            onChange={(e) => setNuevoModulo(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && agregarModulo()}
                                            autoFocus
                                        />
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            <button style={s.btnCancelSm} onClick={() => { setMostrarFormModulo(false); setNuevoModulo(""); }}>
                                                ✕
                                            </button>
                                            <button style={s.btnPrimarySm} onClick={agregarModulo}>
                                                Crear
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button style={s.addModuloBtn} className="add-modulo-btn" onClick={() => setMostrarFormModulo(true)}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="12" y1="5" x2="12" y2="19" />
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                        </svg>
                                        Nuevo módulo
                                    </button>
                                )}
                            </div>
                        )}
                    </aside>
                </div>
            </section>
        </div>
    );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
    page: {
        fontFamily: "'DM Sans', sans-serif",
        background: "#08090e",
        minHeight: "100vh",
        color: "#e2e0f5",
    },
    loadingWrap: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        background: "#08090e",
        gap: "16px",
    },
    spinner: {
        width: "36px",
        height: "36px",
        border: "2px solid #1e1f2e",
        borderTop: "2px solid #7c6fff",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
    },
    loadingText: { color: "#4a4b6a", fontSize: "14px" },

    // Header
    header: {
        position: "relative",
        overflow: "hidden",
        borderBottom: "1px solid #13141f",
    },
    bannerWrap: { position: "absolute", inset: 0 },
    banner: { width: "100%", height: "100%", objectFit: "cover", opacity: 0.18 },
    bannerOverlay: {
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to right, #08090e 40%, transparent 100%)",
    },
    headerContent: {
        position: "relative",
        padding: "36px 40px",
        maxWidth: "700px",
    },
    badge: {
        fontFamily: "'Space Mono', monospace",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.12em",
        color: "#7c6fff",
        background: "#1a1630",
        border: "1px solid #3d35a0",
        padding: "3px 10px",
        borderRadius: "4px",
        display: "inline-block",
        marginBottom: "14px",
    },
    cursoTitulo: {
        fontSize: "28px",
        fontWeight: 600,
        color: "#e8e6ff",
        margin: "0 0 10px",
        lineHeight: 1.25,
    },
    cursoDesc: {
        fontSize: "15px",
        color: "#7a78a0",
        margin: "0 0 16px",
        lineHeight: 1.65,
    },
    headerMeta: { display: "flex", gap: "8px", flexWrap: "wrap" },
    metaChip: {
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        fontSize: "12px",
        color: "#5a5880",
        background: "#0f1020",
        border: "1px solid #1e1f30",
        padding: "4px 10px",
        borderRadius: "20px",
    },
    estadoChip: { color: "#4caf7d", borderColor: "#1a3328" },

    // Player section
    playerSection: { padding: "0" },
    playerLayout: {
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        minHeight: "520px",
    },
    playerMain: { display: "flex", flexDirection: "column", background: "#08090e" },
    screenWrap: {
        position: "relative",
        width: "100%",
        paddingTop: "56.25%",
        background: "#04050a",
        borderBottom: "1px solid #111220",
    },
    videoEl: { position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" },
    emptyScreen: {
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    playerInfo: {
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap",
        borderBottom: "1px solid #111220",
        background: "#0a0b12",
    },
    nowPlaying: {
        fontFamily: "'Space Mono', monospace",
        fontSize: "10px",
        letterSpacing: "0.08em",
        color: "#7c6fff",
        margin: "0 0 4px",
        textTransform: "uppercase",
    },
    videoTitulo: { fontSize: "16px", fontWeight: 500, color: "#d4d0ff", margin: 0 },
    navBtns: { display: "flex", gap: "8px", flexShrink: 0 },
    navBtn: {
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "13px",
        fontWeight: 500,
        padding: "7px 14px",
        borderRadius: "8px",
        border: "1px solid #2a2b3d",
        background: "#111220",
        color: "#8b8aaa",
        cursor: "pointer",
    },
    navBtnPrimary: {
        background: "#1a1630",
        color: "#9d8fff",
        borderColor: "#3d35a0",
    },

    // Sidebar
    sidebar: {
        background: "#0d0e17",
        borderLeft: "1px solid #1e1f2e",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        maxHeight: "calc(56.25vw * 0.75 + 160px)",
        minHeight: "520px",
    },
    sidebarHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px 10px",
        borderBottom: "1px solid #151623",
    },
    sidebarLabel: {
        fontFamily: "'Space Mono', monospace",
        fontSize: "10px",
        letterSpacing: "0.08em",
        color: "#3e4060",
        textTransform: "uppercase",
    },
    sidebarCounter: {
        fontFamily: "'Space Mono', monospace",
        fontSize: "10px",
        color: "#3e4060",
    },

    // Módulo
    moduloBlock: { borderBottom: "1px solid #151623" },
    moduloHeader: { display: "flex", alignItems: "center" },
    moduloToggle: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "11px 14px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        minWidth: 0,
    },
    moduloTitulo: {
        fontSize: "12px",
        fontWeight: 500,
        color: "#a8a5cc",
        flex: 1,
        minWidth: 0,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    moduloCount: {
        fontFamily: "'Space Mono', monospace",
        fontSize: "10px",
        color: "#444560",
        background: "#151623",
        borderRadius: "10px",
        padding: "2px 6px",
        flexShrink: 0,
    },
    moduloActions: { display: "flex", gap: "2px", paddingRight: "8px", flexShrink: 0 },
    iconBtn: {
        width: "26px",
        height: "26px",
        borderRadius: "6px",
        border: "none",
        background: "transparent",
        color: "#444560",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },

    // Video items
    videoList: { listStyle: "none", background: "#080910", padding: "4px 0" },
    emptyVideos: {
        fontSize: "12px",
        color: "#2e3050",
        padding: "10px 14px 10px 38px",
        fontStyle: "italic",
    },
    videoItem: { display: "flex", alignItems: "center" },
    videoBtn: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "9px 14px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        color: "#6b6990",
        minWidth: 0,
    },
    videoBtnActive: { background: "#120f24", color: "#9d8fff" },
    videoIdx: {
        fontFamily: "'Space Mono', monospace",
        fontSize: "10px",
        color: "#333450",
        minWidth: "16px",
        flexShrink: 0,
    },
    videoName: {
        fontSize: "12px",
        flex: 1,
        minWidth: 0,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    deleteBtn: {
        width: "28px",
        height: "28px",
        borderRadius: "6px",
        border: "none",
        background: "transparent",
        color: "#3a2a2a",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        marginRight: "6px",
    },

    // Add modulo
    addModuloSection: {
        padding: "10px 12px",
        borderTop: "1px solid #151623",
    },
    addModuloBtn: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "7px",
        padding: "9px",
        background: "transparent",
        border: "1px dashed #252640",
        borderRadius: "8px",
        color: "#3e4060",
        cursor: "pointer",
        fontSize: "12px",
        fontFamily: "'DM Sans', sans-serif",
    },
    addModuloForm: { display: "flex", flexDirection: "column", gap: "8px" },
    inputDark: {
        background: "#0a0b14",
        border: "1px solid #2a2b3d",
        borderRadius: "8px",
        padding: "8px 12px",
        color: "#d4d0ff",
        fontSize: "13px",
        fontFamily: "'DM Sans', sans-serif",
        outline: "none",
        width: "100%",
    },
    btnPrimarySm: {
        flex: 1,
        padding: "7px 0",
        background: "#1a1630",
        color: "#9d8fff",
        border: "1px solid #3d35a0",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "12px",
        fontFamily: "'DM Sans', sans-serif",
    },
    btnCancelSm: {
        width: "32px",
        padding: "7px 0",
        background: "#111220",
        color: "#6b6990",
        border: "1px solid #2a2b3d",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "12px",
        fontFamily: "'DM Sans', sans-serif",
    },

    // Modales
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
    },
    modal: {
        background: "#0d0e1a",
        border: "1px solid #2a2b3d",
        borderRadius: "14px",
        padding: "28px 32px",
        width: "100%",
        maxWidth: "420px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    modalTitle: {
        fontSize: "17px",
        fontWeight: 600,
        color: "#d4d0ff",
        marginBottom: "4px",
    },
    label: { fontSize: "12px", color: "#5a5880", marginBottom: "-4px" },
    input: {
        background: "#111220",
        border: "1px solid #2a2b3d",
        borderRadius: "8px",
        padding: "10px 14px",
        color: "#e2e0f5",
        fontSize: "14px",
        fontFamily: "'DM Sans', sans-serif",
        outline: "none",
        width: "100%",
    },
    modalBtns: { display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "4px" },
    btnCancel: {
        padding: "9px 18px",
        background: "#111220",
        color: "#6b6990",
        border: "1px solid #2a2b3d",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "13px",
        fontFamily: "'DM Sans', sans-serif",
    },
    btnPrimary: {
        padding: "9px 18px",
        background: "#1a1630",
        color: "#9d8fff",
        border: "1px solid #3d35a0",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "13px",
        fontFamily: "'DM Sans', sans-serif",
    },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  .nav-btn:hover:not(:disabled) { background: #1a1b2e !important; color: #d4d0ff !important; border-color: #3d3e5e !important; }
  .nav-btn:disabled { opacity: 0.3 !important; cursor: not-allowed !important; }
  .modulo-toggle:hover { background: #111220 !important; }
  .icon-btn:hover { background: #151623 !important; color: #9d8fff !important; }
  .video-btn:hover { background: #0f1020 !important; color: #a8a5cc !important; }
  .video-btn.active .videoIdx { color: #5548a0 !important; }
  .delete-btn:hover { color: #e05c5c !important; background: #1a0f0f !important; }
  .add-modulo-btn:hover { border-color: #3d35a0 !important; color: #7c6fff !important; }
`;
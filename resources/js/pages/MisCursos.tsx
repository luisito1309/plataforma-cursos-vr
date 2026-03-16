import React, { useEffect, useState } from "react";
import axios from "axios";

interface Curso {
    id: number;
    titulo: string;
    descripcion: string;
    imagen?: string;
    estado?: string;
}

export default function MisCursos() {
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        obtenerCursos();
    }, []);

    const obtenerCursos = () => {
        axios.get("/api/mis-cursos")
            .then(response => setCursos(response.data))
            .catch(error => console.error("Error cargando mis cursos:", error))
            .finally(() => setLoading(false));
    };

    if (loading) {
        return (
            <div style={s.loadingWrap}>
                <style>{css}</style>
                <div style={s.spinner} />
                <p style={s.loadingText}>Cargando tus cursos...</p>
            </div>
        );
    }

    return (
        <div style={s.page}>
            <style>{css}</style>

            {/* ── HEADER ────────────────────────────────────────────────────── */}
            <header style={s.header}>
                <div style={s.headerInner}>
                    <div>
                        <span style={s.badge}>MI APRENDIZAJE</span>
                        <h1 style={s.pageTitle}>Mis Cursos</h1>
                        <p style={s.pageSubtitle}>Continúa donde lo dejaste</p>
                    </div>
                    <div style={s.headerActions}>
                        <a href="/" style={{ textDecoration: "none" }}>
                            <button style={s.btnOutline} className="btn-outline">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "6px", verticalAlign: "middle" }}>
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                                Inicio
                            </button>
                        </a>
                        <a href="/cursos" style={{ textDecoration: "none" }}>
                            <button style={s.btnOutline} className="btn-outline">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="19" y1="12" x2="5" y2="12" />
                                    <polyline points="12 19 5 12 12 5" />
                                </svg>
                                Explorar cursos
                            </button>
                        </a>
                    </div>
                </div>
            </header>

            {/* ── STATS ─────────────────────────────────────────────────────── */}
            <div style={s.statsBar}>
                <span style={s.statChip}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                    {cursos.length} cursos inscritos
                </span>
            </div>

            {/* ── CONTENIDO ─────────────────────────────────────────────────── */}
            <main style={s.main}>
                {cursos.length === 0 ? (
                    <div style={s.emptyState}>
                        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#2e3050" strokeWidth="1.2">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                        <p style={s.emptyTitle}>Aún no estás inscrito en ningún curso</p>
                        <p style={s.emptySubtitle}>Explora el catálogo y comienza tu aprendizaje en VR</p>
                        <a href="/cursos" style={{ textDecoration: "none" }}>
                            <button style={s.btnPrimary} className="btn-primary">Ver cursos disponibles</button>
                        </a>
                    </div>
                ) : (
                    <div style={s.grid}>
                        {cursos.map(curso => (
                            <div key={curso.id} style={s.card} className="curso-card">
                                {/* Imagen */}
                                <div style={s.cardImgWrap}>
                                    {curso.imagen ? (
                                        <img
                                            src={`/storage/${curso.imagen}`}
                                            alt={curso.titulo}
                                            style={s.cardImg}
                                        />
                                    ) : (
                                        <div style={s.cardImgPlaceholder}>
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2e3050" strokeWidth="1.2">
                                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div style={s.cardImgOverlay} />
                                    {curso.estado && (
                                        <span style={s.cardBadge}>{curso.estado}</span>
                                    )}
                                </div>

                                {/* Cuerpo */}
                                <div style={s.cardBody}>
                                    <h2 style={s.cardTitle}>{curso.titulo}</h2>
                                    <p style={s.cardDesc}>{curso.descripcion}</p>

                                    <div style={s.cardFooter}>
                                        <a href={`/curso/${curso.id}`} style={{ textDecoration: "none", flex: 1 }}>
                                            <button style={{ ...s.actionBtn, width: "100%" }} className="btn-ver">
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                                                    <polygon points="5 3 19 12 5 21 5 3" />
                                                </svg>
                                                Continuar curso
                                            </button>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
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
        borderBottom: "1px solid #13141f",
    },
    headerInner: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "20px",
        padding: "36px 40px 28px",
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
    pageTitle: {
        fontSize: "28px",
        fontWeight: 600,
        color: "#e8e6ff",
        margin: "0 0 8px",
        lineHeight: 1.25,
    },
    pageSubtitle: {
        fontSize: "14px",
        color: "#7a78a0",
        margin: 0,
    },
    headerActions: {
        display: "flex",
        gap: "10px",
        alignItems: "center",
        paddingTop: "4px",
    },
    btnOutline: {
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "13px",
        fontWeight: 500,
        padding: "9px 18px",
        borderRadius: "8px",
        border: "1px solid #2a2b3d",
        background: "#111220",
        color: "#8b8aaa",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "7px",
    },

    // Stats
    statsBar: {
        padding: "12px 40px",
        borderBottom: "1px solid #0f1020",
        display: "flex",
        gap: "10px",
    },
    statChip: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "12px",
        color: "#5a5880",
        background: "#0f1020",
        border: "1px solid #1e1f30",
        padding: "4px 12px",
        borderRadius: "20px",
    },

    // Main
    main: { padding: "32px 40px 60px" },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "20px",
    },

    // Card
    card: {
        background: "#0d0e17",
        border: "1px solid #1e1f2e",
        borderRadius: "14px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
    },
    cardImgWrap: {
        position: "relative",
        width: "100%",
        height: "160px",
        background: "#08090e",
        flexShrink: 0,
        overflow: "hidden",
    },
    cardImg: { width: "100%", height: "100%", objectFit: "cover" },
    cardImgPlaceholder: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0b14",
    },
    cardImgOverlay: {
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to top, #0d0e17 0%, transparent 60%)",
    },
    cardBadge: {
        position: "absolute",
        top: "10px",
        right: "10px",
        fontFamily: "'Space Mono', monospace",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "0.1em",
        color: "#4caf7d",
        background: "#0a1f16",
        border: "1px solid #1a3328",
        padding: "3px 8px",
        borderRadius: "4px",
        textTransform: "uppercase",
    },
    cardBody: {
        padding: "18px 20px 20px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
    },
    cardTitle: {
        fontSize: "15px",
        fontWeight: 600,
        color: "#d4d0ff",
        margin: "0 0 8px",
        lineHeight: 1.3,
    },
    cardDesc: {
        fontSize: "13px",
        color: "#5a5880",
        margin: "0 0 18px",
        lineHeight: 1.6,
        flex: 1,
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
    },
    cardFooter: { display: "flex", gap: "8px" },
    actionBtn: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "7px",
        padding: "9px 16px",
        borderRadius: "8px",
        border: "1px solid #3d35a0",
        background: "#1a1630",
        color: "#9d8fff",
        cursor: "pointer",
        fontSize: "12px",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
    },

    // Empty state
    emptyState: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 0",
        gap: "12px",
        textAlign: "center",
    },
    emptyTitle: { color: "#4a4b6a", fontSize: "16px", fontWeight: 500, margin: 0 },
    emptySubtitle: { color: "#2e3050", fontSize: "13px", margin: "0 0 8px" },
    btnPrimary: {
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "13px",
        fontWeight: 500,
        padding: "10px 22px",
        borderRadius: "8px",
        border: "1px solid #3d35a0",
        background: "#1a1630",
        color: "#9d8fff",
        cursor: "pointer",
        marginTop: "8px",
    },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  .btn-outline:hover { background: #1a1b2e !important; color: #d4d0ff !important; border-color: #3d3e5e !important; }
  .curso-card:hover { border-color: #2a2b4a !important; }
  .btn-ver:hover { background: #221c40 !important; color: #c4b8ff !important; }
  .btn-primary:hover { background: #221c40 !important; color: #c4b8ff !important; }
`;
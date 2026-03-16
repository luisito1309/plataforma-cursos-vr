import React, { useEffect, useState } from "react";
import axios from "axios";

interface Curso {
    id: number;
    titulo: string;
    descripcion: string;
    imagen?: string;
    estado?: string;
    docente_id?: number;
}

export default function Cursos() {
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [imagen, setImagen] = useState<File | null>(null);
    const [mostrarForm, setMostrarForm] = useState(false);

    // Modal editar
    const [modalEditar, setModalEditar] = useState<Curso | null>(null);
    const [editTitulo, setEditTitulo] = useState("");
    const [editDescripcion, setEditDescripcion] = useState("");

    useEffect(() => {
        obtenerCursos();
    }, []);

    const obtenerCursos = () => {
        axios.get("/api/cursos")
            .then(response => setCursos(response.data))
            .catch(error => console.error("Error cargando cursos:", error));
    };

    const crearCurso = () => {
        if (!titulo.trim() || !descripcion.trim()) return;
        const formData = new FormData();
        formData.append("titulo", titulo);
        formData.append("descripcion", descripcion);
        if (imagen) formData.append("imagen", imagen);

        axios.post("/api/cursos", formData, { headers: { "Content-Type": "multipart/form-data" } })
            .then(() => {
                obtenerCursos();
                setTitulo("");
                setDescripcion("");
                setImagen(null);
                setMostrarForm(false);
                const fi = document.getElementById("imagenInput") as HTMLInputElement;
                if (fi) fi.value = "";
            })
            .catch(error => console.error("Error creando curso:", error));
    };

    const inscribirse = (curso_id: number) => {
        axios.post("/api/inscribirse", { curso_id })
            .then(() => alert("Te inscribiste al curso"))
            .catch(error => console.error("Error al inscribirse:", error));
    };

    const eliminarCurso = (id: number) => {
        if (!window.confirm("¿Eliminar curso?")) return;
        axios.delete(`/api/cursos/${id}`)
            .then(() => obtenerCursos())
            .catch(error => console.error("Error eliminando curso:", error));
    };

    const abrirModalEditar = (curso: Curso) => {
        setModalEditar(curso);
        setEditTitulo(curso.titulo);
        setEditDescripcion(curso.descripcion);
    };

    const confirmarEditar = () => {
        if (!modalEditar || !editTitulo.trim() || !editDescripcion.trim()) return;
        axios.put(`/api/cursos/${modalEditar.id}`, { titulo: editTitulo, descripcion: editDescripcion })
            .then(() => {
                setModalEditar(null);
                obtenerCursos();
            })
            .catch(error => console.error("Error editando curso:", error));
    };

    return (
        <div style={s.page}>
            <style>{css}</style>

            {/* ── MODAL: Editar curso ────────────────────────────────────────── */}
            {modalEditar && (
                <div style={s.overlay} onClick={() => setModalEditar(null)}>
                    <div style={s.modal} onClick={e => e.stopPropagation()}>
                        <h3 style={s.modalTitle}>Editar curso</h3>
                        <label style={s.label}>Título</label>
                        <input
                            style={s.input}
                            value={editTitulo}
                            onChange={e => setEditTitulo(e.target.value)}
                            autoFocus
                        />
                        <label style={s.label}>Descripción</label>
                        <textarea
                            style={{ ...s.input, resize: "vertical", minHeight: "90px" }}
                            value={editDescripcion}
                            onChange={e => setEditDescripcion(e.target.value)}
                        />
                        <div style={s.modalBtns}>
                            <button style={s.btnCancel} onClick={() => setModalEditar(null)}>Cancelar</button>
                            <button style={s.btnPrimary} onClick={confirmarEditar}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── HEADER ────────────────────────────────────────────────────── */}
            <header style={s.header}>
                <div style={s.headerInner}>
                    <div>
                        <span style={s.badge}>VR PLATFORM</span>
                        <h1 style={s.pageTitle}>Plataforma de Cursos VR</h1>
                        <p style={s.pageSubtitle}>Explora, crea y gestiona tus cursos de realidad virtual</p>
                    </div>
                    <div style={s.headerActions}>
                        <a href="/" style={{ textDecoration: "none" }}>
                            <button style={s.btnOutline} className="btn-outline">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "6px", verticalAlign: "middle" }}>
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                                Inicio
                            </button>
                        </a>
                        <a href="/mis-cursos" style={{ textDecoration: "none" }}>
                            <button style={s.btnOutline} className="btn-outline">Mis Cursos</button>
                        </a>
                        <button
                            style={s.btnPrimaryLg}
                            className="btn-primary-lg"
                            onClick={() => setMostrarForm(!mostrarForm)}
                        >
                            {mostrarForm ? "✕ Cancelar" : "+ Nuevo Curso"}
                        </button>
                    </div>
                </div>

                {/* ── FORMULARIO CREAR CURSO ─────────────────────────────────── */}
                {mostrarForm && (
                    <div style={s.formPanel}>
                        <div style={s.formGrid}>
                            <div style={s.formGroup}>
                                <label style={s.label}>Título del curso</label>
                                <input
                                    style={s.inputDark}
                                    placeholder="Ej: Introducción a VR con Unity"
                                    value={titulo}
                                    onChange={e => setTitulo(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div style={s.formGroup}>
                                <label style={s.label}>Descripción</label>
                                <textarea
                                    style={{ ...s.inputDark, resize: "vertical", minHeight: "80px" }}
                                    placeholder="Describe el contenido del curso..."
                                    value={descripcion}
                                    onChange={e => setDescripcion(e.target.value)}
                                />
                            </div>
                            <div style={s.formGroup}>
                                <label style={s.label}>Imagen del curso</label>
                                <label style={s.fileLabel} className="file-label">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                    {imagen ? imagen.name : "Seleccionar imagen"}
                                    <input
                                        id="imagenInput"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={e => setImagen(e.target.files?.[0] ?? null)}
                                    />
                                </label>
                            </div>
                        </div>
                        <div style={s.formFooter}>
                            <button style={s.btnPrimary} onClick={crearCurso}>Crear Curso</button>
                        </div>
                    </div>
                )}
            </header>

            {/* ── STATS ─────────────────────────────────────────────────────── */}
            <div style={s.statsBar}>
                <span style={s.statChip}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                    {cursos.length} cursos disponibles
                </span>
            </div>

            {/* ── GRID DE CURSOS ─────────────────────────────────────────────── */}
            <main style={s.main}>
                {cursos.length === 0 ? (
                    <div style={s.emptyState}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2e3050" strokeWidth="1.2">
                            <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                        <p style={s.emptyText}>No hay cursos aún. ¡Crea el primero!</p>
                    </div>
                ) : (
                    <div style={s.grid}>
                        {cursos.map(curso => (
                            <div key={`${curso.id}-${curso.titulo}`} style={s.card} className="curso-card">
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
                                                <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                                            </svg>
                                        </div>
                                    )}
                                    <div style={s.cardImgOverlay} />
                                    {curso.estado && (
                                        <span style={s.cardBadge}>{curso.estado}</span>
                                    )}
                                </div>

                                {/* Contenido */}
                                <div style={s.cardBody}>
                                    <h2 style={s.cardTitle}>{curso.titulo}</h2>
                                    <p style={s.cardDesc}>{curso.descripcion}</p>

                                    {/* Acciones */}
                                    <div style={s.cardActions}>
                                        <a href={`/curso/${curso.id}`} style={{ textDecoration: "none", flex: 1 }}>
                                            <button style={{ ...s.actionBtn, ...s.actionBtnPrimary, width: "100%" }} className="action-btn-primary">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                    <polygon points="5 3 19 12 5 21 5 3" />
                                                </svg>
                                                Ver Curso
                                            </button>
                                        </a>
                                        <button
                                            onClick={() => inscribirse(curso.id)}
                                            style={{ ...s.actionBtn, ...s.actionBtnGreen }}
                                            className="action-btn-green"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => abrirModalEditar(curso)}
                                            style={{ ...s.actionBtn, ...s.actionBtnEdit }}
                                            className="action-btn-edit"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => eliminarCurso(curso.id)}
                                            style={{ ...s.actionBtn, ...s.actionBtnDelete }}
                                            className="action-btn-delete"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6l-1 14H6L5 6" />
                                                <path d="M10 11v6M14 11v6" />
                                            </svg>
                                        </button>
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

    // Header
    header: {
        borderBottom: "1px solid #13141f",
        background: "#08090e",
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
        flexShrink: 0,
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
    },
    btnPrimaryLg: {
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "13px",
        fontWeight: 500,
        padding: "9px 18px",
        borderRadius: "8px",
        border: "1px solid #3d35a0",
        background: "#1a1630",
        color: "#9d8fff",
        cursor: "pointer",
    },

    // Formulario
    formPanel: {
        margin: "0 40px 32px",
        background: "#0d0e1a",
        border: "1px solid #1e1f2e",
        borderRadius: "14px",
        padding: "24px 28px",
    },
    formGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "20px",
    },
    formGroup: { display: "flex", flexDirection: "column", gap: "8px" },
    formFooter: { marginTop: "20px", display: "flex", justifyContent: "flex-end" },
    label: { fontSize: "12px", color: "#5a5880" },
    inputDark: {
        background: "#0a0b14",
        border: "1px solid #2a2b3d",
        borderRadius: "8px",
        padding: "10px 14px",
        color: "#d4d0ff",
        fontSize: "13px",
        fontFamily: "'DM Sans', sans-serif",
        outline: "none",
        width: "100%",
    },
    fileLabel: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "#0a0b14",
        border: "1px dashed #2a2b3d",
        borderRadius: "8px",
        padding: "10px 14px",
        color: "#5a5880",
        fontSize: "13px",
        cursor: "pointer",
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
        transition: "border-color .2s",
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
    cardBody: { padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column" },
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
    cardActions: { display: "flex", gap: "6px", alignItems: "center" },
    actionBtn: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "8px 12px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontSize: "12px",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        flexShrink: 0,
        transition: "background .15s",
    },
    actionBtnPrimary: {
        background: "#1a1630",
        color: "#9d8fff",
        border: "1px solid #3d35a0",
    },
    actionBtnGreen: {
        background: "#0a1f16",
        color: "#4caf7d",
        border: "1px solid #1a3328",
        width: "34px",
        padding: "8px 0",
    },
    actionBtnEdit: {
        background: "#111220",
        color: "#8b8aaa",
        border: "1px solid #2a2b3d",
        width: "34px",
        padding: "8px 0",
    },
    actionBtnDelete: {
        background: "#1a0f0f",
        color: "#6b3030",
        border: "1px solid #3a2a2a",
        width: "34px",
        padding: "8px 0",
    },

    // Empty state
    emptyState: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 0",
        gap: "16px",
    },
    emptyText: { color: "#2e3050", fontSize: "14px" },

    // Modal
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
        maxWidth: "460px",
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
  .btn-outline:hover { background: #1a1b2e !important; color: #d4d0ff !important; border-color: #3d3e5e !important; }
  .btn-primary-lg:hover { background: #221c40 !important; color: #c4b8ff !important; }
  .curso-card:hover { border-color: #2a2b4a !important; }
  .action-btn-primary:hover { background: #221c40 !important; }
  .action-btn-green:hover { background: #0f2e1e !important; color: #6fcf97 !important; }
  .action-btn-edit:hover { background: #1a1b2e !important; color: #9d8fff !important; }
  .action-btn-delete:hover { background: #2a1414 !important; color: #e05c5c !important; }
  .file-label:hover { border-color: #3d35a0 !important; color: #7c6fff !important; }
`;
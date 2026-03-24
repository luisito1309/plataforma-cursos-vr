import React, { useEffect, useState } from "react";
import axios from "axios";
import QuizMedico3D from "@/components/QuizMedico3D";
import AnatomiaHumana3D from "@/components/AnatomiaHumana3D";
import {
    BookOpen, GraduationCap, Home, Plus, X,
    Upload, Edit2, Trash2, UserPlus, Play, Monitor,
    Gamepad2, Glasses, Cpu, Zap, ScanLine,
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
    // Futuros juegos — descomenta para activar:
    // { value: "vr_escape",   label: "Escape Room VR",     icon: <Glasses  size={14} />, tag: "VR"   },
    // { value: "sim_fisica",  label: "Simulación Física",  icon: <Cpu      size={14} />, tag: "SIM"  },
    // { value: "quiz_3d",     label: "Quiz Interactivo",   icon: <Zap      size={14} />, tag: "QUIZ" },
];

interface Curso {
    id: number;
    titulo: string;
    descripcion: string;
    imagen?: string;
    estado?: string;
    docente_id?: number;
    mini_juego?: string | null;
}

// ─── Tokens de estilo ────────────────────────────────────────────────────────
const btnRed: React.CSSProperties = {
    background: "#f53003", color: "#fff", border: "none",
    borderRadius: "10px", padding: "0 18px", height: "36px",
    fontSize: "13px", fontFamily: "'Instrument Sans', sans-serif",
    fontWeight: 600, cursor: "pointer", display: "inline-flex",
    alignItems: "center", gap: "7px",
};

const btnOutline: React.CSSProperties = {
    background: "#fff", color: "#706f6c",
    border: "1px solid #d1d0cc", borderRadius: "10px",
    padding: "0 16px", height: "36px", fontSize: "13px",
    fontFamily: "'Instrument Sans', sans-serif",
    fontWeight: 500, cursor: "pointer", display: "inline-flex",
    alignItems: "center", gap: "7px",
};

const inputSt: React.CSSProperties = {
    background: "#FDFDFC", border: "1px solid #d1d0cc",
    borderRadius: "10px", padding: "10px 14px", color: "#1b1b18",
    fontSize: "14px", fontFamily: "'Instrument Sans', sans-serif",
    width: "100%", outline: "none",
};

const labelSt: React.CSSProperties = {
    fontSize: "11px", fontWeight: 600, color: "#706f6c",
    textTransform: "uppercase", letterSpacing: ".07em",
};

// ─── Componente ──────────────────────────────────────────────────────────────
export default function Cursos() {
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [imagen, setImagen] = useState<File | null>(null);
    const [miniJuego, setMiniJuego] = useState("");
    const [mostrarForm, setMostrarForm] = useState(false);
    const [modalEditar, setModalEditar] = useState<Curso | null>(null);
    const [editTitulo, setEditTitulo] = useState("");
    const [editDescripcion, setEditDescripcion] = useState("");

    useEffect(() => { cargar(); }, []);

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
        axios.post("/api/cursos", fd, { headers: { "Content-Type": "multipart/form-data" } })
            .then(() => {
                cargar();
                setTitulo(""); setDescripcion(""); setImagen(null);
                setMiniJuego("");
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

    return (
        <>
            <style>{`
                @import url('https://fonts.bunny.net/css?family=playfair-display:700,800,900|instrument-sans:400,500,600');
                * { box-sizing: border-box; }
                .c-card { transition: transform .2s, border-color .2s, box-shadow .2s; }
                .c-card:hover { transform: translateY(-4px); border-color: rgba(245,48,3,.3) !important; box-shadow: 0 20px 40px rgba(245,48,3,.07) !important; }
                .c-btn-red:hover { background: #d42800 !important; }
                .c-btn-out:hover { border-color: rgba(245,48,3,.4) !important; color: #f53003 !important; background: rgba(245,48,3,.04) !important; }
                .c-del:hover { background: rgba(245,48,3,.12) !important; color: #d42800 !important; }
                .c-inp:focus { border-color: rgba(245,48,3,.5) !important; box-shadow: 0 0 0 3px rgba(245,48,3,.08); }
            `}</style>

            <div style={{ fontFamily: "'Instrument Sans', sans-serif", background: "#FDFDFC", minHeight: "100vh", color: "#1b1b18" }}>

                {/* ══ MODAL EDITAR ══ */}
                {modalEditar && (
                    <div
                        onClick={() => setModalEditar(null)}
                        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
                    >
                        <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "480px", border: "1px solid #e3e3e0", boxShadow: "0 24px 60px rgba(0,0,0,.12)", display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>Editar curso</h3>
                                <button onClick={() => setModalEditar(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#706f6c" }}><X size={18} /></button>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={labelSt}>Título</label>
                                <input className="c-inp" style={inputSt} value={editTitulo} onChange={e => setEditTitulo(e.target.value)} autoFocus />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={labelSt}>Descripción</label>
                                <textarea className="c-inp" style={{ ...inputSt, resize: "vertical", minHeight: "100px" }} value={editDescripcion} onChange={e => setEditDescripcion(e.target.value)} />
                            </div>
                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                                <button className="c-btn-out" onClick={() => setModalEditar(null)} style={btnOutline}>Cancelar</button>
                                <button className="c-btn-red" onClick={confirmarEditar} style={btnRed}>Guardar cambios</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ NAV ══ */}
                <header style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(227,227,224,.7)", background: "rgba(253,253,252,.92)", backdropFilter: "blur(8px)" }}>
                    <div style={{ maxWidth: 1152, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 10, background: "#f53003", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <GraduationCap size={16} color="#fff" />
                            </div>
                            <span style={{ fontSize: 15, fontWeight: 600 }}>EduPlatform</span>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <a href="/" style={{ textDecoration: "none" }}>
                                <button className="c-btn-out" style={btnOutline}><Home size={14} /> Home</button>
                            </a>
                            <a href="/mis-cursos" style={{ textDecoration: "none" }}>
                                <button className="c-btn-out" style={btnOutline}>Mis Cursos</button>
                            </a>
                            <button className="c-btn-red" onClick={() => setMostrarForm(!mostrarForm)} style={btnRed}>
                                {mostrarForm ? <><X size={14} /> Cancelar</> : <><Plus size={14} /> Nuevo Curso</>}
                            </button>
                        </div>
                    </div>
                </header>

                {/* ══ HERO TITLE ══ */}
                <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(227,227,224,.6)" }}>
                    <div style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400, borderRadius: "50%", background: "rgba(245,48,3,.04)", filter: "blur(60px)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: 0, left: -40, width: 260, height: 260, borderRadius: "50%", background: "rgba(248,184,3,.05)", filter: "blur(50px)", pointerEvents: "none" }} />
                    <div style={{ position: "relative", maxWidth: 1152, margin: "0 auto", padding: "48px 24px 40px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
                        <div>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, border: "1px solid rgba(245,48,3,.25)", background: "rgba(245,48,3,.06)", padding: "4px 14px", fontSize: 12, fontWeight: 600, color: "#f53003", marginBottom: 14 }}>
                                <Monitor size={12} /> VR PLATFORM
                            </div>
                            <h1 style={{ margin: "0 0 8px", fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, fontFamily: "'Playfair Display', serif", lineHeight: 1.1 }}>
                                Plataforma de Cursos VR
                            </h1>
                            <p style={{ margin: 0, fontSize: 15, color: "#706f6c" }}>Explora, crea y gestiona tus cursos de realidad virtual</p>
                        </div>
                        <div style={{ background: "#fff", border: "1px solid #e3e3e0", borderRadius: 14, padding: "14px 22px", boxShadow: "0 2px 8px rgba(0,0,0,.04)", display: "flex", alignItems: "center", gap: 10 }}>
                            <BookOpen size={16} color="#f53003" />
                            <span style={{ fontSize: 13, color: "#706f6c" }}>
                                <b style={{ color: "#1b1b18", fontSize: 22, fontFamily: "'Playfair Display', serif" }}>{cursos.length}</b> cursos disponibles
                            </span>
                        </div>
                    </div>
                </section>

                {/* ══ FORM CREAR ══ */}
                {mostrarForm && (
                    <div style={{ borderBottom: "1px solid rgba(227,227,224,.6)", background: "#fff" }}>
                        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "28px 24px" }}>
                            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>Crear nuevo curso</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 20 }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    <label style={labelSt}>Título del curso</label>
                                    <input className="c-inp" style={inputSt} placeholder="Ej: Introducción a VR con Unity" value={titulo} onChange={e => setTitulo(e.target.value)} autoFocus />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    <label style={labelSt}>Descripción</label>
                                    <textarea className="c-inp" style={{ ...inputSt, resize: "vertical", minHeight: 80 }} placeholder="Describe el contenido del curso..." value={descripcion} onChange={e => setDescripcion(e.target.value)} />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    <label style={labelSt}>Imagen del curso</label>
                                    <label style={{ display: "flex", alignItems: "center", gap: 8, background: "#FDFDFC", border: "1px dashed #d1d0cc", borderRadius: 10, padding: "12px 14px", color: "#706f6c", fontSize: 13, cursor: "pointer" }}>
                                        <Upload size={14} />
                                        {imagen ? imagen.name : "Seleccionar imagen"}
                                        <input id="imagenInput" type="file" accept="image/*" style={{ display: "none" }} onChange={e => setImagen(e.target.files?.[0] ?? null)} />
                                    </label>
                                </div>

                                {/* ── Mini Juego selector ── */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    <label style={labelSt}>Mini Juego</label>
                                    <div style={{ position: "relative" }}>
                                        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: miniJuego ? "#f53003" : "#a1a09a", pointerEvents: "none", display: "flex", alignItems: "center" }}>
                                            {getJuego(miniJuego)?.icon ?? <Gamepad2 size={14} />}
                                        </div>
                                        <select
                                            className="c-inp"
                                            value={miniJuego}
                                            onChange={e => setMiniJuego(e.target.value)}
                                            style={{ ...inputSt, paddingLeft: 36, appearance: "none", cursor: "pointer", color: miniJuego ? "#1b1b18" : "#706f6c" }}
                                        >
                                            {MINI_JUEGOS.map(juego => (
                                                <option key={juego.value} value={juego.value}>
                                                    {juego.label}{juego.tag !== "—" ? ` [${juego.tag}]` : ""}
                                                </option>
                                            ))}
                                        </select>
                                        <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#a1a09a" }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                                        </div>
                                    </div>
                                    {miniJuego && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#f53003", fontWeight: 600 }}>
                                            {getJuego(miniJuego)?.icon}
                                            <span>{getJuego(miniJuego)?.label}</span>
                                            <span style={{ background: "rgba(245,48,3,.1)", borderRadius: 999, padding: "1px 7px", fontSize: 10 }}>
                                                {getJuego(miniJuego)?.tag}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {miniJuego === "quiz_medico" && (
                                <div
                                    style={{
                                        marginTop: 24,
                                        padding: "24px",
                                        background: "#fafaf8",
                                        borderRadius: 16,
                                        border: "1px solid #e3e3e0",
                                    }}
                                >
                                    <p
                                        style={{
                                            ...labelSt,
                                            marginBottom: 12,
                                            color: "#1b1b18",
                                            letterSpacing: ".04em",
                                        }}
                                    >
                                        Vista previa — Quiz médico 3D
                                    </p>
                                    <div style={{ maxWidth: 720 }}>
                                        <QuizMedico3D />
                                    </div>
                                </div>
                            )}

                            {miniJuego === "anatomia_humana" && (
                                <div
                                    style={{
                                        marginTop: 24,
                                        padding: "24px",
                                        background: "#fafaf8",
                                        borderRadius: 16,
                                        border: "1px solid #e3e3e0",
                                    }}
                                >
                                    <p
                                        style={{
                                            ...labelSt,
                                            marginBottom: 12,
                                            color: "#1b1b18",
                                            letterSpacing: ".04em",
                                        }}
                                    >
                                        Vista previa — Anatomía humana 3D
                                    </p>
                                    <div style={{ maxWidth: 900 }}>
                                        <AnatomiaHumana3D />
                                    </div>
                                </div>
                            )}

                            {miniJuego === "konterball" && (
                                <div
                                    style={{
                                        marginTop: 24,
                                        padding: "24px",
                                        background: "#fafaf8",
                                        borderRadius: 16,
                                        border: "1px solid #e3e3e0",
                                    }}
                                >
                                    <p
                                        style={{
                                            ...labelSt,
                                            marginBottom: 12,
                                            color: "#1b1b18",
                                            letterSpacing: ".04em",
                                        }}
                                    >
                                        Vista previa — Konterball
                                    </p>
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
                                    <p style={{ margin: "10px 0 0", fontSize: 12, color: "#706f6c" }}>
                                        <a href="https://konterball.com/" target="_blank" rel="noopener noreferrer" style={{ color: "#f53003" }}>
                                            Abrir Konterball en pestaña nueva
                                        </a>
                                    </p>
                                </div>
                            )}

                            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                                <button className="c-btn-red" onClick={crearCurso} style={btnRed}><Plus size={14} /> Crear Curso</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ GRID ══ */}
                <main style={{ maxWidth: 1152, margin: "0 auto", padding: "36px 24px 72px" }}>
                    {cursos.length === 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 0", gap: 16, textAlign: "center" }}>
                            <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(245,48,3,.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <BookOpen size={28} color="rgba(245,48,3,.3)" />
                            </div>
                            <p style={{ color: "#706f6c", fontSize: 15, margin: 0 }}>No hay cursos aún. ¡Crea el primero!</p>
                            <button className="c-btn-red" onClick={() => setMostrarForm(true)} style={btnRed}><Plus size={14} /> Nuevo Curso</button>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                            {cursos.map((curso, i) => {
                                const juego = curso.mini_juego ? getJuego(curso.mini_juego) : null;
                                return (
                                    <article key={`${curso.id}-${curso.titulo}`} className="c-card" style={{ background: "#fff", border: "1px solid #e3e3e0", borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column" }}>

                                        {/* Imagen */}
                                        <div style={{ position: "relative", height: 176, overflow: "hidden", background: "linear-gradient(135deg,#fff2f2,#fef9ee)" }}>
                                            {curso.imagen
                                                ? <img src={`/storage/${curso.imagen}`} alt={curso.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><BookOpen size={48} color="rgba(245,48,3,.12)" /></div>
                                            }
                                            <span style={{ position: "absolute", right: 12, bottom: 4, fontSize: 52, fontWeight: 900, fontFamily: "'Playfair Display', serif", color: "rgba(245,48,3,.07)", lineHeight: 1, userSelect: "none" }}>
                                                {String(i + 1).padStart(2, "0")}
                                            </span>
                                            {curso.estado && (
                                                <span style={{ position: "absolute", top: 10, right: 10, background: "rgba(10,31,22,.9)", color: "#4caf7d", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 999, backdropFilter: "blur(4px)" }}>
                                                    {curso.estado}
                                                </span>
                                            )}
                                            {/* Badge mini juego sobre la imagen */}
                                            {juego && juego.value !== "" && (
                                                <span style={{ position: "absolute", top: 10, left: 10, display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(245,48,3,.9)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 999, backdropFilter: "blur(4px)" }}>
                                                    {juego.icon} {juego.tag}
                                                </span>
                                            )}
                                        </div>

                                        {/* Body */}
                                        <div style={{ padding: "20px 20px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                                            <h2 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, lineHeight: 1.3, color: "#1b1b18" }}>{curso.titulo}</h2>
                                            <p style={{ margin: "0 0 18px", fontSize: 13, color: "#706f6c", lineHeight: 1.6, flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                {curso.descripcion}
                                            </p>

                                            {/* Chip del juego debajo de la descripción */}
                                            {juego && juego.value !== "" && (
                                                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 14, fontSize: 11, color: "#f53003", fontWeight: 600, background: "rgba(245,48,3,.06)", border: "1px solid rgba(245,48,3,.15)", borderRadius: 999, padding: "3px 10px", alignSelf: "flex-start" }}>
                                                    {juego.icon} {juego.label}
                                                </div>
                                            )}

                                            {/* Acciones */}
                                            <div style={{ borderTop: "1px solid rgba(227,227,224,.6)", paddingTop: 14, display: "flex", gap: 7, alignItems: "center" }}>
                                                <a href={`/curso/${curso.id}`} style={{ textDecoration: "none", flex: 1 }}>
                                                    <button className="c-btn-red" style={{ ...btnRed, width: "100%", justifyContent: "center" }}>
                                                        <Play size={12} /> Ver Curso
                                                    </button>
                                                </a>
                                                <button className="c-btn-out" onClick={() => inscribirse(curso.id)} title="Inscribirse" style={{ ...btnOutline, width: 36, padding: 0, justifyContent: "center" }}>
                                                    <UserPlus size={13} />
                                                </button>
                                                <button className="c-btn-out" onClick={() => { setModalEditar(curso); setEditTitulo(curso.titulo); setEditDescripcion(curso.descripcion); }} title="Editar" style={{ ...btnOutline, width: 36, padding: 0, justifyContent: "center" }}>
                                                    <Edit2 size={13} />
                                                </button>
                                                <button className="c-del" onClick={() => eliminar(curso.id)} title="Eliminar" style={{ width: 36, height: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, border: "1px solid rgba(245,48,3,.2)", background: "rgba(245,48,3,.05)", color: "#f53003", cursor: "pointer" }}>
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </main>

                {/* ══ FOOTER ══ */}
                <footer style={{ borderTop: "1px solid rgba(227,227,224,.6)", padding: "20px 24px" }}>
                    <div style={{ maxWidth: 1152, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#706f6c" }}>
                            <div style={{ width: 20, height: 20, borderRadius: 6, background: "#f53003", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <GraduationCap size={11} color="#fff" />
                            </div>
                            EduPlatform © {new Date().getFullYear()}
                        </div>
                        <a href="/" style={{ textDecoration: "none" }}>
                            <button className="c-btn-out" style={{ ...btnOutline, fontSize: 12 }}><Home size={12} /> Volver al inicio</button>
                        </a>
                    </div>
                </footer>
            </div>
        </>
    );
}
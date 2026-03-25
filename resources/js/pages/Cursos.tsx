import React, { useEffect, useState } from "react";
import { Link } from "@inertiajs/react";
import axios from "axios";
import EduPageShell, { EduHeroBlobs, eduNavOutline, eduNavPrimary } from "@/components/EduPageShell";
import { isMinijuegoOk, miniJuegoTieneProgresoLocal } from "@/lib/minijuegoStorage";
import QuizMedico3D from "@/components/QuizMedico3D";
import AnatomiaHumana3D from "@/components/AnatomiaHumana3D";
import Computer3D from "@/components/Computer3D";
import {
    BookOpen, Home, Plus, X,
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
    { value: "computer_3d", label: "Computer 3D", icon: <Cpu size={14} />, tag: "3D" },
    // Futuros juegos — descomenta para activar:
    // { value: "vr_escape",   label: "Escape Room VR",     icon: <Glasses  size={14} />, tag: "VR"   },
    // { value: "sim_fisica",  label: "Simulación Física",  icon: <Cpu      size={14} />, tag: "SIM"  },
    // { value: "quiz_3d",     label: "Quiz Interactivo",   icon: <Zap      size={14} />, tag: "QUIZ" },
];

type Categoria = "play" | "medicina" | "tecnologia";

const CATEGORIA_LABELS: Record<Categoria, string> = {
    play: "Play",
    medicina: "Medicina",
    tecnologia: "Tecnología",
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
        if (cat === "play" || cat === "medicina" || cat === "tecnologia") return CATEGORIA_LABELS[cat];
        return null;
    };

    return (
        <>
            <style>{`
                .c-card { transition: transform .2s, border-color .2s, box-shadow .2s; }
                .c-card:hover {
                    transform: translateY(-4px);
                    border-color: rgba(245, 48, 3, 0.35) !important;
                    box-shadow: 0 20px 40px rgba(245, 48, 3, 0.08) !important;
                }
                .c-btn-red:hover { background: #d42800 !important; }
                .c-btn-out:hover { border-color: rgba(245,48,3,.4) !important; color: #f53003 !important; background: rgba(245,48,3,.04) !important; }
                .c-del:hover { background: rgba(245,48,3,.12) !important; color: #d42800 !important; }
                .c-inp:focus { border-color: rgba(245,48,3,.5) !important; box-shadow: 0 0 0 3px rgba(245,48,3,.08); }
            `}</style>

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
                        <button type="button" className={eduNavPrimary} onClick={() => setMostrarForm(!mostrarForm)}>
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
                    <div
                        onClick={() => setModalEditar(null)}
                        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
                    >
                        <div onClick={e => e.stopPropagation()} className="flex w-full max-w-[480px] flex-col gap-4 rounded-[20px] border border-[#e3e3e0] bg-white p-8 shadow-2xl dark:border-[#2a2a26] dark:bg-[#111110]" style={{ boxShadow: "0 24px 60px rgba(0,0,0,.12)" }}>
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

                {/* ══ HERO ══ */}
                <section className="relative overflow-hidden border-b border-[#e3e3e0]/60 dark:border-[#2a2a26]/60">
                    <EduHeroBlobs />
                    <div className="relative mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6 px-6 pb-10 pt-14 lg:pt-16">
                        <div className="max-w-xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f53003]/25 bg-[#f53003]/6 px-4 py-1.5 text-sm font-medium text-[#f53003]">
                                <Monitor className="h-3.5 w-3.5" /> Plataforma VR
                            </div>
                            <h1
                                className="mb-3 text-4xl font-black leading-[1.1] tracking-tight text-[#1b1b18] dark:text-[#EDEDEC] lg:text-5xl"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                Tus cursos
                            </h1>
                            <p className="text-lg leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                                Explora, crea y gestiona experiencias de realidad virtual como en el inicio.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl border border-[#e3e3e0] bg-white px-5 py-4 shadow-sm dark:border-[#2a2a26] dark:bg-[#111110]">
                            <BookOpen className="h-5 w-5 text-[#f53003]" />
                            <span className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                <strong
                                    className="text-2xl font-black text-[#1b1b18] dark:text-[#EDEDEC]"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                    {cursos.length}
                                </strong>
                                <br />
                                cursos en catálogo
                            </span>
                        </div>
                    </div>
                </section>

                {/* ══ FORM CREAR ══ */}
                {mostrarForm && (
                    <div className="border-b border-[#e3e3e0]/60 bg-white dark:border-[#2a2a26]/60 dark:bg-[#0d0d0c]">
                        <div className="mx-auto max-w-6xl px-6 py-8">
                            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>Crear nuevo curso</h3>
                            <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                                <label style={labelSt}>Categoría</label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                                    {(["play", "medicina", "tecnologia"] as Categoria[]).map((c) => {
                                        const activa = categoria === c;
                                        return (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setCategoria(c)}
                                                className={activa ? "c-btn-red" : "c-btn-out"}
                                                style={{
                                                    ...(activa ? btnRed : btnOutline),
                                                    borderRadius: 10,
                                                    padding: "0 18px",
                                                    height: 38,
                                                    fontWeight: 600,
                                                    fontSize: 13,
                                                }}
                                            >
                                                {CATEGORIA_LABELS[c]}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
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
                                            {miniJuegosPorCategoria(categoria).map(juego => (
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

                            {miniJuego === "computer_3d" && (
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
                                        Vista previa — Computer 3D
                                    </p>
                                    <div style={{ maxWidth: 900 }}>
                                        <Computer3D />
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                                <button className="c-btn-red" onClick={crearCurso} style={btnRed}><Plus size={14} /> Crear Curso</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ GRID ══ */}
                <section className="border-t border-[#e3e3e0]/60 bg-white py-12 dark:border-[#2a2a26]/60 dark:bg-[#0d0d0c]">
                    <main className="mx-auto max-w-6xl px-6 pb-16">
                        <div className="mb-10">
                            <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-[#f53003]">
                                Catálogo
                            </p>
                            <h2
                                className="text-3xl font-black tracking-tight text-[#1b1b18] dark:text-[#EDEDEC] lg:text-4xl"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                Todos los cursos
                            </h2>
                        </div>
                    {cursos.length === 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 0", gap: 16, textAlign: "center" }}>
                            <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(245,48,3,.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <BookOpen size={28} color="rgba(245,48,3,.3)" />
                            </div>
                            <p style={{ color: "#706f6c", fontSize: 15, margin: 0 }}>No hay cursos aún. ¡Crea el primero!</p>
                            <button className="c-btn-red" onClick={() => setMostrarForm(true)} style={btnRed}><Plus size={14} /> Nuevo Curso</button>
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {cursos.map((curso, i) => {
                                const juego = curso.mini_juego ? getJuego(curso.mini_juego) : null;
                                const catLabel = etiquetaCategoria(curso.categoria);
                                const estadoMostrar = etiquetaEstadoCurso(curso);
                                return (
                                    <article
                                        key={`${curso.id}-${curso.titulo}`}
                                        className="c-card group flex flex-col overflow-hidden rounded-2xl border border-[#e3e3e0] bg-[#FDFDFC] dark:border-[#2a2a26] dark:bg-[#111110]"
                                        style={{ boxShadow: "0 1px 0 rgba(0,0,0,.04)" }}
                                    >

                                        {/* Imagen */}
                                        <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#fff2f2] to-[#fef9ee] dark:from-[#1D0002] dark:to-[#161200]">
                                            {curso.imagen
                                                ? <img src={`/storage/${curso.imagen}`} alt={curso.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><BookOpen size={48} color="rgba(245,48,3,.12)" /></div>
                                            }
                                            <span style={{ position: "absolute", right: 12, bottom: 4, fontSize: 52, fontWeight: 900, fontFamily: "'Playfair Display', serif", color: "rgba(245,48,3,.07)", lineHeight: 1, userSelect: "none" }}>
                                                {String(i + 1).padStart(2, "0")}
                                            </span>
                                            {estadoMostrar && (
                                                <span style={{ position: "absolute", top: 10, right: 10, background: "rgba(10,31,22,.9)", color: "#4caf7d", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 999, backdropFilter: "blur(4px)" }}>
                                                    {estadoMostrar}
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
                                            {catLabel && (
                                                <span style={{ display: "inline-flex", marginBottom: 10, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "#0c4a6e", background: "#e0f2fe", border: "1px solid #7dd3fc", borderRadius: 999, padding: "3px 10px", alignSelf: "flex-start" }}>
                                                    {catLabel}
                                                </span>
                                            )}
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
                </section>
            </EduPageShell>
        </>
    );
}
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    BookOpen, GraduationCap, Home, ArrowLeft,
    Play, BookMarked, ChevronRight,
} from "lucide-react";

interface Curso {
    id: number;
    titulo: string;
    descripcion: string;
    imagen?: string;
    estado?: string;
}

// ─── Tokens ──────────────────────────────────────────────────────────────────
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

export default function MisCursos() {
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { cargar(); }, []);

    const cargar = () =>
        axios.get("/api/mis-cursos")
            .then(r => setCursos(r.data))
            .catch(e => console.error("Error cargando mis cursos:", e))
            .finally(() => setLoading(false));

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <>
                <style>{fonts}</style>
                <div style={{ fontFamily: "'Instrument Sans', sans-serif", background: "#FDFDFC", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", border: "2.5px solid #e3e3e0", borderTopColor: "#f53003", animation: "spin .8s linear infinite" }} />
                    <p style={{ color: "#706f6c", fontSize: 14, margin: 0 }}>Cargando tus cursos...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{fonts + hoverCss}</style>

            <div style={{ fontFamily: "'Instrument Sans', sans-serif", background: "#FDFDFC", minHeight: "100vh", color: "#1b1b18" }}>

                {/* ══ NAV ══ */}
                <header style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(227,227,224,.7)", background: "rgba(253,253,252,.92)", backdropFilter: "blur(8px)" }}>
                    <div style={{ maxWidth: 1152, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
                        {/* Logo */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 10, background: "#f53003", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <GraduationCap size={16} color="#fff" />
                            </div>
                            <span style={{ fontSize: 15, fontWeight: 600 }}>EduPlatform</span>
                        </div>

                        {/* Acciones nav */}
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <a href="/" style={{ textDecoration: "none" }}>
                                <button className="mc-btn-out" style={btnOutline}>
                                    <Home size={14} /> Home
                                </button>
                            </a>
                            <a href="/cursos" style={{ textDecoration: "none" }}>
                                <button className="mc-btn-out" style={btnOutline}>
                                    <ArrowLeft size={14} /> Explorar cursos
                                </button>
                            </a>
                        </div>
                    </div>
                </header>

                {/* ══ HERO TITLE ══ */}
                <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(227,227,224,.6)" }}>
                    {/* Blobs */}
                    <div style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400, borderRadius: "50%", background: "rgba(245,48,3,.04)", filter: "blur(60px)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: 0, left: -40, width: 260, height: 260, borderRadius: "50%", background: "rgba(248,184,3,.05)", filter: "blur(50px)", pointerEvents: "none" }} />

                    <div style={{ position: "relative", maxWidth: 1152, margin: "0 auto", padding: "48px 24px 40px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
                        <div>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, border: "1px solid rgba(245,48,3,.25)", background: "rgba(245,48,3,.06)", padding: "4px 14px", fontSize: 12, fontWeight: 600, color: "#f53003", marginBottom: 14 }}>
                                <BookMarked size={12} /> MI APRENDIZAJE
                            </div>
                            <h1 style={{ margin: "0 0 8px", fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, fontFamily: "'Playfair Display', serif", lineHeight: 1.1 }}>
                                Mis Cursos
                            </h1>
                            <p style={{ margin: 0, fontSize: 15, color: "#706f6c" }}>Continúa donde lo dejaste</p>
                        </div>

                        {/* Stat */}
                        <div style={{ background: "#fff", border: "1px solid #e3e3e0", borderRadius: 14, padding: "14px 22px", boxShadow: "0 2px 8px rgba(0,0,0,.04)", display: "flex", alignItems: "center", gap: 10 }}>
                            <BookOpen size={16} color="#f53003" />
                            <span style={{ fontSize: 13, color: "#706f6c" }}>
                                <b style={{ color: "#1b1b18", fontSize: 22, fontFamily: "'Playfair Display', serif" }}>{cursos.length}</b> {cursos.length === 1 ? "curso inscrito" : "cursos inscritos"}
                            </span>
                        </div>
                    </div>
                </section>

                {/* ══ CONTENIDO ══ */}
                <main style={{ maxWidth: 1152, margin: "0 auto", padding: "36px 24px 72px" }}>

                    {/* Empty state */}
                    {cursos.length === 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 0", gap: 20, textAlign: "center" }}>
                            <div style={{ width: 80, height: 80, borderRadius: 24, background: "rgba(245,48,3,.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <BookOpen size={36} color="rgba(245,48,3,.25)" />
                            </div>
                            <div>
                                <p style={{ color: "#1b1b18", fontSize: 18, fontWeight: 700, margin: "0 0 8px", fontFamily: "'Playfair Display', serif" }}>
                                    Aún no estás inscrito en ningún curso
                                </p>
                                <p style={{ color: "#706f6c", fontSize: 14, margin: 0 }}>
                                    Explora el catálogo y comienza tu aprendizaje en VR
                                </p>
                            </div>
                            <a href="/cursos" style={{ textDecoration: "none" }}>
                                <button className="mc-btn-red" style={{ ...btnRed, height: 40, paddingInline: 24 }}>
                                    Ver cursos disponibles <ChevronRight size={14} />
                                </button>
                            </a>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                            {cursos.map((curso, i) => (
                                <article
                                    key={curso.id}
                                    className="mc-card"
                                    style={{ background: "#fff", border: "1px solid #e3e3e0", borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column" }}
                                >
                                    {/* Imagen */}
                                    <div style={{ position: "relative", height: 176, overflow: "hidden", background: "linear-gradient(135deg,#fff2f2,#fef9ee)" }}>
                                        {curso.imagen
                                            ? <img src={`/storage/${curso.imagen}`} alt={curso.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><BookOpen size={48} color="rgba(245,48,3,.12)" /></div>
                                        }
                                        {/* Número decorativo */}
                                        <span style={{ position: "absolute", right: 12, bottom: 4, fontSize: 52, fontWeight: 900, fontFamily: "'Playfair Display', serif", color: "rgba(245,48,3,.07)", lineHeight: 1, userSelect: "none" }}>
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        {/* Badge estado */}
                                        {curso.estado && (
                                            <span style={{ position: "absolute", top: 10, right: 10, background: "rgba(10,31,22,.9)", color: "#4caf7d", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 999, backdropFilter: "blur(4px)" }}>
                                                {curso.estado}
                                            </span>
                                        )}
                                        {/* Badge "En progreso" */}
                                        <span style={{ position: "absolute", top: 10, left: 10, background: "rgba(245,48,3,.9)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 999, backdropFilter: "blur(4px)" }}>
                                            Inscrito
                                        </span>
                                    </div>

                                    {/* Body */}
                                    <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                                        <h2 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, lineHeight: 1.3, color: "#1b1b18" }}>{curso.titulo}</h2>
                                        <p style={{ margin: "0 0 18px", fontSize: 13, color: "#706f6c", lineHeight: 1.6, flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                            {curso.descripcion}
                                        </p>

                                        {/* CTA → VerCurso.tsx /curso/:id */}
                                        <div style={{ borderTop: "1px solid rgba(227,227,224,.6)", paddingTop: 14 }}>
                                            <a href={`/curso/${curso.id}`} style={{ textDecoration: "none", display: "block" }}>
                                                <button
                                                    className="mc-btn-red"
                                                    style={{ ...btnRed, width: "100%", justifyContent: "center" }}
                                                >
                                                    <Play size={12} /> Continuar curso
                                                </button>
                                            </a>
                                        </div>
                                    </div>
                                </article>
                            ))}
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
                            <button className="mc-btn-out" style={{ ...btnOutline, fontSize: 12 }}>
                                <Home size={12} /> Volver al inicio
                            </button>
                        </a>
                    </div>
                </footer>
            </div>
        </>
    );
}

// ─── Fuentes y hover CSS ──────────────────────────────────────────────────────
const fonts = `@import url('https://fonts.bunny.net/css?family=playfair-display:700,800,900|instrument-sans:400,500,600');
* { box-sizing: border-box; }`;

const hoverCss = `
    @keyframes spin { to { transform: rotate(360deg); } }
    .mc-card { transition: transform .2s, border-color .2s, box-shadow .2s; }
    .mc-card:hover { transform: translateY(-4px); border-color: rgba(245,48,3,.3) !important; box-shadow: 0 20px 40px rgba(245,48,3,.07) !important; }
    .mc-btn-red { transition: background .15s; }
    .mc-btn-red:hover { background: #d42800 !important; }
    .mc-btn-out { transition: border-color .15s, color .15s, background .15s; }
    .mc-btn-out:hover { border-color: rgba(245,48,3,.4) !important; color: #f53003 !important; background: rgba(245,48,3,.04) !important; }
`;
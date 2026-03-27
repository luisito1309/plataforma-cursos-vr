import { useRef, useCallback } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useParallaxLayer } from "@/hooks/use-edu-parallax";
import {
    EASE_IN_OUT,
    EASE,
    VIEWPORT_COPILOT,
    cardHover,
    cardHoverSubtle,
    childFadeDown,
    childFadeLeft,
    childFadeRight,
    childFadeUp,
    fadeLeft,
    fadeRight,
    fadeUp,
    rm,
    siguientePasoContainer,
    staggerParent,
    zoomIn,
} from "@/lib/edu-motion";
import { dashboard, login, register } from "@/routes";
import {
    ArrowRight,
    BookOpen,
    Box,
    Camera,
    ChevronRight,
    Clock,
    Code,
    Cpu,
    Globe,
    GraduationCap,
    LogOut,
    Music,
    Palette,
    ScanLine,
    Star,
    Users,
    Zap,
} from "lucide-react";

/** @typedef {{ id: number; titulo: string; descripcion: string; estado?: string; imagen?: string; duracion?: string; estudiantes?: number; rating?: number; categoria?: string }} Curso */
/** @typedef {{ id: number; nombre: string; icono?: string; total_cursos?: number }} Categoria */

const MINI_SHOWCASE = [
    { id: "quiz_medico", label: "Quiz médico 3D", tag: "Medicina", Icon: Zap, blurb: "Preguntas y escena 3D." },
    { id: "anatomia_humana", label: "Anatomía humana", tag: "Medicina", Icon: ScanLine, blurb: "Exploración interactiva." },
    { id: "computer_3d", label: "Computer 3D", tag: "Tecnología", Icon: Cpu, blurb: "Montaje y piezas 3D." },
    { id: "creative_box", label: "Creative Box", tag: "Creativo", Icon: Box, blurb: "Construcción voxel libre." },
];

// ─── Catálogos (entrada desde la izquierda) ──────────────────────────────────
function CatalogosSection({ cursos, linkVerCurso, cursosHref }) {
    const sectionRef = useRef(null);
    const reduce = useReducedMotion();
    const inView = useInView(sectionRef, VIEWPORT_COPILOT);
    const glowRef = useParallaxLayer(sectionRef, -28, reduce);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"],
    });
    const parallaxY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [22, -22]);

    const shell = rm(reduce, fadeLeft);
    const headStagger = rm(reduce, staggerParent(0.08, 0.1));
    const gridStagger = rm(reduce, staggerParent(0.12, 0.1));
    const gridItem = rm(reduce, childFadeLeft);

    return (
        <section
            id="cursos"
            ref={sectionRef}
            className="relative scroll-mt-24 border-t border-white/5 bg-slate-950 pt-20 md:pt-28 pb-24 md:pb-32"
        >
            {!reduce && (
                <div
                    ref={glowRef}
                    aria-hidden
                    className="pointer-events-none absolute left-[8%] top-24 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl will-change-transform md:h-56 md:w-56"
                />
            )}
            <motion.div style={{ y: parallaxY }} className="relative will-change-transform">
                <div className="mx-auto max-w-6xl px-6 md:px-10 lg:px-12">
                    <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={shell}>
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={VIEWPORT_COPILOT}
                            variants={headStagger}
                            className="mb-12 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end"
                        >
                            <motion.div variants={childFadeLeft} className="max-w-xl">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400/90">Catálogo</p>
                                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">Cursos y minijuegos</h2>
                                <p className="mt-4 text-slate-400">
                                    Actividades 3D a pantalla completa y cursos reales desde tu base de datos.
                                </p>
                            </motion.div>
                            <motion.div variants={childFadeLeft}>
                                <motion.div
                                    whileHover={reduce ? {} : { scale: 1.05, x: 3 }}
                                    whileFocus={reduce ? {} : { scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 24 }}
                                    className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
                                >
                                    <Link
                                        href={cursosHref}
                                        className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-400 hover:text-cyan-300"
                                    >
                                        Ver todos <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={VIEWPORT_COPILOT}
                        variants={gridStagger}
                        className="mb-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                    >
                        <motion.p variants={gridItem} className="col-span-full -mb-1 text-sm font-semibold uppercase tracking-wider text-slate-500">
                            Actividades 3D
                        </motion.p>
                        {MINI_SHOWCASE.map((m) => (
                            <motion.div key={m.id} variants={gridItem}>
                                <motion.div
                                    whileHover={reduce ? {} : cardHover}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ duration: 0.35, ease: EASE_IN_OUT }}
                                    className="h-full rounded-2xl outline-none focus-within:ring-2 focus-within:ring-cyan-400/40"
                                >
                                    <Link
                                        href={`/minijuego/${m.id}`}
                                        className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-sm shadow-black/20 backdrop-blur-xl transition-shadow"
                                    >
                                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/25 to-violet-600/20 text-cyan-200">
                                            <m.Icon className="h-5 w-5" strokeWidth={1.75} />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300/90">{m.tag}</span>
                                        <p className="mt-2 font-semibold text-white">{m.label}</p>
                                        <p className="mt-1 flex-1 text-sm text-slate-400">{m.blurb}</p>
                                        <span className="mt-4 text-xs font-semibold text-cyan-400/90">Pantalla completa →</span>
                                    </Link>
                                </motion.div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {cursos.length === 0 ? (
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={VIEWPORT_COPILOT}
                            variants={zoomIn}
                        >
                            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-8 py-16 text-center backdrop-blur-md">
                                <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-600" strokeWidth={1} />
                                <p className="text-base font-medium text-slate-300">Aún no hay cursos creados</p>
                                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Aparecerán aquí cuando existan en la plataforma.</p>
                                <Link href={cursosHref} className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-cyan-400">
                                    Ir al listado <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={VIEWPORT_COPILOT}
                            variants={gridStagger}
                            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            {cursos.map((curso) => (
                                <motion.article
                                    key={curso.id}
                                    variants={gridItem}
                                    whileHover={reduce ? {} : { ...cardHoverSubtle, y: -8 }}
                                    transition={{ type: "spring", stiffness: 360, damping: 24 }}
                                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl outline-none focus-within:ring-2 focus-within:ring-cyan-400/35"
                                >
                                    <div className="relative h-44 overflow-hidden bg-gradient-to-br from-cyan-950/50 to-violet-950/40">
                                        {curso.imagen ? (
                                            <img
                                                src={`/storage/${curso.imagen}`}
                                                alt={curso.titulo}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-cyan-500/15">
                                                <BookOpen className="h-16 w-16" strokeWidth={1} />
                                            </div>
                                        )}
                                        {curso.categoria && (
                                            <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                                                {curso.categoria}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col p-6">
                                        <h3 className="text-base font-semibold text-white group-hover:text-cyan-300">{curso.titulo}</h3>
                                        {curso.descripcion && <p className="mt-2 line-clamp-2 text-sm text-slate-400">{curso.descripcion}</p>}
                                        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
                                            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                                                {curso.rating != null && (
                                                    <span className="flex items-center gap-1 font-medium text-slate-200">
                                                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                        {curso.rating}
                                                    </span>
                                                )}
                                                {curso.estudiantes != null && (
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-3.5 w-3.5" />
                                                        {curso.estudiantes.toLocaleString()}
                                                    </span>
                                                )}
                                                {curso.duracion && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {curso.duracion}
                                                    </span>
                                                )}
                                            </div>
                                            <Link
                                                href={linkVerCurso(curso.id)}
                                                className="text-xs font-semibold text-cyan-400 opacity-0 transition-opacity group-hover:opacity-100"
                                            >
                                                Ver →
                                            </Link>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </section>
    );
}

// ─── Categorías (entrada desde la derecha) ───────────────────────────────────
function CategoriasSection({ categorias, getIcon }) {
    const ref = useRef(null);
    const reduce = useReducedMotion();
    const inView = useInView(ref, VIEWPORT_COPILOT);
    const driftRef = useParallaxLayer(ref, 32, reduce);

    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const layerY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [16, -16]);

    const wrap = rm(reduce, fadeRight);
    const stagger = rm(reduce, staggerParent(0.1, 0.12));

    const hoverGlow = {
        scale: 1.05,
        boxShadow: "0 24px 50px rgba(139,92,246,0.25), 0 0 36px rgba(34,211,238,0.15)",
    };

    if (!categorias.length) {
        return (
            <section id="categorias" ref={ref} className="relative scroll-mt-24 border-t border-white/5 bg-slate-900/40 py-20 md:py-24">
                {!reduce && (
                    <div
                        ref={driftRef}
                        aria-hidden
                        className="pointer-events-none right-[6%] top-20 h-36 w-36 rounded-full bg-violet-500/10 blur-3xl will-change-transform absolute"
                    />
                )}
                <motion.div style={{ y: layerY }} className="relative mx-auto max-w-6xl px-6 md:px-10 lg:px-12 will-change-transform">
                    <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={wrap} className="text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400/90">Explora</p>
                        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">Categorías</h2>
                        <p className="mx-auto mt-4 max-w-md text-sm text-slate-500">
                            Cuando haya cursos con categoría en la plataforma, aparecerán aquí.
                        </p>
                    </motion.div>
                </motion.div>
            </section>
        );
    }

    return (
        <section id="categorias" ref={ref} className="relative scroll-mt-24 border-t border-white/5 bg-slate-900/40 py-24 md:py-28">
            {!reduce && (
                <div
                    ref={driftRef}
                    aria-hidden
                    className="pointer-events-none absolute right-[8%] top-24 h-44 w-44 rounded-full bg-violet-500/12 blur-3xl will-change-transform md:h-60 md:w-60"
                />
            )}
            <motion.div style={{ y: layerY }} className="relative mx-auto max-w-6xl px-6 md:px-10 lg:px-12 will-change-transform">
                <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={wrap} className="w-full">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={VIEWPORT_COPILOT}
                        variants={stagger}
                        className="mx-auto mb-14 max-w-2xl text-center md:mb-20"
                    >
                        <motion.div variants={childFadeRight}>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400/90">Explora</p>
                        </motion.div>
                        <motion.h2 variants={childFadeRight} className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                            Categorías
                        </motion.h2>
                        <motion.p variants={childFadeRight} className="mt-4 text-sm leading-relaxed text-slate-400 md:text-base">
                            Accesos rápidos al catálogo.
                        </motion.p>
                    </motion.div>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={VIEWPORT_COPILOT}
                        variants={stagger}
                        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
                    >
                        {categorias.map((cat) => (
                            <motion.div
                                key={cat.id}
                                variants={childFadeRight}
                                whileHover={reduce ? {} : hoverGlow}
                                whileTap={{ scale: 0.98 }}
                                transition={{ duration: 0.32, ease: EASE_IN_OUT }}
                                className="rounded-2xl outline-none focus-within:ring-2 focus-within:ring-violet-400/45"
                            >
                                <Link
                                    href="/cursos"
                                    className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center shadow-sm shadow-black/10 backdrop-blur-xl transition-colors hover:border-cyan-500/30"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">{getIcon(cat.icono)}</div>
                                    <p className="text-sm font-semibold text-white">{cat.nombre}</p>
                                    {cat.total_cursos != null && <p className="text-xs text-slate-500">{cat.total_cursos} cursos</p>}
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </motion.div>
        </section>
    );
}

// ─── Vista previa + progreso (desde abajo) ──────────────────────────────────
function VistaPreviaSection() {
    const ref = useRef(null);
    const reduce = useReducedMotion();
    const inView = useInView(ref, VIEWPORT_COPILOT);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const floatY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [18, -18]);
    const innerFloat = useParallaxLayer(ref, -20, reduce);

    const shell = rm(reduce, fadeUp);
    const stagger = rm(reduce, staggerParent(0.14, 0.14));

    return (
        <section id="vista-previa" ref={ref} className="relative scroll-mt-24 border-t border-white/5 bg-slate-950 px-6 py-20 md:px-10 md:py-28">
            {!reduce && (
                <div
                    ref={innerFloat}
                    aria-hidden
                    className="pointer-events-none absolute bottom-1/4 left-1/4 h-32 w-32 rounded-3xl border border-cyan-500/10 bg-cyan-500/5 will-change-transform md:h-40 md:w-40"
                />
            )}
            <motion.div style={{ y: floatY }} className="relative mx-auto max-w-5xl will-change-transform">
                <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={shell} className="w-full">
                    <motion.div
                        whileHover={reduce ? {} : { y: -6, transition: { duration: 0.4, ease: EASE_IN_OUT } }}
                        style={{ perspective: 1200 }}
                        className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-transparent p-[1px] shadow-2xl shadow-black/50 backdrop-blur-xl outline-none focus-within:ring-2 focus-within:ring-cyan-400/30"
                    >
                        <div className="overflow-hidden rounded-[22px] border border-white/5 bg-slate-950/80">
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={VIEWPORT_COPILOT}
                                variants={stagger}
                                className="flex flex-col"
                            >
                                <motion.div
                                    variants={childFadeUp}
                                    className="flex items-center gap-2 border-b border-white/5 bg-white/[0.03] px-4 py-3"
                                >
                                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                                    <span className="ml-3 text-xs font-medium text-slate-500">vista previa · progreso</span>
                                </motion.div>
                                <motion.div variants={childFadeUp} className="border-b border-white/5 px-4 py-3 md:px-6">
                                    <div className="mb-2 flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-slate-500">
                                        <span>Progreso del recorrido</span>
                                        <span className="text-cyan-400/90">72%</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                                        <motion.div
                                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
                                            initial={{ width: 0, opacity: 0.6 }}
                                            animate={inView ? { width: "72%", opacity: 1 } : { width: 0, opacity: 0.6 }}
                                            transition={{ duration: 1, ease: EASE_IN_OUT, delay: 0.28 }}
                                        />
                                    </div>
                                </motion.div>
                                <motion.div variants={stagger} className="grid gap-6 p-8 md:grid-cols-3 md:p-10">
                                    {[
                                        { k: "Módulos", v: "12", sub: "organizados" },
                                        { k: "VR / 3D", v: "4+", sub: "experiencias" },
                                        { k: "Ritmo", v: "Tú", sub: "a tu paso" },
                                    ].map((x) => (
                                        <motion.div
                                            key={x.k}
                                            variants={childFadeUp}
                                            whileHover={reduce ? {} : { scale: 1.05, boxShadow: "0 0 40px rgba(34,211,238,0.12)" }}
                                            transition={{ duration: 0.32, ease: EASE_IN_OUT }}
                                            className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md"
                                        >
                                            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400/80">{x.k}</p>
                                            <p className="mt-2 font-mono text-3xl font-light text-white">{x.v}</p>
                                            <p className="mt-1 text-sm text-slate-500">{x.sub}</p>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </section>
    );
}

// ─── Siguiente paso (desde arriba) ───────────────────────────────────────────
function SiguientePasoSection({ destino, auth }) {
    const ref = useRef(null);
    const reduce = useReducedMotion();
    const inView = useInView(ref, VIEWPORT_COPILOT);
    const shroudRef = useParallaxLayer(ref, 24, reduce);

    const v = rm(reduce, siguientePasoContainer);

    return (
        <section ref={ref} className="relative overflow-hidden border-t border-white/5 bg-gradient-to-b from-slate-950 via-violet-950/20 to-slate-950 py-24 md:py-28">
            {!reduce && (
                <>
                    <div
                        ref={shroudRef}
                        aria-hidden
                        className="pointer-events-none absolute left-[12%] top-[18%] h-24 w-24 rounded-2xl border border-cyan-500/15 bg-cyan-500/5 blur-[1px] will-change-transform"
                    />
                    <motion.div
                        aria-hidden
                        className="pointer-events-none absolute -left-8 top-16 h-20 w-20 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 blur-[1px] will-change-transform"
                        animate={inView ? { y: [0, -10, 0], rotate: [0, 6, 0] } : {}}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        aria-hidden
                        className="pointer-events-none absolute bottom-12 right-10 h-14 w-14 rounded-full border border-violet-500/25 bg-violet-500/10 will-change-transform"
                        animate={inView ? { y: [0, 12, 0], x: [0, -8, 0] } : {}}
                        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    />
                </>
            )}
            <div className="relative mx-auto max-w-3xl px-6 text-center md:px-10">
                <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={v}>
                    <motion.h2 variants={childFadeDown} className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                        Siguiente paso,{" "}
                        <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">sin fricción</span>
                    </motion.h2>
                    <motion.p variants={childFadeDown} className="mx-auto mt-6 max-w-md text-slate-400">
                        Una transición clara hacia tu siguiente sesión de aprendizaje.
                    </motion.p>
                    <motion.div variants={zoomIn} className="mt-10 flex justify-center">
                        <motion.div
                            animate={
                                reduce || !inView
                                    ? {}
                                    : { boxShadow: ["0 0 28px rgba(34,211,238,0.22)", "0 0 46px rgba(139,92,246,0.32)", "0 0 28px rgba(34,211,238,0.22)"] }
                            }
                            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                            className="rounded-2xl bg-gradient-to-r from-cyan-400/50 to-violet-500/50 p-[1px]"
                        >
                            <motion.div
                                whileHover={reduce ? {} : { scale: 1.05 }}
                                whileFocus={reduce ? {} : { scale: 1.03 }}
                                whileTap={{ scale: 0.96 }}
                                transition={{ type: "spring", stiffness: 420, damping: 22 }}
                                className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                            >
                                <Link
                                    href={destino}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-10 py-4 text-sm font-semibold text-slate-950 shadow-inner"
                                >
                                    {auth?.user ? "Continuar" : "Crear experiencia"}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}

// ─── Nav & layout ────────────────────────────────────────────────────────────
function HomeNav({ auth, role, canRegister, onLogout }) {
    return (
        <motion.header
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/75 backdrop-blur-2xl"
        >
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
                <Link href="/" className="flex items-center gap-2.5">
                    <motion.div
                        whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.5 } }}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 text-slate-950 shadow-lg shadow-cyan-500/20"
                    >
                        <GraduationCap className="h-4 w-4" strokeWidth={2} />
                    </motion.div>
                    <span className="text-sm font-semibold tracking-tight text-white">EduPlatform</span>
                </Link>
                <nav className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
                    {auth?.user && role === "admin" && (
                        <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                            <Link href={dashboard()} className="rounded-xl px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10">
                                Dashboard
                            </Link>
                        </motion.span>
                    )}
                    {auth?.user && role === "docente" && (
                        <>
                            <Link href="/cursos" className="rounded-xl px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10">
                                Mis cursos
                            </Link>
                            <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={onLogout} className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-200">
                                <LogOut className="h-3.5 w-3.5" />
                                Salir
                            </motion.button>
                        </>
                    )}
                    {auth?.user && role === "estudiante" && (
                        <>
                            <Link href="/cursos" className="rounded-xl px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10">
                                Cursos
                            </Link>
                            <Link href="/mis-cursos" className="rounded-xl px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10">
                                Mis cursos
                            </Link>
                            <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={onLogout} className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-200">
                                <LogOut className="h-3.5 w-3.5" />
                                Salir
                            </motion.button>
                        </>
                    )}
                    {!auth?.user && (
                        <>
                            <Link href={login()} className="rounded-xl px-3 py-2 text-sm text-slate-400 hover:text-white">
                                Iniciar sesión
                            </Link>
                            {canRegister && (
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                                    <Link href={register()} className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-500/25">
                                        Registrarse
                                    </Link>
                                </motion.div>
                            )}
                        </>
                    )}
                </nav>
            </div>
        </motion.header>
    );
}

export default function Home({ canRegister = true, cursosDestacados = [], categorias = [] }) {
    const { auth } = usePage().props;
    const role = auth?.user?.role ?? null;
    const cursos = cursosDestacados ?? [];
    const cats = categorias ?? [];
    const destino = auth?.user ? (role === "admin" ? dashboard() : "/cursos") : canRegister ? register() : login();
    const linkVerCurso = (cid) => (auth?.user ? `/curso/${cid}` : login());
    const handleLogout = () => router.post("/logout");

    const getIcon = useCallback((icono) => {
        const cls = "h-5 w-5";
        switch (icono) {
            case "code":
                return <Code className={cls} />;
            case "palette":
                return <Palette className={cls} />;
            case "camera":
                return <Camera className={cls} />;
            case "music":
                return <Music className={cls} />;
            case "globe":
                return <Globe className={cls} />;
            case "zap":
                return <Zap className={cls} />;
            default:
                return <BookOpen className={cls} />;
        }
    }, []);

    return (
        <div
            className="dark min-h-screen scroll-smooth bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500/30"
            style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Instrument Sans', sans-serif" }}
        >
            <HomeNav auth={auth} role={role} canRegister={canRegister} onLogout={handleLogout} />
            <main>
                <CatalogosSection cursos={cursos} linkVerCurso={linkVerCurso} cursosHref="/cursos" />
                <CategoriasSection categorias={cats} getIcon={getIcon} />
                <VistaPreviaSection />
                <SiguientePasoSection destino={destino} auth={auth} />
            </main>
            <motion.footer initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.15 }} className="border-t border-white/5 py-8">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-500 md:flex-row md:px-10">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 text-slate-950">
                            <GraduationCap className="h-3.5 w-3.5" />
                        </div>
                        EduPlatform © {new Date().getFullYear()}
                    </div>
                    <p className="text-xs text-slate-600">Motion + glass · framer-motion</p>
                </div>
            </motion.footer>
        </div>
    );
}

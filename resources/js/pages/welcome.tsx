import { Head, Link, usePage, router } from '@inertiajs/react';
import { LocalStorageAuthSync } from '@/components/LocalStorageAuthSync';
import { dashboard, home, login, register } from '@/routes';
import type { UserRole } from '@/types/auth';
import {
    BookOpen, ArrowRight, Star, Users, Clock,
    ChevronRight, Zap, Globe, Code, Palette,
    Music, Camera, GraduationCap, Play, LogOut,
} from 'lucide-react';

type Curso = {
    id: number;
    titulo: string;
    descripcion: string;
    estado?: string;
    imagen?: string;
    instructor?: string;
    duracion?: string;
    estudiantes?: number;
    rating?: number;
    categoria?: string;
};

type Categoria = {
    id: number;
    nombre: string;
    icono?: string;
    total_cursos?: number;
};

export default function Welcome({
    canRegister = true,
    cursosDestacados = [],
    categorias = [],
}: {
    canRegister?: boolean;
    cursosDestacados?: Curso[];
    categorias?: Categoria[];
}) {
    const { auth } = usePage().props;
    const role = (auth?.user as { role?: UserRole } | null)?.role;

    // ── Logout ──────────────────────────────────────────────────────────────
    const handleLogout = () => {
        router.post('/logout');
    };

    // ── Fallback de cursos ───────────────────────────────────────────────────
    const cursos: Curso[] = cursosDestacados.length > 0 ? cursosDestacados : [
        {
            id: 1,
            titulo: 'Desarrollo Web Completo',
            descripcion: 'Aprende HTML, CSS, JavaScript y más desde cero hasta nivel avanzado.',
            rating: 4.8, estudiantes: 1240, duracion: '42h', categoria: 'Tecnología',
        },
        {
            id: 2,
            titulo: 'Diseño UI/UX Moderno',
            descripcion: 'Domina Figma y los principios del diseño centrado en el usuario.',
            rating: 4.9, estudiantes: 890, duracion: '28h', categoria: 'Diseño',
        },
        {
            id: 3,
            titulo: 'Python para Data Science',
            descripcion: 'Análisis de datos, visualización y machine learning con Python.',
            rating: 4.7, estudiantes: 2100, duracion: '55h', categoria: 'Datos',
        },
    ];

    const cats: Categoria[] = categorias.length > 0 ? categorias : [
        { id: 1, nombre: 'Tecnología', icono: 'code', total_cursos: 48 },
        { id: 2, nombre: 'Diseño', icono: 'palette', total_cursos: 32 },
        { id: 3, nombre: 'Fotografía', icono: 'camera', total_cursos: 21 },
        { id: 4, nombre: 'Música', icono: 'music', total_cursos: 17 },
        { id: 5, nombre: 'Idiomas', icono: 'globe', total_cursos: 29 },
        { id: 6, nombre: 'Marketing', icono: 'zap', total_cursos: 14 },
    ];

    const getIcon = (icono?: string) => {
        const cls = 'h-5 w-5';
        switch (icono) {
            case 'code': return <Code className={cls} />;
            case 'palette': return <Palette className={cls} />;
            case 'camera': return <Camera className={cls} />;
            case 'music': return <Music className={cls} />;
            case 'globe': return <Globe className={cls} />;
            case 'zap': return <Zap className={cls} />;
            default: return <BookOpen className={cls} />;
        }
    };

    // ── Destino del CTA hero según rol ──────────────────────────────────────
    const destino = auth?.user
        ? (role === 'admin' ? dashboard() : '/cursos')
        : (canRegister ? register() : login());

    // ── Link "Ver curso" en cards ────────────────────────────────────────────
    const linkVerCurso = (id: number) =>
        auth?.user ? `/curso/${id}` : login();

    return (
        <>
            <LocalStorageAuthSync user={auth?.user ?? undefined} />
            <Head title="Bienvenido">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=playfair-display:700,800,900|instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <div
                className="min-h-screen bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                style={{ fontFamily: "'Instrument Sans', sans-serif" }}
            >

                {/* ════════════════════════════════════════════════════════════
                    NAV
                ════════════════════════════════════════════════════════════ */}
                <header className="sticky top-0 z-50 border-b border-[#e3e3e0]/70 bg-[#FDFDFC]/90 backdrop-blur-sm dark:border-[#2a2a26]/70 dark:bg-[#0a0a0a]/90">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

                        {/* Logo */}
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f53003]">
                                <GraduationCap className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-base font-semibold tracking-tight">EduPlatform</span>
                        </div>

                        {/* Links */}
                        <nav className="flex items-center gap-2">

                            {/* ── ADMIN ── */}
                            {auth?.user && role === 'admin' && (
                                <Link
                                    href={dashboard()}
                                    className="rounded-md border border-[#19140035] px-5 py-1.5 text-sm text-[#1b1b18] transition-colors hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    Dashboard
                                </Link>
                            )}

                            {/* ── DOCENTE ── */}
                            {auth?.user && role === 'docente' && (
                                <>
                                    {/* Cursos → Cursos.tsx  (/cursos) */}
                                    <Link
                                        href="/cursos"
                                        className="rounded-md border border-[#19140035] px-4 py-1.5 text-sm text-[#1b1b18] transition-colors hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                    >
                                        Mis cursos
                                    </Link>
                                    {/* Cerrar sesión */}
                                    <button
                                        onClick={handleLogout}
                                        className="inline-flex items-center gap-1.5 rounded-md border border-[#f53003]/30 bg-[#f53003]/5 px-4 py-1.5 text-sm font-medium text-[#f53003] transition-colors hover:bg-[#f53003]/10"
                                    >
                                        <LogOut className="h-3.5 w-3.5" />
                                        Cerrar sesión
                                    </button>
                                </>
                            )}

                            {/* ── ESTUDIANTE ── */}
                            {auth?.user && role === 'estudiante' && (
                                <>
                                    {/* Cursos.tsx  (/cursos) */}
                                    <Link
                                        href="/cursos"
                                        className="rounded-md border border-[#19140035] px-4 py-1.5 text-sm text-[#1b1b18] transition-colors hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                    >
                                        Cursos
                                    </Link>
                                    {/* MisCursos.tsx  (/mis-cursos) */}
                                    <Link
                                        href="/mis-cursos"
                                        className="rounded-md border border-[#19140035] px-4 py-1.5 text-sm text-[#1b1b18] transition-colors hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                    >
                                        Mis cursos
                                    </Link>
                                    {/* Cerrar sesión */}
                                    <button
                                        onClick={handleLogout}
                                        className="inline-flex items-center gap-1.5 rounded-md border border-[#f53003]/30 bg-[#f53003]/5 px-4 py-1.5 text-sm font-medium text-[#f53003] transition-colors hover:bg-[#f53003]/10"
                                    >
                                        <LogOut className="h-3.5 w-3.5" />
                                        Cerrar sesión
                                    </button>
                                </>
                            )}

                            {/* ── NO AUTENTICADO ── */}
                            {!auth?.user && (
                                <>
                                    <Link
                                        href={login()}
                                        className="px-4 py-1.5 text-sm text-[#706f6c] transition-colors hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                                    >
                                        Iniciar sesión
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="rounded-md bg-[#f53003] px-5 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                                        >
                                            Registrarse
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* ════════════════════════════════════════════════════════════
                    HERO
                ════════════════════════════════════════════════════════════ */}
                <section className="relative overflow-hidden">
                    {/* Blobs */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -top-40 -right-40 h-[560px] w-[560px] rounded-full bg-[#f53003]/5 blur-3xl dark:bg-[#f53003]/8" />
                        <div className="absolute bottom-0 -left-20 h-[320px] w-[320px] rounded-full bg-[#F8B803]/6 blur-3xl dark:bg-[#F8B803]/10" />
                    </div>

                    <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 lg:pb-32 lg:pt-36">
                        <div className="grid items-center gap-14 lg:grid-cols-2">

                            {/* Texto */}
                            <div>
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#f53003]/25 bg-[#f53003]/6 px-4 py-1.5 text-sm font-medium text-[#f53003]">
                                    <Zap className="h-3.5 w-3.5" />
                                    +200 cursos disponibles
                                </div>

                                <h1
                                    className="mb-5 text-5xl font-black leading-[1.08] tracking-tight lg:text-6xl"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                    Aprende sin{' '}
                                    <span className="relative inline-block text-[#f53003]">
                                        límites
                                        <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 180 10" fill="none">
                                            <path d="M2 8 Q90 2 178 8" stroke="#f53003" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
                                        </svg>
                                    </span>
                                    {' '}con los mejores
                                </h1>

                                <p className="mb-8 max-w-md text-lg leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                                    Accede a cursos de alta calidad impartidos por expertos. Aprende a tu ritmo,
                                    obtén certificaciones y transforma tu carrera profesional.
                                </p>

                                <div className="flex flex-wrap items-center gap-3">
                                    <Link
                                        href={destino}
                                        className="group inline-flex items-center gap-2 rounded-lg bg-[#f53003] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-[#f53003]/20 transition-all hover:bg-[#d42800] hover:shadow-[#f53003]/30 hover:shadow-xl"
                                    >
                                        {auth?.user ? 'Ir a mis cursos' : 'Empieza gratis'}
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                    <a
                                        href="#cursos"
                                        className="inline-flex items-center gap-2 rounded-lg border border-[#e3e3e0] px-7 py-3 text-sm font-medium text-[#1b1b18] transition-colors hover:border-[#1b1b18]/40 dark:border-[#2a2a26] dark:text-[#EDEDEC] dark:hover:border-[#4a4a44]"
                                    >
                                        <Play className="h-3.5 w-3.5" />
                                        Ver cursos
                                    </a>
                                </div>

                                {/* Stats */}
                                <div className="mt-12 flex flex-wrap gap-8 border-t border-[#e3e3e0]/60 pt-8 dark:border-[#2a2a26]/60">
                                    {[
                                        { value: '12K+', label: 'Estudiantes' },
                                        { value: '200+', label: 'Cursos' },
                                        { value: '98%', label: 'Satisfacción' },
                                    ].map((s) => (
                                        <div key={s.label}>
                                            <p className="text-2xl font-black" style={{ fontFamily: "'Playfair Display', serif" }}>
                                                {s.value}
                                            </p>
                                            <p className="mt-0.5 text-xs text-[#706f6c] dark:text-[#A1A09A]">{s.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Card decorativa hero (desktop) */}
                            <div className="hidden lg:block">
                                <div className="relative">
                                    <div className="overflow-hidden rounded-2xl border border-[#e3e3e0] bg-white shadow-2xl shadow-black/8 dark:border-[#2a2a26] dark:bg-[#111110]">
                                        <div className="h-1.5 w-full bg-gradient-to-r from-[#f53003] via-[#F8B803] to-[#f53003]/40" />
                                        <div className="p-6">
                                            <div className="mb-4 flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f53003]/10">
                                                    <BookOpen className="h-5 w-5 text-[#f53003]" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold">Desarrollo Web Completo</p>
                                                    <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">42h · 3 módulos</p>
                                                </div>
                                            </div>
                                            <div className="mb-2 flex items-center justify-between text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                                <span>Progreso del curso</span>
                                                <span className="font-semibold text-[#f53003]">68%</span>
                                            </div>
                                            <div className="mb-5 h-2 overflow-hidden rounded-full bg-[#f53003]/10">
                                                <div className="h-full w-[68%] rounded-full bg-[#f53003]" />
                                            </div>
                                            {['HTML & CSS', 'JavaScript ES6+', 'React Avanzado'].map((m, i) => (
                                                <div key={m} className="flex items-center gap-3 border-t border-[#e3e3e0]/60 py-2.5 text-sm dark:border-[#2a2a26]/60">
                                                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i < 2 ? 'bg-[#f53003] text-white' : 'border border-[#e3e3e0] text-[#706f6c] dark:border-[#3E3E3A]'
                                                        }`}>
                                                        {i < 2 ? '✓' : i + 1}
                                                    </div>
                                                    <span className={i < 2 ? 'text-[#706f6c] line-through dark:text-[#A1A09A]' : ''}>{m}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="absolute -top-4 -right-4 flex items-center gap-1.5 rounded-xl border border-[#e3e3e0] bg-white px-4 py-2.5 shadow-lg dark:border-[#2a2a26] dark:bg-[#111110]">
                                        <Star className="h-4 w-4 fill-[#F8B803] text-[#F8B803]" />
                                        <span className="text-sm font-bold">4.9</span>
                                        <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">rating</span>
                                    </div>
                                    <div className="absolute -bottom-4 -left-4 flex items-center gap-1.5 rounded-xl border border-[#e3e3e0] bg-white px-4 py-2.5 shadow-lg dark:border-[#2a2a26] dark:bg-[#111110]">
                                        <Users className="h-4 w-4 text-[#f53003]" />
                                        <span className="text-sm font-bold">12K</span>
                                        <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">estudiantes</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════════════════════
                    CURSOS DESTACADOS  →  cards enlazan a VerCurso (/curso/:id)
                ════════════════════════════════════════════════════════════ */}
                <section id="cursos" className="border-t border-[#e3e3e0]/60 bg-white py-20 dark:border-[#2a2a26]/60 dark:bg-[#0d0d0c]">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="mb-10 flex items-end justify-between">
                            <div>
                                <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-[#f53003]">Destacados</p>
                                <h2
                                    className="text-3xl font-black tracking-tight lg:text-4xl"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                    Cursos más populares
                                </h2>
                            </div>
                            {/* "Ver todos" → Cursos.tsx */}
                            <Link
                                href="/cursos"
                                className="hidden items-center gap-1 text-sm font-medium text-[#706f6c] transition-colors hover:text-[#f53003] dark:text-[#A1A09A] sm:flex"
                            >
                                Ver todos <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {cursos.map((curso, i) => (
                                <article
                                    key={curso.id}
                                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#e3e3e0] bg-[#FDFDFC] transition-all duration-200 hover:-translate-y-1 hover:border-[#f53003]/30 hover:shadow-xl hover:shadow-[#f53003]/6 dark:border-[#2a2a26] dark:bg-[#111110]"
                                >
                                    {/* Imagen */}
                                    <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#fff2f2] to-[#fef9ee] dark:from-[#1D0002] dark:to-[#161200]">
                                        {curso.imagen ? (
                                            <img
                                                src={`/storage/${curso.imagen}`}
                                                alt={curso.titulo}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <BookOpen className="h-14 w-14 text-[#f53003]/15" />
                                            </div>
                                        )}
                                        <span
                                            className="absolute right-3 bottom-2 select-none text-5xl font-black text-[#f53003]/8"
                                            style={{ fontFamily: "'Playfair Display', serif" }}
                                        >
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        {curso.categoria && (
                                            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-[#1b1b18] backdrop-blur-sm dark:bg-black/60 dark:text-[#EDEDEC]">
                                                {curso.categoria}
                                            </span>
                                        )}
                                        {curso.estado && (
                                            <span className="absolute right-3 top-3 rounded-full bg-[#0a1f16]/90 px-2.5 py-1 text-xs font-medium text-[#4caf7d] backdrop-blur-sm">
                                                {curso.estado}
                                            </span>
                                        )}
                                    </div>

                                    {/* Contenido */}
                                    <div className="flex flex-1 flex-col p-5">
                                        <h3 className="mb-1.5 text-[15px] font-semibold leading-snug transition-colors group-hover:text-[#f53003]">
                                            {curso.titulo}
                                        </h3>
                                        {curso.descripcion && (
                                            <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                                                {curso.descripcion}
                                            </p>
                                        )}

                                        {/* Meta + CTA */}
                                        <div className="mt-auto flex items-center justify-between border-t border-[#e3e3e0]/60 pt-4 dark:border-[#2a2a26]/60">
                                            <div className="flex items-center gap-3 text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                                {curso.rating && (
                                                    <span className="flex items-center gap-1 font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                                        <Star className="h-3.5 w-3.5 fill-[#F8B803] text-[#F8B803]" />
                                                        {curso.rating}
                                                    </span>
                                                )}
                                                {curso.estudiantes && (
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
                                            {/* VerCurso.tsx  →  /curso/:id */}
                                            <Link
                                                href={linkVerCurso(curso.id)}
                                                className="text-xs font-semibold text-[#f53003] opacity-0 transition-opacity group-hover:opacity-100"
                                            >
                                                Ver →
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Móvil: ver todos → Cursos.tsx */}
                        <div className="mt-8 flex justify-center sm:hidden">
                            <Link
                                href="/cursos"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#e3e3e0] px-5 py-2.5 text-sm font-medium dark:border-[#2a2a26]"
                            >
                                Ver todos los cursos <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════════════════════
                    CATEGORÍAS  →  enlazan a Cursos.tsx con filtro
                ════════════════════════════════════════════════════════════ */}
                <section className="py-20">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="mb-10 text-center">
                            <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-[#f53003]">Explora</p>
                            <h2
                                className="text-3xl font-black tracking-tight lg:text-4xl"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                Todas las categorías
                            </h2>
                            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                                Encuentra el área que más te apasiona y comienza a aprender hoy mismo.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                            {cats.map((cat) => (
                                /* Cada categoría va a /cursos (Cursos.tsx) */
                                <Link
                                    key={cat.id}
                                    href="/cursos"
                                    className="group flex flex-col items-center gap-3 rounded-2xl border border-[#e3e3e0] bg-white p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:border-[#f53003]/35 hover:shadow-lg hover:shadow-[#f53003]/5 dark:border-[#2a2a26] dark:bg-[#0d0d0c]"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f53003]/8 text-[#f53003] transition-all duration-200 group-hover:bg-[#f53003] group-hover:text-white dark:bg-[#f53003]/12">
                                        {getIcon(cat.icono)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold leading-tight">{cat.nombre}</p>
                                        {cat.total_cursos !== undefined && (
                                            <p className="mt-0.5 text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                                {cat.total_cursos} cursos
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════════════════════
                    CTA FINAL
                ════════════════════════════════════════════════════════════ */}
                <section className="border-t border-[#e3e3e0]/60 bg-white py-20 dark:border-[#2a2a26]/60 dark:bg-[#0d0d0c]">
                    <div className="mx-auto max-w-2xl px-6 text-center">
                        <h2
                            className="mb-4 text-3xl font-black tracking-tight lg:text-5xl"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            ¿Listo para empezar tu{' '}
                            <span className="text-[#f53003]">camino?</span>
                        </h2>
                        <p className="mb-8 text-[#706f6c] dark:text-[#A1A09A]">
                            Únete a miles de estudiantes que ya están transformando su carrera.
                        </p>
                        <Link
                            href={destino}
                            className="group inline-flex items-center gap-2 rounded-xl bg-[#f53003] px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-[#f53003]/20 transition-all hover:bg-[#d42800] hover:shadow-2xl hover:shadow-[#f53003]/30"
                        >
                            {auth?.user ? 'Ir a mis cursos' : 'Crear cuenta gratis'}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </section>

                {/* ════════════════════════════════════════════════════════════
                    FOOTER
                ════════════════════════════════════════════════════════════ */}
                <footer className="border-t border-[#e3e3e0]/60 py-6 dark:border-[#2a2a26]/60">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
                        <div className="flex items-center gap-2 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            <div className="flex h-5 w-5 items-center justify-center rounded bg-[#f53003]">
                                <GraduationCap className="h-3 w-3 text-white" />
                            </div>
                            EduPlatform © {new Date().getFullYear()}
                        </div>
                        <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Hecho con ♥ para aprender</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
import { Head, Link, usePage } from '@inertiajs/react';

export default function Home() {
    const { auth } = usePage().props as { auth?: { user?: { name?: string } } };

    return (
        <>
            <Head title="Inicio">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>
            <div className="min-h-screen bg-[#0c0c0f] text-white antialiased">
                {/* Fondo con gradiente y grid sutil */}
                <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,#1e1b4b40,#0c0c0f)]" />
                <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#1f293722_1px,transparent_1px),linear-gradient(to_bottom,#1f293722_1px,transparent_1px)] bg-[size:4rem_4rem]" />

                {/* Navegación */}
                <header className="border-b border-white/5 backdrop-blur-sm">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v-2.5M14 7v2.5M3 21V7a2 2 0 012-2h2M7 21V7a2 2 0 012-2h2m4 0a2 2 0 012 2v14M7 7h2m4 0h2M7 7v14m0-14v14" />
                                </svg>
                            </span>
                            WebVR
                        </Link>
                        <nav className="flex items-center gap-3">
                            <Link
                                href="/cursos"
                                className="rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white"
                            >
                                Cursos
                            </Link>
                            {auth?.user ? (
                                <>
                                    <Link
                                        href="/mis-cursos"
                                        className="rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white"
                                    >
                                        Mis cursos
                                    </Link>
                                    <Link
                                        href="/dashboard"
                                        className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500"
                                    >
                                        Dashboard
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white"
                                    >
                                        Iniciar sesión
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500"
                                    >
                                        Registrarse
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero */}
                <main className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="mb-4 text-sm font-medium uppercase tracking-wider text-violet-400">
                            Entornos Inmersivos
                        </p>
                        <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                            Aprende en experiencias
                            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent"> inmersivas</span>
                        </h1>
                        <p className="mb-10 text-lg text-white/70 sm:text-xl">
                            Cursos con realidad virtual y contenidos interactivos. Vive el aprendizaje de otra forma.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href="/cursos"
                                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500"
                            >
                                Ver todos los cursos
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                            {auth?.user && (
                                <Link
                                    href="/mis-cursos"
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
                                >
                                    Mis cursos
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Tarjetas de características */}
                    <div className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                title: 'Contenido inmersivo',
                                description: 'Videos y experiencias VR integradas en cada módulo para un aprendizaje más profundo.',
                                icon: (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                ),
                            },
                            {
                                title: 'Cursos estructurados',
                                description: 'Módulos y lecciones organizados para que avances a tu ritmo.',
                                icon: (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                ),
                            },
                            {
                                title: 'Acceso desde cualquier dispositivo',
                                description: 'WebVR funciona en navegador: sin instalaciones, desde PC o móvil.',
                                icon: (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                ),
                            },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:border-violet-500/30 hover:bg-white/10"
                            >
                                <div className="mb-4 inline-flex rounded-xl bg-violet-500/20 p-3 text-violet-400 transition group-hover:bg-violet-500/30">
                                    {item.icon}
                                </div>
                                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                                <p className="text-sm leading-relaxed text-white/60">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-white/5 py-8">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <p className="text-sm text-white/50">
                                © {new Date().getFullYear()} WebVR · Entornos Inmersivos
                            </p>
                            <div className="flex gap-6">
                                <Link href="/cursos" className="text-sm text-white/50 transition hover:text-white/80">
                                    Cursos
                                </Link>
                                {auth?.user ? (
                                    <Link href="/mis-cursos" className="text-sm text-white/50 transition hover:text-white/80">
                                        Mis cursos
                                    </Link>
                                ) : (
                                    <Link href="/login" className="text-sm text-white/50 transition hover:text-white/80">
                                        Iniciar sesión
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

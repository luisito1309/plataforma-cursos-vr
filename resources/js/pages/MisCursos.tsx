import React, { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { BookOpen, BookMarked, Home, ArrowLeft, Play, ChevronRight } from 'lucide-react';
import EduPageShell, { EduHeroBlobs, eduNavOutline, eduNavPrimary } from '@/components/EduPageShell';

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
        cargar();
    }, []);

    const cargar = () =>
        axios
            .get('/api/mis-cursos')
            .then((r) => setCursos(r.data))
            .catch((e) => console.error('Error cargando mis cursos:', e))
            .finally(() => setLoading(false));

    if (loading) {
        return (
            <EduPageShell
                title="Mis cursos"
                navRight={
                    <Link href="/" className={eduNavOutline}>
                        <Home className="h-3.5 w-3.5" /> Home
                    </Link>
                }
            >
                <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6">
                    <div
                        className="h-10 w-10 animate-spin rounded-full border-2 border-[#e3e3e0] border-t-[#f53003] dark:border-[#2a2a26]"
                        aria-hidden
                    />
                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Cargando tus cursos…</p>
                </div>
            </EduPageShell>
        );
    }

    return (
        <EduPageShell
            title="Mis cursos — EduPlatform"
            navRight={
                <>
                    <Link href="/" className={eduNavOutline}>
                        <Home className="h-3.5 w-3.5" /> Home
                    </Link>
                    <Link href="/cursos" className={eduNavOutline}>
                        <ArrowLeft className="h-3.5 w-3.5" /> Explorar cursos
                    </Link>
                </>
            }
        >
            {/* Hero */}
            <section className="relative overflow-hidden border-b border-[#e3e3e0]/60 dark:border-[#2a2a26]/60">
                <EduHeroBlobs />
                <div className="relative mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6 px-6 pb-10 pt-14 lg:pt-16">
                    <div className="max-w-xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f53003]/25 bg-[#f53003]/6 px-4 py-1.5 text-sm font-medium text-[#f53003]">
                            <BookMarked className="h-3.5 w-3.5" /> Mi aprendizaje
                        </div>
                        <h1
                            className="mb-3 text-4xl font-black leading-[1.1] tracking-tight text-[#1b1b18] dark:text-[#EDEDEC] lg:text-5xl"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Mis cursos
                        </h1>
                        <p className="text-lg leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                            Continúa donde lo dejaste.
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
                            {cursos.length === 1 ? 'curso inscrito' : 'cursos inscritos'}
                        </span>
                    </div>
                </div>
            </section>

            <section className="border-t border-[#e3e3e0]/60 bg-white py-12 dark:border-[#2a2a26]/60 dark:bg-[#0d0d0c]">
                <div className="mx-auto max-w-6xl px-6 pb-16">
                    {cursos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#f53003]/8 dark:bg-[#f53003]/12">
                                <BookOpen className="h-9 w-9 text-[#f53003]/35" />
                            </div>
                            <div>
                                <p
                                    className="mb-2 text-xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                    Aún no estás inscrito en ningún curso
                                </p>
                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                    Explora el catálogo y comienza tu aprendizaje en VR.
                                </p>
                            </div>
                            <Link href="/cursos" className={eduNavPrimary}>
                                Ver cursos disponibles <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {cursos.map((curso, i) => (
                                <article
                                    key={curso.id}
                                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#e3e3e0] bg-[#FDFDFC] transition-all duration-200 hover:-translate-y-1 hover:border-[#f53003]/30 hover:shadow-xl hover:shadow-[#f53003]/6 dark:border-[#2a2a26] dark:bg-[#111110]"
                                >
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
                                            className="pointer-events-none absolute right-3 bottom-2 select-none text-5xl font-black text-[#f53003]/8"
                                            style={{ fontFamily: "'Playfair Display', serif" }}
                                        >
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        {curso.estado && (
                                            <span className="absolute top-3 right-3 rounded-full bg-[#0a1f16]/90 px-2.5 py-1 text-xs font-medium text-[#4caf7d] backdrop-blur-sm">
                                                {curso.estado}
                                            </span>
                                        )}
                                        <span className="absolute top-3 left-3 rounded-full bg-[#f53003] px-2.5 py-1 text-[10px] font-bold text-white">
                                            Inscrito
                                        </span>
                                    </div>
                                    <div className="flex flex-1 flex-col p-5">
                                        <h2 className="mb-2 text-[15px] font-semibold leading-snug text-[#1b1b18] transition-colors group-hover:text-[#f53003] dark:text-[#EDEDEC]">
                                            {curso.titulo}
                                        </h2>
                                        <p className="mb-5 line-clamp-3 flex-1 text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                                            {curso.descripcion}
                                        </p>
                                        <div className="mt-auto border-t border-[#e3e3e0]/60 pt-4 dark:border-[#2a2a26]/60">
                                            <Link
                                                href={`/curso/${curso.id}`}
                                                className={`${eduNavPrimary} w-full justify-center`}
                                            >
                                                <Play className="h-3.5 w-3.5" /> Continuar curso
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </EduPageShell>
    );
}

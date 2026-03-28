import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from '@inertiajs/react';
import { BookOpen, BookMarked, Home, ArrowLeft, Play, ChevronRight } from 'lucide-react';
import EduPageShell, { EduHeroBlobs, eduNavOutline, eduNavPrimary } from '@/components/EduPageShell';
import {
    eduBadgeEyebrow,
    eduCourseCard,
    eduCourseImageBg,
    eduHeadingHero,
    eduIconBox,
    eduSpinner,
    eduStatCard,
    eduTextMuted,
} from '@/lib/edu-ui';

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
                    <div className={eduSpinner} aria-hidden />
                    <p className="text-sm text-slate-400">Cargando tus cursos…</p>
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
            <section className="relative overflow-hidden border-b border-white/10">
                <EduHeroBlobs />
                <div className="relative mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6 px-6 pb-10 pt-14 lg:pt-16">
                    <div className="max-w-xl">
                        <div className={eduBadgeEyebrow}>
                            <BookMarked className="h-3.5 w-3.5" /> Mi aprendizaje
                        </div>
                        <h1 className={eduHeadingHero}>Mis cursos</h1>
                        <p className={eduTextMuted}>Continúa donde lo dejaste.</p>
                    </div>
                    <div className={eduStatCard}>
                        <div className={eduIconBox}>
                            <BookOpen className="h-5 w-5" strokeWidth={1.75} />
                        </div>
                        <span className="text-sm text-slate-400">
                            <strong className="text-2xl font-semibold text-white">{cursos.length}</strong>
                            <br />
                            {cursos.length === 1 ? 'curso inscrito' : 'cursos inscritos'}
                        </span>
                    </div>
                </div>
            </section>

            <section className="border-t border-white/10 bg-slate-950/50 py-12">
                <div className="mx-auto max-w-6xl px-6 pb-16">
                    {cursos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/25 to-violet-600/20 text-cyan-200">
                                <BookOpen className="h-10 w-10 opacity-80" strokeWidth={1} />
                            </div>
                            <div>
                                <p className="mb-2 text-xl font-semibold tracking-tight text-white">
                                    Aún no estás inscrito en ningún curso
                                </p>
                                <p className="text-sm text-slate-400">
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
                                <article key={curso.id} className={eduCourseCard}>
                                    <div className={eduCourseImageBg}>
                                        {curso.imagen ? (
                                            <img
                                                src={`/storage/${curso.imagen}`}
                                                alt={curso.titulo}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <BookOpen className="h-16 w-16 text-cyan-500/20" strokeWidth={1} />
                                            </div>
                                        )}
                                        <span className="pointer-events-none absolute bottom-2 right-3 select-none font-mono text-5xl font-light text-cyan-500/15">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        {curso.estado && (
                                            <span className="absolute right-3 top-3 rounded-full border border-emerald-500/30 bg-emerald-950/80 px-2.5 py-1 text-xs font-medium text-emerald-300 backdrop-blur-sm">
                                                {curso.estado}
                                            </span>
                                        )}
                                        <span className="absolute left-3 top-3 rounded-full border border-cyan-400/40 bg-gradient-to-r from-cyan-500 to-blue-600 px-2.5 py-1 text-[10px] font-bold text-slate-950 shadow-sm">
                                            Inscrito
                                        </span>
                                    </div>
                                    <div className="flex flex-1 flex-col p-5">
                                        <h2 className="mb-2 text-[15px] font-semibold leading-snug text-white transition-colors group-hover:text-cyan-300">
                                            {curso.titulo}
                                        </h2>
                                        <p className="mb-5 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-400">
                                            {curso.descripcion}
                                        </p>
                                        <div className="mt-auto border-t border-white/10 pt-4">
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

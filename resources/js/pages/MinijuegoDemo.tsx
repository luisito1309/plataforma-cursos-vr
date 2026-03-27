import { useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { enterMinijuegoFullscreen } from '@/components/MinijuegoFullscreenControls';
import QuizMedico3D from '@/components/QuizMedico3D';
import AnatomiaHumana3D from '@/components/AnatomiaHumana3D';
import Computer3D from '@/components/Computer3D';
import CreativeBox from '@/components/CreativeBox';
import { headerEnter, pageEnter, rm } from '@/lib/edu-motion';

const TITLES: Record<string, string> = {
    quiz_medico: 'Quiz médico 3D',
    anatomia_humana: 'Anatomía humana 3D',
    computer_3d: 'Computer 3D',
    creative_box: 'Creative Box',
};

const ALLOWED = new Set(['quiz_medico', 'anatomia_humana', 'computer_3d', 'creative_box']);

export default function MinijuegoDemo({ juego }: { juego: string }) {
    const fsRef = useRef<HTMLDivElement>(null);
    const reduce = useReducedMotion();
    const vHead = rm(reduce, headerEnter);
    const vBody = rm(reduce, pageEnter);

    useEffect(() => {
        if (!ALLOWED.has(juego)) return;
        const id = window.setTimeout(() => {
            void enterMinijuegoFullscreen(fsRef.current);
        }, 350);
        return () => window.clearTimeout(id);
    }, [juego]);

    if (!ALLOWED.has(juego)) {
        return null;
    }

    const label = TITLES[juego] ?? juego;

    return (
        <>
            <Head title={label} />
            <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
                <motion.header
                    initial="hidden"
                    animate="visible"
                    variants={vHead}
                    className="sticky top-0 z-20 flex shrink-0 items-center gap-3 border-b border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur-xl"
                >
                    <motion.div whileHover={reduce ? {} : { scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-cyan-500/30 hover:bg-white/10"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Link>
                    </motion.div>
                    <span className="text-sm font-semibold text-cyan-200/90">{label}</span>
                    <span className="ml-auto hidden text-xs text-slate-500 sm:inline">Pantalla completa al abrir · Esc para salir</span>
                </motion.header>

                <motion.div
                    key={juego}
                    ref={fsRef}
                    initial="hidden"
                    animate="visible"
                    variants={vBody}
                    className="flex min-h-0 flex-1 flex-col overflow-auto bg-slate-900/50 p-4 md:p-6"
                    style={{ minHeight: '70vh' }}
                >
                    {juego === 'quiz_medico' && (
                        <div className="mx-auto w-full max-w-5xl rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-lg shadow-black/20 backdrop-blur-sm md:p-6">
                            <QuizMedico3D />
                        </div>
                    )}
                    {juego === 'anatomia_humana' && (
                        <div className="mx-auto w-full max-w-6xl rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-lg shadow-black/20 backdrop-blur-sm md:p-6">
                            <AnatomiaHumana3D />
                        </div>
                    )}
                    {juego === 'computer_3d' && (
                        <div className="mx-auto w-full max-w-6xl rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-lg shadow-black/20 backdrop-blur-sm md:p-6">
                            <Computer3D />
                        </div>
                    )}
                    {juego === 'creative_box' && (
                        <div className="mx-auto w-full max-w-7xl rounded-2xl border border-violet-500/25 bg-slate-950/90 p-4 shadow-lg shadow-violet-900/20 backdrop-blur-sm md:p-6">
                            <CreativeBox preview cursoId={0} />
                        </div>
                    )}
                </motion.div>
            </div>
        </>
    );
}

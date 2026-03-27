import { useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { enterMinijuegoFullscreen } from '@/components/MinijuegoFullscreenControls';
import QuizMedico3D from '@/components/QuizMedico3D';
import AnatomiaHumana3D from '@/components/AnatomiaHumana3D';
import Computer3D from '@/components/Computer3D';
import CreativeBox from '@/components/CreativeBox';

const TITLES: Record<string, string> = {
    quiz_medico: 'Quiz médico 3D',
    anatomia_humana: 'Anatomía humana 3D',
    computer_3d: 'Computer 3D',
    creative_box: 'Creative Box',
};

const ALLOWED = new Set(['quiz_medico', 'anatomia_humana', 'computer_3d', 'creative_box']);

export default function MinijuegoDemo({ juego }: { juego: string }) {
    const fsRef = useRef<HTMLDivElement>(null);

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
            <div className="flex min-h-screen flex-col bg-[#0a0e14] text-slate-100">
                <header className="sticky top-0 z-20 flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#0a0e14]/90 px-4 py-3 backdrop-blur-md">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver
                    </Link>
                    <span className="text-sm font-semibold text-sky-200/90">{label}</span>
                    <span className="ml-auto hidden text-xs text-slate-500 sm:inline">Pantalla completa al abrir · Esc para salir</span>
                </header>

                <div
                    ref={fsRef}
                    className="flex min-h-0 flex-1 flex-col overflow-auto bg-[#14151c] p-4 md:p-6"
                    style={{ minHeight: '70vh' }}
                >
                    {juego === 'quiz_medico' && (
                        <div className="mx-auto w-full max-w-5xl rounded-2xl border border-white/10 bg-[#14151c] p-4 md:p-6">
                            <QuizMedico3D />
                        </div>
                    )}
                    {juego === 'anatomia_humana' && (
                        <div className="mx-auto w-full max-w-6xl rounded-2xl border border-white/10 bg-[#14151c] p-4 md:p-6">
                            <AnatomiaHumana3D />
                        </div>
                    )}
                    {juego === 'computer_3d' && (
                        <div className="mx-auto w-full max-w-6xl rounded-2xl border border-white/10 bg-[#14151c] p-4 md:p-6">
                            <Computer3D />
                        </div>
                    )}
                    {juego === 'creative_box' && (
                        <div className="mx-auto w-full max-w-7xl rounded-2xl border border-violet-500/20 bg-[#0a0e14] p-4 md:p-6">
                            <CreativeBox preview cursoId={0} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

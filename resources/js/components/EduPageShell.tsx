import { Head, Link } from '@inertiajs/react';
import { GraduationCap } from 'lucide-react';
import type { ReactNode } from 'react';

/** Botón secundario al estilo nav de `welcome.tsx` */
export const eduNavOutline =
    'inline-flex items-center gap-1.5 rounded-md border border-[#19140035] px-4 py-1.5 text-sm font-medium text-[#1b1b18] transition-colors hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]';

/** Botón principal naranja */
export const eduNavPrimary =
    'inline-flex items-center gap-1.5 rounded-md bg-[#f53003] px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90';

type EduPageShellProps = {
    title?: string;
    /** Opcional: título o contexto junto al logo (p. ej. nombre del curso) */
    navMiddle?: ReactNode;
    /** Contenido a la derecha del logo (enlaces, botones) */
    navRight: ReactNode;
    children: ReactNode;
    /** Ancho máximo del bloque de cabecera (por defecto como home) */
    navMaxWidthClass?: string;
};

/**
 * Capa exterior alineada visualmente con `welcome.tsx`: fondo, fuente, header sticky, footer.
 */
export default function EduPageShell({
    title = 'EduPlatform',
    navMiddle,
    navRight,
    children,
    navMaxWidthClass = 'max-w-6xl',
}: EduPageShellProps) {
    const year = new Date().getFullYear();

    return (
        <>
            <Head title={title}>
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
                <header className="sticky top-0 z-50 border-b border-[#e3e3e0]/70 bg-[#FDFDFC]/90 backdrop-blur-sm dark:border-[#2a2a26]/70 dark:bg-[#0a0a0a]/90">
                    <div
                        className={`mx-auto flex w-full items-center justify-between gap-4 px-6 py-4 ${navMaxWidthClass}`}
                    >
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                            <Link href="/" className="flex shrink-0 items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f53003]">
                                    <GraduationCap className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-base font-semibold tracking-tight">EduPlatform</span>
                            </Link>
                            {navMiddle ? (
                                <div className="min-w-0 flex-1 border-l border-[#e3e3e0]/80 pl-4 dark:border-[#2a2a26]/80">
                                    {navMiddle}
                                </div>
                            ) : null}
                        </div>
                        <nav className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                            {navRight}
                        </nav>
                    </div>
                </header>
                {children}
                <footer className="border-t border-[#e3e3e0]/60 py-6 dark:border-[#2a2a26]/60">
                    <div
                        className={`mx-auto flex flex-wrap items-center justify-between gap-4 px-6 ${navMaxWidthClass}`}
                    >
                        <div className="flex items-center gap-2 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            <div className="flex h-5 w-5 items-center justify-center rounded bg-[#f53003]">
                                <GraduationCap className="h-3 w-3 text-white" />
                            </div>
                            EduPlatform © {year}
                        </div>
                        <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                            Hecho con ♥ para aprender
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

/** Hero con blobs decorativos como en home */
export function EduHeroBlobs() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 h-[400px] w-[400px] rounded-full bg-[#f53003]/5 blur-3xl dark:bg-[#f53003]/8" />
            <div className="absolute bottom-0 -left-20 h-[280px] w-[280px] rounded-full bg-[#F8B803]/6 blur-3xl dark:bg-[#F8B803]/10" />
        </div>
    );
}

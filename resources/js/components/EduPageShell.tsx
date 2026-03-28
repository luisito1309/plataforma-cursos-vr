import { Head, Link, usePage } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    EASE_IN_OUT,
    VIEWPORT_COPILOT,
    footerEnter,
    headerEnter,
    pageEnter,
    rm,
} from '@/lib/edu-motion';
import { eduNavOutline, eduNavPrimary } from '@/lib/edu-ui';

export { eduNavOutline, eduNavPrimary } from '@/lib/edu-ui';

type EduPageShellProps = {
    title?: string;
    navMiddle?: ReactNode;
    navRight: ReactNode;
    children: ReactNode;
    navMaxWidthClass?: string;
};

export default function EduPageShell({
    title = 'EduPlatform',
    navMiddle,
    navRight,
    children,
    navMaxWidthClass = 'max-w-6xl',
}: EduPageShellProps) {
    const year = new Date().getFullYear();
    const { url } = usePage();
    const reduce = useReducedMotion();
    const vMain = rm(reduce, pageEnter);
    const vHead = rm(reduce, headerEnter);
    const vFoot = rm(reduce, footerEnter);

    return (
        <>
            <Head title={title}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|dm-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>
            <div
                className="dark flex min-h-screen flex-col scroll-smooth bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500/30"
                style={{
                    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Instrument Sans', sans-serif",
                }}
            >
                {!reduce && (
                    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
                        <div className="absolute -right-32 top-0 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.07] blur-3xl" />
                        <div className="absolute -left-24 bottom-0 h-[320px] w-[320px] rounded-full bg-violet-600/[0.08] blur-3xl" />
                    </div>
                )}
                <motion.header
                    initial="hidden"
                    animate="visible"
                    variants={vHead}
                    className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-2xl"
                >
                    <div
                        className={`relative mx-auto flex w-full items-center justify-between gap-4 px-6 py-4 md:px-10 ${navMaxWidthClass}`}
                    >
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                            <Link href="/" className="group flex shrink-0 items-center gap-2.5">
                                <motion.div
                                    whileHover={{ rotate: [0, -6, 6, 0], transition: { duration: 0.45 } }}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 text-slate-950 shadow-lg shadow-cyan-500/20"
                                >
                                    <GraduationCap className="h-4 w-4" strokeWidth={2} />
                                </motion.div>
                                <span className="text-sm font-semibold tracking-tight text-white">EduPlatform</span>
                            </Link>
                            {navMiddle ? (
                                <div className="min-w-0 flex-1 border-l border-white/10 pl-4">{navMiddle}</div>
                            ) : null}
                        </div>
                        <nav className="flex shrink-0 flex-wrap items-center justify-end gap-2">{navRight}</nav>
                    </div>
                </motion.header>

                <motion.div
                    key={url}
                    initial="hidden"
                    animate="visible"
                    variants={vMain}
                    className="relative flex min-h-0 flex-1 flex-col"
                >
                    {children}
                </motion.div>

                <motion.footer
                    initial="hidden"
                    whileInView="visible"
                    viewport={VIEWPORT_COPILOT}
                    variants={vFoot}
                    className="relative border-t border-white/5 py-8"
                >
                    <div
                        className={`mx-auto flex flex-wrap items-center justify-between gap-4 px-6 text-sm text-slate-500 md:px-10 ${navMaxWidthClass}`}
                    >
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 text-slate-950">
                                <GraduationCap className="h-3.5 w-3.5" />
                            </div>
                            EduPlatform © {year}
                        </div>
                        <p className="text-xs text-slate-600">Motion + glass · framer-motion</p>
                    </div>
                </motion.footer>
            </div>
        </>
    );
}

/** Blobs decorativos */
export function EduHeroBlobs() {
    const reduce = useReducedMotion();
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {reduce ? (
                <>
                    <div
                        aria-hidden
                        className="absolute -right-24 -top-32 h-[380px] w-[380px] rounded-full bg-cyan-500/[0.09] blur-3xl"
                    />
                    <div
                        aria-hidden
                        className="absolute -bottom-20 -left-16 h-[280px] w-[280px] rounded-full bg-violet-600/[0.1] blur-3xl"
                    />
                </>
            ) : (
                <>
                    <motion.div
                        aria-hidden
                        className="absolute -right-24 -top-32 h-[380px] w-[380px] rounded-full bg-cyan-500/[0.09] blur-3xl"
                        animate={{ y: [0, 12, 0], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                        aria-hidden
                        className="absolute -bottom-20 -left-16 h-[280px] w-[280px] rounded-full bg-violet-600/[0.1] blur-3xl"
                        animate={{ y: [0, -10, 0], opacity: [0.65, 0.95, 0.65] }}
                        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                    />
                </>
            )}
        </div>
    );
}

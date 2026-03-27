import { Link } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import AppLogoIcon from '@/components/app-logo-icon';
import { authItem, authStagger, rm } from '@/lib/edu-motion';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const reduce = useReducedMotion();
    const vStagger = rm(reduce, authStagger, { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } });
    const vItem = rm(reduce, authItem);

    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-slate-950 p-6 md:p-10">
            {!reduce && (
                <div className="pointer-events-none absolute inset-0" aria-hidden>
                    <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
                    <div className="absolute -left-16 bottom-20 h-64 w-64 rounded-full bg-violet-600/12 blur-3xl" />
                </div>
            )}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={vStagger}
                className="relative w-full max-w-sm"
            >
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <motion.div variants={vItem}>
                            <Link
                                href={home()}
                                className="flex flex-col items-center gap-2 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 rounded-xl"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                                    className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 shadow-lg shadow-cyan-500/20"
                                >
                                    <AppLogoIcon className="size-6 fill-current text-slate-950" />
                                </motion.div>
                                <span className="sr-only">{title}</span>
                            </Link>
                        </motion.div>

                        <motion.div variants={vItem} className="space-y-2 text-center">
                            <h1 className="text-xl font-semibold tracking-tight text-white">{title}</h1>
                            <p className="text-center text-sm text-slate-400">{description}</p>
                        </motion.div>
                    </div>
                    <motion.div variants={vItem} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
                        {children}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}

import * as React from 'react';
import { usePage } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import { SidebarInset } from '@/components/ui/sidebar';
import { pageEnter, rm } from '@/lib/edu-motion';
import type { AppVariant } from '@/types';

type Props = React.ComponentProps<'main'> & {
    variant?: AppVariant;
};

export function AppContent({ variant = 'sidebar', children, ...props }: Props) {
    const { url } = usePage();
    const reduce = useReducedMotion();
    const v = rm(reduce, pageEnter);

    const inner = (
        <motion.div
            key={url}
            initial="hidden"
            animate="visible"
            variants={v}
            className="flex min-h-0 flex-1 flex-col"
        >
            {children}
        </motion.div>
    );

    if (variant === 'sidebar') {
        return <SidebarInset {...props}>{inner}</SidebarInset>;
    }

    return (
        <main
            className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl"
            {...props}
        >
            {inner}
        </main>
    );
}

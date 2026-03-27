import type { Variants } from 'framer-motion';

export const EASE_IN_OUT: [number, number, number, number] = [0.42, 0, 0.58, 1];
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const VIEWPORT_COPILOT = { once: true, amount: 0.2 as const };

export const DURATION = { sm: 0.62, md: 0.78, lg: 0.95 };

export const fadeLeft: Variants = {
    hidden: { opacity: 0, x: -52, scale: 0.95, filter: 'blur(8px)' },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: { duration: DURATION.md, ease: EASE_IN_OUT },
    },
};

export const fadeRight: Variants = {
    hidden: { opacity: 0, x: 52, scale: 0.95, filter: 'blur(8px)' },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: { duration: DURATION.md, ease: EASE_IN_OUT },
    },
};

export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 48, scale: 0.95, filter: 'blur(10px)' },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: { duration: DURATION.lg, ease: EASE_IN_OUT },
    },
};

export const fadeDown: Variants = {
    hidden: { opacity: 0, y: -44, scale: 0.95, filter: 'blur(10px)' },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: { duration: DURATION.md, ease: EASE_IN_OUT },
    },
};

export const zoomIn: Variants = {
    hidden: { opacity: 0, scale: 0.95, filter: 'blur(6px)' },
    visible: {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        transition: { duration: DURATION.sm, ease: EASE_IN_OUT },
    },
};

/** Transición al cambiar de ruta (Inertia) o montar página */
export const pageEnter: Variants = {
    hidden: { opacity: 0, y: 16, scale: 0.992, filter: 'blur(8px)' },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: { duration: 0.58, ease: EASE_IN_OUT },
    },
};

export const headerEnter: Variants = {
    hidden: { opacity: 0, y: -16, filter: 'blur(6px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.5, ease: EASE_IN_OUT },
    },
};

export const footerEnter: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: EASE_IN_OUT },
    },
};

export const siguientePasoContainer: Variants = {
    hidden: fadeDown.hidden,
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            duration: DURATION.lg,
            ease: EASE_IN_OUT,
            staggerChildren: 0.12,
            delayChildren: 0.1,
        },
    },
};

export function staggerParent(delayChildren = 0.1, staggerChildren = 0.11): Variants {
    return {
        hidden: {},
        visible: { transition: { delayChildren, staggerChildren, ease: EASE_IN_OUT } },
    };
}

const defaultMinimal: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
};

export function rm(reduce: boolean | null, full: Variants, minimal: Variants = defaultMinimal): Variants {
    return reduce ? minimal : full;
}

export const childFadeLeft: Variants = {
    hidden: { opacity: 0, x: -36, scale: 0.96 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { duration: DURATION.sm, ease: EASE_IN_OUT } },
};

export const childFadeRight: Variants = {
    hidden: { opacity: 0, x: 36, scale: 0.96 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { duration: DURATION.sm, ease: EASE_IN_OUT } },
};

export const childFadeUp: Variants = {
    hidden: { opacity: 0, y: 28, scale: 0.96, filter: 'blur(6px)' },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: { duration: DURATION.sm, ease: EASE_IN_OUT },
    },
};

export const childFadeDown: Variants = {
    hidden: { opacity: 0, y: -22, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: DURATION.sm, ease: EASE_IN_OUT } },
};

export const authStagger: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } },
};

export const authItem: Variants = {
    hidden: { opacity: 0, y: 12, scale: 0.98, filter: 'blur(4px)' },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: { duration: 0.55, ease: EASE_IN_OUT },
    },
};

export const cardHover = {
    scale: 1.05,
    boxShadow: '0 24px 48px rgba(0,0,0,0.35), 0 0 40px rgba(34,211,238,0.15)',
};

export const cardHoverSubtle = {
    scale: 1.05,
    boxShadow: '0 20px 40px rgba(139,92,246,0.18), 0 0 32px rgba(34,211,238,0.1)',
};

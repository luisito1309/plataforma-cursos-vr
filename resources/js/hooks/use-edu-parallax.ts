import { useEffect, useRef, type RefObject } from 'react';

export function useParallaxLayer(
    sectionRef: RefObject<HTMLElement | null>,
    factor: number,
    reduce: boolean | null,
): RefObject<HTMLDivElement | null> {
    const layerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (reduce) return undefined;
        const section = sectionRef.current;
        const layer = layerRef.current;
        if (!section || !layer) return undefined;

        let raf = 0;
        const tick = () => {
            const rect = section.getBoundingClientRect();
            const vh = window.innerHeight;
            const raw = (vh * 0.5 - rect.top) / (vh + rect.height);
            const t = Math.min(Math.max(raw, 0), 1);
            const y = (t - 0.5) * factor;
            layer.style.transform = `translate3d(0, ${y}px, 0)`;
            raf = 0;
        };

        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(tick);
        };

        tick();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [sectionRef, factor, reduce]);

    return layerRef;
}

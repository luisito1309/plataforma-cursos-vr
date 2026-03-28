/**
 * Tokens visuales alineados con Home (glass, cyan/violet, gradientes).
 */

/** Nav / CTA principal */
export const eduNavOutline =
    'inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition-colors hover:border-cyan-500/30 hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45';

export const eduNavPrimary =
    'inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-500/25 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50 disabled:cursor-not-allowed disabled:opacity-40';

/** Botón primario (mismo gradiente; puede añadir w-full) */
export const eduBtnPrimary = eduNavPrimary;

/** Secundario / contorno */
export const eduBtnOutline =
    'inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-500/35 hover:bg-cyan-500/10 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40';

/** Botón solo icono (acciones en fila) */
export const eduBtnIcon =
    'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-300 transition hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-200';

/** Eliminar / peligro */
export const eduBtnDanger =
    'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-500/35 bg-red-500/10 text-red-300 transition hover:bg-red-500/20';

/** Tarjeta de curso (grid) */
export const eduCourseCard =
    'group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-sm shadow-black/20 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10';

/** Área de imagen / placeholder */
export const eduCourseImageBg =
    'relative h-44 overflow-hidden bg-gradient-to-br from-cyan-950/50 to-violet-950/40';

/** Badge hero (eyebrow) */
export const eduBadgeEyebrow =
    'mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-4 py-1.5 text-sm font-medium text-cyan-300';

/** Tarjeta contador (N cursos) */
export const eduStatCard =
    'flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 shadow-sm shadow-black/10 backdrop-blur-xl';

/** Icono en caja gradiente (como categorías Home) */
export const eduIconBox =
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/25 to-violet-600/20 text-cyan-200';

export const eduIconBoxSm = 'flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/25 to-violet-600/20 text-cyan-200';

/** Chips */
export const eduChipCategoria =
    'inline-flex border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-200';

export const eduChipMiniJuego =
    'inline-flex items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/15 px-2.5 py-1 text-[10px] font-bold text-violet-200';

export const eduChipEstado =
    'rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300';

export const eduChipBadgeImg =
    'inline-flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm';

/** Tipografía sección */
export const eduHeadingHero = 'mb-3 text-4xl font-semibold tracking-tight text-white lg:text-5xl';

export const eduTextMuted = 'text-lg leading-relaxed text-slate-400';

export const eduSectionHeading = 'text-3xl font-semibold tracking-tight text-white lg:text-4xl';

export const eduEyebrow =
    'mb-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400/90';

/** Formularios (tema oscuro shell) */
export const eduLabel =
    'text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500';

export const eduInput =
    'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-500/45 focus:ring-2 focus:ring-cyan-500/20';

export const eduTextarea = `${eduInput} min-h-[80px] resize-y`;

/** Modal */
export const eduModalBackdrop = 'fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm';

export const eduModalCard =
    'w-full max-w-[480px] rounded-2xl border border-white/10 bg-slate-900/95 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl';

/** Secciones página cursos */
export const eduHeroSection = 'relative overflow-hidden border-b border-white/10';

export const eduContentSection = 'border-t border-white/10 bg-slate-950/50 py-12';

export const eduFormSection = 'border-b border-white/10 bg-slate-950/30';

/** Spinner */
export const eduSpinner =
    'h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400';

/** Enlace acento */
export const eduLinkAccent = 'font-medium text-cyan-400 hover:text-cyan-300';

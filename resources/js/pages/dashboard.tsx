import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

type Stats = {
    total_cursos: number;
    total_usuarios: number;
    total_inscripciones: number;
    usuarios_por_rol: { admin: number; docente: number; estudiante: number };
};

export default function Dashboard({ stats }: { stats: Stats }) {
    const s = stats ?? {
        total_cursos: 0,
        total_usuarios: 0,
        total_inscripciones: 0,
        usuarios_por_rol: { admin: 0, docente: 0, estudiante: 0 },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Panel de administración" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-xl font-semibold">Panel de estadísticas</h1>
                    <Link
                        href="/cursos"
                        className="rounded-md border border-sidebar-border bg-sidebar px-3 py-2 text-sm hover:bg-sidebar-accent"
                    >
                        Ver cursos
                    </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-5 dark:border-sidebar-border">
                        <p className="text-sm text-muted-foreground">Total cursos</p>
                        <p className="mt-1 text-2xl font-bold">{s.total_cursos}</p>
                    </div>
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-5 dark:border-sidebar-border">
                        <p className="text-sm text-muted-foreground">Total usuarios</p>
                        <p className="mt-1 text-2xl font-bold">{s.total_usuarios}</p>
                    </div>
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-5 dark:border-sidebar-border">
                        <p className="text-sm text-muted-foreground">Inscripciones</p>
                        <p className="mt-1 text-2xl font-bold">{s.total_inscripciones}</p>
                    </div>
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-5 dark:border-sidebar-border">
                        <p className="text-sm text-muted-foreground">Usuarios por rol</p>
                        <ul className="mt-2 space-y-1 text-sm">
                            <li>Admin: {s.usuarios_por_rol.admin}</li>
                            <li>Docente: {s.usuarios_por_rol.docente}</li>
                            <li>Estudiante: {s.usuarios_por_rol.estudiante}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

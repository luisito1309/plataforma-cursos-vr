import { Head, usePage } from '@inertiajs/react';
import { BookOpen, FileText, Users, Home } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { UserRole } from '@/types/auth';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

type Estadisticas = {
    total_cursos: number;
    total_usuarios: number;
    total_inscripciones: number;
};

type Curso = {
    id: number;
    titulo: string;
    descripcion: string;
    estado?: string;
    imagen?: string;
};

type DashboardProps = {
    estadisticas: Estadisticas;
    cursos: Curso[];
};

export default function Dashboard(props: DashboardProps) {
    const { auth } = usePage().props;
    const role = (auth?.user as { role?: UserRole } | null)?.role;
    const estadisticas = props.estadisticas ?? {
        total_cursos: 0,
        total_usuarios: 0,
        total_inscripciones: 0,
    };
    const cursos = props.cursos ?? [];

    useEffect(() => {
        if (role && role !== 'admin') {
            router.visit('/');
        }
    }, [role]);

    if (role && role !== 'admin') {
        return null;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">

                {/* Header con botón Home */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Estadísticas</h2>
                    <button
                        onClick={() => router.visit('/')}
                        className="inline-flex items-center gap-2 rounded-lg border border-sidebar-border/70 bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted dark:border-sidebar-border"
                    >
                        <Home className="h-4 w-4" />
                        Home
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total cursos</p>
                                <p className="text-2xl font-bold">{estadisticas.total_cursos}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total usuarios</p>
                                <p className="text-2xl font-bold">{estadisticas.total_usuarios}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total inscripciones</p>
                                <p className="text-2xl font-bold">{estadisticas.total_inscripciones}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="mb-4 text-xl font-semibold">Cursos</h2>
                    <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                        {cursos.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No hay cursos registrados.
                            </div>
                        ) : (
                            <ul className="divide-y divide-sidebar-border/70">
                                {cursos.map((curso) => (
                                    <li
                                        key={curso.id}
                                        className="flex items-center justify-between gap-4 p-4 hover:bg-muted/50"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium truncate">{curso.titulo}</p>
                                            {curso.descripcion && (
                                                <p className="text-sm text-muted-foreground line-clamp-1">
                                                    {curso.descripcion}
                                                </p>
                                            )}
                                        </div>
                                        {curso.estado && (
                                            <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs">
                                                {curso.estado}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
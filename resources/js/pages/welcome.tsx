import { Head, usePage } from '@inertiajs/react';
import { LocalStorageAuthSync } from '@/components/LocalStorageAuthSync';
import Home from '@/components/Home';
import type { User } from '@/types/auth';

type Curso = {
    id: number;
    titulo: string;
    descripcion: string;
    estado?: string;
    imagen?: string;
    instructor?: string;
    duracion?: string;
    estudiantes?: number;
    rating?: number;
    categoria?: string;
};

type Categoria = {
    id: number;
    nombre: string;
    icono?: string;
    total_cursos?: number;
};

export default function Welcome({
    canRegister = true,
    cursosDestacados = [],
    categorias = [],
}: {
    canRegister?: boolean;
    cursosDestacados?: Curso[];
    categorias?: Categoria[];
}) {
    const { auth } = usePage<{ auth?: { user?: User | null } }>().props;

    return (
        <>
            <LocalStorageAuthSync user={auth?.user ?? undefined} />
            <Head title="Bienvenido">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|dm-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>
            <Home canRegister={canRegister} cursosDestacados={cursosDestacados} categorias={categorias} />
        </>
    );
}

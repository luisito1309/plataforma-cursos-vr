# Plataforma de Cursos WebVR

Plataforma educativa para explorar cursos con contenido multimedia, inscripciones y **minijuegos 3D** integrados en el navegador. El backend expone una API REST en Laravel; el frontend es una SPA **React** servida con **Inertia.js** y **Vite**. Los entornos interactivos usan **Three.js** (escenas WebGL, modelos GLB y controles de cámara).

---

## Descripción general

El proyecto une gestión de cursos (módulos, videos, documentos) con experiencias lúdicas en 3D (quiz médico, anatomía, conducción, FPS, etc.) para reforzar el aprendizaje. La página de cada curso puede asociar un **identificador de minijuego** almacenado en base de datos; la interfaz monta el componente React correspondiente o un iframe externo según el catálogo definido en código.

### Tecnologías principales

| Área | Tecnología |
|------|------------|
| Backend | **Laravel 12** (API JSON, Fortify, Sanctum, Inertia) |
| Frontend | **React 19**, **TypeScript**, **Tailwind CSS**, **Vite** |
| 3D / WebGL | **Three.js** (`three`), cargadores GLTF |
| HTTP | **Axios** (consumo de `/api/*` desde las páginas) |
| Base de datos | **SQLite** por defecto (configurable a MySQL/MariaDB) |

---

## Estructura del proyecto

Este repositorio es una **aplicación monolítica**: no existen carpetas separadas `backend/` y `frontend/` en la raíz. El **backend** es la raíz del proyecto Laravel; el **frontend React** vive en `resources/js/`. A continuación se resume qué hace cada parte.

### Backend (Laravel) — raíz del repositorio

| Carpeta / archivo | Función |
|-------------------|---------|
| `app/` | Lógica de la aplicación: modelos Eloquent, controladores HTTP, acciones Fortify, middleware (p. ej. `CheckRole` para roles admin). |
| `app/Http/Controllers/` | Controladores web e **API** (`CursoController`, `ModuloController`, `VideoController`, `DocumentoController`, `InscripcionController`, `Api/DashboardController`, etc.). |
| `app/Models/` | Modelos: `User`, `Curso`, `Modulo`, `Video`, `Documento`, `Inscripcion`, relaciones y casts. |
| `routes/web.php` | Rutas Inertia: inicio, listados, **ver curso** (`/curso/{id}`), **demo de minijuegos** (`/minijuego/{juego}`), dashboard admin, ajustes. |
| `routes/api.php` | API REST bajo prefijo `/api` (cursos, módulos, videos, documentos, inscripciones, dashboard JSON para admin). |
| `database/migrations/` | Esquema: usuarios, cursos, módulos, videos, inscripciones, documentos, campos `mini_juego`, `categoria`, etc. |
| `database/seeders/` | Datos iniciales opcionales. |
| `config/` | Configuración de Laravel, Fortify, sesiones, caché, etc. |
| `public/` | Punto de entrada web (`index.php`), assets compilados por Vite y archivos estáticos. |

### Frontend (React) — `resources/js/`

| Carpeta | Función |
|---------|---------|
| `resources/js/pages/` | Páginas Inertia: `welcome`, `Cursos`, `MisCursos`, `VerCurso` (vista principal del curso y minijuego), `MinijuegoDemo` (demo a pantalla completa), `dashboard`, auth (`login`, `register`), `settings/profile`, etc. |
| `resources/js/components/` | UI reutilizable, shell educativo, **minijuegos 3D** (`CarsGame.jsx`, `GamesFPS.jsx`, `QuizMedico3D.jsx`, `AnatomiaHumana3D.jsx`, `Computer3D.jsx`, `CreativeBox.jsx`, `VRPingPong.tsx`), controles de pantalla completa, progreso de minijuego, cabeceras, sidebar. |
| `resources/js/layouts/` | Layouts de la app, auth y settings. |
| `resources/js/lib/` | Utilidades: `minijuegoStorage.ts` (progreso en `localStorage`), `edu-ui`, animaciones, etc. |
| `resources/js/hooks/` | Hooks (tema, parallax, etc.). |
| `resources/js/types/` | Tipos TypeScript compartidos. |

> **Nota:** No hay una carpeta dedicada `games/`; los minijuegos están en `components/` y se enlazan desde `VerCurso.tsx` mediante el catálogo `MINI_JUEGOS_INFO` y el campo `mini_juego` del curso.

### Modelos 3D — `public/models/`

Aquí deben colocarse los archivos **`.glb`** referenciados por los componentes Three.js. Laravel sirve `public/` como raíz URL, por lo que un modelo `public/models/auto.glb` se solicita como **`/models/auto.glb`**.

Ejemplos usados en el código: `mapa.glb`, `auto.glb`, `piel.glb`, `esqueleto.glb`, `computer.glb`, `laptop.glb`, `cerebro.glb`, etc. Si falta un archivo, la escena mostrará error de carga en consola.

---

## Instalación y ejecución

### Requisitos

- PHP **8.2+**, Composer, Node.js **18+**, npm.
- Extensión PHP necesaria para SQLite o para el motor SQL que configures.

### Backend

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Por defecto la aplicación queda en `http://127.0.0.1:8000`.

### Frontend (assets en desarrollo)

En **otra terminal**, en la raíz del proyecto:

```bash
npm install
npm run dev
```

Vite inyecta el bundle en las vistas Blade de Inertia. En desarrollo conviene tener **servidor Laravel** y **`npm run dev`** ejecutándose a la vez.

### Compilación para producción

```bash
npm run build
php artisan config:cache
php artisan route:cache
```

---

## Configuración

### Variables de entorno (`.env`)

| Variable | Descripción |
|----------|-------------|
| `APP_URL` | URL pública de la app (debe coincidir con el origen del navegador para cookies y Sanctum). Ejemplo: `http://localhost:8000`. |
| `APP_KEY` | Generada con `php artisan key:generate`. |
| `DB_*` | Conexión a base de datos. El `.env.example` usa **SQLite** (`DB_CONNECTION=sqlite`); para MySQL descomenta y rellena host, base de datos, usuario y contraseña. |

### URL del backend y API

- Las rutas definidas en `routes/api.php` se exponen con prefijo **`/api`** (p. ej. `GET /api/cursos`).
- El frontend llama con rutas relativas al mismo origen (`axios.get('/api/cursos')`), asumiendo que el usuario abre la app desde el mismo host que Laravel.

### Sesiones y colas

El `.env.example` usa `SESSION_DRIVER=database` y `QUEUE_CONNECTION=database`; tras migrar, las tablas de sesión/colas quedan disponibles si las usas.a

---

## Uso de las APIs desde React (Axios)

Las peticiones se hacen típicamente con **axios** desde páginas o componentes (mismo origen que Laravel).

### Ejemplo GET — listar cursos

```ts
import axios from 'axios';

const res = await axios.get('/api/cursos');
const cursos = res.data;
```

### Ejemplo GET — curso y módulos

```ts
const id = 1;
const [curso, modulos] = await Promise.all([
  axios.get(`/api/cursos/${id}`),
  axios.get(`/api/cursos/${id}/modulos`),
]);
```

### Ejemplo POST — crear módulo

```ts
await axios.post('/api/modulos', {
  curso_id: id,
  titulo: 'Introducción',
});
```

### Ejemplo POST — inscripción a un curso

```ts
await axios.post('/api/inscribirse', {
  curso_id: cursoId,
});
```

### Ejemplo POST — telemetría Creative Box (extensible)

```ts
await axios.post(`/api/cursos/${id}/creative-accion`, {
  accion: 'colocar_voxel',
  // ...payload libre
});
```

### Rutas API principales (resumen)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/cursos` | Lista todos los cursos |
| `POST` | `/api/cursos` | Crea curso (multipart si subes imagen) |
| `GET` | `/api/cursos/{id}` | Detalle de un curso |
| `PUT` | `/api/cursos/{id}` | Actualiza curso |
| `DELETE` | `/api/cursos/{id}` | Elimina curso |
| `GET` | `/api/cursos/{id}/modulos` | Módulos con videos y documentos |
| `POST` | `/api/modulos` | Crea módulo |
| `PUT` | `/api/modulos/{id}` | Actualiza módulo |
| `DELETE` | `/api/modulos/{id}` | Elimina módulo |
| `GET` | `/api/modulos/{id}/documentos` | Documentos del módulo |
| `POST` | `/api/documentos` | Sube documento |
| `DELETE` | `/api/documentos/{id}` | Elimina documento |
| `POST` | `/api/videos` | Añade video a un módulo |
| `DELETE` | `/api/videos/{id}` | Elimina video |
| `POST` | `/api/inscribirse` | Inscribe usuario en curso |
| `GET` | `/api/mis-cursos` | Cursos inscritos (lógica actual en controlador) |
| `GET` | `/api/dashboard` | Estadísticas admin (**requiere autenticación**) |

### Autenticación

- **Sesión web (Fortify):** el login y registro se gestionan con rutas web e **Inertia** (formularios que envían a las rutas de Fortify), no mediante `POST /api/login` genérico.
- **API protegida:** `GET /api/dashboard` está protegida con `auth:sanctum` y rol `admin`. Para consumirla desde un cliente que no comparte sesión de cookies, habría que emitir un **token Sanctum** y enviar cabecera `Authorization: Bearer {token}`. La mayoría de rutas de cursos/módulos/videos del `api.php` actual **no** exigen token en el grupo por defecto; revisa si endureces la política en producción.

### Cabeceras

- Para peticiones **JSON** normales, `axios` envía `Accept: application/json` si configuras el interceptor o usas respuestas que esperan JSON de errores de validación.
- Para **Sanctum en SPA** con cookies, en un despliegue real conviene `axios.defaults.withCredentials = true` y la cookie CSRF de Laravel (`X-XSRF-TOKEN`); este proyecto usa muchas rutas API públicas en el mismo origen sin configuración extra explícita en el código fuente.

---

## Sistema de minijuegos

### Ubicación

- Lógica y UI de cada juego: principalmente **`resources/js/components/`** (archivos `.jsx` / `.tsx`).
- Integración en el curso: **`resources/js/pages/VerCurso.tsx`** (catálogo `MINI_JUEGOS_INFO`, selección por `curso.mini_juego`).
- Demos independientes: ruta web **`/minijuego/{juego}`** → página **`MinijuegoDemo`** (`web.php` lista juegos permitidos: `quiz_medico`, `anatomia_humana`, `computer_3d`, `creative_box`, `games_fps`, `cars`).

### Cómo funcionan los componentes Three.js

1. Cada componente crea o reutiliza un **canvas** WebGL, escena, cámara y luces.
2. Se importa **`GLTFLoader`** desde `three/examples/jsm/loaders/GLTFLoader` (o variante `.js`).
3. En `useEffect` o callbacks se anima con `requestAnimationFrame` y se limpian geometrías/materials al desmontar para evitar fugas de memoria.
4. Algunos juegos combinan **controles de teclado/ratón** y estados de juego (puntuación, niveles).

### Ejemplos de componentes

| Archivo | Rol |
|---------|-----|
| `CarsGame.jsx` | Conducción 3D con carga de `mapa.glb` y `auto.glb`. |
| `GamesFPS.jsx` | Estilo disparos en primera persona con Three.js. |
| `QuizMedico3D.jsx` | Preguntas con modelos anatómicos (varios `.glb`). |
| `AnatomiaHumana3D.jsx` | Exploración por sistemas (piel, esqueleto, órganos, etc.). |
| `Computer3D.jsx` | Escena con equipos 3D (ordenador, portátil, VR, tablet). |
| `CreativeBox.jsx` | Mundo tipo voxels; puede notificar acciones vía API `creative-accion`. |
| `VRPingPong.tsx` | Ping pong 3D en la vista de curso. |

Otros identificadores del catálogo (`monster_friend`, `konterball`, `pingpong`) usan **iframe** a URLs externas o el componente interno según corresponda.

### Relación con los cursos

El modelo `Curso` incluye el campo **`mini_juego`** (string o null). Si coincide con una clave de `MINI_JUEGOS_INFO`, al abrir **`/curso/{id}`** se muestra ese minijuego en la sección correspondiente.

---

## Carga de modelos 3D (GLB)

Se usa **`GLTFLoader`** de Three.js. Los archivos deben estar en **`public/models/`** y referenciarse con ruta absoluta desde la raíz web:

```js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('/models/auto.glb', (gltf) => {
  scene.add(gltf.scene);
});
```

Asegúrate de que el nombre del archivo y la ruta coincidan con los definidos en cada componente (`CarsGame.jsx`, `AnatomiaHumana3D.jsx`, etc.).

---

## Sistema de progreso

### Completado del minijuego (cliente)

Para los juegos listados en **`MINIJUEGOS_CON_PROGRESO_LOCAL`** (`resources/js/lib/minijuegoStorage.ts`), el avance **“completado”** se guarda en **`localStorage`** con claves del tipo:

`edu_minijuego_ok_{cursoId}_{juego}`

El componente **`MiniJuegoProgreso`** envuelve el minijuego: el usuario indica que ha jugado y pulsa **Finalizar mini juego**; entonces se llama a **`setMinijuegoOk(cursoId, juego)`** y se dispara el evento personalizado **`edu-minijuego-ok`** para actualizar la UI (p. ej. chip de estado en `VerCurso`).

### Persistencia en servidor

- El endpoint **`POST /api/cursos/{id}/creative-accion`** acepta telemetría y hoy responde confirmación; la persistencia en base de datos puede ampliarse según necesidad.
- El **estado global del curso** (pendiente/publicado) y el contenido siguen en **Laravel** (tablas `cursos`, `modulos`, etc.).

---

## Funcionalidades principales

- **Cursos:** alta, edición, categorías (p. ej. medicina, tecnología, creativo, play), imagen de portada, asociación de minijuego.
- **Módulos, videos y documentos:** estructura por módulo, reproducción embebida (YouTube/Vimeo/archivos) y descarga o visualización de PDF/archivos.
- **Minijuegos 3D:** integrados en la vista del curso y rutas de demo.
- **Inscripciones:** API para inscribirse y listar “mis cursos” (la lógica de usuario en inscripción puede evolucionar para usar el usuario autenticado real).
- **Autenticación y roles:** Fortify para login/registro; middleware **`role:admin`** para dashboard administrativo.
- **Perfil:** página de ajustes de usuario (`settings/profile`) acorde al starter kit.
- **Ranking / perfil gamificado (UI admin):** el componente `AdminDashboard.jsx` referencia rutas como `/api/perfil` y `/api/ranking` para una experiencia tipo leaderboard; **esas rutas no están definidas en `routes/api.php` en el estado actual del repositorio** — la interfaz está preparada para cuando se implementen en backend.

---

## Posibles mejoras

- **Multijugador** en minijuegos (WebSockets, servidor de salas).
- **IA** para pistas adaptativas o NPCs en escenas Three.js.
- **Más modelos GLB** y optimización (compresión Draco, LOD).
- **Persistencia de progreso** de minijuegos en base de datos por usuario.
- **Implementar API** de ranking y perfil acorde al panel admin.
- **Endurecer la API** (políticas, usuario real en inscripciones, rate limiting).

---

## Autor

**Luis Rodrigo Aguilar Justiniano** · **Felipe Gabriel Albani Albani** · **Ashley Arriane Aguilar Perez**

---

*Documentación generada para el repositorio **WebVR** — plataforma educativa con Laravel, React y Three.js.*

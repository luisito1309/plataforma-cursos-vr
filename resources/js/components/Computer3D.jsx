import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const RUTAS_MODELO = {
    computer: "/models/computer.glb",
    laptop: "/models/laptop.glb",
    metaQuest: "/models/meta_quest_3.glb",
    tablet: "/models/tablet.glb",
};

const TARGET_SIZE_MODELO = {
    computer: 2.4,
    laptop: 2.2,
    metaQuest: 2.1,
    tablet: 2.15,
};

const RAIZ_NOMBRE = "device_modelo_root";

function PanelH({ children }) {
    return <h4 className="mt-3 text-sm font-semibold text-foreground first:mt-0">{children}</h4>;
}

function PanelUl({ children, className = "" }) {
    return (
        <ul className={`mt-1 list-disc space-y-1 pl-4 text-muted-foreground ${className}`.trim()}>{children}</ul>
    );
}

function PanelLi({ children }) {
    return <li className="leading-snug">{children}</li>;
}

function disposeModel(root) {
    if (!root) return;
    root.traverse((child) => {
        if (child.isMesh) {
            child.geometry?.dispose?.();
            const mats = child.material;
            if (Array.isArray(mats)) {
                mats.forEach((m) => {
                    m?.map?.dispose?.();
                    m?.dispose?.();
                });
            } else if (mats) {
                mats.map?.dispose?.();
                mats.dispose?.();
            }
        }
    });
}

function fitAndCenterObject(object, targetSize = 2.4) {
    object.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 0.0001);
    const s = targetSize / maxDim;
    object.scale.setScalar(s);
    object.updateMatrixWorld(true);
    const box2 = new THREE.Box3().setFromObject(object);
    const c = box2.getCenter(new THREE.Vector3());
    object.position.sub(c);
}

function InformacionComputer() {
    return (
        <div className="space-y-1">
            <h3 className="mb-2 text-base font-bold text-foreground">PC de escritorio</h3>
            <PanelH>Componentes de una computadora</PanelH>
            <PanelUl>
                <PanelLi>
                    <strong className="text-foreground/90">1. CPU (procesador):</strong> el cerebro; ejecuta
                    instrucciones.
                </PanelLi>
                <PanelLi>
                    <strong className="text-foreground/90">2. Memoria RAM:</strong> almacena datos temporales.
                </PanelLi>
                <PanelLi>
                    <strong className="text-foreground/90">3. Disco duro / SSD:</strong> almacena datos a largo
                    plazo.
                </PanelLi>
                <PanelLi>
                    <strong className="text-foreground/90">4. Placa base:</strong> conecta los componentes.
                </PanelLi>
                <PanelLi>
                    <strong className="text-foreground/90">5. GPU (tarjeta gráfica):</strong> procesa gráficos.
                </PanelLi>
                <PanelLi>
                    <strong className="text-foreground/90">6. Fuente de poder:</strong> suministra energía.
                </PanelLi>
                <PanelLi>
                    <strong className="text-foreground/90">7. Periféricos:</strong> teclado, mouse, monitor, etc.
                </PanelLi>
            </PanelUl>
            <PanelH>Entradas comunes</PanelH>
            <PanelUl>
                <PanelLi>Teclado</PanelLi>
                <PanelLi>Mouse</PanelLi>
                <PanelLi>Pantalla táctil</PanelLi>
                <PanelLi>Escáner</PanelLi>
                <PanelLi>Micrófono</PanelLi>
                <PanelLi>Cámara web</PanelLi>
            </PanelUl>
        </div>
    );
}

function InformacionLaptop() {
    return (
        <div className="space-y-1">
            <h3 className="mb-2 text-base font-bold text-foreground">Laptop</h3>
            <PanelH>Componentes clave de una laptop</PanelH>
            <PanelUl>
                <PanelLi>
                    <strong className="text-foreground/90">1. Procesador (CPU):</strong> Intel Core i3 / i5 / i7 o AMD
                    Ryzen.
                </PanelLi>
                <PanelLi>
                    <strong className="text-foreground/90">2. Memoria RAM:</strong> 4 GB, 8 GB, 16 GB o más.
                </PanelLi>
                <PanelLi>
                    <strong className="text-foreground/90">3. Almacenamiento:</strong>
                </PanelLi>
            </PanelUl>
            <PanelUl className="mt-0 pl-8">
                <PanelLi>
                    <strong className="text-foreground/90">Disco duro (HDD):</strong> económico, más lento.
                </PanelLi>
                <PanelLi>
                    <strong className="text-foreground/90">SSD:</strong> rápido, recomendado.
                </PanelLi>
            </PanelUl>
            <PanelUl>
                <PanelLi>
                    <strong className="text-foreground/90">4. Pantalla:</strong> LED, IPS, tamaño (13–17 pulgadas).
                </PanelLi>
                <PanelLi>
                    <strong className="text-foreground/90">5. Gráficos:</strong>
                </PanelLi>
            </PanelUl>
            <PanelUl className="mt-0 pl-8">
                <PanelLi>
                    <strong className="text-foreground/90">Integrados</strong> (Intel, AMD).
                </PanelLi>
                <PanelLi>
                    <strong className="text-foreground/90">Dedicados</strong> (NVIDIA, AMD).
                </PanelLi>
            </PanelUl>
            <PanelUl>
                <PanelLi>
                    <strong className="text-foreground/90">6. Batería:</strong> duración (horas), capacidad (mAh).
                </PanelLi>
                <PanelLi>
                    <strong className="text-foreground/90">7. Conectividad:</strong> Wi-Fi, Bluetooth, USB, HDMI.
                </PanelLi>
                <PanelLi>
                    <strong className="text-foreground/90">8. Sistema operativo:</strong> Windows, macOS, Linux.
                </PanelLi>
            </PanelUl>
        </div>
    );
}

function InformacionMetaQuest() {
    return (
        <div className="space-y-1">
            <h3 className="mb-2 text-base font-bold text-foreground">Meta Quest 3</h3>
            <PanelUl>
                <PanelLi>
                    <strong className="text-foreground/90">Jugar juegos inmersivos:</strong> explora mundos virtuales,
                    juega con amigos o compite en juegos de realidad virtual.
                </PanelLi>
                <PanelLi>
                    <strong className="text-foreground/90">Ver películas y series:</strong> disfruta de contenido en una
                    pantalla gigante virtual, como si estuvieras en un cine.
                </PanelLi>
                <PanelLi>
                    <strong className="text-foreground/90">Explorar experiencias educativas:</strong> visita lugares
                    históricos, explora el espacio o aprende habilidades nuevas de manera interactiva.
                </PanelLi>
                <PanelLi>
                    <strong className="text-foreground/90">Conectar con amigos:</strong> reúnete con amigos en espacios
                    virtuales y haz cosas juntos, como jugar juegos o ver películas.
                </PanelLi>
                <PanelLi>
                    <strong className="text-foreground/90">Crear contenido:</strong> usa herramientas de creación para
                    hacer tus propias experiencias de realidad virtual.
                </PanelLi>
            </PanelUl>
        </div>
    );
}

function InformacionTablet() {
    return (
        <div className="space-y-1">
            <h3 className="mb-2 text-base font-bold text-foreground">Tablet</h3>
            <PanelUl>
                <PanelLi>
                    <strong className="text-foreground/90">Navegar por internet:</strong> accede a tus sitios web
                    favoritos y busca información en línea.
                </PanelLi>
                <PanelLi>
                    <strong className="text-foreground/90">Ver películas y series:</strong> disfruta de contenido en
                    streaming como Netflix, YouTube, etc.
                </PanelLi>
                <PanelLi>
                    <strong className="text-foreground/90">Jugar juegos:</strong> hay miles de juegos disponibles para
                    tablets, desde juegos casuales hasta juegos más complejos.
                </PanelLi>
                <PanelLi>
                    <strong className="text-foreground/90">Leer libros y revistas:</strong> descarga aplicaciones de
                    lectura y accede a miles de títulos.
                </PanelLi>
                <PanelLi>
                    <strong className="text-foreground/90">Trabajar y estudiar:</strong> puedes usar aplicaciones de
                    productividad como Microsoft Office o Google Docs para trabajar o hacer tareas.
                </PanelLi>
                <PanelLi>
                    <strong className="text-foreground/90">Tomar fotos y videos:</strong> muchas tablets tienen cámaras
                    integradas para capturar momentos.
                </PanelLi>
                <PanelLi>
                    <strong className="text-foreground/90">Conectar con amigos:</strong> usa aplicaciones de mensajería
                    o redes sociales para mantener contacto.
                </PanelLi>
            </PanelUl>
        </div>
    );
}

export default function Computer3D() {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);
    const animationRef = useRef(0);
    const modeloRef = useRef(null);
    const mixerRef = useRef(null);
    const clockRef = useRef(null);
    const loadGenRef = useRef(0);
    const raycasterRef = useRef(new THREE.Raycaster());
    const pointerRef = useRef(new THREE.Vector2());
    const loaderRef = useRef(new GLTFLoader());

    const [variante, setVariante] = useState("computer");
    const [cargando, setCargando] = useState(true);
    const [parteNombre, setParteNombre] = useState("");

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return undefined;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0c0d12);
        sceneRef.current = scene;

        const width = mount.clientWidth || 640;
        const height = mount.clientHeight || 400;

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 200);
        camera.position.set(0, 0.6, 4.2);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        mount.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.target.set(0, 0, 0);
        controls.minDistance = 1.2;
        controls.maxDistance = 14;
        controlsRef.current = controls;

        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const key = new THREE.DirectionalLight(0xffffff, 1.05);
        key.position.set(4, 8, 6);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0xaabbff, 0.35);
        fill.position.set(-5, 2, -4);
        scene.add(fill);

        clockRef.current = new THREE.Clock();

        const loop = () => {
            animationRef.current = requestAnimationFrame(loop);
            const delta = clockRef.current?.getDelta() ?? 0;
            if (mixerRef.current) mixerRef.current.update(delta);
            controls.update();
            renderer.render(scene, camera);
        };
        loop();

        const onResize = () => {
            const w = mount.clientWidth || width;
            const h = mount.clientHeight || height;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener("resize", onResize);
        const ro = new ResizeObserver(onResize);
        ro.observe(mount);

        const onPointerDown = (event) => {
            const modelo = modeloRef.current;
            const cam = cameraRef.current;
            if (!modelo || !cam || !rendererRef.current) return;

            const rect = rendererRef.current.domElement.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            pointerRef.current.set(x, y);

            raycasterRef.current.setFromCamera(pointerRef.current, cam);
            const hits = raycasterRef.current.intersectObject(modelo, true);
            if (hits.length > 0) {
                let o = hits[0].object;
                while (o && (!o.name || o.name === RAIZ_NOMBRE) && o.parent) {
                    o = o.parent;
                }
                const nombre = o?.name && o.name !== RAIZ_NOMBRE ? o.name.trim() : "";
                setParteNombre(nombre || "(sin nombre)");
            } else {
                setParteNombre("");
            }
        };

        renderer.domElement.addEventListener("pointerdown", onPointerDown);

        return () => {
            loadGenRef.current += 1;
            cancelAnimationFrame(animationRef.current);
            ro.disconnect();
            window.removeEventListener("resize", onResize);
            renderer.domElement.removeEventListener("pointerdown", onPointerDown);
            controls.dispose();

            if (mixerRef.current) {
                mixerRef.current.stopAllAction();
                mixerRef.current = null;
            }
            clockRef.current = null;

            const m = modeloRef.current;
            if (m) {
                scene.remove(m);
                disposeModel(m);
                modeloRef.current = null;
            }

            renderer.dispose();
            if (renderer.domElement.parentNode === mount) {
                mount.removeChild(renderer.domElement);
            }
            sceneRef.current = null;
            cameraRef.current = null;
            rendererRef.current = null;
            controlsRef.current = null;
        };
    }, []);

    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return undefined;

        loadGenRef.current += 1;
        const gen = loadGenRef.current;

        setCargando(true);
        setParteNombre("");

        if (mixerRef.current) {
            mixerRef.current.stopAllAction();
            mixerRef.current = null;
        }
        const anterior = modeloRef.current;
        if (anterior) {
            scene.remove(anterior);
            disposeModel(anterior);
            modeloRef.current = null;
        }

        const ruta = RUTAS_MODELO[variante];
        if (!ruta) {
            setCargando(false);
            return undefined;
        }

        loaderRef.current.load(
            ruta,
            (gltf) => {
                if (gen !== loadGenRef.current) {
                    disposeModel(gltf.scene);
                    return;
                }
                const root = gltf.scene;
                root.name = RAIZ_NOMBRE;
                fitAndCenterObject(root, TARGET_SIZE_MODELO[variante] ?? 2.4);
                scene.add(root);
                modeloRef.current = root;

                if (gltf.animations?.length) {
                    const mixer = new THREE.AnimationMixer(root);
                    gltf.animations.forEach((clip) => {
                        const action = mixer.clipAction(clip);
                        action.setLoop(THREE.LoopRepeat, Infinity);
                        action.clampWhenFinished = false;
                        action.play();
                    });
                    mixerRef.current = mixer;
                }

                const cam = cameraRef.current;
                const ctl = controlsRef.current;
                if (cam && ctl) {
                    cam.position.set(0, 0.6, 4.2);
                    ctl.target.set(0, 0, 0);
                    ctl.update();
                }

                setCargando(false);
            },
            undefined,
            () => {
                if (gen === loadGenRef.current) setCargando(false);
            },
        );

        return () => {
            loadGenRef.current += 1;
        };
    }, [variante]);

    return (
        <div className="flex w-full max-w-6xl flex-col gap-3">
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => setVariante("computer")}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        variante === "computer"
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-white/15 bg-white/5 text-foreground hover:bg-white/10"
                    }`}
                >
                    PC de escritorio
                </button>
                <button
                    type="button"
                    onClick={() => setVariante("laptop")}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        variante === "laptop"
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-white/15 bg-white/5 text-foreground hover:bg-white/10"
                    }`}
                >
                    Laptop
                </button>
                <button
                    type="button"
                    onClick={() => setVariante("metaQuest")}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        variante === "metaQuest"
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-white/15 bg-white/5 text-foreground hover:bg-white/10"
                    }`}
                >
                    Meta Quest
                </button>
                <button
                    type="button"
                    onClick={() => setVariante("tablet")}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        variante === "tablet"
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-white/15 bg-white/5 text-foreground hover:bg-white/10"
                    }`}
                >
                    Tablet
                </button>
            </div>

            <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,400px)]">
                <div className="flex min-w-0 flex-col gap-3">
                    <div
                        ref={mountRef}
                        className="relative h-[min(50vh,420px)] w-full overflow-hidden rounded-xl border border-white/10 bg-[#0c0d12]"
                        style={{ minHeight: 320 }}
                    />

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {cargando && <span>Cargando modelo…</span>}
                        {!cargando && parteNombre && (
                            <span className="font-medium text-foreground">
                                Parte: <span className="text-primary">{parteNombre}</span>
                            </span>
                        )}
                        {!cargando && !parteNombre && (
                            <span>Arrastra para rotar · rueda para zoom · clic en el modelo para ver nombre de la parte</span>
                        )}
                    </div>
                </div>

                <aside
                    className="max-h-[min(70vh,620px)] overflow-y-auto rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm"
                    aria-label="Información — Computer 3D"
                >
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">
                        Información
                    </p>
                    {variante === "laptop" ? (
                        <InformacionLaptop />
                    ) : variante === "metaQuest" ? (
                        <InformacionMetaQuest />
                    ) : variante === "tablet" ? (
                        <InformacionTablet />
                    ) : (
                        <InformacionComputer />
                    )}
                </aside>
            </div>
        </div>
    );
}

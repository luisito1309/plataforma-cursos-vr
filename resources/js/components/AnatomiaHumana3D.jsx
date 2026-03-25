import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const modelos = {
    piel: "/models/piel.glb",
    respiratorio: "/models/respiratorio.glb",
    nervioso: "/models/nervioso.glb",
    esqueleto: "/models/esqueleto.glb",
    muscular: "/models/muscular.glb",
    organos: "/models/organos.glb",
};

const SISTEMAS = [
    { key: "piel", label: "Piel" },
    { key: "respiratorio", label: "Sistema respiratorio" },
    { key: "nervioso", label: "Sistema nervioso" },
    { key: "esqueleto", label: "Sistema esquelético" },
    { key: "muscular", label: "Sistema muscular" },
    { key: "organos", label: "Órganos" },
];

function PanelTexto({ children, className = "" }) {
    return <p className={`text-muted-foreground leading-relaxed ${className}`}>{children}</p>;
}

function PanelH({ children }) {
    return <h4 className="mt-3 text-sm font-semibold text-foreground first:mt-0">{children}</h4>;
}

function PanelUl({ children }) {
    return <ul className="mt-1 list-disc space-y-1 pl-4 text-muted-foreground">{children}</ul>;
}

function PanelLi({ children }) {
    return <li className="leading-snug">{children}</li>;
}

function PanelSub({ children }) {
    return <p className="mt-2 text-xs font-medium text-foreground/90">{children}</p>;
}

function InformacionSistema({ sistema }) {
    switch (sistema) {
        case "piel":
            return (
                <div className="space-y-1">
                    <h3 className="mb-2 text-base font-bold text-foreground">La piel</h3>
                    <PanelUl>
                        <PanelLi>
                            Órgano más grande del cuerpo (1,5–2 m², ~15% del peso corporal).
                        </PanelLi>
                    </PanelUl>
                    <PanelH>Funciones clave</PanelH>
                    <PanelUl>
                        <PanelLi>
                            <strong className="text-foreground/90">Protección:</strong> barrera contra
                            lesiones, infecciones, UV y químicos.
                        </PanelLi>
                        <PanelLi>
                            <strong className="text-foreground/90">Regulación térmica:</strong> sudor y
                            vasoconstricción/vasodilatación.
                        </PanelLi>
                        <PanelLi>
                            <strong className="text-foreground/90">Sensación:</strong> receptores para tacto,
                            dolor, presión y temperatura.
                        </PanelLi>
                        <PanelLi>
                            <strong className="text-foreground/90">Inmunológica:</strong> células que detectan
                            patógenos.
                        </PanelLi>
                    </PanelUl>
                    <PanelH>Capas</PanelH>
                    <PanelSub>1. Epidermis</PanelSub>
                    <PanelUl>
                        <PanelLi>Capa córnea (células muertas, queratina).</PanelLi>
                        <PanelLi>Renueva células cada ~28 días.</PanelLi>
                    </PanelUl>
                    <PanelSub>2. Dermis</PanelSub>
                    <PanelUl>
                        <PanelLi>Vasos sanguíneos y linfáticos.</PanelLi>
                        <PanelLi>Nervios, folículos pilosos y glándulas.</PanelLi>
                        <PanelLi>Colágeno y elastina (firmeza y elasticidad).</PanelLi>
                    </PanelUl>
                    <PanelSub>3. Hipodermis (subcutánea)</PanelSub>
                    <PanelUl>
                        <PanelLi>Grasa (aislamiento, energía).</PanelLi>
                        <PanelLi>Tejido conectivo.</PanelLi>
                    </PanelUl>
                    <PanelH>Anexos</PanelH>
                    <PanelTexto>Pelo, uñas, glándulas sudoríparas y sebáceas.</PanelTexto>
                </div>
            );
        case "respiratorio":
            return (
                <div className="space-y-1">
                    <h3 className="mb-2 text-base font-bold text-foreground">Sistema respiratorio</h3>
                    <PanelTexto>
                        <strong className="text-foreground/90">Función principal:</strong> intercambio de gases
                        (O₂ y CO₂).
                    </PanelTexto>
                    <PanelH>Componentes</PanelH>
                    <PanelSub>1. Vías respiratorias</PanelSub>
                    <PanelUl>
                        <PanelLi>
                            <strong className="text-foreground/90">Nariz/boca:</strong> filtra, calienta y
                            humedece el aire.
                        </PanelLi>
                        <PanelLi>
                            <strong className="text-foreground/90">Faringe:</strong> conducto común.
                        </PanelLi>
                        <PanelLi>
                            <strong className="text-foreground/90">Laringe:</strong> contiene las cuerdas
                            vocales.
                        </PanelLi>
                        <PanelLi>
                            <strong className="text-foreground/90">Tráquea:</strong> cartílagos en forma de C.
                        </PanelLi>
                        <PanelLi>
                            <strong className="text-foreground/90">Bronquios:</strong> ramificaciones en los
                            pulmones.
                        </PanelLi>
                        <PanelLi>
                            <strong className="text-foreground/90">Bronquiolos:</strong> controlan el flujo de
                            aire.
                        </PanelLi>
                    </PanelUl>
                    <PanelSub>2. Pulmones</PanelSub>
                    <PanelUl>
                        <PanelLi>
                            <strong className="text-foreground/90">Alvéolos:</strong> intercambio de O₂ y CO₂.
                        </PanelLi>
                        <PanelLi>
                            <strong className="text-foreground/90">Pleura:</strong> membrana que rodea los
                            pulmones.
                        </PanelLi>
                    </PanelUl>
                    <PanelH>Mecanismo</PanelH>
                    <PanelUl>
                        <PanelLi>
                            <strong className="text-foreground/90">Inspiración:</strong> el diafragma baja y los
                            pulmones se expanden.
                        </PanelLi>
                        <PanelLi>
                            <strong className="text-foreground/90">Espiración:</strong> el diafragma sube y los
                            pulmones se contraen.
                        </PanelLi>
                    </PanelUl>
                    <PanelH>Control nervioso</PanelH>
                    <PanelTexto>El bulbo raquídeo regula el ritmo respiratorio.</PanelTexto>
                </div>
            );
        case "nervioso":
            return (
                <div className="space-y-1">
                    <h3 className="mb-2 text-base font-bold text-foreground">Sistema nervioso</h3>
                    <PanelTexto>
                        <strong className="text-foreground/90">Función principal:</strong> control y coordinación
                        del cuerpo.
                    </PanelTexto>
                    <PanelH>Divisiones</PanelH>
                    <PanelSub>1. Sistema nervioso central (SNC)</PanelSub>
                    <PanelUl>
                        <PanelLi>
                            <strong className="text-foreground/90">Cerebro:</strong> procesa información y
                            controla funciones.
                        </PanelLi>
                        <PanelLi>
                            <strong className="text-foreground/90">Médula espinal:</strong> transmite señales.
                        </PanelLi>
                    </PanelUl>
                    <PanelSub>2. Sistema nervioso periférico (SNP)</PanelSub>
                    <PanelUl>
                        <PanelLi>
                            <strong className="text-foreground/90">Nervios:</strong> conectan el SNC con el
                            cuerpo.
                        </PanelLi>
                        <PanelLi>
                            <strong className="text-foreground/90">Sistema somático:</strong> movimientos
                            voluntarios.
                        </PanelLi>
                        <PanelLi>
                            <strong className="text-foreground/90">Sistema autónomo:</strong> funciones
                            involuntarias (corazón, digestión, etc.).
                        </PanelLi>
                    </PanelUl>
                    <PanelH>Células clave</PanelH>
                    <PanelUl>
                        <PanelLi>
                            <strong className="text-foreground/90">Neuronas:</strong> transmiten señales.
                        </PanelLi>
                        <PanelLi>
                            <strong className="text-foreground/90">Glía:</strong> soporte y protección.
                        </PanelLi>
                    </PanelUl>
                    <PanelH>Funciones</PanelH>
                    <PanelUl>
                        <PanelLi>Procesar información sensorial.</PanelLi>
                        <PanelLi>Coordinar movimientos.</PanelLi>
                        <PanelLi>Regular funciones vitales.</PanelLi>
                    </PanelUl>
                </div>
            );
        case "esqueleto":
            return (
                <div className="space-y-1">
                    <h3 className="mb-2 text-base font-bold text-foreground">Sistema esquelético</h3>
                    <PanelTexto>
                        <strong className="text-foreground/90">Función principal:</strong> soporte, protección y
                        movimiento.
                    </PanelTexto>
                    <PanelH>Componentes</PanelH>
                    <PanelSub>1. Huesos (206 en adultos)</PanelSub>
                    <PanelUl>
                        <PanelLi>
                            <strong className="text-foreground/90">Axiales:</strong> cráneo, vértebras, costillas
                            y esternón.
                        </PanelLi>
                        <PanelLi>
                            <strong className="text-foreground/90">Apendiculares:</strong> extremidades y cinturas
                            (hombro, cadera).
                        </PanelLi>
                    </PanelUl>
                    <PanelSub>2. Articulaciones</PanelSub>
                    <PanelTexto className="!mt-1">
                        Conexiones entre huesos (móviles o fijas).
                    </PanelTexto>
                    <PanelSub>3. Cartílagos</PanelSub>
                    <PanelTexto className="!mt-1">Amortiguan y suavizan los movimientos.</PanelTexto>
                    <PanelH>Funciones</PanelH>
                    <PanelUl>
                        <PanelLi>Soporte estructural.</PanelLi>
                        <PanelLi>Protección de órganos (cráneo, costillas).</PanelLi>
                        <PanelLi>Movimiento (junto con los músculos).</PanelLi>
                        <PanelLi>
                            Almacén de calcio y médula ósea (producción de células sanguíneas).
                        </PanelLi>
                    </PanelUl>
                    <PanelH>Tipos de huesos</PanelH>
                    <PanelTexto>Largos, cortos, planos e irregulares.</PanelTexto>
                </div>
            );
        case "muscular":
            return (
                <div className="space-y-1">
                    <h3 className="mb-2 text-base font-bold text-foreground">Sistema muscular</h3>
                    <PanelTexto>
                        <strong className="text-foreground/90">Función principal:</strong> movimiento, postura y
                        estabilidad.
                    </PanelTexto>
                    <PanelH>Tipos de músculos</PanelH>
                    <PanelSub>1. Músculos esqueléticos (voluntarios)</PanelSub>
                    <PanelUl>
                        <PanelLi>Se unen a huesos.</PanelLi>
                        <PanelLi>~650 músculos (~40% del peso corporal).</PanelLi>
                        <PanelLi>
                            <strong className="text-foreground/90">Ej.:</strong> bíceps, cuádriceps.
                        </PanelLi>
                    </PanelUl>
                    <PanelSub>2. Músculos lisos (involuntarios)</PanelSub>
                    <PanelUl>
                        <PanelLi>Paredes de órganos (intestinos, vasos).</PanelLi>
                        <PanelLi>Controlan movimientos internos.</PanelLi>
                    </PanelUl>
                    <PanelSub>3. Músculo cardíaco (involuntario)</PanelSub>
                    <PanelUl>
                        <PanelLi>Corazón: bombea sangre.</PanelLi>
                    </PanelUl>
                    <PanelH>Componentes</PanelH>
                    <PanelUl>
                        <PanelLi>
                            <strong className="text-foreground/90">Fibras musculares:</strong> células alargadas.
                        </PanelLi>
                        <PanelLi>
                            <strong className="text-foreground/90">Tendones:</strong> conectan músculos a huesos.
                        </PanelLi>
                    </PanelUl>
                    <PanelH>Funciones clave</PanelH>
                    <PanelUl>
                        <PanelLi>Movimiento.</PanelLi>
                        <PanelLi>Postura y equilibrio.</PanelLi>
                        <PanelLi>Producción de calor.</PanelLi>
                    </PanelUl>
                </div>
            );
        case "organos":
            return (
                <div className="space-y-1">
                    <h3 className="mb-2 text-base font-bold text-foreground">Órganos del cuerpo humano</h3>
                    <PanelTexto>
                        <strong className="text-foreground/90">Definición:</strong> estructuras especializadas
                        con funciones específicas.
                    </PanelTexto>
                    <PanelH>Principales órganos y funciones</PanelH>
                    <PanelSub>1. Cerebro (SNC)</PanelSub>
                    <PanelUl>
                        <PanelLi>Controla pensamientos, emociones y movimientos.</PanelLi>
                        <PanelLi>Regula funciones vitales (respiración, latido).</PanelLi>
                    </PanelUl>
                    <PanelSub>2. Corazón (circulatorio)</PanelSub>
                    <PanelUl>
                        <PanelLi>Bombea sangre a todo el cuerpo (~5 L/min).</PanelLi>
                        <PanelLi>Cuatro cámaras: dos aurículas y dos ventrículos.</PanelLi>
                    </PanelUl>
                    <PanelSub>3. Pulmones (respiratorio)</PanelSub>
                    <PanelUl>
                        <PanelLi>Intercambio de O₂ y CO₂ en alvéolos.</PanelLi>
                        <PanelLi>~300 millones de alvéolos.</PanelLi>
                    </PanelUl>
                    <PanelSub>4. Hígado (digestivo/metabolismo)</PanelSub>
                    <PanelUl>
                        <PanelLi>Desintoxica, produce bilis, almacena glucógeno.</PanelLi>
                        <PanelLi>~500 funciones conocidas.</PanelLi>
                    </PanelUl>
                    <PanelSub>5. Riñones (urinario)</PanelSub>
                    <PanelUl>
                        <PanelLi>Filtran sangre (~200 L/día).</PanelLi>
                        <PanelLi>Eliminan desechos (urea, creatinina).</PanelLi>
                    </PanelUl>
                    <PanelSub>6. Estómago e intestinos (digestivo)</PanelSub>
                    <PanelUl>
                        <PanelLi>
                            <strong className="text-foreground/90">Estómago:</strong> digestión con ácido y
                            enzimas.
                        </PanelLi>
                        <PanelLi>
                            <strong className="text-foreground/90">Intestinos:</strong> absorción de nutrientes.
                        </PanelLi>
                    </PanelUl>
                    <PanelSub>7. Páncreas (endocrino/digestivo)</PanelSub>
                    <PanelUl>
                        <PanelLi>Insulina (regula glucosa).</PanelLi>
                        <PanelLi>Enzimas digestivas.</PanelLi>
                    </PanelUl>
                    <PanelSub>8. Bazo (inmunológico)</PanelSub>
                    <PanelUl>
                        <PanelLi>Filtra sangre y almacena glóbulos rojos.</PanelLi>
                        <PanelLi>Participa en la respuesta inmune.</PanelLi>
                    </PanelUl>
                    <PanelSub>9. Órganos reproductores</PanelSub>
                    <PanelUl>
                        <PanelLi>
                            Gónadas (ovarios/testículos): reproducción y hormonas.
                        </PanelLi>
                    </PanelUl>
                </div>
            );
        default:
            return null;
    }
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

function fitAndCenterObject(object, targetSize = 2.2) {
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

export default function AnatomiaHumana3D() {
    const mountRef = useRef(null);

    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);
    const animationRef = useRef(0);
    const mixerRef = useRef(null);
    const clockRef = useRef(new THREE.Clock());
    const modeloActualRef = useRef(null);
    const loadGenRef = useRef(0);
    const raycasterRef = useRef(new THREE.Raycaster());
    const pointerRef = useRef(new THREE.Vector2());
    const loaderRef = useRef(new GLTFLoader());

    const annotationSpriteRef = useRef(null);
    const highlightedRootRef = useRef(null);
    const originalMaterialStateRef = useRef(new Map());

    const [sistema, setSistema] = useState("piel");
    const [organoNombre, setOrganoNombre] = useState("");
    const [cargando, setCargando] = useState(false);

    const cargarModelo = useCallback((ruta) => {
        const scene = sceneRef.current;
        if (!scene) return;

        loadGenRef.current += 1;
        const gen = loadGenRef.current;

        const anterior = modeloActualRef.current;
        if (anterior) {
            scene.remove(anterior);
            disposeModel(anterior);
            modeloActualRef.current = null;
        }

        // Limpiar resaltado y anotación visible.
        if (annotationSpriteRef.current) {
            const old = annotationSpriteRef.current;
            scene.remove(old);
            old?.material?.map?.dispose?.();
            old?.material?.dispose?.();
            annotationSpriteRef.current = null;
        }
        highlightedRootRef.current = null;
        originalMaterialStateRef.current.clear();

        if (mixerRef.current) {
            mixerRef.current.stopAllAction();
            mixerRef.current = null;
        }

        setCargando(true);
        setOrganoNombre("");

        loaderRef.current.load(
            ruta,
            (gltf) => {
                if (gen !== loadGenRef.current) {
                    disposeModel(gltf.scene);
                    return;
                }

                const root = gltf.scene;
                root.name = "modelo_anatomia_root";
                fitAndCenterObject(root, 2.2);
                scene.add(root);
                modeloActualRef.current = root;

                // Si el GLB trae animaciones, reproducirlas automáticamente.
                if (gltf.animations && gltf.animations.length > 0) {
                    const mixer = new THREE.AnimationMixer(root);
                    gltf.animations.forEach((clip) => {
                        const action = mixer.clipAction(clip);
                        action.reset();
                        action.play();
                    });
                    mixerRef.current = mixer;
                } else {
                    mixerRef.current = null;
                }

                setCargando(false);
            },
            undefined,
            () => {
                if (gen === loadGenRef.current) setCargando(false);
            },
        );
    }, []);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return undefined;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0c0d12);
        sceneRef.current = scene;

        const width = mount.clientWidth || 640;
        const height = mount.clientHeight || 400;

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 200);
        camera.position.set(0, 0.5, 4);
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
        controlsRef.current = controls;

        scene.add(new THREE.AmbientLight(0xffffff, 0.65));
        const key = new THREE.DirectionalLight(0xffffff, 1.1);
        key.position.set(4, 8, 6);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0xaabbff, 0.35);
        fill.position.set(-5, 2, -4);
        scene.add(fill);

        const loop = () => {
            animationRef.current = requestAnimationFrame(loop);
            controls.update();
            if (mixerRef.current) mixerRef.current.update(clockRef.current.getDelta());

            // Asegura que la anotación "mirando a cámara" se vea siempre legible.
            if (annotationSpriteRef.current && cameraRef.current) {
                annotationSpriteRef.current.quaternion.copy(cameraRef.current.quaternion);
            }
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
            const modelo = modeloActualRef.current;
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
                const tieneAnotacion = (obj) => {
                    if (!obj) return false;
                    const ud = obj.userData || {};
                    const byUserData =
                        Boolean(ud.annotation) || Boolean(ud.label) || Boolean(ud.name);
                    const byName = Boolean(obj.name) && obj.name !== "modelo_anatomia_root";
                    return byUserData || byName;
                };
                while (o && !tieneAnotacion(o) && o.parent) o = o.parent;

                const annotationText =
                    o?.userData?.annotation ||
                    o?.userData?.label ||
                    o?.userData?.name ||
                    (o?.name && o.name !== "modelo_anatomia_root" ? o.name.trim() : "");

                setOrganoNombre(annotationText || "(sin nombre)");

                // Limpia resaltado anterior.
                if (originalMaterialStateRef.current.size > 0) {
                    for (const [material, state] of originalMaterialStateRef.current.entries()) {
                        if (!material) continue;
                        if (state?.color && material.color) material.color.copy(state.color);
                        if (state?.emissive && material.emissive) material.emissive.copy(state.emissive);
                    }
                    originalMaterialStateRef.current.clear();
                }
                if (annotationSpriteRef.current) {
                    const old = annotationSpriteRef.current;
                    scene.remove(old);
                    old?.material?.map?.dispose?.();
                    old?.material?.dispose?.();
                    annotationSpriteRef.current = null;
                }

                // Resalta y muestra anotación en la posición seleccionada.
                if (annotationText) {
                    const spriteText = annotationText || "Parte seleccionada";
                    const highlightRoot = o?.isObject3D ? o : null;
                    highlightedRootRef.current = highlightRoot;

                    // Guarda estado de materiales y aplica un brillo temporal.
                    if (highlightRoot) {
                        highlightRoot.traverse((child) => {
                            if (!child?.isMesh) return;
                            const mats = child.material;
                            const materialList = Array.isArray(mats) ? mats : mats ? [mats] : [];
                            materialList.forEach((m) => {
                                if (!m) return;
                                if (!originalMaterialStateRef.current.has(m)) {
                                    originalMaterialStateRef.current.set(m, {
                                        color: m.color?.clone?.() || null,
                                        emissive: m.emissive?.clone?.() || null,
                                    });
                                }
                                if (m.emissive && m.emissive.setHex) m.emissive.setHex(0xffd54a);
                                if (m.color && m.color.setHex) m.color.setHex(0xfff1b8);
                            });
                        });
                    }

                    // Sprite 2D con canvas para texto (no requiere cambios en los GLB).
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                        const padding = 18;
                        ctx.font = "700 32px system-ui, -apple-system, Segoe UI, Roboto, Arial";
                        const text = spriteText.length > 26 ? `${spriteText.slice(0, 26)}...` : spriteText;
                        const metrics = ctx.measureText(text);
                        const textWidth = Math.ceil(metrics.width);
                        canvas.width = textWidth + padding * 2;
                        canvas.height = 56 + padding;

                        // Re-render para que el tamaño no afecte el layout.
                        ctx.font = "700 32px system-ui, -apple-system, Segoe UI, Roboto, Arial";
                        ctx.fillStyle = "rgba(12, 13, 18, 0.95)";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.strokeStyle = "rgba(255, 213, 74, 0.9)";
                        ctx.lineWidth = 3;
                        ctx.strokeRect(1.5, 1.5, canvas.width - 3, canvas.height - 3);
                        ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
                        ctx.textBaseline = "middle";
                        ctx.fillText(text, padding, canvas.height / 2 + 1);

                        const texture = new THREE.CanvasTexture(canvas);
                        texture.minFilter = THREE.LinearFilter;
                        const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
                        const sprite = new THREE.Sprite(spriteMaterial);

                        // Escala básica; ajusta perceptualmente a la cámara.
                        const dist = cam.position.distanceTo(hits[0].point);
                        const scale = Math.max(0.0018, Math.min(0.008, dist * 0.001));
                        sprite.scale.set(canvas.width * scale, canvas.height * scale, 1);

                        sprite.position.copy(hits[0].point);
                        sprite.position.y += 0.12;

                        annotationSpriteRef.current = sprite;
                        scene.add(sprite);
                    }
                }
            } else {
                setOrganoNombre("");
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

            const m = modeloActualRef.current;
            if (m) {
                scene.remove(m);
                disposeModel(m);
                modeloActualRef.current = null;
            }

            if (annotationSpriteRef.current) {
                scene.remove(annotationSpriteRef.current);
                annotationSpriteRef.current = null;
            }
            highlightedRootRef.current = null;
            originalMaterialStateRef.current.clear();

            if (mixerRef.current) {
                mixerRef.current.stopAllAction();
                mixerRef.current = null;
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
        cargarModelo(modelos[sistema]);
    }, [sistema, cargarModelo]);

    return (
        <div className="flex w-full max-w-6xl flex-col gap-3">
            <div className="flex flex-wrap gap-2">
                {SISTEMAS.map((s) => (
                    <button
                        key={s.key}
                        type="button"
                        onClick={() => setSistema(s.key)}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                            sistema === s.key
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-white/15 bg-white/5 text-foreground hover:bg-white/10"
                        }`}
                    >
                        {s.label}
                    </button>
                ))}
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
                        {!cargando && organoNombre && (
                            <span className="font-medium text-foreground">
                                Órgano / parte: <span className="text-primary">{organoNombre}</span>
                            </span>
                        )}
                        {!cargando && !organoNombre && (
                            <span>Haz clic sobre el modelo para identificar una parte.</span>
                        )}
                    </div>
                </div>

                <aside
                    className="max-h-[min(70vh,620px)] overflow-y-auto rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm"
                    aria-label="Información del sistema seleccionado"
                >
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">
                        Información
                    </p>
                    <InformacionSistema sistema={sistema} />
                </aside>
            </div>
        </div>
    );
}

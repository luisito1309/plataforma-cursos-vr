import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * API futura (axios):
 * const [lista, setLista] = useState(preguntas);
 * useEffect(() => { axios.get("/api/quiz-medico").then((r) => setLista(r.data)); }, []);
 */

export const preguntas = [
    {
        pregunta: "¿Cuál es la función principal del corazón?",
        opciones: ["Filtrar la sangre", "Transportar oxígeno", "Bombear la sangre", "Producir hormonas"],
        correcta: "Bombear la sangre",
    },
    {
        pregunta: "¿Qué órgano se encarga de la respiración?",
        opciones: ["Corazón", "Pulmones", "Riñones", "Estómago"],
        correcta: "Pulmones",
    },
    {
        pregunta: "¿Cuál es el órgano principal del sistema nervioso?",
        opciones: ["Corazón", "Hígado", "Cerebro", "Pulmón"],
        correcta: "Cerebro",
    },
    {
        pregunta: "¿Qué sistema da soporte al cuerpo?",
        opciones: ["Sistema digestivo", "Sistema nervioso", "Sistema esquelético", "Sistema circulatorio"],
        correcta: "Sistema esquelético",
    },
    {
        pregunta: "¿Dónde comienza la digestión?",
        opciones: ["Estómago", "Intestino", "Boca", "Hígado"],
        correcta: "Boca",
    },
    {
        pregunta: "¿Qué transporta la sangre?",
        opciones: ["Huesos", "Oxígeno y nutrientes", "Aire", "Hormonas únicamente"],
        correcta: "Oxígeno y nutrientes",
    },
    {
        pregunta: "¿Qué sistema defiende al cuerpo de enfermedades?",
        opciones: ["Sistema muscular", "Sistema digestivo", "Sistema inmunológico", "Sistema urinario"],
        correcta: "Sistema inmunológico",
    },
    {
        pregunta: "¿Qué órgano filtra la sangre y produce orina?",
        opciones: ["Pulmón", "Corazón", "Riñón", "Estómago"],
        correcta: "Riñón",
    },
    {
        pregunta: "¿Qué sistema permite el movimiento del cuerpo?",
        opciones: ["Sistema respiratorio", "Sistema muscular", "Sistema nervioso", "Sistema endocrino"],
        correcta: "Sistema muscular",
    },
    {
        pregunta: "¿Qué sistema produce hormonas?",
        opciones: ["Sistema digestivo", "Sistema endocrino", "Sistema circulatorio", "Sistema respiratorio"],
        correcta: "Sistema endocrino",
    },
];

/** Modelo 3D por índice de pregunta (0 = pregunta 1) */
const MODELOS_POR_PREGUNTA = [
    "/models/nervioso.glb",
    "/models/respiratorio.glb",
    "/models/cerebro.glb",
    "/models/esqueleto.glb",
    "/models/digestivos.glb",
    "/models/nervioso.glb",
    "/models/piel.glb",
    "/models/riñones.glb",
    "/models/piel.glb",
    "/models/organos.glb",
];

function modeloPorIndicePregunta(i) {
    return MODELOS_POR_PREGUNTA[i] ?? MODELOS_POR_PREGUNTA[0];
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

const AVANCE_MS = 1600;

/**
 * @param {{ preguntas?: Array<{ pregunta: string; opciones: string[]; correcta: string }> }} props
 */
export default function QuizMedico3D({ preguntas: preguntasProp }) {
    const lista = preguntasProp ?? preguntas;

    const mountRef = useRef(null);
    const advanceTimerRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const controlsRef = useRef(null);
    const modeloRootRef = useRef(null);
    const loadGenRef = useRef(0);
    const loaderRef = useRef(new GLTFLoader());

    const [indicePregunta, setIndicePregunta] = useState(0);
    const [puntaje, setPuntaje] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [juegoTerminado, setJuegoTerminado] = useState(false);
    const [esperandoAvance, setEsperandoAvance] = useState(false);

    const totalPreguntas = lista.length;
    const preguntaActual = totalPreguntas > 0 ? lista[indicePregunta] : null;

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return undefined;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0f1118);
        sceneRef.current = scene;

        const width = mount.clientWidth || 640;
        const height = mount.clientHeight || 320;

        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
        camera.position.set(0, 0.85, 4.2);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        mount.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.07;
        controls.target.set(0, 0, 0);
        controls.minDistance = 1.4;
        controls.maxDistance = 14;
        controls.maxPolarAngle = Math.PI * 0.95;
        controlsRef.current = controls;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffeecc, 1.2, 30);
        pointLight.position.set(2.5, 3.5, 3);
        scene.add(pointLight);

        const fillLight = new THREE.PointLight(0x6688ff, 0.4, 20);
        fillLight.position.set(-2, 1.5, 2);
        scene.add(fillLight);

        let animationFrameId = 0;

        const tick = () => {
            animationFrameId = requestAnimationFrame(tick);
            controls.update();
            renderer.render(scene, camera);
        };
        tick();

        const onResize = () => {
            const w = mount.clientWidth || width;
            const h = mount.clientHeight || height;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };

        window.addEventListener("resize", onResize);
        const resizeObserver = new ResizeObserver(onResize);
        resizeObserver.observe(mount);

        return () => {
            loadGenRef.current += 1;
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
            window.removeEventListener("resize", onResize);

            controls.dispose();
            controlsRef.current = null;

            const m = modeloRootRef.current;
            if (m) {
                scene.remove(m);
                disposeModel(m);
                modeloRootRef.current = null;
            }

            renderer.dispose();
            if (renderer.domElement.parentNode === mount) {
                mount.removeChild(renderer.domElement);
            }
            sceneRef.current = null;
            cameraRef.current = null;
            rendererRef.current = null;
        };
    }, []);

    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene || juegoTerminado) return undefined;

        loadGenRef.current += 1;
        const gen = loadGenRef.current;

        const anterior = modeloRootRef.current;
        if (anterior) {
            scene.remove(anterior);
            disposeModel(anterior);
            modeloRootRef.current = null;
        }

        const ruta = modeloPorIndicePregunta(indicePregunta);

        loaderRef.current.load(
            ruta,
            (gltf) => {
                if (gen !== loadGenRef.current) {
                    disposeModel(gltf.scene);
                    return;
                }
                const root = gltf.scene;
                root.name = "quiz_modelo_medico";
                fitAndCenterObject(root, 2.2);
                scene.add(root);
                modeloRootRef.current = root;

                const cam = cameraRef.current;
                const ctl = controlsRef.current;
                if (cam && ctl) {
                    cam.position.set(0, 0.85, 4.2);
                    ctl.target.set(0, 0, 0);
                    ctl.update();
                }
            },
            undefined,
            () => { },
        );

    }, [indicePregunta, juegoTerminado]);

    useEffect(() => {
        return () => {
            if (advanceTimerRef.current != null) {
                clearTimeout(advanceTimerRef.current);
                advanceTimerRef.current = null;
            }
        };
    }, []);

    const avanzar = () => {
        if (advanceTimerRef.current != null) {
            clearTimeout(advanceTimerRef.current);
            advanceTimerRef.current = null;
        }

        advanceTimerRef.current = window.setTimeout(() => {
            advanceTimerRef.current = null;
            setFeedback(null);
            setEsperandoAvance(false);

            setIndicePregunta((prev) => {
                const siguiente = prev + 1;
                if (siguiente >= totalPreguntas) {
                    setJuegoTerminado(true);
                    return prev;
                }
                return siguiente;
            });
        }, AVANCE_MS);
    };

    const manejarOpcion = (indiceOpcion) => {
        if (juegoTerminado || !preguntaActual || esperandoAvance) return;

        const elegida = preguntaActual.opciones[indiceOpcion];
        const esCorrecto = elegida === preguntaActual.correcta;
        setFeedback(esCorrecto ? "correcto" : "incorrecto");
        if (esCorrecto) {
            setPuntaje((p) => p + 1);
        }
        setEsperandoAvance(true);
        avanzar();
    };

    const reiniciar = () => {
        if (advanceTimerRef.current != null) {
            clearTimeout(advanceTimerRef.current);
            advanceTimerRef.current = null;
        }
        setIndicePregunta(0);
        setPuntaje(0);
        setFeedback(null);
        setJuegoTerminado(false);
        setEsperandoAvance(false);
    };

    if (totalPreguntas === 0) {
        return (
            <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-4 text-amber-100">
                No hay preguntas disponibles. Carga datos desde la API o revisa el array de preguntas.
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
            <div className="w-full">
                <div
                    ref={mountRef}
                    className="mx-auto h-[min(40vh,360px)] w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-[#0f1118] shadow-lg"
                    style={{ minHeight: 280 }}
                />
                <p className="mt-2 text-center text-xs text-muted-foreground">
                    Arrastra con el ratón para girar · rueda para acercar o alejar
                </p>
            </div>

            {!juegoTerminado && preguntaActual && (
                <div className="flex flex-col gap-3">
                    <p className="text-sm font-medium text-muted-foreground">
                        Pregunta {indicePregunta + 1} de {totalPreguntas}
                    </p>
                    <h2 className="text-lg font-semibold leading-snug text-foreground">
                        {preguntaActual.pregunta}
                    </h2>

                    <div className="grid gap-2 sm:grid-cols-2">
                        {preguntaActual.opciones.map((opcion, idx) => (
                            <button
                                key={`${indicePregunta}-${idx}`}
                                type="button"
                                disabled={esperandoAvance}
                                onClick={() => manejarOpcion(idx)}
                                className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-left text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {opcion}
                            </button>
                        ))}
                    </div>

                    {feedback && (
                        <p
                            className={
                                feedback === "correcto"
                                    ? "font-semibold text-emerald-400"
                                    : "font-semibold text-red-400"
                            }
                            role="status"
                            aria-live="polite"
                        >
                            {feedback === "correcto" ? "Correcto" : "Incorrecto"}
                        </p>
                    )}

                    <p className="text-sm text-muted-foreground">
                        Puntaje: <span className="font-semibold text-foreground">{puntaje}</span>
                    </p>
                </div>
            )}

            {juegoTerminado && (
                <div
                    className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-6"
                    role="region"
                    aria-label="Resultado final"
                >
                    <h3 className="text-xl font-bold text-foreground">Resultado final</h3>
                    <p className="text-foreground">
                        Has respondido correctamente{" "}
                        <span className="font-semibold text-primary">{puntaje}</span> de{" "}
                        <span className="font-semibold">{totalPreguntas}</span> preguntas.
                    </p>
                    <button
                        type="button"
                        onClick={reiniciar}
                        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                    >
                        Volver a jugar
                    </button>
                </div>
            )}
        </div>
    );
}
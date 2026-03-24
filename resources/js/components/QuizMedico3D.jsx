import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Preguntas de ejemplo. Sustituir por datos de API (Laravel) cuando corresponda.
 * Ejemplo de carga con axios:
 *
 * import axios from "axios";
 *
 * const [preguntas, setPreguntas] = useState(PREGUNTAS_MEDICAS_EJEMPLO);
 * useEffect(() => {
 *   axios
 *     .get("/api/quiz-medico")
 *     .then((res) => setPreguntas(res.data))
 *     .catch(() => {});
 * }, []);
 */
export const PREGUNTAS_MEDICAS_EJEMPLO = [
    {
        texto: "Paciente con fiebre, tos productiva y estertores crepitantes en base derecha. ¿Cuál es el diagnóstico más probable?",
        opciones: [
            "Neumonía adquirida en la comunidad",
            "Asma bronquial",
            "Embolia pulmonar",
            "Neumotórax espontáneo",
        ],
        respuestaCorrecta: 0,
    },
    {
        texto: "Mujer con dolor torácico opresivo irradiado a brazo izquierdo y sudoración fría. ECG con elevación del ST. ¿Qué sospecha prioritaria?",
        opciones: [
            "Pericarditis aguda",
            "Síndrome coronario agudo con elevación del ST",
            "Costocondritis",
            "Trastorno de ansiedad",
        ],
        respuestaCorrecta: 1,
    },
    {
        texto: "Paciente con poliuria, polidipsia y glucosa en ayunas 320 mg/dL. ¿Hallazgo diagnóstico clave?",
        opciones: [
            "Hipotiroidismo",
            "Diabetes mellitus tipo 2 descompensada",
            "Insuficiencia renal crónica",
            "Hiperparatiroidismo",
        ],
        respuestaCorrecta: 1,
    },
];

const AVANCE_MS = 1600;

/**
 * @param {{ preguntas?: Array<{ texto: string; opciones: string[]; respuestaCorrecta: number }> }} props
 */
export default function QuizMedico3D({ preguntas: preguntasProp }) {
    const preguntas = preguntasProp ?? PREGUNTAS_MEDICAS_EJEMPLO;

    const mountRef = useRef(null);
    const advanceTimerRef = useRef(null);

    const [indicePregunta, setIndicePregunta] = useState(0);
    const [puntaje, setPuntaje] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [juegoTerminado, setJuegoTerminado] = useState(false);
    const [esperandoAvance, setEsperandoAvance] = useState(false);

    const totalPreguntas = preguntas.length;
    const preguntaActual = totalPreguntas > 0 ? preguntas[indicePregunta] : null;

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return undefined;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0f1118);

        const width = mount.clientWidth || 640;
        const height = mount.clientHeight || 320;

        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
        camera.position.set(0, 1.1, 4.2);
        camera.lookAt(0, 0.6, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        mount.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffeecc, 1.2, 30);
        pointLight.position.set(2.5, 3.5, 3);
        scene.add(pointLight);

        const fillLight = new THREE.PointLight(0x6688ff, 0.4, 20);
        fillLight.position.set(-2, 1.5, 2);
        scene.add(fillLight);

        const sueloGeo = new THREE.PlaneGeometry(8, 8);
        const sueloMat = new THREE.MeshStandardMaterial({
            color: 0x1a1d28,
            roughness: 0.9,
            metalness: 0.05,
        });
        const suelo = new THREE.Mesh(sueloGeo, sueloMat);
        suelo.rotation.x = -Math.PI / 2;
        suelo.position.y = -0.01;
        scene.add(suelo);

        const cuerpoGeo = new THREE.CapsuleGeometry(0.45, 1.15, 8, 16);
        const cuerpoMat = new THREE.MeshStandardMaterial({
            color: 0x6eb5ff,
            roughness: 0.45,
            metalness: 0.1,
        });
        const paciente = new THREE.Mesh(cuerpoGeo, cuerpoMat);
        paciente.position.set(0, 0.85, 0);
        scene.add(paciente);

        const cabezaGeo = new THREE.SphereGeometry(0.32, 24, 24);
        const cabezaMat = new THREE.MeshStandardMaterial({
            color: 0xffcdb0,
            roughness: 0.55,
        });
        const cabeza = new THREE.Mesh(cabezaGeo, cabezaMat);
        cabeza.position.set(0, 1.75, 0);
        scene.add(cabeza);

        let animationFrameId = 0;
        const clock = new THREE.Clock();

        const tick = () => {
            animationFrameId = requestAnimationFrame(tick);
            const t = clock.getElapsedTime();
            paciente.rotation.y = Math.sin(t * 0.6) * 0.35 + t * 0.25;
            cabeza.rotation.y = paciente.rotation.y * 0.8;
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
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
            window.removeEventListener("resize", onResize);

            scene.remove(paciente, cabeza, suelo);
            cuerpoGeo.dispose();
            cuerpoMat.dispose();
            cabezaGeo.dispose();
            cabezaMat.dispose();
            sueloGeo.dispose();
            sueloMat.dispose();

            renderer.dispose();
            if (renderer.domElement.parentNode === mount) {
                mount.removeChild(renderer.domElement);
            }
        };
    }, []);

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

        const esCorrecto = indiceOpcion === preguntaActual.respuestaCorrecta;
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
        <div className="flex w-full max-w-3xl flex-col gap-4">
            <div
                ref={mountRef}
                className="h-[min(40vh,360px)] w-full overflow-hidden rounded-xl border border-white/10 bg-[#0f1118] shadow-lg"
                style={{ minHeight: 280 }}
            />

            {!juegoTerminado && preguntaActual && (
                <div className="flex flex-col gap-3">
                    <p className="text-sm font-medium text-muted-foreground">
                        Pregunta {indicePregunta + 1} de {totalPreguntas}
                    </p>
                    <h2 className="text-lg font-semibold leading-snug text-foreground">
                        {preguntaActual.texto}
                    </h2>

                    <div className="grid gap-2 sm:grid-cols-2">
                        {preguntaActual.opciones.map((opcion, idx) => (
                            <button
                                key={`${indicePregunta}-${idx}`}
                                type="button"
                                disabled={esperandoAvance}
                                onClick={() => manejarOpcion(idx)}
                                className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-left text-sm transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
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

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
    {
        texto: "Varón joven con dolor periumbilical que migra a FID, fiebre y leucocitosis. ¿Diagnóstico más probable?",
        opciones: [
            "Gastroenteritis viral",
            "Apendicitis aguda",
            "Colecistitis aguda",
            "Ureterolitiasis derecha",
        ],
        respuestaCorrecta: 1,
    },
    {
        texto: "Paciente con disnea de esfuerzo, ortopnea, edemas en miembros inferiores y estertores bibasales. ¿Síndrome clínico principal?",
        opciones: [
            "EPOC estable",
            "Insuficiencia cardíaca congestiva",
            "Embolia pulmonar masiva",
            "Neumotórax a tensión",
        ],
        respuestaCorrecta: 1,
    },
    {
        texto: "Mujer con fiebre, dolor hipogástrico, flujo vaginal purulento y signos de irritación peritoneal leve. ¿Primera sospecha?",
        opciones: [
            "Enfermedad inflamatoria pélvica",
            "Apendicitis retrocecal",
            "Cistitis simple",
            "Endometriosis",
        ],
        respuestaCorrecta: 0,
    },
    {
        texto: "Paciente con ictericia, dolor en hipocondrio derecho postprandial y leucocitosis. Ecografía: litiasis y pared vesicular gruesa. ¿Diagnóstico?",
        opciones: [
            "Hepatitis viral aguda",
            "Colecistitis aguda litiásica",
            "Pancreatitis aguda biliar",
            "Colangitis ascendente",
        ],
        respuestaCorrecta: 1,
    },
    {
        texto: "Fumador con tos crónica, disnea progresiva y enfisema en TAC. Exacerbación con aumento de purulencia del esputo. ¿Cuál es el cuadro de base?",
        opciones: [
            "Asma persistente grave",
            "EPOC con exacerbación infecciosa",
            "Fibrosis pulmonar idiopática",
            "Bronquiectasias",
        ],
        respuestaCorrecta: 1,
    },
    {
        texto: "Paciente con fatiga, intolerancia al frío, bradicardia y TSH elevada con T4 libre baja. ¿Diagnóstico?",
        opciones: [
            "Hipertiroidismo subclínico",
            "Hipotiroidismo primario",
            "Síndrome de Cushing",
            "Insuficiencia suprarrenal aguda",
        ],
        respuestaCorrecta: 1,
    },
    {
        texto: "Niño con fiebre, exantema maculopapular y signos de inmunización incompleta. Brote comunitario. ¿Qué agente es el más frecuente en sarampión?",
        opciones: [
            "Virus varicela-zóster",
            "Virus del sarampión (paramixovirus)",
            "Streptococcus pyogenes",
            "Virus Epstein-Barr",
        ],
        respuestaCorrecta: 1,
    },
    {
        texto: "Paciente con cefalea en trueno súbita, rigidez de nuca y sin focalidad neurológica. TC sin hemorragia. ¿Estudio indicado si se sospecha hemorragia subaracnoidea?",
        opciones: [
            "RM cerebral sin contraste únicamente",
            "Punción lumbar si TC inicial negativa (según protocolo)",
            "Electroencefalograma",
            "Doppler de vasos intracraneales",
        ],
        respuestaCorrecta: 1,
    },
    {
        texto: "Mujer joven con anemia microcítica, ferritina baja y RDW elevado. ¿Tipo de anemia más probable?",
        opciones: [
            "Anemia de enfermedad crónica",
            "Anemia ferropénica",
            "Anemia megaloblástica",
            "Talasemia menor",
        ],
        respuestaCorrecta: 1,
    },
    {
        texto: "Paciente con odinofagia, exudados amigdalares y fiebre sin tos. Test rápido positivo para Streptococcus pyogenes. ¿Tratamiento de elección?",
        opciones: [
            "Azitromicina oral empírica sin test",
            "Amoxicilina (o penicilina benzatina según criterio)",
            "Antiviral oseltamivir",
            "Solo sintomático sin antibiótico",
        ],
        respuestaCorrecta: 1,
    },
    {
        texto: "Paciente con diarrea agua acuosa tras comida en restaurante, sin sangre, sin fiebre alta. ¿Primera medida general?",
        opciones: [
            "Antibiótico de amplio espectro de inmediato",
            "Reposición hídrica oral y vigilancia clínica",
            "Ayuno absoluto prolongado",
            "Corticoides sistémicos",
        ],
        respuestaCorrecta: 1,
    },
    {
        texto: "Paciente con crisis hipertensiva (PA muy elevada) sin daño a órgano diana agudo. ¿Enfoque inicial más adecuado?",
        opciones: [
            "Nifedipino sublingual repetido en domicilio",
            "Reducción gradual de PA en horas con antihipertensivos orales/EV según guía",
            "Diurético de asa en bolo masivo inmediato",
            "Reposo y no tratar hasta consulta ambulatoria en días",
        ],
        respuestaCorrecta: 1,
    },
];

const AVANCE_MS = 1600;

/** Textura procedural: suelo tipo baldosa clínica */
function crearTexturaSueloHospital() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    const tile = 64;
    for (let y = 0; y < 512; y += tile) {
        for (let x = 0; x < 512; x += tile) {
            const claro = ((x / tile + y / tile) % 2) === 0;
            ctx.fillStyle = claro ? "#eef3f9" : "#e2eaf3";
            ctx.fillRect(x, y, tile, tile);
            ctx.strokeStyle = "rgba(160, 178, 200, 0.45)";
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 0.5, y + 0.5, tile - 1, tile - 1);
        }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(5, 5);
    if ("colorSpace" in tex) tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

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

        const disposeList = [];

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xd8e4f0);
        scene.fog = new THREE.Fog(0xd8e4f0, 5, 16);

        const width = mount.clientWidth || 640;
        const height = mount.clientHeight || 320;

        const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
        camera.position.set(0.35, 1.35, 4.1);
        camera.lookAt(-0.15, 0.95, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.08;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mount.appendChild(renderer.domElement);

        const hemi = new THREE.HemisphereLight(0xffffff, 0xb8c4d4, 0.65);
        scene.add(hemi);

        const sol = new THREE.DirectionalLight(0xfff5e6, 1.15);
        sol.position.set(3, 6, 4);
        sol.castShadow = true;
        sol.shadow.mapSize.set(2048, 2048);
        sol.shadow.camera.near = 0.5;
        sol.shadow.camera.far = 20;
        sol.shadow.camera.left = -5;
        sol.shadow.camera.right = 5;
        sol.shadow.camera.top = 5;
        sol.shadow.camera.bottom = -5;
        scene.add(sol);

        const rim = new THREE.PointLight(0xa8c8ff, 0.55, 25);
        rim.position.set(-2.2, 2.2, 1.5);
        scene.add(rim);

        const texSuelo = crearTexturaSueloHospital();
        disposeList.push(texSuelo);

        const sueloGeo = new THREE.PlaneGeometry(14, 14);
        const sueloMat = new THREE.MeshStandardMaterial({
            map: texSuelo,
            roughness: 0.75,
            metalness: 0.02,
        });
        disposeList.push(sueloGeo, sueloMat);
        const suelo = new THREE.Mesh(sueloGeo, sueloMat);
        suelo.rotation.x = -Math.PI / 2;
        suelo.receiveShadow = true;
        scene.add(suelo);

        const paredGeo = new THREE.PlaneGeometry(14, 6);
        const paredMat = new THREE.MeshStandardMaterial({
            color: 0xeef4fa,
            roughness: 0.92,
            metalness: 0,
        });
        disposeList.push(paredGeo, paredMat);
        const pared = new THREE.Mesh(paredGeo, paredMat);
        pared.position.set(0, 3, -3.2);
        pared.receiveShadow = true;
        scene.add(pared);

        const baseCamaGeo = new THREE.BoxGeometry(2.4, 0.12, 1.15);
        const baseCamaMat = new THREE.MeshStandardMaterial({
            color: 0x4a5568,
            roughness: 0.55,
            metalness: 0.35,
        });
        disposeList.push(baseCamaGeo, baseCamaMat);
        const baseCama = new THREE.Mesh(baseCamaGeo, baseCamaMat);
        baseCama.position.set(-1.35, 0.2, -0.4);
        baseCama.castShadow = true;
        baseCama.receiveShadow = true;
        scene.add(baseCama);

        const colchonGeo = new THREE.BoxGeometry(2.2, 0.22, 1.05);
        const colchonMat = new THREE.MeshStandardMaterial({
            color: 0xf5f8fc,
            roughness: 0.88,
            metalness: 0,
        });
        disposeList.push(colchonGeo, colchonMat);
        const colchon = new THREE.Mesh(colchonGeo, colchonMat);
        colchon.position.set(-1.35, 0.37, -0.4);
        colchon.castShadow = true;
        colchon.receiveShadow = true;
        scene.add(colchon);

        const almohadaGeo = new THREE.BoxGeometry(0.55, 0.12, 0.42);
        const almohadaMat = new THREE.MeshStandardMaterial({
            color: 0xe8eef6,
            roughness: 0.9,
            metalness: 0,
        });
        disposeList.push(almohadaGeo, almohadaMat);
        const almohada = new THREE.Mesh(almohadaGeo, almohadaMat);
        almohada.position.set(-2.15, 0.52, -0.35);
        almohada.rotation.y = 0.04;
        almohada.castShadow = true;
        scene.add(almohada);

        const posteGeo = new THREE.CylinderGeometry(0.04, 0.05, 2.2, 12);
        const posteMat = new THREE.MeshStandardMaterial({
            color: 0xc0c8d4,
            roughness: 0.35,
            metalness: 0.65,
        });
        disposeList.push(posteGeo, posteMat);
        const poste = new THREE.Mesh(posteGeo, posteMat);
        poste.position.set(1.55, 1.15, -0.9);
        poste.castShadow = true;
        scene.add(poste);

        const ganchoGeo = new THREE.TorusGeometry(0.12, 0.025, 8, 16, Math.PI);
        const ganchoMat = new THREE.MeshStandardMaterial({
            color: 0x9ca8b8,
            roughness: 0.4,
            metalness: 0.5,
        });
        disposeList.push(ganchoGeo, ganchoMat);
        const gancho = new THREE.Mesh(ganchoGeo, ganchoMat);
        gancho.position.set(1.55, 2.18, -0.9);
        gancho.rotation.y = Math.PI / 2;
        scene.add(gancho);

        const matBata = new THREE.MeshStandardMaterial({
            color: 0x7eb8e0,
            roughness: 0.55,
            metalness: 0.08,
        });
        const matPiel = new THREE.MeshStandardMaterial({
            color: 0xe8b89a,
            roughness: 0.62,
            metalness: 0,
        });
        const matPantalón = new THREE.MeshStandardMaterial({
            color: 0x3d4f63,
            roughness: 0.78,
            metalness: 0.05,
        });
        disposeList.push(matBata, matPiel, matPantalón);

        const pacienteGrupo = new THREE.Group();
        pacienteGrupo.position.set(-0.2, 0, 0.35);

        const torsoGeo = new THREE.CapsuleGeometry(0.38, 0.72, 10, 20);
        disposeList.push(torsoGeo);
        const torso = new THREE.Mesh(torsoGeo, matBata);
        torso.position.y = 1.12;
        torso.castShadow = true;
        pacienteGrupo.add(torso);

        const cabezaGeo = new THREE.SphereGeometry(0.28, 28, 28);
        disposeList.push(cabezaGeo);
        const cabeza = new THREE.Mesh(cabezaGeo, matPiel);
        cabeza.position.y = 1.72;
        cabeza.castShadow = true;
        pacienteGrupo.add(cabeza);

        const brazoGeo = new THREE.CapsuleGeometry(0.09, 0.42, 6, 12);
        disposeList.push(brazoGeo);
        const brazoIzq = new THREE.Mesh(brazoGeo, matBata);
        brazoIzq.position.set(-0.48, 1.28, 0.02);
        brazoIzq.rotation.z = 0.35;
        brazoIzq.rotation.x = 0.15;
        brazoIzq.castShadow = true;
        pacienteGrupo.add(brazoIzq);

        const brazoDer = new THREE.Mesh(brazoGeo, matBata);
        brazoDer.position.set(0.48, 1.28, 0.02);
        brazoDer.rotation.z = -0.35;
        brazoDer.rotation.x = 0.15;
        brazoDer.castShadow = true;
        pacienteGrupo.add(brazoDer);

        const piernaGeo = new THREE.CapsuleGeometry(0.11, 0.48, 6, 12);
        disposeList.push(piernaGeo);
        const piernaIzq = new THREE.Mesh(piernaGeo, matPantalón);
        piernaIzq.position.set(-0.18, 0.48, 0.02);
        piernaIzq.castShadow = true;
        pacienteGrupo.add(piernaIzq);

        const piernaDer = new THREE.Mesh(piernaGeo, matPantalón);
        piernaDer.position.set(0.18, 0.48, 0.02);
        piernaDer.castShadow = true;
        pacienteGrupo.add(piernaDer);

        scene.add(pacienteGrupo);

        let animationFrameId = 0;
        const clock = new THREE.Clock();

        const tick = () => {
            animationFrameId = requestAnimationFrame(tick);
            const t = clock.getElapsedTime();
            const respiro = 1 + Math.sin(t * 2.2) * 0.018;
            torso.scale.set(1, respiro, 1);
            pacienteGrupo.rotation.y = Math.sin(t * 0.45) * 0.12 + t * 0.12;
            cabeza.rotation.y = Math.sin(t * 0.5) * 0.08;
            camera.position.x = 0.35 + Math.sin(t * 0.15) * 0.08;
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

            scene.clear();
            disposeList.forEach((item) => {
                if (item.dispose) item.dispose();
            });

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
                className="h-[min(44vh,400px)] w-full overflow-hidden rounded-xl border border-sky-200/20 bg-[#c5d6e6] shadow-lg ring-1 ring-sky-900/10"
                style={{ minHeight: 300 }}
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

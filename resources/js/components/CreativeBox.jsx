import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import axios from "axios";
import { isMinijuegoOk, setMinijuegoOk } from "@/lib/minijuegoStorage";

const VOXEL = 50;
/** Tamaño del suelo editable (unidades Three.js); mayor = más espacio de construcción. */
const GRID_W = 1600;

function gridKey(ix, iy, iz) {
    return `${ix},${iy},${iz}`;
}

function posToGrid(v) {
    return {
        ix: Math.round((v.x - VOXEL / 2) / VOXEL),
        iy: Math.round((v.y - VOXEL / 2) / VOXEL),
        iz: Math.round((v.z - VOXEL / 2) / VOXEL),
    };
}

function gridToVec(ix, iy, iz) {
    return new THREE.Vector3(
        ix * VOXEL + VOXEL / 2,
        iy * VOXEL + VOXEL / 2,
        iz * VOXEL + VOXEL / 2,
    );
}

function makeMaterial(tipo, colorHex) {
    const c = new THREE.Color(colorHex);
    if (tipo === "glass") {
        return new THREE.MeshPhysicalMaterial({
            color: c,
            transparent: true,
            opacity: 0.45,
            roughness: 0.15,
            metalness: 0.1,
            transmission: 0.35,
            thickness: 1,
        });
    }
    if (tipo === "neon") {
        return new THREE.MeshStandardMaterial({
            color: c,
            emissive: c,
            emissiveIntensity: 0.6,
            roughness: 0.35,
            metalness: 0.2,
        });
    }
    return new THREE.MeshStandardMaterial({
        color: c,
        roughness: 0.55,
        metalness: 0.08,
    });
}

function playBlip() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = 520;
        g.gain.value = 0.04;
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        setTimeout(() => {
            o.stop();
            ctx.close();
        }, 70);
    } catch {
        /* sin audio */
    }
}

/** @typedef {'orbit' | 'build' | 'erase'} ModoCam */
/** @typedef {'solid' | 'glass' | 'neon'} TipoBloque */

/**
 * @param {object} props
 * @param {number} [props.cursoId]
 * @param {() => void} [props.onCompletado]
 * @param {boolean} [props.preview]
 * @param {string} [props.storageKey]
 * @param {string} [props.className]
 */
export default function CreativeBox({
    cursoId = 0,
    onCompletado,
    preview = false,
    storageKey = "creative_box",
    className = "",
}) {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);
    const planeRef = useRef(null);
    const rollRef = useRef(null);
    const blockMapRef = useRef(new Map());
    const objectsRef = useRef([]);
    const rafRef = useRef(0);
    const pointerRef = useRef(new THREE.Vector2());
    const raycasterRef = useRef(new THREE.Raycaster());
    const modoCamRef = useRef("orbit");
    const colorRef = useRef("#8b5cf6");
    const tipoRef = useRef("solid");
    const enProgresoEnviado = useRef(false);
    const previewRef = useRef(preview);
    const marcarCompletadoRef = useRef(() => {});
    const marcarEnProgresoRef = useRef(() => {});
    const registrarAccionRef = useRef(() => {});
    const victoriaRef = useRef(false);

    const [modoCam, setModoCam] = useState(/** @type {ModoCam} */ ("orbit"));
    const [color, setColor] = useState("#8b5cf6");
    const [tipoBloque, setTipoBloque] = useState(/** @type {TipoBloque} */ ("solid"));
    const [bloques, setBloques] = useState(0);
    const [completado, setCompletado] = useState(false);
    const [estadoUi, setEstadoUi] = useState(preview ? "Vista previa" : "Pendiente — Navega o construye");

    const persistOk = typeof cursoId === "number" && cursoId > 0 && !preview;

    const registrarAccionApi = useCallback(
        (payload) => {
            if (!persistOk) return;
            axios
                .post(`/api/cursos/${cursoId}/creative-accion`, payload, { validateStatus: () => true })
                .catch(() => {});
        },
        [cursoId, persistOk],
    );

    const marcarEnProgreso = useCallback(() => {
        if (!persistOk || enProgresoEnviado.current) return;
        enProgresoEnviado.current = true;
        axios
            .put(`/api/cursos/${cursoId}`, { estado: "en_progreso" })
            .then(() => setEstadoUi("En progreso"))
            .catch(() => {});
    }, [cursoId, persistOk]);

    const marcarCompletado = useCallback(() => {
        if (victoriaRef.current) return;
        victoriaRef.current = true;
        setCompletado(true);
        setEstadoUi("Completado");
        if (persistOk) {
            setMinijuegoOk(cursoId, storageKey);
            axios.put(`/api/cursos/${cursoId}`, { estado: "completado" }).catch(() => {});
        }
        onCompletado?.();
    }, [persistOk, cursoId, storageKey, onCompletado]);

    useEffect(() => {
        colorRef.current = color;
    }, [color]);
    useEffect(() => {
        tipoRef.current = tipoBloque;
    }, [tipoBloque]);
    useEffect(() => {
        modoCamRef.current = modoCam;
        const ctl = controlsRef.current;
        if (ctl) ctl.enabled = modoCam === "orbit";
    }, [modoCam]);
    useEffect(() => {
        previewRef.current = preview;
    }, [preview]);

    useEffect(() => {
        marcarCompletadoRef.current = marcarCompletado;
    }, [marcarCompletado]);

    useEffect(() => {
        marcarEnProgresoRef.current = marcarEnProgreso;
    }, [marcarEnProgreso]);

    useEffect(() => {
        registrarAccionRef.current = registrarAccionApi;
    }, [registrarAccionApi]);

    useEffect(() => {
        if (preview) return;
        if (persistOk && isMinijuegoOk(cursoId, storageKey)) {
            victoriaRef.current = true;
            setCompletado(true);
            setEstadoUi("Completado");
        }
    }, [preview, persistOk, cursoId, storageKey]);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return undefined;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0e14);
        scene.fog = new THREE.Fog(0x0a0e14, 1000, 3400);
        sceneRef.current = scene;

        const w = mount.clientWidth || 640;
        const h = mount.clientHeight || 580;
        const camera = new THREE.PerspectiveCamera(45, w / h, 1, 10000);
        camera.position.set(720, 560, 1020);
        camera.lookAt(0, 140, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(w, h);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mount.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.maxPolarAngle = Math.PI * 0.48;
        controls.minDistance = 250;
        controls.maxDistance = 3000;
        controls.target.set(0, VOXEL, 0);
        controls.enablePan = true;
        controlsRef.current = controls;

        scene.add(new THREE.AmbientLight(0x9db4ff, 0.45));
        const sun = new THREE.DirectionalLight(0xffffff, 0.85);
        sun.position.set(420, 1000, 360);
        sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        sun.shadow.camera.near = 100;
        sun.shadow.camera.far = 3200;
        const sh = 950;
        sun.shadow.camera.left = -sh;
        sun.shadow.camera.right = sh;
        sun.shadow.camera.top = sh;
        sun.shadow.camera.bottom = -sh;
        scene.add(sun);
        const rim = new THREE.DirectionalLight(0x6644ff, 0.28);
        rim.position.set(-300, 200, -400);
        scene.add(rim);

        const grid = new THREE.GridHelper(GRID_W, Math.floor(GRID_W / VOXEL), 0x334155, 0x1e293b);
        grid.position.y = 0;
        scene.add(grid);

        const planeGeom = new THREE.PlaneGeometry(GRID_W, GRID_W);
        planeGeom.rotateX(-Math.PI / 2);
        const plane = new THREE.Mesh(
            planeGeom,
            new THREE.MeshStandardMaterial({ visible: false, transparent: true, opacity: 0 }),
        );
        scene.add(plane);
        planeRef.current = plane;

        const rollGeom = new THREE.BoxGeometry(VOXEL, VOXEL, VOXEL);
        const rollMat = new THREE.MeshBasicMaterial({
            color: 0xa78bfa,
            opacity: 0.35,
            transparent: true,
            wireframe: true,
        });
        const rollOver = new THREE.Mesh(rollGeom, rollMat);
        rollOver.visible = false;
        scene.add(rollOver);
        rollRef.current = rollOver;

        const geometry = new THREE.BoxGeometry(VOXEL, VOXEL, VOXEL);
        geometry.translate(0, 0, 0);

        const updateRollOver = (clientX, clientY) => {
            const rect = renderer.domElement.getBoundingClientRect();
            const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
            const ny = -((clientY - rect.top) / rect.height) * 2 + 1;
            pointerRef.current.set(nx, ny);
            raycasterRef.current.setFromCamera(pointerRef.current, camera);
            const objs = [plane, ...objectsRef.current];
            const hits = raycasterRef.current.intersectObjects(objs, false);
            if (!hits.length) {
                rollOver.visible = false;
                return;
            }
            const hit = hits[0];
            if (hit.object === plane) {
                const p = hit.point.clone();
                const ix = Math.floor(p.x / VOXEL);
                const iz = Math.floor(p.z / VOXEL);
                rollOver.position.copy(gridToVec(ix, 0, iz));
            } else {
                const m = hit.object;
                const n = hit.face.normal.clone();
                n.transformDirection(m.matrixWorld);
                const s = new THREE.Vector3(
                    Math.round(n.x),
                    Math.round(n.y),
                    Math.round(n.z),
                );
                rollOver.position.copy(m.position).add(s.multiplyScalar(VOXEL));
            }
            rollOver.visible = true;
        };

        const tryPlace = () => {
            if (victoriaRef.current) return;
            if (!rollOver.visible) return;
            const { ix, iy, iz } = posToGrid(rollOver.position);
            const k = gridKey(ix, iy, iz);
            if (blockMapRef.current.has(k)) return;

            const mesh = new THREE.Mesh(geometry.clone(), makeMaterial(tipoRef.current, colorRef.current));
            mesh.position.copy(rollOver.position);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData = { ix, iy, iz, key: k, tipo: tipoRef.current, spawnAt: performance.now() };
            scene.add(mesh);
            objectsRef.current.push(mesh);
            blockMapRef.current.set(k, mesh);
            setBloques((c) => c + 1);
            marcarEnProgresoRef.current();
            registrarAccionRef.current({
                tipo: "place",
                ix,
                iy,
                iz,
                color: colorRef.current,
                blockType: tipoRef.current,
            });
            playBlip();
        };

        const tryRemove = () => {
            if (victoriaRef.current) return;
            raycasterRef.current.setFromCamera(pointerRef.current, camera);
            const hits = raycasterRef.current.intersectObjects(objectsRef.current, false);
            if (!hits.length) return;
            const m = hits[0].object;
            const k = m.userData.key;
            scene.remove(m);
            m.geometry?.dispose?.();
            const mat = m.material;
            if (Array.isArray(mat)) mat.forEach((x) => x.dispose?.());
            else mat?.dispose?.();
            objectsRef.current = objectsRef.current.filter((o) => o !== m);
            blockMapRef.current.delete(k);
            setBloques((c) => Math.max(0, c - 1));
            registrarAccionRef.current({ tipo: "remove", key: k });
        };

        const onPointerMove = (e) => {
            updateRollOver(e.clientX, e.clientY);
        };

        const onPointerDown = (e) => {
            if (modoCamRef.current === "orbit") return;
            const rect = renderer.domElement.getBoundingClientRect();
            const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            pointerRef.current.set(nx, ny);
            if (modoCamRef.current === "build") tryPlace();
            else if (modoCamRef.current === "erase") tryRemove();
        };

        renderer.domElement.addEventListener("pointermove", onPointerMove);
        renderer.domElement.addEventListener("pointerdown", onPointerDown);

        const loop = () => {
            rafRef.current = requestAnimationFrame(loop);
            const t = performance.now();
            for (const m of objectsRef.current) {
                const t0 = m.userData.spawnAt;
                if (t0 && t - t0 < 220) {
                    const u = 1 - Math.exp(-(t - t0) / 90);
                    m.scale.setScalar(u);
                } else {
                    m.scale.setScalar(1);
                    m.userData.spawnAt = null;
                }
            }
            rollOver.rotation.y += 0.04;
            controls.update();
            renderer.render(scene, camera);
        };
        loop();

        const onResize = () => {
            const mw = mount.clientWidth || w;
            const mh = mount.clientHeight || h;
            camera.aspect = mw / mh;
            camera.updateProjectionMatrix();
            renderer.setSize(mw, mh);
        };
        window.addEventListener("resize", onResize);
        const ro = new ResizeObserver(onResize);
        ro.observe(mount);

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener("resize", onResize);
            ro.disconnect();
            renderer.domElement.removeEventListener("pointermove", onPointerMove);
            renderer.domElement.removeEventListener("pointerdown", onPointerDown);
            controls.dispose();
            controlsRef.current = null;
            geometry.dispose();
            rollGeom.dispose();
            rollMat.dispose();
            planeGeom.dispose();
            plane.material.dispose();
            for (const m of objectsRef.current) {
                m.geometry?.dispose?.();
                const mat = m.material;
                if (Array.isArray(mat)) mat.forEach((x) => x.dispose?.());
                else mat?.dispose?.();
                scene.remove(m);
            }
            objectsRef.current = [];
            blockMapRef.current.clear();
            renderer.dispose();
            if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
            sceneRef.current = null;
            rendererRef.current = null;
            cameraRef.current = null;
            planeRef.current = null;
            rollRef.current = null;
        };
    }, []);

    const presetColors = ["#f43f5e", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899"];

    return (
        <div className={`flex w-full flex-col gap-3 lg:flex-row ${className}`.trim()}>
            <aside className="order-2 flex w-full shrink-0 flex-col gap-3 rounded-2xl border border-violet-500/25 bg-gradient-to-b from-slate-950/95 to-slate-900/90 p-4 shadow-xl shadow-violet-950/20 lg:order-1 lg:w-64">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400/90">Creative Box</p>
                    <p className="mt-0.5 text-lg font-black text-white">Constructor voxel</p>
                </div>

                <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Estado</p>
                    <p className="mt-1 text-sm font-semibold text-violet-200">{estadoUi}</p>
                    <p className="mt-2 font-mono text-xs text-slate-400">
                        Bloques colocados: <span className="text-white">{bloques}</span>
                    </p>
                    {!preview && !completado && (
                        <button
                            type="button"
                            onClick={() => marcarCompletado()}
                            className="mt-3 w-full rounded-xl border border-emerald-500/50 bg-emerald-600/25 px-3 py-2.5 text-sm font-bold text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.15)] transition hover:bg-emerald-600/35 hover:border-emerald-400/60"
                        >
                            He terminado
                        </button>
                    )}
                    {completado && (
                        <p className="mt-2 text-xs font-semibold text-emerald-400">¡Has finalizado! Curso completado.</p>
                    )}
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Modo cámara / edición</p>
                    <div className="flex flex-col gap-1.5">
                        {[
                            { id: "orbit", label: "Navegar (órbita + zoom)" },
                            { id: "build", label: "Construir bloques" },
                            { id: "erase", label: "Eliminar bloque" },
                        ].map((m) => (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => setModoCam(/** @type {ModoCam} */ (m.id))}
                                className={`rounded-lg border px-3 py-2 text-left text-xs font-semibold transition ${
                                    modoCam === m.id
                                        ? "border-violet-500/70 bg-violet-600/30 text-white shadow-[0_0_16px_rgba(139,92,246,0.25)]"
                                        : "border-slate-700/70 bg-slate-900/40 text-slate-300 hover:border-violet-500/40"
                                }`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Color</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {presetColors.map((c) => (
                            <button
                                key={c}
                                type="button"
                                aria-label={c}
                                onClick={() => setColor(c)}
                                className={`h-8 w-8 rounded-lg border-2 transition hover:scale-105 ${
                                    color === c ? "border-white ring-2 ring-violet-400" : "border-transparent"
                                }`}
                                style={{ background: c }}
                            />
                        ))}
                    </div>
                    <label className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                        <span>Hex</span>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="h-8 w-full cursor-pointer rounded border border-slate-600 bg-slate-900"
                        />
                    </label>
                </div>

                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Tipo de bloque</p>
                    <select
                        value={tipoBloque}
                        onChange={(e) => setTipoBloque(/** @type {TipoBloque} */ (e.target.value))}
                        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                    >
                        <option value="solid">Sólido</option>
                        <option value="glass">Cristal</option>
                        <option value="neon">Neón</option>
                    </select>
                </div>

                <p className="text-[10px] leading-relaxed text-slate-500">
                    Sin límite de bloques. Rueda: zoom. En <strong className="text-slate-300">Navegar</strong>, arrastra para
                    rotar. En <strong className="text-slate-300">Construir</strong> o{" "}
                    <strong className="text-slate-300">Eliminar</strong>, clic sobre el lienzo. La malla violeta indica dónde
                    se colocará el bloque. Cuando acabes, pulsa <strong className="text-slate-300">He terminado</strong>.
                </p>
            </aside>

            <div
                ref={mountRef}
                className="order-1 min-h-[380px] flex-1 overflow-hidden rounded-2xl border border-violet-500/20 shadow-inner lg:min-h-[480px] lg:order-2"
                style={{ height: preview ? 440 : 780 }}
            />
        </div>
    );
}

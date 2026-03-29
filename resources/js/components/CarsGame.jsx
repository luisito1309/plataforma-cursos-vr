import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { isMinijuegoOk, setMinijuegoOk } from "@/lib/minijuegoStorage";

export const STORAGE_KEY = "cars";

const GRAVITY = 28;
const JUMP_V = 9;
const ACCEL = 56;
const BRAKE = 40;
const FRICTION = 2.65;
const MAX_SPEED = 44;
const MAX_SPEED_REV = 15;
const TURN_SPEED = 3.35;
const TURBO_SPEED_MULT = 2.35;
const MAX_TURBO_TIME = 3;
const TURBO_COOLDOWN = 2.25;
const CAMERA_LERP = 0.12;
const CAMERA_HEIGHT = 5.2;
const CAMERA_DIST = 10;
const CAMERA_DIST_TURBO_EXTRA = 5;
const CAMERA_BASE_FOV = 58;
const CAMERA_TURBO_FOV_BOOST = 12;
const GROUND_RAY_UP = 40;
const GROUND_EPS = 0.08;
const MAP_SCALE = 5;
const AREA_MARGIN = 1.2;
const IMPACT_CD = 0.14;
const CAR_BOX_PAD = 0.1;
const COLLISION_ITERS = 6;

/** @param {{ x: number; z: number; width: number; depth: number }} line @param {{ x: number; z: number }} pos */
function estaEnMeta(pos, line) {
    return (
        pos.x >= line.x - line.width / 2 &&
        pos.x <= line.x + line.width / 2 &&
        pos.z >= line.z - line.depth / 2 &&
        pos.z <= line.z + line.depth / 2
    );
}

function fmtTiempo(sec) {
    if (sec == null || Number.isNaN(sec)) return "—";
    const m = Math.floor(sec / 60);
    const r = sec % 60;
    const whole = String(Math.floor(r)).padStart(2, "0");
    const frac = (r % 1).toFixed(1).slice(2);
    return `${m}:${whole}.${frac}`;
}

/** @param {THREE.Object3D} root @param {THREE.Box3} target */
function expandBox(root, target) {
    root.updateWorldMatrix(true, true);
    const b = new THREE.Box3().setFromObject(root);
    if (!b.isEmpty()) target.union(b);
}

/** @param {THREE.Object3D} root */
function collectMeshes(root) {
    /** @type {THREE.Mesh[]} */
    const meshes = [];
    root.traverse((o) => {
        if (o.isMesh) meshes.push(o);
    });
    return meshes;
}

/**
 * @param {THREE.Object3D} mapRoot
 * @param {THREE.Box3} worldBounds
 * @returns {THREE.Box3[]}
 */
function collectObstacleBoxes(mapRoot, worldBounds) {
    /** @type {THREE.Box3[]} */
    const out = [];
    const tmp = new THREE.Vector3();
    mapRoot.updateMatrixWorld(true);
    let worldVol = 1;
    if (!worldBounds.isEmpty()) {
        worldBounds.getSize(tmp);
        worldVol = Math.max(tmp.x * tmp.y * tmp.z, 1);
    }
    mapRoot.traverse((child) => {
        if (!child.isMesh || !child.geometry) return;
        const n = child.name.toLowerCase();
        if (n.includes("sky") || n.includes("cielo") || n.includes("cloud")) return;
        const box = new THREE.Box3().setFromObject(child);
        if (box.isEmpty()) return;
        const size = box.getSize(tmp);
        const vol = size.x * size.y * size.z;
        if (vol > worldVol * 0.35 || vol > 120000) return;
        if (size.y < 0.22 && size.x * size.z > 90) return;
        if (size.x > 180 && size.z > 180 && size.y < 2.5) return;
        out.push(box.clone());
    });
    return out;
}

/**
 * @param {THREE.Box3} carBox
 * @param {THREE.Box3} wall
 * @param {THREE.Vector3} pos
 */
function pushOutCarAABB(carBox, wall, pos) {
    if (!carBox.intersectsBox(wall)) return false;
    const cMin = carBox.min;
    const cMax = carBox.max;
    const wMin = wall.min;
    const wMax = wall.max;
    const overlapX = Math.min(cMax.x - wMin.x, wMax.x - cMin.x);
    const overlapY = Math.min(cMax.y - wMin.y, wMax.y - cMin.y);
    const overlapZ = Math.min(cMax.z - wMin.z, wMax.z - cMin.z);
    const minO = Math.min(overlapX, overlapY, overlapZ);
    const ccx = (cMin.x + cMax.x) * 0.5;
    const wcx = (wMin.x + wMax.x) * 0.5;
    const ccz = (cMin.z + cMax.z) * 0.5;
    const wcz = (wMin.z + wMax.z) * 0.5;
    const ccy = (cMin.y + cMax.y) * 0.5;
    const wcy = (wMin.y + wMax.y) * 0.5;
    if (minO === overlapX) {
        pos.x += ccx < wcx ? -(cMax.x - wMin.x) : wMax.x - cMin.x;
    } else if (minO === overlapY) {
        pos.y += ccy < wcy ? -(cMax.y - wMin.y) : wMax.y - cMin.y;
    } else {
        pos.z += ccz < wcz ? -(cMax.z - wMin.z) : wMax.z - cMin.z;
    }
    return true;
}

/** @param {THREE.Object3D} root */
function disposeObject(root) {
    root.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
            const m = o.material;
            if (Array.isArray(m)) m.forEach((x) => x.dispose());
            else m.dispose();
        }
    });
}

/**
 * @param {object} props
 * @param {boolean} [props.preview]
 * @param {number} [props.cursoId]
 * @param {() => void} [props.onCompletado]
 */
export default function CarsGame({ preview = false, cursoId = 0, onCompletado }) {
    const mountRef = useRef(null);
    const focusRef = useRef(() => {});
    const persistOk = typeof cursoId === "number" && cursoId > 0;
    const bestStorageKey = `edu_cars_lap_best_${persistOk ? String(cursoId) : "demo"}`;

    const [hud, setHud] = useState({
        velocidad: 0,
        turbo: false,
        turboInfo: "100%",
        estado: "espera",
        tiempo: "0:00.0",
        mejorTiempo: "—",
        vuelta: "0 / 1",
        done: false,
        loading: true,
        error: null,
        finishFlash: 0,
    });
    const [alreadyDone, setAlreadyDone] = useState(false);
    const [replayKey, setReplayKey] = useState(0);

    const doneRef = useRef(false);
    const onCompletadoRef = useRef(onCompletado);
    onCompletadoRef.current = onCompletado;

    const completeGame = useCallback(() => {
        if (doneRef.current) return;
        doneRef.current = true;
        setHud((h) => ({ ...h, done: true, estado: "completado" }));
        if (persistOk) setMinijuegoOk(cursoId, STORAGE_KEY);
        onCompletadoRef.current?.();
    }, [cursoId, persistOk]);

    const handlePlayAgain = useCallback(() => {
        doneRef.current = false;
        let mejor = "—";
        try {
            const r = localStorage.getItem(bestStorageKey);
            if (r) mejor = fmtTiempo(parseFloat(r));
        } catch {
            /* noop */
        }
        setHud({
            velocidad: 0,
            turbo: false,
            turboInfo: "100%",
            estado: "espera",
            tiempo: "0:00.0",
            mejorTiempo: mejor,
            vuelta: "0 / 1",
            done: false,
            loading: true,
            error: null,
            finishFlash: 0,
        });
        setReplayKey((k) => k + 1);
    }, [bestStorageKey]);

    useEffect(() => {
        if (persistOk && isMinijuegoOk(cursoId, STORAGE_KEY)) setAlreadyDone(true);
    }, [cursoId, persistOk]);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return undefined;

        let raf = 0;
        /** @type {THREE.WebGLRenderer | null} */
        let renderer = null;
        /** @type {THREE.Scene | null} */
        let scene = null;
        /** @type {THREE.PerspectiveCamera | null} */
        let camera = null;
        const clock = new THREE.Clock();
        const raycaster = new THREE.Raycaster();
        const tmpV = new THREE.Vector3();
        const tmpV2 = new THREE.Vector3();
        const cameraTarget = new THREE.Vector3();
        const lookTarget = new THREE.Vector3();
        const carBox = new THREE.Box3();

        const keys = {
            w: false,
            s: false,
            a: false,
            d: false,
            space: false,
            shift: false,
        };
        let jumpQueued = false;

        let mapRoot = null;
        /** @type {THREE.Mesh[]} */
        let groundMeshes = [];
        /** @type {THREE.Box3[]} */
        let obstacleBoxes = [];
        const worldBounds = new THREE.Box3();
        let mapLoaded = false;

        let carGroup = null;
        /** @type {THREE.Group | null} */
        let carVisual = null;
        let carRideY = 0.35;
        let carLoaded = false;

        let forwardSpeed = 0;
        let rotY = 0;
        let vy = 0;
        let grounded = true;
        let turboParticles = null;
        let impactParticles = null;
        let lastEngineBeep = 0;
        let audioCtx = null;

        let turboTank = MAX_TURBO_TIME;
        let turboCooldown = 0;
        let turboActive = false;

        let cameraShake = 0;
        let targetFov = CAMERA_BASE_FOV;
        let targetCamDist = CAMERA_DIST;

        let impactCd = 0;

        /** @type {{ x: number; z: number; width: number; depth: number } | null} */
        let startLine = null;
        /** @type {THREE.Group | null} */
        let startLineGroup = null;
        /** @type {THREE.MeshBasicMaterial | null} */
        let startMat = null;

        let modelsReady = false;
        let raceStarted = false;
        let lapStarted = false;
        let lapCompleted = false;
        let leftZoneAfterArm = false;
        let raceTimeSec = 0;
        let finishLineBurst = 0;

        const finishRace = (finalTime) => {
            lapCompleted = true;
            raceStarted = false;
            forwardSpeed = 0;
            vy = 0;
            jumpQueued = false;
            keys.w = false;
            keys.s = false;
            keys.a = false;
            keys.d = false;
            keys.shift = false;
            turboActive = false;
            turboTank = MAX_TURBO_TIME;
            turboCooldown = 0;
            try {
                const prev = localStorage.getItem(bestStorageKey);
                const pv = prev ? parseFloat(prev) : Infinity;
                if (finalTime < pv) localStorage.setItem(bestStorageKey, String(finalTime));
            } catch {
                /* noop */
            }
            finishLineBurst = 0.45;
            if (startMat) startMat.color.setHex(0x44ffaa);
            playVictory();
            setHud((s) => ({
                ...s,
                estado: "completado",
                tiempo: fmtTiempo(finalTime),
                mejorTiempo: (() => {
                    try {
                        const r = localStorage.getItem(bestStorageKey);
                        return r ? fmtTiempo(parseFloat(r)) : fmtTiempo(finalTime);
                    } catch {
                        return fmtTiempo(finalTime);
                    }
                })(),
                vuelta: "1 / 1",
                finishFlash: 1,
                velocidad: 0,
                turbo: false,
                turboInfo: "—",
            }));
            window.setTimeout(() => setHud((s) => ({ ...s, finishFlash: 0 })), 200);
            queueMicrotask(completeGame);
        };

        function playVictory() {
            try {
                const Ctx = window.AudioContext ?? window.webkitAudioContext;
                if (!Ctx) return;
                if (!audioCtx) audioCtx = new Ctx();
                if (audioCtx.state === "suspended") void audioCtx.resume();
                const t0 = audioCtx.currentTime;
                [523.25, 659.25, 783.99].forEach((freq, i) => {
                    const o = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    o.type = "sine";
                    o.frequency.value = freq;
                    g.gain.setValueAtTime(0.0001, t0 + i * 0.07);
                    g.gain.exponentialRampToValueAtTime(0.06, t0 + i * 0.07 + 0.02);
                    g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.07 + 0.35);
                    o.connect(g);
                    g.connect(audioCtx.destination);
                    o.start(t0 + i * 0.07);
                    o.stop(t0 + i * 0.07 + 0.4);
                });
            } catch {
                /* noop */
            }
        }

        /** @param {'salida' | 'meta'} tipo */
        function playLineBeep(tipo) {
            try {
                const Ctx = window.AudioContext ?? window.webkitAudioContext;
                if (!Ctx) return;
                if (!audioCtx) audioCtx = new Ctx();
                if (audioCtx.state === "suspended") void audioCtx.resume();
                const o = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                o.type = "square";
                o.frequency.value = tipo === "meta" ? 880 : 440;
                g.gain.value = 0.04;
                o.connect(g);
                g.connect(audioCtx.destination);
                o.start();
                o.stop(audioCtx.currentTime + 0.06);
            } catch {
                /* noop */
            }
        }

        function playImpact() {
            try {
                const Ctx = window.AudioContext ?? window.webkitAudioContext;
                if (!Ctx) return;
                if (!audioCtx) audioCtx = new Ctx();
                if (audioCtx.state === "suspended") void audioCtx.resume();
                const t0 = audioCtx.currentTime;
                const n = audioCtx.createBufferSource();
                const len = Math.floor(audioCtx.sampleRate * 0.09);
                const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
                const d = buf.getChannelData(0);
                for (let i = 0; i < len; i++) {
                    d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.28));
                }
                n.buffer = buf;
                const g = audioCtx.createGain();
                g.gain.value = 0.2;
                n.connect(g);
                g.connect(audioCtx.destination);
                n.start(t0);
                n.stop(t0 + 0.09);
            } catch {
                try {
                    if (!audioCtx) return;
                    const o = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    o.type = "sawtooth";
                    o.frequency.value = 92;
                    const t = audioCtx.currentTime;
                    g.gain.setValueAtTime(0.07, t);
                    g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
                    o.connect(g);
                    g.connect(audioCtx.destination);
                    o.start(t);
                    o.stop(t + 0.14);
                } catch {
                    /* noop */
                }
            }
        }

        const onKeyDown = (e) => {
            if (e.code === "Enter" && modelsReady && !doneRef.current && !lapCompleted) {
                if (!raceStarted) {
                    e.preventDefault();
                    raceStarted = true;
                    lapStarted = false;
                    lapCompleted = false;
                    leftZoneAfterArm = startLine ? !estaEnMeta({ x: carGroup.position.x, z: carGroup.position.z }, startLine) : true;
                    raceTimeSec = 0;
                    turboTank = MAX_TURBO_TIME;
                    turboCooldown = 0;
                    if (startMat) startMat.color.setHex(0x22ee99);
                    setHud((s) => ({
                        ...s,
                        estado: "carrera",
                        vuelta: "0 / 1",
                        tiempo: "0:00.0",
                        turboInfo: `${Math.round((turboTank / MAX_TURBO_TIME) * 100)}%`,
                    }));
                }
                return;
            }
            if (!raceStarted || lapCompleted) return;

            switch (e.code) {
                case "KeyW":
                    keys.w = true;
                    break;
                case "KeyS":
                    keys.s = true;
                    break;
                case "KeyA":
                    keys.a = true;
                    break;
                case "KeyD":
                    keys.d = true;
                    break;
                case "Space":
                    if (!e.repeat) {
                        e.preventDefault();
                        jumpQueued = true;
                    }
                    break;
                case "ShiftLeft":
                case "ShiftRight":
                    keys.shift = true;
                    break;
                default:
                    break;
            }
        };

        const onKeyUp = (e) => {
            switch (e.code) {
                case "KeyW":
                    keys.w = false;
                    break;
                case "KeyS":
                    keys.s = false;
                    break;
                case "KeyA":
                    keys.a = false;
                    break;
                case "KeyD":
                    keys.d = false;
                    break;
                case "ShiftLeft":
                case "ShiftRight":
                    keys.shift = false;
                    break;
                default:
                    break;
            }
        };

        function playEngine(delta, speed, turbo) {
            if (!raceStarted || lapCompleted) return;
            const now = performance.now() / 1000;
            if (now - lastEngineBeep < 0.12) return;
            lastEngineBeep = now;
            try {
                const Ctx = window.AudioContext ?? window.webkitAudioContext;
                if (!Ctx) return;
                if (!audioCtx) audioCtx = new Ctx();
                if (audioCtx.state === "suspended") void audioCtx.resume();
                const o = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                o.type = "triangle";
                const sp = Math.min(1, Math.abs(speed) / MAX_SPEED);
                o.frequency.value = 70 + sp * 130 + (turbo ? 70 : 0);
                g.gain.value = 0.011 + sp * 0.032;
                o.connect(g);
                g.connect(audioCtx.destination);
                o.start();
                o.stop(audioCtx.currentTime + Math.min(0.07, delta * 2));
            } catch {
                /* noop */
            }
        }

        /**
         * @param {number} x
         * @param {number} z
         * @param {number} yGuess
         */
        function sampleGroundY(x, z, yGuess) {
            if (!groundMeshes.length) return yGuess;
            raycaster.set(new THREE.Vector3(x, yGuess + GROUND_RAY_UP, z), new THREE.Vector3(0, -1, 0));
            const hits = raycaster.intersectObjects(groundMeshes, true);
            if (!hits.length) return yGuess;
            return hits[0].point.y;
        }

        function clampToArea(x, z) {
            if (worldBounds.isEmpty()) return { x, z };
            const minX = worldBounds.min.x + AREA_MARGIN;
            const maxX = worldBounds.max.x - AREA_MARGIN;
            const minZ = worldBounds.min.z + AREA_MARGIN;
            const maxZ = worldBounds.max.z - AREA_MARGIN;
            return {
                x: Math.max(minX, Math.min(maxX, x)),
                z: Math.max(minZ, Math.min(maxZ, z)),
            };
        }

        function createTurboBurst(parent) {
            const n = 48;
            const geom = new THREE.BufferGeometry();
            const pos = new Float32Array(n * 3);
            geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
            const mat = new THREE.PointsMaterial({
                color: 0x44ddff,
                size: 0.35,
                transparent: true,
                opacity: 0.75,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
            });
            const pts = new THREE.Points(geom, mat);
            pts.frustumCulled = false;
            pts.userData = { speeds: [], life: [], ages: [] };
            for (let i = 0; i < n; i++) {
                pts.userData.speeds.push(new THREE.Vector3());
                pts.userData.life.push(0.35 + Math.random() * 0.25);
                pts.userData.ages.push(999);
            }
            parent.add(pts);
            return pts;
        }

        function createImpactSparks(parent) {
            const n = 36;
            const geom = new THREE.BufferGeometry();
            const pos = new Float32Array(n * 3);
            geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
            const mat = new THREE.PointsMaterial({
                color: 0xffaa44,
                size: 0.32,
                transparent: true,
                opacity: 0,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
            });
            const pts = new THREE.Points(geom, mat);
            pts.frustumCulled = false;
            pts.userData = { speeds: [], life: [], ages: [] };
            for (let i = 0; i < n; i++) {
                pts.userData.speeds.push(new THREE.Vector3());
                pts.userData.life.push(0.2 + Math.random() * 0.15);
                pts.userData.ages.push(999);
            }
            parent.add(pts);
            return pts;
        }

        function burstImpactParticles(carP, fx, fz) {
            if (!impactParticles) return;
            const pos = impactParticles.geometry.attributes.position.array;
            const { speeds, life, ages } = impactParticles.userData;
            const fwd = new THREE.Vector3(Math.sin(rotY), 0, Math.cos(rotY));
            for (let i = 0; i < speeds.length; i++) {
                ages[i] = 0;
                pos[i * 3] = carP.x + (Math.random() - 0.5) * 0.5;
                pos[i * 3 + 1] = carP.y + carRideY * 0.25;
                pos[i * 3 + 2] = carP.z + (Math.random() - 0.5) * 0.5;
                tmpV.set(Math.random() - 0.5, 0.4 + Math.random() * 0.5, Math.random() - 0.5);
                if (Math.abs(fx) > Math.abs(fz)) tmpV.x += Math.sign(fx) * 3;
                else tmpV.z += Math.sign(fz) * 3;
                tmpV.addScaledVector(fwd, (Math.random() - 0.5) * 2);
                tmpV.normalize().multiplyScalar(6 + Math.random() * 7);
                speeds[i].copy(tmpV);
            }
            impactParticles.geometry.attributes.position.needsUpdate = true;
            impactParticles.material.opacity = 0.9;
        }

        function updateTurboParticles(pts, dt, carP, back, turbo) {
            if (!pts) return;
            const pos = pts.geometry.attributes.position.array;
            const { speeds, life, ages } = pts.userData;
            const spd = forwardSpeed;
            const emit = raceStarted && !lapCompleted && turbo && Math.abs(spd) > 0.5;
            for (let i = 0; i < speeds.length; i++) {
                ages[i] += dt;
                if (emit && ages[i] > life[i]) {
                    ages[i] = 0;
                    tmpV.copy(carP).addScaledVector(back, 0.4);
                    tmpV.y += carRideY * 0.3;
                    pos[i * 3] = tmpV.x + (Math.random() - 0.5) * 0.6;
                    pos[i * 3 + 1] = tmpV.y + (Math.random() - 0.5) * 0.3;
                    pos[i * 3 + 2] = tmpV.z + (Math.random() - 0.5) * 0.6;
                    speeds[i].set(
                        back.x * (5 + Math.random() * 8) + (Math.random() - 0.5) * 2,
                        Math.random() * 2.2,
                        back.z * (5 + Math.random() * 8) + (Math.random() - 0.5) * 2,
                    );
                } else if (!emit && ages[i] < 900) {
                    pos[i * 3] += speeds[i].x * dt;
                    pos[i * 3 + 1] += speeds[i].y * dt;
                    pos[i * 3 + 2] += speeds[i].z * dt;
                    speeds[i].y -= 7 * dt;
                }
            }
            pts.geometry.attributes.position.needsUpdate = true;
            pts.material.opacity = emit ? 0.85 : 0.32;
        }

        function updateImpactParticles(pts, dt) {
            if (!pts || pts.material.opacity <= 0.01) return;
            const pos = pts.geometry.attributes.position.array;
            const { speeds, ages } = pts.userData;
            for (let i = 0; i < speeds.length; i++) {
                ages[i] += dt;
                pos[i * 3] += speeds[i].x * dt;
                pos[i * 3 + 1] += speeds[i].y * dt;
                pos[i * 3 + 2] += speeds[i].z * dt;
                speeds[i].y -= 10 * dt;
            }
            pts.geometry.attributes.position.needsUpdate = true;
            pts.material.opacity = Math.max(0, pts.material.opacity - dt * 2.2);
        }

        function buildStartLineVisual(line) {
            if (!scene) return;
            const gy = sampleGroundY(line.x, line.z, worldBounds.max.y + 2);
            const y = gy + 0.12;
            const g = new THREE.Group();
            const matFrame = new THREE.LineBasicMaterial({ color: 0x33ffcc });
            const halfW = line.width / 2;
            const halfD = line.depth / 2;
            const corners = [
                [line.x - halfW, y, line.z - halfD],
                [line.x + halfW, y, line.z - halfD],
                [line.x + halfW, y, line.z + halfD],
                [line.x - halfW, y, line.z + halfD],
            ];
            for (let i = 0; i < 4; i++) {
                const a = corners[i];
                const b = corners[(i + 1) % 4];
                const geo = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(a[0], a[1], a[2]),
                    new THREE.Vector3(b[0], b[1], b[2]),
                ]);
                g.add(new THREE.Line(geo, matFrame));
            }
            startMat = new THREE.MeshBasicMaterial({
                color: 0x22ee99,
                transparent: true,
                opacity: 0.22,
                side: THREE.DoubleSide,
                depthWrite: false,
            });
            const floor = new THREE.Mesh(new THREE.PlaneGeometry(line.width, line.depth), startMat);
            floor.rotation.x = -Math.PI / 2;
            floor.position.set(line.x, y - 0.02, line.z);
            g.add(floor);
            scene.add(g);
            startLineGroup = g;
        }

        const loader = new GLTFLoader();

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x060810);
        scene.fog = new THREE.Fog(0x060810, 45, 220);

        const w = mount.clientWidth || 640;
        const h = mount.clientHeight || 400;
        camera = new THREE.PerspectiveCamera(CAMERA_BASE_FOV, w / h, 0.1, 500);
        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(w, h);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.domElement.tabIndex = 0;
        mount.appendChild(renderer.domElement);

        const hemi = new THREE.HemisphereLight(0xaaccff, 0x334422, 0.55);
        scene.add(hemi);
        const sun = new THREE.DirectionalLight(0xfff5e8, 0.95);
        sun.position.set(40, 80, 30);
        sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 200;
        sun.shadow.camera.left = -80;
        sun.shadow.camera.right = 80;
        sun.shadow.camera.top = 80;
        sun.shadow.camera.bottom = -80;
        scene.add(sun);

        let loadPending = 2;
        const checkReady = () => {
            loadPending -= 1;
            if (loadPending <= 0 && mapLoaded && carLoaded && carGroup) {
                modelsReady = true;
                let mejor = "—";
                try {
                    const r = localStorage.getItem(bestStorageKey);
                    if (r) mejor = fmtTiempo(parseFloat(r));
                } catch {
                    /* noop */
                }
                setHud((s) => ({
                    ...s,
                    loading: false,
                    mejorTiempo: mejor,
                    estado: "espera",
                    vuelta: "0 / 1",
                    turboInfo: "100%",
                }));
                focusRef.current();
            }
        };

        const onErr = (err) => {
            console.error(err);
            setHud((s) => ({ ...s, loading: false, error: "No se pudieron cargar los modelos 3D." }));
        };

        loader.load(
            "/models/mapa.glb",
            (gltf) => {
                mapRoot = gltf.scene;
                mapRoot.scale.set(MAP_SCALE, MAP_SCALE, MAP_SCALE);
                scene.add(mapRoot);
                groundMeshes = collectMeshes(mapRoot);
                worldBounds.makeEmpty();
                expandBox(mapRoot, worldBounds);
                obstacleBoxes = collectObstacleBoxes(mapRoot, worldBounds);
                mapRoot.traverse((o) => {
                    if (o.isMesh) {
                        o.castShadow = true;
                        o.receiveShadow = true;
                    }
                });
                mapLoaded = true;
                checkReady();
            },
            undefined,
            onErr,
        );

        loader.load(
            "/models/auto.glb",
            (gltf) => {
                carGroup = new THREE.Group();
                carVisual = new THREE.Group();
                const model = gltf.scene;
                model.scale.set(1, 1, 1);
                const box = new THREE.Box3().setFromObject(model);
                const c = box.getCenter(new THREE.Vector3());
                model.position.sub(c);
                model.position.y -= box.min.y;
                carVisual.add(model);
                const size = box.getSize(new THREE.Vector3());
                carRideY = Math.max(0.2, size.y * 0.5 + 0.05);

                model.traverse((o) => {
                    if (o.isMesh) {
                        o.castShadow = true;
                        o.receiveShadow = true;
                        const n = o.name.toLowerCase();
                        if (n.includes("wheel") || n.includes("rueda") || n.includes("llanta")) {
                            o.userData.isWheel = true;
                            o.userData.spinAxis = n.includes("right") || n.includes("der") ? -1 : 1;
                        }
                    }
                });

                carGroup.add(carVisual);
                turboParticles = createTurboBurst(carGroup);
                impactParticles = createImpactSparks(carGroup);
                scene.add(carGroup);
                carLoaded = true;
                checkReady();
            },
            undefined,
            onErr,
        );

        const placeStart = () => {
            if (!carGroup || worldBounds.isEmpty()) return;
            const cx = (worldBounds.min.x + worldBounds.max.x) * 0.5;
            const cz = (worldBounds.min.z + worldBounds.max.z) * 0.5;
            const guessY = worldBounds.max.y + 5;
            const gy = sampleGroundY(cx, cz, guessY);
            startLine = { x: cx, z: cz, width: 10, depth: 10 };
            carGroup.position.set(cx, gy + carRideY + 0.15, cz);
            rotY = 0;
            carGroup.rotation.y = rotY;
            forwardSpeed = 0;
            vy = 0;
            raceStarted = false;
            lapStarted = false;
            lapCompleted = false;
            leftZoneAfterArm = false;
            raceTimeSec = 0;
            turboTank = MAX_TURBO_TIME;
            turboCooldown = 0;
            turboActive = false;
            if (!startLineGroup && startLine) buildStartLineVisual(startLine);
        };

        const tryPlace = () => {
            if (mapLoaded && carLoaded && carGroup) placeStart();
        };

        const iv = window.setInterval(() => {
            tryPlace();
            if (carGroup && mapLoaded && carLoaded && !worldBounds.isEmpty()) {
                window.clearInterval(iv);
            }
        }, 50);

        focusRef.current = () => {
            renderer?.domElement?.focus?.();
        };

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);

        let hudAccum = 0;
        const loop = () => {
            raf = requestAnimationFrame(loop);
            const dt = Math.min(clock.getDelta(), 0.05);

            if (finishLineBurst > 0) {
                finishLineBurst -= dt;
                if (startMat) {
                    const p = Math.max(0, finishLineBurst / 0.45);
                    startMat.opacity = 0.22 + p * 0.65;
                }
            } else if (startMat && !lapCompleted) {
                startMat.opacity = 0.22;
            }

            if (scene && camera && renderer && carGroup && mapLoaded && carLoaded && !worldBounds.isEmpty() && startLine) {
                const inputActive = raceStarted && !lapCompleted;

                const prevCd = turboCooldown;
                turboCooldown = Math.max(0, turboCooldown - dt);
                if (prevCd > 0 && turboCooldown <= 0) turboTank = MAX_TURBO_TIME;

                if (inputActive) {
                    const wantTurbo = keys.shift && turboTank > 0.02 && turboCooldown <= 0;
                    if (wantTurbo) {
                        turboActive = true;
                        turboTank = Math.max(0, turboTank - dt);
                        if (turboTank <= 0.02) turboCooldown = TURBO_COOLDOWN;
                    } else {
                        turboActive = false;
                    }
                } else {
                    turboActive = false;
                }

                const turbo = inputActive && turboActive;
                const speedCapFwd = MAX_SPEED * (turbo ? TURBO_SPEED_MULT : 1);
                const speedCapRev = MAX_SPEED_REV * (turbo ? 1.18 : 1);

                if (inputActive) {
                    const accBoost = turbo ? TURBO_SPEED_MULT : 1;
                    if (keys.w) forwardSpeed += ACCEL * accBoost * dt;
                    if (keys.s) forwardSpeed -= BRAKE * dt;
                }
                const friction = FRICTION * (grounded ? 1 : 0.35) * dt;
                if (forwardSpeed > 0) forwardSpeed = Math.max(0, forwardSpeed - friction);
                else if (forwardSpeed < 0) forwardSpeed = Math.min(0, forwardSpeed + friction);

                if (!inputActive) forwardSpeed *= Math.pow(0.02, dt * 8);

                forwardSpeed = Math.max(-speedCapRev, Math.min(speedCapFwd, forwardSpeed));

                const speedTurnFactor = 1 / (1 + Math.abs(forwardSpeed) * 0.055);
                if (inputActive) {
                    if (keys.a) rotY += TURN_SPEED * speedTurnFactor * dt * (forwardSpeed >= 0 ? 1 : -1);
                    if (keys.d) rotY -= TURN_SPEED * speedTurnFactor * dt * (forwardSpeed >= 0 ? 1 : -1);
                }
                carGroup.rotation.y = rotY;

                tmpV.set(Math.sin(rotY), 0, Math.cos(rotY));
                if (inputActive || Math.abs(forwardSpeed) > 0.01) {
                    const step = forwardSpeed * dt;
                    carGroup.position.addScaledVector(tmpV, step);
                }

                const cxz = clampToArea(carGroup.position.x, carGroup.position.z);
                carGroup.position.x = cxz.x;
                carGroup.position.z = cxz.z;

                carGroup.updateMatrixWorld(true);
                carBox.setFromObject(carGroup);
                carBox.expandByScalar(CAR_BOX_PAD);

                let hitImpulse = false;
                let hitFx = 0;
                let hitFz = 0;
                if (obstacleBoxes.length && inputActive) {
                    for (let it = 0; it < COLLISION_ITERS; it++) {
                        let moved = false;
                        for (let i = 0; i < obstacleBoxes.length; i++) {
                            const ob = obstacleBoxes[i];
                            if (!carBox.intersectsBox(ob)) continue;
                            const before = carGroup.position.x;
                            const beforeZ = carGroup.position.z;
                            pushOutCarAABB(carBox, ob, carGroup.position);
                            const dx = carGroup.position.x - before;
                            const dz = carGroup.position.z - beforeZ;
                            hitFx += dx;
                            hitFz += dz;
                            carGroup.updateMatrixWorld(true);
                            carBox.setFromObject(carGroup);
                            carBox.expandByScalar(CAR_BOX_PAD);
                            moved = true;
                            hitImpulse = true;
                        }
                        if (!moved) break;
                    }
                    if (hitImpulse) {
                        forwardSpeed *= 0.36;
                        cameraShake = Math.min(0.85, cameraShake + 0.42);
                        if (impactCd <= 0) {
                            impactCd = IMPACT_CD;
                            playImpact();
                            burstImpactParticles(carGroup.position, hitFx, hitFz);
                        }
                    }
                }

                vy -= GRAVITY * dt;
                carGroup.position.y += vy * dt;

                const gy = sampleGroundY(carGroup.position.x, carGroup.position.z, carGroup.position.y);
                const ride = gy + carRideY + GROUND_EPS;
                grounded = carGroup.position.y <= ride + 0.12 && vy <= 0.5;
                if (carGroup.position.y < ride) {
                    carGroup.position.y = ride;
                    vy = Math.max(0, vy * -0.12);
                    grounded = true;
                }
                if (grounded && jumpQueued && inputActive) {
                    vy = JUMP_V;
                    grounded = false;
                    jumpQueued = false;
                }
                if (!inputActive) jumpQueued = false;

                if (impactCd > 0) impactCd -= dt;

                tmpV2.copy(tmpV).multiplyScalar(-1);
                updateTurboParticles(turboParticles, dt, carGroup.position, tmpV2, turbo);
                updateImpactParticles(impactParticles, dt);

                if (inputActive && (Math.abs(forwardSpeed) > 0.32 || turbo)) playEngine(dt, forwardSpeed, turbo);

                carVisual?.traverse((o) => {
                    if (o.userData.isWheel && inputActive) {
                        const spin = forwardSpeed * dt * 3.9 * (o.userData.spinAxis ?? 1);
                        o.rotation.x += spin;
                    }
                });

                const jumpSquash = grounded || !inputActive ? 1 : 1 + Math.sin(performance.now() * 0.02) * 0.03;
                if (carVisual) carVisual.scale.set(1, jumpSquash, 1);

                if (raceStarted && !lapCompleted) {
                    raceTimeSec += dt;
                    const pos = { x: carGroup.position.x, z: carGroup.position.z };
                    const inZone = estaEnMeta(pos, startLine);

                    if (!inZone) leftZoneAfterArm = true;

                    if (inZone && leftZoneAfterArm && !lapStarted) {
                        lapStarted = true;
                        leftZoneAfterArm = false;
                        playLineBeep("salida");
                        setHud((s) => ({ ...s, vuelta: "1 / 1 (en curso)" }));
                    } else if (inZone && leftZoneAfterArm && lapStarted && !lapCompleted && !doneRef.current) {
                        playLineBeep("meta");
                        finishRace(raceTimeSec);
                    }
                }

                targetFov = CAMERA_BASE_FOV + (turbo ? CAMERA_TURBO_FOV_BOOST : 0);
                camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 6);
                targetCamDist = CAMERA_DIST + (turbo ? CAMERA_DIST_TURBO_EXTRA : 0);

                tmpV.set(Math.sin(rotY), 0, Math.cos(rotY));
                cameraTarget.copy(carGroup.position);
                cameraTarget.addScaledVector(tmpV, -targetCamDist);
                cameraTarget.y += CAMERA_HEIGHT;
                camera.position.lerp(cameraTarget, CAMERA_LERP);

                if (cameraShake > 0.001) {
                    cameraShake = Math.max(0, cameraShake - dt * 2.4);
                    camera.position.x += (Math.random() - 0.5) * 0.45 * cameraShake;
                    camera.position.y += (Math.random() - 0.5) * 0.25 * cameraShake;
                    camera.position.z += (Math.random() - 0.5) * 0.45 * cameraShake;
                }

                camera.updateProjectionMatrix();
                lookTarget.copy(carGroup.position);
                lookTarget.y += carRideY * 0.35;
                camera.lookAt(lookTarget);

                const turboPct = Math.round((turboTank / MAX_TURBO_TIME) * 100);
                let turboInfo = `${turboPct}%`;
                if (turboCooldown > 0) turboInfo = `ENFRIANDO ${turboCooldown.toFixed(1)}s`;
                else if (turbo && turboTank > 0) turboInfo = `TURBO ${turboPct}%`;

                hudAccum += dt;
                if (hudAccum > 0.08) {
                    hudAccum = 0;
                    const est = raceStarted && !lapCompleted;
                    setHud((s) => ({
                        ...s,
                        velocidad: est ? Math.round(Math.abs(forwardSpeed) * 3.6) : 0,
                        turbo: est && turbo,
                        turboInfo: est ? turboInfo : "—",
                        tiempo: est ? fmtTiempo(raceTimeSec) : s.tiempo,
                        estado: lapCompleted ? "completado" : raceStarted ? "carrera" : "espera",
                    }));
                }
            }

            if (scene && camera && renderer) renderer.render(scene, camera);
        };
        loop();

        const ro = new ResizeObserver(() => {
            if (!mount || !camera || !renderer) return;
            const rw = mount.clientWidth;
            const rh = mount.clientHeight;
            camera.aspect = rw / rh;
            camera.updateProjectionMatrix();
            renderer.setSize(rw, rh);
        });
        ro.observe(mount);

        return () => {
            window.clearInterval(iv);
            ro.disconnect();
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
            cancelAnimationFrame(raf);
            if (renderer) {
                renderer.dispose();
                if (renderer.domElement?.parentNode === mount) mount.removeChild(renderer.domElement);
            }
            try {
                audioCtx?.close();
            } catch {
                /* noop */
            }
            if (turboParticles) {
                turboParticles.geometry.dispose();
                turboParticles.material.dispose();
            }
            if (impactParticles) {
                impactParticles.geometry.dispose();
                impactParticles.material.dispose();
            }
            if (startLineGroup) {
                scene?.remove(startLineGroup);
                startLineGroup.traverse((o) => {
                    if (o.geometry) o.geometry.dispose();
                    if (o.material) {
                        const m = o.material;
                        if (Array.isArray(m)) m.forEach((x) => x.dispose());
                        else m.dispose();
                    }
                });
            }
            if (mapRoot) {
                scene?.remove(mapRoot);
                disposeObject(mapRoot);
            }
            if (carGroup) {
                scene?.remove(carGroup);
                disposeObject(carGroup);
            }
        };
    }, [preview, completeGame, cursoId, replayKey, bestStorageKey]);

    if (alreadyDone && !preview) {
        return (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-xl border border-emerald-500/35 bg-emerald-500/[0.08] px-6 py-10 text-center">
                <p className="text-xl font-bold text-emerald-400">¡Has completado Cars!</p>
                <p className="max-w-md text-sm text-slate-400">
                    Tu progreso quedó guardado en este curso. Puedes seguir repasando el resto del aula.
                </p>
            </div>
        );
    }

    return (
        <div className="relative w-full min-h-[min(72vh,680px)] overflow-hidden rounded-xl border border-sky-500/25 bg-[#05070c] text-slate-100">
            <div
                ref={mountRef}
                tabIndex={0}
                className="h-[min(72vh,620px)] w-full min-h-[400px] outline-none focus:ring-2 focus:ring-sky-500/30"
            />

            {hud.loading && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/65 text-sm text-slate-300 backdrop-blur-sm">
                    Cargando mapa y vehículo…
                </div>
            )}
            {hud.error && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-black/80 px-4 text-center text-rose-300">
                    {hud.error}
                </div>
            )}

            {!hud.loading && !hud.error && hud.estado === "espera" && !hud.done && (
                <div className="absolute inset-0 z-[35] flex flex-col items-center justify-center bg-black/72 px-4 text-center backdrop-blur-sm">
                    <p className="text-lg font-semibold text-white md:text-xl">Presiona ENTER para comenzar</p>
                    <p className="mt-2 max-w-sm text-xs text-slate-400">
                        WASD · espacio · Shift turbo (depósito 3s, enfriamiento) · vuelta con doble paso por meta
                    </p>
                </div>
            )}

            {hud.finishFlash > 0 && (
                <div
                    className="pointer-events-none absolute inset-0 z-[38] bg-emerald-400/25 mix-blend-screen"
                    aria-hidden
                />
            )}

            {!hud.loading && !hud.error && (
                <>
                    <div className="absolute left-0 right-0 top-0 z-20 flex flex-wrap items-start justify-between gap-2 p-3 font-mono text-[11px]">
                        <div className="rounded-lg border border-violet-500/35 bg-black/75 px-3 py-2 backdrop-blur-sm">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-violet-300">Estado</div>
                            <div className="text-xs font-semibold text-white">
                                {hud.estado === "espera" && "Esperando inicio"}
                                {hud.estado === "carrera" && "En carrera"}
                                {hud.estado === "completado" && "Completado"}
                            </div>
                        </div>
                        <div className="rounded-lg border border-sky-500/35 bg-black/75 px-3 py-2 backdrop-blur-sm">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-sky-400">Tiempo</div>
                            <div className="text-lg font-bold text-white tabular-nums">{hud.tiempo}</div>
                        </div>
                        <div className="rounded-lg border border-white/15 bg-black/75 px-3 py-2 backdrop-blur-sm">
                            <div className="text-[10px] text-slate-500">Mejor</div>
                            <div className="text-amber-200 tabular-nums">{hud.mejorTiempo}</div>
                        </div>
                        <div className="rounded-lg border border-emerald-500/30 bg-black/75 px-3 py-2 backdrop-blur-sm">
                            <div className="text-[10px] text-slate-500">Vuelta</div>
                            <div className="text-emerald-200 tabular-nums">{hud.vuelta}</div>
                        </div>
                        <div className="rounded-lg border border-sky-500/35 bg-black/75 px-3 py-2 backdrop-blur-sm">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-sky-400">Velocidad</div>
                            <div className="text-lg font-bold text-white tabular-nums">{hud.velocidad} km/h</div>
                        </div>
                        <div className="rounded-lg border border-amber-500/35 bg-black/75 px-3 py-2 backdrop-blur-sm">
                            <div className="text-[10px] text-slate-500">Turbo</div>
                            <div className={hud.turbo ? "text-amber-300 font-bold tabular-nums" : "text-slate-400 tabular-nums"}>
                                {hud.turboInfo}
                            </div>
                        </div>
                    </div>
                    <div className="pointer-events-none absolute bottom-3 left-3 z-20 max-w-md rounded border border-white/10 bg-black/60 px-3 py-2 text-[10px] text-slate-400 backdrop-blur-sm">
                        {preview
                            ? "Vista previa · turbo con reserva · colisiones con el mapa"
                            : "ENTER · SHIFT = turbo (3s max) · colisiones sólidas"}
                    </div>
                </>
            )}

            {hud.done && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center overflow-y-auto bg-black/85 px-4 py-8 text-center backdrop-blur-md">
                    <p className="text-2xl font-bold text-sky-400" role="status">
                        🏁 Vuelta completada — Juego terminado
                    </p>
                    <p className="mt-3 max-w-md text-sm text-slate-300">Tiempo: {hud.tiempo} · Mejor: {hud.mejorTiempo}</p>
                    <p className="mt-1 text-xs text-slate-500">Curso marcado como completado.</p>
                    <button
                        type="button"
                        onClick={handlePlayAgain}
                        className="mt-8 rounded-xl border border-sky-500/40 bg-sky-600/90 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400/80"
                    >
                        Jugar de nuevo
                    </button>
                </div>
            )}
        </div>
    );
}

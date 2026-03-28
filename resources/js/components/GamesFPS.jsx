import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { isMinijuegoOk, setMinijuegoOk } from "@/lib/minijuegoStorage";

export const STORAGE_KEY = "games_fps";

const ROOM = 14;
const PLAYER_R = 0.35;
const EYE_H = 1.6;
const POINTER_SPEED = 1.35;
const GRAVITY = 32;
const JUMP_V = 10;
const WALK_SPEED = 12;
const SPRINT_MULT = 1.55;
const GROUND_EPS = 0.02;
const FIRE_COOLDOWN = 0.18;
const ENEMY_HP = 1;
const ENEMY_SPEED = 3.5;
const ENEMY_WANDER = 2;
const ENEMY_SIZE = { x: 0.75, y: 1.2, z: 0.75 };
const MAX_ALIVE = 6;
const SPAWN_DELAY = 2;
const DEFAULT_KILLS_TO_WIN = 15;
const PREVIEW_KILLS = 5;
const PLAYER_HP_MAX = 100;
const CONTACT_DAMAGE = 10;
const CONTACT_CD = 0.85;

/** @typedef {{ min: THREE.Vector3; max: THREE.Vector3 }} SolidBox */

function pushOutAABB(playerBox, obstacleBox) {
    if (!playerBox.intersectsBox(obstacleBox)) return false;
    const pMin = playerBox.min;
    const pMax = playerBox.max;
    const oMin = obstacleBox.min;
    const oMax = obstacleBox.max;
    const overlapX = Math.min(pMax.x - oMin.x, oMax.x - pMin.x);
    const overlapY = Math.min(pMax.y - oMin.y, oMax.y - pMin.y);
    const overlapZ = Math.min(pMax.z - oMin.z, oMax.z - pMin.z);
    const minOverlap = Math.min(overlapX, overlapY, overlapZ);
    if (minOverlap === overlapX) {
        const cx = (pMin.x + pMax.x) / 2;
        const ox = (oMin.x + oMax.x) / 2;
        const dx = cx < ox ? -(pMax.x - oMin.x) : oMax.x - pMin.x;
        playerBox.min.x += dx;
        playerBox.max.x += dx;
    } else if (minOverlap === overlapY) {
        const cy = (pMin.y + pMax.y) / 2;
        const oy = (oMin.y + oMax.y) / 2;
        const dy = cy < oy ? -(pMax.y - oMin.y) : oMax.y - pMin.y;
        playerBox.min.y += dy;
        playerBox.max.y += dy;
    } else {
        const cz = (pMin.z + pMax.z) / 2;
        const oz = (oMin.z + oMax.z) / 2;
        const dz = cz < oz ? -(pMax.z - oMin.z) : oMax.z - pMin.z;
        playerBox.min.z += dz;
        playerBox.max.z += dz;
    }
    return true;
}

function resolvePlayerAgainstSolids(playerBox, solids, iterations = 4) {
    for (let it = 0; it < iterations; it++) {
        let moved = false;
        for (const s of solids) {
            if (pushOutAABB(playerBox, s)) moved = true;
        }
        if (!moved) break;
    }
}

function getSupportYAt(x, z, solids, baseY = 0) {
    let best = baseY;
    const p = new THREE.Vector2(x, z);
    for (const s of solids) {
        const top = s.max.y;
        if (top <= baseY + 0.001) continue;
        if (p.x >= s.min.x - PLAYER_R && p.x <= s.max.x + PLAYER_R && p.z >= s.min.z - PLAYER_R && p.z <= s.max.z + PLAYER_R) {
            if (top > best) best = top;
        }
    }
    return best;
}

function clampHoriz(x, z) {
    const lim = ROOM - PLAYER_R - 0.2;
    return {
        x: Math.max(-lim, Math.min(lim, x)),
        z: Math.max(-lim, Math.min(lim, z)),
    };
}

function buildLevel(scene) {
    /** @type {SolidBox[]} */
    const solids = [];

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(ROOM * 2, ROOM * 2),
        new THREE.MeshStandardMaterial({ color: 0x1a2332, roughness: 0.92, metalness: 0.06 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x353f50, roughness: 0.82 });
    const h = 7;
    const t = 0.5;
    const w = ROOM * 2;
    const addWall = (x, z, ry, ww, hh, dd) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(ww, hh, dd), wallMat);
        m.position.set(x, hh / 2, z);
        m.rotation.y = ry;
        m.castShadow = true;
        m.receiveShadow = true;
        scene.add(m);
    };
    addWall(0, -ROOM, 0, w, h, t);
    addWall(0, ROOM, 0, w, h, t);
    addWall(-ROOM, 0, Math.PI / 2, w, h, t);
    addWall(ROOM, 0, Math.PI / 2, w, h, t);

    const boxMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.78 });
    const addBox = (sx, sy, sz, x, y, z) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), boxMat);
        m.position.set(x, y + sy / 2, z);
        m.castShadow = true;
        m.receiveShadow = true;
        scene.add(m);
        const hx = sx / 2;
        const hz = sz / 2;
        solids.push({
            min: new THREE.Vector3(x - hx, y, z - hz),
            max: new THREE.Vector3(x + hx, y + sy, z + hz),
        });
    };
    addBox(4, 1.8, 3, -4, 0, -3);
    addBox(2.5, 2, 2.5, 5, 0, 4);
    addBox(6, 1.2, 1.2, 0, 0, 7);
    addBox(2, 1.5, 4, -6, 0, 5);

    const R = ROOM;
    const wallH = 7;
    const wallT = 0.5;
    [
        { min: new THREE.Vector3(-R - wallT, 0, -R - wallT), max: new THREE.Vector3(-R, wallH, R + wallT) },
        { min: new THREE.Vector3(R, 0, -R - wallT), max: new THREE.Vector3(R + wallT, wallH, R + wallT) },
        { min: new THREE.Vector3(-R, 0, -R - wallT), max: new THREE.Vector3(R, wallH, -R) },
        { min: new THREE.Vector3(-R, 0, R), max: new THREE.Vector3(R, wallH, R + wallT) },
    ].forEach((b) => solids.push(b));

    const amb = new THREE.AmbientLight(0x6688aa, 0.5);
    scene.add(amb);
    const sun = new THREE.DirectionalLight(0xffffff, 1.05);
    sun.position.set(12, 24, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0xff6688, 0.28);
    rim.position.set(-10, 8, -12);
    scene.add(rim);

    return solids;
}

function attachWeapon(camera) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.12, 0.35),
        new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.6, roughness: 0.4 }),
    );
    body.position.set(0.15, -0.12, -0.25);
    g.add(body);
    const flash = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0.95 }),
    );
    flash.position.set(0.15, -0.1, -0.66);
    flash.visible = false;
    g.add(flash);
    g.userData.flash = flash;
    camera.add(g);
    return g;
}

function randomSpawnXZ() {
    const m = 3;
    return {
        x: (Math.random() * 2 - 1) * (ROOM - m),
        z: (Math.random() * 2 - 1) * (ROOM - m),
    };
}

function createEnemyCube() {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
        color: 0xcc3355,
        emissive: 0x220511,
        roughness: 0.55,
        metalness: 0.15,
    });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(ENEMY_SIZE.x, ENEMY_SIZE.y, ENEMY_SIZE.z), mat);
    mesh.position.y = ENEMY_SIZE.y / 2;
    mesh.castShadow = true;
    g.add(mesh);
    g.userData.enemyRoot = true;
    g.userData.bodyMat = mat;
    return { group: g, bodyMat: mat };
}

/**
 * @param {object} props
 * @param {boolean} [props.preview]
 * @param {number} [props.cursoId]
 * @param {number} [props.killsToWin]
 * @param {() => void} [props.onCompletado]
 */
export default function GamesFPS({
    preview = false,
    cursoId = 0,
    killsToWin: killsToWinProp,
    onCompletado,
}) {
    const mountRef = useRef(null);
    const requestLockRef = useRef(() => {});
    const persistOk = typeof cursoId === "number" && cursoId > 0;
    const killsToWin = preview ? PREVIEW_KILLS : (killsToWinProp ?? DEFAULT_KILLS_TO_WIN);

    const [hud, setHud] = useState({
        score: 0,
        kills: 0,
        killsToWin,
        alive: 0,
        hp: PLAYER_HP_MAX,
        locked: false,
        done: false,
        hitMarker: false,
    });
    const [alreadyDone, setAlreadyDone] = useState(false);

    const doneRef = useRef(false);
    const onCompletadoRef = useRef(onCompletado);
    onCompletadoRef.current = onCompletado;

    const completeGame = useCallback(() => {
        if (doneRef.current) return;
        doneRef.current = true;
        setHud((h) => ({ ...h, done: true }));
        if (persistOk) {
            setMinijuegoOk(cursoId, STORAGE_KEY);
            try {
                window.dispatchEvent(
                    new CustomEvent("edu-minijuego-ok", { detail: { cursoId, juego: STORAGE_KEY } }),
                );
            } catch {
                /* ignore */
            }
        }
        onCompletadoRef.current?.();
    }, [cursoId, persistOk]);

    useEffect(() => {
        if (persistOk && isMinijuegoOk(cursoId, STORAGE_KEY)) {
            setAlreadyDone(true);
        }
    }, [cursoId, persistOk]);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return undefined;

        const move = {
            forward: false,
            backward: false,
            left: false,
            right: false,
        };
        let sprintHeld = false;

        let raf = 0;
        let renderer;
        let scene;
        let camera;
        let controls;
        let weaponGroup;
        const clock = new THREE.Clock();
        const raycaster = new THREE.Raycaster();
        const playerBox = new THREE.Box3();
        const tmpV = new THREE.Vector3();
        const wander = new THREE.Vector3();
        const rng = Math.random;

        let solids = [];
        /** @type {{ group: THREE.Group; hp: number; bodyMat: THREE.MeshStandardMaterial; hitT: number; bob: number }[]} */
        const enemies = [];
        let vy = 0;
        let grounded = false;
        let jumpQueued = false;
        let fireCd = 0;
        let muzzleT = 0;
        let contactCd = 0;
        let spawnQueue = 0;
        let spawnTimer = 0;
        let totalKills = 0;
        let score = 0;
        let hudTick = 0;
        let audioCtx = null;

        const dispose = () => {
            cancelAnimationFrame(raf);
            document.removeEventListener("click", onDocumentClick);
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
            if (renderer?.domElement) {
                renderer.domElement.removeEventListener("click", onCanvasClick);
                renderer.domElement.removeEventListener("mousedown", onMouseDown);
                renderer.domElement.removeEventListener("contextmenu", onCtx);
            }
            controls?.dispose?.();
            if (renderer) {
                renderer.dispose();
                if (renderer.domElement?.parentNode === mount) {
                    mount.removeChild(renderer.domElement);
                }
            }
            try {
                audioCtx?.close();
            } catch {
                /* noop */
            }
            scene?.traverse((o) => {
                if (o.geometry) o.geometry.dispose();
                if (o.material) {
                    const m = o.material;
                    if (Array.isArray(m)) m.forEach((x) => x.dispose());
                    else m.dispose();
                }
            });
        };

        function onKeyDown(e) {
            switch (e.code) {
                case "KeyW":
                case "ArrowUp":
                    move.forward = true;
                    break;
                case "KeyS":
                case "ArrowDown":
                    move.backward = true;
                    break;
                case "KeyA":
                case "ArrowLeft":
                    move.left = true;
                    break;
                case "KeyD":
                case "ArrowRight":
                    move.right = true;
                    break;
                case "Space":
                    if (!e.repeat) {
                        e.preventDefault();
                        jumpQueued = true;
                    }
                    break;
                case "ShiftLeft":
                case "ShiftRight":
                    sprintHeld = true;
                    break;
                default:
                    break;
            }
        }

        function onKeyUp(e) {
            switch (e.code) {
                case "KeyW":
                case "ArrowUp":
                    move.forward = false;
                    break;
                case "KeyS":
                case "ArrowDown":
                    move.backward = false;
                    break;
                case "KeyA":
                case "ArrowLeft":
                    move.left = false;
                    break;
                case "KeyD":
                case "ArrowRight":
                    move.right = false;
                    break;
                case "ShiftLeft":
                case "ShiftRight":
                    sprintHeld = false;
                    break;
                default:
                    break;
            }
        }

        function onCtx(e) {
            e.preventDefault();
        }

        function playShootSound() {
            try {
                const Ctx = window.AudioContext || window.webkitAudioContext;
                if (!Ctx) return;
                if (!audioCtx) audioCtx = new Ctx();
                if (audioCtx.state === "suspended") void audioCtx.resume();
                const o = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                o.type = "square";
                o.frequency.value = 420;
                g.gain.value = 0.035;
                o.connect(g);
                g.connect(audioCtx.destination);
                o.start();
                o.stop(audioCtx.currentTime + 0.05);
            } catch {
                /* noop */
            }
        }

        function hurtEnemy(en) {
            if (!en || en.hp <= 0 || doneRef.current) return;
            en.hp -= 1;
            en.hitT = 0.12;
            en.bodyMat.emissive.setHex(0xff2222);
            setHud((s) => ({ ...s, hitMarker: true }));
            setTimeout(() => setHud((s) => ({ ...s, hitMarker: false })), 80);
            if (en.hp <= 0) {
                scene.remove(en.group);
                const idx = enemies.indexOf(en);
                if (idx >= 0) enemies.splice(idx, 1);
                totalKills += 1;
                score += 100 + Math.floor(Math.random() * 50);
                if (totalKills >= killsToWin) {
                    setHud((s) => ({ ...s, score, kills: totalKills }));
                    queueMicrotask(completeGame);
                } else {
                    spawnQueue += 1;
                    spawnTimer = SPAWN_DELAY;
                }
            }
        }

        function tryShoot() {
            if (!controls?.isLocked || doneRef.current || fireCd > 0) return;
            fireCd = FIRE_COOLDOWN;
            muzzleT = 0.08;
            if (weaponGroup?.userData.flash) weaponGroup.userData.flash.visible = true;
            playShootSound();

            raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
            const list = enemies.filter((e) => e.hp > 0).map((e) => e.group);
            const hits = raycaster.intersectObjects(list, true);
            if (hits.length > 0) {
                let o = hits[0].object;
                while (o.parent && !o.userData.enemyRoot) o = o.parent;
                if (o.userData.enemyRoot) {
                    const en = enemies.find((e) => e.group === o);
                    if (en && en.hp > 0) hurtEnemy(en);
                }
            }
        }

        function spawnEnemy() {
            if (doneRef.current || totalKills >= killsToWin) return false;
            const alive = enemies.filter((e) => e.hp > 0).length;
            if (alive >= MAX_ALIVE) return false;
            const { x, z } = randomSpawnXZ();
            const { group, bodyMat } = createEnemyCube();
            group.position.set(x, 0, z);
            scene.add(group);
            enemies.push({
                group,
                hp: ENEMY_HP,
                bodyMat,
                hitT: 0,
                bob: Math.random() * Math.PI * 2,
            });
            return true;
        }

        function onMouseDown(e) {
            if (doneRef.current) return;
            if (!controls?.isLocked) return;
            if (e.button === 0) tryShoot();
        }

        function onDocumentClick() {
            if (doneRef.current || !controls) return;
            controls.lock();
        }

        function onCanvasClick() {
            if (doneRef.current || !controls) return;
            controls.lock();
        }

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x070a10);
        scene.fog = new THREE.Fog(0x070a10, 18, 52);

        const w = mount.clientWidth || 640;
        const h = mount.clientHeight || 400;
        camera = new THREE.PerspectiveCamera(75, w / h, 0.05, 140);
        camera.rotation.order = "YXZ";

        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(w, h);
        renderer.shadowMap.enabled = true;
        renderer.domElement.tabIndex = 0;
        mount.appendChild(renderer.domElement);

        solids = buildLevel(scene);

        controls = new PointerLockControls(camera, renderer.domElement);
        controls.pointerSpeed = POINTER_SPEED;
        if (typeof controls.getObject !== "function") {
            controls.getObject = function getObject() {
                return this.object;
            };
        }
        camera.position.set(0, EYE_H, 0);
        scene.add(controls.getObject());
        weaponGroup = attachWeapon(camera);

        requestLockRef.current = () => {
            try {
                controls?.lock();
            } catch {
                /* noop */
            }
        };

        controls.addEventListener("lock", () => {
            console.log("FPS activo");
            if (controls.isLocked === true) {
                console.log("Pointer lock: controls.isLocked === true");
            }
            setHud((s) => ({ ...s, locked: true }));
        });
        controls.addEventListener("unlock", () => setHud((s) => ({ ...s, locked: false })));

        document.addEventListener("click", onDocumentClick);
        renderer.domElement.addEventListener("click", onCanvasClick);
        renderer.domElement.addEventListener("mousedown", onMouseDown);
        renderer.domElement.addEventListener("contextmenu", onCtx);
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);

        let playerHp = PLAYER_HP_MAX;
        {
            const n0 = Math.min(MAX_ALIVE, killsToWin);
            for (let i = 0; i < n0; i++) spawnEnemy();
        }

        const loop = () => {
            raf = requestAnimationFrame(loop);
            const delta = Math.min(clock.getDelta(), 0.05);

            if (fireCd > 0) fireCd -= delta;
            if (muzzleT > 0) {
                muzzleT -= delta;
                if (muzzleT <= 0 && weaponGroup?.userData.flash) weaponGroup.userData.flash.visible = false;
            }
            if (contactCd > 0) contactCd -= delta;

            if (spawnTimer > 0) spawnTimer -= delta;
            while (spawnTimer <= 0 && spawnQueue > 0 && totalKills < killsToWin && !doneRef.current) {
                if (spawnEnemy()) {
                    spawnQueue -= 1;
                    spawnTimer = spawnQueue > 0 ? SPAWN_DELAY : 0;
                } else {
                    spawnTimer = SPAWN_DELAY;
                    break;
                }
            }

            if (!doneRef.current && controls.isLocked) {
                const ctrlObj = controls.getObject();
                const speed = WALK_SPEED * (sprintHeld ? SPRINT_MULT : 1) * delta;

                if (move.forward) controls.moveForward(speed);
                if (move.backward) controls.moveForward(-speed);
                if (move.left) controls.moveRight(-speed);
                if (move.right) controls.moveRight(speed);

                const hx = clampHoriz(ctrlObj.position.x, ctrlObj.position.z);
                ctrlObj.position.x = hx.x;
                ctrlObj.position.z = hx.z;

                vy -= GRAVITY * delta;
                ctrlObj.position.y += vy * delta;

                const feetY = ctrlObj.position.y - EYE_H;
                playerBox.set(
                    new THREE.Vector3(ctrlObj.position.x - PLAYER_R, feetY, ctrlObj.position.z - PLAYER_R),
                    new THREE.Vector3(ctrlObj.position.x + PLAYER_R, feetY + EYE_H, ctrlObj.position.z + PLAYER_R),
                );
                resolvePlayerAgainstSolids(playerBox, solids);

                ctrlObj.position.x = (playerBox.min.x + playerBox.max.x) / 2;
                ctrlObj.position.z = (playerBox.min.z + playerBox.max.z) / 2;
                const feetAfter = playerBox.min.y;
                ctrlObj.position.y = feetAfter + EYE_H;

                grounded = feetAfter <= getSupportYAt(ctrlObj.position.x, ctrlObj.position.z, solids, 0) + GROUND_EPS + 0.08;
                if (feetAfter <= getSupportYAt(ctrlObj.position.x, ctrlObj.position.z, solids, 0) + GROUND_EPS) {
                    vy = Math.max(vy, 0);
                    if (vy < 0.45) vy = 0;
                    grounded = true;
                }
                if (ctrlObj.position.y - EYE_H < 0) {
                    ctrlObj.position.y = EYE_H;
                    vy = 0;
                    grounded = true;
                }
                if (grounded && jumpQueued) {
                    vy = JUMP_V;
                    grounded = false;
                    jumpQueued = false;
                }

                const p = ctrlObj.position;
                enemies.forEach((e) => {
                    if (e.hp <= 0) return;
                    e.bob += delta * 5;
                    tmpV.subVectors(p, e.group.position);
                    tmpV.y = 0;
                    const dist = tmpV.length();
                    if (dist > 0.15) tmpV.normalize();
                    wander.set((rng() - 0.5) * 2, 0, (rng() - 0.5) * 2).normalize();
                    tmpV.lerp(wander, 0.35);
                    tmpV.normalize();
                    e.group.position.addScaledVector(tmpV, ENEMY_SPEED * delta * (dist > 8 ? 0.7 : 1));
                    e.group.position.x += (rng() - 0.5) * ENEMY_WANDER * delta;
                    e.group.position.z += (rng() - 0.5) * ENEMY_WANDER * delta;
                    e.group.position.y = Math.abs(Math.sin(e.bob)) * 0.08;
                    const lim = ROOM - 1.2;
                    e.group.position.x = Math.max(-lim, Math.min(lim, e.group.position.x));
                    e.group.position.z = Math.max(-lim, Math.min(lim, e.group.position.z));
                    e.group.lookAt(p.x, e.group.position.y + ENEMY_SIZE.y * 0.5, p.z);

                    if (e.hitT > 0) {
                        e.hitT -= delta;
                        if (e.hitT <= 0) e.bodyMat.emissive.setHex(0x220511);
                    }

                    const d = new THREE.Vector2(p.x - e.group.position.x, p.z - e.group.position.z).length();
                    if (d < 1.1 && contactCd <= 0) {
                        contactCd = CONTACT_CD;
                        playerHp = Math.max(0, playerHp - CONTACT_DAMAGE);
                        setHud((s) => ({ ...s, hp: playerHp }));
                    }
                });

                hudTick += delta;
                if (hudTick > 0.08) {
                    hudTick = 0;
                    const alive = enemies.filter((e) => e.hp > 0).length;
                    setHud((s) => ({
                        ...s,
                        score,
                        kills: totalKills,
                        killsToWin,
                        alive,
                        hp: playerHp,
                    }));
                }
            }

            renderer.render(scene, camera);
        };
        loop();

        const ro = new ResizeObserver(() => {
            const rw = mount.clientWidth;
            const rh = mount.clientHeight;
            camera.aspect = rw / rh;
            camera.updateProjectionMatrix();
            renderer.setSize(rw, rh);
        });
        ro.observe(mount);

        return () => {
            ro.disconnect();
            dispose();
        };
    }, [preview, killsToWin, completeGame, cursoId]);

    if (alreadyDone && !preview) {
        return (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-10 text-center">
                <p className="text-lg font-semibold text-emerald-300">Ya completaste este minijuego</p>
                <p className="text-sm text-slate-400">Puedes volver a entrar al curso cuando quieras.</p>
            </div>
        );
    }

    return (
        <div className="relative w-full min-h-[min(72vh,680px)] overflow-hidden rounded-xl border border-emerald-500/25 bg-[#05070c] text-slate-100">
            <div ref={mountRef} tabIndex={-1} className="h-[min(72vh,620px)] w-full min-h-[400px] outline-none focus:ring-2 focus:ring-emerald-500/30" />

            {hud.locked && !hud.done && (
                <div
                    className="pointer-events-none fixed left-1/2 top-1/2 z-[100] h-0 w-0 -translate-x-1/2 -translate-y-1/2"
                    style={{ position: "fixed", top: "50%", left: "50%" }}
                    aria-hidden
                >
                    <div className="absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 -translate-y-1/2 bg-white" />
                    <div className="absolute left-1/2 top-1/2 h-5 w-px -translate-x-1/2 -translate-y-1/2 bg-white" />
                    <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50 bg-transparent" />
                </div>
            )}

            {!preview && (
                <>
                    {hud.hitMarker && (
                        <div className="pointer-events-none fixed inset-0 z-[99] border-4 border-red-500/35" style={{ position: "fixed" }} />
                    )}

                    <div className="absolute left-0 right-0 top-0 z-20 flex flex-wrap items-start justify-between gap-2 p-3 font-mono text-[11px]">
                        <div className="rounded-lg border border-emerald-500/30 bg-black/75 px-3 py-2 backdrop-blur-sm">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Score</div>
                            <div className="text-lg font-bold text-white tabular-nums">{hud.score}</div>
                        </div>
                        <div className="rounded-lg border border-white/15 bg-black/75 px-3 py-2 backdrop-blur-sm">
                            <div className="text-[10px] text-slate-500">Eliminados</div>
                            <div className="text-white tabular-nums">
                                {hud.kills} / {hud.killsToWin}
                            </div>
                        </div>
                        <div className="rounded-lg border border-white/15 bg-black/75 px-3 py-2 backdrop-blur-sm">
                            <div className="text-[10px] text-slate-500">Enemigos</div>
                            <div className="text-amber-200 tabular-nums">{hud.alive}</div>
                        </div>
                        <div className="rounded-lg border border-rose-500/25 bg-black/75 px-3 py-2 backdrop-blur-sm">
                            <div className="text-[10px] text-slate-500">Vida</div>
                            <div className="text-rose-300 tabular-nums">{hud.hp}</div>
                        </div>
                    </div>

                    <div className="pointer-events-none absolute bottom-3 left-3 z-20 max-w-md rounded border border-white/10 bg-black/60 px-3 py-2 text-[10px] text-slate-400 backdrop-blur-sm">
                        WASD mover · Shift sprint · SPACE saltar · clic izq. disparar · Esc salir puntero
                    </div>
                </>
            )}

            {!hud.locked && !hud.done && (
                <button
                    type="button"
                    className="absolute inset-0 z-30 flex cursor-pointer flex-col items-center justify-center border-0 bg-black/70 px-4 text-center backdrop-blur-sm"
                    onClick={() => requestLockRef.current()}
                >
                    <span className="mb-2 text-xl font-black uppercase tracking-widest text-emerald-400">Shooter FPS</span>
                    <span className="max-w-md text-sm text-slate-300">Haz click para activar el modo FPS</span>
                    {!preview && (
                        <span className="mt-2 text-xs text-slate-500">Elimina {hud.killsToWin} enemigos · primera persona</span>
                    )}
                </button>
            )}
            {hud.done && !preview && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/85 text-center backdrop-blur-md">
                    <p className="text-2xl font-bold text-emerald-400">¡Juego completado!</p>
                    <p className="mt-2 text-slate-300">Puntuación final: {hud.score}</p>
                </div>
            )}

            {preview && (
                <div className="pointer-events-none absolute bottom-2 left-2 right-2 rounded bg-black/55 px-2 py-1 text-center text-[10px] text-slate-500">
                    Vista previa · FPS (pointer lock + WASD)
                </div>
            )}
        </div>
    );
}

export { STORAGE_KEY as GAMES_FPS_STORAGE_KEY };

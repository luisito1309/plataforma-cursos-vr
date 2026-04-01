import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const PIECE_ORDER = ["motherboard", "cpu", "ram", "gpu", "psu", "ssd"];

const MODEL_PATHS = {
    case: "/models/case.glb",
    motherboard: "/models/motherboard.glb",
    cpu: "/models/cpu.glb",
    ram: "/models/ram.glb",
    gpu: "/models/gpu.glb",
    psu: "/models/psu.glb",
    ssd: "/models/ssd.glb",
};

const slots = {
    cpu: new THREE.Vector3(0, 1, 0),
    ram: new THREE.Vector3(1, 1, 0),
    gpu: new THREE.Vector3(2, 1, 0),
};

const SLOT_POSITIONS = {
    motherboard: new THREE.Vector3(0, 0.6, 0),
    cpu: slots.cpu.clone(),
    ram: slots.ram.clone(),
    gpu: slots.gpu.clone(),
    psu: new THREE.Vector3(-1.2, 0.25, -0.8),
    ssd: new THREE.Vector3(1.2, 0.25, -0.8),
};

const MODEL_SCALE = {
    case: 1,
    motherboard: 0.45,
    cpu: 0.45,
    ram: 0.5,
    gpu: 0.48,
    psu: 0.45,
    ssd: 0.48,
};

const PIECE_LABEL = {
    motherboard: "Motherboard",
    cpu: "CPU",
    ram: "RAM",
    gpu: "GPU",
    psu: "PSU",
    ssd: "SSD",
};

function disposeObject3D(root) {
    if (!root) return;
    root.traverse((child) => {
        if (!child.isMesh) return;
        child.geometry?.dispose?.();
        const mat = child.material;
        if (Array.isArray(mat)) {
            mat.forEach((m) => {
                m?.map?.dispose?.();
                m?.dispose?.();
            });
        } else {
            mat?.map?.dispose?.();
            mat?.dispose?.();
        }
    });
}

function fitToSize(object, targetSize = 1.2) {
    object.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 0.0001);
    const scale = targetSize / maxDim;
    object.scale.multiplyScalar(scale);
    object.updateMatrixWorld(true);
    const centered = new THREE.Box3().setFromObject(object);
    const center = centered.getCenter(new THREE.Vector3());
    object.position.sub(center);
}

function createSlotMesh(color = "#374151") {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.03, 0.34),
        new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.86 }),
    );
    return mesh;
}

export default function PCBuilder3D({ preview = false }) {
    const mountRef = useRef(null);
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const controlsRef = useRef(null);
    const rafRef = useRef(0);
    const raycasterRef = useRef(new THREE.Raycaster());
    const pointerRef = useRef(new THREE.Vector2());
    const loaderRef = useRef(new GLTFLoader());
    const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.6));
    const draggingRef = useRef(false);
    const ghostRef = useRef(null);
    const caseRef = useRef(null);
    const slotMeshesRef = useRef({});
    const loadedRef = useRef({});
    const loadTokenRef = useRef(0);
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [stepIndex, setStepIndex] = useState(0);
    const [placed, setPlaced] = useState({
        motherboard: false,
        cpu: false,
        ram: false,
        gpu: false,
        psu: false,
        ssd: false,
    });
    const [feedback, setFeedback] = useState({});
    const selectedPieceRef = useRef(selectedPiece);
    const stepIndexRef = useRef(stepIndex);
    const completedRef = useRef(false);

    const progress = useMemo(() => {
        const done = Object.values(placed).filter(Boolean).length;
        return Math.round((done / PIECE_ORDER.length) * 100);
    }, [placed]);
    const completed = stepIndex >= PIECE_ORDER.length;
    const activePiece = PIECE_ORDER[stepIndex] ?? null;

    useEffect(() => {
        selectedPieceRef.current = selectedPiece;
    }, [selectedPiece]);

    useEffect(() => {
        stepIndexRef.current = stepIndex;
        completedRef.current = stepIndex >= PIECE_ORDER.length;
    }, [stepIndex]);

    useEffect(() => {
        if (preview) return;
        if (!selectedPiece || !activePiece) return;
        if (selectedPiece !== activePiece) {
            setSelectedPiece(activePiece);
        }
    }, [activePiece, preview, selectedPiece]);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return undefined;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x070b17);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 200);
        camera.position.set(3.5, 2.8, 4.2);
        camera.lookAt(0, 0.8, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.shadowMap.enabled = !preview;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, preview ? 1.2 : 2));
        rendererRef.current = renderer;
        mount.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.07;
        controls.enablePan = false;
        controls.minPolarAngle = Math.PI / 5;
        controls.maxPolarAngle = (Math.PI * 2) / 3;
        controls.minDistance = preview ? 2.4 : 3.2;
        controls.maxDistance = preview ? 4.8 : 8.2;
        controls.target.set(0, 0.8, 0);
        controlsRef.current = controls;

        const ambient = new THREE.AmbientLight(0xffffff, 0.45);
        scene.add(ambient);

        const key = new THREE.DirectionalLight(0xffffff, 1.15);
        key.position.set(6, 9, 5);
        key.castShadow = !preview;
        scene.add(key);

        const fill = new THREE.DirectionalLight(0x88a8ff, 0.4);
        fill.position.set(-6, 4, -5);
        scene.add(fill);

        const floor = new THREE.Mesh(
            new THREE.CircleGeometry(8, 48),
            new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9, metalness: 0.1 }),
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0.02;
        floor.receiveShadow = !preview;
        scene.add(floor);

        loadTokenRef.current += 1;
        const token = loadTokenRef.current;

        loaderRef.current.load(MODEL_PATHS.case, (gltf) => {
            if (token !== loadTokenRef.current) {
                disposeObject3D(gltf.scene);
                return;
            }
            const root = gltf.scene;
            root.name = "pc_case";
            fitToSize(root, 3.1);
            root.position.y = 0.8;
            root.traverse((c) => {
                if (!c.isMesh) return;
                c.castShadow = !preview;
                c.receiveShadow = !preview;
            });
            scene.add(root);
            caseRef.current = root;
        });

        const createSlots = () => {
            Object.entries(SLOT_POSITIONS).forEach(([id, pos]) => {
                const slotMesh = createSlotMesh(id === PIECE_ORDER[stepIndexRef.current] ? "#06b6d4" : "#374151");
                slotMesh.position.copy(pos);
                slotMesh.userData.slotId = id;
                scene.add(slotMesh);
                slotMeshesRef.current[id] = slotMesh;
            });
        };
        createSlots();

        const resize = () => {
            const w = mount.clientWidth || 1;
            const h = mount.clientHeight || 1;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(mount);

        const clock = new THREE.Clock();
        const loop = () => {
            const t = clock.getElapsedTime();
            Object.entries(slotMeshesRef.current).forEach(([id, mesh]) => {
                const isActive = !preview && id === PIECE_ORDER[stepIndexRef.current];
                const pulse = isActive ? 1 + Math.sin(t * 5) * 0.06 : 1;
                mesh.scale.setScalar(pulse);
            });

            if (preview && caseRef.current) {
                caseRef.current.rotation.y += 0.003;
            }

            controls.update();
            renderer.render(scene, camera);
            rafRef.current = requestAnimationFrame(loop);
        };
        loop();

        if (!preview) {
            const getPointer = (event) => {
                const rect = renderer.domElement.getBoundingClientRect();
                pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            };

            const ensureGhost = (pieceId) => {
                if (ghostRef.current?.userData?.pieceId === pieceId) return;
                if (ghostRef.current) {
                    scene.remove(ghostRef.current);
                    disposeObject3D(ghostRef.current);
                    ghostRef.current = null;
                }
                loaderRef.current.load(MODEL_PATHS[pieceId], (gltf) => {
                    if (!selectedPieceRef.current || pieceId !== selectedPieceRef.current) {
                        disposeObject3D(gltf.scene);
                        return;
                    }
                    const root = gltf.scene;
                    fitToSize(root, 0.75);
                    root.traverse((c) => {
                        if (!c.isMesh) return;
                        c.material = c.material.clone();
                        c.material.transparent = true;
                        c.material.opacity = 0.8;
                    });
                    root.userData.pieceId = pieceId;
                    root.position.copy(SLOT_POSITIONS[pieceId]);
                    root.position.y += 0.15;
                    scene.add(root);
                    ghostRef.current = root;
                });
            };

            const placePiece = (pieceId) => {
                if (loadedRef.current[pieceId]) return;
                loaderRef.current.load(MODEL_PATHS[pieceId], (gltf) => {
                    const root = gltf.scene;
                    fitToSize(root, 0.9);
                    root.position.copy(SLOT_POSITIONS[pieceId]);
                    root.scale.multiplyScalar(MODEL_SCALE[pieceId] ?? 1);
                    root.rotation.y = 0;
                    root.traverse((c) => {
                        if (!c.isMesh) return;
                        c.castShadow = true;
                        c.receiveShadow = true;
                    });
                    scene.add(root);
                    loadedRef.current[pieceId] = root;
                });
            };

            const setSlotState = (slotId, ok) => {
                const slot = slotMeshesRef.current[slotId];
                if (!slot) return;
                slot.material.color.set(ok ? "#22c55e" : "#ef4444");
                setFeedback((prev) => ({ ...prev, [slotId]: ok ? "ok" : "error" }));
                setTimeout(() => {
                    const activeNow = PIECE_ORDER[stepIndexRef.current] === slotId;
                    slot.material.color.set(activeNow ? "#06b6d4" : "#374151");
                    setFeedback((prev) => ({ ...prev, [slotId]: null }));
                }, 500);
            };

            const pointerDown = () => {
                const selected = selectedPieceRef.current;
                if (!selected || completedRef.current) return;
                draggingRef.current = true;
                ensureGhost(selected);
            };

            const pointerMove = (event) => {
                if (!draggingRef.current || !ghostRef.current) return;
                getPointer(event);
                raycasterRef.current.setFromCamera(pointerRef.current, camera);
                const hit = new THREE.Vector3();
                raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, hit);
                ghostRef.current.position.copy(hit);
                ghostRef.current.position.y = Math.max(0.2, hit.y);
            };

            const pointerUp = (event) => {
                const selected = selectedPieceRef.current;
                if (!draggingRef.current || !selected || completedRef.current) return;
                draggingRef.current = false;
                getPointer(event);
                raycasterRef.current.setFromCamera(pointerRef.current, camera);
                const candidates = Object.values(slotMeshesRef.current);
                const hits = raycasterRef.current.intersectObjects(candidates, false);
                if (!hits.length) return;
                const slotId = hits[0].object.userData.slotId;
                const expected = PIECE_ORDER[stepIndexRef.current];
                const ok = slotId === expected && selected === expected;
                if (!ok) {
                    setSlotState(slotId, false);
                    return;
                }
                setSlotState(slotId, true);
                placePiece(selected);
                if (ghostRef.current) {
                    scene.remove(ghostRef.current);
                    disposeObject3D(ghostRef.current);
                    ghostRef.current = null;
                }
                setPlaced((prev) => ({ ...prev, [selected]: true }));
                setSelectedPiece(null);
                setStepIndex((idx) => idx + 1);
            };

            renderer.domElement.addEventListener("pointerdown", pointerDown);
            renderer.domElement.addEventListener("pointermove", pointerMove);
            renderer.domElement.addEventListener("pointerup", pointerUp);

            return () => {
                renderer.domElement.removeEventListener("pointerdown", pointerDown);
                renderer.domElement.removeEventListener("pointermove", pointerMove);
                renderer.domElement.removeEventListener("pointerup", pointerUp);
            };
        }

        return () => {
            cancelAnimationFrame(rafRef.current);
            ro.disconnect();
            controls.dispose();
            loadTokenRef.current += 1;

            Object.values(loadedRef.current).forEach((obj) => {
                scene.remove(obj);
                disposeObject3D(obj);
            });
            loadedRef.current = {};

            if (ghostRef.current) {
                scene.remove(ghostRef.current);
                disposeObject3D(ghostRef.current);
                ghostRef.current = null;
            }
            if (caseRef.current) {
                scene.remove(caseRef.current);
                disposeObject3D(caseRef.current);
                caseRef.current = null;
            }
            Object.values(slotMeshesRef.current).forEach((slot) => {
                scene.remove(slot);
                slot.geometry.dispose();
                slot.material.dispose();
            });
            slotMeshesRef.current = {};

            renderer.dispose();
            if (renderer.domElement.parentNode === mount) {
                mount.removeChild(renderer.domElement);
            }
            sceneRef.current = null;
            cameraRef.current = null;
            controlsRef.current = null;
            rendererRef.current = null;
        };
    }, [preview]);

    useEffect(() => {
        if (preview) return;
        Object.entries(slotMeshesRef.current).forEach(([slotId, mesh]) => {
            const status = feedback[slotId];
            if (status === "ok") mesh.material.color.set("#22c55e");
            else if (status === "error") mesh.material.color.set("#ef4444");
            else mesh.material.color.set(slotId === activePiece ? "#06b6d4" : "#374151");
        });
    }, [activePiece, feedback, preview]);

    const instruction = completed
        ? "Ensamblaje completado"
        : `Coloca la ${PIECE_LABEL[activePiece]} en su slot`;

    return (
        <div
            style={{
                width: "100%",
                height: preview ? "300px" : "600px",
                minHeight: preview ? 240 : 520,
                display: "grid",
                gridTemplateColumns: preview ? "1fr" : "300px 1fr",
                borderRadius: 16,
                overflow: "hidden",
                background: "linear-gradient(135deg, #050816, #0b1120)",
                border: "1px solid rgba(148,163,184,.24)",
            }}
        >
            {!preview && (
                <aside
                    style={{
                        padding: 14,
                        borderRight: "1px solid rgba(148,163,184,.25)",
                        color: "#e2e8f0",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                    }}
                >
                    <h3 style={{ margin: 0, fontSize: 18 }}>PC Builder 3D</h3>
                    <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{instruction}</p>
                    <div style={{ fontSize: 12, color: "#cbd5e1" }}>Progreso: {progress}%</div>
                    <div style={{ height: 8, borderRadius: 999, background: "#1e293b", overflow: "hidden" }}>
                        <div
                            style={{
                                width: `${progress}%`,
                                height: "100%",
                                background: "linear-gradient(90deg,#22c55e,#3b82f6)",
                                transition: "width .25s ease",
                            }}
                        />
                    </div>
                    <div style={{ display: "grid", gap: 6 }}>
                        {PIECE_ORDER.map((id, idx) => {
                            const isDone = placed[id];
                            const isActive = id === activePiece;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => !isDone && setSelectedPiece(id)}
                                    disabled={isDone || completed}
                                    style={{
                                        border: isActive ? "1px solid #06b6d4" : "1px solid rgba(148,163,184,.35)",
                                        background: isDone ? "rgba(34,197,94,.2)" : "rgba(2,6,23,.55)",
                                        color: "#e2e8f0",
                                        padding: "7px 9px",
                                        borderRadius: 10,
                                        textAlign: "left",
                                        fontSize: 12,
                                        cursor: isDone || completed ? "not-allowed" : "pointer",
                                        opacity: isDone ? 0.8 : 1,
                                    }}
                                >
                                    {idx + 1}. {PIECE_LABEL[id]}
                                </button>
                            );
                        })}
                    </div>
                </aside>
            )}
            <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
        </div>
    );
}

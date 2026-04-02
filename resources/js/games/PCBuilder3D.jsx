import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const ORDER = ["motherboard", "cpu", "ram", "gpu", "psu", "ssd"];
const LABELS = {
    motherboard: "Motherboard",
    cpu: "CPU",
    ram: "RAM",
    gpu: "GPU",
    psu: "PSU",
    ssd: "SSD",
};
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

const SLOT_POS = {
    motherboard: new THREE.Vector3(0, 0.6, 0),
    cpu: slots.cpu.clone(),
    ram: slots.ram.clone(),
    gpu: slots.gpu.clone(),
    psu: new THREE.Vector3(-1.2, 0.25, -0.8),
    ssd: new THREE.Vector3(1.2, 0.25, -0.8),
};

function disposeObject(root) {
    if (!root) return;
    root.traverse((obj) => {
        if (!obj.isMesh) return;
        obj.geometry?.dispose?.();
        const mat = obj.material;
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

function normalizeModel(root, targetSize = 1.05) {
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 0.0001);
    const scale = targetSize / maxDim;
    root.scale.multiplyScalar(scale);
    root.updateMatrixWorld(true);
    const center = new THREE.Box3().setFromObject(root).getCenter(new THREE.Vector3());
    root.position.sub(center);
}

function applyModelMaterial(root) {
    root.traverse((obj) => {
        if (!obj.isMesh) return;
        const color =
            obj.material?.color instanceof THREE.Color ? obj.material.color.clone() : new THREE.Color(0xa7b5c9);
        obj.material = new THREE.MeshPhysicalMaterial({
            color,
            metalness: 0.5,
            roughness: 0.3,
            clearcoat: 0.2,
            clearcoatRoughness: 0.2,
            reflectivity: 0.8,
        });
        obj.material.needsUpdate = true;
        obj.castShadow = true;
        obj.receiveShadow = true;
    });
}

function buildSlot(color = "#3b82f6") {
    return new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 0.04, 24),
        new THREE.MeshStandardMaterial({
            color,
            metalness: 0.45,
            roughness: 0.35,
            emissive: new THREE.Color("#0a1428"),
            emissiveIntensity: 0.7,
        }),
    );
}

function fallbackPiece(color = 0x3b82f6) {
    return new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.32, 0.32),
        new THREE.MeshPhysicalMaterial({ color, metalness: 0.45, roughness: 0.35 }),
    );
}

export default function PCBuilder3D({ preview = false }) {
    const wrapRef = useRef(null);
    const canvasHostRef = useRef(null);
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const controlsRef = useRef(null);
    const pmremRef = useRef(null);
    const loaderRef = useRef(new GLTFLoader());
    const rayRef = useRef(new THREE.Raycaster());
    const pointerRef = useRef(new THREE.Vector2());
    const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.6));
    const tempMatrixRef = useRef(new THREE.Matrix4());

    const selectedRef = useRef(null);
    const stepRef = useRef(0);
    const doneRef = useRef(false);
    const isVRRef = useRef(false);
    const activeControllerRef = useRef(null);
    const mouseDraggingRef = useRef(false);
    const vrDraggingRef = useRef(false);
    const vrDraggingControllerRef = useRef(null);

    const slotRefs = useRef({});
    const placedRefs = useRef({});
    const ghostRef = useRef(null);
    const hoverSlotRef = useRef(null);
    const tweensRef = useRef([]);
    const particlesRef = useRef(null);
    const cameraTweenRef = useRef(null);

    const controllersRef = useRef([]);
    const controllerGripsRef = useRef([]);
    const controllerRayLinesRef = useRef([]);

    const vrButtonRef = useRef(null);
    const successAudioRef = useRef(null);
    const errorAudioRef = useRef(null);
    const clickAudioRef = useRef(null);

    const [selected, setSelected] = useState(null);
    const [step, setStep] = useState(0);
    const [placed, setPlaced] = useState({
        motherboard: false,
        cpu: false,
        ram: false,
        gpu: false,
        psu: false,
        ssd: false,
    });
    const [loadError, setLoadError] = useState(false);
    const [message, setMessage] = useState("Coloca la Motherboard primero");
    const [messageTone, setMessageTone] = useState("info");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isVRMode, setIsVRMode] = useState(false);

    selectedRef.current = selected;
    stepRef.current = step;
    doneRef.current = step >= ORDER.length;

    const activePiece = ORDER[step] || null;
    const completed = step >= ORDER.length;
    const progress = useMemo(
        () => Math.round((Object.values(placed).filter(Boolean).length / ORDER.length) * 100),
        [placed],
    );

    useEffect(() => {
        // Audio opcional: evita errores 404 si no existen assets de sonido.
        successAudioRef.current = null;
        errorAudioRef.current = null;
        clickAudioRef.current = null;
    }, []);

    useEffect(() => {
        if (preview) return;
        if (!selected && !completed && activePiece) setSelected(activePiece);
    }, [activePiece, preview, selected, completed]);

    useEffect(() => {
        const onFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener("fullscreenchange", onFullscreen);
        return () => document.removeEventListener("fullscreenchange", onFullscreen);
    }, []);

    useEffect(() => {
        const host = canvasHostRef.current;
        if (!host) return undefined;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x060b16);
        scene.fog = new THREE.Fog(0x060b16, 8, 24);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 220);
        camera.position.set(4.4, 3.2, 4.9);
        camera.lookAt(0, 0.9, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        renderer.xr.enabled = true;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, preview ? 1.2 : 2));
        renderer.setSize(host.clientWidth || 1, host.clientHeight || 1);
        host.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const pmrem = new THREE.PMREMGenerator(renderer);
        pmremRef.current = pmrem;
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.minDistance = 3;
        controls.maxDistance = 10;
        controls.minPolarAngle = Math.PI / 5;
        controls.maxPolarAngle = (Math.PI * 2) / 3;
        controls.target.set(0, 0.8, 0);
        controlsRef.current = controls;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.position.set(5, 10, 5);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.set(2048, 2048);
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 40;
        scene.add(dirLight);

        const fillLight = new THREE.DirectionalLight(0x7aa2ff, 0.5);
        fillLight.position.set(-5, 4, -6);
        scene.add(fillLight);

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(50, 50),
            new THREE.MeshStandardMaterial({
                color: 0x222222,
                metalness: 0.25,
                roughness: 0.72,
                envMapIntensity: 0.35,
            }),
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        scene.add(floor);

        const backdrop = new THREE.Mesh(
            new THREE.PlaneGeometry(28, 12),
            new THREE.MeshStandardMaterial({ color: 0x0d1220, metalness: 0.1, roughness: 0.95 }),
        );
        backdrop.position.set(0, 6, -9);
        scene.add(backdrop);

        const fallbackCase = new THREE.Mesh(
            new THREE.BoxGeometry(3.3, 2.2, 1.5),
            new THREE.MeshPhysicalMaterial({
                color: 0x1f2937,
                transparent: true,
                opacity: 0.16,
                metalness: 0.45,
                roughness: 0.4,
            }),
        );
        fallbackCase.position.set(0, 1.1, -0.05);
        fallbackCase.castShadow = true;
        fallbackCase.receiveShadow = true;
        scene.add(fallbackCase);

        const fallbackCaseEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(3.3, 2.2, 1.5)),
            new THREE.LineBasicMaterial({ color: 0x334155 }),
        );
        fallbackCaseEdges.position.copy(fallbackCase.position);
        scene.add(fallbackCaseEdges);

        Object.entries(SLOT_POS).forEach(([id, pos]) => {
            const slot = buildSlot(id === ORDER[stepRef.current] ? "#22c55e" : "#3b82f6");
            slot.position.copy(pos);
            slot.userData.slotId = id;
            slot.receiveShadow = true;
            scene.add(slot);
            slotRefs.current[id] = slot;
        });

        loaderRef.current.load(
            MODEL_PATHS.case,
            (gltf) => {
                const root = gltf.scene;
                normalizeModel(root, 3.35);
                root.position.y = 0.95;
                applyModelMaterial(root);
                scene.add(root);
                fallbackCase.visible = false;
                fallbackCaseEdges.visible = false;
            },
            undefined,
            () => setLoadError(true),
        );

        const particleCount = 120;
        const particleGeom = new THREE.BufferGeometry();
        const particlePos = new Float32Array(particleCount * 3);
        const particleVel = [];
        for (let i = 0; i < particleCount; i += 1) {
            particlePos[i * 3 + 0] = 0;
            particlePos[i * 3 + 1] = 1.2;
            particlePos[i * 3 + 2] = 0;
            particleVel.push(new THREE.Vector3((Math.random() - 0.5) * 0.06, 0.04 + Math.random() * 0.07, (Math.random() - 0.5) * 0.06));
        }
        particleGeom.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
        const particleMat = new THREE.PointsMaterial({ color: 0x7dd3fc, size: 0.06, transparent: true, opacity: 0 });
        const particlePoints = new THREE.Points(particleGeom, particleMat);
        particlePoints.userData.vel = particleVel;
        particlePoints.userData.life = 0;
        particlePoints.visible = false;
        particlesRef.current = particlePoints;
        scene.add(particlePoints);

        const play = (audioRef) => {
            if (!audioRef.current) return;
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
        };

        const notifyOk = (text) => {
            setMessageTone("ok");
            setMessage(text);
            setTimeout(() => setMessageTone("info"), 900);
        };

        const notifyError = (text) => {
            setMessageTone("error");
            setMessage(text);
            setTimeout(() => setMessageTone("info"), 900);
        };

        const setSlotFeedback = (slotId, ok) => {
            const slot = slotRefs.current[slotId];
            if (!slot) return;
            slot.material.color.set(ok ? "#22c55e" : "#ef4444");
            slot.material.emissive.set(ok ? "#14532d" : "#7f1d1d");
            slot.material.emissiveIntensity = 1.1;
            setTimeout(() => {
                const current = ORDER[stepRef.current];
                Object.entries(slotRefs.current).forEach(([id, mesh]) => {
                    mesh.material.color.set(id === current ? "#22c55e" : "#3b82f6");
                    mesh.material.emissive.set(id === current ? "#14532d" : "#09142b");
                    mesh.material.emissiveIntensity = id === current ? 0.95 : 0.6;
                });
            }, 540);
        };

        const showCompleteParticles = () => {
            if (!particlesRef.current) return;
            particlesRef.current.visible = true;
            particlesRef.current.userData.life = 1.4;
            particlesRef.current.material.opacity = 1;
        };

        const addTween = (obj, target, duration, onDone) => {
            tweensRef.current.push({
                obj,
                from: obj.position.clone(),
                to: target.clone(),
                t: 0,
                duration,
                done: false,
                onDone,
            });
        };

        const createGhostFromPiece = (piece) => {
            if (ghostRef.current) {
                scene.remove(ghostRef.current);
                disposeObject(ghostRef.current);
                ghostRef.current = null;
            }
            loaderRef.current.load(
                MODEL_PATHS[piece],
                (gltf) => {
                    const root = gltf.scene;
                    normalizeModel(root, 0.86);
                    applyModelMaterial(root);
                    root.traverse((o) => {
                        if (!o.isMesh) return;
                        o.material.transparent = true;
                        o.material.opacity = 0.84;
                        o.material.emissive = new THREE.Color(0x16a34a);
                        o.material.emissiveIntensity = 0.24;
                    });
                    root.position.copy(SLOT_POS[piece]);
                    root.position.y += 0.16;
                    root.userData.kind = "drag-piece";
                    root.userData.pieceId = piece;
                    scene.add(root);
                    ghostRef.current = root;
                },
                undefined,
                () => {
                    const fallback = fallbackPiece(0x16a34a);
                    fallback.position.copy(SLOT_POS[piece]);
                    fallback.position.y += 0.16;
                    fallback.userData.kind = "drag-piece";
                    fallback.userData.pieceId = piece;
                    scene.add(fallback);
                    ghostRef.current = fallback;
                },
            );
        };

        const placeFinalPiece = (piece) => {
            if (placedRefs.current[piece]) return;
            loaderRef.current.load(
                MODEL_PATHS[piece],
                (gltf) => {
                    const root = gltf.scene;
                    normalizeModel(root, 1);
                    applyModelMaterial(root);
                    root.position.copy(SLOT_POS[piece]);
                    scene.add(root);
                    placedRefs.current[piece] = root;
                },
                undefined,
                () => {
                    const fallback = fallbackPiece(0x60a5fa);
                    fallback.position.copy(SLOT_POS[piece]);
                    scene.add(fallback);
                    placedRefs.current[piece] = fallback;
                },
            );
        };

        const confirmPlacement = () => {
            const piece = selectedRef.current;
            if (!piece || !ghostRef.current) return;
            const expected = ORDER[stepRef.current];
            const target = SLOT_POS[expected];
            const dist = ghostRef.current.position.distanceTo(target);
            const ok = piece === expected && dist < 0.5;
            if (!ok) {
                setSlotFeedback(expected, false);
                notifyError("Pieza incorrecta o fuera de rango");
                play(errorAudioRef);
                return;
            }
            setSlotFeedback(expected, true);
            notifyOk(`${LABELS[piece]} colocada correctamente`);
            play(successAudioRef);

            addTween(ghostRef.current, target, 0.45, () => {
                const chosen = selectedRef.current;
                if (!chosen) return;
                placeFinalPiece(chosen);
                scene.remove(ghostRef.current);
                disposeObject(ghostRef.current);
                ghostRef.current = null;
                setPlaced((prev) => ({ ...prev, [chosen]: true }));
                setSelected(null);
                setStep((s) => s + 1);
            });
        };

        const getMouseRayIntersections = () => {
            rayRef.current.setFromCamera(pointerRef.current, camera);
            return rayRef.current.intersectObjects(Object.values(slotRefs.current), false);
        };

        const updateMouseHover = () => {
            const hits = getMouseRayIntersections();
            const prev = hoverSlotRef.current;
            const next = hits[0]?.object?.userData?.slotId ?? null;

            if (prev && slotRefs.current[prev] && prev !== next) {
                const mesh = slotRefs.current[prev];
                const current = ORDER[stepRef.current];
                mesh.material.emissive.set(prev === current ? "#14532d" : "#09142b");
                mesh.material.emissiveIntensity = prev === current ? 0.95 : 0.6;
            }
            if (next && slotRefs.current[next]) {
                const mesh = slotRefs.current[next];
                mesh.material.emissive.set("#22c55e");
                mesh.material.emissiveIntensity = 1.45;
            }
            hoverSlotRef.current = next;
        };

        const updateMouseDrag = () => {
            if (!mouseDraggingRef.current || !ghostRef.current) return;
            rayRef.current.setFromCamera(pointerRef.current, camera);
            const point = new THREE.Vector3();
            rayRef.current.ray.intersectPlane(dragPlaneRef.current, point);
            ghostRef.current.position.copy(point);
            ghostRef.current.position.y = Math.max(0.2, point.y);
        };

        const handleMouseControls = () => {
            updateMouseHover();
            updateMouseDrag();
        };

        const getControllerIntersections = (controller) => {
            tempMatrixRef.current.identity().extractRotation(controller.matrixWorld);
            rayRef.current.ray.origin.setFromMatrixPosition(controller.matrixWorld);
            rayRef.current.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrixRef.current);

            const targets = [];
            if (ghostRef.current) targets.push(ghostRef.current);
            Object.values(slotRefs.current).forEach((slot) => targets.push(slot));

            return rayRef.current.intersectObjects(targets, true);
        };

        const updateVRControls = () => {
            const [c1, c2] = controllersRef.current;
            const [l1, l2] = controllerRayLinesRef.current;
            const pairs = [
                [c1, l1],
                [c2, l2],
            ];

            pairs.forEach(([controller, line]) => {
                if (!controller || !line) return;
                const intersects = getControllerIntersections(controller);
                if (intersects.length) {
                    line.scale.z = Math.max(0.1, intersects[0].distance);
                    line.material.color.set(0x22c55e);
                } else {
                    line.scale.z = 6;
                    line.material.color.set(0x22d3ee);
                }
            });

            if (vrDraggingRef.current && vrDraggingControllerRef.current?.userData?.selectedObject) {
                const obj = vrDraggingControllerRef.current.userData.selectedObject;
                const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(vrDraggingControllerRef.current.quaternion);
                const targetPos = vrDraggingControllerRef.current.position.clone().add(dir.multiplyScalar(0.22));
                obj.position.copy(targetPos);
            }
        };

        function updateInteraction() {
            if (isVRRef.current) {
                handleMouseControls(); // keep hover emissive states stable
                updateVRControls();
            } else {
                handleMouseControls();
            }
        }

        const toPointer = (event) => {
            const rect = renderer.domElement.getBoundingClientRect();
            pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        };

        const onPointerDown = () => {
            if (preview || isVRRef.current || doneRef.current || !selectedRef.current) return;
            mouseDraggingRef.current = true;
            play(clickAudioRef);
            createGhostFromPiece(selectedRef.current);
        };

        const onPointerMove = (event) => {
            if (preview || isVRRef.current) return;
            toPointer(event);
        };

        const onPointerUp = () => {
            if (preview || isVRRef.current || !mouseDraggingRef.current) return;
            mouseDraggingRef.current = false;
            confirmPlacement();
        };

        const onKeyDown = (event) => {
            if (preview || isVRRef.current || doneRef.current) return;
            if (/^[1-6]$/.test(event.key)) {
                const index = Number(event.key) - 1;
                const piece = ORDER[index];
                if (!placed[piece]) setSelected(piece);
                return;
            }
            if (event.key === "Escape") {
                setSelected(null);
            }
        };

        renderer.domElement.addEventListener("pointerdown", onPointerDown);
        renderer.domElement.addEventListener("pointermove", onPointerMove);
        renderer.domElement.addEventListener("pointerup", onPointerUp);
        window.addEventListener("keydown", onKeyDown);

        const controllerModelFactory = new XRControllerModelFactory();
        const controller1 = renderer.xr.getController(0);
        const controller2 = renderer.xr.getController(1);
        controllersRef.current = [controller1, controller2];
        scene.add(controller1);
        scene.add(controller2);

        const controllerGrip1 = renderer.xr.getControllerGrip(0);
        const controllerGrip2 = renderer.xr.getControllerGrip(1);
        controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
        controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
        controllerGripsRef.current = [controllerGrip1, controllerGrip2];
        scene.add(controllerGrip1);
        scene.add(controllerGrip2);

        const makeControllerRay = () => {
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, -1),
            ]);
            const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x22d3ee }));
            line.name = "controller-ray";
            line.scale.z = 6;
            return line;
        };

        const rayLine1 = makeControllerRay();
        const rayLine2 = makeControllerRay();
        controller1.add(rayLine1);
        controller2.add(rayLine2);
        controllerRayLinesRef.current = [rayLine1, rayLine2];

        const onControllerSelectStart = (event) => {
            if (preview || doneRef.current) return;
            const controller = event.target;
            if (!selectedRef.current && ORDER[stepRef.current]) setSelected(ORDER[stepRef.current]);
            if (!ghostRef.current && selectedRef.current) createGhostFromPiece(selectedRef.current);
            const intersects = getControllerIntersections(controller);
            if (!intersects.length) return;
            const pickedObject = intersects[0].object;
            controller.userData.selectedObject = pickedObject;
            vrDraggingRef.current = true;
            vrDraggingControllerRef.current = controller;
            play(clickAudioRef);
        };

        const onControllerSelectEnd = (event) => {
            if (preview) return;
            const controller = event.target;
            if (!controller.userData.selectedObject) return;
            controller.userData.selectedObject = null;
            vrDraggingRef.current = false;
            vrDraggingControllerRef.current = null;
            confirmPlacement();
        };

        controller1.addEventListener("selectstart", onControllerSelectStart);
        controller2.addEventListener("selectstart", onControllerSelectStart);
        controller1.addEventListener("selectend", onControllerSelectEnd);
        controller2.addEventListener("selectend", onControllerSelectEnd);

        const onSessionStart = () => {
            isVRRef.current = true;
            setIsVRMode(true);
            mouseDraggingRef.current = false;
            setMessage("VR activo: usa trigger para agarrar y colocar");
        };
        const onSessionEnd = () => {
            isVRRef.current = false;
            setIsVRMode(false);
            vrDraggingRef.current = false;
            vrDraggingControllerRef.current = null;
            setMessage(`Coloca la ${LABELS[ORDER[stepRef.current] || "pieza"]} en el slot`);
        };

        renderer.xr.addEventListener("sessionstart", onSessionStart);
        renderer.xr.addEventListener("sessionend", onSessionEnd);

        if (!preview && !vrButtonRef.current) {
            const vrButton = VRButton.createButton(renderer);
            vrButton.style.position = "absolute";
            vrButton.style.right = "12px";
            vrButton.style.bottom = "12px";
            vrButton.style.zIndex = "8";
            document.body.appendChild(vrButton);
            vrButtonRef.current = vrButton;
        }

        const onResize = () => {
            const w = host.clientWidth || 1;
            const h = host.clientHeight || 1;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        const resizeObserver = new ResizeObserver(onResize);
        resizeObserver.observe(host);
        onResize();

        let elapsed = 0;
        let lastTs = performance.now();
        renderer.setAnimationLoop(() => {
            const nowTs = performance.now();
            const delta = Math.min((nowTs - lastTs) / 1000, 0.033);
            lastTs = nowTs;
            elapsed += delta;

            Object.entries(slotRefs.current).forEach(([id, mesh]) => {
                const current = ORDER[stepRef.current];
                const isActive = id === current;
                const pulse = isActive ? 1 + Math.sin(elapsed * 5.2) * 0.07 : 1;
                mesh.scale.setScalar(pulse);
            });

            if (tweensRef.current.length) {
                tweensRef.current.forEach((tw) => {
                    if (tw.done) return;
                    tw.t += delta / tw.duration;
                    const k = Math.min(tw.t, 1);
                    tw.obj.position.lerpVectors(tw.from, tw.to, 1 - Math.pow(1 - k, 3));
                    if (k >= 1) {
                        tw.done = true;
                        tw.onDone?.();
                    }
                });
                tweensRef.current = tweensRef.current.filter((tw) => !tw.done);
            }

            if (cameraTweenRef.current) {
                cameraTweenRef.current.t += delta / cameraTweenRef.current.duration;
                const k = Math.min(cameraTweenRef.current.t, 1);
                camera.position.lerpVectors(
                    cameraTweenRef.current.from,
                    cameraTweenRef.current.to,
                    1 - Math.pow(1 - k, 3),
                );
                if (k >= 1) cameraTweenRef.current = null;
            }

            if (particlesRef.current?.visible) {
                const points = particlesRef.current;
                const arr = points.geometry.attributes.position.array;
                const vel = points.userData.vel;
                points.userData.life -= delta;
                for (let i = 0; i < vel.length; i += 1) {
                    arr[i * 3 + 0] += vel[i].x;
                    arr[i * 3 + 1] += vel[i].y;
                    arr[i * 3 + 2] += vel[i].z;
                    vel[i].y -= 0.0012;
                }
                points.geometry.attributes.position.needsUpdate = true;
                points.material.opacity = Math.max(0, points.userData.life / 1.4);
                if (points.userData.life <= 0) points.visible = false;
            }

            updateInteraction();

            if (isVRRef.current) {
                // headset controla cámara
            } else {
                controls.update();
            }

            renderer.render(scene, camera);
        });

        return () => {
            renderer.setAnimationLoop(null);
            resizeObserver.disconnect();

            renderer.domElement.removeEventListener("pointerdown", onPointerDown);
            renderer.domElement.removeEventListener("pointermove", onPointerMove);
            renderer.domElement.removeEventListener("pointerup", onPointerUp);
            window.removeEventListener("keydown", onKeyDown);

            controller1.removeEventListener("selectstart", onControllerSelectStart);
            controller2.removeEventListener("selectstart", onControllerSelectStart);
            controller1.removeEventListener("selectend", onControllerSelectEnd);
            controller2.removeEventListener("selectend", onControllerSelectEnd);
            renderer.xr.removeEventListener("sessionstart", onSessionStart);
            renderer.xr.removeEventListener("sessionend", onSessionEnd);

            controls.dispose();
            tweensRef.current = [];
            cameraTweenRef.current = null;
            mouseDraggingRef.current = false;
            vrDraggingRef.current = false;
            activeControllerRef.current = null;
            hoverSlotRef.current = null;

            if (ghostRef.current) {
                scene.remove(ghostRef.current);
                disposeObject(ghostRef.current);
                ghostRef.current = null;
            }

            Object.values(placedRefs.current).forEach((obj) => {
                scene.remove(obj);
                disposeObject(obj);
            });
            placedRefs.current = {};

            Object.values(slotRefs.current).forEach((mesh) => {
                scene.remove(mesh);
                mesh.geometry.dispose();
                mesh.material.dispose();
            });
            slotRefs.current = {};

            if (particlesRef.current) {
                particlesRef.current.geometry.dispose();
                particlesRef.current.material.dispose();
                scene.remove(particlesRef.current);
                particlesRef.current = null;
            }

            disposeObject(fallbackCase);
            fallbackCaseEdges.geometry.dispose();
            fallbackCaseEdges.material.dispose();

            controllersRef.current = [];
            controllerGripsRef.current = [];
            controllerRayLinesRef.current = [];

            if (pmremRef.current) pmremRef.current.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);

            if (vrButtonRef.current && vrButtonRef.current.parentNode) {
                vrButtonRef.current.parentNode.removeChild(vrButtonRef.current);
                vrButtonRef.current = null;
            }
        };
    }, [preview]);

    useEffect(() => {
        if (completed) {
            setMessageTone("ok");
            setMessage("Ensamblaje completado. Excelente trabajo.");
            if (particlesRef.current) {
                particlesRef.current.visible = true;
                particlesRef.current.userData.life = 1.4;
                particlesRef.current.material.opacity = 1;
            }
            if (cameraRef.current) {
                cameraTweenRef.current = {
                    from: cameraRef.current.position.clone(),
                    to: new THREE.Vector3(5.2, 3.5, 5.6),
                    t: 0,
                    duration: 0.8,
                };
            }
        } else if (!preview && activePiece) {
            setMessage(`Coloca la ${LABELS[activePiece]} en el slot`);
        }
    }, [completed, activePiece, preview]);

    useEffect(() => {
        Object.entries(slotRefs.current).forEach(([id, mesh]) => {
            mesh.material.color.set(id === activePiece ? "#22c55e" : "#3b82f6");
            mesh.material.emissive.set(id === activePiece ? "#14532d" : "#09142b");
            mesh.material.emissiveIntensity = id === activePiece ? 0.95 : 0.6;
        });
    }, [activePiece]);

    const toggleFullscreen = async () => {
        if (!wrapRef.current) return;
        if (!document.fullscreenElement) await wrapRef.current.requestFullscreen?.();
        else await document.exitFullscreen?.();
    };

    const toneStyle =
        messageTone === "ok"
            ? { color: "#bbf7d0", border: "1px solid rgba(34,197,94,.45)", bg: "rgba(20,83,45,.3)" }
            : messageTone === "error"
            ? { color: "#fecaca", border: "1px solid rgba(239,68,68,.5)", bg: "rgba(127,29,29,.3)" }
            : { color: "#bfdbfe", border: "1px solid rgba(59,130,246,.45)", bg: "rgba(30,64,175,.25)" };

    return (
        <div
            ref={wrapRef}
            style={{
                width: "100%",
                height: preview ? "300px" : "600px",
                minHeight: preview ? 250 : 520,
                display: "grid",
                gridTemplateColumns: preview || isVRMode ? "1fr" : "320px 1fr",
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid rgba(148,163,184,.25)",
                background: "#020617",
                position: "relative",
            }}
        >
            {!preview && !isVRMode && (
                <aside style={{ borderRight: "1px solid rgba(148,163,184,.25)", padding: 14, color: "#e2e8f0" }}>
                    <h3 style={{ margin: "0 0 8px", fontSize: 19 }}>PC Builder 3D</h3>
                    <div
                        style={{
                            marginBottom: 10,
                            borderRadius: 10,
                            padding: "8px 10px",
                            color: toneStyle.color,
                            border: toneStyle.border,
                            background: toneStyle.bg,
                            fontSize: 12,
                        }}
                    >
                        {message}
                    </div>
                    <div style={{ fontSize: 12, marginBottom: 6 }}>Progreso: {progress}%</div>
                    <div style={{ height: 8, borderRadius: 999, background: "#1e293b", overflow: "hidden", marginBottom: 10 }}>
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
                        {ORDER.map((id, idx) => (
                            <button
                                key={id}
                                type="button"
                                disabled={placed[id] || completed}
                                onClick={() => setSelected(id)}
                                style={{
                                    border: id === activePiece ? "1px solid #22c55e" : "1px solid rgba(148,163,184,.35)",
                                    borderRadius: 10,
                                    background: placed[id] ? "rgba(34,197,94,.2)" : "rgba(2,6,23,.55)",
                                    color: "#e2e8f0",
                                    padding: "8px 9px",
                                    textAlign: "left",
                                    fontSize: 12,
                                    cursor: placed[id] || completed ? "not-allowed" : "pointer",
                                    opacity: placed[id] ? 0.78 : 1,
                                }}
                            >
                                {idx + 1}. {LABELS[id]}
                            </button>
                        ))}
                    </div>
                    <p style={{ margin: "10px 0 0", fontSize: 11, color: "#94a3b8" }}>
                        Teclas: 1-6 seleccionar pieza, ESC limpiar selección.
                    </p>
                </aside>
            )}

            <div ref={canvasHostRef} style={{ width: "100%", height: "100%" }} />

            {!preview && (
                <button
                    type="button"
                    onClick={toggleFullscreen}
                    style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        zIndex: 6,
                        border: "1px solid rgba(148,163,184,.35)",
                        background: "rgba(2,6,23,.72)",
                        color: "#e2e8f0",
                        borderRadius: 10,
                        padding: "6px 10px",
                        fontSize: 12,
                        cursor: "pointer",
                    }}
                >
                    {isFullscreen ? "Salir pantalla completa" : "Pantalla completa"}
                </button>
            )}

            {!preview && (
                <button
                    type="button"
                    onClick={() => console.log("Usar botón VR nativo")}
                    style={{
                        position: "absolute",
                        top: 44,
                        right: 10,
                        zIndex: 6,
                        border: "1px solid rgba(148,163,184,.35)",
                        background: "rgba(2,6,23,.72)",
                        color: "#e2e8f0",
                        borderRadius: 10,
                        padding: "6px 10px",
                        fontSize: 12,
                        cursor: "pointer",
                    }}
                >
                    🥽 Activar VR
                </button>
            )}

            {!preview && isVRMode && (
                <div
                    style={{
                        position: "absolute",
                        left: 12,
                        top: 10,
                        zIndex: 6,
                        fontSize: 11,
                        color: "#bbf7d0",
                        background: "rgba(20,83,45,.45)",
                        border: "1px solid rgba(34,197,94,.45)",
                        borderRadius: 8,
                        padding: "6px 8px",
                    }}
                >
                    VR activo: trigger para agarrar, soltar para colocar.
                </div>
            )}

            {loadError && (
                <div
                    style={{
                        position: "absolute",
                        left: 12,
                        bottom: 12,
                        zIndex: 6,
                        fontSize: 11,
                        color: "#fca5a5",
                        background: "rgba(127,29,29,.3)",
                        border: "1px solid rgba(239,68,68,.4)",
                        borderRadius: 8,
                        padding: "6px 8px",
                    }}
                >
                    Algunos modelos no cargaron. Se usa modo de respaldo.
                </div>
            )}
        </div>
    );
}

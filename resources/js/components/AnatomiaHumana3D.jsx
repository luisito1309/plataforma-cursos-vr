import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * Catálogo exportable para sustituir por respuesta Laravel + axios.
 * axios.get('/api/anatomia-sistemas').then(r => setData(r.data))
 */
export const SISTEMAS_ANATOMIA_BASE = [
    {
        id: "piel",
        label: "Piel",
        accent: "#f472b6",
        organos: [
            {
                id: "epidermis",
                name: "Epidermis",
                description: "Capa externa de la piel: barrera, pigmentación y renovación celular.",
                shape: "capsule",
                pos: [0, 1.05, 0],
                rot: [0, 0, 0],
                scale: [0.52, 0.95, 0.38],
                color: 0xffc9d9,
                opacity: 0.35,
                roughness: 0.4,
                metalness: 0.05,
            },
            {
                id: "dermis",
                name: "Dermis",
                description: "Capa intermedia con vasos, nervios, folículos y colágeno estructural.",
                shape: "capsule",
                pos: [0, 1.05, 0],
                rot: [0, 0, 0],
                scale: [0.46, 0.88, 0.33],
                color: 0xe8a0b0,
                opacity: 0.55,
                roughness: 0.55,
                metalness: 0,
            },
        ],
    },
    {
        id: "esqueletico",
        label: "Sistema esquelético",
        accent: "#cbd5e1",
        organos: [
            {
                id: "craneo",
                name: "Cráneo",
                description: "Protege el encéfalo y sostiene estructuras faciales.",
                shape: "sphere",
                pos: [0, 1.62, 0.06],
                scale: [0.22, 0.24, 0.2],
                color: 0xe2e8f0,
                roughness: 0.65,
                metalness: 0.1,
            },
            {
                id: "columna",
                name: "Columna vertebral",
                description: "Eje central que protege la médula y permite la postura y el movimiento.",
                shape: "cylinder",
                pos: [0, 1.15, -0.04],
                rot: [0, 0, 0],
                scale: [0.09, 0.55, 0.09],
                color: 0xd4d4d8,
                roughness: 0.7,
                metalness: 0.05,
            },
            {
                id: "costillas",
                name: "Costillas",
                description: "Protegen tórax y participan en la ventilación respiratoria.",
                shape: "torus",
                pos: [0, 1.38, 0.02],
                rot: [1.57, 0, 0],
                scale: [0.55, 0.55, 0.55],
                color: 0xc4b5fd,
                roughness: 0.5,
                metalness: 0.15,
            },
            {
                id: "femur",
                name: "Fémur",
                description: "Hueso más largo del cuerpo; transmite fuerzas entre cadera y rodilla.",
                shape: "cylinder",
                pos: [0.14, 0.72, 0],
                rot: [0, 0, 0.08],
                scale: [0.07, 0.38, 0.07],
                color: 0xa8a29e,
                roughness: 0.6,
                metalness: 0.08,
            },
        ],
    },
    {
        id: "muscular",
        label: "Sistema muscular",
        accent: "#f87171",
        organos: [
            {
                id: "biceps",
                name: "Bíceps braquial",
                description: "Flexiona el codo y supina el antebrazo.",
                shape: "capsule",
                pos: [-0.28, 1.32, 0.04],
                rot: [0, 0, 0.5],
                scale: [0.1, 0.22, 0.1],
                color: 0xef4444,
                roughness: 0.45,
                metalness: 0.1,
            },
            {
                id: "triceps",
                name: "Tríceps braquial",
                description: "Principal extensor del codo.",
                shape: "capsule",
                pos: [0.26, 1.28, -0.06],
                rot: [0, 0, -0.35],
                scale: [0.09, 0.2, 0.09],
                color: 0xdc2626,
                roughness: 0.45,
                metalness: 0.1,
            },
            {
                id: "pectorales",
                name: "Pectorales",
                description: "Aducen y flexionan el brazo sobre el tórax.",
                shape: "box",
                pos: [0, 1.42, 0.14],
                scale: [0.42, 0.14, 0.12],
                color: 0xf87171,
                roughness: 0.5,
                metalness: 0.05,
            },
        ],
    },
    {
        id: "nervioso",
        label: "Sistema nervioso",
        accent: "#818cf8",
        organos: [
            {
                id: "cerebro",
                name: "Cerebro",
                description: "Centro de integración sensorial, motor, cognitivo y emocional.",
                shape: "sphere",
                pos: [0, 1.62, 0.05],
                scale: [0.2, 0.22, 0.18],
                color: 0xa5b4fc,
                roughness: 0.35,
                metalness: 0.2,
            },
            {
                id: "medula_espinal",
                name: "Médula espinal",
                description: "Vía de conducción y centro de reflejos entre cerebro y cuerpo.",
                shape: "cylinder",
                pos: [0, 1.22, -0.08],
                scale: [0.05, 0.42, 0.05],
                color: 0x6366f1,
                roughness: 0.4,
                metalness: 0.15,
            },
            {
                id: "nervios_perifericos",
                name: "Nervios periféricos",
                description: "Fibras que inervan músculos, piel y vísceras.",
                shape: "cylinder",
                pos: [-0.18, 1.05, 0.1],
                rot: [0.4, 0, 0.6],
                scale: [0.02, 0.35, 0.02],
                color: 0xc7d2fe,
                roughness: 0.3,
                metalness: 0.25,
            },
        ],
    },
    {
        id: "circulatorio",
        label: "Sistema circulatorio",
        accent: "#fb7185",
        organos: [
            {
                id: "corazon",
                name: "Corazón",
                description: "Bomba muscular que impulsa la sangre por arterias y venas.",
                shape: "sphere",
                pos: [0.06, 1.38, 0.1],
                scale: [0.14, 0.16, 0.12],
                color: 0xbe123c,
                roughness: 0.35,
                metalness: 0.12,
            },
            {
                id: "arterias",
                name: "Arterias principales",
                description: "Conductos de alta presión que llevan sangre oxigenada desde el corazón.",
                shape: "cylinder",
                pos: [0.04, 1.48, 0.06],
                rot: [0.25, 0, 0],
                scale: [0.04, 0.2, 0.04],
                color: 0xf43f5e,
                roughness: 0.25,
                metalness: 0.35,
            },
            {
                id: "venas",
                name: "Venas principales",
                description: "Retorno de sangre al corazón; muchas llevan válvulas.",
                shape: "cylinder",
                pos: [-0.08, 1.25, 0.08],
                rot: [-0.2, 0.1, 0],
                scale: [0.045, 0.28, 0.045],
                color: 0x4c1d95,
                roughness: 0.4,
                metalness: 0.1,
            },
        ],
    },
    {
        id: "respiratorio",
        label: "Sistema respiratorio",
        accent: "#5eead4",
        organos: [
            {
                id: "pulmon_izq",
                name: "Pulmón izquierdo",
                description: "Intercambio gaseoso; ligeramente menor por el espacio cardíaco.",
                shape: "sphere",
                pos: [-0.16, 1.38, 0.02],
                scale: [0.16, 0.22, 0.14],
                color: 0x2dd4bf,
                roughness: 0.55,
                metalness: 0,
            },
            {
                id: "pulmon_der",
                name: "Pulmón derecho",
                description: "Tres lóbulos; principal superficie de oxigenación.",
                shape: "sphere",
                pos: [0.18, 1.36, 0.02],
                scale: [0.18, 0.24, 0.15],
                color: 0x14b8a6,
                roughness: 0.55,
                metalness: 0,
            },
            {
                id: "traquea",
                name: "Tráquea",
                description: "Conducto cartilaginoso que conduce aire a los bronquios.",
                shape: "cylinder",
                pos: [0, 1.52, 0.02],
                scale: [0.055, 0.14, 0.055],
                color: 0x99f6e4,
                roughness: 0.45,
                metalness: 0.05,
            },
        ],
    },
    {
        id: "digestivo",
        label: "Sistema digestivo",
        accent: "#fbbf24",
        organos: [
            {
                id: "estomago",
                name: "Estómago",
                description: "Almacenamiento y descomposición inicial de alimentos.",
                shape: "sphere",
                pos: [-0.1, 1.12, 0.12],
                scale: [0.16, 0.12, 0.14],
                color: 0xf59e0b,
                roughness: 0.5,
                metalness: 0,
            },
            {
                id: "higado",
                name: "Hígado",
                description: "Metabolismo, bilis y depuración de toxinas.",
                shape: "box",
                pos: [0.22, 1.18, 0.08],
                scale: [0.22, 0.14, 0.16],
                color: 0xd97706,
                roughness: 0.45,
                metalness: 0.05,
            },
            {
                id: "intestinos",
                name: "Intestinos",
                description: "Absorción de nutrientes (delgado) y agua (grueso).",
                shape: "torus",
                pos: [0, 0.98, 0.14],
                rot: [1.2, 0.3, 0],
                scale: [0.22, 0.22, 0.22],
                color: 0xfde68a,
                roughness: 0.6,
                metalness: 0,
            },
        ],
    },
    {
        id: "endocrino",
        label: "Sistema endocrino",
        accent: "#c084fc",
        organos: [
            {
                id: "tiroides",
                name: "Tiroides",
                description: "Regula metabolismo con hormonas tiroideas.",
                shape: "torus",
                pos: [0, 1.48, 0.12],
                rot: [1.57, 0, 0],
                scale: [0.12, 0.12, 0.12],
                color: 0xe879f9,
                roughness: 0.4,
                metalness: 0.15,
            },
            {
                id: "pancreas",
                name: "Páncreas",
                description: "Exocrino (enzimas) y endocrino (insulina, glucagón).",
                shape: "capsule",
                pos: [0.08, 1.05, 0.06],
                rot: [0.2, 0, 0.15],
                scale: [0.12, 0.08, 0.06],
                color: 0xa855f7,
                roughness: 0.5,
                metalness: 0.05,
            },
        ],
    },
    {
        id: "inmunologico",
        label: "Sistema inmunológico",
        accent: "#4ade80",
        organos: [
            {
                id: "ganglios",
                name: "Ganglios linfáticos",
                description: "Filtran linfa y alojan linfocitos para respuesta inmune.",
                shape: "sphere",
                pos: [-0.2, 1.45, -0.06],
                scale: [0.08, 0.08, 0.08],
                color: 0x22c55e,
                roughness: 0.55,
                metalness: 0,
            },
            {
                id: "bazo",
                name: "Bazo (ógano linfoide)",
                description: "Filtra sangre, almacena plaquetas y participa en inmunidad.",
                shape: "sphere",
                pos: [0.28, 1.15, -0.04],
                scale: [0.1, 0.12, 0.06],
                color: 0x16a34a,
                roughness: 0.5,
                metalness: 0,
            },
            {
                id: "linfocitos",
                name: "Linfocitos (simulado)",
                description: "Células B y T: memoria y defensa adaptativa.",
                shape: "sphere",
                pos: [0.12, 1.32, -0.1],
                scale: [0.04, 0.04, 0.04],
                color: 0x86efac,
                roughness: 0.2,
                metalness: 0.3,
            },
        ],
    },
    {
        id: "urinario",
        label: "Sistema urinario",
        accent: "#38bdf8",
        organos: [
            {
                id: "rinon_izq",
                name: "Riñón izquierdo",
                description: "Filtra sangre, forma orina y regula equilibrio ácido-base.",
                shape: "sphere",
                pos: [-0.2, 1.05, -0.06],
                scale: [0.1, 0.14, 0.08],
                color: 0x0ea5e9,
                roughness: 0.45,
                metalness: 0.1,
            },
            {
                id: "rinon_der",
                name: "Riñón derecho",
                description: "Ligeramente más bajo por el hígado; misma función de filtrado.",
                shape: "sphere",
                pos: [0.2, 0.98, -0.06],
                scale: [0.1, 0.14, 0.08],
                color: 0x0284c7,
                roughness: 0.45,
                metalness: 0.1,
            },
            {
                id: "vejiga",
                name: "Vejiga urinaria",
                description: "Almacena orina hasta la micción.",
                shape: "sphere",
                pos: [0, 0.82, 0.12],
                scale: [0.14, 0.1, 0.12],
                color: 0x7dd3fc,
                roughness: 0.55,
                metalness: 0,
                opacity: 0.92,
            },
        ],
    },
    {
        id: "reproductor",
        label: "Sistema reproductor",
        accent: "#f472b6",
        organos: [
            {
                id: "utero",
                name: "Útero (representación)",
                description: "Órgano donde puede implantarse el embrión (modelo educativo simplificado).",
                shape: "capsule",
                pos: [0, 0.95, 0.1],
                rot: [0.2, 0, 0],
                scale: [0.12, 0.14, 0.1],
                color: 0xec4899,
                roughness: 0.45,
                metalness: 0.05,
            },
            {
                id: "ovarios",
                name: "Ovarios (simulados)",
                description: "Gónadas femeninas: ovocitos y hormonas sexuales.",
                shape: "sphere",
                pos: [-0.16, 0.92, -0.04],
                scale: [0.07, 0.07, 0.07],
                color: 0xf9a8d4,
                roughness: 0.4,
                metalness: 0.1,
            },
            {
                id: "prostata",
                name: "Próstata (representación)",
                description: "Glándula accesoria masculina (modelo educativo simplificado).",
                shape: "sphere",
                pos: [0.06, 0.88, 0.1],
                scale: [0.09, 0.07, 0.1],
                color: 0xdb2777,
                roughness: 0.5,
                metalness: 0,
            },
        ],
    },
];

function pickSistema(list, id) {
    if (!list?.length) return null;
    return list.find((s) => s.id === id) ?? list[0];
}

function createGeometry(def) {
    switch (def.shape) {
        case "sphere":
            return new THREE.SphereGeometry(0.5, 24, 24);
        case "cylinder":
            return new THREE.CylinderGeometry(0.5, 0.5, 1, 20);
        case "torus":
            return new THREE.TorusGeometry(0.35, 0.12, 12, 32);
        case "capsule":
            return new THREE.CapsuleGeometry(0.25, 0.6, 6, 12);
        case "box":
            return new THREE.BoxGeometry(1, 1, 1);
        default:
            return new THREE.SphereGeometry(0.4, 16, 16);
    }
}

function createOrganMesh(def) {
    const geo = createGeometry(def);
    const mat = new THREE.MeshStandardMaterial({
        color: def.color,
        roughness: def.roughness ?? 0.5,
        metalness: def.metalness ?? 0.1,
        transparent: def.opacity != null && def.opacity < 1,
        opacity: def.opacity ?? 1,
        emissive: 0x000000,
        emissiveIntensity: 0,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(def.pos[0], def.pos[1], def.pos[2]);
    if (def.rot) mesh.rotation.set(def.rot[0], def.rot[1], def.rot[2]);
    if (def.scale) mesh.scale.set(def.scale[0], def.scale[1], def.scale[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.organId = def.id;
    mesh.userData.organName = def.name;
    mesh.userData.description = def.description;
    mesh.userData.baseColor = def.color;
    mesh.userData.baseEmissive = 0x000000;
    mesh.userData.baseScale = mesh.scale.clone();
    return mesh;
}

function disposeGroup(group) {
    group.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
            else obj.material.dispose();
        }
    });
}

function playTone(freq, duration, type = "sine", vol = 0.06) {
    try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        const ctx = new AC();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const t = ctx.currentTime;
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        osc.start(t);
        osc.stop(t + duration + 0.02);
        setTimeout(() => ctx.close(), (duration + 0.1) * 1000);
    } catch {
        /* sin audio */
    }
}

/**
 * @param {{ sistemasData?: typeof SISTEMAS_ANATOMIA_BASE }} props
 */
export default function AnatomiaHumana3D({ sistemasData }) {
    const data = sistemasData ?? SISTEMAS_ANATOMIA_BASE;

    const mountRef = useRef(null);
    const sistemasRef = useRef(data);
    sistemasRef.current = data;

    const [sistemaActivo, setSistemaActivo] = useState(data[0]?.id ?? "piel");
    const [objetivoId, setObjetivoId] = useState(null);
    const [puntaje, setPuntaje] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [organoPanel, setOrganoPanel] = useState(null);

    const objetivoIdRef = useRef(null);
    const meshesRef = useRef([]);
    const hoveredRef = useRef(null);
    const hoverSoundIdRef = useRef(null);
    const selectedRef = useRef(null);
    const pulseRef = useRef(0);

    const elegirObjetivoAleatorio = useCallback((sistemaId) => {
        const sys = sistemasRef.current.find((s) => s.id === sistemaId) ?? sistemasRef.current[0];
        const orgs = sys.organos;
        if (!orgs?.length) return;
        const pick = orgs[Math.floor(Math.random() * orgs.length)];
        objetivoIdRef.current = pick.id;
        setObjetivoId(pick.id);
        setFeedback(null);
        setOrganoPanel(null);
    }, []);

    useEffect(() => {
        elegirObjetivoAleatorio(sistemaActivo);
    }, [sistemaActivo, elegirObjetivoAleatorio]);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return undefined;

        const scene = new THREE.Scene();
        const c1 = new THREE.Color(0x0a0e1a);
        const c2 = new THREE.Color(0x12182a);
        scene.background = c1;

        const width = mount.clientWidth || 800;
        const height = mount.clientHeight || 480;
        const camera = new THREE.PerspectiveCamera(42, width / height, 0.08, 80);
        camera.position.set(0.35, 1.35, 3.2);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        mount.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 1.05, 0);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.minDistance = 1.8;
        controls.maxDistance = 6;
        controls.maxPolarAngle = Math.PI * 0.52;

        const ambient = new THREE.AmbientLight(0x8899cc, 0.35);
        scene.add(ambient);

        const dir = new THREE.DirectionalLight(0xffffff, 0.85);
        dir.position.set(2.5, 5, 3);
        dir.castShadow = true;
        dir.shadow.mapSize.set(2048, 2048);
        dir.shadow.camera.near = 0.5;
        dir.shadow.camera.far = 20;
        dir.shadow.camera.left = -3;
        dir.shadow.camera.right = 3;
        dir.shadow.camera.top = 4;
        dir.shadow.camera.bottom = -1;
        scene.add(dir);

        const point = new THREE.PointLight(0x60a5fa, 0.6, 12);
        point.position.set(-1.8, 2.2, 1.5);
        scene.add(point);

        const rim = new THREE.PointLight(0xf472b6, 0.35, 10);
        rim.position.set(1.5, 0.8, -2);
        scene.add(rim);

        const groundGeo = new THREE.CircleGeometry(2.2, 48);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x0d1117,
            roughness: 0.92,
            metalness: 0.05,
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        const bodySilhouetteGeo = new THREE.CapsuleGeometry(0.48, 1.05, 8, 16);
        const bodySilhouetteMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.85,
            metalness: 0.02,
            transparent: true,
            opacity: 0.22,
        });
        const bodySilhouette = new THREE.Mesh(bodySilhouetteGeo, bodySilhouetteMat);
        bodySilhouette.position.set(0, 1.05, 0);
        bodySilhouette.receiveShadow = true;
        scene.add(bodySilhouette);

        const organRoot = new THREE.Group();
        organRoot.position.set(0, 0, 0);
        scene.add(organRoot);

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();

        function rebuildOrgans(sistemaId) {
            disposeGroup(organRoot);
            while (organRoot.children.length) organRoot.remove(organRoot.children[0]);
            meshesRef.current = [];

            const sys = sistemasRef.current.find((s) => s.id === sistemaId);
            if (!sys) return;

            sys.organos.forEach((def) => {
                const m = createOrganMesh(def);
                organRoot.add(m);
                meshesRef.current.push(m);
            });
        }

        rebuildOrgans(sistemasRef.current[0]?.id ?? "piel");

        function resetMeshVisual(mesh) {
            if (!mesh?.material) return;
            mesh.material.color.setHex(mesh.userData.baseColor);
            mesh.material.emissive.setHex(mesh.userData.baseEmissive ?? 0);
            mesh.material.emissiveIntensity = 0;
            if (mesh.userData.baseScale) mesh.scale.copy(mesh.userData.baseScale);
        }

        function applyHover(mesh) {
            resetMeshVisual(mesh);
            mesh.material.color.offsetHSL(0, 0.15, 0.12);
            mesh.material.emissive.setHex(0x334455);
            mesh.material.emissiveIntensity = 0.25;
            const bs = mesh.userData.baseScale;
            mesh.scale.set(bs.x * 1.06, bs.y * 1.06, bs.z * 1.06);
        }

        function onPointerMove(ev) {
            const rect = renderer.domElement.getBoundingClientRect();
            pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            const hits = raycaster.intersectObjects(meshesRef.current, false);
            const hit = hits[0]?.object;

            if (hoveredRef.current && hoveredRef.current !== hit && hoveredRef.current !== selectedRef.current) {
                resetMeshVisual(hoveredRef.current);
            }
            hoveredRef.current = hit ?? null;
            if (hit && hit !== selectedRef.current) {
                applyHover(hit);
                const hid = hit.userData.organId;
                if (hoverSoundIdRef.current !== hid) {
                    hoverSoundIdRef.current = hid;
                    playTone(520, 0.04, "sine", 0.035);
                }
            } else if (!hit) {
                hoverSoundIdRef.current = null;
            }
        }

        function onPointerDown(ev) {
            const rect = renderer.domElement.getBoundingClientRect();
            pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            const hits = raycaster.intersectObjects(meshesRef.current, false);
            const hit = hits[0]?.object;
            if (!hit) return;

            const oid = hit.userData.organId;
            const target = objetivoIdRef.current;

            window.dispatchEvent(
                new CustomEvent("anatomia-organo-click", {
                    detail: {
                        organId: oid,
                        name: hit.userData.organName,
                        description: hit.userData.description,
                        correct: oid === target,
                    },
                }),
            );

            if (selectedRef.current && selectedRef.current !== hit) resetMeshVisual(selectedRef.current);
            selectedRef.current = hit;
            pulseRef.current = 1;
            hit.material.emissive.setHex(0xffffff);
            hit.material.emissiveIntensity = 0.5;
        }

        const onClearSelection = () => {
            if (selectedRef.current) {
                resetMeshVisual(selectedRef.current);
                selectedRef.current = null;
            }
            pulseRef.current = 0;
        };
        window.addEventListener("anatomia-clear-selection", onClearSelection);

        renderer.domElement.addEventListener("pointermove", onPointerMove);
        renderer.domElement.addEventListener("pointerdown", onPointerDown);

        let animationId = 0;
        const clock = new THREE.Clock();

        const tick = () => {
            animationId = requestAnimationFrame(tick);
            const t = clock.getElapsedTime();

            const mix = (Math.sin(t * 0.15) + 1) * 0.5;
            scene.background = c1.clone().lerp(c2, mix * 0.35);

            organRoot.rotation.y = Math.sin(t * 0.35) * 0.08;

            if (pulseRef.current > 0 && selectedRef.current) {
                pulseRef.current *= 0.92;
                const p = selectedRef.current;
                const bs = p.userData.baseScale;
                const s = 1 + pulseRef.current * 0.08;
                p.scale.set(bs.x * s, bs.y * s, bs.z * s);
                p.material.emissiveIntensity = 0.35 + pulseRef.current * 0.4;
            }

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
        const ro = new ResizeObserver(onResize);
        ro.observe(mount);

        const onRebuild = (ev) => {
            const id = ev.detail?.sistemaId;
            if (id) rebuildOrgans(id);
        };
        window.addEventListener("anatomia-rebuild", onRebuild);

        return () => {
            cancelAnimationFrame(animationId);
            ro.disconnect();
            window.removeEventListener("resize", onResize);
            window.removeEventListener("anatomia-rebuild", onRebuild);
            window.removeEventListener("anatomia-clear-selection", onClearSelection);
            renderer.domElement.removeEventListener("pointermove", onPointerMove);
            renderer.domElement.removeEventListener("pointerdown", onPointerDown);
            controls.dispose();
            disposeGroup(organRoot);
            scene.remove(organRoot);
            bodySilhouette.geometry.dispose();
            bodySilhouette.material.dispose();
            ground.geometry.dispose();
            ground.material.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
        };
    }, []);

    useEffect(() => {
        window.dispatchEvent(new CustomEvent("anatomia-rebuild", { detail: { sistemaId: sistemaActivo } }));
    }, [sistemaActivo]);

    useEffect(() => {
        const handler = (e) => {
            const { organId, name, description, correct } = e.detail;
            setOrganoPanel({ name, description });
            if (correct) {
                setPuntaje((p) => p + 100);
                setFeedback("ok");
                playTone(880, 0.12, "sine", 0.07);
                window.setTimeout(() => {
                    window.dispatchEvent(new Event("anatomia-clear-selection"));
                    const sys = pickSistema(sistemasRef.current, sistemaActivo);
                    const orgs = sys?.organos ?? [];
                    if (!orgs.length) return;
                    const next = orgs[Math.floor(Math.random() * orgs.length)];
                    objetivoIdRef.current = next.id;
                    setObjetivoId(next.id);
                    setFeedback(null);
                    setOrganoPanel(null);
                }, 900);
            } else {
                setFeedback("err");
                playTone(180, 0.18, "square", 0.05);
                window.setTimeout(() => setFeedback(null), 700);
            }
        };
        window.addEventListener("anatomia-organo-click", handler);
        return () => window.removeEventListener("anatomia-organo-click", handler);
    }, [sistemaActivo]);

    const sys = pickSistema(data, sistemaActivo);
    const objetivoNombre = sys?.organos?.find((o) => o.id === objetivoId)?.name ?? "—";

    return (
        <div
            className="ah-pro-root"
            style={{
                display: "grid",
                gridTemplateColumns: "220px 1fr",
                gridTemplateRows: "auto 1fr auto",
                minHeight: 520,
                background: "linear-gradient(145deg, #070a10 0%, #0f1628 50%, #0a0d14 100%)",
                borderRadius: 16,
                overflow: "hidden",
                fontFamily: "'Instrument Sans', system-ui, sans-serif",
                color: "#e2e8f0",
            }}
        >
            <style>{`
                .ah-pro-root * { box-sizing: border-box; }
                .ah-glass {
                    background: rgba(15, 23, 42, 0.55);
                    backdrop-filter: blur(14px);
                    -webkit-backdrop-filter: blur(14px);
                    border: 1px solid rgba(148, 163, 184, 0.12);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.35);
                }
                .ah-sys-btn {
                    display: flex; align-items: center; gap: 8px;
                    width: 100%; padding: 10px 12px; margin-bottom: 6px;
                    border-radius: 10px; border: 1px solid rgba(148,163,184,0.15);
                    background: rgba(30,41,59,0.4); color: #e2e8f0;
                    font-size: 11px; font-weight: 600; cursor: pointer;
                    text-align: left; transition: all 0.2s ease;
                }
                .ah-sys-btn:hover {
                    border-color: rgba(96,165,250,0.45);
                    background: rgba(59,130,246,0.12);
                    transform: translateX(2px);
                }
                .ah-sys-btn.active {
                    border-color: rgba(244,114,182,0.6);
                    background: linear-gradient(135deg, rgba(244,114,182,0.2), rgba(99,102,241,0.15));
                    box-shadow: 0 0 20px rgba(244,114,182,0.15);
                }
            `}</style>

            <header
                className="ah-glass"
                style={{
                    gridColumn: "1 / -1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 20px",
                    borderRadius: 0,
                    borderLeft: "none",
                    borderRight: "none",
                    borderTop: "none",
                }}
            >
                <div>
                    <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "#94a3b8", fontWeight: 700 }}>
                        SIMULACIÓN PRO
                    </div>
                    <h1 style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>
                        Anatomía Humana Interactiva 3D PRO
                    </h1>
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "8px 16px",
                        borderRadius: 12,
                        background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(59,130,246,0.15))",
                        border: "1px solid rgba(74,222,128,0.25)",
                    }}
                >
                    <span style={{ fontSize: 11, color: "#86efac", fontWeight: 700 }}>PUNTAJE</span>
                    <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", textShadow: "0 0 20px rgba(74,222,128,0.5)" }}>
                        {puntaje}
                    </span>
                </div>
            </header>

            <aside
                className="ah-glass"
                style={{
                    gridRow: "2",
                    gridColumn: "1",
                    padding: "14px 12px",
                    borderRadius: 0,
                    borderLeft: "none",
                    borderBottom: "none",
                    overflowY: "auto",
                    maxHeight: "100%",
                }}
            >
                <div style={{ fontSize: 10, fontWeight: 800, color: "#64748b", letterSpacing: "0.1em", marginBottom: 12 }}>
                    SISTEMAS
                </div>
                {data.map((s) => (
                    <button
                        key={s.id}
                        type="button"
                        className={`ah-sys-btn${sistemaActivo === s.id ? " active" : ""}`}
                        onClick={() => setSistemaActivo(s.id)}
                        style={sistemaActivo === s.id ? { borderColor: s.accent } : undefined}
                    >
                        <span
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: s.accent,
                                boxShadow: `0 0 10px ${s.accent}`,
                                flexShrink: 0,
                            }}
                        />
                        {s.label}
                    </button>
                ))}
            </aside>

            <div
                style={{
                    gridRow: "2",
                    gridColumn: "2",
                    position: "relative",
                    minHeight: 400,
                }}
            >
                <div ref={mountRef} style={{ width: "100%", height: "100%", minHeight: 400 }} />
                {feedback === "ok" && (
                    <div
                        style={{
                            position: "absolute",
                            top: 16,
                            left: "50%",
                            transform: "translateX(-50%)",
                            padding: "10px 22px",
                            borderRadius: 999,
                            background: "rgba(34,197,94,0.25)",
                            border: "1px solid rgba(74,222,128,0.5)",
                            color: "#86efac",
                            fontWeight: 800,
                            fontSize: 13,
                            pointerEvents: "none",
                            animation: "ahPop 0.35s ease",
                        }}
                    >
                        ¡Correcto! +100
                    </div>
                )}
                {feedback === "err" && (
                    <div
                        style={{
                            position: "absolute",
                            top: 16,
                            left: "50%",
                            transform: "translateX(-50%)",
                            padding: "10px 22px",
                            borderRadius: 999,
                            background: "rgba(239,68,68,0.2)",
                            border: "1px solid rgba(248,113,113,0.45)",
                            color: "#fecaca",
                            fontWeight: 700,
                            fontSize: 13,
                            pointerEvents: "none",
                        }}
                    >
                        No es el objetivo — sigue explorando
                    </div>
                )}
                <style>{`@keyframes ahPop { from { transform: translateX(-50%) scale(0.85); opacity: 0; } to { transform: translateX(-50%) scale(1); opacity: 1; } }`}</style>
            </div>

            <footer
                className="ah-glass"
                style={{
                    gridColumn: "1 / -1",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    padding: "16px 20px",
                    borderRadius: 0,
                    borderLeft: "none",
                    borderRight: "none",
                    borderBottom: "none",
                }}
            >
                <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#64748b", letterSpacing: "0.12em", marginBottom: 8 }}>
                        OBJETIVO ACTUAL
                    </div>
                    <div
                        style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: "#f8fafc",
                        textShadow: `0 0 24px ${sys?.accent ?? "#60a5fa"}66`,
                    }}
                >
                    Selecciona: <span style={{ color: sys?.accent ?? "#94a3b8" }}>{objetivoNombre}</span>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: "#94a3b8" }}>
                        Sistema activo: <strong style={{ color: "#e2e8f0" }}>{sys?.label ?? "—"}</strong>
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#64748b", letterSpacing: "0.12em", marginBottom: 8 }}>
                        ÓRGANO SELECCIONADO
                    </div>
                    {organoPanel ? (
                        <>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{organoPanel.name}</div>
                            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.55, color: "#cbd5e1" }}>{organoPanel.description}</p>
                        </>
                    ) : (
                        <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontStyle: "italic" }}>
                            Haz clic en una estructura 3D para inspeccionarla.
                        </p>
                    )}
                </div>
            </footer>
        </div>
    );
}

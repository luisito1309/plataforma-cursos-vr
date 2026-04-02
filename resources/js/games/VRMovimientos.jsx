import { useEffect, useRef } from "react";
import * as THREE from "three";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";

export default function VRMovimientos({ preview = false }) {
    const wrapRef = useRef(null);

    useEffect(() => {
        const host = wrapRef.current;
        if (!host) return undefined;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#05070d");

        const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 100);
        camera.position.set(0, 1.6, 3.2);

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setSize(Math.max(1, host.clientWidth), Math.max(1, host.clientHeight), false);
        renderer.xr.enabled = !preview;
        host.appendChild(renderer.domElement);

        const hemi = new THREE.AmbientLight(0xffffff, 0.55);
        scene.add(hemi);

        const dir = new THREE.DirectionalLight(0xffffff, 1.1);
        dir.position.set(2.5, 4, 2.8);
        dir.castShadow = true;
        dir.shadow.mapSize.set(1024, 1024);
        scene.add(dir);

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 20),
            new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9, metalness: 0.05 }),
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        scene.add(floor);

        const cubes = [];
        const cubeGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        for (let i = 0; i < 5; i += 1) {
            const cube = new THREE.Mesh(
                cubeGeo.clone(),
                new THREE.MeshStandardMaterial({
                    color: 0x00ffcc,
                    emissive: 0x001913,
                    roughness: 0.35,
                    metalness: 0.3,
                }),
            );
            cube.position.set(Math.random() * 2 - 1, 1 + Math.random() * 0.35, -0.8 - Math.random() * 2.3);
            cube.castShadow = true;
            cube.receiveShadow = true;
            scene.add(cube);
            cubes.push(cube);
        }

        const raycaster = new THREE.Raycaster();
        const tempMatrix = new THREE.Matrix4();
        const selectedObjectRef = { current: null };
        const selectedControllerRef = { current: null };

        const getIntersections = (controller) => {
            tempMatrix.identity().extractRotation(controller.matrixWorld);
            raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
            raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
            return raycaster.intersectObjects(cubes, false);
        };

        let controller1 = null;
        let controllerGrip1 = null;
        let controllerRay = null;
        let vrButton = null;
        const controllerModelFactory = new XRControllerModelFactory();

        if (!preview) {
            controller1 = renderer.xr.getController(0);
            scene.add(controller1);

            controllerGrip1 = renderer.xr.getControllerGrip(0);
            controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
            scene.add(controllerGrip1);

            controllerRay = new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]),
                new THREE.LineBasicMaterial({ color: 0x88ddff, transparent: true, opacity: 0.9 }),
            );
            controllerRay.name = "ray";
            controllerRay.scale.z = 5;
            controller1.add(controllerRay);

            const onSelectStart = () => {
                const intersects = getIntersections(controller1);
                if (!intersects.length) return;

                const picked = intersects[0].object;
                selectedObjectRef.current = picked;
                selectedControllerRef.current = controller1;
                picked.material.emissive?.setHex(0x00a67f);
                picked.material.color?.setHex(0x6effe7);
            };

            const onSelectEnd = () => {
                const obj = selectedObjectRef.current;
                if (obj) {
                    obj.material.emissive?.setHex(0x001913);
                    obj.material.color?.setHex(0x00ffcc);
                }
                selectedObjectRef.current = null;
                selectedControllerRef.current = null;
            };

            controller1.addEventListener("selectstart", onSelectStart);
            controller1.addEventListener("selectend", onSelectEnd);

            vrButton = VRButton.createButton(renderer);
            vrButton.style.position = "absolute";
            vrButton.style.left = "12px";
            vrButton.style.bottom = "12px";
            host.appendChild(vrButton);

            controller1.userData.cleanup = () => {
                controller1.removeEventListener("selectstart", onSelectStart);
                controller1.removeEventListener("selectend", onSelectEnd);
            };
        }

        const resizeObserver = new ResizeObserver(() => {
            const w = Math.max(1, host.clientWidth);
            const h = Math.max(1, host.clientHeight);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h, false);
        });
        resizeObserver.observe(host);

        let last = performance.now();
        renderer.setAnimationLoop(() => {
            const now = performance.now();
            const dt = Math.min((now - last) / 1000, 0.1);
            last = now;

            if (preview) {
                cubes.forEach((cube, i) => {
                    cube.rotation.x += dt * (0.5 + i * 0.04);
                    cube.rotation.y += dt * (0.7 + i * 0.03);
                });
            } else if (selectedObjectRef.current && selectedControllerRef.current) {
                const ctrl = selectedControllerRef.current;
                const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(ctrl.quaternion).multiplyScalar(0.22);
                const target = ctrl.position.clone().add(forward);
                selectedObjectRef.current.position.lerp(target, 0.45);
            }

            renderer.render(scene, camera);
        });

        return () => {
            renderer.setAnimationLoop(null);
            resizeObserver.disconnect();

            if (controller1?.userData?.cleanup) controller1.userData.cleanup();

            if (controllerRay) {
                controllerRay.geometry.dispose();
                controllerRay.material.dispose();
            }

            cubes.forEach((cube) => {
                scene.remove(cube);
                cube.geometry.dispose();
                cube.material.dispose();
            });
            floor.geometry.dispose();
            floor.material.dispose();

            renderer.dispose();
            if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
            if (vrButton && vrButton.parentNode === host) host.removeChild(vrButton);
        };
    }, [preview]);

    return (
        <div
            style={{
                width: "100%",
                height: preview ? 300 : 560,
                position: "relative",
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid rgba(148,163,184,.2)",
                background: "#05070d",
            }}
        >
            <div ref={wrapRef} style={{ width: "100%", height: "100%" }} />
            {!preview && (
                <div
                    style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        padding: "6px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        color: "#c7d2fe",
                        background: "rgba(15,23,42,.7)",
                        border: "1px solid rgba(99,102,241,.35)",
                        pointerEvents: "none",
                    }}
                >
                    Mueve los cubos con el control VR
                </div>
            )}
        </div>
    );
}

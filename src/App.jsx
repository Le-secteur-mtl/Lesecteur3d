import React, { useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";
import "./styles.css";

const VIEWS = {
  overview: { label: "Plan 3D", camera: [18, 13, 20], target: [0, 3, 0], copy: "Vue globale : rez-de-chaussée vivant, mezzanine calme, promenade centrale." },
  accueil: { label: "Accueil", camera: [-12, 4.8, 12], target: [-11, 1.6, 7], copy: "Accueil fermé, humain et contrôlé dès l'entrée." },
  cantine: { label: "Cantine", camera: [-13, 4.4, 3], target: [-8, 1.4, -2], copy: "Grande cantine communautaire, chaleureuse et accessible." },
  podcast: { label: "Podcast", camera: [13, 4.8, 10], target: [10, 1.5, 6], copy: "Grand studio podcast traité acoustiquement." },
  mezzanine: { label: "Mezzanine", camera: [2, 8.4, 1], target: [4, 5.1, -7], copy: "Zones de travail vitrées acoustiques et salles de mentorat." }
};

const ZONES = {
  GLASS_RECEPTION_MAIN: "accueil",
  CANTINE_COUNTER_MAIN: "cantine",
  PODCAST_ROOM_MAIN: "podcast",
  GLASS_STUDY_ROOMS: "mezzanine",
  GLASS_EVENT_ROOM: "overview",
  FURN_LOUNGE_GROUP: "overview"
};

const BOXES = [
  ["floor", "concrete", [0, -0.05, 0], [34, 0.1, 22]],
  ["back wall", "brick", [0, 4, -11], [34, 8, 0.42]],
  ["left wall", "brick", [-17, 4, 0], [0.42, 8, 22]],
  ["right wall", "brick", [17, 4, 0], [0.42, 8, 22]],
  ["front left", "brick", [-11, 2.1, 11], [12, 4.2, 0.32]],
  ["front right", "brick", [12, 2.1, 11], [10, 4.2, 0.32]],
  ["mezzanine left", "wood", [-9.1, 4.18, -7.1], [15.5, 0.28, 7.4]],
  ["mezzanine right", "wood", [9.1, 4.18, -7.1], [15.5, 0.28, 7.4]],
  ["mezzanine walkway", "wood", [0, 4.18, -10.1], [34, 0.28, 1.5]],
  ["rail main", "metal", [0, 5.55, -3.2], [31, 0.08, 0.08]],
  ["rail low", "metal", [0, 4.8, -3.2], [31, 0.06, 0.06]],
  ["GLASS_RECEPTION_MAIN", "glass", [-11.5, 1.4, 8.1], [4.8, 2.8, 4.1]],
  ["reception desk", "wood", [-11.5, 0.82, 8.2], [2.7, 1, 0.88]],
  ["FURN_LOUNGE_GROUP", "sage", [6.6, 0.55, 4], [5.6, 1.1, 3.1]],
  ["lounge table", "wood", [6.2, 0.45, 2.4], [1.9, 0.25, 0.9]],
  ["CANTINE_COUNTER_MAIN", "wood", [-9.6, 0.92, -1.5], [7.5, 1.15, 1.3]],
  ["cantine service", "wood", [-14.3, 1.12, -3.6], [0.8, 1.7, 8.5]],
  ["cantine table", "wood", [-8.5, 0.82, 1.8], [4.4, 0.12, 1.15]],
  ["GLASS_EVENT_ROOM", "glass", [10.3, 1.6, -5.7], [9.5, 3.2, 7.1]],
  ["event wall", "acoustic", [14.9, 1.6, -5.7], [0.14, 1.85, 3.3]],
  ["PODCAST_ROOM_MAIN", "glass", [11.2, 1.55, 6.9], [7.8, 3.1, 5.5]],
  ["podcast slats", "wood", [7.35, 1.5, 6.9], [0.18, 2.6, 4.8]],
  ["podcast table", "wood", [11.2, 0.82, 6.9], [3, 0.12, 1.35]],
  ["podcast mic 1", "metal", [10.4, 1.35, 6.9], [0.06, 0.9, 0.06]],
  ["podcast mic 2", "metal", [12, 1.35, 6.9], [0.06, 0.9, 0.06]],
  ["GLASS_STUDY_ROOMS", "glass", [-3.8, 5.65, -7.1], [13.2, 2.55, 4.8]],
  ["mentor room", "glass", [5.1, 5.65, -7.1], [4.7, 2.55, 4.8]],
  ["study right", "glass", [11.1, 5.65, -7.1], [6, 2.55, 4.8]],
  ["neon cantine", "neon", [-14.6, 2.5, -0.2], [0.05, 5, 0.05]],
  ["neon mezzanine", "neon", [0, 5.7, -3.08], [6.4, 0.04, 0.04]],
  ["neon podcast", "neon", [7.4, 2.5, 9.25], [0.05, 3.8, 0.05]]
];

for (const x of [-15, -8, 0, 8, 15]) {
  BOXES.push([`column back ${x}`, "metal", [x, 4, -10.6], [0.28, 8, 0.28]]);
  BOXES.push([`column mid ${x}`, "metal", [x, 4, 2.8], [0.28, 8, 0.28]]);
}
for (const z of [-10.6, -4, 2.8, 9.8]) BOXES.push([`beam ${z}`, "metal", [0, 7.9, z], [34, 0.3, 0.3]]);
for (let i = 0; i < 14; i++) BOXES.push([`stair ${i}`, "wood", [-1.8, 0.25 + i * 0.28, 5 - i * 0.52], [2.2, 0.12, 0.48]]);
for (const x of [-10.4, -3.4, 4.2, 11.1]) {
  BOXES.push([`study table ${x}`, "wood", [x, 5.17, -7.1], [3, 0.12, 0.9]]);
  BOXES.push([`acoustic panel ${x}`, "acoustic", [x, 5.75, -9.45], [2.4, 1, 0.08]]);
}

function useMaterials() {
  return useMemo(() => ({
    brick: new THREE.MeshStandardMaterial({ color: "#8d3f2b", roughness: 0.88 }),
    metal: new THREE.MeshStandardMaterial({ color: "#11100e", metalness: 0.72, roughness: 0.34 }),
    wood: new THREE.MeshStandardMaterial({ color: "#b97843", roughness: 0.56 }),
    concrete: new THREE.MeshStandardMaterial({ color: "#8b8378", roughness: 0.92 }),
    sage: new THREE.MeshStandardMaterial({ color: "#6f8055", roughness: 0.86 }),
    plant: new THREE.MeshStandardMaterial({ color: "#1f5a2b", roughness: 0.78 }),
    acoustic: new THREE.MeshStandardMaterial({ color: "#2c2926", roughness: 0.9 }),
    neon: new THREE.MeshStandardMaterial({ color: "#9be66f", emissive: "#9be66f", emissiveIntensity: 1.8 }),
    glass: new THREE.MeshPhysicalMaterial({ color: "#cce9dd", transparent: true, opacity: 0.34, roughness: 0.04, transmission: 0.28 })
  }), []);
}

function Label({ children, position }) {
  return <Html center position={position} distanceFactor={12}><div className="label">{children}</div></Html>;
}

function LeSecteurModel({ setView }) {
  const materials = useMaterials();
  return (
    <group>
      {BOXES.map(([name, material, position, scale]) => (
        <mesh key={name} name={name} position={position} scale={scale} material={materials[material]} castShadow receiveShadow onPointerDown={(e) => {
          if (!ZONES[name]) return;
          e.stopPropagation();
          setView(ZONES[name]);
        }}>
          <boxGeometry />
        </mesh>
      ))}
      <Label position={[-11.5, 3.2, 8.1]}>Accueil</Label>
      <Label position={[-9.6, 2.4, -1.5]}>Cantine</Label>
      <Label position={[10.3, 3.5, -5.7]}>Conférence</Label>
      <Label position={[11.2, 3.4, 6.9]}>Podcast</Label>
      <Label position={[-1.5, 7.2, -7.1]}>Étude acoustique</Label>
    </group>
  );
}

function CameraRig({ view }) {
  const controls = useRef();
  const { camera } = useThree();
  React.useEffect(() => {
    const next = VIEWS[view];
    gsap.to(camera.position, { x: next.camera[0], y: next.camera[1], z: next.camera[2], duration: 1.1, ease: "power3.inOut" });
    if (controls.current) gsap.to(controls.current.target, { x: next.target[0], y: next.target[1], z: next.target[2], duration: 1.1, ease: "power3.inOut" });
  }, [camera, view]);
  useFrame(() => controls.current?.update());
  return <OrbitControls ref={controls} enableDamping maxPolarAngle={Math.PI * 0.48} />;
}

function Lighting({ mode }) {
  const s = {
    day: { ambient: 1.35, sun: 3, fill: 0.4, bg: "#211f1b" },
    evening: { ambient: 0.9, sun: 0.75, fill: 1.15, bg: "#15120f" },
    night: { ambient: 0.52, sun: 0.16, fill: 1.5, bg: "#0d0c0a" }
  }[mode];

  return (
    <>
      <color attach="background" args={[s.bg]} />
      <ambientLight intensity={s.ambient} color="#ffc88d" />
      <directionalLight position={[-6, 14, 8]} intensity={s.sun} castShadow />
      <pointLight position={[0, 5, 0]} intensity={s.fill} color="#ffc377" />
      <pointLight position={[0, 5.8, -3]} intensity={mode === "night" ? 1.5 : 0.55} color="#9be66f" />
    </>
  );
}

function Scene({ view, setView, mode }) {
  return (
    <Canvas shadows camera={{ position: VIEWS.overview.camera, fov: 45 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
      <Lighting mode={mode} />
      <LeSecteurModel setView={setView} />
      <CameraRig view={view} />
    </Canvas>
  );
}

function App() {
  const [view, setView] = useState("overview");
  const [mode, setMode] = useState("day");
  const current = VIEWS[view];

  return (
    <main>
      <Scene view={view} setView={setView} mode={mode} />
      <header className="hud">
        <div className="brand"><strong>Le Secteur MTL</strong><span>Prototype 3D interactif</span></div>
        <nav>{Object.entries(VIEWS).map(([key, item]) => <button key={key} className={view === key ? "active" : ""} onClick={() => setView(key)} title={item.copy}>{item.label}</button>)}</nav>
        <nav>{["day", "evening", "night"].map((key) => <button key={key} className={mode === key ? "active" : ""} onClick={() => setMode(key)}>{key === "day" ? "Jour" : key === "evening" ? "Soir" : "Nuit"}</button>)}</nav>
      </header>
      <aside><strong>{current.label}</strong><p>{current.copy}</p></aside>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);

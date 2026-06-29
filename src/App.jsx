import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";
import "./styles.css";

const MODEL_PATH = "/models/le-secteur.glb";

const VIEWS = {
  overview: {
    label: "Plan 3D",
    camera: [18, 13, 20],
    target: [0, 3, 0],
    copy: "Vue globale du Secteur MTL : rez-de-chaussée vivant, mezzanine calme, promenade centrale."
  },
  accueil: {
    label: "Accueil",
    camera: [-10, 4.8, 12],
    target: [-8, 1.6, 4],
    copy: "Accueil fermé et humain, premier contact avec le lieu."
  },
  cantine: {
    label: "Cantine",
    camera: [-12, 4.4, 3],
    target: [-6, 1.4, -2],
    copy: "Grande cantine communautaire, support à l'expérience étudiante."
  },
  podcast: {
    label: "Podcast",
    camera: [12, 4.6, 9],
    target: [8, 1.4, 4],
    copy: "Grand studio podcast, crédible et traité acoustiquement."
  },
  mezzanine: {
    label: "Mezzanine",
    camera: [2, 8, 0],
    target: [4, 5, -6],
    copy: "Zones de travail et mentorat derrière cloisons vitrées acoustiques."
  }
};

const ZONES = [
  { name: "GLASS_RECEPTION_MAIN", view: "accueil", label: "Accueil fermé" },
  { name: "CANTINE_COUNTER_MAIN", view: "cantine", label: "Cantine communautaire" },
  { name: "FURN_LOUNGE_GROUP", view: "overview", label: "Lounge" },
  { name: "PODCAST_ROOM_MAIN", view: "podcast", label: "Studio podcast" },
  { name: "GLASS_EVENT_ROOM", view: "overview", label: "Salle événement / conférence" },
  { name: "GLASS_STUDY_ROOMS", view: "mezzanine", label: "Mezzanine calme" }
];

function Model({ onZone }) {
  const { scene } = useGLTF(MODEL_PATH);

  const cloned = useMemo(() => {
    const copy = scene.clone(true);

    copy.traverse((obj) => {
      if (!obj.isMesh) return;

      obj.castShadow = true;
      obj.receiveShadow = true;

      const zone = ZONES.find((z) => obj.name.includes(z.name));
      if (zone) {
        obj.userData.zone = zone;
      }

      if (obj.material?.name?.toLowerCase().includes("neon")) {
        obj.material.emissive = new THREE.Color("#9be66f");
        obj.material.emissiveIntensity = 1.4;
      }
    });

    return copy;
  }, [scene]);

  return (
    <primitive
      object={cloned}
      onPointerDown={(event) => {
        const zone = event.object.userData.zone;
        if (zone) {
          event.stopPropagation();
          onZone(zone);
        }
      }}
    />
  );
}

function Placeholder() {
  return (
    <group>
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[18, 0.15, 12]} />
        <meshStandardMaterial color="#8f8679" roughness={0.85} />
      </mesh>

      <mesh position={[0, 3, -6]}>
        <boxGeometry args={[18, 6, 0.25]} />
        <meshStandardMaterial color="#8d3f2b" roughness={0.9} />
      </mesh>

      <mesh position={[0, 3.2, -3.8]}>
        <boxGeometry args={[16, 0.25, 4.5]} />
        <meshStandardMaterial color="#b47a46" roughness={0.55} />
      </mesh>

      <mesh position={[0, 4.2, -1.35]}>
        <boxGeometry args={[15, 0.06, 0.06]} />
        <meshStandardMaterial color="#11100e" metalness={0.6} roughness={0.35} />
      </mesh>

      <mesh position={[-5.5, 0.8, 0]}>
        <boxGeometry args={[4, 1.2, 1]} />
        <meshStandardMaterial color="#b47a46" roughness={0.55} />
      </mesh>

      <mesh position={[5.5, 1.2, 1.8]}>
        <boxGeometry args={[4, 2.4, 3.2]} />
        <meshPhysicalMaterial color="#cfe6dc" transparent opacity={0.35} transmission={0.45} />
      </mesh>

      <Html center position={[0, 6.4, -3]}>
        <div className="missing-model">Ajoute public/models/le-secteur.glb</div>
      </Html>
    </group>
  );
}

function CameraRig({ view }) {
  const controls = useRef();
  const { camera } = useThree();

  useEffect(() => {
    const next = VIEWS[view];

    gsap.to(camera.position, {
      x: next.camera[0],
      y: next.camera[1],
      z: next.camera[2],
      duration: 1.1,
      ease: "power3.inOut"
    });

    if (controls.current) {
      gsap.to(controls.current.target, {
        x: next.target[0],
        y: next.target[1],
        z: next.target[2],
        duration: 1.1,
        ease: "power3.inOut"
      });
    }
  }, [camera, view]);

  useFrame(() => controls.current?.update());

  return <OrbitControls ref={controls} enableDamping maxPolarAngle={Math.PI * 0.48} />;
}

function Lighting({ mode }) {
  const settings = {
    day: { ambient: 1.4, sun: 3.0, bg: "#211f1b" },
    evening: { ambient: 0.95, sun: 0.8, bg: "#15120f" },
    night: { ambient: 0.55, sun: 0.18, bg: "#0d0c0a" }
  }[mode];

  return (
    <>
      <color attach="background" args={[settings.bg]} />
      <ambientLight intensity={settings.ambient} color="#ffc88d" />
      <directionalLight position={[-6, 14, 8]} intensity={settings.sun} castShadow />
      <pointLight position={[0, 5, 0]} intensity={mode === "day" ? 0.4 : 1.2} color="#ffc377" />
      <pointLight position={[0, 5.8, -3]} intensity={mode === "night" ? 1.3 : 0.45} color="#9be66f" />
    </>
  );
}

function Scene({ view, setView, mode }) {
  const [modelAvailable, setModelAvailable] = useState(false);

  useEffect(() => {
    fetch(MODEL_PATH, { method: "HEAD" })
      .then((response) => setModelAvailable(response.ok))
      .catch(() => setModelAvailable(false));
  }, []);

  return (
    <Canvas shadows camera={{ position: VIEWS.overview.camera, fov: 45 }}>
      <Lighting mode={mode} />

      <Suspense fallback={<Placeholder />}>
        {modelAvailable ? (
          <Model onZone={(zone) => setView(zone.view)} />
        ) : (
          <Placeholder />
        )}
      </Suspense>

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
        <div className="brand">
          <strong>Le Secteur MTL</strong>
          <span>Prototype 3D premium</span>
        </div>

        <nav>
          {Object.entries(VIEWS).map(([key, item]) => (
            <button key={key} className={view === key ? "active" : ""} onClick={() => setView(key)}>
              {item.label}
            </button>
          ))}
        </nav>

        <nav>
          {["day", "evening", "night"].map((key) => (
            <button key={key} className={mode === key ? "active" : ""} onClick={() => setMode(key)}>
              {key === "day" ? "Jour" : key === "evening" ? "Soir" : "Nuit"}
            </button>
          ))}
        </nav>
      </header>

      <aside>
        <strong>{current.label}</strong>
        <p>{current.copy}</p>
      </aside>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);

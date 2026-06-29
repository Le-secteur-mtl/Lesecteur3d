import React, { useMemo } from "react";

function Lighting({ mode }) {
  const settings = useMemo(() => {
    const presets = {
      day: { ambient: 1.4, sun: 3.0, bg: "#211f1b" },
      evening: { ambient: 0.95, sun: 0.8, bg: "#15120f" },
      night: { ambient: 0.55, sun: 0.18, bg: "#0d0c0a" }
    };
    return presets[mode] || presets.day;
  }, [mode]);

  const dayLight = mode === "day" ? 0.4 : 1.2;
  const nightLight = mode === "night" ? 1.3 : 0.45;

  return (
    <>
      <color attach="background" args={[settings.bg]} />
      <ambientLight intensity={settings.ambient} color="#ffc88d" />
      <directionalLight
        position={[-6, 14, 8]}
        intensity={settings.sun}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
      />
      <pointLight position={[0, 5, 0]} intensity={dayLight} color="#ffc377" />
      <pointLight position={[0, 5.8, -3]} intensity={nightLight} color="#9be66f" />
    </>
  );
}

export default Lighting;

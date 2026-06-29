import React, { Suspense, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import Model from "./components/Model";
import Placeholder from "./components/Placeholder";
import CameraRig from "./components/CameraRig";
import Lighting from "./components/Lighting";
import HUD from "./components/HUD";
import InfoPanel from "./components/InfoPanel";
import { VIEWS } from "./config/views";
import "./styles.css";

function App() {
  const [view, setView] = useState("overview");
  const [mode, setMode] = useState("day");
  const current = VIEWS[view];

  const handleViewChange = useCallback((newView) => {
    setView(newView);
  }, []);

  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
  }, []);

  return (
    <main>
      <Canvas 
        shadows 
        camera={{ 
          position: VIEWS.overview.camera, 
          fov: 45 
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance"
        }}
      >
        <Lighting mode={mode} />
        <Suspense fallback={<Placeholder />}>
          <Model onZone={handleViewChange} />
        </Suspense>
        <CameraRig view={view} />
      </Canvas>

      <HUD view={view} setView={handleViewChange} mode={mode} setMode={handleModeChange} />
      <InfoPanel current={current} />
    </main>
  );
}

export default App;

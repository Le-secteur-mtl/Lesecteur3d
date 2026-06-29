import React, { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { ZONES } from "../config/views";

const MODEL_PATH = "/models/le-secteur.glb";

function Model({ onZone }) {
  const gltf = useGLTF(MODEL_PATH);
  const { scene } = gltf;

  const cloned = useMemo(() => {
    const copy = scene.clone(true);

    copy.traverse((obj) => {
      if (!obj.isMesh) return;

      obj.castShadow = true;
      obj.receiveShadow = true;

      const zone = ZONES.find((z) => obj.name.includes(z.name));
      if (zone) {
        obj.userData.zone = zone;
        obj.userData.isClickable = true;
      }

      if (obj.material?.name?.toLowerCase().includes("neon")) {
        const material = obj.material.clone();
        material.emissive = new THREE.Color("#9be66f");
        material.emissiveIntensity = 1.4;
        obj.material = material;
      }
    });

    return copy;
  }, [scene]);

  const handlePointerDown = (event) => {
    const zone = event.object.userData.zone;
    if (zone) {
      event.stopPropagation();
      onZone(zone.view);
    }
  };

  return (
    <primitive
      object={cloned}
      onPointerDown={handlePointerDown}
      dispose={null}
    />
  );
}

export default Model;

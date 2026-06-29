import React from "react";
import { Html } from "@react-three/drei";

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
        <meshPhysicalMaterial 
          color="#cfe6dc" 
          transparent 
          opacity={0.35} 
          transmission={0.45} 
        />
      </mesh>

      <Html center position={[0, 6.4, -3]} scale={1}>
        <div className="missing-model">
          📦 Ajoute public/models/le-secteur.glb
        </div>
      </Html>
    </group>
  );
}

export default Placeholder;

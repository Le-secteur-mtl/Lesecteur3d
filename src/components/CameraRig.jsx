import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import gsap from "gsap";
import { VIEWS } from "../config/views";

function CameraRig({ view }) {
  const controls = useRef();
  const { camera } = useThree();
  const tweenRef = useRef(null);

  useEffect(() => {
    const next = VIEWS[view];

    // Kill previous tweens
    if (tweenRef.current) {
      tweenRef.current.kill();
    }

    // Animate camera
    tweenRef.current = gsap.to(camera.position, {
      x: next.camera[0],
      y: next.camera[1],
      z: next.camera[2],
      duration: 1.1,
      ease: "power3.inOut"
    });

    // Animate controls target
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

  useFrame(() => {
    if (controls.current) {
      controls.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controls}
      enableDamping
      dampingFactor={0.05}
      maxPolarAngle={Math.PI * 0.48}
      autoRotate={false}
    />
  );
}

export default CameraRig;

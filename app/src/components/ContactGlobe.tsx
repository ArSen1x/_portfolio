import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function GlobeMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[40, 24, 24]} />
      <meshBasicMaterial
        color="#6C8CFF"
        wireframe
        transparent
        opacity={0.12}
      />
    </mesh>
  );
}

export function ContactGlobe() {
  return (
    <div className="w-full h-[120px] mt-4 hidden lg:block">
      <Canvas camera={{ position: [0, 0, 100] }}>
        <GlobeMesh />
      </Canvas>
    </div>
  );
}

"use client";

import { useRef } from "react";

import { MeshDistortMaterial, Sphere } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Brain(): React.JSX.Element {
  const meshRef = useRef<THREE.Mesh>(null);
  const node1Ref = useRef<THREE.Mesh>(null);
  const node2Ref = useRef<THREE.Mesh>(null);
  const node3Ref = useRef<THREE.Mesh>(null);
  const node4Ref = useRef<THREE.Mesh>(null);
  const node5Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) {
      return;
    }

    const time = state.clock.elapsedTime;
    meshRef.current.rotation.y = time * 0.08;
    meshRef.current.rotation.x = Math.sin(time * 0.05) * 0.1;

    const nodes = [node1Ref, node2Ref, node3Ref, node4Ref, node5Ref];
    nodes.forEach((ref, index) => {
      if (!ref.current) {
        return;
      }

      const pulse = 0.4 + 0.6 * Math.abs(Math.sin(time * (0.8 + index * 0.3) + index * 1.2));
      const material = ref.current.material as THREE.MeshBasicMaterial;
      material.opacity = pulse;
      ref.current.scale.setScalar(0.8 + pulse * 0.4);
    });
  });

  const nodePositions: [number, number, number][] = [
    [0.7, 0.8, 0.6],
    [-0.9, 0.4, 0.5],
    [0.3, -0.9, 0.7],
    [-0.5, 0.6, -0.9],
    [0.8, -0.4, -0.7]
  ];

  const refs = [node1Ref, node2Ref, node3Ref, node4Ref, node5Ref];

  return (
    <group>
      <Sphere ref={meshRef} args={[1.1, 64, 64]}>
        <MeshDistortMaterial
          color="#001a08"
          distort={0.25}
          speed={1.5}
          roughness={0.2}
          metalness={0.1}
          wireframe={false}
        />
      </Sphere>

      <Sphere args={[1.13, 24, 24]}>
        <meshBasicMaterial color="#00ff88" wireframe transparent opacity={0.04} />
      </Sphere>

      {nodePositions.map((position, index) => (
        <mesh key={index} ref={refs[index]} position={position}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export function BrainScene(): React.JSX.Element {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        borderRadius: "16px"
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.05} color="#001a08" />
        <pointLight position={[2, 2, 2]} color="#00ff88" intensity={3} />
        <pointLight position={[-2, -1, 1]} color="#0044ff" intensity={1.5} />
        <Brain />
      </Canvas>
    </div>
  );
}

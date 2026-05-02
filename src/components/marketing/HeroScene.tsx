import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

function FloatingCubes() {
  const count = 15;
  const cubes = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10 - 5
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      scale: Math.random() * 0.5 + 0.2,
      speed: Math.random() * 0.5 + 0.2
    }));
  }, []);

  return (
    <>
      {cubes.map((props, i) => (
        <Cube key={i} {...props} />
      ))}
    </>
  );
}

function Cube({ position, rotation, scale, speed }: any) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = rotation[0] + time * speed;
    meshRef.current.rotation.y = rotation[1] + time * speed * 0.5;
    meshRef.current.position.y = position[1] + Math.sin(time * speed) * 0.5;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color="#3b82f6" 
        metalness={0.8} 
        roughness={0.1} 
        transparent 
        opacity={0.4}
      />
    </mesh>
  );
}

function DataFlow() {
  const points = useMemo(() => {
    const p = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      p[i * 3] = (Math.random() - 0.5) * 20;
      p[i * 3 + 1] = (Math.random() - 0.5) * 20;
      p[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return p;
  }, []);

  const pointsRef = useRef<THREE.Points>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = time * 0.05;
    pointsRef.current.rotation.z = time * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#22d3ee" transparent opacity={0.3} sizeAttenuation />
    </points>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas shadows gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
        
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
           <Sphere args={[1, 64, 64]} position={[0, 0, 0]}>
             <MeshDistortMaterial
                color="#3b82f6"
                speed={2}
                distort={0.4}
                radius={1}
                metalness={0.9}
                roughness={0.1}
             />
           </Sphere>
        </Float>

        <FloatingCubes />
        <DataFlow />
        
        <fog attach="fog" args={["#020617", 5, 20]} />
      </Canvas>
    </div>
  );
}

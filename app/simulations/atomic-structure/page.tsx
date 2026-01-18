'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Trail, Float } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

function Electron({ radius, speed, color, offset }: { radius: number; speed: number; color: string; offset: number }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime() * speed + offset;
      // Orbit logic
      ref.current.position.x = Math.sin(t) * radius;
      ref.current.position.z = Math.cos(t) * radius;
    }
  });

  return (
    <group ref={ref}>
      <Trail width={2} length={8} color={new THREE.Color(color)} attenuation={(t) => t * t}>
        <Sphere args={[0.15, 16, 16]}>
          <meshStandardMaterial emissive={color} emissiveIntensity={2} color={color} />
        </Sphere>
      </Trail>
    </group>
  );
}

export default function AtomicStructurePage() {
  return (
    <SimulationLayout
      title="Lithium Atom (Bohr Model)"
      description="A simplified representation of a Lithium atom. The nucleus contains protons and neutrons, while electrons orbit in shells. Notice the 2 electrons in the inner shell and 1 in the outer shell."
    >
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* Nucleus */}
        <group>
          <Sphere args={[0.4, 32, 32]} position={[0.2, 0.1, 0]}>
            <meshStandardMaterial color="#ff4444" roughness={0.2} />
          </Sphere>
          <Sphere args={[0.4, 32, 32]} position={[-0.2, -0.1, 0.1]}>
             <meshStandardMaterial color="#aaaaaa" roughness={0.2} />
          </Sphere>
          <Sphere args={[0.38, 32, 32]} position={[0, 0.3, -0.2]}>
             <meshStandardMaterial color="#ff4444" roughness={0.2} />
          </Sphere>
          <Sphere args={[0.4, 32, 32]} position={[0, -0.2, -0.2]}>
             <meshStandardMaterial color="#aaaaaa" roughness={0.2} />
          </Sphere>
        </group>

        {/* Electrons - Shell 1 */}
        <Electron radius={2} speed={1.5} color="#00ffff" offset={0} />
        <Electron radius={2} speed={1.5} color="#00ffff" offset={Math.PI} />

        {/* Electrons - Shell 2 */}
        <Electron radius={3.5} speed={0.8} color="#00aaff" offset={Math.PI / 2} />
        
        {/* Orbital Rings (Visual aid) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.98, 2.02, 64]} />
            <meshBasicMaterial color="#ffffff" opacity={0.1} transparent side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[3.48, 3.52, 64]} />
            <meshBasicMaterial color="#ffffff" opacity={0.1} transparent side={THREE.DoubleSide} />
        </mesh>
      </Float>
    </SimulationLayout>
  );
}
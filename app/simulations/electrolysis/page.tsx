'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Box, Sphere } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

// Component for rising bubbles
const Bubbles = ({ position, color, count }: { position: [number, number, number], color: string, count: number }) => {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if(!group.current) return;
    group.current.children.forEach((mesh, i) => {
      // Reset bubble if it goes too high
      if (mesh.position.y > 2) mesh.position.y = -1;
      // Rise up
      mesh.position.y += 0.01 + (i * 0.001);
      // Wiggle
      mesh.position.x += Math.sin(state.clock.getElapsedTime() * 5 + i) * 0.002;
    });
  });

  return (
    <group ref={group} position={position}>
      {Array.from({ length: count }).map((_, i) => (
        <Sphere key={i} args={[0.08, 8, 8]} position={[Math.random()*0.4 - 0.2, Math.random()*2 - 1, Math.random()*0.4 - 0.2]}>
          <meshStandardMaterial color={color} transparent opacity={0.6} />
        </Sphere>
      ))}
    </group>
  );
};

export default function ElectrolysisPage() {
  return (
    <SimulationLayout
      title="Electrolysis of Water"
      description="Electrical current breaks water (H₂O) into Hydrogen gas (Left, Cathode) and Oxygen gas (Right, Anode). Note there are twice as many Hydrogen bubbles as Oxygen bubbles (2:1 ratio)."
    >
      <group position={[0, -0.5, 0]}>
        
        {/* Water Tank */}
        <Box args={[4, 3, 2]} position={[0, 0.5, 0]}>
          <meshPhysicalMaterial color="#3b82f6" transmission={0.9} opacity={0.3} roughness={0} transparent thickness={1} />
        </Box>

        {/* Cathode (Negative) - More bubbles (H2) */}
        <Cylinder args={[0.1, 0.1, 2.5]} position={[-1, 0.25, 0]}>
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
        </Cylinder>
        <Bubbles position={[-1, 0, 0]} color="white" count={12} />

        {/* Anode (Positive) - Fewer bubbles (O2) */}
        <Cylinder args={[0.1, 0.1, 2.5]} position={[1, 0.25, 0]}>
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
        </Cylinder>
        <Bubbles position={[1, 0, 0]} color="#ef4444" count={6} />

        {/* Wire Connector */}
        <group position={[0, 1.6, 0]}>
            <Box args={[2.2, 0.1, 0.1]}><meshStandardMaterial color="black" /></Box>
            <Box args={[0.4, 0.4, 0.4]} position={[0, 0.2, 0]}>
                <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={0.5} />
            </Box>
        </group>

      </group>
    </SimulationLayout>
  );
}
'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Sparkles, Float } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

export default function CombustionPage() {
  return (
    <SimulationLayout
      title="Combustion Reaction (Methane)"
      description="Visualizing the exothermic reaction of Methane (CH₄) with Oxygen (O₂). Notice the release of energy (heat/light) as bonds break and reform into CO₂ and H₂O."
    >
      {/* Fire Effect */}
      <Sparkles count={200} scale={4} size={6} speed={0.4} opacity={0.5} color="#fbbf24" position={[0, 0, 0]} />
      <Sparkles count={50} scale={2} size={10} speed={0.8} opacity={1} color="#ef4444" noise={1} position={[0, -1, 0]} />

      <Float speed={3} rotationIntensity={1} floatIntensity={1}>
        <group rotation={[0.5, 0.5, 0]}>
          
          {/* Central Carbon Atom (Black/Grey) being consumed */}
          <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#333" roughness={0.5} />
          </Sphere>

          {/* Hydrogen Atoms flying off */}
          <group>
            <Sphere args={[0.2, 16, 16]} position={[0.8, 0.8, 0.8]}><meshStandardMaterial color="white" /></Sphere>
            <Sphere args={[0.2, 16, 16]} position={[-0.8, -0.8, 0.8]}><meshStandardMaterial color="white" /></Sphere>
            <Sphere args={[0.2, 16, 16]} position={[0.8, -0.8, -0.8]}><meshStandardMaterial color="white" /></Sphere>
            <Sphere args={[0.2, 16, 16]} position={[-0.8, 0.8, -0.8]}><meshStandardMaterial color="white" /></Sphere>
          </group>
          
          {/* Oxygen Atoms (Red) attacking */}
          <Sphere args={[0.4, 32, 32]} position={[2, 0, 0]}>
             <meshStandardMaterial color="#ef4444" emissive="#7f1d1d" />
          </Sphere>
          <Sphere args={[0.4, 32, 32]} position={[-2, 0.5, 0]}>
             <meshStandardMaterial color="#ef4444" emissive="#7f1d1d" />
          </Sphere>

        </group>
      </Float>
    </SimulationLayout>
  );
}
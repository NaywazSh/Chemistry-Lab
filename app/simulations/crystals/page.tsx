'use client';

import React from 'react';
import { Sphere, Line, Float, OrbitControls } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';

// Helper to create a lattice grid
const Lattice = () => {
  const atoms = [];
  const bonds = [];
  const size = 1; // Distance between atoms
  const count = 2; // 2x2x2 grid

  for (let x = -count; x <= count; x++) {
    for (let y = -count; y <= count; y++) {
      for (let z = -count; z <= count; z++) {
        // Determine if it is Sodium (Na) or Chloride (Cl) based on position
        const isNa = (x + y + z) % 2 === 0;
        const color = isNa ? "#818cf8" : "#34d399"; // Indigo vs Emerald
        const radius = isNa ? 0.2 : 0.35; // Cl is larger than Na
        
        atoms.push(
          <Sphere key={`${x}-${y}-${z}`} args={[radius, 32, 32]} position={[x * size, y * size, z * size]}>
            <meshStandardMaterial color={color} roughness={0.1} metalness={0.5} />
          </Sphere>
        );

        // Draw bonds (lines) to neighbors
        if (x < count) bonds.push(<Line key={`b-x-${x}-${y}-${z}`} points={[[x*size, y*size, z*size], [(x+1)*size, y*size, z*size]]} color="white" opacity={0.2} transparent lineWidth={1} />);
        if (y < count) bonds.push(<Line key={`b-y-${x}-${y}-${z}`} points={[[x*size, y*size, z*size], [x*size, (y+1)*size, z*size]]} color="white" opacity={0.2} transparent lineWidth={1} />);
        if (z < count) bonds.push(<Line key={`b-z-${x}-${y}-${z}`} points={[[x*size, y*size, z*size], [x*size, y*size, (z+1)*size]]} color="white" opacity={0.2} transparent lineWidth={1} />);
      }
    }
  }
  return <group>{atoms}{bonds}</group>;
};

export default function CrystalsPage() {
  return (
    <SimulationLayout
      title="Crystal Lattice (NaCl)"
      description="Visualizing the face-centered cubic structure of Sodium Chloride (Table Salt). The larger Green spheres represent Chloride ions (Cl⁻), and the smaller Purple spheres represent Sodium ions (Na⁺)."
    >
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
        <group rotation={[Math.PI / 4, Math.PI / 4, 0]} scale={0.8}>
          <Lattice />
        </group>
      </Float>
    </SimulationLayout>
  );
}
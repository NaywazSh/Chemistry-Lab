'use client';

import React from 'react';
import { Sphere, Cylinder, Float } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';

// Generate DNA Helix Data
const DNAHelix = () => {
  const points = [];
  const count = 20;
  
  for (let i = 0; i < count; i++) {
    const y = (i - count / 2) * 0.5;
    const angle = i * 0.5;
    
    // Strand 1
    points.push(
      <group key={i} position={[0, y, 0]} rotation={[0, angle, 0]}>
        <Sphere args={[0.2, 16, 16]} position={[1, 0, 0]}><meshStandardMaterial color="#fbbf24" /></Sphere> {/* Sugar-Phosphate */}
        <Sphere args={[0.2, 16, 16]} position={[-1, 0, 0]}><meshStandardMaterial color="#fbbf24" /></Sphere>
        
        {/* Base Pairs (The rungs of the ladder) */}
        <Cylinder args={[0.05, 0.05, 2]} rotation={[0, 0, Math.PI / 2]}>
            <meshStandardMaterial color={i % 2 === 0 ? "#34d399" : "#60a5fa"} opacity={0.8} transparent />
        </Cylinder>
      </group>
    );
  }
  return <group>{points}</group>;
};

export default function DNAPage() {
  return (
    <SimulationLayout
      title="DNA Double Helix"
      description="Deoxyribonucleic acid is a molecule composed of two polynucleotide chains that coil around each other to form a double helix carrying genetic instructions."
    >
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.2}>
        <group rotation={[0, 0, Math.PI / 6]}>
          <DNAHelix />
        </group>
      </Float>
    </SimulationLayout>
  );
}
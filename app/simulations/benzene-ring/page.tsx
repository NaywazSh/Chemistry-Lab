'use client';

import React from 'react';
import { Sphere, Cylinder, Float } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';

const BenzeneRing = () => {
  const carbonCount = 6;
  const radius = 2.5;
  const carbonAtoms = [];
  const bonds = [];

  for (let i = 0; i < carbonCount; i++) {
    const angle = (i * 2 * Math.PI) / carbonCount;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    // Carbon atoms
    carbonAtoms.push(
      <Sphere key={`c-${i}`} args={[0.5, 32, 32]} position={[x, 0, z]}>
        <meshStandardMaterial color="#4b5563" roughness={0.3} />
      </Sphere>
    );

    // Hydrogen atoms (slightly outside)
    const hx = Math.cos(angle) * (radius + 1.2);
    const hz = Math.sin(angle) * (radius + 1.2);
    carbonAtoms.push(
      <Sphere key={`h-${i}`} args={[0.3, 32, 32]} position={[hx, 0, hz]}>
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </Sphere>
    );

    // Carbon-Carbon bonds
    const nextAngle = ((i + 1) * 2 * Math.PI) / carbonCount;
    const nextX = Math.cos(nextAngle) * radius;
    const nextZ = Math.sin(nextAngle) * radius;
    
    bonds.push(
      <Cylinder 
        key={`bond-${i}`} 
        args={[0.15, 0.15, 2.4]} 
        position={[(x + nextX) / 2, 0, (z + nextZ) / 2]}
        rotation={[0, -angle, 0]}
      >
        <meshStandardMaterial color="#d1d5db" />
      </Cylinder>
    );

    // Carbon-Hydrogen bonds
    bonds.push(
      <Cylinder 
        key={`ch-${i}`} 
        args={[0.1, 0.1, 1]} 
        position={[(x + hx) / 2, 0, (z + hz) / 2]}
        rotation={[0, -angle, 0]}
      >
        <meshStandardMaterial color="#d1d5db" opacity={0.7} transparent />
      </Cylinder>
    );
  }

  return <group>{carbonAtoms}{bonds}</group>;
};

export default function BenzenePage() {
  return (
    <SimulationLayout
      title="Benzene Ring (C₆H₆)"
      description="A hexagonal ring of six carbon atoms with alternating single and double bonds. The delocalized π-electrons create resonance stabilization."
    >
      <Float speed={1} rotationIntensity={0.4} floatIntensity={0.2}>
        <group rotation={[Math.PI / 6, Math.PI / 4, 0]}>
          <BenzeneRing />
          {/* Resonance ring visualization */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.8, 3.2, 6]} />
            <meshBasicMaterial color="#fbbf24" opacity={0.3} transparent side={2} />
          </mesh>
        </group>
      </Float>
    </SimulationLayout>
  );
}
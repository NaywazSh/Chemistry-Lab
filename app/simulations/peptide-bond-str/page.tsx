'use client';

import React from 'react';
import { Sphere, Cylinder, Text, Float } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';

export default function PeptideBondPage() {
  return (
    <SimulationLayout
      title="Peptide Bond Formation"
      description="A dehydration condensation reaction where the carboxyl group of one amino acid reacts with the amino group of another, releasing a water molecule."
    >
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group rotation={[0.2, -0.5, 0]}>
          
          {/* Amino Acid 1 (Left) */}
          <group position={[-1.5, 0, 0]}>
            <Sphere args={[0.4, 32, 32]}><meshStandardMaterial color="#333" /></Sphere>
            <Text position={[0, 0.6, 0]} fontSize={0.2} color="white">Glycine 1</Text>
            {/* Carboxyl C */}
            <Sphere args={[0.35, 32, 32]} position={[0.6, 0, 0]}><meshStandardMaterial color="#333" /></Sphere>
            {/* Double Bond O */}
            <Sphere args={[0.3, 32, 32]} position={[0.6, 0.6, 0]}><meshStandardMaterial color="#ef4444" /></Sphere>
            <Cylinder args={[0.05, 0.05, 0.6]} position={[0.6, 0.3, 0]}><meshStandardMaterial color="gray" /></Cylinder>
            {/* OH Group (Leaving) */}
            <group position={[1.0, -0.2, 0]}>
                <Sphere args={[0.3, 32, 32]}><meshStandardMaterial color="#ef4444" /></Sphere>
                <Sphere args={[0.15, 32, 32]} position={[0.3, -0.1, 0]}><meshStandardMaterial color="white" /></Sphere>
            </group>
          </group>

          {/* Plus Sign */}
          <Text position={[0, 0, 0]} fontSize={0.5} color="#fbbf24">+</Text>

          {/* Amino Acid 2 (Right) */}
          <group position={[1.5, 0, 0]}>
            <Sphere args={[0.4, 32, 32]}><meshStandardMaterial color="#333" /></Sphere>
            <Text position={[0, 0.6, 0]} fontSize={0.2} color="white">Glycine 2</Text>
            {/* Amino N */}
            <Sphere args={[0.35, 32, 32]} position={[-0.6, 0, 0]}><meshStandardMaterial color="#3b82f6" /></Sphere>
            {/* H (Staying) */}
            <Sphere args={[0.2, 32, 32]} position={[-0.6, 0.5, 0]}><meshStandardMaterial color="white" /></Sphere>
            {/* H (Leaving) */}
            <Sphere args={[0.2, 32, 32]} position={[-0.9, -0.2, 0]}><meshStandardMaterial color="white" /></Sphere>
          </group>

          {/* Reaction Arrow */}
          <group position={[0, -1.5, 0]}>
             <Text fontSize={0.3} color="#fbbf24">Water (H₂O) Released</Text>
             <Sphere args={[0.1, 32, 32]} position={[0, 0.5, 0]}><meshStandardMaterial color="#38bdf8" /></Sphere>
          </group>

        </group>
      </Float>
    </SimulationLayout>
  );
}
'use client';

import React from 'react';
import { Sphere, Cylinder, Float, Text } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';

export default function AminoAcidPage() {
  return (
    <SimulationLayout
      title="Amino Acid Structure (Glycine)"
      description="The building blocks of proteins. All amino acids share a central Alpha-carbon, an Amino group (NH2), a Carboxyl group (COOH), and a variable R-group (Side chain)."
    >
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group rotation={[0.5, 0.5, 0]}>
          
          {/* Central Alpha Carbon (Black) */}
          <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}><meshStandardMaterial color="#333" /></Sphere>
          <Text position={[0, 0.7, 0]} fontSize={0.2} color="white">α-Carbon</Text>

          {/* Amino Group (NH2) - Blue */}
          <group position={[-1.2, 0, 0]}>
            <Cylinder args={[0.1, 0.1, 1]} rotation={[0, 0, Math.PI/2]} position={[0.6, 0, 0]}><meshStandardMaterial color="#ccc" /></Cylinder>
            <Sphere args={[0.45, 32, 32]}><meshStandardMaterial color="#3b82f6" /></Sphere> {/* N */}
            <Sphere args={[0.25, 32, 32]} position={[-0.4, 0.4, 0]}><meshStandardMaterial color="white" /></Sphere> {/* H */}
            <Sphere args={[0.25, 32, 32]} position={[-0.4, -0.4, 0]}><meshStandardMaterial color="white" /></Sphere> {/* H */}
            <Text position={[0, -0.7, 0]} fontSize={0.2} color="#3b82f6">Amino Group</Text>
          </group>

          {/* Carboxyl Group (COOH) - Red */}
          <group position={[1.2, 0, 0]}>
            <Cylinder args={[0.1, 0.1, 1]} rotation={[0, 0, Math.PI/2]} position={[-0.6, 0, 0]}><meshStandardMaterial color="#ccc" /></Cylinder>
            <Sphere args={[0.45, 32, 32]}><meshStandardMaterial color="#333" /></Sphere> {/* C */}
            <Sphere args={[0.4, 32, 32]} position={[0.5, 0.5, 0]}><meshStandardMaterial color="#ef4444" /></Sphere> {/* O (Double Bond) */}
            <Sphere args={[0.4, 32, 32]} position={[0.5, -0.5, 0]}><meshStandardMaterial color="#ef4444" /></Sphere> {/* OH */}
            <Sphere args={[0.2, 32, 32]} position={[0.8, -0.8, 0]}><meshStandardMaterial color="white" /></Sphere> {/* H */}
            <Text position={[0, -0.7, 0]} fontSize={0.2} color="#ef4444">Carboxyl Group</Text>
          </group>

          {/* R-Group (Variable) - Green */}
          <group position={[0, 1.2, 0]}>
            <Cylinder args={[0.1, 0.1, 1]} position={[0, -0.6, 0]}><meshStandardMaterial color="#ccc" /></Cylinder>
            <Sphere args={[0.4, 32, 32]}><meshStandardMaterial color="#22c55e" /></Sphere>
            <Text position={[0, 0.6, 0]} fontSize={0.3} color="#22c55e">R (Side Chain)</Text>
          </group>

          {/* Hydrogen - White */}
          <group position={[0, -1.2, 0]}>
            <Cylinder args={[0.1, 0.1, 1]} position={[0, 0.6, 0]}><meshStandardMaterial color="#ccc" /></Cylinder>
            <Sphere args={[0.3, 32, 32]}><meshStandardMaterial color="white" /></Sphere>
          </group>

        </group>
      </Float>
    </SimulationLayout>
  );
}
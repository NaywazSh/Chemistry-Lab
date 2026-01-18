'use client';

import React from 'react';
import { Sphere, Cylinder, Float, Text } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';

const Helix = ({ isDouble, position }: { isDouble: boolean, position: [number, number, number] }) => {
  const points = [];
  const count = 12;
  
  for (let i = 0; i < count; i++) {
    const y = (i - count / 2) * 0.4;
    const angle = i * 0.6;
    
    // Backbone 1
    points.push(
      <group key={`b1-${i}`} position={[Math.sin(angle), y, Math.cos(angle)]}>
        <Sphere args={[0.15, 16, 16]}><meshStandardMaterial color="#eab308" /></Sphere>
      </group>
    );

    // Base Pair Connection
    if (isDouble) {
        // Backbone 2 (Opposite side)
        points.push(
            <group key={`b2-${i}`} position={[Math.sin(angle + Math.PI), y, Math.cos(angle + Math.PI)]}>
                <Sphere args={[0.15, 16, 16]}><meshStandardMaterial color="#eab308" /></Sphere>
            </group>
        );
        // Rung
        points.push(
            <Cylinder key={`rung-${i}`} args={[0.05, 0.05, 2]} rotation={[0, -angle, Math.PI/2]} position={[0, y, 0]}>
                <meshStandardMaterial color={i % 2 === 0 ? "#34d399" : "#60a5fa"} />
            </Cylinder>
        );
    } else {
        // RNA Single Base (sticking out)
        points.push(
            <Cylinder key={`base-${i}`} args={[0.05, 0.05, 0.8]} rotation={[0, -angle, Math.PI/2]} position={[Math.sin(angle)*0.4, y, Math.cos(angle)*0.4]}>
                {/* Highlight Uracil in Red sometimes */}
                <meshStandardMaterial color={i % 3 === 0 ? "#f43f5e" : "#3b82f6"} />
            </Cylinder>
        );
    }
  }
  return <group position={position}>{points}</group>;
};

export default function DnaRnaPage() {
  return (
    <SimulationLayout
      title="DNA vs RNA"
      description="Comparing the Double Helix of DNA (Deoxyribose + Thymine) with the Single Strand of RNA (Ribose + Uracil)."
    >
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
        <group>
            {/* DNA */}
            <Helix isDouble={true} position={[-2, 0, 0]} />
            <Text position={[-2, 3, 0]} fontSize={0.4} color="#34d399">DNA</Text>
            <Text position={[-2, -3, 0]} fontSize={0.2} color="white">Double Helix</Text>

            {/* RNA */}
            <Helix isDouble={false} position={[2, 0, 0]} />
            <Text position={[2, 3, 0]} fontSize={0.4} color="#f43f5e">RNA</Text>
            <Text position={[2, -3, 0]} fontSize={0.2} color="white">Single Strand (Uracil)</Text>
        </group>
      </Float>
    </SimulationLayout>
  );
}
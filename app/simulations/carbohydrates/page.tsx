'use client';

import React from 'react';
import { Sphere, Cylinder, Float, Text, Line } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';

// Simple Hexagon Sugar Ring
const SugarRing = ({ position, color }: { position: [number, number, number], color: string }) => {
    return (
        <group position={position}>
            {[0, 1, 2, 3, 4, 5].map((i) => {
                const angle = (i / 6) * Math.PI * 2;
                return (
                    <group key={i}>
                        <Sphere args={[0.2, 16, 16]} position={[Math.cos(angle), Math.sin(angle), 0]}>
                            <meshStandardMaterial color={i === 0 ? "red" : color} /> {/* Red indicates Oxygen in ring */}
                        </Sphere>
                        <Cylinder 
                            args={[0.05, 0.05, 1]} 
                            position={[Math.cos(angle + Math.PI/6)*0.85, Math.sin(angle + Math.PI/6)*0.85, 0]} 
                            rotation={[0, 0, angle + Math.PI/6]}
                        >
                            <meshStandardMaterial color="white" />
                        </Cylinder>
                    </group>
                )
            })}
        </group>
    )
}

export default function CarbsPage() {
  return (
    <SimulationLayout
      title="Glycosidic Linkage (Maltose)"
      description="Two Glucose molecules joined by an α-1,4-glycosidic bond. The Oxygen atom acts as a bridge between the two rings."
    >
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group scale={0.8}>
            
            {/* Glucose 1 */}
            <SugarRing position={[-1.8, 0, 0]} color="#3b82f6" />
            <Text position={[-1.8, 1.5, 0]} fontSize={0.3} color="#3b82f6">α-Glucose</Text>

            {/* Glycosidic Bond (The Bridge) */}
            <Sphere args={[0.25, 32, 32]} position={[0, -0.5, 0]}><meshStandardMaterial color="#ef4444" /></Sphere>
            <Cylinder args={[0.08, 0.08, 1.2]} position={[-0.7, -0.2, 0]} rotation={[0, 0, -1]}><meshStandardMaterial color="white" /></Cylinder>
            <Cylinder args={[0.08, 0.08, 1.2]} position={[0.7, -0.2, 0]} rotation={[0, 0, 1]}><meshStandardMaterial color="white" /></Cylinder>
            <Text position={[0, -1.2, 0]} fontSize={0.25} color="#ef4444">α-1,4 Linkage</Text>

            {/* Glucose 2 */}
            <SugarRing position={[1.8, 0, 0]} color="#3b82f6" />
            <Text position={[1.8, 1.5, 0]} fontSize={0.3} color="#3b82f6">α-Glucose</Text>

        </group>
      </Float>
    </SimulationLayout>
  );
}
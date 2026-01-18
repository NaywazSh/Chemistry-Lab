'use client';

import React from 'react';
import { Line, Text, Float } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

// Draw a parabolic curve for Activation Energy
const EnergyCurve = ({ height, color, label }: { height: number, color: string, label: string }) => {
    const points = [];
    for (let x = -2; x <= 2; x += 0.1) {
        // Bell curve shape
        const y = Math.exp(-(x * x)) * height; 
        points.push(new THREE.Vector3(x, y, 0));
    }
    return (
        <group>
            <Line points={points} color={color} lineWidth={4} />
            <Text position={[0, height + 0.2, 0]} fontSize={0.15} color={color}>{label}</Text>
        </group>
    );
}

export default function CatalystsPage() {
  return (
    <SimulationLayout
      title="Organic Catalysts"
      description="Catalysts speed up reactions by providing an alternative pathway with lower Activation Energy (Ea). Note that ΔG (Energy change) remains the same."
    >
      <group position={[0, -1, 0]}>
        
        {/* Axes */}
        <Line points={[[-2.5, 0, 0], [2.5, 0, 0]]} color="white" lineWidth={2} /> {/* X Axis */}
        <Line points={[[-2.5, 0, 0], [-2.5, 3, 0]]} color="white" lineWidth={2} /> {/* Y Axis */}
        <Text position={[2.8, 0, 0]} fontSize={0.2} color="gray">Reaction Progress</Text>
        <Text position={[-2.5, 3.2, 0]} fontSize={0.2} color="gray">Potential Energy</Text>

        {/* High Energy Path (No Catalyst) */}
        <EnergyCurve height={2.5} color="#ef4444" label="Without Catalyst (High Ea)" />

        {/* Low Energy Path (With Catalyst) */}
        <EnergyCurve height={1.2} color="#22c55e" label="With Catalyst (Low Ea)" />

        {/* Reactants and Products */}
        <Text position={[-2, 0.2, 0]} fontSize={0.2} color="white">Reactants</Text>
        <Text position={[2, 0.2, 0]} fontSize={0.2} color="white">Products</Text>

        {/* Visual Metaphor: Catalyst Particle */}
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <group position={[0, 3, 0]}>
                <mesh>
                    <dodecahedronGeometry args={[0.4]} />
                    <meshStandardMaterial color="#2dd4bf" wireframe />
                </mesh>
                <Text position={[0, -0.6, 0]} fontSize={0.15} color="#2dd4bf">Catalyst Surface</Text>
            </group>
        </Float>

      </group>
    </SimulationLayout>
  );
}
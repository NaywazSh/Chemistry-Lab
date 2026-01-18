'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Cone, Sphere } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

const FlaskLiquid = () => {
    const mesh = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        if (mesh.current) {
            // Oscillate color between Clear and Pink to simulate Titration endpoint
            const t = (Math.sin(clock.getElapsedTime()) + 1) / 2; // 0 to 1
            const color = new THREE.Color().lerpColors(new THREE.Color('#ec4899'), new THREE.Color('#dbeafe'), t);
            (mesh.current.material as THREE.MeshStandardMaterial).color = color;
        }
    });

    return (
        <group position={[0, -1.5, 0]}>
            {/* Glass Flask */}
            <Cone args={[1, 2.5, 32, 1, true]} position={[0, 0, 0]} rotation={[0,0,0]}>
                <meshPhysicalMaterial transmission={1} opacity={0.3} roughness={0} thickness={0.5} color="white" transparent side={THREE.DoubleSide} />
            </Cone>
            {/* The Liquid inside */}
            <Cone ref={mesh} args={[0.9, 1.5, 32]} position={[0, -0.5, 0]} rotation={[Math.PI, 0, 0]}>
                <meshStandardMaterial transparent opacity={0.8} />
            </Cone>
        </group>
    );
};

const Drop = () => {
    const drop = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        if(drop.current) {
            const t = clock.getElapsedTime() * 2;
            drop.current.position.y = 1.5 - (t % 3); // Fall down
            drop.current.scale.setScalar((t % 3) > 2.8 ? 0 : 0.1); // Disappear at bottom
        }
    });
    return (
        <Sphere ref={drop} args={[1, 16, 16]} position={[0, 1.5, 0]}>
            <meshStandardMaterial color="#dbeafe" />
        </Sphere>
    )
}

export default function TitrationPage() {
  return (
    <SimulationLayout
      title="Acid-Base Titration"
      description="Simulating the neutralization point. The indicator (Phenolphthalein) changes color from Pink (Basic) to Colorless (Acidic) as the solution is added."
    >
      <group>
        {/* Burette (Dispenser) */}
        <Cylinder args={[0.1, 0.1, 3]} position={[0, 2, 0]}>
            <meshPhysicalMaterial transmission={1} opacity={0.4} roughness={0} color="white" transparent />
        </Cylinder>
        <Cylinder args={[0.08, 0.08, 2.8]} position={[0, 2, 0]}>
             <meshStandardMaterial color="#dbeafe" opacity={0.5} transparent />
        </Cylinder>
        
        <Drop />
        <FlaskLiquid />
        
      </group>
    </SimulationLayout>
  );
}
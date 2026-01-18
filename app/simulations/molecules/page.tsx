'use client';

import React from 'react';
import { Sphere, Cylinder, Html } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';

export default function MoleculesPage() {
  return (
    <SimulationLayout
      title="Water Molecule (H₂O)"
      description="Observe the bent shape of the Water molecule caused by the lone pairs on the Oxygen atom. The bond angle is approximately 104.5°."
    >
      <group rotation={[0, 0, Math.PI / 6]}>
        
        {/* Oxygen */}
        <Sphere args={[0.8, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#ff0000" />
          <Html position={[0, 1, 0]} center>
            <div className="bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">Oxygen</div>
          </Html>
        </Sphere>

        {/* Hydrogen 1 Bond */}
        <Cylinder args={[0.15, 0.15, 2]} position={[-1, -1, 0]} rotation={[0, 0, Math.PI / 4]}>
          <meshStandardMaterial color="#dddddd" />
        </Cylinder>
        {/* Hydrogen 1 Atom */}
        <Sphere args={[0.4, 32, 32]} position={[-1.8, -1.8, 0]}>
          <meshStandardMaterial color="white" />
          <Html position={[0, -0.8, 0]} center>
             <div className="bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">H</div>
          </Html>
        </Sphere>

        {/* Hydrogen 2 Bond */}
        <Cylinder args={[0.15, 0.15, 2]} position={[1, -1, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <meshStandardMaterial color="#dddddd" />
        </Cylinder>
        {/* Hydrogen 2 Atom */}
        <Sphere args={[0.4, 32, 32]} position={[1.8, -1.8, 0]}>
          <meshStandardMaterial color="white" />
          <Html position={[0, -0.8, 0]} center>
             <div className="bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">H</div>
          </Html>
        </Sphere>

      </group>
    </SimulationLayout>
  );
}
'use client';

import React from 'react';
import { Sphere, Cylinder, Float, Html } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';

export default function CarbonDioxidePage() {
  return (
    <SimulationLayout
      title="Carbon Dioxide Molecule (CO₂)"
      description="A linear molecule where carbon is double-bonded to two oxygen atoms. The bond angle is 180°, making it a non-polar molecule."
    >
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
        <group rotation={[0, Math.PI / 4, 0]}>
          
          {/* Carbon Atom - Center */}
          <Sphere args={[0.6, 32, 32]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#4b5563" roughness={0.4} />
            <Html position={[0, 0.8, 0]} center>
              <div className="bg-black/60 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">Carbon</div>
            </Html>
          </Sphere>

          {/* Oxygen 1 - Left */}
          <Sphere args={[0.7, 32, 32]} position={[-2.2, 0, 0]}>
            <meshStandardMaterial color="#ef4444" roughness={0.3} />
            <Html position={[0, 0.9, 0]} center>
              <div className="bg-black/60 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">Oxygen</div>
            </Html>
          </Sphere>

          {/* Oxygen 2 - Right */}
          <Sphere args={[0.7, 32, 32]} position={[2.2, 0, 0]}>
            <meshStandardMaterial color="#ef4444" roughness={0.3} />
            <Html position={[0, 0.9, 0]} center>
              <div className="bg-black/60 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">Oxygen</div>
            </Html>
          </Sphere>

          {/* Double Bond 1 - Left */}
          <Cylinder args={[0.08, 0.08, 2]} position={[-1.1, 0.1, 0]}>
            <meshStandardMaterial color="#d1d5db" />
          </Cylinder>
          <Cylinder args={[0.08, 0.08, 2]} position={[-1.1, -0.1, 0]}>
            <meshStandardMaterial color="#d1d5db" />
          </Cylinder>

          {/* Double Bond 2 - Right */}
          <Cylinder args={[0.08, 0.08, 2]} position={[1.1, 0.1, 0]}>
            <meshStandardMaterial color="#d1d5db" />
          </Cylinder>
          <Cylinder args={[0.08, 0.08, 2]} position={[1.1, -0.1, 0]}>
            <meshStandardMaterial color="#d1d5db" />
          </Cylinder>

        </group>
      </Float>
    </SimulationLayout>
  );
}
'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Sphere, Html, Float, Box, Text } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

// --- Components ---

// 1. Floating Ions (Aqueous State)
const AqueousIons = ({ count, active }: { count: number, active: boolean }) => {
  const ions = useMemo(() => new Array(count).fill(0).map((_, i) => ({
    type: i % 2 === 0 ? 'Ag' : 'Cl',
    x: (Math.random() - 0.5) * 1.5,
    y: Math.random() * 1.5 - 0.5,
    z: (Math.random() - 0.5) * 1.5,
    speedX: (Math.random() - 0.5) * 0.02,
    speedY: (Math.random() - 0.5) * 0.02,
    speedZ: (Math.random() - 0.5) * 0.02,
  })), [count]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current && active) {
      groupRef.current.children.forEach((mesh, i) => {
        const ion = ions[i];
        mesh.position.x += ion.speedX;
        mesh.position.y += ion.speedY;
        mesh.position.z += ion.speedZ;

        // Bounce off walls
        if (Math.abs(mesh.position.x) > 0.8) ion.speedX *= -1;
        if (mesh.position.y > 1.2 || mesh.position.y < -0.8) ion.speedY *= -1;
        if (Math.abs(mesh.position.z) > 0.8) ion.speedZ *= -1;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {ions.map((ion, i) => (
        <Sphere key={i} args={[0.08, 16, 16]} position={[ion.x, ion.y, ion.z]}>
          <meshStandardMaterial 
            color={ion.type === 'Ag' ? "#d1d5db" : "#22c55e"} 
            emissive={ion.type === 'Ag' ? "#d1d5db" : "#22c55e"}
            emissiveIntensity={0.5}
          />
        </Sphere>
      ))}
    </group>
  );
};

// 2. Solid Lattice (Precipitate State)
const PrecipitateLattice = ({ active }: { active: boolean }) => {
  const gridSize = 3;
  const spacing = 0.18;
  const latticeGroup = useRef<THREE.Group>(null);

  useFrame(() => {
    if (latticeGroup.current && active) {
      // Smoothly rise from bottom when activated
      latticeGroup.current.position.y = THREE.MathUtils.lerp(latticeGroup.current.position.y, -1.2, 0.05);
    } else if (latticeGroup.current) {
      latticeGroup.current.position.y = -3; // Hide below
    }
  });

  const atoms = [];
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      for (let z = 0; z < gridSize; z++) {
        const isAg = (x + y + z) % 2 === 0;
        atoms.push(
          <Sphere 
            key={`${x}-${y}-${z}`} 
            args={[0.08, 16, 16]} 
            position={[(x - 1) * spacing, y * spacing, (z - 1) * spacing]}
          >
            <meshStandardMaterial 
              color={isAg ? "#d1d5db" : "#22c55e"} 
              emissive={isAg ? "#d1d5db" : "#22c55e"}
              emissiveIntensity={0.2}
            />
          </Sphere>
        );
      }
    }
  }

  return <group ref={latticeGroup} position={[0, -3, 0]}>{atoms}</group>;
};

// 3. Falling Ions (Transition animation)
const FallingIons = ({ active }: { active: boolean }) => {
    const groupRef = useRef<THREE.Group>(null);
    useFrame(() => {
        if(groupRef.current && active) {
            groupRef.current.position.y -= 0.02; // Fall down
            if(groupRef.current.position.y < -1) groupRef.current.position.y = 1.5; // Loop for effect
        }
    });

    if(!active) return null;

    return (
        <group ref={groupRef} position={[0, 1.5, 0]}>
            <Sphere args={[0.08, 16, 16]} position={[-0.1, 0, 0]}><meshStandardMaterial color="#d1d5db" emissive="#d1d5db" /></Sphere>
            <Sphere args={[0.08, 16, 16]} position={[0.1, 0.2, 0]}><meshStandardMaterial color="#22c55e" emissive="#22c55e" /></Sphere>
        </group>
    )
}

export default function PrecipitationPage() {
  const [stage, setStage] = useState(0); // 0: Dilute, 1: Saturated, 2: Precipitate

  return (
    <SimulationLayout
      title="Precipitation & Ksp"
      description="Visualizing the formation of an insoluble salt (Silver Chloride). Watch how aqueous ions form a solid crystal lattice when the concentration exceeds the Ksp limit."
      cameraPosition={[0, 0.5, 6]}
    >
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.1}>
        <group position={[0, -0.5, 0]}>
          
          {/* Glass Beaker */}
          <Cylinder args={[1.2, 1.2, 3, 32]} position={[0, 0, 0]}>
            <meshPhysicalMaterial 
              color="#e0f2fe" 
              transmission={0.95} 
              opacity={0.1} 
              transparent 
              roughness={0} 
              thickness={0.05}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </Cylinder>
          <Cylinder args={[1.18, 1.18, 2.5, 32]} position={[0, -0.2, 0]}>
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.1} />
          </Cylinder>

          {/* Dynamic Ion Display */}
          <AqueousIons count={stage === 0 ? 10 : 25} active={true} />
          <FallingIons active={stage === 2} />
          <PrecipitateLattice active={stage === 2} />

          {/* Reaction Info Panel */}
          <Html position={[3, 0, 0]} center>
            <div className="w-72 bg-slate-900/90 p-5 rounded-2xl border border-slate-700 backdrop-blur-md shadow-2xl">
              
              <div className="flex justify-between items-end mb-4">
                  <span className="text-sm font-bold text-slate-400">Ag⁺ + Cl⁻ ⇌ AgCl(s)</span>
              </div>

              {/* Ksp Status Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-cyan-400">Ion Product (Q)</span>
                    <span className="text-amber-400">Ksp Limit</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ${stage === 2 ? 'bg-red-500 w-full' : stage === 1 ? 'bg-amber-500 w-[80%]' : 'bg-cyan-500 w-[30%]'}`}
                    />
                </div>
              </div>

              {/* Dynamic Explanation */}
              <div className="bg-black/50 p-3 rounded-lg border border-slate-800 h-24">
                  {stage === 0 && (
                      <div>
                          <div className="text-cyan-400 font-bold mb-1">Unsaturated Solution</div>
                          <p className="text-xs text-slate-300">Q &lt; Ksp. Ions are floating freely in the water. No precipitate forms.</p>
                      </div>
                  )}
                  {stage === 1 && (
                      <div>
                          <div className="text-amber-400 font-bold mb-1">Saturated Solution</div>
                          <p className="text-xs text-slate-300">Q ≈ Ksp. The solution holds the maximum amount of dissolved ions.</p>
                      </div>
                  )}
                  {stage === 2 && (
                      <div>
                          <div className="text-red-500 font-bold mb-1">Supersaturated!</div>
                          <p className="text-xs text-slate-300">Q &gt; Ksp. Excess ions collide and lock into a solid crystal lattice (Precipitate).</p>
                      </div>
                  )}
              </div>

            </div>
          </Html>

          {/* Legend */}
          <Html position={[0, -2.5, 0]} center>
            <div className="flex gap-4 bg-black/60 px-4 py-2 rounded-full border border-slate-700 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gray-300 shadow-[0_0_8px_#d1d5db]"></span>
                    <span className="text-xs text-white font-bold">Ag⁺ (Silver)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
                    <span className="text-xs text-white font-bold">Cl⁻ (Chloride)</span>
                </div>
            </div>
          </Html>

          {/* Interactive Controls */}
          <Html position={[0, -3.5, 0]} center>
            <div className="flex gap-3">
                <button 
                    onClick={() => setStage(Math.min(2, stage + 1))}
                    disabled={stage === 2}
                    className={`px-6 py-3 rounded-lg font-bold transition-all shadow-lg ${stage === 2 ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-500 text-white'}`}
                >
                    Add More Ions
                </button>
                <button 
                    onClick={() => setStage(0)}
                    disabled={stage === 0}
                    className={`px-4 py-3 rounded-lg font-bold transition-all ${stage === 0 ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                >
                    Reset
                </button>
            </div>
          </Html>

        </group>
      </Float>
    </SimulationLayout>
  );
}
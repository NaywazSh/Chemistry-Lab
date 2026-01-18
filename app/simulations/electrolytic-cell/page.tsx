'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Box, Sphere, Text, Float, Html } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

// --- Components ---

const Tank = () => (
  <group position={[0, -1, 0]}>
    {/* Glass Container */}
    <Box args={[4, 2.5, 2]}>
        <meshPhysicalMaterial 
            color="white" 
            transmission={0.9} 
            opacity={0.2} 
            transparent 
            roughness={0} 
            thickness={0.1}
            side={THREE.DoubleSide}
        />
    </Box>
    {/* Molten Electrolyte */}
    <Box args={[3.8, 2.3, 1.8]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#fcd34d" transparent opacity={0.6} />
    </Box>
    <Text position={[0, -1.6, 1.1]} fontSize={0.25} color="white" outlineWidth={0.02} outlineColor="black">
        Molten NaCl (Electrolyte)
    </Text>
  </group>
);

const Electrode = ({ position, charge, label }: { position: [number, number, number], charge: string, label: string }) => (
  <group position={position}>
    {/* Graphite Rod */}
    <Cylinder args={[0.2, 0.2, 3.5]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#333" metalness={0.5} roughness={0.8} />
    </Cylinder>
    {/* Label */}
    <Html position={[0, 2.5, 0]} center>
        <div className="flex flex-col items-center">
            <span className={`text-2xl font-bold ${charge === '+' ? 'text-red-500' : 'text-blue-500'}`}>{charge}</span>
            <span className="text-xs font-bold text-slate-300 bg-slate-900/90 px-2 py-1 rounded border border-slate-700 whitespace-nowrap backdrop-blur-md">
                {label}
            </span>
        </div>
    </Html>
  </group>
);

const Battery = () => (
    <group position={[0, 2.8, 0]} rotation={[0, 0, Math.PI/2]}>
        <Cylinder args={[0.3, 0.3, 1]}>
            <meshStandardMaterial color="#333" />
        </Cylinder>
        <Cylinder args={[0.3, 0.3, 0.2]} position={[0, 0.6, 0]}>
            <meshStandardMaterial color="#ef4444" /> {/* Positive Terminal */}
        </Cylinder>
        <Cylinder args={[0.1, 0.1, 0.2]} position={[0, 0.8, 0]}>
            <meshStandardMaterial color="#ef4444" />
        </Cylinder>
        <Text position={[0, 1.2, 0]} rotation={[0, 0, -Math.PI/2]} fontSize={0.3} color="white" outlineWidth={0.02} outlineColor="black">DC Power</Text>
        
        {/* Wires */}
        <mesh position={[0, 0.8, 0]}>
            <tubeGeometry args={[new THREE.LineCurve3(new THREE.Vector3(0,0,0), new THREE.Vector3(0, 1.5, 0)), 10, 0.05, 8, false]} />
            <meshStandardMaterial color="black" />
        </mesh>
        <mesh position={[0, -0.6, 0]}>
            <tubeGeometry args={[new THREE.LineCurve3(new THREE.Vector3(0,0,0), new THREE.Vector3(0, -1.5, 0)), 10, 0.05, 8, false]} />
            <meshStandardMaterial color="black" />
        </mesh>
    </group>
);

// Animated Ions
const IonMigration = () => {
    const naIons = useMemo(() => new Array(15).fill(0), []);
    const clIons = useMemo(() => new Array(15).fill(0), []);
    const ref = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if(ref.current) {
            const t = clock.getElapsedTime();
            ref.current.children.forEach((mesh, i) => {
                const isSodium = i < 15;
                const xBase = isSodium ? -1 : 1;
                
                // Reset loop
                const cycle = (t * 0.5 + i * 0.1) % 1;
                
                mesh.position.x = (cycle * 3 - 1.5) * (isSodium ? 1 : -1);
                mesh.position.y = Math.sin(t * 2 + i) * 0.5 - 1; // Bobbing
                mesh.position.z = Math.cos(i) * 0.8;
                
                // Scale effect near electrode (Discharge)
                if(Math.abs(mesh.position.x) > 1.2) {
                    mesh.scale.setScalar(Math.max(0, 1 - (Math.abs(mesh.position.x) - 1.2) * 5));
                } else {
                    mesh.scale.setScalar(1);
                }
            })
        }
    })

    return (
        <group ref={ref}>
            {/* Sodium Ions (Purple) */}
            {naIons.map((_, i) => (
                <group key={`na-${i}`}>
                    <Sphere args={[0.1, 16, 16]}>
                        <meshStandardMaterial color="#a855f7" />
                    </Sphere>
                </group>
            ))}
            {/* Chlorine Ions (Green) */}
            {clIons.map((_, i) => (
                <group key={`cl-${i}`}>
                    <Sphere args={[0.12, 16, 16]}>
                        <meshStandardMaterial color="#22c55e" />
                    </Sphere>
                </group>
            ))}
        </group>
    )
}

// Reaction Products (Bubbles and Solids)
const Products = () => {
    const bubbles = useMemo(() => new Array(20).fill(0), []);
    const bubbleRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if(bubbleRef.current) {
            bubbleRef.current.children.forEach((b, i) => {
                const t = clock.getElapsedTime();
                b.position.y = -1 + ((t * 0.8 + i * 0.5) % 2.5); // Rise
                b.scale.setScalar(((t * 0.8 + i * 0.5) % 2.5) * 0.1); // Grow
            })
        }
    })

    return (
        <group>
            {/* Anode Bubbles (Cl2 Gas) - LEFT SIDE */}
            <group position={[-1.5, 0, 0]} ref={bubbleRef}>
                {bubbles.map((_, i) => (
                    <Sphere key={i} args={[0.1, 8, 8]} position={[Math.random()*0.3, 0, Math.random()*0.3]}>
                        <meshStandardMaterial color="#86efac" transparent opacity={0.6} />
                    </Sphere>
                ))}
            </group>

            {/* Cathode Deposit (Sodium Metal) - RIGHT SIDE */}
            <group position={[1.5, -1, 0]}>
                <Cylinder args={[0.25, 0.25, 1.5]} position={[0, 0.5, 0]}>
                    <meshStandardMaterial color="#94a3b8" roughness={0.8} />
                </Cylinder>
            </group>
        </group>
    )
}

export default function ElectrolyticCellPage() {
  return (
    <SimulationLayout
      title="Electrolytic Cell (Molten NaCl)"
      description="Electrical energy drives a non-spontaneous reaction. Cl⁻ ions migrate to the Anode (+) to form Chlorine gas. Na⁺ ions migrate to the Cathode (-) to form Sodium metal."
      cameraPosition={[0, 1, 9]} // Fix: Moved camera back to see everything
    >
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <group scale={0.85}> {/* Fix: Scaled down slightly to fit labels */}
          
          <Battery />
          <Tank />
          
          {/* Anode (Left, Positive) */}
          <Electrode position={[-1.5, 0, 0]} charge="+" label="Anode" />
          
          {/* Cathode (Right, Negative) */}
          <Electrode position={[1.5, 0, 0]} charge="-" label="Cathode" />

          <IonMigration />
          <Products />

          {/* Connectors */}
          <mesh position={[-1.5, 2, 0]} rotation={[0,0,Math.PI/2]}>
             <cylinderGeometry args={[0.03, 0.03, 1.6]} />
             <meshStandardMaterial color="black" />
          </mesh>
          <mesh position={[1.5, 2, 0]} rotation={[0,0,Math.PI/2]}>
             <cylinderGeometry args={[0.03, 0.03, 1.6]} />
             <meshStandardMaterial color="black" />
          </mesh>

          {/* Reaction Panels - Moved closer to center */}
          <Html position={[-3.0, 0, 0]} center>
             <div className="bg-slate-900/80 p-3 border border-red-500/50 rounded-xl w-40 backdrop-blur-md shadow-xl">
                <div className="text-red-400 font-bold text-sm mb-1">Oxidation (Anode)</div>
                <div className="text-slate-300 text-xs font-mono">
                    2Cl⁻ → Cl₂ + 2e⁻
                </div>
                <div className="text-green-300 text-[10px] mt-1 italic">(Chlorine Gas)</div>
             </div>
          </Html>

          <Html position={[3.0, 0, 0]} center>
             <div className="bg-slate-900/80 p-3 border border-blue-500/50 rounded-xl w-40 backdrop-blur-md shadow-xl">
                <div className="text-blue-400 font-bold text-sm mb-1">Reduction (Cathode)</div>
                <div className="text-slate-300 text-xs font-mono">
                    Na⁺ + e⁻ → Na
                </div>
                <div className="text-slate-400 text-[10px] mt-1 italic">(Sodium Metal)</div>
             </div>
          </Html>

          {/* Legend */}
          <Html position={[0, -2.8, 0]} center>
            <div className="flex gap-4 bg-black/60 p-2 rounded-full border border-slate-700 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]"></span>
                    <span className="text-xs text-white font-bold">Na⁺</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></span>
                    <span className="text-xs text-white font-bold">Cl⁻</span>
                </div>
            </div>
          </Html>

        </group>
      </Float>
    </SimulationLayout>
  );
}
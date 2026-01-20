'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Sphere, Float, Html, Text } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

// --- Types ---
type IonData = {
  id: string;
  name: string;
  formula: string;
  solutionColor: string;
  flameColor: string;
  flameName: string;
  desc: string;
};

// --- Data Source ---
const IONS: IonData[] = [
  { id: 'Cu', name: 'Copper (II)', formula: 'Cu²⁺', solutionColor: '#3b82f6', flameColor: '#22c55e', flameName: 'Bluish Green', desc: 'Blue solution. Green flame.' },
  { id: 'Fe2', name: 'Iron (II)', formula: 'Fe²⁺', solutionColor: '#86efac', flameColor: '#fbbf24', flameName: 'Gold Sparks', desc: 'Pale green solution.' },
  { id: 'Fe3', name: 'Iron (III)', formula: 'Fe³⁺', solutionColor: '#eab308', flameColor: '#fbbf24', flameName: 'Gold', desc: 'Yellow/Brown solution.' },
  { id: 'Co', name: 'Cobalt (II)', formula: 'Co²⁺', solutionColor: '#f472b6', flameColor: '#cbd5e1', flameName: 'None', desc: 'Pink solution.' },
  { id: 'Ni', name: 'Nickel (II)', formula: 'Ni²⁺', solutionColor: '#22c55e', flameColor: '#cbd5e1', flameName: 'None', desc: 'Bright green solution.' },
  { id: 'Ca', name: 'Calcium', formula: 'Ca²⁺', solutionColor: '#ffffff', flameColor: '#ef4444', flameName: 'Brick Red', desc: 'Colorless solution. Red flame.' },
  { id: 'Na', name: 'Sodium', formula: 'Na⁺', solutionColor: '#ffffff', flameColor: '#facc15', flameName: 'Golden Yellow', desc: 'Colorless solution. Yellow flame.' },
  { id: 'K', name: 'Potassium', formula: 'K⁺', solutionColor: '#ffffff', flameColor: '#c084fc', flameName: 'Lilac', desc: 'Colorless solution. Purple flame.' }
];

// --- 3D Components ---

const TestTube = ({ color }: { color: string }) => {
  // Bubbles Animation
  const bubbles = useMemo(() => new Array(8).fill(0), []);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((b, i) => {
        const t = clock.getElapsedTime() * 0.5 + i;
        b.position.y = -0.5 + (t % 1.2); // Rise up
        b.position.x = Math.sin(t * 2) * 0.1; // Wiggle
        b.scale.setScalar(0.05 + (b.position.y + 0.5) * 0.05); // Grow
      });
    }
  });

  return (
    <group>
      {/* Glass Tube (Simplified for visibility) */}
      <Cylinder args={[0.35, 0.35, 2.2, 32]} position={[0, 1, 0]}>
        <meshStandardMaterial 
          color="#d1d5db" 
          opacity={0.3} 
          transparent 
          roughness={0.1}
          metalness={0.1}
          side={THREE.DoubleSide} 
        />
      </Cylinder>
      
      {/* Liquid (With Emissive Glow) */}
      <Cylinder args={[0.3, 0.3, 1.8, 32]} position={[0, 0.9, 0]}>
        <meshStandardMaterial 
          color={color} 
          emissive={color}       // <--- Makes it glow
          emissiveIntensity={0.5} 
          transparent 
          opacity={color === '#ffffff' ? 0.2 : 0.9} 
        />
      </Cylinder>

      {/* Bubbles inside */}
      <group position={[0, 0.9, 0]} ref={groupRef}>
        {bubbles.map((_, i) => (
           <Sphere key={i} args={[0.1, 8, 8]} position={[Math.random()*0.4 - 0.2, -0.8, Math.random()*0.4 - 0.2]}>
             <meshStandardMaterial color="white" transparent opacity={0.4} />
           </Sphere>
        ))}
      </group>

      <Text position={[0, -0.5, 0]} fontSize={0.2} color="white">Aqueous Solution</Text>
    </group>
  );
};

const Flame = ({ color, label }: { color: string, label: string }) => (
  <group>
    <Cylinder args={[0.2, 0.3, 0.8]} position={[0, 0.4, 0]}>
      <meshStandardMaterial color="#333" />
    </Cylinder>
    
    <group position={[0, 1.2, 0]}>
       {/* Inner Core */}
       <Sphere args={[0.15, 16, 16]} position={[0, 0, 0]} scale={[1, 2, 1]}>
          <meshBasicMaterial color="white" transparent opacity={0.9} />
       </Sphere>
       {/* Flame Color */}
       <Sphere args={[0.25, 16, 16]} position={[0, 0.2, 0]} scale={[1, 2.5, 1]}>
          <meshBasicMaterial color={color} transparent opacity={0.8} />
       </Sphere>
       {/* Glow Halo */}
       <Sphere args={[0.4, 16, 16]} position={[0, 0.3, 0]} scale={[1, 2, 1]}>
          <meshBasicMaterial color={color} transparent opacity={0.2} />
       </Sphere>
    </group>

    <Text position={[0, -0.5, 0]} fontSize={0.2} color="white">Flame Test</Text>
    <Text position={[0, 2.2, 0]} fontSize={0.15} color={color}>{label}</Text>
  </group>
);

export default function ColorChangesPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeIon = IONS[selectedIdx];

  return (
    <SimulationLayout
      title="Qualitative Analysis: Colour Changes"
      description="Identify cations based on their characteristic colors in aqueous solution and their flame test colors."
    >
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.1}>
        <group position={[0, -0.5, 0]}>
          
          <group position={[-2, 0, 0]}>
            <TestTube color={activeIon.solutionColor} />
          </group>

          <group position={[2, 0, 0]}>
            <Flame color={activeIon.flameColor} label={activeIon.flameName} />
          </group>

          <Html position={[0, 2.5, 0]} center>
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-violet-500/50 backdrop-blur-md w-64 text-center shadow-2xl">
              <div className="text-3xl font-bold text-white mb-1">{activeIon.formula}</div>
              <div className="text-violet-400 font-bold text-lg mb-2">{activeIon.name}</div>
              <div className="text-slate-300 text-xs leading-relaxed">{activeIon.desc}</div>
            </div>
          </Html>

          <Html position={[0, -3, 0]} center>
            <div className="flex flex-wrap gap-2 justify-center w-[600px]">
              {IONS.map((ion, idx) => (
                <button
                  key={ion.id}
                  onClick={() => setSelectedIdx(idx)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    selectedIdx === idx 
                      ? 'bg-violet-600 text-white scale-110 shadow-lg' 
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {ion.formula}
                </button>
              ))}
            </div>
          </Html>

        </group>
      </Float>
    </SimulationLayout>
  );
}
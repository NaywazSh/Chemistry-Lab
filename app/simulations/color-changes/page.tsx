'use client';

import React, { useState } from 'react';
import { Cylinder, Sphere, Float, Html, Text } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

// --- Types ---
type IonData = {
  id: string;
  name: string;
  formula: string;
  solutionColor: string; // Hex code for liquid
  flameColor: string;    // Hex code for flame
  flameName: string;     // Text description
  desc: string;
};

// --- Data Source ---
const IONS: IonData[] = [
  { 
    id: 'Cu', name: 'Copper (II)', formula: 'Cu²⁺', 
    solutionColor: '#3b82f6', // Blue
    flameColor: '#22c55e',    // Green
    flameName: 'Bluish Green',
    desc: 'Blue solution due to d-d transitions. Characteristic green flame.' 
  },
  { 
    id: 'Fe2', name: 'Iron (II)', formula: 'Fe²⁺', 
    solutionColor: '#86efac', // Pale Green
    flameColor: '#fbbf24',    // Gold (sparks)
    flameName: 'Gold Sparks',
    desc: 'Pale green solution (Ferrous). Oxidizes easily to Fe³⁺.' 
  },
  { 
    id: 'Fe3', name: 'Iron (III)', formula: 'Fe³⁺', 
    solutionColor: '#eab308', // Yellow/Brown
    flameColor: '#fbbf24',    // Gold
    flameName: 'Gold',
    desc: 'Yellow/Brown solution (Ferric). Stable oxidation state.' 
  },
  { 
    id: 'Co', name: 'Cobalt (II)', formula: 'Co²⁺', 
    solutionColor: '#f472b6', // Pink
    flameColor: '#cbd5e1',    // No distinct flame
    flameName: 'None',
    desc: 'Pink solution in water. Turns blue in HCl.' 
  },
  { 
    id: 'Ni', name: 'Nickel (II)', formula: 'Ni²⁺', 
    solutionColor: '#22c55e', // Green
    flameColor: '#cbd5e1',    // No distinct flame
    flameName: 'None',
    desc: 'Bright green solution. Forms colored complexes.' 
  },
  { 
    id: 'Ca', name: 'Calcium', formula: 'Ca²⁺', 
    solutionColor: '#ffffff', // Colorless (White opacity)
    flameColor: '#ef4444',    // Brick Red
    flameName: 'Brick Red',
    desc: 'Colorless solution. Distinctive brick-red flame.' 
  },
  { 
    id: 'Na', name: 'Sodium', formula: 'Na⁺', 
    solutionColor: '#ffffff', // Colorless
    flameColor: '#facc15',    // Golden Yellow
    flameName: 'Golden Yellow',
    desc: 'Colorless solution. Very persistent golden yellow flame.' 
  },
  { 
    id: 'K', name: 'Potassium', formula: 'K⁺', 
    solutionColor: '#ffffff', // Colorless
    flameColor: '#c084fc',    // Lilac
    flameName: 'Lilac',
    desc: 'Colorless solution. Delicate lilac (purple) flame.' 
  }
];

// --- 3D Components ---

const TestTube = ({ color, active }: { color: string, active: boolean }) => (
  <group>
    {/* Glass Tube */}
    <Cylinder args={[0.3, 0.3, 2, 32]} position={[0, 1, 0]}>
      <meshPhysicalMaterial 
        color="white" 
        transmission={0.95} 
        opacity={0.3} 
        transparent 
        roughness={0} 
        thickness={0.2} 
      />
    </Cylinder>
    {/* Liquid */}
    <Cylinder args={[0.25, 0.25, 1.5, 32]} position={[0, 0.8, 0]}>
      <meshStandardMaterial 
        color={color} 
        transparent 
        opacity={color === '#ffffff' ? 0.1 : 0.8} 
      />
    </Cylinder>
    {/* Label */}
    <Text position={[0, -0.5, 0]} fontSize={0.2} color="white">Aqueous Solution</Text>
  </group>
);

const Flame = ({ color, label }: { color: string, label: string }) => (
  <group>
    {/* Burner Base */}
    <Cylinder args={[0.2, 0.3, 0.8]} position={[0, 0.4, 0]}>
      <meshStandardMaterial color="#333" />
    </Cylinder>
    
    {/* The Flame (Animated via Shader/Emissive usually, keeping simple here) */}
    <group position={[0, 1.2, 0]}>
       {/* Inner Core */}
       <Sphere args={[0.15, 16, 16]} position={[0, 0, 0]} scale={[1, 2, 1]}>
          <meshBasicMaterial color="white" transparent opacity={0.8} />
       </Sphere>
       {/* Outer Color */}
       <Sphere args={[0.25, 16, 16]} position={[0, 0.2, 0]} scale={[1, 2.5, 1]}>
          <meshBasicMaterial color={color} transparent opacity={0.6} />
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
      description="Identify cations based on their characteristic colors in aqueous solution and their flame test colors. Use the buttons below to switch between different ions."
    >
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.1}>
        <group position={[0, -0.5, 0]}>
          
          {/* Left: Solution View */}
          <group position={[-2, 0, 0]}>
            <TestTube color={activeIon.solutionColor} active={true} />
          </group>

          {/* Right: Flame View */}
          <group position={[2, 0, 0]}>
            <Flame color={activeIon.flameColor} label={activeIon.flameName} />
          </group>

          {/* Center Info Card */}
          <Html position={[0, 2.5, 0]} center>
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-violet-500/50 backdrop-blur-md w-64 text-center shadow-2xl">
              <div className="text-3xl font-bold text-white mb-1">{activeIon.formula}</div>
              <div className="text-violet-400 font-bold text-lg mb-2">{activeIon.name}</div>
              <div className="text-slate-300 text-xs leading-relaxed">{activeIon.desc}</div>
            </div>
          </Html>

          {/* Bottom Controls */}
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
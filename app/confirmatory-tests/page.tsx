'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Sphere, Html, Float, Text } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

// --- Types ---
type TestType = 'precipitate' | 'complex';

interface TestData {
  id: string;
  ionName: string;
  ionFormula: string;
  reagentName: string;
  productName: string;
  equation: string;
  startColor: string;
  endColor: string;
  type: TestType;
  desc: string;
}

// --- Data: The 4 Classic Confirmatory Tests ---
const TESTS: TestData[] = [
  {
    id: 'Pb',
    ionName: 'Lead (II)',
    ionFormula: 'Pb²⁺',
    reagentName: 'Potassium Iodide (KI)',
    productName: 'Lead Iodide (PbI₂)',
    equation: 'Pb²⁺ + 2I⁻ → PbI₂ ↓',
    startColor: '#ffffff', // Colorless
    endColor: '#facc15',   // Golden Yellow
    type: 'precipitate',
    desc: 'Golden Rain experiment. Formation of brilliant yellow precipitate.'
  },
  {
    id: 'Fe',
    ionName: 'Iron (III)',
    ionFormula: 'Fe³⁺',
    reagentName: 'Potassium Thiocyanate (KSCN)',
    productName: 'Ferric Thiocyanate [Fe(SCN)]²⁺',
    equation: 'Fe³⁺ + SCN⁻ → [Fe(SCN)]²⁺',
    startColor: '#fef08a', // Pale Yellow
    endColor: '#7f1d1d',   // Blood Red
    type: 'complex',
    desc: 'Formation of a deep blood-red coordination complex.'
  },
  {
    id: 'Ni',
    ionName: 'Nickel (II)',
    ionFormula: 'Ni²⁺',
    reagentName: 'Dimethylglyoxime (DMG)',
    productName: 'Ni-DMG Complex',
    equation: 'Ni²⁺ + 2DMG → Ni(DMG)₂ ↓',
    startColor: '#86efac', // Green
    endColor: '#ec4899',   // Rosy Red
    type: 'precipitate',
    desc: 'Formation of a beautiful bright rosy-red precipitate.'
  },
  {
    id: 'Cu',
    ionName: 'Copper (II)',
    ionFormula: 'Cu²⁺',
    reagentName: 'Excess Ammonia (NH₃)',
    productName: 'Schweizer\'s Reagent',
    equation: 'Cu²⁺ + 4NH₃ → [Cu(NH₃)₄]²⁺',
    startColor: '#93c5fd', // Light Blue
    endColor: '#1e3a8a',   // Deep Blue
    type: 'complex',
    desc: 'Transition from light blue precipitate to deep blue solution.'
  }
];

// --- Components ---

const PrecipitateParticles = ({ color, active }: { color: string, active: boolean }) => {
  const count = 40;
  const particles = useMemo(() => new Array(count).fill(0).map(() => ({
    x: (Math.random() - 0.5) * 0.5,
    y: (Math.random() - 0.5) * 1.5,
    z: (Math.random() - 0.5) * 0.5,
    speed: 0.005 + Math.random() * 0.01
  })), []);
  
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current && active) {
      groupRef.current.children.forEach((mesh, i) => {
        const p = particles[i];
        mesh.position.y -= p.speed;
        // Reset if falls to bottom
        if (mesh.position.y < -0.8) mesh.position.y = 0.8;
      });
    }
  });

  if (!active) return null;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {particles.map((p, i) => (
        <Sphere key={i} args={[0.03, 8, 8]} position={[p.x, p.y, p.z]}>
          <meshBasicMaterial color={color} />
        </Sphere>
      ))}
    </group>
  );
};

const TestTube = ({ data, reacted }: { data: TestData, reacted: boolean }) => {
  const liquidRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (liquidRef.current) {
      const targetColor = new THREE.Color(reacted ? data.endColor : data.startColor);
      const currentColor = (liquidRef.current.material as THREE.MeshStandardMaterial).color;
      // Smooth color transition
      currentColor.lerp(targetColor, 0.05);
    }
  });

  return (
    <group>
      {/* Glass Tube */}
      <Cylinder args={[0.4, 0.4, 2.5, 32]} position={[0, 0, 0]}>
        <meshPhysicalMaterial 
          color="white" 
          transmission={0.95} 
          opacity={0.2} 
          transparent 
          roughness={0.1} 
          thickness={0.1}
        />
      </Cylinder>
      
      {/* Liquid */}
      <Cylinder ref={liquidRef} args={[0.35, 0.35, 1.5, 32]} position={[0, -0.4, 0]}>
        <meshStandardMaterial 
          color={data.startColor} 
          transparent 
          opacity={reacted && data.type === 'precipitate' ? 0.9 : 0.6} 
        />
      </Cylinder>

      {/* Precipitate Effect (Only if reacted and is precipitate type) */}
      <PrecipitateParticles 
        color={data.endColor} 
        active={reacted && data.type === 'precipitate'} 
      />
    </group>
  );
};

const Dropper = ({ active, color }: { active: boolean, color: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  const dropRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (groupRef.current && active) {
      const t = clock.getElapsedTime();
      // Bobbing motion for hand effect
      groupRef.current.position.y = 1.8 + Math.sin(t * 3) * 0.05;
      
      // Drop falling animation
      if (dropRef.current) {
        const dropT = t % 1.5; // Loop every 1.5s
        if (dropT < 0.8) {
            dropRef.current.position.y = -0.5 - (dropT * 2); // Fall
            dropRef.current.scale.setScalar(1);
        } else {
            dropRef.current.scale.setScalar(0); // Hide after fall
        }
      }
    } else if (groupRef.current) {
       groupRef.current.position.y = 5; // Hide away when not active
    }
  });

  return (
    <group ref={groupRef} position={[0, 5, 0]}>
      {/* Dropper Body */}
      <Cylinder args={[0.05, 0.05, 0.8]} position={[0, 0, 0]}>
        <meshPhysicalMaterial color="white" transmission={0.8} opacity={0.5} transparent />
      </Cylinder>
      <Sphere args={[0.12, 16, 16]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#333" />
      </Sphere>
      
      {/* The Liquid Drop */}
      <Sphere ref={dropRef} args={[0.06, 16, 16]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color={color} />
      </Sphere>
    </group>
  );
};

export default function ConfirmatoryTestsPage() {
  const [activeTestIdx, setActiveTestIdx] = useState(0);
  const [isReacted, setIsReacted] = useState(false);
  
  const currentTest = TESTS[activeTestIdx];

  const handleTestChange = (idx: number) => {
    setIsReacted(false);
    setActiveTestIdx(idx);
  };

  return (
    <SimulationLayout
      title="Confirmatory Tests"
      description="Specific reagents react with ions to produce distinct colors or precipitates, confirming their presence in salt analysis."
    >
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.1}>
        <group position={[0, -0.5, 0]}>
          
          {/* Main Stage */}
          <TestTube data={currentTest} reacted={isReacted} />
          
          {/* Reagent Dropper */}
          <Dropper active={true} color={isReacted ? "white" : "#ccc"} />

          {/* Reaction Info Panel (Right) */}
          <Html position={[2.5, 0, 0]} center>
            <div className={`w-64 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-500 ${isReacted ? 'bg-slate-900/90 border-green-500/50' : 'bg-slate-900/60 border-slate-700'}`}>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Target Ion</div>
              <div className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                {currentTest.ionFormula} 
                <span className="text-sm font-normal text-slate-400">({currentTest.ionName})</span>
              </div>

              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reagent Added</div>
              <div className="text-md text-cyan-300 font-bold mb-4">{currentTest.reagentName}</div>

              {isReacted && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="h-px bg-slate-700 my-3" />
                    <div className="text-xs font-bold text-green-400 uppercase tracking-wider mb-1">Observation</div>
                    <div className="text-white font-bold mb-2">{currentTest.productName}</div>
                    <div className="text-xs bg-black/40 p-2 rounded font-mono text-slate-300 border border-slate-700">
                        {currentTest.equation}
                    </div>
                </div>
              )}
            </div>
          </Html>

          {/* Controls (Bottom) */}
          <Html position={[0, -3, 0]} center>
            <div className="flex flex-col items-center gap-4">
                
                {/* Action Button */}
                <button 
                    onClick={() => setIsReacted(!isReacted)}
                    className={`px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all ${
                        isReacted 
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                        : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:scale-105'
                    }`}
                >
                    {isReacted ? "Reset Test" : "Add Reagent"}
                </button>

                {/* Ion Selector */}
                <div className="flex gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-700">
                    {TESTS.map((test, idx) => (
                        <button
                            key={test.id}
                            onClick={() => handleTestChange(idx)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                activeTestIdx === idx 
                                ? 'bg-violet-600 text-white shadow-lg' 
                                : 'bg-transparent text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            {test.ionFormula}
                        </button>
                    ))}
                </div>
            </div>
          </Html>

        </group>
      </Float>
    </SimulationLayout>
  );
}
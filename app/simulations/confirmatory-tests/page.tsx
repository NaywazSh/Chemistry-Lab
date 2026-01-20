'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Sphere, Html, Float } from '@react-three/drei';
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

const TESTS: TestData[] = [
  {
    id: 'Pb',
    ionName: 'Lead (II)',
    ionFormula: 'Pb²⁺',
    reagentName: 'Potassium Iodide (KI)',
    productName: 'Lead Iodide (PbI₂)',
    equation: 'Pb²⁺ + 2I⁻ → PbI₂ ↓',
    startColor: '#ffffff',
    endColor: '#facc15', // Gold
    type: 'precipitate',
    desc: 'Golden Rain. Formation of yellow precipitate.'
  },
  {
    id: 'Fe',
    ionName: 'Iron (III)',
    ionFormula: 'Fe³⁺',
    reagentName: 'Potassium Thiocyanate (KSCN)',
    productName: 'Ferric Thiocyanate',
    equation: 'Fe³⁺ + SCN⁻ → [Fe(SCN)]²⁺',
    startColor: '#fef08a', // Pale Yellow
    endColor: '#991b1b',   // Deep Blood Red
    type: 'complex',
    desc: 'Deep blood-red soluble complex (No precipitate).'
  },
  {
    id: 'Ni',
    ionName: 'Nickel (II)',
    ionFormula: 'Ni²⁺',
    reagentName: 'Dimethylglyoxime (DMG)',
    productName: 'Ni-DMG Complex',
    equation: 'Ni²⁺ + 2DMG → Ni(DMG)₂ ↓',
    startColor: '#86efac',
    endColor: '#ec4899',   // Rosy Red
    type: 'precipitate',
    desc: 'Rosy-red precipitate formation.'
  },
  {
    id: 'Cu',
    ionName: 'Copper (II)',
    ionFormula: 'Cu²⁺',
    reagentName: 'Excess Ammonia (NH₃)',
    productName: 'Schweizer\'s Reagent',
    equation: 'Cu²⁺ + 4NH₃ → [Cu(NH₃)₄]²⁺',
    startColor: '#93c5fd',
    endColor: '#1e3a8a',   // Deep Blue
    type: 'complex',
    desc: 'Deep blue soluble complex (No precipitate).'
  }
];

// --- Components ---

// Solid particles for Precipitates (Pb, Ni)
const PrecipitateParticles = ({ color, active }: { color: string, active: boolean }) => {
  const count = 50;
  const particles = useMemo(() => new Array(count).fill(0).map(() => ({
    x: (Math.random() - 0.5) * 0.5,
    y: (Math.random() - 0.5) * 1.2,
    z: (Math.random() - 0.5) * 0.5,
    speed: 0.005 + Math.random() * 0.01,
    size: 0.02 + Math.random() * 0.03
  })), []);
  
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current && active) {
      groupRef.current.children.forEach((mesh, i) => {
        const p = particles[i];
        mesh.position.y -= p.speed;
        if (mesh.position.y < -0.6) mesh.position.y = 0.6; // Loop
        mesh.rotation.x += 0.01;
      });
    }
  });

  if (!active) return null;

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <Sphere key={i} args={[p.size, 8, 8]} position={[p.x, p.y, p.z]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </Sphere>
      ))}
    </group>
  );
};

// Bubbles for Complexes (Fe, Cu) - Visual feedback instead of precipitate
const MixingBubbles = ({ active }: { active: boolean }) => {
    const bubbles = useMemo(() => new Array(15).fill(0).map(() => ({
        x: (Math.random() - 0.5) * 0.4,
        y: -0.8,
        speed: 0.01 + Math.random() * 0.02
    })), []);
    
    const groupRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (groupRef.current && active) {
            groupRef.current.children.forEach((b, i) => {
                const data = bubbles[i];
                b.position.y += data.speed;
                if(b.position.y > 0.6) b.position.y = -0.8;
            });
        }
    });

    if(!active) return null;

    return (
        <group ref={groupRef}>
            {bubbles.map((b, i) => (
                <Sphere key={i} args={[0.02, 8, 8]} position={[b.x, b.y, 0]}>
                    <meshStandardMaterial color="white" transparent opacity={0.3} />
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
      const mat = liquidRef.current.material as THREE.MeshStandardMaterial;
      
      // Smoothly transition color AND glow
      mat.color.lerp(targetColor, 0.05);
      mat.emissive.lerp(targetColor, 0.05);
    }
  });

  return (
    <group>
      {/* Glass Tube - More transparent now */}
      <Cylinder args={[0.4, 0.4, 2.5, 32]} position={[0, 0, 0]}>
        <meshPhysicalMaterial 
          color="#e0f2fe" 
          transmission={0.95} 
          opacity={0.3} 
          transparent 
          roughness={0} 
          thickness={0.05}
          side={THREE.DoubleSide}
        />
      </Cylinder>
      
      {/* Liquid - Added Emissive so it glows in dark mode */}
      <Cylinder ref={liquidRef} args={[0.35, 0.35, 1.5, 32]} position={[0, -0.4, 0]}>
        <meshStandardMaterial 
          color={data.startColor}
          emissive={data.startColor} // <--- Makes it visible!
          emissiveIntensity={0.6}
          transparent 
          opacity={0.9} 
        />
      </Cylinder>

      {/* Show precipitate particles if it's that type */}
      <PrecipitateParticles 
        color={data.endColor} 
        active={reacted && data.type === 'precipitate'} 
      />

      {/* Show mixing bubbles if it's a complex (Fe/Cu) so it's not "empty" */}
      <MixingBubbles active={reacted && data.type === 'complex'} />
      
    </group>
  );
};

const Dropper = ({ active }: { active: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const dropRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Bobbing
      groupRef.current.position.y = active ? 1.8 + Math.sin(clock.getElapsedTime() * 2) * 0.05 : 5;
      
      // Drop animation
      if (dropRef.current && active) {
        const t = clock.getElapsedTime() % 1;
        dropRef.current.position.y = -0.5 - (t * 3); // Fall down
        dropRef.current.scale.setScalar(t > 0.5 ? 0 : 1); // Disappear halfway
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 5, 0]}>
      <Cylinder args={[0.05, 0.05, 0.8]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ccc" />
      </Cylinder>
      <Sphere args={[0.12, 16, 16]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#333" />
      </Sphere>
      <Sphere ref={dropRef} args={[0.08, 16, 16]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="white" />
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
      description="Specific reagents react with ions to produce distinct colors or precipitates. Note: Fe³⁺ and Cu²⁺ form soluble complexes (Solution changes color), while Pb²⁺ and Ni²⁺ form precipitates (Solid particles)."
    >
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.1}>
        <group position={[0, -0.5, 0]}>
          
          <TestTube data={currentTest} reacted={isReacted} />
          <Dropper active={true} />

          {/* Info Panel */}
          <Html position={[2.5, 0, 0]} center>
            <div className={`w-64 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-500 ${isReacted ? 'bg-slate-900/90 border-green-500/50' : 'bg-slate-900/60 border-slate-700'}`}>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Target Ion</div>
              <div className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                {currentTest.ionFormula} 
                <span className="text-sm font-normal text-slate-400">({currentTest.ionName})</span>
              </div>

              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Observation</div>
              {isReacted ? (
                  <div>
                    <div className="text-md text-white font-bold mb-1">{currentTest.productName}</div>
                    <div className={`text-xs px-2 py-1 rounded w-fit font-bold ${currentTest.type === 'precipitate' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {currentTest.type === 'precipitate' ? 'Solid Precipitate' : 'Soluble Complex'}
                    </div>
                  </div>
              ) : (
                  <div className="text-sm text-slate-500 italic">Add reagent to see result...</div>
              )}
            </div>
          </Html>

          {/* Controls */}
          <Html position={[0, -3, 0]} center>
            <div className="flex flex-col items-center gap-4">
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
'use client';

import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Box, Html, Float, Text } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

// --- Types & Data ---
type Mode = 'addition' | 'condensation';

// --- Components ---

// 1. ADDITION: Ethylene Monomer (C=C double bond)
const EthyleneMonomer = ({ position, consumed }: { position: THREE.Vector3, consumed: boolean }) => {
  if (consumed) return null; 
  return (
    <group position={position}>
      {/* Carbon Atoms */}
      <Sphere args={[0.3, 32, 32]} position={[-0.3, 0, 0]}><meshStandardMaterial color="#333" /></Sphere>
      <Sphere args={[0.3, 32, 32]} position={[0.3, 0, 0]}><meshStandardMaterial color="#333" /></Sphere>
      {/* Double Bond */}
      <Cylinder args={[0.05, 0.05, 0.6]} rotation={[0, 0, Math.PI/2]} position={[0, 0.15, 0]}><meshStandardMaterial color="#94a3b8" /></Cylinder>
      <Cylinder args={[0.05, 0.05, 0.6]} rotation={[0, 0, Math.PI/2]} position={[0, -0.15, 0]}><meshStandardMaterial color="#94a3b8" /></Cylinder>
      {/* Hydrogens */}
      <Sphere args={[0.15, 16, 16]} position={[-0.6, 0.4, 0]}><meshStandardMaterial color="white" /></Sphere>
      <Sphere args={[0.15, 16, 16]} position={[-0.6, -0.4, 0]}><meshStandardMaterial color="white" /></Sphere>
      <Sphere args={[0.15, 16, 16]} position={[0.6, 0.4, 0]}><meshStandardMaterial color="white" /></Sphere>
      <Sphere args={[0.15, 16, 16]} position={[0.6, -0.4, 0]}><meshStandardMaterial color="white" /></Sphere>
    </group>
  );
};

// The Growing Polymer Chain (Addition)
const AdditionChain = ({ count }: { count: number }) => {
  const chainRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if(chainRef.current) {
        chainRef.current.position.x = Math.sin(clock.getElapsedTime()) * 0.5;
        chainRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  return (
    <group ref={chainRef}>
        {Array.from({ length: count }).map((_, i) => (
            <group key={i} position={[(-count/2 * 0.8) + (i * 0.8), 0, 0]}>
                <Sphere args={[0.35, 32, 32]}><meshStandardMaterial color="#22c55e" /></Sphere>
                {i < count - 1 && (
                    <Cylinder args={[0.1, 0.1, 0.8]} rotation={[0,0,Math.PI/2]} position={[0.4, 0, 0]}><meshStandardMaterial color="white" /></Cylinder>
                )}
            </group>
        ))}
        {/* Radical Tip */}
        <group position={[(-count/2 * 0.8) + (count * 0.8), 0, 0]}>
            <Sphere args={[0.15, 32, 32]} position={[0, 0.4, 0]}>
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
            </Sphere>
            <Text position={[0, 0.8, 0]} fontSize={0.2} color="#ef4444">Radical •</Text>
        </group>
    </group>
  );
};

// 2. CONDENSATION: Monomers
const MonomerA = ({ position, active }: { position: [number, number, number], active: boolean }) => (
    <group position={position}>
        <Box args={[0.6, 0.6, 0.6]}>
            <meshStandardMaterial color="#3b82f6" />
        </Box>
        <Sphere args={[0.15, 16, 16]} position={[0.3, 0, 0]}>
            <meshStandardMaterial color="white" />
        </Sphere>
        {!active && <Text position={[0, 0.5, 0]} fontSize={0.2} color="#3b82f6">H-N-H</Text>}
    </group>
);

const MonomerB = ({ position, active }: { position: [number, number, number], active: boolean }) => (
    <group position={position}>
        <Box args={[0.6, 0.6, 0.6]}>
            <meshStandardMaterial color="#eab308" />
        </Box>
        <Sphere args={[0.15, 16, 16]} position={[-0.3, 0, 0]}>
            <meshStandardMaterial color="#ef4444" />
        </Sphere>
        {!active && <Text position={[0, 0.5, 0]} fontSize={0.2} color="#eab308">HO-C=O</Text>}
    </group>
);

// Water Molecule Ejection
const WaterMolecule = ({ startPos }: { startPos: [number, number, number] }) => {
    const ref = useRef<THREE.Group>(null);
    useFrame(() => {
        if (ref.current) {
            ref.current.position.y += 0.03; 
            ref.current.rotation.z += 0.05;
            ref.current.scale.multiplyScalar(0.98); 
        }
    });
    return (
        <group ref={ref} position={startPos}>
            <Sphere args={[0.15, 16, 16]}>
                <meshStandardMaterial color="#ef4444" />
            </Sphere>
            <Sphere args={[0.1, 16, 16]} position={[-0.15, -0.1, 0]}><meshStandardMaterial color="white" /></Sphere>
            <Sphere args={[0.1, 16, 16]} position={[0.15, -0.1, 0]}><meshStandardMaterial color="white" /></Sphere>
        </group>
    );
};

export default function PolymerizationPage() {
  const [mode, setMode] = useState<Mode>('addition');
  const [step, setStep] = useState(0); 

  React.useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 6);
    }, 1500);
    return () => clearInterval(timer);
  }, [mode]);

  return (
    <SimulationLayout
      title="Polymerization Mechanisms"
      description="Comparing Chain-Growth (Addition) where double bonds open up, versus Step-Growth (Condensation) where small molecules like water are eliminated."
    >
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.1}>
        <group position={[0, -0.5, 0]}>

          {mode === 'addition' && (
            <group>
                {[...Array(6)].map((_, i) => (
                    <EthyleneMonomer 
                        key={i} 
                        position={new THREE.Vector3((i-3)*1.5, Math.sin(i)*1.5, -2)} 
                        consumed={i < step} 
                    />
                ))}
                
                <AdditionChain count={step + 1} />

                <Html position={[0, -2.5, 0]} center>
                    <div className="bg-slate-900/80 p-4 rounded-xl border border-green-500/50 backdrop-blur-md w-64">
                        <h3 className="text-green-400 font-bold mb-1">Addition Polymerization</h3>
                        <p className="text-white text-xs mb-2">n(CH₂=CH₂) → [-CH₂-CH₂-]n</p>
                        <ul className="text-slate-300 text-xs list-disc pl-4 text-left">
                            <li>No byproduct</li>
                            <li>Requires Initiator</li>
                            <li>Ex: Polythene, PVC</li>
                        </ul>
                    </div>
                </Html>
            </group>
          )}

          {mode === 'condensation' && (
            <group>
                {[0, 1, 2].map((i) => {
                    const isJoined = step > i;
                    const offset = isJoined ? 0 : 0.8;
                    
                    return (
                        <group key={i} position={[(i-1)*2.5, 0, 0]}>
                            <group position={[-0.3 - offset, 0, 0]}>
                                <MonomerA position={[0,0,0]} active={true} />
                            </group>
                            <group position={[0.3 + offset, 0, 0]}>
                                <MonomerB position={[0,0,0]} active={true} />
                            </group>
                            {isJoined && (
                                <Cylinder args={[0.1, 0.1, 0.6]} rotation={[0,0,Math.PI/2]}><meshStandardMaterial color="white" /></Cylinder>
                            )}
                            {isJoined && (
                                <WaterMolecule startPos={[0, 0.5, 0]} />
                            )}
                        </group>
                    )
                })}

                {step >= 3 && (
                    <Cylinder args={[0.05, 0.05, 6]} rotation={[0,0,Math.PI/2]} position={[0,0,0]}>
                        {/* FIX: Moved opacity/transparent to material */}
                        <meshStandardMaterial color="white" opacity={0.5} transparent />
                    </Cylinder>
                )}

                <Html position={[0, -2.5, 0]} center>
                    <div className="bg-slate-900/80 p-4 rounded-xl border border-blue-500/50 backdrop-blur-md w-64">
                        <h3 className="text-blue-400 font-bold mb-1">Condensation Polymerization</h3>
                        <p className="text-white text-xs mb-2">Monomer A + B → Polymer + H₂O</p>
                        <ul className="text-slate-300 text-xs list-disc pl-4 text-left">
                            <li>Water eliminated</li>
                            <li>Step-wise growth</li>
                            <li>Ex: Nylon, Polyester</li>
                        </ul>
                    </div>
                </Html>
            </group>
          )}

          <Html position={[0, 3, 0]} center>
            <div className="flex gap-4 bg-black/60 p-2 rounded-full backdrop-blur-md border border-slate-700">
                <button 
                    onClick={() => { setMode('addition'); setStep(0); }}
                    className={`px-6 py-2 rounded-full font-bold transition-all ${mode === 'addition' ? 'bg-green-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                    Addition
                </button>
                <button 
                    onClick={() => { setMode('condensation'); setStep(0); }}
                    className={`px-6 py-2 rounded-full font-bold transition-all ${mode === 'condensation' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                    Condensation
                </button>
            </div>
          </Html>

        </group>
      </Float>
    </SimulationLayout>
  );
}
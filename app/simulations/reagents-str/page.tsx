'use client';

import React, { useState } from 'react';
import { Sphere, Cylinder, Html, Float } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';

// Grignard Model (R-Mg-X)
const Grignard = () => (
    <group rotation={[0, 0, Math.PI/2]}>
        {/* Mg - Magnesium (Orange) */}
        <Sphere args={[0.4, 32, 32]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#d97706" />
        </Sphere> 
        
        {/* Bonds (Grey) */}
        <Cylinder args={[0.1, 0.1, 1]} position={[0, 0.8, 0]}>
            <meshStandardMaterial color="gray" />
        </Cylinder>
        <Cylinder args={[0.1, 0.1, 1]} position={[0, -0.8, 0]}>
            <meshStandardMaterial color="gray" />
        </Cylinder>

        {/* Br - Bromine (Dark Red) */}
        <Sphere args={[0.35, 32, 32]} position={[0, 1.4, 0]}>
            <meshStandardMaterial color="#7f1d1d" />
        </Sphere> 

        {/* R - Carbon Group (Black) */}
        <Sphere args={[0.3, 32, 32]} position={[0, -1.4, 0]}>
            <meshStandardMaterial color="#333" />
        </Sphere> 

        <Html position={[0, -2, 0]} center>
            <div className="bg-black/50 text-amber-400 p-2 rounded backdrop-blur-md whitespace-nowrap text-sm font-bold">R-Mg-X</div>
        </Html>
    </group>
);

// Tollens Model (Ag(NH3)2+)
const Tollens = () => (
    <group>
        {/* Ag - Silver (Metallic) */}
        <Sphere args={[0.5, 32, 32]}>
            <meshStandardMaterial color="#94a3b8" metalness={1} roughness={0.2} />
        </Sphere> 

        {/* NH3 Group 1 */}
        <group position={[1.2, 0, 0]}>
            <Sphere args={[0.3, 32, 32]}>
                <meshStandardMaterial color="#3b82f6" />
            </Sphere>
            <Html position={[0, 0.5, 0]} center>
                <div className="text-white text-xs font-bold drop-shadow-md">NH₃</div>
            </Html>
        </group>

        {/* NH3 Group 2 */}
        <group position={[-1.2, 0, 0]}>
            <Sphere args={[0.3, 32, 32]}>
                <meshStandardMaterial color="#3b82f6" />
            </Sphere>
            <Html position={[0, 0.5, 0]} center>
                <div className="text-white text-xs font-bold drop-shadow-md">NH₃</div>
            </Html>
        </group>

        <Html position={[0, -1.5, 0]} center>
            <div className="bg-black/50 text-slate-300 p-2 rounded backdrop-blur-md whitespace-nowrap text-sm font-bold">[Ag(NH₃)₂]⁺</div>
        </Html>
    </group>
);

export default function ReagentsPage() {
  const [active, setActive] = useState(0);
  const reagents = [
      { name: "Grignard Reagent", desc: "Organomagnesium halide used for forming C-C bonds.", Component: Grignard },
      { name: "Tollens' Reagent", desc: "Ammoniacal Silver Nitrate. Oxidizes aldehydes to acids (Silver Mirror Test).", Component: Tollens },
  ];

  return (
    <SimulationLayout
      title={reagents[active].name}
      description={reagents[active].desc}
    >
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {active === 0 ? <Grignard /> : <Tollens />}
      </Float>

      {/* 
         FIX IS HERE: 
         Wrapped the UI in the <Html> tag. 
         This puts it "inside" the 3D world but renders it as normal HTML buttons.
      */}
      <Html position={[0, -3, 0]} center zIndexRange={[100, 0]}>
          <div className="flex gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-700 backdrop-blur-md shadow-2xl w-max">
              <button 
                onClick={() => setActive(0)} 
                className={`px-4 py-2 rounded-lg transition-colors font-bold ${active===0 ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                Grignard
              </button>
              <button 
                onClick={() => setActive(1)} 
                className={`px-4 py-2 rounded-lg transition-colors font-bold ${active===1 ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                Tollens
              </button>
          </div>
      </Html>
    </SimulationLayout>
  );
}
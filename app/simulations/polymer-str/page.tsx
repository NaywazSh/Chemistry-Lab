'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Sphere, Cylinder, Box, Html, Float, Line, Ring, Plane, Torus
} from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

// --- Types ---
// Defined strictly to prevent "Any" errors
type PolymerType = 'pvc' | 'teflon' | 'nylon';
type ApplicationView = 'molecular' | 'application' | 'comparison';
type PropertyHighlight = 'strength' | 'flexibility' | 'chemical_resistance' | 'thermal';

interface PolymerInfo {
  name: string;
  formula: string;
  keyProperties: string[];
  applications: string[];
  color: string;
  molecularWeight: string;
  discovery: string;
}

// --- Color Scheme ---
const MATERIAL_COLORS = {
  pvc: { carbon: '#333333', hydrogen: '#FFFFFF', chlorine: '#34D399', bond: '#CCCCCC' },
  teflon: { carbon: '#333333', fluorine: '#FBBF24', bond: '#CCCCCC' },
  nylon: { carbon: '#333333', hydrogen: '#FFFFFF', oxygen: '#EF4444', nitrogen: '#3B82F6', bond: '#CCCCCC' }
};

// --- DATA SOURCE ---
// Using "polymerData" (lowercase) consistently
const polymerData: Record<PolymerType, PolymerInfo> = {
  pvc: {
    name: 'Polyvinyl Chloride (PVC)',
    formula: '[-CH₂-CHCl-]n',
    keyProperties: ['Rigid', 'Chemical Resistant', 'Flame Retardant'],
    applications: ['Pipes', 'Electrical Insulation', 'Window Frames'],
    color: '#10B981',
    molecularWeight: '56k-110k g/mol',
    discovery: '1913 by Fritz Klatte'
  },
  teflon: {
    name: 'Polytetrafluoroethylene (Teflon)',
    formula: '[-CF₂-CF₂-]n',
    keyProperties: ['Non-stick', 'Chemically Inert', 'Heat Resistant'],
    applications: ['Cookware', 'Lab Equipment', 'Waterproof Fabrics'],
    color: '#F59E0B',
    molecularWeight: '100k-10m g/mol',
    discovery: '1938 by Roy Plunkett'
  },
  nylon: {
    name: 'Nylon 6,6',
    formula: '[-NH-(CH₂)₆-NH-CO-(CH₂)₄-CO-]n',
    keyProperties: ['High Strength', 'Elastic', 'Abrasion Resistant'],
    applications: ['Textiles', 'Ropes', 'Carpets', 'Parachutes'],
    color: '#8B5CF6',
    molecularWeight: '12k-20k g/mol',
    discovery: '1935 by Wallace Carothers'
  }
};

// --- 3D COMPONENTS ---

const PVCRepeatingUnit = ({ position = [0, 0, 0], scale = 1, animated = false }: any) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current && animated) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.2;
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 1.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <Sphere args={[0.25, 16, 16]} position={[-0.4, 0, 0]}><meshStandardMaterial color={MATERIAL_COLORS.pvc.carbon} /></Sphere>
      <Sphere args={[0.25, 16, 16]} position={[0.4, 0, 0]}><meshStandardMaterial color={MATERIAL_COLORS.pvc.carbon} /></Sphere>
      <Sphere args={[0.3, 16, 16]} position={[-0.4, 0.6, 0]}><meshStandardMaterial color={MATERIAL_COLORS.pvc.chlorine} /></Sphere>
      <Sphere args={[0.15, 16, 16]} position={[-0.4, -0.6, 0]}><meshStandardMaterial color={MATERIAL_COLORS.pvc.hydrogen} /></Sphere>
      <Sphere args={[0.15, 16, 16]} position={[0.4, 0.6, 0]}><meshStandardMaterial color={MATERIAL_COLORS.pvc.hydrogen} /></Sphere>
      <Sphere args={[0.15, 16, 16]} position={[0.4, -0.6, 0]}><meshStandardMaterial color={MATERIAL_COLORS.pvc.hydrogen} /></Sphere>
      <Cylinder args={[0.05, 0.05, 0.8]} rotation={[0, 0, Math.PI/2]}><meshStandardMaterial color={MATERIAL_COLORS.pvc.bond} /></Cylinder>
      <Cylinder args={[0.05, 0.05, 0.6]} position={[-0.4, 0.3, 0]}><meshStandardMaterial color={MATERIAL_COLORS.pvc.bond} /></Cylinder>
      <Html position={[-0.4, 0.9, 0]} center><div className="bg-green-900/80 px-1 rounded text-xs text-green-300 font-bold">Cl</div></Html>
    </group>
  );
};

const TeflonRepeatingUnit = ({ position = [0, 0, 0], scale = 1, animated = false }: any) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current && animated) groupRef.current.rotation.y = clock.getElapsedTime() * 0.3;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <Sphere args={[0.25, 16, 16]} position={[-0.5, 0, 0]}><meshStandardMaterial color={MATERIAL_COLORS.teflon.carbon} /></Sphere>
      <Sphere args={[0.25, 16, 16]} position={[0.5, 0, 0]}><meshStandardMaterial color={MATERIAL_COLORS.teflon.carbon} /></Sphere>
      <Sphere args={[0.22, 16, 16]} position={[-0.5, 0.6, 0]}><meshStandardMaterial color={MATERIAL_COLORS.teflon.fluorine} /></Sphere>
      <Sphere args={[0.22, 16, 16]} position={[-0.5, -0.6, 0]}><meshStandardMaterial color={MATERIAL_COLORS.teflon.fluorine} /></Sphere>
      <Sphere args={[0.22, 16, 16]} position={[0.5, 0.6, 0]}><meshStandardMaterial color={MATERIAL_COLORS.teflon.fluorine} /></Sphere>
      <Sphere args={[0.22, 16, 16]} position={[0.5, -0.6, 0]}><meshStandardMaterial color={MATERIAL_COLORS.teflon.fluorine} /></Sphere>
      <Cylinder args={[0.05, 0.05, 1]} rotation={[0, 0, Math.PI/2]}><meshStandardMaterial color={MATERIAL_COLORS.teflon.bond} /></Cylinder>
      <Html position={[0, 0.9, 0]} center><div className="bg-amber-900/80 px-1 rounded text-xs text-amber-300 font-bold">F-Sheath</div></Html>
    </group>
  );
};

const NylonRepeatingUnit = ({ position = [0, 0, 0], scale = 1, animated = false }: any) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current && animated) groupRef.current.rotation.y = clock.getElapsedTime() * 0.25;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <Sphere args={[0.3, 16, 16]} position={[0, 0, 0]}><meshStandardMaterial color={MATERIAL_COLORS.nylon.nitrogen} /></Sphere>
      <Sphere args={[0.15, 16, 16]} position={[0, 0.4, 0]}><meshStandardMaterial color="white" /></Sphere>
      <Sphere args={[0.3, 16, 16]} position={[0.8, 0, 0]}><meshStandardMaterial color={MATERIAL_COLORS.nylon.carbon} /></Sphere>
      <Sphere args={[0.25, 16, 16]} position={[0.8, 0.5, 0]}><meshStandardMaterial color={MATERIAL_COLORS.nylon.oxygen} /></Sphere>
      <Cylinder args={[0.08, 0.08, 0.8]} position={[0.4, 0, 0]} rotation={[0,0,Math.PI/2]}><meshStandardMaterial color="#ccc" /></Cylinder>
      <Html position={[0.4, -0.5, 0]} center><div className="bg-purple-900/80 px-1 rounded text-xs text-purple-300 font-bold">Amide</div></Html>
    </group>
  );
};

const PVCApplication = () => (
    <group>
        <Cylinder args={[1.5, 1.5, 6, 32]} rotation={[Math.PI/2, 0, 0]}>
            <meshStandardMaterial color="#10B981" roughness={0.2} metalness={0.1} transparent opacity={0.9} />
        </Cylinder>
        <Cylinder args={[1.3, 1.3, 6.1, 32]} rotation={[Math.PI/2, 0, 0]}>
            <meshStandardMaterial color="#064E3B" side={THREE.BackSide} />
        </Cylinder>
        <Html position={[0, 2, 0]} center>
            <div className="bg-emerald-900/80 p-2 rounded border border-emerald-500 text-white text-sm">Industrial Pipe</div>
        </Html>
    </group>
);

const TeflonApplication = () => (
    <group>
        <Cylinder args={[2, 1.8, 0.5, 32]}>
            <meshStandardMaterial color="#333" />
        </Cylinder>
        <Cylinder args={[1.7, 1.5, 0.52, 32]}>
            <meshStandardMaterial color="#F59E0B" roughness={0.1} metalness={0.2} />
        </Cylinder>
        <Html position={[0, 1.5, 0]} center>
            <div className="bg-amber-900/80 p-2 rounded border border-amber-500 text-white text-sm">Non-Stick Coating</div>
        </Html>
    </group>
);

const NylonApplication = () => (
    <group>
        {Array.from({ length: 15 }).map((_, i) => (
            <Cylinder 
                key={i} args={[0.05, 0.05, 6]} 
                position={[(Math.random()-0.5)*1, (Math.random()-0.5)*1, 0]} 
                rotation={[Math.PI/2, 0, 0]}
            >
                <meshStandardMaterial color="#8B5CF6" />
            </Cylinder>
        ))}
        <Torus args={[0.6, 0.1, 16, 32]} rotation={[0, Math.PI/2, 0]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#6D28D9" />
        </Torus>
        <Html position={[0, 2, 0]} center>
            <div className="bg-purple-900/80 p-2 rounded border border-purple-500 text-white text-sm">Synthetic Fiber</div>
        </Html>
    </group>
);

export default function PolymerApplicationsPage() {
  const [selectedPolymer, setSelectedPolymer] = useState<PolymerType>('pvc');
  const [viewMode, setViewMode] = useState<ApplicationView>('application');
  const [showDetails, setShowDetails] = useState(true);

  return (
    <SimulationLayout
      title="Polymer Applications"
      description="Explore how molecular structure determines industrial application. Compare PVC, Teflon, and Nylon."
    >
      <Float speed={0.5} rotationIntensity={0.2} floatIntensity={0.2}>
        <group position={[0, 0, 0]}>
          
          {selectedPolymer === 'pvc' && viewMode === 'molecular' && <PVCRepeatingUnit scale={1.5} animated={true} />}
          {selectedPolymer === 'pvc' && viewMode === 'application' && <PVCApplication />}
          
          {selectedPolymer === 'teflon' && viewMode === 'molecular' && <TeflonRepeatingUnit scale={1.5} animated={true} />}
          {selectedPolymer === 'teflon' && viewMode === 'application' && <TeflonApplication />}
          
          {selectedPolymer === 'nylon' && viewMode === 'molecular' && <NylonRepeatingUnit scale={1.5} animated={true} />}
          {selectedPolymer === 'nylon' && viewMode === 'application' && <NylonApplication />}

          <Html position={[0, -3.5, 0]} center>
            <div className="flex flex-col gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-700 backdrop-blur-md w-[500px]">
                
                <div className="flex justify-center gap-2 mb-2">
                    <button onClick={() => setViewMode('molecular')} className={`px-4 py-1 rounded text-sm ${viewMode === 'molecular' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-400'}`}>Molecular</button>
                    <button onClick={() => setViewMode('application')} className={`px-4 py-1 rounded text-sm ${viewMode === 'application' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-400'}`}>Application</button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(polymerData) as PolymerType[]).map((key) => (
                        <button
                            key={key}
                            onClick={() => setSelectedPolymer(key)}
                            className={`py-2 rounded-lg font-bold text-sm transition-all ${selectedPolymer === key ? 'text-black' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                            style={selectedPolymer === key ? { backgroundColor: polymerData[key].color } : {}}
                        >
                            {polymerData[key].name.split(' ')[0]}
                        </button>
                    ))}
                </div>

                {showDetails && (
                    <div className="mt-2 pt-2 border-t border-slate-700 text-left">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Formula: <span className="text-white font-mono">{polymerData[selectedPolymer].formula}</span></span>
                            <span>Weight: {polymerData[selectedPolymer].molecularWeight}</span>
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {polymerData[selectedPolymer].keyProperties.map(prop => (
                                <span key={prop} className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-600">{prop}</span>
                            ))}
                        </div>
                        <div className="mt-2 text-xs text-slate-400">
                            Applications: {polymerData[selectedPolymer].applications.join(', ')}
                        </div>
                    </div>
                )}
            </div>
          </Html>

        </group>
      </Float>
    </SimulationLayout>
  );
}
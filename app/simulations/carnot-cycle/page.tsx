'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Sphere, Cylinder, Box, Html, Float, Line, Text, Plane,
  Tube, Ring, Cone
} from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

// --- Types ---
type ProcessType = 'isothermal-expansion' | 'adiabatic-expansion' | 'isothermal-compression' | 'adiabatic-compression';
type DiagramType = 'pv' | 'ts' | 'combined';

// --- Constants ---
const PROCESS_COLORS = {
  'isothermal-expansion': '#ef4444',      // Red
  'adiabatic-expansion': '#f59e0b',       // Yellow
  'isothermal-compression': '#3b82f6',    // Blue
  'adiabatic-compression': '#10b981'      // Green
};

const GAS_CONSTANT = 8.314; // J/(mol·K)

// --- Components ---

function GasParticle({ 
  position, 
  velocity, 
  color,
  size = 0.1
}: { 
  position: [number, number, number];
  velocity: [number, number, number];
  color: string;
  size?: number;
}) {
  const particleRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (particleRef.current) {
      const time = clock.getElapsedTime();
      particleRef.current.position.x = position[0] + Math.sin(time * velocity[0]) * 0.2;
      particleRef.current.position.y = position[1] + Math.cos(time * velocity[1]) * 0.2;
      particleRef.current.position.z = position[2] + Math.sin(time * velocity[2]) * 0.2;
    }
  });

  return (
    <Sphere ref={particleRef} args={[size, 16, 16]} position={position}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </Sphere>
  );
}

function PistonCylinder({
  pressure,
  volume,
  temperature,
  process,
  position = [0, 0, 0],
  scale = 1
}: {
  pressure: number;
  volume: number;
  temperature: number;
  process: ProcessType;
  position?: [number, number, number];
  scale?: number;
}) {
  const pistonRef = useRef<THREE.Group>(null);
  const pistonHeight = Math.max(0.5, volume * 0.5);
  
  useFrame(({ clock }) => {
    if (pistonRef.current) {
      const time = clock.getElapsedTime();
      const oscillation = process.includes('expansion') 
        ? Math.sin(time * 0.5) * 0.1 
        : -Math.sin(time * 0.5) * 0.1;
      pistonRef.current.position.y = oscillation;
    }
  });

  const processColor = PROCESS_COLORS[process];
  
  return (
    <group position={position} scale={scale}>
      {/* Cylinder */}
      <Cylinder args={[1.2, 1.2, 3, 32]} position={[0, 0, 0]}>
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.8}
          opacity={0.3}
          transparent
          roughness={0.1}
          thickness={0.2}
          side={THREE.DoubleSide}
        />
      </Cylinder>
      
      {/* Gas */}
      <Cylinder args={[1, 1, pistonHeight, 32]} position={[0, (pistonHeight - 3)/2, 0]}>
        <meshStandardMaterial color={processColor} transparent opacity={0.4} />
      </Cylinder>
      
      {/* Piston Head */}
      <group ref={pistonRef} position={[0, pistonHeight/2 - 0.5, 0]}>
        <Cylinder args={[1.1, 1.1, 0.2, 32]}>
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
        </Cylinder>
        <Cylinder args={[0.15, 0.15, 1, 16]} position={[0, 0.6, 0]}>
          <meshStandardMaterial color="#475569" />
        </Cylinder>
      </group>
      
      {/* Particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <GasParticle
          key={i}
          position={[
            -0.8 + Math.random() * 1.6,
            -1 + Math.random() * pistonHeight,
            -0.8 + Math.random() * 1.6
          ]}
          velocity={[Math.random() * 2, Math.random() * 2, Math.random() * 2]}
          color={processColor}
          size={0.08 + Math.random() * 0.04}
        />
      ))}

      {/* Floating 3D Label attached to the machine */}
      <Html position={[0, -2, 0]} center>
         <div className="text-xs font-mono text-slate-400 bg-black/50 px-2 rounded">
            P: {pressure.toFixed(0)} | V: {volume.toFixed(2)} | T: {temperature.toFixed(0)}
         </div>
      </Html>
    </group>
  );
}

function DiagramCurve({
  type, 
  process,
  points,
  color,
  showArea = false
}: {
  type: 'pv' | 'ts';
  process: ProcessType;
  points: THREE.Vector3[];
  color: string;
  showArea?: boolean;
}) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);

  return (
    <group>
      <Tube args={[curve, 64, 0.05, 8, false]}>
        <meshStandardMaterial color={color} />
      </Tube>
      
      {/* Arrows */}
      {points.length > 1 && (
        <group>
          {[0.5].map((t) => {
            const point = curve.getPoint(t);
            const tangent = curve.getTangent(t);
            const quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
            return (
              <Cone key={t} args={[0.1, 0.3, 16]} position={point} quaternion={quaternion}>
                <meshStandardMaterial color={color} />
              </Cone>
            );
          })}
        </group>
      )}
      
      {/* Area Shading */}
      {showArea && type === 'pv' && points.length >= 2 && (
        <mesh>
          <shapeGeometry args={[new THREE.Shape(points.map(p => new THREE.Vector2(p.x, p.y)))]} />
          <meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function CarnotCycleDiagram({
  type = 'pv',
  position = [0, 0, 0],
  scale = 1
}: {
  type?: DiagramType;
  position?: [number, number, number];
  scale?: number;
  showWork?: boolean;
  showHeat?: boolean;
}) {
  const [Th, setTh] = useState(500);
  const [Tc, setTc] = useState(300);
  const V1 = 1.0;
  const gamma = 1.4;
  
  const cycleData = useMemo(() => {
    const R = GAS_CONSTANT;
    const n = 1;
    
    const P1 = (n * R * Th) / V1;
    const S1 = n * R * Math.log(V1);
    
    const V2 = V1 * 2;
    const P2 = (n * R * Th) / V2;
    const S2 = n * R * Math.log(V2);
    
    const V3 = V2 * Math.pow(Th / Tc, 1 / (gamma - 1));
    const P3 = (n * R * Tc) / V3;
    const S3 = S2;
    
    const V4 = V1 * Math.pow(Tc / Th, 1 / (gamma - 1));
    const P4 = (n * R * Tc) / V4;
    const S4 = n * R * Math.log(V4);
    
    const Qh = n * R * Th * Math.log(V2 / V1);
    const Qc = n * R * Tc * Math.log(V3 / V4);
    const W = Qh - Qc;
    const efficiency = 1 - (Tc / Th);
    
    return {
      points: {
        pv: [
          new THREE.Vector3(V1, P1/1000, 0),
          new THREE.Vector3(V2, P2/1000, 0),
          new THREE.Vector3(V3, P3/1000, 0),
          new THREE.Vector3(V4, P4/1000, 0),
          new THREE.Vector3(V1, P1/1000, 0),
        ],
        ts: [
          new THREE.Vector3(S1, Th, 0),
          new THREE.Vector3(S2, Th, 0),
          new THREE.Vector3(S3, Tc, 0),
          new THREE.Vector3(S4, Tc, 0),
          new THREE.Vector3(S1, Th, 0),
        ]
      },
      calc: { Qh, Qc, W, efficiency }
    };
  }, [Th, Tc, V1, gamma]);
  
  const processCurves = useMemo(() => {
    const { points } = cycleData;
    return {
      pv: {
        'isothermal-expansion': [points.pv[0], points.pv[1]],
        'adiabatic-expansion': [points.pv[1], points.pv[2]],
        'isothermal-compression': [points.pv[2], points.pv[3]],
        'adiabatic-compression': [points.pv[3], points.pv[4]]
      },
      ts: {
        'isothermal-expansion': [points.ts[0], points.ts[1]],
        'adiabatic-expansion': [points.ts[1], points.ts[2]],
        'isothermal-compression': [points.ts[2], points.ts[3]],
        'adiabatic-compression': [points.ts[3], points.ts[4]]
      }
    };
  }, [cycleData]);
  
  return (
    <group position={position} scale={scale}>
        
      {/* --- PV DIAGRAM (Left) --- */}
      {(type === 'pv' || type === 'combined') && (
        <group position={type === 'combined' ? [-3.5, 0, 0] : [0, 0, 0]}>
          <Text position={[0, 3, 0]} fontSize={0.3} color="#3b82f6">Pressure vs Volume</Text>
          <Plane args={[5, 5]}><meshBasicMaterial color="#1e293b" opacity={0.2} transparent /></Plane>
          {(Object.entries(processCurves.pv) as [ProcessType, THREE.Vector3[]][]).map(([proc, pts]) => (
            <DiagramCurve key={proc} type="pv" process={proc} points={pts} color={PROCESS_COLORS[proc]} showArea={true} />
          ))}
        </group>
      )}
      
      {/* --- TS DIAGRAM (Right) --- */}
      {(type === 'ts' || type === 'combined') && (
        <group position={type === 'combined' ? [3.5, 0, 0] : [0, 0, 0]}>
          <Text position={[0, 3, 0]} fontSize={0.3} color="#10b981">Temperature vs Entropy</Text>
          <Plane args={[5, 5]}><meshBasicMaterial color="#1e293b" opacity={0.2} transparent /></Plane>
          {(Object.entries(processCurves.ts) as [ProcessType, THREE.Vector3[]][]).map(([proc, pts]) => (
            <DiagramCurve key={proc} type="ts" process={proc} points={pts.map(p => new THREE.Vector3(p.x/5 - 1.5, p.y/500 - 1, 0))} color={PROCESS_COLORS[proc]} />
          ))}
        </group>
      )}

      {/* --- CONTROLS OVERLAY --- */}
      <Html position={[0, -4, 0]} center>
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 w-96 backdrop-blur-md">
            <div className="flex justify-between items-center mb-2">
                <span className="text-white font-bold">Carnot Efficiency:</span>
                <span className="text-2xl font-mono text-green-400">{(cycleData.calc.efficiency * 100).toFixed(1)}%</span>
            </div>
            
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <span className="text-xs text-red-400 w-12">Hot (Th)</span>
                    <input type="range" min="400" max="800" value={Th} onChange={e => setTh(Number(e.target.value))} className="flex-1 accent-red-500" />
                    <span className="text-xs text-white w-8">{Th}K</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-blue-400 w-12">Cold (Tc)</span>
                    <input type="range" min="100" max="400" value={Tc} onChange={e => setTc(Number(e.target.value))} className="flex-1 accent-blue-500" />
                    <span className="text-xs text-white w-8">{Tc}K</span>
                </div>
            </div>
        </div>
      </Html>
    </group>
  );
}

function ProcessVisualization({ process }: { process: ProcessType }) {
  const info = {
    'isothermal-expansion': { title: 'Isothermal Expansion', eq: 'Q = W = nRT ln(V₂/V₁)', desc: 'Constant Temp. Heat IN.', color: '#ef4444' },
    'adiabatic-expansion': { title: 'Adiabatic Expansion', eq: 'TV^{γ-1} = const', desc: 'No Heat exchange. Temp Drops.', color: '#f59e0b' },
    'isothermal-compression': { title: 'Isothermal Compression', eq: 'Q = W = nRT ln(V₄/V₃)', desc: 'Constant Temp. Heat OUT.', color: '#3b82f6' },
    'adiabatic-compression': { title: 'Adiabatic Compression', eq: 'TV^{γ-1} = const', desc: 'No Heat exchange. Temp Rises.', color: '#10b981' }
  }[process];
  
  return (
    <group>
      {/* 1. MODEL MOVED LEFT */}
      <PistonCylinder
        pressure={process.includes('expansion') ? 300 : 600}
        volume={process.includes('expansion') ? 2.5 : 1.2}
        temperature={process.includes('isothermal') ? 400 : 300}
        process={process}
        position={[-2.5, 0, 0]} // <--- Moved Left
        scale={0.8}
      />

      {/* 2. TEXT MOVED RIGHT */}
      <Html position={[2.5, 0, 0]} center>
        <div className="bg-slate-900/90 p-5 rounded-2xl border-2 backdrop-blur-md w-72 shadow-2xl"
             style={{ borderColor: info.color }}>
          <div className="text-xl font-bold mb-2" style={{ color: info.color }}>
            {info.title}
          </div>
          <div className="bg-black/40 p-2 rounded mb-3 font-mono text-sm text-green-300">
            {info.eq}
          </div>
          <div className="text-sm text-slate-300 leading-relaxed">
            {info.desc}
          </div>
          <div className="mt-4 flex gap-2">
             <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-white border border-slate-600">
                {process.includes('expansion') ? 'Work Done BY Gas' : 'Work Done ON Gas'}
             </span>
          </div>
        </div>
      </Html>
    </group>
  );
}

// --- MAIN PAGE ---
export default function CarnotCyclePage() {
  const [viewMode, setViewMode] = useState<'process' | 'diagram'>('process');
  const [diagramType, setDiagramType] = useState<DiagramType>('combined');
  const [activeProcess, setActiveProcess] = useState<ProcessType>('isothermal-expansion');
  
  return (
    <SimulationLayout
      title="Carnot Cycle"
      description="The most efficient thermodynamic cycle possible. It consists of two isothermal and two adiabatic processes."
      cameraPosition={[0, 0, 12]} // Zoomed out slightly
    >
      <Float speed={0.2} rotationIntensity={0.1}>
        <group>
          {/* Top Menu */}
          <Html position={[0, 5, 0]} center>
            <div className="flex gap-4 bg-black/50 p-2 rounded-full backdrop-blur-md">
                <button onClick={() => setViewMode('process')} className={`px-4 py-1 rounded-full ${viewMode === 'process' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Process View</button>
                <button onClick={() => setViewMode('diagram')} className={`px-4 py-1 rounded-full ${viewMode === 'diagram' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Diagram View</button>
            </div>
          </Html>

          {/* CONTENT SWITCHER */}
          {viewMode === 'process' ? (
            <group>
                <ProcessVisualization process={activeProcess} />
                
                {/* Bottom Process Selectors */}
                <Html position={[0, -4, 0]} center>
                    <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
                        {(Object.keys(PROCESS_COLORS) as ProcessType[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => setActiveProcess(p)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeProcess === p ? 'ring-2 ring-white scale-105' : 'opacity-70'}`}
                                style={{ backgroundColor: PROCESS_COLORS[p], color: 'black' }}
                            >
                                {p.replace(/-/g, ' ').toUpperCase()}
                            </button>
                        ))}
                    </div>
                </Html>
            </group>
          ) : (
            <group>
                <CarnotCycleDiagram type={diagramType} />
                
                {/* Diagram Type Toggle */}
                <Html position={[0, -1.5, 0]} center>
                    <div className="flex gap-2">
                        {['pv', 'ts', 'combined'].map((t) => (
                            <button 
                                key={t} 
                                onClick={() => setDiagramType(t as any)}
                                className={`px-3 py-1 rounded border text-xs uppercase ${diagramType === t ? 'bg-white text-black' : 'text-slate-400 border-slate-600'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </Html>
            </group>
          )}

        </group>
      </Float>
    </SimulationLayout>
  );
}

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
  type?: 'molecule' | 'atom';
  position: [number, number, number];
  velocity: [number, number, number];
  color: string;
  size?: number;
}) {
  const particleRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (particleRef.current) {
      const time = clock.getElapsedTime();
      // Brownian motion-like movement
      particleRef.current.position.x = position[0] + Math.sin(time * velocity[0]) * 0.2;
      particleRef.current.position.y = position[1] + Math.cos(time * velocity[1]) * 0.2;
      particleRef.current.position.z = position[2] + Math.sin(time * velocity[2]) * 0.2;
    }
  });

  return (
    <Sphere ref={particleRef} args={[size, 16, 16]} position={position}>
      <meshStandardMaterial 
        color={color} 
        emissive={color}
        emissiveIntensity={0.3}
      />
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
      // Subtle piston movement based on process
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
      {/* Cylinder container */}
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
      
      {/* Gas inside */}
      <Cylinder args={[1, 1, pistonHeight, 32]} position={[0, (pistonHeight - 3)/2, 0]}>
        <meshStandardMaterial 
          color={processColor}
          transparent
          opacity={0.4}
        />
      </Cylinder>
      
      {/* Piston */}
      <group ref={pistonRef} position={[0, pistonHeight/2 - 0.5, 0]}>
        <Cylinder args={[1.1, 1.1, 0.2, 32]}>
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
        </Cylinder>
        
        {/* Piston rod */}
        <Cylinder args={[0.15, 0.15, 1, 16]} position={[0, 0.6, 0]}>
          <meshStandardMaterial color="#475569" />
        </Cylinder>
      </group>
      
      {/* Process label */}
      <Html position={[0, 2, 0]}>
        <div className="bg-black/80 px-3 py-1 rounded-lg border-2 backdrop-blur-sm min-w-[150px]" 
             style={{ borderColor: processColor }}>
          <div className="text-sm font-bold" style={{ color: processColor }}>
            {process.replace('-', ' ').toUpperCase()}
          </div>
          <div className="text-xs text-gray-300">
            P: {pressure.toFixed(1)} kPa <br/> V: {volume.toFixed(2)} L <br/> T: {temperature.toFixed(0)} K
          </div>
        </div>
      </Html>
      
      {/* Gas particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <GasParticle
          key={i}
          position={[
            -0.8 + Math.random() * 1.6,
            -1 + Math.random() * pistonHeight,
            -0.8 + Math.random() * 1.6
          ]}
          velocity={[
            Math.random() * 2,
            Math.random() * 2,
            Math.random() * 2
          ]}
          color={processColor}
          size={0.08 + Math.random() * 0.04}
        />
      ))}
    </group>
  );
}

// FIX: Removed incorrect type syntax inside destructuring
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
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(points);
  }, [points]);

  return (
    <group>
      {/* Curve line */}
      <Tube args={[curve, 64, 0.05, 8, false]}>
        <meshStandardMaterial color={color} />
      </Tube>
      
      {/* Direction arrows */}
      {points.length > 1 && (
        <group>
          {[0.2, 0.5, 0.8].map((t) => {
            const point = curve.getPoint(t);
            const tangent = curve.getTangent(t);
            const quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
            
            return (
              <Cone
                key={t}
                args={[0.1, 0.3, 16]}
                position={point}
                quaternion={quaternion}
              >
                <meshStandardMaterial color={color} />
              </Cone>
            );
          })}
        </group>
      )}
      
      {/* Area under curve for PV diagram */}
      {showArea && type === 'pv' && points.length >= 2 && (
        <mesh>
          <shapeGeometry args={[new THREE.Shape(points.map(p => new THREE.Vector2(p.x, p.y)))]} />
          <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function CarnotCycleDiagram({
  type = 'pv',
  position = [0, 0, 0],
  scale = 1,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showWork = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showHeat = false
}: {
  type?: DiagramType;
  position?: [number, number, number];
  scale?: number;
  showWork?: boolean;
  showHeat?: boolean;
}) {
  // State for cycle parameters
  const [Th, setTh] = useState(500); // Hot reservoir temperature (K)
  const [Tc, setTc] = useState(300); // Cold reservoir temperature (K)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [V1, setV1] = useState(1.0); // Initial volume (L)
  const [gamma, setGamma] = useState(1.4); // Adiabatic index (Cp/Cv)
  
  // Calculate Carnot cycle points
  const cycleData = useMemo(() => {
    const R = GAS_CONSTANT;
    const n = 1; // moles
    
    // Point 1: Isothermal expansion start
    const P1 = (n * R * Th) / V1;
    const S1 = n * R * Math.log(V1);
    
    // Point 2: Isothermal expansion end (V2 = 2*V1)
    const V2 = V1 * 2;
    const P2 = (n * R * Th) / V2;
    const S2 = n * R * Math.log(V2);
    
    // Point 3: Adiabatic expansion end
    const V3 = V2 * Math.pow(Th / Tc, 1 / (gamma - 1));
    const P3 = (n * R * Tc) / V3;
    const S3 = S2; // Adiabatic = isentropic
    
    // Point 4: Isothermal compression end
    const V4 = V1 * Math.pow(Tc / Th, 1 / (gamma - 1));
    const P4 = (n * R * Tc) / V4;
    const S4 = n * R * Math.log(V4);
    
    // Calculate work and heat
    const Qh = n * R * Th * Math.log(V2 / V1); // Heat absorbed from hot reservoir
    const Qc = n * R * Tc * Math.log(V3 / V4); // Heat rejected to cold reservoir
    const W = Qh - Qc; // Net work done
    const efficiency = 1 - (Tc / Th); // Carnot efficiency
    
    return {
      points: {
        pv: [
          new THREE.Vector3(V1, P1/1000, 0),   // Point 1 (convert Pa to kPa)
          new THREE.Vector3(V2, P2/1000, 0),   // Point 2
          new THREE.Vector3(V3, P3/1000, 0),   // Point 3
          new THREE.Vector3(V4, P4/1000, 0),   // Point 4
          new THREE.Vector3(V1, P1/1000, 0),   // Back to point 1
        ],
        ts: [
          new THREE.Vector3(S1, Th, 0),        // Point 1
          new THREE.Vector3(S2, Th, 0),        // Point 2
          new THREE.Vector3(S3, Tc, 0),        // Point 3
          new THREE.Vector3(S4, Tc, 0),        // Point 4
          new THREE.Vector3(S1, Th, 0),        // Back to point 1
        ]
      },
      calculations: {
        Qh, Qc, W, efficiency,
        workPerCycle: W,
        heatIn: Qh,
        heatOut: Qc
      }
    };
  }, [Th, Tc, V1, gamma]);
  
  // Create individual process curves
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
  
  const animationRef = useRef<THREE.Group>(null);
  const [activeProcess, setActiveProcess] = useState<ProcessType>('isothermal-expansion');
  
  useFrame(({ clock }) => {
    if (animationRef.current) {
      // Cycle through processes every 2 seconds
      const time = clock.getElapsedTime();
      const processIndex = Math.floor((time % 8) / 2);
      
      const processes: ProcessType[] = [
        'isothermal-expansion',
        'adiabatic-expansion',
        'isothermal-compression',
        'adiabatic-compression'
      ];
      
      setActiveProcess(processes[processIndex]);
      animationRef.current.rotation.y = time * 0.1;
    }
  });
  
  return (
    <group position={position} scale={scale} ref={animationRef}>
      {/* Diagram Planes */}
      {type === 'pv' || type === 'combined' ? (
        <group position={[-3, 0, 0]}>
          {/* PV Diagram Plane */}
          <Plane args={[6, 5]} rotation={[0, 0, 0]}>
            <meshBasicMaterial color="#1e293b" side={THREE.DoubleSide} opacity={0.1} transparent />
          </Plane>
          
          {/* Axes */}
          <Line points={[[-2.5, -2, 0], [2.5, -2, 0]]} color="#64748b" lineWidth={2} />
          <Line points={[[-2.5, -2, 0], [-2.5, 2, 0]]} color="#64748b" lineWidth={2} />
          
          {/* Axis Labels */}
          <Text position={[2.8, -2, 0]} fontSize={0.3} color="#94a3b8">Volume (V)</Text>
          <Text position={[-2.8, 2.2, 0]} fontSize={0.3} color="#94a3b8" rotation={[0, 0, Math.PI/2]}>
            Pressure (P)
          </Text>
          
          {/* Carnot Cycle PV Curves */}
          {(Object.entries(processCurves.pv) as [ProcessType, THREE.Vector3[]][]).map(([process, points]) => (
            <DiagramCurve
              key={`pv-${process}`}
              type="pv"
              process={process}
              points={points}
              color={PROCESS_COLORS[process]}
              showArea={process === 'isothermal-expansion'}
            />
          ))}
          
          {/* Highlight active process */}
          <group position={processCurves.pv[activeProcess][0]}>
            <Sphere args={[0.15, 16, 16]}>
              <meshStandardMaterial 
                color={PROCESS_COLORS[activeProcess]}
                emissive={PROCESS_COLORS[activeProcess]}
                emissiveIntensity={1}
              />
            </Sphere>
          </group>
          
          <Html position={[0, 3, 0]}>
            <div className="bg-black/80 p-3 rounded-xl border-2 backdrop-blur-sm" 
                 style={{ borderColor: '#3b82f6' }}>
              <div className="text-lg font-bold text-blue-400">PV Diagram</div>
              <div className="text-sm text-gray-300">Work = ∮ P dV</div>
            </div>
          </Html>
        </group>
      ) : null}
      
      {type === 'ts' || type === 'combined' ? (
        <group position={[3, 0, 0]}>
          {/* TS Diagram Plane */}
          <Plane args={[6, 5]} rotation={[0, 0, 0]}>
            <meshBasicMaterial color="#1e293b" side={THREE.DoubleSide} opacity={0.1} transparent />
          </Plane>
          
          {/* Axes */}
          <Line points={[[-2.5, -2, 0], [2.5, -2, 0]]} color="#64748b" lineWidth={2} />
          <Line points={[[-2.5, -2, 0], [-2.5, 2, 0]]} color="#64748b" lineWidth={2} />
          
          {/* Axis Labels */}
          <Text position={[2.8, -2, 0]} fontSize={0.3} color="#94a3b8">Entropy (S)</Text>
          <Text position={[-2.8, 2.2, 0]} fontSize={0.3} color="#94a3b8" rotation={[0, 0, Math.PI/2]}>
            Temperature (T)
          </Text>
          
          {/* Temperature reservoirs */}
          <Plane args={[0.5, 3]} position={[-3, Th/500 - 1, 0]} rotation={[0, 0, 0]}>
            <meshStandardMaterial color="#ef4444" transparent opacity={0.3} />
          </Plane>
          <Html position={[-3.5, Th/500 - 1, 0]}>
            <div className="bg-red-500/80 px-2 py-1 rounded text-sm w-max">T_h = {Th} K</div>
          </Html>
          
          <Plane args={[0.5, 3]} position={[-3, Tc/500 - 1, 0]} rotation={[0, 0, 0]}>
            <meshStandardMaterial color="#3b82f6" transparent opacity={0.3} />
          </Plane>
          <Html position={[-3.5, Tc/500 - 1, 0]}>
            <div className="bg-blue-500/80 px-2 py-1 rounded text-sm w-max">T_c = {Tc} K</div>
          </Html>
          
          {/* Carnot Cycle TS Curves */}
          {(Object.entries(processCurves.ts) as [ProcessType, THREE.Vector3[]][]).map(([process, points]) => (
            <DiagramCurve
              key={`ts-${process}`}
              type="ts"
              process={process}
              points={points.map(p => new THREE.Vector3(p.x/5 - 1.5, p.y/500 - 1, 0))}
              color={PROCESS_COLORS[process]}
            />
          ))}
          
          <Html position={[0, 3, 0]}>
            <div className="bg-black/80 p-3 rounded-xl border-2 backdrop-blur-sm" 
                 style={{ borderColor: '#10b981' }}>
              <div className="text-lg font-bold text-green-400">TS Diagram</div>
              <div className="text-sm text-gray-300">Heat = ∮ T dS</div>
            </div>
          </Html>
        </group>
      ) : null}
      
      {/* Efficiency Display */}
      <Html position={[0, -3, 0]}>
        <div className="bg-black/80 p-4 rounded-xl border-2 border-purple-500/50 backdrop-blur-sm min-w-[320px]">
          <div className="text-lg font-bold text-purple-400 mb-3">Carnot Cycle Analysis</div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-sm text-gray-300">Carnot Efficiency:</div>
              <div className="text-2xl font-mono text-green-400">
                η = {cycleData.calculations.efficiency.toFixed(3)}
              </div>
              <div className="text-xs text-gray-400">η = 1 - T_c/T_h</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-300">Net Work:</div>
              <div className="text-xl font-mono text-yellow-400">
                W_net = {cycleData.calculations.W.toFixed(1)} J
              </div>
              <div className="text-xs text-gray-400">W = Q_h - Q_c</div>
            </div>
          </div>
        </div>
      </Html>
      
      {/* Interactive Controls */}
      <Html position={[type === 'combined' ? 0 : (type === 'pv' ? -3 : 3), -4.5, 0]}>
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 backdrop-blur-md w-80">
          <div className="text-white font-bold mb-3">Adjust Parameters</div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-300 flex justify-between">
                <span>Hot Reservoir (T_h)</span>
                <span className="text-red-400">{Th} K</span>
              </label>
              <input
                type="range"
                min="350"
                max="800"
                step="10"
                value={Th}
                onChange={(e) => setTh(parseInt(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-300 flex justify-between">
                <span>Cold Reservoir (T_c)</span>
                <span className="text-blue-400">{Tc} K</span>
              </label>
              <input
                type="range"
                min="200"
                max="500"
                step="10"
                value={Tc}
                onChange={(e) => setTc(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

function ProcessVisualization({
  process,
  position = [0, 0, 0]
}: {
  process: ProcessType;
  position?: [number, number, number];
}) {
  const processConfig = useMemo(() => {
    const configs = {
      'isothermal-expansion': {
        title: 'Isothermal Expansion',
        equation: 'Q = W = nRT ln(V₂/V₁)',
        description: 'Constant temperature, heat input equals work output',
        temperature: 'T = constant',
        heatFlow: 'Heat IN from hot reservoir',
        color: '#ef4444'
      },
      'adiabatic-expansion': {
        title: 'Adiabatic Expansion',
        equation: 'TV^{γ-1} = constant',
        description: 'No heat transfer, temperature decreases',
        temperature: 'T decreases',
        heatFlow: 'Q = 0 (Insulated)',
        color: '#f59e0b'
      },
      'isothermal-compression': {
        title: 'Isothermal Compression',
        equation: 'Q = W = nRT ln(V₄/V₃)',
        description: 'Constant temperature, work input equals heat output',
        temperature: 'T = constant',
        heatFlow: 'Heat OUT to cold reservoir',
        color: '#3b82f6'
      },
      'adiabatic-compression': {
        title: 'Adiabatic Compression',
        equation: 'TV^{γ-1} = constant',
        description: 'No heat transfer, temperature increases',
        temperature: 'T increases',
        heatFlow: 'Q = 0 (Insulated)',
        color: '#10b981'
      }
    };
    return configs[process];
  }, [process]);
  
  return (
    <group position={position}>
      <Html position={[0, 1.5, 0]} center>
        <div className="bg-black/80 p-4 rounded-xl border-2 backdrop-blur-sm w-64"
             style={{ borderColor: processConfig.color }}>
          <div className="text-lg font-bold mb-2" style={{ color: processConfig.color }}>
            {processConfig.title}
          </div>
          <div className="text-sm text-white font-mono mb-2">{processConfig.equation}</div>
          <div className="text-xs text-gray-300">{processConfig.description}</div>
          <div className="flex justify-between mt-2 text-xs">
            <span className="text-yellow-400">{processConfig.temperature}</span>
            <span className="text-cyan-400">{processConfig.heatFlow}</span>
          </div>
        </div>
      </Html>
      
      {/* Visual representation */}
      <PistonCylinder
        pressure={process.includes('expansion') ? 300 : 600}
        volume={process.includes('expansion') ? 2.5 : 1.2}
        temperature={process.includes('isothermal') ? 400 : 300}
        process={process}
        position={[0, -0.5, 0]}
        scale={0.7}
      />
    </group>
  );
}

function EntropyVisualization({
  position = [0, 0, 0]
}: {
  position?: [number, number, number];
}) {
  const particlesRef = useRef<THREE.Group>(null);
  const [disorder, setDisorder] = useState(0.5);
  
  useFrame(({ clock }) => {
    if (particlesRef.current) {
      const time = clock.getElapsedTime();
      particlesRef.current.children.forEach((particle, i) => {
        const randomness = disorder * 2;
        particle.position.x = Math.sin(time + i) * randomness;
        particle.position.y = Math.cos(time * 0.7 + i) * randomness;
        particle.position.z = Math.sin(time * 0.5 + i) * randomness;
      });
    }
  });
  
  return (
    <group position={position}>
      <Html position={[0, 3, 0]} center>
        <div className="bg-black/80 p-4 rounded-xl border-2 border-purple-500/50 backdrop-blur-sm">
          <div className="text-lg font-bold text-purple-400 mb-2">Entropy & Disorder</div>
          <div className="text-sm text-gray-300">
            ΔS = Q_rev/T = k ln(Ω)
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Entropy measures disorder - increases in irreversible processes
          </div>
        </div>
      </Html>
      
      {/* Container */}
      <Box args={[4, 3, 4]}>
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          opacity={0.1}
          transparent
          roughness={0}
          thickness={0.2}
          side={THREE.DoubleSide}
        />
      </Box>
      
      {/* Gas particles showing disorder */}
      <group ref={particlesRef}>
        {Array.from({ length: 50 }).map((_, i) => (
          <Sphere key={i} args={[0.1, 8, 8]}>
            <meshStandardMaterial 
              color={i % 2 === 0 ? '#a855f7' : '#8b5cf6'}
              emissive={i % 2 === 0 ? '#a855f7' : '#8b5cf6'}
              emissiveIntensity={0.5}
            />
          </Sphere>
        ))}
      </group>
      
      {/* Entropy control */}
      <Html position={[0, -2.5, 0]} center>
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 w-64">
          <div className="text-white text-sm mb-2">Adjust Disorder (Entropy):</div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={disorder}
            onChange={(e) => setDisorder(parseFloat(e.target.value))}
            className="w-full accent-purple-500"
          />
          <div className="text-xs text-gray-400 mt-2">
            High entropy = More disorder = More microstates
          </div>
        </div>
      </Html>
    </group>
  );
}

// --- MAIN COMPONENT ---
export default function CarnotCyclePage() {
  const [viewMode, setViewMode] = useState<'process' | 'diagram' | 'entropy'>('process');
  const [diagramType, setDiagramType] = useState<DiagramType>('combined');
  const [activeProcess, setActiveProcess] = useState<ProcessType>('isothermal-expansion');
  
  return (
    <SimulationLayout
      title="Carnot Cycle & Entropy"
      description="Visualize the most efficient thermodynamic cycle. Explore PV and TS diagrams, entropy changes, and understand why no engine can be more efficient than a Carnot engine."
      cameraPosition={[0, 2, 10]}
    >
      <Float speed={0.3} rotationIntensity={0.1} floatIntensity={0.2}>
        <group>
          {/* View Mode Selection */}
          <Html position={[0, 4, 0]} center>
            <div className="flex gap-3 bg-black/60 px-6 py-3 rounded-full backdrop-blur-md border border-slate-700">
              {(['process', 'diagram', 'entropy'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    viewMode === mode
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)} View
                </button>
              ))}
            </div>
          </Html>
          
          {/* Process Visualization View */}
          {viewMode === 'process' && (
            <group>
              <ProcessVisualization 
                process={activeProcess} 
                position={[0, 0, 0]}
              />
              
              {/* Process selector */}
              <Html position={[0, -3, 0]} center>
                <div className="bg-black/80 p-4 rounded-xl backdrop-blur-sm border border-slate-700">
                  <div className="text-white font-bold mb-3">Select Process Step</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(PROCESS_COLORS) as ProcessType[]).map((process) => (
                      <button
                        key={process}
                        onClick={() => setActiveProcess(process)}
                        className={`p-3 rounded-lg text-sm font-medium transition-all ${
                          activeProcess === process
                            ? 'ring-2 ring-offset-1 ring-offset-black'
                            : 'opacity-90 hover:opacity-100'
                        }`}
                        style={{ 
                          backgroundColor: activeProcess === process 
                            ? PROCESS_COLORS[process] 
                            : `${PROCESS_COLORS[process]}40`,
                          color: activeProcess === process ? 'white' : '#E5E7EB'
                        }}
                      >
                        {process.replace('-', ' ').toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </Html>
            </group>
          )}
          
          {/* Diagram View */}
          {viewMode === 'diagram' && (
            <group>
              <CarnotCycleDiagram 
                type={diagramType}
                position={[0, 0, 0]}
                scale={1}
                showWork={true}
                showHeat={true}
              />
              
              {/* Diagram Type Selector */}
              <Html position={[0, -5, 0]} center>
                <div className="bg-black/80 p-3 rounded-xl backdrop-blur-sm">
                  <div className="text-white text-sm mb-2">Diagram Type:</div>
                  <div className="flex gap-2">
                    {(['pv', 'ts', 'combined'] as DiagramType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setDiagramType(type)}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          diagramType === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {type.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </Html>
            </group>
          )}
          
          {/* Entropy View */}
          {viewMode === 'entropy' && (
            <EntropyVisualization position={[0, 0, 0]} />
          )}
          
          {/* Carnot Efficiency Formula - Only show in diagram/process view */}
          {viewMode !== 'entropy' && (
            <Html position={[5, 2, 0]} center>
              <div className="bg-black/80 p-4 rounded-xl border-2 border-yellow-500/50 backdrop-blur-sm min-w-[280px]">
                <div className="text-lg font-bold text-yellow-400 mb-2">Carnot Efficiency</div>
                <div className="text-2xl font-mono text-white text-center mb-3">
                  η = 1 - T_c/T_h
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">η</span>
                    <span className="text-gray-400">Max efficiency</span>
                    <span className="text-blue-300">dimensionless</span>
                  </div>
                </div>
              </div>
            </Html>
          )}
        </group>
      </Float>
    </SimulationLayout>
  );
}

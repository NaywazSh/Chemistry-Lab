'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Sphere, Cylinder, Box, Html, Float, Line, Text, Plane, Cone
} from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

// --- Types ---
type StateType = 'solid' | 'liquid' | 'gas';
type ReactionType = 'exothermic' | 'endothermic';
type SpontaneityType = 'spontaneous' | 'non-spontaneous' | 'equilibrium';

// --- Constants ---
const COLORS = {
  enthalpy: '#ef4444',       // Red for ΔH
  entropy: '#3b82f6',        // Blue for TΔS
  gibbs: '#10b981',          // Green for ΔG
  spontaneous: '#22c55e',    // Bright green for spontaneous
  nonSpontaneous: '#ef4444', // Red for non-spontaneous
  equilibrium: '#f59e0b',    // Yellow for equilibrium
  temperature: '#8b5cf6',    // Purple for temperature
  solid: '#94a3b8',          // Gray for solid
  liquid: '#3b82f6',         // Blue for liquid
  gas: '#f97316'             // Orange for gas
};

// --- Components ---

function EnergyBar({
  type,
  value,
  label,
  position = [0, 0, 0],
  height = 2,
  width = 0.5
}: {
  type: 'enthalpy' | 'entropy' | 'gibbs';
  value: number;
  label: string;
  position?: [number, number, number];
  height?: number;
  width?: number;
}) {
  const color = COLORS[type];
  const barHeight = Math.max(0.1, Math.abs(value) / 40); // Adjusted scale
  const isNegative = value < 0;
  
  return (
    <group position={position}>
      {/* Bar container (background) */}
      <Cylinder args={[width * 0.8, width * 0.8, height, 32]} position={[0, height/2, 0]}>
        <meshStandardMaterial color="#1e293b" opacity={0.3} transparent />
      </Cylinder>
      
      {/* Zero line */}
      <Plane args={[width * 2.5, 0.05]} position={[0, height/2, width]} rotation={[0, 0, 0]}>
        <meshBasicMaterial color="#94a3b8" />
      </Plane>
      
      {/* Energy bar */}
      <Cylinder 
        args={[width, width, barHeight, 32]} 
        position={[0, isNegative ? height/2 - barHeight/2 : height/2 + barHeight/2, 0]}
      >
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.9}
        />
      </Cylinder>
      
      {/* Value label - Moved closer to bar */}
      <Html position={[0, isNegative ? height/2 - barHeight - 0.5 : height/2 + barHeight + 0.5, 0]} center>
        <div className="text-xs font-bold whitespace-nowrap px-2 py-1 rounded bg-black/60 border border-slate-700"
             style={{ color: color }}>
          {label} {value.toFixed(0)}
        </div>
      </Html>
    </group>
  );
}

function PhaseChangeVisualization({
  temperature,
  position = [0, 0, 0]
}: {
  deltaH: number;
  deltaS: number;
  temperature: number;
  position?: [number, number, number];
}) {
  const [currentPhase, setCurrentPhase] = useState<StateType>('solid');
  const particlesRef = useRef<THREE.Group>(null);
  
  const meltingPoint = 273; 
  const boilingPoint = 373; 
  
  useFrame(() => {
    if (temperature < meltingPoint) {
      setCurrentPhase('solid');
    } else if (temperature < boilingPoint) {
      setCurrentPhase('liquid');
    } else {
      setCurrentPhase('gas');
    }
    
    if (particlesRef.current) {
      particlesRef.current.children.forEach((particle) => {
        const speed = currentPhase === 'solid' ? 0.1 : 
                      currentPhase === 'liquid' ? 0.5 : 2;
        
        particle.position.x += (Math.random() - 0.5) * speed * 0.1;
        particle.position.y += (Math.random() - 0.5) * speed * 0.1;
        particle.position.z += (Math.random() - 0.5) * speed * 0.1;
        
        ['x', 'y', 'z'].forEach(axis => {
          // @ts-ignore
          if (Math.abs(particle.position[axis]) > 1.5) {
            // @ts-ignore
            particle.position[axis] *= -0.9;
          }
        });
      });
    }
  });
  
  const phaseColor = COLORS[currentPhase];
  const particleCount = currentPhase === 'solid' ? 20 : 
                       currentPhase === 'liquid' ? 40 : 60;
  
  return (
    <group position={position}>
      <Box args={[3, 2, 3]}>
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          opacity={0.2}
          transparent
          roughness={0}
          thickness={0.2}
          side={THREE.DoubleSide}
        />
      </Box>
      
      <Html position={[0, 1.5, 0]} center>
        <div className="bg-black/80 p-2 rounded-lg border-2 backdrop-blur-sm"
             style={{ borderColor: phaseColor }}>
          <div className="text-sm font-bold" style={{ color: phaseColor }}>
            {currentPhase.toUpperCase()}
          </div>
          <div className="text-xs text-gray-300">
            T = {temperature.toFixed(0)} K
          </div>
        </div>
      </Html>
      
      <group ref={particlesRef}>
        {Array.from({ length: particleCount }).map((_, i) => (
          <Sphere
            key={i}
            args={[0.12, 16, 16]}
            position={[
              (Math.random() - 0.5) * 2,
              (Math.random() - 0.5) * 1,
              (Math.random() - 0.5) * 2
            ]}
          >
            <meshStandardMaterial 
              color={phaseColor}
              emissive={phaseColor}
              emissiveIntensity={0.2}
            />
          </Sphere>
        ))}
      </group>
    </group>
  );
}

function GibbsEquationVisualizer({
  deltaH,
  deltaS,
  temperature,
  deltaG,
  position = [0, 0, 0]
}: {
  deltaH: number;
  deltaS: number;
  temperature: number;
  deltaG: number;
  position?: [number, number, number];
}) {
  const spontaneity: SpontaneityType = 
    deltaG < 0 ? 'spontaneous' : 
    deltaG > 0 ? 'non-spontaneous' : 'equilibrium';
    
  const spontaneityColor = 
    spontaneity === 'spontaneous' ? COLORS.spontaneous :
    spontaneity === 'non-spontaneous' ? COLORS.nonSpontaneous : 
    COLORS.equilibrium;
  
  return (
    <group position={position}>
      <Html position={[0, 0, 0]} center transform>
        <div className="bg-slate-900/95 p-6 rounded-2xl border-2 shadow-2xl w-[400px]"
             style={{ borderColor: `${COLORS.gibbs}60` }}>
          
          <div className="text-center mb-4">
            <div className="text-xl font-bold text-white mb-2">Calculations</div>
            <div className="text-3xl font-mono space-x-2 bg-black/40 p-2 rounded-lg">
              <span style={{ color: COLORS.gibbs }}>ΔG</span>
              <span className="text-white">=</span>
              <span style={{ color: COLORS.enthalpy }}>ΔH</span>
              <span className="text-white">-</span>
              <span className="text-white">T</span>
              <span style={{ color: COLORS.entropy }}>ΔS</span>
            </div>
          </div>
          
          {/* Values Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="flex justify-between border-b border-slate-700 pb-1">
              <span className="text-gray-400">ΔH</span>
              <span style={{ color: COLORS.enthalpy }} className="font-mono">{deltaH.toFixed(1)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-700 pb-1">
              <span className="text-gray-400">T</span>
              <span style={{ color: COLORS.temperature }} className="font-mono">{temperature} K</span>
            </div>
            <div className="flex justify-between border-b border-slate-700 pb-1">
              <span className="text-gray-400">ΔS</span>
              <span style={{ color: COLORS.entropy }} className="font-mono">{deltaS.toFixed(3)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-700 pb-1">
              <span className="text-gray-400">TΔS</span>
              <span style={{ color: COLORS.entropy }} className="font-mono">{(temperature * deltaS).toFixed(1)}</span>
            </div>
          </div>
          
          {/* Result */}
          <div className="text-center p-3 rounded-lg border-2" 
               style={{ borderColor: spontaneityColor, backgroundColor: `${spontaneityColor}10` }}>
            <div className="text-xs text-gray-400 mb-1">Result (ΔG)</div>
            <div className="text-3xl font-bold font-mono mb-1" style={{ color: spontaneityColor }}>
              {deltaG.toFixed(1)} <span className="text-sm">kJ/mol</span>
            </div>
            <div className="text-sm font-bold uppercase tracking-widest text-white">
              {spontaneity}
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

function GibbsSurfacePlot({
  deltaH,
  deltaS,
  temperature,
  position = [0, 0, 0]
}: {
  deltaH: number;
  deltaS: number;
  temperature: number;
  position?: [number, number, number];
}) {
  const surfaceRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => {
    const width = 6;
    const height = 4;
    const widthSegments = 32;
    const heightSegments = 32;
    
    const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
    const positions = geometry.attributes.position.array;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      
      const deltaS_val = x * 0.1;
      const T_val = 200 + (y + height/2) * 100;
      
      const deltaG_val = deltaH - T_val * deltaS_val;
      
      positions[i + 2] = deltaG_val / 100;
    }
    
    geometry.computeVertexNormals();
    return geometry;
  }, [deltaH]);
  
  const currentPoint = useMemo(() => {
    const x = deltaS / 0.1;
    const y = (temperature - 200) / 100 - 2;
    const z = (deltaH - temperature * deltaS) / 100;
    
    return new THREE.Vector3(x, y, z);
  }, [deltaH, deltaS, temperature]);
  
  useFrame(({ clock }) => {
    if (surfaceRef.current) {
      surfaceRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
    }
  });
  
  return (
    <group position={position}>
      <mesh ref={surfaceRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial 
          color={COLORS.gibbs}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          wireframe={false}
        />
      </mesh>
      
      <group position={[currentPoint.x, currentPoint.z + 0.1, currentPoint.y]}>
        <Sphere args={[0.15, 16, 16]}>
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
        </Sphere>
        <Line points={[[0, 0, 0], [0, -currentPoint.z - 0.1, 0]]} color="#ffffff" lineWidth={2} dashed />
      </group>
      
      <Html position={[0, 2.5, 0]} center>
        <div className="bg-black/80 p-2 rounded border border-slate-700 text-cyan-400 font-bold text-sm">
          ΔG Surface Plot
        </div>
      </Html>
    </group>
  );
}

function ReactionVisualization({
  reactionType,
  deltaG,
  position = [0, 0, 0]
}: {
  reactionType: ReactionType;
  deltaG: number;
  position?: [number, number, number];
}) {
  const particlesRef = useRef<THREE.Group>(null);
  const [reactionProgress, setReactionProgress] = useState(0);
  
  useFrame(({ clock }) => {
    if (particlesRef.current && deltaG < 0) {
      const time = clock.getElapsedTime();
      particlesRef.current.children.forEach((particle, i) => {
        if (i % 2 === 0) {
          particle.position.x = Math.sin(time + i) * 0.5;
          particle.position.z = Math.cos(time + i) * 0.5;
        }
      });
      setReactionProgress(Math.sin(time * 0.5) * 0.5 + 0.5);
    }
  });
  
  const reactantColor = reactionType === 'exothermic' ? '#ef4444' : '#3b82f6';
  const productColor = reactionType === 'exothermic' ? '#10b981' : '#8b5cf6';
  
  return (
    <group position={position}>
      <group position={[0, 1, 0]}>
        <Cylinder args={[0.05, 0.05, 3]} position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <meshStandardMaterial color="#f59e0b" />
        </Cylinder>
        <Cone args={[0.2, 0.4, 16]} position={[1.5, 0, 0]} rotation={[0, 0, -Math.PI/2]}>
          <meshStandardMaterial color="#f59e0b" />
        </Cone>
        <Html position={[0, 0.5, 0]} center>
          <div className="bg-black/80 px-3 py-1 rounded text-sm border border-yellow-500/50 whitespace-nowrap">
            {deltaG < 0 ? 'Spontaneous →' : '← Non-spontaneous'}
          </div>
        </Html>
      </group>
      
      <group position={[-2, 0, 0]}>
        <Text position={[0, 1.2, 0]} fontSize={0.3} color={reactantColor}>Reactants</Text>
        {Array.from({ length: 8 }).map((_, i) => (
          <Sphere key={`r-${i}`} args={[0.15, 16, 16]} position={[(i % 3) * 0.3 - 0.3, Math.floor(i / 3) * 0.3, 0]}>
            <meshStandardMaterial color={reactantColor} />
          </Sphere>
        ))}
      </group>
      
      <group position={[2, 0, 0]}>
        <Text position={[0, 1.2, 0]} fontSize={0.3} color={productColor}>Products</Text>
        {Array.from({ length: 6 }).map((_, i) => (
          <Sphere key={`p-${i}`} args={[0.2, 16, 16]} position={[(i % 3) * 0.3 - 0.3, Math.floor(i / 3) * 0.3, 0]}>
            <meshStandardMaterial color={productColor} />
          </Sphere>
        ))}
      </group>
      
      {deltaG < 0 && (
        <Html position={[0, -2, 0]} center>
          <div className="bg-slate-900/80 p-2 rounded w-48">
            <div className="text-xs text-gray-300 mb-1">Progress</div>
            <div className="bg-slate-800 rounded-full h-1">
              <div className="bg-green-500 h-1 rounded-full transition-all" style={{ width: `${reactionProgress * 100}%` }} />
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// --- MAIN COMPONENT ---
export default function GibbsFreeEnergyPage() {
  const [deltaH, setDeltaH] = useState(-50);
  const [deltaS, setDeltaS] = useState(0.1);
  const [temperature, setTemperature] = useState(298);
  
  const deltaG = useMemo(() => deltaH - temperature * deltaS, [deltaH, deltaS, temperature]);
  const [viewMode, setViewMode] = useState<'equation' | 'visualization' | 'phase' | 'surface'>('equation');
  
  // Preset scenarios
  const scenarios = [
    { name: 'Spontaneous', deltaH: -50, deltaS: 0.1, temp: 298, color: '#22c55e' },
    { name: 'Non-spontaneous', deltaH: 50, deltaS: 0.1, temp: 298, color: '#ef4444' },
    { name: 'Entropy-driven', deltaH: 10, deltaS: 0.2, temp: 400, color: '#3b82f6' },
    { name: 'Phase Change', deltaH: 6, deltaS: 0.022, temp: 273, color: '#8b5cf6' }
  ];
  
  const applyScenario = (s: typeof scenarios[0]) => {
    setDeltaH(s.deltaH); setDeltaS(s.deltaS); setTemperature(s.temp);
  };
  
  return (
    <SimulationLayout
      title="Gibbs Free Energy (ΔG)"
      description="Interactive visualizer for ΔG = ΔH - TΔS. Explore the interplay between Enthalpy, Entropy, and Temperature."
      cameraPosition={[0, 1, 10]}
    >
      <Float speed={0.2} rotationIntensity={0.1} floatIntensity={0.1}>
        <group>
          {/* Top Menu */}
          <Html position={[0, 4.5, 0]} center>
            <div className="flex gap-2 bg-black/70 px-4 py-2 rounded-full backdrop-blur-md border border-slate-700">
              {(['equation', 'visualization', 'phase', 'surface'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    viewMode === mode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
          </Html>
          
          {/* === EQUATION MODE (SPLIT SCREEN) === */}
          {viewMode === 'equation' && (
            <group>
              {/* LEFT: 3D Bars */}
              <group position={[-3.5, -1, 0]}>
                <EnergyBar type="enthalpy" value={deltaH} label="ΔH" position={[-1.5, 0, 0]} />
                <EnergyBar type="entropy" value={temperature * deltaS} label="TΔS" position={[0, 0, 0]} />
                <EnergyBar type="gibbs" value={deltaG} label="ΔG" position={[1.5, 0, 0]} />
                <Html position={[0, -2.5, 0]} center>
                    <div className="text-xs text-slate-500 mt-2">Energy Values (kJ/mol)</div>
                </Html>
              </group>

              {/* RIGHT: Equation Card */}
              <GibbsEquationVisualizer
                deltaH={deltaH}
                deltaS={deltaS}
                temperature={temperature}
                deltaG={deltaG}
                position={[3.5, 0, 0]}
              />
            </group>
          )}
          
          {/* OTHER MODES */}
          {viewMode === 'visualization' && <ReactionVisualization reactionType={deltaH < 0 ? 'exothermic' : 'endothermic'} deltaG={deltaG} />}
          {viewMode === 'phase' && <PhaseChangeVisualization deltaH={deltaH} deltaS={deltaS} temperature={temperature} />}
          {viewMode === 'surface' && <GibbsSurfacePlot deltaH={deltaH} deltaS={deltaS} temperature={temperature} />}
          
          {/* Bottom Control Panel */}
          <Html position={[0, -4.5, 0]} center>
            <div className="bg-slate-900/90 backdrop-blur-lg rounded-2xl border border-slate-700 p-4 shadow-2xl w-[600px] flex gap-6">
              
              {/* Sliders */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-red-400 w-8">ΔH</span>
                    <input type="range" min="-100" max="100" step="1" value={deltaH} onChange={(e) => setDeltaH(parseFloat(e.target.value))} className="flex-1 accent-red-500" />
                    <span className="text-xs font-mono w-12 text-right">{deltaH}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-blue-400 w-8">ΔS</span>
                    <input type="range" min="-0.2" max="0.2" step="0.001" value={deltaS} onChange={(e) => setDeltaS(parseFloat(e.target.value))} className="flex-1 accent-blue-500" />
                    <span className="text-xs font-mono w-12 text-right">{deltaS.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-purple-400 w-8">Temp</span>
                    <input type="range" min="100" max="600" step="10" value={temperature} onChange={(e) => setTemperature(parseInt(e.target.value))} className="flex-1 accent-purple-500" />
                    <span className="text-xs font-mono w-12 text-right">{temperature}K</span>
                </div>
              </div>

              {/* Scenarios */}
              <div className="w-40 border-l border-slate-700 pl-4 flex flex-col gap-2 justify-center">
                 <div className="text-xs text-slate-500 font-bold uppercase mb-1">Presets</div>
                 {scenarios.map((s, i) => (
                     <button key={i} onClick={() => applyScenario(s)} className="text-xs bg-slate-800 hover:bg-slate-700 py-1 px-2 rounded text-left truncate transition-colors">
                         {s.name}
                     </button>
                 ))}
              </div>

            </div>
          </Html>

          {/* Show Side Panels only when NOT in equation mode to avoid clutter */}
          {viewMode !== 'equation' && (
             <Html position={[5, 2, 0]} center>
                <div className="bg-black/80 p-3 rounded-xl border border-green-500/30 w-64 backdrop-blur-md">
                    <div className="text-sm font-bold text-green-400 mb-2">Spontaneity Rules</div>
                    <div className="text-xs text-slate-300 space-y-1">
                        <div>ΔH &lt; 0, ΔS &gt; 0 : Always Spontaneous</div>
                        <div>ΔH &gt; 0, ΔS &lt; 0 : Never Spontaneous</div>
                        <div className="text-yellow-500 mt-1">Current: {deltaG < 0 ? 'Spontaneous' : 'Non-Spontaneous'}</div>
                    </div>
                </div>
             </Html>
          )}

        </group>
      </Float>
    </SimulationLayout>
  );
}

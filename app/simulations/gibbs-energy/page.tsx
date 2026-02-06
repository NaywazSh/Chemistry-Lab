'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Sphere, Cylinder, Box, Html, Float, Line, Text, Plane,
  Tube, Ring, Cone, Billboard
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
  const barHeight = Math.max(0.1, Math.abs(value) / 50);
  const isNegative = value < 0;
  
  return (
    <group position={position}>
      {/* Bar container (background) */}
      <Cylinder args={[width * 0.8, width * 0.8, height, 32]} position={[0, height/2, 0]}>
        <meshStandardMaterial color="#1e293b" opacity={0.3} transparent />
      </Cylinder>
      
      {/* Zero line */}
      <Plane args={[width * 2, 0.02]} position={[0, height/2, width]} rotation={[0, 0, 0]}>
        <meshBasicMaterial color="#64748b" />
      </Plane>
      
      {/* Energy bar */}
      <Cylinder 
        args={[width, width, barHeight, 32]} 
        position={[0, isNegative ? height/2 - barHeight/2 : height/2 + barHeight/2, 0]}
      >
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </Cylinder>
      
      {/* Value label */}
      <Html position={[width + 0.3, isNegative ? height/2 - barHeight : height/2 + barHeight, 0]}>
        <div className="bg-black/80 px-2 py-1 rounded text-sm backdrop-blur-sm border-2"
             style={{ borderColor: `${color}40` }}>
          <span style={{ color }} className="font-bold">{label} = </span>
          <span className="text-white">{value.toFixed(1)} kJ/mol</span>
        </div>
      </Html>
      
      {/* Arrow indicating direction */}
      <group position={[0, isNegative ? height/2 - barHeight - 0.3 : height/2 + barHeight + 0.3, 0]}>
        <Cone args={[0.15, 0.3, 16]} rotation={[0, 0, isNegative ? 0 : Math.PI]}>
          <meshStandardMaterial color={color} />
        </Cone>
      </group>
    </group>
  );
}

function PhaseChangeVisualization({
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
  const [currentPhase, setCurrentPhase] = useState<StateType>('solid');
  const particlesRef = useRef<THREE.Group>(null);
  
  // Determine which phase should be shown based on temperature
  const meltingPoint = 273; // K (0°C)
  const boilingPoint = 373; // K (100°C)
  
  useFrame(() => {
    if (temperature < meltingPoint) {
      setCurrentPhase('solid');
    } else if (temperature < boilingPoint) {
      setCurrentPhase('liquid');
    } else {
      setCurrentPhase('gas');
    }
    
    // Animate particles based on phase
    if (particlesRef.current) {
      particlesRef.current.children.forEach((particle, i) => {
        const speed = currentPhase === 'solid' ? 0.1 : 
                      currentPhase === 'liquid' ? 0.5 : 2;
        
        particle.position.x += (Math.random() - 0.5) * speed * 0.1;
        particle.position.y += (Math.random() - 0.5) * speed * 0.1;
        particle.position.z += (Math.random() - 0.5) * speed * 0.1;
        
        // Boundary checking
        ['x', 'y', 'z'].forEach(axis => {
          if (Math.abs(particle.position[axis]) > 1.5) {
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
      {/* Container */}
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
      
      {/* Phase label */}
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
      
      {/* Particles */}
      <group ref={particlesRef}>
        {Array.from({ length: particleCount }).map((_, i) => {
          const size = currentPhase === 'solid' ? 0.15 :
                       currentPhase === 'liquid' ? 0.12 : 0.08;
          
          return (
            <Sphere
              key={i}
              args={[size, 16, 16]}
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
          );
        })}
      </group>
      
      {/* Phase boundaries indicators */}
      <Html position={[-2, 0, 0]} center>
        <div className="bg-slate-900/80 p-2 rounded text-xs border border-slate-700">
          <div className="text-blue-300">Melting: {meltingPoint} K</div>
          <div className="text-orange-300">Boiling: {boilingPoint} K</div>
        </div>
      </Html>
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
  const equationRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (equationRef.current) {
      // Gentle floating animation
      equationRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }
  });
  
  const spontaneity: SpontaneityType = 
    deltaG < 0 ? 'spontaneous' : 
    deltaG > 0 ? 'non-spontaneous' : 'equilibrium';
    
  const spontaneityColor = 
    spontaneity === 'spontaneous' ? COLORS.spontaneous :
    spontaneity === 'non-spontaneous' ? COLORS.nonSpontaneous : 
    COLORS.equilibrium;
  
  return (
    <group ref={equationRef} position={position}>
      {/* Equation display */}
      <Html position={[0, 0, 0]} center>
        <div className="bg-black/80 p-6 rounded-2xl border-2 backdrop-blur-lg shadow-2xl min-w-[400px]"
             style={{ borderColor: `${COLORS.gibbs}40` }}>
          
          {/* Main equation */}
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-white mb-4">Gibbs Free Energy Equation</div>
            <div className="text-4xl font-mono space-x-4">
              <span style={{ color: COLORS.gibbs }}>ΔG</span>
              <span className="text-white">=</span>
              <span style={{ color: COLORS.enthalpy }}>ΔH</span>
              <span className="text-white">-</span>
              <span className="text-white">T</span>
              <span style={{ color: COLORS.entropy }}>ΔS</span>
            </div>
          </div>
          
          {/* Current values */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 rounded-lg bg-slate-900/50">
              <div className="text-xs text-gray-400 mb-1">ΔH (Enthalpy)</div>
              <div className="text-2xl font-bold" style={{ color: COLORS.enthalpy }}>
                {deltaH > 0 ? '+' : ''}{deltaH.toFixed(1)} kJ/mol
              </div>
              <div className="text-xs mt-1">
                {deltaH < 0 ? 'Exothermic' : 'Endothermic'}
              </div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-slate-900/50">
              <div className="text-xs text-gray-400 mb-1">ΔS (Entropy)</div>
              <div className="text-2xl font-bold" style={{ color: COLORS.entropy }}>
                {deltaS > 0 ? '+' : ''}{deltaS.toFixed(3)} kJ/mol·K
              </div>
              <div className="text-xs mt-1">
                {deltaS > 0 ? 'More disorder' : 'Less disorder'}
              </div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-slate-900/50">
              <div className="text-xs text-gray-400 mb-1">Temperature</div>
              <div className="text-2xl font-bold" style={{ color: COLORS.temperature }}>
                {temperature.toFixed(0)} K
              </div>
              <div className="text-xs mt-1">
                {(temperature - 273.15).toFixed(1)} °C
              </div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-slate-900/50">
              <div className="text-xs text-gray-400 mb-1">TΔS Term</div>
              <div className="text-2xl font-bold" style={{ color: COLORS.entropy }}>
                {(temperature * deltaS).toFixed(1)} kJ/mol
              </div>
              <div className="text-xs mt-1">T × ΔS</div>
            </div>
          </div>
          
          {/* Calculation breakdown */}
          <div className="mb-6 p-4 bg-slate-900/30 rounded-lg">
            <div className="text-sm text-gray-300 mb-2">Calculation:</div>
            <div className="text-lg font-mono text-center">
              <span style={{ color: COLORS.gibbs }}>ΔG</span>
              <span className="text-white"> = </span>
              <span style={{ color: COLORS.enthalpy }}>{deltaH.toFixed(1)}</span>
              <span className="text-white"> - </span>
              <span className="text-white">({temperature.toFixed(0)}</span>
              <span className="text-white"> × </span>
              <span style={{ color: COLORS.entropy }}>{deltaS.toFixed(3)}</span>
              <span className="text-white">)</span>
              <span className="text-white mx-4">=</span>
              <span style={{ color: spontaneityColor }} className="text-2xl">
                {deltaG.toFixed(1)} kJ/mol
              </span>
            </div>
          </div>
          
          {/* Spontaneity indicator */}
          <div className="text-center p-4 rounded-lg border-2" 
               style={{ borderColor: spontaneityColor, backgroundColor: `${spontaneityColor}10` }}>
            <div className="text-xl font-bold mb-1" style={{ color: spontaneityColor }}>
              {spontaneity.toUpperCase()}
            </div>
            <div className="text-sm text-gray-300">
              {spontaneity === 'spontaneous' ? 'Reaction proceeds spontaneously' :
               spontaneity === 'non-spontaneous' ? 'Reaction is not spontaneous' :
               'System is at equilibrium'}
            </div>
          </div>
          
          {/* Rule of thumb */}
          <div className="mt-4 text-xs text-gray-400 text-center">
            ΔG < 0: Spontaneous | ΔG > 0: Non-spontaneous | ΔG = 0: Equilibrium
          </div>
        </div>
      </Html>
      
      {/* Visual connectors to energy bars */}
      <Line
        points={[[1.5, -1, 0], [2.5, -2, 0]]}
        color={COLORS.enthalpy}
        lineWidth={1}
        dashed
        dashSize={0.1}
        gapSize={0.1}
      />
      
      <Line
        points={[[-1.5, -1, 0], [-2.5, -2, 0]]}
        color={COLORS.entropy}
        lineWidth={1}
        dashed
        dashSize={0.1}
        gapSize={0.1}
      />
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
  
  // Create surface geometry for ΔG as function of T and ΔS
  const geometry = useMemo(() => {
    const width = 6;
    const height = 4;
    const widthSegments = 32;
    const heightSegments = 32;
    
    const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
    const positions = geometry.attributes.position.array;
    
    // Warp the plane to create a 3D surface
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];     // ΔS axis
      const y = positions[i + 1]; // T axis (scaled)
      
      // Map plane coordinates to ΔS and T values
      const deltaS_val = x * 0.1; // ±0.3 kJ/mol·K
      const T_val = 200 + (y + height/2) * 100; // 100-500 K
      
      // Calculate ΔG = ΔH - TΔS
      const deltaG_val = deltaH - T_val * deltaS_val;
      
      // Set z-coordinate to ΔG value (scaled)
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
      {/* Surface plot */}
      <mesh ref={surfaceRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial 
          color={COLORS.gibbs}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          wireframe={false}
        />
      </mesh>
      
      {/* Current point on surface */}
      <group position={[currentPoint.x, currentPoint.z + 0.1, currentPoint.y]}>
        <Sphere args={[0.15, 16, 16]}>
          <meshStandardMaterial 
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={2}
          />
        </Sphere>
        
        {/* Connector line to axes */}
        <Line
          points={[[0, 0, 0], [0, -currentPoint.z - 0.1, 0]]}
          color="#ffffff"
          lineWidth={2}
          dashed
        />
      </group>
      
      {/* Axes */}
      <Line points={[[-3, 0, -2], [-3, 0, 2]]} color="#64748b" lineWidth={2}>
        <meshBasicMaterial color="#64748b" />
      </Line>
      <Text position={[-3.5, 0, 0]} fontSize={0.3} color="#94a3b8" rotation={[0, Math.PI/2, 0]}>
        ΔS
      </Text>
      
      <Line points={[[-3, 0, -2], [3, 0, -2]]} color="#64748b" lineWidth={2}>
        <meshBasicMaterial color="#64748b" />
      </Line>
      <Text position={[0, 0, -2.5]} fontSize={0.3} color="#94a3b8">
        T
      </Text>
      
      <Line points={[[-3, -0.5, -2], [-3, 1.5, -2]]} color="#64748b" lineWidth={2}>
        <meshBasicMaterial color="#64748b" />
      </Line>
      <Text position={[-3.5, 0.5, -2]} fontSize={0.3} color="#94a3b8" rotation={[0, Math.PI/2, 0]}>
        ΔG
      </Text>
      
      {/* Labels */}
      <Html position={[0, 2.5, 0]} center>
        <div className="bg-black/80 p-3 rounded-lg border border-slate-700 backdrop-blur-sm">
          <div className="text-lg font-bold text-cyan-400">ΔG = ΔH - TΔS Surface</div>
          <div className="text-sm text-gray-300">Interactive 3D visualization</div>
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
      // Animate spontaneous reaction
      const time = clock.getElapsedTime();
      particlesRef.current.children.forEach((particle, i) => {
        if (i % 2 === 0) {
          // Reactants moving to form products
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
      {/* Reaction arrow */}
      <group position={[0, 1, 0]}>
        <Cylinder args={[0.05, 0.05, 3]} position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <meshStandardMaterial color="#f59e0b" />
        </Cylinder>
        
        <Cone args={[0.2, 0.4, 16]} position={[1.5, 0, 0]} rotation={[0, 0, -Math.PI/2]}>
          <meshStandardMaterial color="#f59e0b" />
        </Cone>
        
        <Html position={[0, 0.5, 0]} center>
          <div className="bg-black/80 px-3 py-1 rounded text-sm border border-yellow-500/50">
            {deltaG < 0 ? 'Spontaneous →' : '← Non-spontaneous'}
          </div>
        </Html>
      </group>
      
      {/* Reactants */}
      <group position={[-2, 0, 0]}>
        <Text position={[0, 1.2, 0]} fontSize={0.3} color={reactantColor}>
          Reactants
        </Text>
        
        {Array.from({ length: 8 }).map((_, i) => (
          <Sphere
            key={`reactant-${i}`}
            args={[0.15, 16, 16]}
            position={[
              (i % 3) * 0.3 - 0.3,
              Math.floor(i / 3) * 0.3,
              0
            ]}
          >
            <meshStandardMaterial color={reactantColor} />
          </Sphere>
        ))}
      </group>
      
      {/* Products */}
      <group position={[2, 0, 0]}>
        <Text position={[0, 1.2, 0]} fontSize={0.3} color={productColor}>
          Products
        </Text>
        
        {Array.from({ length: 6 }).map((_, i) => (
          <Sphere
            key={`product-${i}`}
            args={[0.2, 16, 16]}
            position={[
              (i % 3) * 0.3 - 0.3,
              Math.floor(i / 3) * 0.3,
              0
            ]}
          >
            <meshStandardMaterial color={productColor} />
          </Sphere>
        ))}
      </group>
      
      {/* Energy released/absorbed */}
      <Html position={[0, -1, 0]} center>
        <div className="bg-black/80 p-3 rounded-lg border-2 backdrop-blur-sm"
             style={{ borderColor: deltaG < 0 ? '#22c55e' : '#ef4444' }}>
          <div className="text-sm font-bold" style={{ color: deltaG < 0 ? '#22c55e' : '#ef4444' }}>
            {deltaG < 0 ? 'Energy Released' : 'Energy Required'}
          </div>
          <div className="text-white">|ΔG| = {Math.abs(deltaG).toFixed(1)} kJ/mol</div>
        </div>
      </Html>
      
      {/* Reaction progress if spontaneous */}
      {deltaG < 0 && (
        <Html position={[0, -2, 0]} center>
          <div className="bg-slate-900/80 p-2 rounded">
            <div className="text-xs text-gray-300 mb-1">Reaction Progress</div>
            <div className="w-48 bg-slate-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${reactionProgress * 100}%` }}
              />
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// --- MAIN COMPONENT ---
export default function GibbsFreeEnergyPage() {
  // State for parameters
  const [deltaH, setDeltaH] = useState(-50); // kJ/mol
  const [deltaS, setDeltaS] = useState(0.1); // kJ/mol·K
  const [temperature, setTemperature] = useState(298); // K (25°C)
  
  // Calculated values
  const deltaG = useMemo(() => {
    return deltaH - temperature * deltaS;
  }, [deltaH, deltaS, temperature]);
  
  const [viewMode, setViewMode] = useState<'equation' | 'visualization' | 'phase' | 'surface'>('equation');
  
  // Preset scenarios
  const scenarios = [
    { name: 'Spontaneous', deltaH: -50, deltaS: 0.1, temp: 298, color: '#22c55e' },
    { name: 'Non-spontaneous', deltaH: 50, deltaS: 0.1, temp: 298, color: '#ef4444' },
    { name: 'Entropy-driven', deltaH: 10, deltaS: 0.2, temp: 400, color: '#3b82f6' },
    { name: 'Temperature Sensitive', deltaH: 10, deltaS: 0.05, temp: 500, color: '#f59e0b' },
    { name: 'Phase Change', deltaH: 6, deltaS: 0.022, temp: 273, color: '#8b5cf6' }
  ];
  
  const applyScenario = (scenario: typeof scenarios[0]) => {
    setDeltaH(scenario.deltaH);
    setDeltaS(scenario.deltaS);
    setTemperature(scenario.temp);
  };
  
  return (
    <SimulationLayout
      title="Gibbs Free Energy (ΔG) Visualizer"
      description="Explore how Enthalpy (ΔH), Entropy (ΔS), and Temperature (T) determine spontaneity through ΔG = ΔH - TΔS. Visualize energy changes, phase transitions, and reaction dynamics."
      cameraPosition={[0, 2, 12]}
    >
      <Float speed={0.3} rotationIntensity={0.1} floatIntensity={0.2}>
        <group>
          {/* View Mode Selector */}
          <Html position={[0, 4.5, 0]} center>
            <div className="flex gap-2 bg-black/70 px-6 py-3 rounded-full backdrop-blur-md border border-slate-700">
              {(['equation', 'visualization', 'phase', 'surface'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    viewMode === mode
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </Html>
          
          {/* Main Visualization Area */}
          {viewMode === 'equation' && (
            <group>
              {/* Gibbs Equation Visualizer */}
              <GibbsEquationVisualizer
                deltaH={deltaH}
                deltaS={deltaS}
                temperature={temperature}
                deltaG={deltaG}
                position={[0, 1, 0]}
              />
              
              {/* Energy Bars */}
              <group position={[0, -3, 0]}>
                <EnergyBar
                  type="enthalpy"
                  value={deltaH}
                  label="ΔH"
                  position={[-2.5, 0, 0]}
                  height={3}
                />
                
                <EnergyBar
                  type="entropy"
                  value={temperature * deltaS}
                  label="TΔS"
                  position={[0, 0, 0]}
                  height={3}
                />
                
                <EnergyBar
                  type="gibbs"
                  value={deltaG}
                  label="ΔG"
                  position={[2.5, 0, 0]}
                  height={3}
                />
                
                <Html position={[0, 2, 0]} center>
                  <div className="text-xs text-gray-400 bg-black/60 px-3 py-1 rounded-full">
                    Visual Energy Components
                  </div>
                </Html>
              </group>
            </group>
          )}
          
          {viewMode === 'visualization' && (
            <ReactionVisualization
              reactionType={deltaH < 0 ? 'exothermic' : 'endothermic'}
              deltaG={deltaG}
              position={[0, 0, 0]}
            />
          )}
          
          {viewMode === 'phase' && (
            <PhaseChangeVisualization
              deltaH={deltaH}
              deltaS={deltaS}
              temperature={temperature}
              position={[0, 0, 0]}
            />
          )}
          
          {viewMode === 'surface' && (
            <GibbsSurfacePlot
              deltaH={deltaH}
              deltaS={deltaS}
              temperature={temperature}
              position={[0, 0, 0]}
            />
          )}
          
          {/* Control Panel */}
          <Html position={[0, -4.5, 0]} center>
            <div className="bg-slate-900/90 backdrop-blur-lg rounded-2xl border border-slate-700 p-6 shadow-2xl w-96">
              <div className="text-white text-lg font-bold mb-4">Adjust Parameters</div>
              
              <div className="space-y-6">
                {/* ΔH Control */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium" style={{ color: COLORS.enthalpy }}>
                      Enthalpy (ΔH)
                    </span>
                    <span className="text-white font-mono">{deltaH.toFixed(1)} kJ/mol</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="1"
                    value={deltaH}
                    onChange={(e) => setDeltaH(parseFloat(e.target.value))}
                    className="w-full accent-red-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Exothermic (-)</span>
                    <span>Endothermic (+)</span>
                  </div>
                </div>
                
                {/* ΔS Control */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium" style={{ color: COLORS.entropy }}>
                      Entropy (ΔS)
                    </span>
                    <span className="text-white font-mono">{deltaS.toFixed(3)} kJ/mol·K</span>
                  </div>
                  <input
                    type="range"
                    min="-0.2"
                    max="0.2"
                    step="0.001"
                    value={deltaS}
                    onChange={(e) => setDeltaS(parseFloat(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Less disorder (-)</span>
                    <span>More disorder (+)</span>
                  </div>
                </div>
                
                {/* Temperature Control */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium" style={{ color: COLORS.temperature }}>
                      Temperature (T)
                    </span>
                    <span className="text-white font-mono">
                      {temperature} K ({(temperature - 273.15).toFixed(1)}°C)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="600"
                    step="1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseInt(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>100 K</span>
                    <span>600 K</span>
                  </div>
                </div>
                
                {/* Scenario Presets */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="text-sm font-bold text-white mb-3">Example Scenarios</div>
                  <div className="grid grid-cols-2 gap-2">
                    {scenarios.map((scenario, idx) => (
                      <button
                        key={idx}
                        onClick={() => applyScenario(scenario)}
                        className="p-2 rounded-lg text-xs font-medium transition-all hover:scale-105"
                        style={{ 
                          backgroundColor: `${scenario.color}20`,
                          border: `1px solid ${scenario.color}40`,
                          color: scenario.color
                        }}
                      >
                        {scenario.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Html>
          
          {/* Spontaneity Guide */}
          <Html position={[5, 2, 0]} center>
            <div className="bg-black/80 p-4 rounded-xl border-2 border-green-500/50 backdrop-blur-sm min-w-[280px]">
              <div className="text-lg font-bold text-green-400 mb-3">Spontaneity Rules</div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div>
                    <div className="text-sm font-bold text-white">ΔH < 0, ΔS > 0</div>
                    <div className="text-xs text-gray-400">Always spontaneous</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div>
                    <div className="text-sm font-bold text-white">ΔH > 0, ΔS < 0</div>
                    <div className="text-xs text-gray-400">Never spontaneous</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div>
                    <div className="text-sm font-bold text-white">ΔH < 0, ΔS < 0</div>
                    <div className="text-xs text-gray-400">Spontaneous at low T</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div>
                    <div className="text-sm font-bold text-white">ΔH > 0, ΔS > 0</div>
                    <div className="text-xs text-gray-400">Spontaneous at high T</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-700">
                <div className="text-xs text-gray-400">
                  Current: ΔH = {deltaH.toFixed(1)}, ΔS = {deltaS.toFixed(3)}, T = {temperature} K
                </div>
                <div className="text-sm font-bold mt-1" 
                     style={{ color: deltaG < 0 ? '#22c55e' : deltaG > 0 ? '#ef4444' : '#f59e0b' }}>
                  ΔG = {deltaG.toFixed(1)} kJ/mol → {deltaG < 0 ? 'Spontaneous' : deltaG > 0 ? 'Non-spontaneous' : 'Equilibrium'}
                </div>
              </div>
            </div>
          </Html>
          
          {/* Educational Insights */}
          <Html position={[-5, 2, 0]} center>
            <div className="bg-black/80 p-4 rounded-xl border-2 border-blue-500/50 backdrop-blur-sm min-w-[280px]">
              <div className="text-lg font-bold text-blue-400 mb-3">Key Insights</div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-white font-bold">Temperature Effect</div>
                  <div className="text-gray-400">
                    Higher temperature magnifies entropy's influence on spontaneity
                  </div>
                </div>
                
                <div>
                  <div className="text-white font-bold">Competing Factors</div>
                  <div className="text-gray-400">
                    ΔH and ΔS can work together or oppose each other
                  </div>
                </div>
                
                <div>
                  <div className="text-white font-bold">Phase Changes</div>
                  <div className="text-gray-400">
                    Melting/boiling occur when ΔG = 0 at specific T
                  </div>
                </div>
                
                <div>
                  <div className="text-white font-bold">Biological Systems</div>
                  <div className="text-gray-400">
                    Often couple spontaneous and non-spontaneous reactions
                  </div>
                </div>
              </div>
            </div>
          </Html>
          
          {/* View Mode Indicator */}
          <Html position={[0, 3.5, 0]} center>
            <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="text-xs text-slate-400">Current View:</div>
              <div className="text-sm font-bold text-white">
                {viewMode === 'equation' ? 'Equation & Energy Bars' :
                 viewMode === 'visualization' ? 'Reaction Visualization' :
                 viewMode === 'phase' ? 'Phase Change Simulation' :
                 '3D Surface Plot'}
              </div>
            </div>
          </Html>
        </group>
      </Float>
    </SimulationLayout>
  );
}

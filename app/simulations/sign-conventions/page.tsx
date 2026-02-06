'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Sphere, Cylinder, Box, Html, Float, Line, Text, Plane,
  Tube, Ring, Cone, Billboard, Torus, Octahedron
} from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

// --- Types ---
type SystemType = 'open' | 'closed' | 'isolated';
type FlowDirection = 'into' | 'out_of' | 'none';
type EnergyType = 'heat' | 'work';

// --- Constants ---
const COLORS = {
  system: '#3b82f6',          // Blue for system
  surroundings: '#94a3b8',    // Gray for surroundings
  heat: '#ef4444',            // Red for heat (q)
  work: '#f59e0b',           // Yellow for work (w)
  positive: '#10b981',        // Green for positive (+)
  negative: '#ef4444',        // Red for negative (-)
  boundary: '#8b5cf6',       // Purple for boundary
  matter: '#22c55e',         // Green for matter flow
  energy: '#f97316'          // Orange for energy
};

const SIGN_CONVENTIONS = {
  heat: {
    positive: 'Heat INTO system (endothermic)',
    negative: 'Heat OUT of system (exothermic)',
    symbol: '+q'
  },
  work: {
    positive: 'Work ON system (compression)',
    negative: 'Work BY system (expansion)',
    symbol: '+w'
  }
};

// --- Components ---

function SystemBoundary({
  type,
  position = [0, 0, 0],
  scale = 1
}: {
  type: SystemType;
  position?: [number, number, number];
  scale?: number;
}) {
  const boundaryConfig = useMemo(() => {
    const configs = {
      open: {
        name: 'Open System',
        description: 'Can exchange both matter and energy',
        boundaryColor: '#22c55e',
        boundaryStyle: 'dashed',
        opacity: 0.3
      },
      closed: {
        name: 'Closed System',
        description: 'Can exchange energy but not matter',
        boundaryColor: '#3b82f6',
        boundaryStyle: 'solid',
        opacity: 0.4
      },
      isolated: {
        name: 'Isolated System',
        description: 'Cannot exchange matter or energy',
        boundaryColor: '#ef4444',
        boundaryStyle: 'double',
        opacity: 0.5
      }
    };
    return configs[type];
  }, [type]);

  const boundaryRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (boundaryRef.current) {
      // Subtle pulsing animation
      const time = clock.getElapsedTime();
      const pulse = 1 + Math.sin(time * 0.5) * 0.05;
      boundaryRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={position} scale={scale} ref={boundaryRef}>
      {/* Main system sphere */}
      <Sphere args={[1.5, 32, 32]}>
        <meshPhysicalMaterial
          color={boundaryConfig.boundaryColor}
          transmission={0.8}
          opacity={boundaryConfig.opacity}
          transparent
          roughness={0.1}
          thickness={0.2}
          side={THREE.DoubleSide}
        />
      </Sphere>
      
      {/* Boundary style visualization */}
      {type === 'open' && (
        <>
          {/* Dashed boundary */}
          <Ring args={[1.6, 1.7, 64]} rotation={[Math.PI/2, 0, 0]}>
            <meshBasicMaterial 
              color={boundaryConfig.boundaryColor}
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </Ring>
          <Ring args={[1.4, 1.5, 64]} rotation={[0, Math.PI/2, 0]}>
            <meshBasicMaterial 
              color={boundaryConfig.boundaryColor}
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </Ring>
        </>
      )}
      
      {type === 'isolated' && (
        <>
          {/* Double boundary */}
          <Ring args={[1.7, 1.8, 64]} rotation={[Math.PI/2, 0, 0]}>
            <meshBasicMaterial 
              color={boundaryConfig.boundaryColor}
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </Ring>
          <Ring args={[1.3, 1.4, 64]} rotation={[Math.PI/2, 0, 0]}>
            <meshBasicMaterial 
              color={boundaryConfig.boundaryColor}
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </Ring>
        </>
      )}
      
      {/* System label */}
      <Html position={[0, 2, 0]} center>
        <div className="bg-black/80 p-3 rounded-xl border-2 backdrop-blur-sm"
             style={{ borderColor: boundaryConfig.boundaryColor }}>
          <div className="text-lg font-bold" style={{ color: boundaryConfig.boundaryColor }}>
            {boundaryConfig.name}
          </div>
          <div className="text-sm text-gray-300">{boundaryConfig.description}</div>
        </div>
      </Html>
      
      {/* Center point */}
      <Sphere args={[0.1, 16, 16]}>
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
      </Sphere>
    </group>
  );
}

function EnergyFlowArrow({
  type,
  direction,
  magnitude,
  position = [0, 0, 0],
  label,
  showSign = true
}: {
  type: EnergyType;
  direction: FlowDirection;
  magnitude: number;
  position?: [number, number, number];
  label?: string;
  showSign?: boolean;
}) {
  const arrowRef = useRef<THREE.Group>(null);
  const color = type === 'heat' ? COLORS.heat : COLORS.work;
  const isIntoSystem = direction === 'into';
  
  // Arrow length based on magnitude
  const arrowLength = Math.max(0.5, Math.abs(magnitude) / 20);
  
  useFrame(({ clock }) => {
    if (arrowRef.current && direction !== 'none') {
      // Flow animation
      const time = clock.getElapsedTime();
      arrowRef.current.position.x = Math.sin(time * 1.5) * 0.1;
      arrowRef.current.position.z = Math.cos(time * 1.5) * 0.1;
    }
  });
  
  return (
    <group ref={arrowRef} position={position}>
      {/* Arrow shaft */}
      <Cylinder 
        args={[0.08, 0.08, arrowLength, 16]} 
        position={[0, 0, isIntoSystem ? -arrowLength/2 : arrowLength/2]}
        rotation={[0, 0, Math.PI/2]}
      >
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </Cylinder>
      
      {/* Arrow head */}
      <Cone 
        args={[0.2, 0.4, 16]} 
        position={[0, 0, isIntoSystem ? -arrowLength : arrowLength]}
        rotation={[0, 0, isIntoSystem ? Math.PI/2 : -Math.PI/2]}
      >
        <meshStandardMaterial color={color} />
      </Cone>
      
      {/* Energy particles flowing along arrow */}
      {direction !== 'none' && (
        <group>
          {Array.from({ length: 5 }).map((_, i) => {
            const progress = ((Date.now() * 0.001 + i * 0.2) % 1);
            const zPos = isIntoSystem 
              ? -progress * arrowLength
              : progress * arrowLength;
            
            return (
              <Sphere key={i} args={[0.05, 8, 8]} position={[0, 0, zPos]}>
                <meshStandardMaterial 
                  color={color}
                  emissive={color}
                  emissiveIntensity={2}
                />
              </Sphere>
            );
          })}
        </group>
      )}
      
      {/* Label */}
      <Html position={[0.5, 0, isIntoSystem ? -arrowLength/2 : arrowLength/2]}>
        <div className="bg-black/80 px-3 py-1 rounded-lg backdrop-blur-sm border-2 min-w-[120px]"
             style={{ borderColor: `${color}40` }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
            <div>
              <div className="text-sm font-bold" style={{ color }}>
                {type === 'heat' ? 'Heat (q)' : 'Work (w)'}
              </div>
              {label && (
                <div className="text-xs text-gray-300">{label}</div>
              )}
            </div>
          </div>
          
          {showSign && (
            <div className="mt-1 flex items-center justify-between">
              <div className="text-xs text-gray-400">Sign:</div>
              <div className={`text-sm font-bold ${isIntoSystem ? 'text-green-500' : 'text-red-500'}`}>
                {isIntoSystem ? '+' : '-'}
              </div>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

function MatterFlow({
  direction,
  intensity,
  position = [0, 0, 0]
}: {
  direction: FlowDirection;
  intensity: number;
  position?: [number, number, number];
}) {
  const particlesRef = useRef<THREE.Group>(null);
  const isIntoSystem = direction === 'into';
  
  useFrame(() => {
    if (particlesRef.current && direction !== 'none') {
      particlesRef.current.children.forEach((particle, i) => {
        const speed = intensity * 0.02;
        if (isIntoSystem) {
          particle.position.z -= speed;
          if (particle.position.z < -3) {
            particle.position.z = 3;
          }
        } else {
          particle.position.z += speed;
          if (particle.position.z > 3) {
            particle.position.z = -3;
          }
        }
      });
    }
  });
  
  return (
    <group position={position}>
      {/* Flow channel */}
      <Cylinder args={[0.3, 0.3, 6, 16]} rotation={[Math.PI/2, 0, 0]}>
        <meshPhysicalMaterial
          color="#22c55e"
          transmission={0.9}
          opacity={0.2}
          transparent
          thickness={0.1}
          side={THREE.DoubleSide}
        />
      </Cylinder>
      
      {/* Matter particles */}
      <group ref={particlesRef}>
        {Array.from({ length: 15 }).map((_, i) => {
          const spacing = 6 / 15;
          const zPos = -3 + i * spacing;
          
          return (
            <Octahedron key={i} args={[0.1, 0]} position={[0, 0, zPos]}>
              <meshStandardMaterial 
                color="#22c55e"
                emissive="#22c55e"
                emissiveIntensity={0.5}
              />
            </Octahedron>
          );
        })}
      </group>
      
      {/* Direction indicator */}
      <Html position={[0.5, 0, 0]} center>
        <div className="bg-black/80 px-3 py-1 rounded border border-green-500/50">
          <div className="text-xs font-bold text-green-400">Matter Flow</div>
          <div className="text-xs text-gray-300">
            {direction === 'into' ? 'INTO system' : 
             direction === 'out_of' ? 'OUT of system' : 
             'No flow'}
          </div>
        </div>
      </Html>
    </group>
  );
}

function SignConventionVisualizer({
  energyType,
  sign,
  position = [0, 0, 0]
}: {
  energyType: EnergyType;
  sign: 'positive' | 'negative';
  position?: [number, number, number];
}) {
  const convention = SIGN_CONVENTIONS[energyType];
  const color = energyType === 'heat' ? COLORS.heat : COLORS.work;
  const isPositive = sign === 'positive';
  
  return (
    <group position={position}>
      <Html center>
        <div className="bg-black/80 p-4 rounded-xl border-2 backdrop-blur-sm w-64"
             style={{ borderColor: color }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl font-bold" style={{ color }}>
              {isPositive ? '+' : '-'}
            </div>
            <div>
              <div className="text-lg font-bold" style={{ color }}>
                {energyType === 'heat' ? 'q' : 'w'}
              </div>
              <div className="text-sm text-gray-300">Sign Convention</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
              <div className="text-sm text-gray-300">Sign</div>
              <div className={`text-lg font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+ (Positive)' : '- (Negative)'}
              </div>
            </div>
            
            <div className="p-2 bg-slate-900/50 rounded">
              <div className="text-sm text-gray-300 mb-1">Meaning:</div>
              <div className="text-sm" style={{ color }}>
                {isPositive ? convention.positive : convention.negative}
              </div>
            </div>
            
            <div className="p-2 bg-slate-900/50 rounded">
              <div className="text-sm text-gray-300 mb-1">Energy Flow:</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" 
                     style={{ backgroundColor: isPositive ? COLORS.positive : COLORS.negative }}></div>
                <div className="text-sm">
                  {isPositive ? 'Energy INTO system' : 'Energy OUT of system'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-slate-700">
            <div className="text-xs text-gray-400">
              Remember: {convention.symbol} = {isPositive ? 'system gains energy' : 'system loses energy'}
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

function SystemComparison({
  activeSystem,
  position = [0, 0, 0]
}: {
  activeSystem: SystemType;
  position?: [number, number, number];
}) {
  const systems: SystemType[] = ['open', 'closed', 'isolated'];
  
  return (
    <group position={position}>
      {/* Comparison grid */}
      <Html center>
        <div className="bg-black/80 p-6 rounded-2xl border-2 border-purple-500/50 backdrop-blur-lg shadow-2xl min-w-[500px]">
          <div className="text-xl font-bold text-purple-400 mb-6 text-center">
            System Comparison Table
          </div>
          
          <div className="grid grid-cols-4 gap-4 text-sm">
            {/* Headers */}
            <div className="font-bold text-gray-300">Property</div>
            <div className={`font-bold text-center p-2 rounded ${activeSystem === 'open' ? 'ring-2 ring-green-500' : ''}`}
                 style={{ color: activeSystem === 'open' ? '#22c55e' : '#94a3b8' }}>
              Open
            </div>
            <div className={`font-bold text-center p-2 rounded ${activeSystem === 'closed' ? 'ring-2 ring-blue-500' : ''}`}
                 style={{ color: activeSystem === 'closed' ? '#3b82f6' : '#94a3b8' }}>
              Closed
            </div>
            <div className={`font-bold text-center p-2 rounded ${activeSystem === 'isolated' ? 'ring-2 ring-red-500' : ''}`}
                 style={{ color: activeSystem === 'isolated' ? '#ef4444' : '#94a3b8' }}>
              Isolated
            </div>
            
            {/* Rows */}
            {[
              { property: 'Matter Exchange', open: '✓ Yes', closed: '✗ No', isolated: '✗ No' },
              { property: 'Energy Exchange', open: '✓ Yes', closed: '✓ Yes', isolated: '✗ No' },
              { property: 'Heat Flow (q)', open: '✓ Possible', closed: '✓ Possible', isolated: '✗ Impossible' },
              { property: 'Work Flow (w)', open: '✓ Possible', closed: '✓ Possible', isolated: '✗ Impossible' },
              { property: 'Boundary Type', open: 'Permeable', closed: 'Impermeable', isolated: 'Adiabatic' },
              { property: 'Real Example', open: 'Open beaker', closed: 'Sealed flask', isolated: 'Thermos flask' }
            ].map((row, idx) => (
              <React.Fragment key={idx}>
                <div className="text-gray-300 p-2">{row.property}</div>
                <div className="text-center p-2 bg-slate-900/30 rounded" style={{ color: activeSystem === 'open' ? '#22c55e' : '#94a3b8' }}>
                  {row.open}
                </div>
                <div className="text-center p-2 bg-slate-900/30 rounded" style={{ color: activeSystem === 'closed' ? '#3b82f6' : '#94a3b8' }}>
                  {row.closed}
                </div>
                <div className="text-center p-2 bg-slate-900/30 rounded" style={{ color: activeSystem === 'isolated' ? '#ef4444' : '#94a3b8' }}>
                  {row.isolated}
                </div>
              </React.Fragment>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-700">
            <div className="text-sm text-gray-400">
              <span className="font-bold text-white">Key Insight:</span> The system boundary determines what can be exchanged with surroundings
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

function InteractiveFlowControl({
  systemType,
  onHeatFlowChange,
  onWorkFlowChange,
  onMatterFlowChange,
  position = [0, 0, 0]
}: {
  systemType: SystemType;
  onHeatFlowChange: (flow: FlowDirection) => void;
  onWorkFlowChange: (flow: FlowDirection) => void;
  onMatterFlowChange: (flow: FlowDirection) => void;
  position?: [number, number, number];
}) {
  const [heatFlow, setHeatFlow] = useState<FlowDirection>('into');
  const [workFlow, setWorkFlow] = useState<FlowDirection>('out_of');
  const [matterFlow, setMatterFlow] = useState<FlowDirection>('into');
  
  const handleHeatFlow = (flow: FlowDirection) => {
    setHeatFlow(flow);
    onHeatFlowChange(flow);
  };
  
  const handleWorkFlow = (flow: FlowDirection) => {
    setWorkFlow(flow);
    onWorkFlowChange(flow);
  };
  
  const handleMatterFlow = (flow: FlowDirection) => {
    setMatterFlow(flow);
    onMatterFlowChange(flow);
  };
  
  const isIsolated = systemType === 'isolated';
  const isClosed = systemType === 'closed';
  
  return (
    <group position={position}>
      <Html center>
        <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-700 backdrop-blur-lg w-96">
          <div className="text-white text-lg font-bold mb-4">Flow Control Panel</div>
          
          {/* Heat Flow Control */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm font-bold text-red-400">Heat Flow (q)</span>
              </div>
              <div className={`text-sm font-bold ${heatFlow === 'into' ? 'text-green-500' : heatFlow === 'out_of' ? 'text-red-500' : 'text-gray-500'}`}>
                {heatFlow === 'into' ? '+q (INTO system)' : 
                 heatFlow === 'out_of' ? '-q (OUT of system)' : 
                 'No flow'}
              </div>
            </div>
            
            <div className="flex gap-2">
              {['into', 'none', 'out_of'].map((flow) => (
                <button
                  key={flow}
                  onClick={() => handleHeatFlow(flow as FlowDirection)}
                  disabled={isIsolated}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    heatFlow === flow
                      ? 'ring-2 ring-offset-1 ring-offset-black'
                      : 'opacity-90 hover:opacity-100'
                  } ${isIsolated ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ 
                    backgroundColor: heatFlow === flow 
                      ? (flow === 'into' ? '#10b981' : flow === 'out_of' ? '#ef4444' : '#64748b')
                      : '#1e293b',
                    color: 'white'
                  }}
                >
                  {flow === 'into' ? 'IN (+)' : 
                   flow === 'out_of' ? 'OUT (-)' : 
                   'None'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Work Flow Control */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm font-bold text-yellow-400">Work Flow (w)</span>
              </div>
              <div className={`text-sm font-bold ${workFlow === 'into' ? 'text-green-500' : workFlow === 'out_of' ? 'text-red-500' : 'text-gray-500'}`}>
                {workFlow === 'into' ? '+w (ON system)' : 
                 workFlow === 'out_of' ? '-w (BY system)' : 
                 'No flow'}
              </div>
            </div>
            
            <div className="flex gap-2">
              {['into', 'none', 'out_of'].map((flow) => (
                <button
                  key={flow}
                  onClick={() => handleWorkFlow(flow as FlowDirection)}
                  disabled={isIsolated}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    workFlow === flow
                      ? 'ring-2 ring-offset-1 ring-offset-black'
                      : 'opacity-90 hover:opacity-100'
                  } ${isIsolated ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ 
                    backgroundColor: workFlow === flow 
                      ? (flow === 'into' ? '#10b981' : flow === 'out_of' ? '#ef4444' : '#64748b')
                      : '#1e293b',
                    color: 'white'
                  }}
                >
                  {flow === 'into' ? 'ON (+)' : 
                   flow === 'out_of' ? 'BY (-)' : 
                   'None'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Matter Flow Control */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-bold text-green-400">Matter Flow</span>
              </div>
              <div className={`text-sm font-bold ${matterFlow === 'into' ? 'text-green-500' : matterFlow === 'out_of' ? 'text-red-500' : 'text-gray-500'}`}>
                {matterFlow === 'into' ? 'INTO system' : 
                 matterFlow === 'out_of' ? 'OUT of system' : 
                 'No flow'}
              </div>
            </div>
            
            <div className="flex gap-2">
              {['into', 'none', 'out_of'].map((flow) => (
                <button
                  key={flow}
                  onClick={() => handleMatterFlow(flow as FlowDirection)}
                  disabled={isClosed || isIsolated}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    matterFlow === flow
                      ? 'ring-2 ring-offset-1 ring-offset-black'
                      : 'opacity-90 hover:opacity-100'
                  } ${(isClosed || isIsolated) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ 
                    backgroundColor: matterFlow === flow 
                      ? (flow === 'into' ? '#10b981' : flow === 'out_of' ? '#ef4444' : '#64748b')
                      : '#1e293b',
                    color: 'white'
                  }}
                >
                  {flow === 'into' ? 'IN' : 
                   flow === 'out_of' ? 'OUT' : 
                   'None'}
                </button>
              ))}
            </div>
          </div>
          
          {/* System constraints info */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="text-xs text-gray-400">
              <span className="font-bold text-white">Constraints:</span>
              {isIsolated ? ' Isolated systems allow NO energy or matter flow' :
               isClosed ? ' Closed systems allow energy flow but NO matter flow' :
               ' Open systems allow both energy and matter flow'}
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

function FirstLawVisualization({
  heatFlow,
  workFlow,
  internalEnergy,
  position = [0, 0, 0]
}: {
  heatFlow: number;
  workFlow: number;
  internalEnergy: number;
  position?: [number, number, number];
}) {
  // First Law: ΔU = q + w
  const deltaU = heatFlow + workFlow;
  
  return (
    <group position={position}>
      <Html center>
        <div className="bg-black/80 p-6 rounded-2xl border-2 border-blue-500/50 backdrop-blur-lg min-w-[350px]">
          <div className="text-xl font-bold text-blue-400 mb-6 text-center">
            First Law of Thermodynamics
          </div>
          
          {/* Equation */}
          <div className="text-3xl font-mono text-center mb-6 space-x-4">
            <span style={{ color: COLORS.heat }}>q</span>
            <span className="text-white">+</span>
            <span style={{ color: COLORS.work }}>w</span>
            <span className="text-white">=</span>
            <span className="text-cyan-400">ΔU</span>
          </div>
          
          {/* Current values */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 rounded-lg bg-slate-900/50">
              <div className="text-xs text-gray-400 mb-1">Heat (q)</div>
              <div className="text-xl font-bold" style={{ color: COLORS.heat }}>
                {heatFlow > 0 ? '+' : ''}{heatFlow.toFixed(1)} kJ
              </div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-slate-900/50">
              <div className="text-xs text-gray-400 mb-1">Work (w)</div>
              <div className="text-xl font-bold" style={{ color: COLORS.work }}>
                {workFlow > 0 ? '+' : ''}{workFlow.toFixed(1)} kJ
              </div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-slate-900/50 col-span-2">
              <div className="text-xs text-gray-400 mb-1">Change in Internal Energy (ΔU)</div>
              <div className="text-2xl font-bold text-cyan-400">
                {deltaU > 0 ? '+' : ''}{deltaU.toFixed(1)} kJ
              </div>
            </div>
          </div>
          
          {/* Energy balance visualization */}
          <div className="mb-6">
            <div className="text-sm text-gray-300 mb-2">Energy Balance:</div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-yellow-500 transition-all"
                style={{ width: `${Math.min(100, Math.abs(heatFlow + workFlow) * 10)}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Positive ΔU: System gains energy | Negative ΔU: System loses energy
            </div>
          </div>
          
          {/* Interpretation */}
          <div className="p-3 bg-slate-900/30 rounded-lg">
            <div className="text-sm text-gray-300 mb-1">Interpretation:</div>
            <div className="text-sm">
              {deltaU > 0 ? (
                <span className="text-green-400">System gains {deltaU.toFixed(1)} kJ of internal energy</span>
              ) : deltaU < 0 ? (
                <span className="text-red-400">System loses {Math.abs(deltaU).toFixed(1)} kJ of internal energy</span>
              ) : (
                <span className="text-yellow-400">System internal energy unchanged</span>
              )}
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

// --- MAIN COMPONENT ---
export default function SignConventionsSystemsPage() {
  const [systemType, setSystemType] = useState<SystemType>('open');
  const [heatFlow, setHeatFlow] = useState<FlowDirection>('into');
  const [workFlow, setWorkFlow] = useState<FlowDirection>('out_of');
  const [matterFlow, setMatterFlow] = useState<FlowDirection>('into');
  const [viewMode, setViewMode] = useState<'visualization' | 'comparison' | 'first_law'>('visualization');
  
  // Calculate flow values (simplified)
  const heatValue = heatFlow === 'into' ? 10 : heatFlow === 'out_of' ? -10 : 0;
  const workValue = workFlow === 'into' ? 5 : workFlow === 'out_of' ? -5 : 0;
  const matterIntensity = matterFlow === 'into' ? 1 : matterFlow === 'out_of' ? 1 : 0;
  
  return (
    <SimulationLayout
      title="Thermodynamic Sign Conventions & Systems"
      description="Master the sign conventions for work (w) and heat (q) and explore open, closed, and isolated systems. Visualize energy and matter flows with interactive controls."
      cameraPosition={[0, 2, 15]}
    >
      <Float speed={0.3} rotationIntensity={0.1} floatIntensity={0.2}>
        <group>
          {/* View Mode Selector */}
          <Html position={[0, 5, 0]} center>
            <div className="flex gap-2 bg-black/70 px-6 py-3 rounded-full backdrop-blur-md border border-slate-700">
              {(['visualization', 'comparison', 'first_law'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    viewMode === mode
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {mode === 'visualization' ? '3D Visualization' :
                   mode === 'comparison' ? 'System Comparison' :
                   'First Law'}
                </button>
              ))}
            </div>
          </Html>
          
          {/* System Type Selector */}
          <Html position={[0, 3.5, 0]} center>
            <div className="flex gap-2 bg-black/70 px-4 py-2 rounded-full backdrop-blur-md border border-slate-700">
              {(['open', 'closed', 'isolated'] as SystemType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSystemType(type);
                    if (type === 'isolated') {
                      setHeatFlow('none');
                      setWorkFlow('none');
                      setMatterFlow('none');
                    } else if (type === 'closed') {
                      setMatterFlow('none');
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    systemType === type
                      ? 'ring-2 ring-offset-1 ring-offset-black text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                  style={systemType === type ? { 
                    backgroundColor: 
                      type === 'open' ? '#22c55e' :
                      type === 'closed' ? '#3b82f6' : '#ef4444'
                  } : {}}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)} System
                </button>
              ))}
            </div>
          </Html>
          
          {/* Main Visualization */}
          {viewMode === 'visualization' && (
            <group>
              {/* System Boundary */}
              <SystemBoundary type={systemType} position={[0, 0, 0]} scale={1.2} />
              
              {/* Energy and Matter Flows */}
              <group>
                {/* Heat Flow */}
                <EnergyFlowArrow
                  type="heat"
                  direction={heatFlow}
                  magnitude={heatValue}
                  position={[-3, 1.5, 0]}
                  label={heatFlow === 'into' ? 'Heat into system (+q)' : 
                         heatFlow === 'out_of' ? 'Heat out of system (-q)' : 
                         'No heat flow'}
                  showSign={true}
                />
                
                {/* Work Flow */}
                <EnergyFlowArrow
                  type="work"
                  direction={workFlow}
                  magnitude={workValue}
                  position={[3, 1.5, 0]}
                  label={workFlow === 'into' ? 'Work on system (+w)' : 
                         workFlow === 'out_of' ? 'Work by system (-w)' : 
                         'No work flow'}
                  showSign={true}
                />
                
                {/* Matter Flow (only for open systems) */}
                {systemType === 'open' && (
                  <MatterFlow
                    direction={matterFlow}
                    intensity={matterIntensity}
                    position={[0, -2, 0]}
                  />
                )}
                
                {/* Surroundings */}
                <Html position={[-4, -2, 0]} center>
                  <div className="bg-black/80 p-3 rounded-xl border border-gray-500/50">
                    <div className="text-sm font-bold text-gray-400">Surroundings</div>
                  </div>
                </Html>
                
                <Html position={[4, -2, 0]} center>
                  <div className="bg-black/80 p-3 rounded-xl border border-gray-500/50">
                    <div className="text-sm font-bold text-gray-400">Surroundings</div>
                  </div>
                </Html>
              </group>
              
              {/* Sign Convention Visualizers */}
              <group>
                <SignConventionVisualizer
                  energyType="heat"
                  sign={heatFlow === 'into' ? 'positive' : 'negative'}
                  position={[-6, 0, 0]}
                />
                
                <SignConventionVisualizer
                  energyType="work"
                  sign={workFlow === 'into' ? 'positive' : 'negative'}
                  position={[6, 0, 0]}
                />
              </group>
              
              {/* Flow Control Panel */}
              <InteractiveFlowControl
                systemType={systemType}
                onHeatFlowChange={setHeatFlow}
                onWorkFlowChange={setWorkFlow}
                onMatterFlowChange={setMatterFlow}
                position={[0, -4.5, 0]}
              />
            </group>
          )}
          
          {viewMode === 'comparison' && (
            <SystemComparison activeSystem={systemType} position={[0, 0, 0]} />
          )}
          
          {viewMode === 'first_law' && (
            <FirstLawVisualization
              heatFlow={heatValue}
              workFlow={workValue}
              internalEnergy={0}
              position={[0, 0, 0]}
            />
          )}
          
          {/* Memory Aid */}
          <Html position={[-7, 2, 0]} center>
            <div className="bg-black/80 p-4 rounded-xl border-2 border-yellow-500/50 backdrop-blur-sm min-w-[250px]">
              <div className="text-lg font-bold text-yellow-400 mb-3">Memory Aid</div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-xs font-bold">+q</span>
                  </div>
                  <div>
                    <div className="font-bold text-white">Heat IN = +q</div>
                    <div className="text-xs text-gray-400">System gains heat</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                    <span className="text-xs font-bold">+w</span>
                  </div>
                  <div>
                    <div className="font-bold text-white">Work ON = +w</div>
                    <div className="text-xs text-gray-400">System is compressed</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-xs font-bold">Open</span>
                  </div>
                  <div>
                    <div className="font-bold text-white">Open System</div>
                    <div className="text-xs text-gray-400">Both matter & energy flow</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-700">
                <div className="text-xs text-gray-400">
                  <span className="font-bold text-white">Tip:</span> Signs are from the system's perspective
                </div>
              </div>
            </div>
          </Html>
          
          {/* Real-World Examples */}
          <Html position={[7, 2, 0]} center>
            <div className="bg-black/80 p-4 rounded-xl border-2 border-green-500/50 backdrop-blur-sm min-w-[250px]">
              <div className="text-lg font-bold text-green-400 mb-3">Real Examples</div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Open System
                  </div>
                  <div className="text-xs text-gray-400 ml-4">• Open beaker of water<br/>• Human body<br/>• Car engine</div>
                </div>
                
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Closed System
                  </div>
                  <div className="text-xs text-gray-400 ml-4">• Sealed soda can<br/>• Piston with gas<br/>• Pressure cooker</div>
                </div>
                
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    Isolated System
                  </div>
                  <div className="text-xs text-gray-400 ml-4">• Thermos flask<br/>• Ideal calorimeter<br/>• Universe (theoretical)</div>
                </div>
              </div>
            </div>
          </Html>
          
          {/* Current State Display */}
          <Html position={[0, -2.5, 0]} center>
            <div className="flex items-center gap-4 bg-black/60 px-6 py-3 rounded-full backdrop-blur-md border border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ 
                  backgroundColor: 
                    systemType === 'open' ? '#22c55e' :
                    systemType === 'closed' ? '#3b82f6' : '#ef4444'
                }}></div>
                <div className="text-sm text-white font-bold">{systemType.toUpperCase()} SYSTEM</div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="text-xs text-gray-300">q = {heatValue > 0 ? '+' : ''}{heatValue}</div>
                </div>
                
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="text-xs text-gray-300">w = {workValue > 0 ? '+' : ''}{workValue}</div>
                </div>
                
                {systemType === 'open' && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="text-xs text-gray-300">Matter = {matterFlow === 'into' ? 'IN' : 'OUT'}</div>
                  </div>
                )}
              </div>
            </div>
          </Html>
        </group>
      </Float>
    </SimulationLayout>
  );
}

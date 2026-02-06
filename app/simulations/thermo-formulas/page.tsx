'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Sphere, Cylinder, Box, Html, Float, Line, Text, Plane,
  Tube, Ring, Cone, Icosahedron
} from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

// --- Types ---
type FormulaType = 'first_law' | 'hess_law' | 'heat_capacity' | 'enthalpy' | 'gibbs' | 'entropy';
type GasType = 'monatomic' | 'diatomic' | 'polyatomic';

// --- Constants ---
// FIX: Keys now match FormulaType (snake_case)
const COLORS = {
  first_law: '#ef4444',        // Red
  hess_law: '#3b82f6',         // Blue
  heat_capacity: '#10b981',    // Green
  enthalpy: '#f59e0b',         // Yellow
  gibbs: '#8b5cf6',            // Purple
  entropy: '#ec4899',          // Pink
  variable: '#22c55e',         // Bright green for variables
  constant: '#94a3b8',         // Gray for constants
  energy: '#f97316',           // Orange for energy
  temperature: '#06b6d4'       // Cyan for temperature
};

const GAS_PROPERTIES = {
  monatomic: { Cv: 3/2 * 8.314, Cp: 5/2 * 8.314, gamma: 5/3, color: '#3b82f6' },
  diatomic: { Cv: 5/2 * 8.314, Cp: 7/2 * 8.314, gamma: 7/5, color: '#10b981' },
  polyatomic: { Cv: 3 * 8.314, Cp: 4 * 8.314, gamma: 4/3, color: '#ec4899' }
};

// --- Components ---

function FormulaCard({
  formula,
  title,
  description,
  variables,
  position = [0, 0, 0],
  isActive = false,
  onClick
}: {
  formula: FormulaType;
  title: string;
  description: string;
  variables: Array<{symbol: string; meaning: string; unit: string}>;
  position?: [number, number, number];
  isActive?: boolean;
  onClick: () => void;
}) {
  const cardRef = useRef<THREE.Group>(null);
  const color = COLORS[formula];
  
  useFrame(({ clock }) => {
    if (cardRef.current && isActive) {
      // Gentle floating animation for active card
      cardRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <group ref={cardRef} position={position}>
      <Html center>
        <button
          onClick={onClick}
          className={`p-4 rounded-xl backdrop-blur-md border-2 transition-all duration-300 hover:scale-105 min-w-[280px] text-left ${
            isActive ? 'scale-105 shadow-2xl' : 'shadow-lg'
          }`}
          style={{ 
            backgroundColor: isActive ? `${color}30` : 'rgba(15, 23, 42, 0.8)',
            borderColor: isActive ? color : `${color}40`
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-4 h-4 rounded-full ${isActive ? 'animate-pulse' : ''}`} 
                 style={{ backgroundColor: color }}></div>
            <div className="text-lg font-bold text-white">{title}</div>
          </div>
          
          <div className="text-xl font-mono text-white my-4 text-center bg-black/40 p-2 rounded border border-slate-700">
            {formula === 'first_law' && 'ΔU = q + w'}
            {formula === 'hess_law' && 'ΔH° = ΣΔH°(prod) - ΣΔH°(react)'}
            {formula === 'heat_capacity' && 'q = m·C·ΔT'}
            {formula === 'enthalpy' && 'ΔH = ΔU + PΔV'}
            {formula === 'gibbs' && 'ΔG = ΔH - TΔS'}
            {formula === 'entropy' && 'ΔS = q_rev/T'}
          </div>
          
          <div className="text-sm text-gray-300 mb-4 italic">{description}</div>
          
          <div className="space-y-1">
            {variables.map((varItem, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs p-1 hover:bg-white/5 rounded">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold" style={{ color: COLORS.variable }}>
                    {varItem.symbol}
                  </span>
                  <span className="text-gray-400">{varItem.meaning}</span>
                </div>
                <span className="text-blue-300 font-mono">{varItem.unit}</span>
              </div>
            ))}
          </div>
        </button>
      </Html>
      
      {/* Glow effect for active card */}
      {isActive && (
        <Ring args={[2.5, 2.6, 32]} rotation={[0, 0, 0]}>
          <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
        </Ring>
      )}
    </group>
  );
}

function FirstLawVisualization({
  q,
  w,
  deltaU,
  position = [0, 0, 0]
}: {
  q: number;
  w: number;
  deltaU: number;
  position?: [number, number, number];
}) {
  const pistonRef = useRef<THREE.Group>(null);
  const heatParticlesRef = useRef<THREE.Group>(null);
  
  // Calculate piston position based on work
  const pistonHeight = 2 + (w / 100);
  const gasExpansion = w < 0 ? 0.5 : -0.5;
  
  useFrame(({ clock }) => {
    if (pistonRef.current) {
      const time = clock.getElapsedTime();
      pistonRef.current.position.y = Math.sin(time * 0.3) * gasExpansion;
    }
    
    if (heatParticlesRef.current) {
      const time = clock.getElapsedTime();
      heatParticlesRef.current.children.forEach((particle, i) => {
        if (q > 0) {
          particle.position.x = Math.sin(time + i) * 0.5;
          particle.position.y = Math.cos(time + i) * 0.5;
          particle.position.z = -1 + (time * 0.5 + i * 0.2) % 2;
        } else if (q < 0) {
          particle.position.x = Math.sin(time + i) * 0.5;
          particle.position.y = Math.cos(time + i) * 0.5;
          particle.position.z = 1 - (time * 0.5 + i * 0.2) % 2;
        }
      });
    }
  });

  return (
    <group position={position}>
      {/* Piston-cylinder system */}
      <group>
        <Cylinder args={[1.2, 1.2, 4, 32]}>
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.9}
            opacity={0.2}
            transparent
            roughness={0.1}
            thickness={0.2}
            side={THREE.DoubleSide}
          />
        </Cylinder>
        
        <Cylinder args={[1, 1, pistonHeight, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color={deltaU > 0 ? '#ef4444' : '#3b82f6'}
            transparent
            opacity={0.4}
          />
        </Cylinder>
        
        <group ref={pistonRef}>
          <Cylinder args={[1.1, 1.1, 0.2, 32]} position={[0, pistonHeight/2, 0]}>
            <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
          </Cylinder>
        </group>
        
        <group>
          {Array.from({ length: 20 }).map((_, i) => (
            <Sphere
              key={i}
              args={[0.08, 16, 16]}
              position={[
                (Math.random() - 0.5) * 1.8,
                (Math.random() - 0.5) * pistonHeight,
                (Math.random() - 0.5) * 1.8
              ]}
            >
              <meshStandardMaterial 
                color={deltaU > 0 ? '#f97316' : '#3b82f6'}
                emissive={deltaU > 0 ? '#f97316' : '#3b82f6'}
                emissiveIntensity={0.5}
              />
            </Sphere>
          ))}
        </group>
      </group>
      
      {/* Heat particles */}
      <group ref={heatParticlesRef}>
        {Array.from({ length: 10 }).map((_, i) => (
          <Sphere key={i} args={[0.05, 8, 8]}>
            <meshStandardMaterial 
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={2}
            />
          </Sphere>
        ))}
      </group>
      
      {/* Result display */}
      <Html position={[0, 2.8, 0]} center>
        <div className="bg-black/80 p-4 rounded-xl border-2 backdrop-blur-sm shadow-xl"
             style={{ borderColor: COLORS.first_law }}>
          <div className="text-lg font-bold" style={{ color: COLORS.first_law }}>
            First Law: ΔU = q + w
          </div>
          <div className="text-2xl font-mono mt-2">
            <span className="text-cyan-400">{deltaU.toFixed(1)}</span>
            <span className="text-white mx-2">=</span>
            <span className="text-red-400">{q.toFixed(1)}</span>
            <span className="text-white mx-2">+</span>
            <span className="text-yellow-400">({w.toFixed(1)})</span>
          </div>
        </div>
      </Html>
    </group>
  );
}

function HessLawVisualization({
  reactants,
  products,
  intermediateSteps,
  position = [0, 0, 0]
}: {
  reactants: Array<{name: string, enthalpy: number, color: string}>;
  products: Array<{name: string, enthalpy: number, color: string}>;
  intermediateSteps: Array<{name: string, enthalpy: number}>;
  position?: [number, number, number];
}) {
  const totalReactantsEnthalpy = useMemo(() => 
    reactants.reduce((sum, r) => sum + r.enthalpy, 0), [reactants]);
  const totalProductsEnthalpy = useMemo(() => 
    products.reduce((sum, p) => sum + p.enthalpy, 0), [products]);
  const deltaH = totalProductsEnthalpy - totalReactantsEnthalpy;
  
  const pathPoints = useMemo(() => {
    const points = [];
    const numSteps = intermediateSteps.length + 2;
    points.push(new THREE.Vector3(-4, 0, 0));
    intermediateSteps.forEach((step, i) => {
      const x = -4 + (i + 1) * (8 / (numSteps - 1));
      const y = Math.sin(i * 0.5) * 2;
      points.push(new THREE.Vector3(x, y, 0));
    });
    points.push(new THREE.Vector3(4, 0, 0));
    return points;
  }, [intermediateSteps]);
  
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(pathPoints);
  }, [pathPoints]);
  
  return (
    <group position={position}>
      <Tube args={[curve, 64, 0.1, 8, false]}>
        <meshStandardMaterial color="#8b5cf6" transparent opacity={0.3} />
      </Tube>
      
      {pathPoints.map((point, i) => (
        <group key={i} position={[point.x, point.y, point.z]}>
          <Sphere args={[0.2, 16, 16]}>
            <meshStandardMaterial 
              color={i === 0 ? '#ef4444' : i === pathPoints.length - 1 ? '#10b981' : '#3b82f6'}
              emissive={i === 0 ? '#ef4444' : i === pathPoints.length - 1 ? '#10b981' : '#3b82f6'}
              emissiveIntensity={0.5}
            />
          </Sphere>
          
          <Html position={[0, 0.5, 0]}>
            <div className="bg-black/80 px-3 py-1 rounded border border-slate-700 text-center">
              <div className="text-xs font-bold text-white">
                {i === 0 ? 'Reactants' : 
                 i === pathPoints.length - 1 ? 'Products' : 
                 intermediateSteps[i-1].name}
              </div>
              <div className="text-xs text-gray-400">
                {i === 0 ? totalReactantsEnthalpy.toFixed(0) : 
                 i === pathPoints.length - 1 ? totalProductsEnthalpy.toFixed(0) : 
                 intermediateSteps[i-1].enthalpy.toFixed(0)} kJ
              </div>
            </div>
          </Html>
        </group>
      ))}
      
      <group position={[0, -2, 0]}>
        <Html center>
          <div className="bg-black/80 p-4 rounded-xl border-2 backdrop-blur-sm"
               style={{ borderColor: COLORS.hess_law }}>
            <div className="text-lg font-bold" style={{ color: COLORS.hess_law }}>
              Hess's Law Calculation
            </div>
            
            <div className="mt-4 p-3 bg-slate-900/50 rounded">
              <div className="text-center text-xl font-mono whitespace-nowrap">
                <span className="text-blue-400">ΔH°</span>
                <span className="text-white mx-1">=</span>
                <span className="text-green-400">{totalProductsEnthalpy.toFixed(1)}</span>
                <span className="text-white mx-1">-</span>
                <span className="text-red-400">{totalReactantsEnthalpy.toFixed(1)}</span>
                <span className="text-white mx-1">=</span>
                <span className={`text-2xl ${deltaH > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {deltaH > 0 ? '+' : ''}{deltaH.toFixed(1)} kJ
                </span>
              </div>
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

function HeatCapacityVisualization({
  mass,
  specificHeat,
  temperatureChange,
  heatAdded,
  gasType = 'monatomic',
  position = [0, 0, 0]
}: {
  mass: number;
  specificHeat: number;
  temperatureChange: number;
  heatAdded: number;
  gasType?: GasType;
  position?: [number, number, number];
}) {
  const gasProperties = GAS_PROPERTIES[gasType];
  const moleculesRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (moleculesRef.current) {
      const speed = 1 + Math.abs(temperatureChange) / 50;
      moleculesRef.current.children.forEach((molecule, i) => {
        const time = clock.getElapsedTime();
        molecule.position.x = Math.sin(time * speed + i) * 1.5;
        molecule.position.y = Math.cos(time * speed * 0.7 + i) * 1.5;
        molecule.position.z = Math.sin(time * speed * 0.5 + i) * 1.5;
      });
    }
  });

  return (
    <group position={position}>
      <Box args={[3, 3, 3]}>
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
      
      <group ref={moleculesRef}>
        {Array.from({ length: 50 }).map((_, i) => (
          <Icosahedron key={i} args={[0.1, 0]} position={[
            (Math.random() - 0.5) * 2.5,
            (Math.random() - 0.5) * 2.5,
            (Math.random() - 0.5) * 2.5
          ]}>
            <meshStandardMaterial 
              color={gasProperties.color}
              emissive={gasProperties.color}
              emissiveIntensity={0.3}
            />
          </Icosahedron>
        ))}
      </group>
      
      {/* Temperature visualization */}
      <group position={[2, 0, 0]}>
        <Html center>
          <div className="bg-black/80 p-2 rounded border border-cyan-500/50 text-center w-24">
            <div className="text-xs font-bold text-cyan-400">Temp</div>
            <div className="text-md font-mono text-white">
              {temperatureChange > 0 ? '+' : ''}{temperatureChange.toFixed(1)} K
            </div>
          </div>
        </Html>
        <Cylinder args={[0.2, 0.2, 2, 16]} position={[0, -1.5, 0]}>
          <meshStandardMaterial color="#1e293b" />
        </Cylinder>
        <Cylinder 
          args={[0.18, 0.18, Math.abs(temperatureChange) / 20, 16]} 
          position={[0, -1.5 + (temperatureChange > 0 ? 1 : -1) * Math.abs(temperatureChange) / 40, 0]}
        >
          <meshStandardMaterial 
            color={temperatureChange > 0 ? '#ef4444' : '#3b82f6'}
            emissive={temperatureChange > 0 ? '#ef4444' : '#3b82f6'}
            emissiveIntensity={0.5}
          />
        </Cylinder>
      </group>
      
      {/* Formula calculation display */}
      <Html position={[0, -2.5, 0]} center>
        <div className="bg-black/80 p-4 rounded-xl border-2 backdrop-blur-sm min-w-[300px]"
             style={{ borderColor: COLORS.heat_capacity }}>
          <div className="text-lg font-bold" style={{ color: COLORS.heat_capacity }}>
            q = m·C·ΔT
          </div>
          
          <div className="mt-2 p-2 bg-slate-900/30 rounded text-center font-mono">
            <span className="text-red-400">{heatAdded.toFixed(0)}</span>
            <span className="text-white mx-2">=</span>
            <span className="text-white">{mass.toFixed(1)}</span>
            <span className="text-white mx-1">×</span>
            <span className="text-green-400">{specificHeat.toFixed(1)}</span>
            <span className="text-white mx-1">×</span>
            <span className="text-cyan-400">{temperatureChange.toFixed(1)}</span>
          </div>
        </div>
      </Html>
    </group>
  );
}

function FormulaInteractivePanel({
  activeFormula,
  onParameterChange
}: {
  activeFormula: FormulaType;
  onParameterChange: (params: any) => void;
}) {
  const [firstLawParams, setFirstLawParams] = useState({ q: 100, w: -50 });
  const [hessLawParams, setHessLawParams] = useState({
    reactants: [
      { name: 'C(s)', enthalpy: 0, color: '#94a3b8' },
      { name: 'O₂(g)', enthalpy: 0, color: '#3b82f6' }
    ],
    products: [
      { name: 'CO₂(g)', enthalpy: -393.5, color: '#10b981' }
    ],
    intermediates: [
      { name: 'Intermediate', enthalpy: -200 }
    ]
  });
  const [heatCapacityParams, setHeatCapacityParams] = useState({
    mass: 1.0,
    specificHeat: 4.18,
    temperatureChange: 10,
    gasType: 'monatomic' as GasType
  });
  
  const heatAdded = useMemo(() => 
    heatCapacityParams.mass * heatCapacityParams.specificHeat * heatCapacityParams.temperatureChange,
    [heatCapacityParams]
  );
  
  React.useEffect(() => {
    if (activeFormula === 'first_law') {
      onParameterChange({
        ...firstLawParams,
        deltaU: firstLawParams.q + firstLawParams.w
      });
    } else if (activeFormula === 'hess_law') {
      onParameterChange(hessLawParams);
    } else if (activeFormula === 'heat_capacity') {
      onParameterChange({
        ...heatCapacityParams,
        heatAdded
      });
    }
  }, [activeFormula, firstLawParams, hessLawParams, heatCapacityParams, heatAdded, onParameterChange]);

  return (
    <group>
      <Html position={[0, -4.5, 0]} center>
        <div className="bg-slate-900/90 backdrop-blur-lg rounded-2xl border border-slate-700 p-6 shadow-2xl w-96">
          <div className="text-white text-lg font-bold mb-4">Adjust Parameters</div>
          
          {activeFormula === 'first_law' && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-red-400">Heat (q)</span>
                  <span className="text-white font-mono">{firstLawParams.q} J</span>
                </div>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  step="10"
                  value={firstLawParams.q}
                  onChange={(e) => setFirstLawParams(prev => ({...prev, q: parseFloat(e.target.value)}))}
                  className="w-full accent-red-500"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-yellow-400">Work (w)</span>
                  <span className="text-white font-mono">{firstLawParams.w} J</span>
                </div>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  step="10"
                  value={firstLawParams.w}
                  onChange={(e) => setFirstLawParams(prev => ({...prev, w: parseFloat(e.target.value)}))}
                  className="w-full accent-yellow-500"
                />
              </div>
            </div>
          )}
          
          {activeFormula === 'hess_law' && (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-white mb-2">Intermediate Enthalpy</div>
                <input
                  type="range"
                  min="-500"
                  max="500"
                  step="10"
                  value={hessLawParams.intermediates[0].enthalpy}
                  onChange={(e) => {
                    const newInter = [...hessLawParams.intermediates];
                    newInter[0].enthalpy = parseFloat(e.target.value);
                    setHessLawParams(prev => ({...prev, intermediates: newInter}));
                  }}
                  className="w-full accent-purple-500"
                />
                <div className="text-right text-xs text-white">{hessLawParams.intermediates[0].enthalpy} kJ</div>
              </div>
            </div>
          )}
          
          {activeFormula === 'heat_capacity' && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-white">Mass (m)</span>
                  <span className="text-white font-mono">{heatCapacityParams.mass} kg</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={heatCapacityParams.mass}
                  onChange={(e) => setHeatCapacityParams(prev => ({...prev, mass: parseFloat(e.target.value)}))}
                  className="w-full accent-white"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-cyan-400">ΔT</span>
                  <span className="text-white font-mono">{heatCapacityParams.temperatureChange} K</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={heatCapacityParams.temperatureChange}
                  onChange={(e) => setHeatCapacityParams(prev => ({...prev, temperatureChange: parseFloat(e.target.value)}))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

// --- MAIN COMPONENT ---
export default function ThermodynamicFormulasPage() {
  const [activeFormula, setActiveFormula] = useState<FormulaType>('first_law');
  const [formulaParams, setFormulaParams] = useState<any>({});
  
  const formulas = [
    {
      type: 'first_law' as FormulaType,
      title: 'First Law',
      description: 'Internal energy',
      variables: [
        { symbol: 'ΔU', meaning: 'Internal Energy', unit: 'J' },
        { symbol: 'q', meaning: 'Heat', unit: 'J' },
        { symbol: 'w', meaning: 'Work', unit: 'J' }
      ]
    },
    {
      type: 'hess_law' as FormulaType,
      title: "Hess's Law",
      description: 'Enthalpy summation',
      variables: [
        { symbol: 'ΔH°', meaning: 'Enthalpy', unit: 'kJ' }
      ]
    },
    {
      type: 'heat_capacity' as FormulaType,
      title: 'Heat Capacity',
      description: 'q = mCΔT',
      variables: [
        { symbol: 'C', meaning: 'Specific Heat', unit: 'J/kgK' }
      ]
    }
  ];

  return (
    <SimulationLayout
      title="Thermodynamic Formulas Master"
      description="Master key thermodynamic formulas through interactive 3D visualization. Explore the First Law, Hess's Law, and Heat Capacity."
      cameraPosition={[0, 2, 12]}
    >
      <Float speed={0.3} rotationIntensity={0.1} floatIntensity={0.2}>
        <group>
          {/* Top Menu */}
          <Html position={[0, 4.5, 0]} center>
            <div className="flex gap-2 bg-black/70 px-4 py-2 rounded-full backdrop-blur-md border border-slate-700">
              {formulas.map((f) => (
                <button
                  key={f.type}
                  onClick={() => setActiveFormula(f.type)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeFormula === f.type
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f.title.toUpperCase()}
                </button>
              ))}
            </div>
          </Html>
          
          {/* Active formula visualization */}
          <group>
            {activeFormula === 'first_law' && (
              <FirstLawVisualization
                q={formulaParams.q || 100}
                w={formulaParams.w || -50}
                deltaU={(formulaParams.q || 100) + (formulaParams.w || -50)}
                position={[0, 0, 0]}
              />
            )}
            
            {activeFormula === 'hess_law' && (
              <HessLawVisualization
                reactants={formulaParams.reactants || []}
                products={formulaParams.products || []}
                intermediateSteps={formulaParams.intermediates || []}
                position={[0, 0, 0]}
              />
            )}
            
            {activeFormula === 'heat_capacity' && (
              <HeatCapacityVisualization
                mass={formulaParams.mass || 1.0}
                specificHeat={formulaParams.specificHeat || 4.18}
                temperatureChange={formulaParams.temperatureChange || 10}
                heatAdded={formulaParams.heatAdded || 41.8}
                gasType={formulaParams.gasType || 'monatomic'}
                position={[0, 0, 0]}
              />
            )}
          </group>
          
          {/* Interactive control panel */}
          <FormulaInteractivePanel
            activeFormula={activeFormula}
            onParameterChange={setFormulaParams}
          />
        </group>
      </Float>
    </SimulationLayout>
  );
}

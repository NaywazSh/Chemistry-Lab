'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Sphere, Cylinder, Box, Html, Float, Line, Text, Plane,
  Tube, Ring, Cone, Billboard, Torus, Icosahedron
} from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

// --- Types ---
type FormulaType = 'first_law' | 'hess_law' | 'heat_capacity' | 'enthalpy' | 'gibbs' | 'entropy';
type GasType = 'monatomic' | 'diatomic' | 'polyatomic';

// --- Constants ---
const COLORS = {
  firstLaw: '#ef4444',        // Red
  hessLaw: '#3b82f6',         // Blue
  heatCapacity: '#10b981',    // Green
  enthalpy: '#f59e0b',        // Yellow
  gibbs: '#8b5cf6',          // Purple
  entropy: '#ec4899',         // Pink
  variable: '#22c55e',        // Bright green for variables
  constant: '#94a3b8',        // Gray for constants
  energy: '#f97316',          // Orange for energy
  temperature: '#06b6d4'      // Cyan for temperature
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
          className={`p-4 rounded-xl backdrop-blur-sm border-2 transition-all duration-300 hover:scale-105 min-w-[280px] ${
            isActive ? 'scale-105 shadow-2xl' : 'shadow-lg'
          }`}
          style={{ 
            backgroundColor: isActive ? `${color}20` : 'rgba(0, 0, 0, 0.8)',
            borderColor: isActive ? color : `${color}40`
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-4 h-4 rounded-full ${isActive ? 'animate-pulse' : ''}`} 
                 style={{ backgroundColor: color }}></div>
            <div className="text-lg font-bold" style={{ color }}>{title}</div>
          </div>
          
          <div className="text-2xl font-mono text-white my-4 text-center">
            {formula === 'first_law' && 'ΔU = q + w'}
            {formula === 'hess_law' && 'ΔH° = ΣΔH°(prod) - ΣΔH°(react)'}
            {formula === 'heat_capacity' && 'q = m·C·ΔT'}
            {formula === 'enthalpy' && 'ΔH = ΔU + PΔV'}
            {formula === 'gibbs' && 'ΔG = ΔH - TΔS'}
            {formula === 'entropy' && 'ΔS = q_rev/T'}
          </div>
          
          <div className="text-sm text-gray-300 mb-4">{description}</div>
          
          <div className="space-y-2">
            {variables.map((varItem, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm p-1 hover:bg-white/5 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="font-mono text-variable" style={{ color: COLORS.variable }}>
                    {varItem.symbol}
                  </span>
                </div>
                <span className="text-gray-400">{varItem.meaning}</span>
                <span className="text-blue-300 font-mono">{varItem.unit}</span>
              </div>
            ))}
          </div>
          
          <div className={`mt-4 text-xs ${isActive ? 'text-white' : 'text-gray-500'}`}>
            {isActive ? '✓ Currently active' : 'Click to explore'}
          </div>
        </button>
      </Html>
      
      {/* Glow effect for active card */}
      {isActive && (
        <Ring args={[1.8, 2, 32]} rotation={[Math.PI/2, 0, 0]}>
          <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} />
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
      // Animate piston movement
      const time = clock.getElapsedTime();
      pistonRef.current.position.y = Math.sin(time * 0.3) * gasExpansion;
    }
    
    if (heatParticlesRef.current) {
      // Animate heat particles
      const time = clock.getElapsedTime();
      heatParticlesRef.current.children.forEach((particle, i) => {
        if (q > 0) {
          // Heat into system - particles moving into cylinder
          particle.position.x = Math.sin(time + i) * 0.5;
          particle.position.y = Math.cos(time + i) * 0.5;
          particle.position.z = -1 + (time * 0.5 + i * 0.2) % 2;
        } else if (q < 0) {
          // Heat out of system - particles moving out
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
        {/* Cylinder */}
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
        
        {/* Gas inside */}
        <Cylinder args={[1, 1, pistonHeight, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color={deltaU > 0 ? '#ef4444' : '#3b82f6'}
            transparent
            opacity={0.4}
          />
        </Cylinder>
        
        {/* Piston */}
        <group ref={pistonRef}>
          <Cylinder args={[1.1, 1.1, 0.2, 32]} position={[0, pistonHeight/2, 0]}>
            <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
          </Cylinder>
        </group>
        
        {/* Gas molecules */}
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
      
      {/* Energy flow arrows */}
      <group>
        {/* Heat arrow */}
        <group position={[-2, 0, 0]}>
          <Cylinder args={[0.08, 0.08, 2, 16]} rotation={[0, 0, Math.PI/2]}>
            <meshStandardMaterial color="#ef4444" />
          </Cylinder>
          <Cone args={[0.2, 0.4, 16]} position={[1, 0, 0]} rotation={[0, 0, -Math.PI/2]}>
            <meshStandardMaterial color="#ef4444" />
          </Cone>
          <Html position={[1.5, 0, 0]}>
            <div className="bg-black/80 px-3 py-1 rounded border border-red-500/50">
              <div className="text-sm font-bold text-red-400">q = {q.toFixed(1)} J</div>
            </div>
          </Html>
        </group>
        
        {/* Work arrow */}
        <group position={[2, 0, 0]}>
          <Cylinder args={[0.08, 0.08, 2, 16]} rotation={[0, 0, Math.PI/2]}>
            <meshStandardMaterial color="#f59e0b" />
          </Cylinder>
          <Cone args={[0.2, 0.4, 16]} position={[-1, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <meshStandardMaterial color="#f59e0b" />
          </Cone>
          <Html position={[-1.5, 0, 0]}>
            <div className="bg-black/80 px-3 py-1 rounded border border-yellow-500/50">
              <div className="text-sm font-bold text-yellow-400">w = {w.toFixed(1)} J</div>
            </div>
          </Html>
        </group>
      </group>
      
      {/* Result display */}
      <Html position={[0, 2.5, 0]} center>
        <div className="bg-black/80 p-4 rounded-xl border-2 backdrop-blur-sm"
             style={{ borderColor: COLORS.firstLaw }}>
          <div className="text-lg font-bold" style={{ color: COLORS.firstLaw }}>
            First Law: ΔU = q + w
          </div>
          <div className="text-2xl font-mono mt-2">
            <span className="text-cyan-400">{deltaU.toFixed(1)}</span>
            <span className="text-white mx-2">=</span>
            <span className="text-red-400">{q.toFixed(1)}</span>
            <span className="text-white mx-2">+</span>
            <span className="text-yellow-400">({w.toFixed(1)})</span>
          </div>
          <div className="text-sm text-gray-300 mt-2">
            {deltaU > 0 ? 'System gains internal energy' : 
             deltaU < 0 ? 'System loses internal energy' : 
             'Internal energy unchanged'}
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
  const [selectedPath, setSelectedPath] = useState<number>(0);
  const totalReactantsEnthalpy = useMemo(() => 
    reactants.reduce((sum, r) => sum + r.enthalpy, 0), [reactants]);
  const totalProductsEnthalpy = useMemo(() => 
    products.reduce((sum, p) => sum + p.enthalpy, 0), [products]);
  const deltaH = totalProductsEnthalpy - totalReactantsEnthalpy;
  
  // Create path points for reaction pathway
  const pathPoints = useMemo(() => {
    const points = [];
    const numSteps = intermediateSteps.length + 2;
    
    // Start point (reactants)
    points.push(new THREE.Vector3(-4, 0, 0));
    
    // Intermediate steps
    intermediateSteps.forEach((step, i) => {
      const x = -4 + (i + 1) * (8 / (numSteps - 1));
      const y = Math.sin(i * 0.5) * 2;
      points.push(new THREE.Vector3(x, y, 0));
    });
    
    // End point (products)
    points.push(new THREE.Vector3(4, 0, 0));
    
    return points;
  }, [intermediateSteps]);
  
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(pathPoints);
  }, [pathPoints]);
  
  return (
    <group position={position}>
      {/* Reaction pathway visualization */}
      <Tube args={[curve, 64, 0.1, 8, false]}>
        <meshStandardMaterial color="#8b5cf6" transparent opacity={0.3} />
      </Tube>
      
      {/* Points along path */}
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
            <div className="bg-black/80 px-3 py-1 rounded border border-slate-700">
              <div className="text-xs font-bold">
                {i === 0 ? 'Reactants' : 
                 i === pathPoints.length - 1 ? 'Products' : 
                 intermediateSteps[i-1].name}
              </div>
              <div className="text-xs text-gray-400">
                ΔH = {i === 0 ? totalReactantsEnthalpy.toFixed(0) : 
                     i === pathPoints.length - 1 ? totalProductsEnthalpy.toFixed(0) : 
                     intermediateSteps[i-1].enthalpy.toFixed(0)} kJ/mol
              </div>
            </div>
          </Html>
        </group>
      ))}
      
      {/* Energy level lines */}
      <Line
        points={[[-4, -1, 0], [4, -1, 0]]}
        color="#64748b"
        lineWidth={2}
        dashed
        dashSize={0.1}
        gapSize={0.1}
      />
      
      {/* Enthalpy difference visualization */}
      <group position={[0, -2, 0]}>
        <Html center>
          <div className="bg-black/80 p-4 rounded-xl border-2 backdrop-blur-sm"
               style={{ borderColor: COLORS.hessLaw }}>
            <div className="text-lg font-bold" style={{ color: COLORS.hessLaw }}>
              Hess's Law Calculation
            </div>
            
            <div className="mt-3">
              <div className="text-sm text-gray-300 mb-2">Reactants Enthalpy:</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {reactants.map((r, i) => (
                  <div key={i} className="px-3 py-1 rounded text-sm"
                       style={{ backgroundColor: `${r.color}20`, color: r.color }}>
                    {r.name}: {r.enthalpy} kJ/mol
                  </div>
                ))}
              </div>
              <div className="text-lg font-mono text-center mb-3">
                ΣΔH°(react) = {totalReactantsEnthalpy.toFixed(1)} kJ/mol
              </div>
            </div>
            
            <div className="mt-3">
              <div className="text-sm text-gray-300 mb-2">Products Enthalpy:</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {products.map((p, i) => (
                  <div key={i} className="px-3 py-1 rounded text-sm"
                       style={{ backgroundColor: `${p.color}20`, color: p.color }}>
                    {p.name}: {p.enthalpy} kJ/mol
                  </div>
                ))}
              </div>
              <div className="text-lg font-mono text-center mb-3">
                ΣΔH°(prod) = {totalProductsEnthalpy.toFixed(1)} kJ/mol
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-slate-900/50 rounded">
              <div className="text-center text-2xl font-mono">
                <span className="text-blue-400">ΔH°</span>
                <span className="text-white mx-2">=</span>
                <span className="text-green-400">{totalProductsEnthalpy.toFixed(1)}</span>
                <span className="text-white mx-2">-</span>
                <span className="text-red-400">{totalReactantsEnthalpy.toFixed(1)}</span>
                <span className="text-white mx-4">=</span>
                <span className={`text-3xl ${deltaH > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {deltaH > 0 ? '+' : ''}{deltaH.toFixed(1)} kJ/mol
                </span>
              </div>
              <div className="text-center text-sm text-gray-400 mt-2">
                {deltaH > 0 ? 'Endothermic reaction' : 'Exothermic reaction'}
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
  const [particleSpeed, setParticleSpeed] = useState(1);
  
  useFrame(({ clock }) => {
    if (moleculesRef.current) {
      // Animate molecules based on temperature
      const speed = particleSpeed * (1 + temperatureChange / 100);
      moleculesRef.current.children.forEach((molecule, i) => {
        const time = clock.getElapsedTime();
        molecule.position.x = Math.sin(time * speed + i) * 1.5;
        molecule.position.y = Math.cos(time * speed * 0.7 + i) * 1.5;
        molecule.position.z = Math.sin(time * speed * 0.5 + i) * 1.5;
      });
    }
  });

  // Update particle speed when temperature changes
  React.useEffect(() => {
    setParticleSpeed(1 + Math.abs(temperatureChange) / 50);
  }, [temperatureChange]);

  return (
    <group position={position}>
      {/* Container for gas */}
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
      
      {/* Gas molecules */}
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
      
      {/* Heat source visualization */}
      <group position={[-2, 0, 0]}>
        <Box args={[0.5, 2, 2]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={heatAdded > 0 ? 1 : 0.1}
          />
        </Box>
        
        {/* Heat flow particles */}
        {heatAdded > 0 && (
          <group>
            {Array.from({ length: 10 }).map((_, i) => {
              const progress = ((Date.now() * 0.001 + i * 0.2) % 1);
              return (
                <Sphere
                  key={i}
                  args={[0.05, 8, 8]}
                  position={[progress * 2, Math.sin(i) * 0.5, Math.cos(i) * 0.5]}
                >
                  <meshStandardMaterial 
                    color="#ef4444"
                    emissive="#ef4444"
                    emissiveIntensity={2}
                  />
                </Sphere>
              );
            })}
          </group>
        )}
      </group>
      
      {/* Temperature visualization */}
      <group position={[2, 0, 0]}>
        <Html center>
          <div className="bg-black/80 p-3 rounded-xl border-2 border-cyan-500/50">
            <div className="text-lg font-bold text-cyan-400">Temperature</div>
            <div className="text-3xl font-mono text-white mt-2">
              {temperatureChange > 0 ? '+' : ''}{temperatureChange.toFixed(1)} K
            </div>
            <div className="text-sm text-gray-400">
              ΔT = {temperatureChange.toFixed(1)} K
            </div>
          </div>
        </Html>
        
        {/* Temperature bar */}
        <Cylinder args={[0.3, 0.3, 2, 16]} position={[0, -1.5, 0]}>
          <meshStandardMaterial color="#1e293b" />
        </Cylinder>
        
        <Cylinder 
          args={[0.28, 0.28, Math.abs(temperatureChange) / 20, 16]} 
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
        <div className="bg-black/80 p-4 rounded-xl border-2 backdrop-blur-sm min-w-[350px]"
             style={{ borderColor: COLORS.heatCapacity }}>
          <div className="text-lg font-bold" style={{ color: COLORS.heatCapacity }}>
            Heat Capacity Formula: q = m·C·ΔT
          </div>
          
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="text-center p-2 rounded bg-slate-900/50">
              <div className="text-xs text-gray-400">Mass (m)</div>
              <div className="text-xl font-mono text-white">{mass.toFixed(2)} kg</div>
            </div>
            
            <div className="text-center p-2 rounded bg-slate-900/50">
              <div className="text-xs text-gray-400">Specific Heat (C)</div>
              <div className="text-xl font-mono text-white">{specificHeat.toFixed(2)} J/kg·K</div>
            </div>
            
            <div className="text-center p-2 rounded bg-slate-900/50">
              <div className="text-xs text-gray-400">ΔT</div>
              <div className="text-xl font-mono text-white">{temperatureChange.toFixed(2)} K</div>
            </div>
            
            <div className="text-center p-2 rounded bg-slate-900/50">
              <div className="text-xs text-gray-400">Heat Added (q)</div>
              <div className="text-xl font-mono text-white">{heatAdded.toFixed(0)} J</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-slate-900/30 rounded">
            <div className="text-lg font-mono text-center">
              <span className="text-red-400">{heatAdded.toFixed(0)}</span>
              <span className="text-white mx-2">=</span>
              <span className="text-white">{mass.toFixed(2)}</span>
              <span className="text-white mx-2">×</span>
              <span className="text-green-400">{specificHeat.toFixed(2)}</span>
              <span className="text-white mx-2">×</span>
              <span className="text-cyan-400">{temperatureChange.toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-400 text-center mt-2">
              q = m × C × ΔT
            </div>
          </div>
          
          {/* Gas type specific info */}
          <div className="mt-3 pt-3 border-t border-slate-700">
            <div className="text-sm text-gray-300">Gas Type: <span style={{ color: gasProperties.color }}>
              {gasType.charAt(0).toUpperCase() + gasType.slice(1)}
            </span></div>
            <div className="text-xs text-gray-400">
              Cv = {gasProperties.Cv.toFixed(2)} J/mol·K | 
              Cp = {gasProperties.Cp.toFixed(2)} J/mol·K | 
              γ = {gasProperties.gamma.toFixed(2)}
            </div>
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
    specificHeat: 4.18, // Water's specific heat
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
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>q &lt; 0: Heat out</span>
                  <span>q &gt; 0: Heat in</span>
                </div>
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
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>w &lt; 0: Work by system</span>
                  <span>w &gt; 0: Work on system</span>
                </div>
              </div>
              
              <div className="p-3 bg-slate-800/50 rounded">
                <div className="text-sm text-gray-300">Calculated ΔU:</div>
                <div className={`text-lg font-bold ${(firstLawParams.q + firstLawParams.w) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ΔU = {(firstLawParams.q + firstLawParams.w).toFixed(1)} J
                </div>
              </div>
            </div>
          )}
          
          {activeFormula === 'hess_law' && (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-white mb-3">Reactants Enthalpy:</div>
                {hessLawParams.reactants.map((reactant, i) => (
                  <div key={i} className="flex items-center gap-3 mb-2">
                    <div className="text-sm" style={{ color: reactant.color }}>{reactant.name}</div>
                    <input
                      type="range"
                      min="-500"
                      max="500"
                      step="10"
                      value={reactant.enthalpy}
                      onChange={(e) => {
                        const newReactants = [...hessLawParams.reactants];
                        newReactants[i].enthalpy = parseFloat(e.target.value);
                        setHessLawParams(prev => ({...prev, reactants: newReactants}));
                      }}
                      className="flex-1"
                      style={{ accentColor: reactant.color }}
                    />
                    <div className="text-sm text-white w-20 text-right">{reactant.enthalpy} kJ/mol</div>
                  </div>
                ))}
              </div>
              
              <div>
                <div className="text-sm font-medium text-white mb-3">Products Enthalpy:</div>
                {hessLawParams.products.map((product, i) => (
                  <div key={i} className="flex items-center gap-3 mb-2">
                    <div className="text-sm" style={{ color: product.color }}>{product.name}</div>
                    <input
                      type="range"
                      min="-500"
                      max="500"
                      step="10"
                      value={product.enthalpy}
                      onChange={(e) => {
                        const newProducts = [...hessLawParams.products];
                        newProducts[i].enthalpy = parseFloat(e.target.value);
                        setHessLawParams(prev => ({...prev, products: newProducts}));
                      }}
                      className="flex-1"
                      style={{ accentColor: product.color }}
                    />
                    <div className="text-sm text-white w-20 text-right">{product.enthalpy} kJ/mol</div>
                  </div>
                ))}
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
                  <span className="text-sm font-medium text-green-400">Specific Heat (C)</span>
                  <span className="text-white font-mono">{heatCapacityParams.specificHeat} J/kg·K</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.1"
                  value={heatCapacityParams.specificHeat}
                  onChange={(e) => setHeatCapacityParams(prev => ({...prev, specificHeat: parseFloat(e.target.value)}))}
                  className="w-full accent-green-500"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Water: 4.18 | Iron: 0.45 | Aluminum: 0.90
                </div>
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
              
              <div>
                <div className="text-sm font-medium text-white mb-2">Gas Type</div>
                <div className="flex gap-2">
                  {(['monatomic', 'diatomic', 'polyatomic'] as GasType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setHeatCapacityParams(prev => ({...prev, gasType: type}))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                        heatCapacityParams.gasType === type
                          ? 'ring-2 ring-offset-1 ring-offset-black'
                          : 'opacity-90 hover:opacity-100'
                      }`}
                      style={{ 
                        backgroundColor: heatCapacityParams.gasType === type 
                          ? GAS_PROPERTIES[type].color 
                          : `${GAS_PROPERTIES[type].color}40`,
                        color: 'white'
                      }}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-3 bg-slate-800/50 rounded">
                <div className="text-sm text-gray-300">Calculated Heat:</div>
                <div className="text-lg font-bold text-red-400">
                  q = {heatAdded.toFixed(0)} J
                </div>
              </div>
            </div>
          )}
          
          {/* Quick formula reference */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="text-sm font-bold text-white mb-2">Quick Reference</div>
            <div className="text-xs text-gray-400 space-y-1">
              {activeFormula === 'first_law' && (
                <>• ΔU: Change in internal energy<br/>• q: Heat added to system<br/>• w: Work done on system</>
              )}
              {activeFormula === 'hess_law' && (
                <>• ΣΔH°(prod): Sum of formation enthalpies of products<br/>• ΣΔH°(react): Sum of formation enthalpies of reactants</>
              )}
              {activeFormula === 'heat_capacity' && (
                <>• m: Mass of substance<br/>• C: Specific heat capacity<br/>• ΔT: Temperature change</>
              )}
            </div>
          </div>
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
      title: 'First Law of Thermodynamics',
      description: 'Energy conservation: Internal energy change equals heat plus work',
      variables: [
        { symbol: 'ΔU', meaning: 'Change in internal energy', unit: 'J' },
        { symbol: 'q', meaning: 'Heat transferred', unit: 'J' },
        { symbol: 'w', meaning: 'Work done', unit: 'J' }
      ]
    },
    {
      type: 'hess_law' as FormulaType,
      title: "Hess's Law",
      description: 'Total enthalpy change is independent of reaction pathway',
      variables: [
        { symbol: 'ΔH°', meaning: 'Standard enthalpy change', unit: 'kJ/mol' },
        { symbol: 'ΣΔH°(prod)', meaning: 'Sum of product enthalpies', unit: 'kJ/mol' },
        { symbol: 'ΣΔH°(react)', meaning: 'Sum of reactant enthalpies', unit: 'kJ/mol' }
      ]
    },
    {
      type: 'heat_capacity' as FormulaType,
      title: 'Heat Capacity',
      description: 'Heat required to change temperature depends on mass and specific heat',
      variables: [
        { symbol: 'q', meaning: 'Heat transferred', unit: 'J' },
        { symbol: 'm', meaning: 'Mass', unit: 'kg' },
        { symbol: 'C', meaning: 'Specific heat capacity', unit: 'J/kg·K' },
        { symbol: 'ΔT', meaning: 'Temperature change', unit: 'K' }
      ]
    },
    {
      type: 'enthalpy' as FormulaType,
      title: 'Enthalpy Change',
      description: 'Heat change at constant pressure',
      variables: [
        { symbol: 'ΔH', meaning: 'Enthalpy change', unit: 'kJ/mol' },
        { symbol: 'ΔU', meaning: 'Internal energy change', unit: 'kJ/mol' },
        { symbol: 'PΔV', meaning: 'Pressure-volume work', unit: 'kJ/mol' }
      ]
    },
    {
      type: 'gibbs' as FormulaType,
      title: 'Gibbs Free Energy',
      description: 'Spontaneity depends on enthalpy, entropy, and temperature',
      variables: [
        { symbol: 'ΔG', meaning: 'Gibbs free energy change', unit: 'kJ/mol' },
        { symbol: 'ΔH', meaning: 'Enthalpy change', unit: 'kJ/mol' },
        { symbol: 'TΔS', meaning: 'Temperature × entropy', unit: 'kJ/mol' }
      ]
    },
    {
      type: 'entropy' as FormulaType,
      title: 'Entropy Change',
      description: 'Measure of disorder or randomness',
      variables: [
        { symbol: 'ΔS', meaning: 'Entropy change', unit: 'J/K' },
        { symbol: 'q_rev', meaning: 'Reversible heat transfer', unit: 'J' },
        { symbol: 'T', meaning: 'Temperature', unit: 'K' }
      ]
    }
  ];

  // Arrange formulas in a circle
  const formulaPositions = useMemo(() => {
    const radius = 6;
    return formulas.map((_, index) => {
      const angle = (index * 2 * Math.PI) / formulas.length;
      return [
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ] as [number, number, number];
    });
  }, []);

  return (
    <SimulationLayout
      title="Thermodynamic Formulas Master"
      description="Master key thermodynamic formulas through interactive 3D visualization. Explore the First Law, Hess's Law, Heat Capacity, and more with adjustable variables."
      cameraPosition={[0, 2, 15]}
    >
      <Float speed={0.3} rotationIntensity={0.1} floatIntensity={0.2}>
        <group>
          {/* Title and description */}
          <Html position={[0, 4, 0]} center>
            <div className="bg-black/80 p-4 rounded-xl backdrop-blur-sm border-2 border-blue-500/50 max-w-2xl">
              <div className="text-2xl font-bold text-blue-400 mb-2">Thermodynamic Formulas</div>
              <div className="text-gray-300">
                Select a formula to explore its 3D visualization and adjust parameters in real-time.
                Watch how changing variables affects the physical system.
              </div>
            </div>
          </Html>
          
          {/* Formula cards arranged in a circle */}
          {formulas.map((formula, index) => (
            <FormulaCard
              key={formula.type}
              formula={formula.type}
              title={formula.title}
              description={formula.description}
              variables={formula.variables}
              position={formulaPositions[index]}
              isActive={activeFormula === formula.type}
              onClick={() => setActiveFormula(formula.type)}
            />
          ))}
          
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
                reactants={formulaParams.reactants || [
                  { name: 'C(s)', enthalpy: 0, color: '#94a3b8' },
                  { name: 'O₂(g)', enthalpy: 0, color: '#3b82f6' }
                ]}
                products={formulaParams.products || [
                  { name: 'CO₂(g)', enthalpy: -393.5, color: '#10b981' }
                ]}
                intermediateSteps={formulaParams.intermediates || [
                  { name: 'Intermediate', enthalpy: -200 }
                ]}
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
          
          {/* Learning tips */}
          <Html position={[6, 2, 0]} center>
            <div className="bg-black/80 p-4 rounded-xl border-2 border-green-500/50 backdrop-blur-sm min-w-[280px]">
              <div className="text-lg font-bold text-green-400 mb-3">Learning Tips</div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                  <div>
                    <div className="text-white font-bold">Sign Conventions</div>
                    <div className="text-gray-400">q &gt; 0: Heat into system | w &gt; 0: Work on system</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5"></div>
                  <div>
                    <div className="text-white font-bold">State Functions</div>
                    <div className="text-gray-400">ΔU, ΔH, ΔS depend only on initial/final states</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5"></div>
                  <div>
                    <div className="text-white font-bold">Path Functions</div>
                    <div className="text-gray-400">q and w depend on path taken</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5"></div>
                  <div>
                    <div className="text-white font-bold">Memory Aid</div>
                    <div className="text-gray-400">ΔU = q + w | ΔH = ΔU + PΔV | ΔG = ΔH - TΔS</div>
                  </div>
                </div>
              </div>
            </div>
          </Html>
          
          {/* Active formula info */}
          <Html position={[-6, 2, 0]} center>
            <div className="bg-black/80 p-4 rounded-xl border-2 border-purple-500/50 backdrop-blur-sm min-w-[280px]"
                 style={{ borderColor: COLORS[activeFormula] }}>
              <div className="text-lg font-bold mb-3" style={{ color: COLORS[activeFormula] }}>
                Active Formula
              </div>
              
              <div className="text-3xl font-mono text-white mb-3 text-center">
                {activeFormula === 'first_law' && 'ΔU = q + w'}
                {activeFormula === 'hess_law' && 'ΔH° = ΣΔH°(prod) - ΣΔH°(react)'}
                {activeFormula === 'heat_capacity' && 'q = m·C·ΔT'}
                {activeFormula === 'enthalpy' && 'ΔH = ΔU + PΔV'}
                {activeFormula === 'gibbs' && 'ΔG = ΔH - TΔS'}
                {activeFormula === 'entropy' && 'ΔS = q_rev/T'}
              </div>
              
              <div className="text-sm text-gray-300">
                {activeFormula === 'first_law' && 'Energy conservation principle'}
                {activeFormula === 'hess_law' && 'Enthalpy is a state function'}
                {activeFormula === 'heat_capacity' && 'Heat required for temperature change'}
                {activeFormula === 'enthalpy' && 'Heat change at constant pressure'}
                {activeFormula === 'gibbs' && 'Predicts reaction spontaneity'}
                {activeFormula === 'entropy' && 'Measure of disorder'}
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-700">
                <div className="text-xs text-gray-400">
                  <span className="font-bold text-white">Applications:</span> 
                  {activeFormula === 'first_law' && ' Heat engines, refrigerators'}
                  {activeFormula === 'hess_law' && ' Calculating unknown ΔH values'}
                  {activeFormula === 'heat_capacity' && ' Calorimetry, thermal engineering'}
                  {activeFormula === 'enthalpy' && ' Chemical reactions at constant P'}
                  {activeFormula === 'gibbs' && ' Predicting reaction direction'}
                  {activeFormula === 'entropy' && ' Second law, heat engines'}
                </div>
              </div>
            </div>
          </Html>
          
          {/* Connection lines from active formula card to visualization */}
          {formulas.map((formula, index) => {
            if (formula.type === activeFormula) {
              const angle = (index * 2 * Math.PI) / formulas.length;
              const radius = 6;
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius;
              
              return (
                <Line
                  key={`connection-${formula.type}`}
                  points={[[x * 0.8, 0, z * 0.8], [0, 0, 0]]}
                  color={COLORS[formula.type]}
                  opacity={0.3}
                  transparent
                  lineWidth={2}
                  dashed
                  dashSize={0.2}
                  gapSize={0.2}
                />
              );
            }
            return null;
          })}
          
          {/* Progress indicator */}
          <Html position={[0, -2.5, 0]} center>
            <div className="flex items-center gap-4 bg-black/60 px-6 py-3 rounded-full backdrop-blur-md border border-slate-700">
              <div className="text-slate-300 text-sm">Exploring:</div>
              <div className="flex items-center gap-2">
                {formulas.map((formula) => (
                  <div 
                    key={formula.type}
                    className={`w-3 h-3 rounded-full transition-all ${
                      activeFormula === formula.type 
                        ? 'scale-125 ring-2 ring-offset-1 ring-offset-black' 
                        : 'opacity-50'
                    }`}
                    style={{ 
                      backgroundColor: activeFormula === formula.type 
                        ? COLORS[formula.type] 
                        : '#4B5563'
                    }}
                  />
                ))}
              </div>
              <div className="text-xs text-slate-400">
                {formulas.findIndex(f => f.type === activeFormula) + 1} of {formulas.length}
              </div>
            </div>
          </Html>
        </group>
      </Float>
    </SimulationLayout>
  );
}

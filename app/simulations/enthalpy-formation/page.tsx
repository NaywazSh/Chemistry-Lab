'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Sphere, Cylinder, Box, Html, Float, Line, Text, Plane,
  Tube, Ring, Cone, Billboard, Icosahedron, Octahedron
} from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

// --- Types ---
type CompoundType = 'element' | 'compound';
type EnergyState = 'stable' | 'unstable' | 'highly_unstable';
type ReactionComponent = 'reactant' | 'product';

// --- Constants ---
const COLORS = {
  element: '#94a3b8',           // Gray for elements
  compound: '#3b82f6',          // Blue for compounds
  enthalpyNegative: '#10b981',  // Green for negative ΔHf° (stable)
  enthalpyPositive: '#ef4444',  // Red for positive ΔHf° (unstable)
  enthalpyNeutral: '#f59e0b',   // Yellow for zero ΔHf°
  reactant: '#ef4444',          // Red for reactants
  product: '#10b981',           // Green for products
  energy: '#f97316',            // Orange for energy
  formation: '#8b5cf6',         // Purple for formation reactions
  reference: '#64748b'          // Gray for reference states
};

// Common compounds with their standard enthalpies of formation (kJ/mol)
const COMPOUND_LIBRARY = [
  { formula: 'H₂O(l)', name: 'Water', ΔHf: -285.8, state: 'liquid', color: '#3b82f6', type: 'compound' },
  { formula: 'CO₂(g)', name: 'Carbon Dioxide', ΔHf: -393.5, state: 'gas', color: '#10b981', type: 'compound' },
  { formula: 'CH₄(g)', name: 'Methane', ΔHf: -74.8, state: 'gas', color: '#22c55e', type: 'compound' },
  { formula: 'C₂H₅OH(l)', name: 'Ethanol', ΔHf: -277.6, state: 'liquid', color: '#f59e0b', type: 'compound' },
  { formula: 'NaCl(s)', name: 'Sodium Chloride', ΔHf: -411.2, state: 'solid', color: '#8b5cf6', type: 'compound' },
  { formula: 'CaCO₃(s)', name: 'Calcium Carbonate', ΔHf: -1206.9, state: 'solid', color: '#ec4899', type: 'compound' },
  { formula: 'NH₃(g)', name: 'Ammonia', ΔHf: -46.1, state: 'gas', color: '#06b6d4', type: 'compound' },
  { formula: 'O₂(g)', name: 'Oxygen', ΔHf: 0, state: 'gas', color: '#ef4444', type: 'element' },
  { formula: 'H₂(g)', name: 'Hydrogen', ΔHf: 0, state: 'gas', color: '#94a3b8', type: 'element' },
  { formula: 'C(s, graphite)', name: 'Carbon (graphite)', ΔHf: 0, state: 'solid', color: '#000000', type: 'element' },
  { formula: 'NO₂(g)', name: 'Nitrogen Dioxide', ΔHf: +33.2, state: 'gas', color: '#d97706', type: 'compound' },
  { formula: 'C₆H₁₂O₆(s)', name: 'Glucose', ΔHf: -1273.3, state: 'solid', color: '#84cc16', type: 'compound' }
];

// --- Components ---

function EnergyLevel({
  compound,
  energy,
  position = [0, 0, 0],
  type = 'compound',
  showLabel = true
}: {
  compound: string;
  energy: number;
  position?: [number, number, number];
  type?: CompoundType;
  showLabel?: boolean;
}) {
  const levelRef = useRef<THREE.Group>(null);
  const isStable = energy < 0;
  const isElement = type === 'element';
  
  // Size based on stability
  const size = isElement ? 0.8 : 1.0;
  const height = Math.max(0.5, Math.abs(energy) / 200);
  
  // Color based on energy
  const energyColor = isElement ? COLORS.element : 
                     energy < 0 ? COLORS.enthalpyNegative : 
                     energy > 0 ? COLORS.enthalpyPositive : COLORS.enthalpyNeutral;
  
  useFrame(({ clock }) => {
    if (levelRef.current) {
      // Gentle floating animation
      const time = clock.getElapsedTime();
      levelRef.current.position.y = position[1] + Math.sin(time * 0.3) * 0.05;
    }
  });

  return (
    <group ref={levelRef} position={position}>
      {/* Energy column */}
      <Cylinder 
        args={[size * 0.3, size * 0.3, height, 16]} 
        position={[0, height/2, 0]}
      >
        <meshStandardMaterial 
          color={energyColor}
          emissive={energyColor}
          emissiveIntensity={0.2}
          transparent
          opacity={0.8}
        />
      </Cylinder>
      
      {/* Compound sphere */}
      <Sphere args={[size, 32, 32]} position={[0, height + size, 0]}>
        <meshStandardMaterial 
          color={energyColor}
          metalness={0.3}
          roughness={0.2}
        />
      </Sphere>
      
      {/* Particles inside compound */}
      {!isElement && (
        <group position={[0, height + size, 0]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Sphere
              key={i}
              args={[0.15, 16, 16]}
              position={[
                Math.sin(i * Math.PI/4) * 0.6,
                Math.cos(i * Math.PI/4) * 0.6,
                Math.sin(i * Math.PI/2) * 0.6
              ]}
            >
              <meshStandardMaterial 
                color={COLORS.element}
                emissive={COLORS.element}
                emissiveIntensity={0.3}
              />
            </Sphere>
          ))}
        </group>
      )}
      
      {/* Energy level line */}
      <Plane args={[size * 2, 0.02]} position={[0, 0, size]} rotation={[0, 0, 0]}>
        <meshBasicMaterial color="#64748b" />
      </Plane>
      
      {/* Label */}
      {showLabel && (
        <Html position={[0, height + size + 1.2, 0]} center>
          <div className="bg-black/80 p-2 rounded-lg border-2 backdrop-blur-sm"
               style={{ borderColor: energyColor }}>
            <div className="text-sm font-bold text-center" style={{ color: energyColor }}>
              {compound}
            </div>
            <div className="text-xs text-gray-300 text-center">
              ΔHf° = {energy.toFixed(1)} kJ/mol
            </div>
            {isElement && (
              <div className="text-xs text-gray-400 text-center">(Reference state)</div>
            )}
          </div>
        </Html>
      )}
      
      {/* Stability indicator */}
      <Html position={[size + 0.5, height + size, 0]}>
        <div className={`text-xs px-2 py-1 rounded ${isStable ? 'bg-green-900/80 text-green-300' : 'bg-red-900/80 text-red-300'}`}>
          {isStable ? 'Stable' : 'Unstable'}
        </div>
      </Html>
    </group>
  );
}

function FormationReactionVisualization({
  compound,
  elements,
  enthalpy,
  position = [0, 0, 0]
}: {
  compound: typeof COMPOUND_LIBRARY[0];
  elements: Array<typeof COMPOUND_LIBRARY[0]>;
  enthalpy: number;
  position?: [number, number, number];
}) {
  const particlesRef = useRef<THREE.Group>(null);
  const [reactionProgress, setReactionProgress] = useState(0);
  const isExothermic = enthalpy < 0;
  
  useFrame(({ clock }) => {
    if (particlesRef.current) {
      // Animate formation reaction
      const time = clock.getElapsedTime();
      particlesRef.current.children.forEach((particle, i) => {
        if (reactionProgress < 0.5) {
          // Elements moving together
          particle.position.x = Math.sin(time + i) * (1 - reactionProgress * 2);
          particle.position.y = Math.cos(time + i) * (1 - reactionProgress * 2);
        } else {
          // Forming compound
          const progress = (reactionProgress - 0.5) * 2;
          particle.position.x = Math.sin(time + i) * (1 - progress);
          particle.position.y = Math.cos(time + i) * (1 - progress);
        }
      });
      
      setReactionProgress(Math.sin(time * 0.2) * 0.5 + 0.5);
    }
  });

  return (
    <group position={position}>
      {/* Reaction title */}
      <Html position={[0, 3, 0]} center>
        <div className="bg-black/80 p-4 rounded-xl border-2 border-purple-500/50 backdrop-blur-sm min-w-[400px]">
          <div className="text-lg font-bold text-purple-400 mb-2">Formation Reaction</div>
          <div className="text-sm text-gray-300">
            Formation of 1 mole of {compound.name} from elements in their standard states
          </div>
        </div>
      </Html>
      
      {/* Reactants side (elements) */}
      <group position={[-3, 0, 0]}>
        <Html position={[0, 2, 0]} center>
          <div className="bg-black/80 p-2 rounded border border-red-500/50">
            <div className="text-sm font-bold text-red-400">Elements (Reactants)</div>
          </div>
        </Html>
        
        {elements.map((element, i) => (
          <EnergyLevel
            key={element.formula}
            compound={element.formula}
            energy={element.ΔHf}
            position={[i * 2 - (elements.length - 1), -1, 0]}
            type="element"
            showLabel={true}
          />
        ))}
      </group>
      
      {/* Reaction arrow */}
      <group position={[0, 0, 0]}>
        <Cylinder args={[0.08, 0.08, 3, 16]} rotation={[0, 0, Math.PI/2]}>
          <meshStandardMaterial color="#f59e0b" />
        </Cylinder>
        <Cone args={[0.2, 0.4, 16]} position={[1.5, 0, 0]} rotation={[0, 0, -Math.PI/2]}>
          <meshStandardMaterial color="#f59e0b" />
        </Cone>
        
        <Html position={[0, 0.5, 0]} center>
          <div className="bg-black/80 px-3 py-1 rounded border border-yellow-500/50">
            <div className="text-sm font-bold text-yellow-400">Formation Reaction</div>
          </div>
        </Html>
      </group>
      
      {/* Products side (compound) */}
      <group position={[3, 0, 0]}>
        <Html position={[0, 2, 0]} center>
          <div className="bg-black/80 p-2 rounded border border-green-500/50">
            <div className="text-sm font-bold text-green-400">Compound (Product)</div>
          </div>
        </Html>
        
        <EnergyLevel
          compound={compound.formula}
          energy={compound.ΔHf}
          position={[0, -1, 0]}
          type="compound"
          showLabel={true}
        />
      </group>
      
      {/* Energy change visualization */}
      <group position={[0, -2, 0]}>
        <Html center>
          <div className="bg-black/80 p-4 rounded-xl border-2 backdrop-blur-sm min-w-[300px]"
               style={{ borderColor: isExothermic ? COLORS.enthalpyNegative : COLORS.enthalpyPositive }}>
            <div className="text-lg font-bold mb-2" style={{ color: isExothermic ? COLORS.enthalpyNegative : COLORS.enthalpyPositive }}>
              {isExothermic ? 'Exothermic Formation' : 'Endothermic Formation'}
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-mono" style={{ color: isExothermic ? '#10b981' : '#ef4444' }}>
                ΔHf° = {enthalpy.toFixed(1)} kJ/mol
              </div>
              <div className="text-sm text-gray-300 mt-2">
                {isExothermic ? 
                  `${Math.abs(enthalpy).toFixed(1)} kJ released per mole formed` :
                  `${Math.abs(enthalpy).toFixed(1)} kJ absorbed per mole formed`
                }
              </div>
            </div>
            
            {/* Energy flow visualization */}
            <div className="mt-4">
              <div className="flex items-center justify-center gap-4">
                <div className="text-sm text-gray-400">Energy Flow:</div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${isExothermic ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div className="text-sm ml-2">
                    {isExothermic ? 'Energy RELEASED' : 'Energy ABSORBED'}
                  </div>
                </div>
              </div>
              
              {/* Animated energy particles */}
              <div className="mt-2 flex justify-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div 
                    key={i}
                    className={`w-2 h-2 rounded-full mx-1 animate-bounce ${isExothermic ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </Html>
        
        {/* Energy arrow */}
        <group position={[0, 1, 0]}>
          <Cylinder args={[0.06, 0.06, 2, 16]} rotation={[0, 0, isExothermic ? Math.PI/2 : -Math.PI/2]}>
            <meshStandardMaterial color={isExothermic ? '#10b981' : '#ef4444'} />
          </Cylinder>
          <Cone args={[0.15, 0.3, 16]} position={isExothermic ? [1, 0, 0] : [-1, 0, 0]} 
                rotation={[0, 0, isExothermic ? -Math.PI/2 : Math.PI/2]}>
            <meshStandardMaterial color={isExothermic ? '#10b981' : '#ef4444'} />
          </Cone>
        </group>
      </group>
      
      {/* Animated particles showing bond formation */}
      <group ref={particlesRef}>
        {Array.from({ length: 15 }).map((_, i) => (
          <Sphere key={i} args={[0.08, 16, 16]}>
            <meshStandardMaterial 
              color={COLORS.formation}
              emissive={COLORS.formation}
              emissiveIntensity={0.5}
            />
          </Sphere>
        ))}
      </group>
    </group>
  );
}

function EnthalpyDiagram3D({
  reactants,
  products,
  enthalpyChange,
  position = [0, 0, 0]
}: {
  reactants: Array<{formula: string, coefficient: number, ΔHf: number}>;
  products: Array<{formula: string, coefficient: number, ΔHf: number}>;
  enthalpyChange: number;
  position?: [number, number, number];
}) {
  const diagramRef = useRef<THREE.Group>(null);
  const isExothermic = enthalpyChange < 0;
  
  // Calculate total enthalpies
  const reactantsEnthalpy = useMemo(() => 
    reactants.reduce((sum, r) => sum + r.coefficient * r.ΔHf, 0), [reactants]);
  
  const productsEnthalpy = useMemo(() => 
    products.reduce((sum, p) => sum + p.coefficient * p.ΔHf, 0), [products]);
  
  // Create 3D surface for enthalpy landscape
  const surfaceGeometry = useMemo(() => {
    const width = 8;
    const depth = 6;
    const segments = 32;
    
    const geometry = new THREE.PlaneGeometry(width, depth, segments, segments);
    const positions = geometry.attributes.position.array;
    
    // Create an enthalpy landscape
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      
      // Create hills for reactants and valleys for products
      const reactantHill = Math.exp(-((x + 2) * (x + 2) + z * z) / 2) * 1.5;
      const productValley = -Math.exp(-((x - 2) * (x - 2) + z * z) / 2) * 1.5;
      
      positions[i + 1] = reactantHill + productValley;
    }
    
    geometry.computeVertexNormals();
    return geometry;
  }, []);
  
  useFrame(({ clock }) => {
    if (diagramRef.current) {
      // Slow rotation for better viewing
      diagramRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group ref={diagramRef} position={position}>
      {/* 3D Enthalpy surface */}
      <mesh geometry={surfaceGeometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial 
          color="#8b5cf6"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          wireframe={false}
        />
      </mesh>
      
      {/* Reactants point */}
      <group position={[-3, 1.5, 0]}>
        <Sphere args={[0.3, 32, 32]}>
          <meshStandardMaterial 
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={0.5}
          />
        </Sphere>
        
        <Html position={[0, 0.5, 0]} center>
          <div className="bg-black/80 p-2 rounded border border-red-500/50">
            <div className="text-sm font-bold text-red-400">Reactants</div>
            <div className="text-xs text-gray-300">ΣΔHf = {reactantsEnthalpy.toFixed(1)} kJ</div>
          </div>
        </Html>
      </group>
      
      {/* Products point */}
      <group position={[3, -1.5, 0]}>
        <Sphere args={[0.3, 32, 32]}>
          <meshStandardMaterial 
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={0.5}
          />
        </Sphere>
        
        <Html position={[0, -0.5, 0]} center>
          <div className="bg-black/80 p-2 rounded border border-green-500/50">
            <div className="text-sm font-bold text-green-400">Products</div>
            <div className="text-xs text-gray-300">ΣΔHf = {productsEnthalpy.toFixed(1)} kJ</div>
          </div>
        </Html>
      </group>
      
      {/* Reaction pathway */}
      <Tube
        args={[
          new THREE.CatmullRomCurve3([
            new THREE.Vector3(-3, 1.5, 0),
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(3, -1.5, 0)
          ]),
          64,
          0.1,
          8,
          false
        ]}
      >
        <meshStandardMaterial 
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={0.3}
        />
      </Tube>
      
      {/* Enthalpy change indicator */}
      <group position={[0, 0, 2]}>
        <Html center>
          <div className="bg-black/80 p-4 rounded-xl border-2 backdrop-blur-sm min-w-[300px]"
               style={{ borderColor: isExothermic ? '#10b981' : '#ef4444' }}>
            <div className="text-lg font-bold mb-2" style={{ color: isExothermic ? '#10b981' : '#ef4444' }}>
              Reaction Enthalpy: ΔH°rxn
            </div>
            
            <div className="text-center mb-3">
              <div className="text-3xl font-mono" style={{ color: isExothermic ? '#10b981' : '#ef4444' }}>
                {isExothermic ? '−' : '+'}{Math.abs(enthalpyChange).toFixed(1)} kJ/mol
              </div>
              <div className="text-sm text-gray-300">
                {isExothermic ? 'Exothermic reaction' : 'Endothermic reaction'}
              </div>
            </div>
            
            <div className="text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Reactants enthalpy:</span>
                <span className="text-red-400">{reactantsEnthalpy.toFixed(1)} kJ</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Products enthalpy:</span>
                <span className="text-green-400">{productsEnthalpy.toFixed(1)} kJ</span>
              </div>
              <div className="flex justify-between mt-2 pt-2 border-t border-slate-700">
                <span className="text-white">ΔH°rxn = ΣΔHf°(prod) - ΣΔHf°(react):</span>
                <span className="font-bold" style={{ color: isExothermic ? '#10b981' : '#ef4444' }}>
                  {enthalpyChange.toFixed(1)} kJ
                </span>
              </div>
            </div>
          </div>
        </Html>
      </group>
      
      {/* Energy flow visualization */}
      {isExothermic && (
        <group position={[0, -0.5, 0]}>
          {/* Energy release particles */}
          {Array.from({ length: 10 }).map((_, i) => (
            <Sphere
              key={i}
              args={[0.05, 8, 8]}
              position={[
                Math.sin(Date.now() * 0.001 + i) * 0.5,
                -Math.abs(Math.sin(Date.now() * 0.002 + i)),
                Math.cos(Date.now() * 0.001 + i) * 0.5
              ]}
            >
              <meshStandardMaterial 
                color="#f97316"
                emissive="#f97316"
                emissiveIntensity={2}
              />
            </Sphere>
          ))}
        </group>
      )}
    </group>
  );
}

function ReactionCalculator({
  onReactionCalculated,
  position = [0, 0, 0]
}: {
  onReactionCalculated: (reaction: any) => void;
  position?: [number, number, number];
}) {
  const [reactants, setReactants] = useState<Array<{formula: string, coefficient: number, ΔHf: number}>>([
    { formula: 'CH₄(g)', coefficient: 1, ΔHf: -74.8 },
    { formula: 'O₂(g)', coefficient: 2, ΔHf: 0 }
  ]);
  
  const [products, setProducts] = useState<Array<{formula: string, coefficient: number, ΔHf: number}>>([
    { formula: 'CO₂(g)', coefficient: 1, ΔHf: -393.5 },
    { formula: 'H₂O(l)', coefficient: 2, ΔHf: -285.8 }
  ]);
  
  const [selectedCompound, setSelectedCompound] = useState(COMPOUND_LIBRARY[0]);
  const [editingSide, setEditingSide] = useState<'reactants' | 'products'>('reactants');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // Calculate reaction enthalpy
  const reactantsEnthalpy = useMemo(() => 
    reactants.reduce((sum, r) => sum + r.coefficient * r.ΔHf, 0), [reactants]);
  
  const productsEnthalpy = useMemo(() => 
    products.reduce((sum, p) => sum + p.coefficient * p.ΔHf, 0), [products]);
  
  const enthalpyChange = productsEnthalpy - reactantsEnthalpy;
  
  // Update parent component
  React.useEffect(() => {
    onReactionCalculated({
      reactants,
      products,
      enthalpyChange,
      reactantsEnthalpy,
      productsEnthalpy
    });
  }, [reactants, products, enthalpyChange, reactantsEnthalpy, productsEnthalpy, onReactionCalculated]);
  
  const addCompound = (side: 'reactants' | 'products') => {
    const newCompound = {
      formula: selectedCompound.formula,
      coefficient: 1,
      ΔHf: selectedCompound.ΔHf
    };
    
    if (side === 'reactants') {
      setReactants([...reactants, newCompound]);
    } else {
      setProducts([...products, newCompound]);
    }
  };
  
  const removeCompound = (side: 'reactants' | 'products', index: number) => {
    if (side === 'reactants') {
      const newReactants = [...reactants];
      newReactants.splice(index, 1);
      setReactants(newReactants);
    } else {
      const newProducts = [...products];
      newProducts.splice(index, 1);
      setProducts(newProducts);
    }
  };
  
  const updateCoefficient = (side: 'reactants' | 'products', index: number, value: number) => {
    if (side === 'reactants') {
      const newReactants = [...reactants];
      newReactants[index].coefficient = value;
      setReactants(newReactants);
    } else {
      const newProducts = [...products];
      newProducts[index].coefficient = value;
      setProducts(newProducts);
    }
  };

  return (
    <group position={position}>
      <Html center>
        <div className="bg-slate-900/90 backdrop-blur-lg rounded-2xl border border-slate-700 p-6 shadow-2xl w-96">
          <div className="text-white text-lg font-bold mb-4">Reaction Calculator</div>
          
          {/* Reaction equation display */}
          <div className="mb-6 p-4 bg-slate-800/50 rounded-lg">
            <div className="text-sm text-gray-300 mb-2">Balanced Reaction:</div>
            <div className="text-lg font-mono text-center">
              {reactants.map((r, i) => (
                <span key={i}>
                  {i > 0 && <span className="text-white"> + </span>}
                  {r.coefficient !== 1 && <span className="text-yellow-400">{r.coefficient}</span>}
                  <span className="text-red-400"> {r.formula}</span>
                </span>
              ))}
              <span className="text-white mx-3">→</span>
              {products.map((p, i) => (
                <span key={i}>
                  {i > 0 && <span className="text-white"> + </span>}
                  {p.coefficient !== 1 && <span className="text-yellow-400">{p.coefficient}</span>}
                  <span className="text-green-400"> {p.formula}</span>
                </span>
              ))}
            </div>
          </div>
          
          {/* Reactants panel */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-red-400">Reactants</div>
              <button
                onClick={() => { setEditingSide('reactants'); addCompound('reactants'); }}
                className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded hover:bg-red-800/50"
              >
                + Add Reactant
              </button>
            </div>
            
            <div className="space-y-2">
              {reactants.map((reactant, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-slate-800/30 rounded">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={reactant.coefficient}
                    onChange={(e) => updateCoefficient('reactants', index, parseInt(e.target.value))}
                    className="w-12 bg-slate-700 text-white text-center rounded py-1"
                  />
                  <div className="flex-1 text-sm text-red-300">{reactant.formula}</div>
                  <div className="text-sm text-gray-400">ΔHf = {reactant.ΔHf} kJ/mol</div>
                  <button
                    onClick={() => removeCompound('reactants', index)}
                    className="text-red-500 hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Products panel */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-green-400">Products</div>
              <button
                onClick={() => { setEditingSide('products'); addCompound('products'); }}
                className="text-xs bg-green-900/50 text-green-300 px-2 py-1 rounded hover:bg-green-800/50"
              >
                + Add Product
              </button>
            </div>
            
            <div className="space-y-2">
              {products.map((product, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-slate-800/30 rounded">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={product.coefficient}
                    onChange={(e) => updateCoefficient('products', index, parseInt(e.target.value))}
                    className="w-12 bg-slate-700 text-white text-center rounded py-1"
                  />
                  <div className="flex-1 text-sm text-green-300">{product.formula}</div>
                  <div className="text-sm text-gray-400">ΔHf = {product.ΔHf} kJ/mol</div>
                  <button
                    onClick={() => removeCompound('products', index)}
                    className="text-red-500 hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Compound selector */}
          <div className="mb-6">
            <div className="text-sm font-bold text-white mb-3">Add Compound:</div>
            <div className="grid grid-cols-3 gap-2">
              {COMPOUND_LIBRARY.slice(0, 6).map((compound) => (
                <button
                  key={compound.formula}
                  onClick={() => setSelectedCompound(compound)}
                  className={`p-2 rounded text-xs transition-all ${
                    selectedCompound.formula === compound.formula
                      ? 'ring-2 ring-offset-1 ring-offset-black'
                      : 'opacity-90 hover:opacity-100'
                  }`}
                  style={{ 
                    backgroundColor: selectedCompound.formula === compound.formula 
                      ? compound.color 
                      : `${compound.color}40`,
                    color: selectedCompound.formula === compound.formula ? 'white' : '#E5E7EB'
                  }}
                >
                  {compound.formula}
                </button>
              ))}
            </div>
            
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs text-gray-400">
                {selectedCompound.name}: ΔHf° = {selectedCompound.ΔHf} kJ/mol
              </div>
              <button
                onClick={() => addCompound(editingSide)}
                className="text-xs bg-blue-900/50 text-blue-300 px-3 py-1 rounded hover:bg-blue-800/50"
              >
                Add to {editingSide === 'reactants' ? 'Reactants' : 'Products'}
              </button>
            </div>
          </div>
          
          {/* Calculation results */}
          <div className="pt-4 border-t border-slate-800">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-2 rounded bg-slate-800/50">
                <div className="text-xs text-gray-400">Reactants ΣΔHf°</div>
                <div className="text-lg font-bold text-red-400">{reactantsEnthalpy.toFixed(1)} kJ</div>
              </div>
              
              <div className="text-center p-2 rounded bg-slate-800/50">
                <div className="text-xs text-gray-400">Products ΣΔHf°</div>
                <div className="text-lg font-bold text-green-400">{productsEnthalpy.toFixed(1)} kJ</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 rounded-lg border-2"
                 style={{ 
                   borderColor: enthalpyChange < 0 ? '#10b981' : '#ef4444',
                   backgroundColor: `${enthalpyChange < 0 ? '#10b981' : '#ef4444'}10`
                 }}>
              <div className="text-center">
                <div className="text-sm text-gray-300">Reaction Enthalpy:</div>
                <div className="text-2xl font-bold" style={{ color: enthalpyChange < 0 ? '#10b981' : '#ef4444' }}>
                  ΔH°rxn = {enthalpyChange.toFixed(1)} kJ
                </div>
                <div className="text-sm mt-1" style={{ color: enthalpyChange < 0 ? '#10b981' : '#ef4444' }}>
                  {enthalpyChange < 0 ? 'Exothermic' : 'Endothermic'} reaction
                </div>
              </div>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

function StabilityLandscape({
  compounds,
  position = [0, 0, 0]
}: {
  compounds: Array<typeof COMPOUND_LIBRARY[0]>;
  position?: [number, number, number];
}) {
  const landscapeRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (landscapeRef.current) {
      landscapeRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <group ref={landscapeRef} position={position}>
      {/* Landscape surface */}
      <Plane args={[10, 10, 32, 32]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial 
          color="#1e293b"
          side={THREE.DoubleSide}
          wireframe={true}
          opacity={0.3}
          transparent
        />
      </Plane>
      
      {/* Compounds positioned by stability */}
      {compounds.map((compound, i) => {
        const angle = (i / compounds.length) * Math.PI * 2;
        const radius = 4;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = compound.ΔHf / 100; // Height based on enthalpy
        
        const isStable = compound.ΔHf < 0;
        const color = isStable ? COLORS.enthalpyNegative : 
                     compound.ΔHf > 0 ? COLORS.enthalpyPositive : COLORS.enthalpyNeutral;
        
        return (
          <group key={compound.formula} position={[x, y, z]}>
            {/* Connection to center */}
            <Line
              points={[[0, 0, 0], [x, y, z]]}
              color={color}
              opacity={0.2}
              transparent
              lineWidth={1}
            />
            
            {/* Compound marker */}
            <Sphere args={[0.4, 16, 16]}>
              <meshStandardMaterial 
                color={color}
                emissive={color}
                emissiveIntensity={0.3}
              />
            </Sphere>
            
            <Html position={[0, 0.5, 0]} center>
              <div className="bg-black/80 p-2 rounded border border-slate-700 backdrop-blur-sm">
                <div className="text-xs font-bold" style={{ color }}>{compound.formula}</div>
                <div className="text-xs text-gray-400">ΔHf° = {compound.ΔHf} kJ/mol</div>
              </div>
            </Html>
          </group>
        );
      })}
      
      {/* Center reference (elements at ΔHf = 0) */}
      <group position={[0, 0, 0]}>
        <Ring args={[0.5, 0.6, 32]} rotation={[Math.PI/2, 0, 0]}>
          <meshBasicMaterial color="#64748b" side={THREE.DoubleSide} />
        </Ring>
        <Html position={[0, 0.2, 0]} center>
          <div className="bg-black/80 p-2 rounded">
            <div className="text-xs text-gray-400">Elements ΔHf° = 0</div>
          </div>
        </Html>
      </group>
      
      {/* Stability guide */}
      <Html position={[0, 3, 0]} center>
        <div className="bg-black/80 p-4 rounded-xl border-2 border-purple-500/50 backdrop-blur-sm">
          <div className="text-lg font-bold text-purple-400 mb-2">Stability Landscape</div>
          <div className="text-sm text-gray-300">
            Compounds positioned by their formation enthalpy. Lower (more negative) = more stable.
          </div>
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="text-xs text-gray-300">Stable (ΔHf° &lt; 0)</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="text-xs text-gray-300">Unstable (ΔHf° &gt; 0)</div>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

// --- MAIN COMPONENT ---
export default function EnthalpiesOfFormationPage() {
  const [activeView, setActiveView] = useState<'formation' | 'reaction' | 'landscape'>('formation');
  const [selectedCompound, setSelectedCompound] = useState(COMPOUND_LIBRARY[0]);
  const [reactionData, setReactionData] = useState<any>(null);
  
  // Get formation reaction elements
  const formationElements = useMemo(() => {
    // Simplified: For demo purposes, return some elements
    return [
      { ...COMPOUND_LIBRARY[7], ΔHf: 0 }, // O₂
      { ...COMPOUND_LIBRARY[8], ΔHf: 0 }, // H₂
      { ...COMPOUND_LIBRARY[9], ΔHf: 0 }  // C
    ];
  }, []);

  return (
    <SimulationLayout
      title="Standard Enthalpies of Formation (ΔHf°)"
      description="Explore formation enthalpies, calculate reaction energetics, and visualize compound stability in 3D space. Understand why some compounds are more stable than others."
      cameraPosition={[0, 2, 15]}
    >
      <Float speed={0.3} rotationIntensity={0.1} floatIntensity={0.2}>
        <group>
          {/* View Mode Selector */}
          <Html position={[0, 5, 0]} center>
            <div className="flex gap-2 bg-black/70 px-6 py-3 rounded-full backdrop-blur-md border border-slate-700">
              {(['formation', 'reaction', 'landscape'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeView === view
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {view === 'formation' ? 'Formation Reactions' :
                   view === 'reaction' ? 'Reaction Calculator' :
                   'Stability Landscape'}
                </button>
              ))}
            </div>
          </Html>
          
          {/* Compound Selector */}
          <Html position={[0, 3.5, 0]} center>
            <div className="flex flex-wrap gap-2 bg-black/70 px-4 py-3 rounded-xl backdrop-blur-md border border-slate-700 max-w-3xl">
              {COMPOUND_LIBRARY.slice(0, 8).map((compound) => (
                <button
                  key={compound.formula}
                  onClick={() => setSelectedCompound(compound)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCompound.formula === compound.formula
                      ? 'ring-2 ring-offset-1 ring-offset-black'
                      : 'opacity-90 hover:opacity-100'
                  }`}
                  style={{ 
                    backgroundColor: selectedCompound.formula === compound.formula 
                      ? compound.color 
                      : `${compound.color}40`,
                    color: selectedCompound.formula === compound.formula ? 'white' : '#E5E7EB'
                  }}
                >
                  {compound.formula}
                  <div className="text-xs opacity-80">
                    ΔHf° = {compound.ΔHf} kJ/mol
                  </div>
                </button>
              ))}
            </div>
          </Html>
          
          {/* Main Visualization */}
          {activeView === 'formation' && (
            <FormationReactionVisualization
              compound={selectedCompound}
              elements={formationElements}
              enthalpy={selectedCompound.ΔHf}
              position={[0, -1, 0]}
            />
          )}
          
          {activeView === 'reaction' && reactionData && (
            <EnthalpyDiagram3D
              reactants={reactionData.reactants}
              products={reactionData.products}
              enthalpyChange={reactionData.enthalpyChange}
              position={[0, 0, 0]}
            />
          )}
          
          {activeView === 'landscape' && (
            <StabilityLandscape
              compounds={COMPOUND_LIBRARY}
              position={[0, 0, 0]}
            />
          )}
          
          {/* Reaction Calculator (always shown except in landscape view) */}
          {activeView !== 'landscape' && (
            <ReactionCalculator
              onReactionCalculated={setReactionData}
              position={activeView === 'reaction' ? [0, -4, 0] : [6, -2, 0]}
            />
          )}
          
          {/* Educational Panel */}
          <Html position={[-6, 2, 0]} center>
            <div className="bg-black/80 p-4 rounded-xl border-2 border-blue-500/50 backdrop-blur-sm min-w-[280px]">
              <div className="text-lg font-bold text-blue-400 mb-3">Key Concepts</div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-white font-bold">ΔHf° Definition</div>
                  <div className="text-gray-400">
                    Enthalpy change when 1 mole of compound forms from elements in standard states
                  </div>
                </div>
                
                <div>
                  <div className="text-white font-bold">Standard States</div>
                  <div className="text-gray-400">
                    Most stable form at 1 bar and 298 K (O₂ gas, C graphite, etc.)
                  </div>
                </div>
                
                <div>
                  <div className="text-white font-bold">Stability</div>
                  <div className="text-gray-400">
                    More negative ΔHf° = more stable compound
                  </div>
                </div>
                
                <div>
                  <div className="text-white font-bold">Hess's Law</div>
                  <div className="text-gray-400">
                    ΔH°rxn = ΣΔHf°(products) - ΣΔHf°(reactants)
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-700">
                <div className="text-xs text-gray-400">
                  <span className="font-bold text-white">Note:</span> Elements have ΔHf° = 0 by definition
                </div>
              </div>
            </div>
          </Html>
          
          {/* Data Reference */}
          <Html position={[6, 2, 0]} center>
            <div className="bg-black/80 p-4 rounded-xl border-2 border-green-500/50 backdrop-blur-sm min-w-[280px]">
              <div className="text-lg font-bold text-green-400 mb-3">Selected Compound</div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-xl font-bold text-center" style={{ color: selectedCompound.color }}>
                    {selectedCompound.formula}
                  </div>
                  <div className="text-sm text-gray-300 text-center">{selectedCompound.name}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 rounded bg-slate-900/50">
                    <div className="text-xs text-gray-400">ΔHf°</div>
                    <div className="text-lg font-bold" style={{ 
                      color: selectedCompound.ΔHf < 0 ? '#10b981' : 
                            selectedCompound.ΔHf > 0 ? '#ef4444' : '#f59e0b'
                    }}>
                      {selectedCompound.ΔHf} kJ/mol
                    </div>
                  </div>
                  
                  <div className="text-center p-2 rounded bg-slate-900/50">
                    <div className="text-xs text-gray-400">State</div>
                    <div className="text-lg font-bold text-white">
                      {selectedCompound.state}
                    </div>
                  </div>
                </div>
                
                <div className="p-2 rounded bg-slate-900/50">
                  <div className="text-xs text-gray-400 mb-1">Stability:</div>
                  <div className="text-sm">
                    {selectedCompound.ΔHf < -200 ? (
                      <span className="text-green-400">Highly stable (large negative ΔHf°)</span>
                    ) : selectedCompound.ΔHf < 0 ? (
                      <span className="text-green-300">Moderately stable</span>
                    ) : selectedCompound.ΔHf === 0 ? (
                      <span className="text-yellow-400">Reference element</span>
                    ) : (
                      <span className="text-red-400">Unstable (positive ΔHf°)</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-700">
                <div className="text-xs text-gray-400">
                  <span className="font-bold text-white">Fun Fact:</span> {selectedCompound.ΔHf < 0 
                    ? `Formation releases ${Math.abs(selectedCompound.ΔHf)} kJ per mole`
                    : `Formation requires ${selectedCompound.ΔHf} kJ per mole`
                  }
                </div>
              </div>
            </div>
          </Html>
          
          {/* Active View Indicator */}
          <Html position={[0, -2.5, 0]} center>
            <div className="flex items-center gap-4 bg-black/60 px-6 py-3 rounded-full backdrop-blur-md border border-slate-700">
              <div className="text-slate-300 text-sm">Exploring:</div>
              <div className="text-sm font-bold text-white">
                {activeView === 'formation' ? 'Formation Reaction of ' + selectedCompound.name :
                 activeView === 'reaction' ? 'Reaction Enthalpy Calculation' :
                 'Compound Stability Landscape'}
              </div>
            </div>
          </Html>
        </group>
      </Float>
    </SimulationLayout>
  );
}

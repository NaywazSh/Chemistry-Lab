'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Sphere, Cylinder, Box, Html, Float, Text,
  Line, Ring, Billboard, Trail, Tetrahedron
} from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

// --- Types ---
type MonomerType = 'ethylene' | 'styrene' | 'propylene' | 'vinyl_chloride';
type PolymerType = 'polyethylene' | 'polystyrene' | 'polypropylene' | 'pvc';
type ViewMode = 'comparison' | 'polymerization' | 'matching' | 'quiz';

// --- Color Scheme ---
const ATOM_COLORS = {
  carbon: '#333333',
  hydrogen: '#FFFFFF',
  chlorine: '#34D399',
  benzene: '#FF6B6B',
  oxygen: '#FF4444',
  bond: '#CCCCCC',
  doubleBond: '#94A3B8',
  polymerBond: '#22C55E'
};

// --- Monomer Components ---

const EthyleneMonomer = ({ 
  position = [0, 0, 0], 
  scale = 1, 
  animated = false,
  rotationSpeed = 0 
}: { 
  position?: [number, number, number], 
  scale?: number,
  animated?: boolean,
  rotationSpeed?: number 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current && animated) {
      groupRef.current.rotation.y = clock.getElapsedTime() * rotationSpeed;
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 2) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Carbon Atoms */}
      <Sphere args={[0.25 * scale, 16, 16]} position={[-0.3 * scale, 0, 0]}>
        <meshStandardMaterial color={ATOM_COLORS.carbon} />
      </Sphere>
      <Sphere args={[0.25 * scale, 16, 16]} position={[0.3 * scale, 0, 0]}>
        <meshStandardMaterial color={ATOM_COLORS.carbon} />
      </Sphere>
      
      {/* Double Bond */}
      <Cylinder 
        args={[0.04 * scale, 0.04 * scale, 0.6 * scale]} 
        rotation={[0, 0, Math.PI/2]} 
        position={[0, 0.1 * scale, 0]}
      >
        <meshStandardMaterial color={ATOM_COLORS.doubleBond} />
      </Cylinder>
      <Cylinder 
        args={[0.04 * scale, 0.04 * scale, 0.6 * scale]} 
        rotation={[0, 0, Math.PI/2]} 
        position={[0, -0.1 * scale, 0]}
      >
        <meshStandardMaterial color={ATOM_COLORS.doubleBond} />
      </Cylinder>
      
      {/* Hydrogens */}
      {[
        [-0.6 * scale, 0.4 * scale, 0],
        [-0.6 * scale, -0.4 * scale, 0],
        [0.6 * scale, 0.4 * scale, 0],
        [0.6 * scale, -0.4 * scale, 0]
      ].map((pos, i) => (
        <Sphere key={i} args={[0.15 * scale, 16, 16]} position={pos as [number, number, number]}>
          <meshStandardMaterial color={ATOM_COLORS.hydrogen} />
        </Sphere>
      ))}
      
      {/* Formula */}
      <Html position={[0, -0.8 * scale, 0]} center>
        <div className="bg-black/70 px-3 py-1 rounded-lg border border-blue-500/50">
          <div className="text-blue-300 text-sm font-bold">C₂H₄</div>
          <div className="text-gray-400 text-xs">Ethylene</div>
        </div>
      </Html>
    </group>
  );
};

const StyreneMonomer = ({ 
  position = [0, 0, 0], 
  scale = 1, 
  animated = false 
}: { 
  position?: [number, number, number], 
  scale?: number,
  animated?: boolean 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current && animated) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Benzene Ring */}
      <Ring args={[0.7 * scale, 0.9 * scale, 6]} rotation={[Math.PI/2, 0, 0]}>
        <meshStandardMaterial color={ATOM_COLORS.benzene} side={THREE.DoubleSide} />
      </Ring>
      
      {/* Carbon atoms in ring */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 0.8 * scale;
        const z = Math.sin(angle) * 0.8 * scale;
        return (
          <Sphere key={i} args={[0.15 * scale, 16, 16]} position={[x, 0, z]}>
            <meshStandardMaterial color={ATOM_COLORS.carbon} />
          </Sphere>
        );
      })}
      
      {/* Vinyl Group (C=C with hydrogens) */}
      <group position={[1.2 * scale, 0, 0]}>
        {/* Carbon atoms */}
        <Sphere args={[0.2 * scale, 16, 16]} position={[0, 0, 0]}>
          <meshStandardMaterial color={ATOM_COLORS.carbon} />
        </Sphere>
        <Sphere args={[0.2 * scale, 16, 16]} position={[0.6 * scale, 0, 0]}>
          <meshStandardMaterial color={ATOM_COLORS.carbon} />
        </Sphere>
        
        {/* Double Bond */}
        <Cylinder 
          args={[0.035 * scale, 0.035 * scale, 0.6 * scale]} 
          rotation={[0, 0, Math.PI/2]} 
          position={[0.3 * scale, 0.08 * scale, 0]}
        >
          <meshStandardMaterial color={ATOM_COLORS.doubleBond} />
        </Cylinder>
        <Cylinder 
          args={[0.035 * scale, 0.035 * scale, 0.6 * scale]} 
          rotation={[0, 0, Math.PI/2]} 
          position={[0.3 * scale, -0.08 * scale, 0]}
        >
          <meshStandardMaterial color={ATOM_COLORS.doubleBond} />
        </Cylinder>
        
        {/* Hydrogens */}
        <Sphere args={[0.12 * scale, 16, 16]} position={[0.9 * scale, 0.3 * scale, 0]}>
          <meshStandardMaterial color={ATOM_COLORS.hydrogen} />
        </Sphere>
        <Sphere args={[0.12 * scale, 16, 16]} position={[0.9 * scale, -0.3 * scale, 0]}>
          <meshStandardMaterial color={ATOM_COLORS.hydrogen} />
        </Sphere>
      </group>
      
      {/* Formula */}
      <Html position={[0, -1.2 * scale, 0]} center>
        <div className="bg-black/70 px-3 py-1 rounded-lg border border-purple-500/50">
          <div className="text-purple-300 text-sm font-bold">C₈H₈</div>
          <div className="text-gray-400 text-xs">Styrene</div>
        </div>
      </Html>
    </group>
  );
};

// --- Polymer Chain Components ---

const PolyethyleneChain = ({ 
  length = 5, 
  position = [0, 0, 0], 
  scale = 1,
  animated = false 
}: { 
  length?: number, 
  position?: [number, number, number],
  scale?: number,
  animated?: boolean 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current && animated) {
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <group position={[(-(length-1) * 0.5 * scale) / 2, 0, 0]}>
        {Array.from({ length }).map((_, i) => (
          <group key={i} position={[i * 0.8 * scale, 0, 0]}>
            {/* Main chain carbon */}
            <Sphere args={[0.25 * scale, 16, 16]}>
              <meshStandardMaterial color={ATOM_COLORS.carbon} />
            </Sphere>
            
            {/* Hydrogen substituents */}
            {[-0.4, 0.4].map((yOffset, j) => (
              <Sphere 
                key={j} 
                args={[0.15 * scale, 16, 16]} 
                position={[0, yOffset * scale, 0]}
              >
                <meshStandardMaterial color={ATOM_COLORS.hydrogen} />
              </Sphere>
            ))}
            
            {/* Polymer bond to next unit */}
            {i < length - 1 && (
              <Cylinder 
                args={[0.06 * scale, 0.06 * scale, 0.8 * scale]} 
                rotation={[0, 0, Math.PI/2]} 
                position={[0.4 * scale, 0, 0]}
              >
                <meshStandardMaterial color={ATOM_COLORS.polymerBond} />
              </Cylinder>
            )}
          </group>
        ))}
      </group>
      
      {/* Polymer Label */}
      <Html position={[0, 1.5 * scale, 0]} center>
        <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 px-4 py-2 rounded-lg border border-green-500/50 backdrop-blur-sm">
          <div className="text-green-300 text-sm font-bold">[-CH₂-CH₂-]n</div>
          <div className="text-gray-300 text-xs">Polyethylene (Polythene)</div>
        </div>
      </Html>
      
      {/* Repeating Unit Highlight */}
      {length >= 3 && (
        <group position={[0, -1 * scale, 0]}>
          <Line
            points={[[-0.8 * scale, 0, 0], [0.8 * scale, 0, 0]]}
            color="#22C55E"
            lineWidth={3}
            opacity={0.5}
            transparent
          />
          <Html position={[0, 0.3 * scale, 0]} center>
            <div className="bg-black/70 px-2 py-1 rounded text-xs text-green-400">
              Repeating Unit
            </div>
          </Html>
        </group>
      )}
    </group>
  );
};

const PolystyreneChain = ({ 
  length = 4, 
  position = [0, 0, 0], 
  scale = 1,
  animated = false 
}: { 
  length?: number, 
  position?: [number, number, number],
  scale?: number,
  animated?: boolean 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current && animated) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <group position={[(-(length-1) * 0.9 * scale) / 2, 0, 0]}>
        {Array.from({ length }).map((_, i) => (
          <group key={i} position={[i * 1.2 * scale, 0, 0]}>
            {/* Main chain carbons */}
            <Sphere args={[0.2 * scale, 16, 16]} position={[-0.3 * scale, 0, 0]}>
              <meshStandardMaterial color={ATOM_COLORS.carbon} />
            </Sphere>
            <Sphere args={[0.2 * scale, 16, 16]} position={[0.3 * scale, 0, 0]}>
              <meshStandardMaterial color={ATOM_COLORS.carbon} />
            </Sphere>
            
            {/* Benzene ring side group */}
            <group position={[-0.3 * scale, 0.6 * scale, 0]}>
              <Ring args={[0.4 * scale, 0.5 * scale, 6]} rotation={[Math.PI/2, 0, 0]}>
                <meshStandardMaterial color={ATOM_COLORS.benzene} side={THREE.DoubleSide} opacity={0.7} transparent />
              </Ring>
              <Cylinder 
                args={[0.04 * scale, 0.04 * scale, 0.6 * scale]} 
                rotation={[0, 0, 0]} 
                position={[0, -0.3 * scale, 0]}
              >
                <meshStandardMaterial color={ATOM_COLORS.benzene} />
              </Cylinder>
            </group>
            
            {/* Hydrogen on other carbon */}
            <Sphere args={[0.12 * scale, 16, 16]} position={[0.3 * scale, 0.4 * scale, 0]}>
              <meshStandardMaterial color={ATOM_COLORS.hydrogen} />
            </Sphere>
            
            {/* Polymer bond */}
            {i < length - 1 && (
              <Cylinder 
                args={[0.05 * scale, 0.05 * scale, 0.9 * scale]} 
                rotation={[0, 0, Math.PI/2]} 
                position={[0.6 * scale, 0, 0]}
              >
                <meshStandardMaterial color={ATOM_COLORS.polymerBond} />
              </Cylinder>
            )}
          </group>
        ))}
      </group>
      
      {/* Polymer Label */}
      <Html position={[0, 1.8 * scale, 0]} center>
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 px-4 py-2 rounded-lg border border-purple-500/50 backdrop-blur-sm">
          <div className="text-purple-300 text-sm font-bold">[-CH(C₆H₅)-CH₂-]n</div>
          <div className="text-gray-300 text-xs">Polystyrene</div>
        </div>
      </Html>
    </group>
  );
};

// --- Polymerization Animation ---

const PolymerizationAnimation = ({ 
  monomerType = 'ethylene', 
  active = false 
}: { 
  monomerType?: MonomerType,
  active?: boolean 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [monomerCount, setMonomerCount] = useState(3);
  const [bondFormation, setBondFormation] = useState(0);
  const monomers = useRef<THREE.Group[]>([]);
  
  useEffect(() => {
    if (active) {
      const interval = setInterval(() => {
        setBondFormation(prev => (prev + 0.1) % 1);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [active]);

  useFrame(({ clock }) => {
    if (groupRef.current && active) {
      // Float animation for monomers
      monomers.current.forEach((monomer, i) => {
        if (monomer) {
          const time = clock.getElapsedTime();
          monomer.position.y = Math.sin(time * 2 + i) * 0.2;
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Animated polymerization process */}
      <Html position={[0, 2.5, 0]} center>
        <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 p-4 rounded-xl border border-blue-500/50 backdrop-blur-md">
          <div className="text-blue-300 text-lg font-bold mb-2">Polymerization Process</div>
          <div className="text-gray-300 text-sm">
            {monomerType === 'ethylene' 
              ? 'n CH₂=CH₂ → [-CH₂-CH₂-]n (Addition Polymerization)'
              : 'n C₈H₈ → [-CH(C₆H₅)-CH₂-]n (Chain-Growth Polymerization)'}
          </div>
          <div className="mt-2 text-xs text-blue-400">
            Double bonds open up to form single bonds between monomers
          </div>
        </div>
      </Html>

      {/* Animation visualization */}
      {active && (
        <>
          {/* Bond formation visualization */}
          <group position={[0, 0, 0]}>
            <Cylinder 
              args={[0.03, 0.03, bondFormation * 2]} 
              position={[bondFormation, 0, 0]} 
              rotation={[0, 0, Math.PI/2]}
            >
              <meshStandardMaterial color="#22C55E" emissive="#22C55E" emissiveIntensity={2} />
            </Cylinder>
            
            {/* Animated electrons moving */}
            <Trail
              width={2}
              length={8}
              color={new THREE.Color('#00FFFF')}
              attenuation={(t) => t * t}
            >
              <Sphere args={[0.1, 16, 16]} position={[Math.sin(Date.now() * 0.005) * 2, 0, 0]}>
                <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={3} />
              </Sphere>
            </Trail>
          </group>
          
          {/* Arrow animation */}
          <group position={[0, -1.5, 0]}>
            <Html center>
              <div className="text-4xl text-green-500 animate-pulse">→</div>
            </Html>
            <Text position={[0, 0.5, 0]} fontSize={0.3} color="#22C55E">
              Polymerization
            </Text>
          </group>
        </>
      )}
    </group>
  );
};

// --- Matching Game Component ---

const MatchingGame = () => {
  const [selectedMonomer, setSelectedMonomer] = useState<MonomerType | null>(null);
  const [selectedPolymer, setSelectedPolymer] = useState<PolymerType | null>(null);
  const [matches, setMatches] = useState<{monomer: MonomerType, polymer: PolymerType}[]>([]);
  const [score, setScore] = useState(0);
  
  const monomerOptions: {type: MonomerType, name: string, color: string}[] = [
    { type: 'ethylene', name: 'Ethylene', color: '#3B82F6' },
    { type: 'styrene', name: 'Styrene', color: '#8B5CF6' },
    { type: 'propylene', name: 'Propylene', color: '#10B981' },
    { type: 'vinyl_chloride', name: 'Vinyl Chloride', color: '#F59E0B' }
  ];
  
  const polymerOptions: {type: PolymerType, name: string, color: string}[] = [
    { type: 'polyethylene', name: 'Polyethylene', color: '#059669' },
    { type: 'polystyrene', name: 'Polystyrene', color: '#7C3AED' },
    { type: 'polypropylene', name: 'Polypropylene', color: '#047857' },
    { type: 'pvc', name: 'PVC', color: '#D97706' }
  ];
  
  const correctPairs = [
    { monomer: 'ethylene', polymer: 'polyethylene' },
    { monomer: 'styrene', polymer: 'polystyrene' },
    { monomer: 'propylene', polymer: 'polypropylene' },
    { monomer: 'vinyl_chloride', polymer: 'pvc' }
  ];

  const handleMonomerSelect = (monomer: MonomerType) => {
    setSelectedMonomer(monomer);
    if (selectedPolymer) {
      checkMatch(monomer, selectedPolymer);
    }
  };

  const handlePolymerSelect = (polymer: PolymerType) => {
    setSelectedPolymer(polymer);
    if (selectedMonomer) {
      checkMatch(selectedMonomer, polymer);
    }
  };

  const checkMatch = (monomer: MonomerType, polymer: PolymerType) => {
    const isCorrect = correctPairs.some(pair => 
      pair.monomer === monomer && pair.polymer === polymer
    );
    
    if (isCorrect) {
      setMatches(prev => [...prev, { monomer, polymer }]);
      setScore(prev => prev + 100);
      setSelectedMonomer(null);
      setSelectedPolymer(null);
    } else {
      // Incorrect match - flash red
      setTimeout(() => {
        setSelectedMonomer(null);
        setSelectedPolymer(null);
      }, 1000);
    }
  };

  return (
    <group position={[0, 0, 0]}>
      <Html position={[0, 3, 0]} center>
        <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 p-6 rounded-2xl border border-purple-500/50 backdrop-blur-lg w-96">
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-white mb-2">Match Monomers to Polymers</div>
            <div className="text-lg text-cyan-300">Score: {score}</div>
          </div>

          {/* Monomer Selection */}
          <div className="mb-6">
            <div className="text-white font-bold text-sm mb-3">Select Monomer:</div>
            <div className="grid grid-cols-2 gap-2">
              {monomerOptions.map(monomer => (
                <button
                  key={monomer.type}
                  onClick={() => handleMonomerSelect(monomer.type)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    selectedMonomer === monomer.type
                      ? 'ring-2 ring-offset-1 ring-offset-black'
                      : 'opacity-90 hover:opacity-100'
                  }`}
                  style={{ 
                    backgroundColor: selectedMonomer === monomer.type ? monomer.color : `${monomer.color}40`,
                    color: selectedMonomer === monomer.type ? 'white' : '#E5E7EB'
                  }}
                >
                  {monomer.name}
                </button>
              ))}
            </div>
          </div>

          {/* Polymer Selection */}
          <div className="mb-6">
            <div className="text-white font-bold text-sm mb-3">Select Polymer:</div>
            <div className="grid grid-cols-2 gap-2">
              {polymerOptions.map(polymer => (
                <button
                  key={polymer.type}
                  onClick={() => handlePolymerSelect(polymer.type)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    selectedPolymer === polymer.type
                      ? 'ring-2 ring-offset-1 ring-offset-black'
                      : 'opacity-90 hover:opacity-100'
                  }`}
                  style={{ 
                    backgroundColor: selectedPolymer === polymer.type ? polymer.color : `${polymer.color}40`,
                    color: selectedPolymer === polymer.type ? 'white' : '#E5E7EB'
                  }}
                >
                  {polymer.name}
                </button>
              ))}
            </div>
          </div>

          {/* Matches Made */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="text-white font-bold text-sm mb-2">Matches Made:</div>
            <div className="space-y-2">
              {matches.map((match, index) => {
                const monomer = monomerOptions.find(m => m.type === match.monomer);
                const polymer = polymerOptions.find(p => p.type === match.polymer);
                return (
                  <div key={index} className="flex items-center justify-between bg-slate-800/50 p-2 rounded">
                    <span className="text-sm" style={{ color: monomer?.color }}>{monomer?.name}</span>
                    <span className="text-white mx-2">→</span>
                    <span className="text-sm" style={{ color: polymer?.color }}>{polymer?.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Progress: {matches.length}/{correctPairs.length}</span>
              <span>{Math.round((matches.length / correctPairs.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${(matches.length / correctPairs.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </Html>

      {/* Visual feedback for correct matches */}
      {matches.map((match, index) => (
        <group key={index} position={[index * 2 - 3, -2, 0]}>
          <Billboard>
            <Text fontSize={0.3} color="#22C55E">✓</Text>
          </Billboard>
        </group>
      ))}
    </group>
  );
};

// --- MAIN COMPONENT ---
export default function MonomerPolymerPairsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('comparison');
  const [selectedPair, setSelectedPair] = useState<'ethylene' | 'styrene'>('ethylene');
  const [showAnimation, setShowAnimation] = useState(false);
  const [chainLength, setChainLength] = useState(5);

  return (
    <SimulationLayout
      title="Monomer-Polymer Pairs"
      description="Explore how individual monomers combine to form polymers through addition polymerization. Compare structures, watch animations, and test your matching skills."
    >
      <Float speed={0.5} rotationIntensity={0.2} floatIntensity={0.2}>
        <group position={[0, 0, 0]}>
          
          {/* Side-by-side Comparison View */}
          {viewMode === 'comparison' && (
            <>
              {/* Left side: Monomer */}
              <group position={[-3, 0, 0]}>
                <Billboard position={[0, 2.5, 0]}>
                  <Text fontSize={0.5} color="#3B82F6">Monomer</Text>
                </Billboard>
                
                {selectedPair === 'ethylene' ? (
                  <EthyleneMonomer 
                    position={[0, 0, 0]} 
                    scale={1.2} 
                    animated={true}
                    rotationSpeed={0.2}
                  />
                ) : (
                  <StyreneMonomer 
                    position={[0, 0, 0]} 
                    scale={1} 
                    animated={true}
                  />
                )}
                
                <Html position={[0, -2, 0]} center>
                  <div className="bg-blue-900/30 p-3 rounded-xl border border-blue-500/50">
                    <div className="text-blue-300 text-sm font-bold mb-1">
                      {selectedPair === 'ethylene' ? 'Ethylene (C₂H₄)' : 'Styrene (C₈H₈)'}
                    </div>
                    <div className="text-gray-300 text-xs">
                      {selectedPair === 'ethylene' 
                        ? 'Simple alkene with double bond'
                        : 'Benzene ring with vinyl group'
                      }
                    </div>
                  </div>
                </Html>
              </group>

              {/* Right side: Polymer */}
              <group position={[3, 0, 0]}>
                <Billboard position={[0, 2.5, 0]}>
                  <Text fontSize={0.5} color="#10B981">Polymer</Text>
                </Billboard>
                
                {selectedPair === 'ethylene' ? (
                  <PolyethyleneChain 
                    length={chainLength} 
                    position={[0, 0, 0]} 
                    scale={0.8}
                    animated={true}
                  />
                ) : (
                  <PolystyreneChain 
                    length={chainLength} 
                    position={[0, 0, 0]} 
                    scale={0.7}
                    animated={true}
                  />
                )}
                
                <Html position={[0, -2, 0]} center>
                  <div className="bg-green-900/30 p-3 rounded-xl border border-green-500/50">
                    <div className="text-green-300 text-sm font-bold mb-1">
                      {selectedPair === 'ethylene' 
                        ? 'Polyethylene [-CH₂-CH₂-]n' 
                        : 'Polystyrene [-CH(C₆H₅)-CH₂-]n'
                      }
                    </div>
                    <div className="text-gray-300 text-xs">
                      {selectedPair === 'ethylene' 
                        ? 'Simple hydrocarbon polymer'
                        : 'Rigid polymer with aromatic side groups'
                      }
                    </div>
                  </div>
                </Html>
              </group>

              {/* Connection Arrow */}
              <group position={[0, 0, 0]}>
                <Html center>
                  <div className="text-6xl text-yellow-500 font-bold animate-pulse">⇨</div>
                </Html>
                <Text position={[0, 0.5, 0]} fontSize={0.4} color="#F59E0B" rotation={[0, 0, 0]}>
                  Polymerization
                </Text>
              </group>
            </>
          )}

          {/* Polymerization Animation View */}
          {viewMode === 'polymerization' && (
            <group>
              {showAnimation && <PolymerizationAnimation monomerType={selectedPair} active={true} />}
              
              {/* Multiple monomers converging */}
              {Array.from({ length: 6 }).map((_, i) => {
                const angle = (i / 6) * Math.PI * 2;
                const radius = showAnimation ? 2 : 3;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                
                return selectedPair === 'ethylene' ? (
                  <EthyleneMonomer 
                    key={i}
                    position={[x, 0, z]} 
                    scale={0.6}
                    animated={true}
                    rotationSpeed={0.3}
                  />
                ) : (
                  <StyreneMonomer 
                    key={i}
                    position={[x, 0, z]} 
                    scale={0.5}
                    animated={true}
                  />
                );
              })}
              
              {/* Central polymer chain forming */}
              <group position={[0, 0, 0]}>
                {selectedPair === 'ethylene' ? (
                  <PolyethyleneChain length={showAnimation ? chainLength : 3} scale={0.7} animated={true} />
                ) : (
                  <PolystyreneChain length={showAnimation ? chainLength : 3} scale={0.6} animated={true} />
                )}
              </group>
            </group>
          )}

          {/* Matching Game View */}
          {viewMode === 'matching' && <MatchingGame />}

          {/* Control Panel */}
          <Html position={[0, -3.5, 0]} center>
            <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700 p-4 shadow-2xl w-96">
              {/* View Mode Selection */}
              <div className="mb-4">
                <h3 className="text-white text-sm font-bold mb-2 uppercase tracking-wider">View Mode</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(['comparison', 'polymerization', 'matching'] as ViewMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                        viewMode === mode
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pair Selection */}
              <div className="mb-4">
                <h3 className="text-white text-sm font-bold mb-2 uppercase tracking-wider">Select Pair</h3>
                <div className="flex gap-2">
                  {[
                    { id: 'ethylene', name: 'Ethylene → Polyethylene', color: '#3B82F6' },
                    { id: 'styrene', name: 'Styrene → Polystyrene', color: '#8B5CF6' }
                  ].map(pair => (
                    <button
                      key={pair.id}
                      onClick={() => setSelectedPair(pair.id as any)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedPair === pair.id
                          ? 'ring-2 ring-offset-1 ring-offset-black text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                      style={selectedPair === pair.id ? { backgroundColor: pair.color } : {}}
                    >
                      {pair.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Animation Controls */}
              {viewMode === 'polymerization' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-300 text-sm">Polymerization Animation</span>
                    <button
                      onClick={() => setShowAnimation(!showAnimation)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        showAnimation ? 'bg-green-500' : 'bg-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        showAnimation ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Chain Length: {chainLength}</span>
                    <input
                      type="range"
                      min="3"
                      max="10"
                      value={chainLength}
                      onChange={(e) => setChainLength(parseInt(e.target.value))}
                      className="w-32 accent-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Educational Tips */}
              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-white text-xs font-bold mb-2 uppercase tracking-wider">Key Concepts</h4>
                <ul className="text-slate-300 text-xs space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span><strong>Monomers</strong> are small, reactive molecules</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span><strong>Polymers</strong> are long chains of repeating monomer units</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span><strong>Addition Polymerization</strong>: Double bonds open to form single bonds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span><strong>n</strong> indicates many repeating units (degree of polymerization)</span>
                  </li>
                </ul>
              </div>
            </div>
          </Html>

          {/* Progress Indicator */}
          <Html position={[0, 3.5, 0]} center>
            <div className="flex items-center gap-4 bg-black/60 px-6 py-3 rounded-full backdrop-blur-md border border-slate-700">
              <div className="text-slate-300 text-sm">Learning:</div>
              <div className="flex gap-2">
                {['comparison', 'polymerization', 'matching'].map((mode, i) => (
                  <div 
                    key={mode}
                    className={`w-3 h-3 rounded-full transition-all ${
                      viewMode === mode 
                        ? 'scale-125 ring-2 ring-offset-1 ring-offset-black'
                        : 'opacity-50'
                    }`}
                    style={{ 
                      backgroundColor: viewMode === mode 
                        ? (i === 0 ? '#3B82F6' : i === 1 ? '#10B981' : '#8B5CF6')
                        : '#4B5563'
                    }}
                  />
                ))}
              </div>
              <div className="text-xs text-slate-400">
                {viewMode === 'comparison' ? 'Structure Comparison' : 
                 viewMode === 'polymerization' ? 'Polymerization Process' : 'Matching Game'}
              </div>
            </div>
          </Html>

          {/* 3D Background Elements */}
          <group position={[5, 0, -8]}>
            {/* Molecular orbital representations */}
            {Array.from({ length: 4 }).map((_, i) => (
              <mesh key={i} rotation={[Math.PI/2, i * 0.5, 0]}>
                <ringGeometry args={[2 + i * 0.3, 2.2 + i * 0.3, 64]} />
                <meshBasicMaterial 
                  color={i % 2 === 0 ? '#3B82F6' : '#10B981'} 
                  opacity={0.05} 
                  transparent 
                  side={THREE.DoubleSide}
                />
              </mesh>
            ))}
          </group>
        </group>
      </Float>
    </SimulationLayout>
  );
}
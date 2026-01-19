'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Float, Html, Line, Text, Cone, Torus } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

type Cation = 'Cu²⁺' | 'Fe²⁺' | 'Fe³⁺' | 'Ca²⁺' | 'Al³⁺' | 'NH₄⁺' | 'Li⁺' | 'Na⁺' | 'K⁺' | 'Unknown';
type TestType = 'NaOH' | 'NH₄OH' | 'Flame' | 'HCl' | 'H₂SO₄';
type PrecipitateColor = 'lightblue' | 'muddygreen' | 'rustybrown' | 'white' | 'none';

function TestTube({ position, solutionColor, label, isSelected, onClick }: {
  position: [number, number, number];
  solutionColor: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <group position={position}>
      {/* Test Tube Glass */}
      <Cylinder args={[0.3, 0.3, 2, 32]} position={[0, 1, 0]}>
        <meshStandardMaterial 
          color="#e0e0e0" 
          transparent 
          opacity={0.2}
          roughness={0.1}
          metalness={0.8}
        />
      </Cylinder>
      
      {/* Solution inside */}
      <Cylinder args={[0.28, 0.28, 1.5, 32]} position={[0, 0.75, 0]}>
        <meshStandardMaterial 
          color={solutionColor}
          transparent
          opacity={0.7}
          roughness={0.3}
        />
      </Cylinder>
      
      {/* Test Tube Bottom (rounded) */}
      <Sphere args={[0.3, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#e0e0e0" 
          transparent 
          opacity={0.2}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>
      
      {/* Selection highlight */}
      {isSelected && (
        <mesh position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.4, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
      
      {/* Clickable area */}
      <mesh onClick={onClick} position={[0, 1, 0]}>
        <boxGeometry args={[0.7, 2, 0.7]} />
        <meshBasicMaterial color="#000000" transparent opacity={0} />
      </mesh>
      
      {/* Label */}
      <Html position={[0, -0.5, 0]} center>
        <div className={`px-3 py-2 rounded-lg backdrop-blur-sm font-bold transition-all duration-300 ${
          isSelected 
            ? 'bg-yellow-500/80 text-black scale-110' 
            : 'bg-black/70 text-white'
        }`}>
          {label}
        </div>
      </Html>
    </group>
  );
}

function Precipitate({ color, amount, position }: {
  color: string;
  amount: number; // 0 to 1
  position: [number, number, number];
}) {
  const particles = Array.from({ length: Math.floor(amount * 30) });
  
  return (
    <group position={position}>
      {particles.map((_, i) => (
        <Sphere
          key={i}
          args={[0.05 + Math.random() * 0.03, 8, 8]}
          position={[
            (Math.random() - 0.5) * 0.4,
            Math.random() * amount * 0.5,
            (Math.random() - 0.5) * 0.4
          ]}
        >
          <meshStandardMaterial 
            color={color}
            roughness={0.8}
            transparent
            opacity={0.8}
          />
        </Sphere>
      ))}
      
      {/* Settled precipitate layer */}
      <Cylinder 
        args={[0.25, 0.25, amount * 0.3, 32]} 
        position={[0, amount * 0.15, 0]}
      >
        <meshStandardMaterial 
          color={color}
          roughness={0.9}
          transparent
          opacity={0.7}
        />
      </Cylinder>
    </group>
  );
}

function FlameTest({ cation, position, isActive }: {
  cation: Cation;
  position: [number, number, number];
  isActive: boolean;
}) {
  const flameRef = useRef<THREE.Group>(null);
  const flameColors: Record<string, string> = {
    'Li⁺': '#ff0000',      // Red/Crimson
    'Na⁺': '#ffa500',      // Yellow-Orange
    'K⁺': '#c8a2c8',       // Lilac
    'Ca²⁺': '#ff4500',     // Orange-Red
    'Cu²⁺': '#00ff00',     // Green
  };
  
  useFrame(({ clock }) => {
    if (flameRef.current && isActive) {
      const time = clock.getElapsedTime();
      flameRef.current.children.forEach((child, i) => {
        const scale = 1 + Math.sin(time * 3 + i) * 0.2;
        child.scale.setScalar(scale);
      });
    }
  });

  return (
    <group position={position}>
      {/* Bunsen Burner */}
      <Cylinder args={[0.15, 0.15, 0.5, 32]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.2} />
      </Cylinder>
      
      <Cylinder args={[0.05, 0.05, 0.3, 32]} position={[0, 0.65, 0]}>
        <meshStandardMaterial color="#2d3748" metalness={0.9} />
      </Cylinder>
      
      {/* Flame */}
      {isActive && flameColors[cation] && (
        <group ref={flameRef}>
          <Cone args={[0.3, 1, 32]} position={[0, 1.2, 0]}>
            <meshStandardMaterial 
              color={flameColors[cation]}
              emissive={flameColors[cation]}
              emissiveIntensity={2}
              transparent
              opacity={0.9}
            />
          </Cone>
          
          <Cone args={[0.2, 0.7, 32]} position={[0, 1.6, 0]}>
            <meshStandardMaterial 
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={1}
              transparent
              opacity={0.7}
            />
          </Cone>
        </group>
      )}
      
      {/* Wire loop */}
      <Torus args={[0.15, 0.02, 16, 32]} position={[0, 1.1, 0]}>
        <meshStandardMaterial color="#d4d4d4" metalness={0.9} roughness={0.1} />
      </Torus>
      
      {/* Cation label */}
      <Html position={[0, -0.5, 0]} center>
        <div className="bg-black/70 text-white px-3 py-1 rounded-lg backdrop-blur-sm">
          {cation}
        </div>
      </Html>
    </group>
  );
}

function ReagentDropper({ position, reagent, isDropping, onClick }: {
  position: [number, number, number];
  reagent: string;
  isDropping: boolean;
  onClick: () => void;
}) {
  const dropRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (dropRef.current && isDropping) {
      const time = clock.getElapsedTime();
      dropRef.current.position.y = -1 - Math.sin(time * 10) * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Dropper bottle */}
      <Cylinder args={[0.2, 0.2, 0.8, 32]} position={[0, 0.4, 0]}>
        <meshStandardMaterial 
          color={reagent === 'NaOH' ? '#3b82f6' : '#10b981'}
          transparent
          opacity={0.7}
        />
      </Cylinder>
      
      <Cylinder args={[0.05, 0.05, 0.5, 32]} position={[0, 1.05, 0]}>
        <meshStandardMaterial color="#6b7280" />
      </Cylinder>
      
      {/* Rubber bulb */}
      <Sphere args={[0.15, 32, 32]} position={[0, 1.3, 0]}>
        <meshStandardMaterial color="#dc2626" roughness={0.8} />
      </Sphere>
      
      {/* Dropping liquid */}
      {isDropping && (
        <mesh ref={dropRef} position={[0, -1, 0]}>
          <Sphere args={[0.05, 16, 16]}>
            <meshStandardMaterial 
              color={reagent === 'NaOH' ? '#3b82f6' : '#10b981'}
              transparent
              opacity={0.8}
            />
          </Sphere>
        </mesh>
      )}
      
      {/* Clickable area */}
      <mesh onClick={onClick} position={[0, 0.8, 0]}>
        <boxGeometry args={[0.5, 1.2, 0.5]} />
        <meshBasicMaterial color="#000000" transparent opacity={0} />
      </mesh>
      
      {/* Label */}
      <Html position={[0, -0.8, 0]} center>
        <div className="bg-black/70 text-white px-3 py-1 rounded-lg backdrop-blur-sm">
          {reagent}
        </div>
      </Html>
    </group>
  );
}

function ChemicalEquation({ equation, position }: {
  equation: string;
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <Html>
        <div className="bg-black/80 p-4 rounded-xl backdrop-blur-sm border border-emerald-500/30">
          <div className="text-sm font-bold text-emerald-300 mb-2">Chemical Reaction</div>
          <div className="text-xl font-mono text-white">{equation}</div>
        </div>
      </Html>
    </group>
  );
}

function ObservationTable({ cation, testType, observations, position }: {
  cation: Cation;
  testType: TestType;
  observations: string[];
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <Html>
        <div className="bg-black/90 p-4 rounded-xl backdrop-blur-sm border border-purple-500/30 min-w-[300px]">
          <div className="text-lg font-bold text-purple-300 mb-3">
            {testType} Test: {cation}
          </div>
          
          <div className="space-y-2">
            {observations.map((obs, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5"></div>
                <div className="text-sm text-gray-200">{obs}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-700">
            <div className="text-xs text-gray-400">Identification Key</div>
            <div className="text-sm text-cyan-300 font-semibold">
              Characteristic {testType === 'Flame' ? 'Flame Color' : 'Precipitate'}
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

export default function CationIdentificationPage() {
  const [selectedCation, setSelectedCation] = useState<Cation>('Cu²⁺');
  const [activeTest, setActiveTest] = useState<TestType>('NaOH');
  const [isAddingReagent, setIsAddingReagent] = useState(false);
  const [precipitateAmount, setPrecipitateAmount] = useState(0);
  
  // Cation data
  const cations: Array<{
    id: Cation;
    name: string;
    solutionColor: string;
    NaOH: {
      precipitate: PrecipitateColor;
      equation: string;
      observations: string[];
    };
    flameTest?: {
      color: string;
      observations: string[];
    };
  }> = [
    {
      id: 'Cu²⁺',
      name: 'Copper(II)',
      solutionColor: '#1e40af',
      NaOH: {
        precipitate: 'lightblue',
        equation: 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄',
        observations: ['Light blue precipitate', 'Insoluble in excess NaOH']
      },
      flameTest: {
        color: 'green',
        observations: ['Green flame', 'Characteristic for Copper']
      }
    },
    {
      id: 'Fe²⁺',
      name: 'Iron(II)',
      solutionColor: '#4b5563',
      NaOH: {
        precipitate: 'muddygreen',
        equation: 'FeSO₄ + 2NaOH → Fe(OH)₂↓ + Na₂SO₄',
        observations: ['Muddy green precipitate', 'Turns brown on standing (oxidizes)']
      }
    },
    {
      id: 'Fe³⁺',
      name: 'Iron(III)',
      solutionColor: '#7c2d12',
      NaOH: {
        precipitate: 'rustybrown',
        equation: 'FeCl₃ + 3NaOH → Fe(OH)₃↓ + 3NaCl',
        observations: ['Rusty brown precipitate', 'Immediate formation']
      }
    },
    {
      id: 'Ca²⁺',
      name: 'Calcium',
      solutionColor: '#fbbf24',
      NaOH: {
        precipitate: 'white',
        equation: 'CaCl₂ + 2NaOH → Ca(OH)₂↓ + 2NaCl',
        observations: ['White precipitate', 'Slightly soluble in water']
      },
      flameTest: {
        color: 'orange-red',
        observations: ['Orange-red flame', 'Brick red color']
      }
    },
    {
      id: 'Al³⁺',
      name: 'Aluminium',
      solutionColor: '#6b7280',
      NaOH: {
        precipitate: 'white',
        equation: 'AlCl₃ + 3NaOH → Al(OH)₃↓ + 3NaCl',
        observations: ['White gelatinous precipitate', 'Dissolves in excess NaOH']
      }
    },
    {
      id: 'NH₄⁺',
      name: 'Ammonium',
      solutionColor: '#dbeafe',
      NaOH: {
        precipitate: 'none',
        equation: 'NH₄Cl + NaOH → NH₃↑ + NaCl + H₂O',
        observations: ['No precipitate', 'Ammonia gas evolved', 'Pungent smell']
      }
    },
    {
      id: 'Li⁺',
      name: 'Lithium',
      solutionColor: '#fee2e2',
      NaOH: {
        precipitate: 'none',
        equation: 'Li⁺ + OH⁻ → No precipitate',
        observations: ['No precipitate with NaOH', 'Identified by flame test']
      },
      flameTest: {
        color: 'red',
        observations: ['Red/Crimson flame', 'Characteristic for Lithium']
      }
    },
    {
      id: 'Na⁺',
      name: 'Sodium',
      solutionColor: '#fef3c7',
      NaOH: {
        precipitate: 'none',
        equation: 'Na⁺ + OH⁻ → No precipitate',
        observations: ['No precipitate with NaOH', 'Identified by flame test']
      },
      flameTest: {
        color: 'yellow-orange',
        observations: ['Yellow-orange flame', 'Intense yellow color']
      }
    },
    {
      id: 'K⁺',
      name: 'Potassium',
      solutionColor: '#f3e8ff',
      NaOH: {
        precipitate: 'none',
        equation: 'K⁺ + OH⁻ → No precipitate',
        observations: ['No precipitate with NaOH', 'Identified by flame test']
      },
      flameTest: {
        color: 'lilac',
        observations: ['Lilac flame', 'Viewed through cobalt blue glass']
      }
    }
  ];

  const selectedCationData = cations.find(c => c.id === selectedCation);

  // Simulate reagent addition
  const handleAddReagent = () => {
    setIsAddingReagent(true);
    setTimeout(() => {
      setPrecipitateAmount(1);
      setIsAddingReagent(false);
    }, 1000);
  };

  const handleCationSelect = (cation: Cation) => {
    setSelectedCation(cation);
    setPrecipitateAmount(0);
  };

  const handleTestSelect = (test: TestType) => {
    setActiveTest(test);
    setPrecipitateAmount(0);
  };

  return (
    <SimulationLayout
      title="Systematic Cation Identification"
      description="Interactive laboratory simulation for identifying cations through specific reagent tests: NaOH precipitation tests, flame tests, and systematic analysis. Learn qualitative inorganic chemistry through 3D visualization."
    >
      <Float speed={0.2} rotationIntensity={0.1} floatIntensity={0.1}>
        <group rotation={[0, 0.5, 0]}>
          {/* Laboratory Bench */}
          <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <boxGeometry args={[15, 10, 0.2]} />
            <meshStandardMaterial 
              color="#1f2937"
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>

          {/* Test Tubes Rack */}
          <group position={[-5, -1, 0]}>
            {/* Rack */}
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[8, 0.2, 0.5]} />
              <meshStandardMaterial color="#92400e" />
            </mesh>
            
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[8, 0.2, 0.5]} />
              <meshStandardMaterial color="#92400e" />
            </mesh>
            
            {/* Test tubes */}
            {cations.slice(0, 6).map((cation, index) => (
              <TestTube
                key={cation.id}
                position={[-3 + index * 1.2, -1, 0]}
                solutionColor={cation.solutionColor}
                label={cation.id}
                isSelected={selectedCation === cation.id}
                onClick={() => handleCationSelect(cation.id)}
              />
            ))}
            
            <Html position={[0, 2, 0]} center>
              <div className="text-xl font-bold text-white bg-black/70 px-4 py-2 rounded-lg backdrop-blur-sm">
                Cation Solutions
              </div>
            </Html>
          </group>

          {/* Flame Test Station */}
          <group position={[5, -1, 0]}>
            {cations.filter(c => c.flameTest).map((cation, index) => (
              <FlameTest
                key={cation.id}
                cation={cation.id}
                position={[-2 + index * 1.5, -1, 0]}
                isActive={activeTest === 'Flame' && selectedCation === cation.id}
              />
            ))}
            
            <Html position={[0, 2, 0]} center>
              <div className="text-xl font-bold text-white bg-black/70 px-4 py-2 rounded-lg backdrop-blur-sm">
                Flame Test Station
              </div>
            </Html>
          </group>

          {/* Main Testing Area */}
          <group position={[0, -1, 0]}>
            {/* Selected Test Tube */}
            <TestTube
              position={[-1, 0, 0]}
              solutionColor={selectedCationData?.solutionColor || '#ffffff'}
              label={`Test: ${selectedCation}`}
              isSelected={true}
              onClick={() => {}}
            />
            
            {/* Precipitate in test tube */}
            {selectedCationData?.NaOH.precipitate !== 'none' && precipitateAmount > 0 && (
              <Precipitate
                color={
                  selectedCationData?.NaOH.precipitate === 'lightblue' ? '#60a5fa' :
                  selectedCationData?.NaOH.precipitate === 'muddygreen' ? '#65a30d' :
                  selectedCationData?.NaOH.precipitate === 'rustybrown' ? '#92400e' :
                  '#ffffff'
                }
                amount={precipitateAmount}
                position={[-1, 0.3, 0]}
              />
            )}
            
            {/* Reagent Droppers */}
            <ReagentDropper
              position={[1, 0.5, -1]}
              reagent="NaOH"
              isDropping={isAddingReagent && activeTest === 'NaOH'}
              onClick={() => {
                handleTestSelect('NaOH');
                handleAddReagent();
              }}
            />
            
            <ReagentDropper
              position={[1.5, 0.5, 0]}
              reagent="NH₄OH"
              isDropping={isAddingReagent && activeTest === 'NH₄OH'}
              onClick={() => {
                handleTestSelect('NH₄OH');
                handleAddReagent();
              }}
            />
            
            {/* Chemical Equation */}
            {selectedCationData && (
              <ChemicalEquation
                equation={selectedCationData.NaOH.equation}
                position={[0, 2.5, 0]}
              />
            )}
          </group>

          {/* Observations Panel */}
          {selectedCationData && (
            <ObservationTable
              cation={selectedCation}
              testType={activeTest}
              observations={
                activeTest === 'Flame' && selectedCationData.flameTest
                  ? selectedCationData.flameTest.observations
                  : selectedCationData.NaOH.observations
              }
              position={[0, -2.5, 3]}
            />
          )}

          {/* Test Selection Buttons */}
          <group position={[3, -1.5, -3]}>
            <Html>
              <div className="bg-black/80 p-4 rounded-xl backdrop-blur-sm">
                <div className="text-lg font-bold text-white mb-3">Select Test</div>
                <div className="grid grid-cols-2 gap-2">
                  {['NaOH', 'NH₄OH', 'Flame', 'HCl', 'H₂SO₄'].map((test) => (
                    <button
                      key={test}
                      onClick={() => handleTestSelect(test as TestType)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        activeTest === test
                          ? 'bg-blue-600 text-white scale-105'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {test}
                    </button>
                  ))}
                </div>
              </div>
            </Html>
          </group>

          {/* Identification Flowchart */}
          <group position={[-3, -1.5, 3]}>
            <Html>
              <div className="bg-black/80 p-4 rounded-xl backdrop-blur-sm border border-cyan-500/30">
                <div className="text-lg font-bold text-cyan-300 mb-3">Systematic Analysis</div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="text-white">1. Add NaOH → Observe precipitate</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div className="text-white">2. Add excess NaOH → Check solubility</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <div className="text-white">3. Perform flame test → Check color</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="text-white">4. Confirm with other reagents</div>
                  </div>
                </div>
              </div>
            </Html>
          </group>

          {/* Legend for Precipitate Colors */}
          <group position={[5, 0, 3]}>
            <Html>
              <div className="bg-black/80 p-4 rounded-xl backdrop-blur-sm">
                <div className="text-lg font-bold text-white mb-3">Precipitate Color Key</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-blue-400"></div>
                    <div className="text-white">Light Blue: Cu²⁺</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-green-700"></div>
                    <div className="text-white">Muddy Green: Fe²⁺</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-orange-800"></div>
                    <div className="text-white">Rusty Brown: Fe³⁺</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-white"></div>
                    <div className="text-white">White: Ca²⁺, Al³⁺</div>
                  </div>
                </div>
              </div>
            </Html>
          </group>
        </group>
      </Float>
    </SimulationLayout>
  );
}
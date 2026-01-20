'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Sphere, Cylinder, Box, Html, Float, Text, 
  Line, Torus, Ring, Billboard, Tetrahedron 
} from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

// --- Types ---
type DrugCategory = 'antibiotic' | 'analgesic' | 'cns' | 'cardiac';
type LearningMode = 'structure' | 'mnemonic' | 'animation' | 'quiz';

// --- Color Scheme for Functional Groups ---
const GROUP_COLORS = {
  benzene: '#FF6B6B',
  amine: '#4ECDC4',
  hydroxyl: '#45B7D1',
  carbonyl: '#96CEB4',
  ether: '#FFEAA7',
  ester: '#DDA0DD',
  amide: '#98D8C8',
  alkyl: '#F7F7F7',
  sulfur: '#F7DC6F',
  halogen: '#ABEBC6',
  heterocycle: '#BB8FCE',
  acidic: '#E74C3C',
  basic: '#3498DB'
};

// --- Mnemonic Symbols ---
const Symbol = ({ type, position }: { type: string; position: [number, number, number] }) => {
  switch(type) {
    case 'benzene':
      return (
        <group position={position}>
          <Ring args={[0.5, 0.7, 6]} rotation={[Math.PI/2, 0, 0]}>
            <meshStandardMaterial color={GROUP_COLORS.benzene} side={THREE.DoubleSide} />
          </Ring>
          <Text position={[0, 0.8, 0]} fontSize={0.2} color={GROUP_COLORS.benzene}>
            Aromatic
          </Text>
        </group>
      );
    case 'amine':
      return (
        <group position={position}>
          <Tetrahedron args={[0.5]}>
            <meshStandardMaterial color={GROUP_COLORS.amine} />
          </Tetrahedron>
          <Text position={[0, 0.8, 0]} fontSize={0.2} color={GROUP_COLORS.amine}>
            N-group
          </Text>
        </group>
      );
    case 'hydroxyl':
      return (
        <group position={position}>
          <Sphere args={[0.3, 16, 16]}>
            <meshStandardMaterial color="white" />
          </Sphere>
          <Cylinder args={[0.08, 0.08, 0.6]} position={[0, -0.4, 0]}>
            <meshStandardMaterial color={GROUP_COLORS.hydroxyl} />
          </Cylinder>
          <Text position={[0, 0.8, 0]} fontSize={0.2} color={GROUP_COLORS.hydroxyl}>
            OH
          </Text>
        </group>
      );
    default:
      return null;
  }
};

// --- DRUG 1: ASPIRIN (Acetylsalicylic Acid) ---
const AspirinStructure = ({ showMnemonic }: { showMnemonic: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current && showMnemonic) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.1;
    }
  });

  const aspirinFormula = "C₉H₈O₄";
  
  return (
    <group ref={groupRef}>
      {/* Molecular Structure */}
      <group>
        {/* Benzene Ring */}
        <group>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i / 6) * Math.PI * 2;
            const x = Math.cos(angle) * 2;
            const z = Math.sin(angle) * 2;
            return (
              <Sphere key={i} args={[0.3, 16, 16]} position={[x, 0, z]}>
                <meshStandardMaterial color="#333" />
              </Sphere>
            );
          })}
          {/* Benzene ring bonds */}
          <Line
            points={Array.from({ length: 7 }).map((_, i) => {
              const angle = (i / 6) * Math.PI * 2;
              return [Math.cos(angle) * 2, 0, Math.sin(angle) * 2];
            })}
            color={GROUP_COLORS.benzene}
            lineWidth={3}
          />
        </group>

        {/* Carboxylic Acid Group */}
        <group position={[1.5, 1.2, 0]}>
          <Sphere args={[0.35, 16, 16]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#C0392B" />
          </Sphere>
          <Sphere args={[0.3, 16, 16]} position={[0.8, 0, 0]}>
            <meshStandardMaterial color="#C0392B" />
          </Sphere>
          <Sphere args={[0.25, 16, 16]} position={[0.4, 0.7, 0]}>
            <meshStandardMaterial color="white" />
          </Sphere>
          <Cylinder args={[0.08, 0.08, 0.8]} position={[0.4, 0, 0]} rotation={[0, 0, 0]}>
            <meshStandardMaterial color="#C0392B" />
          </Cylinder>
          <Text position={[0, -0.8, 0]} fontSize={0.25} color="#C0392B">
            COOH
          </Text>
        </group>

        {/* Ester Group */}
        <group position={[-1.5, 1.2, 0]}>
          <Sphere args={[0.3, 16, 16]} position={[0, 0, 0]}>
            <meshStandardMaterial color={GROUP_COLORS.ester} />
          </Sphere>
          <Sphere args={[0.25, 16, 16]} position={[0.8, 0, 0]}>
            <meshStandardMaterial color="white" />
          </Sphere>
          <Cylinder args={[0.08, 0.08, 0.8]} position={[0.4, 0, 0]} rotation={[0, 0, 0]}>
            <meshStandardMaterial color={GROUP_COLORS.ester} />
          </Cylinder>
          <Text position={[0, -0.8, 0]} fontSize={0.25} color={GROUP_COLORS.ester}>
            OCOCH3
          </Text>
        </group>
      </group>

      {/* Mnemonic Visualization */}
      {showMnemonic && (
        <>
          <Html position={[0, 3, 0]} center>
            <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 p-4 rounded-xl border border-red-500/50 backdrop-blur-md">
              <div className="text-lg font-bold text-white mb-2">Aspirin Mnemonic: "Aromatic Acid with Acetyl Armor"</div>
              <div className="text-sm text-gray-300">
                • <span className="text-red-400">Red ring</span> = Aromatic (Benzene)<br/>
                • <span className="text-pink-400">Pink group</span> = Acid (COOH)<br/>
                • <span className="text-purple-400">Purple arm</span> = Ester shield (Acetyl)
              </div>
            </div>
          </Html>

          {/* Visual Mnemonic Symbols */}
          <Symbol type="benzene" position={[0, 2, 0]} />
          <group position={[2, 0, 0]}>
            <Sphere args={[0.5, 16, 16]}>
              <meshStandardMaterial color="#E74C3C" emissive="#E74C3C" emissiveIntensity={0.5} />
            </Sphere>
            <Text position={[0, 0.8, 0]} fontSize={0.3} color="#E74C3C">
              Acidic
            </Text>
          </group>
        </>
      )}

      {/* Formula Display */}
      <Html position={[-3, 2.5, 0]}>
        <div className="bg-black/70 p-3 rounded-lg border border-blue-500/50">
          <div className="text-blue-400 font-bold text-sm">Aspirin</div>
          <div className="text-white text-lg font-mono">{aspirinFormula}</div>
          <div className="text-gray-400 text-xs mt-1">Acetylsalicylic Acid</div>
        </div>
      </Html>
    </group>
  );
};

// --- DRUG 2: PENICILLIN (Beta-Lactam Antibiotic) ---
const PenicillinStructure = ({ showMnemonic }: { showMnemonic: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [betaLactamPulse, setBetaLactamPulse] = useState(0);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      setBetaLactamPulse(Math.sin(clock.getElapsedTime() * 2) * 0.5 + 0.5);
    }
  });

  const penicillinFormula = "C₁₆H₁₈N₂O₄S";
  
  return (
    <group ref={groupRef}>
      {/* Beta-Lactam Ring (4-membered) - THE KEY FEATURE */}
      <group position={[0, 0, 0]}>
        <Ring args={[1, 1.2, 4]} rotation={[Math.PI/2, 0, 0]}>
          <meshStandardMaterial 
            color="#9B59B6" 
            emissive="#9B59B6"
            emissiveIntensity={showMnemonic ? betaLactamPulse * 0.5 : 0}
            opacity={0.8}
            transparent
          />
        </Ring>
        <Text position={[0, 1.5, 0]} fontSize={0.3} color="#9B59B6">
          β-Lactam Ring
        </Text>
        
        {/* Sulfur Atom */}
        <Sphere args={[0.4, 16, 16]} position={[1.8, 0, 0]}>
          <meshStandardMaterial color="#F1C40F" />
        </Sphere>
        <Text position={[1.8, 0.6, 0]} fontSize={0.2} color="#F1C40F">
          S
        </Text>
        
        {/* Thiazolidine Ring (5-membered) */}
        <Ring args={[1.5, 1.7, 5]} rotation={[Math.PI/2, Math.PI/5, 0]} position={[1, -0.5, 0]}>
          <meshStandardMaterial color="#3498DB" opacity={0.6} transparent />
        </Ring>
        
        {/* Side Chain */}
        <group position={[-1.8, 0, 0]}>
          <Sphere args={[0.35, 16, 16]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#2ECC71" />
          </Sphere>
          <Cylinder args={[0.08, 0.08, 1]} position={[-0.5, 0, 0]} rotation={[0, 0, 0]}>
            <meshStandardMaterial color="#2ECC71" />
          </Cylinder>
          <Sphere args={[0.3, 16, 16]} position={[-1, 0, 0]}>
            <meshStandardMaterial color="#F7F7F7" />
          </Sphere>
          <Text position={[-1, -0.6, 0]} fontSize={0.2} color="#2ECC71">
            R-group
          </Text>
        </group>
      </group>

      {/* Mnemonic Visualization */}
      {showMnemonic && (
        <>
          <Html position={[0, 3, 0]} center>
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-4 rounded-xl border border-purple-500/50 backdrop-blur-md">
              <div className="text-lg font-bold text-white mb-2">Penicillin Mnemonic: "4-Ring Security with Sulfur Guard"</div>
              <div className="text-sm text-gray-300">
                • <span className="text-purple-400">Pulsing purple ring</span> = Beta-Lactam (4 atoms)<br/>
                • <span className="text-yellow-400">Yellow sphere</span> = Sulfur atom<br/>
                • <span className="text-blue-400">Blue pentagon</span> = Thiazolidine ring<br/>
                • <span className="text-green-400">Green chain</span> = Variable side group
              </div>
            </div>
          </Html>

          {/* Key Feature Highlights */}
          <group>
            <Billboard position={[0, 2, 0]}>
              <Text fontSize={0.4} color="#FFD700" outlineWidth={0.02} outlineColor="#000">
                ⚡ Key Feature
              </Text>
            </Billboard>
          </group>
        </>
      )}

      {/* Formula Display */}
      <Html position={[-3, 2.5, 0]}>
        <div className="bg-black/70 p-3 rounded-lg border border-purple-500/50">
          <div className="text-purple-400 font-bold text-sm">Penicillin G</div>
          <div className="text-white text-lg font-mono">{penicillinFormula}</div>
          <div className="text-gray-400 text-xs mt-1">Beta-Lactam Antibiotic</div>
        </div>
      </Html>
    </group>
  );
};

// --- DRUG 3: DIAZEPAM (Benzodiazepine) ---
const DiazepamStructure = ({ showMnemonic }: { showMnemonic: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current && showMnemonic) {
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  const diazepamFormula = "C₁₆H₁₃ClN₂O";
  
  return (
    <group ref={groupRef}>
      {/* Benzodiazepine Ring System */}
      <group>
        {/* Fused Ring System */}
        <Ring args={[1.8, 2, 7]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#1ABC9C" opacity={0.7} transparent />
        </Ring>
        
        {/* Chlorine Atom */}
        <Sphere args={[0.4, 16, 16]} position={[2.2, 0.5, 0]}>
          <meshStandardMaterial color="#2ECC71" />
        </Sphere>
        <Text position={[2.2, 1.1, 0]} fontSize={0.25} color="#2ECC71">
          Cl
        </Text>
        
        {/* Aromatic Ring */}
        <Ring args={[1.2, 1.4, 6]} rotation={[Math.PI/2, Math.PI/6, 0]} position={[-1.5, -0.5, 0]}>
          <meshStandardMaterial color={GROUP_COLORS.benzene} opacity={0.6} transparent />
        </Ring>
        
        {/* Amide Group */}
        <group position={[1, -1.2, 0]}>
          <Sphere args={[0.3, 16, 16]} position={[0, 0, 0]}>
            <meshStandardMaterial color={GROUP_COLORS.amide} />
          </Sphere>
          <Sphere args={[0.25, 16, 16]} position={[0.7, 0, 0]}>
            <meshStandardMaterial color="#C0392B" />
          </Sphere>
          <Text position={[0.35, -0.5, 0]} fontSize={0.2} color={GROUP_COLORS.amide}>
            C=O
          </Text>
        </group>
        
        {/* Nitrogen Atoms */}
        {[[0.5, 1.5, 0], [-0.5, 1.5, 0]].map((pos, i) => (
          <group key={i} position={pos as [number, number, number]}>
            <Sphere args={[0.35, 16, 16]}>
              <meshStandardMaterial color={GROUP_COLORS.amine} />
            </Sphere>
            <Text position={[0, 0.6, 0]} fontSize={0.2} color={GROUP_COLORS.amine}>
              N{i+1}
            </Text>
          </group>
        ))}
      </group>

      {/* Mnemonic Visualization */}
      {showMnemonic && (
        <>
          <Html position={[0, 3, 0]} center>
            <div className="bg-gradient-to-r from-teal-500/20 to-green-500/20 p-4 rounded-xl border border-teal-500/50 backdrop-blur-md">
              <div className="text-lg font-bold text-white mb-2">Diazepam Mnemonic: "7-Ring Calmer with Chlorine Marker"</div>
              <div className="text-sm text-gray-300">
                • <span className="text-teal-400">Teal 7-ring</span> = Benzodiazepine core<br/>
                • <span className="text-green-400">Green atom</span> = Chlorine substitution<br/>
                • <span className="text-blue-400">Blue spheres</span> = Nitrogen atoms (2×)<br/>
                • <span className="text-red-400">Red groups</span> = Carbonyl/Aromatic
              </div>
            </div>
          </Html>

          {/* Calming Effect Visualization */}
          <group position={[0, -2, 0]}>
            <Ring args={[3, 3.3, 32]} rotation={[Math.PI/2, 0, 0]}>
              <meshBasicMaterial 
                color="#3498DB" 
                opacity={0.3} 
                transparent 
                side={THREE.DoubleSide}
              />
            </Ring>
            <Text position={[0, 0.5, 0]} fontSize={0.3} color="#3498DB" rotation={[-Math.PI/2, 0, 0]}>
              Calming Effect
            </Text>
          </group>
        </>
      )}

      {/* Formula Display */}
      <Html position={[-3, 2.5, 0]}>
        <div className="bg-black/70 p-3 rounded-lg border border-teal-500/50">
          <div className="text-teal-400 font-bold text-sm">Diazepam</div>
          <div className="text-white text-lg font-mono">{diazepamFormula}</div>
          <div className="text-gray-400 text-xs mt-1">Benzodiazepine Anxiolytic</div>
        </div>
      </Html>
    </group>
  );
};

// --- MAIN COMPONENT ---
export default function DrugStructureMemoryPage() {
  const [selectedDrug, setSelectedDrug] = useState<'aspirin' | 'penicillin' | 'diazepam'>('aspirin');
  const [learningMode, setLearningMode] = useState<LearningMode>('structure');
  const [showMnemonic, setShowMnemonic] = useState(true);
  const [showFormula, setShowFormula] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(0.5);

  const drugs = [
    { id: 'aspirin', name: 'Aspirin', category: 'analgesic', color: '#E74C3C' },
    { id: 'penicillin', name: 'Penicillin', category: 'antibiotic', color: '#9B59B6' },
    { id: 'diazepam', name: 'Diazepam', category: 'cns', color: '#1ABC9C' }
  ];

  return (
    <SimulationLayout
      title="Drug Structure Memory - Visual Mnemonics"
      description="Memorize complex drug structures using 3D visual logic and associative memory techniques. Each drug's key features are color-coded and animated for better recall."
    >
      <Float speed={rotationSpeed} rotationIntensity={0.3} floatIntensity={0.2}>
        <group position={[0, 0, 0]}>
          {/* Dynamic Drug Display */}
          {selectedDrug === 'aspirin' && <AspirinStructure showMnemonic={showMnemonic && learningMode !== 'structure'} />}
          {selectedDrug === 'penicillin' && <PenicillinStructure showMnemonic={showMnemonic && learningMode !== 'structure'} />}
          {selectedDrug === 'diazepam' && <DiazepamStructure showMnemonic={showMnemonic && learningMode !== 'structure'} />}

          {/* Control Panel */}
          <Html position={[0, -3.5, 0]} center>
            <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700 p-4 shadow-2xl w-96">
              {/* Drug Selection */}
              <div className="mb-4">
                <h3 className="text-white text-sm font-bold mb-2 uppercase tracking-wider">Select Drug</h3>
                <div className="flex gap-2">
                  {drugs.map(drug => (
                    <button
                      key={drug.id}
                      onClick={() => setSelectedDrug(drug.id as any)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedDrug === drug.id
                          ? 'bg-white text-black shadow-lg'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`}
                      style={selectedDrug === drug.id ? { backgroundColor: drug.color } : {}}
                    >
                      {drug.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Learning Mode */}
              <div className="mb-4">
                <h3 className="text-white text-sm font-bold mb-2 uppercase tracking-wider">Learning Mode</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(['structure', 'mnemonic', 'animation', 'quiz'] as LearningMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setLearningMode(mode)}
                      className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                        learningMode === mode
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">Show Mnemonics</span>
                  <button
                    onClick={() => setShowMnemonic(!showMnemonic)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      showMnemonic ? 'bg-green-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      showMnemonic ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">Rotation Speed</span>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={rotationSpeed}
                    onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                    className="w-32 accent-blue-500"
                  />
                  <span className="text-blue-400 text-xs w-8">{rotationSpeed.toFixed(1)}</span>
                </div>

                {/* Legend */}
                {showMnemonic && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <h4 className="text-white text-xs font-bold mb-2 uppercase tracking-wider">Color Legend</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GROUP_COLORS.benzene }} />
                        <span className="text-slate-300">Aromatic Ring</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GROUP_COLORS.amine }} />
                        <span className="text-slate-300">Nitrogen</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GROUP_COLORS.ester }} />
                        <span className="text-slate-300">Ester Group</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F1C40F' }} />
                        <span className="text-slate-300">Sulfur</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Html>

          {/* Educational Tips */}
          <Html position={[4, 2.5, 0]}>
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-4 rounded-xl border border-purple-500/30 backdrop-blur-md w-64">
              <h4 className="text-white font-bold text-sm mb-2">Memory Technique</h4>
              <ul className="text-slate-300 text-xs space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Associate colors with functional groups</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Remember ring sizes (4, 5, 6, 7)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Note key heteroatoms (N, O, S, Cl)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Create story: "Aspirin = Acidic Shield"</span>
                </li>
              </ul>
            </div>
          </Html>

          {/* Progress Indicator */}
          <Html position={[0, 3.5, 0]} center>
            <div className="flex items-center gap-4 bg-black/60 px-6 py-3 rounded-full backdrop-blur-md border border-slate-700">
              <div className="text-slate-300 text-sm">Learning Progress:</div>
              <div className="flex gap-1">
                {drugs.map(drug => (
                  <div 
                    key={drug.id}
                    className={`w-3 h-3 rounded-full transition-all ${
                      selectedDrug === drug.id 
                        ? 'scale-125 ring-2 ring-offset-1 ring-offset-black'
                        : 'opacity-50'
                    }`}
                    style={{ 
                      backgroundColor: selectedDrug === drug.id ? drug.color : '#4B5563'
                    }}
                  />
                ))}
              </div>
              <div className="text-xs text-slate-400">
                {drugs.find(d => d.id === selectedDrug)?.name}
              </div>
            </div>
          </Html>
        </group>
      </Float>
    </SimulationLayout>
  );
}
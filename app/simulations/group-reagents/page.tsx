'use client';

import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Float, Html, Text, Plane, Torus, Cone, Box } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

type CationGroup = 'Group I' | 'Group II' | 'Group III' | 'Group IV' | 'Group V' | 'Group VI';
type PrecipitationStatus = 'dissolved' | 'precipitated' | 'filtered';

interface Cation {
  symbol: string;
  name: string;
  charge: string;
  color: string;
  group: CationGroup;
  reagent: string;
  precipitateFormula: string;
  precipitateColor: string;
  solubility: string;
}

function PrecipitationBeaker({ 
  position, 
  group, 
  cations, 
  reagentAdded, 
  status,
  onAddReagent 
}: {
  position: [number, number, number];
  group: CationGroup;
  cations: Cation[];
  reagentAdded: boolean;
  status: PrecipitationStatus;
  onAddReagent: () => void;
}) {
  const particlesRef = useRef<THREE.Group>(null);
  const [showPrecipitate, setShowPrecipitate] = useState(false);
  
  useFrame(({ clock }) => {
    if (particlesRef.current && reagentAdded && !showPrecipitate) {
      const time = clock.getElapsedTime();
      particlesRef.current.children.forEach((child, i) => {
        if (status === 'precipitated') {
          // Particles falling to bottom
          child.position.y = Math.max(-0.8, -0.5 - time * 0.5 + i * 0.1);
        } else if (status === 'dissolved') {
          // Random movement in solution
          child.position.y = Math.sin(time * 2 + i) * 0.1;
          child.position.x = Math.cos(time * 1.5 + i) * 0.05;
        }
      });
      
      // Trigger precipitate formation after animation
      if (time > 2 && !showPrecipitate) {
        setShowPrecipitate(true);
      }
    }
  });

  const groupColors = {
    'Group I': '#ef4444',
    'Group II': '#f59e0b',
    'Group III': '#10b981',
    'Group IV': '#3b82f6',
    'Group V': '#8b5cf6',
    'Group VI': '#ec4899'
  };

  const groupBgColors = {
    'Group I': '#fee2e2',
    'Group II': '#fef3c7',
    'Group III': '#d1fae5',
    'Group IV': '#dbeafe',
    'Group V': '#f3e8ff',
    'Group VI': '#fce7f3'
  };

  return (
    <group position={position}>
      {/* Beaker glass */}
      <Cylinder args={[0.8, 0.6, 2, 32]} position={[0, 0.5, 0]}>
        <meshStandardMaterial 
          color="#e0e0e0" 
          transparent 
          opacity={0.2}
          roughness={0.1}
          metalness={0.8}
        />
      </Cylinder>
      
      {/* Solution */}
      <Cylinder args={[0.78, 0.58, 1.8, 32]} position={[0, 0.4, 0]}>
        <meshStandardMaterial 
          color={status === 'filtered' ? '#ffffff' : groupBgColors[group]}
          transparent
          opacity={0.4}
        />
      </Cylinder>
      
      {/* Cation particles in solution */}
      <group ref={particlesRef}>
        {cations.map((cation, i) => (
          <Sphere
            key={i}
            args={[0.08, 16, 16]}
            position={[
              (Math.random() - 0.5) * 0.5,
              Math.random() * 0.5,
              (Math.random() - 0.5) * 0.5
            ]}
          >
            <meshStandardMaterial 
              color={cation.color}
              emissive={cation.color}
              emissiveIntensity={0.3}
            />
          </Sphere>
        ))}
      </group>
      
      {/* Precipitate layer at bottom */}
      {showPrecipitate && status === 'precipitated' && (
        <Cylinder 
          args={[0.5, 0.4, 0.3, 32]} 
          position={[0, -0.65, 0]}
        >
          <meshStandardMaterial 
            color={cations[0]?.precipitateColor || '#ffffff'}
            roughness={0.8}
            transparent
            opacity={0.8}
          />
        </Cylinder>
      )}
      
      {/* Funnel for filtration */}
      {status === 'filtered' && (
        <>
          <Cylinder args={[0.6, 0.1, 0.8, 32]} position={[0, 1.2, 0]}>
            <meshStandardMaterial color="#cbd5e1" />
          </Cylinder>
          
          {/* Filter paper */}
          <mesh position={[0, 0.9, 0]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.58, 0.6, 32]} />
            <meshStandardMaterial 
              color="#fef3c7" 
              transparent 
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Precipitate on filter */}
          <Cylinder args={[0.4, 0.3, 0.2, 32]} position={[0, 0.7, 0]}>
            <meshStandardMaterial 
              color={cations[0]?.precipitateColor || '#ffffff'}
              roughness={0.9}
            />
          </Cylinder>
        </>
      )}
      
      {/* Group label */}
      <Html position={[0, 1.8, 0]} center>
        <div 
          className="px-4 py-2 rounded-lg font-bold text-white backdrop-blur-sm"
          style={{ backgroundColor: groupColors[group] }}
        >
          {group}
        </div>
      </Html>
      
      {/* Cations label */}
      <Html position={[0, -1.2, 0]} center>
        <div className="bg-black/80 text-white px-3 py-2 rounded-lg backdrop-blur-sm">
          <div className="text-sm font-semibold">{cations.map(c => c.symbol).join(', ')}</div>
          <div className="text-xs text-gray-300 mt-1">{cations.length} cations</div>
        </div>
      </Html>
      
      {/* Add reagent button */}
      <Html position={[1.2, 0.5, 0]}>
        <button
          onClick={onAddReagent}
          disabled={reagentAdded}
          className={`px-3 py-2 rounded-lg font-semibold transition-all ${
            reagentAdded
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {reagentAdded ? '✓ Added' : 'Add Reagent'}
        </button>
      </Html>
    </group>
  );
}

function SeparationFlowChart({ currentStep, onStepSelect }: {
  currentStep: number;
  onStepSelect: (step: number) => void;
}) {
  const steps = [
    { group: 'Group I', reagent: 'Dil. HCl', action: 'Precipitate as Chlorides' },
    { group: 'Group II', reagent: 'H₂S in acidic medium', action: 'Precipitate as Sulfides' },
    { group: 'Group III', reagent: 'NH₄OH + NH₄Cl', action: 'Precipitate as Hydroxides' },
    { group: 'Group IV', reagent: 'H₂S in basic medium', action: 'Precipitate as Sulfides' },
    { group: 'Group V', reagent: '(NH₄)₂CO₃', action: 'Precipitate as Carbonates' },
    { group: 'Group VI', reagent: 'No reagent', action: 'Remaining ions in solution' },
  ];

  return (
    <group position={[0, -2, 4]}>
      <Html>
        <div className="bg-black/90 p-6 rounded-xl backdrop-blur-sm border border-emerald-500/30 min-w-[500px]">
          <div className="text-xl font-bold text-emerald-300 mb-4">Systematic Separation Flow</div>
          
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div 
                key={index}
                onClick={() => onStepSelect(index)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  currentStep === index
                    ? 'bg-emerald-900/50 border-l-4 border-emerald-500 scale-105'
                    : 'bg-gray-800/50 hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    currentStep === index
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-white">{step.group}</div>
                      <div className="text-sm text-cyan-300">{step.reagent}</div>
                    </div>
                    <div className="text-sm text-gray-300 mt-1">{step.action}</div>
                  </div>
                  
                  {currentStep === index && (
                    <div className="text-emerald-400 animate-pulse">→</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="text-sm text-gray-400">Click any step to view details</div>
          </div>
        </div>
      </Html>
    </group>
  );
}

function GroupDetailsPanel({ group, cations, position }: {
  group: CationGroup;
  cations: Cation[];
  position: [number, number, number];
}) {
  const groupInfo = {
    'Group I': {
      description: 'Precipitated by dilute HCl as insoluble chlorides',
      color: '#ef4444',
      exampleEquation: 'Ag⁺ + Cl⁻ → AgCl↓ (white)'
    },
    'Group II': {
      description: 'Precipitated by H₂S in acidic medium as sulfides',
      color: '#f59e0b',
      exampleEquation: 'Cu²⁺ + H₂S → CuS↓ (black)'
    },
    'Group III': {
      description: 'Precipitated by NH₄OH in presence of NH₄Cl as hydroxides',
      color: '#10b981',
      exampleEquation: 'Al³⁺ + 3OH⁻ → Al(OH)₃↓ (white gelatinous)'
    },
    'Group IV': {
      description: 'Precipitated by H₂S in basic medium (ammoniacal) as sulfides',
      color: '#3b82f6',
      exampleEquation: 'Zn²⁺ + S²⁻ → ZnS↓ (white)'
    },
    'Group V': {
      description: 'Precipitated by (NH₄)₂CO₃ in presence of NH₄Cl as carbonates',
      color: '#8b5cf6',
      exampleEquation: 'Ba²⁺ + CO₃²⁻ → BaCO₃↓ (white)'
    },
    'Group VI': {
      description: 'No common group reagent, remaining soluble ions',
      color: '#ec4899',
      exampleEquation: 'Na⁺, K⁺, NH₄⁺, Mg²⁺ remain in solution'
    }
  };

  const info = groupInfo[group];

  return (
    <group position={position}>
      <Html>
        <div className="bg-black/90 p-6 rounded-xl backdrop-blur-sm border-2 min-w-[400px]" 
             style={{ borderColor: `${info.color}40` }}>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: info.color }}></div>
            <div className="text-xl font-bold" style={{ color: info.color }}>{group}</div>
          </div>
          
          <div className="text-gray-300 mb-4">{info.description}</div>
          
          <div className="mb-6">
            <div className="text-sm text-gray-400 mb-2">Example Reaction:</div>
            <div className="text-lg font-mono text-white bg-gray-800/50 p-3 rounded">
              {info.exampleEquation}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm font-semibold text-white">Cations in this group:</div>
            <div className="grid grid-cols-3 gap-2">
              {cations.map((cation, idx) => (
                <div 
                  key={idx}
                  className="p-2 rounded bg-gray-800/50 flex flex-col items-center"
                >
                  <div className="text-lg font-bold" style={{ color: cation.color }}>
                    {cation.symbol}
                  </div>
                  <div className="text-xs text-gray-300">{cation.name}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cations[0]?.color }}></div>
              <div className="text-sm text-gray-300">Cation color in solution</div>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cations[0]?.precipitateColor }}></div>
              <div className="text-sm text-gray-300">Precipitate color</div>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

function ReagentBottle({ reagent, color, position, isActive }: {
  reagent: string;
  color: string;
  position: [number, number, number];
  isActive: boolean;
}) {
  return (
    <group position={position}>
      {/* Bottle */}
      <Cylinder args={[0.4, 0.3, 1.2, 32]} position={[0, 0.6, 0]}>
        <meshStandardMaterial 
          color={color}
          transparent
          opacity={0.7}
          roughness={0.3}
        />
      </Cylinder>
      
      {/* Bottle neck */}
      <Cylinder args={[0.15, 0.15, 0.3, 32]} position={[0, 1.35, 0]}>
        <meshStandardMaterial color="#cbd5e1" />
      </Cylinder>
      
      {/* Label */}
      <Html position={[0, 0.6, 0.4]} center>
        <div className="bg-black/80 text-white px-3 py-1 rounded text-sm backdrop-blur-sm">
          {reagent}
        </div>
      </Html>
      
      {/* Active indicator */}
      {isActive && (
        <mesh position={[0, 1.8, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial 
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={2}
          />
        </mesh>
      )}
    </group>
  );
}

export default function CationGroupReagentsPage() {
  const [currentGroup, setCurrentGroup] = useState<CationGroup>('Group I');
  const [currentStep, setCurrentStep] = useState(0);
  const [reagentAdded, setReagentAdded] = useState(false);
  const [precipitationStatus, setPrecipitationStatus] = useState<PrecipitationStatus>('dissolved');

  // Define all cations with their groups
  const allCations: Cation[] = [
    // Group I: Insoluble chlorides
    { symbol: 'Ag⁺', name: 'Silver', charge: '+1', color: '#c0c0c0', group: 'Group I', reagent: 'Dil. HCl', precipitateFormula: 'AgCl', precipitateColor: '#ffffff', solubility: 'Insoluble' },
    { symbol: 'Pb²⁺', name: 'Lead', charge: '+2', color: '#565656', group: 'Group I', reagent: 'Dil. HCl', precipitateFormula: 'PbCl₂', precipitateColor: '#ffffff', solubility: 'Slightly soluble in hot water' },
    { symbol: 'Hg₂²⁺', name: 'Mercury(I)', charge: '+2', color: '#a8a8a8', group: 'Group I', reagent: 'Dil. HCl', precipitateFormula: 'Hg₂Cl₂', precipitateColor: '#ffffff', solubility: 'Insoluble' },
    
    // Group II: Sulfides in acidic medium
    { symbol: 'Cu²⁺', name: 'Copper(II)', charge: '+2', color: '#1e40af', group: 'Group II', reagent: 'H₂S (acidic)', precipitateFormula: 'CuS', precipitateColor: '#000000', solubility: 'Insoluble' },
    { symbol: 'Cd²⁺', name: 'Cadmium', charge: '+2', color: '#f59e0b', group: 'Group II', reagent: 'H₂S (acidic)', precipitateFormula: 'CdS', precipitateColor: '#fbbf24', solubility: 'Insoluble' },
    { symbol: 'Hg²⁺', name: 'Mercury(II)', charge: '+2', color: '#a8a8a8', group: 'Group II', reagent: 'H₂S (acidic)', precipitateFormula: 'HgS', precipitateColor: '#000000', solubility: 'Insoluble' },
    { symbol: 'As³⁺', name: 'Arsenic', charge: '+3', color: '#737373', group: 'Group II', reagent: 'H₂S (acidic)', precipitateFormula: 'As₂S₃', precipitateColor: '#f59e0b', solubility: 'Insoluble' },
    
    // Group III: Hydroxides with NH₄OH + NH₄Cl
    { symbol: 'Al³⁺', name: 'Aluminium', charge: '+3', color: '#3b82f6', group: 'Group III', reagent: 'NH₄OH + NH₄Cl', precipitateFormula: 'Al(OH)₃', precipitateColor: '#ffffff', solubility: 'Dissolves in excess NaOH' },
    { symbol: 'Fe³⁺', name: 'Iron(III)', charge: '+3', color: '#dc2626', group: 'Group III', reagent: 'NH₄OH + NH₄Cl', precipitateFormula: 'Fe(OH)₃', precipitateColor: '#92400e', solubility: 'Insoluble' },
    { symbol: 'Cr³⁺', name: 'Chromium', charge: '+3', color: '#10b981', group: 'Group III', reagent: 'NH₄OH + NH₄Cl', precipitateFormula: 'Cr(OH)₃', precipitateColor: '#065f46', solubility: 'Dissolves in excess NaOH' },
    
    // Group IV: Sulfides in basic medium
    { symbol: 'Zn²⁺', name: 'Zinc', charge: '+2', color: '#f59e0b', group: 'Group IV', reagent: 'H₂S (basic)', precipitateFormula: 'ZnS', precipitateColor: '#ffffff', solubility: 'Insoluble' },
    { symbol: 'Ni²⁺', name: 'Nickel', charge: '+2', color: '#65a30d', group: 'Group IV', reagent: 'H₂S (basic)', precipitateFormula: 'NiS', precipitateColor: '#000000', solubility: 'Insoluble' },
    { symbol: 'Co²⁺', name: 'Cobalt', charge: '+2', color: '#3b82f6', group: 'Group IV', reagent: 'H₂S (basic)', precipitateFormula: 'CoS', precipitateColor: '#000000', solubility: 'Insoluble' },
    { symbol: 'Mn²⁺', name: 'Manganese', charge: '+2', color: '#d97706', group: 'Group IV', reagent: 'H₂S (basic)', precipitateFormula: 'MnS', precipitateColor: '#fbbf24', solubility: 'Insoluble' },
    
    // Group V: Carbonates
    { symbol: 'Ba²⁺', name: 'Barium', charge: '+2', color: '#fbbf24', group: 'Group V', reagent: '(NH₄)₂CO₃', precipitateFormula: 'BaCO₃', precipitateColor: '#ffffff', solubility: 'Insoluble' },
    { symbol: 'Sr²⁺', name: 'Strontium', charge: '+2', color: '#f59e0b', group: 'Group V', reagent: '(NH₄)₂CO₃', precipitateFormula: 'SrCO₃', precipitateColor: '#ffffff', solubility: 'Insoluble' },
    { symbol: 'Ca²⁺', name: 'Calcium', charge: '+2', color: '#3b82f6', group: 'Group V', reagent: '(NH₄)₂CO₃', precipitateFormula: 'CaCO₃', precipitateColor: '#ffffff', solubility: 'Insoluble' },
    
    // Group VI: No precipitate
    { symbol: 'Mg²⁺', name: 'Magnesium', charge: '+2', color: '#10b981', group: 'Group VI', reagent: 'No reagent', precipitateFormula: 'None', precipitateColor: '#ffffff', solubility: 'Soluble' },
    { symbol: 'Na⁺', name: 'Sodium', charge: '+1', color: '#ef4444', group: 'Group VI', reagent: 'No reagent', precipitateFormula: 'None', precipitateColor: '#ffffff', solubility: 'Soluble' },
    { symbol: 'K⁺', name: 'Potassium', charge: '+1', color: '#8b5cf6', group: 'Group VI', reagent: 'No reagent', precipitateFormula: 'None', precipitateColor: '#ffffff', solubility: 'Soluble' },
    { symbol: 'NH₄⁺', name: 'Ammonium', charge: '+1', color: '#ec4899', group: 'Group VI', reagent: 'No reagent', precipitateFormula: 'None', precipitateColor: '#ffffff', solubility: 'Soluble' },
  ];

  const groupCations = allCations.filter(cation => cation.group === currentGroup);
  
  const handleAddReagent = () => {
    setReagentAdded(true);
    setTimeout(() => {
      setPrecipitationStatus('precipitated');
    }, 1000);
    
    setTimeout(() => {
      setPrecipitationStatus('filtered');
    }, 3000);
  };

  const handleStepSelect = (step: number) => {
    setCurrentStep(step);
    const groups: CationGroup[] = ['Group I', 'Group II', 'Group III', 'Group IV', 'Group V', 'Group VI'];
    setCurrentGroup(groups[step]);
    setReagentAdded(false);
    setPrecipitationStatus('dissolved');
  };

  return (
    <SimulationLayout
      title="Cation Group Reagents: Systematic Separation (Groups I-VI)"
      description="Qualitative inorganic analysis: Systematic separation of cations into 6 groups using specific reagents. Each group precipitates under specific conditions, allowing identification through characteristic reactions."
    >
      <Float speed={0.3} rotationIntensity={0.1} floatIntensity={0.2}>
        <group rotation={[0, 0.5, 0]}>
          
          {/* Laboratory Background */}
          <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <boxGeometry args={[20, 12, 0.2]} />
            <meshStandardMaterial 
              color="#1f2937"
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>

          {/* Central Main Beaker */}
          <PrecipitationBeaker
            position={[0, 0, 0]}
            group={currentGroup}
            cations={groupCations}
            reagentAdded={reagentAdded}
            status={precipitationStatus}
            onAddReagent={handleAddReagent}
          />

          {/* Group Details Panel */}
          <GroupDetailsPanel
            group={currentGroup}
            cations={groupCations}
            position={[-5, 0, 0]}
          />

          {/* Separation Flow Chart */}
          <SeparationFlowChart
            currentStep={currentStep}
            onStepSelect={handleStepSelect}
          />

          {/* Reagent Shelf */}
          <group position={[5, 1.5, 0]}>
            {/* Shelf */}
            <Box args={[6, 0.1, 0.5]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#92400e" />
            </Box>
            
            {/* Support brackets */}
            <Box args={[0.1, 1, 0.5]} position={[-2.8, -0.5, 0]}>
              <meshStandardMaterial color="#78350f" />
            </Box>
            <Box args={[0.1, 1, 0.5]} position={[2.8, -0.5, 0]}>
              <meshStandardMaterial color="#78350f" />
            </Box>
            
            {/* Reagent bottles */}
            <ReagentBottle
              reagent="HCl"
              color="#3b82f6"
              position={[-2, 0, 0]}
              isActive={currentGroup === 'Group I'}
            />
            
            <ReagentBottle
              reagent="H₂S"
              color="#8b5cf6"
              position={[-0.8, 0, 0]}
              isActive={currentGroup === 'Group II'}
            />
            
            <ReagentBottle
              reagent="NH₄OH"
              color="#10b981"
              position={[0.4, 0, 0]}
              isActive={currentGroup === 'Group III'}
            />
            
            <ReagentBottle
              reagent="H₂S (NH₃)"
              color="#f59e0b"
              position={[1.6, 0, 0]}
              isActive={currentGroup === 'Group IV'}
            />
            
            <ReagentBottle
              reagent="(NH₄)₂CO₃"
              color="#ec4899"
              position={[2.8, 0, 0]}
              isActive={currentGroup === 'Group V'}
            />
            
            <Html position={[0, -1.2, 0]} center>
              <div className="text-lg font-bold text-white bg-black/70 px-4 py-2 rounded-lg backdrop-blur-sm">
                Group Reagents
              </div>
            </Html>
          </group>

          {/* All Cations Overview */}
          <group position={[5, -1, 3]}>
            <Html>
              <div className="bg-black/90 p-6 rounded-xl backdrop-blur-sm">
                <div className="text-lg font-bold text-white mb-4">Cation Groups Overview</div>
                
                <div className="space-y-4">
                  {['Group I', 'Group II', 'Group III', 'Group IV', 'Group V', 'Group VI'].map((group) => (
                    <div 
                      key={group}
                      onClick={() => setCurrentGroup(group as CationGroup)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        currentGroup === group
                          ? 'ring-2 ring-offset-2 ring-offset-black'
                          : 'hover:bg-gray-800/50'
                      }`}
                      style={{ 
                        backgroundColor: currentGroup === group 
                          ? `${{
                            'Group I': '#ef4444',
                            'Group II': '#f59e0b',
                            'Group III': '#10b981',
                            'Group IV': '#3b82f6',
                            'Group V': '#8b5cf6',
                            'Group VI': '#ec4899'
                          }[group]}20` 
                          : 'transparent',
                        borderLeft: `4px solid ${
                          {
                            'Group I': '#ef4444',
                            'Group II': '#f59e0b',
                            'Group III': '#10b981',
                            'Group IV': '#3b82f6',
                            'Group V': '#8b5cf6',
                            'Group VI': '#ec4899'
                          }[group]
                        }`
                      }}
                    >
                      <div className="font-semibold text-white">{group}</div>
                      <div className="text-sm text-gray-300">
                        {allCations.filter(c => c.group === group).map(c => c.symbol).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Html>
          </group>

          {/* Key Legend */}
          <group position={[-5, -1, 3]}>
            <Html>
              <div className="bg-black/90 p-6 rounded-xl backdrop-blur-sm">
                <div className="text-lg font-bold text-white mb-4">Separation Process</div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <div className="text-white">1. Add group reagent</div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <div className="text-white">2. Observe precipitate formation</div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                    <div className="text-white">3. Filter precipitate</div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                    <div className="text-white">4. Test filtrate with next group reagent</div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-700">
                    <div className="text-sm text-gray-400">
                      Each group is separated sequentially from I to VI
                    </div>
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
'use client';

import React, { useState } from 'react';
import { Html, Float, Text } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';

const monomerPolymerDatabase = [
  {
    id: 1,
    monomer: {
      name: 'Ethylene',
      formula: 'C₂H₄',
      structure: 'H₂C=CH₂',
      description: 'Simplest alkene with a carbon-carbon double bond',
      image: 'ethylene-3d'
    },
    polymer: {
      name: 'Polyethylene',
      formula: '[-CH₂-CH₂-]n',
      type: 'Addition Polymer',
      uses: 'Plastic bags, bottles, containers',
      properties: 'Flexible, chemical resistant, insulating'
    },
    polymerization: {
      type: 'Radical Addition',
      catalyst: 'Peroxide initiators',
      temperature: '200-300°C',
      pressure: '1000-3000 atm'
    },
    mnemonic: "Two carbons holding hands (double bond) become a long chain of holding hands (single bonds)"
  },
  {
    id: 2,
    monomer: {
      name: 'Styrene',
      formula: 'C₈H₈',
      structure: 'C₆H₅-CH=CH₂',
      description: 'Benzene ring attached to a vinyl group',
      image: 'styrene-3d'
    },
    polymer: {
      name: 'Polystyrene',
      formula: '[-CH(C₆H₅)-CH₂-]n',
      type: 'Addition Polymer',
      uses: 'Packaging, disposable cups, insulation',
      properties: 'Rigid, transparent, good insulator'
    },
    polymerization: {
      type: 'Free Radical',
      catalyst: 'BPO or AIBN',
      temperature: '60-80°C',
      pressure: 'Atmospheric'
    },
    mnemonic: "Benzene ring 'hat' on each carbon in the chain"
  },
  {
    id: 3,
    monomer: {
      name: 'Propylene',
      formula: 'C₃H₆',
      structure: 'CH₃-CH=CH₂',
      description: 'Three-carbon alkene with a methyl side group',
      image: 'propylene-3d'
    },
    polymer: {
      name: 'Polypropylene',
      formula: '[-CH(CH₃)-CH₂-]n',
      type: 'Addition Polymer',
      uses: 'Automotive parts, textiles, packaging',
      properties: 'Tough, resistant to fatigue, lightweight'
    },
    polymerization: {
      type: 'Ziegler-Natta',
      catalyst: 'TiCl₃ + Al(C₂H₅)₃',
      temperature: '50-80°C',
      pressure: '10-40 atm'
    },
    mnemonic: "Carbon with a 'methyl backpack' repeating"
  },
  {
    id: 4,
    monomer: {
      name: 'Vinyl Chloride',
      formula: 'C₂H₃Cl',
      structure: 'CH₂=CHCl',
      description: 'Chlorine-substituted ethylene',
      image: 'vinyl-chloride-3d'
    },
    polymer: {
      name: 'Polyvinyl Chloride (PVC)',
      formula: '[-CH₂-CHCl-]n',
      type: 'Addition Polymer',
      uses: 'Pipes, window frames, credit cards',
      properties: 'Rigid, flame retardant, durable'
    },
    polymerization: {
      type: 'Suspension Polymerization',
      catalyst: 'Organic peroxides',
      temperature: '45-75°C',
      pressure: '5-15 atm'
    },
    mnemonic: "Chlorine 'guard' on every other carbon"
  }
];

export default function MonomerPolymerDatabasePage() {
  const [selectedPair, setSelectedPair] = useState(0);
  const [viewType, setViewType] = useState<'structure' | 'properties' | 'process'>('structure');

  const pair = monomerPolymerDatabase[selectedPair];

  return (
    <SimulationLayout
      title="Monomer-Polymer Database"
      description="Comprehensive reference of common monomer-polymer pairs with detailed properties, polymerization conditions, and real-world applications."
    >
      <Float speed={0.3} rotationIntensity={0.1} floatIntensity={0.1}>
        <group position={[0, 0, 0]}>
          <Html position={[0, 0, 0]} center>
            <div className="bg-gradient-to-br from-slate-900/90 to-gray-900/90 p-6 rounded-2xl border border-slate-700 backdrop-blur-lg w-[800px]">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Monomer-Polymer Database</h1>
                <p className="text-slate-400">Interactive reference for polymer chemistry</p>
              </div>

              {/* Navigation */}
              <div className="flex gap-4 mb-8">
                {monomerPolymerDatabase.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedPair(index)}
                    className={`flex-1 py-3 rounded-xl transition-all ${
                      selectedPair === index
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <div className="text-sm font-bold">{item.monomer.name}</div>
                    <div className="text-xs opacity-80">→ {item.polymer.name}</div>
                  </button>
                ))}
              </div>

              {/* View Type Selector */}
              <div className="flex gap-2 mb-6">
                {(['structure', 'properties', 'process'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setViewType(type)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                      viewType === type
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
                {viewType === 'structure' && (
                  <div className="grid grid-cols-2 gap-8">
                    {/* Monomer Column */}
                    <div className="space-y-4">
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/50">
                        <div className="text-blue-400 font-bold text-lg mb-2">Monomer</div>
                        <div className="space-y-3">
                          <div>
                            <div className="text-slate-400 text-sm">Name</div>
                            <div className="text-white text-xl font-bold">{pair.monomer.name}</div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-sm">Molecular Formula</div>
                            <div className="text-2xl font-mono text-cyan-300">{pair.monomer.formula}</div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-sm">Structural Formula</div>
                            <div className="text-lg font-mono text-white">{pair.monomer.structure}</div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-sm">Description</div>
                            <div className="text-slate-300">{pair.monomer.description}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-900/20 p-4 rounded-lg">
                        <div className="text-blue-300 font-bold mb-2">Visual Mnemonic</div>
                        <div className="text-slate-300 text-sm italic">"{pair.mnemonic}"</div>
                      </div>
                    </div>

                    {/* Polymer Column */}
                    <div className="space-y-4">
                      <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/50">
                        <div className="text-green-400 font-bold text-lg mb-2">Polymer</div>
                        <div className="space-y-3">
                          <div>
                            <div className="text-slate-400 text-sm">Name</div>
                            <div className="text-white text-xl font-bold">{pair.polymer.name}</div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-sm">Repeating Unit</div>
                            <div className="text-2xl font-mono text-green-300">{pair.polymer.formula}</div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-sm">Polymer Type</div>
                            <div className="text-lg text-white">{pair.polymer.type}</div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-sm">Common Uses</div>
                            <div className="text-slate-300">{pair.polymer.uses}</div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-sm">Key Properties</div>
                            <div className="text-slate-300">{pair.polymer.properties}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {viewType === 'properties' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/50">
                        <div className="text-purple-400 font-bold mb-3">Physical Properties</div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Density</span>
                            <span className="text-white">0.91-0.96 g/cm³</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Melting Point</span>
                            <span className="text-white">115-135°C</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Tensile Strength</span>
                            <span className="text-white">15-40 MPa</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-amber-900/30 p-4 rounded-lg border border-amber-500/50">
                        <div className="text-amber-400 font-bold mb-3">Chemical Resistance</div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-white">Acids and Bases</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span className="text-white">Organic Solvents</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-white">UV Radiation</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <div className="text-white font-bold mb-3">Applications</div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-slate-900/50 p-3 rounded">
                          <div className="text-cyan-400 font-bold mb-1">Packaging</div>
                          <div className="text-slate-300">Bottles, films, containers</div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded">
                          <div className="text-green-400 font-bold mb-1">Construction</div>
                          <div className="text-slate-300">Pipes, insulation, fittings</div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded">
                          <div className="text-purple-400 font-bold mb-1">Consumer Goods</div>
                          <div className="text-slate-300">Toys, furniture, appliances</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {viewType === 'process' && (
                  <div className="space-y-6">
                    <div className="bg-red-900/30 p-4 rounded-lg border border-red-500/50">
                      <div className="text-red-400 font-bold text-lg mb-3">Polymerization Process</div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <div className="text-slate-400 text-sm mb-2">Polymerization Type</div>
                          <div className="text-white text-lg font-bold">{pair.polymerization.type}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-sm mb-2">Catalyst/Initiator</div>
                          <div className="text-white">{pair.polymerization.catalyst}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-sm mb-2">Temperature Range</div>
                          <div className="text-white">{pair.polymerization.temperature}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-sm mb-2">Pressure Range</div>
                          <div className="text-white">{pair.polymerization.pressure}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-900/20 p-3 rounded">
                        <div className="text-blue-300 font-bold mb-1">Initiation</div>
                        <div className="text-slate-300 text-sm">Radical formation from initiator</div>
                      </div>
                      <div className="bg-green-900/20 p-3 rounded">
                        <div className="text-green-300 font-bold mb-1">Propagation</div>
                        <div className="text-slate-300 text-sm">Chain growth by monomer addition</div>
                      </div>
                      <div className="bg-purple-900/20 p-3 rounded">
                        <div className="text-purple-300 font-bold mb-1">Termination</div>
                        <div className="text-slate-300 text-sm">Chain growth stops by combination</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reaction Equation */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/30 to-green-900/30 rounded-xl border border-slate-700">
                <div className="text-center">
                  <div className="text-slate-400 text-sm mb-2">Polymerization Reaction</div>
                  <div className="text-xl font-mono text-white">
                    n {pair.monomer.formula} → {pair.polymer.formula}
                  </div>
                  <div className="text-slate-300 text-sm mt-2">
                    Where n = degree of polymerization (typically 1000-100,000)
                  </div>
                </div>
              </div>
            </div>
          </Html>
        </group>
      </Float>
    </SimulationLayout>
  );
}
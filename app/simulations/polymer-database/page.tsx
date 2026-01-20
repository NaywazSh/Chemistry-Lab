'use client';

import React, { useState } from 'react';
import { Html, Float, Text } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';

const polymerPropertiesDatabase = [
  {
    id: 'pvc',
    name: 'Polyvinyl Chloride',
    category: 'Thermoplastic',
    density: '1.3-1.45 g/cm³',
    meltingPoint: '100-260°C',
    tensileStrength: '40-80 MPa',
    elongation: '2-40%',
    thermalConductivity: '0.14-0.17 W/m·K',
    chemicalResistance: [
      { chemical: 'Acids', rating: 'Excellent', color: 'green' },
      { chemical: 'Bases', rating: 'Excellent', color: 'green' },
      { chemical: 'Oils', rating: 'Good', color: 'yellow' },
      { chemical: 'Alcohols', rating: 'Excellent', color: 'green' }
    ],
    applications: [
      { category: 'Construction', items: ['Pipes', 'Window Frames', 'Siding', 'Flooring'] },
      { category: 'Medical', items: ['IV Bags', 'Tubing', 'Blood Bags'] },
      { category: 'Electrical', items: ['Cable Insulation', 'Conduit'] }
    ],
    processing: [
      'Extrusion (pipes, profiles)',
      'Injection Molding (fittings)',
      'Calendering (sheets)',
      'Blow Molding (bottles)'
    ],
    additives: [
      'Plasticizers (for flexibility)',
      'Stabilizers (against heat/UV)',
      'Fillers (for strength)',
      'Pigments (for color)'
    ],
    environmental: {
      recyclable: true,
      recyclingCode: '3',
      biodegradation: 'Very slow',
      incineration: 'Releases HCl, requires scrubbers'
    }
  },
  {
    id: 'teflon',
    name: 'Polytetrafluoroethylene',
    category: 'Fluoropolymer',
    density: '2.1-2.3 g/cm³',
    meltingPoint: '327°C',
    tensileStrength: '14-35 MPa',
    elongation: '200-400%',
    thermalConductivity: '0.25 W/m·K',
    chemicalResistance: [
      { chemical: 'Acids', rating: 'Excellent', color: 'green' },
      { chemical: 'Bases', rating: 'Excellent', color: 'green' },
      { chemical: 'Solvents', rating: 'Excellent', color: 'green' },
      { chemical: 'Oxidizers', rating: 'Excellent', color: 'green' }
    ],
    applications: [
      { category: 'Industrial', items: ['Gaskets', 'Seals', 'Bearings', 'Linings'] },
      { category: 'Consumer', items: ['Non-stick Cookware', 'Waterproof Fabrics'] },
      { category: 'Electrical', items: ['Wire Insulation', 'Circuit Boards'] }
    ],
    processing: [
      'Compression Molding',
      'Ram Extrusion',
      'Paste Extrusion',
      'Sintering'
    ],
    additives: [
      'Glass Fiber (reinforcement)',
      'Bronze Powder (wear resistance)',
      'Carbon (conductivity)',
      'Molybdenum Disulfide (lubricity)'
    ],
    environmental: {
      recyclable: true,
      recyclingCode: '7',
      biodegradation: 'Non-biodegradable',
      incineration: 'Releases toxic fumes above 350°C'
    }
  },
  {
    id: 'nylon',
    name: 'Nylon (Polyamide)',
    category: 'Engineering Plastic',
    density: '1.12-1.15 g/cm³',
    meltingPoint: '220-265°C',
    tensileStrength: '45-90 MPa',
    elongation: '20-300%',
    thermalConductivity: '0.25-0.35 W/m·K',
    chemicalResistance: [
      { chemical: 'Oils', rating: 'Excellent', color: 'green' },
      { chemical: 'Fuels', rating: 'Good', color: 'yellow' },
      { chemical: 'Acids', rating: 'Poor', color: 'red' },
      { chemical: 'Bases', rating: 'Fair', color: 'orange' }
    ],
    applications: [
      { category: 'Textiles', items: ['Clothing', 'Carpets', 'Ropes', 'Parachutes'] },
      { category: 'Automotive', items: ['Engine Parts', 'Fuel Lines', 'Bearings'] },
      { category: 'Consumer', items: ['Zippers', 'Brush Bristles', 'Fishing Line'] }
    ],
    processing: [
      'Injection Molding',
      'Extrusion',
      'Blow Molding',
      'Thermoforming'
    ],
    additives: [
      'Glass Fiber (strength)',
      'Moisture Absorbers (stability)',
      'UV Stabilizers',
      'Flame Retardants'
    ],
    environmental: {
      recyclable: true,
      recyclingCode: '7',
      biodegradation: 'Slow, requires specific conditions',
      incineration: 'Releases nitrogen oxides'
    }
  }
];

export default function PolymerPropertiesPage() {
  const [selectedPolymer, setSelectedPolymer] = useState(0);
  const [activeTab, setActiveTab] = useState<'properties' | 'applications' | 'processing' | 'environment'>('properties');

  const polymer = polymerPropertiesDatabase[selectedPolymer];

  return (
    <SimulationLayout
      title="Polymer Properties Database"
      description="Comprehensive technical database of polymer properties, processing methods, applications, and environmental considerations."
    >
      <Float speed={0.3} rotationIntensity={0.1} floatIntensity={0.1}>
        <group position={[0, 0, 0]}>
          <Html position={[0, 0, 0]} center>
            <div className="bg-gradient-to-br from-slate-900/90 to-gray-900/90 p-6 rounded-2xl border border-slate-700 backdrop-blur-lg w-[900px] max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Polymer Properties Database</h1>
                <p className="text-slate-400">Technical specifications and application guidelines</p>
              </div>

              {/* Polymer Selection */}
              <div className="flex gap-4 mb-8">
                {polymerPropertiesDatabase.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedPolymer(index)}
                    className={`flex-1 py-4 rounded-xl transition-all ${
                      selectedPolymer === index
                        ? 'shadow-lg ring-2 ring-offset-1 ring-offset-black'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                    style={selectedPolymer === index ? 
                      item.id === 'pvc' ? { backgroundColor: '#10B981' } :
                      item.id === 'teflon' ? { backgroundColor: '#F59E0B' } :
                      { backgroundColor: '#8B5CF6' }
                      : {}
                    }
                  >
                    <div className="text-lg font-bold text-white">{item.name.split(' ')[0]}</div>
                    <div className="text-sm opacity-90 text-white/90">{item.category}</div>
                  </button>
                ))}
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-2 mb-6">
                {(['properties', 'applications', 'processing', 'environment'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 rounded-lg text-sm font-medium ${
                      activeTab === tab
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
                {activeTab === 'properties' && (
                  <div className="grid grid-cols-2 gap-8">
                    {/* Left Column - Physical Properties */}
                    <div>
                      <h3 className="text-white font-bold text-lg mb-4">Physical Properties</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-800/50 p-3 rounded">
                            <div className="text-slate-400 text-sm">Density</div>
                            <div className="text-white text-lg font-bold">{polymer.density}</div>
                          </div>
                          <div className="bg-slate-800/50 p-3 rounded">
                            <div className="text-slate-400 text-sm">Melting Point</div>
                            <div className="text-white text-lg font-bold">{polymer.meltingPoint}</div>
                          </div>
                          <div className="bg-slate-800/50 p-3 rounded">
                            <div className="text-slate-400 text-sm">Tensile Strength</div>
                            <div className="text-white text-lg font-bold">{polymer.tensileStrength}</div>
                          </div>
                          <div className="bg-slate-800/50 p-3 rounded">
                            <div className="text-slate-400 text-sm">Elongation</div>
                            <div className="text-white text-lg font-bold">{polymer.elongation}</div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-white font-bold mb-2">Chemical Resistance</h4>
                          <div className="space-y-2">
                            {polymer.chemicalResistance.map((chem, index) => (
                              <div key={index} className="flex justify-between items-center bg-slate-800/30 p-2 rounded">
                                <span className="text-slate-300">{chem.chemical}</span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  chem.color === 'green' ? 'bg-green-900/50 text-green-300' :
                                  chem.color === 'yellow' ? 'bg-yellow-900/50 text-yellow-300' :
                                  chem.color === 'orange' ? 'bg-orange-900/50 text-orange-300' :
                                  'bg-red-900/50 text-red-300'
                                }`}>
                                  {chem.rating}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Mechanical Properties */}
                    <div>
                      <h3 className="text-white font-bold text-lg mb-4">Mechanical & Thermal</h3>
                      <div className="space-y-4">
                        <div className="bg-slate-800/50 p-4 rounded">
                          <div className="text-slate-400 text-sm mb-1">Thermal Conductivity</div>
                          <div className="text-white text-xl font-bold">{polymer.thermalConductivity}</div>
                        </div>
                        
                        <div>
                          <h4 className="text-white font-bold mb-2">Typical Additives</h4>
                          <div className="space-y-1">
                            {polymer.additives.map((additive, index) => (
                              <div key={index} className="text-slate-300 text-sm flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-cyan-500"></div>
                                {additive}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <h4 className="text-white font-bold mb-2">Structure-Property Relationship</h4>
                          <div className="text-slate-300 text-sm space-y-2">
                            {polymer.id === 'pvc' && (
                              <>
                                <p>• Chlorine atoms provide flame retardancy and rigidity</p>
                                <p>• Polar C-Cl bonds increase intermolecular forces</p>
                                <p>• Can be plasticized for flexible applications</p>
                              </>
                            )}
                            {polymer.id === 'teflon' && (
                              <>
                                <p>• Fluorine atoms create extremely low surface energy</p>
                                <p>• Strong C-F bonds provide thermal stability</p>
                                <p>• Symmetric structure allows high crystallinity</p>
                              </>
                            )}
                            {polymer.id === 'nylon' && (
                              <>
                                <p>• Hydrogen bonding between chains provides strength</p>
                                <p>• Amide groups allow moisture absorption</p>
                                <p>• Regular chain structure enables crystallization</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'applications' && (
                  <div className="space-y-6">
                    {polymer.applications.map((appCategory, index) => (
                      <div key={index} className="bg-slate-800/30 p-4 rounded-lg">
                        <h3 className="text-white font-bold text-lg mb-3">{appCategory.category}</h3>
                        <div className="grid grid-cols-3 gap-3">
                          {appCategory.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="bg-slate-900/50 p-3 rounded text-center">
                              <div className="text-white text-sm">{item}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 p-4 rounded-lg border border-blue-500/30">
                      <h4 className="text-white font-bold mb-2">Why {polymer.name.split(' ')[0]} for these applications?</h4>
                      <div className="text-slate-300 text-sm">
                        {polymer.id === 'pvc' && (
                          <p>PVC's chemical resistance, durability, and cost-effectiveness make it ideal for long-term installations like pipes and window frames that must withstand environmental exposure.</p>
                        )}
                        {polymer.id === 'teflon' && (
                          <p>Teflon's non-stick properties, chemical inertness, and thermal stability make it perfect for applications requiring contamination-free surfaces and resistance to harsh chemicals.</p>
                        )}
                        {polymer.id === 'nylon' && (
                          <p>Nylon's strength, elasticity, and abrasion resistance combined with its ability to be drawn into fine fibers make it excellent for textiles and mechanical applications.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'processing' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-white font-bold text-lg mb-4">Processing Methods</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {polymer.processing.map((method, index) => (
                          <div key={index} className="bg-slate-800/50 p-4 rounded-lg">
                            <div className="text-white font-bold mb-2">{method}</div>
                            <div className="text-slate-400 text-sm">
                              {polymer.id === 'pvc' && index === 0 && "Heated PVC forced through die to create continuous profiles"}
                              {polymer.id === 'teflon' && index === 0 && "Powder compressed in mold then heated to fuse particles"}
                              {polymer.id === 'nylon' && index === 0 && "Molten nylon injected into mold under high pressure"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-red-900/30 p-4 rounded-lg border border-red-500/30">
                        <h4 className="text-red-300 font-bold mb-2">Processing Temperatures</h4>
                        <div className="text-white text-lg font-bold">
                          {polymer.id === 'pvc' && '160-210°C'}
                          {polymer.id === 'teflon' && '370-400°C'}
                          {polymer.id === 'nylon' && '240-290°C'}
                        </div>
                      </div>
                      
                      <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
                        <h4 className="text-green-300 font-bold mb-2">Typical Cycle Time</h4>
                        <div className="text-white text-lg font-bold">
                          {polymer.id === 'pvc' && '30-60 seconds'}
                          {polymer.id === 'teflon' && '5-20 minutes'}
                          {polymer.id === 'nylon' && '20-40 seconds'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'environment' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-emerald-900/30 p-4 rounded-lg border border-emerald-500/30">
                        <h4 className="text-emerald-300 font-bold mb-2">Recyclability</h4>
                        <div className="flex items-center justify-between">
                          <div className="text-white text-lg font-bold">
                            {polymer.environmental.recyclable ? 'Yes' : 'Limited'}
                          </div>
                          <div className="text-3xl">
                            {polymer.environmental.recyclable ? '♻️' : '⚠️'}
                          </div>
                        </div>
                        <div className="text-slate-300 text-sm mt-2">
                          Recycling Code: {polymer.environmental.recyclingCode}
                        </div>
                      </div>
                      
                      <div className="bg-amber-900/30 p-4 rounded-lg border border-amber-500/30">
                        <h4 className="text-amber-300 font-bold mb-2">Biodegradation</h4>
                        <div className="text-white text-lg font-bold">{polymer.environmental.biodegradation}</div>
                        <div className="text-slate-300 text-sm mt-2">
                          Under normal environmental conditions
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <h4 className="text-white font-bold mb-2">Environmental Considerations</h4>
                      <div className="text-slate-300 text-sm space-y-2">
                        {polymer.id === 'pvc' && (
                          <>
                            <p>• Production involves chlorine, an energy-intensive process</p>
                            <p>• Can release hydrochloric acid if burned without controls</p>
                            <p>• Recyclable but collection systems limited</p>
                            <p>• Long lifespan reduces need for replacement</p>
                          </>
                        )}
                        {polymer.id === 'teflon' && (
                          <>
                            <p>• Production uses PFOA/PFOS (being phased out)</p>
                            <p>• Extremely persistent in environment</p>
                            <p>• High-temperature incineration required</p>
                            <p>• Long service life offsets production impact</p>
                          </>
                        )}
                        {polymer.id === 'nylon' && (
                          <>
                            <p>• Production is energy intensive</p>
                            <p>• Can release nitrous oxide during manufacture</p>
                            <p>• Recyclable but often downcycled</p>
                            <p>• Durable products reduce waste</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Industry Statistics */}
              <div className="mt-6 p-4 bg-gradient-to-r from-slate-800/50 to-gray-800/50 rounded-xl">
                <div className="text-center">
                  <div className="text-slate-400 text-sm mb-2">Global Production Volume</div>
                  <div className="text-xl font-bold text-white">
                    {polymer.id === 'pvc' && '~40 million tons/year'}
                    {polymer.id === 'teflon' && '~200,000 tons/year'}
                    {polymer.id === 'nylon' && '~8 million tons/year'}
                  </div>
                  <div className="text-slate-300 text-sm mt-2">
                    {polymer.id === 'pvc' && 'Second most produced plastic after polyethylene'}
                    {polymer.id === 'teflon' && 'Specialty polymer with high value applications'}
                    {polymer.id === 'nylon' && 'First synthetic fiber, revolutionized textiles'}
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
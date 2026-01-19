'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Float, Html, Line, Text, Plane } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

function FormulaDisplay({ title, equation, variables, color, position }: {
  title: string;
  equation: string;
  variables: Array<{symbol: string; meaning: string; unit: string}>;
  color: string;
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <Html position={[0, 0, 0]}>
        <div className="bg-black/80 p-4 rounded-xl backdrop-blur-sm border-2 min-w-[280px] transition-all duration-300 hover:scale-105" 
             style={{ borderColor: `${color}40` }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
            <div className="text-lg font-bold" style={{ color }}>{title}</div>
          </div>
          
          <div className="text-2xl font-mono text-white my-3 text-center">
            {equation}
          </div>
          
          <div className="space-y-1 mt-3">
            {variables.map((varItem, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-300">{varItem.symbol}</span>
                <span className="text-gray-400">{varItem.meaning}</span>
                <span className="text-blue-300">{varItem.unit}</span>
              </div>
            ))}
          </div>
        </div>
      </Html>
      
      {/* Glow effect */}
      <mesh position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.5, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

function ConductivityCell() {
  const cellLength = 4;
  const cellArea = 2;
  const [voltage, setVoltage] = useState(5); // V
  const [current, setCurrent] = useState(2); // A
  const [length, setLength] = useState(cellLength);
  const [area, setArea] = useState(cellArea);
  
  // Calculate derived values
  const resistance = voltage / current; // Ohm's Law
  const resistivity = resistance * (area / length);
  const conductivity = 1 / resistivity;
  const conductance = 1 / resistance;
  const cellConstant = length / area;
  
  const electrons = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (electrons.current) {
      const time = clock.getElapsedTime();
      electrons.current.children.forEach((child, i) => {
        const offset = i * 0.5;
        child.position.y = Math.sin(time * 2 + offset) * 0.1;
        child.position.x = Math.cos(time * 1.5 + offset) * 0.05;
      });
    }
  });

  return (
    <group>
      {/* Electrochemistry Cell Visualization */}
      <group position={[0, 1, 0]}>
        {/* Cell Container */}
        <mesh>
          <boxGeometry args={[3, 2, 2]} />
          <meshStandardMaterial 
            color="#0ea5e9" 
            transparent 
            opacity={0.2} 
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Anode (positive electrode) */}
        <mesh position={[-1.4, 0, 0]}>
          <boxGeometry args={[0.2, 1.5, 1.8]} />
          <meshStandardMaterial 
            color="#ef4444" 
            emissive="#ef4444" 
            emissiveIntensity={0.5}
            metalness={0.8}
          />
          <Html position={[0, 1.2, 0]} center>
            <div className="bg-red-500/90 text-white px-3 py-1 rounded-lg text-sm font-bold backdrop-blur-sm">
              Anode (+)
            </div>
          </Html>
        </mesh>
        
        {/* Cathode (negative electrode) */}
        <mesh position={[1.4, 0, 0]}>
          <boxGeometry args={[0.2, 1.5, 1.8]} />
          <meshStandardMaterial 
            color="#3b82f6" 
            emissive="#3b82f6" 
            emissiveIntensity={0.5}
            metalness={0.8}
          />
          <Html position={[0, 1.2, 0]} center>
            <div className="bg-blue-500/90 text-white px-3 py-1 rounded-lg text-sm font-bold backdrop-blur-sm">
              Cathode (-)
            </div>
          </Html>
        </mesh>
        
        {/* Ion movement visualization */}
        <group ref={electrons}>
          {/* Positive ions moving toward cathode */}
          {Array.from({ length: 8 }).map((_, i) => (
            <Sphere key={`pos-${i}`} args={[0.08, 16, 16]} position={[
              -1 + Math.random() * 0.5,
              -0.5 + (i * 0.25),
              -0.7 + Math.random() * 1.4
            ]}>
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
            </Sphere>
          ))}
          
          {/* Negative ions moving toward anode */}
          {Array.from({ length: 8 }).map((_, i) => (
            <Sphere key={`neg-${i}`} args={[0.08, 16, 16]} position={[
              1 - Math.random() * 0.5,
              -0.5 + (i * 0.25),
              -0.7 + Math.random() * 1.4
            ]}>
              <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
            </Sphere>
          ))}
        </group>
        
        {/* Current flow indicator */}
        <Line
          points={[[-1.3, 0, 0], [1.3, 0, 0]]}
          color="#fbbf24"
          lineWidth={3}
          dashed={false}
        >
          <meshBasicMaterial color="#fbbf24" />
        </Line>
        <Html position={[0, -0.8, 0]} center>
          <div className="bg-yellow-500/90 text-black px-3 py-1 rounded-lg text-sm font-bold backdrop-blur-sm">
            Current (I) = {current.toFixed(2)} A
          </div>
        </Html>
        
        {/* Voltage indicator */}
        <Line
          points={[[-1.4, 0.8, 0], [1.4, 0.8, 0]]}
          color="#10b981"
          lineWidth={2}
          dashed={true}
          dashSize={0.1}
          gapSize={0.1}
        >
          <meshBasicMaterial color="#10b981" />
        </Line>
        <Html position={[0, 1.1, 0]} center>
          <div className="bg-green-500/90 text-white px-3 py-1 rounded-lg text-sm font-bold backdrop-blur-sm">
            Voltage (V) = {voltage.toFixed(2)} V
          </div>
        </Html>
      </group>
      
      {/* Interactive controls panel */}
      <Html position={[0, -2, 0]}>
        <div className="bg-black/80 p-4 rounded-xl backdrop-blur-sm">
          <div className="text-white font-bold mb-3">Adjust Parameters</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-300">Voltage (V)</label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={voltage}
                onChange={(e) => setVoltage(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-white">{voltage} V</div>
            </div>
            <div>
              <label className="text-xs text-gray-300">Current (I)</label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={current}
                onChange={(e) => setCurrent(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-white">{current} A</div>
            </div>
          </div>
          
          {/* Live calculations display */}
          <div className="mt-4 p-3 bg-gray-900/50 rounded">
            <div className="text-sm text-cyan-300 mb-2">Live Calculations:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-gray-400">Resistance (R):</div>
              <div className="text-white font-mono">{resistance.toFixed(2)} Ω</div>
              
              <div className="text-gray-400">Conductance (G):</div>
              <div className="text-white font-mono">{conductance.toFixed(4)} S</div>
              
              <div className="text-gray-400">Resistivity (ρ):</div>
              <div className="text-white font-mono">{resistivity.toFixed(4)} Ω·m</div>
              
              <div className="text-gray-400">Conductivity (σ):</div>
              <div className="text-white font-mono">{conductivity.toFixed(4)} S/m</div>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

function GeometryVisual({ type, value, unit, color, position }: {
  type: 'length' | 'area';
  value: number;
  unit: string;
  color: string;
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      {type === 'length' ? (
        <>
          <Cylinder args={[0.05, 0.05, value]} position={[0, value/2, 0]}>
            <meshStandardMaterial color={color} />
          </Cylinder>
          <Line
            points={[[0, 0, 0], [0, value, 0]]}
            color="white"
            lineWidth={2}
            dashed={true}
          />
          <Html position={[0.5, value/2, 0]}>
            <div className="bg-black/70 text-white px-2 py-1 rounded text-sm backdrop-blur-sm">
              L = {value} {unit}
            </div>
          </Html>
        </>
      ) : (
        <>
          <Plane args={[value, value]} rotation={[Math.PI/2, 0, 0]}>
            <meshStandardMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
          </Plane>
          <Html position={[0, 0.2, 0]}>
            <div className="bg-black/70 text-white px-2 py-1 rounded text-sm backdrop-blur-sm">
              A = {value} {unit}²
            </div>
          </Html>
        </>
      )}
    </group>
  );
}

export default function ConductivityFormulasPage() {
  const formulas = [
    {
      title: "Ohm's Law",
      equation: "V = I × R",
      variables: [
        { symbol: "V", meaning: "Voltage", unit: "V (Volts)" },
        { symbol: "I", meaning: "Current", unit: "A (Amperes)" },
        { symbol: "R", meaning: "Resistance", unit: "Ω (Ohms)" }
      ],
      color: "#ef4444"
    },
    {
      title: "Resistivity & Conductivity",
      equation: "σ = 1/ρ",
      variables: [
        { symbol: "σ", meaning: "Conductivity", unit: "S/m" },
        { symbol: "ρ", meaning: "Resistivity", unit: "Ω·m" },
        { symbol: " ", meaning: "Inverse relationship", unit: "" }
      ],
      color: "#3b82f6"
    },
    {
      title: "Resistance with Geometry",
      equation: "R = ρ × L/A",
      variables: [
        { symbol: "R", meaning: "Resistance", unit: "Ω" },
        { symbol: "ρ", meaning: "Resistivity", unit: "Ω·m" },
        { symbol: "L", meaning: "Length", unit: "m" },
        { symbol: "A", meaning: "Cross-sectional Area", unit: "m²" }
      ],
      color: "#10b981"
    },
    {
      title: "Conductance",
      equation: "G = 1/R",
      variables: [
        { symbol: "G", meaning: "Conductance", unit: "S (Siemens)" },
        { symbol: "R", meaning: "Resistance", unit: "Ω" },
        { symbol: " ", meaning: "Reciprocal of Resistance", unit: "" }
      ],
      color: "#8b5cf6"
    },
    {
      title: "Cell Constant",
      equation: "K = L/A",
      variables: [
        { symbol: "K", meaning: "Cell Constant", unit: "1/m" },
        { symbol: "L", meaning: "Electrode Distance", unit: "m" },
        { symbol: "A", meaning: "Electrode Area", unit: "m²" }
      ],
      color: "#f59e0b"
    },
    {
      title: "Conductivity from Cell Constant",
      equation: "σ = G × K",
      variables: [
        { symbol: "σ", meaning: "Conductivity", unit: "S/m" },
        { symbol: "G", meaning: "Measured Conductance", unit: "S" },
        { symbol: "K", meaning: "Cell Constant", unit: "1/m" }
      ],
      color: "#ec4899"
    }
  ];

  return (
    <SimulationLayout
      title="Conductivity Formulas in Electrochemistry"
      description="Mathematical relationships governing electrical conductivity, resistance, and geometry in electrochemical cells. Visualizing Ohm's Law, resistivity, conductivity, and their interrelationships."
    >
      <Float speed={0.3} rotationIntensity={0.1} floatIntensity={0.2}>
        <group rotation={[0, 0.5, 0]}>
          {/* Main conductivity cell in center */}
          <ConductivityCell />
          
          {/* Formula displays arranged in a circle around the cell */}
          {formulas.map((formula, index) => {
            const angle = (index * 2 * Math.PI) / formulas.length;
            const radius = 5;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = 0;
            
            return (
              <FormulaDisplay
                key={index}
                title={formula.title}
                equation={formula.equation}
                variables={formula.variables}
                color={formula.color}
                position={[x, y, z]}
              />
            );
          })}
          
          {/* Connecting lines from cell to formulas */}
          {formulas.map((_, index) => {
            const angle = (index * 2 * Math.PI) / formulas.length;
            const radius = 5;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            return (
              <Line
                key={`line-${index}`}
                points={[[0, 1, 0], [x * 0.7, 1, z * 0.7]]}
                color="#ffffff"
                opacity={0.1}
                transparent
                lineWidth={1}
              />
            );
          })}
          
          {/* Geometry visualization (L and A) */}
          <GeometryVisual
            type="length"
            value={4}
            unit="m"
            color="#10b981"
            position={[3, -1, -3]}
          />
          
          <GeometryVisual
            type="area"
            value={2}
            unit="m"
            color="#3b82f6"
            position={[-3, -1, -3]}
          />
          
          {/* Resistivity/Conductivity relationship visualization */}
          <group position={[-4, 1, 3]}>
            <Html>
              <div className="bg-black/80 p-4 rounded-xl backdrop-blur-sm">
                <div className="text-lg font-bold text-purple-400 mb-2">Inverse Relationship</div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-mono text-blue-400">ρ</div>
                    <div className="text-xs text-gray-300">Resistivity</div>
                    <div className="text-xs text-blue-300">Ω·m</div>
                  </div>
                  <div className="text-2xl text-white">↔</div>
                  <div className="text-center">
                    <div className="text-3xl font-mono text-green-400">σ</div>
                    <div className="text-xs text-gray-300">Conductivity</div>
                    <div className="text-xs text-green-300">S/m</div>
                  </div>
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  σ = 1/ρ and ρ = 1/σ
                </div>
              </div>
            </Html>
            
            {/* Inverse relationship visualization */}
            <Line
              points={[[0, 0, 0], [2, -1, 0]]}
              color="#8b5cf6"
              lineWidth={2}
              dashed={true}
            >
              <meshBasicMaterial color="#8b5cf6" />
            </Line>
            <mesh position={[2, -1, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color="#8b5cf6" />
            </mesh>
          </group>
        </group>
      </Float>
    </SimulationLayout>
  );
}
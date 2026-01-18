'use client';

import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text, Float, Html, Cylinder, Cone } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

// --- Data: Key Elements of the Series ---
const SERIES = [
  { symbol: "Li", ion: "Li⁺", e: -3.05, name: "Lithium", color: "#ef4444" }, // Strongest Reducing Agent
  { symbol: "K",  ion: "K⁺",  e: -2.93, name: "Potassium", color: "#f97316" },
  { symbol: "Al", ion: "Al³⁺", e: -1.66, name: "Aluminium", color: "#fbbf24" },
  { symbol: "Zn", ion: "Zn²⁺", e: -0.76, name: "Zinc",      color: "#eab308" },
  { symbol: "Fe", ion: "Fe²⁺", e: -0.44, name: "Iron",      color: "#84cc16" },
  { symbol: "H₂", ion: "2H⁺",  e:  0.00, name: "Hydrogen",  color: "#ffffff" }, // Reference
  { symbol: "Cu", ion: "Cu²⁺", e: +0.34, name: "Copper",    color: "#06b6d4" },
  { symbol: "Ag", ion: "Ag⁺",  e: +0.80, name: "Silver",    color: "#3b82f6" },
  { symbol: "F₂", ion: "F⁻",   e: +2.87, name: "Fluorine",  color: "#8b5cf6" }, // Strongest Oxidizing Agent
];

// --- Components ---

const ElementCard = ({ data, position, onClick, isActive }: { data: any, position: [number, number, number], onClick: () => void, isActive: boolean }) => {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (mesh.current) {
      // Hover animation / Active pulse
      const t = state.clock.getElapsedTime();
      mesh.current.position.y = position[1] + (isActive ? Math.sin(t * 3) * 0.1 : 0);
      mesh.current.rotation.y = isActive ? Math.sin(t) * 0.1 : 0;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      {/* The Plate */}
      <Box ref={mesh} args={[2.5, 0.4, 0.2]}>
        <meshPhysicalMaterial 
          color={data.color} 
          metalness={0.8} 
          roughness={0.2} 
          emissive={isActive ? data.color : "black"}
          emissiveIntensity={0.5}
        />
      </Box>

      {/* Text on Plate */}
      <Text position={[-0.8, 0, 0.11]} fontSize={0.2} color="white" anchorX="center" anchorY="middle">
        {data.symbol}
      </Text>
      <Text position={[0.8, 0, 0.11]} fontSize={0.2} color="white" anchorX="center" anchorY="middle">
        {data.e > 0 ? "+" + data.e.toFixed(2) : data.e.toFixed(2)} V
      </Text>

      {/* Pop-up Details when clicked */}
      {isActive && (
        <Html position={[1.5, 0, 0]} center>
          <div className="bg-slate-900/90 border border-slate-500 p-3 rounded-xl w-48 text-left backdrop-blur-md">
            <div className="text-lg font-bold text-white mb-1">{data.name}</div>
            <div className="text-xs text-slate-300">
              Half-Reaction: <br/>
              <span className="font-mono text-cyan-400">
                {data.ion} + ne⁻ ⇌ {data.symbol}
              </span>
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-widest font-bold" style={{ color: data.color }}>
              {data.e < 0 ? "Reducing Agent" : "Oxidizing Agent"}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

const TrendArrow = ({ position, color, text, direction }: { position: [number, number, number], color: string, text: string, direction: 'up' | 'down' }) => {
  return (
    <group position={position}>
      <Cylinder args={[0.05, 0.05, 4, 8]} position={[0, 0, 0]}>
        <meshStandardMaterial color={color} />
      </Cylinder>
      <Cone args={[0.2, 0.4, 16]} position={[0, direction === 'up' ? 2.2 : -2.2, 0]} rotation={[direction === 'up' ? 0 : Math.PI, 0, 0]}>
        <meshStandardMaterial color={color} />
      </Cone>
      <Text 
        position={[-0.3, 0, 0]} 
        rotation={[0, 0, Math.PI/2]} 
        fontSize={0.2} 
        color={color}
        anchorX="center"
      >
        {text}
      </Text>
    </group>
  );
};

export default function ElectroSeriesPage() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <SimulationLayout
      title="Electrochemical Series"
      description="The arrangement of elements in order of their Standard Electrode Potentials (E°). Elements at the top are strong Reducing Agents (lose electrons easily), while elements at the bottom are strong Oxidizing Agents."
    >
      <group position={[0, -0.5, 0]}>
        
        {/* Render the Stack of Elements */}
        <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
          {SERIES.map((el, i) => {
            // Calculate Y position to stack them
            // Total height approx 5 units. Start at 2.5, go down to -2.5
            const y = 2.5 - (i * 0.6); 
            return (
              <ElementCard 
                key={el.symbol} 
                data={el} 
                position={[0, y, 0]} 
                isActive={activeIdx === i}
                onClick={() => setActiveIdx(i === activeIdx ? null : i)}
              />
            );
          })}
        </Float>

        {/* --- Trend Arrows (Left Side) --- */}
        <group position={[-2.5, 0, 0]}>
           <TrendArrow 
             position={[0, 0, 0]} 
             color="#ef4444" 
             text="Increasing Reducing Power" 
             direction="up" 
           />
        </group>

        {/* --- Trend Arrows (Right Side) --- */}
        <group position={[2.5, 0, 0]}>
           <TrendArrow 
             position={[0, 0, 0]} 
             color="#8b5cf6" 
             text="Increasing Oxidizing Power" 
             direction="down" 
           />
        </group>

        {/* --- Instructions --- */}
        <Html position={[0, -3.5, 0]} center>
           <div className="text-slate-500 text-xs bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
              Click any bar to see the half-reaction
           </div>
        </Html>

      </group>
    </SimulationLayout>
  );
}
'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Box, Sphere, Tube, Text, Float, Html } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

// --- Components ---

const Beaker = ({ position, liquidColor, label }: { position: [number, number, number], liquidColor: string, label: string }) => (
  <group position={position}>
    {/* Glass Container */}
    <Cylinder args={[1, 1, 2.5, 32]} position={[0, 1.25, 0]}>
      <meshPhysicalMaterial 
        color="white" 
        transmission={0.9} 
        opacity={0.3} 
        transparent 
        roughness={0} 
        thickness={0.1} 
        side={THREE.DoubleSide} 
      />
    </Cylinder>
    
    {/* Liquid */}
    <Cylinder args={[0.9, 0.9, 1.8, 32]} position={[0, 0.9, 0]}>
      <meshStandardMaterial color={liquidColor} transparent opacity={0.8} />
    </Cylinder>

    {/* Label */}
    <Text position={[0, -0.5, 0.8]} fontSize={0.2} color="white" anchorX="center" anchorY="top">
      {label}
    </Text>
  </group>
);

const Electrode = ({ color, position, name, charge }: { color: string, position: [number, number, number], name: string, charge: string }) => (
  <group position={position}>
    <Box args={[0.4, 3, 0.1]}>
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
    </Box>
    <Html position={[0, 1.8, 0]} center>
      <div className="flex flex-col items-center min-w-[100px]">
        <span className={`text-xs font-bold px-2 py-1 rounded ${charge === '-' ? 'bg-red-500/80' : 'bg-green-500/80'} text-white whitespace-nowrap`}>
          {charge} {name}
        </span>
      </div>
    </Html>
  </group>
);

const ElectronFlow = () => {
  const groupRef = useRef<THREE.Group>(null);
  // Create 10 electron dots
  const electrons = useMemo(() => new Array(10).fill(0), []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      groupRef.current.children.forEach((el, i) => {
        // Offset each electron so they don't all move together
        const offset = (t * 0.5 + i * 0.1) % 1; 
        
        let x = 0, y = 0;
        
        // Path: Up -> Right -> Down
        if (offset < 0.2) { 
           // Moving Up from Zinc (-1.5, 2.5) to (-1.5, 3.5)
           x = -1.5; 
           y = 2.5 + (offset / 0.2); 
        } else if (offset < 0.8) { 
           // Moving Across to (1.5, 3.5)
           x = -1.5 + ((offset - 0.2) / 0.6) * 3; 
           y = 3.5;
        } else { 
           // Moving Down to Copper (1.5, 2.5)
           x = 1.5;
           y = 3.5 - ((offset - 0.8) / 0.2);
        }
        
        el.position.set(x, y, 0);
      });
    }
  });

  return (
    <group ref={groupRef}>
      {electrons.map((_, i) => (
        <Sphere key={i} args={[0.08, 8, 8]}>
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
        </Sphere>
      ))}
    </group>
  );
};

const SaltBridge = () => {
  const path = useMemo(() => {
    const curve = new THREE.CurvePath<THREE.Vector3>();
    const p1 = new THREE.Vector3(-0.6, 1.5, 0);
    const p2 = new THREE.Vector3(-0.6, 2.5, 0);
    const p3 = new THREE.Vector3(0.6, 2.5, 0);
    const p4 = new THREE.Vector3(0.6, 1.5, 0);
    
    curve.add(new THREE.LineCurve3(p1, p2));
    curve.add(new THREE.LineCurve3(p2, p3));
    curve.add(new THREE.LineCurve3(p3, p4));
    return curve;
  }, []);

  return (
    <group>
        <Tube args={[path, 64, 0.15, 8, false]}>
            <meshStandardMaterial color="#fff" transparent opacity={0.6} />
        </Tube>
        <Text position={[0, 2.2, 0]} fontSize={0.15} color="#333" outlineWidth={0.02} outlineColor="white">
            Salt Bridge
        </Text>
    </group>
  );
};

export default function GalvanicCellPage() {
  return (
    <SimulationLayout
      title="Galvanic (Voltaic) Cell"
      description="A classic Daniell Cell setup. Chemical energy is converted into electrical energy via spontaneous redox reactions. Zinc oxidizes (anode), releasing electrons that travel to the Copper (cathode) to reduce Cu²⁺ ions."
      cameraPosition={[0, 1, 6]} // Adjusted camera to see everything clearly
    >
      <group position={[0, -1.5, 0]}>
        
        {/* --- LEFT SIDE: ZINC (ANODE) --- */}
        <Beaker position={[-1.5, 0, 0]} liquidColor="#e2e8f0" label="ZnSO₄" />
        <Electrode position={[-1.5, 1.2, 0]} color="#94a3b8" name="Zinc (Anode)" charge="-" />
        
        <Html position={[-2.8, 2, 0]} center>
          <div className="bg-slate-900/80 p-2 rounded border border-slate-700 text-xs text-slate-300 w-32 text-center backdrop-blur-md">
            <strong className="text-red-400 block">Oxidation</strong>
            Zn → Zn²⁺ + 2e⁻
          </div>
        </Html>

        {/* --- RIGHT SIDE: COPPER (CATHODE) --- */}
        <Beaker position={[1.5, 0, 0]} liquidColor="#3b82f6" label="CuSO₄" />
        <Electrode position={[1.5, 1.2, 0]} color="#d97706" name="Copper (Cathode)" charge="+" />

        <Html position={[2.8, 2, 0]} center>
          <div className="bg-slate-900/80 p-2 rounded border border-slate-700 text-xs text-slate-300 w-32 text-center backdrop-blur-md">
            <strong className="text-green-400 block">Reduction</strong>
            Cu²⁺ + 2e⁻ → Cu
          </div>
        </Html>

        {/* --- CONNECTORS --- */}
        <SaltBridge />
        
        {/* Wires (Static Lines) */}
        <group>
           <mesh position={[-1.5, 3, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
              <meshStandardMaterial color="#555" />
           </mesh>
           <mesh position={[1.5, 3, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
              <meshStandardMaterial color="#555" />
           </mesh>
           <mesh position={[0, 3.5, 0]} rotation={[0, 0, Math.PI/2]}>
              <cylinderGeometry args={[0.02, 0.02, 3, 8]} />
              <meshStandardMaterial color="#555" />
           </mesh>
        </group>

        {/* Voltmeter Box */}
        <group position={[0, 3.5, 0]}>
          <Box args={[0.8, 0.5, 0.2]}>
              <meshStandardMaterial color="#222" />
          </Box>
          <Text position={[0, 0, 0.11]} fontSize={0.25} color="#4ade80">
              1.10 V
          </Text>
        </group>

        {/* Moving Electrons */}
        <ElectronFlow />

      </group>
    </SimulationLayout>
  );
}
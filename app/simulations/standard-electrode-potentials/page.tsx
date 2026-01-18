'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Box, Sphere, Tube, Text, Float, Html } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

// --- Components ---

const Beaker = ({ position, color, label }: { position: [number, number, number], color: string, label: string }) => (
  <group position={position}>
    {/* Glass */}
    <Cylinder args={[1, 1, 2.2, 32]} position={[0, 1.1, 0]}>
      <meshPhysicalMaterial 
        color="white" 
        transmission={0.95} 
        opacity={0.3} 
        transparent 
        roughness={0} 
        thickness={0.1} 
        side={THREE.DoubleSide} 
      />
    </Cylinder>
    {/* Liquid */}
    <Cylinder args={[0.9, 0.9, 1.5, 32]} position={[0, 0.8, 0]}>
      <meshStandardMaterial color={color} transparent opacity={0.6} />
    </Cylinder>
    <Text position={[0, -0.5, 0.8]} fontSize={0.15} color="white" anchorX="center" anchorY="top">
      {label}
    </Text>
  </group>
);

const ZincElectrode = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <Box args={[0.3, 2.5, 0.1]}>
      <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
    </Box>
    <Html position={[0, 1.5, 0]} center>
      <div className="text-xs font-bold text-slate-300 bg-slate-900/80 px-2 py-1 rounded border border-slate-700">Zn Electrode</div>
    </Html>
  </group>
);

// Standard Hydrogen Electrode (SHE)
const SHE = ({ position }: { position: [number, number, number] }) => {
  // Bubbles animation
  const bubbles = useMemo(() => new Array(15).fill(0), []);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((b, i) => {
        const t = clock.getElapsedTime() * 0.5 + i * 10;
        b.position.y = -0.5 + (t % 1.5); // Rise up
        b.scale.setScalar(0.5 - (b.position.y * 0.2)); // Pop at top
      });
    }
  });

  return (
    <group position={position}>
      {/* Glass Tube */}
      <Cylinder args={[0.3, 0.3, 2.5, 16]} position={[0, 0.5, 0]}>
        <meshPhysicalMaterial color="white" transmission={0.9} opacity={0.3} transparent side={THREE.DoubleSide} />
      </Cylinder>
      
      {/* Platinum Wire */}
      <Cylinder args={[0.02, 0.02, 2.5]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#333" metalness={1} />
      </Cylinder>
      
      {/* Platinum Foil */}
      <Box args={[0.2, 0.3, 0.01]} position={[0, -0.8, 0]}>
        <meshStandardMaterial color="#333" metalness={1} roughness={0.2} />
      </Box>

      {/* Hydrogen Gas Inlet */}
      <group position={[0.4, 1.2, 0]} rotation={[0, 0, Math.PI/2]}>
         <Cylinder args={[0.05, 0.05, 0.8]}><meshStandardMaterial color="white" opacity={0.5} transparent /></Cylinder>
         <Html position={[0.5, 0.2, 0]} center><div className="text-xs text-white bg-blue-500/80 px-1 rounded">H₂ (g) 1 atm</div></Html>
      </group>

      {/* Bubbles */}
      <group ref={groupRef}>
        {bubbles.map((_, i) => (
           <Sphere key={i} args={[0.05, 8, 8]} position={[Math.random()*0.2 - 0.1, 0, Math.random()*0.2 - 0.1]}>
             <meshStandardMaterial color="white" transparent opacity={0.5} />
           </Sphere>
        ))}
      </group>
    </group>
  );
};

const SaltBridge = () => {
  const path = useMemo(() => {
    const curve = new THREE.CurvePath<THREE.Vector3>();
    const p1 = new THREE.Vector3(-0.8, 1.2, 0);
    const p2 = new THREE.Vector3(-0.8, 2.0, 0);
    const p3 = new THREE.Vector3(0.8, 2.0, 0);
    const p4 = new THREE.Vector3(0.8, 1.2, 0);
    curve.add(new THREE.LineCurve3(p1, p2));
    curve.add(new THREE.LineCurve3(p2, p3));
    curve.add(new THREE.LineCurve3(p3, p4));
    return curve;
  }, []);

  return (
    <Tube args={[path, 64, 0.1, 8, false]}>
        <meshStandardMaterial color="#fff" transparent opacity={0.5} />
    </Tube>
  );
};

const Voltmeter = () => (
  <group position={[0, 2.8, 0]}>
    <Box args={[1, 0.6, 0.2]}>
      <meshStandardMaterial color="#1e293b" />
    </Box>
    <Text position={[0, 0, 0.11]} fontSize={0.25} color="#4ade80">
      0.76 V
    </Text>
    {/* Wires */}
    <mesh position={[-1, -0.5, 0]} rotation={[0, 0, 0.5]}>
       <cylinderGeometry args={[0.02, 0.02, 1.5]} />
       <meshStandardMaterial color="black" />
    </mesh>
    <mesh position={[1, -0.5, 0]} rotation={[0, 0, -0.5]}>
       <cylinderGeometry args={[0.02, 0.02, 1.5]} />
       <meshStandardMaterial color="black" />
    </mesh>
  </group>
);

export default function StandardPotentialPage() {
  return (
    <SimulationLayout
      title="Standard Electrode Potential (E°)"
      description="Measuring the standard electrode potential of Zinc. The Zinc half-cell is connected to the Standard Hydrogen Electrode (SHE). Since the SHE is defined as 0.00 V, the voltmeter reading gives the potential of Zinc directly."
    >
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <group position={[0, -1, 0]}>
          
          {/* --- LEFT: ZINC HALF-CELL --- */}
          <Beaker position={[-1.5, 0, 0]} color="#cbd5e1" label="1M ZnSO₄ (298 K)" />
          <ZincElectrode position={[-1.5, 1, 0]} />
          
          {/* --- RIGHT: S.H.E. (Reference) --- */}
          <Beaker position={[1.5, 0, 0]} color="#dbeafe" label="1M H⁺ (HCl)" />
          <SHE position={[1.5, 1, 0]} />

          {/* --- CONNECTIONS --- */}
          <SaltBridge />
          <Voltmeter />

          {/* --- LABELS --- */}
          <Html position={[0, -1.5, 0]} center>
            <div className="flex gap-8 text-sm">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 text-center">
                    <div className="text-red-400 font-bold mb-1">Anode (Oxidation)</div>
                    <div className="text-slate-300">Zn → Zn²⁺ + 2e⁻</div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 text-center">
                    <div className="text-green-400 font-bold mb-1">Cathode (Reduction)</div>
                    <div className="text-slate-300">2H⁺ + 2e⁻ → H₂</div>
                </div>
            </div>
          </Html>

          {/* Standard Conditions Tag */}
          <Html position={[0, 3.5, 0]} center>
             <div className="bg-amber-500/20 border border-amber-500 text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                Standard Conditions
             </div>
          </Html>

        </group>
      </Float>
    </SimulationLayout>
  );
}
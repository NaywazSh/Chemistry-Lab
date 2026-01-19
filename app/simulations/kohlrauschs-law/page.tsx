'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Float, Html, Line, Text } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

interface IonProps {
  position: [number, number, number];
  velocity: [number, number, number];
  color: string;
  label: string;
  charge: '+' | '-';
  size: number;
}

function Ion({ position, color, label, charge, size }: IonProps) {
  const ref = useRef<THREE.Mesh>(null);
  const [currentPos, setCurrentPos] = useState<[number, number, number]>(position);
  
  useFrame(({ clock }) => {
    if (ref.current) {
      // Simulate Brownian motion - random movement
      const time = clock.getElapsedTime();
      const driftX = Math.sin(time * 0.5 + position[0]) * 0.01;
      const driftY = Math.sin(time * 0.7 + position[1]) * 0.01;
      const driftZ = Math.cos(time * 0.6 + position[2]) * 0.01;
      
      ref.current.position.x = position[0] + driftX;
      ref.current.position.y = position[1] + driftY;
      ref.current.position.z = position[2] + driftZ;
      
      setCurrentPos([ref.current.position.x, ref.current.position.y, ref.current.position.z]);
    }
  });

  return (
    <group>
      <mesh ref={ref} position={position}>
        <Sphere args={[size, 32, 32]}>
          <meshStandardMaterial 
            color={color} 
            roughness={0.1}
            metalness={0.3}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </Sphere>
        
        {/* Charge indicator */}
        <Html position={[0, size + 0.3, 0]} center>
          <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
            {charge}
          </div>
        </Html>
        
        {/* Ion label */}
        <Html position={[0, -size - 0.3, 0]} center>
          <div className="bg-black/60 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
            {label}
          </div>
        </Html>
      </mesh>
      
      {/* Motion trail */}
      <Line
        points={[
          position,
          currentPos
        ]}
        color="white"
        opacity={0.1}
        transparent
        lineWidth={1}
      />
    </group>
  );
}

function ConductivityMeasurement({ ion1, ion2 }: { ion1: string; ion2: string }) {
  return (
    <group position={[4, 2, 0]}>
      {/* Measurement display */}
      <Html position={[0, 0, 0]}>
        <div className="bg-black/80 p-4 rounded-lg backdrop-blur-sm border border-emerald-500/30 min-w-[200px]">
          <div className="text-sm font-semibold text-emerald-300 mb-2">Kohlrausch's Law</div>
          <div className="text-xs text-gray-300 mb-1">Λₘ° = λ⁺ + λ⁻</div>
          <div className="text-xs text-white mb-2">Limiting molar conductivity = sum of ionic conductivities</div>
          <div className="text-xs text-cyan-300 mt-2">
            Λₘ°({ion1}{ion2}) = λ°({ion1}⁺) + λ°({ion2}⁻)
          </div>
        </div>
      </Html>
      
      {/* Equation visualization */}
      <group position={[0, -1.5, 0]}>
        <Text
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Λₘ° = λ⁺ + λ⁻
        </Text>
      </group>
    </group>
  );
}

function IonConductivityBar({ ion, conductivity, color, position }: { 
  ion: string; 
  conductivity: number; 
  color: string;
  position: [number, number, number];
}) {
  const barHeight = conductivity * 0.5;
  
  return (
    <group position={position}>
      {/* Bar */}
      <Cylinder args={[0.2, 0.2, barHeight]} position={[0, barHeight/2, 0]}>
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </Cylinder>
      
      {/* Value label */}
      <Html position={[0.8, barHeight/2, 0]}>
        <div className="bg-black/60 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
          λ° = {conductivity} S·cm²/mol
        </div>
      </Html>
      
      {/* Ion label */}
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.25}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {ion}
      </Text>
    </group>
  );
}

export default function KohlrauschLawPage() {
  const ions = [
    // Cations
    { position: [-3, 0, -2] as [number, number, number], color: "#3b82f6", label: "Na⁺", charge: "+" as const, size: 0.4 },
    { position: [-1, 1, -1] as [number, number, number], color: "#3b82f6", label: "Na⁺", charge: "+" as const, size: 0.4 },
    { position: [-2, -1, 1] as [number, number, number], color: "#3b82f6", label: "Na⁺", charge: "+" as const, size: 0.4 },
    { position: [0, 0, 2] as [number, number, number], color: "#8b5cf6", label: "K⁺", charge: "+" as const, size: 0.45 },
    
    // Anions
    { position: [2, 1, -1] as [number, number, number], color: "#10b981", label: "Cl⁻", charge: "-" as const, size: 0.5 },
    { position: [3, -1, 0] as [number, number, number], color: "#10b981", label: "Cl⁻", charge: "-" as const, size: 0.5 },
    { position: [1, 0, -2] as [number, number, number], color: "#10b981", label: "Cl⁻", charge: "-" as const, size: 0.5 },
    { position: [2, -2, 1] as [number, number, number], color: "#06b6d4", label: "NO₃⁻", charge: "-" as const, size: 0.55 },
  ];

  // Ionic conductivities at infinite dilution (25°C, S·cm²/mol)
  const ionicConductivities = [
    { ion: "Na⁺", value: 50.1, color: "#3b82f6" },
    { ion: "K⁺", value: 73.5, color: "#8b5cf6" },
    { ion: "Cl⁻", value: 76.3, color: "#10b981" },
    { ion: "NO₃⁻", value: 71.4, color: "#06b6d4" },
  ];

  return (
    <SimulationLayout
      title="Kohlrausch's Law: Limiting Molar Conductivity"
      description="At infinite dilution, ions move independently. The limiting molar conductivity (Λₘ°) is the sum of the cationic (λ⁺) and anionic (λ⁻) conductivities. This illustrates Kohlrausch's Law of Independent Migration of Ions."
    >
      <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
        {/* Main visualization area */}
        <group rotation={[0.2, 0.5, 0]}>
          {/* Container boundary (infinite dilution concept) */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0, 5, 64]} />
            <meshBasicMaterial color="#ffffff" opacity={0.05} transparent side={THREE.DoubleSide} />
          </mesh>
          
          {/* Ions - demonstrating independent movement */}
          {ions.map((ion, index) => (
            <Ion
              key={index}
              position={ion.position}
              velocity={[0.01, 0.01, 0.01]}
              color={ion.color}
              label={ion.label}
              charge={ion.charge}
              size={ion.size}
            />
          ))}
          
          {/* Electric field lines (direction of movement) */}
          <group>
            {/* Cathode (negative electrode) */}
            <mesh position={[-5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.1, 4, 4]} />
              <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.3} />
            </mesh>
            
            {/* Anode (positive electrode) */}
            <mesh position={[5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.1, 4, 4]} />
              <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.3} />
            </mesh>
            
            {/* Electric field direction indicator */}
            <arrowHelper
              args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(-4, 1.5, 0), 2, 0xff4444]}
            />
            <Html position={[-3, 2, 0]}>
              <div className="bg-red-500/80 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
                Electric Field
              </div>
            </Html>
          </group>
          
          {/* Conductivity measurement display */}
          <ConductivityMeasurement ion1="Na" ion2="Cl" />
          
          {/* Ionic conductivity comparison */}
          <group position={[-3, -2.5, 0]}>
            <Text
              position={[0, 1, 0]}
              fontSize={0.3}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              Ionic Conductivities (λ°)
            </Text>
            
            {ionicConductivities.map((ion, index) => (
              <IonConductivityBar
                key={index}
                ion={ion.ion}
                conductivity={ion.value}
                color={ion.color}
                position={[(index - 1.5) * 1.5, 0, 0]}
              />
            ))}
          </group>
          
          {/* Kohlrausch's Law equation visualization */}
          <group position={[3, -2, 0]}>
            <Html>
              <div className="bg-purple-900/60 p-3 rounded-lg backdrop-blur-sm border border-purple-500/50">
                <div className="text-sm font-bold text-purple-300 mb-1">Kohlrausch's Law</div>
                <div className="text-xs text-gray-200">
                  Λₘ° = ν₊λ₊° + ν₋λ₋°
                </div>
                <div className="text-xs text-gray-300 mt-1">
                  where ν = stoichiometric coefficients
                </div>
              </div>
            </Html>
            
            {/* Example calculation */}
            <Html position={[0, -1.2, 0]}>
              <div className="bg-blue-900/60 p-2 rounded backdrop-blur-sm">
                <div className="text-xs text-cyan-300">
                  Example: Λₘ°(NaCl) = λ°(Na⁺) + λ°(Cl⁻)
                </div>
                <div className="text-xs text-white">
                  = 50.1 + 76.3 = 126.4 S·cm²/mol
                </div>
              </div>
            </Html>
          </group>
        </group>
      </Float>
    </SimulationLayout>
  );
}
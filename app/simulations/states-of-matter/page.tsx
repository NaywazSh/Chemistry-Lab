'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Text } from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

const AtomGrid = () => {
  const atoms = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (!atoms.current) return;
    
    // Cycle through states every 5 seconds
    const time = clock.getElapsedTime();
    const cycle = time % 15;
    let speed = 0;
    let range = 0;
    
    if (cycle < 5) { 
      // Solid
      speed = 10; range = 0.05; 
    } else if (cycle < 10) { 
      // Liquid
      speed = 2; range = 0.5; 
    } else { 
      // Gas
      speed = 5; range = 2.0; 
    }

    atoms.current.children.forEach((atom, i) => {
      const offset = i * 100;
      // Simple physics simulation based on state
      if(range < 0.1) {
          // Vibrate in place (Solid)
          atom.position.x = (i % 3 - 1) + Math.sin(time * speed + offset) * range;
          atom.position.y = (Math.floor(i / 3) % 3 - 1) + Math.cos(time * speed + offset) * range;
          atom.position.z = (Math.floor(i / 9) - 1) + Math.sin(time * speed + offset) * range;
      } else {
          // Move around (Liquid/Gas)
          atom.position.x = Math.sin(time * (speed * 0.1) + offset) * range;
          atom.position.y = Math.cos(time * (speed * 0.13) + offset) * range;
          atom.position.z = Math.sin(time * (speed * 0.17) + offset) * range;
      }
    });
  });

  return (
    <group ref={atoms}>
      {Array.from({ length: 27 }).map((_, i) => (
         <Sphere key={i} args={[0.2, 16, 16]} position={[(i%3-1), (Math.floor(i/3)%3-1), (Math.floor(i/9)-1)]}>
            <meshStandardMaterial color="#38bdf8" />
         </Sphere>
      ))}
    </group>
  );
}

export default function StatesPage() {
  return (
    <SimulationLayout
      title="States of Matter"
      description="Observing the particle arrangement and kinetic energy in three states. Watch as the system cycles from Solid (Vibrating Lattice) -> Liquid (Flowing) -> Gas (High Energy Chaos)."
    >
      <group>
        {/* Boundary Box */}
        <Box args={[4, 4, 4]}>
           <meshBasicMaterial color="white" wireframe opacity={0.2} transparent />
        </Box>
        <AtomGrid />
      </group>
    </SimulationLayout>
  );
}
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Sphere, Cylinder, Box, Html, Float, Text,
  Line, Ring, Billboard, Tube, Cone,
  Torus, Plane, Circle
} from '@react-three/drei';
import SimulationLayout from '@/components/SimulationLayout';
import * as THREE from 'three';

// --- Types ---
type PolymerType = 'pvc' | 'teflon' | 'nylon';
type ApplicationView = 'molecular' | 'application' | 'comparison';
type PropertyHighlight = 'strength' | 'flexibility' | 'chemical_resistance' | 'thermal';

// --- Color Scheme ---
const MATERIAL_COLORS = {
  pvc: {
    carbon: '#333333',
    hydrogen: '#FFFFFF',
    chlorine: '#34D399',
    bond: '#CCCCCC',
    polymer: '#10B981'
  },
  teflon: {
    carbon: '#333333',
    fluorine: '#FBBF24',
    bond: '#CCCCCC',
    polymer: '#F59E0B'
  },
  nylon: {
    carbon: '#333333',
    hydrogen: '#FFFFFF',
    oxygen: '#EF4444',
    nitrogen: '#3B82F6',
    bond: '#CCCCCC',
    polymer: '#8B5CF6'
  }
} as const;

// --- PVC: Polyvinyl Chloride ---

const PVCRepeatingUnit = ({ position = [0, 0, 0], scale = 1, animated = false }: { 
  position?: [number, number, number]; 
  scale?: number; 
  animated?: boolean 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current && animated) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.2;
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 1.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Carbon backbone */}
      <Sphere args={[0.25 * scale, 16, 16]} position={[-0.4 * scale, 0, 0]}>
        <meshStandardMaterial color={MATERIAL_COLORS.pvc.carbon} />
      </Sphere>
      <Sphere args={[0.25 * scale, 16, 16]} position={[0.4 * scale, 0, 0]}>
        <meshStandardMaterial color={MATERIAL_COLORS.pvc.carbon} />
      </Sphere>
      
      {/* Chlorine atom */}
      <Sphere args={[0.3 * scale, 16, 16]} position={[-0.4 * scale, 0.6 * scale, 0]}>
        <meshStandardMaterial color={MATERIAL_COLORS.pvc.chlorine} />
      </Sphere>
      
      {/* Hydrogen atoms */}
      <Sphere args={[0.15 * scale, 16, 16]} position={[-0.4 * scale, -0.6 * scale, 0]}>
        <meshStandardMaterial color={MATERIAL_COLORS.pvc.hydrogen} />
      </Sphere>
      <Sphere args={[0.15 * scale, 16, 16]} position={[0.4 * scale, 0.6 * scale, 0]}>
        <meshStandardMaterial color={MATERIAL_COLORS.pvc.hydrogen} />
      </Sphere>
      <Sphere args={[0.15 * scale, 16, 16]} position={[0.4 * scale, -0.6 * scale, 0]}>
        <meshStandardMaterial color={MATERIAL_COLORS.pvc.hydrogen} />
      </Sphere>
      
      {/* Bonds */}
      <Cylinder 
        args={[0.05 * scale, 0.05 * scale, 0.8 * scale]} 
        position={[0, 0, 0]} 
        rotation={[0, 0, Math.PI/2]}
      >
        <meshStandardMaterial color={MATERIAL_COLORS.pvc.bond} />
      </Cylinder>
      
      {/* C-Cl bond */}
      <Cylinder 
        args={[0.05 * scale, 0.05 * scale, 0.6 * scale]} 
        position={[-0.4 * scale, 0.3 * scale, 0]} 
        rotation={[0, 0, 0]}
      >
        <meshStandardMaterial color={MATERIAL_COLORS.pvc.bond} />
      </Cylinder>
      
      {/* Repeating unit indicator */}
      <Html position={[0, -1.2 * scale, 0]} center>
        <div className="bg-emerald-900/70 px-3 py-2 rounded-lg border border-emerald-500/50 backdrop-blur-sm">
          <div className="text-emerald-300 text-sm font-bold">[-CH₂-CHCl-]n</div>
          <div className="text-gray-300 text-xs">PVC Repeating Unit</div>
        </div>
      </Html>
      
      {/* Chlorine label */}
      <Html position={[-0.4 * scale, 0.9 * scale, 0]} center>
        <div className="bg-green-900/80 px-2 py-1 rounded text-xs text-green-300">Cl</div>
      </Html>
    </group>
  );
};

const PVCApplicationPipe = ({ position = [0, 0, 0], scale = 1, showCutaway = false }: {
  position?: [number, number, number];
  scale?: number;
  showCutaway?: boolean;
}) => {
  const pipeRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (pipeRef.current) {
      pipeRef.current.rotation.z = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group ref={pipeRef} position={position} scale={scale}>
      {/* Main pipe */}
      <Cylinder args={[1.5, 1.5, 8, 32]} rotation={[Math.PI/2, 0, 0]}>
        <meshStandardMaterial 
          color="#10B981" 
          roughness={0.4}
          metalness={0.2}
          opacity={showCutaway ? 0.7 : 1}
          transparent={showCutaway}
        />
      </Cylinder>
      
      {/* Inner diameter */}
      <Cylinder args={[1.2, 1.2, 8.1, 32]} rotation={[Math.PI/2, 0, 0]}>
        <meshStandardMaterial 
          color="#064E3B" 
          side={THREE.BackSide}
          opacity={0.8}
          transparent
        />
      </Cylinder>
      
      {/* Cutaway view showing molecular alignment */}
      {showCutaway && (
        <>
          <group position={[0, 0, 0]}>
            {Array.from({ length: 20 }).map((_, i) => (
              <Cylinder 
                key={i}
                args={[0.02, 0.02, 6, 8]} 
                position={[
                  Math.cos(i * 0.3) * 0.8,
                  Math.sin(i * 0.3) * 0.8,
                  0
                ]}
                rotation={[Math.PI/2, 0, 0]}
              >
                <meshStandardMaterial 
                  color="#34D399" 
                  emissive="#34D399"
                  emissiveIntensity={0.5}
                />
              </Cylinder>
            ))}
          </group>
          
          {/* Cross-section view */}
          <group position={[2.5, 0, 0]}>
            <Ring args={[1, 1.5, 32]} rotation={[0, Math.PI/2, 0]}>
              <meshStandardMaterial 
                color="#10B981" 
                side={THREE.DoubleSide}
                opacity={0.6}
                transparent
              />
            </Ring>
            
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const radius = 1.25;
              return (
                <Cylinder 
                  key={i}
                  args={[0.03, 0.03, 0.4, 8]} 
                  position={[
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius,
                    0
                  ]}
                  rotation={[0, 0, angle]}
                >
                  <meshStandardMaterial color="#34D399" />
                </Cylinder>
              );
            })}
          </group>
        </>
      )}
      
      {/* Pipe fittings */}
      <group position={[0, -4.5, 0]}>
        <Cylinder args={[0.6, 0.6, 1, 32]} rotation={[Math.PI/2, 0, 0]}>
          <meshStandardMaterial color="#047857" roughness={0.3} metalness={0.3} />
        </Cylinder>
      </group>
      
      {/* Water flow visualization */}
      {!showCutaway && (
        <group>
          {Array.from({ length: 3 }).map((_, i) => (
            <Sphere 
              key={i}
              args={[0.2, 16, 16]} 
              position={[0, Math.sin(Date.now() * 0.002 + i) * 2, 0]}
            >
              <meshStandardMaterial 
                color="#3B82F6" 
                opacity={0.7}
                transparent
              />
            </Sphere>
          ))}
        </group>
      )}
      
      {/* Application label */}
      <Html position={[0, 5, 0]} center>
        <div className="bg-gradient-to-r from-emerald-900/80 to-green-900/80 p-4 rounded-xl border border-emerald-500/50 backdrop-blur-md">
          <div className="text-emerald-300 text-lg font-bold mb-2">PVC Pipes</div>
          <div className="text-gray-300 text-sm max-w-xs">
            Chlorine atoms provide chemical resistance and rigidity. 
            Perfect for plumbing, drainage, and electrical conduit.
          </div>
        </div>
      </Html>
    </group>
  );
};

// --- TEFLON: Polytetrafluoroethylene ---

const TeflonRepeatingUnit = ({ position = [0, 0, 0], scale = 1, animated = false }: {
  position?: [number, number, number];
  scale?: number;
  animated?: boolean;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current && animated) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.3;
      groupRef.current.position.x = Math.sin(clock.getElapsedTime() * 2) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Carbon backbone */}
      <Sphere args={[0.25 * scale, 16, 16]} position={[-0.5 * scale, 0, 0]}>
        <meshStandardMaterial color={MATERIAL_COLORS.teflon.carbon} />
      </Sphere>
      <Sphere args={[0.25 * scale, 16, 16]} position={[0.5 * scale, 0, 0]}>
        <meshStandardMaterial color={MATERIAL_COLORS.teflon.carbon} />
      </Sphere>
      
      {/* Fluorine atoms */}
      {[
        [-0.5 * scale, 0.6 * scale, 0.6 * scale],
        [-0.5 * scale, -0.6 * scale, 0.6 * scale],
        [-0.5 * scale, 0.6 * scale, -0.6 * scale],
        [-0.5 * scale, -0.6 * scale, -0.6 * scale],
        [0.5 * scale, 0.6 * scale, 0.6 * scale],
        [0.5 * scale, -0.6 * scale, 0.6 * scale],
        [0.5 * scale, 0.6 * scale, -0.6 * scale],
        [0.5 * scale, -0.6 * scale, -0.6 * scale]
      ].map((pos, i) => (
        <Sphere key={i} args={[0.2 * scale, 16, 16]} position={pos as [number, number, number]}>
          <meshStandardMaterial color={MATERIAL_COLORS.teflon.fluorine} />
        </Sphere>
      ))}
      
      {/* Carbon-carbon bond */}
      <Cylinder 
        args={[0.05 * scale, 0.05 * scale, 1 * scale]} 
        position={[0, 0, 0]} 
        rotation={[0, 0, Math.PI/2]}
      >
        <meshStandardMaterial color={MATERIAL_COLORS.teflon.bond} />
      </Cylinder>
      
      {/* C-F bonds */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        const xOffset = Math.cos(angle) * 0.6;
        const zOffset = Math.sin(angle) * 0.6;
        return (
          <group key={i}>
            <Cylinder 
              args={[0.04 * scale, 0.04 * scale, 0.6 * scale]} 
              position={[-0.5 * scale + xOffset/2, 0, zOffset/2]} 
              rotation={[0, -angle, 0]}
            >
              <meshStandardMaterial color={MATERIAL_COLORS.teflon.bond} />
            </Cylinder>
            <Cylinder 
              args={[0.04 * scale, 0.04 * scale, 0.6 * scale]} 
              position={[0.5 * scale + xOffset/2, 0, zOffset/2]} 
              rotation={[0, -angle, 0]}
            >
              <meshStandardMaterial color={MATERIAL_COLORS.teflon.bond} />
            </Cylinder>
          </group>
        );
      })}
      
      {/* Repeating unit indicator */}
      <Html position={[0, -1.5 * scale, 0]} center>
        <div className="bg-amber-900/70 px-3 py-2 rounded-lg border border-amber-500/50 backdrop-blur-sm">
          <div className="text-amber-300 text-sm font-bold">[-CF₂-CF₂-]n</div>
          <div className="text-gray-300 text-xs">Teflon (PTFE) Repeating Unit</div>
        </div>
      </Html>
      
      <Html position={[1.5 * scale, 0.5 * scale, 0]} center>
        <div className="bg-amber-900/60 px-2 py-1 rounded text-xs text-amber-300">
          F atoms create<br/>non-stick surface
        </div>
      </Html>
    </group>
  );
};

const TeflonCoatingApplication = ({ position = [0, 0, 0], scale = 1, showLayers = false }: {
  position?: [number, number, number];
  scale?: number;
  showLayers?: boolean;
}) => {
  const panRef = useRef<THREE.Group>(null);
  const [cooking, setCooking] = useState(false);
  
  useFrame(({ clock }) => {
    if (panRef.current && cooking) {
      panRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5) * 0.05;
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCooking(prev => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <group ref={panRef} position={position} scale={scale}>
      <group>
        <Cylinder args={[2, 1.8, 0.3, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#4B5563" roughness={0.4} metalness={0.7} />
        </Cylinder>
        
        <Cylinder args={[1.78, 1.6, 0.1, 32]} position={[0, 0.15, 0]}>
          <meshStandardMaterial 
            color="#F59E0B" 
            roughness={0.1}
            metalness={0.3}
            opacity={0.9}
            transparent
          />
        </Cylinder>
        
        <Cylinder args={[0.1, 0.1, 3, 16]} position={[2.5, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <meshStandardMaterial color="#6B7280" roughness={0.6} />
        </Cylinder>
      </group>
      
      <group position={[0, 0.4, 0]}>
        <Sphere args={[0.8, 32, 32]}>
          <meshStandardMaterial color="#DC2626" />
        </Sphere>
        {cooking && (
          <Plane args={[1.6, 1.6]} rotation={[-Math.PI/2, 0, 0]} position={[0, 0.8, 0]}>
            <meshStandardMaterial 
              color="#FFFFFF" 
              opacity={0.8}
              transparent
            />
          </Plane>
        )}
      </group>
      
      <group position={[0, 0.2, 0]}>
        {cooking && (
          <group>
            <Sphere 
              args={[0.8, 32, 32]} 
              position={[Math.sin(Date.now() * 0.003) * 1.5, 0.2, 0]}
            >
              <meshStandardMaterial color="#DC2626" />
            </Sphere>
            <Html position={[2, 1, 0]}>
              <div className="text-green-400 text-sm font-bold animate-pulse">Slides easily!</div>
            </Html>
          </group>
        )}
      </group>
      
      {showLayers && (
        <group position={[3, 0, 0]}>
          <Box args={[2, 0.1, 2]} position={[0, -0.3, 0]}>
            <meshStandardMaterial color="#6B7280" />
          </Box>
          
          {Array.from({ length: 50 }).map((_, i) => {
            const row = Math.floor(i / 10);
            const col = i % 10;
            return (
              <Sphere 
                key={i}
                args={[0.08, 16, 16]} 
                position={[
                  (col - 4.5) * 0.2,
                  0.1 + Math.sin(row * 0.5) * 0.05,
                  (row - 2.5) * 0.2
                ]}
              >
                <meshStandardMaterial color={MATERIAL_COLORS.teflon.fluorine} />
              </Sphere>
            );
          })}
          
          <Html position={[0, 0.8, 0]} center>
            <div className="bg-amber-900/60 px-2 py-1 rounded text-xs text-amber-300">
              Fluorine surface layer
            </div>
          </Html>
        </group>
      )}
      
      <Html position={[0, -2, 0]} center>
        <div className="bg-gradient-to-r from-amber-900/80 to-yellow-900/80 p-4 rounded-xl border border-amber-500/50 backdrop-blur-md">
          <div className="text-amber-300 text-lg font-bold mb-2">Teflon Coatings</div>
          <div className="text-gray-300 text-sm max-w-xs">
            Strong C-F bonds create an inert, non-stick surface. 
            Used in cookware, chemical equipment, and waterproof fabrics.
          </div>
        </div>
      </Html>
    </group>
  );
};

// --- NYLON: Polyamide Fibers ---

const NylonRepeatingUnit = ({ position = [0, 0, 0], scale = 1, animated = false }: {
  position?: [number, number, number];
  scale?: number;
  animated?: boolean;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current && animated) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.25;
      groupRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 2) * 0.05);
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <group>
        <Sphere args={[0.25 * scale, 16, 16]} position={[0, 0, 0]}>
          <meshStandardMaterial color={MATERIAL_COLORS.nylon.carbon} />
        </Sphere>
        
        <Sphere args={[0.22 * scale, 16, 16]} position={[0.6 * scale, 0, 0]}>
          <meshStandardMaterial color={MATERIAL_COLORS.nylon.oxygen} />
        </Sphere>
        
        <Sphere args={[0.22 * scale, 16, 16]} position={[-0.6 * scale, 0, 0]}>
          <meshStandardMaterial color={MATERIAL_COLORS.nylon.nitrogen} />
        </Sphere>
        
        <Sphere args={[0.15 * scale, 16, 16]} position={[-0.9 * scale, 0.4 * scale, 0]}>
          <meshStandardMaterial color={MATERIAL_COLORS.nylon.hydrogen} />
        </Sphere>
        
        <Cylinder 
          args={[0.05 * scale, 0.05 * scale, 0.6 * scale]} 
          position={[0.3 * scale, 0, 0]} 
          rotation={[0, 0, Math.PI/2]}
        >
          <meshStandardMaterial color={MATERIAL_COLORS.nylon.bond} />
        </Cylinder>
        
        <Cylinder 
          args={[0.05 * scale, 0.05 * scale, 0.6 * scale]} 
          position={[-0.3 * scale, 0, 0]} 
          rotation={[0, 0, Math.PI/2]}
        >
          <meshStandardMaterial color={MATERIAL_COLORS.nylon.bond} />
        </Cylinder>
        
        <Cylinder 
          args={[0.04 * scale, 0.04 * scale, 0.4 * scale]} 
          position={[-0.75 * scale, 0.2 * scale, 0]} 
          rotation={[0, 0, Math.PI/4]}
        >
          <meshStandardMaterial color={MATERIAL_COLORS.nylon.bond} />
        </Cylinder>
        
        <Cylinder 
          args={[0.04 * scale, 0.04 * scale, 0.5 * scale]} 
          position={[0.3 * scale, 0.15 * scale, 0]} 
          rotation={[0, 0, Math.PI/2]}
        >
          <meshStandardMaterial color={MATERIAL_COLORS.nylon.oxygen} />
        </Cylinder>
      </group>
      
      <group position={[1.2 * scale, 0, 0]}>
        <Sphere args={[0.2 * scale, 16, 16]} position={[0.4 * scale, 0, 0]}>
          <meshStandardMaterial color={MATERIAL_COLORS.nylon.carbon} />
        </Sphere>
        <Cylinder 
          args={[0.05 * scale, 0.05 * scale, 0.4 * scale]} 
          position={[0.2 * scale, 0, 0]} 
          rotation={[0, 0, Math.PI/2]}
        >
          <meshStandardMaterial color={MATERIAL_COLORS.nylon.bond} />
        </Cylinder>
      </group>
      
      <group position={[-1.2 * scale, 0, 0]}>
        <Sphere args={[0.2 * scale, 16, 16]} position={[-0.4 * scale, 0, 0]}>
          <meshStandardMaterial color={MATERIAL_COLORS.nylon.carbon} />
        </Sphere>
        <Cylinder 
          args={[0.05 * scale, 0.05 * scale, 0.4 * scale]} 
          position={[-0.2 * scale, 0, 0]} 
          rotation={[0, 0, Math.PI/2]}
        >
          <meshStandardMaterial color={MATERIAL_COLORS.nylon.bond} />
        </Cylinder>
      </group>
      
      <Html position={[0, -1.2 * scale, 0]} center>
        <div className="bg-purple-900/70 px-3 py-2 rounded-lg border border-purple-500/50 backdrop-blur-sm">
          <div className="text-purple-300 text-sm font-bold">[-NH-(CH₂)₆-NH-CO-(CH₂)₄-CO-]n</div>
          <div className="text-gray-300 text-xs">Nylon-6,6 Repeating Unit</div>
        </div>
      </Html>
      
      <group position={[0, 0.8 * scale, 0]}>
        <Line
          points={[[-0.8, 0, 0], [0.8, 0, 0]]}
          color="#3B82F6"
          lineWidth={2}
          dashed
          dashSize={0.1}
          gapSize={0.05}
        />
        <Html position={[0, 0.3, 0]} center>
          <div className="bg-blue-900/60 px-2 py-1 rounded text-xs text-blue-300">
            H-bonding sites
          </div>
        </Html>
      </group>
    </group>
  );
};

const NylonFiberApplication = ({ position = [0, 0, 0], scale = 1, showHydrogenBonds = false }: {
  position?: [number, number, number];
  scale?: number;
  showHydrogenBonds?: boolean;
}) => {
  const fiberRef = useRef<THREE.Group>(null);
  const [strengthTest, setStrengthTest] = useState(false);
  
  useFrame(({ clock }) => {
    if (fiberRef.current) {
      fiberRef.current.rotation.x = clock.getElapsedTime() * 0.05;
      
      if (strengthTest) {
        fiberRef.current.scale.y = 1 + Math.sin(clock.getElapsedTime() * 5) * 0.2;
      }
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStrengthTest(prev => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <group ref={fiberRef} position={position} scale={scale}>
      <group>
        {Array.from({ length: 7 }).map((_, i) => {
          const angle = (i / 7) * Math.PI * 2;
          const radius = 0.8;
          return (
            <Cylinder 
              key={i}
              args={[0.1, 0.1, 10, 16]} 
              position={[
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
              ]}
            >
              <meshStandardMaterial 
                color={i % 2 === 0 ? "#7C3AED" : "#8B5CF6"} 
                roughness={0.2}
                metalness={0.1}
              />
            </Cylinder>
          );
        })}
      </group>
      
      <group position={[3, 0, 0]}>
        <Cylinder args={[0.3, 0.3, 4, 32]}>
          <meshStandardMaterial 
            color="#8B5CF6" 
            opacity={0.7}
            transparent
          />
        </Cylinder>
        
        {showHydrogenBonds && (
          <group>
            {Array.from({ length: 20 }).map((_, i) => {
              const yPos = (i - 10) * 0.2;
              return (
                <group key={i} position={[0, yPos, 0]}>
                  <Cylinder 
                    args={[0.02, 0.02, 1.5, 8]} 
                    rotation={[0, 0, i % 2 === 0 ? Math.PI/4 : -Math.PI/4]}
                  >
                    <meshStandardMaterial color="#A78BFA" />
                  </Cylinder>
                  
                  {i < 19 && (
                    <Line
                      points={[[0.3, 0, 0], [0.3, 0.4, 0]]}
                      color="#3B82F6"
                      lineWidth={1}
                      transparent
                    >
                      <meshStandardMaterial 
                        opacity={0.5}
                        transparent
                      />
                    </Line>
                  )}
                </group>
              );
            })}
            
            <Html position={[0, 2.5, 0]} center>
              <div className="bg-blue-900/60 px-2 py-1 rounded text-xs text-blue-300">
                Hydrogen bonding<br/>between chains
              </div>
            </Html>
          </group>
        )}
      </group>
      
      {strengthTest && (
        <group position={[0, -5, 0]}>
          <Box args={[1, 1, 1]} position={[0, -0.5, 0]}>
            <meshStandardMaterial color="#DC2626" />
          </Box>
          
          <Cylinder args={[0.05, 0.05, 5, 8]} position={[0, 2, 0]}>
            <meshStandardMaterial 
              color="#8B5CF6" 
              emissive="#8B5CF6"
              emissiveIntensity={0.5}
            />
          </Cylinder>
          
          <Html position={[1.5, 0, 0]}>
            <div className="text-red-400 text-sm font-bold animate-pulse">High Strength!</div>
          </Html>
        </group>
      )}
      
      <group position={[-3, 0, 0]} rotation={[0, 0, Math.PI/4]}>
        {Array.from({ length: 5 }).map((_, i) => (
          <group key={i}>
            <Cylinder 
              args={[0.05, 0.05, 3, 8]} 
              position={[(i - 2) * 0.3, 0, 0]}
            >
              <meshStandardMaterial color="#7C3AED" />
            </Cylinder>
            
            <Cylinder 
              args={[0.05, 0.05, 3, 8]} 
              position={[0, (i - 2) * 0.3, 0]}
              rotation={[0, 0, Math.PI/2]}
            >
              <meshStandardMaterial color="#8B5CF6" />
            </Cylinder>
          </group>
        ))}
        
        <Html position={[0, 2, 0]} center>
          <div className="bg-purple-900/60 px-2 py-1 rounded text-xs text-purple-300">
            Woven fabric
          </div>
        </Html>
      </group>
      
      <Html position={[0, 5, 0]} center>
        <div className="bg-gradient-to-r from-purple-900/80 to-violet-900/80 p-4 rounded-xl border border-purple-500/50 backdrop-blur-md">
          <div className="text-purple-300 text-lg font-bold mb-2">Nylon Fibers</div>
          <div className="text-gray-300 text-sm max-w-xs">
            Hydrogen bonding between chains provides exceptional strength. 
            Used in textiles, ropes, carpets, and industrial fabrics.
          </div>
        </div>
      </Html>
    </group>
  );
};

// --- Polymer Data Interface ---
interface PolymerInfo {
  name: string;
  formula: string;
  keyProperties: string[];
  applications: string[];
  color: string;
  molecularWeight: string;
  discovery: string;
}

// --- MAIN COMPONENT ---
export default function PolymerApplicationsPage() {
  const [selectedPolymer, setSelectedPolymer] = useState<PolymerType>('pvc');
  const [viewMode, setViewMode] = useState<ApplicationView>('application');
  const [highlightedProperty, setHighlightedProperty] = useState<PropertyHighlight | null>(null);
  const [showDetails, setShowDetails] = useState(true);

  const polymerData: Record<PolymerType, PolymerInfo> = {
    pvc: {
      name: 'Polyvinyl Chloride (PVC)',
      formula: '[-CH₂-CHCl-]n',
      keyProperties: ['Rigid', 'Chemical Resistant', 'Flame Retardant'],
      applications: ['Pipes', 'Electrical Insulation', 'Window Frames', 'Medical Tubing'],
      color: '#10B981',
      molecularWeight: '56,000-110,000 g/mol',
      discovery: '1913 by Fritz Klatte'
    },
    teflon: {
      name: 'Polytetrafluoroethylene (Teflon)',
      formula: '[-CF₂-CF₂-]n',
      keyProperties: ['Non-stick', 'Chemically Inert', 'Heat Resistant'],
      applications: ['Cookware', 'Chemical Equipment', 'Waterproof Fabrics', 'Electrical Insulation'],
      color: '#F59E0B',
      molecularWeight: '100,000-10,000,000 g/mol',
      discovery: '1938 by Roy Plunkett'
    },
    nylon: {
      name: 'Nylon (Polyamide)',
      formula: '[-NH-(CH₂)₆-NH-CO-(CH₂)₄-CO-]n',
      keyProperties: ['High Strength', 'Elastic', 'Abrasion Resistant'],
      applications: ['Textiles', 'Ropes', 'Carpets', 'Parachutes', 'Tires'],
      color: '#8B5CF6',
      molecularWeight: '12,000-20,000 g/mol',
      discovery: '1935 by Wallace Carothers'
    }
  };

  const propertyData = [
    { id: 'strength' as PropertyHighlight, label: 'Strength', color: '#EF4444' },
    { id: 'flexibility' as PropertyHighlight, label: 'Flexibility', color: '#3B82F6' },
    { id: 'chemical_resistance' as PropertyHighlight, label: 'Chemical Resistance', color: '#10B981' },
    { id: 'thermal' as PropertyHighlight, label: 'Thermal', color: '#F59E0B' }
  ];

  return (
    <SimulationLayout
      title="Polymer Applications - Industrial Uses"
      description="Explore how specific polymer structures determine their industrial applications. From PVC pipes to Teflon coatings and Nylon fibers, understand structure-property relationships."
    >
      <Float speed={0.5} rotationIntensity={0.2} floatIntensity={0.2}>
        <group position={[0, 0, 0]}>
          
          {/* Dynamic Polymer Display */}
          {selectedPolymer === 'pvc' && viewMode === 'molecular' && (
            <PVCRepeatingUnit position={[0, 0, 0]} scale={1.5} animated={true} />
          )}
          
          {selectedPolymer === 'pvc' && viewMode === 'application' && (
            <PVCApplicationPipe position={[0, 0, 0]} scale={0.8} showCutaway={highlightedProperty === 'strength'} />
          )}
          
          {selectedPolymer === 'teflon' && viewMode === 'molecular' && (
            <TeflonRepeatingUnit position={[0, 0, 0]} scale={1.2} animated={true} />
          )}
          
          {selectedPolymer === 'teflon' && viewMode === 'application' && (
            <TeflonCoatingApplication position={[0, 0, 0]} scale={0.7} showLayers={highlightedProperty === 'chemical_resistance'} />
          )}
          
          {selectedPolymer === 'nylon' && viewMode === 'molecular' && (
            <NylonRepeatingUnit position={[0, 0, 0]} scale={1.3} animated={true} />
          )}
          
          {selectedPolymer === 'nylon' && viewMode === 'application' && (
            <NylonFiberApplication position={[0, 0, 0]} scale={0.6} showHydrogenBonds={highlightedProperty === 'strength'} />
          )}
          
          {/* Comparison View */}
          {viewMode === 'comparison' && (
            <group>
              <group position={[-4, 0, 0]}>
                <PVCRepeatingUnit position={[0, 2, 0]} scale={0.8} animated={true} />
                <Cylinder args={[0.4, 0.4, 3, 16]} rotation={[Math.PI/2, 0, 0]}>
                  <meshStandardMaterial color="#10B981" />
                </Cylinder>
                <Html position={[0, -2, 0]} center>
                  <div className="bg-emerald-900/70 px-2 py-1 rounded text-xs text-emerald-300">PVC</div>
                </Html>
              </group>
              
              <group position={[0, 0, 0]}>
                <TeflonRepeatingUnit position={[0, 2, 0]} scale={0.7} animated={true} />
                <Cylinder args={[0.8, 0.7, 0.2, 32]}>
                  <meshStandardMaterial color="#F59E0B" />
                </Cylinder>
                <Html position={[0, -2, 0]} center>
                  <div className="bg-amber-900/70 px-2 py-1 rounded text-xs text-amber-300">Teflon</div>
                </Html>
              </group>
              
              <group position={[4, 0, 0]}>
                <NylonRepeatingUnit position={[0, 2, 0]} scale={0.7} animated={true} />
                <Cylinder args={[0.1, 0.1, 4, 16]} rotation={[0, 0, Math.PI/4]}>
                  <meshStandardMaterial color="#8B5CF6" />
                </Cylinder>
                <Html position={[0, -2, 0]} center>
                  <div className="bg-purple-900/70 px-2 py-1 rounded text-xs text-purple-300">Nylon</div>
                </Html>
              </group>
            </group>
          )}

          {/* Control Panel */}
          <Html position={[0, -4, 0]} center>
            <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700 p-4 shadow-2xl w-[500px]">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <h3 className="text-white text-sm font-bold mb-2 uppercase tracking-wider">Polymer</h3>
                  <div className="space-y-2">
                    {Object.entries(polymerData).map(([key, data]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedPolymer(key as PolymerType)}
                        className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedPolymer === key
                            ? 'ring-2 ring-offset-1 ring-offset-black text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                        style={selectedPolymer === key ? { backgroundColor: data.color } : {}}
                      >
                        {data.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-white text-sm font-bold mb-2 uppercase tracking-wider">View</h3>
                  <div className="space-y-2">
                    {(['molecular', 'application', 'comparison'] as ApplicationView[]).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                          viewMode === mode
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-white text-sm font-bold mb-2 uppercase tracking-wider">Properties</h3>
                  <div className="space-y-2">
                    {propertyData.map(prop => (
                      <button
                        key={prop.id}
                        onClick={() => setHighlightedProperty(
                          highlightedProperty === prop.id ? null : prop.id
                        )}
                        className={`w-full py-1.5 rounded-lg text-xs font-medium transition-all ${
                          highlightedProperty === prop.id
                            ? 'ring-2 ring-offset-1 ring-offset-black text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                        style={highlightedProperty === prop.id ? { backgroundColor: prop.color } : {}}
                      >
                        {prop.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {showDetails && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white text-sm font-bold uppercase tracking-wider">
                      {polymerData[selectedPolymer].name}
                    </h3>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="text-slate-500 hover:text-white text-xs"
                    >
                      Hide
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-slate-400 mb-1">Formula</div>
                      <div className="text-white font-mono">{polymerData[selectedPolymer].formula}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-1">Molecular Weight</div>
                      <div className="text-white">{polymerData[selectedPolymer].molecularWeight}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-slate-400 mb-1">Key Properties</div>
                      <div className="flex flex-wrap gap-1">
                        {polymerData[selectedPolymer].keyProperties.map(prop => (
                          <span 
                            key={prop}
                            className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs"
                          >
                            {prop}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-slate-400 mb-1">Applications</div>
                      <div className="flex flex-wrap gap-1">
                        {polymerData[selectedPolymer].applications.map(app => (
                          <span 
                            key={app}
                            className="px-2 py-1 rounded bg-slate-800/50 text-slate-300 text-xs"
                          >
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {!showDetails && (
                <button
                  onClick={() => setShowDetails(true)}
                  className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-sm transition-colors"
                >
                  Show Details
                </button>
              )}
            </div>
          </Html>

          {/* Educational Insights */}
          <Html position={[5, 2, 0]}>
            <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 p-4 rounded-xl border border-blue-500/30 backdrop-blur-md w-64">
              <h4 className="text-white font-bold text-sm mb-2">Structure-Property Relationship</h4>
              <ul className="text-slate-300 text-xs space-y-2">
                {selectedPolymer === 'pvc' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span><strong>Chlorine atoms</strong> make PVC rigid and flame resistant</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span><strong>C-Cl bonds</strong> resist chemical attack and weathering</span>
                    </li>
                  </>
                )}
                {selectedPolymer === 'teflon' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span><strong>Fluorine sheath</strong> creates extremely low surface energy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span><strong>C-F bonds</strong> are very strong and thermally stable</span>
                    </li>
                  </>
                )}
                {selectedPolymer === 'nylon' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">•</span>
                      <span><strong>Hydrogen bonding</strong> between chains provides strength</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">•</span>
                      <span><strong>Amide groups</strong> allow alignment and crystallization</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </Html>

          {/* Progress Indicator */}
          <Html position={[0, 4, 0]} center>
            <div className="flex items-center gap-4 bg-black/60 px-6 py-3 rounded-full backdrop-blur-md border border-slate-700">
              <div className="text-slate-300 text-sm">Exploring:</div>
              <div className="flex gap-2">
                {Object.keys(polymerData).map((polymer) => (
                  <div 
                    key={polymer}
                    className={`w-3 h-3 rounded-full transition-all ${
                      selectedPolymer === polymer 
                        ? 'scale-125 ring-2 ring-offset-1 ring-offset-black'
                        : 'opacity-50'
                    }`}
                    style={{ 
                      backgroundColor: selectedPolymer === polymer 
                        ? polymerData[polymer as PolymerType].color
                        : '#4B5563'
                    }}
                  />
                ))}
              </div>
              <div className="text-xs text-slate-400">
                {polymerData[selectedPolymer].name.split(' ')[0]}
              </div>
            </div>
          </Html>

          {/* Real-World Scale Indicator */}
          <group position={[-6, -1, 0]}>
            <Box args={[5, 0.1, 0.1]} position={[2.5, 0, 0]}>
              <meshStandardMaterial color="#FFFFFF" />
            </Box>
            
            {[0, 1, 2, 3, 4, 5].map(i => (
              <Box key={i} args={[0.05, 0.2, 0.1]} position={[i, 0, 0]}>
                <meshStandardMaterial color="#FFFFFF" />
              </Box>
            ))}
            
            <Html position={[0, 0.4, 0]} center>
              <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">Molecular</div>
            </Html>
            <Html position={[5, 0.4, 0]} center>
              <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">Macroscopic</div>
            </Html>
            
            <Html position={[2.5, -0.4, 0]} center>
              <div className="text-slate-400 text-xs">Scale</div>
            </Html>
          </group>
        </group>
      </Float>
    </SimulationLayout>
  );
}
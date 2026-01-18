'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Info } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';

interface SimulationLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode; // This is where your 3D content goes
  cameraPosition?: [number, number, number];
}

export default function SimulationLayout({
  title,
  description,
  children,
  cameraPosition = [0, 0, 5],
}: SimulationLayoutProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col md:flex-row">
      
      {/* Sidebar / Overlay */}
      <div className="z-10 absolute md:relative top-0 left-0 p-6 w-full md:w-80 bg-slate-900/80 backdrop-blur-md border-b md:border-r border-slate-700 flex flex-col gap-4">
        <Link href="/" className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors gap-2 text-sm font-bold uppercase tracking-widest">
          <ArrowLeft size={16} /> Back to Lab
        </Link>
        
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-slate-300 text-sm leading-relaxed">{description}</p>
        </div>

        <div className="mt-auto p-4 bg-cyan-900/20 border border-cyan-800 rounded-lg flex gap-3 items-start">
          <Info className="text-cyan-400 shrink-0 mt-1" size={20} />
          <span className="text-xs text-cyan-100">
            Use your mouse to rotate (Left Click), zoom (Scroll), and pan (Right Click) the 3D model.
          </span>
        </div>
      </div>

      {/* 3D Canvas Area */}
      <div className="flex-1 relative bg-gradient-to-br from-slate-900 via-slate-800 to-black">
        <Canvas camera={{ position: cameraPosition, fov: 50 }} shadows>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <Environment preset="city" />
          
          <group position={[0, -0.5, 0]}>
            {children}
          </group>
          
          <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
          <OrbitControls makeDefault />
        </Canvas>
      </div>
    </div>
  );
}
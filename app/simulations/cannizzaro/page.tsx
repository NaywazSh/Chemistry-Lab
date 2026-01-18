'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Play, Pause, Info, ArrowLeft, FlaskRound } from 'lucide-react';

// --- TypeScript Definitions ---
type Point3D = { x: number; y: number; z: number };

// This tells TS: "This object can have any string key (like 'ring0', 'carbonyl') pointing to a Point3D"
type MoleculePositions = {
  [key: string]: Point3D;
};

type Scene = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  rotation: number;
  autoRotate: boolean;
};

export default function CannizzaroPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [showInfo, setShowInfo] = useState(true);
  const animationRef = useRef<number>(0);
  const sceneRef = useRef<Scene | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle Resize
    const resizeCanvas = () => {
      // Set to actual display size to avoid blur
      const { width, height } = canvas.getBoundingClientRect();
      // Handle high-DPI displays
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize Scene
    const scene: Scene = {
      canvas,
      ctx,
      width: canvas.width / (window.devicePixelRatio || 1),
      height: canvas.height / (window.devicePixelRatio || 1),
      rotation: 0,
      autoRotate: isPlaying 
    };
    sceneRef.current = scene;

    // --- Helper Functions ---

    const shadeColor = (color: string, percent: number) => {
      const num = parseInt(color.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) + amt;
      const G = (num >> 8 & 0x00FF) + amt;
      const B = (num & 0x0000FF) + amt;
      return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16).slice(1);
    };

    const drawAtom = (ctx: CanvasRenderingContext2D, x: number, y: number, z: number, color: string, label: string, size = 20) => {
      const scale = 1 / (1 + z * 0.001);
      const screenX = x * scale;
      const screenY = y * scale;
      const radius = size * scale;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 10 * scale;
      ctx.shadowOffsetX = 3 * scale;
      ctx.shadowOffsetY = 3 * scale;

      const atomGradient = ctx.createRadialGradient(
        screenX - radius * 0.3, screenY - radius * 0.3, 0,
        screenX, screenY, radius
      );
      atomGradient.addColorStop(0, color);
      atomGradient.addColorStop(1, shadeColor(color, -30));
      
      ctx.fillStyle = atomGradient;
      ctx.beginPath();
      ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowColor = 'transparent';

      ctx.fillStyle = '#fff';
      ctx.font = `bold ${14 * scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, screenX, screenY);
    };

    const drawBond = (ctx: CanvasRenderingContext2D, x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, type = 'single') => {
      const scale1 = 1 / (1 + z1 * 0.001);
      const scale2 = 1 / (1 + z2 * 0.001); // Unused scale2 removed logic simplified for brevity if needed
      
      const sx1 = x1 * scale1;
      const sy1 = y1 * scale1;
      const sx2 = x2 * (1 / (1 + z2 * 0.001));
      const sy2 = y2 * (1 / (1 + z2 * 0.001));

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3 * scale1;
      
      if (type === 'double') {
        const dx = sx2 - sx1;
        const dy = sy2 - sy1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const offsetX = -dy / len * 4;
        const offsetY = dx / len * 4;

        ctx.beginPath();
        ctx.moveTo(sx1 + offsetX, sy1 + offsetY);
        ctx.lineTo(sx2 + offsetX, sy2 + offsetY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(sx1 - offsetX, sy1 - offsetY);
        ctx.lineTo(sx2 - offsetX, sy2 - offsetY);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(sx1, sy1);
        ctx.lineTo(sx2, sy2);
        ctx.stroke();
      }
    };

    const rotate3D = (x: number, y: number, z: number, angleX: number, angleY: number): Point3D => {
      const x1 = x * Math.cos(angleY) - z * Math.sin(angleY);
      const z1 = x * Math.sin(angleY) + z * Math.cos(angleY);
      const y1 = y * Math.cos(angleX) - z1 * Math.sin(angleX);
      const z2 = y * Math.sin(angleX) + z1 * Math.cos(angleX);
      return { x: x1, y: y1, z: z2 };
    };

    const getBenzaldehydePositions = (offsetX: number, offsetY: number, offsetZ: number, rot: number): MoleculePositions => {
      const positions: MoleculePositions = {};
      
      // Benzene ring
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = Math.cos(angle) * 50 + offsetX;
        const y = Math.sin(angle) * 50 + offsetY;
        const pos = rotate3D(x, y, offsetZ, 0, rot);
        positions[`ring${i}`] = pos;
      }
      
      // Aldehyde group
      positions.carbonyl = rotate3D(offsetX, -80 + offsetY, offsetZ, 0, rot);
      positions.carbonylO = rotate3D(offsetX, -110 + offsetY, offsetZ, 0, rot);
      positions.carbonylH = rotate3D(offsetX + 25, -80 + offsetY, offsetZ, 0, rot);
      
      return positions;
    };

    const drawBenzaldehyde = (ctx: CanvasRenderingContext2D, cx: number, cy: number, pos: MoleculePositions, showOH = false) => {
      // Draw Ring Bonds
      for (let i = 0; i < 6; i++) {
        const curr = pos[`ring${i}`];
        const next = pos[`ring${(i + 1) % 6}`];
        drawBond(ctx, cx + curr.x, cy + curr.y, curr.z, cx + next.x, cy + next.y, next.z);
      }
      // Draw Ring Atoms
      for (let i = 0; i < 6; i++) {
        const p = pos[`ring${i}`];
        drawAtom(ctx, cx + p.x, cy + p.y, p.z, '#818cf8', 'C', 15);
      }

      // Draw Aldehyde Group Bonds
      drawBond(ctx, cx + pos.ring0.x, cy + pos.ring0.y, pos.ring0.z, cx + pos.carbonyl.x, cy + pos.carbonyl.y, pos.carbonyl.z);
      drawBond(ctx, cx + pos.carbonyl.x, cy + pos.carbonyl.y, pos.carbonyl.z, cx + pos.carbonylO.x, cy + pos.carbonylO.y, pos.carbonylO.z, 'double');
      drawBond(ctx, cx + pos.carbonyl.x, cy + pos.carbonyl.y, pos.carbonyl.z, cx + pos.carbonylH.x, cy + pos.carbonylH.y, pos.carbonylH.z);
      
      // Draw Aldehyde Atoms
      drawAtom(ctx, cx + pos.carbonyl.x, cy + pos.carbonyl.y, pos.carbonyl.z, '#818cf8', 'C', 15);
      drawAtom(ctx, cx + pos.carbonylO.x, cy + pos.carbonylO.y, pos.carbonylO.z, '#f87171', 'O', 16);
      drawAtom(ctx, cx + pos.carbonylH.x, cy + pos.carbonylH.y, pos.carbonylH.z, '#e2e8f0', 'H', 12);
      
      if (showOH) {
        const oh = rotate3D(pos.carbonyl.x, pos.carbonyl.y - 30, pos.carbonyl.z, 0, 0);
        drawAtom(ctx, cx + oh.x, cy + oh.y, oh.z, '#f472b6', 'OH', 14);
      }
    };

    // --- Main Draw Loop ---
    const draw = () => {
      const { ctx, width, height, rotation } = scene;
      
      // Clear with Theme Background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0f172a'); // Slate 900
      gradient.addColorStop(1, '#020617'); // Slate 950
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2 + 50;

      if (step === 0) {
        // Step 0: Two distinct molecules
        const positions1 = getBenzaldehydePositions(-180, 0, 0, rotation);
        drawBenzaldehyde(ctx, centerX, centerY, positions1);
        
        const positions2 = getBenzaldehydePositions(180, 0, 0, rotation);
        drawBenzaldehyde(ctx, centerX, centerY, positions2);
        
        const oh = rotate3D(0, -120, 0, 0, rotation);
        drawAtom(ctx, centerX + oh.x, centerY + oh.y, oh.z, '#f472b6', 'OH⁻', 18);
      } else {
        // Fallback for demo steps to avoid complex logic for now
        const positions = getBenzaldehydePositions(0, 0, 0, rotation);
        drawBenzaldehyde(ctx, centerX, centerY, positions);
        
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`Step ${step + 1}: Reaction in progress...`, centerX, centerY + 160);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "16px Arial";
        ctx.fillText("(Intermediate transition state)", centerX, centerY + 185);
      }

      // Legend
      const items = [
        { color: '#818cf8', label: 'C - Carbon' },
        { color: '#f87171', label: 'O - Oxygen' },
        { color: '#e2e8f0', label: 'H - Hydrogen' },
      ];
      const ly = height - 100;
      ctx.textAlign = 'left';
      items.forEach((item, i) => {
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(40, ly + i * 30, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px Arial';
        ctx.fillText(item.label, 60, ly + i * 30 + 5);
      });

      if (scene.autoRotate) {
        scene.rotation += 0.005;
      }
    };

    const animate = () => {
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [step, isPlaying]);

  // Update scene autoRotate when isPlaying changes
  useEffect(() => {
    if (sceneRef.current) {
        sceneRef.current.autoRotate = isPlaying;
    }
  }, [isPlaying]);


  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#020617]">
      
      {/* Header */}
      <div className="absolute top-0 left-0 p-6 z-10 w-full flex justify-between items-start pointer-events-none">
        <div>
            <Link href="/" className="pointer-events-auto flex items-center text-teal-400 hover:text-teal-300 transition-colors gap-2 text-sm font-bold uppercase tracking-widest mb-2">
                <ArrowLeft size={16} /> Back to Lab
            </Link>
            <h1 className="text-4xl font-bold text-white mb-1">Cannizzaro Reaction</h1>
            <p className="text-teal-400/80 text-sm">Disproportionation of non-enolizable aldehydes</p>
        </div>
        <div className="bg-teal-900/20 border border-teal-800/50 p-2 rounded-lg text-teal-400">
            <FlaskRound size={24} />
        </div>
      </div>

      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-20">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold shadow-lg shadow-teal-900/50 transition-all active:scale-95"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        
        <button
          onClick={() => setStep((step + 1) % 2)} // Toggle between 2 steps for simplicity
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-xl font-bold transition-all active:scale-95"
        >
          Next Step
        </button>
        
        <button
          onClick={() => setShowInfo(!showInfo)}
          className={`p-3 rounded-xl border transition-all ${showInfo ? 'bg-teal-500/20 border-teal-500 text-teal-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
        >
          <Info size={24} />
        </button>
      </div>

      {/* Info Card */}
      {showInfo && (
        <div className="absolute top-24 right-8 w-80 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-6 rounded-2xl shadow-2xl z-20">
          <h3 className="text-lg font-bold text-white mb-2">Mechanism Details</h3>
          <p className="text-slate-300 text-sm mb-4 leading-relaxed">
            The reaction involves the nucleophilic addition of an OH⁻ ion to the carbonyl carbon of a benzaldehyde molecule, followed by the transfer of a hydride ion.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span> Benzaldehyde (Reactant)
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-pink-400"></span> Hydroxide Ion (OH⁻)
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
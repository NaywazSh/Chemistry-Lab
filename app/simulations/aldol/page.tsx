'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Play, Pause, RotateCcw, Info, ChevronLeft, ChevronRight, ArrowLeft, Layers } from 'lucide-react';

// --- TypeScript Definitions ---
type Point3D = { x: number; y: number; z: number };

// Allow flexible keys for molecule parts (c1, c2, o, h1, etc.)
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

export default function AldolPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [showInfo, setShowInfo] = useState(true);
  const animationRef = useRef<number>(0);
  const sceneRef = useRef<Scene | null>(null);

  const totalSteps = 5;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Responsive Canvas Handling
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
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

    const scene: Scene = {
      canvas,
      ctx,
      width: canvas.width / (window.devicePixelRatio || 1),
      height: canvas.height / (window.devicePixelRatio || 1),
      rotation: 0,
      autoRotate: isPlaying
    };
    sceneRef.current = scene;

    // --- Helper Drawing Functions ---

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

    const drawAtom = (ctx: CanvasRenderingContext2D, x: number, y: number, z: number, color: string, label: string, size = 18) => {
      const scale = 1 / (1 + z * 0.0008);
      const screenX = x * scale;
      const screenY = y * scale;
      const radius = size * scale;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 8 * scale;
      ctx.shadowOffsetX = 2 * scale;
      ctx.shadowOffsetY = 2 * scale;

      const atomGradient = ctx.createRadialGradient(
        screenX - radius * 0.3, screenY - radius * 0.3, 0,
        screenX, screenY, radius
      );
      atomGradient.addColorStop(0, color);
      atomGradient.addColorStop(1, shadeColor(color, -35));
      
      ctx.fillStyle = atomGradient;
      ctx.beginPath();
      ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowColor = 'transparent';

      ctx.fillStyle = '#fff';
      ctx.font = `bold ${13 * scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, screenX, screenY);
    };

    const drawBond = (ctx: CanvasRenderingContext2D, x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, type = 'single', color = '#94a3b8') => {
      const scale1 = 1 / (1 + z1 * 0.0008);
      const scale2 = 1 / (1 + z2 * 0.0008);
      
      const sx1 = x1 * scale1;
      const sy1 = y1 * scale1;
      const sx2 = x2 * scale2;
      const sy2 = y2 * scale2;

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      
      if (type === 'double') {
        const dx = sx2 - sx1;
        const dy = sy2 - sy1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const offsetX = -dy / len * 5;
        const offsetY = dx / len * 5;

        ctx.beginPath();
        ctx.moveTo(sx1 + offsetX, sy1 + offsetY);
        ctx.lineTo(sx2 + offsetX, sy2 + offsetY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(sx1 - offsetX, sy1 - offsetY);
        ctx.lineTo(sx2 - offsetX, sy2 - offsetY);
        ctx.stroke();
      } else if (type === 'dashed') {
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.moveTo(sx1, sy1);
        ctx.lineTo(sx2, sy2);
        ctx.stroke();
        ctx.setLineDash([]);
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

    const drawArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color = '#10b981') => {
      const headLen = 12;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    };

    // --- Molecule Calculation Helpers ---

    const getAcetaldehydePositions = (offsetX: number, offsetY: number, offsetZ: number, rot: number): MoleculePositions => {
      return {
        c1: rotate3D(offsetX - 40, offsetY, offsetZ, 0, rot),
        c2: rotate3D(offsetX + 20, offsetY, offsetZ, 0, rot),
        o: rotate3D(offsetX + 20, offsetY - 40, offsetZ, 0, rot),
        h1: rotate3D(offsetX - 70, offsetY - 25, offsetZ, 0, rot),
        h2: rotate3D(offsetX - 70, offsetY + 25, offsetZ, 0, rot),
        h3: rotate3D(offsetX - 40, offsetY + 35, offsetZ, 0, rot),
        h4: rotate3D(offsetX + 60, offsetY, offsetZ, 0, rot)
      };
    };

    const drawAcetaldehyde = (ctx: CanvasRenderingContext2D, cx: number, cy: number, pos: MoleculePositions) => {
      drawBond(ctx, cx + pos.c1.x, cy + pos.c1.y, pos.c1.z, cx + pos.c2.x, cy + pos.c2.y, pos.c2.z);
      drawBond(ctx, cx + pos.c2.x, cy + pos.c2.y, pos.c2.z, cx + pos.o.x, cy + pos.o.y, pos.o.z, 'double');
      drawBond(ctx, cx + pos.c1.x, cy + pos.c1.y, pos.c1.z, cx + pos.h1.x, cy + pos.h1.y, pos.h1.z);
      drawBond(ctx, cx + pos.c1.x, cy + pos.c1.y, pos.c1.z, cx + pos.h2.x, cy + pos.h2.y, pos.h2.z);
      drawBond(ctx, cx + pos.c1.x, cy + pos.c1.y, pos.c1.z, cx + pos.h3.x, cy + pos.h3.y, pos.h3.z);
      drawBond(ctx, cx + pos.c2.x, cy + pos.c2.y, pos.c2.z, cx + pos.h4.x, cy + pos.h4.y, pos.h4.z);

      drawAtom(ctx, cx + pos.c1.x, cy + pos.c1.y, pos.c1.z, '#8b5cf6', 'C', 16);
      drawAtom(ctx, cx + pos.c2.x, cy + pos.c2.y, pos.c2.z, '#8b5cf6', 'C', 16);
      drawAtom(ctx, cx + pos.o.x, cy + pos.o.y, pos.o.z, '#ef4444', 'O', 18);
      drawAtom(ctx, cx + pos.h1.x, cy + pos.h1.y, pos.h1.z, '#e2e8f0', 'H', 12);
      drawAtom(ctx, cx + pos.h2.x, cy + pos.h2.y, pos.h2.z, '#e2e8f0', 'H', 12);
      drawAtom(ctx, cx + pos.h3.x, cy + pos.h3.y, pos.h3.z, '#e2e8f0', 'H', 12);
      drawAtom(ctx, cx + pos.h4.x, cy + pos.h4.y, pos.h4.z, '#e2e8f0', 'H', 12);
    };

    const getEnolatePositions = (offsetX: number, offsetY: number, offsetZ: number, rot: number): MoleculePositions => {
      return {
        c1: rotate3D(offsetX - 40, offsetY, offsetZ, 0, rot),
        c2: rotate3D(offsetX + 20, offsetY, offsetZ, 0, rot),
        o: rotate3D(offsetX + 20, offsetY - 40, offsetZ, 0, rot),
        h1: rotate3D(offsetX - 70, offsetY - 25, offsetZ, 0, rot),
        h2: rotate3D(offsetX - 70, offsetY + 25, offsetZ, 0, rot)
      };
    };

    const drawEnolate = (ctx: CanvasRenderingContext2D, cx: number, cy: number, pos: MoleculePositions) => {
      drawBond(ctx, cx + pos.c1.x, cy + pos.c1.y, pos.c1.z, cx + pos.c2.x, cy + pos.c2.y, pos.c2.z, 'double');
      drawBond(ctx, cx + pos.c2.x, cy + pos.c2.y, pos.c2.z, cx + pos.o.x, cy + pos.o.y, pos.o.z);
      drawBond(ctx, cx + pos.c1.x, cy + pos.c1.y, pos.c1.z, cx + pos.h1.x, cy + pos.h1.y, pos.h1.z);
      drawBond(ctx, cx + pos.c1.x, cy + pos.c1.y, pos.c1.z, cx + pos.h2.x, cy + pos.h2.y, pos.h2.z);

      drawAtom(ctx, cx + pos.c1.x, cy + pos.c1.y, pos.c1.z, '#8b5cf6', 'C', 16);
      drawAtom(ctx, cx + pos.c2.x, cy + pos.c2.y, pos.c2.z, '#8b5cf6', 'C', 16);
      drawAtom(ctx, cx + pos.o.x, cy + pos.o.y, pos.o.z, '#ef4444', 'O⁻', 18);
      drawAtom(ctx, cx + pos.h1.x, cy + pos.h1.y, pos.h1.z, '#e2e8f0', 'H', 12);
      drawAtom(ctx, cx + pos.h2.x, cy + pos.h2.y, pos.h2.z, '#e2e8f0', 'H', 12);
    };

    const getAldolProductPositions = (offsetX: number, offsetY: number, offsetZ: number, rot: number): MoleculePositions => {
      return {
        c1: rotate3D(offsetX - 100, offsetY, offsetZ, 0, rot),
        c2: rotate3D(offsetX - 40, offsetY, offsetZ, 0, rot),
        c3: rotate3D(offsetX + 20, offsetY, offsetZ, 0, rot),
        c4: rotate3D(offsetX + 80, offsetY, offsetZ, 0, rot),
        o1: rotate3D(offsetX - 40, offsetY - 40, offsetZ, 0, rot),
        o2: rotate3D(offsetX + 80, offsetY - 40, offsetZ, 0, rot),
        h: rotate3D(offsetX + 20, offsetY - 40, offsetZ, 0, rot)
      };
    };

    const drawAldolProductMolecule = (ctx: CanvasRenderingContext2D, cx: number, cy: number, pos: MoleculePositions) => {
      drawBond(ctx, cx + pos.c1.x, cy + pos.c1.y, pos.c1.z, cx + pos.c2.x, cy + pos.c2.y, pos.c2.z);
      drawBond(ctx, cx + pos.c2.x, cy + pos.c2.y, pos.c2.z, cx + pos.c3.x, cy + pos.c3.y, pos.c3.z);
      drawBond(ctx, cx + pos.c3.x, cy + pos.c3.y, pos.c3.z, cx + pos.c4.x, cy + pos.c4.y, pos.c4.z);
      drawBond(ctx, cx + pos.c2.x, cy + pos.c2.y, pos.c2.z, cx + pos.o1.x, cy + pos.o1.y, pos.o1.z, 'double');
      drawBond(ctx, cx + pos.c4.x, cy + pos.c4.y, pos.c4.z, cx + pos.o2.x, cy + pos.o2.y, pos.o2.z, 'double');
      drawBond(ctx, cx + pos.c3.x, cy + pos.c3.y, pos.c3.z, cx + pos.h.x, cy + pos.h.y, pos.h.z);

      drawAtom(ctx, cx + pos.c1.x, cy + pos.c1.y, pos.c1.z, '#8b5cf6', 'CH₃', 16);
      drawAtom(ctx, cx + pos.c2.x, cy + pos.c2.y, pos.c2.z, '#8b5cf6', 'C', 16);
      drawAtom(ctx, cx + pos.c3.x, cy + pos.c3.y, pos.c3.z, '#8b5cf6', 'C', 16);
      drawAtom(ctx, cx + pos.c4.x, cy + pos.c4.y, pos.c4.z, '#8b5cf6', 'C', 16);
      drawAtom(ctx, cx + pos.o1.x, cy + pos.o1.y, pos.o1.z, '#ef4444', 'O', 18);
      drawAtom(ctx, cx + pos.o2.x, cy + pos.o2.y, pos.o2.z, '#ef4444', 'O', 18);
      drawAtom(ctx, cx + pos.h.x, cy + pos.h.y, pos.h.z, '#f43f5e', 'OH', 16);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px Arial';
      const betaLabel = rotate3D(20, 35, 0, 0, scene.rotation);
      ctx.fillText('β', cx + betaLabel.x, cy + betaLabel.y);
    };

    const getUnsaturatedProductPositions = (offsetX: number, offsetY: number, offsetZ: number, rot: number): MoleculePositions => {
      return {
        c1: rotate3D(offsetX - 100, offsetY, offsetZ, 0, rot),
        c2: rotate3D(offsetX - 40, offsetY, offsetZ, 0, rot),
        c3: rotate3D(offsetX + 20, offsetY, offsetZ, 0, rot),
        c4: rotate3D(offsetX + 80, offsetY, offsetZ, 0, rot),
        o1: rotate3D(offsetX - 40, offsetY - 40, offsetZ, 0, rot),
        o2: rotate3D(offsetX + 80, offsetY - 40, offsetZ, 0, rot)
      };
    };

    const drawUnsaturatedProduct = (ctx: CanvasRenderingContext2D, cx: number, cy: number, pos: MoleculePositions) => {
      drawBond(ctx, cx + pos.c1.x, cy + pos.c1.y, pos.c1.z, cx + pos.c2.x, cy + pos.c2.y, pos.c2.z);
      drawBond(ctx, cx + pos.c2.x, cy + pos.c2.y, pos.c2.z, cx + pos.c3.x, cy + pos.c3.y, pos.c3.z, 'double', '#10b981');
      drawBond(ctx, cx + pos.c3.x, cy + pos.c3.y, pos.c3.z, cx + pos.c4.x, cy + pos.c4.y, pos.c4.z);
      drawBond(ctx, cx + pos.c2.x, cy + pos.c2.y, pos.c2.z, cx + pos.o1.x, cy + pos.o1.y, pos.o1.z, 'double');
      drawBond(ctx, cx + pos.c4.x, cy + pos.c4.y, pos.c4.z, cx + pos.o2.x, cy + pos.o2.y, pos.o2.z, 'double');

      drawAtom(ctx, cx + pos.c1.x, cy + pos.c1.y, pos.c1.z, '#8b5cf6', 'CH₃', 16);
      drawAtom(ctx, cx + pos.c2.x, cy + pos.c2.y, pos.c2.z, '#8b5cf6', 'C', 16);
      drawAtom(ctx, cx + pos.c3.x, cy + pos.c3.y, pos.c3.z, '#8b5cf6', 'C', 16);
      drawAtom(ctx, cx + pos.c4.x, cy + pos.c4.y, pos.c4.z, '#8b5cf6', 'C', 16);
      drawAtom(ctx, cx + pos.o1.x, cy + pos.o1.y, pos.o1.z, '#ef4444', 'O', 18);
      drawAtom(ctx, cx + pos.o2.x, cy + pos.o2.y, pos.o2.z, '#ef4444', 'O', 18);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 12px Arial';
      const alphaLabel = rotate3D(-40, 35, 0, 0, scene.rotation);
      const betaLabel = rotate3D(20, 35, 0, 0, scene.rotation);
      ctx.fillText('α', cx + alphaLabel.x, cy + alphaLabel.y);
      ctx.fillText('β', cx + betaLabel.x, cy + betaLabel.y);
    };

    // --- Main Draw Loop ---

    const draw = () => {
      const { ctx, width, height, rotation } = scene;
      
      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#020617');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2 - 20;

      // Draw Steps
      if (step === 0) {
        // Initial State
        const pos1 = getAcetaldehydePositions(-180, 0, 0, rotation);
        drawAcetaldehyde(ctx, centerX, centerY, pos1);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 32px Arial'; ctx.textAlign = 'center';
        ctx.fillText('+', centerX, centerY - 20);
        const pos2 = getAcetaldehydePositions(180, 0, 0, rotation);
        drawAcetaldehyde(ctx, centerX, centerY, pos2);
        const oh = rotate3D(0, 120, 0, 0, rotation);
        drawAtom(ctx, centerX + oh.x, centerY + oh.y, oh.z, '#f43f5e', 'OH⁻', 20);
      } else if (step === 1) {
        // Enolate Formation
        const pos1 = getAcetaldehydePositions(-200, 0, 0, rotation);
        drawAcetaldehyde(ctx, centerX, centerY, pos1);
        const enolate = getEnolatePositions(180, 0, 0, rotation);
        drawEnolate(ctx, centerX, centerY, enolate);
        
        ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 14px Arial';
        ctx.fillText('H⁺ abstraction', centerX - 80, centerY + 90);
      } else if (step === 2) {
        // Nucleophilic Addition
        const enolate = getEnolatePositions(-180, 0, 0, rotation);
        drawEnolate(ctx, centerX, centerY, enolate);
        const aldehyde = getAcetaldehydePositions(160, -20, 0, rotation);
        drawAcetaldehyde(ctx, centerX, centerY, aldehyde);
        
        const attackFrom = rotate3D(-90, 30, 0, 0, rotation);
        const attackTo = rotate3D(90, -20, 0, 0, rotation);
        drawArrow(ctx, centerX + attackFrom.x, centerY + attackFrom.y, centerX + attackTo.x, centerY + attackTo.y, '#10b981');
      } else if (step === 3) {
        // Aldol Product
        const product = getAldolProductPositions(0, 0, 0, rotation);
        drawAldolProductMolecule(ctx, centerX, centerY, product);
        ctx.fillStyle = '#a78bfa'; ctx.font = 'bold 16px Arial';
        ctx.fillText('β-Hydroxy Aldehyde', centerX, centerY + 130);
      } else if (step === 4) {
        // Final Product
        const product = getUnsaturatedProductPositions(0, 0, 0, rotation);
        drawUnsaturatedProduct(ctx, centerX, centerY, product);
        const water = rotate3D(0, 140, 0, 0, rotation);
        drawAtom(ctx, centerX + water.x, centerY + water.y, water.z, '#38bdf8', 'H₂O', 20);
        ctx.fillStyle = '#34d399'; ctx.font = 'bold 16px Arial';
        ctx.fillText('α,β-Unsaturated Aldehyde', centerX, centerY - 130);
      }

      // Legend
      const items = [
        { color: '#8b5cf6', label: 'C - Carbon' },
        { color: '#ef4444', label: 'O - Oxygen' },
        { color: '#e2e8f0', label: 'H - Hydrogen' },
      ];
      let y = height - 80;
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      items.forEach((item, i) => {
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(40, y + i * 25, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(item.label, 55, y + i * 25 + 4);
      });

      if (scene.autoRotate) {
        scene.rotation += 0.008;
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
            <h1 className="text-4xl font-bold text-white mb-1">Aldol Condensation</h1>
            <p className="text-teal-400/80 text-sm">Formation of β-hydroxy aldehydes from enolizable ketones</p>
        </div>
        <div className="bg-teal-900/20 border border-teal-800/50 p-2 rounded-lg text-teal-400">
            <Layers size={24} />
        </div>
      </div>

      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-20 flex-wrap justify-center">
        <button
          onClick={() => setStep((prev) => (prev - 1 + totalSteps) % totalSteps)}
          className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-bold transition-all"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold shadow-lg shadow-teal-900/50 transition-all active:scale-95"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        
        <button
          onClick={() => setStep((prev) => (prev + 1) % totalSteps)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-xl font-bold transition-all active:scale-95"
        >
          Step {step + 1}/{totalSteps} <ChevronRight size={16} />
        </button>
        
        <button
          onClick={() => setStep(0)}
          className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-bold transition-all"
        >
          <RotateCcw size={20} />
        </button>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className={`p-3 rounded-xl border transition-all ${showInfo ? 'bg-teal-500/20 border-teal-500 text-teal-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
        >
          <Info size={24} />
        </button>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="absolute top-24 right-8 w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-6 rounded-2xl shadow-2xl z-20">
          <h3 className="text-xl font-bold text-white mb-3">Mechanism Details</h3>
          <p className="text-slate-300 text-sm mb-4 leading-relaxed">
            The Aldol condensation involves the reaction of an enolizable aldehyde or ketone with a carbonyl compound to form a β-hydroxy aldehyde, followed by dehydration.
          </p>
          
          <div className="space-y-3">
             <div className="text-sm border-l-2 border-teal-500 pl-3">
               <strong className="text-teal-400 block mb-1">Step 1: Enolate Formation</strong>
               <span className="text-slate-400">Base removes α-hydrogen to form nucleophilic enolate.</span>
             </div>
             <div className="text-sm border-l-2 border-blue-500 pl-3">
               <strong className="text-blue-400 block mb-1">Step 2: Nucleophilic Attack</strong>
               <span className="text-slate-400">Enolate attacks carbonyl carbon of another molecule.</span>
             </div>
             <div className="text-sm border-l-2 border-purple-500 pl-3">
               <strong className="text-purple-400 block mb-1">Step 3: Dehydration</strong>
               <span className="text-slate-400">Loss of water creates conjugated double bond system.</span>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
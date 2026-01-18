'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Play, Pause, RotateCcw, Info, ChevronLeft, ChevronRight, ArrowLeft, TestTube2 } from 'lucide-react';

// --- TypeScript Definitions ---
type Point3D = { x: number; y: number; z: number };

type Scene = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  rotation: number;
  autoRotate: boolean;
};

interface LegendItem {
  color: string;
  label: string;
}

export default function ClemmensenPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [showInfo, setShowInfo] = useState(true);
  const animationRef = useRef<number>(0);
  const sceneRef = useRef<Scene | null>(null);

  const totalSteps = 4;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Responsive Canvas Handling for High-DPI displays
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

    const shadeColor = (color: string, percent: number): string => {
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

    const rotate3D = (x: number, y: number, z: number, angleX: number, angleY: number): Point3D => {
      const x1 = x * Math.cos(angleY) - z * Math.sin(angleY);
      const z1 = x * Math.sin(angleY) + z * Math.cos(angleY);
      const y1 = y * Math.cos(angleX) - z1 * Math.sin(angleX);
      const z2 = y * Math.sin(angleX) + z1 * Math.cos(angleX);
      return { x: x1, y: y1, z: z2 };
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
      } else {
        ctx.beginPath();
        ctx.moveTo(sx1, sy1);
        ctx.lineTo(sx2, sy2);
        ctx.stroke();
      }
    };

    // --- Scene Drawing Functions ---
    const drawKetone = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number) => {
      const c1 = rotate3D(-100, 0, 0, 0, rot);
      const c2 = rotate3D(-40, 0, 0, 0, rot);
      const c3 = rotate3D(20, 0, 0, 0, rot);
      const c4 = rotate3D(80, 0, 0, 0, rot);
      const o = rotate3D(20, -45, 0, 0, rot);

      drawBond(ctx, cx + c1.x, cy + c1.y, c1.z, cx + c2.x, cy + c2.y, c2.z);
      drawBond(ctx, cx + c2.x, cy + c2.y, c2.z, cx + c3.x, cy + c3.y, c3.z);
      drawBond(ctx, cx + c3.x, cy + c3.y, c3.z, cx + c4.x, cy + c4.y, c4.z);
      drawBond(ctx, cx + c3.x, cy + c3.y, c3.z, cx + o.x, cy + o.y, o.z, 'double', '#e74c3c');

      drawAtom(ctx, cx + c1.x, cy + c1.y, c1.z, '#9b59b6', 'R₁', 16);
      drawAtom(ctx, cx + c2.x, cy + c2.y, c2.z, '#9b59b6', 'C', 16);
      drawAtom(ctx, cx + c3.x, cy + c3.y, c3.z, '#9b59b6', 'C', 16);
      drawAtom(ctx, cx + c4.x, cy + c4.y, c4.z, '#9b59b6', 'R₂', 16);
      drawAtom(ctx, cx + o.x, cy + o.y, o.z, '#e74c3c', 'O', 18);

      ctx.fillStyle = '#e74c3c';
      ctx.font = 'bold 12px Arial';
      const label = rotate3D(20, -70, 0, 0, rot);
      ctx.fillText('Carbonyl', cx + label.x, cy + label.y);
    };

    const drawIntermediate = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number) => {
        const c1 = rotate3D(-100, 0, 0, 0, rot);
        const c2 = rotate3D(-40, 0, 0, 0, rot);
        const c3 = rotate3D(20, 0, 0, 0, rot);
        const c4 = rotate3D(80, 0, 0, 0, rot);
        const o = rotate3D(20, -45, 0, 0, rot);
        const h = rotate3D(55, -45, 0, 0, rot);
  
        drawBond(ctx, cx + c1.x, cy + c1.y, c1.z, cx + c2.x, cy + c2.y, c2.z);
        drawBond(ctx, cx + c2.x, cy + c2.y, c2.z, cx + c3.x, cy + c3.y, c3.z);
        drawBond(ctx, cx + c3.x, cy + c3.y, c3.z, cx + c4.x, cy + c4.y, c4.z);
        drawBond(ctx, cx + c3.x, cy + c3.y, c3.z, cx + o.x, cy + o.y, o.z, 'single', '#f39c12');
        drawBond(ctx, cx + o.x, cy + o.y, o.z, cx + h.x, cy + h.y, h.z);

        drawAtom(ctx, cx + c1.x, cy + c1.y, c1.z, '#9b59b6', 'R₁', 16);
        drawAtom(ctx, cx + c2.x, cy + c2.y, c2.z, '#9b59b6', 'C', 16);
        drawAtom(ctx, cx + c3.x, cy + c3.y, c3.z, '#9b59b6', 'C', 16);
        drawAtom(ctx, cx + c4.x, cy + c4.y, c4.z, '#9b59b6', 'R₂', 16);
        drawAtom(ctx, cx + o.x, cy + o.y, o.z, '#f39c12', 'O', 18);
        drawAtom(ctx, cx + h.x, cy + h.y, h.z, '#ecf0f1', 'H', 12);
    };

    const drawSecondIntermediate = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number) => {
        const c1 = rotate3D(-100, 0, 0, 0, rot);
        const c2 = rotate3D(-40, 0, 0, 0, rot);
        const c3 = rotate3D(20, 0, 0, 0, rot);
        const c4 = rotate3D(80, 0, 0, 0, rot);
        const h1 = rotate3D(20, -35, 0, 0, rot);
        const h2 = rotate3D(20, 35, 0, 0, rot);
  
        drawBond(ctx, cx + c1.x, cy + c1.y, c1.z, cx + c2.x, cy + c2.y, c2.z);
        drawBond(ctx, cx + c2.x, cy + c2.y, c2.z, cx + c3.x, cy + c3.y, c3.z);
        drawBond(ctx, cx + c3.x, cy + c3.y, c3.z, cx + c4.x, cy + c4.y, c4.z);
        drawBond(ctx, cx + c3.x, cy + c3.y, c3.z, cx + h1.x, cy + h1.y, h1.z);
        drawBond(ctx, cx + c3.x, cy + c3.y, c3.z, cx + h2.x, cy + h2.y, h2.z);

        drawAtom(ctx, cx + c1.x, cy + c1.y, c1.z, '#9b59b6', 'R₁', 16);
        drawAtom(ctx, cx + c2.x, cy + c2.y, c2.z, '#9b59b6', 'C', 16);
        drawAtom(ctx, cx + c3.x, cy + c3.y, c3.z, '#9b59b6', 'C', 16);
        drawAtom(ctx, cx + c4.x, cy + c4.y, c4.z, '#9b59b6', 'R₂', 16);
        drawAtom(ctx, cx + h1.x, cy + h1.y, h1.z, '#ecf0f1', 'H', 12);
        drawAtom(ctx, cx + h2.x, cy + h2.y, h2.z, '#ecf0f1', 'H', 12);

        ctx.fillStyle = '#f39c12';
        ctx.font = 'bold 12px Arial';
        const label = rotate3D(20, -60, 0, 0, rot);
        ctx.fillText('CH₂', cx + label.x, cy + label.y);
    };

    const drawAlkane = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number) => {
        const c1 = rotate3D(-100, 0, 0, 0, rot);
        const c2 = rotate3D(-40, 0, 0, 0, rot);
        const c3 = rotate3D(20, 0, 0, 0, rot);
        const c4 = rotate3D(80, 0, 0, 0, rot);
        const h1 = rotate3D(20, -35, 0, 0, rot);
        const h2 = rotate3D(20, 35, 0, 0, rot);
  
        drawBond(ctx, cx + c1.x, cy + c1.y, c1.z, cx + c2.x, cy + c2.y, c2.z, 'single', '#2ecc71');
        drawBond(ctx, cx + c2.x, cy + c2.y, c2.z, cx + c3.x, cy + c3.y, c3.z, 'single', '#2ecc71');
        drawBond(ctx, cx + c3.x, cy + c3.y, c3.z, cx + c4.x, cy + c4.y, c4.z, 'single', '#2ecc71');
        drawBond(ctx, cx + c3.x, cy + c3.y, c3.z, cx + h1.x, cy + h1.y, h1.z);
        drawBond(ctx, cx + c3.x, cy + c3.y, c3.z, cx + h2.x, cy + h2.y, h2.z);

        drawAtom(ctx, cx + c1.x, cy + c1.y, c1.z, '#2ecc71', 'R₁', 16);
        drawAtom(ctx, cx + c2.x, cy + c2.y, c2.z, '#2ecc71', 'CH₂', 16);
        drawAtom(ctx, cx + c3.x, cy + c3.y, c3.z, '#2ecc71', 'CH₂', 16);
        drawAtom(ctx, cx + c4.x, cy + c4.y, c4.z, '#2ecc71', 'R₂', 16);
        drawAtom(ctx, cx + h1.x, cy + h1.y, h1.z, '#ecf0f1', 'H', 12);
        drawAtom(ctx, cx + h2.x, cy + h2.y, h2.z, '#ecf0f1', 'H', 12);
    };

    // --- Main Draw Loop ---
    const draw = () => {
      const { ctx, width, height, rotation } = scene;
      
      ctx.clearRect(0, 0, width, height);
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#020617');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2 - 40;

      // Draw Steps
      if (step === 0) {
        drawKetone(ctx, centerX, centerY - 30, rotation);
        ctx.fillStyle = '#4ecdc4';
        ctx.font = 'bold 18px Arial';
        const reagent1 = rotate3D(-80, 100, 0, 0, rotation);
        const reagent2 = rotate3D(80, 100, 0, 0, rotation);
        ctx.fillText('Zn-Hg', centerX + reagent1.x, centerY + reagent1.y);
        ctx.fillText('HCl', centerX + reagent2.x, centerY + reagent2.y);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#95a5a6';
        ctx.fillText('(Amalgamated Zinc)', centerX + reagent1.x, centerY + reagent1.y + 20);
        ctx.fillText('(Acidic medium)', centerX + reagent2.x, centerY + reagent2.y + 20);
      } else if (step === 1) {
        drawIntermediate(ctx, centerX, centerY - 20, rotation);
        const zn = rotate3D(-120, 40, 0, 0, rotation);
        drawAtom(ctx, centerX + zn.x, centerY + zn.y, zn.z, '#7f8c8d', 'Zn', 20);
        const arrowStart = rotate3D(-90, 40, 0, 0, rotation);
        const arrowEnd = rotate3D(-30, -10, 0, 0, rotation);
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(centerX + arrowStart.x, centerY + arrowStart.y);
        ctx.lineTo(centerX + arrowEnd.x, centerY + arrowEnd.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('e⁻ transfer', centerX - 60, centerY + 15);
      } else if (step === 2) {
        drawSecondIntermediate(ctx, centerX, centerY - 20, rotation);
        const zn = rotate3D(120, 40, 0, 0, rotation);
        drawAtom(ctx, centerX + zn.x, centerY + zn.y, zn.z, '#7f8c8d', 'Zn', 20);
        ctx.fillStyle = '#f39c12';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('C-O bond cleavage', centerX, centerY + 100);
        const water = rotate3D(0, 120, 0, 0, rotation);
        drawAtom(ctx, centerX + water.x, centerY + water.y, water.z, '#3498db', 'H₂O', 18);
      } else if (step === 3) {
        drawAlkane(ctx, centerX, centerY - 20, rotation);
        ctx.fillStyle = '#2ecc71';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('Alkane Product', centerX, centerY + 110);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#95a5a6';
        ctx.fillText('(Carbonyl → Methylene)', centerX, centerY + 130);
      }

      // Legend
      const items: LegendItem[] = [
        { color: '#9b59b6', label: 'C - Carbon' },
        { color: '#e74c3c', label: 'O - Oxygen' },
        { color: '#ecf0f1', label: 'H - Hydrogen' },
        { color: '#7f8c8d', label: 'Zn - Zinc' }
      ];
      let yCoord = height - 230;
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      items.forEach((item, i) => {
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(20, yCoord + i * 22, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(item.label, 35, yCoord + i * 22 + 4);
      });

      // Chemical Equations Section
      const boxY = height - 160;
      const boxHeight = 145;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fillRect(0, boxY, width, boxHeight);
      ctx.strokeStyle = '#4ecdc4';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, boxY, width, boxHeight);
      ctx.fillStyle = '#4ecdc4';
      ctx.font = 'bold 15px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Chemical Equations - Clemmensen Reduction', width / 2, boxY + 22);

      const equations = [
        'General Reaction:',
        "R-CO-R'  +  Zn-Hg / HCl  →  R-CH₂-R'  +  H₂O",
        '',
        'Example (Acetophenone → Ethylbenzene):',
        'C₆H₅-CO-CH₃  +  4[H]  →[Zn-Hg/HCl]  C₆H₅-CH₂-CH₃  +  H₂O',
        '',
        'Mechanism: Carbonyl (C=O) → Methylene (CH₂)',
        '• Acidic conditions (HCl) required',
        '• Zn-Hg acts as electron donor (reducing agent)'
      ];

      let eqY = boxY + 45;
      ctx.textAlign = 'left';
      equations.forEach((eq, i) => {
        if (i === 0 || i === 3) {
          ctx.fillStyle = '#f39c12';
          ctx.font = 'bold 13px Courier New';
        } else if (i === 2 || i === 5) {
          return;
        } else if (i === 6) {
          ctx.fillStyle = '#2ecc71';
          ctx.font = 'bold 12px Courier New';
        } else if (i > 6) {
          ctx.fillStyle = '#95a5a6';
          ctx.font = '11px Courier New';
        } else {
          ctx.fillStyle = '#e0e0e0';
          ctx.font = '12px Courier New';
        }
        ctx.fillText(eq, 15, eqY);
        eqY += (i === 0 || i === 3 || i === 6) ? 18 : 15;
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

  const nextStep = () => setStep((prev) => (prev + 1) % totalSteps);
  const prevStep = () => setStep((prev) => (prev - 1 + totalSteps) % totalSteps);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#020617]">
      
      {/* Header */}
      <div className="absolute top-0 left-0 p-6 z-10 w-full flex justify-between items-start pointer-events-none">
        <div>
            <Link href="/" className="pointer-events-auto flex items-center text-teal-400 hover:text-teal-300 transition-colors gap-2 text-sm font-bold uppercase tracking-widest mb-2">
                <ArrowLeft size={16} /> Back to Lab
            </Link>
            <h1 className="text-4xl font-bold text-white mb-1">Clemmensen Reduction</h1>
            <p className="text-teal-400/80 text-sm">Reduction of ketones/aldehydes to alkanes using Zn-Hg</p>
        </div>
        <div className="bg-teal-900/20 border border-teal-800/50 p-2 rounded-lg text-teal-400">
            <TestTube2 size={24} />
        </div>
      </div>

      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-20 flex-wrap justify-center">
        <button
          onClick={prevStep}
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
          onClick={nextStep}
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
            The Clemmensen reduction reduces ketones and aldehydes to alkanes using zinc amalgam (Zn-Hg) and hydrochloric acid (HCl).
          </p>
          
          <div className="space-y-3">
             <div className="text-sm border-l-2 border-teal-500 pl-3">
               <strong className="text-teal-400 block mb-1">Key Features:</strong>
               <span className="text-slate-400 block mb-1">Converts carbonyl groups (C=O) directly to methylene groups (CH₂).</span>
               <span className="text-slate-400 block">Requires strongly acidic conditions (HCl).</span>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
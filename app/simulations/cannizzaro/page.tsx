'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Play, Pause, RotateCcw, Info, ChevronLeft, ChevronRight, ArrowLeft, FlaskRound } from 'lucide-react';

// --- TypeScript Definitions ---
type Point3D = { x: number; y: number; z: number };

// Update this type to allow the 'hideH' flag
type MoleculePositions = {
  hideH?: boolean;      // Optional flag to hide Hydrogen
  [key: string]: any;   // Allow any other properties (Points, etc.)
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

  const totalSteps = 4;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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

    // --- Helpers ---

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

    const rotate3D = (x: number, y: number, z: number, angleX: number, angleY: number): Point3D => {
      const x1 = x * Math.cos(angleY) - z * Math.sin(angleY);
      const z1 = x * Math.sin(angleY) + z * Math.cos(angleY);
      const y1 = y * Math.cos(angleX) - z1 * Math.sin(angleX);
      const z2 = y * Math.sin(angleX) + z1 * Math.cos(angleX);
      return { x: x1, y: y1, z: z2 };
    };

    const drawAtom = (ctx: CanvasRenderingContext2D, x: number, y: number, z: number, color: string, label: string, size = 20) => {
      const scale = 1 / (1 + z * 0.001);
      const screenX = x * scale;
      const screenY = y * scale;
      const radius = size * scale;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
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

    const drawBond = (ctx: CanvasRenderingContext2D, x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, type = 'single', color = '#64748b') => {
      const scale1 = 1 / (1 + z1 * 0.001);
      const sx1 = x1 * scale1;
      const sy1 = y1 * scale1;
      const sx2 = x2 * (1 / (1 + z2 * 0.001));
      const sy2 = y2 * (1 / (1 + z2 * 0.001));

      ctx.strokeStyle = color;
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

    const drawArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color = '#fbbf24') => {
        const headLen = 15;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 4;
        
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

    const getBenzaldehydePositions = (offsetX: number, offsetY: number, offsetZ: number, rot: number): MoleculePositions => {
      const positions: MoleculePositions = {};
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = Math.cos(angle) * 50 + offsetX;
        const y = Math.sin(angle) * 50 + offsetY;
        const pos = rotate3D(x, y, offsetZ, 0, rot);
        positions[`ring${i}`] = pos;
      }
      positions.carbonyl = rotate3D(offsetX, -80 + offsetY, offsetZ, 0, rot);
      positions.carbonylO = rotate3D(offsetX, -110 + offsetY, offsetZ, 0, rot);
      positions.carbonylH = rotate3D(offsetX + 25, -80 + offsetY, offsetZ, 0, rot);
      return positions;
    };

    const drawBenzaldehyde = (ctx: CanvasRenderingContext2D, cx: number, cy: number, pos: MoleculePositions, extraO: any = null) => {
      // Ring
      for (let i = 0; i < 6; i++) {
        const curr = pos[`ring${i}`];
        const next = pos[`ring${(i + 1) % 6}`];
        drawBond(ctx, cx + curr.x, cy + curr.y, curr.z, cx + next.x, cy + next.y, next.z);
      }
      for (let i = 0; i < 6; i++) {
        const p = pos[`ring${i}`];
        drawAtom(ctx, cx + p.x, cy + p.y, p.z, '#818cf8', 'C', 15);
      }

      // Carbonyl Group
      drawBond(ctx, cx + pos.ring0.x, cy + pos.ring0.y, pos.ring0.z, cx + pos.carbonyl.x, cy + pos.carbonyl.y, pos.carbonyl.z);
      
      // If extraO is present (Step 1/2), double bond becomes single
      const bondType = extraO ? 'single' : 'double';
      drawBond(ctx, cx + pos.carbonyl.x, cy + pos.carbonyl.y, pos.carbonyl.z, cx + pos.carbonylO.x, cy + pos.carbonylO.y, pos.carbonylO.z, bondType);
      drawBond(ctx, cx + pos.carbonyl.x, cy + pos.carbonyl.y, pos.carbonyl.z, cx + pos.carbonylH.x, cy + pos.carbonylH.y, pos.carbonylH.z);
      
      drawAtom(ctx, cx + pos.carbonyl.x, cy + pos.carbonyl.y, pos.carbonyl.z, '#818cf8', 'C', 15);
      drawAtom(ctx, cx + pos.carbonylO.x, cy + pos.carbonylO.y, pos.carbonylO.z, '#f87171', extraO ? 'O⁻' : 'O', 16);
      
      // Don't draw H if it's being transferred in Step 2 (we will draw manually)
      if(!pos.hideH) {
         drawAtom(ctx, cx + pos.carbonylH.x, cy + pos.carbonylH.y, pos.carbonylH.z, '#e2e8f0', 'H', 12);
      }
      
      // Draw attacking OH if present
      if (extraO) {
        drawBond(ctx, cx + pos.carbonyl.x, cy + pos.carbonyl.y, pos.carbonyl.z, cx + extraO.x, cy + extraO.y, extraO.z);
        drawAtom(ctx, cx + extraO.x, cy + extraO.y, extraO.z, '#f472b6', 'OH', 14);
      }
    };

    const getBenzylAlcoholPositions = (offsetX: number, offsetY: number, offsetZ: number, rot: number): MoleculePositions => {
        const positions: MoleculePositions = {};
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x = Math.cos(angle) * 50 + offsetX;
            const y = Math.sin(angle) * 50 + offsetY;
            const pos = rotate3D(x, y, offsetZ, 0, rot);
            positions[`ring${i}`] = pos;
        }
        positions.ch2 = rotate3D(offsetX, -80 + offsetY, offsetZ, 0, rot);
        positions.oh = rotate3D(offsetX, -110 + offsetY, offsetZ, 0, rot);
        positions.h1 = rotate3D(offsetX + 25, -80 + offsetY, offsetZ, 0, rot);
        positions.h2 = rotate3D(offsetX - 25, -80 + offsetY, offsetZ, 0, rot); // The new H
        return positions;
    };

    const drawBenzylAlcohol = (ctx: CanvasRenderingContext2D, cx: number, cy: number, pos: MoleculePositions) => {
        for (let i = 0; i < 6; i++) {
            const curr = pos[`ring${i}`];
            const next = pos[`ring${(i + 1) % 6}`];
            drawBond(ctx, cx + curr.x, cy + curr.y, curr.z, cx + next.x, cy + next.y, next.z);
        }
        for (let i = 0; i < 6; i++) {
            const p = pos[`ring${i}`];
            drawAtom(ctx, cx + p.x, cy + p.y, p.z, '#818cf8', 'C', 15);
        }
        drawBond(ctx, cx + pos.ring0.x, cy + pos.ring0.y, pos.ring0.z, cx + pos.ch2.x, cy + pos.ch2.y, pos.ch2.z);
        drawBond(ctx, cx + pos.ch2.x, cy + pos.ch2.y, pos.ch2.z, cx + pos.oh.x, cy + pos.oh.y, pos.oh.z);
        drawBond(ctx, cx + pos.ch2.x, cy + pos.ch2.y, pos.ch2.z, cx + pos.h1.x, cy + pos.h1.y, pos.h1.z);
        drawBond(ctx, cx + pos.ch2.x, cy + pos.ch2.y, pos.ch2.z, cx + pos.h2.x, cy + pos.h2.y, pos.h2.z);
        
        drawAtom(ctx, cx + pos.ch2.x, cy + pos.ch2.y, pos.ch2.z, '#818cf8', 'CH₂', 15);
        drawAtom(ctx, cx + pos.oh.x, cy + pos.oh.y, pos.oh.z, '#f87171', 'OH', 16);
        drawAtom(ctx, cx + pos.h1.x, cy + pos.h1.y, pos.h1.z, '#e2e8f0', 'H', 12);
        drawAtom(ctx, cx + pos.h2.x, cy + pos.h2.y, pos.h2.z, '#fbbf24', 'H', 12); // Yellow H to show transfer
    };

    const drawBenzoate = (ctx: CanvasRenderingContext2D, cx: number, cy: number, pos: MoleculePositions) => {
        for (let i = 0; i < 6; i++) {
            const curr = pos[`ring${i}`];
            const next = pos[`ring${(i + 1) % 6}`];
            drawBond(ctx, cx + curr.x, cy + curr.y, curr.z, cx + next.x, cy + next.y, next.z);
        }
        for (let i = 0; i < 6; i++) {
            const p = pos[`ring${i}`];
            drawAtom(ctx, cx + p.x, cy + p.y, p.z, '#818cf8', 'C', 15);
        }
        drawBond(ctx, cx + pos.ring0.x, cy + pos.ring0.y, pos.ring0.z, cx + pos.carbonyl.x, cy + pos.carbonyl.y, pos.carbonyl.z);
        drawBond(ctx, cx + pos.carbonyl.x, cy + pos.carbonyl.y, pos.carbonyl.z, cx + pos.carbonylO.x, cy + pos.carbonylO.y, pos.carbonylO.z, 'double');
        
        drawAtom(ctx, cx + pos.carbonyl.x, cy + pos.carbonyl.y, pos.carbonyl.z, '#818cf8', 'C', 15);
        drawAtom(ctx, cx + pos.carbonylO.x, cy + pos.carbonylO.y, pos.carbonylO.z, '#f87171', 'O', 16);
        // O- group
        const oMinus = rotate3D(pos.carbonyl.x, pos.carbonyl.y - 30, pos.carbonyl.z, 0, 0);
        drawBond(ctx, cx + pos.carbonyl.x, cy + pos.carbonyl.y, pos.carbonyl.z, cx + oMinus.x, cy + oMinus.y, oMinus.z);
        drawAtom(ctx, cx + oMinus.x, cy + oMinus.y, oMinus.z, '#f87171', 'O⁻', 16);
    }


    // --- Main Draw Loop ---

    const draw = () => {
      const { ctx, width, height, rotation } = scene;
      
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#020617');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2 - 20;

      // Title
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 26px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Cannizzaro Reaction', centerX, 40);

      // Step Descriptions
      const steps = [
        'Step 1: Reactants - 2 Benzaldehyde + OH⁻',
        'Step 2: Nucleophilic Attack by OH⁻',
        'Step 3: Hydride Transfer (Rate Determining Step)',
        'Step 4: Final Products (Benzoate + Alcohol)'
      ];
      ctx.font = '16px Arial'; ctx.fillStyle = '#2dd4bf';
      ctx.fillText(steps[step], centerX, 70);
      ctx.font = '14px Arial'; ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Step ${step + 1} of ${totalSteps}`, centerX, 90);

      if (step === 0) {
        // Step 1: Reactants
        const p1 = getBenzaldehydePositions(-180, 0, 0, rotation);
        drawBenzaldehyde(ctx, centerX, centerY, p1);
        const p2 = getBenzaldehydePositions(180, 0, 0, rotation);
        drawBenzaldehyde(ctx, centerX, centerY, p2);
        
        const oh = rotate3D(0, 120, 0, 0, rotation);
        drawAtom(ctx, centerX + oh.x, centerY + oh.y, oh.z, '#f472b6', 'OH⁻', 18);

      } else if (step === 1) {
        // Step 2: Nucleophilic Attack
        const p1 = getBenzaldehydePositions(-180, 0, 0, rotation);
        // Calculate OH position attached to Carbonyl
        const ohPos = rotate3D(-180 + 30, -80 + 30, 0, 0, rotation);
        drawBenzaldehyde(ctx, centerX, centerY, p1, ohPos); // Pass extra O

        const p2 = getBenzaldehydePositions(180, 0, 0, rotation);
        drawBenzaldehyde(ctx, centerX, centerY, p2);
        
        ctx.fillStyle = '#f472b6'; ctx.font = 'bold 14px Arial';
        ctx.fillText('Tetrahedral Intermediate', centerX - 180, centerY + 120);

      } else if (step === 2) {
        // Step 3: Hydride Shift
        const p1 = getBenzaldehydePositions(-160, 0, 0, rotation);
        const ohPos = rotate3D(-160 + 30, -80 + 30, 0, 0, rotation);
        p1.hideH = true; // Hide original H, we draw it moving
        drawBenzaldehyde(ctx, centerX, centerY, p1, ohPos);

        const p2 = getBenzaldehydePositions(160, 0, 0, rotation);
        drawBenzaldehyde(ctx, centerX, centerY, p2);

        // Draw Moving Hydride
        const hStart = p1.carbonylH;
        const hEnd = p2.carbonyl;
        
        // Simple interpolation for arrow
        drawArrow(ctx, centerX + hStart.x, centerY + hStart.y, centerX + hEnd.x, centerY + hEnd.y);
        
        // Draw H in middle
        const midX = (hStart.x + hEnd.x) / 2;
        const midY = (hStart.y + hEnd.y) / 2;
        drawAtom(ctx, centerX + midX, centerY + midY - 20, 0, '#fbbf24', 'H⁻', 16);

        ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 16px Arial';
        ctx.fillText('Hydride Shift', centerX, centerY - 60);

      } else if (step === 3) {
        // Step 4: Products
        const benzoate = getBenzaldehydePositions(-180, 0, 0, rotation);
        // Hack to reuse function for benzoate (just need double bond O and single bond O-)
        drawBenzoate(ctx, centerX, centerY, benzoate);

        const alcohol = getBenzylAlcoholPositions(180, 0, 0, rotation);
        drawBenzylAlcohol(ctx, centerX, centerY, alcohol);

        ctx.fillStyle = '#a78bfa'; ctx.font = 'bold 14px Arial';
        ctx.fillText('Benzoate Ion', centerX - 180, centerY + 130);
        ctx.fillText('Benzyl Alcohol', centerX + 180, centerY + 130);
      }

      // Legend
      const items = [
        { color: '#818cf8', label: 'C - Carbon' },
        { color: '#f87171', label: 'O - Oxygen' },
        { color: '#e2e8f0', label: 'H - Hydrogen' },
      ];
      let ly = height - 200;
      ctx.textAlign = 'left';
      items.forEach((item, i) => {
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(40, ly + i * 30, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(item.label, 60, ly + i * 30 + 5);
      });

      // Equation Box
      const boxY = height - 150;
      const boxHeight = 130;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fillRect(0, boxY, width, boxHeight);
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, boxY, width, boxHeight);
      
      ctx.fillStyle = '#2dd4bf'; ctx.font = 'bold 15px Arial'; ctx.textAlign = 'center';
      ctx.fillText('Chemical Equations - Cannizzaro Reaction', width/2, boxY + 25);
      
      const eqs = [
        "Overall:  2 Ph-CHO  +  OH⁻  →  Ph-COO⁻  +  Ph-CH₂OH",
        "",
        "Step 1: Ph-CHO + OH⁻ ⇌ Ph-CH(O⁻)OH  (Fast)",
        "Step 2: Ph-CH(O⁻)OH + Ph-CHO → Ph-COOH + Ph-CH₂O⁻ (Hydride Shift)",
        "Step 3: Ph-COOH + Ph-CH₂O⁻ ⇌ Ph-COO⁻ + Ph-CH₂OH (Proton Exchange)"
      ];
      
      let eqY = boxY + 50;
      ctx.textAlign = 'left';
      ctx.font = '13px Courier New';
      eqs.forEach((eq, i) => {
          if(i===0) ctx.fillStyle = '#fbbf24';
          else ctx.fillStyle = '#cbd5e1';
          ctx.fillText(eq, 20, eqY);
          eqY += 18;
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
            <h1 className="text-4xl font-bold text-white mb-1">Cannizzaro Reaction</h1>
            <p className="text-teal-400/80 text-sm">Disproportionation of non-enolizable aldehydes</p>
        </div>
        <div className="bg-teal-900/20 border border-teal-800/50 p-2 rounded-lg text-teal-400">
            <FlaskRound size={24} />
        </div>
      </div>

      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-20 flex-wrap justify-center">
        <button onClick={prevStep} className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-bold transition-all"><ChevronLeft size={20} /></button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold shadow-lg shadow-teal-900/50 transition-all active:scale-95"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={nextStep} className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-xl font-bold transition-all active:scale-95">Step {step + 1}/{totalSteps} <ChevronRight size={16} /></button>
        <button onClick={() => setStep(0)} className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-bold transition-all"><RotateCcw size={20} /></button>
        <button onClick={() => setShowInfo(!showInfo)} className={`p-3 rounded-xl border transition-all ${showInfo ? 'bg-teal-500/20 border-teal-500 text-teal-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}><Info size={24} /></button>
      </div>

      {/* Info Card */}
      {showInfo && (
        <div className="absolute top-24 right-8 w-96 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-6 rounded-2xl shadow-2xl z-20">
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
             <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Hydride Ion (H⁻)
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
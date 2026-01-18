'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Play, Pause, RotateCcw, Info, ChevronLeft, ChevronRight, ArrowLeft, Hexagon } from 'lucide-react';

// --- TypeScript Definitions ---
type Point3D = { x: number; y: number; z: number };

interface Scene {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  rotation: number;
  autoRotate: boolean;
}

interface LegendItem {
  color: string;
  label: string;
}

export default function ReimerTiemannPage() {
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

    // --- Drawing Helpers ---

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

    // --- Molecule Drawers ---

    const drawPhenol = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number) => {
      const ring = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 - Math.PI / 2;
        const x = Math.cos(angle) * 50;
        const y = Math.sin(angle) * 50;
        ring.push(rotate3D(x, y, 0, 0, rot));
      }

      const oh = rotate3D(0, -85, 0, 0, rot);
      const h = rotate3D(0, -115, 0, 0, rot);

      for (let i = 0; i < 6; i++) {
        const bondType = i % 2 === 0 ? 'double' : 'single';
        drawBond(ctx, cx + ring[i].x, cy + ring[i].y, ring[i].z,
                 cx + ring[(i + 1) % 6].x, cy + ring[(i + 1) % 6].y, ring[(i + 1) % 6].z,
                 bondType, '#8b5cf6');
      }

      drawBond(ctx, cx + ring[0].x, cy + ring[0].y, ring[0].z,
               cx + oh.x, cy + oh.y, oh.z);
      drawBond(ctx, cx + oh.x, cy + oh.y, oh.z,
               cx + h.x, cy + h.y, h.z);

      for (let i = 0; i < 6; i++) {
        drawAtom(ctx, cx + ring[i].x, cy + ring[i].y, ring[i].z, '#8b5cf6', 'C', 15);
      }
      drawAtom(ctx, cx + oh.x, cy + oh.y, oh.z, '#e74c3c', 'O', 16);
      drawAtom(ctx, cx + h.x, cy + h.y, h.z, '#e2e8f0', 'H', 12);
    };

    const drawPhenoxide = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number) => {
      const ring = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 - Math.PI / 2;
        const x = Math.cos(angle) * 50;
        const y = Math.sin(angle) * 50;
        ring.push(rotate3D(x, y, 0, 0, rot));
      }

      const o = rotate3D(0, -85, 0, 0, rot);

      for (let i = 0; i < 6; i++) {
        const bondType = i % 2 === 0 ? 'double' : 'single';
        drawBond(ctx, cx + ring[i].x, cy + ring[i].y, ring[i].z,
                 cx + ring[(i + 1) % 6].x, cy + ring[(i + 1) % 6].y, ring[(i + 1) % 6].z,
                 bondType, '#8b5cf6');
      }

      drawBond(ctx, cx + ring[0].x, cy + ring[0].y, ring[0].z,
               cx + o.x, cy + o.y, o.z);

      for (let i = 0; i < 6; i++) {
        drawAtom(ctx, cx + ring[i].x, cy + ring[i].y, ring[i].z, '#8b5cf6', 'C', 15);
      }
      drawAtom(ctx, cx + o.x, cy + o.y, o.z, '#10b981', 'O⁻', 18);
    };

    const drawDichlorocarbene = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number) => {
      const c = rotate3D(0, 0, 0, 0, rot);
      const cl1 = rotate3D(-30, -25, 0, 0, rot);
      const cl2 = rotate3D(30, -25, 0, 0, rot);

      drawBond(ctx, cx + c.x, cy + c.y, c.z, cx + cl1.x, cy + cl1.y, cl1.z, 'single', '#f59e0b');
      drawBond(ctx, cx + c.x, cy + c.y, c.z, cx + cl2.x, cy + cl2.y, cl2.z, 'single', '#f59e0b');

      drawAtom(ctx, cx + c.x, cy + c.y, c.z, '#f59e0b', 'C:', 16);
      drawAtom(ctx, cx + cl1.x, cy + cl1.y, cl1.z, '#06b6d4', 'Cl', 16);
      drawAtom(ctx, cx + cl2.x, cy + cl2.y, cl2.z, '#06b6d4', 'Cl', 16);
    };

    const drawIntermediateOrtho = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number) => {
      const ring = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 - Math.PI / 2;
        const x = Math.cos(angle) * 50;
        const y = Math.sin(angle) * 50;
        ring.push(rotate3D(x, y, 0, 0, rot));
      }

      const o = rotate3D(0, -85, 0, 0, rot);
      const c = rotate3D(43, -25, 0, 0, rot);
      const cl1 = rotate3D(75, -15, 0, 0, rot);
      const cl2 = rotate3D(65, -50, 0, 0, rot);
      const h = rotate3D(43, 5, 0, 0, rot);

      for (let i = 0; i < 6; i++) {
        const bondType = i % 2 === 0 ? 'double' : 'single';
        drawBond(ctx, cx + ring[i].x, cy + ring[i].y, ring[i].z,
                 cx + ring[(i + 1) % 6].x, cy + ring[(i + 1) % 6].y, ring[(i + 1) % 6].z,
                 bondType, '#8b5cf6');
      }

      drawBond(ctx, cx + ring[0].x, cy + ring[0].y, ring[0].z, cx + o.x, cy + o.y, o.z);
      drawBond(ctx, cx + ring[1].x, cy + ring[1].y, ring[1].z, cx + c.x, cy + c.y, c.z);
      drawBond(ctx, cx + c.x, cy + c.y, c.z, cx + cl1.x, cy + cl1.y, cl1.z);
      drawBond(ctx, cx + c.x, cy + c.y, c.z, cx + cl2.x, cy + cl2.y, cl2.z);
      drawBond(ctx, cx + c.x, cy + c.y, c.z, cx + h.x, cy + h.y, h.z);

      for (let i = 0; i < 6; i++) {
        drawAtom(ctx, cx + ring[i].x, cy + ring[i].y, ring[i].z, '#8b5cf6', 'C', 15);
      }
      drawAtom(ctx, cx + o.x, cy + o.y, o.z, '#10b981', 'O⁻', 18);
      drawAtom(ctx, cx + c.x, cy + c.y, c.z, '#f59e0b', 'C', 15);
      drawAtom(ctx, cx + cl1.x, cy + cl1.y, cl1.z, '#06b6d4', 'Cl', 14);
      drawAtom(ctx, cx + cl2.x, cy + cl2.y, cl2.z, '#06b6d4', 'Cl', 14);
      drawAtom(ctx, cx + h.x, cy + h.y, h.z, '#e2e8f0', 'H', 12);
    };

    const drawSalicylaldehyde = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number) => {
      const ring = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 - Math.PI / 2;
        const x = Math.cos(angle) * 50;
        const y = Math.sin(angle) * 50;
        ring.push(rotate3D(x, y, 0, 0, rot));
      }

      const oh = rotate3D(0, -85, 0, 0, rot);
      const hOH = rotate3D(0, -115, 0, 0, rot);
      const c = rotate3D(43, -25, 0, 0, rot);
      const o = rotate3D(75, -25, 0, 0, rot);
      const h = rotate3D(43, 5, 0, 0, rot);

      for (let i = 0; i < 6; i++) {
        const bondType = i % 2 === 0 ? 'double' : 'single';
        drawBond(ctx, cx + ring[i].x, cy + ring[i].y, ring[i].z,
                 cx + ring[(i + 1) % 6].x, cy + ring[(i + 1) % 6].y, ring[(i + 1) % 6].z,
                 bondType, '#8b5cf6');
      }

      drawBond(ctx, cx + ring[0].x, cy + ring[0].y, ring[0].z, cx + oh.x, cy + oh.y, oh.z);
      drawBond(ctx, cx + oh.x, cy + oh.y, oh.z, cx + hOH.x, cy + hOH.y, hOH.z);
      drawBond(ctx, cx + ring[1].x, cy + ring[1].y, ring[1].z, cx + c.x, cy + c.y, c.z);
      drawBond(ctx, cx + c.x, cy + c.y, c.z, cx + o.x, cy + o.y, o.z, 'double', '#e74c3c');
      drawBond(ctx, cx + c.x, cy + c.y, c.z, cx + h.x, cy + h.y, h.z);

      for (let i = 0; i < 6; i++) {
        drawAtom(ctx, cx + ring[i].x, cy + ring[i].y, ring[i].z, '#8b5cf6', 'C', 15);
      }
      drawAtom(ctx, cx + oh.x, cy + oh.y, oh.z, '#e74c3c', 'O', 16);
      drawAtom(ctx, cx + hOH.x, cy + hOH.y, hOH.z, '#e2e8f0', 'H', 12);
      drawAtom(ctx, cx + c.x, cy + c.y, c.z, '#22c55e', 'C', 15);
      drawAtom(ctx, cx + o.x, cy + o.y, o.z, '#e74c3c', 'O', 16);
      drawAtom(ctx, cx + h.x, cy + h.y, h.z, '#e2e8f0', 'H', 12);
    };

    // --- Main Draw Loop ---
    const draw = () => {
      const { ctx, width, height, rotation } = scene;
      
      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2 - 40;

      // Draw Steps
      if (step === 0) {
        drawPhenol(ctx, centerX - 120, centerY - 20, rotation);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('+', centerX, centerY - 20);

        const base1 = rotate3D(80, -30, 0, 0, rotation);
        const base2 = rotate3D(80, 30, 0, 0, rotation);
        drawAtom(ctx, centerX + base1.x, centerY + base1.y, base1.z, '#10b981', 'OH⁻', 18);
        drawAtom(ctx, centerX + base2.x, centerY + base2.y, base2.z, '#f59e0b', 'CHCl₃', 16);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px Arial';
        ctx.fillText('(Strong base)', centerX + 80, centerY - 50);
        ctx.fillText('(Chloroform)', centerX + 80, centerY + 55);

      } else if (step === 1) {
        drawPhenoxide(ctx, centerX, centerY - 20, rotation);
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('More nucleophilic!', centerX, centerY + 100);

        const water = rotate3D(-100, 60, 0, 0, rotation);
        drawAtom(ctx, centerX + water.x, centerY + water.y, water.z, '#38bdf8', 'H₂O', 16);

      } else if (step === 2) {
        drawPhenoxide(ctx, centerX - 100, centerY - 20, rotation);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('+', centerX, centerY - 20);

        drawDichlorocarbene(ctx, centerX + 100, centerY - 20, rotation);
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Electrophile', centerX + 100, centerY + 50);
        ctx.font = '12px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('(from CHCl₃ + base)', centerX + 100, centerY + 70);

      } else if (step === 3) {
        drawIntermediateOrtho(ctx, centerX, centerY - 20, rotation);

        const arrow = rotate3D(70, -40, 0, 0, rotation);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        const arrowStart = rotate3D(90, -30, 0, 0, rotation);
        ctx.moveTo(centerX + arrowStart.x, centerY + arrowStart.y);
        ctx.lineTo(centerX + arrow.x, centerY + arrow.y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Electrophilic substitution', centerX, centerY + 100);
        ctx.font = '12px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('(at ortho position - most reactive)', centerX, centerY + 120);

      } else if (step === 4) {
        drawSalicylaldehyde(ctx, centerX, centerY - 20, rotation);
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Salicylaldehyde', centerX, centerY + 100);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('(o-Hydroxybenzaldehyde)', centerX, centerY + 120);

        const hcl = rotate3D(-110, 60, 0, 0, rotation);
        drawAtom(ctx, centerX + hcl.x, centerY + hcl.y, hcl.z, '#f87171', 'HCl', 16);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px Arial';
        ctx.fillText('(released)', centerX - 110, centerY + 85);
      }

      // Legend
      const items: LegendItem[] = [
        { color: '#8b5cf6', label: 'C - Carbon' },
        { color: '#e74c3c', label: 'O - Oxygen' },
        { color: '#06b6d4', label: 'Cl - Chlorine' },
        { color: '#e2e8f0', label: 'H - Hydrogen' }
      ];
      let y = height - 230;
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      items.forEach((item, i) => {
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(20, y + i * 22, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(item.label, 35, y + i * 22 + 4);
      });

      // Chemical Equations Box
      const boxY = height - 160;
      const boxHeight = 145;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fillRect(0, boxY, width, boxHeight);
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, boxY, width, boxHeight);
      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 15px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Chemical Equations - Reimer-Tiemann Reaction', width / 2, boxY + 22);

      const equations = [
        'Overall Reaction:',
        'C₆H₅OH + CHCl₃ + 3NaOH →[Δ] o-HOC₆H₄CHO + 3NaCl + 2H₂O',
        '',
        'Step-by-step:',
        '1. CHCl₃ + OH⁻ → CCl₃⁻ + H₂O  (deprotonation)',
        '2. CCl₃⁻ → :CCl₂ + Cl⁻  (carbene formation)',
        '3. C₆H₅O⁻ + :CCl₂ → o-C₆H₄(O⁻)CHCl₂  (attack)',
        '4. Hydrolysis → o-HOC₆H₄CHO + 2HCl  (aldehyde)',
        '',
        '• Product: Salicylaldehyde (ortho > para)',
        '• Mechanism: Electrophilic aromatic substitution'
      ];

      let eqY = boxY + 45;
      ctx.textAlign = 'left';
      equations.forEach((eq, i) => {
        if (i === 0 || i === 3) {
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 13px Courier New';
        } else if (i === 2 || i === 8) {
          return;
        } else if (i > 8) {
          ctx.fillStyle = '#22c55e';
          ctx.font = 'bold 11px Courier New';
        } else if (i > 3 && i < 8) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '11px Courier New';
        } else {
          ctx.fillStyle = '#e0e0e0';
          ctx.font = '12px Courier New';
        }
        ctx.fillText(eq, 15, eqY);
        eqY += (i === 0 || i === 3) ? 18 : 14;
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
            <h1 className="text-4xl font-bold text-white mb-1">Reimer-Tiemann Reaction</h1>
            <p className="text-teal-400/80 text-sm">Formylation of phenols with chloroform and base</p>
        </div>
        <div className="bg-teal-900/20 border border-teal-800/50 p-2 rounded-lg text-teal-400">
            <Hexagon size={24} />
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
            The Reimer-Tiemann reaction converts phenols to ortho-hydroxybenzaldehydes (salicylaldehydes) 
            using chloroform and strong base under heating conditions.
          </p>
          
          <div className="space-y-3">
             <div className="text-sm border-l-2 border-teal-500 pl-3">
               <strong className="text-teal-400 block mb-1">Key Features:</strong>
               <span className="text-slate-400 block mb-1">Ortho-selective formylation of phenols.</span>
               <span className="text-slate-400 block mb-1">Involves dichlorocarbene (:CCl₂) intermediate.</span>
               <span className="text-slate-400 block">Requires strong base (NaOH/KOH) and heating.</span>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
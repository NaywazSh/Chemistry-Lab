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

export default function PeptideBondPage() {
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

    // --- Amino Acid Drawing Functions ---

    const drawAminoAcid1 = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number) => {
      // N-terminal amino acid
      const nh2 = rotate3D(-120, 0, 0, 0, rot);
      const c1 = rotate3D(-80, 0, 0, 0, rot);
      const c2 = rotate3D(-40, 0, 0, 0, rot);
      const oh = rotate3D(-40, -40, 0, 0, rot);
      const r1 = rotate3D(-40, 40, 0, 0, rot);

      // Bonds
      drawBond(ctx, cx + nh2.x, cy + nh2.y, nh2.z, cx + c1.x, cy + c1.y, c1.z);
      drawBond(ctx, cx + c1.x, cy + c1.y, c1.z, cx + c2.x, cy + c2.y, c2.z);
      drawBond(ctx, cx + c2.x, cy + c2.y, c2.z, cx + oh.x, cy + oh.y, oh.z, 'double');
      drawBond(ctx, cx + c2.x, cy + c2.y, c2.z, cx + r1.x, cy + r1.y, r1.z);

      // Atoms
      drawAtom(ctx, cx + nh2.x, cy + nh2.y, nh2.z, '#3b82f6', 'NH₂', 16);
      drawAtom(ctx, cx + c1.x, cy + c1.y, c1.z, '#8b5cf6', 'CH', 15);
      drawAtom(ctx, cx + c2.x, cy + c2.y, c2.z, '#8b5cf6', 'C', 15);
      drawAtom(ctx, cx + oh.x, cy + oh.y, oh.z, '#e74c3c', 'O', 16);
      drawAtom(ctx, cx + r1.x, cy + r1.y, r1.z, '#f59e0b', 'R₁', 16);

      // Label
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Amino Acid 1', cx - 80, cy + 50);
    };

    const drawAminoAcid2 = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number) => {
      // C-terminal amino acid
      const h2n = rotate3D(40, 0, 0, 0, rot);
      const c1 = rotate3D(80, 0, 0, 0, rot);
      const c2 = rotate3D(120, 0, 0, 0, rot);
      const oh = rotate3D(120, -40, 0, 0, rot);
      const r2 = rotate3D(120, 40, 0, 0, rot);

      // Bonds
      drawBond(ctx, cx + h2n.x, cy + h2n.y, h2n.z, cx + c1.x, cy + c1.y, c1.z);
      drawBond(ctx, cx + c1.x, cy + c1.y, c1.z, cx + c2.x, cy + c2.y, c2.z);
      drawBond(ctx, cx + c2.x, cy + c2.y, c2.z, cx + oh.x, cy + oh.y, oh.z, 'double');
      drawBond(ctx, cx + c2.x, cy + c2.y, c2.z, cx + r2.x, cy + r2.y, r2.z);

      // Atoms
      drawAtom(ctx, cx + h2n.x, cy + h2n.y, h2n.z, '#3b82f6', 'H₂N', 16);
      drawAtom(ctx, cx + c1.x, cy + c1.y, c1.z, '#8b5cf6', 'CH', 15);
      drawAtom(ctx, cx + c2.x, cy + c2.y, c2.z, '#8b5cf6', 'C', 15);
      drawAtom(ctx, cx + oh.x, cy + oh.y, oh.z, '#e74c3c', 'OH', 16);
      drawAtom(ctx, cx + r2.x, cy + r2.y, r2.z, '#f59e0b', 'R₂', 16);

      // Label
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Amino Acid 2', cx + 80, cy + 50);
    };

    const drawApproaching = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number) => {
      // Amino Acid 1 (left)
      const c1 = rotate3D(-80, 0, 0, 0, rot);
      const co1 = rotate3D(-40, -40, 0, 0, rot);
      const oh1 = rotate3D(-20, -60, 0, 0, rot);
      
      // Amino Acid 2 (right)
      const nh2 = rotate3D(40, 0, 0, 0, rot);
      const h1 = rotate3D(65, 0, 0, 0, rot);
      const h2 = rotate3D(40, 25, 0, 0, rot);

      // Draw partial structures
      drawBond(ctx, cx + c1.x, cy + c1.y, c1.z, cx + co1.x, cy + co1.y, co1.z, 'double');
      drawBond(ctx, cx + co1.x, cy + co1.y, co1.z, cx + oh1.x, cy + oh1.y, oh1.z);

      drawAtom(ctx, cx + nh2.x, cy + nh2.y, nh2.z, '#3b82f6', 'NH₂', 16);
      drawAtom(ctx, cx + h1.x, cy + h1.y, h1.z, '#e2e8f0', 'H', 12);
      drawAtom(ctx, cx + h2.x, cy + h2.y, h2.z, '#e2e8f0', 'H', 12);
      drawAtom(ctx, cx + c1.x, cy + c1.y, c1.z, '#8b5cf6', 'C', 15);
      drawAtom(ctx, cx + co1.x, cy + co1.y, co1.z, '#e74c3c', 'O', 16);
      drawAtom(ctx, cx + oh1.x, cy + oh1.y, oh1.z, '#e74c3c', 'OH', 16);

      // Reaction arrow
      const arrowStart = rotate3D(-20, -60, 0, 0, rot);
      const arrowEnd = rotate3D(20, -20, 0, 0, rot);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(cx + arrowStart.x, cy + arrowStart.y);
      ctx.lineTo(cx + arrowEnd.x, cy + arrowEnd.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Labels
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Nucleophilic Attack', cx, cy + 80);
    };

    const drawTetrahedralIntermediate = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number) => {
      // Central carbon
      const c = rotate3D(0, 0, 0, 0, rot);
      
      // Four substituents
      const oh = rotate3D(-40, -40, 0, 0, rot);
      const o = rotate3D(40, -40, 0, 0, rot);
      const nh = rotate3D(0, 40, 0, 0, rot);
      const r = rotate3D(0, 0, 40, 0, rot);

      // Bonds
      drawBond(ctx, cx + c.x, cy + c.y, c.z, cx + oh.x, cy + oh.y, oh.z);
      drawBond(ctx, cx + c.x, cy + c.y, c.z, cx + o.x, cy + o.y, o.z);
      drawBond(ctx, cx + c.x, cy + c.y, c.z, cx + nh.x, cy + nh.y, nh.z);
      drawBond(ctx, cx + c.x, cy + c.y, c.z, cx + r.x, cy + r.y, r.z);

      // Atoms
      drawAtom(ctx, cx + c.x, cy + c.y, c.z, '#8b5cf6', 'C', 16);
      drawAtom(ctx, cx + oh.x, cy + oh.y, oh.z, '#e74c3c', 'OH', 16);
      drawAtom(ctx, cx + o.x, cy + o.y, o.z, '#e74c3c', 'O⁻', 16);
      drawAtom(ctx, cx + nh.x, cy + nh.y, nh.z, '#3b82f6', 'NH₂', 16);
      drawAtom(ctx, cx + r.x, cy + r.y, r.z, '#f59e0b', 'R₁', 15);

      // Water molecule leaving
      const water = rotate3D(-80, -60, 0, 0, rot);
      drawAtom(ctx, cx + water.x, cy + water.y, water.z, '#38bdf8', 'H₂O', 18);
      
      // Arrow showing water leaving
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(cx + oh.x, cy + oh.y);
      ctx.lineTo(cx + water.x, cy + water.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Labels
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Tetrahedral Intermediate', cx, cy + 100);
      ctx.font = '12px Arial';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('(OH⁻ leaves as H₂O)', cx, cy + 120);
    };

    const drawPeptideBond = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number) => {
      // Peptide bond structure
      const nh = rotate3D(-80, 0, 0, 0, rot);
      const ch1 = rotate3D(-40, 0, 0, 0, rot);
      const c = rotate3D(0, 0, 0, 0, rot);
      const o = rotate3D(0, -40, 0, 0, rot);
      const n = rotate3D(40, 0, 0, 0, rot);
      const ch2 = rotate3D(80, 0, 0, 0, rot);
      const oh = rotate3D(80, -40, 0, 0, rot);
      const r1 = rotate3D(-40, 40, 0, 0, rot);
      const r2 = rotate3D(40, 40, 0, 0, rot);

      // Bonds
      drawBond(ctx, cx + nh.x, cy + nh.y, nh.z, cx + ch1.x, cy + ch1.y, ch1.z);
      drawBond(ctx, cx + ch1.x, cy + ch1.y, ch1.z, cx + c.x, cy + c.y, c.z);
      drawBond(ctx, cx + c.x, cy + c.y, c.z, cx + o.x, cy + o.y, o.z, 'double');
      drawBond(ctx, cx + c.x, cy + c.y, c.z, cx + n.x, cy + n.y, n.z);
      drawBond(ctx, cx + n.x, cy + n.y, n.z, cx + ch2.x, cy + ch2.y, ch2.z);
      drawBond(ctx, cx + ch2.x, cy + ch2.y, ch2.z, cx + oh.x, cy + oh.y, oh.z);
      drawBond(ctx, cx + ch1.x, cy + ch1.y, ch1.z, cx + r1.x, cy + r1.y, r1.z);
      drawBond(ctx, cx + ch2.x, cy + ch2.y, ch2.z, cx + r2.x, cy + r2.y, r2.z);

      // Highlight peptide bond
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx + c.x, cy + c.y);
      ctx.lineTo(cx + n.x, cy + n.y);
      ctx.stroke();

      // Atoms
      drawAtom(ctx, cx + nh.x, cy + nh.y, nh.z, '#3b82f6', 'NH₂', 15);
      drawAtom(ctx, cx + ch1.x, cy + ch1.y, ch1.z, '#8b5cf6', 'CH', 14);
      drawAtom(ctx, cx + c.x, cy + c.y, c.z, '#8b5cf6', 'C', 15);
      drawAtom(ctx, cx + o.x, cy + o.y, o.z, '#e74c3c', 'O', 16);
      drawAtom(ctx, cx + n.x, cy + n.y, n.z, '#3b82f6', 'N', 16);
      drawAtom(ctx, cx + ch2.x, cy + ch2.y, ch2.z, '#8b5cf6', 'CH', 14);
      drawAtom(ctx, cx + oh.x, cy + oh.y, oh.z, '#e74c3c', 'OH', 16);
      drawAtom(ctx, cx + r1.x, cy + r1.y, r1.z, '#f59e0b', 'R₁', 15);
      drawAtom(ctx, cx + r2.x, cy + r2.y, r2.z, '#f59e0b', 'R₂', 15);

      // Labels
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Peptide Bond Formed!', cx, cy + 100);
      ctx.font = '14px Arial';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('(C-N bond with H₂O eliminated)', cx, cy + 120);

      // Water product
      const water = rotate3D(100, 60, 0, 0, rot);
      drawAtom(ctx, cx + water.x, cy + water.y, water.z, '#38bdf8', 'H₂O', 18);
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
        drawAminoAcid1(ctx, centerX - 120, centerY - 20, rotation);
        drawAminoAcid2(ctx, centerX + 120, centerY - 20, rotation);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('+', centerX, centerY - 20);

        // Enzyme catalyst
        const enzyme = rotate3D(0, -100, 0, 0, rotation);
        drawAtom(ctx, centerX + enzyme.x, centerY + enzyme.y, enzyme.z, '#ec4899', 'Enzyme', 20);
        ctx.fillStyle = '#ec4899';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('(Ribosome in cells)', centerX, centerY + 80);

      } else if (step === 1) {
        drawApproaching(ctx, centerX, centerY - 20, rotation);
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('NH₂ attacks carbonyl carbon', centerX, centerY + 105);
        ctx.font = '12px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('(Nucleophilic addition)', centerX, centerY + 125);

      } else if (step === 2) {
        drawTetrahedralIntermediate(ctx, centerX, centerY - 20, rotation);
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('OH⁻ protonated → H₂O leaves', centerX, centerY + 140);
        ctx.font = '12px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('(Condensation - dehydration)', centerX, centerY + 160);

      } else if (step === 3) {
        drawPeptideBond(ctx, centerX, centerY - 20, rotation);
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Dipeptide + Water', centerX, centerY + 140);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('(Reversible - hydrolysis possible)', centerX, centerY + 160);
      }

      // Legend
      const items: LegendItem[] = [
        { color: '#8b5cf6', label: 'C - Carbon' },
        { color: '#3b82f6', label: 'N - Nitrogen' },
        { color: '#e74c3c', label: 'O - Oxygen' },
        { color: '#f59e0b', label: 'R - Side Chain' },
        { color: '#e2e8f0', label: 'H - Hydrogen' }
      ];
      let y = height - 250;
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
      ctx.fillText('Peptide Bond Formation - Chemical Equations', width / 2, boxY + 22);

      const equations = [
        'General Reaction:',
        'H₂N-CHR₁-COOH  +  H₂N-CHR₂-COOH  →  H₂N-CHR₁-CO-NH-CHR₂-COOH  +  H₂O',
        '',
        'Mechanism Steps:',
        '1. Nucleophilic attack: NH₂ on C=O → tetrahedral intermediate',
        '2. Proton transfer: OH⁻ + H⁺ → H₂O',
        '3. Elimination: H₂O leaves → C-N peptide bond',
        '',
        'Biological Context:',
        '• Catalyzed by ribosome (enzyme complex)',
        '• Requires ATP energy in living cells',
        '• Forms protein backbone (primary structure)'
      ];

      let eqY = boxY + 45;
      ctx.textAlign = 'left';
      equations.forEach((eq, i) => {
        if (i === 0 || i === 3) {
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 13px Courier New';
        } else if (i === 2 || i === 6) {
          return;
        } else if (i > 6) {
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

  const stepNames = ['Amino Acids', 'Nucleophilic Attack', 'Tetrahedral Intermediate', 'Peptide Bond'];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#020617]">
      
      {/* Header */}
      <div className="absolute top-0 left-0 p-6 z-10 w-full flex justify-between items-start pointer-events-none">
        <div>
            <Link href="/" className="pointer-events-auto flex items-center text-teal-400 hover:text-teal-300 transition-colors gap-2 text-sm font-bold uppercase tracking-widest mb-2">
                <ArrowLeft size={16} /> Back to Lab
            </Link>
            <h1 className="text-4xl font-bold text-white mb-1">Peptide Bond Formation</h1>
            <p className="text-teal-400/80 text-sm">Condensation reaction between amino acids</p>
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
          <span className="text-xs text-slate-300 ml-1">({stepNames[step]})</span>
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
          <h3 className="text-xl font-bold text-white mb-3">Peptide Bond Mechanism</h3>
          <p className="text-slate-300 text-sm mb-4 leading-relaxed">
            Peptide bond formation is a condensation reaction that links amino acids together, 
            forming the backbone of proteins. This reaction eliminates water and creates the 
            characteristic C-N bond of peptides and proteins.
          </p>
          
          <div className="space-y-3">
             <div className="text-sm border-l-2 border-teal-500 pl-3">
               <strong className="text-teal-400 block mb-1">Key Features:</strong>
               <span className="text-slate-400 block mb-1">Condensation (dehydration) reaction.</span>
               <span className="text-slate-400 block mb-1">Forms C-N peptide bonds between amino acids.</span>
               <span className="text-slate-400 block mb-1">Eliminates one water molecule per bond.</span>
               <span className="text-slate-400 block">Catalyzed by ribosomes in living cells.</span>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
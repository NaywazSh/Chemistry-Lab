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

const reagentTypes = [
  'Oxidizing - KMnO₄',
  'Reducing - LiAlH₄',
  'Nucleophile - CN⁻',
  'Electrophile - Br₂',
  'Grignard - RMgX'
];

const stepNames = ['Substrate', 'Reagent', 'Product'];

export default function ReagentsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reagentType, setReagentType] = useState(0);
  const [step, setStep] = useState(0);
  const [showInfo, setShowInfo] = useState(true);
  const animationRef = useRef<number>(0);
  const sceneRef = useRef<Scene | null>(null);

  const totalSteps = 3;

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
      const R = Math.min(255, Math.max(0, (num >> 16) + amt));
      const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
      const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
      return '#' + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
    };

    const rotate3D = (x: number, y: number, z: number, rot: number): Point3D => {
      const x1 = x * Math.cos(rot) - z * Math.sin(rot);
      const z1 = x * Math.sin(rot) + z * Math.cos(rot);
      return { x: x1, y, z: z1 };
    };

    const drawAtom = (ctx: CanvasRenderingContext2D, x: number, y: number, z: number, color: string, label: string, size = 18) => {
      const scale = 1 / (1 + z * 0.0008);
      const screenX = x * scale;
      const screenY = y * scale;
      const radius = size * scale;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 8 * scale;
      const gradient = ctx.createRadialGradient(
        screenX - radius * 0.3, screenY - radius * 0.3, 0,
        screenX, screenY, radius
      );
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, shadeColor(color, -35));
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${12 * scale}px Arial`;
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

    // --- Drawing Functions for Each Reagent Type ---

    const drawOxidizing = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number, currentStep: number) => {
      if (currentStep === 0) {
        const p1 = rotate3D(-60, 0, 0, rot);
        const p2 = rotate3D(0, 0, 0, rot);
        const p3 = rotate3D(0, -40, 0, rot);
        
        drawBond(ctx, cx + p1.x, cy + p1.y, p1.z, cx + p2.x, cy + p2.y, p2.z);
        drawBond(ctx, cx + p2.x, cy + p2.y, p2.z, cx + p3.x, cy + p3.y, p3.z);
        
        drawAtom(ctx, cx + p1.x, cy + p1.y, p1.z, '#8b5cf6', 'R', 16);
        drawAtom(ctx, cx + p2.x, cy + p2.y, p2.z, '#8b5cf6', 'CH₂', 16);
        drawAtom(ctx, cx + p3.x, cy + p3.y, p3.z, '#e74c3c', 'OH', 16);
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Alcohol (R-CH₂OH)', cx, cy + 80);
        
      } else if (currentStep === 1) {
        drawAtom(ctx, cx, cy, 0, '#c026d3', 'KMnO₄', 24);
        ctx.fillStyle = '#c026d3';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Potassium Permanganate', cx, cy + 70);
        ctx.font = '13px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Strong oxidizing agent [O]', cx, cy + 90);
        
      } else {
        const p1 = rotate3D(-60, 0, 0, rot);
        const p2 = rotate3D(0, 0, 0, rot);
        const p3 = rotate3D(0, -40, 0, rot);
        const p4 = rotate3D(30, 0, 0, rot);
        
        drawBond(ctx, cx + p1.x, cy + p1.y, p1.z, cx + p2.x, cy + p2.y, p2.z);
        drawBond(ctx, cx + p2.x, cy + p2.y, p2.z, cx + p3.x, cy + p3.y, p3.z, 'double');
        drawBond(ctx, cx + p2.x, cy + p2.y, p2.z, cx + p4.x, cy + p4.y, p4.z);
        
        drawAtom(ctx, cx + p1.x, cy + p1.y, p1.z, '#22c55e', 'R', 16);
        drawAtom(ctx, cx + p2.x, cy + p2.y, p2.z, '#22c55e', 'C', 16);
        drawAtom(ctx, cx + p3.x, cy + p3.y, p3.z, '#22c55e', 'O', 16);
        drawAtom(ctx, cx + p4.x, cy + p4.y, p4.z, '#22c55e', 'OH', 16);
        
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Carboxylic Acid (R-COOH)', cx, cy + 70);
      }
    };

    const drawReducing = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number, currentStep: number) => {
      if (currentStep === 0) {
        const p1 = rotate3D(-60, 0, 0, rot);
        const p2 = rotate3D(0, 0, 0, rot);
        const p3 = rotate3D(0, -40, 0, rot);
        
        drawBond(ctx, cx + p1.x, cy + p1.y, p1.z, cx + p2.x, cy + p2.y, p2.z);
        drawBond(ctx, cx + p2.x, cy + p2.y, p2.z, cx + p3.x, cy + p3.y, p3.z, 'double');
        
        drawAtom(ctx, cx + p1.x, cy + p1.y, p1.z, '#8b5cf6', 'R', 16);
        drawAtom(ctx, cx + p2.x, cy + p2.y, p2.z, '#8b5cf6', 'C', 16);
        drawAtom(ctx, cx + p3.x, cy + p3.y, p3.z, '#e74c3c', 'O', 16);
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Ketone/Aldehyde (R-C=O)', cx, cy + 80);
        
      } else if (currentStep === 1) {
        drawAtom(ctx, cx, cy, 0, '#06b6d4', 'LiAlH₄', 24);
        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Lithium Aluminum Hydride', cx, cy + 70);
        ctx.font = '13px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Strong reducing agent - H⁻ donor', cx, cy + 90);
        
      } else {
        const p1 = rotate3D(-60, 0, 0, rot);
        const p2 = rotate3D(0, 0, 0, rot);
        const p3 = rotate3D(0, -40, 0, rot);
        
        drawBond(ctx, cx + p1.x, cy + p1.y, p1.z, cx + p2.x, cy + p2.y, p2.z);
        drawBond(ctx, cx + p2.x, cy + p2.y, p2.z, cx + p3.x, cy + p3.y, p3.z);
        
        drawAtom(ctx, cx + p1.x, cy + p1.y, p1.z, '#22c55e', 'R', 16);
        drawAtom(ctx, cx + p2.x, cy + p2.y, p2.z, '#22c55e', 'CH₂', 16);
        drawAtom(ctx, cx + p3.x, cy + p3.y, p3.z, '#22c55e', 'OH', 16);
        
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Alcohol (R-CH₂OH)', cx, cy + 70);
      }
    };

    const drawNucleophile = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number, currentStep: number) => {
      if (currentStep === 0) {
        const p1 = rotate3D(-30, 0, 0, rot);
        const p2 = rotate3D(30, 0, 0, rot);
        
        drawBond(ctx, cx + p1.x, cy + p1.y, p1.z, cx + p2.x, cy + p2.y, p2.z);
        
        drawAtom(ctx, cx + p1.x, cy + p1.y, p1.z, '#8b5cf6', 'R', 16);
        drawAtom(ctx, cx + p2.x, cy + p2.y, p2.z, '#f59e0b', 'Br', 16);
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Alkyl Halide (R-Br)', cx, cy + 70);
        
      } else if (currentStep === 1) {
        drawAtom(ctx, cx, cy, 0, '#10b981', 'CN⁻', 24);
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Cyanide Ion', cx, cy + 70);
        ctx.font = '13px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Strong nucleophile - attacks C', cx, cy + 90);
        
      } else {
        const p1 = rotate3D(-60, 0, 0, rot);
        const p2 = rotate3D(-20, 0, 0, rot);
        const p3 = rotate3D(20, 0, 0, rot);
        
        drawBond(ctx, cx + p1.x, cy + p1.y, p1.z, cx + p2.x, cy + p2.y, p2.z);
        drawBond(ctx, cx + p2.x, cy + p2.y, p2.z, cx + p3.x, cy + p3.y, p3.z);
        
        drawAtom(ctx, cx + p1.x, cy + p1.y, p1.z, '#22c55e', 'R', 16);
        drawAtom(ctx, cx + p2.x, cy + p2.y, p2.z, '#22c55e', 'CH₂', 16);
        drawAtom(ctx, cx + p3.x, cy + p3.y, p3.z, '#22c55e', 'CN', 16);
        
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Nitrile (R-CH₂CN)', cx, cy + 70);
      }
    };

    const drawElectrophile = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number, currentStep: number) => {
      if (currentStep === 0) {
        const p1 = rotate3D(-30, 0, 0, rot);
        const p2 = rotate3D(30, 0, 0, rot);
        
        drawBond(ctx, cx + p1.x, cy + p1.y, p1.z, cx + p2.x, cy + p2.y, p2.z, 'double', '#f59e0b');
        
        drawAtom(ctx, cx + p1.x, cy + p1.y, p1.z, '#8b5cf6', 'C', 16);
        drawAtom(ctx, cx + p2.x, cy + p2.y, p2.z, '#8b5cf6', 'C', 16);
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Alkene (C=C)', cx, cy + 70);
        
      } else if (currentStep === 1) {
        drawAtom(ctx, cx, cy, 0, '#f59e0b', 'Br₂', 24);
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Bromine', cx, cy + 70);
        ctx.font = '13px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Electrophile - adds across double bond', cx, cy + 90);
        
      } else {
        const p1 = rotate3D(-40, 0, 0, rot);
        const p2 = rotate3D(0, 0, 0, rot);
        const p3 = rotate3D(0, -35, 0, rot);
        const p4 = rotate3D(40, 0, 0, rot);
        const p5 = rotate3D(40, -35, 0, rot);
        
        drawBond(ctx, cx + p1.x, cy + p1.y, p1.z, cx + p2.x, cy + p2.y, p2.z);
        drawBond(ctx, cx + p2.x, cy + p2.y, p2.z, cx + p3.x, cy + p3.y, p3.z);
        drawBond(ctx, cx + p2.x, cy + p2.y, p2.z, cx + p4.x, cy + p4.y, p4.z);
        drawBond(ctx, cx + p4.x, cy + p4.y, p4.z, cx + p5.x, cy + p5.y, p5.z);
        
        drawAtom(ctx, cx + p1.x, cy + p1.y, p1.z, '#22c55e', 'R', 14);
        drawAtom(ctx, cx + p2.x, cy + p2.y, p2.z, '#22c55e', 'C', 16);
        drawAtom(ctx, cx + p3.x, cy + p3.y, p3.z, '#22c55e', 'Br', 14);
        drawAtom(ctx, cx + p4.x, cy + p4.y, p4.z, '#22c55e', 'C', 16);
        drawAtom(ctx, cx + p5.x, cy + p5.y, p5.z, '#22c55e', 'Br', 14);
        
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Dibromide (R-CHBr-CHBr-R)', cx, cy + 70);
      }
    };

    const drawGrignard = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number, currentStep: number) => {
      if (currentStep === 0) {
        const p1 = rotate3D(-30, 0, 0, rot);
        const p2 = rotate3D(30, 0, 0, rot);
        
        drawBond(ctx, cx + p1.x, cy + p1.y, p1.z, cx + p2.x, cy + p2.y, p2.z, 'double');
        
        drawAtom(ctx, cx + p1.x, cy + p1.y, p1.z, '#8b5cf6', 'C', 16);
        drawAtom(ctx, cx + p2.x, cy + p2.y, p2.z, '#e74c3c', 'O', 16);
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Carbonyl (C=O)', cx, cy + 70);
        
      } else if (currentStep === 1) {
        drawAtom(ctx, cx, cy, 0, '#a855f7', 'RMgX', 24);
        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Grignard Reagent', cx, cy + 70);
        ctx.font = '13px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Strong nucleophile - R⁻ attacks C=O', cx, cy + 90);
        
      } else {
        const p1 = rotate3D(-60, 0, 0, rot);
        const p2 = rotate3D(-20, 0, 0, rot);
        const p3 = rotate3D(20, 0, 0, rot);
        const p4 = rotate3D(20, -35, 0, rot);
        
        drawBond(ctx, cx + p1.x, cy + p1.y, p1.z, cx + p2.x, cy + p2.y, p2.z);
        drawBond(ctx, cx + p2.x, cy + p2.y, p2.z, cx + p3.x, cy + p3.y, p3.z);
        drawBond(ctx, cx + p3.x, cy + p3.y, p3.z, cx + p4.x, cy + p4.y, p4.z);
        
        drawAtom(ctx, cx + p1.x, cy + p1.y, p1.z, '#22c55e', 'R\'', 14);
        drawAtom(ctx, cx + p2.x, cy + p2.y, p2.z, '#22c55e', 'C', 16);
        drawAtom(ctx, cx + p3.x, cy + p3.y, p3.z, '#22c55e', 'R', 14);
        drawAtom(ctx, cx + p4.x, cy + p4.y, p4.z, '#22c55e', 'OH', 14);
        
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Alcohol (R\'-C(R)-OH)', cx, cy + 70);
      }
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

      // Draw current reagent type and step
      if (reagentType === 0) {
        drawOxidizing(ctx, centerX, centerY, rotation, step);
      } else if (reagentType === 1) {
        drawReducing(ctx, centerX, centerY, rotation, step);
      } else if (reagentType === 2) {
        drawNucleophile(ctx, centerX, centerY, rotation, step);
      } else if (reagentType === 3) {
        drawElectrophile(ctx, centerX, centerY, rotation, step);
      } else {
        drawGrignard(ctx, centerX, centerY, rotation, step);
      }

      // Legend
      const items: LegendItem[] = [
        { color: '#8b5cf6', label: 'C - Carbon' },
        { color: '#e74c3c', label: 'O - Oxygen' },
        { color: '#06b6d4', label: 'Br - Bromine' },
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
      ctx.fillText('Common Reagent Examples & Uses', width / 2, boxY + 22);

      const reagentInfo = [
        ['KMnO₄: R-CH₂OH → R-COOH (Oxidation)', '• Strong oxidizer, adds oxygen/removes H', '• Converts alcohols → carboxylic acids'],
        ['LiAlH₄: R-C=O → R-CH₂OH (Reduction)', '• Strong reducer, donates H⁻ hydride', '• Converts carbonyls → alcohols'],
        ['CN⁻: R-Br → R-CN (Nucleophilic Sub)', '• Strong nucleophile, attacks C⁺', '• SN2 substitution, C-C bond formation'],
        ['Br₂: C=C → C-Br-C-Br (Electrophilic)', '• Electrophile, adds to double bonds', '• Anti-addition across alkenes'],
        ['RMgX: C=O → R-C(OH)-R\' (Grignard)', '• Forms C-C bonds, very nucleophilic', '• Reacts with ketones/aldehydes']
      ];

      const currentInfo = reagentInfo[reagentType];
      let eqY = boxY + 50;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 13px Courier New';
      ctx.fillText(currentInfo[0], 15, eqY);
      eqY += 20;
      
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Courier New';
      ctx.fillText(currentInfo[1], 15, eqY);
      eqY += 15;
      ctx.fillText(currentInfo[2], 15, eqY);
      
      eqY += 20;
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 11px Arial';
      ctx.fillText('Reagents bring about specific chemical transformations!', 15, eqY);

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
  }, [step, reagentType, isPlaying]);

  useEffect(() => {
    if (sceneRef.current) {
        sceneRef.current.autoRotate = isPlaying;
    }
  }, [isPlaying]);

  const nextStep = () => {
    if (step === totalSteps - 1) {
      setReagentType((prev) => (prev + 1) % reagentTypes.length);
      setStep(0);
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (step === 0) {
      setReagentType((prev) => (prev - 1 + reagentTypes.length) % reagentTypes.length);
      setStep(totalSteps - 1);
    } else {
      setStep((prev) => prev - 1);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#020617]">
      
      {/* Header */}
      <div className="absolute top-0 left-0 p-6 z-10 w-full flex justify-between items-start pointer-events-none">
        <div>
            <Link href="/" className="pointer-events-auto flex items-center text-teal-400 hover:text-teal-300 transition-colors gap-2 text-sm font-bold uppercase tracking-widest mb-2">
                <ArrowLeft size={16} /> Back to Lab
            </Link>
            <h1 className="text-4xl font-bold text-white mb-1">Reagents in Organic Chemistry</h1>
            <p className="text-teal-400/80 text-sm">Common reagents and their transformations</p>
        </div>
        <div className="bg-teal-900/20 border border-teal-800/50 p-2 rounded-lg text-teal-400">
            <Hexagon size={24} />
        </div>
      </div>

      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Reagent Type Selector */}
      <div className="absolute top-28 left-1/2 -translate-x-1/2 flex gap-2 z-20 flex-wrap justify-center">
        {reagentTypes.map((type, index) => (
          <button
            key={index}
            onClick={() => { setReagentType(index); setStep(0); }}
            className={`px-4 py-2 rounded-xl border transition-all text-sm font-medium ${
              reagentType === index
                ? 'bg-teal-600 border-teal-500 text-white shadow-lg shadow-teal-900/50'
                : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:bg-slate-700/90'
            }`}
          >
            {type.split(' - ')[0]}
          </button>
        ))}
      </div>

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
          onClick={() => { setStep(0); setReagentType(0); }}
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
          <h3 className="text-xl font-bold text-white mb-3">Reagent Types</h3>
          <p className="text-slate-300 text-sm mb-4 leading-relaxed">
            Reagents are substances that bring about specific chemical transformations. 
            Each reagent has unique properties that determine its reactivity and selectivity.
          </p>
          
          <div className="space-y-3">
             <div className="text-sm border-l-2 border-teal-500 pl-3">
               <strong className="text-teal-400 block mb-1">Key Types:</strong>
               <span className="text-slate-400 block mb-1">Oxidizing agents (add oxygen/remove hydrogen).</span>
               <span className="text-slate-400 block mb-1">Reducing agents (add hydrogen/remove oxygen).</span>
               <span className="text-slate-400 block mb-1">Nucleophiles (electron-rich, attack positive centers).</span>
               <span className="text-slate-400 block">Electrophiles (electron-poor, attack negative centers).</span>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
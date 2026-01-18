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

const catalystTypes = [
  'Acid Catalyst - Esterification',
  'Base Catalyst - Aldol Condensation',
  'Metal Catalyst - Hydrogenation',
  'Enzyme Catalyst - Biochemical'
];

export default function CatalystsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [catalystType, setCatalystType] = useState(0);
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

    const drawEnergyDiagram = (ctx: CanvasRenderingContext2D, cx: number, cy: number, withCatalyst: boolean) => {
      const width = 300;
      const height = 150;
      const startX = cx - width / 2;
      const startY = cy + height / 2;

      // Axes
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX, startY - height);
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX + width, startY);
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Reaction Progress →', cx, startY + 20);
      ctx.save();
      ctx.translate(startX - 20, cy);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Energy', 0, 0);
      ctx.restore();

      if (!withCatalyst) {
        // Without catalyst - higher activation energy
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX + 30, startY - 40);
        ctx.quadraticCurveTo(startX + 100, startY - 130, startX + 150, startY - 100);
        ctx.quadraticCurveTo(startX + 200, startY - 70, startX + 270, startY - 50);
        ctx.stroke();

        // Peak label
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 11px Arial';
        ctx.fillText('High Ea', startX + 150, startY - 115);
        ctx.fillText('(without catalyst)', startX + 150, startY - 100);
      } else {
        // With catalyst - lower activation energy
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX + 30, startY - 40);
        ctx.quadraticCurveTo(startX + 100, startY - 85, startX + 150, startY - 75);
        ctx.quadraticCurveTo(startX + 200, startY - 65, startX + 270, startY - 50);
        ctx.stroke();

        // Lower peak
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 11px Arial';
        ctx.fillText('Lower Ea', startX + 150, startY - 90);
        ctx.fillText('(with catalyst)', startX + 150, startY - 75);

        // Show original path faintly
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(startX + 30, startY - 40);
        ctx.quadraticCurveTo(startX + 100, startY - 130, startX + 150, startY - 100);
        ctx.quadraticCurveTo(startX + 200, startY - 70, startX + 270, startY - 50);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Reactants and Products labels
      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 12px Arial';
      ctx.fillText('R', startX + 30, startY - 25);
      ctx.fillText('P', startX + 270, startY - 35);
    };

    const drawAcidCatalysis = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number, currentStep: number) => {
      if (currentStep === 0) {
        // Reactants
        const c1 = rotate3D(-100, 0, 0, 0, rot);
        const c2 = rotate3D(-40, 0, 0, 0, rot);
        const o1 = rotate3D(-40, -40, 0, 0, rot);
        const o2 = rotate3D(-40, 40, 0, 0, rot);
        const h1 = rotate3D(-70, 40, 0, 0, rot);

        const c3 = rotate3D(60, 0, 0, 0, rot);
        const o3 = rotate3D(100, 0, 0, 0, rot);
        const h2 = rotate3D(130, 0, 0, 0, rot);

        drawBond(ctx, cx + c1.x, cy + c1.y, c1.z, cx + c2.x, cy + c2.y, c2.z);
        drawBond(ctx, cx + c2.x, cy + c2.y, c2.z, cx + o1.x, cy + o1.y, o1.z, 'double');
        drawBond(ctx, cx + c2.x, cy + c2.y, c2.z, cx + o2.x, cy + o2.y, o2.z);
        drawBond(ctx, cx + o2.x, cy + o2.y, o2.z, cx + h1.x, cy + h1.y, h1.z);

        drawBond(ctx, cx + c3.x, cy + c3.y, c3.z, cx + o3.x, cy + o3.y, o3.z);
        drawBond(ctx, cx + o3.x, cy + o3.y, o3.z, cx + h2.x, cy + h2.y, h2.z);

        drawAtom(ctx, cx + c1.x, cy + c1.y, c1.z, '#8b5cf6', 'CH₃', 14);
        drawAtom(ctx, cx + c2.x, cy + c2.y, c2.z, '#8b5cf6', 'C', 14);
        drawAtom(ctx, cx + o1.x, cy + o1.y, o1.z, '#e74c3c', 'O', 16);
        drawAtom(ctx, cx + o2.x, cy + o2.y, o2.z, '#e74c3c', 'O', 16);
        drawAtom(ctx, cx + h1.x, cy + h1.y, h1.z, '#e2e8f0', 'H', 12);
        drawAtom(ctx, cx + c3.x, cy + c3.y, c3.z, '#8b5cf6', 'CH₃', 14);
        drawAtom(ctx, cx + o3.x, cy + o3.y, o3.z, '#e74c3c', 'O', 16);
        drawAtom(ctx, cx + h2.x, cy + h2.y, h2.z, '#e2e8f0', 'H', 12);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Acetic acid + Methanol', cx, cy + 80);

        const catalyst = rotate3D(0, -70, 0, 0, rot);
        drawAtom(ctx, cx + catalyst.x, cy + catalyst.y, catalyst.z, '#f59e0b', 'H⁺', 18);
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Acid Catalyst', cx, cy - 95);

      } else if (currentStep === 1) {
        drawEnergyDiagram(ctx, cx, cy - 30, false);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('WITHOUT Catalyst', cx, cy + 140);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px Arial';
        ctx.fillText('High activation energy barrier', cx, cy + 160);

      } else if (currentStep === 2) {
        drawEnergyDiagram(ctx, cx, cy - 30, true);
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('WITH Catalyst', cx, cy + 140);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px Arial';
        ctx.fillText('Lower activation energy - faster reaction!', cx, cy + 160);

      } else if (currentStep === 3) {
        // Product
        const c1 = rotate3D(-80, 0, 0, 0, rot);
        const c2 = rotate3D(-20, 0, 0, 0, rot);
        const o1 = rotate3D(-20, -40, 0, 0, rot);
        const o2 = rotate3D(-20, 40, 0, 0, rot);
        const c3 = rotate3D(20, 40, 0, 0, rot);

        drawBond(ctx, cx + c1.x, cy + c1.y, c1.z, cx + c2.x, cy + c2.y, c2.z);
        drawBond(ctx, cx + c2.x, cy + c2.y, c2.z, cx + o1.x, cy + o1.y, o1.z, 'double');
        drawBond(ctx, cx + c2.x, cy + c2.y, c2.z, cx + o2.x, cy + o2.y, o2.z);
        drawBond(ctx, cx + o2.x, cy + o2.y, o2.z, cx + c3.x, cy + c3.y, c3.z);

        drawAtom(ctx, cx + c1.x, cy + c1.y, c1.z, '#22c55e', 'CH₃', 14);
        drawAtom(ctx, cx + c2.x, cy + c2.y, c2.z, '#22c55e', 'C', 14);
        drawAtom(ctx, cx + o1.x, cy + o1.y, o1.z, '#22c55e', 'O', 16);
        drawAtom(ctx, cx + o2.x, cy + o2.y, o2.z, '#22c55e', 'O', 16);
        drawAtom(ctx, cx + c3.x, cy + c3.y, c3.z, '#22c55e', 'CH₃', 14);

        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Methyl Acetate (Ester)', cx, cy + 80);
        ctx.font = '13px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Catalyst (H⁺) regenerated - unchanged!', cx, cy + 100);

        const water = rotate3D(80, 0, 0, 0, rot);
        drawAtom(ctx, cx + water.x, cy + water.y, water.z, '#38bdf8', 'H₂O', 16);
      }
    };

    const drawBaseCatalysis = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number, currentStep: number) => {
      if (currentStep === 0) {
        // Aldehyde
        const c1 = rotate3D(-100, 0, 0, 0, rot);
        const c2 = rotate3D(-40, 0, 0, 0, rot);
        const c3 = rotate3D(20, 0, 0, 0, rot);
        const o = rotate3D(20, -40, 0, 0, rot);

        drawBond(ctx, cx + c1.x, cy + c1.y, c1.z, cx + c2.x, cy + c2.y, c2.z);
        drawBond(ctx, cx + c2.x, cy + c2.y, c2.z, cx + c3.x, cy + c3.y, c3.z);
        drawBond(ctx, cx + c3.x, cy + c3.y, c3.z, cx + o.x, cy + o.y, o.z, 'double');

        drawAtom(ctx, cx + c1.x, cy + c1.y, c1.z, '#8b5cf6', 'CH₃', 14);
        drawAtom(ctx, cx + c2.x, cy + c2.y, c2.z, '#8b5cf6', 'CH₂', 14);
        drawAtom(ctx, cx + c3.x, cy + c3.y, c3.z, '#8b5cf6', 'C', 14);
        drawAtom(ctx, cx + o.x, cy + o.y, o.z, '#e74c3c', 'O', 16);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Aldehyde (Acetaldehyde)', cx, cy + 80);

        const catalyst = rotate3D(0, -70, 0, 0, rot);
        drawAtom(ctx, cx + catalyst.x, cy + catalyst.y, catalyst.z, '#10b981', 'OH⁻', 18);
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Base Catalyst', cx, cy - 95);

      } else if (currentStep === 1) {
        drawEnergyDiagram(ctx, cx, cy - 30, false);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('WITHOUT Catalyst', cx, cy + 140);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px Arial';
        ctx.fillText('Slow enolate formation', cx, cy + 160);

      } else if (currentStep === 2) {
        drawEnergyDiagram(ctx, cx, cy - 30, true);
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('WITH Catalyst', cx, cy + 140);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px Arial';
        ctx.fillText('Base abstracts H⁺ - activates molecule!', cx, cy + 160);

      } else if (currentStep === 3) {
        // Aldol product
        const c1 = rotate3D(-100, 10, 0, 0, rot);
        const c2 = rotate3D(-40, 10, 0, 0, rot);
        const c3 = rotate3D(20, 10, 0, 0, rot);
        const c4 = rotate3D(80, 10, 0, 0, rot);
        const o1 = rotate3D(20, -30, 0, 0, rot);
        const o2 = rotate3D(80, -30, 0, 0, rot);

        drawBond(ctx, cx + c1.x, cy + c1.y, c1.z, cx + c2.x, cy + c2.y, c2.z);
        drawBond(ctx, cx + c2.x, cy + c2.y, c2.z, cx + c3.x, cy + c3.y, c3.z);
        drawBond(ctx, cx + c3.x, cy + c3.y, c3.z, cx + c4.x, cy + c4.y, c4.z);
        drawBond(ctx, cx + c3.x, cy + c3.y, c3.z, cx + o1.x, cy + o1.y, o1.z);
        drawBond(ctx, cx + c4.x, cy + c4.y, c4.z, cx + o2.x, cy + o2.y, o2.z, 'double');

        drawAtom(ctx, cx + c1.x, cy + c1.y, c1.z, '#22c55e', 'CH₃', 14);
        drawAtom(ctx, cx + c2.x, cy + c2.y, c2.z, '#22c55e', 'CH₂', 14);
        drawAtom(ctx, cx + c3.x, cy + c3.y, c3.z, '#22c55e', 'C', 14);
        drawAtom(ctx, cx + c4.x, cy + c4.y, c4.z, '#22c55e', 'C', 14);
        drawAtom(ctx, cx + o1.x, cy + o1.y, o1.z, '#22c55e', 'OH', 16);
        drawAtom(ctx, cx + o2.x, cy + o2.y, o2.z, '#22c55e', 'O', 16);

        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Aldol Product', cx, cy + 80);
        ctx.font = '13px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Catalyst (OH⁻) regenerated!', cx, cy + 100);
      }
    };

    const drawMetalCatalysis = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number, currentStep: number) => {
      if (currentStep === 0) {
        // Alkene
        const c1 = rotate3D(-30, 0, 0, 0, rot);
        const c2 = rotate3D(30, 0, 0, 0, rot);

        drawBond(ctx, cx + c1.x, cy + c1.y, c1.z, cx + c2.x, cy + c2.y, c2.z, 'double', '#f59e0b');

        drawAtom(ctx, cx + c1.x, cy + c1.y, c1.z, '#8b5cf6', 'C', 16);
        drawAtom(ctx, cx + c2.x, cy + c2.y, c2.z, '#8b5cf6', 'C', 16);

        const h2 = rotate3D(0, -60, 0, 0, rot);
        drawAtom(ctx, cx + h2.x, cy + h2.y, h2.z, '#e2e8f0', 'H₂', 16);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Alkene + Hydrogen', cx, cy + 80);

        const catalyst = rotate3D(0, 60, 0, 0, rot);
        drawAtom(ctx, cx + catalyst.x, cy + catalyst.y, catalyst.z, '#6366f1', 'Pd', 20);
        ctx.fillStyle = '#6366f1';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Metal Catalyst (Pd, Pt, Ni)', cx, cy + 105);

      } else if (currentStep === 1) {
        drawEnergyDiagram(ctx, cx, cy - 30, false);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('WITHOUT Catalyst', cx, cy + 140);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px Arial';
        ctx.fillText('Very high energy needed to break H-H bond', cx, cy + 160);

      } else if (currentStep === 2) {
        drawEnergyDiagram(ctx, cx, cy - 30, true);
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('WITH Catalyst', cx, cy + 140);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px Arial';
        ctx.fillText('Metal surface adsorbs H₂ - weakens bond!', cx, cy + 160);

      } else if (currentStep === 3) {
        // Alkane
        const c1 = rotate3D(-30, 0, 0, 0, rot);
        const c2 = rotate3D(30, 0, 0, 0, rot);

        drawBond(ctx, cx + c1.x, cy + c1.y, c1.z, cx + c2.x, cy + c2.y, c2.z, 'single', '#22c55e');

        drawAtom(ctx, cx + c1.x, cy + c1.y, c1.z, '#22c55e', 'CH₂', 16);
        drawAtom(ctx, cx + c2.x, cy + c2.y, c2.z, '#22c55e', 'CH₂', 16);

        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Alkane (Saturated)', cx, cy + 80);
        ctx.font = '13px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Catalyst (Pd) recovered - reusable!', cx, cy + 100);
      }
    };

    const drawEnzymeCatalysis = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number, currentStep: number) => {
      if (currentStep === 0) {
        // Substrate
        const c1 = rotate3D(-50, -10, 0, 0, rot);
        const c2 = rotate3D(0, -10, 0, 0, rot);
        const c3 = rotate3D(50, -10, 0, 0, rot);

        drawBond(ctx, cx + c1.x, cy + c1.y, c1.z, cx + c2.x, cy + c2.y, c2.z);
        drawBond(ctx, cx + c2.x, cy + c2.y, c2.z, cx + c3.x, cy + c3.y, c3.z);

        drawAtom(ctx, cx + c1.x, cy + c1.y, c1.z, '#8b5cf6', 'S', 16);
        drawAtom(ctx, cx + c2.x, cy + c2.y, c2.z, '#8b5cf6', 'U', 16);
        drawAtom(ctx, cx + c3.x, cy + c3.y, c3.z, '#8b5cf6', 'B', 16);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Substrate Molecule', cx, cy + 70);

        // Enzyme shape
        ctx.strokeStyle = '#ec4899';
        ctx.fillStyle = 'rgba(236, 72, 153, 0.2)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 45, 80, 35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ec4899';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Enzyme', cx, cy + 50);
        ctx.font = '11px Arial';
        ctx.fillText('(Active Site)', cx, cy + 105);

      } else if (currentStep === 1) {
        drawEnergyDiagram(ctx, cx, cy - 30, false);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('WITHOUT Enzyme', cx, cy + 140);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px Arial';
        ctx.fillText('Random collisions - very slow', cx, cy + 160);

      } else if (currentStep === 2) {
        drawEnergyDiagram(ctx, cx, cy - 30, true);
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('WITH Enzyme', cx, cy + 140);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px Arial';
        ctx.fillText('Lock-and-key mechanism - highly specific!', cx, cy + 160);

      } else if (currentStep === 3) {
        // Products
        const p1 = rotate3D(-60, 0, 0, 0, rot);
        const p2 = rotate3D(60, 0, 0, 0, rot);

        drawAtom(ctx, cx + p1.x, cy + p1.y, p1.z, '#22c55e', 'P₁', 16);
        drawAtom(ctx, cx + p2.x, cy + p2.y, p2.z, '#22c55e', 'P₂', 16);

        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Products Released', cx, cy + 80);
        ctx.font = '13px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Enzyme unchanged - cycles continue!', cx, cy + 100);
        ctx.fillText('Speed increase: 10⁶ to 10¹⁷ times!', cx, cy + 120);
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

      // Draw current catalyst type
      if (catalystType === 0) {
        drawAcidCatalysis(ctx, centerX, centerY - 10, rotation, step);
      } else if (catalystType === 1) {
        drawBaseCatalysis(ctx, centerX, centerY - 10, rotation, step);
      } else if (catalystType === 2) {
        drawMetalCatalysis(ctx, centerX, centerY - 10, rotation, step);
      } else if (catalystType === 3) {
        drawEnzymeCatalysis(ctx, centerX, centerY - 10, rotation, step);
      }

      // Legend
      const items: LegendItem[] = [
        { color: '#8b5cf6', label: 'C - Carbon' },
        { color: '#e74c3c', label: 'O - Oxygen' },
        { color: '#e2e8f0', label: 'H - Hydrogen' },
        { color: '#f59e0b', label: 'Catalyst' }
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
      ctx.fillText('Catalyst Examples & Key Principles', width / 2, boxY + 22);

      const equations = [
        ['Acid Catalyst (H⁺, H₂SO₄):',
         'CH₃COOH + CH₃OH ⇌[H⁺] CH₃COOCH₃ + H₂O',
         '• Protonates C=O, makes electrophile stronger',
         '• Used in: Esterification, hydration, dehydration'],
        
        ['Base Catalyst (OH⁻, NaOH):',
         '2 CH₃CHO →[OH⁻] CH₃CH(OH)CH₂CHO',
         '• Abstracts α-H, forms nucleophilic enolate',
         '• Used in: Aldol, Claisen, Michael additions'],
        
        ['Metal Catalyst (Pd, Pt, Ni):',
         'RCH=CHR + H₂ →[Pd/C] RCH₂-CH₂R',
         '• Adsorbs reactants on metal surface',
         '• Used in: Hydrogenation, coupling reactions'],
        
        ['Enzyme Catalyst (Proteins):',
         'Substrate →[Enzyme] Products (biological)',
         '• Highly specific lock-and-key mechanism',
         '• Used in: All biochemical reactions']
      ];

      let eqY = boxY + 45;
      const eqs = equations[catalystType];
      
      ctx.textAlign = 'left';
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 12px Courier New';
      ctx.fillText(eqs[0], 15, eqY);
      eqY += 18;
      
      ctx.fillStyle = '#e0e0e0';
      ctx.font = '12px Courier New';
      ctx.fillText(eqs[1], 15, eqY);
      eqY += 18;
      
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Courier New';
      ctx.fillText(eqs[2], 15, eqY);
      eqY += 15;
      ctx.fillText(eqs[3], 15, eqY);

      eqY += 20;
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 11px Courier New';
      ctx.fillText('KEY: Catalysts lower Ea, speed up reactions, remain unchanged!', 15, eqY);

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
  }, [step, catalystType, isPlaying]);

  useEffect(() => {
    if (sceneRef.current) {
        sceneRef.current.autoRotate = isPlaying;
    }
  }, [isPlaying]);

  const nextStep = () => {
    if (step === totalSteps - 1) {
      setCatalystType((prev) => (prev + 1) % catalystTypes.length);
      setStep(0);
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (step === 0) {
      setCatalystType((prev) => (prev - 1 + catalystTypes.length) % catalystTypes.length);
      setStep(totalSteps - 1);
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const stepNames = ['Reactants', 'Without Catalyst', 'With Catalyst', 'Products'];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#020617]">
      
      {/* Header */}
      <div className="absolute top-0 left-0 p-6 z-10 w-full flex justify-between items-start pointer-events-none">
        <div>
            <Link href="/" className="pointer-events-auto flex items-center text-teal-400 hover:text-teal-300 transition-colors gap-2 text-sm font-bold uppercase tracking-widest mb-2">
                <ArrowLeft size={16} /> Back to Lab
            </Link>
            <h1 className="text-4xl font-bold text-white mb-1">Catalysts in Organic Chemistry</h1>
            <p className="text-teal-400/80 text-sm">How catalysts speed up chemical reactions</p>
        </div>
        <div className="bg-teal-900/20 border border-teal-800/50 p-2 rounded-lg text-teal-400">
            <Hexagon size={24} />
        </div>
      </div>

      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Catalyst Type Selector */}
      <div className="absolute top-28 left-1/2 -translate-x-1/2 flex gap-2 z-20 flex-wrap justify-center">
        {catalystTypes.map((type, index) => (
          <button
            key={index}
            onClick={() => { setCatalystType(index); setStep(0); }}
            className={`px-4 py-2 rounded-xl border transition-all text-sm font-medium ${
              catalystType === index
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
          onClick={() => { setStep(0); setCatalystType(0); }}
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
          <h3 className="text-xl font-bold text-white mb-3">Catalyst Mechanism</h3>
          <p className="text-slate-300 text-sm mb-4 leading-relaxed">
            A catalyst speeds up chemical reactions by lowering activation energy without being consumed.
            Catalysts are essential in industrial processes and biological systems.
          </p>
          
          <div className="space-y-3">
             <div className="text-sm border-l-2 border-teal-500 pl-3">
               <strong className="text-teal-400 block mb-1">Key Principles:</strong>
               <span className="text-slate-400 block mb-1">Lowers activation energy (Ea) for faster reactions.</span>
               <span className="text-slate-400 block mb-1">Not consumed - regenerated in reaction cycle.</span>
               <span className="text-slate-400 block">Provides alternative reaction pathway.</span>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
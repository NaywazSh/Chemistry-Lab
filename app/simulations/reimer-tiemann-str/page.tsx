'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Play, Pause, RotateCcw, Info, ArrowLeft, FlaskRound } from 'lucide-react';

export default function ReimerTiemannPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [showInfo, setShowInfo] = useState(true);
  const animationRef = useRef<number>(0);

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

    let rotation = 0;

    // --- Drawing Helpers ---
    const drawAtom = (x: number, y: number, color: string, label: string) => {
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, x, y);
    };

    const drawHexagon = (x: number, y: number, rot: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 + rot;
        ctx.lineTo(x + 50 * Math.cos(angle), y + 50 * Math.sin(angle));
      }
      ctx.closePath();
      ctx.strokeStyle = "#818cf8"; // Indigo
      ctx.lineWidth = 4;
      ctx.stroke();
      
      // Inner circle for aromaticity
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(129, 140, 248, 0.5)";
      ctx.stroke();
    };

    const draw = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      
      ctx.clearRect(0, 0, width, height);
      
      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#020617');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Title
      ctx.fillStyle = "#2dd4bf";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Reimer-Tiemann Reaction", cx, 50);

      // Step Logic
      if (step === 0) {
        // Reactants
        drawHexagon(cx - 150, cy, 0);
        drawAtom(cx - 150, cy - 70, "#f472b6", "OH"); // Phenol
        ctx.fillStyle = "white"; ctx.fillText("+", cx - 50, cy);
        
        // Chloroform
        drawAtom(cx + 50, cy, "#94a3b8", "C");
        drawAtom(cx + 50, cy - 40, "#22c55e", "Cl");
        drawAtom(cx + 90, cy + 20, "#22c55e", "Cl");
        drawAtom(cx + 10, cy + 20, "#22c55e", "Cl");
        ctx.fillStyle = "#94a3b8"; ctx.fillText("CHCl₃", cx + 50, cy + 60);
        
        ctx.fillStyle = "#facc15"; ctx.font = "18px Arial";
        ctx.fillText("Step 1: Phenol + Chloroform + Base (KOH)", cx, height - 100);
      
      } else if (step === 1) {
        // Carbene Formation
        drawAtom(cx, cy, "#94a3b8", "C");
        drawAtom(cx - 40, cy + 30, "#22c55e", "Cl");
        drawAtom(cx + 40, cy + 30, "#22c55e", "Cl");
        
        // Electrons
        ctx.fillStyle = "#facc15";
        ctx.beginPath(); ctx.arc(cx - 10, cy - 25, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 10, cy - 25, 4, 0, Math.PI*2); ctx.fill();
        
        ctx.fillStyle = "#facc15"; ctx.font = "18px Arial";
        ctx.fillText("Step 2: Dichlorocarbene (:CCl₂) Formation", cx, height - 100);
        ctx.fillStyle = "#94a3b8"; ctx.font = "14px Arial";
        ctx.fillText("(Electrophile)", cx, height - 80);

      } else if (step === 2) {
        // Attack
        drawHexagon(cx - 50, cy, 0);
        drawAtom(cx - 50, cy - 70, "#f472b6", "O⁻"); // Phenoxide
        
        // Carbene attacking ortho position
        const orthoX = cx - 50 + 50 * Math.cos(Math.PI/6);
        const orthoY = cy + 50 * Math.sin(Math.PI/6);
        
        ctx.strokeStyle = "#facc15";
        ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.moveTo(orthoX, orthoY); ctx.lineTo(cx + 80, cy); ctx.stroke();
        ctx.setLineDash([]);
        
        drawAtom(cx + 100, cy, "#94a3b8", ":CCl₂");
        
        ctx.fillStyle = "#facc15"; ctx.font = "18px Arial";
        ctx.fillText("Step 3: Electrophilic Attack at Ortho Position", cx, height - 100);

      } else if (step === 3) {
        // Product
        drawHexagon(cx, cy, 0);
        drawAtom(cx, cy - 70, "#f472b6", "OH");
        
        // CHO group at ortho
        const orthoX = cx + 50 * Math.cos(Math.PI/6);
        const orthoY = cy + 50 * Math.sin(Math.PI/6);
        
        ctx.beginPath(); ctx.moveTo(orthoX, orthoY); ctx.lineTo(orthoX + 40, orthoY + 20); 
        ctx.strokeStyle = "white"; ctx.stroke();
        
        drawAtom(orthoX + 40, orthoY + 20, "#fbbf24", "CHO");
        
        ctx.fillStyle = "#2dd4bf"; ctx.font = "bold 20px Arial";
        ctx.fillText("Salicylaldehyde (Major Product)", cx, height - 100);
      }

      if(isPlaying) rotation += 0.01;
    };

    const animate = () => {
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animationRef.current);
  }, [step, isPlaying]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#020617]">
      {/* Header */}
      <div className="absolute top-0 left-0 p-6 z-10 w-full flex justify-between items-start pointer-events-none">
        <Link href="/" className="pointer-events-auto flex items-center text-teal-400 hover:text-teal-300 gap-2 font-bold mb-2">
            <ArrowLeft size={16} /> Back
        </Link>
      </div>

      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-20">
        <button onClick={() => setStep((s) => Math.max(0, s - 1))} className="p-3 bg-slate-800 rounded-xl text-white"><ArrowLeft /></button>
        <button onClick={() => setStep((s) => (s + 1) % totalSteps)} className="px-6 py-3 bg-teal-600 rounded-xl text-white font-bold">
            Step {step + 1}/{totalSteps}
        </button>
        <button onClick={() => setShowInfo(!showInfo)} className="p-3 bg-slate-800 rounded-xl text-teal-400"><Info /></button>
      </div>

      {showInfo && (
        <div className="absolute top-24 right-8 w-80 bg-slate-900/90 border border-teal-500/30 p-6 rounded-2xl text-slate-300 text-sm">
            <h3 className="text-lg font-bold text-teal-400 mb-2">Mechanism</h3>
            <p>Reaction of phenol with chloroform in the presence of base (NaOH/KOH) to introduce an aldehyde group at the ortho position.</p>
            <div className="mt-2 text-yellow-400">Key Intermediate: Dichlorocarbene (:CCl₂)</div>
        </div>
      )}
    </div>
  );
}
'use client';

import Link from 'next/link';
import { 
  Lock, Sparkles, Unlock, ArrowRight, 
  Beaker, Hexagon, Dna, Zap, TestTube, Cuboid, Thermometer, Layers,
  FileText, Box, Scale, Link2, Timer, Hammer, RefreshCw 
} from 'lucide-react';
import { simulationData } from '@/data/simulations';

// 1. Define your Syllabus Architecture here
// This controls the ORDER of sections on the page
const SECTIONS = [
  { id: 'General', title: 'General Chemistry', icon: Beaker, color: 'amber' },
  { id: 'Inorganic', title: 'p-Block & d/f-Block Elements', icon: Layers, color: 'sky' },
  { id: 'Organic', title: 'Organic Chemistry', subtitle: '(Grade 12)', icon: Hexagon, color: 'teal' },
  { id: 'Biomolecules', title: 'Biomolecules', icon: Dna, color: 'rose' },
  { id: 'Electrochemistry', title: 'Electrochemistry', icon: Zap, color: 'lime' },
  { id: 'Qualitative Analysis', title: 'Qualitative Analysis', icon: TestTube, color: 'violet' },
  { id: 'Polymers', title: 'Chemistry in Everyday Life', icon: Layers, color: 'indigo' },
  { id: 'Thermodynamics', title: 'Thermodynamics', icon: Thermometer, color: 'red' },
  { id: 'GOC', title: 'Organic Chemistry: Basic Principles', icon: FileText, color: 'orange' },
  { id: 'Coordination', title: 'Coordination Compounds', icon: Box, color: 'fuchsia' },
  { id: 'Equilibrium', title: 'Chemical & Ionic Equilibrium', icon: Scale, color: 'cyan' },
  { id: 'Bonding', title: 'Chemical Bonding & Structure', icon: Link2, color: 'violet' },
  { id: 'Kinetics', title: 'Chemical Kinetics', icon: Timer, color: 'rose' },
  { id: 'Metals', title: 'Metals and Non-Metals', icon: Hammer, color: 'slate' },
  { id: 'Reactions', title: 'Chemical Reactions & Equations', icon: RefreshCw, color: 'blue' },
];

export default function Home() {
  const freeModules = simulationData.filter((mod) => !mod.isPremium);

  return (
    <main className="min-h-screen bg-[#020617]">
      
      {/* HERO */}
      <div className="pt-20 pb-12 text-center px-6">
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-6">
          Virtual ChemLab
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Comprehensive 3D visualizations for Grade 9-12 Science.
        </p>
      </div>

      {/* FREE SECTION */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="flex items-center gap-2 mb-8 border-b border-slate-800 pb-4">
          <Unlock className="text-cyan-400" size={24} />
          <h2 className="text-2xl font-bold text-white">Free Simulations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {freeModules.map((mod) => (
            <Link key={mod.id} href={`/simulations/${mod.id}`} className="group relative">
              <div className="h-full p-8 rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:-translate-y-1">
                <div className="flex flex-col items-start gap-4">
                  <div className={`p-4 rounded-xl border border-slate-700 bg-slate-900 shadow-lg`}>
                    <mod.icon size={40} className={`text-${mod.color}-400`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {mod.title}
                    </h2>
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                      {mod.desc}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* PREMIUM BANNER */}
      <div className="w-full bg-gradient-to-r from-amber-900/20 via-amber-600/10 to-amber-900/20 border-y border-amber-500/30 py-16 mb-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/50 text-sm font-bold uppercase tracking-widest mb-4">
            <Sparkles size={14} /> Premium Access
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Unlock the Entire Syllabus</h2>
          <div className="inline-block bg-slate-900 border border-amber-500/50 rounded-xl px-8 py-4 shadow-xl shadow-amber-900/20">
            <span className="text-3xl font-bold text-white">$9.99</span>
            <span className="text-slate-400">/month</span>
          </div>
        </div>
      </div>

      {/* DYNAMIC PREMIUM SECTIONS */}
      {SECTIONS.map((section) => {
        // Find modules for this section
        const sectionModules = simulationData.filter(m => m.isPremium && m.category === section.id);
        
        // Don't show empty sections (keeps the site clean until you add content)
        if (sectionModules.length === 0) return null;

        return (
          <section key={section.id} className="max-w-7xl mx-auto px-6 pb-20">
            <div className="flex items-center gap-3 mb-8">
              <section.icon className={`text-${section.color}-500`} size={28} />
              <h2 className="text-3xl font-bold text-white">
                {section.title} 
                {section.subtitle && <span className="text-lg font-normal text-slate-500 ml-3">{section.subtitle}</span>}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sectionModules.map((mod) => (
                <PremiumCard key={mod.id} mod={mod} />
              ))}
            </div>
          </section>
        );
      })}

    </main>
  );
}

// Reuse your Premium Card component (With the "Click to Test" feature active)
function PremiumCard({ mod }: { mod: any }) {
    return (
        <Link href={`/simulations/${mod.id}`} className="group relative">
            <div className="h-full p-6 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-amber-500/50 transition-all duration-300 hover:transform hover:-translate-y-1">
            
            <div className="absolute top-4 right-4 text-amber-500 bg-amber-500/10 p-2 rounded-full border border-amber-500/20 group-hover:text-green-400 group-hover:border-green-400 group-hover:bg-green-400/10 transition-all">
                <Lock size={14} className="group-hover:hidden" />
                <Unlock size={14} className="hidden group-hover:block" />
            </div>

            <div className="flex flex-col items-start gap-4">
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 shadow-lg">
                    <mod.icon size={32} className={`text-${mod.color}-400 group-hover:text-amber-500 transition-colors`} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-300 group-hover:text-amber-400 transition-colors">
                        {mod.title}
                    </h2>
                    <p className="text-slate-500 text-xs mt-2 leading-relaxed line-clamp-2">
                        {mod.desc}
                    </p>
                </div>
                <div className="mt-auto pt-4 flex items-center text-xs font-bold text-amber-600 uppercase tracking-widest gap-1 group-hover:gap-2 transition-all group-hover:text-green-500">
                    <span className="group-hover:hidden">Premium</span>
                    <span className="hidden group-hover:inline">Click to Test</span>
                    <ArrowRight size={12} />
                </div>
            </div>
            </div>
        </Link>
    )
}
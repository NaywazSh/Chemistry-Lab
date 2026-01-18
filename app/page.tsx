import Link from 'next/link';
import { Lock, Sparkles, Unlock, Beaker, Hexagon, ArrowRight } from 'lucide-react';
import { simulationData } from '@/data/simulations';

export default function Home() {
  // 1. Filter data into 3 groups
  const freeModules = simulationData.filter((mod) => !mod.isPremium);
  const generalPremium = simulationData.filter((mod) => mod.isPremium && mod.category !== 'Organic');
  const organicPremium = simulationData.filter((mod) => mod.category === 'Organic');

  return (
    <main className="min-h-screen bg-[#020617]">
      
      {/* --- HERO SECTION --- */}
      <div className="pt-20 pb-12 text-center px-6">
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-6">
          Virtual ChemLab
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Interactive 3D simulations for Grade 9-12 Chemistry.
        </p>
      </div>

      {/* --- FREE SECTION --- */}
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

      {/* --- PREMIUM BANNER --- */}
      <div className="w-full bg-gradient-to-r from-amber-900/20 via-amber-600/10 to-amber-900/20 border-y border-amber-500/30 py-16 mb-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/50 text-sm font-bold uppercase tracking-widest mb-4">
            <Sparkles size={14} /> Premium Access
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Unlock the Full Laboratory</h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            Get instant access to 50+ advanced reaction simulations, organic chemistry modules, and physics integrations.
          </p>
          <div className="inline-block bg-slate-900 border border-amber-500/50 rounded-xl px-8 py-4 shadow-xl shadow-amber-900/20 hover:scale-105 transition-transform">
            <Link href="/pricing" className="flex flex-col items-center">
                <span className="text-3xl font-bold text-white">$9.99</span>
                <span className="text-slate-400 text-sm">/month</span>
            </Link>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-600/20 blur-[100px] rounded-full pointer-events-none" />
      </div>

      {/* --- PAID: GENERAL CHEMISTRY --- */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex items-center gap-2 mb-8">
            <Beaker className="text-amber-500" size={24} />
            <h2 className="text-2xl font-bold text-white">General Chemistry</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-90 hover:opacity-100 transition-opacity">
          {generalPremium.map((mod) => (
             <PremiumCard key={mod.id} mod={mod} />
          ))}
        </div>
      </section>

      {/* --- PAID: ORGANIC CHEMISTRY (NEW SECTION) --- */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex items-center gap-2 mb-8">
            <Hexagon className="text-teal-400" size={24} />
            <h2 className="text-2xl font-bold text-white">Organic Chemistry <span className="text-sm font-normal text-slate-500 ml-2">(Grade 12)</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 opacity-90 hover:opacity-100 transition-opacity">
          {organicPremium.map((mod) => (
             <PremiumCard key={mod.id} mod={mod} />
          ))}
        </div>
      </section>

    </main>
  );
}

// Reusable Component for Premium Cards to keep code clean
function PremiumCard({ mod }: { mod: any }) {
    return (
        <Link href="/pricing" className="group relative">
            <div className="h-full p-6 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-amber-500/50 transition-all duration-300 hover:transform hover:-translate-y-1">
            
            {/* Lock Icon */}
            <div className="absolute top-4 right-4 text-amber-500 bg-amber-500/10 p-2 rounded-full border border-amber-500/20">
                <Lock size={14} />
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
                
                <div className="mt-auto pt-4 flex items-center text-xs font-bold text-amber-600 uppercase tracking-widest gap-1 group-hover:gap-2 transition-all">
                    Premium <ArrowRight size={12} />
                </div>
            </div>
            </div>
        </Link>
    )
}
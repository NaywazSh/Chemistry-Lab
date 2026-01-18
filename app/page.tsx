import Link from 'next/link';
import { Lock } from 'lucide-react';
import { simulationData } from '@/data/simulations';

export default function Home() {
  return (
    <main className="min-h-screen p-8 md:p-24 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-6">
          Virtual ChemLab
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Interactive 3D simulations for Grade 9-12 Chemistry.
        </p>
      </header>

      {/* Dynamic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {simulationData.map((mod) => (
          <Link key={mod.id} href={mod.isPremium ? '/pricing' : `/simulations/${mod.id}`} className="group relative">
            <div className={`h-full p-8 rounded-2xl border transition-all duration-300 hover:transform hover:-translate-y-1 overflow-hidden
              ${mod.isPremium 
                ? 'bg-slate-900/40 border-slate-800 hover:border-amber-500/50' 
                : 'bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-cyan-500/50'
              }
            `}>
              
              {/* Premium Lock Overlay */}
              {mod.isPremium && (
                <div className="absolute top-4 right-4 text-amber-500 bg-amber-500/10 p-2 rounded-full">
                  <Lock size={16} />
                </div>
              )}

              <div className="relative z-10 flex flex-col items-start gap-4">
                <div className={`p-4 rounded-xl border shadow-lg ${mod.isPremium ? 'bg-slate-950 border-amber-900/30' : 'bg-slate-900 border-slate-700'}`}>
                  {/* Render the icon dynamically */}
                  <mod.icon size={40} className={mod.isPremium ? 'text-amber-500' : `text-${mod.color}-400`} />
                </div>
                
                <div>
                  <h2 className={`text-2xl font-bold transition-colors ${mod.isPremium ? 'text-slate-300 group-hover:text-amber-400' : 'text-white group-hover:text-cyan-300'}`}>
                    {mod.title}
                  </h2>
                  <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>

                {mod.isPremium && (
                   <span className="text-xs font-bold text-amber-500 uppercase tracking-widest mt-auto border border-amber-500/20 px-2 py-1 rounded">
                     Premium Content
                   </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
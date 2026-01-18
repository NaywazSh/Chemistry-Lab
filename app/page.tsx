import Link from 'next/link';
import { Atom, FlaskConical, Microscope } from 'lucide-react';

const modules = [
  {
    title: "Atomic Structure",
    desc: "Visualize the Bohr model and electron orbitals in 3D space.",
    link: "/simulations/atomic-structure",
    icon: <Atom size={40} className="text-cyan-400" />,
    gradient: "from-blue-500/20 to-cyan-500/20"
  },
  {
    title: "Molecular Geometry",
    desc: "VSEPR theory explorer. See Water, Ammonia, and Methane shapes.",
    link: "/simulations/molecules",
    icon: <FlaskConical size={40} className="text-purple-400" />,
    gradient: "from-purple-500/20 to-pink-500/20"
  },
  {
    title: "Crystalline Solids",
    desc: "Explore FCC, BCC, and HCP lattice structures.",
    link: "/simulations/crystals", // You can add this page later
    icon: <Microscope size={40} className="text-emerald-400" />,
    gradient: "from-emerald-500/20 to-teal-500/20"
  }
];

export default function Home() {
  return (
    <main className="min-h-screen p-8 md:p-24 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-6">
          Virtual ChemLab
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Interactive 3D simulations for Grade 9-12 Chemistry. Explore reactions, 
          structures, and bonds in a real-time environment.
        </p>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod, idx) => (
          <Link key={idx} href={mod.link} className="group relative">
            <div className={`h-full p-8 rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:-translate-y-1 overflow-hidden`}>
              {/* Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${mod.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10 flex flex-col items-start gap-4">
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 shadow-lg">
                  {mod.icon}
                </div>
                <h2 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {mod.title}
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {mod.desc}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
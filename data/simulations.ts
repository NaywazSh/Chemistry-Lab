import { Atom, FlaskConical, Microscope, Dna, Flame, Zap, Snowflake, Droplets, Hexagon, TestTube2, FlaskRound, Workflow, Layers, Filter } from 'lucide-react';

export type Simulation = {
  id: string;
  title: string;
  desc: string;
  isPremium: boolean;
  icon: any;
  color: string;
  category?: 'General' | 'Organic'; // <--- NEW FIELD
};

export const simulationData: Simulation[] = [
  // --- FREE SIMULATIONS ---
  {
    id: "atomic-structure",
    title: "Atomic Structure",
    desc: "Visualize the Bohr model and electron orbitals.",
    isPremium: false,
    icon: Atom,
    color: "cyan"
  },
  {
    id: "molecules",
    title: "Molecular Geometry",
    desc: "VSEPR theory explorer: Water, Ammonia, Methane.",
    isPremium: false,
    icon: FlaskConical,
    color: "purple"
  },
  {
    id: "crystals",
    title: "Crystalline Solids",
    desc: "Explore FCC, BCC, and HCP lattice structures.",
    isPremium: false,
    icon: Microscope,
    color: "emerald"
  },
  {
    id: "dna",
    title: "Biochemistry: DNA",
    desc: "Double helix structure and base pairs.",
    isPremium: false,
    icon: Dna,
    color: "amber"
  },

  // --- PREMIUM: GENERAL CHEMISTRY ---
  {
    id: "combustion",
    title: "Combustion Reaction",
    desc: "Hydrocarbon burning in oxygen to produce CO2 and H2O.",
    isPremium: true,
    icon: Flame,
    color: "orange",
    category: "General"
  },
  {
    id: "electrolysis",
    title: "Electrolysis of Water",
    desc: "Splitting water molecules using electric current.",
    isPremium: true,
    icon: Zap,
    color: "yellow",
    category: "General"
  },
  {
    id: "states-of-matter",
    title: "States of Matter",
    desc: "Phase changes from Solid to Liquid to Gas.",
    isPremium: true,
    icon: Snowflake,
    color: "blue",
    category: "General"
  },
  {
    id: "titration",
    title: "Acid-Base Titration",
    desc: "Neutralization simulation with pH indicators.",
    isPremium: true,
    icon: Droplets,
    color: "pink",
    category: "General"
  },

  // --- PREMIUM: ORGANIC CHEMISTRY (NEW SECTION) ---
  {
    id: "cannizzaro",
    title: "Cannizzaro Reaction",
    desc: "Disproportionation of non-enolizable aldehydes.",
    isPremium: true,
    icon: FlaskRound,
    color: "teal",
    category: "Organic"
  },
  {
    id: "aldol",
    title: "Aldol Condensation",
    desc: "Formation of β-hydroxy aldehydes from enolizable ketones.",
    isPremium: true,
    icon: Layers,
    color: "teal",
    category: "Organic"
  },
  {
    id: "clemmensen",
    title: "Clemmensen Reduction",
    desc: "Reduction of ketones/aldehydes to alkanes using Zn-Hg.",
    isPremium: true,
    icon: TestTube2,
    color: "teal",
    category: "Organic"
  },
  {
    id: "wolff-kishner",
    title: "Wolff-Kishner Reduction",
    desc: "Deoxygenation using Hydrazine and strong base.",
    isPremium: true,
    icon: Hexagon,
    color: "teal",
    category: "Organic"
  },
  {
    id: "reimer-tiemann",
    title: "Reimer-Tiemann",
    desc: "Ortho-formylation of phenols to synthesize salicylaldehyde.",
    isPremium: true,
    icon: FlaskConical,
    color: "teal",
    category: "Organic"
  },
  {
    id: "catalysts",
    title: "Organic Catalysts",
    desc: "Visualizing activation energy reduction in reactions.",
    isPremium: true,
    icon: Workflow,
    color: "teal",
    category: "Organic"
  },
  {
    id: "reagents",
    title: "Reagents Dictionary",
    desc: "3D library of Grignard, Tollens, and Lucas reagents.",
    isPremium: true,
    icon: Filter,
    color: "teal",
    category: "Organic"
  }
];
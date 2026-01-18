import { Atom, FlaskConical, Microscope, Dna, Flame, Zap, Snowflake, Droplets } from 'lucide-react';

export type Simulation = {
  id: string;          // The folder name (e.g., 'sodium-water')
  title: string;       // Display title
  desc: string;        // Short description
  isPremium: boolean;  // true = PAID, false = FREE
  icon: any;           // The icon component
  color: string;       // Color theme
};

export const simulationData: Simulation[] = [
  // --- THE FREE 4 ---
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

  // --- THE PAID 50+ (Examples) ---
  {
    id: "combustion",
    title: "Combustion Reaction",
    desc: "Hydrocarbon burning in oxygen to produce CO2 and H2O.",
    isPremium: true,
    icon: Flame,
    color: "orange"
  },
  {
    id: "electrolysis",
    title: "Electrolysis of Water",
    desc: "Splitting water molecules using electric current.",
    isPremium: true,
    icon: Zap,
    color: "yellow"
  },
  {
    id: "states-of-matter",
    title: "States of Matter",
    desc: "Phase changes from Solid to Liquid to Gas.",
    isPremium: true,
    icon: Snowflake,
    color: "blue"
  },
  {
    id: "titration",
    title: "Acid-Base Titration",
    desc: "Neutralization simulation with pH indicators.",
    isPremium: true,
    icon: Droplets,
    color: "pink"
  },
  // ... You can keep adding here endlessly
];
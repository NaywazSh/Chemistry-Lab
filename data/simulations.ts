import { 
  Atom, FlaskConical, Microscope, Dna, Flame, Zap, Snowflake, Droplets, 
  Hexagon, Layers, TestTube2, Workflow, Filter, FlaskRound, 
  Component, Bean, Battery, Globe, Activity, Thermometer, Link2 
} from 'lucide-react';

// Define the shape of a simulation object
export type Simulation = {
  id: string;
  title: string;
  desc: string;
  isPremium: boolean;
  icon: any;
  color: string;
  category: string;
};

export const simulationData: Simulation[] = [
  // --- FREE SIMULATIONS ---
  { id: "atomic-structure", title: "Atomic Structure", desc: "Visualize the Bohr model and electron orbitals.", isPremium: false, icon: Atom, color: "cyan", category: "Free" },
  { id: "molecules", title: "Molecular Geometry", desc: "VSEPR theory explorer: Water, Ammonia, Methane.", isPremium: false, icon: FlaskConical, color: "purple", category: "Free" },
  { id: "crystals", title: "Crystalline Solids", desc: "Explore FCC, BCC, and HCP lattice structures.", isPremium: false, icon: Microscope, color: "emerald", category: "Free" },
  { id: "dna", title: "Biochemistry: DNA", desc: "Double helix structure and base pairs.", isPremium: false, icon: Dna, color: "amber", category: "Free" },

  // --- GENERAL CHEMISTRY ---
  { id: "combustion", title: "Combustion Reaction", desc: "Hydrocarbon burning in oxygen.", isPremium: true, icon: Flame, color: "orange", category: "General" },
  { id: "electrolysis", title: "Electrolysis of Water", desc: "Splitting water molecules using current.", isPremium: true, icon: Zap, color: "yellow", category: "General" },
  { id: "states-of-matter", title: "States of Matter", desc: "Phase changes: Solid, Liquid, Gas.", isPremium: true, icon: Snowflake, color: "blue", category: "General" },
  { id: "titration", title: "Acid-Base Titration", desc: "Neutralization with pH indicators.", isPremium: true, icon: Droplets, color: "pink", category: "General" },

  // --- ORGANIC CHEMISTRY (Grade 12) ---
  { id: "cannizzaro", title: "Cannizzaro Reaction", desc: "Disproportionation of aldehydes.", isPremium: true, icon: FlaskRound, color: "teal", category: "Organic" },
  { id: "aldol", title: "Aldol Condensation", desc: "Formation of β-hydroxy aldehydes.", isPremium: true, icon: Layers, color: "teal", category: "Organic" },
  { id: "clemmensen", title: "Clemmensen Reduction", desc: "Ketones to alkanes using Zn-Hg.", isPremium: true, icon: TestTube2, color: "teal", category: "Organic" },
  { id: "wolff-kishner", title: "Wolff-Kishner Reduction", desc: "Reduction using Hydrazine.", isPremium: true, icon: Hexagon, color: "teal", category: "Organic" },
  
  // --- BIOMOLECULES (New Section) ---
  { id: "amino-acids", title: "Amino Acid Structures", desc: "3D visualization of Glycine, Alanine, and R-groups.", isPremium: true, icon: Component, color: "rose", category: "Biomolecules" },
  { id: "peptide-bond", title: "Peptide Bond Formation", desc: "Condensation reaction between amino acids.", isPremium: true, icon: Link2, color: "rose", category: "Biomolecules" },
  { id: "dna-rna", title: "DNA vs RNA Structure", desc: "Comparing Double Helix vs Single Strand.", isPremium: true, icon: Dna, color: "rose", category: "Biomolecules" },
  { id: "carbohydrates", title: "Glycosidic Linkages", desc: "Sucrose (α-1,2) and Maltose (α-1,4) bonds.", isPremium: true, icon: Bean, color: "rose", category: "Biomolecules" },

  // --- FUTURE SECTIONS (Ready for expansion) ---
  { id: "galvanic-cell", title: "Galvanic/Voltaic Cell", desc: "Redox reactions producing electricity.", isPremium: true, icon: Battery, color: "lime", category: "Electrochemistry" },
  { id: "salt-analysis", title: "Cation Analysis", desc: "Flame tests and precipitate colors.", isPremium: true, icon: Filter, color: "violet", category: "Qualitative Analysis" },
  { id: "polymers", title: "Polymerization", desc: "Addition vs Condensation polymers.", isPremium: true, icon: Activity, color: "indigo", category: "Polymers" },
  { id: "thermodynamics", title: "Carnot Cycle", desc: "PV diagrams and entropy changes.", isPremium: true, icon: Thermometer, color: "red", category: "Thermodynamics" },
];
import { 
  Atom, FlaskConical, Microscope, Dna, Flame, Zap, Snowflake, Droplets, 
  Hexagon, Layers, TestTube2, Workflow, Filter, FlaskRound, 
  Component, Bean, Battery, Globe, Activity, Thermometer, Link2 
} from 'lucide-react';

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

// --- INORGANIC CHEMISTRY (p-Block & d/f-Block) ---
  { id: "electronic-config", title: "Electronic Configurations", desc: "Orbital filling rules, shielding effect, and stability of half-filled subshells.", isPremium: true, icon: Layers, color: "sky", category: "Inorganic" },
  { id: "compound-prep", title: "Preparation Methods", desc: "Industrial synthesis: Haber Process (NH₃) and Contact Process (H₂SO₄).", isPremium: true, icon: FlaskRound, color: "sky", category: "Inorganic" },
  { id: "oxidation-states", title: "Oxidation States", desc: "Variable oxidation states in transition metals and stability trends.", isPremium: true, icon: Activity, color: "sky", category: "Inorganic" },
  { id: "ion-colours", title: "Colours of Ions", desc: "d-d transitions and Crystal Field Theory explaining solution colors.", isPremium: true, icon: Filter, color: "sky", category: "Inorganic" },
  { id: "lanthanoid-contraction", title: "Lanthanoid Contraction", desc: "Atomic radii trends and consequences in 4f series.", isPremium: true, icon: Component, color: "sky", category: "Inorganic" },
 
  // --- ORGANIC CHEMISTRY (Grade 12) ---
  { id: "cannizzaro", title: "Cannizzaro Reaction", desc: "Disproportionation of aldehydes.", isPremium: true, icon: FlaskRound, color: "teal", category: "Organic" },
  { id: "aldol", title: "Aldol Condensation", desc: "Formation of β-hydroxy aldehydes.", isPremium: true, icon: Layers, color: "teal", category: "Organic" },
  { id: "clemmensen", title: "Clemmensen Reduction", desc: "Ketones to alkanes using Zn-Hg.", isPremium: true, icon: TestTube2, color: "teal", category: "Organic" },
  { id: "wolff-kishner", title: "Wolff-Kishner Reduction", desc: "Reduction using Hydrazine.", isPremium: true, icon: Hexagon, color: "teal", category: "Organic" },
  { id: "reimer-tiemann", title: "Reimer-Tiemann", desc: "Formation of Salicylaldehyde.", isPremium: true, icon: FlaskConical, color: "teal", category: "Organic" },
  { id: "catalysts", title: "Organic Catalysts", desc: "Reaction energy profiles.", isPremium: true, icon: Workflow, color: "teal", category: "Organic" },
  { id: "reagents", title: "Reagents Dictionary", desc: "Grignard, Tollens, etc.", isPremium: true, icon: Filter, color: "teal", category: "Organic" },

  // --- BIOMOLECULES ---
  { id: "amino-acids", title: "Amino Acid Structures", desc: "3D visualization of Glycine, Alanine.", isPremium: true, icon: Component, color: "rose", category: "Biomolecules" },
  { id: "peptide-bond", title: "Peptide Bond Formation", desc: "Condensation reaction between amino acids.", isPremium: true, icon: Link2, color: "rose", category: "Biomolecules" },
  { id: "dna-rna", title: "DNA vs RNA Structure", desc: "Comparing Double Helix vs Single Strand.", isPremium: true, icon: Dna, color: "rose", category: "Biomolecules" },
  { id: "carbohydrates", title: "Glycosidic Linkages", desc: "Sucrose and Maltose bonds.", isPremium: true, icon: Bean, color: "rose", category: "Biomolecules" },

  // --- ELECTROCHEMISTRY (Corrected) ---
  { id: "galvanic-cell", title: "Galvanic/Voltaic Cell", desc: "Redox reactions producing electricity.", isPremium: true, icon: Battery, color: "lime", category: "Electrochemistry" },
  { id: "standard-electrode-potentials", title: "Standard Electrode Potentials", desc: "Measuring voltage under standard conditions.", isPremium: true, icon: Zap, color: "lime", category: "Electrochemistry" },
  { id: "electrochemical-series", title: "Electrochemical Series", desc: "Arrangement of elements by reduction potential.", isPremium: true, icon: Filter, color: "lime", category: "Electrochemistry" },
  { id: "electrolytic-cell", title: "Electrolytic Cell", desc: "Using electrical energy to drive reactions.", isPremium: true, icon: Battery, color: "lime", category: "Electrochemistry" },
  { id: "kohlrauschs-law", title: "Kohlrausch's Law", desc: "Limiting molar conductivity.", isPremium: true, icon: Activity, color: "lime", category: "Electrochemistry" },
  { id: "conductivity-formulas", title: "Conductivity Formulas", desc: "Mathematical relations for conductivity.", isPremium: true, icon: Component, color: "lime", category: "Electrochemistry" },

  // --- FUTURE SECTIONS ---
  { id: "salt-analysis", title: "Cation Analysis", desc: "Flame tests and precipitate colors.", isPremium: true, icon: Filter, color: "violet", category: "Qualitative Analysis" },
  { id: "polymers", title: "Polymerization", desc: "Addition vs Condensation polymers.", isPremium: true, icon: Activity, color: "indigo", category: "Polymers" },
  { id: "thermodynamics", title: "Carnot Cycle", desc: "PV diagrams and entropy changes.", isPremium: true, icon: Thermometer, color: "red", category: "Thermodynamics" },
];
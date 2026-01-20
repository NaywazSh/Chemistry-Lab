import { 
  Atom, FlaskConical, Microscope, Dna, Flame, Zap, Snowflake, Droplets, 
  Hexagon, Layers, TestTube2, Workflow, Filter, FlaskRound, 
  Component, Bean, Battery, Globe, Activity, Thermometer, Link2, 
  FileText, Split, Box, Scale, Timer, Hammer, RefreshCw,
  // NEW ICONS FOR SALT ANALYSIS:
  ScanSearch, ListOrdered, Palette, CheckCircle2, Beaker,
  // ... keep existing imports ...
  GitMerge, Brain, Pill, Link, ShoppingBag 
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
  { id: "co2", title: "Carbon Dioxide (CO₂) Molecule", desc: "Atomic structure of CO2.", isPremium: false, icon: Box , color: "amber", category: "Free" },

  // --- GENERAL CHEMISTRY ---
  { id: "combustion", title: "Combustion Reaction", desc: "Hydrocarbon burning in oxygen.", isPremium: true, icon: Flame, color: "orange", category: "General" },
  { id: "electrolysis", title: "Electrolysis of Water", desc: "Splitting water molecules using current.", isPremium: true, icon: Zap, color: "yellow", category: "General" },
  { id: "states-of-matter", title: "States of Matter", desc: "Phase changes: Solid, Liquid, Gas.", isPremium: true, icon: Snowflake, color: "blue", category: "General" },
  { id: "titration", title: "Acid-Base Titration", desc: "Neutralization with pH indicators.", isPremium: true, icon: Droplets, color: "pink", category: "General" },

  // --- INORGANIC CHEMISTRY ---
  { id: "electronic-config", title: "Electronic Configurations", desc: "Orbital filling rules, shielding effect, and stability of half-filled subshells.", isPremium: true, icon: Layers, color: "sky", category: "Inorganic" },
  { id: "compound-prep", title: "Preparation Methods", desc: "Industrial synthesis: Haber Process (NH₃) and Contact Process (H₂SO₄).", isPremium: true, icon: FlaskRound, color: "sky", category: "Inorganic" },
  { id: "oxidation-states", title: "Oxidation States", desc: "Variable oxidation states in transition metals and stability trends.", isPremium: true, icon: Activity, color: "sky", category: "Inorganic" },
  { id: "ion-colours", title: "Colours of Ions", desc: "d-d transitions and Crystal Field Theory explaining solution colors.", isPremium: true, icon: Filter, color: "sky", category: "Inorganic" },
  { id: "lanthanoid-contraction", title: "Lanthanoid Contraction", desc: "Atomic radii trends and consequences in 4f series.", isPremium: true, icon: Component, color: "sky", category: "Inorganic" },

  // --- ORGANIC CHEMISTRY (Grade 12) ---
    { id: "benzene-ring", title: "Benzene Ring (C₆H₆)", desc: "Understand how Benzene Ring (C₆H₆) formed.", isPremium: true, icon: Hexagon, color: "green", category: "Organic" },
  { id: "cannizzaro", title: "Cannizzaro Reaction", desc: "Disproportionation of aldehydes.", isPremium: true, icon: FlaskRound, color: "teal", category: "Organic" },
  { id: "aldol", title: "Aldol Condensation", desc: "Formation of β-hydroxy aldehydes.", isPremium: true, icon: Layers, color: "teal", category: "Organic" },
  { id: "clemmensen", title: "Clemmensen Reduction", desc: "Ketones to alkanes using Zn-Hg.", isPremium: true, icon: TestTube2, color: "teal", category: "Organic" },
  { id: "wolff-kishner", title: "Wolff-Kishner Reduction", desc: "Reduction using Hydrazine.", isPremium: true, icon: Hexagon, color: "teal", category: "Organic" },
  { id: "reimer-tiemann", title: "Reimer-Tiemann", desc: "Formation of Salicylaldehyde.", isPremium: true, icon: FlaskConical, color: "teal", category: "Organic" },
  { id: "catalysts", title: "Organic Catalysts", desc: "Reaction energy profiles.", isPremium: true, icon: Workflow, color: "teal", category: "Organic" },
  { id: "reagents", title: "Reagents Dictionary", desc: "Grignard, Tollens, etc.", isPremium: true, icon: Filter, color: "teal", category: "Organic" },
  { id: "reimer-tiemann-str", title: "Reimer-Tiemann Structure", desc: "Structural analysis of the intermediate and final Salicylaldehyde product.", isPremium: true, icon: FlaskConical, color: "teal", category: "Organic" },
{ id: "catalysts-str", title: "Catalysts Structure", desc: "3D molecular view of heterogeneous catalyst surfaces.", isPremium: true, icon: Workflow, color: "teal", category: "Organic" },
{ id: "reagents-str", title: "Reagents Structure", desc: "Detailed molecular geometry of Grignard and Tollens reagents.", isPremium: true, icon: Filter, color: "teal", category: "Organic" },

  // --- BIOMOLECULES ---
  { id: "amino-acids", title: "Amino Acid Structures", desc: "3D visualization of Glycine, Alanine.", isPremium: true, icon: Component, color: "rose", category: "Biomolecules" },
  { id: "peptide-bond", title: "Peptide Bond Formation", desc: "Condensation reaction between amino acids.", isPremium: true, icon: Link2, color: "rose", category: "Biomolecules" },
  { id: "dna-rna", title: "DNA vs RNA Structure", desc: "Comparing Double Helix vs Single Strand.", isPremium: true, icon: Dna, color: "rose", category: "Biomolecules" },
  { id: "carbohydrates", title: "Glycosidic Linkages", desc: "Sucrose and Maltose bonds.", isPremium: true, icon: Bean, color: "rose", category: "Biomolecules" },
  { id: "peptide-bond-str", title: "Peptide Structure", desc: "Detailed structural view of the amide linkage plane.", isPremium: true, icon: Link2, color: "rose", category: "Biomolecules" },

  // --- ELECTROCHEMISTRY ---
  { id: "galvanic-cell", title: "Galvanic/Voltaic Cell", desc: "Redox reactions producing electricity.", isPremium: true, icon: Battery, color: "lime", category: "Electrochemistry" },
  { id: "standard-electrode-potentials", title: "Standard Electrode Potentials", desc: "Measuring voltage under standard conditions.", isPremium: true, icon: Zap, color: "lime", category: "Electrochemistry" },
  { id: "electrochemical-series", title: "Electrochemical Series", desc: "Arrangement of elements by reduction potential.", isPremium: true, icon: Filter, color: "lime", category: "Electrochemistry" },
  { id: "electrolytic-cell", title: "Electrolytic Cell", desc: "Using electrical energy to drive reactions.", isPremium: true, icon: Battery, color: "lime", category: "Electrochemistry" },
  { id: "kohlrauschs-law", title: "Kohlrausch's Law", desc: "Limiting molar conductivity.", isPremium: true, icon: Activity, color: "lime", category: "Electrochemistry" },
  { id: "conductivity-formulas", title: "Conductivity Formulas", desc: "Mathematical relations for conductivity.", isPremium: true, icon: Component, color: "lime", category: "Electrochemistry" },

    // --- QUALITATIVE ANALYSIS (SALT ANALYSIS) - UPDATED ---
  { id: "cation-anion-id", title: "Cation & Anion ID", desc: "Systematic identification through specific reagent tests.", isPremium: true, icon: ScanSearch, color: "violet", category: "Qualitative Analysis" },
  { id: "group-reagents", title: "Group Reagents", desc: "Classification of Cations into Groups I-VI.", isPremium: true, icon: ListOrdered, color: "violet", category: "Qualitative Analysis" },
  { id: "color-changes", title: "Colour Changes", desc: "Visual guide to flame tests and solution colors.", isPremium: true, icon: Palette, color: "violet", category: "Qualitative Analysis" },
  { id: "confirmatory-tests", title: "Confirmatory Tests", desc: "Specific reactions to confirm ion presence.", isPremium: true, icon: CheckCircle2, color: "violet", category: "Qualitative Analysis" },
  { id: "precipitation-reactions", title: "Precipitation Reactions", desc: "Formation of insoluble salts and Ksp logic.", isPremium: true, icon: Beaker, color: "violet", category: "Qualitative Analysis" },
  
  // --- ORGANIC CHEMISTRY: BASIC PRINCIPLES (GOC) ---
  { id: "iupac-basics", title: "IUPAC Nomenclature", desc: "Rules for naming alkanes, alkenes, and functional groups.", isPremium: true, icon: FileText, color: "orange", category: "GOC" },
  { id: "isomerism-intro", title: "Structural Isomerism", desc: "Chain, Position, and Functional isomers.", isPremium: true, icon: Split, color: "orange", category: "GOC" },

  // --- COORDINATION COMPOUNDS ---
  { id: "werner-theory", title: "Werner's Theory", desc: "Primary and secondary valencies in complexes.", isPremium: true, icon: Box, color: "fuchsia", category: "Coordination" },
  
  // --- EQUILIBRIUM ---
  { id: "le-chatelier", title: "Le Chatelier's Principle", desc: "Effect of concentration, pressure, and temperature changes.", isPremium: true, icon: Scale, color: "cyan", category: "Equilibrium" },

  // --- CHEMICAL BONDING ---
  { id: "hybridization", title: "Orbital Hybridization", desc: "sp, sp², sp³ mixing and molecular shapes.", isPremium: true, icon: Link2, color: "violet", category: "Bonding" },

  // --- CHEMICAL KINETICS ---
  { id: "rate-law", title: "Rate Law Expressions", desc: "Zero, First, and Second order reactions.", isPremium: true, icon: Timer, color: "rose", category: "Kinetics" },

  // --- METALS AND NON-METALS ---
  { id: "metallurgy-basics", title: "Metallurgy Processes", desc: "Ore concentration, calcination, and roasting.", isPremium: true, icon: Hammer, color: "slate", category: "Metals" },

  // --- CHEMICAL REACTIONS ---
  { id: "balancing-equations", title: "Balancing Equations", desc: "Law of conservation of mass in reactions.", isPremium: true, icon: RefreshCw, color: "blue", category: "Reactions" },

  // --- CHEMISTRY IN EVERYDAY LIFE (Polymers & Drugs) ---
{ id: "addition-vs-condensation", title: "Addition vs Condensation", desc: "Mechanisms: Chain growth (Free radical) vs Step growth polymerization.", isPremium: true, icon: GitMerge, color: "indigo", category: "Polymers" },
{ id: "drug-structures-memory", title: "Drug Structure Memory", desc: "Visual mnemonics for memorizing complex drug structures lacking logic.", isPremium: true, icon: Brain, color: "indigo", category: "Polymers" },
{ id: "drug-classes", title: "Drug Classes", desc: "3D visual guide to Antipyretics, Analgesics, and Antibiotics.", isPremium: true, icon: Pill, color: "indigo", category: "Polymers" },
{ id: "monomer-polymer-pairs", title: "Monomer-Polymer Pairs", desc: "Interactive matching: Ethylene → Polythene, Styrene → Polystyrene.", isPremium: true, icon: Link, color: "indigo", category: "Polymers" },
{ id: "monomer-polymer-more", title: "Monomer-Polymer More Pairs", desc: "Interactive Visuals: Structures & More.", isPremium: true, icon: Link, color: "indigo", category: "Polymers" },
{ id: "polymer-uses", title: "Polymer Applications", desc: "Specific industrial uses: PVC pipes, Teflon coatings, Nylon fibers.", isPremium: true, icon: ShoppingBag, color: "indigo", category: "Polymers" },
{ id: "polymer-str", title: "Polymer Structures", desc: "Polymer Strucutures in Real Life- PVC, Teflon etc..", isPremium: true, icon: ShoppingBag, color: "indigo", category: "Polymers" },
{ id: "polymer-database", title: "Polymer Database Knowledge", desc: "Specific industrial uses: Easy Illustration in Short.", isPremium: true, icon: ShoppingBag, color: "indigo", category: "Polymers" },
  // --- FUTURE SECTIONS ---
 { id: "thermodynamics", title: "Carnot Cycle", desc: "PV diagrams and entropy changes.", isPremium: true, icon: Thermometer, color: "red", category: "Thermodynamics" },
];
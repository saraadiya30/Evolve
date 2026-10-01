import { outerTruthTech } from '../../truepath/tau_ceti_shipyard.js';

// Region-region spaceProjects luar (titan, enceladus, triton, kuiper, eris) yang tadinya 1 file per planet berisi 1 baris.
// Digabung jadi satu file; urutan sama persis dengan urutan import lama di space.js.
export let spaceProjects_spc_titan;
export let spaceProjects_spc_enceladus;
export let spaceProjects_spc_triton;
export let spaceProjects_spc_kuiper;
export let spaceProjects_spc_eris;

// Dihitung saat registrasi: outerTruthTech() membaca registry truepath yang baru terisi oleh registerAll().
export function registerOuterPlanets(){
    spaceProjects_spc_titan = outerTruthTech().spc_titan;
    spaceProjects_spc_enceladus = outerTruthTech().spc_enceladus;
    spaceProjects_spc_triton = outerTruthTech().spc_triton;
    spaceProjects_spc_kuiper = outerTruthTech().spc_kuiper;
    spaceProjects_spc_eris = outerTruthTech().spc_eris;
}

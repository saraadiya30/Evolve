import { outerTruthTech } from '../../truepath/tau_ceti_shipyard.js';

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

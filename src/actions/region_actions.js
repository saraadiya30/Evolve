// Region-region actions yang tadinya masing-masing 1 file berisi 1 baris (tech_tree, projects/*, locations/*).
// Digabung jadi satu file; urutan pemanggilan sama persis dengan urutan import lama di actions.js.
// (star_dock.js tetap terpisah karena isinya besar.)
import { techList } from '../tech/tech_list.js';
import { arpa } from '../arpa/arpa_projects.js';
import { spaceTech, interstellarTech, galaxyTech } from '../space/space_requirements.js';
import { fortressTech } from '../portal/hell/fortress_defense.js';
import { tauCetiTech } from '../truepath/tau_ceti_shipyard.js';
import { edenicTech } from '../edenic/edenic.js';

export let actions_tech;
export let actions_arpa;
export let actions_genes;
export let actions_blood;
export let actions_space;
export let actions_interstellar;
export let actions_galaxy;
export let actions_portal;
export let actions_tauceti;
export let actions_eden;

// Dihitung saat registrasi (bukan saat modul dimuat) karena membaca registry yang baru terisi oleh registerAll().
export function registerRegionActions(){
    actions_tech = techList();
    actions_arpa = arpa('PhysicsTech');
    actions_genes = arpa('GeneTech');
    actions_blood = arpa('BloodTech');
    actions_space = spaceTech();
    actions_interstellar = interstellarTech();
    actions_galaxy = galaxyTech();
    actions_portal = fortressTech();
    actions_tauceti = tauCetiTech();
    actions_eden = edenicTech();
}

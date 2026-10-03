// Region-region actions yang tadinya masing-masing 1 file berisi 1 baris (tech_tree, projects/*, locations/*).
// Digabung jadi satu file; urutan pemanggilan sama persis dengan urutan import lama di actions.js.
// (star_dock.js tetap terpisah karena isinya besar.)
import { techList } from '../tech/tech.js';
import { arpa } from '../arpa/arpa.js';
import { spaceTech, interstellarTech, galaxyTech } from '../space/space.js';
import { fortressTech } from '../portal/portal.js';
import { tauCetiTech } from '../truepath/truepath.js';
import { edenicTech } from '../edenic/edenic.js';

export const actions_tech = techList();
export const actions_arpa = arpa('PhysicsTech');
export const actions_genes = arpa('GeneTech');
export const actions_blood = arpa('BloodTech');
export const actions_space = spaceTech();
export const actions_interstellar = interstellarTech();
export const actions_galaxy = galaxyTech();
export const actions_portal = fortressTech();
export const actions_tauceti = tauCetiTech();
export const actions_eden = edenicTech();

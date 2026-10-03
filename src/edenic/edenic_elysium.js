import { seededRandom } from '../core/vars.js';
import { armorCalc } from '../civics/civics.js';
import { edenicModules } from './edenic_registry.js';
import { edenElysium } from './edenic_registry2.js';
import { edenElysiumPart1 } from './edn_elysium_1.js';
import { edenElysiumPart2 } from './edn_elysium_2.js';
import { edenElysiumPart3 } from './edn_elysium_3.js';

// Region 'eden_elysium' dari edenicModules (dipisah dari edenic.js). Urutan/isi entri sama persis; digabung di edenic.js.
export function deadCalc(dead, armySize){
    let armor = armorCalc(dead);
    dead -= Math.floor(seededRandom(0,armor,true));
    if (dead > armySize){ dead = armySize }
    else if (dead < 0){ dead = 0; }
    return Math.floor(dead);
}

Object.assign(edenElysium,
    edenElysiumPart1,
    edenElysiumPart2,
    edenElysiumPart3
);
export { edenElysium };


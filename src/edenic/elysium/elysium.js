import { seededRandom } from '../../core/vars.js';
import { armorCalc } from '../../civics/civics.js';
import { edenElysium } from '../registry.js';
import { edenElysiumPart1 } from './info_to_scout_elysium.js';
import { edenElysiumPart2 } from './fire_support_base_to_eternal_bank.js';
import { edenElysiumPart3 } from './archive_to_eden_cement.js';

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


import { seededRandom } from '../../core/vars.js';
import { armorCalc } from '../../civics/military/war_calc.js';
import { edenElysium } from '../../core/registries.js';

export function deadCalc(dead, armySize){
    let armor = armorCalc(dead);
    dead -= Math.floor(seededRandom(0,armor,true));
    if (dead > armySize){ dead = armySize }
    else if (dead < 0){ dead = 0; }
    return Math.floor(dead);
}

export { edenElysium };

// looters / armorCalc: kalkulasi loot dan armor perang. Modul daun (core, jobs/job_scale, fathom_check), dipisah dari war_campaign.js.
import { global, seededRandom } from '../../core/vars.js';
import { jobScale } from '../jobs/job_scale.js';
import { traits } from '../../core/registries.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';

export function looters(){
    let cap = 0;
    let looting = global.civic.garrison.raid;
    switch(global.civic.garrison.tactic){
        case 0:
            cap = 5;
            break;
        case 1:
            cap = 10;
            break;
        case 2:
            cap = 25;
            break;
        case 3:
            cap = 50;
            break;
        case 4:
            cap = 999;
            break;
    }
    if (global.race['high_pop']){
        cap = jobScale(cap);
    }
    if (looting > cap){
        looting = cap;
    }
    return looting;
}

export function armorCalc(dead){
    let armor = 0;
    if (global.race['scales']){
        armor += traits.scales.vars()[0];
    }
    if (global.tech['armor']){
        armor += global.tech['armor'];
    }
    if (global.race['high_pop']){
        armor += Math.floor(seededRandom(0, armor * traits.high_pop.vars()[0],true));
    }
    if (global.race['armored']){
        let armored = traits.armored.vars()[0] / 100;
        armor += Math.floor(dead * armored);
    }
    let fathom = fathomCheck('tortoisan');
    if (fathom > 0){
        let armored = traits.armored.vars(1)[0] / 100 * fathom;
        armor += Math.floor(dead * armored);
    }
    return armor;
}

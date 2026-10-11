// checkRequirements: pengecekan syarat umum. Modul daun (core/vars).
import { global } from '../core/vars.js';

export function checkRequirements(action_set,region,action){
    let path = global.race['truepath'] ? 'truepath' : 'standard';
    if (action_set[region][action].hasOwnProperty('path') && !action_set[region][action].path.includes(path)){
        return false;
    }
    let isMet = true;
    Object.keys(action_set[region][action].reqs).forEach(function (req){
        if (!global.tech[req] || global.tech[req] < action_set[region][action].reqs[req]){
            isMet = false;
        }
    });
    if (isMet && action_set[region][action].hasOwnProperty('condition') && !action_set[region][action].condition()){
        isMet = false;
    }
    if (isMet && action_set[region][action].hasOwnProperty('not_trait')){
        for (let trait of action_set[region][action].not_trait){
            if (global.race[trait]){
                isMet = false;
            }
        }
    }
    if (isMet && action_set[region][action].grant && (global.tech[action_set[region][action].grant[0]] && global.tech[action_set[region][action].grant[0]] >= action_set[region][action].grant[1])){
        isMet = false;
    }
    return isMet;
}

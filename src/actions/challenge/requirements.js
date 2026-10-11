// checkPowerRequirements / checkCityRequirements: pengecekan syarat listrik dan kota. Modul daun (core/vars + registries), dipisah dari challenge_rules.js.
import { global } from '../../core/vars.js';
import { actions } from '../../core/registries.js';

export function checkPowerRequirements(c_action){
    let isMet = true;
    if (c_action['power_reqs']){
        Object.keys(c_action.power_reqs).forEach(function (req){
            if (!global.tech[req] || global.tech[req] < c_action.power_reqs[req]){
                isMet = false;
            }
        });
    }
    return isMet;
}

export function checkCityRequirements(action){
    if ((global.race['kindling_kindred'] || global.race['smoldering']) && action === 'lumber'){
        return false;
    }
    else if ((global.race['kindling_kindred'] || global.race['smoldering']) && action === 'stone'){
        return true;
    }
    let c_path = global.race['truepath'] ? 'truepath' : 'standard';
    if (actions.city[action].hasOwnProperty('path') && !actions.city[action].path.includes(c_path)){
        return false;
    }
    let isMet = true;
    Object.keys(actions.city[action].reqs).forEach(function (req){
        if (!global.tech[req] || global.tech[req] < actions.city[action].reqs[req]){
            isMet = false;
        }
    });
    return isMet;
}

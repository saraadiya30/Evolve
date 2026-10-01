// mercCost: biaya tentara bayaran.
import { global } from '../../core/vars.js';
import { traits } from '../../core/registries.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';

export function mercCost(){
    let cost = Math.round((1.24 ** global.civic.garrison.workers) * 75) - 50;
    if (cost > 25000){
        cost = 25000;
    }
    if (global.civic.garrison.m_use > 0){
        cost *= 1.1 ** global.civic.garrison.m_use;
    }
    if (global.race['brute']){
        cost *= 1 - (traits.brute.vars()[0] / 100);
    }
    let fathom = fathomCheck('orc');
    if (fathom > 0){
        cost *= 1 - (traits.brute.vars(1)[0] / 100 * fathom);
    }
    if (global.race['inflation']){
        cost *= 1 + (global.race.inflation / 500);
    }
    if (global.race['high_pop']){
        cost *= traits.high_pop.vars()[1] / 100;
    }
    return Math.round(cost);
}

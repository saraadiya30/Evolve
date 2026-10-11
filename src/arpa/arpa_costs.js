// arpaAdjustCosts: penyesuaian biaya proyek ARPA (creative, fathom). Dipisah dari arpa_projects.js supaya functions/time_format.js tidak perlu meng-import modul proyeknya.
import { adjustCosts } from '../functions/cost_adjusters.js';
import { fathomCheck } from '../races/trait_logic/fathom_check.js';
import { global } from '../core/vars.js';
import { traits } from '../core/registries.js';

export function arpaAdjustCosts(costs,offset,wiki){
    costs = creativeAdjust(costs,offset,wiki);
    return adjustCosts({ 'cost': costs },offset,wiki);
}

export function creativeAdjust(costs,offset,wiki){
    let fathom = fathomCheck('human');
    if ((wiki && wiki.creative) || (!wiki && global.race['creative']) || (!wiki && fathom > 0)){
        let newCosts = {};
        Object.keys(costs).forEach(function (res){
            newCosts[res] = function(){
                let cost = costs[res](offset, wiki);
                if((wiki && wiki.creative) || (!wiki && global.race['creative'])){
                    cost *= (1 - traits.creative.vars()[1] / 100);
                }
                if (fathom > 0){
                    cost *= 1 - (traits.creative.vars(1)[1] / 100 * fathom);
                }
                return cost;
            }
        });
        return newCosts;
    }
    return costs;
}

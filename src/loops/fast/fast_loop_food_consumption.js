// Konsumsi makanan khusus per tick (carnivore, gnawer) dan penanda $ctx.fed.
import { global, breakdown } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { traits } from '../../core/registries.js';
import { loc } from '../../core/locale.js';

export function fastLoopFoodConsumption($ctx){
        if (global.race['carnivore'] && !global.race['herbivore'] && !global.race['soul_eater'] && !global.race['artifical']){
            if (global.resource['Food'].amount > 10){
                let rotPercent = traits.carnivore.vars()[0] / 100;
                let rot = +((global.resource['Food'].amount - 10) * (rotPercent)).toFixed(3);
                if (global.city['smokehouse']){
                    rot *= 0.9 ** global.city.smokehouse.count;
                }
                modRes('Food', -(rot * $ctx.time_multiplier));
                breakdown.p.consume['Food'][loc('spoilage')] = -(rot);
            }
        }

        if (global.race['gnawer']){
            let res = global.race['kindling_kindred'] || global.race['smoldering'] ? 'Stone' : 'Lumber';
            if (global.resource[res].display){
                let pop = global.resource[global.race.species].amount + global.civic.garrison.workers;
                if(global.race['high_pop']){
                    pop /= traits.high_pop.vars()[0];
                }
                let res_cost = pop * traits.gnawer.vars()[0];
                breakdown.p.consume[res][loc('trait_gnawer_bd')] = -(res_cost);
                modRes(res, -(res_cost * $ctx.time_multiplier));
            }
        }

        // Consumption
        $ctx.fed = true;
}

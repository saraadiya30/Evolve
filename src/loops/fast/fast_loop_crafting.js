// Crafting di foundry per tick (biaya dan hasil kerajinan).
import { global, breakdown } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { eventActive } from '../../functions/event_dates.js';
import { traits } from '../../core/registries.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';
import { production } from '../../resources/prod.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { craftCost } from '../../resources/craft_cost.js';
import { craftingRatio } from '../../resources/resources.js';
import { jobName } from '../../civics/jobs/job_name.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';
import { jobScale } from '../../civics/jobs/job_scale.js';

export function fastLoopCrafting($ctx){
        // Crafting
        if (global.tech['foundry']){
            let craft_costs = global.race['resourceful'] ? (1 - traits.resourceful.vars()[0] / 100) : 1;
            let arraakFathom = fathomCheck('arraak');
            if (arraakFathom > 0){
                craft_costs -= traits.resourceful.vars(1)[0] / 100 * arraakFathom;
            }
            let crafting_costs = craftCost();
            let crafting_usage = {};

            craftingRatio('','',true); //Recalculation
            Object.keys(crafting_costs).forEach(function (craft){
                if (craft === 'Thermite' && !eventActive('summer')){
                    return;
                }
                breakdown.p[craft] = {};
                let num = workerScale(global.city.foundry[craft],'craftsman');
                if (global.race['servants'] && global.race.servants.hasOwnProperty('sjobs') && global.race.servants.sjobs.hasOwnProperty(craft)){
                    num += jobScale(global.race.servants.sjobs[craft]);
                }
                let craft_ratio = craftingRatio(craft,'auto').multiplier;

                let speed = global.genes['crafty'] ? 2 : 1;
                let volume = Math.floor(global.resource[crafting_costs[craft][0].r].amount / (crafting_costs[craft][0].a * speed * craft_costs / 140));
                for (let i=1; i<crafting_costs[craft].length; i++){
                    let temp = Math.floor(global.resource[crafting_costs[craft][i].r].amount / (crafting_costs[craft][i].a * speed * craft_costs / 140));
                    if (temp < volume){
                        volume = temp;
                    }
                }
                if (num < volume){
                    volume = num;
                }

                for (let i=0; i<crafting_costs[craft].length; i++){
                    let final = volume * crafting_costs[craft][i].a * craft_costs * speed * $ctx.time_multiplier / 140;
                    modRes(crafting_costs[craft][i].r, -(final));
                    if (typeof crafting_usage[crafting_costs[craft][i].r] === 'undefined'){
                        crafting_usage[crafting_costs[craft][i].r] = final / $ctx.time_multiplier;
                    }
                    else {
                        crafting_usage[crafting_costs[craft][i].r] += final / $ctx.time_multiplier;
                    }
                }

                if (global.race['high_pop']){
                    volume = highPopAdjust(volume);
                }

                breakdown.p[craft][jobName('craftsman')] = (volume * speed / 140) + 'v';

                modRes(craft, craft_ratio * volume * speed * $ctx.time_multiplier / 140 * production('psychic_boost',craft));
            });

            Object.keys(crafting_usage).forEach(function (used){
                if (crafting_usage[used] > 0){
                    breakdown.p.consume[used][jobName('craftsman')] = -(crafting_usage[used]);
                }
            });
        }
}

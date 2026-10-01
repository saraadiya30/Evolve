// Foundry, trait kindling kindred/smoldering, dan event April Mop 2023.
import { global } from '../../core/vars.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { eventActive } from '../../functions/event_dates.js';
import { craftCost } from '../../resources/craft_cost.js';

export function midLoopFoundryKindling($ctx){
        if (global.city['foundry']){
            let fworkers = global.civic.craftsman.workers;
            if ((global.race['kindling_kindred'] || global.race['smoldering']) && global.city.foundry['Plywood'] > 0){
                global.civic.craftsman.workers -= global.city.foundry['Plywood'];
                global.city.foundry.crafting -= global.city.foundry['Plywood'];
                global.city.foundry['Plywood'] = 0;
            }
            let craft_costs = craftCost();
            Object.keys(craft_costs).forEach(function (craft){
                while (global.city.foundry[craft] > fworkers && global.city.foundry[craft] > 0){
                    global.city.foundry[craft]--;
                    global.city.foundry.crafting--;
                }
                fworkers -= global.city.foundry[craft];
            });
        }

        if (global.tech['foundry'] === 3 && (global.race['kindling_kindred'] || global.race['smoldering'])){
            global.tech['foundry'] = 4;
            drawTech();
        }

        if (global.race['kindling_kindred'] || global.race['smoldering']){
            global.civic.lumberjack.workers = 0;
            global.civic.lumberjack.assigned = 0;
            global.resource.Lumber.crates = 0;
            global.resource.Lumber.containers = 0;
            global.resource.Lumber.trade = 0;
        }
        if ((global.race['kindling_kindred'] || global.race['smoldering']) && global.city['foundry'] && global.city.foundry['Plywood']){
            global.city.foundry['Plywood'] = 0;
        }

        if (eventActive('fool',2023) && !global.race['hooved']){
            global.resource.Horseshoe.display = true;
        }
        else if (!global.race['hooved']){
            global.resource.Horseshoe.display = false;
        }
}

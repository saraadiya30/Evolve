import { global, breakdown } from './vars.js';
import { deepClone } from './object_utils.js';
import { adjustCosts } from '../functions/cost_adjusters.js';
import { messageQueue } from '../functions/message_log.js';
import { races, traits } from './registries.js';
import { craftCost } from '../resources/resource_tabs.js';
import { atomic_mass } from '../resources/resources.js';
import { tradeBuyPrice, tradeSellPrice } from '../resources/crate_assignment.js';
import { tradeRatio } from '../config/constants.js';
import { actions } from './registries.js';
import { checkAffordable } from '../actions/core/action_costs.js';
import { fuel_adjust, int_fuel_adjust } from '../space/planet_generation.js';
import { shipCosts } from '../truepath/tau_ceti_shipyard.js';
import { f_rate } from '../industry/industry.js';
import { armyRating } from '../civics/military/army_rating.js';
import { alevel } from '../achievements/achievement_helpers.js';
import { loc } from './locale.js';

export function enableDebug(){
    if (global.settings.expose){
        window.evolve = {
            actions: deepClone(actions),
            races: deepClone(races),
            traits: deepClone(traits),
            tradeRatio: deepClone(tradeRatio),
            craftCost: deepClone(craftCost(true)),
            atomic_mass: deepClone(atomic_mass),
            f_rate: deepClone(f_rate),
            checkAffordable: deepClone(checkAffordable),
            adjustCosts: deepClone(adjustCosts),
            armyRating: deepClone(armyRating),
            tradeBuyPrice: deepClone(tradeBuyPrice),
            tradeSellPrice: deepClone(tradeSellPrice),
            fuel_adjust: deepClone(fuel_adjust),
            int_fuel_adjust: deepClone(int_fuel_adjust),
            alevel: deepClone(alevel),
            messageQueue: deepClone(messageQueue),
            loc: deepClone(loc),
            shipCosts: deepClone(shipCosts),
            updateDebugData: deepClone(updateDebugData),
            global: {},
            breakdown: {},
        };
    }
}

export function updateDebugData(){
    if (global.settings.expose){
        window.evolve.global = deepClone(global);
        window.evolve.craftCost = deepClone(craftCost(true)),
        window.evolve.breakdown = deepClone(breakdown);
    }
}

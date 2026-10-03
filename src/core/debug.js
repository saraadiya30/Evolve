import { global, breakdown } from './vars.js';
import { deepClone, adjustCosts, messageQueue } from '../functions/functions.js';
import { races, traits } from '../races/races.js';
import { craftCost, atomic_mass, tradeBuyPrice, tradeSellPrice } from '../resources/resources.js';
import { tradeRatio } from '../config/trade.js';
import { actions, checkAffordable } from '../actions/actions.js';
import { fuel_adjust, int_fuel_adjust } from '../space/space.js';
import { shipCosts } from '../truepath/truepath.js';
import { f_rate } from '../industry/industry.js';
import { armyRating } from '../civics/civics.js';
import { alevel } from '../achievements/achieve.js';
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

// Pure maths for the Ocoin Alchemy tab (Resources > Ocoin). No DOM and no game state in here, so it can be unit tested
// outside the browser. Imports only from the two pure config files.
import { OCOIN_RATE } from './stocks_core.js';
import { resource_values } from '../config/constants.js';

// --- Tunable constants ---------------------------------------------------------------------------------------------
// Ocoin price of one unit of a resource = base market value * OCOIN_ALCH_MARKUP / OCOIN_RATE (1 Ocoin = 1000 Money).
// Markup 4 means buying a unit costs 4x what the Money market would pay for it, so this is a convenience sink for Ocoin,
// not a free money printer. Adjust here.
export const OCOIN_ALCH_MARKUP = 4;
// Per resource price in Ocoin per unit, when the formula above is not what you want. Takes priority over the formula.
export const OCOIN_ALCH_PRICE_OVERRIDE = {
    // Example: Iron: 0.2
};
// Never offered in this tab (not a material). Money, Knowledge, Genes, Soul_Gem, Codex, ... are already out because
// their base value is 0 or missing in resource_values; Mana is listed only for safety.
export const OCOIN_ALCH_EXCLUDE = ['Mana'];

// Ocoin cost of one unit of `res`. Returns 0 when the resource has no price (so it is not eligible).
export function ocoinAlchemyPrice(res, values = resource_values){
    if (OCOIN_ALCH_PRICE_OVERRIDE[res] > 0){
        return OCOIN_ALCH_PRICE_OVERRIDE[res];
    }
    let value = values[res] || 0;
    return value > 0 ? value * OCOIN_ALCH_MARKUP / OCOIN_RATE : 0;
}

// Eligible resources, in the game's own resource order: a real material (tradable, or stackable, or has a base value),
// with a price, and not special. `resources` is tmp_vars.resource.
export function ocoinAlchemyList(resources, values = resource_values){
    return Object.keys(resources || {}).filter(function(res){
        let r = resources[res];
        return !OCOIN_ALCH_EXCLUDE.includes(res) && (r.tradable || r.stackable || (values[res] || 0) > 0) && ocoinAlchemyPrice(res, values) > 0;
    });
}

// One resource, one loop.
//   alloc  units per second the player asked for
//   mult   time_multiplier of this loop
//   scale  timeScale() while the production loop runs, otherwise 1 (modRes multiplies by it again)
//   price  Ocoin per unit
//   ocoin  free Ocoin (Ocoin locked in orders is already not in here)
//   room   free storage left for this resource, or -1 for unlimited
// Returns { units, cost }: pass `units` to modRes (it applies `scale` itself), subtract `cost` from the Ocoin.
// Never spends more Ocoin than there is, and never buys more than fits into storage.
export function ocoinAlchemyStep(alloc, mult, scale, price, ocoin, room){
    let none = { units: 0, cost: 0 };
    if (!(alloc > 0) || !(mult > 0) || !(scale > 0) || !(price > 0) || !(ocoin > 0)){
        return none;
    }
    let actual = alloc * mult * scale;
    if (room >= 0){
        actual = Math.min(actual, room);
    }
    actual = Math.min(actual, ocoin / price);
    if (!(actual > 0) || !isFinite(actual)){
        return none;
    }
    return { units: actual / scale, cost: Math.min(ocoin, actual * price) };
}

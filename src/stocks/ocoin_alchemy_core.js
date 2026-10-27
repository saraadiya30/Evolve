// Pure maths for the Ocoin Alchemy tab (Resources > Ocoin). No DOM and no game state in here, so it can be unit tested
// outside the browser. Imports only from the two pure config files.
import { OCOIN_RATE } from './stocks_core.js';
import { resource_values } from '../config/constants.js';

// --- Tunable constants ---------------------------------------------------------------------------------------------
// Ocoin price of one unit of a resource = what one unit costs in Money * OCOIN_ALCH_MARKUP / OCOIN_RATE (1 Ocoin = 1000 Money).
// "What one unit costs" is the price of buying it through an import trade route (route price / units per route), so it follows
// the trade route modifiers (wharf, GPS, railway, traits, inflation, market value). A resource without a trade route falls
// back to its base market value. Markup 4 means buying a unit costs 4x that, so this is a convenience sink for Ocoin, not a
// free money printer. Adjust here.
export const OCOIN_ALCH_MARKUP = 1;
// Prices are shown per lot of this many units, and each step of the allocation (the number next to a resource) buys one lot per second.
export const OCOIN_ALCH_LOT = 1000;
// Crafted resources (Plywood, Brick, Wrought_Iron, ...) have no trade route and no base market value. Their price is what the
// ingredients of one unit cost (recipe amounts x the ingredient prices above, so it follows the trade route modifiers of the
// ingredients too) times this markup. The recipe comes from the caller (`recipe`: res -> [{ r, a }] or null), like routeCost.
export const OCOIN_ALCH_CRAFT_MARKUP = 1;
// Per resource price in Ocoin per unit, when the formula above is not what you want. Takes priority over the formula.
export const OCOIN_ALCH_PRICE_OVERRIDE = {
    // Example: Iron: 0.2
};
// Trade route profit (wharf, GPS, railway) moves the two prices apart the same way the marketplace does (tradeProfitBuyFactor /
// tradeProfitSellFactor in crate_assignment.js): buying costs base x buyFactor (< 1, soft cap: it only approaches 0), selling pays
// base x sellFactor (> 1). No fixed limit here, the limit is the soft cap of the buy factor itself.
// Never offered in this tab (not a material). Money, Knowledge, Genes, Soul_Gem, Codex, ... are already out because
// their base value is 0 or missing in resource_values; Mana is listed only for safety.
export const OCOIN_ALCH_EXCLUDE = ['Mana'];

// Ocoin cost of one unit of `res`. Returns 0 when the resource has no price (so it is not eligible).
// `routeCost` (optional) is a function res -> Money one unit costs through an import trade route, 0 when there is no route.
// `recipe` (optional) is a function res -> [{ r: ingredient, a: amount }] for one unit of a crafted resource, null/empty otherwise.
// Both are passed in, not imported, to keep this file free of game state. Without them the base market value is used.
export function ocoinAlchemyPrice(res, values = resource_values, routeCost = null, recipe = null){
    if (OCOIN_ALCH_PRICE_OVERRIDE[res] > 0){
        return OCOIN_ALCH_PRICE_OVERRIDE[res];
    }
    let parts = recipe ? recipe(res) : null;
    if (parts && parts.length){
        // crafted: sum of the ingredients. One ingredient with no price makes the whole thing unavailable (0), not cheap.
        let total = 0;
        for (let i = 0; i < parts.length; i++){
            let p = ocoinAlchemyPrice(parts[i].r, values, routeCost);
            if (!(p > 0) || !(parts[i].a > 0)){
                return 0;
            }
            total += p * parts[i].a;
        }
        return total > 0 && isFinite(total) ? total * OCOIN_ALCH_CRAFT_MARKUP : 0;
    }
    let unit = routeCost ? Number(routeCost(res)) : 0;
    if (!(unit > 0) || !isFinite(unit)){
        unit = values[res] || 0;
    }
    return unit > 0 ? unit * OCOIN_ALCH_MARKUP / OCOIN_RATE : 0;
}

// Buy / sell price of one unit in Ocoin: the base price above times the trade route profit factor (1 = no profit).
export function ocoinAlchemyBuyPrice(res, values = resource_values, routeCost = null, factor = 1, recipe = null){
    let f = Number(factor);
    return ocoinAlchemyPrice(res, values, routeCost, recipe) * (f > 0 && isFinite(f) ? f : 1);
}
export function ocoinAlchemySellPrice(res, values = resource_values, routeCost = null, factor = 1, recipe = null){
    let f = Number(factor);
    return ocoinAlchemyPrice(res, values, routeCost, recipe) * (f > 0 && isFinite(f) ? f : 1);
}

// Ocoin cost of one lot (OCOIN_ALCH_LOT units) of `res`.
export function ocoinAlchemyLotPrice(res, values = resource_values, routeCost = null, recipe = null){
    return ocoinAlchemyPrice(res, values, routeCost, recipe) * OCOIN_ALCH_LOT;
}

// Eligible resources, in the game's own resource order: a real material (tradable, or stackable, or has a base value),
// with a price, and not special. A crafted resource (it has a `recipe`) counts as a material too. `resources` is tmp_vars.resource.
export function ocoinAlchemyList(resources, values = resource_values, recipe = null){
    return Object.keys(resources || {}).filter(function(res){
        let r = resources[res];
        let crafted = recipe ? (recipe(res) || []).length > 0 : false;
        return !OCOIN_ALCH_EXCLUDE.includes(res) && (r.tradable || r.stackable || crafted || (values[res] || 0) > 0) && ocoinAlchemyPrice(res, values, null, recipe) > 0;
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

// Selling: same idea as ocoinAlchemyStep, but the resource is what runs out (not the Ocoin) and the Ocoin is paid out.
//   alloc  units per second the player asked for
//   mult, scale  as above
//   price  Ocoin paid per unit sold
//   have   units of the resource in stock
// Returns { units, gain }: pass `units` (negated) to modRes, add `gain` to the Ocoin.
// Never sells more than there is in stock.
export function ocoinAlchemySellStep(alloc, mult, scale, price, have){
    let none = { units: 0, gain: 0 };
    if (!(alloc > 0) || !(mult > 0) || !(scale > 0) || !(price > 0) || !(have > 0)){
        return none;
    }
    let actual = Math.min(alloc * mult * scale, have);
    if (!(actual > 0) || !isFinite(actual)){
        return none;
    }
    return { units: actual / scale, gain: actual * price };
}

// --- Instant trade (one click, not per second) ---------------------------------------------------------------------
// Quantity of one click = number x 10^exponent, picked in the tab like the units of the Aether tab (none, K, M, B, ...). There is no
// upper limit: the real limits are the free Ocoin, the storage and the stock (see ocoinInstantBuy / ocoinInstantSell).
// The exponents offered in the unit list (3 = K, 6 = M, ... 24 = S, same letters as the Aether tab).
export const OCOIN_INSTANT_EXPS = [0, 3, 6, 9, 12, 15, 18, 21, 24];
// Whole units for `coef` x 10^`exp`. 0 for anything that is not a positive number. The toPrecision step removes float noise
// (4.35 x 100 would otherwise floor to 434).
export function ocoinInstantQuantity(coef, exp){
    let c = Number(coef);
    let e = Number(exp);
    if (!(c > 0) || !isFinite(c) || !isFinite(e)){
        return 0;
    }
    let q = Number((c * Math.pow(10, e)).toPrecision(12));
    return isFinite(q) ? Math.floor(q) : 0;
}

// Instant buy of `qty` units at `price` Ocoin per unit. Whole units only. Never spends more Ocoin than there is and never buys
// more than fits into storage (`room`, -1 = unlimited). Returns { units, cost }.
export function ocoinInstantBuy(qty, price, ocoin, room){
    let none = { units: 0, cost: 0 };
    if (!(qty > 0) || !(price > 0) || !(ocoin > 0) || !isFinite(qty)){
        return none;
    }
    let units = Math.min(Math.floor(qty), Math.floor(ocoin / price));
    if (room >= 0){
        units = Math.min(units, Math.floor(room));
    }
    if (!(units > 0) || !isFinite(units)){
        return none;
    }
    return { units: units, cost: Math.min(ocoin, units * price) };
}

// Instant sell of `qty` units at `price` Ocoin per unit. Whole units only, never more than the stock `have`.
// Returns { units, gain }.
export function ocoinInstantSell(qty, price, have){
    let none = { units: 0, gain: 0 };
    if (!(qty > 0) || !(price > 0) || !(have >= 1) || !isFinite(qty)){
        return none;
    }
    let units = Math.min(Math.floor(qty), Math.floor(have));
    if (!(units > 0) || !isFinite(units)){
        return none;
    }
    return { units: units, gain: units * price };
}

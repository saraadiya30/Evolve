// Contains: initOcoinAlchemy(), loadOcoinAlchemy(), drawOcoinAlchemy(), fastLoopOcoinAlchemy()
// Resources > Ocoin tab: like Alchemy, but it pays with Ocoin (free Ocoin only, what is locked in stock orders cannot be used)
// and works for every resource that has a price (see ocoin_alchemy_core.js), not only the ones in tradeRatio.
// One number per resource, in lots: above 0 it buys (price lowered by the trade route profit), below 0 it sells (price raised by it).
import { global, breakdown, tmp_vars, keyMultiplier } from '../core/vars.js';
import { vBind, clearElement } from '../functions/dom_helpers.js';
import { loc } from '../core/locale.js';
import { modRes, timeScale } from '../functions/resource_mod.js';
import { stockFlags } from '../stocks/stocks_core.js';
import { ocoinAlchemyBuyPrice, ocoinAlchemySellPrice, ocoinAlchemyList, ocoinAlchemyStep, ocoinAlchemySellStep, ocoinInstantBuy, ocoinInstantSell, OCOIN_ALCH_LOT, OCOIN_INSTANT_EXPS, ocoinInstantQuantity } from '../stocks/ocoin_alchemy_core.js';
import { resource_values } from '../config/constants.js';
import { craftCost } from './craft_cost.js';
import { tradeRouteUnitCost, tradeProfitBuyFactor, tradeProfitSellFactor } from './crate_assignment.js';
import { aetherFormat } from './aether_alchemy.js';
import { aether_big_affix } from './aether_affix.js';

const TAB_INDEX = 5;

// Ocoin per unit / per lot, priced from the import trade route (falls back to the base value for resources with no route).
// Same profit mechanics as the marketplace: buying gets the trade route buy discount, selling the sell bonus on top.
// Crafted resources (Plywood, Brick, ...) are priced from their crafting recipe (what the ingredients of one unit cost), so the
// recipe is handed to the pure price maths. Same recipe the crafting itself uses (manual = true: without the high_pop discount).
export function ocoinCraftRecipe(res){
    let recipe = craftCost(true)[res];
    return recipe && recipe.length ? recipe : null;
}
export function ocoinUnitPrice(res){
    return ocoinAlchemyBuyPrice(res, resource_values, tradeRouteUnitCost, tradeProfitBuyFactor(), ocoinCraftRecipe);
}
export function ocoinSellUnitPrice(res){
    return ocoinAlchemySellPrice(res, resource_values, tradeRouteUnitCost, tradeProfitSellFactor(), ocoinCraftRecipe);
}
function ocoinLotPrice(res){
    return ocoinUnitPrice(res) * OCOIN_ALCH_LOT;
}
function ocoinSellLotPrice(res){
    return ocoinSellUnitPrice(res) * OCOIN_ALCH_LOT;
}

// The number next to each resource counts lots: 1 = OCOIN_ALCH_LOT units per second. Before that it counted single units per
// second, so an allocation from an older save is converted once (rounded to whole lots) instead of suddenly buying 100x more.
// Runs from the tab and from the fast loop, because the loop can run before the tab was ever opened.
export function migrateOcoinAlchemyLots(){
    // An earlier version kept the lots to sell in a second list (ocoinAlchemySell). Selling is now the negative side of the
    // same number, so whatever was there is folded in once.
    let oldSell = global.race['ocoinAlchemySell'];
    if (oldSell){
        if (!global.race['ocoinAlchemy']){
            global.race['ocoinAlchemy'] = {};
        }
        Object.keys(oldSell).forEach(function(res){
            let lots = Number(oldSell[res]) || 0;
            if (lots > 0){
                global.race.ocoinAlchemy[res] = (Number(global.race.ocoinAlchemy[res]) || 0) - lots;
            }
        });
        delete global.race['ocoinAlchemySell'];
    }
    let alloc = global.race['ocoinAlchemy'];
    if (!alloc || global.race['ocoinAlchemyLots']){
        return;
    }
    Object.keys(alloc).forEach(function(res){
        alloc[res] = Math.round(Number(alloc[res]) / OCOIN_ALCH_LOT) || 0;
    });
    global.race['ocoinAlchemyLots'] = true;
}

function ensureState(){
    if (!global.race['ocoinAlchemy']){
        global.race['ocoinAlchemy'] = {};
    }
    migrateOcoinAlchemyLots();
    // Quantity of one instant buy/sell click = coef x 10^exp units (default 1 x K = one lot). Kept in an object so the keys are
    // reactive before the first vBind. An earlier version kept one plain number (qty): it becomes coef with no unit.
    if (!global.race['ocoinInstant']){
        global.race['ocoinInstant'] = {};
    }
    let ins = global.race.ocoinInstant;
    if (typeof ins.coef !== 'number'){
        let old = Number(ins.qty);
        ins.coef = old > 0 && isFinite(old) ? old : 1;
        ins.exp = old > 0 && isFinite(old) ? 0 : 3;
        delete ins.qty;
    }
    clampInstantQty();
    if (!global.stocks || typeof global.stocks.ocoin !== 'number'){
        global['stocks'] = Object.assign({}, global.stocks, { ocoin: 0 });
    }
}

// Instant trade: one click buys or sells the picked quantity at once, for any resource in this tab. Same prices as the per second
// allocation (trade route profit included). Buying is limited by free Ocoin and by storage, selling by the stock in hand, so a
// click never wastes Ocoin or items: it trades as much as fits, and does nothing when nothing fits.
function clampInstantQty(){
    let ins = global.race.ocoinInstant;
    let c = Number(ins.coef);
    // empty or invalid input (v-model.number gives '' for an empty box) falls back to 1, a negative one to 0
    if (!isFinite(c) || ins.coef === ''){
        ins.coef = 1;
    }
    else if (c < 0){
        ins.coef = 0;
    }
    if (!OCOIN_INSTANT_EXPS.includes(Number(ins.exp))){
        ins.exp = 3;
    }
}
function instantQty(){
    ensureState();
    return ocoinInstantQuantity(global.race.ocoinInstant.coef, global.race.ocoinInstant.exp);
}
function instantBuyQuote(res){
    let r = global.resource[res];
    if (!r || !global.stocks){
        return { units: 0, cost: 0 };
    }
    let room = r.max >= 0 ? Math.max(0, r.max - r.amount) : -1;
    return ocoinInstantBuy(instantQty(), ocoinUnitPrice(res), global.stocks.ocoin, room);
}
function instantSellQuote(res){
    let r = global.resource[res];
    if (!r || !global.stocks){
        return { units: 0, gain: 0 };
    }
    return ocoinInstantSell(instantQty(), ocoinSellUnitPrice(res), r.amount);
}
export function ocoinInstantBuyNow(res){
    if (global.settings.pause || !global.resource[res] || !global.resource[res].display){
        return false;
    }
    ensureState();
    let q = instantBuyQuote(res);
    if (!(q.units > 0)){
        return false;
    }
    global.resource[res].amount += q.units;
    global.stocks.ocoin = Math.max(0, global.stocks.ocoin - q.cost);
    return true;
}
export function ocoinInstantSellNow(res){
    if (global.settings.pause || !global.resource[res] || !global.resource[res].display){
        return false;
    }
    ensureState();
    let q = instantSellQuote(res);
    if (!(q.units > 0)){
        return false;
    }
    global.resource[res].amount = Math.max(0, global.resource[res].amount - q.units);
    global.stocks.ocoin += q.gain;
    return true;
}

export function initOcoinAlchemy(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== TAB_INDEX)){
        return;
    }
    clearElement($('#resOcoinAlchemy'));
}

// Unit list for the quantity, same idea as the Aether tab: none (x1), K, M, B, ... (aether_big_affix, exponent 3, 6, 9, ...).
function instantUnitOptions(){
    let opts = '';
    OCOIN_INSTANT_EXPS.forEach(function(exp){
        let label = exp === 0 ? loc('aether_unit_none') : aether_big_affix[exp / 3 - 1];
        opts += `<option value="${exp}">${label}</option>`;
    });
    return opts;
}

// Quantity of one Buy / Sell click: a number and a unit, like the Aether tab (no upper limit).
function loadQty(){
    let qty = $(`<div id="ocoinInstantQty" class="market-header"><h3 class="has-text-warning" style="display:inline;margin-right:.5rem;">${loc('resource_trade_qty')}</h3></div>`);
    $('#resOcoinAlchemy').append(qty);
    qty.append($(`<input type="number" min="0" step="any" v-model.number="coef" @change="clamp()" style="width:5rem;margin-right:.25rem;background:#1a1a1a;color:inherit;border:1px solid #555;">`));
    qty.append($(`<select v-model.number="exp" @change="clamp()" style="background:#1a1a1a;color:inherit;border:1px solid #555;margin-right:.5rem;">${instantUnitOptions()}</select>`));
    qty.append($(`<span class="current infoOnly">= {{ total() }}</span>`));
    vBind({
        el: `#ocoinInstantQty`,
        data: global.race.ocoinInstant,
        methods: {
            clamp(){
                clampInstantQty();
            },
            total(){
                return aetherFormat(ocoinInstantQuantity(this.coef, this.exp));
            }
        }
    });
}

// Header row: free Ocoin and what the current allocation costs per second.
function loadHeader(){
    let head = $(`<div id="ocoinAlchemyHead" class="market-item"><h3 class="res has-text-info">${loc('resource_Ocoin_name')}</h3></div>`);
    $('#resOcoinAlchemy').append(head);
    head.append($(`<span class="current">{{ free() }}</span>`));
    head.append($(`<span class="current" style="margin-left:.75rem;" :class="rateClass()">${loc('ocoin_alchemy_rate')} {{ rate() }}</span>`));
    vBind({
        el: `#ocoinAlchemyHead`,
        data: { st: global.stocks, a: global.race.ocoinAlchemy },
        methods: {
            free(){
                return aetherFormat(global.stocks.ocoin);
            },
            // Ocoin per second, income from selling minus cost of buying: + means Ocoin grows, - means it shrinks
            net(){
                let total = 0;
                Object.keys(global.race.ocoinAlchemy).forEach(function(res){
                    let lots = Number(global.race.ocoinAlchemy[res]);
                    if (!lots || !global.resource[res] || !global.resource[res].display){
                        return;
                    }
                    total += lots < 0 ? -lots * ocoinSellLotPrice(res) : -lots * ocoinLotPrice(res);
                });
                return total;
            },
            rate(){
                let total = this.net();
                return (total > 0 ? '+' : '') + aetherFormat(total);
            },
            rateClass(){
                let total = this.net();
                return total > 0 ? 'has-text-success' : total < 0 ? 'has-text-danger' : '';
            }
        }
    });
}

// Minus = sell more (the number goes down, below 0 it sells), plus = buy more. The tooltip on each button says what
// 1 lot (OCOIN_ALCH_LOT items) is worth at the current trade route profit, so the row itself stays short.
export function loadOcoinAlchemy(name,color){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== TAB_INDEX)){
        return;
    }
    ensureState();
    let alchemy = $(`<div id="ocoinAlch${name}" class="market-item" v-show="r.display"><h3 class="res has-text-${color}">${global.resource[name].name}</h3></div>`);
    $('#resOcoinAlchemy').append(alchemy);

    // Same row as the marketplace: BUY [price] SELL [price], price per unit in Ocoin. The tooltip says what one click does now.
    alchemy.append($(`<span class="buy"><span class="has-text-success">${loc('resource_market_buy')}</span></span>`));
    alchemy.append($(`<b-tooltip append-to-body :label="instBuyTip('${name}')" position="is-top" size="is-small" multilined animated><span role="button" class="order" :class="{ off: !instBuyOk('${name}') }" @click="instBuy('${name}')">{{ buyPrice('${name}') }}</span></b-tooltip>`));
    alchemy.append($(`<span class="sell"><span class="has-text-danger">${loc('resource_market_sell')}</span></span>`));
    alchemy.append($(`<b-tooltip append-to-body :label="instSellTip('${name}')" position="is-top" size="is-small" multilined animated><span role="button" class="order" :class="{ off: !instSellOk('${name}') }" @click="instSell('${name}')">{{ sellPrice('${name}') }}</span></b-tooltip>`));

    // Per second allocation, like the routes of the marketplace: minus sells, plus buys, one step = one lot per second.
    let res = $(`<span class="trade"><span class="has-text-warning">${loc('ocoin_alchemy_auto')}</span></span>`);
    alchemy.append(res);
    res.append($(`<b-tooltip append-to-body :label="sellTip('${name}')" position="is-top" size="is-small" multilined animated><span role="button" aria-label="sell ${global.resource[name].name}" class="sub has-text-danger" @click="subSpell('${name}')"><span>-</span></span></b-tooltip>`));
    res.append($(`<span class="current">{{ a.${name} }}</span>`));
    res.append($(`<b-tooltip append-to-body :label="buyTip('${name}')" position="is-top" size="is-small" multilined animated><span role="button" aria-label="buy ${global.resource[name].name}" class="add has-text-success" @click="addSpell('${name}')"><span>+</span></span></b-tooltip>`));

    if (!global.race.ocoinAlchemy.hasOwnProperty(name)){
        global.race.ocoinAlchemy[name] = 0;
    }

    vBind({
        el: `#ocoinAlch${name}`,
        data: {
            r: global.resource[name],
            a: global.race.ocoinAlchemy,
            i: global.race.ocoinInstant
        },
        methods: {
            // r.amount, i.coef and i.exp are read here so Vue redraws the labels when the stock or the quantity changes
            instBuyOk(res){
                return this.r.amount >= 0 && this.i.coef >= 0 && this.i.exp >= 0 && instantBuyQuote(res).units > 0;
            },
            instSellOk(res){
                return this.r.amount >= 0 && this.i.coef >= 0 && this.i.exp >= 0 && instantSellQuote(res).units > 0;
            },
            buyPrice(res){
                return aetherFormat(ocoinUnitPrice(res));
            },
            sellPrice(res){
                return aetherFormat(ocoinSellUnitPrice(res));
            },
            instBuyTip(res){
                let q = this.instBuyOk(res) ? instantBuyQuote(res) : { units: instantQty(), cost: ocoinUnitPrice(res) * instantQty() };
                return loc('ocoin_instant_buy_tip',[aetherFormat(q.units), global.resource[res].name, aetherFormat(q.cost), aetherFormat(ocoinUnitPrice(res))]);
            },
            instSellTip(res){
                let q = this.instSellOk(res) ? instantSellQuote(res) : { units: instantQty(), gain: ocoinSellUnitPrice(res) * instantQty() };
                return loc('ocoin_instant_sell_tip',[aetherFormat(q.units), global.resource[res].name, aetherFormat(q.gain), aetherFormat(ocoinSellUnitPrice(res))]);
            },
            instBuy(res){
                ocoinInstantBuyNow(res);
            },
            instSell(res){
                ocoinInstantSellNow(res);
            },
            addSpell(spell){
                global.race.ocoinAlchemy[spell] += keyMultiplier();
            },
            subSpell(spell){
                global.race.ocoinAlchemy[spell] -= keyMultiplier();
            },
            sellTip(spell){
                // one click moves keyMultiplier() lots, so the tooltip shows that step (keyMultiplier() is reactive, see vars.js)
                let m = keyMultiplier();
                return loc('ocoin_alchemy_sell_tip',[aetherFormat(ocoinSellLotPrice(spell) * m), OCOIN_ALCH_LOT * m, global.resource[spell].name]);
            },
            buyTip(spell){
                let m = keyMultiplier();
                return loc('ocoin_alchemy_buy_tip',[aetherFormat(ocoinLotPrice(spell) * m), OCOIN_ALCH_LOT * m, global.resource[spell].name]);
            }
        }
    });
}

// Draws the whole tab: header + one row per eligible resource. Rows use v-show r.display, so a resource that unlocks
// later just appears; nothing needs redrawing.
export function drawOcoinAlchemy(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== TAB_INDEX)){
        return;
    }
    initOcoinAlchemy();
    ensureState();
    let list = tmp_vars.hasOwnProperty('resource') ? ocoinAlchemyList(tmp_vars.resource, resource_values, ocoinCraftRecipe) : [];
    // Every key must exist BEFORE the first vBind: Vue 2 only makes the keys that exist at bind time reactive, so a key added
    // afterwards would change in the data but the number on screen would never update (the buttons look dead).
    list.forEach(function(name){
        if (!global.race.ocoinAlchemy.hasOwnProperty(name)){
            global.race.ocoinAlchemy[name] = 0;
        }
    });
    loadQty();
    loadHeader();
    list.forEach(function(name){
        loadOcoinAlchemy(name, tmp_vars.resource[name].color);
    });
}

// One number per resource: below 0 sells -n lots, above 0 buys n lots.
// Returns the Ocoin this tick paid out.
function fastLoopOcoinSell($ctx, scale){
    let alloc = global.race['ocoinAlchemy'];
    let gained = 0;
    if (!alloc || !global.stocks){
        return gained;
    }
    Object.keys(alloc).forEach(function(res){
        if (!(alloc[res] < 0) || !global.resource[res] || !global.resource[res].display){
            return;
        }
        // the allocation counts lots, the step wants units per second
        let sold = ocoinAlchemySellStep(-Number(alloc[res]) * OCOIN_ALCH_LOT, $ctx.time_multiplier, scale, ocoinSellUnitPrice(res), global.resource[res].amount);
        if (sold.units > 0){
            // sold, not consumed: modRes only checks there is enough in stock
            modRes(res, -sold.units, false, true);
            global.stocks.ocoin += sold.gain;
            gained += sold.gain;
            if (breakdown.p.consume && breakdown.p.consume[res]){
                breakdown.p.consume[res][loc('tab_ocoin_alchemy')] = -sold.units / $ctx.time_multiplier;
            }
        }
    });
    return gained;
}

// Returns the Ocoin this tick spent.
function fastLoopOcoinBuy($ctx, scale){
    let alloc = global.race['ocoinAlchemy'];
    let spent = 0;
    if (!alloc || !(global.stocks.ocoin > 0)){
        return spent;
    }
    Object.keys(alloc).forEach(function(res){
        if (!(alloc[res] > 0) || !global.resource[res] || !global.resource[res].display){
            return;
        }
        let price = ocoinUnitPrice(res);
        // real storage left (not the temporary buffer of the loop), so no Ocoin is spent on units that would be thrown away
        let cap = global.resource[res].max;
        let room = cap >= 0 ? Math.max(0, cap - global.resource[res].amount) : -1;
        // the allocation counts lots, the step wants units per second
        let buy = ocoinAlchemyStep(Number(alloc[res]) * OCOIN_ALCH_LOT, $ctx.time_multiplier, scale, price, global.stocks.ocoin, room);
        if (buy.units > 0){
            // bought, not produced: no stock production bonus (same as trade routes)
            modRes(res, buy.units, false, true);
            let paid = Math.min(global.stocks.ocoin, buy.cost);
            global.stocks.ocoin = Math.max(0, global.stocks.ocoin - buy.cost);
            spent += paid;
            if (breakdown.p.consume && breakdown.p.consume[res]){
                breakdown.p.consume[res][loc('tab_ocoin_alchemy')] = buy.units / $ctx.time_multiplier;
            }
        }
    });
    return spent;
}

// Smoothed Ocoin per second this tab really moved (sold minus bought, about 10 ticks), kept in global.stocks.alchemyFlow so the
// Ocoin per second indicator in Misc > Stocks can show it next to Auto Convert and the Compoundia payout.
function trackAlchemyFlow(net, seconds){
    if (!global.stocks || !(seconds > 0) || !isFinite(net)){
        return;
    }
    let old = typeof global.stocks.alchemyFlow === 'number' && isFinite(global.stocks.alchemyFlow) ? global.stocks.alchemyFlow : 0;
    let flow = old * 0.9 + net / seconds * 0.1;
    global.stocks.alchemyFlow = Math.abs(flow) < 1e-9 ? 0 : flow;
}

export function fastLoopOcoinAlchemy($ctx){
    if (!global.stocks){
        return;
    }
    migrateOcoinAlchemyLots();
    let scale = stockFlags.prod ? timeScale() : 1;
    // sell first: what it pays out can fund the buying of the same tick
    let net = fastLoopOcoinSell($ctx, scale);
    net -= fastLoopOcoinBuy($ctx, scale);
    // one tick is time_multiplier x scale game seconds, the same unit the amounts above were worked out in
    trackAlchemyFlow(net, $ctx.time_multiplier * scale);
}

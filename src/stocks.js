import { global, tmp_vars, sizeApproximation, breakdown } from './vars.js';
import { loc } from './locale.js';
import { messageQueue } from './functions.js';
import { resource_values } from './resources.js';
import { aetherFormat } from './resources_f5.js';
import { LOT_BONUS, LEVEL_STEP, newStock, upgradeStock, stepMarket, settleAllOrders, askPrice, bidPrice, AUTO_TICK_SECONDS, autoTradeStep, warmUp, SPECIAL_STOCKS, MORALE_BONUS_PER_LOT, POWER_BONUS_PER_LOT, BIRTH_BONUS_PER_LOT } from './stocks_core.js';
import { drawStocks_s1, drawStocks_s2, drawStocks_s3 } from './sec_drawStocks_1.js';

export const LEVEL_STEP_DISPLAY = LEVEL_STEP.toFixed(2).replace(/0+$/,'').replace(/\.$/,'');

// Chart size in SVG units (the SVG scales to the width of its container)
export const CHART_W = 640;
export const CHART_H = 300;

// Satuan angka di stock market mengikuti satuan game (K, M, B, T, q, ...), bukan notasi SI (K, M, G, T).
// Di bawah 1000 tetap pakai format lama supaya jumlah desimal (precision) tidak berubah.
export function fmt(n, precision = 2){
    if (!n){
        return '0';
    }
    return Math.abs(n) >= 1000 ? aetherFormat(n) : sizeApproximation(n, precision);
}

export function signed(n){
    return (n < 0 ? '-' : '+') + fmt(Math.abs(n));
}

// Adds a missing key to global.settings. The settings object is already watched by Vue, and a plain assignment of a NEW
// key would not be reactive (the UI would not update when it changes), so Vue.set is used.
function setDefault(key, value){
    if (typeof Vue !== 'undefined' && typeof Vue.set === 'function'){
        Vue.set(global.settings, key, value);
    }
    else {
        global.settings[key] = value;
    }
}

export function moneyRoom(){
    let money = global.resource.Money;
    return money.max >= 0 ? Math.max(0, money.max - money.amount) : Infinity;
}

// Every resource the game itself allows trading on the Money market (tmp_vars.resource[x].tradable, set once at
// boot for all resources regardless of race/path) gets a company here too - so this list grows on its own as new
// tech/paths unlock resources, instead of being a hand-picked subset that stops mattering past the resources
// someone remembered to list. `listed()` below still gates on `.display`, so a tradable-but-not-yet-unlocked
// resource (say Helium_3 before you reach space) has no company until the game itself unlocks it.
// A resource is eligible for a company if the game marks it "tradable" (Market Buy/Sell), OR "stackable" (it
// genuinely piles up in storage), OR it has a positive base value in resource_values - any one of those three is
// evidence this is a real material, not a currency, population count, or one-off prestige/quest item. This picks
// up higher-tier materials the Money market itself won't trade (Adamantite, Graphene, Stanene, Bolognium, Vitreloy,
// Orichalcum, ...) while still excluding things like Money, Knowledge, Zen, Genes, or Soul_Gem.
export function liveStockDefs(){
    if (!tmp_vars || !tmp_vars.resource){
        return SPECIAL_STOCKS;
    }
    let materials = Object.keys(tmp_vars.resource)
        .filter(res => tmp_vars.resource[res].tradable || tmp_vars.resource[res].stackable || (resource_values[res] || 0) > 0)
        .map(res => ({ res: res, fair: resource_values[res] || 1 }));
    // Special (non-resource) companies lead the list - Morale, Power, Birthrate, in that order (see SPECIAL_STOCKS) -
    // followed by every material company in normal resource order.
    return SPECIAL_STOCKS.concat(materials);
}

// Whether a company's resource/stat actually exists yet. The two special (non-resource) companies each check the
// same condition the game itself uses to decide whether to show that stat in the top bar at all.
export function listed(def){
    if (def.res === 'Morale'){
        return !!(global.city && global.city.morale && global.city.morale.current);
    }
    if (def.res === 'Power'){
        return !!(global.city && global.city.powered);
    }
    if (def.res === 'Birthrate'){
        // Tied to the same citizen-growth mechanic Morale/Power piggyback on: listed once the race has a
        // population resource to grow at all (mirrors the growth check in longLoop's citizen growth step).
        return !!(global.resource[global.race.species] && global.resource[global.race.species].display);
    }
    let resource = global.resource[def.res];
    return !!(resource && resource.display);
}

export function isSpecial(res){
    return res === 'Morale' || res === 'Power' || res === 'Birthrate';
}

export function specialBonusPerLot(res){
    if (res === 'Morale'){
        return MORALE_BONUS_PER_LOT;
    }
    if (res === 'Power'){
        return POWER_BONUS_PER_LOT;
    }
    return BIRTH_BONUS_PER_LOT;
}

// A dedicated fictional name if one is written for this resource, otherwise falls back to "<Resource> Co." using the
// resource's own display name - so a resource added later (a new tech path, a mod, ...) still gets a sensible
// company name instead of showing a raw string key.
export function stockName(res){
    let key = `stock_${res}_name`;
    let name = loc(key);
    if (name === key){
        return loc('stock_name_fallback',[loc(`resource_${res}_name`)]);
    }
    return name;
}

export function orderLabel(type){
    return loc(`stock_order_${type}`);
}

// Makes sure global.stocks exists and has an up to date entry for every listed company (also for old saves).
export function initStocks(){
    if (!global.stocks || typeof global.stocks !== 'object'){
        global['stocks'] = { ocoin: 0 };
    }
    let s = global.stocks;
    if (typeof s.ocoin !== 'number' || !isFinite(s.ocoin)){
        s.ocoin = 0;
    }
    if (typeof s.qty !== 'number'){
        s.qty = 1;
    }
    if (typeof s.oid !== 'number'){
        s.oid = 0;
    }
    // Live numbers for the auto-balance status line (per second)
    if (typeof s.autoNat !== 'number'){
        s.autoNat = 0;
    }
    if (typeof s.autoFlow !== 'number'){
        s.autoFlow = 0;
    }
    // What the auto-balance added to the Money delta on the previous tick (so it can be told apart from real income)
    if (typeof s.autoAdj !== 'number'){
        s.autoAdj = 0;
    }
    // Auto-balance settings live in global.settings so they survive a reset
    if (typeof global.settings.stockAutoOn !== 'boolean'){
        setDefault('stockAutoOn', false);
    }
    if (typeof global.settings.stockAutoKeep !== 'number' || !isFinite(global.settings.stockAutoKeep) || global.settings.stockAutoKeep < 0){
        setDefault('stockAutoKeep', 1000);
    }
    if (!s.form || typeof s.form !== 'object'){
        s.form = { res: '', type: 'buyLimit', price: 0, lots: 1, priceMode: 'price', pct: 5, tpOn: false, tpMode: 'price', tpPrice: 0, tpPct: 10, slOn: false, slMode: 'price', slPrice: 0, slPct: 10 };
    }
    if (!s.exit || typeof s.exit !== 'object'){
        s.exit = { tpOn: false, tpMode: 'price', tpPrice: 0, tpPct: 10, tpLots: 1, slOn: false, slMode: 'price', slPrice: 0, slPct: 10, slLots: 1 };
    }
    if (typeof s.sel !== 'string'){
        s.sel = '';
    }
    // View settings (chart range in ticks, wallet panel open) also survive a reset
    if ([60, 120, 240].indexOf(global.settings.stockRange) === -1){
        setDefault('stockRange', 120);
    }
    if (typeof global.settings.stockWalletOpen !== 'boolean'){
        setDefault('stockWalletOpen', true);
    }
    if (!s.market){
        s.market = {};
    }
    liveStockDefs().forEach(function(def){
        if (!s.market[def.res]){
            // A new stock starts with some price history so the chart is not empty
            s.market[def.res] = warmUp(newStock(def), 150);
        }
        else {
            upgradeStock(s.market[def.res]);
        }
    });
}

function orderNote(n){
    let name = stockName(n.res);
    let label = orderLabel(n.type);
    if (n.kind === 'fill'){
        return [loc('stock_msg_fill',[name, label, fmt(n.lots, 0), fmt(n.avg)]), 'info'];
    }
    if (n.kind === 'trigger'){
        return [loc(n.partial ? 'stock_msg_trigger_partial' : 'stock_msg_trigger',[name, label, fmt(n.lots, 0), fmt(n.avg)]), 'warning'];
    }
    if (n.kind === 'nofunds'){
        return [loc('stock_msg_nofunds',[name, label]), 'danger'];
    }
    return [loc('stock_msg_noholdings',[name, label]), 'danger'];
}

// One market tick per game day (longLoop): prices move, events may start, the book is re-rolled, orders are checked.
export function stockTick(){
    if (global.race.species === 'protoplasm'){
        return;
    }
    initStocks();
    let notes = stepMarket(global.stocks.market);
    notes.forEach(function(n){
        let boom = n.type === 'boom';
        if (n.scope === 'market'){
            messageQueue(loc(boom ? 'stock_msg_market_boom' : 'stock_msg_market_crash'), boom ? 'success' : 'danger', false, ['minor_events']);
        }
        else if (global.resource[n.res] && global.resource[n.res].display){
            messageQueue(loc(boom ? 'stock_msg_boom' : 'stock_msg_crash', [stockName(n.res)]), boom ? 'success' : 'danger', false, ['minor_events']);
        }
    });
    settleAllOrders(global.stocks).forEach(function(n){
        let msg = orderNote(n);
        messageQueue(msg[0], msg[1], false, ['minor_events']);
    });
}

// Called every fast tick with the Money delta the game recorded for that tick (`delta`), how many seconds the tick lasted and
// how much of that income the Money storage cap had already cut off (`lost`).
// When auto-balance is on, income above the amount you keep becomes Ocoin and a shortfall is paid from Ocoin.
export function stockAutoTrade(delta, seconds = AUTO_TICK_SECONDS, lost = 0){
    let money = global.resource.Money;
    // Money is only displayed once currency is unlocked, so nothing happens during the early evolution stage
    if (!money || !money.display || !isFinite(delta) || !(seconds > 0)){
        return;
    }
    if (!global.stocks || typeof global.stocks.autoAdj !== 'number'){
        initStocks();
    }
    let s = global.stocks;
    // The delta also contains what this feature added to it last tick; take that out to get the real income of this tick
    let natural = delta - s.autoAdj;
    let flow = 0;
    let adj = 0;
    if (global.settings.stockAutoOn){
        let out = autoTradeStep(s, money, natural, global.settings.stockAutoKeep * seconds, lost);
        if (out.kind === 'convert'){
            flow = out.money;
            adj = -out.money;
        }
        else if (out.kind === 'topup'){
            flow = -out.money;
            adj = out.money;
        }
    }
    s.autoAdj = adj;
    // Smoothed per-second numbers for the status line (about 10 ticks)
    s.autoNat = s.autoNat * 0.9 + natural / seconds * 0.1;
    s.autoFlow = s.autoFlow * 0.9 + flow / seconds * 0.1;
}

// Shows the stock production bonus in each resource's production breakdown popover.
export function applyStockBreakdown(){
    if (!global.stocks || !global.stocks.market){
        return;
    }
    Object.keys(global.stocks.market).forEach(function(res){
        let st = global.stocks.market[res];
        if (st.lots > 0 && breakdown.p[res]){
            breakdown.p[res][loc('stock_bonus_label')] = +(st.lots * LOT_BONUS * 100).toFixed(2) + '%';
        }
    });
}

// Sensible starting price for the order form: a bit away from the current quote, on the correct side.
export function suggestPrice(st, type){
    switch (type){
        case 'buyLimit': return askPrice(st) * 0.95;
        case 'buyStop': return askPrice(st) * 1.05;
        case 'sellLimit': return bidPrice(st) * 1.05;
        default: return bidPrice(st) * 0.95;
    }
}

export function drawStocks(){
    const $ctx = {};
    drawStocks_s1($ctx);
        drawStocks_s2($ctx);
        drawStocks_s3($ctx);
}

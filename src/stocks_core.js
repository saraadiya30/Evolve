// Pure stock-market maths. This file must NOT import anything, so it can be unit tested outside the browser
// and imported from anywhere (functions.js, main.js, stocks.js) without creating circular imports.

// --- Tunable constants ---------------------------------------------------------------------------------------------
export const OCOIN_RATE = 1000;     // 1 Ocoin = 1000 Money (both directions)
export const OCOIN_BUY_FEE = 0.05;  // fee on Money -> Ocoin only. Ocoin -> Money is free.
export const AETHER_OCOIN_RATE = 1e12; // Ocoin you get for 1 Aether (the Aether tab). Same value as 1 Aether = 1e15 Money at the 1000:1
                                        // exchange, without the 5% fee.
export const LOT_BONUS = 0.001;     // each lot owned adds +0.1% production to that stock's resource (additive, no cap)
export const HIST_LEN = 240;        // how many past prices (one per tick) are kept for the price chart

// --- Order book ---------------------------------------------------------------------------------------------------
// Every stock has an ask side (sellers) and a bid side (buyers). Each side is a ladder of price levels, LEVEL_STEP apart.
// The best level has a queue of `aq` / `bq` lots; every deeper level holds `dA` / `dB` lots. A market order eats through
// the levels: a level can only fill as many lots as it holds, the rest moves on to the next (worse) price. There is no
// cap on the total number of lots, only a worse and worse price.
// Lots you take from the book push that side's best quote away from the mid price; it drifts back over time.
export const LEVEL_STEP = 0.01;     // 1% between two price levels
export const BASE_DEPTH = 10;       // lots per level (before mode/event/random factors)
export const BASE_SPREAD = 0.01;    // relative spread between best bid and best ask (before factors)
export const MAX_SPREAD = 0.10;
export const QUOTE_RELAX = 0.02;    // per tick, how much of your price push disappears again
export const MAX_ORDERS = 10;       // open orders per stock

// Random boom / crash events. A boom is a gradual rise, a crash is a sharp drop; afterwards the price drifts back.
const EVENT_CHANCE = 0.015;         // per stock, per tick
const MARKET_EVENT_CHANCE = 0.003;  // per tick, hits every stock at once (with a random strength per stock)
const BOOM_GAIN = [0.10, 0.25];     // total rise over the event
const BOOM_DUR = [5, 10];           // ticks
const CRASH_DROP = [0.15, 0.35];    // total drop over the event
const CRASH_DUR = [2, 3];           // ticks

const BASE_VOL = 0.01;              // base volatility per tick (1%)
const REVERT = 0.02;                // pull-back strength towards the stock's fair value per tick
const MIN_PRICE_RATIO = 1e-9;       // price can never hit zero, even after a huge sell-off
const MODE_MIN = 20;                // a hidden market mode lasts between MODE_MIN and MODE_MAX ticks
const MODE_MAX = 60;

// One fictional company per resource. `fair` is the long-run price of a single lot, in Ocoin.
export const stockDefs = [
    { res: 'Food', fair: 8 },
    { res: 'Lumber', fair: 10 },
    { res: 'Stone', fair: 12 },
    { res: 'Furs', fair: 15 },
    { res: 'Copper', fair: 20 },
    { res: 'Iron', fair: 25 },
    { res: 'Aluminium', fair: 30 },
    { res: 'Cement', fair: 35 },
    { res: 'Coal', fair: 40 },
    { res: 'Oil', fair: 50 },
    { res: 'Steel', fair: 60 },
    { res: 'Titanium', fair: 80 },
    { res: 'Alloy', fair: 100 },
    { res: 'Polymer', fair: 120 }
];

// Hidden market modes (Cookie Clicker style). They are only tendencies: the symmetric weights keep the game
// close to zero expected profit, so money comes from timing, not from a guaranteed upward drift.
// bid/ask = depth factor of the bid side / ask side, spr = spread factor.
// Falling markets: buyers (bid) run away, sellers (ask) pile in. Rising markets: the opposite.
export const stockModes = [
    { id: 'stable', drift: 0, vol: 1, w: 30, bid: 1.3, ask: 1.3, spr: 0.8 },
    { id: 'slow_rise', drift: 0.003, vol: 1, w: 20, bid: 1.15, ask: 0.85, spr: 1 },
    { id: 'slow_fall', drift: -0.003, vol: 1, w: 20, bid: 0.85, ask: 1.15, spr: 1 },
    { id: 'fast_rise', drift: 0.01, vol: 1.2, w: 10, bid: 1.4, ask: 0.5, spr: 1.5 },
    { id: 'fast_fall', drift: -0.01, vol: 1.2, w: 10, bid: 0.5, ask: 1.4, spr: 1.5 },
    { id: 'chaotic', drift: 0, vol: 3, w: 10, bid: 0.5, ask: 0.5, spr: 2 }
];

// Book factors while a boom / crash is running (multiplied with the mode factors above).
const EVENT_BOOK = {
    boom: { bid: 1.5, ask: 0.3, spr: 2 },
    crash: { bid: 0.3, ask: 1.5, spr: 3 }
};

// Set to true by main.js only while the fast (production) loop runs, so the production bonus in modRes()
// is not applied to manual gathering, refunds, etc.
export const stockFlags = { prod: false };

// --- Market simulation ---------------------------------------------------------------------------------------------
export function randNormal(rand = Math.random){
    // Box-Muller transform
    let u = 0;
    while (u === 0){ u = rand(); }
    let v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function pickMode(rand = Math.random){
    let total = stockModes.reduce((a, m) => a + m.w, 0);
    let roll = rand() * total;
    for (let i = 0; i < stockModes.length; i++){
        roll -= stockModes[i].w;
        if (roll < 0){
            return i;
        }
    }
    return 0;
}

export function newStock(def, rand = Math.random){
    let price = def.fair * (0.9 + rand() * 0.2);
    let st = {
        fair: def.fair,
        price: price,
        prev: price,
        mode: pickMode(rand),
        left: MODE_MIN + Math.floor(rand() * (MODE_MAX - MODE_MIN + 1)),
        hist: [+price.toFixed(4)],
        ev: null,
        lots: 0,
        spent: 0,
        ap: 0,          // how far (log) your buying pushed the best ask up
        bp: 0,          // how far (log) your selling pushed the best bid down
        orders: []
    };
    refreshBook(st, rand);
    return st;
}

// Fills in the order-book fields for stocks saved before the order book existed.
export function upgradeStock(st, rand = Math.random){
    if (typeof st.ap !== 'number'){ st.ap = 0; }
    if (typeof st.bp !== 'number'){ st.bp = 0; }
    if (!Array.isArray(st.orders)){ st.orders = []; }
    if (typeof st.spread !== 'number' || typeof st.aq !== 'number'){
        refreshBook(st, rand);
    }
    return st;
}

function randBetween(range, rand){
    return range[0] + rand() * (range[1] - range[0]);
}

// Starts a boom or crash on a stock. `strength` (0..1] scales the size (used for market-wide events).
export function startEvent(st, type, rand = Math.random, strength = 1){
    if (type === 'boom'){
        let dur = Math.round(randBetween(BOOM_DUR, rand));
        let gain = randBetween(BOOM_GAIN, rand) * strength;
        st.ev = { type: 'boom', left: dur, drift: Math.log(1 + gain) / dur };
    }
    else {
        let dur = Math.round(randBetween(CRASH_DUR, rand));
        let drop = randBetween(CRASH_DROP, rand) * strength;
        st.ev = { type: 'crash', left: dur, drift: Math.log(1 - drop) / dur };
    }
}

// Runs a stock through some ticks without any player involvement, so a new stock starts with a believable price history
// (used for the chart) instead of a single point.
export function warmUp(st, ticks = 150, rand = Math.random){
    for (let i = 0; i < ticks; i++){
        stepStock(st, rand);
    }
    st.prev = st.hist.length > 1 ? st.hist[st.hist.length - 2] : st.price;
    return st;
}

// Advance one stock by one tick (one game day).
export function stepStock(st, rand = Math.random){
    st.left--;
    if (st.left <= 0){
        st.mode = pickMode(rand);
        st.left = MODE_MIN + Math.floor(rand() * (MODE_MAX - MODE_MIN + 1));
    }
    let m = stockModes[st.mode];
    let evDrift = 0;
    if (st.ev){
        evDrift = st.ev.drift;
        st.ev.left--;
        if (st.ev.left <= 0){
            st.ev = null;
        }
    }
    let r = m.drift + evDrift + REVERT * (Math.log(st.fair) - Math.log(st.price)) + BASE_VOL * m.vol * randNormal(rand);
    // No upper clamp: player buying can legitimately push the price far above fair value. The pull back towards
    // fair value is done in log space, so it stays stable.
    let p = Math.max(st.fair * MIN_PRICE_RATIO, st.price * Math.exp(r));
    st.prev = st.price;
    st.price = p;
    st.hist.push(+p.toFixed(4));
    while (st.hist.length > HIST_LEN){
        st.hist.shift();
    }
    refreshBook(st, rand);
}

// Advance the whole market by one tick: every stock moves, and boom/crash events may start.
// Returns a list of notifications: { scope: 'market'|'stock', type: 'boom'|'crash', res? }.
export function stepMarket(market, rand = Math.random){
    let notes = [];
    let keys = Object.keys(market);
    if (rand() < MARKET_EVENT_CHANCE){
        let type = rand() < 0.5 ? 'boom' : 'crash';
        keys.forEach(function(res){
            startEvent(market[res], type, rand, 0.6 + rand() * 0.4);
        });
        notes.push({ scope: 'market', type: type });
    }
    keys.forEach(function(res){
        let st = market[res];
        if (!st.ev && rand() < EVENT_CHANCE){
            let type = rand() < 0.5 ? 'boom' : 'crash';
            startEvent(st, type, rand);
            notes.push({ scope: 'stock', type: type, res: res });
        }
        stepStock(st, rand);
    });
    return notes;
}

export function lotBonus(lots){
    return 1 + LOT_BONUS * lots;
}

// --- Order book: quotes ---------------------------------------------------------------------------------------------
const G = 1 + LEVEL_STEP;
const LN_G = Math.log(G);
const MAX_LEVELS = Math.floor(600 / LN_G);   // guard against exp() overflow when someone trades an absurd amount

// Re-rolls the book for a new tick: spread, lots per level, queues at the best prices, and lets your price push fade.
export function refreshBook(st, rand = Math.random){
    let m = stockModes[st.mode];
    let e = st.ev ? EVENT_BOOK[st.ev.type] : { bid: 1, ask: 1, spr: 1 };
    st.spread = Math.min(MAX_SPREAD, BASE_SPREAD * m.spr * e.spr);
    let depth = (factor) => Math.max(1, Math.round(BASE_DEPTH * factor * (0.7 + 0.6 * rand())));
    st.dB = depth(m.bid * e.bid);
    st.dA = depth(m.ask * e.ask);
    st.bq = Math.max(1, Math.round(st.dB * (0.4 + 0.6 * rand())));
    st.aq = Math.max(1, Math.round(st.dA * (0.4 + 0.6 * rand())));
    st.ap = (st.ap || 0) * (1 - QUOTE_RELAX);
    st.bp = (st.bp || 0) * (1 - QUOTE_RELAX);
    if (st.ap < 1e-9){ st.ap = 0; }
    if (st.bp < 1e-9){ st.bp = 0; }
}

// Base quotes (without your price push): what the market makers quote around the mid price.
function baseAsk(st){ return st.price * (1 + st.spread / 2); }
function baseBid(st){ return st.price * (1 - st.spread / 2); }

export function askPrice(st){ return baseAsk(st) * Math.exp(st.ap); }
export function bidPrice(st){ return baseBid(st) * Math.exp(-st.bp); }

// --- Order book: market orders --------------------------------------------------------------------------------------
// Buying m lots: q lots at the best ask, then full levels of d lots each at 1%, 2%, ... higher, the last one partial.
// Returns the total cost and what the ask side looks like afterwards (nothing is changed here).
export function buyQuote(st, m){
    m = Math.floor(m);
    let ask0 = askPrice(st);
    if (!(m > 0)){
        return { cost: 0, ap: st.ap, aq: st.aq, avg: ask0 };
    }
    let q = st.aq, d = st.dA;
    let cost, finalAsk, finalQ;
    if (m < q){
        cost = m * ask0; finalAsk = ask0; finalQ = q - m;
    }
    else if (m === q){
        cost = q * ask0; finalAsk = ask0 * G; finalQ = d;
    }
    else {
        let r = m - q;
        let n = Math.floor(r / d);
        let p = r - n * d;
        if (n > MAX_LEVELS){
            return { cost: Infinity, ap: st.ap, aq: st.aq, avg: Infinity };
        }
        let p1 = ask0 * G;
        cost = q * ask0 + d * p1 * Math.expm1(LN_G * n) / (G - 1) + p * p1 * Math.exp(LN_G * n);
        finalAsk = p1 * Math.exp(LN_G * n);
        finalQ = p > 0 ? d - p : d;
    }
    return { cost: cost, ap: Math.max(0, Math.log(finalAsk / baseAsk(st))), aq: finalQ, avg: cost / m };
}

// Selling m lots into the bid side (mirror image of buyQuote).
export function sellQuote(st, m){
    m = Math.floor(m);
    let bid0 = bidPrice(st);
    if (!(m > 0)){
        return { proceeds: 0, bp: st.bp, bq: st.bq, avg: bid0 };
    }
    let q = st.bq, d = st.dB;
    let proceeds, finalBid, finalQ;
    if (m < q){
        proceeds = m * bid0; finalBid = bid0; finalQ = q - m;
    }
    else if (m === q){
        proceeds = q * bid0; finalBid = bid0 / G; finalQ = d;
    }
    else {
        let r = m - q;
        let n = Math.floor(r / d);
        let p = r - n * d;
        n = Math.min(n, MAX_LEVELS);
        let b1 = bid0 / G;
        proceeds = q * bid0 + d * b1 * -Math.expm1(-LN_G * n) / (1 - 1 / G) + p * b1 * Math.exp(-LN_G * n);
        finalBid = b1 * Math.exp(-LN_G * n);
        finalQ = p > 0 ? d - p : d;
    }
    return { proceeds: proceeds, bp: Math.max(0, Math.log(baseBid(st) / finalBid)), bq: finalQ, avg: proceeds / m };
}

// Largest number of lots that `budget` Ocoin can buy right now (closed form, no loop over levels).
export function maxBuyLots(st, budget){
    if (!(budget > 0)){ return 0; }
    let ask0 = askPrice(st), q = st.aq, d = st.dA;
    let m;
    if (budget < q * ask0){
        m = Math.floor(budget / ask0);
    }
    else {
        let b2 = budget - q * ask0;
        let p1 = ask0 * G;
        let n = Math.floor(Math.log1p(b2 * (G - 1) / (d * p1)) / LN_G);
        n = Math.max(0, Math.min(n, MAX_LEVELS));
        let b3 = b2 - d * p1 * Math.expm1(LN_G * n) / (G - 1);
        let pn = p1 * Math.exp(LN_G * n);
        let p = Math.min(Math.max(0, Math.floor(b3 / pn)), d - 1);
        m = q + n * d + p;
    }
    // Fix floating point drift
    let guard = 0;
    while (m > 0 && buyQuote(st, m).cost > budget && guard++ < 8){ m--; }
    guard = 0;
    while (guard++ < 8 && buyQuote(st, m + 1).cost <= budget){ m++; }
    return Math.max(0, m);
}

// Executes a market buy / sell on the stock: moves the quotes, updates the position. Returns what was paid / received.
export function executeBuy(st, m){
    let q = buyQuote(st, m);
    st.ap = q.ap;
    st.aq = q.aq;
    st.lots += m;
    st.spent += q.cost;
    return q.cost;
}

export function executeSell(st, m){
    let q = sellQuote(st, m);
    st.bp = q.bp;
    st.bq = q.bq;
    // Cost basis is reduced proportionally (average cost)
    st.spent = st.lots > m ? st.spent * (st.lots - m) / st.lots : 0;
    st.lots -= m;
    return q.proceeds;
}

// --- Order book: how many lots can fill at a limit price -------------------------------------------------------------
// A limit order can only take lots from levels that are at or better than its price, so its size per tick is capped by
// the queues at those levels.
export function limitBuyCapacity(st, limit){
    let ask0 = askPrice(st);
    if (limit < ask0){ return 0; }
    let n = Math.floor(Math.log(limit / ask0) / LN_G + 1e-9);
    return st.aq + Math.min(n, MAX_LEVELS) * st.dA;
}

export function limitSellCapacity(st, limit){
    let bid0 = bidPrice(st);
    if (limit > bid0){ return 0; }
    let n = Math.floor(Math.log(bid0 / limit) / LN_G + 1e-9);
    return st.bq + Math.min(n, MAX_LEVELS) * st.dB;
}

// --- Orders (buy limit / buy stop / sell limit / sell stop) ----------------------------------------------------------
// S is the whole stock state: { ocoin, oid, market }. Orders are checked every tick after the prices moved.
//   buyLimit  : buy when the ask is at/below your price (buy a dip). Fills only the lots queued at those prices.
//   buyStop   : buy when the ask rises to your price (buy a breakout). Then becomes a market buy.
//   sellLimit : sell when the bid is at/above your price (take profit). Fills only the lots queued at those prices.
//   sellStop  : sell when the bid falls to your price (stop loss). Then becomes a market sell, so a thin bid in a crash
//               can fill far below your stop price.
export const ORDER_TYPES = ['buyLimit', 'buyStop', 'sellLimit', 'sellStop'];

export function isBuyOrder(type){
    return type === 'buyLimit' || type === 'buyStop';
}

// The price a new order of this type must be placed on the right side of (otherwise it would fire immediately).
export function orderPriceOk(st, type, price){
    if (!(price > 0) || !isFinite(price)){ return false; }
    switch (type){
        case 'buyLimit': return price < askPrice(st);
        case 'buyStop': return price > askPrice(st);
        case 'sellLimit': return price > bidPrice(st);
        case 'sellStop': return price < bidPrice(st);
    }
    return false;
}

// Lots already promised to a sell-type order. A linked take-profit/stop-loss pair (see placeExitOrders /
// bracket orders below) shares one slice of your position - only one side will ever actually execute - so it is
// counted once, not twice.
export function committedSellLots(st){
    let seen = new Set();
    let total = 0;
    (st.orders || []).forEach(function(o){
        if (isBuyOrder(o.type)){
            return;
        }
        if (o.oco){
            let key = Math.min(o.id, o.oco);
            if (seen.has(key)){
                return;
            }
            seen.add(key);
        }
        total += o.lots;
    });
    return total;
}

// Checks a new order without changing anything. Returns null when it is fine, otherwise the reason:
// 'type', 'lots', 'price', 'side', 'max', 'funds', 'holdings'
export function validateOrder(S, res, type, price, lots){
    let st = S.market[res];
    if (!st || ORDER_TYPES.indexOf(type) === -1){ return 'type'; }
    lots = Math.floor(lots);
    if (!(lots >= 1) || !isFinite(lots)){ return 'lots'; }
    if (!(price > 0) || !isFinite(price)){ return 'price'; }
    if (!orderPriceOk(st, type, price)){ return 'side'; }
    if (st.orders.length >= MAX_ORDERS){ return 'max'; }
    if (isBuyOrder(type)){
        if (lots * price > S.ocoin){ return 'funds'; }
    }
    else if (lots + committedSellLots(st) > st.lots){
        return 'holdings';
    }
    return null;
}

// Places an order. Buy orders lock lots*price Ocoin until they fill or are cancelled.
// Returns { ok: true, order } or { ok: false, reason } (see validateOrder).
// `bracket` (buy orders only) is an optional { tpPrice, slPrice } - either or both - attached now and turned into
// take-profit / stop-loss orders for whatever lots this order actually buys, as they get bought (see applyBracket).
// Pass null/undefined tpPrice or slPrice to skip that side. Returns 'tp'/'sl' via validateBracket on a bad bracket.
export function placeOrder(S, res, type, price, lots, bracket){
    let reason = validateOrder(S, res, type, price, lots);
    if (reason){
        return { ok: false, reason: reason };
    }
    if (bracket && isBuyOrder(type)){
        let br = validateBracket(price, bracket.tpPrice, bracket.slPrice);
        if (br){
            return { ok: false, reason: br };
        }
    }
    let st = S.market[res];
    lots = Math.floor(lots);
    let reserved = 0;
    if (isBuyOrder(type)){
        reserved = lots * price;
        S.ocoin -= reserved;
    }
    S.oid = (S.oid || 0) + 1;
    let order = { id: S.oid, type: type, price: price, lots: lots, total: lots, reserved: reserved };
    if (bracket && isBuyOrder(type) && (bracket.tpPrice != null || bracket.slPrice != null)){
        order.bracket = { tpPrice: bracket.tpPrice != null ? bracket.tpPrice : null, slPrice: bracket.slPrice != null ? bracket.slPrice : null, tpId: null, slId: null };
    }
    st.orders.push(order);
    return { ok: true, order: order };
}

// Cancelling one side of a take-profit/stop-loss pair leaves the other side in place, on its own (it no longer
// shares its lots with anything). This matches "cancel just the TP, keep the SL protecting me" as the common case.
export function cancelOrder(S, res, id){
    let st = S.market[res];
    if (!st){ return false; }
    let i = st.orders.findIndex(o => o.id === id);
    if (i === -1){ return false; }
    let order = st.orders[i];
    if (order.oco){
        let sib = st.orders.find(o => o.id === order.oco);
        if (sib){
            sib.oco = null;
        }
    }
    S.ocoin += order.reserved;
    st.orders.splice(i, 1);
    return true;
}

// Removing an order also unlinks any surviving OCO sibling, so nothing is ever left pointing at a dead id
// (reduceOcoSibling already removes+unlinks the *other* side when it empties out; this covers the order itself
// finishing normally - e.g. a take-profit that fills completely - which used to leave its stop-loss sibling's
// `.oco` dangling).
function removeOrder(st, order){
    let i = st.orders.indexOf(order);
    if (i !== -1){
        if (order.oco){
            let sib = st.orders.find(o => o.id === order.oco);
            if (sib){
                sib.oco = null;
            }
        }
        st.orders.splice(i, 1);
    }
}

// --- Take profit / stop loss ------------------------------------------------------------------------------------
// A "take profit" is a sellLimit and a "stop loss" is a sellStop; this section adds two conveniences on top of the
// plain order engine: setting either one from a percentage instead of typing a price, and linking a TP+SL pair (or
// attaching them to a still-open buy order) so only one side ever ends up executing for a given slice of lots.

// Converts a percentage gain/loss into an absolute price. `base` is usually your average cost, or a pending buy
// order's own price. pct is a plain percentage (25 means 25%), always positive.
export function tpPriceFromPct(base, pct){
    return base * (1 + pct / 100);
}

export function slPriceFromPct(base, pct){
    return base * (1 - pct / 100);
}

// Links two existing orders (by id) as one-cancels-the-other: when either fills any amount, the other's remaining
// lots shrink by the same amount (see reduceOcoSibling), and cancelling one only unlinks the other (see cancelOrder).
function linkOco(a, b){
    a.oco = b.id;
    b.oco = a.id;
}

// When an order with a linked sibling (see linkOco) fills `filled` lots, the sibling represents the same slice of
// the position, so its remaining lots shrink by the same amount. If that leaves it empty, it is removed outright -
// with a note so the caller can tell the player their other order was auto-cancelled.
function reduceOcoSibling(st, order, filled){
    if (!order.oco || !(filled > 0)){
        return null;
    }
    let sib = st.orders.find(o => o.id === order.oco);
    if (!sib){
        return null;
    }
    sib.lots -= filled;
    if (sib.lots <= 0){
        removeOrder(st, sib);
        return { type: sib.type, canceled: true };
    }
    return null;
}

// Places a take-profit (sellLimit) and/or a stop-loss (sellStop) for lots you already hold (or have coming from a
// filled buy), covering only `lots` of your position - the rest stays free to sell manually or attach its own exit
// orders to. Passing both prices links them: whichever fires first, the other's matching lots are cancelled.
// Returns { ok: true, tp: order|null, sl: order|null } or { ok: false, reason } - reasons as validateOrder, plus
// 'price' when neither tpPrice nor slPrice was given.
export function placeExitOrders(S, res, lots, tpPrice, slPrice){
    let st = S.market[res];
    if (!st){
        return { ok: false, reason: 'type' };
    }
    lots = Math.floor(lots);
    if (!(lots >= 1) || !isFinite(lots)){
        return { ok: false, reason: 'lots' };
    }
    if (tpPrice == null && slPrice == null){
        return { ok: false, reason: 'price' };
    }
    if (tpPrice != null && (!(tpPrice > 0) || !isFinite(tpPrice))){
        return { ok: false, reason: 'price' };
    }
    if (slPrice != null && (!(slPrice > 0) || !isFinite(slPrice))){
        return { ok: false, reason: 'price' };
    }
    if (tpPrice != null && !orderPriceOk(st, 'sellLimit', tpPrice)){
        return { ok: false, reason: 'side' };
    }
    if (slPrice != null && !orderPriceOk(st, 'sellStop', slPrice)){
        return { ok: false, reason: 'side' };
    }
    if (lots + committedSellLots(st) > st.lots){
        return { ok: false, reason: 'holdings' };
    }
    let needed = (tpPrice != null ? 1 : 0) + (slPrice != null ? 1 : 0);
    if (st.orders.length + needed > MAX_ORDERS){
        return { ok: false, reason: 'max' };
    }
    let tp = null, sl = null;
    if (tpPrice != null){
        S.oid = (S.oid || 0) + 1;
        tp = { id: S.oid, type: 'sellLimit', price: tpPrice, lots: lots, total: lots, reserved: 0 };
        st.orders.push(tp);
    }
    if (slPrice != null){
        S.oid = (S.oid || 0) + 1;
        sl = { id: S.oid, type: 'sellStop', price: slPrice, lots: lots, total: lots, reserved: 0 };
        st.orders.push(sl);
    }
    if (tp && sl){
        linkOco(tp, sl);
    }
    return { ok: true, tp: tp, sl: sl };
}

// Checks a bracket (the optional take-profit/stop-loss attached to a buyLimit/buyStop) without changing anything.
// Returns null when fine, otherwise 'tp' or 'sl' - the bracket price is on the wrong side of the buy order's own price.
export function validateBracket(buyPrice, tpPrice, slPrice){
    if (tpPrice != null && (!(tpPrice > buyPrice) || !isFinite(tpPrice))){
        return 'tp';
    }
    if (slPrice != null && (!(slPrice > 0 && slPrice < buyPrice) || !isFinite(slPrice))){
        return 'sl';
    }
    return null;
}

// Attaches (or extends) the bracket exit orders for `filled` lots that a buyLimit/buyStop order (`bo`, with
// bo.bracket = { tpPrice, slPrice, tpId, slId }) just bought. Called from settleOrders right after a fill/trigger.
// Bracket prices are not re-validated against the live book here: a stop/limit that is already on the "wrong" side
// by the time the buy fills (the market moved while the buy order was waiting) still fires, just immediately/deeper
// in the book - see buyQuote/sellQuote - the same way a manual order would if the market gapped past it.
function applyBracket(S, res, bo, filled){
    let br = bo.bracket;
    if (!br || !(filled > 0)){
        return;
    }
    let st = S.market[res];
    let tp = br.tpId ? st.orders.find(o => o.id === br.tpId) : null;
    let sl = br.slId ? st.orders.find(o => o.id === br.slId) : null;
    if (br.tpPrice != null && !tp && st.orders.length < MAX_ORDERS){
        S.oid = (S.oid || 0) + 1;
        tp = { id: S.oid, type: 'sellLimit', price: br.tpPrice, lots: 0, total: 0, reserved: 0 };
        st.orders.push(tp);
        br.tpId = tp.id;
    }
    if (br.slPrice != null && !sl && st.orders.length < MAX_ORDERS){
        S.oid = (S.oid || 0) + 1;
        sl = { id: S.oid, type: 'sellStop', price: br.slPrice, lots: 0, total: 0, reserved: 0 };
        st.orders.push(sl);
        br.slId = sl.id;
    }
    if (tp){
        tp.lots += filled;
        tp.total += filled;
    }
    if (sl){
        sl.lots += filled;
        sl.total += filled;
    }
    if (tp && sl && tp.oco !== sl.id){
        linkOco(tp, sl);
    }
}

// Checks every open order of one stock against the current book and fills what can be filled.
// Returns notes: { kind: 'fill'|'trigger'|'nofunds'|'noholdings', res, type, lots, avg?, done? }
export function settleOrders(S, res){
    let st = S.market[res];
    let notes = [];
    if (!st || !st.orders || st.orders.length === 0){
        return notes;
    }
    st.orders.slice().forEach(function(o){
        if (st.orders.indexOf(o) === -1){ return; }
        if (o.type === 'buyLimit'){
            let m = Math.min(o.lots, limitBuyCapacity(st, o.price));
            if (m <= 0){ return; }
            let cost = executeBuy(st, m);
            let paidFromReserve = m * o.price;
            S.ocoin += Math.max(0, paidFromReserve - cost);    // price improvement is refunded
            o.reserved = Math.max(0, o.reserved - paidFromReserve);
            o.lots -= m;
            if (o.lots <= 0){ removeOrder(st, o); }
            applyBracket(S, res, o, m);
            notes.push({ kind: 'fill', res: res, type: o.type, lots: m, avg: cost / m, done: o.lots <= 0 });
        }
        else if (o.type === 'buyStop'){
            if (askPrice(st) < o.price){ return; }
            let avail = o.reserved + S.ocoin;
            let m = Math.min(o.lots, maxBuyLots(st, avail));
            removeOrder(st, o);
            S.ocoin += o.reserved;
            o.reserved = 0;
            if (m <= 0){
                notes.push({ kind: 'nofunds', res: res, type: o.type, lots: o.lots });
                return;
            }
            let cost = executeBuy(st, m);
            S.ocoin = Math.max(0, S.ocoin - cost);
            applyBracket(S, res, o, m);
            notes.push({ kind: 'trigger', res: res, type: o.type, lots: m, avg: cost / m, done: true, partial: m < o.lots });
        }
        else if (o.type === 'sellLimit'){
            if (st.lots <= 0){
                removeOrder(st, o);
                let cancel = reduceOcoSibling(st, o, o.lots);
                notes.push({ kind: 'noholdings', res: res, type: o.type, lots: o.lots });
                if (cancel){ notes.push({ kind: 'ocoCancel', res: res, type: cancel.type }); }
                return;
            }
            let m = Math.min(o.lots, st.lots, limitSellCapacity(st, o.price));
            if (m <= 0){ return; }
            let gain = executeSell(st, m);
            S.ocoin += gain;
            o.lots -= m;
            if (o.lots <= 0){ removeOrder(st, o); }
            let cancel = reduceOcoSibling(st, o, m);
            notes.push({ kind: 'fill', res: res, type: o.type, lots: m, avg: gain / m, done: o.lots <= 0 });
            if (cancel){ notes.push({ kind: 'ocoCancel', res: res, type: cancel.type }); }
        }
        else if (o.type === 'sellStop'){
            if (bidPrice(st) > o.price){ return; }
            removeOrder(st, o);
            let m = Math.min(o.lots, st.lots);
            if (m <= 0){
                let cancel = reduceOcoSibling(st, o, o.lots);
                notes.push({ kind: 'noholdings', res: res, type: o.type, lots: o.lots });
                if (cancel){ notes.push({ kind: 'ocoCancel', res: res, type: cancel.type }); }
                return;
            }
            let gain = executeSell(st, m);
            S.ocoin += gain;
            let cancel = reduceOcoSibling(st, o, m);
            notes.push({ kind: 'trigger', res: res, type: o.type, lots: m, avg: gain / m, done: true, partial: m < o.lots });
            if (cancel){ notes.push({ kind: 'ocoCancel', res: res, type: cancel.type }); }
        }
    });
    return notes;
}

export function settleAllOrders(S){
    let notes = [];
    Object.keys(S.market).forEach(function(res){
        notes = notes.concat(settleOrders(S, res));
    });
    return notes;
}

// --- Money <-> Ocoin -----------------------------------------------------------------------------------------------
export function moneyToOcoin(money){
    return money * (1 - OCOIN_BUY_FEE) / OCOIN_RATE;
}

export function ocoinCostInMoney(ocoin){
    return ocoin * OCOIN_RATE / (1 - OCOIN_BUY_FEE);
}

export function ocoinToMoney(ocoin){
    return ocoin * OCOIN_RATE;
}

// --- Auto balance: Money income <-> Ocoin ------------------------------------------------------------------------------
// One fast tick of the game loop is worth 0.25 seconds of production (time_multiplier in main.js). Rates shown to the
// player are per second, like the Money rate in the resource panel.
export const AUTO_TICK_SECONDS = 0.25;

// Keeps a fixed Money income per tick. `natural` is the Money income of this tick (before this feature touches it).
//  - income above `keepPerTick`: the surplus is taken out of Money and converted into Ocoin (with the usual fee)
//  - income below `keepPerTick`: the shortfall is paid out of Ocoin into Money (no fee), as far as Ocoin and Money storage allow
// `money` is the Money resource ({ amount, max, delta }), S the stock state ({ ocoin }).
// delta is adjusted too, so the Money rate shown in the resource panel is the rate you actually end up with.
export function autoTradeStep(S, money, natural, keepPerTick){
    let out = { kind: 'none', money: 0, ocoin: 0 };
    if (!isFinite(natural) || !(keepPerTick >= 0)){
        return out;
    }
    if (natural > keepPerTick){
        let move = Math.min(natural - keepPerTick, Math.max(0, money.amount));
        if (move > 0){
            let gained = moneyToOcoin(move);
            money.amount -= move;
            money.delta -= move;
            S.ocoin += gained;
            out = { kind: 'convert', money: move, ocoin: gained };
        }
    }
    else if (natural < keepPerTick){
        let room = money.max >= 0 ? Math.max(0, money.max - money.amount) : Infinity;
        let move = Math.min(keepPerTick - natural, room, ocoinToMoney(S.ocoin));
        if (move > 0){
            let spent = move / OCOIN_RATE;
            money.amount += move;
            money.delta += move;
            S.ocoin = Math.max(0, S.ocoin - spent);
            out = { kind: 'topup', money: move, ocoin: spent };
        }
    }
    return out;
}

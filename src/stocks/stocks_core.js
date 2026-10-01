// Pure stock-market maths. This file must NOT import anything, so it can be unit tested outside the browser
// and imported from anywhere (functions.js, main.js, stocks.js) without creating circular imports.

// --- Tunable constants ---------------------------------------------------------------------------------------------
export const OCOIN_RATE = 1000;     // 1 Ocoin = 1000 Money (both directions)
export const OCOIN_BUY_FEE = 0.05;  // fee on Money -> Ocoin only. Ocoin -> Money is free.
export const AETHER_OCOIN_RATE = 1e12; // Ocoin you get for 1 Aether (the Aether tab). Same value as 1 Aether = 1e15 Money at the 1000:1
                                        // exchange, without the 5% fee.
export const LOT_BONUS = 0.001;     // each lot on production adds +0.1% production to that stock's resource (additive, no cap)
export const STORAGE_BONUS = 0.01;  // each lot on storage adds +1% storage (max capacity) to that stock's resource (multiplicative, no cap)

// Two "special" companies that are not tied to a stockpiled resource at all, but to a city-wide stat instead.
// Unlike LOT_BONUS/STORAGE_BONUS (percentages, multiplicative), these are flat additive amounts: holding lots adds
// that amount every tick the bonus is computed, and selling them takes it away again on the very next tick, since
// the bonus is always computed fresh from the lots you currently hold, never accumulated as a one-off transaction.
export const MORALE_BONUS_PER_LOT = 0.1;  // each lot adds +0.1 Morale (the current value, not the cap)
export const POWER_BONUS_PER_LOT = 1;     // each lot adds +1 Power (Watt) to the city's power grid
export const BIRTH_BONUS_PER_LOT = 0.05;  // each lot adds +0.05 to the citizen growth roll, same additive/reversible pattern
// Order here is the display order for the special (non-resource) companies: Morale, then Power, then Birthrate.
export const SPECIAL_STOCKS = [
    { res: 'Morale', fair: 60 },
    { res: 'Power', fair: 90 },
    { res: 'Birthrate', fair: 75 }
];
export const HIST_LEN = 240;        // how many past prices (one per tick) are kept for the price chart

// --- Order book ---------------------------------------------------------------------------------------------------
// Every stock has an ask side (sellers) and a bid side (buyers). Each side is a ladder of price levels, LEVEL_STEP apart.
// The best level has a queue of `aq` / `bq` lots; every deeper level holds `dA` / `dB` lots. A market order eats through
// the levels: a level can only fill as many lots as it holds, the rest moves on to the next (worse) price. There is no
// cap on the total number of lots, only a worse and worse price.
// Lots you take from the book push that side's best quote away from the mid price; it drifts back over time.
export const LEVEL_STEP = 0.1;      // flat Ocoin gap between two order-book levels (e.g. asks 10.5, 10.4, 10.3, ...)
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

// Book factors while a boom / crash is running (multiplied with the mode factors above). The gap between bid and
// ask here is deliberately large (>4x) so the lopsided book (more buyers piling in on a boom, more sellers
// dumping in a crash) stays visible even combined with a bearish/bullish underlying mode - see refreshBook.
const EVENT_BOOK = {
    boom: { bid: 1.6, ask: 0.25, spr: 2 },
    crash: { bid: 0.25, ask: 1.6, spr: 3 }
};

// Set to true by main.js only while the fast (production) loop runs, so the production bonus in modRes()
// is not applied to manual gathering, refunds, etc.
export const stockFlags = { prod: false, moneyLost: 0 }; // moneyLost: income Money yang sudah dipotong kapasitas di modRes tick ini

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
        storeLots: 0,   // how many of the held lots are put on the storage bonus; the rest are on the production bonus
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
    // Saves from before lots could be split between production and storage: every lot stays on production
    if (typeof st.storeLots !== 'number' || !isFinite(st.storeLots) || st.storeLots < 0){ st.storeLots = 0; }
    st.storeLots = Math.min(Math.floor(st.storeLots), st.lots || 0);
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

// A lot gives ONE bonus, chosen by the player: production or storage, never both. st.storeLots of the held lots are on
// storage, the remaining ones are on production. Old saves have no storeLots, so all their lots are on production.
export function storageLots(st){
    let n = Math.floor(st.storeLots);
    if (!(n > 0)){
        return 0;
    }
    return Math.min(n, st.lots);
}

export function productionLots(st){
    return st.lots - storageLots(st);
}

// Moves lots between production and storage. Clamped to 0..lots; returns the value that was set.
export function setStorageLots(st, n){
    n = Math.floor(Number(n));
    st.storeLots = n > 0 ? Math.min(n, st.lots) : 0;
    return st.storeLots;
}

export function lotBonus(lots){
    return 1 + LOT_BONUS * lots;
}

// Storage bonus is multiplicative (stacks with every other storage multiplier the same way Aether's does),
// while the production bonus above is additive - a deliberate difference: storage compounds with big warehouses,
// production intentionally does not compound with other production multipliers to keep it comparable across resources.
export function storageBonus(lots){
    return 1 + STORAGE_BONUS * lots;
}

// --- Order book: quotes ---------------------------------------------------------------------------------------------
export const MIN_LEVEL_PRICE = LEVEL_STEP;  // a bid ladder is never allowed to reach zero or below - floors at one grid step
const MAX_LEVELS = 100000;                  // generic guard against a pathologically large single order
const STEP_DECIMALS = (LEVEL_STEP.toString().split('.')[1] || '').length;

// Snaps a price onto the LEVEL_STEP grid (so 10.53 becomes 10.5, matching the flat step used between levels) and
// rounds off the float dust `Math.round` can leave behind (e.g. 10.499999999999998).
function snapToGrid(price){
    let snapped = Math.round(price / LEVEL_STEP) * LEVEL_STEP;
    return Math.max(MIN_LEVEL_PRICE, +snapped.toFixed(STEP_DECIMALS));
}

// Re-rolls the book for a new tick: spread, lots per level, queues at the best prices, and lets your price push fade.
export function refreshBook(st, rand = Math.random){
    let m = stockModes[st.mode];
    let e = st.ev ? EVENT_BOOK[st.ev.type] : { bid: 1, ask: 1, spr: 1 };
    st.spread = Math.min(MAX_SPREAD, BASE_SPREAD * m.spr * e.spr);
    // While a boom/crash is running, keep the per-level noise band tighter so the lopsided book reads clearly
    // (thick bid / thin ask on a boom, thin bid / thick ask on a crash) instead of getting blurred by the usual
    // +/-30% randomness. Normal days keep the wider range for organic-looking day-to-day depth.
    let noise = st.ev ? [0.85, 0.3] : [0.7, 0.6];
    let depth = (factor) => Math.max(1, Math.round(BASE_DEPTH * factor * (noise[0] + noise[1] * rand())));
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

// Both quotes are snapped onto the LEVEL_STEP grid, so the best price and every level after it are always a
// clean multiple of LEVEL_STEP (e.g. 10.5, 10.4, 10.3, ... instead of an arbitrary decimal like 10.4732).
export function askPrice(st){ return snapToGrid(baseAsk(st) * Math.exp(st.ap)); }
export function bidPrice(st){ return snapToGrid(baseBid(st) * Math.exp(-st.bp)); }

// Deterministic per-level jitter for the depth table only (never touches the trade math below, which keeps a
// single dA/dB per side so buy/sell math stays a closed form). Stable between re-renders since it's derived from
// this tick's base depth and price, and moves again the next time the book re-rolls (dA/dB/price change).
function levelDepth(base, priceSeed, i){
    let h = Math.sin((priceSeed + i * 37.1) * 12.9898) * 43758.5453;
    h -= Math.floor(h);
    return Math.max(1, Math.round(base * (0.5 + h)));
}

// Lists the first `n` price levels on one side of the book (for display only - does not change any state).
// Level 0 is the best price with `aq`/`bq` lots; each level after that is one flat LEVEL_STEP further away, e.g.
// asks 10.5, 10.4, 10.3, 10.2, 10.1 for LEVEL_STEP = 0.1. Levels past the first show a jittered depth rather than
// a flat repeat of dA/dB, so the table doesn't read as the same number down every row.
export function bookLevels(st, side, n = 5){
    let levels = [];
    if (side === 'ask'){
        let price = askPrice(st);
        for (let i = 0; i < n; i++){
            levels.push({ price: price, qty: i === 0 ? st.aq : levelDepth(st.dA, st.price, i) });
            price += LEVEL_STEP;
        }
    }
    else {
        let price = bidPrice(st);
        for (let i = 0; i < n; i++){
            levels.push({ price: price, qty: i === 0 ? st.bq : levelDepth(st.dB, st.price, i) });
            price = Math.max(MIN_LEVEL_PRICE, price - LEVEL_STEP);
        }
    }
    return levels;
}

// --- Order book: market orders --------------------------------------------------------------------------------------
// Buying m lots: q lots at the best ask, then full levels of d lots each LEVEL_STEP higher, the last one partial.
// Returns the total cost and what the ask side looks like afterwards (nothing is changed here).
export function buyQuote(st, m){
    m = Math.floor(m);
    let ask0 = askPrice(st);
    if (!(m > 0)){
        return { cost: 0, ap: st.ap, aq: st.aq, avg: ask0 };
    }
    let q = st.aq, d = st.dA, step = LEVEL_STEP;
    let cost, finalAsk, finalQ;
    if (m < q){
        cost = m * ask0; finalAsk = ask0; finalQ = q - m;
    }
    else if (m === q){
        cost = q * ask0; finalAsk = ask0 + step; finalQ = d;
    }
    else {
        let r = m - q;
        let n = Math.floor(r / d);
        let p = r - n * d;
        if (n > MAX_LEVELS){
            return { cost: Infinity, ap: st.ap, aq: st.aq, avg: Infinity };
        }
        // Full levels 1..n each hold d lots, priced ask0+step, ask0+2*step, ... - an arithmetic series.
        let fullCost = d * n * ask0 + d * step * n * (n + 1) / 2;
        let nextPrice = ask0 + (n + 1) * step;
        cost = q * ask0 + fullCost + p * nextPrice;
        finalAsk = nextPrice;
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
    let q = st.bq, d = st.dB, step = LEVEL_STEP;
    let proceeds, finalBid, finalQ;
    if (m < q){
        proceeds = m * bid0; finalBid = bid0; finalQ = q - m;
    }
    else if (m === q){
        proceeds = q * bid0; finalBid = Math.max(MIN_LEVEL_PRICE, bid0 - step); finalQ = d;
    }
    else {
        let r = m - q;
        let n = Math.min(Math.floor(r / d), MAX_LEVELS);
        let p = r - n * d;
        // The descending ladder bottoms out at MIN_LEVEL_PRICE: levels 1..nCap still step down by `step`, anything
        // past that trades at the floor price instead of going to zero or negative.
        let nCap = Math.max(0, Math.floor((bid0 - MIN_LEVEL_PRICE) / step + 1e-9));
        if (n <= nCap){
            // Full levels 1..n each hold d lots, priced bid0-step, bid0-2*step, ... - the descending mirror of buyQuote.
            let fullProceeds = d * n * bid0 - d * step * n * (n + 1) / 2;
            let nextPrice = Math.max(MIN_LEVEL_PRICE, bid0 - (n + 1) * step);
            proceeds = q * bid0 + fullProceeds + p * nextPrice;
            finalBid = nextPrice;
        }
        else {
            let descProceeds = d * nCap * bid0 - d * step * nCap * (nCap + 1) / 2;
            let floorLevels = n - nCap;
            proceeds = q * bid0 + descProceeds + floorLevels * d * MIN_LEVEL_PRICE + p * MIN_LEVEL_PRICE;
            finalBid = MIN_LEVEL_PRICE;
        }
        finalQ = p > 0 ? d - p : d;
    }
    return { proceeds: proceeds, bp: Math.max(0, Math.log(baseBid(st) / finalBid)), bq: finalQ, avg: proceeds / m };
}

// Largest number of lots that `budget` Ocoin can buy right now (closed form, no loop over levels).
export function maxBuyLots(st, budget){
    if (!(budget > 0)){ return 0; }
    let ask0 = askPrice(st), q = st.aq, d = st.dA, step = LEVEL_STEP;
    let m;
    if (budget < q * ask0){
        m = Math.floor(budget / ask0);
    }
    else {
        let b2 = budget - q * ask0;
        // Solve (d*step/2)*n^2 + d*(ask0+step/2)*n - b2 = 0 for the largest whole number of full levels affordable.
        let a = d * step / 2;
        let b = d * (ask0 + step / 2);
        let n = a > 0 ? Math.floor((-b + Math.sqrt(b * b + 4 * a * b2)) / (2 * a)) : Math.floor(b2 / b);
        n = Math.max(0, Math.min(n, MAX_LEVELS));
        let b3 = b2 - (d * n * ask0 + d * step * n * (n + 1) / 2);
        let nextPrice = ask0 + (n + 1) * step;
        let p = Math.min(Math.max(0, Math.floor(b3 / nextPrice)), d - 1);
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
    // Lots that no longer exist cannot stay allocated to storage (production lots are sold first)
    if (st.storeLots > st.lots){ st.storeLots = st.lots; }
    return q.proceeds;
}

// --- Order book: how many lots can fill at a limit price -------------------------------------------------------------
// A limit order can only take lots from levels that are at or better than its price, so its size per tick is capped by
// the queues at those levels.
export function limitBuyCapacity(st, limit){
    let ask0 = askPrice(st);
    if (limit < ask0){ return 0; }
    let n = Math.floor((limit - ask0) / LEVEL_STEP + 1e-9);
    return st.aq + Math.min(n, MAX_LEVELS) * st.dA;
}

export function limitSellCapacity(st, limit){
    let bid0 = bidPrice(st);
    if (limit > bid0){ return 0; }
    let n = Math.floor((bid0 - limit) / LEVEL_STEP + 1e-9);
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
    /* eslint-disable eqeqeq -- loose `!= null` intentionally treats undefined bracket sides as absent */
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
    if (tpPrice === null && slPrice === null){
        return { ok: false, reason: 'price' };
    }
    if (tpPrice !== null && (!(tpPrice > 0) || !isFinite(tpPrice))){
        return { ok: false, reason: 'price' };
    }
    if (slPrice !== null && (!(slPrice > 0) || !isFinite(slPrice))){
        return { ok: false, reason: 'price' };
    }
    if (tpPrice !== null && !orderPriceOk(st, 'sellLimit', tpPrice)){
        return { ok: false, reason: 'side' };
    }
    if (slPrice !== null && !orderPriceOk(st, 'sellStop', slPrice)){
        return { ok: false, reason: 'side' };
    }
    if (lots + committedSellLots(st) > st.lots){
        return { ok: false, reason: 'holdings' };
    }
    let needed = (tpPrice !== null ? 1 : 0) + (slPrice !== null ? 1 : 0);
    if (st.orders.length + needed > MAX_ORDERS){
        return { ok: false, reason: 'max' };
    }
    let tp = null, sl = null;
    if (tpPrice !== null){
        S.oid = (S.oid || 0) + 1;
        tp = { id: S.oid, type: 'sellLimit', price: tpPrice, lots: lots, total: lots, reserved: 0 };
        st.orders.push(tp);
    }
    if (slPrice !== null){
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
    if (tpPrice !== null && (!(tpPrice > buyPrice) || !isFinite(tpPrice))){
        return 'tp';
    }
    if (slPrice !== null && (!(slPrice > 0 && slPrice < buyPrice) || !isFinite(slPrice))){
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
    /* eslint-disable eqeqeq -- loose `!= null` intentionally treats undefined bracket sides as absent */
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
    /* eslint-enable eqeqeq */
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
// `lost` is the part of `natural` that the Money storage cap already cut off before this runs (money.amount is clamped to
// money.max right after production, but `natural` counts the full income). Without it, a large income makes the surplus be
// taken from an amount that never received it: Money then settles at max - (natural - keepPerTick) instead of filling up.
// delta is adjusted too, so the Money rate shown in the resource panel is the rate you actually end up with.
// `start` is the Money amount at the start of the tick (before any production). With a huge income, `natural` and the amount
// that was cut off by the cap are enormous numbers that differ by about keepPerTick, and subtracting one from the other
// throws away the precision the result needs (at ~1e21 per tick every digit of the small remainder is lost). So when `start`
// is known the result is computed directly: what is left is exactly the start amount plus the part that is kept.
export function autoTradeStep(S, money, natural, keepPerTick, lost = 0, start = NaN){
    let out = { kind: 'none', money: 0, ocoin: 0 };
    if (!isFinite(natural) || !(keepPerTick >= 0)){
        return out;
    }
    if (!isFinite(lost) || lost < 0){
        lost = 0;
    }
    if (natural > keepPerTick){
        // The income the cap cut off counts as part of the surplus: put it back, take the surplus out, then apply the cap again
        let avail = Math.max(0, money.amount + lost);
        let surplus = natural - keepPerTick;
        let move = Math.min(surplus, avail);
        if (move > 0){
            let gained = moneyToOcoin(move);
            if (isFinite(start) && start >= 0 && move === surplus){
                // Exact: nothing huge is subtracted from something huge
                money.amount = start + keepPerTick;
                money.delta = (money.delta - natural) + keepPerTick;
            }
            else {
                money.amount = avail - move;
                money.delta -= move;
            }
            if (money.max >= 0 && money.amount > money.max){
                money.amount = money.max;
            }
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




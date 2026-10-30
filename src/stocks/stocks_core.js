// Pure stock-market maths. This file must NOT import anything, so it can be unit tested outside the browser
// and imported from anywhere (functions.js, main.js, stocks.js) without creating circular imports.

// --- Tunable constants ---------------------------------------------------------------------------------------------
export const OCOIN_RATE = 1000;     // 1 Ocoin = 1000 Money (both directions)
export const OCOIN_BUY_FEE = 0.05;  // fee on Money -> Ocoin only. Ocoin -> Money is free.
export const AETHER_GENES_RATE = 1e9; // Genes you get for 1 Aether (the Aether tab): 1 nano Aether = 1 Genes
export const AETHER_SOUL_GEM_RATE = 1e12; // Soul Gems you get for 1 Aether (the Aether tab): 1 pico Aether = 1 Soul Gem
export const AETHER_DARK_RATE = 10; // Dark Energy you get for 1 Aether (the Aether tab), bought in whole Aether like Plasmid/Phage
export const AETHER_HARMONY_RATE = 1; // Harmony Crystal you get for 1 Aether (the Aether tab); the rarest of the prestige currencies
export const AETHER_OCOIN_RATE = 1e12; // Ocoin you get for 1 Aether (the Aether tab). Same value as 1 Aether = 1e15 Money at the 1000:1
                                        // exchange, without the 5% fee.
export const LOT_BONUS = 0.001;     // each lot on production adds +0.1% production to that stock's resource (additive, no cap)
export const STORAGE_BONUS = 0.01;  // each lot on storage adds +1% storage (max capacity) to that stock's resource (multiplicative, no cap)

// Special companies that are not tied to a stockpiled resource at all, but to a city-wide stat instead.
// Unlike LOT_BONUS/STORAGE_BONUS (percentages, multiplicative), these are flat additive amounts: holding lots adds
// that amount every tick the bonus is computed, and selling them takes it away again on the very next tick, since
// the bonus is always computed fresh from the lots you currently hold, never accumulated as a one-off transaction.
export const MORALE_BONUS_PER_LOT = 0.1;  // each lot adds +0.1 Morale (the current value, not the cap)
export const BIRTH_BONUS_PER_LOT = 0.05;  // each lot adds +0.05 to the citizen growth roll, same additive/reversible pattern
export const ARMY_BONUS_PER_LOT = 0.1;    // each lot adds +0.1 to the maximum number of soldiers (whole soldiers only, see armyCapBonus)
// Dividend company: unlike the three above it pays in Ocoin. Once per game day each lot adds this fraction of the Ocoin
// you currently have available (so 1000 lots = +100% of your Ocoin per day). It compounds, and it stops when you sell.
export const OCOIN_YIELD_PER_LOT = 0.001;  // +0.1% of available Ocoin per lot, per game day
// Order here is the display order for the special (non-resource) companies: Morale, Birthrate, Army, then Dividend.
export const SPECIAL_STOCKS = [
    { res: 'Morale', fair: 60 },
    { res: 'Birthrate', fair: 75 },
    { res: 'Army', fair: 110 },
    { res: 'Dividend', fair: 150 }
];

// Extra garrison capacity (maximum soldiers) from the Army company for `lots` lots held. Soldiers are whole people, so the
// bonus is rounded down (the tiny epsilon keeps e.g. 30 * 0.1 = 3.0000000000000004 style products on the right side).
// It only raises the cap: soldiers still have to be recruited at the normal rate. Invalid input gives 0.
export function armyCapBonus(lots){
    if (!(lots > 0)){
        return 0;
    }
    return Math.floor(lots * ARMY_BONUS_PER_LOT + 1e-9);
}

// Ocoin paid out by the Dividend company for one game day: `ocoin` is the Ocoin available right now (Ocoin locked in open
// buy orders is not counted), `lots` the lots held. Pure function so it can be tested without the game.
export function ocoinYield(ocoin, lots){
    if (!(ocoin > 0) || !(lots > 0) || !isFinite(ocoin) || !isFinite(lots)){
        return 0;
    }
    return ocoin * lots * OCOIN_YIELD_PER_LOT;
}
// Net Ocoin change per game second from the two automatic sources, for the balance indicator in the Stocks tab.
// autoFlow: smoothed Money/s moved by Auto Convert (positive = Money converted into Ocoin, negative = Money topped up from
// Ocoin). A positive flow always counts, because Money that the storage cap would throw away is converted even while Auto is
// off (see capOverflowStep); a negative flow (top-up from Ocoin) only exists, and only counts, while Auto is on.
// The Compoundia payout happens once per game day, so it is spread over daySeconds.
// alchemyFlow: smoothed Ocoin/s the Resources > Ocoin tab really moved (selling pays Ocoin out, buying takes it), already a
// signed Ocoin rate, see trackAlchemyFlow in ocoin_alchemy.js.
// One-off movements (buying/selling Ocoin, filled orders, Aether purchases) are not rates and are not counted.
export function ocoinFlowPerSecond(autoFlow, autoOn, ocoin, dividendLots, daySeconds, alchemyFlow = 0){
    let auto = 0;
    if (isFinite(autoFlow) && autoFlow !== 0 && (autoOn || autoFlow > 0)){
        auto = autoFlow > 0 ? moneyToOcoin(autoFlow) : autoFlow / OCOIN_RATE;
    }
    let perDay = daySeconds > 0 ? ocoinYield(ocoin, dividendLots) : 0;
    let dividend = daySeconds > 0 ? perDay / daySeconds : 0;
    let alchemy = isFinite(alchemyFlow) ? alchemyFlow : 0;
    return { auto, dividend, alchemy, perDay, net: auto + dividend + alchemy };
}
export const HIST_LEN = 240;        // how many past prices (one per tick) are kept for the price chart

// --- Order book ---------------------------------------------------------------------------------------------------
// Every stock has a persistent order book: an ask side (sellers) and a bid side (buyers). Each side is a ladder of price
// levels, one tick size (`st.step`) apart, holding a number of lots. The book is the market: the price is the middle of
// the best bid and the best ask, and it only moves when lots are actually traded away.
//  - NPC "flow" (driven by the hidden market mode, boom/crash events and the pull towards fair value) buys or sells at
//    market every tick and eats through the levels. A thick level holds the price up, a thin one lets it gap through.
//  - NPC market makers slowly refill liquidity around the price after that.
//  - Your limit orders are real resting orders: they sit in the book (behind the NPC lots at the same level), they
//    count as depth, and they only fill when the flow reaches their level.
// The tick size is relative to the stock's fair value (about 0.2%, rounded to 1/2/5 x 10^n), so a cheap stock and a very
// expensive one both get a sensible ladder. Order prices are rounded to the nearest level.
export const REL_STEP = 0.002;       // tick size as a share of the fair value
export const MIN_STEP = 0.01;        // smallest tick size
export const BASE_DEPTH = 10;        // lots per level for a stock priced at DEPTH_REF_PRICE or below (before factors)
export const DEPTH_REF_PRICE = 100;  // more expensive stocks get proportionally deeper levels
export const BOOK_WINDOW = 80;       // how many levels each side keeps liquidity for (around the price)
export const BOOK_REFILL = 0.3;      // share of a missing level that the market makers refill per tick
export const BOOK_DECAY = 0.1;       // share of an over-thick level that is pulled away per tick
export const BASE_SPREAD = 0.01;     // relative spread between best bid and best ask (before factors)
export const MAX_SPREAD = 0.10;
export const MAX_ORDERS = 10;        // open orders per stock
const MAX_TAIL_LEVELS = 20000;       // how far past the real book a single huge order may still walk (see sweep)

// Random boom / crash events. A boom is a gradual rise, a crash is a sharp drop; afterwards the price drifts back.
const EVENT_CHANCE = 0.015;         // per stock, per tick
const MARKET_EVENT_CHANCE = 0.003;  // per tick, hits every stock at once (with a random strength per stock)
const BOOM_GAIN = [0.10, 0.25];     // total rise over the event
const BOOM_DUR = [5, 10];           // ticks
const CRASH_DROP = [0.15, 0.35];    // total drop over the event
const CRASH_DUR = [2, 3];           // ticks

const BASE_VOL = 0.01;              // base volatility per tick (1%)
const REVERT = 0.02;                // pull-back strength towards the stock's fair value per tick
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
// dumping in a crash) stays visible even combined with a bearish/bullish underlying mode - see refill.
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
        step: stepForFair(def.fair),
        price: price,
        prev: price,
        mode: pickMode(rand),
        left: MODE_MIN + Math.floor(rand() * (MODE_MAX - MODE_MIN + 1)),
        hist: [+price.toFixed(4)],
        ev: null,
        lots: 0,
        storeLots: 0,   // how many of the held lots are put on the storage bonus; the rest are on the production bonus
        spent: 0,
        rev: 0,         // bumped whenever the order book changes (the UI watches it, see bump)
        orders: []
    };
    buildBook(st, rand);
    return st;
}

// Fills in the order-book fields for stocks saved before the persistent order book existed (the price, the history and
// your orders are kept; the book itself is rebuilt around the current price).
export function upgradeStock(st, rand = Math.random){
    if (!Array.isArray(st.orders)){ st.orders = []; }
    // Saves from before lots could be split between production and storage: every lot stays on production
    if (typeof st.storeLots !== 'number' || !isFinite(st.storeLots) || st.storeLots < 0){ st.storeLots = 0; }
    st.storeLots = Math.min(Math.floor(st.storeLots), st.lots || 0);
    if (!(st.step > 0)){ st.step = stepForFair(st.fair); }
    if (typeof st.rev !== 'number'){ st.rev = 0; }
    if (!st.asks || !st.bids || typeof st.kr !== 'number'){
        buildBook(st, rand);
    }
    rawBook(st.asks);
    rawBook(st.bids);
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
    let f = bookFactors(st);
    let evDrift = 0;
    if (st.ev){
        evDrift = st.ev.drift;
        st.ev.left--;
        if (st.ev.left <= 0){
            st.ev = null;
        }
    }
    // The pressure on the price this tick (log return): market mode, boom/crash, the pull back towards fair value and
    // noise. It is not applied to the price directly: it becomes NPC market orders that have to eat through the book,
    // so a thick book (yours or the market's) absorbs it and a thin one lets the price run.
    let r = m.drift + evDrift + REVERT * (Math.log(st.fair) - Math.log(st.price)) + BASE_VOL * m.vol * randNormal(rand);
    let side = r >= 0 ? 'ask' : 'bid';
    let levels = Math.abs(r) * st.price / stepOf(st);
    // The market makers' levels get thicker the further they are from the price (see topUp), so crossing `levels`
    // levels takes depth * (levels + levels^2 / window) lots: with a book as thick as the market makers keep it, the price
    // moves by about r. Anything thicker in the way (your orders) stops it sooner, anything thinner lets it run further.
    let vol = Math.round(baseDepth(st) * (side === 'ask' ? f.ask : f.bid) * (levels + levels * levels / BOOK_WINDOW));
    if (vol > 0){
        let out = sweep(st, side, vol, true, Infinity);
        if (out.lots > 0){
            st.kr = out.last;
        }
    }
    let book = refill(st, rand);
    let p = (askPrice(st, book.own, book.ask) + bidPrice(st, book.own, book.bid)) / 2;
    st.prev = st.price;
    st.price = p;
    st.hist.push(+p.toFixed(4));
    while (st.hist.length > HIST_LEN){
        st.hist.shift();
    }
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

// --- Order book: levels ---------------------------------------------------------------------------------------------
// Prices live on a grid: level k is the price k * step. The NPC liquidity is stored per level in st.asks / st.bids
// ({ level: lots }, empty levels are simply absent). Your resting limit orders are not stored there: they are read from
// st.orders and added on top, queued behind the NPC lots of the same level. st.kr is the level of the last trade, the
// reference the market makers post their liquidity around.
export function stepForFair(fair){
    let raw = Math.max(MIN_STEP, fair * REL_STEP);
    let base = Math.pow(10, Math.floor(Math.log10(raw) + 1e-9));
    let mant = raw / base;
    return +((mant >= 5 ? 5 : mant >= 2 ? 2 : 1) * base).toPrecision(12);
}

export function stepOf(st){
    return st.step > 0 ? st.step : stepForFair(st.fair);
}

export function levelOf(st, price){
    return Math.max(1, Math.round(price / stepOf(st) + 1e-9));
}

// A price is a pure function of (level, step), and toPrecision is slow while every sweep, quote and depth row asks for dozens
// of them, so they are kept per step. Only whole levels in a sane range are cached; anything else is computed directly.
const PRICE_CACHE = new Map();    // step -> prices indexed by level
const PRICE_CACHE_MAX_LEVEL = 100000;
const PRICE_CACHE_MAX_STEPS = 256;

export function priceAtLevel(st, k){
    let step = stepOf(st);
    if (!Number.isInteger(k) || k < 0 || k > PRICE_CACHE_MAX_LEVEL){
        return +(k * step).toPrecision(12);
    }
    let prices = PRICE_CACHE.get(step);
    if (prices === undefined){
        if (PRICE_CACHE.size >= PRICE_CACHE_MAX_STEPS){
            PRICE_CACHE.clear();
        }
        prices = [];
        PRICE_CACHE.set(step, prices);
    }
    let price = prices[k];
    if (price === undefined){
        price = +(k * step).toPrecision(12);
        prices[k] = price;
    }
    return price;
}

// Rounds a price to the nearest price level of this stock. Orders are always placed on the grid.
export function snapPrice(st, price){
    if (!(price > 0) || !isFinite(price)){
        return price;
    }
    return priceAtLevel(st, levelOf(st, price));
}

// Vue 2.7 skips any object flagged __v_skip (what Vue.markRaw does). Each NPC order book holds ~80 price levels per side, per
// stock; making every one of them a reactive getter/setter made each book write about 2.5x slower and cost a lot of memory,
// while the UI never needed it (it watches st.rev instead, see bump). The flag is not enumerable, so it is not saved:
// upgradeStock puts it back after a load.
function rawBook(book){
    if (book && typeof book === 'object' && !Object.prototype.hasOwnProperty.call(book, '__v_skip')){
        Object.defineProperty(book, '__v_skip', { value: true, configurable: true });
    }
    return book;
}

function bump(st){
    st.rev = (st.rev || 0) + 1;    // lets the UI know the book changed (levels are added/removed without Vue noticing)
}

// Lots per level for this stock: expensive stocks have proportionally deeper levels, so a lot of an expensive stock
// moves the price about as little as it always did.
export function baseDepth(st){
    return BASE_DEPTH * Math.max(1, st.fair / DEPTH_REF_PRICE);
}

function addOwn(map, k, o, q){
    (map[k] = map[k] || []).push({ o: o, q: q });
}

// Your resting limit orders as book liquidity: { bid: { level: [{ o, q }] }, ask: { ... } }.
// A sell limit can only rest with lots you actually hold.
function ownLevels(st){
    let own = { bid: {}, ask: {} };
    if (!st.orders || st.orders.length === 0){
        return own;
    }
    let hold = st.lots || 0;
    (st.orders || []).slice().sort((a, b) => a.id - b.id).forEach(function(o){
        if (!(o.lots > 0)){
            return;
        }
        if (o.type === 'buyLimit'){
            addOwn(own.bid, levelOf(st, o.price), o, o.lots);
        }
        else if (o.type === 'sellLimit'){
            let q = Math.min(o.lots, hold);
            hold -= q;
            if (q > 0){
                addOwn(own.ask, levelOf(st, o.price), o, q);
            }
        }
    });
    return own;
}

const EMPTY = Object.freeze({});

// The price levels of one side that hold anything (NPC lots or yours), best price first, as plain numbers.
function levelKeys(npc, ow){
    let ks = [];
    if (Object.keys(ow).length === 0){
        for (let key in npc){
            if (npc[key] > 0){ ks.push(+key); }
        }
        return ks;
    }
    let seen = {};
    for (let key in npc){
        if (npc[key] > 0){ seen[key] = true; }
    }
    for (let key in ow){
        seen[key] = true;
    }
    return Object.keys(seen).map(Number);
}

// One non-empty level: { k, n (NPC lots), o (your lots), list (your orders there) }.
function levelAt(npc, ow, k){
    let list = ow[k] || [];
    let o = 0;
    for (let i = 0; i < list.length; i++){ o += list[i].q; }
    return { k: k, n: npc[k] > 0 ? npc[k] : 0, o: o, list: list };
}

// Sorted level keys of one side plus a lazy accessor for the level at position i. Walking a side level by level (sweep, the
// depth table) usually stops after a few levels, so the level objects are only built for the ones actually visited.
function sideWalk(st, side, own){
    let npc = side === 'ask' ? st.asks : st.bids;
    let ow = side === 'ask' ? own.ask : own.bid;
    let ks = levelKeys(npc, ow);
    ks.sort(side === 'ask' ? (a, b) => a - b : (a, b) => b - a);
    return { keys: ks, at: i => levelAt(npc, ow, ks[i]) };
}

// `npcBest` (optional) is the best NPC level when the caller already knows it (null = the NPC side is empty); without it the
// whole NPC side is scanned.
function bestLevel(st, side, own, npcBest){
    own = own || ownLevels(st);
    let ask = side === 'ask';
    let npc = ask ? st.asks : st.bids;
    let ow = ask ? own.ask : own.bid;
    let known = npcBest !== undefined;
    let best = known ? npcBest : null;
    if (ask){
        for (let key in known ? EMPTY : npc){
            if (npc[key] > 0){
                let k = +key;
                if (best === null || k < best){ best = k; }
            }
        }
        for (let key in ow){
            let k = +key;
            if (best === null || k < best){ best = k; }
        }
    }
    else {
        for (let key in known ? EMPTY : npc){
            if (npc[key] > 0){
                let k = +key;
                if (best === null || k > best){ best = k; }
            }
        }
        for (let key in ow){
            let k = +key;
            if (best === null || k > best){ best = k; }
        }
    }
    return best;
}

// Only used if a side of the book is completely empty (everything was bought/sold out): one level past the last trade.
function fallbackLevel(st, side){
    let kr = typeof st.kr === 'number' ? st.kr : levelOf(st, st.price);
    return side === 'ask' ? kr + 1 : Math.max(1, kr - 1);
}

export function askPrice(st, own, npcBest){
    let k = bestLevel(st, 'ask', own, npcBest);
    return priceAtLevel(st, k === null ? fallbackLevel(st, 'ask') : k);
}

export function bidPrice(st, own, npcBest){
    let k = bestLevel(st, 'bid', own, npcBest);
    return priceAtLevel(st, k === null ? fallbackLevel(st, 'bid') : k);
}

// The first n price levels of one side, best price first, for the depth table: { price, qty (all lots), own (your lots),
// cum (lots from the best price through this level) }. Missing levels (a thin book) come back with qty 0.
export function bookLevels(st, side, n = 5){
    let walk = sideWalk(st, side, ownLevels(st));
    let out = [];
    let cum = 0;
    for (let i = 0; i < n; i++){
        let L = i < walk.keys.length ? walk.at(i) : null;
        if (L){
            cum += L.n + L.o;
            out.push({ price: priceAtLevel(st, L.k), qty: L.n + L.o, own: L.o, cum: cum });
        }
        else {
            out.push({ price: 0, qty: 0, own: 0, cum: cum });
        }
    }
    return out;
}

// --- Order book: matching --------------------------------------------------------------------------------------------
// Takes up to `want` lots from one side of the book, best price first (side 'ask' = buying, 'bid' = selling), stopping
// early when `budget` (Ocoin, buys only) runs out or the book has no more liquidity.
// commit = false only measures it. With commit = true the NPC lots at each level go first, then your own resting orders
// there (oldest first): those are reduced right away and the lots are booked in order.pend, which settleOrders pays out.
// Returns { lots, cost (Ocoin spent or received), last (level of the last lot taken), nextK (best level left, or null) }.
function sweep(st, side, want, commit, budget, own){
    let out = { lots: 0, cost: 0, last: null, nextK: null };
    if (!(want > 0)){
        return out;
    }
    let limited = isFinite(budget) && budget >= 0;
    let book = side === 'ask' ? st.asks : st.bids;
    let walk = sideWalk(st, side, own || ownLevels(st));
    let count = walk.keys.length;
    for (let i = 0; i < count; i++){
        let L = walk.at(i);
        let price = priceAtLevel(st, L.k);
        let avail = L.n + L.o;
        let take = Math.min(avail, want);
        if (limited){
            take = Math.min(take, Math.floor(budget / price + 1e-9));
        }
        if (take <= 0){
            out.nextK = L.k;
            return out;
        }
        out.lots += take;
        out.cost += take * price;
        out.last = L.k;
        want -= take;
        if (limited){
            budget -= take * price;
        }
        if (commit){
            let fromNpc = Math.min(L.n, take);
            if (fromNpc > 0){
                if (L.n - fromNpc > 0){ book[L.k] = L.n - fromNpc; }
                else { delete book[L.k]; }
            }
            let rest = take - fromNpc;
            for (let e = 0; e < L.list.length && rest > 0; e++){
                let x = Math.min(L.list[e].q, rest);
                L.list[e].o.lots -= x;
                L.list[e].o.pend = (L.list[e].o.pend || 0) + x;
                rest -= x;
            }
        }
        if (take < avail){
            out.nextK = L.k;
            return out;
        }
        if (want <= 0){
            out.nextK = i + 1 < count ? walk.keys[i + 1] : null;
            return out;
        }
    }
    // Past the last real level there is always more to trade, just at a worse and worse price (the market makers would
    // keep quoting further out): there is no cap on how many lots you can buy or sell, only on how much it costs.
    // These levels are not stored; whatever is left of the real book after the trade is what the market makers rebuild from.
    let dir = side === 'ask' ? 1 : -1;
    let k = count > 0 ? walk.keys[count - 1] : fallbackLevel(st, side) - dir;
    let tailDepth = Math.max(1, Math.round(baseDepth(st) * 3));
    for (let n = 0; n < MAX_TAIL_LEVELS && want > 0; n++){
        k += dir;
        if (k < 1){
            break;
        }
        let price = priceAtLevel(st, k);
        let take = Math.min(tailDepth, want);
        if (limited){
            take = Math.min(take, Math.floor(budget / price + 1e-9));
        }
        if (take <= 0){
            out.nextK = k;
            return out;
        }
        out.lots += take;
        out.cost += take * price;
        out.last = k;
        want -= take;
        if (limited){
            budget -= take * price;
        }
        if (take < tailDepth || want <= 0){
            out.nextK = take < tailDepth ? k : k + dir;
            return out;
        }
    }
    return out;
}

// Lots a market order of up to `m` would get, with the total cost, the average price and the best price left behind.
export function buyQuote(st, m){
    m = Math.floor(m);
    let ask0 = askPrice(st);
    if (!(m > 0)){
        return { cost: 0, avg: ask0, filled: 0, next: ask0 };
    }
    let r = sweep(st, 'ask', m, false, Infinity);
    let next = ask0;
    if (r.last !== null){
        next = priceAtLevel(st, r.nextK !== null ? r.nextK : r.last + 1);
    }
    return { cost: r.cost, avg: r.lots > 0 ? r.cost / r.lots : ask0, filled: r.lots, next: next };
}

export function sellQuote(st, m){
    m = Math.floor(m);
    let bid0 = bidPrice(st);
    if (!(m > 0)){
        return { proceeds: 0, avg: bid0, filled: 0, next: bid0 };
    }
    let r = sweep(st, 'bid', m, false, Infinity);
    let next = bid0;
    if (r.last !== null){
        next = priceAtLevel(st, r.nextK !== null ? r.nextK : Math.max(1, r.last - 1));
    }
    return { proceeds: r.cost, avg: r.lots > 0 ? r.cost / r.lots : bid0, filled: r.lots, next: next };
}

// The most lots you can buy at market with `budget` Ocoin (limited by the liquidity in the book too).
export function maxBuyLots(st, budget){
    if (!(budget > 0)){
        return 0;
    }
    return sweep(st, 'ask', Infinity, false, budget).lots;
}

// Puts `x` lots less on your position (average cost stays the same), keeping the storage lots within what you hold.
function reducePosition(st, x){
    st.spent = st.lots > x ? st.spent * (st.lots - x) / st.lots : 0;
    st.lots -= x;
    if (st.storeLots > st.lots){
        st.storeLots = st.lots;
    }
}

// After a big market order one side of the book is eaten up to the last trade price while the other side still sits at the
// old price, so the quotes are far apart (e.g. best ask 120, best bid 30). In a real market the market makers re-quote
// around the last trade right away. Without this, the next tick's random pressure could hit the stale side, drag the
// last-trade anchor (st.kr) back to the old price and rebuild the whole book there: the price would snap back by itself
// and the trade would have no lasting effect (or keep it, depending on a coin flip).
// Small trades that leave the spread normal are left alone, so clicking buy/sell does not regenerate liquidity.
function requote(st, rand){
    let own = ownLevels(st);
    let ka = bestLevel(st, 'ask', own);
    let kb = bestLevel(st, 'bid', own);
    let half = Math.max(1, Math.round(st.price * st.spread / 2 / stepOf(st)));
    if (ka !== null && kb !== null && ka - kb <= 2 * half + 2){
        return;
    }
    st.price = priceAtLevel(st, st.kr);
    let book = refill(st, rand);
    st.price = (askPrice(st, book.own, book.ask) + bidPrice(st, book.own, book.bid)) / 2;
}

// Market buy: takes lots off the ask side (which pushes the price up for real). Returns { lots, cost }.
export function buyMarket(st, m, rand = Math.random){
    let r = sweep(st, 'ask', Math.floor(m), true, Infinity);
    if (r.lots > 0){
        st.lots += r.lots;
        st.spent += r.cost;
        st.kr = r.last;
        bump(st);
        requote(st, rand);
    }
    return { lots: r.lots, cost: r.cost };
}

// Market sell: hits the bid side. Returns { lots, proceeds }.
export function sellMarket(st, m, rand = Math.random){
    m = Math.min(Math.floor(m), st.lots);
    let r = sweep(st, 'bid', m, true, Infinity);
    if (r.lots > 0){
        reducePosition(st, r.lots);
        st.kr = r.last;
        bump(st);
        requote(st, rand);
    }
    return { lots: r.lots, proceeds: r.cost };
}

export function executeBuy(st, m){
    return buyMarket(st, m).cost;
}

export function executeSell(st, m){
    return sellMarket(st, m).proceeds;
}

// --- Order book: market makers ---------------------------------------------------------------------------------------
function bookFactors(st){
    let m = stockModes[st.mode] || stockModes[0];
    let e = st.ev ? EVENT_BOOK[st.ev.type] : { bid: 1, ask: 1, spr: 1 };
    return { bid: m.bid * e.bid, ask: m.ask * e.ask, spr: m.spr * e.spr };
}

// Tops the levels from `start` outwards (dir +1 asks, -1 bids) up towards a target depth that gets thicker further from
// the price. Levels that are already thicker stay (slowly pulled back), levels past the window are cancelled.
const BOOK_SCALE = [];    // 1 + 2 * j / BOOK_WINDOW per level j, computed once
for (let j = 0; j <= BOOK_WINDOW; j++){
    BOOK_SCALE.push(1 + 2 * j / BOOK_WINDOW);
}

function topUp(book, start, dir, depth, noise, rand){
    let n0 = noise[0];
    let n1 = noise[1];
    for (let j = 0; j <= BOOK_WINDOW; j++){
        let k = start + dir * j;
        if (k < 1){
            break;
        }
        let target = Math.max(1, Math.round(depth * BOOK_SCALE[j] * (n0 + n1 * rand())));
        let cur = book[k] || 0;
        if (cur < target){
            book[k] = cur + Math.max(1, Math.ceil((target - cur) * BOOK_REFILL));
        }
        else if (cur > target * 1.5){
            book[k] = Math.round(cur - (cur - target * 1.5) * BOOK_DECAY);
        }
    }
    let best = null;
    for (let key in book){
        let k = +key;
        if ((k - start) * dir > BOOK_WINDOW + 5){
            delete book[key];
        }
        else if (book[key] > 0 && (best === null || (dir > 0 ? k < best : k > best))){
            best = k;
        }
    }
    return best;    // the best level left on this side (null if none), so the caller need not scan the book again
}

// The market makers repost liquidity around the last trade, never crossing the book. Liquidity that is already closer to
// the price (yours included) stays where it is, so the spread tightens when someone posts inside it.
function refill(st, rand){
    let f = bookFactors(st);
    st.spread = Math.min(MAX_SPREAD, BASE_SPREAD * f.spr);
    let depth = baseDepth(st);
    let noise = st.ev ? [0.85, 0.3] : [0.7, 0.6];
    let half = Math.max(1, Math.round(st.price * st.spread / 2 / stepOf(st)));
    let own = ownLevels(st);
    let bestBid = bestLevel(st, 'bid', own);
    let bestAsk = bestLevel(st, 'ask', own);
    let askStart = st.kr + half;
    if (bestBid !== null){
        askStart = Math.max(askStart, bestBid + 1);
    }
    let bidStart = st.kr - half;
    if (bestAsk !== null){
        bidStart = Math.min(bidStart, bestAsk - 1);
    }
    let askBest = topUp(st.asks, askStart, 1, depth * f.ask, noise, rand);
    let bidBest = topUp(st.bids, Math.max(1, bidStart), -1, depth * f.bid, noise, rand);
    bump(st);
    // Your resting orders did not change, so the caller can reuse `own`; the best levels are what bestLevel would find.
    return { own: own, ask: askBest, bid: bidBest };
}

// Builds a fresh book around the stock's current price.
function buildBook(st, rand){
    st.asks = rawBook({});
    st.bids = rawBook({});
    st.kr = levelOf(st, st.price);
    for (let i = 0; i < 8; i++){
        refill(st, rand);
    }
}

// --- Orders (buy limit / buy stop / sell limit / sell stop) ----------------------------------------------------------
// S is the whole stock state: { ocoin, oid, market }. Orders are checked every tick after the prices moved.
//   buyLimit  : a resting bid below the ask (buy a dip). It sits in the book as real depth and fills at your price when the
//               market sells down to its level - it holds the price up as long as it is there.
//   buyStop   : buy when the ask rises to your price (buy a breakout). Then becomes a market buy.
//   sellLimit : a resting ask above the bid (take profit). Sits in the book and fills at your price when the market buys up to it.
//   sellStop  : sell when the bid falls to your price (stop loss). Then becomes a market sell, so a thin bid in a crash
//               can fill far below your stop price.
// Order prices are rounded to the nearest price level of the stock (see snapPrice).
export const ORDER_TYPES = ['buyLimit', 'buyStop', 'sellLimit', 'sellStop'];

export function isBuyOrder(type){
    return type === 'buyLimit' || type === 'buyStop';
}

// The price a new order of this type must be placed on the right side of (otherwise it would fire immediately).
export function orderPriceOk(st, type, price){
    if (!(price > 0) || !isFinite(price)){ return false; }
    let k = levelOf(st, price);
    let ka = levelOf(st, askPrice(st));
    let kb = levelOf(st, bidPrice(st));
    switch (type){
        case 'buyLimit': return k < ka;
        case 'buyStop': return k > ka;
        case 'sellLimit': return k > kb;
        case 'sellStop': return k < kb;
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
    price = snapPrice(st, price);
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
    let st = S.market[res];
    price = snapPrice(st, price);
    if (bracket){
        bracket = {
            tpPrice: bracket.tpPrice != null ? snapPrice(st, bracket.tpPrice) : null,
            slPrice: bracket.slPrice != null ? snapPrice(st, bracket.slPrice) : null
        };
    }
    if (bracket && isBuyOrder(type)){
        let br = validateBracket(price, bracket.tpPrice, bracket.slPrice);
        if (br){
            return { ok: false, reason: br };
        }
    }
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
    bump(st);
    return { ok: true, order: order };
}

// Cancelling one side of a take-profit/stop-loss pair leaves the other side in place, on its own (it shares its lots
// with nothing). This matches "cancel just the TP, keep the SL protecting me" as the common case.
export function cancelOrder(S, res, id){
    let st = S.market[res];
    if (!st){ return false; }
    settleOrders(S, res);    // lots that already traded while the order was resting are paid out first
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
    bump(st);
    return true;
}

// Removing an order also unlinks any surviving OCO sibling, so nothing is ever left pointing at a dead id
// (reduceOcoSibling already removes+unlinks the *other* side when it empties out; this covers the order itself
// finishing normally - e.g. a take-profit that fills completely - so the stop-loss sibling's
// `.oco` is never left dangling).
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
        bump(st);
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
    if (tpPrice !== null){ tpPrice = snapPrice(st, tpPrice); }
    if (slPrice !== null){ slPrice = snapPrice(st, slPrice); }
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
    bump(st);
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

// Pays out what your orders did since the last check and triggers the stop orders. Limit orders rest in the book, so
// the market flow (or your own market orders) fills them while the tick runs; the lots are waiting in order.pend.
// Returns notes: { kind: 'fill'|'trigger'|'nofunds'|'noholdings'|'ocoCancel', res, type, lots, avg?, done? }
export function settleOrders(S, res){
    let st = S.market[res];
    let notes = [];
    if (!st || !st.orders || st.orders.length === 0){
        return notes;
    }
    // Resting limit orders: they fill at their own price, exactly what was reserved/held for them.
    let settleFills = function(){
        st.orders.slice().forEach(function(o){
            if (st.orders.indexOf(o) === -1){ return; }
            let pend = o.pend || 0;
            if (!(pend > 0)){ return; }
            o.pend = 0;
            if (o.type === 'buyLimit'){
                let cost = pend * o.price;
                o.reserved = Math.max(0, o.reserved - cost);
                st.lots += pend;
                st.spent += cost;
                let done = o.lots <= 0;
                if (done){
                    S.ocoin += o.reserved;
                    o.reserved = 0;
                    removeOrder(st, o);
                }
                applyBracket(S, res, o, pend);
                notes.push({ kind: 'fill', res: res, type: o.type, lots: pend, avg: o.price, done: done });
            }
            else if (o.type === 'sellLimit'){
                let m = Math.min(pend, st.lots);
                S.ocoin += m * o.price;
                reducePosition(st, m);
                let done = o.lots <= 0;
                if (done){
                    removeOrder(st, o);
                }
                let cancel = reduceOcoSibling(st, o, pend);
                notes.push({ kind: 'fill', res: res, type: o.type, lots: m, avg: o.price, done: done });
                if (cancel){ notes.push({ kind: 'ocoCancel', res: res, type: cancel.type }); }
            }
        });
    };
    settleFills();
    st.orders.slice().forEach(function(o){
        if (st.orders.indexOf(o) === -1){ return; }
        if (o.type === 'buyStop'){
            if (askPrice(st) < o.price){ return; }
            let avail = o.reserved + S.ocoin;
            let m = Math.min(o.lots, maxBuyLots(st, avail));
            if (m <= 0){
                removeOrder(st, o);
                S.ocoin += o.reserved;
                o.reserved = 0;
                notes.push({ kind: 'nofunds', res: res, type: o.type, lots: o.lots });
                return;
            }
            // Becomes a market buy now: pay with what was reserved for it, plus your free Ocoin if the book is thin
            S.ocoin += o.reserved;
            o.reserved = 0;
            let r = buyMarket(st, m);
            S.ocoin = Math.max(0, S.ocoin - r.cost);
            removeOrder(st, o);
            applyBracket(S, res, o, r.lots);
            notes.push({ kind: 'trigger', res: res, type: o.type, lots: r.lots, avg: r.lots > 0 ? r.cost / r.lots : 0, done: true, partial: r.lots < o.lots });
        }
        else if (o.type === 'sellLimit'){
            if (st.lots <= 0){
                removeOrder(st, o);
                let cancel = reduceOcoSibling(st, o, o.lots);
                notes.push({ kind: 'noholdings', res: res, type: o.type, lots: o.lots });
                if (cancel){ notes.push({ kind: 'ocoCancel', res: res, type: cancel.type }); }
            }
        }
        else if (o.type === 'sellStop'){
            if (bidPrice(st) > o.price){ return; }
            let m = Math.min(o.lots, st.lots);
            if (m <= 0){
                removeOrder(st, o);
                let cancel = reduceOcoSibling(st, o, o.lots);
                notes.push({ kind: 'noholdings', res: res, type: o.type, lots: o.lots });
                if (cancel){ notes.push({ kind: 'ocoCancel', res: res, type: cancel.type }); }
                return;
            }
            let r = sellMarket(st, m);
            if (r.lots <= 0){
                return;    // nobody is bidding at all right now: the stop stays and tries again next tick
            }
            S.ocoin += r.proceeds;
            removeOrder(st, o);
            let cancel = reduceOcoSibling(st, o, r.lots);
            notes.push({ kind: 'trigger', res: res, type: o.type, lots: r.lots, avg: r.proceeds / r.lots, done: true, partial: r.lots < o.lots });
            if (cancel){ notes.push({ kind: 'ocoCancel', res: res, type: cancel.type }); }
        }
    });
    settleFills();    // a stop that hit your own resting order
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
            // The part that is kept does not fit in the storage (Money is already full or nearly so): it would just be thrown
            // away by the cap, so it is converted into Ocoin as well and the Money rate shown drops accordingly.
            if (money.max >= 0 && money.amount > money.max){
                let extra = money.amount - money.max;
                money.amount = money.max;
                money.delta -= extra;
                move += extra;
                gained = moneyToOcoin(move);
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

// Money the storage cap threw away this tick (`lost`) is converted into Ocoin, whether or not Auto Convert is on: otherwise it
// is simply gone. Used when Auto is off, and when Auto is on but had nothing to convert (income below the amount you keep while
// Money is full). `natural` is the Money income of the tick and `lost` the part of it the cap cut off; money.amount is already
// clamped, so only money.delta changes: the Money rate shown becomes the rate you actually end up with (0 while Money is full).
export function capOverflowStep(S, money, natural, lost){
    let out = { kind: 'none', money: 0, ocoin: 0 };
    if (!isFinite(natural) || !isFinite(lost) || !(lost > 0)){
        return out;
    }
    let left = natural - lost;
    // With a huge income `natural` and `lost` are enormous and almost equal, so their difference is only rounding noise
    money.delta = Math.abs(left) <= 1e-12 * Math.abs(natural) ? 0 : money.delta - natural + left;
    let gained = moneyToOcoin(lost);
    S.ocoin += gained;
    return { kind: 'overflow', money: lost, ocoin: gained };
}

// --- Gold Bar ------------------------------------------------------------------------------------------------------------
// A plain medium of exchange: 1 Gold Bar = GOLD_BAR_OCOIN Ocoin, no fee, whole bars only. The balance lives in
// global.settings.goldBars, which (unlike global.stocks.ocoin) is kept through every reset.
export const GOLD_BAR_OCOIN = 1000000;

export function goldBarCount(settings){
    let n = settings ? settings.goldBars : 0;
    return typeof n === 'number' && isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

// Most bars the current Ocoin balance can pay for.
export function maxGoldBarsFromOcoin(S){
    return S && S.ocoin > 0 ? Math.floor(S.ocoin / GOLD_BAR_OCOIN) : 0;
}

// Ocoin -> Gold Bar. Returns true when something was converted.
export function ocoinToGoldBars(S, settings, bars){
    bars = Math.floor(bars);
    if (!(bars >= 1) || bars > maxGoldBarsFromOcoin(S)){
        return false;
    }
    S.ocoin = Math.max(0, S.ocoin - bars * GOLD_BAR_OCOIN);
    settings.goldBars = goldBarCount(settings) + bars;
    return true;
}

// Gold Bar -> Ocoin. Returns true when something was converted.
export function goldBarsToOcoin(S, settings, bars){
    bars = Math.floor(bars);
    if (!(bars >= 1) || bars > goldBarCount(settings)){
        return false;
    }
    settings.goldBars = goldBarCount(settings) - bars;
    S.ocoin += bars * GOLD_BAR_OCOIN;
    return true;
}

// Aether -> prestige currency (Plasmid/Phage style): spend up to `qty` WHOLE Aether (limited to what you have) and get `rate` of the
// currency per Aether. `decimals` is how many decimals the game keeps for that currency (Dark Energy 3, Harmony Crystal 2), so the
// stored count is rounded the same way the resets do. Returns null when nothing can be bought, else { aether, count, spent }.
export function aetherBuyPrestige(aether, count, rate, qty, decimals){
    let have = Math.floor(Number(aether));
    let convert = Math.min(Number(qty), have);
    if (!(convert > 0) || !isFinite(convert) || !(rate > 0)){
        return null;
    }
    let next = parseFloat((Number(count || 0) + convert * rate).toFixed(decimals));
    return { aether: Number(aether) - convert, count: next, spent: convert };
}

// How many Aether one click on a prestige-currency buy button really spends: the multiplier (x1/x10/x25/x100...), limited to the
// whole Aether you have, and at least 1 so a button you cannot afford still shows its base price. The button text and tooltip show
// this number; the purchase itself (aetherBuyPrestige and the Plasmid/Phage buttons) uses the same min(multiplier, whole Aether).
export function aetherBuyCount(aether, mult){
    let have = Math.floor(Number(aether));
    let m = Number(mult) > 0 ? Number(mult) : 1;
    return have >= 1 ? Math.min(m, have) : 1;
}


// Order book stock: perilaku market harus IDENTIK walau implementasi dioptimasi (scan book, own levels, topUp, dst).
// Skenario deterministik (RNG seeded): 12 stock dengan harga fair dari 2 sampai 1e9, 500 tick, dan di sela-selanya
// buy/sell market, semua jenis order (limit/stop), cancel, quote, bookLevels. Hash seluruh state + log dibandingkan dengan
// hash dari implementasi SEBELUM optimasi. Kalau perilaku market sengaja diubah, perbarui EXPECTED (hasil run ini).
// Juga mengecek order book ditandai non-reaktif untuk Vue (__v_skip), tidak ikut tersimpan, dan dipasang lagi setelah load.
// Pakai: node test/stock-book-equiv.mjs
import crypto from 'node:crypto';
import * as core from '../src/stocks/stocks_core.js';

const EXPECTED = '717852b6506b08ce6b3d7f5708e88b89bd0c7999e150e871cd1131f371c771b3';
let ok = true;
function check(label, good){
    console.log(`${good ? 'OK    ' : 'GAGAL '} ${label}`);
    if (!good){ ok = false; }
}

function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rand = mulberry32(12345);
Math.random = rand;   // settleOrders -> buyMarket/sellMarket memakai Math.random bawaan

const fairs = [2, 7, 25, 90, 400, 3000, 5e4, 1e6, 3e7, 1e9, 15, 250];
const market = {};
fairs.forEach((f, i) => { market['R' + i] = core.warmUp(core.newStock({ res: 'R' + i, fair: f }, rand), 150, rand); });
const S = { ocoin: 1e18, oid: 0, market };
const keys = Object.keys(market);
const log = [];
const types = core.ORDER_TYPES;

for (let t = 0; t < 500; t++){
    core.stepMarket(market, rand);
    core.settleAllOrders(S);
    if (t % 3 === 0){
        let res = keys[Math.floor(rand() * keys.length)];
        let st = market[res];
        let act = Math.floor(rand() * 7);
        if (act <= 2){
            let type = types[Math.floor(rand() * 4)];
            let base = (type === 'buyLimit' || type === 'sellStop') ? core.bidPrice(st) : core.askPrice(st);
            let price = base * (0.7 + rand() * 0.6);
            let lots = 1 + Math.floor(rand() * 200 * Math.max(1, st.fair / 100));
            if (type === 'sellLimit' || type === 'sellStop'){ lots = Math.min(lots, st.lots); }
            if (lots > 0){ log.push(JSON.stringify(core.placeOrder(S, res, type, price, lots).ok)); }
        }
        else if (act === 3){
            let n = Math.floor(rand() * 300 * Math.max(1, st.fair / 100));
            let r = core.buyMarket(st, n, rand); S.ocoin -= r.cost; log.push(r.lots + ':' + r.cost);
        }
        else if (act === 4){
            let n = Math.floor(rand() * 300 * Math.max(1, st.fair / 100));
            let r = core.sellMarket(st, n, rand); S.ocoin += r.proceeds; log.push(r.lots + ':' + r.proceeds);
        }
        else if (act === 5 && st.orders.length){
            core.cancelOrder(S, res, st.orders[0].id);
        }
        else {
            log.push(JSON.stringify([core.buyQuote(st, 500), core.sellQuote(st, 50), core.maxBuyLots(st, 1e6), core.bookLevels(st, 'ask', 5), core.bookLevels(st, 'bid', 5), core.askPrice(st), core.bidPrice(st)]));
        }
    }
}
const h = crypto.createHash('sha256');
h.update(JSON.stringify(market)); h.update(log.join('|')); h.update(String(S.ocoin) + ':' + S.oid);
const got = h.digest('hex');
check(`state market + log identik dengan implementasi sebelum optimasi (${got.slice(0, 12)}...)`, got === EXPECTED);
check('scenario benar-benar memakai order dan posisi (bukan skenario kosong)', keys.reduce((a, k) => a + market[k].orders.length, 0) > 0 && keys.reduce((a, k) => a + market[k].lots, 0) > 0);

// Book non-reaktif untuk Vue: ada flag, tidak ikut JSON, dan dipasang lagi oleh upgradeStock setelah load.
let st0 = market.R3;
check('asks/bids ditandai __v_skip (Vue tidak membuat getter/setter per level)', st0.asks.__v_skip === true && st0.bids.__v_skip === true);
check('flag __v_skip tidak ikut tersimpan (tidak enumerable)', !JSON.stringify(st0).includes('__v_skip') && !Object.keys(st0.asks).includes('__v_skip'));
let loaded = JSON.parse(JSON.stringify(st0));
check('setelah load flag hilang', loaded.asks.__v_skip === undefined);
core.upgradeStock(loaded, rand);
check('upgradeStock memasang flag lagi, isi book tetap sama', loaded.asks.__v_skip === true && loaded.bids.__v_skip === true && JSON.stringify(loaded.asks) === JSON.stringify(st0.asks) && JSON.stringify(loaded.bids) === JSON.stringify(st0.bids));
let fresh = core.newStock({ fair: 50 }, rand);
check('stock baru langsung non-reaktif', fresh.asks.__v_skip === true && fresh.bids.__v_skip === true);

// Cache harga per level: harus selalu sama dengan rumus langsung, termasuk level non-bulat/negatif/besar dan step yang berganti.
let cacheOk = true;
for (const fair of [0.5, 2, 7.3, 25, 400, 3e4, 1e9]){
    const probe = core.newStock({ fair }, rand);
    for (const k of [0, 1, 2, 17, 499, 500, 501, 4999, 99999, 100000, 100001, 250000, 1.5, -3, NaN]){
        const want = +(k * core.stepOf(probe)).toPrecision(12);
        const a = core.priceAtLevel(probe, k);
        const b = core.priceAtLevel(probe, k);    // kedua kali lewat cache
        if (!(Object.is(a, want) && Object.is(b, want))){ cacheOk = false; }
    }
}
check('priceAtLevel (cache) sama dengan rumus langsung untuk semua level/step', cacheOk);

process.exit(ok ? 0 : 1);

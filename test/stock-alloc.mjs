// Lot stock dibagi: tiap lot cuma dapat SATU bonus (produksi ATAU storage), diatur lewat st.storeLots.
// Cek: (1) save lama (tanpa storeLots) -> semua lot di produksi; (2) bonus produksi cuma dari lot produksi, bonus storage
// cuma dari lot storage, dan max storage di game benar-benar berubah; (3) clamp setStorageLots; (4) jual lot mengurangi
// lot produksi dulu, storeLots baru ikut turun kalau total lot < alokasi.
// Pakai: node test/stock-alloc.mjs <fixture>
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const [fx = 'user-save-1'] = process.argv.slice(2);
seedMathRandom(12345); setFixedNow(1735689600000);
global.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, 'fixtures', fx + '.json'), 'utf8')).save);
const { global: G, tmp_vars, atrack } = await import('../src/core/vars.js');
const { execGameLoops } = await import('../src/main.js');
const { modRes } = await import('../src/functions/functions.js');
const core = await import('../src/stocks/stocks_core.js');
const { initStocks } = await import('../src/stocks/stocks.js');
const { stockFlags, storageLots, productionLots, setStorageLots, executeSell, upgradeStock } = core;
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(5);
atrack.t = 0; G.settings.at = 0;

let ok = true;
function check(label, got, want){
    const good = typeof want === 'number' ? Math.abs(got - want) < 1e-9 : got === want;
    console.log(`${good ? 'OK    ' : 'GAGAL '} ${label}: ${got} (harapan ${want})`);
    if (!good) ok = false;
}

// (1) save lama: field storeLots belum ada -> default 0 (semua produksi)
const res = 'Copper', st = G.stocks.market[res];
delete st.storeLots; st.lots = 50;
upgradeStock(st);
check('save lama: storeLots default', st.storeLots, 0);
check('save lama: lot produksi', productionLots(st), 50);
check('save lama: lot storage', storageLots(st), 0);
// Seperti game: initStocks() dipanggil saat tick/tab stocks, dan dia yang memigrasi semua stock di save lama
for (const v of Object.values(G.stocks.market)) delete v.storeLots;
initStocks();
for (const [k, v] of Object.entries(G.stocks.market)) { if (v.storeLots !== 0) { ok = false; console.log('GAGAL stock tanpa storeLots=0 setelah initStocks:', k, v.storeLots); } }
console.log('OK     semua stock punya storeLots=0 setelah initStocks (' + Object.keys(G.stocks.market).length + ' stock)');

// (3) clamp
st.lots = 1000;
check('set -5 -> 0', setStorageLots(st, -5), 0);
check('set 5000 -> lots', setStorageLots(st, 5000), 1000);
check('set NaN -> 0', setStorageLots(st, NaN), 0);
check('set "abc" -> 0', setStorageLots(st, 'abc'), 0);
check('set 12.9 -> 12', setStorageLots(st, 12.9), 12);
check('set "300" -> 300', setStorageLots(st, '300'), 300);
check('produksi + storage = total', productionLots(st) + storageLots(st), 1000);

// (2) bonus produksi cuma dari lot produksi: 1000 lot, 300 storage -> 700 produksi = +70%
const r = G.resource[res];
function produce(storeLots){
    st.lots = 1000; setStorageLots(st, storeLots);
    r.amount = 0; r.max = 1e12; tmp_vars.resource[res].temp_max = 1e12; r.delta = 0;
    stockFlags.prod = true; modRes(res, 10); stockFlags.prod = false;
    return r.amount;
}
check('produksi, 0 lot storage (1000 produksi = +100%)', produce(0), 20);
check('produksi, 300 lot storage (700 produksi = +70%)', produce(300), 17);
check('produksi, semua lot storage (+0%)', produce(1000), 10);

// (2b) max storage di game: cuma naik kalau lot ditaruh di storage
function maxWith(lots, storeLots){
    st.lots = lots; setStorageLots(st, storeLots);
    execGameLoops(40);
    return r.max;
}
const base = maxWith(0, 0);
const prodOnly = maxWith(100, 0);
const storeAll = maxWith(100, 100);
console.log(`max storage ${res}: tanpa lot=${base}, 100 lot produksi=${prodOnly}, 100 lot storage=${storeAll}`);
check('100 lot di produksi tidak menambah max storage', prodOnly, base);
if (!(storeAll > base)) { ok = false; console.log('GAGAL 100 lot di storage harusnya menaikkan max storage'); } else { console.log('OK     100 lot di storage menaikkan max storage'); }

// (4) jual
st.lots = 1000; setStorageLots(st, 300); st.spent = 1000;
executeSell(st, 100);
check('jual 100 (produksi dulu): lots', st.lots, 900);
check('jual 100 (produksi dulu): storeLots tetap', st.storeLots, 300);
executeSell(st, 700);
check('jual 700 lagi: lots', st.lots, 200);
check('jual 700 lagi: storeLots ikut turun', st.storeLots, 200);
executeSell(st, 200);
st.lots += 0; 
check('jual habis: storeLots 0', st.storeLots, 0);
core.executeBuy(st, 5);
check('beli lagi sesudah jual habis: lot storage tidak "hidup" lagi', storageLots(st), 0);

console.log(ok ? 'OK' : 'GAGAL');
process.exit(ok ? 0 : 1);

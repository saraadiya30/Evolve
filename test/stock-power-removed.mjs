// Stock Power (Wattbridge Grid Holdings) sudah dihapus: Watt sekarang dari Deuterium Power Plant. Dicek:
//  1. Power tidak ada lagi di daftar company (SPECIAL_STOCKS dan liveStockDefs), konstanta bonusnya juga hilang;
//  2. save lama yang masih punya stocks.market.Power: lot dibuang, Ocoin yang terkunci di buy order dikembalikan,
//     pilihan/form yang menunjuk Power dibersihkan, company lain tidak tersentuh;
//  3. lot Power lama tidak lagi menambah listrik.
// Pakai: node test/stock-power-removed.mjs [fixture]
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const [fx = 'user-save-1'] = process.argv.slice(2);
seedMathRandom(12345); setFixedNow(1735689600000);
global.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, 'fixtures', fx + '.json'), 'utf8')).save);
const { global: G } = await import('../src/core/vars.js');
const { execGameLoops } = await import('../src/main.js');
const stocks = await import('../src/stocks/stocks.js');
const core = await import('../src/stocks/stocks_core.js');
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(5);

let ok = true;
function check(label, cond, extra = ''){
    console.log(`${cond ? 'OK    ' : 'GAGAL '} ${label}${cond ? '' : ' ' + extra}`);
    if (!cond) ok = false;
}

check('SPECIAL_STOCKS tanpa Power', !core.SPECIAL_STOCKS.some((d) => d.res === 'Power'));
check('POWER_BONUS_PER_LOT sudah dihapus', core.POWER_BONUS_PER_LOT === undefined);
check('liveStockDefs tanpa Power', !stocks.liveStockDefs().some((d) => d.res === 'Power'));
check('Power bukan special stock', stocks.isSpecial('Power') === false);

// save lama: ada company Power dengan 40 lot dan buy order yang mengunci 250 Ocoin
stocks.initStocks();
const before = G.stocks.ocoin;
const morale = G.stocks.market.Morale ? G.stocks.market.Morale.lots : undefined;
G.stocks.market.Power = { fair: 90, price: 90, lots: 40, storeLots: 0, orders: [{ id: 1, type: 'buyLimit', price: 80, lots: 5, total: 5, reserved: 250 }, { id: 2, type: 'sellLimit', price: 120, lots: 10, total: 10, reserved: 0 }] };
G.stocks.sel = 'Power';
G.stocks.form.res = 'Power';
stocks.initStocks();
check('company Power dibuang dari save', G.stocks.market.Power === undefined);
check(`Ocoin yang terkunci di buy order dikembalikan (${before} -> ${G.stocks.ocoin})`, Math.abs(G.stocks.ocoin - (before + 250)) < 1e-6);
check('pilihan company yang menunjuk Power dibersihkan', G.stocks.sel === '' && G.stocks.form.res === '');
check('company lain tidak tersentuh', G.stocks.market.Morale ? G.stocks.market.Morale.lots === morale : true);

// initStocks kedua kali tidak mengembalikan Ocoin lagi
const after = G.stocks.ocoin;
stocks.initStocks();
check('migrasi hanya berjalan sekali', G.stocks.ocoin === after);

console.log(ok ? 'LOLOS' : 'GAGAL');
process.exit(ok ? 0 : 1);

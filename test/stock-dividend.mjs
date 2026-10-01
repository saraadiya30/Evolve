// Stock Dividend (Compoundia Yield Trust): tiap lot menambah 0.1% dari Ocoin yang tersedia, sekali per hari game.
// Cek: (1) fungsi murni ocoinYield (1 lot, 1000 lot = +100%, input tidak valid = 0); (2) satu stockTick membayar sesuai
// lot yang dipegang dan tidak membayar kalau lot 0; (3) Ocoin yang terkunci di order beli tidak ikut dihitung (S.ocoin
// sudah dikurangi reserved); (4) isSpecial('Dividend') dan tidak ikut sistem alokasi produksi/storage.
// Pakai: node test/stock-dividend.mjs <fixture>
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
const core = await import('../src/stocks/stocks_core.js');
const stocks = await import('../src/stocks/stocks.js');
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(5);

let ok = true;
function check(label, got, want){
    const good = typeof want === 'number' ? Math.abs(got - want) <= Math.abs(want) * 1e-12 + 1e-12 : got === want;
    console.log(`${good ? 'OK    ' : 'GAGAL '} ${label}: ${got} (harapan ${want})`);
    if (!good) ok = false;
}

check('1 lot dari 1000 Ocoin', core.ocoinYield(1000, 1), 1);
check('1000 lot = +100% Ocoin', core.ocoinYield(1000, 1000), 1000);
check('lot 0', core.ocoinYield(1000, 0), 0);
check('Ocoin 0', core.ocoinYield(0, 500), 0);
check('Ocoin NaN', core.ocoinYield(NaN, 500), 0);
check('lot negatif', core.ocoinYield(1000, -5), 0);

stocks.initStocks();
const S = G.stocks;
check('Dividend terdaftar di market', !!S.market.Dividend, true);
check('Dividend termasuk stock spesial', stocks.isSpecial('Dividend'), true);

// Satu hari game tanpa lot: Ocoin tidak berubah
S.ocoin = 1000; S.market.Dividend.lots = 0;
stocks.stockTick();
check('tanpa lot, Ocoin tetap', S.ocoin, 1000);

// 100 lot = +10% sehari, hari berikutnya majemuk (+10% dari hasil baru)
S.ocoin = 1000; S.market.Dividend.lots = 100;
stocks.stockTick();
check('100 lot, hari 1', S.ocoin, 1100);
stocks.stockTick();
check('100 lot, hari 2 (majemuk)', S.ocoin, 1210);

// 1000 lot = Ocoin dobel dalam sehari
S.ocoin = 500; S.market.Dividend.lots = 1000;
stocks.stockTick();
check('1000 lot = dobel', S.ocoin, 1000);

// Alokasi produksi/storage tidak berlaku untuk Dividend
S.market.Dividend.lots = 10;
check('storageLots Dividend = 0', core.storageLots(S.market.Dividend), 0);

// Indikator net Ocoin per detik di header: Auto Convert + Compoundia (dibagi panjang hari game = 5 detik)
let f = core.ocoinFlowPerSecond(10000, true, 1000, 100, 5);
check('net: auto convert 10000 Money/s', f.auto, core.moneyToOcoin(10000));
check('net: Compoundia 100 lot dari 1000 Ocoin per detik', f.dividend, 20);
check('net: jumlah', f.net, core.moneyToOcoin(10000) + 20);
f = core.ocoinFlowPerSecond(-5000, true, 1000, 0, 5);
check('net: top-up dari Ocoin (defisit)', f.net, -5000 / core.OCOIN_RATE);
f = core.ocoinFlowPerSecond(10000, false, 1000, 0, 5);
check('net: Auto mati tidak dihitung', f.net, 0);
f = core.ocoinFlowPerSecond(NaN, true, 1000, 0, 5);
check('net: NaN aman', f.net, 0);

console.log(ok ? 'LOLOS' : 'GAGAL');
process.exit(ok ? 0 : 1);

// Bonus produksi stock (lot) tidak boleh ikut melipatgandakan trade route (impor barang / hasil jual ekspor).
// Cek 1: modRes dengan noStockBonus=true tidak kena bonus, modRes biasa tetap kena (produksi normal tidak berubah).
// Cek 2: kedua pemanggilan modRes di blok trade route memang mengirim flag itu.
// Pakai: node test/stock-trade-bonus.mjs <fixture>
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
const { stockFlags } = await import('../src/stocks/stocks_core.js');
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(5);
atrack.t = 0; G.settings.at = 0; // matikan accelerated time (timeScale) supaya yang diukur murni bonus lot

const res = 'Copper', r = G.resource[res];
const LOTS = 1000;                     // 1000 lot * 0.1% = +100% produksi
G.stocks.market[res].lots = LOTS;
let ok = true;
function run(label, call, expect){
    r.amount = 0; r.max = 1e12; tmp_vars.resource[res].temp_max = 1e12; r.delta = 0;
    stockFlags.prod = true; call(); stockFlags.prod = false;
    const good = Math.abs(r.amount - expect) < 1e-9;
    console.log(`${label}: dapat ${r.amount} (harapan ${expect}) ${good ? 'OK' : 'GAGAL'}`);
    if (!good) ok = false;
}
run('produksi biasa, bonus 100%', () => modRes(res, 10), 20);
run('trade route (noStockBonus)  ', () => modRes(res, 10, false, true), 10);

const src = readFileSync(join(__dirname, '..', 'src/loops/fast/fast_loop_unlocks_weather.js'), 'utf8');
const imp = /modRes\(res,routes \* \$ctx\.time_multiplier \* rate, false, true\);/.test(src);
const exp = /modRes\('Money', -\(price \* \$ctx\.time_multiplier\), false, true\);/.test(src);
console.log(`blok trade route mengirim flag: impor=${imp} ekspor=${exp}`);
if (!imp || !exp) ok = false;
console.log(ok ? 'OK' : 'GAGAL');
process.exit(ok ? 0 : 1);

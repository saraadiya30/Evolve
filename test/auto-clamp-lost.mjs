// Verifikasi: income Money per tick lebih besar dari kapasitas (max) tetap dikonversi penuh ke Ocoin.
// Income masuk lewat modRes (seperti produksi asli), lalu stockAutoTrade dipanggil seperti di fastLoop.
// Pakai: node test/auto-clamp-lost.mjs <fixture> <incomeBesarPerTick> <keepPerSec>
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const [fx = 'user-save-1', bigArg = '50000000', keepArg = '1000'] = process.argv.slice(2);
seedMathRandom(12345); setFixedNow(1735689600000);
global.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, 'fixtures', fx + '.json'), 'utf8')).save);
const { global: G, tmp_vars } = await import('../src/core/vars.js');
const { execGameLoops } = await import('../src/main.js');
const { modRes } = await import('../src/functions/functions.js');
const { stockAutoTrade } = await import('../src/stocks/stocks.js');
const { stockFlags, moneyToOcoin } = await import('../src/stocks/stocks_core.js');
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(5);
const M = G.resource.Money, big = Number(bigArg), keep = Number(keepArg), sec = 0.25;
G.settings.stockAutoOn = true; G.settings.stockAutoKeep = keep;
let ok = true;
for (let i = 0; i < 5; i++) {
  M.amount = 0.5 * M.max; M.delta = G.stocks.autoAdj; stockFlags.moneyLost = 0; // delta asli ikut membawa penyesuaian tick lalu
  tmp_vars.resource.Money.temp_max = M.max;
  const o0 = G.stocks.ocoin;
  modRes('Money', big);
  stockAutoTrade(M.delta, sec, stockFlags.moneyLost);
  const got = G.stocks.ocoin - o0;
  const expect = moneyToOcoin(Math.min(big - keep * sec + 0, big)); // seluruh income di atas "keep" harus dikonversi
  const rel = Math.abs(got - expect) / expect;
  console.log(`tick ${i}: max=${M.max} income=${big} Ocoin dapat=${got.toFixed(1)} harapan=${expect.toFixed(1)} selisih=${(rel * 100).toFixed(4)}%`);
  if (!(rel < 1e-6)) ok = false;
}
process.exit(ok ? 0 : 1);

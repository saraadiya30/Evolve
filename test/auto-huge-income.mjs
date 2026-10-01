// Income Money raksasa lewat jalur asli: modRes (kena kapasitas) -> diffCalc (auto-convert + Money/s yang tampil).
// Harapan: Money/s tampil = keep, Money tidak melompat acak, Ocoin yang didapat sesuai hitungan matematika murni.
// Pakai: node test/auto-huge-income.mjs <fixture> <incomePerSec> <keepPerSec>
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const [fx = 'user-save-1', incArg = '2e21', keepArg = '1000'] = process.argv.slice(2);
seedMathRandom(12345); setFixedNow(1735689600000);
global.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, 'fixtures', fx + '.json'), 'utf8')).save);
const { global: G, atrack, tmp_vars } = await import('../src/core/vars.js');
const { execGameLoops } = await import('../src/main.js');
const { modRes } = await import('../src/functions/functions.js');
const { diffCalc } = await import('../src/loops/long/long_loop.js');
const { S_loops: S } = await import('../src/core/registries.js');
const { stockFlags, moneyToOcoin } = await import('../src/stocks/stocks_core.js');
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(5);
atrack.t = 0; G.settings.at = 0;
const M = G.resource.Money, inc = Number(incArg), keep = Number(keepArg), sec = 0.25;
G.settings.stockAutoOn = true; G.settings.stockAutoKeep = keep; G.stocks.ocoin = 0;
let ok = true; const start0 = 0.3 * M.max;
for (let i = 0; i < 6; i++) {
  M.amount = start0; M.delta = 0; S.moneyStart = M.amount; S.moneyClampLost = 0; stockFlags.moneyLost = 0; stockFlags.prod = true;
  tmp_vars.resource.Money.temp_max = M.max;
  const o0 = G.stocks.ocoin;
  modRes('Money', inc * sec);
  diffCalc('Money', 250);
  stockFlags.prod = false;
  const got = G.stocks.ocoin - o0, expect = moneyToOcoin(inc * sec - keep * sec);
  const rel = Math.abs(got - expect) / expect;
  const amtOk = Math.abs(M.amount - (start0 + keep * sec)) < 1e-6 * M.max;
  console.log(`tick ${i}: Money/s=${M.diff} (harapan ${keep}) | amount=${M.amount} (harapan ${start0 + keep * sec}) | Ocoin selisih=${(rel * 100).toExponential(2)}%`);
  if (M.diff !== keep || !amtOk || !(rel < 1e-9)) ok = false;
}
console.log(ok ? 'OK' : 'GAGAL');
process.exit(ok ? 0 : 1);

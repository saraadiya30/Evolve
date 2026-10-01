// Reproduksi bug "Money mandek jauh di bawah max kalau produksi Money sangat besar" (auto-balance Money<->Ocoin).
// Income besar ditiru dengan menambah Money.amount dan Money.delta langsung sebelum tiap tick (seperti modRes di dalam loop).
// Pakai: node test/auto-big-income.mjs <fixture> <incomeBesarPerTick> <keepPerSec> [tick]
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const [fx = 'user-save-1', bigArg = '500000', keepArg = '1000', nArg = '400'] = process.argv.slice(2);
seedMathRandom(12345); setFixedNow(1735689600000);
global.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, 'fixtures', fx + '.json'), 'utf8')).save);
const { global: G } = await import('../src/vars.js');
const { execGameLoops } = await import('../src/main.js');
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(5);
const M = G.resource.Money, big = Number(bigArg), keep = Number(keepArg);
G.settings.stockAutoOn = true; G.settings.stockAutoKeep = keep;
M.amount = 0.1 * M.max;
const traj = []; let ocoin0 = G.stocks.ocoin;
for (let i = 0; i < Number(nArg); i++) { M.amount += big; M.delta += big; execGameLoops(1); if (i % 50 === 49) traj.push(Math.round(M.amount / M.max * 1000) / 10 + '%'); }
const fin = M.amount / M.max;
const above = G.resource.Money.diff;
console.log(`income+${big}/tick keep=${keep}/s | max=${M.max} | amount akhir=${(fin * 100).toFixed(1)}% max | panel diff=${above} | Ocoin +${(G.stocks.ocoin - ocoin0).toFixed(1)}`);
console.log('lintasan tiap 50 tick:', traj.join(' '));
process.exit(fin >= 0.999 ? 0 : 1);

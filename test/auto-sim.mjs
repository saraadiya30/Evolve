// Simulasi auto-balance Money<->Ocoin. Pakai: node test/auto-sim.mjs <fixture> <keepPerSec|off> [periode]
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const [fx = 'user-save-1', keepArg = 'off', per = '200'] = process.argv.slice(2);
seedMathRandom(12345); setFixedNow(1735689600000);
if (fx !== 'new') global.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, 'fixtures', fx + '.json'), 'utf8')).save);
const { global: G } = await import('../src/core/vars.js');
const { execGameLoops } = await import('../src/main.js');
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(5); // warm up
const M = G.resource.Money;
if (keepArg !== 'off') { G.settings.stockAutoOn = true; G.settings.stockAutoKeep = Number(keepArg); }
else G.settings.stockAutoOn = false;
if (process.env.AMOUNT) M.amount = Number(process.env.AMOUNT) * M.max;
if (process.env.OCOIN) G.stocks.ocoin = Number(process.env.OCOIN);
const rows = [];
for (let i = 0; i < Number(per); i++) {
    execGameLoops(1);
    rows.push({ i, diff: M.diff, amount: M.amount, max: M.max, nat: G.stocks.autoNat, flow: G.stocks.autoFlow, adj: G.stocks.autoAdj, ocoin: G.stocks.ocoin });
}
const tail = rows.slice(-Number(per) / 2);
const avg = k => tail.reduce((a, r) => a + r[k], 0) / tail.length;
console.log(`keep=${keepArg} | Money diff(panel) rata2=${avg('diff').toFixed(2)} | autoNat=${avg('nat').toFixed(2)} | autoFlow=${avg('flow').toFixed(2)} | amount=${rows.at(-1).amount.toFixed(1)} max=${rows.at(-1).max} | ocoin=${rows.at(-1).ocoin.toFixed(3)}`);
if (process.env.VERBOSE) rows.slice(-8).forEach(r => console.log(JSON.stringify(r)));
process.exit(0);

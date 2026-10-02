// Money/s yang tampil di panel saat auto-balance aktif. Income per tick dibuat naik-turun sedikit (seperti game asli:
// trade route, pajak, pembulatan) lalu dicatat M.diff tiap tick. Dengan keep=K dan income di atas K, yang tampil harus ~K.
// Pakai: node test/auto-display.mjs <fixture> <incomePerSec> <keepPerSec> <noise%>
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const [fx = 'user-save-1', incArg = '12000', keepArg = '10000', noiseArg = '5'] = process.argv.slice(2);
seedMathRandom(12345); setFixedNow(1735689600000);
global.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, 'fixtures', fx + '.json'), 'utf8')).save);
const { global: G, atrack } = await import('../src/vars.js');
const { execGameLoops } = await import('../src/main.js');
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(5);
atrack.t = 0; G.settings.at = 0;
const M = G.resource.Money, inc = Number(incArg), keep = Number(keepArg), noise = Number(noiseArg) / 100;
G.settings.stockAutoOn = true; G.settings.stockAutoKeep = keep; G.stocks.ocoin = 1e12;
const pat = [0, 1, -1, 0.5, -0.5, 1, -1, 0, 0.7, -0.7];
const diffs = []; const amts = [];
for (let i = 0; i < 100; i++) {
    M.amount = 0.5 * M.max;
    const add = inc * 0.25 * (1 + noise * pat[i % pat.length]);
    M.amount += add; M.delta += add;
    execGameLoops(1);
    if (i >= 20) { diffs.push(M.diff); amts.push(M.amount); }
}
const mn = Math.min(...diffs), mx = Math.max(...diffs);
console.log(`income~${inc}/s keep=${keep}/s noise=${noiseArg}% | Money/s tampil: min=${mn} max=${mx} rata2=${(diffs.reduce((a, b) => a + b, 0) / diffs.length).toFixed(1)} | tick merah (<0): ${diffs.filter(d => d < 0).length} | amount: min=${Math.min(...amts)} max=${Math.max(...amts)} (storage max=${M.max})`);
process.exit(0);

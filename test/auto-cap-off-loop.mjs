// Sama dengan auto-cap-off.mjs, tapi lewat stockAutoTrade asli (modRes -> cap -> stockAutoTrade, seperti fastLoop):
// dengan Auto Convert MATI, income Money yang terpotong cap storage tetap jadi Ocoin dan Money/s yang tampil 0 saat penuh.
// Pakai: node test/auto-cap-off-loop.mjs [fixture]
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const fx = process.argv[2] || 'user-save-1';
seedMathRandom(12345); setFixedNow(1735689600000);
global.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, 'fixtures', fx + '.json'), 'utf8')).save);
const { global: G, tmp_vars } = await import('../src/core/vars.js');
const { execGameLoops } = await import('../src/main.js');
const { modRes } = await import('../src/functions/resource_mod.js');
const { stockAutoTrade } = await import('../src/stocks/stocks.js');
const { stockFlags, moneyToOcoin } = await import('../src/stocks/stocks_core.js');
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(5);
const M = G.resource.Money, sec = 0.25;
G.settings.stockAutoOn = false;
let ok = true;
const check = (name, cond) => { console.log(`${cond ? 'ok  ' : 'GAGAL'} ${name}`); if (!cond) ok = false; };
const near = (a, b) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
const run = (start, income) => {
    M.amount = start; M.delta = 0; stockFlags.moneyLost = 0;
    tmp_vars.resource.Money.temp_max = M.max;
    const o0 = G.stocks.ocoin;
    modRes('Money', income);
    stockAutoTrade(M.delta, sec, stockFlags.moneyLost, start);
    return G.stocks.ocoin - o0;
};
const income = M.max * 0.01 + 1000;
let got = run(M.max, income);
check('penuh: income dikonversi ke Ocoin walau Auto mati', near(got, moneyToOcoin(income)));
check('penuh: Money tetap di max dan Money/tick 0', M.amount === M.max && M.delta === 0);
const room = income / 4;
got = run(M.max - room, income);
check('hampir penuh: hanya kelebihan yang jadi Ocoin', near(got, moneyToOcoin(income - room)));
check('hampir penuh: Money/tick = sisa ruang', near(M.delta, room) && M.amount === M.max);
got = run(0.5 * M.max, income);
check('belum penuh: tidak ada konversi', got === 0 && near(M.delta, income));
process.exit(ok ? 0 : 1);

// Accelerated time (boost 2x) berakhir di tengah sesi: pastikan (1) produksi per tick 2x selama boost lalu 1x, (2) hari game maju
// 2x lebih cepat selama boost, (3) saat boost habis loop CUMA dijadwalkan ulang ('period', tanpa stop/start dan tanpa membuang timer worker),
// (4) settings.at dan atrack.t jadi 0, (5) tidak ada lonjakan waktu satu tick di sekitar transisi.
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
globalThis.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, 'fixtures', 'user-save-1.json'), 'utf8')).save);
seedMathRandom(1); setFixedNow(1735689600000);
const { global: G, atrack, webWorker } = await import('../src/core/vars.js');
const { execGameLoops } = await import('../src/main.js');
seedMathRandom(1); setFixedNow(1735689600000);

// Worker palsu: merekam pesan yang dikirim game ke timer worker.
const messages = [];
webWorker.w = { postMessage: (m) => messages.push(m) };
webWorker.s = true;
G.settings.pause = false;
// Cari resource yang produksinya positif dan jauh dari batas maks, supaya rasio produksi bisa diukur tanpa clamp.
execGameLoops(12);
const gains = {};
for (const k of Object.keys(G.resource)) { const r = G.resource[k]; if (r && r.display && r.max > 0 && k !== 'Money') gains[k] = [r.amount]; }
execGameLoops(6);
let pick = null, best = 0;
for (const k of Object.keys(gains)) { const r = G.resource[k]; const d = (r.amount - gains[k][0]) / 6; if (d > best && r.amount < r.max * 0.5) { best = d; pick = k; } }
if (!pick) { console.log('GAGAL: tidak ada resource dengan produksi positif di fixture'); process.exit(1); }
const res = G.resource[pick];
// atrack.t dihitung dalam HARI game (turun 1 tiap longLoop), bukan tick. 3 hari = ~30 tick nyata karena 1 tick boost = 2 langkah loop.
const BOOST_DAYS = 3;
G.settings.at = BOOST_DAYS; atrack.t = BOOST_DAYS;
const BOOST_TICKS_MAX = 60;
const rows = [];
let ok = true;
const fail = (m) => { ok = false; console.log('GAGAL: ' + m); };

// 150 tick: boost (3 hari game) lalu normal
let endTick = -1;
for (let i = 0; i < 150; i++) {
    const dayBefore = G.city.calendar.day, boostBefore = atrack.t > 0;
    const foodBefore = res.amount;
    const t0 = process.hrtime.bigint();
    execGameLoops(1);
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    rows.push({ i, ms, gain: res.amount - foodBefore, boost: boostBefore, dayBefore, dayTick: G.city.calendar.day !== dayBefore });
    if (boostBefore && atrack.t === 0 && endTick < 0) endTick = i;
}
if (endTick < 0 || endTick > BOOST_TICKS_MAX) { fail(`boost tidak berakhir wajar (endTick=${endTick})`); endTick = Math.max(endTick, 1); }
// (1) produksi: rata-rata gain per tick selama boost harus ~2x gain normal (resource yang tak terkena clamp)
const avg = (a) => a.reduce((s, x) => s + x, 0) / Math.max(1, a.length);
const gBoost = avg(rows.filter((r) => r.boost && r.i > 1).map((r) => r.gain));
const gNorm = avg(rows.filter((r) => !r.boost && r.i > endTick + 3).map((r) => r.gain));
const ratio = gBoost / gNorm;
console.log(`${pick} per tick: boost ${gBoost.toFixed(3)} | normal ${gNorm.toFixed(3)} | rasio ${ratio.toFixed(3)}`);
if (!(ratio > 1.85 && ratio < 2.15)) fail(`rasio produksi boost/normal ${ratio.toFixed(3)} (harusnya ~2)`);
// (3) pesan ke worker: tepat satu 'period' (periode 250), tanpa clear/start
const periods = messages.filter((m) => m.loop === 'period'), other = messages.filter((m) => m.loop !== 'period');
console.log('pesan ke worker:', JSON.stringify(messages));
if (periods.length !== 1 || periods[0].period !== 250) fail(`harusnya tepat 1 pesan period=250, dapat ${JSON.stringify(periods)}`);
if (other.length) fail(`ada pesan selain period (restart timer): ${JSON.stringify(other)}`);
// (4) status akhir
if (G.settings.at !== 0 || atrack.t !== 0) fail(`at=${G.settings.at} atrack.t=${atrack.t}, harusnya 0`);
// (5) lonjakan waktu di tick transisi. Tick transisi SELALU tick hari game (boost dihitung per hari, jadi habisnya di longLoop),
// dan tick hari memang lebih berat dari tick biasa. Karena itu pembandingnya tick-hari lain, bukan median semua tick.
const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const dayTicks = rows.filter((r) => r.dayTick && r.i > 3 && r.i < endTick).map((r) => r.ms);
const plainTicks = rows.filter((r) => !r.dayTick && r.i > 3 && r.i < endTick).map((r) => r.ms);
const trans = rows[endTick];
const baseDay = med(dayTicks), basePlain = med(plainTicks);
console.log(`waktu tick: biasa ${basePlain.toFixed(2)} ms | tick hari (sebelum boost habis) ${baseDay.toFixed(2)} ms | tick transisi ${trans.ms.toFixed(2)} ms (tick hari: ${trans.dayTick}) | tick sesudah transisi: ${rows.slice(endTick + 1, endTick + 4).map((r) => r.ms.toFixed(1)).join(', ')} ms`);
if (!trans.dayTick) console.log('catatan: tick transisi bukan tick hari (tidak biasa)');
if (trans.ms > Math.max(baseDay * 3, 40)) fail(`tick transisi ${trans.ms.toFixed(1)} ms jauh di atas tick hari biasa ${baseDay.toFixed(2)} ms`);
const after = Math.max(...rows.slice(endTick + 1, endTick + 4).map((r) => r.ms));
if (after > Math.max(basePlain * 4, 30)) fail(`tick SESUDAH transisi lambat: ${after.toFixed(1)} ms vs biasa ${basePlain.toFixed(2)} ms (stutter pasca-boost)`);
console.log(ok ? 'BOOST BERAKHIR MULUS' : 'BOOST BERAKHIR BERMASALAH');
process.exit(ok ? 0 : 1);

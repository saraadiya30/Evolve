// Autosave di longLoop dibatasi waktu nyata (AUTOSAVE_MIN_INTERVAL_MS): di speed tinggi tidak menyimpan tiap hari game,
// tapi saat pause selalu menyimpan, dan di speed normal (1 hari = 5 detik nyata) tetap sekali per hari game.
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
const { AUTOSAVE_MIN_INTERVAL_MS } = await import('../src/config/constants.js');
seedMathRandom(1);
atrack.t = 0; G.settings.at = 0; G.settings.pause = false; webWorker.s = true; webWorker.w = null;

let saves = 0;
const realSet = globalThis.localStorage.setItem.bind(globalThis.localStorage);
Object.getPrototypeOf(globalThis.localStorage).setItem = function (k, v) { if (k === 'evolved') saves++; return realSet(k, v); };

let ok = true;
const fail = (m) => { ok = false; console.log('GAGAL: ' + m); };
// Jam palsu: tiap tick nyata = 250 ms. Jumlah hari game per tick bergantung pada kecepatan (timeScale).
let now = 1735689600000;
const runTicks = (ticks, tickMs, perTickSteps) => {
    const startDays = G.stats.days; saves = 0;
    for (let i = 0; i < ticks; i++) { now += tickMs; setFixedNow(now); for (let k = 0; k < perTickSteps; k++) execGameLoops(1); }
    return { days: G.stats.days - startDays, saves, seconds: ticks * tickMs / 1000 };
};
// 1x: 400 tick x 250 ms = 100 detik nyata = ~20 hari game -> ~20 save (1 per hari, sama seperti dulu)
const normal = runTicks(400, 250, 1);
console.log(`speed 1x   : ${normal.seconds}s nyata, ${normal.days} hari game, ${normal.saves} save`);
if (normal.saves < normal.days - 1 || normal.saves > normal.days + 1) fail(`di 1x harusnya ~1 save per hari game (hari ${normal.days}, save ${normal.saves})`);
// Speed tinggi: 10 loop per tick nyata (setara 10x) -> ~10x lebih banyak hari game per detik nyata, tapi save tetap <= 1 per 5 detik
const fast = runTicks(120, 250, 10);
const maxSaves = Math.ceil(fast.seconds * 1000 / AUTOSAVE_MIN_INTERVAL_MS) + 1;
console.log(`speed ~10x : ${fast.seconds}s nyata, ${fast.days} hari game, ${fast.saves} save (batas ${maxSaves})`);
if (fast.days < 50) fail(`hari game terlalu sedikit untuk uji speed tinggi (${fast.days})`);
if (fast.saves * 5 > fast.days) fail(`save masih terlalu sering dibanding hari game (${fast.saves} save untuk ${fast.days} hari)`);
if (fast.saves > maxSaves) fail(`terlalu banyak save di speed tinggi: ${fast.saves} > ${maxSaves}`);
if (fast.saves < 1) fail('tidak ada save sama sekali di speed tinggi');
// Pause: harus menyimpan walau belum 5 detik sejak save terakhir
G.settings.pause = true; saves = 0;
for (let i = 0; i < 25 && saves === 0; i++) { now += 50; setFixedNow(now); webWorker.s = true; execGameLoops(1); }
console.log(`saat pause : ${saves} save`);
if (saves < 1) fail('saat pause tidak menyimpan');
console.log(ok ? 'AUTOSAVE TERBATAS DENGAN BENAR' : 'AUTOSAVE BERMASALAH');
process.exit(ok ? 0 : 1);

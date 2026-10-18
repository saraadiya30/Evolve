// Aether untuk game speed sekarang tidak menjalankan seluruh loop N kali: setiap period dihitung sebagai (percepatan waktu * boost)
// tick game, dipecah jadi chunk fast loop berukuran paling banyak MAX_FAST_SCALE (supaya aproksimasi "hitung sekali, kalikan N"
// tetap akurat). Cek: (1) planTickChunks (murni); (2) execGameLoops memecah chunk dengan benar dan jumlah tick tepat (dihitung dari
// roll anthropophagite, yang jalan sekali per tick game); (3) timeScale() di dalam chunk = ukuran chunk, dan kembali normal sesudahnya
// (juga kalau ada error); (4) hari game tidak hilang dan fase loopTick terjaga (tidak di-reset ke 0 di tengah siklus);
// (5) speedBoost tidak valid dipaksa jadi 1, dan batas maxLoopPeriods tetap berlaku.
// Pakai: node test/aether-speed-lean.mjs <fixture>
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const [fx = 'user-save-1'] = process.argv.slice(2);
seedMathRandom(12345); setFixedNow(1735689600000);
global.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, 'fixtures', fx + '.json'), 'utf8')).save);
const { global: G, webWorker, atrack } = await import('../src/core/vars.js');
const { execGameLoops } = await import('../src/main.js');
const { S_loops: S } = await import('../src/core/registries.js');
const { timeScale, baseTimeScale, TIME_ACCELERATION_FACTOR } = await import('../src/functions/resource_mod.js');
const runner = await import('../src/loops/game_loop_runner.js');
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(5);

let ok = true;
function check(label, got, want){
    const good = got === want;
    console.log(`${good ? 'OK    ' : 'GAGAL '} ${label}: ${got} (harapan ${want})`);
    if (!good) ok = false;
}
const J = JSON.stringify;
const MAX = runner.MAX_FAST_SCALE;
const FACTOR = TIME_ACCELERATION_FACTOR;

// (1) planTickChunks
const plan = runner.planTickChunks;
check('MAX_FAST_SCALE sama dengan midRatio', MAX, webWorker.midRatio);
check('plan 1 tick', J(plan(1)), '[1]');
check('plan 2 tick (accelerated time saja)', J(plan(2)), '[2]');
check('plan tepat MAX', J(plan(MAX)), J([MAX]));
check('plan 5 tick', J(plan(5)), '[4,1]');
check('plan 10 tick', J(plan(10)), '[4,4,2]');
check('plan pecahan dibulatkan ke bawah', J(plan(7.9)), '[4,3]');
check('plan 0 tick', J(plan(0)), '[]');
check('plan negatif', J(plan(-3)), '[]');
check('plan di bawah 1 tick', J(plan(0.5)), '[]');
check('plan NaN', J(plan(NaN)), '[]');
check('plan maxChunk kustom', J(plan(10, 3)), '[3,3,3,1]');
check('plan maxChunk tidak valid', J(plan(5, 0)), '[]');
let conserved = true;
for (let t = 1; t <= 200; t++){
    const c = plan(t);
    if (c.reduce((a, b) => a + b, 0) !== t || Math.max(...c) > MAX || Math.min(...c) < 1){ conserved = false; }
}
check('jumlah chunk selalu = total, tiap chunk 1..MAX (1..200 tick)', conserved, true);

// Penghitung: tiap roll anthropophagite = satu tick game; nilai timeScale() saat roll = ukuran chunk-nya
const realRand = Math.rand;
G.race.anthropophagite = 1;
function keepSpecies(){ G.resource[G.race.species].amount = Math.max(G.resource[G.race.species].amount, 1000); }
function run(periods, boost, accelerated){
    const seen = {};
    let rolls = 0;
    Math.rand = (a, b) => { if (b === 400){ rolls++; const s = timeScale(); seen[s] = (seen[s] || 0) + 1; } return 1; };
    atrack.t = accelerated ? 100000 : 0;
    keepSpecies();
    try { execGameLoops(periods, boost); } finally { Math.rand = realRand; }
    return { rolls, seen };
}
// jumlah chunk per ukuran = (berapa kali nilai itu terlihat) / ukuran
function chunkCounts(seen){
    const out = {};
    Object.keys(seen).forEach(k => { out[k] = seen[k] / Number(k); });
    return J(out);
}

// (2) pemecahan chunk di runner nyata
let r = run(1, 1, false);
check('tanpa boost, tanpa percepatan: 1 tick, 1 chunk', r.rolls + ' ' + chunkCounts(r.seen), '1 {"1":1}');
r = run(1, 1, true);
check(`hanya percepatan waktu (${FACTOR}x): 1 chunk seukuran faktor, sama seperti dulu`, r.rolls + ' ' + chunkCounts(r.seen), `${FACTOR} {"${FACTOR}":1}`);
r = run(1, 10, false);
check('boost 10: 10 tick = chunk 4,4,2', r.rolls + ' ' + chunkCounts(r.seen), '10 {"2":1,"4":2}');
r = run(1, 100, false);
check('boost 100: 100 tick = 25 chunk berukuran 4', r.rolls + ' ' + chunkCounts(r.seen), '100 {"4":25}');
r = run(3, 4, false);
check('3 period dengan boost 4: 12 tick, 3 chunk berukuran 4', r.rolls + ' ' + chunkCounts(r.seen), '12 {"4":3}');
r = run(1, 3, true);
check(`percepatan (${FACTOR}x) + boost 3: ${FACTOR * 3} tick dalam chunk berukuran <= ${MAX}`, r.rolls, FACTOR * 3);
check('tidak ada chunk yang melebihi MAX_FAST_SCALE', Math.max(...Object.keys(r.seen).map(Number)) <= MAX, true);

// (3) timeScale() di luar chunk, juga setelah error
atrack.t = 0;
check('timeScale() di luar chunk (tanpa percepatan)', timeScale(), 1);
atrack.t = 100000;
check('timeScale() di luar chunk (dipercepat)', timeScale(), baseTimeScale());
r = run(1, 10, false);
check('timeScale() kembali normal setelah run dengan boost', timeScale(), 1);
atrack.t = 0;
let threw = false;
Math.rand = (a, b) => { if (b === 400){ throw new Error('uji: error di tengah chunk'); } return 1; };
keepSpecies();
try { execGameLoops(1, 10); } catch (e){ threw = true; } finally { Math.rand = realRand; }
check('error di dalam chunk tetap diteruskan', threw, true);
check('timeScale() kembali normal walau ada error di chunk', timeScale(), 1);

// (4) hari game tidak hilang, fase loopTick terjaga
function days(from, fn){
    G.city.calendar.day = from;
    fn();
    return G.city.calendar.day - from;
}
Math.rand = () => 1;
keepSpecies();
atrack.t = 100000;
S.loopTick = 0;
check(`${FACTOR}x * boost 3 * 20 period = ${FACTOR * 3 * 20} tick: tepat ${FACTOR * 3} hari`, days(1, () => execGameLoops(20, 3)), (FACTOR * 3 * 20) / webWorker.longRatio);
check('loopTick kembali ke awal siklus setelah kelipatan penuh', S.loopTick, 0);
S.loopTick = 0;
const total = FACTOR * 5 * 13;
check(`${total} tick: hari = floor(${total} / ${webWorker.longRatio})`, days(1, () => execGameLoops(13, 5)), Math.floor(total / webWorker.longRatio));
check('loopTick menyimpan sisa tick (fase tidak hilang)', S.loopTick, total % webWorker.longRatio);
atrack.t = 0;
S.loopTick = webWorker.longRatio - 4;
check('boost 8 tanpa percepatan melewati satu batas hari', days(1, () => execGameLoops(1, 8)), 1);
check('loopTick menyimpan sisa setelah batas hari', S.loopTick, 4);
Math.rand = realRand;

// (5) speedBoost tidak valid dan batas per panggilan
r = run(1, 0, false);  check('boost 0 dianggap 1', r.rolls, 1);
r = run(1, -5, false); check('boost negatif dianggap 1', r.rolls, 1);
r = run(1, NaN, false); check('boost NaN dianggap 1', r.rolls, 1);
r = run(1, undefined, false); check('boost undefined dianggap 1', r.rolls, 1);
r = run(1, 2.7, false); check('boost pecahan dibulatkan ke bawah', r.rolls, 2);
r = run(1000, 1, false);
check('periods dibatasi maxLoopPeriods()', r.rolls, runner.maxLoopPeriods());

delete G.race.anthropophagite;
atrack.t = 0;
console.log(ok ? 'LOLOS' : 'GAGAL');
process.exit(ok ? 0 : 1);

// Percepatan waktu (atrack.t > 0, timeScale() = TIME_ACCELERATION_FACTOR): satu tick fast loop setara beberapa tick game,
// jadi peluang random di fast loop harus di-roll sebanyak itu (bukan sekali), dan batas mid/long yang terlewat tidak boleh hilang.
// Cek: (1) emfield: counter/discharge maju sebanyak timeScale; (2) roll kelaparan dan anthropophagite dipanggil sebanyak
// timeScale per tick; (3) runner menjalankan longLoop sebanyak batas yang terlewat (longRatio dikecilkan supaya satu tick
// melewati dua batas); (4) tanpa percepatan semuanya tetap 1x.
// Pakai: node test/accel-rolls.mjs <fixture>
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
const { fastLoopShipyardFuel } = await import('../src/loops/fast/fast_loop_shipyard_fuel.js');
const { TIME_ACCELERATION_FACTOR, timeScale } = await import('../src/functions/resource_mod.js');
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(5);

let ok = true;
function check(label, got, want){
    const good = got === want;
    console.log(`${good ? 'OK    ' : 'GAGAL '} ${label}: ${got} (harapan ${want})`);
    if (!good) ok = false;
}

const FACTOR = TIME_ACCELERATION_FACTOR;
const realRand = Math.rand;

// (1) emfield: tanpa roll yang berhasil (Math.rand tidak pernah 0), counter maju timeScale per tick
Math.rand = () => 1;
G.race.emfield = 1; G.race.discharge = 0;
atrack.t = 0;
fastLoopShipyardFuel({ time_multiplier: 0.25 });
check('emfield tanpa percepatan: +1', G.race.emfield, 2);
atrack.t = 1000;
check('timeScale() saat dipercepat', timeScale(), FACTOR);
G.race.emfield = 1; G.race.discharge = 0;
fastLoopShipyardFuel({ time_multiplier: 0.25 });
check(`emfield dipercepat: +${FACTOR}`, G.race.emfield, 1 + FACTOR);
G.race.emfield = 7; G.race.discharge = 10;
fastLoopShipyardFuel({ time_multiplier: 0.25 });
check(`discharge dipercepat: -${FACTOR}`, G.race.discharge, 10 - FACTOR);
// roll emfield berhasil di tick pertama: discharge = emfield, lalu sisa step menghabiskannya
Math.rand = (a, b) => (b === 500 ? 0 : 1);
G.race.emfield = 4; G.race.discharge = 0;
fastLoopShipyardFuel({ time_multiplier: 0.25 });
check('emfield: discharge mulai di step pertama, step berikutnya menguranginya', G.race.discharge, FACTOR > 1 ? (4 + 1) - (FACTOR - 1) : 5);
Math.rand = realRand;
delete G.race.emfield; delete G.race.discharge;

// (2) jumlah roll per tick: dihitung lewat pembungkus Math.rand
function countRolls(upper, accelerated){
    let n = 0;
    Math.rand = (a, b) => { if (b === upper){ n++; } return 1; };
    atrack.t = accelerated ? 1000 : 0;
    execGameLoops(1);
    Math.rand = realRand;
    return n;
}
G.race.anthropophagite = 1;
G.resource[G.race.species].amount = Math.max(G.resource[G.race.species].amount, 50);
check('roll anthropophagite per tick, tanpa percepatan', countRolls(400, false), 1);
G.resource[G.race.species].amount = Math.max(G.resource[G.race.species].amount, 50);
check(`roll anthropophagite per tick, dipercepat (${FACTOR}x)`, countRolls(400, true), FACTOR);
delete G.race.anthropophagite;

// (3) runner: satu tick yang melewati dua batas long loop harus menjalankan longLoop dua kali (satu hari game per batas)
const longRatioBefore = webWorker.longRatio;
const midRatioBefore = webWorker.midRatio;
webWorker.longRatio = 1; webWorker.midRatio = 1;
G.city.calendar.day = 1;
atrack.t = 0;
execGameLoops(1);
const d1 = G.city.calendar.day;
check('runner tanpa percepatan: +1 hari', d1, 2);
G.city.calendar.day = 1;
atrack.t = 1000;
execGameLoops(1);
check(`runner dipercepat: +${FACTOR} hari (tidak ada batas yang hilang)`, G.city.calendar.day, 1 + FACTOR);
webWorker.longRatio = longRatioBefore; webWorker.midRatio = midRatioBefore;
atrack.t = 0;

console.log(ok ? 'LOLOS' : 'GAGAL');
process.exit(ok ? 0 : 1);

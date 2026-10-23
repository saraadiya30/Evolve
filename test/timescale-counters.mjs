// Counter progres di fast loop harus maju sebanyak timeScale() per fast loop (percepatan waktu dan Aether speed), bukan 1.
// Cek: rekrut soldier (garrison.progress), repair Surveyor Carport, repair tembok Fortress, dan firestorm.
// Tiap counter diukur tanpa percepatan (1 tick), dengan percepatan waktu (2 tick), dan dengan Aether speed 4 (8 tick = 2 chunk),
// lalu hasilnya harus sebanding dengan jumlah tick game.
// Pakai: node test/timescale-counters.mjs <fixture>
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const [fx = 'user-save-1'] = process.argv.slice(2);
seedMathRandom(12345); setFixedNow(1735689600000);
global.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, 'fixtures', fx + '.json'), 'utf8')).save);
const { global: G, atrack } = await import('../src/core/vars.js');
const { execGameLoops } = await import('../src/main.js');
const { TIME_ACCELERATION_FACTOR } = await import('../src/functions/resource_mod.js');
const { S_loops: S } = await import('../src/core/registries.js');
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(5);

let ok = true;
function check(label, got, want){
    const good = Math.abs(got - want) < 1e-6;
    console.log(`${good ? 'OK    ' : 'GAGAL '} ${label}: ${got} (harapan ${want})`);
    if (!good) ok = false;
}

// Satu periode dengan setup tertentu: [percepatan waktu aktif?, Aether speed boost] -> jumlah tick game yang disimulasikan
const SCENARIOS = [
    { name: 'normal', accel: false, boost: 1, ticks: 1 },
    { name: 'percepatan waktu', accel: true, boost: 1, ticks: TIME_ACCELERATION_FACTOR },
    { name: 'Aether speed x4', accel: false, boost: 4, ticks: 4 },
    { name: 'percepatan + Aether x4', accel: true, boost: 4, ticks: 4 * TIME_ACCELERATION_FACTOR },
];

function run(sc){
    // Begin tiap periode di awal siklus long loop supaya tidak melewati batas hari (long loop butuh state perang penuh)
    S.loopTick = 0;
    atrack.t = sc.accel ? 1000 : 0;
    execGameLoops(1, sc.boost);
}

// Soldier: progress per tick harus sama, total sebanding dengan tick (rekrut selesai diabaikan: progress dijaga jauh dari 100)
const gar = G.civic.garrison;
let garPerTick = null;
for (const sc of SCENARIOS){
    gar.max = Math.max(gar.max, gar.workers + 1000);
    gar.progress = 0;
    run(sc);
    if (garPerTick === null){ garPerTick = gar.progress; }
    check(`soldier, ${sc.name}`, gar.progress / garPerTick, sc.ticks);
}

// Carport: repair maju 1 per tick game, dan damaged berkurang tiap repair() tercapai
G.portal.carport = { count: 5, damaged: 4, repair: 0 };
for (const sc of SCENARIOS){
    G.portal.carport.damaged = 4; G.portal.carport.repair = 0;
    run(sc);
    check(`carport repair, ${sc.name}`, G.portal.carport.repair, sc.ticks);
}
// repair() = 180 per unit: satu periode yang melewati batas harus mengurangi damaged dan menyisakan kelebihannya
G.portal.carport.damaged = 4; G.portal.carport.repair = 179;
run(SCENARIOS[3]);
check('carport: batas terlewat mengurangi damaged', G.portal.carport.damaged, 3);
check('carport: kelebihan tick tidak hilang', G.portal.carport.repair, SCENARIOS[3].ticks - 1);
G.portal.carport.damaged = 1; G.portal.carport.repair = 179;
run(SCENARIOS[3]);
check('carport: damaged habis, repair di-reset', G.portal.carport.repair, 0);

// Fortress: repair maju 1 per tick game (Stone cukup), walls naik bila batas terlewat
// (fixture belum punya fortress: dibuat dengan bentuk yang sama seperti saat tech-nya diselesaikan)
if (!G.portal.fortress){
    G.portal.fortress = { threat: 10000, garrison: 0, walls: 100, repair: 0, patrols: 0, patrol_size: 10, siege: 999, notify: 'Yes', s_ntfy: 'Yes', nocrew: false };
}
G.resource.Stone.display = true;
G.resource.Stone.max = 1e15;
for (const sc of SCENARIOS){
    G.portal.fortress.walls = 50; G.portal.fortress.repair = 0; G.resource.Stone.amount = 1e14;
    run(sc);
    check(`fortress repair, ${sc.name}`, G.portal.fortress.repair, sc.ticks);
}
// repair() = 200 per dinding: batas terlewat menaikkan walls dan menyisakan kelebihannya; walls penuh me-reset repair
G.portal.fortress.walls = 50; G.portal.fortress.repair = 199; G.resource.Stone.amount = 1e14;
run(SCENARIOS[3]);
check('fortress: batas terlewat menaikkan walls', G.portal.fortress.walls, 51);
check('fortress: kelebihan tick tidak hilang', G.portal.fortress.repair, SCENARIOS[3].ticks - 1);
G.portal.fortress.walls = 99; G.portal.fortress.repair = 199; G.resource.Stone.amount = 1e14;
run(SCENARIOS[3]);
check('fortress: walls penuh, repair di-reset', G.portal.fortress.repair, 0);
check('fortress: walls tidak melebihi 100', G.portal.fortress.walls, 100);

// Firestorm: berkurang 1 per tick game, tidak negatif
G.city.firestorm = 100;
for (const sc of SCENARIOS){
    G.city.firestorm = 100;
    run(sc);
    check(`firestorm, ${sc.name}`, G.city.firestorm, 100 - sc.ticks);
}
G.city.firestorm = 1;
run(SCENARIOS[3]);
check('firestorm tidak negatif', G.city.firestorm, 0);

atrack.t = 0;
console.log(ok ? 'LOLOS' : 'GAGAL');
process.exit(ok ? 0 : 1);

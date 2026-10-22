// Alchemy dengan alokasi per detik LEBIH BESAR dari storage Mana harus tetap menghasilkan sebesar alokasi (selama produksi cukup),
// di kecepatan normal maupun dipercepat (satu fast loop = beberapa tick). Dulu: output terpotong jadi storage/alokasi,
// karena alokasi per detik dibandingkan langsung dengan jumlah Mana di storage, dan produksi Mana tick itu belum bisa dipakai.
// Pakai: node test/alchemy-mana-cap.mjs
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync } from 'node:fs';

seedMathRandom(12345);
setFixedNow(1735689600000);
global.localStorage.setItem('evolved', JSON.parse(readFileSync(new URL('./fixtures/user-save-1.json', import.meta.url), 'utf8')).save);
const { global: G, atrack } = await import('../src/core/vars.js');
const { execGameLoops } = await import('../src/main.js');
const core = await import('../src/stocks/stocks_core.js');
const { tradeRatio } = await import('../src/config/constants.js');
seedMathRandom(12345);
setFixedNow(1735689600000);
execGameLoops(5);

G.race.universe = 'magic';
G.tech.alchemy = 2;
G.race.alchemy = {};
G.race.casting = {};
G.resource.Mana.display = true;
G.resource.Crystal.display = true;
G.resource.Copper.max = 1e15;
G.resource.Iron.max = 1e15;
G.stocks.market.Iron.lots = 0;
G.city.pylon = { count: 125, on: 125 };
G.stocks.market.Mana = core.newStock({ fair: 50 }, Math.random);
G.stocks.market.Mana.lots = 560000;
G.stocks.market.Copper.lots = 0;

const run = (accel, boost) => {
    atrack.t = accel ? 1e9 : 0;
    G.settings.at = accel ? 1e9 : 0;
    G.resource.Crystal.amount = G.resource.Crystal.max;
    execGameLoops(1, boost);
};
for (let i = 0; i < 6; i++){
    run(true, 2);
}
const surplus = G.resource.Mana.diff;
const cap = G.resource.Mana.max;
const rateOf = (res) => (G.resource[res].basic && G.tech.alchemy >= 2) ? tradeRatio[res] * 8 : tradeRatio[res] * 2;
const each = Math.floor(cap * 0.9);
// skenario A: satu resource, alokasi 2x cap. skenario B: dua resource, masing-masing di bawah cap tapi total di atas cap
const scenarios = [
    ['1 resource (alokasi 2x cap)', { Copper: Math.floor(surplus * 0.97) }],
    ['2 resource (tiap alokasi < cap, total > cap)', { Copper: each, Iron: each }],
];
let ok = true;
console.log(`surplus ${surplus.toFixed(0)}/s, cap Mana ${cap}`);
for (const [name, alloc] of scenarios){
    const total = Object.values(alloc).reduce((a, b) => a + b, 0);
    if (total < cap * 1.5 || total > surplus * 0.98){
        console.log(`GAGAL skenario "${name}" tidak valid: total alokasi ${total} harus 1,5x cap tapi di bawah surplus`);
        process.exit(1);
    }
    console.log(`\n${name}: alokasi ${JSON.stringify(alloc)} (total ${total}/s = ${(total / cap).toFixed(2)}x cap)`);
    for (const [label, accel, boost] of [['normal x1', false, 1], ['x2', true, 1], ['x4', true, 2], ['x10', true, 5]]){
        let worst = Infinity;
        for (let i = 0; i < 6; i++){
            G.race.alchemy = { ...alloc };
            G.resource.Mana.amount = G.resource.Mana.max;
            Object.keys(alloc).forEach((r) => { G.resource[r].amount = 0; });
            run(accel, boost);
            const k = (accel ? 2 : 1) * boost;
            Object.keys(alloc).forEach((r) => {
                worst = Math.min(worst, G.resource[r].amount / (alloc[r] * rateOf(r) * 0.25 * k));
            });
        }
        const good = worst >= 0.95 && worst <= 1.05;
        console.log(`${good ? 'OK    ' : 'GAGAL '} ${label}: output terendah ${(worst * 100).toFixed(0)}% dari alokasi`);
        ok = ok && good;
    }
}
console.log(ok ? '\nLOLOS' : '\nGAGAL');
process.exit(ok ? 0 : 1);

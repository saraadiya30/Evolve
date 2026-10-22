// Alokasi alchemy dan ritual boleh LEBIH BESAR dari surplus Mana (rate Mana negatif). Storage Mana terkuras sampai habis, tapi:
//  - Mana tidak pernah di bawah 0
//  - ritual tetap jalan penuh (dibayar duluan, alchemy hanya memakai sisanya)
//  - setelah storage habis, alchemy turun otomatis ke sebesar produksi dikurangi biaya ritual, di semua kecepatan waktu
// Pakai: node test/alchemy-mana-deficit.mjs
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync } from 'node:fs';

seedMathRandom(12345);
setFixedNow(1735689600000);
global.localStorage.setItem('evolved', JSON.parse(readFileSync(new URL('./fixtures/user-save-1.json', import.meta.url), 'utf8')).save);
const { global: G, atrack, active_rituals } = await import('../src/core/vars.js');
const { execGameLoops } = await import('../src/main.js');
const core = await import('../src/stocks/stocks_core.js');
const { tradeRatio } = await import('../src/config/constants.js');
const { manaCost } = await import('../src/industry/industry_panels.js');
seedMathRandom(12345);
setFixedNow(1735689600000);
execGameLoops(5);

G.race.universe = 'magic';
G.tech.alchemy = 2;
G.race.alchemy = {};
G.race.casting = { farmer: 40, total: 40 };
G.resource.Mana.display = true;
G.resource.Crystal.display = true;
G.resource.Copper.max = 1e15;
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
const netNoAlchemy = G.resource.Mana.diff; // produksi dikurangi biaya ritual
const ritualCost = manaCost(40);
const rate = (G.resource.Copper.basic && G.tech.alchemy >= 2) ? tradeRatio.Copper * 8 : tradeRatio.Copper * 2;
console.log(`produksi bersih ${netNoAlchemy.toFixed(0)}/s, biaya ritual ${ritualCost.toFixed(2)}/s, cap Mana ${G.resource.Mana.max}`);

let ok = true;
const check = (label, good, extra = '') => {
    console.log(`${good ? 'OK    ' : 'GAGAL '} ${label}${extra ? ' ' + extra : ''}`);
    ok = ok && good;
};
for (const [label, accel, boost] of [['normal x1', false, 1], ['x4', true, 2], ['x10', true, 5]]){
    const k = (accel ? 2 : 1) * boost;
    G.race.alchemy = { Copper: Math.floor(netNoAlchemy * 3) }; // tiga kali surplus: rate Mana jelas negatif
    G.resource.Mana.amount = G.resource.Mana.max;
    G.resource.Copper.amount = 0;
    let minMana = Infinity;
    let ritualsFull = true;
    let failInfo = '';
    for (let i = 0; i < 40; i++){
        G.resource.Copper.amount = 0;
        run(accel, boost);
        minMana = Math.min(minMana, G.resource.Mana.amount);
        if (active_rituals.farmer !== 40){
            ritualsFull = false;
            failInfo = `loop awal ${i}: aktif ${active_rituals.farmer}, Mana ${G.resource.Mana.amount.toFixed(2)}`;
        }
    }
    // keadaan tunak: ukur output 20 loop berikutnya (Copper di-nol-kan tiap loop supaya tidak kena batas storage Copper)
    let copperGain = 0;
    for (let i = 0; i < 20; i++){
        G.resource.Copper.amount = 0;
        run(accel, boost);
        copperGain += G.resource.Copper.amount;
        minMana = Math.min(minMana, G.resource.Mana.amount);
        if (active_rituals.farmer !== 40){
            ritualsFull = false;
            failInfo = `loop tunak ${i}: aktif ${active_rituals.farmer}, Mana ${G.resource.Mana.amount.toFixed(2)}`;
        }
    }
    const perSec = copperGain / (20 * 0.25 * k);
    const expected = netNoAlchemy * rate;
    const ratio = perSec / expected;
    check(`${label}: Mana tidak pernah di bawah 0`, minMana >= 0, `(terendah ${minMana.toFixed(1)})`);
    check(`${label}: ritual tetap jalan penuh`, ritualsFull, failInfo);
    check(`${label}: setelah storage habis output = produksi bersih Mana`, ratio >= 0.9 && ratio <= 1.05, `(${(ratio * 100).toFixed(0)}% dari produksi bersih)`);
}
console.log(ok ? '\nLOLOS' : '\nGAGAL');
process.exit(ok ? 0 : 1);

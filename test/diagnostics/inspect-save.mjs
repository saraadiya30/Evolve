// Diagnosa save: load save (teks LZString mentah dari tombol Export, atau file fixture JSON {save: "..."}), jalankan beberapa tick,
// lalu laporkan (1) angka-angka yang rusak (NaN / Infinity / negatif) di state game, (2) kondisi produksi sebuah resource.
//
// Pakai:  node test/diagnostics/inspect-save.mjs <file-save> [Resource=Cement] [ticks=40]
//   contoh:  node test/diagnostics/inspect-save.mjs ~/save.txt Cement 60
//
// Cara dapat file-save: di game, Settings -> Export -> simpan teksnya ke file .txt (satu baris, tanpa spasi tambahan).
import '../env-setup.mjs';
import { seedMathRandom, setFixedNow } from '../env-setup.mjs';
import { readFileSync } from 'node:fs';

const [file, res = 'Cement', nArg = '40'] = process.argv.slice(2);
if (!file) { console.error('Pakai: node test/diagnostics/inspect-save.mjs <file-save> [Resource] [ticks]'); process.exit(2); }
const N = parseInt(nArg, 10);
let raw = readFileSync(file, 'utf8').trim();
if (raw.startsWith('{')) raw = JSON.parse(raw).save; // fixture JSON
globalThis.localStorage.setItem('evolved', raw);
seedMathRandom(12345); setFixedNow(1735689600000);

const { global: G, tmp_vars, atrack } = await import('../../src/core/vars.js');
const { execGameLoops } = await import('../../src/main.js');
seedMathRandom(12345); setFixedNow(1735689600000);
if (process.env.NO_ATIME === '1') { atrack.t = 0; G.settings.at = 0; }

const bad = (v) => typeof v === 'number' && (!Number.isFinite(v));
function scan(obj, path, out, seen = new WeakSet(), depth = 0) {
    if (obj === null || typeof obj !== 'object' || depth > 12 || seen.has(obj)) return;
    seen.add(obj);
    for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (bad(v)) out.push(`${path}.${k} = ${v}`);
        else scan(v, `${path}.${k}`, out, seen, depth + 1);
    }
}
const nanReport = (label) => {
    const out = [];
    scan(G, 'global', out);
    scan(tmp_vars, 'tmp_vars', out);
    console.log(`${label}: ${out.length ? out.length + ' nilai tidak valid (NaN/Infinity)' : 'tidak ada NaN/Infinity'}`);
    out.slice(0, 25).forEach((l) => console.log('   ' + l));
    if (out.length > 25) console.log(`   ... +${out.length - 25} lagi`);
};
const R = G.resource[res];
if (!R) { console.error(`Resource '${res}' tidak ada di save ini.`); process.exit(2); }

console.log(`Race: ${G.race.species} | tech.cement=${G.tech.cement} | isolation=${!!G.tech.isolation} | tick awal atrack.t=${atrack.t}`);
console.log(`${res} sebelum: amount=${R.amount} max=${R.max} display=${R.display} diff=${R.diff} delta=${R.delta}`);
nanReport('State SEBELUM tick');

const rows = [];
for (let i = 1; i <= N; i++) {
    const before = R.amount;
    execGameLoops(1);
    rows.push({ i, amount: R.amount, d: R.amount - before, delta: R.delta, diff: R.diff, max: R.max, tmax: tmp_vars.resource[res]?.temp_max, stone: G.resource.Stone?.amount, workers: G.civic.cement_worker?.workers });
}
console.log(`\nTick-per-tick ${res} (i, amount, naik/tick, delta, diff, max, temp_max, Stone, cement_worker):`);
const step = Math.max(1, Math.floor(N / 12));
rows.filter((r, k) => k % step === 0 || k === rows.length - 1).forEach((r) => console.log(`  ${String(r.i).padStart(3)}  amount=${r.amount}  +${r.d}  delta=${r.delta}  diff=${r.diff}  max=${r.max}  temp_max=${r.tmax}  Stone=${r.stone}  workers=${r.workers}`));
const zero = rows.find((r) => !(r.d > 0) && !(r.delta > 0));
console.log(zero ? `\nProduksi ${res} = 0 mulai tick ke-${zero.i}.` : `\nProduksi ${res} > 0 di semua ${N} tick.`);

console.log('\nBahan rumus produksi cement:');
const pick = {
    'civic.cement_worker': G.civic.cement_worker,
    'tech.cement': G.tech.cement, 'tech.ai_core': G.tech.ai_core,
    'race.high_pop': G.race.high_pop, 'race.discharge': G.race.discharge, 'race.warlord': G.race.warlord,
    'city.biome': G.city.biome, 'city.powered': G.city.powered, 'city.cement_plant': G.city.cement_plant,
    'civic.govern.type': G.civic.govern?.type,
    'stats.achieve.lamentis': G.stats.achieve?.lamentis,
    'stocks.market.Cement': G.stocks?.market?.[res],
    'resource.Stone': G.resource.Stone && { amount: G.resource.Stone.amount, max: G.resource.Stone.max, diff: G.resource.Stone.diff },
};
for (const [k, v] of Object.entries(pick)) console.log(`  ${k}:`, JSON.stringify(v));
nanReport('\nState SESUDAH tick');
process.exit(0);

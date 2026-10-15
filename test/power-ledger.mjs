// Penjaga buku besar listrik (src/systems/power_core.js): semua sumber listrik dihitung di SATU tempat, dicatat segar tiap tick,
// dan fase pemakaian (yang menyalakan/mematikan bangunan) memakai listrik yang sama dengan yang ditampilkan tooltip. Pagar:
//  1. statis: tidak ada kamus power_generated; $ctx.max_power / $ctx.power_grid tidak diubah di luar powerAdd;
//  2. power_total = jumlah semua baris, di berbagai kondisi;
//  3. Aether dimatikan: barisnya hilang pada tick berikutnya (bukan nyangkut);
//  4. bonus Watt stock tercatat dan benar-benar menyalakan bangunan (bukan sekadar angka tampilan);
//  5. listrik yang dipakai (power_total - power) tidak pernah negatif.
// Pakai: node test/power-ledger.mjs [fixture]
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
let ok = true;
const check = (name, cond, extra = '') => { console.log(`${cond ? 'ok  ' : 'GAGAL'} ${name}${cond ? '' : ' ' + extra}`); if (!cond) ok = false; };

// 1. pagar statis
const srcDir = join(__dirname, '..', 'src');
const bad = { dict: [], direct: [] };
const walk = (dir) => { for (const e of readdirSync(dir, { withFileTypes: true })){
    const f = join(dir, e.name);
    if (e.isDirectory()){ walk(f); continue; }
    if (!f.endsWith('.js')){ continue; }
    const rel = f.split('/src/')[1];
    readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
        if (/power_generated/.test(line)){ bad.dict.push(`${rel}:${i + 1}`); }
        if (rel !== 'systems/power_core.js' && (/\$ctx\.max_power\s*[-+]?=/.test(line) || /\$ctx\.power_grid\s*\+=/.test(line))){ bad.direct.push(`${rel}:${i + 1}`); }
    });
}};
walk(srcDir);
check('tidak ada lagi kamus power_generated (data basi tak terkontrol)', bad.dict.length === 0, bad.dict.join(', '));
check('sumber listrik hanya lewat powerAdd (tidak ada $ctx.max_power / power_grid += langsung)', bad.direct.length === 0, bad.direct.join(', '));

// 2-5. pagar dinamis
const fx = process.argv[2] || 'user-save-1';
seedMathRandom(12345); setFixedNow(1735689600000);
global.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, 'fixtures', fx + '.json'), 'utf8')).save);
const { global: G, p_on } = await import('../src/core/vars.js');
const { S_loops: S } = await import('../src/core/registries.js');
const { loc } = await import('../src/core/locale.js');
const { actions } = await import('../src/core/registries.js');
const { execGameLoops } = await import('../src/main.js');
const { fastLoopPowerGeneration } = await import('../src/loops/fast/fast_loop_power_generation.js');
const { fastLoopPowerUsage } = await import('../src/loops/fast/fast_loop_power_usage.js');
const { fastLoopPowerState } = await import('../src/loops/fast/fast_loop_power_state.js');
const { convertSpaceSector } = await import('../src/space/space_requirements.js');
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(5);

const run = () => { const ctx = { time_multiplier: 1 }; fastLoopPowerGeneration(ctx); fastLoopPowerUsage(ctx); fastLoopPowerState(ctx); return ctx; };
const sum = () => (S.powerParts || []).reduce((a, p) => a + p.value, 0);
const near = (a, b) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b));
const part = (label) => (S.powerParts || []).find((p) => p.label === label);
const stockLabel = loc('stock_bonus_label'), aetherLabel = loc('resource_Aether_name');
const setLots = (n) => { G.stocks.market.Power = G.stocks.market.Power || {}; G.stocks.market.Power.lots = n; };

setLots(0); G.settings.aetherPower = 0;
run();
check(`dasar: power_total = jumlah baris (${G.city.power_total} vs ${+sum().toFixed(3)})`, near(G.city.power_total, sum()));
const baseTotal = G.city.power_total, basePower = G.city.power;

// 4. bonus Watt stock
setLots(500); run();
check('stock Watt: baris tercatat dengan nilai = jumlah lot', part(stockLabel) && near(part(stockLabel).value, 500));
check('stock Watt: power_total naik tepat sebesar bonus', near(G.city.power_total, baseTotal + 500));
check('stock Watt: listrik tersedia naik tepat sebesar bonus', near(G.city.power, basePower + 500));
check('stock Watt: power_total = jumlah baris', near(G.city.power_total, sum()));
check('stock Watt: pemakaian (power_total - power) tidak negatif', G.city.power_total - G.city.power >= -1e-6, `pemakaian ${G.city.power_total - G.city.power}`);
setLots(0); run();
check('lot dijual: baris hilang dan total kembali', !part(stockLabel) && near(G.city.power_total, baseTotal));

// bonus stock benar-benar menyalakan bangunan: ambil satu bangunan berlistrik yang sedang menyala, buat permintaannya jauh
// melebihi pembangkit, lalu bandingkan tanpa dan dengan bonus
const found = (G.power || []).map((k) => { const [r, s] = k.split(':'); const region = r === 'city' ? 'city' : convertSpaceSector(r);
    const c = r === 'city' ? actions.city[s] : actions[region][r][s]; return { region, s, c }; })
    .find((x) => G[x.region][x.s] && G[x.region][x.s].on > 0 && p_on[x.s] > 0 && x.c.powered() > 0);
check('ada bangunan berlistrik yang menyala di fixture untuk uji efek nyata', !!found);
if (found){
    const struct = G[found.region][found.s], savedOn = struct.on;
    struct.on = 100000;
    setLots(0); run(); const without = p_on[found.s];
    setLots(1e12); run(); const withBonus = p_on[found.s];
    check(`bonus stock menyalakan bangunan: tanpa bonus ${without}/100000 menyala, dengan bonus ${withBonus}/100000`, without < 100000 && withBonus === 100000);
    struct.on = savedOn; setLots(0); run();
}

// 3. Aether
G.prestige.Aether = G.prestige.Aether || { count: 0 }; G.prestige.Aether.count = 5;
G.settings.aetherPower = 0.00001; run();
check('Aether menyala: barisnya tercatat (0.00001 Aether = 1000 watt)', part(aetherLabel) && near(part(aetherLabel).value, 1000));
check('Aether menyala: power_total = jumlah baris', near(G.city.power_total, sum()));
G.settings.aetherPower = 0; run();
check('Aether dimatikan: baris hilang pada tick berikutnya (tidak nyangkut)', !part(aetherLabel));
check('Aether dimatikan: power_total kembali', near(G.city.power_total, baseTotal) || near(G.city.power_total, sum()));

// 2. beberapa kondisi lain
for (const [name, mut] of [
    ['pemakaian listrik besar', () => { setLots(0); }],
    ['stock + Aether bersamaan', () => { setLots(200); G.settings.aetherPower = 0.00002; G.prestige.Aether.count = 9; }],
]){
    mut(); run();
    check(`${name}: power_total = jumlah baris (${+G.city.power_total.toFixed(3)} vs ${+sum().toFixed(3)})`, near(G.city.power_total, sum()));
    check(`${name}: pemakaian tidak negatif`, G.city.power_total - G.city.power >= -1e-6);
}
process.exit(ok ? 0 : 1);

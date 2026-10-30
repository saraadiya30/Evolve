// Deuterium Power Plant (bangunan interstellar di Alpha Centauri, setting-nya di panel tab Industry): dibeli sekali, pemain mengatur Deuterium per detik yang dibakar, Watt =
// konsumsi x 17.6 (rasio yang sama dengan Fusion Reactor: 22 W untuk 1.25 Deuterium/s). Dicek:
//  1. logika murni: sanitasi angka, tanpa batas atas, stok habis -> output 0, stok kurang -> output turun sebanding;
//  2. bangunan: definisi (reqs nebula 2, biaya sama Fusion Reactor, struct), aksi beli sekali, tambalan save lama (termasuk migrasi
//     dari versi tab Resources);
//  3. di game: Deuterium berkurang sebesar rate x detik tick, Watt masuk ke buku besar listrik, stok habis -> tidak ada listrik.
// Pakai: node test/deuterium-plant.mjs [fixture]
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const [fx = 'user-save-1'] = process.argv.slice(2);
seedMathRandom(12345); setFixedNow(1735689600000);
global.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, 'fixtures', fx + '.json'), 'utf8')).save);
const { global: G, tmp_vars } = await import('../src/core/vars.js');
const { S_loops: S } = await import('../src/core/registries.js');
const { loc } = await import('../src/core/locale.js');
const { execGameLoops } = await import('../src/main.js');
const { fastLoopPowerGeneration } = await import('../src/loops/fast/fast_loop_power_generation.js');
const { fastLoopPowerUsage } = await import('../src/loops/fast/fast_loop_power_usage.js');
const { fastLoopPowerState } = await import('../src/loops/fast/fast_loop_power_state.js');
const core = await import('../src/resources/deuterium_plant_core.js');
const { actions } = await import('../src/core/registries.js');
const { adjustCosts } = await import('../src/functions/cost_adjusters.js');
const { applySaveDefaults6 } = await import('../src/core/save_defaults/save_defaults_6.js');
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(5);

let ok = true;
const check = (name, cond, extra = '') => { console.log(`${cond ? 'OK    ' : 'GAGAL '} ${name}${cond ? '' : ' ' + extra}`); if (!cond) ok = false; };
const near = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

// 1. logika murni
check('rasio 17.6 W per Deuterium/s (sama dengan Fusion Reactor 22 W / 1.25)', near(core.DEUT_PLANT_WATT_PER_UNIT, 22 / 1.25));
check('sanitize: negatif, NaN, teks, Infinity -> 0', [-3, NaN, 'abc', Infinity, undefined, null].every((v) => core.sanitizeDeutRate(v) === 0));
check('sanitize: angka desimal dan sangat besar dibiarkan (tanpa batas atas)', core.sanitizeDeutRate(0.25) === 0.25 && core.sanitizeDeutRate(1e30) === 1e30);
let step = core.deuteriumPlantStep(2, 1000, 1, 17.6);
check('stok cukup: konsumsi = rate x detik, watt = rate x 17.6', near(step.consumed, 2) && near(step.rate, 2) && near(step.watts, 35.2));
step = core.deuteriumPlantStep(2, 1000, 0.25, 17.6);
check('tick pendek: konsumsi = rate x detik tick, tetapi rate tetap 2/s', near(step.consumed, 0.5) && near(step.rate, 2));
step = core.deuteriumPlantStep(1e9, 1e12, 1, 17.6);
check('rate sangat besar tidak dibatasi selama stok ada', near(step.consumed, 1e9) && near(step.watts, 1e9 * 17.6));
step = core.deuteriumPlantStep(4, 1, 1, 17.6);
check('stok kurang: membakar sisa stok, output turun sebanding', near(step.consumed, 1) && near(step.rate, 1) && near(step.watts, 17.6));
step = core.deuteriumPlantStep(4, 0, 1, 17.6);
check('stok habis: tidak ada konsumsi dan tidak ada listrik', step.consumed === 0 && step.watts === 0 && step.rate === 0);
step = core.deuteriumPlantStep(0, 500, 1, 17.6);
check('rate 0: tidak ada konsumsi dan tidak ada listrik', step.consumed === 0 && step.watts === 0);

// ringkasan untuk panel
let sum = core.deuteriumPlantSummary(16, 1e6, 5, 17.6);
check('ringkasan normal: ok, membakar 16, 281.6 W, stok tidak menurun -> depletesIn -1', sum.state === 'ok' && near(sum.burning, 16) && near(sum.watts, 281.6) && sum.depletesIn === -1);
sum = core.deuteriumPlantSummary(16, 1000, -4, 17.6);
check('stok menurun 4/s dari 1000: habis dalam 250 detik', sum.state === 'ok' && near(sum.depletesIn, 250));
sum = core.deuteriumPlantSummary(10, 3, -10, 17.6);
check('stok kurang dari setting: limited, membakar 3, output 3 x 17.6', sum.state === 'limited' && near(sum.burning, 3) && near(sum.watts, 3 * 17.6) && near(sum.depletesIn, 0.3));
sum = core.deuteriumPlantSummary(5, 0, -1, 17.6);
check('stok kosong: limited, tidak membakar, output 0, tanpa perkiraan habis', sum.state === 'limited' && sum.burning === 0 && sum.watts === 0 && sum.depletesIn === -1);
sum = core.deuteriumPlantSummary(0, 1000, -50, 17.6);
check('rate 0: off, output 0, tanpa perkiraan habis walau stok menurun', sum.state === 'off' && sum.watts === 0 && sum.depletesIn === -1);
sum = core.deuteriumPlantSummary(NaN, 'x', undefined, 17.6);
check('input sampah: off, tidak error', sum.state === 'off' && sum.burning === 0 && sum.depletesIn === -1);
sum = core.deuteriumPlantSummary(2, 100, NaN, 17.6);
check('net tidak valid: tidak ada perkiraan habis', sum.state === 'ok' && sum.depletesIn === -1);

// 2. bangunan
const R = G.resource;
// Di fixture Deuterium belum punya storage (max 0) dan modRes memotong ke max; di game asli Deuterium yang terbuka punya storage
R.Deuterium.max = 1e12; tmp_vars.resource.Deuterium.temp_max = 1e12;
const building = actions.interstellar.int_alpha.deut_plant;
check('bangunan deut_plant ada di Alpha Centauri (sebelah Fusion Reactor)', !!building);
check('syarat tech hanya Alpha Centauri (alpha 1); muncul tergantung Deuterium kebuka', building.reqs && building.reqs.alpha === 1 && Object.keys(building.reqs).length === 1);
G.interstellar.deut_plant = building.struct().d;
R.Deuterium.display = false;
check('Deuterium belum kebuka: tile tidak tampil', building.condition() === false);
R.Deuterium.display = true;
check('Deuterium kebuka (walau tech.nebula belum 2): tile tampil', building.condition() === true);
check('struct: count 0, rate 0, di global.interstellar.deut_plant', JSON.stringify(building.struct().d) === JSON.stringify({ count: 0, rate: 0 }) && building.struct().p.join() === 'deut_plant,interstellar');
check('special (gerigi ke panel setting) berupa fungsi, dan refresh', typeof building.special === 'function' && building.refresh === true);
G.interstellar.fusion = G.interstellar.fusion || { count: 0, on: 0 };
const fusionCount = G.interstellar.fusion.count; G.interstellar.fusion.count = 0;
const fusion = actions.interstellar.int_alpha.fusion;
check('biaya = biaya Fusion Reactor pertama (Money, Iridium, Infernite, Brick)', Object.keys(building.cost).sort().join() === 'Brick,Infernite,Iridium,Money' && Object.keys(building.cost).every((r) => near(building.cost[r](0), fusion.cost[r](0))));
G.interstellar.fusion.count = fusionCount;

delete G.interstellar.deut_plant;
G.interstellar.deut_plant = building.struct().d;
R.Deuterium.display = true;
check('belum dibeli: tile tampil (condition true) dan belum ada gerigi (special false)', building.condition() === true && building.special() === false);
// storage di fixture lebih kecil dari biayanya: besarkan max supaya biaya bisa dibayar
const giveCost = (mult = 1) => Object.keys(building.cost).forEach((res) => { const c = building.cost[res](0); R[res].max = Math.max(R[res].max, c * 10); if (tmp_vars.resource[res]){ tmp_vars.resource[res].temp_max = R[res].max; } R[res].amount = c * mult; });
G.settings.showIndustry = false;
giveCost(3);
// yang dibayar adalah biaya setelah penyesuaian umum game (mis. diskon Brick), sama untuk semua bangunan
const adjusted = adjustCosts(building, 0);
const paid = {}, before = {}; Object.keys(building.cost).forEach((res) => { paid[res] = adjusted[res](0); before[res] = R[res].amount; });
check('beli berhasil lewat aksi bangunan', building.action.call(building) === true && G.interstellar.deut_plant.count === 1);
check('biaya terpotong tepat sekali', Object.keys(paid).every((res) => near(R[res].amount, before[res] - paid[res])));
check('beli membuka tab Industry', G.settings.showIndustry === true);
check('sudah dibeli: tile TETAP tampil (condition true) dan gerigi muncul (special true)', building.condition() === true && building.special() === true);
check('sudah dibeli: biaya jadi 0 dan queue selesai', Object.keys(building.cost).every((res) => building.cost[res](0) === 0) && building.queue_complete() === 0);
{
    const snap = {}; Object.keys(building.cost).forEach((res) => { snap[res] = R[res].amount; });
    giveCost(3); const again = {}; Object.keys(building.cost).forEach((res) => { again[res] = R[res].amount; });
    check('sudah dibeli: klik tile lagi ditolak dan tidak memotong apa pun', building.action.call(building) === false && G.interstellar.deut_plant.count === 1 && Object.keys(again).every((res) => R[res].amount === again[res]));
}
check('efek tile menyebut sudah dibangun', building.effect().includes(loc('deut_plant_owned')));
check('rate awal 0', G.interstellar.deut_plant.rate === 0);
G.interstellar.deut_plant.count = 0;
check('queue: belum dibeli -> 1 tersisa', building.queue_complete() === 1);
giveCost(0); R.Brick.amount = 0;
check('kurang satu biaya: aksi ditolak dan tidak ada yang terpotong', building.action.call(building) === false && G.interstellar.deut_plant.count === 0 && R.Money.amount === 0);

// record bangunan belum ada saat beli (mis. Deuterium dibuka lewat console): beli tetap berhasil dan record dibuat
delete G.interstellar.deut_plant; giveCost(3);
check('record belum ada: beli tetap berhasil dan record dibuat', building.action.call(building) === true && G.interstellar.deut_plant && G.interstellar.deut_plant.count === 1);

// tambalan save lama
G.tech.nebula = 2; delete G.interstellar.deut_plant; delete G.race.deutPlant;
applySaveDefaults6({ global: G });
check('save lama yang sudah lewat Nexus: record dibuat (count 0, rate 0)', G.interstellar.deut_plant && G.interstellar.deut_plant.count === 0 && G.interstellar.deut_plant.rate === 0);
G.interstellar.deut_plant.count = 1; G.interstellar.deut_plant.rate = 5;
applySaveDefaults6({ global: G });
check('tambalan tidak menimpa record yang sudah ada', G.interstellar.deut_plant.count === 1 && G.interstellar.deut_plant.rate === 5);
delete G.interstellar.deut_plant; G.race.deutPlant = { built: true, rate: 3 };
applySaveDefaults6({ global: G });
check('migrasi dari tab Resources lama: dibeli dan rate terbawa, state lama dihapus', G.interstellar.deut_plant.count === 1 && G.interstellar.deut_plant.rate === 3 && G.race.deutPlant === undefined);
delete G.interstellar.deut_plant; G.race.deutPlant = { built: false, rate: 9 };
applySaveDefaults6({ global: G });
check('migrasi: belum dibeli tidak jadi dibeli', G.interstellar.deut_plant.count === 0 && G.race.deutPlant === undefined);
G.tech.nebula = 0; R.Deuterium.display = false; delete G.interstellar.deut_plant;
applySaveDefaults6({ global: G });
check('Deuterium belum kebuka dan belum sampai Nebula: tidak ada record', G.interstellar.deut_plant === undefined);
R.Deuterium.display = true;
applySaveDefaults6({ global: G });
check('Deuterium kebuka tanpa tech.nebula 2 (mis. lewat console): record dibuat', G.interstellar.deut_plant && G.interstellar.deut_plant.count === 0);

// 3. di game
const run = (tm = 1) => { const ctx = { time_multiplier: tm }; fastLoopPowerGeneration(ctx); fastLoopPowerUsage(ctx); fastLoopPowerState(ctx); return ctx; };
const part = (label) => (S.powerParts || []).find((p) => p.label === label);
const label = loc('deut_plant_title');
const wpu = 17.6; // universe standar di fixture, tanpa modifier
G.interstellar.deut_plant = { count: 1, rate: 0 }; R.Deuterium.amount = 1e6; run();
check('rate 0: tidak ada baris listrik dari plant', !part(label));
const baseTotal = G.city.power_total;
G.interstellar.deut_plant.rate = 10; R.Deuterium.amount = 1e6; run();
check(`rate 10: baris listrik = ${10 * wpu} W`, part(label) && near(part(label).value, 10 * wpu), part(label) ? part(label).value : 'tidak ada');
check('rate 10: power_total naik tepat sebesar output plant', near(G.city.power_total, baseTotal + 10 * wpu));
check('rate 10, 1 detik: Deuterium berkurang tepat 10', near(R.Deuterium.amount, 1e6 - 10));
R.Deuterium.amount = 1e6; run(0.5);
check('tick 0.5 detik: Deuterium berkurang 5', near(R.Deuterium.amount, 1e6 - 5));
R.Deuterium.amount = 0; run();
check('stok Deuterium habis: baris listrik hilang', !part(label) && near(G.city.power_total, baseTotal));
check('stok habis: Deuterium tidak jadi negatif', R.Deuterium.amount >= 0);
R.Deuterium.amount = 3; G.interstellar.deut_plant.rate = 10; run();
check('stok kurang dari rate: output turun sebanding (3 dari 10 -> 3 x 17.6 W)', part(label) && near(part(label).value, 3 * wpu));
G.interstellar.deut_plant.count = 0; R.Deuterium.amount = 1e6; run();
check('plant belum dibeli: tidak menghasilkan walau rate terisi', !part(label) && near(R.Deuterium.amount, 1e6));

console.log(ok ? 'LOLOS' : 'GAGAL');
process.exit(ok ? 0 : 1);

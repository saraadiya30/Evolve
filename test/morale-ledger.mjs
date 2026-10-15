// Penjaga buku besar morale (src/systems/morale_core.js): total morale dihitung di SATU tempat. Tooltip morale menampilkan
// barisnya dan Total-nya adalah `potential` yang dibaca governor, jadi semuanya harus cocok. Tiga pagar:
//  1. statis: tidak ada $ctx.morale += / -= di loop (efek morale harus lewat moraleAdd supaya tercatat);
//  2. dinamis: di banyak kondisi, potential = 100 + jumlah semua baris (efek yang lolos dari catatan akan ketahuan);
//  3. setiap label baris punya terjemahan di strings.json (tidak ada baris tooltip dengan teks kosong).
// Pakai: node test/morale-ledger.mjs [fixture]
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
let ok = true;
const check = (name, cond, extra = '') => { console.log(`${cond ? 'ok  ' : 'GAGAL'} ${name}${cond ? '' : ' ' + extra}`); if (!cond) ok = false; };

// 1. pagar statis
const loopDir = join(__dirname, '..', 'src', 'loops');
const direct = [];
const walk = (dir) => { for (const e of readdirSync(dir, { withFileTypes: true })){
    const f = join(dir, e.name);
    if (e.isDirectory()){ walk(f); continue; }
    if (!f.endsWith('.js')){ continue; }
    readFileSync(f, 'utf8').split('\n').forEach((line, i) => { if (/\$ctx\.morale\s*[-+]=/.test(line)){ direct.push(`${f.split('/src/')[1]}:${i + 1}`); } });
}};
walk(loopDir);
check('tidak ada $ctx.morale += / -= langsung di src/loops (pakai moraleAdd)', direct.length === 0, direct.join(', '));

// 2. pagar dinamis
const fx = process.argv[2] || 'user-save-1';
seedMathRandom(12345); setFixedNow(1735689600000);
global.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, 'fixtures', fx + '.json'), 'utf8')).save);
const { global: G } = await import('../src/core/vars.js');
const { S_loops: S } = await import('../src/core/registries.js');
const { execGameLoops } = await import('../src/main.js');
const { fastLoopMorale } = await import('../src/loops/fast/fast_loop_morale.js');
const { fastLoopMoraleEntertainment } = await import('../src/loops/fast/fast_loop_morale_entertainment.js');
const { fastLoopMoraleCap } = await import('../src/loops/fast/fast_loop_morale_cap.js');
const { MORALE_LABEL_CHEESE } = await import('../src/systems/morale_core.js');
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(5);
const strings = JSON.parse(readFileSync(join(__dirname, '..', 'strings', 'strings.json'), 'utf8'));
const clone = (o) => JSON.parse(JSON.stringify(o));
const SAVED = { race: clone(G.race), civic: clone(G.civic), tech: clone(G.tech), stocks: clone(G.stocks), city: { morale: clone(G.city.morale) } };
const restore = () => {
    for (const k of ['race', 'civic', 'tech', 'stocks']){ for (const key of Object.keys(G[k])){ delete G[k][key]; } Object.assign(G[k], clone(SAVED[k])); }
    for (const key of Object.keys(G.city.morale)){ delete G.city.morale[key]; } Object.assign(G.city.morale, clone(SAVED.city.morale));
    delete G.city['tormented'];
};
const tick = () => { const ctx = { astroSign: '', global_multiplier: 1 }; fastLoopMorale(ctx); fastLoopMoraleEntertainment(ctx); fastLoopMoraleCap(ctx); return ctx; };
const sum = () => 100 + (S.moraleParts || []).reduce((a, p) => a + p.value, 0);
const labels = new Set();
const scenario = (name, mutate, expectLabel) => {
    restore();
    try { mutate(); } catch (e){ check(`${name}: kondisi dapat disiapkan`, false, String(e)); return; }
    let ctx;
    try { ctx = tick(); } catch (e){ check(`${name}: tick berjalan`, false, e.stack.split('\n').slice(0, 3).join(' | ')); return; }
    const diff = Math.abs(G.city.morale.potential - sum());
    check(`${name}: potential = 100 + jumlah baris (${G.city.morale.potential} vs ${+sum().toFixed(2)})`, diff <= 0.06, `selisih ${diff}`);
    (S.moraleParts || []).forEach((p) => labels.add(p.label));
    if (expectLabel){ check(`${name}: baris "${expectLabel}" tercatat`, (S.moraleParts || []).some((p) => p.label === expectLabel)); }
    return ctx;
};
scenario('dasar', () => {});
scenario('pajak tinggi', () => { G.civic.taxes.tax_rate = 60; }, 'morale_tax');
scenario('pajak rendah', () => { G.civic.taxes.tax_rate = 5; }, 'morale_tax');
scenario('tunawisma', () => { G.civic.homeless = 30; }, 'homeless');
scenario('vaksin rahasia', () => { G.tech['vax_c'] = 1; }, 'tech_vax_strat4_bd');
scenario('vaksin paksa', () => { G.tech['vax_f'] = 1; }, 'tech_vax_strat2_bd');
scenario('vaksin transparan', () => { delete G.tech['vax_c']; delete G.tech['vax_f']; G.tech['vax_s'] = 1; }, 'tech_vax_strat3_bd');
scenario('keju', () => { G.race['cheese'] = 1; }, MORALE_LABEL_CHEESE);
scenario('termotivasi', () => { G.race['motivated'] = 5; }, 'event_motivation_bd');
scenario('peliharaan kucing', () => { G.race['pet'] = { type: 'cat', pet: 1, event: 1 }; }, 'event_pet_cat_owner');
scenario('peliharaan anjing', () => { G.race['pet'] = { type: 'dog', pet: 1, event: 0 }; }, 'event_pet_dog_owner');
// pet anjing yang dibelai negatif tanpa event: 1 - 1 = 0, tidak ada baris tetapi jumlahnya tetap cocok
scenario('peliharaan anjing netral (0)', () => { G.race['pet'] = { type: 'dog', pet: -1, event: 0 }; });
check('peliharaan anjing netral: tidak ada baris bernilai 0', !(S.moraleParts || []).some((p) => p.value === 0));
scenario('wish reputable', () => { G.race['wish'] = 1; G.race['wishStats'] = { fame: 12, bad: 0 }; }, 'wish_reputable');
scenario('wish notorious + bad press', () => { G.race['wish'] = 1; G.race['wishStats'] = { fame: -9, bad: 160 }; }, 'wish_bad');
scenario('revolusi', () => { G.civic.govern.fr = 5; }, 'morale_rev');
scenario('korpokrasi', () => { G.civic.govern.type = 'corpocracy'; }, 'govern_corpocracy');
scenario('republik', () => { G.civic.govern.type = 'republic'; }, 'govern_republic');
scenario('federasi', () => { G.civic.govern.type = 'federation'; }, 'govern_federation');
scenario('demokrasi', () => { G.civic.govern.type = 'democracy'; G.tech['theatre'] = 3; G.civic.entertainer.workers = 20; });
check('demokrasi: baris entertainer membawa keterangan demokrasi', (S.moraleParts || []).some((p) => p.label === 'morale_entertain' && p.opts && p.opts.sub && p.opts.sub.label === 'govern_democracy'));
scenario('bonus stock + tormented', () => { G.race['tormented'] = 1; G.stocks.market.Morale = G.stocks.market.Morale || {}; G.stocks.market.Morale.lots = 1500; }, 'stock_bonus_label');
scenario('bonus stock saja', () => { G.stocks.market.Morale = G.stocks.market.Morale || {}; G.stocks.market.Morale.lots = 400; }, 'stock_bonus_label');
restore();

// 3. setiap label punya terjemahan
const missing = [...labels].filter((l) => l !== MORALE_LABEL_CHEESE && !(l in strings));
check(`semua label baris ada di strings.json (${labels.size} label dipakai)`, missing.length === 0, 'hilang: ' + missing.join(', '));
check('string morale_min ada (baris batas minimum)', 'morale_min' in strings);
process.exit(ok ? 0 : 1);

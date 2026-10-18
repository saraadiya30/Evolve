// Trade route x100 (TRADE_ROUTE_MULT) untuk sumber yang sebelumnya belum dikali: bonus candi (fanaticism), bazaar, serta rute galactic
// (freighter dan super freighter). Cek: (1) jumlah rute tiap sumber di mid loop, termasuk sumber lama yang tidak boleh berubah;
// (2) kapasitas rute galactic dan breakdown-nya; (3) penyelesaian rute galactic secara bulk setara persis dengan satu-satu
// (termasuk saat bahan tidak cukup: sisanya dikuras seperti dulu); (4) balance Knowledge dari symposium tidak ikut membengkak;
// (5) teks tooltip candi memakai parameter.
// Pakai: node test/trade-routes-mult.mjs <fixture>
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const [fx = 'user-save-1'] = process.argv.slice(2);
seedMathRandom(12345); setFixedNow(1735689600000);
global.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, 'fixtures', fx + '.json'), 'utf8')).save);
const { global: G, breakdown, p_on, gal_on } = await import('../src/core/vars.js');
const { execGameLoops } = await import('../src/main.js');
const { TRADE_ROUTE_MULT } = await import('../src/config/constants.js');
const { midLoopTradeRoutes } = await import('../src/loops/mid/mid_loop_trade_routes.js');
const { midLoopGalaxyCrewCaps } = await import('../src/loops/mid/mid_loop_galaxy_crew_caps.js');
const { midLoopOmniscienceCaps } = await import('../src/loops/mid/mid_loop_omniscience_caps.js');
const { fastLoopGalacticTrade, affordableRoutes } = await import('../src/loops/fast/fast_loop_galactic_trade.js');
const { faithTempleCount } = await import('../src/resources/aether_alchemy.js');
const { modRes, resetResBuffer } = await import('../src/functions/resource_mod.js');
const { piracy } = await import('../src/space/space_requirements.js');
const { loc } = await import('../src/core/locale.js');
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(5);

let ok = true;
function check(label, got, want){
    const good = typeof want === 'number'
        ? Math.abs(got - want) <= Math.abs(want) * 1e-9 + 1e-9
        : got === want;
    console.log(`${good ? 'OK    ' : 'GAGAL '} ${label}: ${got} (harapan ${want})`);
    if (!good) ok = false;
}

check('TRADE_ROUTE_MULT = 100', TRADE_ROUTE_MULT, 100);

// ---------- (1) rute terestrial di mid loop ----------
function resetTerrestrial(){
    delete G.race['banana'];
    delete G.race['nomadic']; delete G.race['xenophobic']; delete G.race['flier'];
    delete G.race['cataclysm']; delete G.race['orbit_decayed']; delete G.race['warlord'];
    delete G.city['wharf'];
    delete G.city['storage_yard'];
    delete G.space['gps'];
    delete G.portal['bazaar'];
    delete G.tech['railway'];
    delete G.tech['fanaticism'];
    delete p_on['titan_spaceport'];
    G.city['trade'] = { count: 0 };
    G.tech.trade = 2;
}
function routes(){
    midLoopTradeRoutes({ caps: { Water: 0 } });
    return G.city.market.mtrade;
}
const sumBreakdown = () => Object.values(breakdown.t_route).reduce((a, b) => a + b, 0);

resetTerrestrial();
G.city.temple = { count: 7 };
G.tech.fanaticism = 2;
check('candi tanpa fanaticism 3: tidak memberi rute', routes(), 0);
G.tech.fanaticism = 3;
const temples = faithTempleCount();
check('candi dihitung (sanity: ada candi)', temples > 0, true);
check('candi dengan fanaticism 3: jumlah candi x100', routes(), temples * 100);
check('breakdown candi sama dengan mtrade', sumBreakdown(), temples * 100);

resetTerrestrial();
G.portal.bazaar = { count: 3 };
G.portal.spire = { count: 4 };
check('bazaar: bazaar x spire x100', routes(), 3 * 4 * 100);
check('breakdown bazaar sama dengan mtrade', sumBreakdown(), 3 * 4 * 100);

// sumber lama tidak boleh berubah
resetTerrestrial();
G.city.trade = { count: 2 }; G.tech.trade = 2;
check('trade post (lama): (trade+1) x100 per post', routes(), (2 + 1) * 100 * 2);
resetTerrestrial();
G.city.wharf = { count: 5 };
check('wharf (lama): 2 x100 per wharf', routes(), 5 * 2 * 100);
resetTerrestrial();
G.space.gps = { count: 4 };
check('GPS (lama): 2 x100 per GPS', routes(), 4 * 2 * 100);
resetTerrestrial();
G.tech.trade = 3;
G.city.storage_yard = { count: 7 };
check('storage yard (lama): x100 per yard', routes(), 7 * 100);

// ---------- (2) rute galactic: kapasitas dan breakdown ----------
Object.keys(G.resource).forEach(r => { breakdown.p.consume[r] = breakdown.p.consume[r] || {}; });
G.galaxy.trade = { max: 0, cur: 0, f0: 0, f1: 0, f2: 0, f3: 0, f4: 0, f5: 0, f6: 0, f7: 0, f8: 0 };
G.galaxy.freighter = { count: 7, on: 7 };
G.galaxy.super_freighter = { count: 3, on: 3 };
gal_on.freighter = 7;
gal_on.super_freighter = 3;
const ctx = { time_multiplier: 0.25, astroSign: '' };

midLoopGalaxyCrewCaps({ lCaps: { crew: 0 } });
check('breakdown freighter: 7 x 2 x100', breakdown.gt_route[loc('galaxy_freighter')], 7 * 2 * 100);
check('breakdown super freighter: 3 x 5 x100', breakdown.gt_route[loc('galaxy_super_freighter')], 3 * 5 * 100);

fastLoopGalacticTrade(ctx);
check('kapasitas rute galactic = (7x2 + 3x5) x100', G.galaxy.trade.max, (7 * 2 + 3 * 5) * 100);
const gtBreakdownTotal = Object.values(breakdown.gt_route).reduce((a, b) => a + b, 0);
check('breakdown sama dengan kapasitas', gtBreakdownTotal, G.galaxy.trade.max);

// ---------- (3) penyelesaian bulk setara satu-satu ----------
check('affordableRoutes: semua mampu', affordableRoutes(10, 1000, 5), 10);
check('affordableRoutes: sebagian mampu', affordableRoutes(10, 23, 5), 4);
check('affordableRoutes: pas', affordableRoutes(10, 50, 5), 10);
check('affordableRoutes: tidak ada bahan', affordableRoutes(10, 0, 5), 0);
check('affordableRoutes: biaya 0 selalu terpenuhi', affordableRoutes(10, 0, 0), 10);
check('affordableRoutes: tanpa rute', affordableRoutes(0, 100, 5), 0);
check('affordableRoutes: rute negatif', affordableRoutes(-3, 100, 5), 0);

// kondisi netral: tanpa modifier perdagangan, supaya satu rute selalu menukar jumlah yang sama
['persuasive', 'merchant', 'devious'].forEach(t => { delete G.race[t]; });
delete G.genes['trader'];
G.stats.achieve.trade = { l: 0 };
for (let i = 0; i < 9; i++){ G.galaxy.trade[`f${i}`] = 0; }
const EXP = 'Copper', IMP = 'Neutronium';   // tawaran ke-1 (indeks 1)
G.resource[EXP].max = 1e15; G.resource[IMP].max = 1e15;

function setStock(a){
    G.resource[EXP].amount = a;
    G.resource[IMP].amount = 0;
    resetResBuffer();
}
// kalibrasi: satu rute menukar e (ekspor) dan i (impor)
setStock(1e9);
G.galaxy.trade.f1 = 1;
fastLoopGalacticTrade(ctx);
const e = 1e9 - G.resource[EXP].amount;
const i = G.resource[IMP].amount;
check('kalibrasi: satu rute mengekspor sesuatu', e > 0, true);
check('kalibrasi: satu rute mengimpor sesuatu', i > 0, true);

// acuan: cara lama (satu rute per panggilan modRes)
function reference(N, a){
    setStock(a);
    for (let j = 0; j < N; j++){
        if (modRes(EXP, -e)){
            modRes(IMP, i);
        }
    }
    return [G.resource[EXP].amount, G.resource[IMP].amount];
}
function bulk(N, a){
    setStock(a);
    G.galaxy.trade.f1 = N;
    G.galaxy.trade.cur = N;
    fastLoopGalacticTrade(ctx);
    return [G.resource[EXP].amount, G.resource[IMP].amount];
}
const cases = [
    ['bahan lebih dari cukup', 1000, e * 5000],
    ['bahan pas untuk semua rute', 1000, e * 1000],
    ['bahan hanya cukup 30 rute (sisa dikuras)', 1000, e * 30 + e / 3],
    ['bahan kurang dari satu rute', 500, e / 2],
    ['tanpa bahan', 500, 0],
    ['satu rute', 1, e * 10]
];
for (const [label, N, a] of cases){
    const ref = reference(N, a);
    const got = bulk(N, a);
    check(`${label}: sisa ekspor sama dengan cara lama`, got[0], ref[0]);
    check(`${label}: hasil impor sama dengan cara lama`, got[1], ref[1]);
}
G.galaxy.trade.f1 = 0;

// ---------- (4) balance Knowledge symposium ----------
function knowledgeFor(cur){
    p_on['embassy'] = 1;
    p_on['symposium'] = 1;
    p_on['dormitory'] = 0;
    G.galaxy.symposium = { count: 1, on: 1 };
    G.tech.xeno = 0;
    G.galaxy.trade.cur = cur;
    const c = { caps: { Knowledge: 0 } };
    midLoopOmniscienceCaps(c);
    return c.caps.Knowledge;
}
const pirate = piracy('gxy_gorddon');
const k0 = knowledgeFor(0);
const k1 = knowledgeFor(100);
const k2 = knowledgeFor(300);
check('Knowledge: 100 rute (1 rute versi asli) menambah 650 x pirate', k1 - k0, 650 * pirate);
check('Knowledge: 300 rute menambah 3x lipatnya (tidak 100x lebih besar)', k2 - k0, 3 * 650 * pirate);

// ---------- (5) teks tooltip candi ----------
const strings = JSON.parse(readFileSync(join(__dirname, '..', 'strings', 'strings.json'), 'utf8'));
check('string candi punya parameter %0', strings.city_temple_effect3.includes('%0'), true);
check('teks candi memuat jumlah rute', loc('city_temple_effect3', [TRADE_ROUTE_MULT]).includes(String(TRADE_ROUTE_MULT)), true);

console.log(ok ? 'LOLOS' : 'GAGAL');
process.exit(ok ? 0 : 1);

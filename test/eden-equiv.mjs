// Bandingkan edenic.js lama vs baru (asphodelResist + mechStationEffect) di ribuan konfigurasi acak.
// Siapkan dulu salinan lama:  git show <commit-sebelum-edenic>:src/edenic.js > src/edenic_orig_tmp.js  (hapus lagi setelah dipakai)
import './env-setup.mjs';
await import('../src/main.js'); // urutan load normal dulu (ada circular import)
const oldM = await import('../src/edenic_orig_tmp.js');
const newM = await import('../src/edenic/edenic.js');
const { global } = await import('../src/core/vars.js');
const core = await import('../src/edenic/edenic_core.js');

// --- struktur edenicModules: urutan key + tiap field + source tiap fungsi (toString) harus identik
let sdiffs = 0;
const sbad = (m) => { sdiffs++; if (sdiffs <= 15) console.log('BEDA struktur:', m); };
function scmp(x, y, path) {
    if (typeof x === 'function' || typeof y === 'function') { if (typeof x !== typeof y || x.toString() !== y.toString()) sbad('fungsi ' + path); return; }
    if (x && typeof x === 'object') {
        if (!y || typeof y !== 'object') return sbad('tipe ' + path);
        const xa = Object.keys(x), ya = Object.keys(y);
        if (xa.join('|') !== ya.join('|')) return sbad(`field ${path}: [${xa}] vs [${ya}]`);
        xa.forEach(f => scmp(x[f], y[f], `${path}.${f}`)); return;
    }
    if (x !== y && !(Number.isNaN(x) && Number.isNaN(y))) sbad(`nilai ${path}: ${x} vs ${y}`);
}
const ta = oldM.edenicTech(), tb = newM.edenicTech();
scmp(ta, tb, 'edenic');
let nStruct = 0; Object.values(ta).forEach(r => nStruct += Object.keys(r).length);
console.log(`struktur: ${Object.keys(ta).length} region, ${nStruct} entri (termasuk info) | beda: ${sdiffs}`);
if (typeof oldM.apotheosisProjection !== 'function' || typeof newM.apotheosisProjection !== 'function') sbad('apotheosisProjection tidak ter-ekspor');

let s = 20260930; // PRNG seeded (mulberry32), terpisah dari Math.random yang di-seed env-setup
const rnd = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const pick = a => a[ri(0, a.length - 1)];
const sizes = ['collector', 'minion', 'small', 'medium', 'large', 'titan', 'fiend', 'cyberdemon', 'archfiend'];

function makeState() {
    const nMechs = ri(0, 14);
    const mechs = [];
    for (let i = 0; i < nMechs; i++) mechs.push({ size: pick(sizes), hardpoint: Array.from({ length: ri(1, 4) }, () => 'x'), equip: rnd() < 0.3 ? ['special'] : [], chassis: 'x', infernal: rnd() < 0.3 });
    return {
        asphodel: pick([undefined, 0, 4, 5, 5, 6, 6, 7]),
        station: { count: ri(0, 14), mode: pick([0, 1, 2, 3, 4, 5]), effect: ri(0, 120), mechs: ri(0, 5) },
        harvesters: ri(0, 40), trappers: ri(0, 200),
        active: rnd() < 0.85 ? ri(0, nMechs) : ri(0, nMechs + 2), // kadang > jumlah mech -> uji perilaku edge case
        mechs,
        wrath: pick([0, 0, 5, 20]), gladiator: pick([0, 0, 3]),
    };
}
function apply(st) {
    global.tech.asphodel = st.asphodel;
    global.eden.mech_station = JSON.parse(JSON.stringify(st.station));
    global.eden.asphodel_harvester = { on: st.harvesters };
    global.civic.ghost_trapper = { workers: st.trappers, display: true };
    global.portal.mechbay = { active: st.active, mechs: JSON.parse(JSON.stringify(st.mechs)) };
    global.blood.wrath = st.wrath;
    global.stats.achieve.gladiator = { l: st.gladiator };
}
function run(mod, st) {
    apply(st);
    let out = { resistBefore: mod.asphodelResist() };
    try { mod.mechStationEffect(); out.station = JSON.parse(JSON.stringify(global.eden.mech_station)); }
    catch (e) { out.threw = e.constructor.name; }
    out.resistAfter = mod.asphodelResist();
    return out;
}
const N = 20000; let diffs = 0, nonTrivial = 0, threw = 0, over110 = 0;
for (let i = 0; i < N; i++) {
    const st = makeState();
    const a = run(oldM, st), b = run(newM, st);
    if (a.threw) threw++;
    if (a.station && a.station.effect > 0) nonTrivial++;
    if (a.station && a.station.effect > 100) over110++;
    if (JSON.stringify(a) !== JSON.stringify(b)) { diffs++; if (diffs <= 5) console.log('BEDA:', JSON.stringify(st).slice(0, 300), '\n  lama:', JSON.stringify(a), '\n  baru:', JSON.stringify(b)); }
}
// uji langsung fungsi murni tanpa global sama sekali
const pureOk = core.asphodelResistCalc(undefined, undefined) === 1 && core.asphodelResistCalc(5, { count: 3, effect: 50 }) === 0.67
    && core.asphodelResistCalc(6, { count: 10, effect: 100 }) === 0.34 + 100 * 0.0066 && core.mechStationCalc({ count: 9, mode: 1 }, 5, 5, [], () => 1).effect === 0;
console.log(`konfigurasi: ${N} | effect>0: ${nonTrivial} | effect>100 (overkill): ${over110} | lempar error (sama di lama & baru): ${threw} | total beda: ${diffs} | fungsi murni ok: ${pureOk}`);
const okAll = diffs === 0 && pureOk && sdiffs === 0;
console.log(okAll ? 'EDEN SAMA PERSIS' : 'EDEN BEDA');
process.exit(okAll ? 0 : 1);

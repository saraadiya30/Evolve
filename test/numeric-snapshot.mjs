// Snapshot numerik: fungsi eden (asphodelResist, mechStationEffect) dan 6 fungsi kapal dijalankan pada ribuan
// konfigurasi acak (PRNG seeded, jadi deterministik), seluruh outputnya di-hash, lalu dibandingkan dengan
// test/snap_numeric_baseline.json.
//   node test/numeric-snapshot.mjs            -> cek (exit 1 kalau beda)
//   node test/numeric-snapshot.mjs --update   -> tulis ulang baseline (HANYA setelah perubahan perilaku yang disengaja)
// Pengganti eden-equiv.mjs dan ship-equiv.mjs: dulu keduanya membandingkan dengan salinan *_orig_tmp.js sementara.
import './env-setup.mjs';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASELINE = join(__dirname, 'snap_numeric_baseline.json');
const UPDATE = process.argv.includes('--update');

await import('../src/main.js'); // urutan load normal dulu (ada circular import)
const eden = await import('../src/edenic/edenic.js');
const ship = await import('../src/truepath/truepath.js');
const { global, p_on } = await import('../src/core/vars.js');

const prng = (seed) => {
    let s = seed;
    return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
};
const J = (v) => JSON.stringify(v);
const hasher = () => { const h = createHash('sha256'); return { add: (v) => h.update(String(v) + '\n'), done: () => h.digest('hex').slice(0, 16) }; };

// ---------- eden ----------
function edenProbe(N) {
    const rnd = prng(20260930);
    const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
    const pick = (a) => a[ri(0, a.length - 1)];
    const sizes = ['collector', 'minion', 'small', 'medium', 'large', 'titan', 'fiend', 'cyberdemon', 'archfiend'];
    const h = hasher();
    let nonTrivial = 0, threw = 0;
    for (let i = 0; i < N; i++) {
        const nMechs = ri(0, 14);
        const mechs = Array.from({ length: nMechs }, () => ({ size: pick(sizes), hardpoint: Array.from({ length: ri(1, 4) }, () => 'x'), equip: rnd() < 0.3 ? ['special'] : [], chassis: 'x', infernal: rnd() < 0.3 }));
        const st = {
            asphodel: pick([undefined, 0, 4, 5, 5, 6, 6, 7]),
            station: { count: ri(0, 14), mode: pick([0, 1, 2, 3, 4, 5]), effect: ri(0, 120), mechs: ri(0, 5) },
            harvesters: ri(0, 40), trappers: ri(0, 200),
            active: rnd() < 0.85 ? ri(0, nMechs) : ri(0, nMechs + 2),
            mechs, wrath: pick([0, 0, 5, 20]), gladiator: pick([0, 0, 3]),
        };
        global.tech.asphodel = st.asphodel;
        global.eden.mech_station = JSON.parse(J(st.station));
        global.eden.asphodel_harvester = { on: st.harvesters };
        global.civic.ghost_trapper = { workers: st.trappers, display: true };
        global.portal.mechbay = { active: st.active, mechs: JSON.parse(J(st.mechs)) };
        global.blood.wrath = st.wrath;
        global.stats.achieve.gladiator = { l: st.gladiator };
        const out = { resistBefore: eden.asphodelResist() };
        try { eden.mechStationEffect(); out.station = JSON.parse(J(global.eden.mech_station)); } catch (e) { out.threw = e.constructor.name; threw++; }
        out.resistAfter = eden.asphodelResist();
        if (out.station && out.station.effect > 0) nonTrivial++;
        h.add(J(out));
    }
    return { n: N, hash: h.done(), nonTrivial, threw };
}

// ---------- kapal ----------
function shipProbe(N) {
    const rnd = prng(777001);
    const pick = (a) => a[Math.floor(rnd() * a.length)];
    const O = {
        class: ['corvette', 'frigate', 'destroyer', 'cruiser', 'battlecruiser', 'dreadnought', 'explorer'],
        power: ['solar', 'diesel', 'fission', 'fusion', 'elerium'],
        weapon: ['railgun', 'laser', 'p_laser', 'plasma', 'phaser', 'disruptor'],
        engine: ['ion', 'tie', 'pulse', 'photon', 'vacuum', 'emdrive'],
        sensor: ['radar', 'lidar', 'quantum'],
        armor: ['steel', 'alloy', 'neutronium'],
        location: ['spc_dwarf', 'spc_moon', 'tauceti', 'spc_eris'],
    };
    const h = hasher();
    for (let i = 0; i < N; i++) {
        global.race.grenadier = pick([undefined, 1]);
        if (rnd() < 0.5) delete global.race.grenadier;
        global.race.wish = pick([undefined, 1]);
        global.race.wishStats = pick([undefined, {}, { ship: false }, { ship: true }]);
        if (global.race.wish === undefined) delete global.race.wish;
        if (global.race.wishStats === undefined) delete global.race.wishStats;
        p_on['m_relay'] = pick([0, 1]);
        global.space.m_relay = pick([undefined, { charged: 0 }, { charged: 9999 }, { charged: 10000 }, { charged: 50000 }]);
        if (global.space.m_relay === undefined) delete global.space.m_relay;
        global.space.shipyard = global.space.shipyard || {};
        global.space.shipyard.ships = Array.from({ length: Math.floor(rnd() * 9) }, () => ({ class: pick(O.class) }));
        global.tech.high_tech = pick([3, 7, 12]);
        global.race.universe = pick(['standard', 'heavy', 'micro']);
        const bp = { class: pick(O.class), power: pick(O.power), weapon: pick(O.weapon), engine: pick(O.engine), sensor: pick(O.sensor), armor: pick(O.armor), location: pick(O.location), transit: pick([0, 0, 3]) };
        const wiki = rnd() < 0.3;
        h.add(J([ship.shipCrewSize(bp), ship.shipPower(bp, wiki), ship.shipAttackPower(bp), ship.shipSpeed(bp), ship.shipFuelUse(bp), ship.shipCosts(bp)]));
    }
    return { n: N, hash: h.done() };
}

const result = { eden: edenProbe(5000), ship: shipProbe(8000) };

if (UPDATE || !existsSync(BASELINE)) {
    writeFileSync(BASELINE, JSON.stringify(result, null, 2) + '\n');
    console.log('Baseline numerik ditulis:', J(result));
    process.exit(0);
}
const base = JSON.parse(readFileSync(BASELINE, 'utf8'));
let bad = 0;
for (const k of Object.keys(result)) {
    const same = J(base[k]) === J(result[k]);
    if (!same) { bad++; console.log(`BEDA ${k}: baseline=${J(base[k])} sekarang=${J(result[k])}`); }
}
console.log(bad === 0 ? `NUMERIK SAMA (eden ${result.eden.n} + kapal ${result.ship.n} konfigurasi)` : 'NUMERIK BEDA');
process.exit(bad === 0 ? 0 : 1);

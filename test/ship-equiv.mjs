// Bandingkan truepath.js lama vs baru untuk 6 fungsi kapal (shipCrewSize/Power/AttackPower/Speed/FuelUse/Costs)
// di puluhan ribu konfigurasi acak (kelas x power x weapon x engine x sensor x armor x state global).
// Siapkan dulu salinan lama:  git show <commit-sebelum-ship>:src/truepath.js > src/truepath_orig_tmp.js  (hapus lagi setelah dipakai)
import './env-setup.mjs';
await import('../src/main.js'); // urutan load normal dulu (ada circular import)
const oldM = await import('../src/truepath_orig_tmp.js');
const newM = await import('../src/truepath/truepath.js');
const { global, p_on } = await import('../src/core/vars.js');
const core = await import('../src/systems/ship_core.js');

let s = 777001;
const rnd = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pick = a => a[Math.floor(rnd() * a.length)];
const O = {
    class: ['corvette', 'frigate', 'destroyer', 'cruiser', 'battlecruiser', 'dreadnought', 'explorer'],
    power: ['solar', 'diesel', 'fission', 'fusion', 'elerium'],
    weapon: ['railgun', 'laser', 'p_laser', 'plasma', 'phaser', 'disruptor'],
    engine: ['ion', 'tie', 'pulse', 'photon', 'vacuum', 'emdrive'],
    sensor: ['radar', 'lidar', 'quantum'],
    armor: ['steel', 'alloy', 'neutronium'],
    location: ['spc_dwarf', 'spc_moon', 'tauceti', 'spc_eris'],
};
const mk = () => ({ class: pick(O.class), power: pick(O.power), weapon: pick(O.weapon), engine: pick(O.engine), sensor: pick(O.sensor), armor: pick(O.armor), location: pick(O.location), transit: pick([0, 0, 3]) });
const J = v => JSON.stringify(v);
function setState() {
    global.race.grenadier = pick([undefined, 1]);
    if (rnd() < 0.5) delete global.race.grenadier;
    global.race.wish = pick([undefined, 1]); global.race.wishStats = pick([undefined, {}, { ship: false }, { ship: true }]);
    if (global.race.wish === undefined) delete global.race.wish;
    if (global.race.wishStats === undefined) delete global.race.wishStats;
    p_on['m_relay'] = pick([0, 1]);
    global.space.m_relay = pick([undefined, { charged: 0 }, { charged: 9999 }, { charged: 10000 }, { charged: 50000 }]);
    if (global.space.m_relay === undefined) delete global.space.m_relay;
    global.space.shipyard = global.space.shipyard || {};
    global.space.shipyard.ships = Array.from({ length: Math.floor(rnd() * 9) }, () => ({ class: pick(O.class) }));
    global.tech.high_tech = pick([3, 7, 12]);
    global.race.universe = pick(['standard', 'heavy', 'micro']);
}
const N = 30000; let diffs = 0, relayOn = 0, wishOn = 0; const per = {};
for (let i = 0; i < N; i++) {
    setState();
    const bp = mk(), wiki = rnd() < 0.3;
    if (p_on['m_relay'] && global.space.m_relay && global.space.m_relay.charged >= 10000 && bp.location === 'spc_dwarf' && bp.transit === 0) relayOn++;
    if (global.race.wish && global.race.wishStats && global.race.wishStats.ship) wishOn++;
    const checks = {
        crew: [oldM.shipCrewSize(bp), newM.shipCrewSize(bp)],
        power: [oldM.shipPower(bp, wiki), newM.shipPower(bp, wiki)],
        attack: [oldM.shipAttackPower(bp), newM.shipAttackPower(bp)],
        speed: [oldM.shipSpeed(bp), newM.shipSpeed(bp)],
        fuel: [J(oldM.shipFuelUse(bp)), J(newM.shipFuelUse(bp))],
        costs: [J(oldM.shipCosts(bp)), J(newM.shipCosts(bp))],
    };
    for (const [k, [a, b]] of Object.entries(checks)) {
        if (!Object.is(a, b)) { diffs++; per[k] = (per[k] || 0) + 1; if (diffs <= 6) console.log('BEDA', k, J(bp), '\n  lama:', a, '\n  baru:', b); }
    }
}
// fungsi murni dipanggil tanpa global sama sekali
const pureOk = core.shipCrewCalc('corvette', true, x => x) === 1 && core.shipCrewCalc('dreadnought', false, x => x) === 10
    && core.shipAttackCalc({ weapon: 'laser', class: 'corvette' }, false) === 64 && core.shipAttackCalc({ weapon: 'laser', class: 'corvette' }, true) === 80
    && core.shipSpeedCalc({ engine: 'ion', class: 'corvette', armor: 'steel' }, 3) === 36
    && core.shipCostsCalc({ class: 'corvette', armor: 'steel', engine: 'ion', power: 'solar', sensor: 'radar', weapon: 'railgun' }, 2).Money > 0;
console.log(`konfigurasi: ${N} x 6 fungsi | relay boost aktif: ${relayOn} | wish ship aktif: ${wishOn} | total beda: ${diffs} ${J(per)} | fungsi murni ok: ${pureOk}`);
console.log(diffs === 0 && pureOk ? 'SHIP SAMA PERSIS' : 'SHIP BEDA');
process.exit(diffs === 0 && pureOk ? 0 : 1);

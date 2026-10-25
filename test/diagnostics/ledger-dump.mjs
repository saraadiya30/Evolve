// Dump buku besar morale dan power (+ hasil alokasi power) per tick, untuk survei tipe stat "ledger" dan "alokasi".
// Pakai: node test/diagnostics/ledger-dump.mjs <fixture .json> <output .json> [ticks]
import { readFileSync, writeFileSync } from 'node:fs';
const [,, fixturePath, outPath = '/tmp/ledger.json', ticks = '5'] = process.argv;
const env = await import('../env-setup.mjs');
globalThis.localStorage.setItem('evolved', JSON.parse(readFileSync(fixturePath, 'utf8')).save);
env.seedMathRandom(12345); env.setFixedNow(1735689600000);
const { global: G, p_on, support_on } = await import('../../src/core/vars.js');
const { execGameLoops } = await import('../../src/main.js');
const { S_loops: S } = await import('../../src/core/registries.js');
env.seedMathRandom(12345); env.setFixedNow(1735689600000);
const clone = (o) => JSON.parse(JSON.stringify(o ?? null));
const steps = [];
for (let i = 0; i < +ticks; i++) {
    execGameLoops(1);
    steps.push({
        morale: { parts: clone(S.moraleParts), min: S.moraleMin ?? null, cap: S.moraleCap ?? null, ...clone(G.city.morale) },
        power: { parts: clone(S.powerParts), power_total: G.city.power_total, power: G.city.power, powered: G.city.powered },
        alloc: { list: clone(G.power), p_on: clone(p_on), support_on: clone(support_on), support: clone(G.support), lowPowerBalance: G.settings.lowPowerBalance },
        gaslighter: G.race.governor ? 'governor' : null,
    });
}
// jumlah/menyala tiap struktur yang ada di daftar prioritas, untuk memeriksa invarian
const state = {};
for (const key of G.power || []) { const [reg, name] = key.split(':'); const st = G[reg] && G[reg][name]; if (st) state[key] = { count: st.count, on: st.on }; }
writeFileSync(outPath, JSON.stringify({ fixture: fixturePath, version: G.version, species: G.race.species, structures: state, steps }));
console.log('ok', outPath, steps.length, 'tick,', Object.keys(state).length, 'struktur di daftar power');
process.exit(0);

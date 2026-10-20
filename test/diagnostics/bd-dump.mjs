// Dump breakdown + nilai resource setelah N tick dari sebuah fixture (untuk analisis oracle).
import { readFileSync, writeFileSync } from 'node:fs';
const [,, fixture = 'user-save-1', ticks = '5', out = '/tmp/bd_dump.json'] = process.argv;
const env = await import('../env-setup.mjs');
globalThis.localStorage.setItem('evolved', JSON.parse(readFileSync(`test/fixtures/${fixture}.json`, 'utf8')).save);
env.seedMathRandom(12345); env.setFixedNow(1735689600000);
const { global: G, breakdown } = await import('../../src/core/vars.js');
const { execGameLoops } = await import('../../src/main.js');
env.seedMathRandom(12345); env.setFixedNow(1735689600000);
const steps = [];
for (let i = 0; i < +ticks; i++) {
    execGameLoops(1);
    const snap = { resources: {}, p: JSON.parse(JSON.stringify(breakdown.p)), c: JSON.parse(JSON.stringify(breakdown.c)) };
    for (const k of Object.keys(G.resource)) { const r = G.resource[k]; if (r && typeof r.amount === 'number') snap.resources[k] = { amount: r.amount, max: r.max, diff: r.diff, delta: r.delta, display: r.display }; }
    steps.push(snap);
}
writeFileSync(out, JSON.stringify({ fixture, version: G.version, steps }));
console.log('ok', out, steps.length, 'langkah');
process.exit(0);

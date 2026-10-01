// Verifikasi: bonus storage dari lot saham tidak boleh ikut melipatgandakan kapasitas crates & containers.
// Harapan: max(lots) = base*(1+0.01*lots) + crates*cv + containers*ctv  (aether storage tidak aktif di tes ini)
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const fx = process.argv[2] || 'user-save-1';
seedMathRandom(12345); setFixedNow(1735689600000);
global.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, 'fixtures', fx + '.json'), 'utf8')).save);
const { global: G } = await import('../src/vars.js');
const { execGameLoops } = await import('../src/main.js');
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(5);
const res = ['Stone','Copper','Iron','Lumber','Aluminium'].find(r => G.resource[r] && G.resource[r].display && G.stocks.market[r]);
if (!res) { console.log('tidak ada resource yang cocok di fixture'); process.exit(2); }
const R = G.resource[res];
R.crates = 10; R.containers = 10; G.settings.aetherStorage = 0;
const run = (lots) => { G.stocks.market[res].lots = lots; for (let i = 0; i < 40; i++) execGameLoops(1); return R.max; };
const m0 = run(0), m100 = run(100);
// kapasitas dari crates+containers = m0 - base; base tidak diketahui langsung, jadi dari breakdown: ambil nilai crates/containers
const { crateValue, containerValue } = await import('../src/resources.js');
const extra = 10 * crateValue() + 10 * containerValue();
const base = m0 - extra;
const expect = base * 2 + extra;                // +100 lot = +100% pada base saja
console.log(`${res}: max(0 lot)=${m0.toFixed(1)} base=${base.toFixed(1)} extra(crates+containers)=${extra.toFixed(1)}`);
console.log(`max(100 lot)=${m100.toFixed(1)} harapan=${expect.toFixed(1)} salah-lama=${((base + extra) * 2).toFixed(1)}`);
process.exit(Math.abs(m100 - expect) < 1e-6 * expect ? 0 : 1);

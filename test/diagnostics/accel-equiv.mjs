// Bandingkan skema lama vs baru untuk accelerated time (speed 2x).
//   lama : interval dibagi 2  -> 2N tick cepat, tiap tick bernilai 1x     (MODE=old: atrack.t=0, execGameLoops(2N))
//   baru : interval normal    -> N tick cepat, tiap tick bernilai 2x      (MODE=new: atrack.t besar, execGameLoops(N))
// Pakai: MODE=old|new node test/accel-equiv.mjs <fixture> <N> <out.json>
import '../env-setup.mjs';
import { seedMathRandom, setFixedNow } from '../env-setup.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const [fx = 'user-save-1', nArg = '40', out = 'accel_out.json'] = process.argv.slice(2);
const N = parseInt(nArg, 10), mode = process.env.MODE || 'new';
seedMathRandom(12345); setFixedNow(1735689600000);
global.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, '..', 'fixtures', fx + '.json'), 'utf8')).save);
const { global: G, atrack } = await import('../../src/core/vars.js');
const { execGameLoops } = await import('../../src/main.js');
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(8);                      // pemanasan, selaras dengan loopTick kelipatan
atrack.t = 0; G.settings.at = 0;
// longgarkan storage supaya cap tidak menutupi selisih
Object.keys(G.resource).forEach(r => { if (G.resource[r].max >= 0) G.resource[r].amount = Math.min(G.resource[r].amount, G.resource[r].max * 0.3); });
const before = {}; Object.keys(G.resource).forEach(r => before[r] = G.resource[r].amount);
const days0 = G.stats.days;
if (mode === 'new') { atrack.t = 100000; G.settings.at = 100000; execGameLoops(N); }
else { execGameLoops(2 * N); }
const res = {};
Object.keys(G.resource).forEach(r => { res[r] = { gain: G.resource[r].amount - before[r], diff: G.resource[r].diff, max: G.resource[r].max }; });
writeFileSync(join(__dirname, out), JSON.stringify({ mode, days: G.stats.days - days0, res }, null, 1));
console.log(`[accel-equiv] mode=${mode} N=${N} hari berlalu=${G.stats.days - days0}`);
process.exit(0);

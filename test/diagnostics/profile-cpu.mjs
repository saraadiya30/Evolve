// Profil CPU game loop (self time per fungsi dan per file) pakai inspector bawaan Node.
// Pakai: node test/launch.cjs test/diagnostics/profile-cpu.mjs [fixture=user-save-1] [ticks=400] [top=25]
// Catatan: jsdom tidak merender apa pun, jadi waktu DOM di sini hanya biaya JS (jQuery/jsdom), bukan waktu render browser.
// Untuk waktu sebenarnya di browser tetap pakai Chrome DevTools. Angka ini berguna buat membandingkan SEBELUM vs SESUDAH.
import '../env-setup.mjs';
import { seedMathRandom, setFixedNow } from '../env-setup.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import inspector from 'node:inspector';

const __dirname = dirname(fileURLToPath(import.meta.url));
const [fx = 'user-save-1', nArg = '400', topArg = '25'] = process.argv.slice(2);
const N = parseInt(nArg, 10), TOP = parseInt(topArg, 10);
seedMathRandom(12345); setFixedNow(1735689600000);
globalThis.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, '..', 'fixtures', fx + '.json'), 'utf8')).save);
const { global: G, atrack } = await import('../../src/core/vars.js');
const { execGameLoops } = await import('../../src/main.js');
seedMathRandom(12345); setFixedNow(1735689600000);
atrack.t = 0; G.settings.at = 0;
execGameLoops(60); // pemanasan (JIT, cache)

const session = new inspector.Session(); session.connect();
const post = (m, p) => new Promise((res, rej) => session.post(m, p, (e, r) => e ? rej(e) : res(r)));
await post('Profiler.enable');
await post('Profiler.setSamplingInterval', { interval: 100 });
await post('Profiler.start');
const t0 = process.hrtime.bigint();
execGameLoops(N);
const ms = Number(process.hrtime.bigint() - t0) / 1e6;
const { profile } = await post('Profiler.stop');

const nodes = new Map(profile.nodes.map(n => [n.id, n]));
const self = new Map(); // id -> mikrodetik
for (let i = 0; i < profile.samples.length; i++) self.set(profile.samples[i], (self.get(profile.samples[i]) || 0) + (profile.timeDeltas[i] || 0));
const byFn = new Map(), byFile = new Map(); let total = 0;
const short = u => (u || '').replace(/^.*\/(src|node_modules)\//, '$1/').replace('file://', '');
for (const [id, us] of self) {
    const cf = nodes.get(id).callFrame; total += us;
    const file = short(cf.url) || '(native)';
    const key = `${cf.functionName || '(anonim)'}  ${file}:${cf.lineNumber + 1}`;
    byFn.set(key, (byFn.get(key) || 0) + us);
    byFile.set(file, (byFile.get(file) || 0) + us);
}
const pct = us => (100 * us / total).toFixed(1).padStart(5) + '%';
console.log(`fixture=${fx} ticks=${N} waktu=${ms.toFixed(0)}ms (${(ms / N).toFixed(2)} ms/tick) sampel=${profile.samples.length}`);
console.log(`\nFungsi paling berat (self time), top ${TOP}:`);
[...byFn].sort((a, b) => b[1] - a[1]).slice(0, TOP).forEach(([k, us]) => console.log(`${pct(us)} ${(us / 1000).toFixed(0).padStart(6)}ms  ${k}`));
console.log(`\nFile paling berat (self time), top ${Math.min(TOP, 15)}:`);
[...byFile].sort((a, b) => b[1] - a[1]).slice(0, Math.min(TOP, 15)).forEach(([k, us]) => console.log(`${pct(us)} ${(us / 1000).toFixed(0).padStart(6)}ms  ${k}`));

// Kode game saja (src/): biaya logika JS sendiri, tanpa jQuery/jsdom yang di jsdom jauh lebih mahal daripada di browser.
const gameFn = [...byFn].filter(([k]) => k.includes(' src/')), gameTotal = gameFn.reduce((s, [, us]) => s + us, 0);
console.log(`\nKode game (src/) = ${(100 * gameTotal / total).toFixed(1)}% dari total (${(gameTotal / 1000).toFixed(0)}ms = ${(gameTotal / 1000 / N).toFixed(2)} ms/tick). Fungsi game paling berat:`);
gameFn.sort((a, b) => b[1] - a[1]).slice(0, TOP).forEach(([k, us]) => console.log(`${(100 * us / gameTotal).toFixed(1).padStart(5)}% ${(us / 1000).toFixed(0).padStart(6)}ms  ${k}`));
process.exit(0);

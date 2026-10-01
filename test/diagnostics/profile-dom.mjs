// Proksi profil DOM (BUKAN pengganti profiler browser): hitung berapa kali jQuery dipanggil per tick game.
// Pakai: node test/diagnostics/profile-dom.mjs [fixture=user-save-1] [ticks=200]
// Catatan: jsdom tidak merender apa pun, jadi angka ini hanya menunjukkan SEBERAPA BANYAK kerja DOM yang diminta game,
// bukan berapa lama browser mengerjakannya. Untuk waktu sebenarnya pakai Chrome DevTools (lihat docs/PROFILING.md).
import '../env-setup.mjs';
import { seedMathRandom, setFixedNow } from '../env-setup.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const [fx = 'user-save-1', nArg = '200'] = process.argv.slice(2);
const N = parseInt(nArg, 10);
seedMathRandom(12345); setFixedNow(1735689600000);
globalThis.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, '..', 'fixtures', fx + '.json'), 'utf8')).save);
const { global: G, atrack } = await import('../../src/core/vars.js');
const { execGameLoops } = await import('../../src/main.js');
seedMathRandom(12345); setFixedNow(1735689600000);
atrack.t = 0; G.settings.at = 0;
execGameLoops(40); // pemanasan

const $ = globalThis.$ || globalThis.jQuery;
const counts = {};
let selectorCalls = 0;
for (const name of Object.keys($.fn)) {
    const orig = $.fn[name];
    if (typeof orig !== 'function' || name === 'constructor' || name === 'init') continue;
    $.fn[name] = function (...a) { counts[name] = (counts[name] || 0) + 1; return orig.apply(this, a); };
}
const origInit = $.fn.init;
$.fn.init = function (...a) { selectorCalls++; return new origInit(...a); };
$.fn.init.prototype = $.fn;

const t0 = process.hrtime.bigint();
execGameLoops(N);
const ms = Number(process.hrtime.bigint() - t0) / 1e6;
const total = Object.values(counts).reduce((s, x) => s + x, 0);
console.log(`ticks=${N} waktu=${ms.toFixed(0)}ms | $(...) ${(selectorCalls / N).toFixed(0)}/tick | method jQuery ${(total / N).toFixed(0)}/tick`);
console.log('Method jQuery paling sering (per tick):');
Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([k, v]) => console.log(`  ${(v / N).toFixed(1).padStart(8)}  .${k}()`));
process.exit(0);

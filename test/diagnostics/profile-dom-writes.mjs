// Cari tulis DOM yang MUBAZIR: jQuery .html/.text/.addClass/.removeClass/.prop/.attr/.css yang menulis nilai yang SUDAH sama.
// Pakai: node test/diagnostics/profile-dom-writes.mjs [fixture=user-save-1] [ticks=300]
// Keluaran: per baris sumber (src/...:baris) jumlah panggilan per tick dan persentase yang mubazir.
// Catatan: jsdom tidak merender, jadi ini mengukur JUMLAH tulis DOM, bukan waktunya. Di browser tiap tulis bisa memicu
// recalculate style / layout, jadi mengurangi tulis mubazir hampir selalu membantu. Konfirmasi di Chrome Performance (docs/PROFILING.md).
import '../env-setup.mjs';
import { seedMathRandom, setFixedNow } from '../env-setup.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const [fx = 'user-save-1', nArg = '300'] = process.argv.slice(2);
const N = parseInt(nArg, 10);
seedMathRandom(12345); setFixedNow(1735689600000);
globalThis.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, '..', 'fixtures', fx + '.json'), 'utf8')).save);
const { global: G, atrack } = await import('../../src/core/vars.js');
const { execGameLoops } = await import('../../src/main.js');
seedMathRandom(12345); setFixedNow(1735689600000);
atrack.t = 0; G.settings.at = 0;
execGameLoops(60);

const $ = globalThis.$ || globalThis.jQuery;
const site = () => {
    const lines = new Error().stack.split('\n');
    for (const l of lines.slice(2)) { const m = /\/src\/([^:)]+):(\d+)/.exec(l); if (m) return m[1] + ':' + m[2]; }
    return '(luar src)';
};
const stats = new Map();
const rec = (kind, redundant) => {
    const k = kind + ' @ ' + site();
    const s = stats.get(k) || { n: 0, red: 0 };
    s.n++; if (redundant) s.red++;
    stats.set(k, s);
};
const wrap = (name, isRedundant) => {
    const orig = $.fn[name];
    $.fn[name] = function (...a) {
        let red = false;
        try { red = isRedundant(this, a); } catch { red = false; }
        if (red !== null) rec(name, red);
        return orig.apply(this, a);
    };
};
const all = (set, f) => set.length > 0 && set.toArray().every(f);
wrap('html', (s, a) => (a.length && typeof a[0] !== 'function') ? all(s, (e) => e.innerHTML === String(a[0])) : null);
wrap('text', (s, a) => (a.length && typeof a[0] !== 'function') ? all(s, (e) => e.textContent === String(a[0])) : null);
wrap('addClass', (s, a) => (typeof a[0] === 'string') ? all(s, (e) => a[0].split(/\s+/).filter(Boolean).every((c) => e.classList.contains(c))) : null);
wrap('removeClass', (s, a) => (typeof a[0] === 'string') ? all(s, (e) => a[0].split(/\s+/).filter(Boolean).every((c) => !e.classList.contains(c))) : null);
wrap('prop', (s, a) => (a.length >= 2 && typeof a[0] === 'string') ? all(s, (e) => e[a[0]] === a[1]) : null);
wrap('attr', (s, a) => (a.length >= 2 && typeof a[0] === 'string') ? all(s, (e) => e.getAttribute(a[0]) === String(a[1])) : null);
wrap('css', (s, a) => (a.length >= 2 && typeof a[0] === 'string') ? all(s, (e) => e.style[a[0]] === String(a[1])) : null);

const t0 = process.hrtime.bigint();
execGameLoops(N);
const ms = Number(process.hrtime.bigint() - t0) / 1e6;
let total = 0, red = 0;
for (const s of stats.values()) { total += s.n; red += s.red; }
console.log(`ticks=${N} | tulis DOM ${(total / N).toFixed(0)}/tick, MUBAZIR ${(red / N).toFixed(0)}/tick (${(100 * red / Math.max(1, total)).toFixed(0)}%) | waktu ${ms.toFixed(0)}ms (dengan instrumentasi)`);
console.log('\nBaris dengan tulis mubazir terbanyak (per tick):');
[...stats].filter(([, s]) => s.red > 0).sort((a, b) => b[1].red - a[1].red).slice(0, 18).forEach(([k, s]) =>
    console.log(`  ${(s.red / N).toFixed(1).padStart(7)}/tick mubazir dari ${(s.n / N).toFixed(1).padStart(6)}/tick  ${k}`));
process.exit(0);

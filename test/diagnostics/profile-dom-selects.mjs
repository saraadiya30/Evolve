// Hitung PENCARIAN elemen jQuery per tick menurut baris sumber: $("selector"), .find("selector"), dan .each().
// Pakai: node test/diagnostics/profile-dom-selects.mjs [fixture=user-save-1] [ticks=300]
// Pencarian dengan selector string memindai DOM; di browser dengan DOM besar tiap pencarian berbiaya beda-beda, jadi baris yang
// menghasilkan ratusan pencarian per tick adalah kandidat utama untuk di-cache (simpan elemennya) atau dihapus.
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
const rec = (kind, sel) => {
    const k = kind + ' @ ' + site();
    const s = stats.get(k) || { n: 0, sel: new Map() };
    s.n++; s.sel.set(sel, (s.sel.get(sel) || 0) + 1);
    stats.set(k, s);
};
const origInit = $.fn.init;
const wrapped = function (selector, ...rest) {
    if (typeof selector === 'string' && !selector.trim().startsWith('<')) rec('$()', selector);
    return new origInit(selector, ...rest);
};
wrapped.prototype = $.fn;
$.fn.init = wrapped;
const origFind = $.fn.find;
$.fn.find = function (sel, ...rest) { if (typeof sel === 'string') rec('.find()', sel); return origFind.call(this, sel, ...rest); };
const origEach = $.fn.each;
$.fn.each = function (cb) { rec('.each()', `(${this.length} elemen)`); return origEach.call(this, cb); };

execGameLoops(N);
let total = 0;
for (const s of stats.values()) total += s.n;
console.log(`ticks=${N} | pencarian/iterasi jQuery: ${(total / N).toFixed(0)}/tick`);
console.log('\nBaris dengan pencarian terbanyak (per tick), beserta selector paling sering:');
[...stats].sort((a, b) => b[1].n - a[1].n).slice(0, 14).forEach(([k, s]) => {
    const top = [...s.sel].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([x, c]) => `${x.slice(0, 40)} x${(c / N).toFixed(1)}`).join(' | ');
    console.log(`  ${(s.n / N).toFixed(1).padStart(7)}/tick  ${k.padEnd(52)} ${top}`);
});
process.exit(0);

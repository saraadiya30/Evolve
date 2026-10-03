// Tes ekuivalensi generik: bandingkan modul lama (salinan *_orig_tmp.js di src/) vs modul baru.
//   node test/obj-equiv.mjs <modul.js> '<expr1>' ['<expr2>' ...]       (expr: fungsi (m)=>objek, mis. 'm=>m.fortressTech()')
//   env ALLOW_EXTRA=nama1,nama2  -> ekspor baru yang memang boleh bertambah
// Siapkan salinan lama:  git show <commit-lama>:src/<modul>.js > src/<modul-tanpa-.js>_orig_tmp.js  (hapus lagi setelah dipakai)
// Yang dibandingkan: daftar ekspor, lalu tiap objek: urutan key, field, nilai primitif, dan source tiap fungsi (toString).
import './env-setup.mjs';
// FIXTURE=<nama> (opsional): muat save itu sebelum modul di-import. CUSTOM_RACE=1: tambahkan slot ras kustom (global.custom)
// supaya jalur yang dievaluasi saat LOAD (races.custom / races.hybrid) ikut teruji.
if (process.env.FIXTURE) {
    const { readFileSync } = await import('node:fs');
    const fx = JSON.parse(readFileSync(new URL('./fixtures/' + process.env.FIXTURE + '.json', import.meta.url), 'utf8'));
    let save = fx.save;
    if (process.env.CUSTOM_RACE) {
        const g = JSON.parse(globalThis.LZString.decompressFromUTF16(save));
        const mk = (name, hyb) => ({ name, desc: 'desc ' + name, genus: 'humanoid', home: 'home', entity: 'entity', red: 'red', hell: 'hell', gas: 'gas', gas_moon: 'gm', dwarf: 'dw',
            traits: ['pathetic', 'carnivore', 'kindling_kindred', 'fiery', 'tough'], ranks: { carnivore: 2 }, fanaticism: false, ...(hyb ? { hybrid: ['human', 'elven'] } : {}) });
        g.custom = { race0: mk('Kustom A', false), race1: mk('Kustom B', true) };
        save = globalThis.LZString.compressToUTF16(JSON.stringify(g));
    }
    globalThis.localStorage.setItem('evolved', save);
}
await import('../src/main.js'); // urutan load normal dulu (ada circular import)
const [mod, ...exprs] = process.argv.slice(2);
const orig = mod.replace(/\.js$/, '_orig_tmp.js');
const oldM = await import('../src' + orig);
const newM = await import('../src' + mod);
let diffs = 0;
const bad = (m) => { diffs++; if (diffs <= 15) console.log('BEDA:', m); };
function cmp(x, y, path, seen = new Set()) {
    if (typeof x === 'function' || typeof y === 'function') { if (typeof x !== typeof y || x.toString() !== y.toString()) bad('fungsi ' + path); return; }
    if (x && typeof x === 'object') {
        if (!y || typeof y !== 'object') return bad('tipe ' + path);
        if (seen.has(x)) return; seen.add(x);
        const xa = Object.keys(x), ya = Object.keys(y);
        if (xa.join('|') !== ya.join('|')) return bad(`field ${path}: [${xa.slice(0, 40)}] vs [${ya.slice(0, 40)}]`);
        xa.forEach(f => cmp(x[f], y[f], `${path}.${f}`, seen)); return;
    }
    if (x !== y && !(Number.isNaN(x) && Number.isNaN(y))) bad(`nilai ${path}: ${x} vs ${y}`);
}
const allow = new Set((process.env.ALLOW_EXTRA || '').split(',').filter(Boolean));
const ko = Object.keys(oldM).sort(), kn = Object.keys(newM).filter(k => !(allow.has(k) && !(k in oldM))).sort();
if (ko.join('|') !== kn.join('|')) bad(`daftar ekspor: lama [${ko}] vs baru [${kn}]`);
for (const k of ko) if (typeof oldM[k] === 'function' && typeof newM[k] === 'function' && oldM[k].toString() !== newM[k].toString()) bad('source fungsi ekspor ' + k);
let n = 0;
for (const e of exprs) {
    const f = (0, eval)(e);
    const a = f(oldM), b = f(newM);
    cmp(a, b, e);
    if (a && typeof a === 'object') { const c = (o, d = 0) => d > 3 ? 0 : Object.values(o).reduce((s, v) => s + (v && typeof v === 'object' && !Array.isArray(v) ? 1 + c(v, d + 1) : 1), 0); n += c(a); }
}
console.log(`${mod}: ekspor ${ko.length} | objek diperiksa ${exprs.length} (~${n} simpul) | total beda: ${diffs}`);
console.log(diffs === 0 ? 'OBJ SAMA PERSIS' : 'OBJ BEDA');
process.exit(diffs === 0 ? 0 : 1);

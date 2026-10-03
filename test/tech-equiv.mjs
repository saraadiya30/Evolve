// Bandingkan techs lama vs tech.js baru. Siapkan dulu salinan lama:
//   git show <commit-sebelum-split>:src/tech.js > src/tech_orig_tmp.js   (hapus lagi setelah dipakai)
import './env-setup.mjs';
await import('../src/main.js'); // urutan load normal dulu (ada circular import)
const oldM = await import('../src/tech_orig_tmp.js');
const newM = await import('../src/tech/tech.js');
const a = oldM.techList(), b = newM.techList();
const ka = Object.keys(a), kb = Object.keys(b);
let diffs = 0;
const bad = (m) => { diffs++; if (diffs <= 20) console.log('BEDA:', m); };
if (ka.length !== kb.length) bad(`jumlah entri ${ka.length} vs ${kb.length}`);
ka.forEach((k, i) => { if (kb[i] !== k) bad(`urutan key ke-${i}: ${k} vs ${kb[i]}`); });
function cmp(x, y, path) {
    if (typeof x === 'function' || typeof y === 'function') {
        if (typeof x !== typeof y || x.toString() !== y.toString()) bad(`fungsi ${path}`);
        return;
    }
    if (x && typeof x === 'object') {
        if (!y || typeof y !== 'object') return bad(`tipe ${path}`);
        let xa = Object.keys(x), ya = Object.keys(y);
        // Urutan field di dalam SATU entri techs (kedalaman 1) sengaja tidak dipermasalahkan: data statis kini digabung di depan logika.
        if (!path.includes('.') && !Array.isArray(x)) { xa = [...xa].sort(); ya = [...ya].sort(); }
        if (xa.join('|') !== ya.join('|')) return bad(`field ${path}: [${xa}] vs [${ya}]`);
        xa.forEach(f => cmp(x[f], y[f], `${path}.${f}`));
        return;
    }
    if (x !== y && !(Number.isNaN(x) && Number.isNaN(y))) bad(`nilai ${path}: ${x} vs ${y}`);
}
ka.forEach(k => { if (b[k]) cmp(a[k], b[k], k); });
console.log(`entri: ${ka.length} vs ${kb.length}; total beda: ${diffs}`);
console.log(diffs === 0 ? 'TECHS SAMA PERSIS' : 'TECHS BEDA');
console.log('swissKnife sama:', oldM.swissKnife(true) === newM.swissKnife(true), '| techPath sama:', JSON.stringify(oldM.techPath) === JSON.stringify(newM.techPath));
process.exit(diffs === 0 ? 0 : 1);

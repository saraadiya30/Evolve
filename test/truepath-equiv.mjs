// Bandingkan truepath.js lama vs baru: struktur outerTruth + tauCetiModules (urutan key, field, nilai, source tiap fungsi)
// dan daftar ekspor modul. Siapkan dulu salinan lama:
//   git show <commit-sebelum-split>:src/truepath.js > src/truepath_orig_tmp.js   (hapus lagi setelah dipakai)
import './env-setup.mjs';
await import('../src/main.js'); // urutan load normal dulu (ada circular import)
const oldM = await import('../src/truepath_orig_tmp.js');
const newM = await import('../src/truepath.js');
let diffs = 0;
const bad = (m) => { diffs++; if (diffs <= 15) console.log('BEDA:', m); };
function cmp(x, y, path) {
    if (typeof x === 'function' || typeof y === 'function') { if (typeof x !== typeof y || x.toString() !== y.toString()) bad('fungsi ' + path); return; }
    if (x && typeof x === 'object') {
        if (!y || typeof y !== 'object') return bad('tipe ' + path);
        const xa = Object.keys(x), ya = Object.keys(y);
        if (xa.join('|') !== ya.join('|')) return bad(`field ${path}: [${xa}] vs [${ya}]`);
        xa.forEach(f => cmp(x[f], y[f], `${path}.${f}`)); return;
    }
    if (x !== y && !(Number.isNaN(x) && Number.isNaN(y))) bad(`nilai ${path}: ${x} vs ${y}`);
}
// drawShips sengaja baru di-export (dipakai tp_tau_home.js); selain itu daftar ekspor harus sama
const ko = Object.keys(oldM).sort(), kn = Object.keys(newM).filter(k => k !== 'drawShips').sort();
if (!Object.keys(newM).includes('drawShips')) bad('drawShips tidak ter-export');
if (ko.join('|') !== kn.join('|')) bad(`daftar ekspor: lama [${ko}] vs baru [${kn}]`);
let n = 0;
for (const [name, fo, fnw] of [['outerTruth', oldM.outerTruthTech, newM.outerTruthTech], ['tauCeti', oldM.tauCetiTech, newM.tauCetiTech]]) {
    const a = fo(), b = fnw();
    cmp(a, b, name);
    Object.values(a).forEach(r => n += Object.keys(r).length);
}
// fungsi non-region yang dipindah/di-re-export harus identik sumbernya
for (const f of ['tpStorageMultiplier', 'calcAIDrift', 'tauEnabled', 'syndicate', 'shipCosts', 'loneSurvivor', 'renderTauCeti']) {
    if (typeof newM[f] !== 'function') bad('ekspor hilang/bukan fungsi: ' + f);
    else if (newM[f].toString() !== oldM[f].toString()) bad('source berbeda: ' + f);
}
// perilaku fungsi pendukung (membaca global yang sama) di beberapa state
const { global } = await import('../src/vars.js');
let beh = 0;
for (const t of [undefined, 1, 3, 4, 5]) for (const u of ['standard', 'heavy', 'micro']) {
    global.tech.tauceti = t; global.race.universe = u;
    for (const heavy of [false, true]) for (const typ of ['Money', 'Steel', 'Helium_3']) {
        const a = String(oldM.tpStorageMultiplier(typ, heavy, false)), b = String(newM.tpStorageMultiplier(typ, heavy, false));
        if (a !== b) bad(`tpStorageMultiplier(${typ},${heavy}) ${a} vs ${b}`); beh++;
    }
    if (oldM.tauEnabled() !== newM.tauEnabled()) bad('tauEnabled'); beh++;
}
console.log(`region: outerTruth ${Object.keys(oldM.outerTruthTech()).length} + tauCeti ${Object.keys(oldM.tauCetiTech()).length} | entri: ${n} | ekspor: ${ko.length} | cek perilaku: ${beh} | total beda: ${diffs}`);
console.log(diffs === 0 ? 'TRUEPATH SAMA PERSIS' : 'TRUEPATH BEDA');
process.exit(diffs === 0 ? 0 : 1);

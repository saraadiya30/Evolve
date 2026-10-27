// (Hash fungsi tidak peka spasi/indentasi: memindahkan kode ke dalam fungsi tidak dianggap perubahan.)
// Dump "tanda tangan" struktur objek besar game ke JSON: urutan key, field, nilai primitif, dan hash source tiap fungsi.
// Dipakai untuk membandingkan dua pohon sumber (mis. worktree commit lama vs kerja sekarang):
//   node test/dump-struct.mjs out.json     (jalankan di masing-masing pohon, lalu `diff` / test/compare-struct.mjs)
import { setFixedNow } from './env-setup.mjs';
// Game punya event musiman (Halloween, Natal, Paskah, dst) yang mengubah isi races/techs/actions menurut tanggal HARI INI
// (mis. Human jadi Zombie, Casino jadi Cursed Carnival). Supaya hash struktur tidak ikut berubah tiap musim, dump selalu dibuat
// pada tanggal di luar semua event. Event itu sendiri diuji terpisah dengan tanggal yang disengaja.
setFixedNow(Date.UTC(2026, 5, 15, 12, 0, 0));
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
await import('../src/main.js');
const h = s => createHash('sha1').update(s).digest('hex').slice(0, 12);
const seen = new WeakSet();
function sig(x, depth = 0) {
    if (typeof x === 'function') return 'fn:' + h(x.toString().replace(/\s+/g, ' ').replace(/ ?([{}();,]) ?/g, '$1'));
    if (x === null || typeof x !== 'object') return typeof x === 'number' && Number.isNaN(x) ? 'NaN' : x;
    if (seen.has(x)) return '<cycle>'; seen.add(x);
    const out = Object.keys(x).map(k => [k, sig(x[k], depth + 1)]);
    seen.delete(x); return out;
}
const T = await import('../src/tech/tech.js'), E = await import('../src/edenic/edenic.js'), A = await import('../src/actions/actions.js'), FD = await import('../src/portal/hell/fortress_tech.js'), SR = await import('../src/space/space_requirements.js');
const P = await import('../src/portal/portal.js'), S = await import('../src/space/space.js'), AC = await import('../src/achievements/achieve.js');
const TL = await import('../src/tech/tech_list.js'), G = await import('../src/governor/governor.js'), EV = await import('../src/events/events.js'), RG = await import('../src/core/registries.js'), TC = await import('../src/truepath/tau_ceti_shipyard.js'), ET = await import('../src/edenic/edenic_tech.js'), FT = await import('../src/achievements/feats.js');
const out = {
    techs: sig(TL.techList()), edenic: sig(ET.edenicTech()), traits: sig(RG.traits), races: sig(RG.races), actions: sig(A.actions),
    fortress: sig(FD.fortressTech()), monsters: sig(RG.monsters), space: sig(SR.spaceTech()), inter: sig(SR.interstellarTech()), galaxy: sig(SR.galaxyTech()),
    outerTruth: sig(TC.outerTruthTech()), tauCeti: sig(TC.tauCetiTech()), perkList: sig(RG.perkList), feats: sig(FT.feats),
    genePool: sig(RG.genePool), bloodPool: sig(RG.bloodPool), arpaProjects: sig(RG.arpaProjects), gov_tasks: sig(G.gov_tasks), gov_traits: sig(RG.gov_traits), events: sig(EV.events),
};
const exportsOf = { T, E, A, P, S, AC, G, EV };
out.exports = Object.fromEntries(Object.entries(exportsOf).map(([k, m]) => [k, Object.keys(m).sort()]));
writeFileSync(process.argv[2], JSON.stringify(out));
const n = JSON.stringify(out).length;
console.log('dump ok:', Object.keys(out).length, 'bagian,', n, 'byte');
process.exit(0);

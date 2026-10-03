// Dump "tanda tangan" struktur objek besar game ke JSON: urutan key, field, nilai primitif, dan hash source tiap fungsi.
// Dipakai untuk membandingkan dua pohon sumber (mis. worktree commit lama vs kerja sekarang):
//   node test/dump-struct.mjs out.json     (jalankan di masing-masing pohon, lalu `diff` / test/compare-struct.mjs)
import './env-setup.mjs';
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
await import('../src/main.js');
const h = s => createHash('sha1').update(s).digest('hex').slice(0, 12);
const seen = new WeakSet();
function sig(x, depth = 0) {
    if (typeof x === 'function') return 'fn:' + h(x.toString());
    if (x === null || typeof x !== 'object') return typeof x === 'number' && Number.isNaN(x) ? 'NaN' : x;
    if (seen.has(x)) return '<cycle>'; seen.add(x);
    const o = {}; // urutan key dicatat lewat array pasangan
    const out = Object.keys(x).map(k => [k, sig(x[k], depth + 1)]);
    seen.delete(x); return out;
}
const T = await import('../src/tech/tech.js'), E = await import('../src/edenic/edenic.js'), R = await import('../src/races/races.js'), A = await import('../src/actions/actions.js');
const P = await import('../src/portal/portal.js'), S = await import('../src/space/space.js'), TP = await import('../src/truepath/truepath.js'), AC = await import('../src/achievements/achieve.js');
const AR = await import('../src/arpa/arpa.js'), G = await import('../src/governor/governor.js'), EV = await import('../src/events/events.js');
const out = {
    techs: sig(T.techList()), edenic: sig(E.edenicTech()), traits: sig(R.traits), races: sig(R.races), actions: sig(A.actions),
    fortress: sig(P.fortressTech()), monsters: sig(P.monsters), space: sig(S.spaceTech()), inter: sig(S.interstellarTech()), galaxy: sig(S.galaxyTech()),
    outerTruth: sig(TP.outerTruthTech()), tauCeti: sig(TP.tauCetiTech()), perkList: sig(AC.perkList), feats: sig(AC.feats),
    genePool: sig(AR.genePool), bloodPool: sig(AR.bloodPool), arpaProjects: sig(AR.arpaProjects), gov_tasks: sig(G.gov_tasks), gov_traits: sig(G.gov_traits), events: sig(EV.events),
};
const exportsOf = { T, E, R, A, P, S, TP, AC, AR, G, EV };
out.exports = Object.fromEntries(Object.entries(exportsOf).map(([k, m]) => [k, Object.keys(m).sort()]));
writeFileSync(process.argv[2], JSON.stringify(out));
const n = JSON.stringify(out).length;
console.log('dump ok:', Object.keys(out).length, 'bagian,', n, 'byte');
process.exit(0);

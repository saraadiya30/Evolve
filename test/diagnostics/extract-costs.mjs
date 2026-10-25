// Ekstrak SEMUA definisi cost dari sumber game menjadi AST deklaratif (lihat cost-ast.mjs).
// Pakai: node test/diagnostics/extract-costs.mjs <output .json>
import { writeFileSync } from 'node:fs';
import { buildLibraryIndex, makeConverter, loadConstants, buildConstantIndex, librarySource, duplicateNames, PREFER } from './cost-ast.mjs';
const out = process.argv[2] || '/tmp/costs.ast.json';
const env = await import('../env-setup.mjs');
env.seedMathRandom(12345); env.setFixedNow(1735689600000);
await import('../../src/core/vars.js'); await import('../../src/main.js');
const { actions } = await import('../../src/core/registries.js');

const SKIP = new Set(['tech', 'genes', 'blood', 'arpa']);
const structs = [];
const walk = (obj, path, depth) => { for (const k of Object.keys(obj || {})) { const v = obj[k]; if (!v || typeof v !== 'object') continue;
    if (typeof v.cost === 'object' && typeof v.struct === 'function') structs.push({ id: [...path, k].join('.'), a: v }); else if (depth < 2) walk(v, [...path, k], depth + 1); } };
for (const top of Object.keys(actions)) if (!SKIP.has(top)) walk(actions[top], [top], 0);

const libIdx = buildLibraryIndex('src');
const dupWarn = Object.fromEntries(Object.entries(duplicateNames).map(([n, files]) => [n, { files, dipilih: libIdx[n] }]));
const cv = makeConverter(libIdx, { ...buildConstantIndex('src'), ...loadConstants('src/config/constants.js') });
// Fungsi pustaka yang dipakai kode engine (bukan hanya ekspresi cost): ikut diterjemahkan.
// adjustCosts (rantai 16 adjuster), modifier pertumbuhan (costMultiplier/spaceCostMultiplier), dan yang dipakainya: semuanya data juga.
for (const name of ['adjustCosts', 'costMultiplier', 'spaceCostMultiplier', 'highPopAdjust']) { if (!cv.used[name]) { cv.used[name] = null; cv.used[name] = cv.convertFunction(librarySource(name, libIdx)); } }
const data = {}; const stats = { costs: 0, ok: 0, failed: 0, structs: structs.length, structsAllOk: 0 }; const why = {};
for (const { id, a } of structs) {
    let self = null; try { const p = a.struct().p; self = { structure: p[0], region: p[1] }; } catch (e) { /* tanpa struct */ }
    const defs = {}; let all = true;
    for (const res of Object.keys(a.cost)) {
        stats.costs++;
        try { const f = cv.convertFunction(a.cost[res].toString()); defs[res] = { params: f.params, expr: f.body }; stats.ok++; }
        catch (e) { all = false; stats.failed++; const k = String(e.message).slice(0, 80); why[k] = (why[k] || 0) + 1; defs[res] = { unsupported: String(e.message), src: a.cost[res].toString().replace(/\s+/g, ' ').slice(0, 300) }; }
    }
    if (all) stats.structsAllOk++;
    data[id] = { self, props: { path: Array.isArray(a.path) ? a.path : null }, costs: defs };
}
// Inventaris fakta yang harus disuplai dump: panggilan eksternal (argumen harus literal), trait, p_on, support_on.
const ext = new Map(); const traitRefs = new Set(); const pOn = new Set(); const supportOn = new Set(); const nonLiteral = [];
const scan = (n) => {
    if (Array.isArray(n)) return n.forEach(scan);
    if (n && typeof n === 'object') {
        if (n.op === 'ext') { if (n.args.every((x) => ['number', 'string', 'boolean'].includes(typeof x))) ext.set(`${n.name}(${JSON.stringify(n.args)})`, { name: n.name, args: n.args }); else nonLiteral.push(n); }
        if (n.ref === 'traitVars') { if (n.rank !== null && typeof n.rank !== 'number') nonLiteral.push(n); traitRefs.add(`${n.table}.${n.name}${n.rank !== null && typeof n.rank === 'number' ? '@' + n.rank : ''}`); }
        if (n.ref === 'pOn') pOn.add(n.name); if (n.ref === 'supportOn') supportOn.add(n.name);
        Object.values(n).forEach(scan);
    }
};
for (const sd of Object.values(data)) for (const c of Object.values(sd.costs)) if (c.expr !== undefined) scan(c.expr);
for (const f of Object.values(cv.used)) scan(f.body);
const facts = { externals: [...ext.values()], traitRefs: [...traitRefs].sort(), pOn: [...pOn].sort(), supportOn: [...supportOn].sort(), nonLiteral: nonLiteral.length };
writeFileSync(out, JSON.stringify({ stats, why, facts, library: cv.used, data }));
console.log(JSON.stringify({ stats, why, library: Object.keys(cv.used).length, namaGanda: dupWarn, facts }, null, 1));
process.exit(0);

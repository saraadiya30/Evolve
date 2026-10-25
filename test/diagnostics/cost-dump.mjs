// Dump cost bangunan (mentah dan setelah semua adjuster) per jumlah bangunan + FAKTA state, untuk oracle cost.
// Pakai: node test/diagnostics/cost-dump.mjs <fixture .json> <output .json> <costs.ast.json (dari extract-costs.mjs)>
// Semua struktur diinisialisasi dulu supaya hasil tidak bergantung urutan loop; jumlah bangunan hanya divariasikan pada struktur yang diukur.
import { readFileSync, writeFileSync } from 'node:fs';
import { buildLibraryIndex } from './cost-ast.mjs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const [,, fixturePath, outPath = '/tmp/cost_dump.json', astPath = '/tmp/costs.ast.json'] = process.argv;
const COUNTS = [0, 1, 2, 5, 10, 25, 50, 100];
const ast = JSON.parse(readFileSync(astPath, 'utf8'));
const env = await import('../env-setup.mjs');
globalThis.localStorage.setItem('evolved', JSON.parse(readFileSync(fixturePath, 'utf8')).save);
env.seedMathRandom(12345); env.setFixedNow(1735689600000);
const { global: G, p_on, support_on } = await import('../../src/core/vars.js');
await import('../../src/main.js');
const { actions, traits, hooks } = await import('../../src/core/registries.js');
const { adjustCosts } = await import('../../src/functions/cost_adjusters.js');
const { initStruct } = await import('../../src/actions/core/structure_ui.js');
const { planetTraits } = await import('../../src/races/planet_data.js');
env.seedMathRandom(12345); env.setFixedNow(1735689600000);

const SKIP = new Set(['tech', 'genes', 'blood', 'arpa']);
const structs = [];
const walk = (obj, path, depth) => { for (const k of Object.keys(obj || {})) { const v = obj[k]; if (!v || typeof v !== 'object') continue;
    if (typeof v.cost === 'object' && typeof v.struct === 'function') structs.push({ id: [...path, k].join('.'), a: v }); else if (depth < 2) walk(v, [...path, k], depth + 1); } };
for (const top of Object.keys(actions)) if (!SKIP.has(top)) walk(actions[top], [top], 0);

// 1. inisialisasi semua struktur
for (const { a } of structs) { try { initStruct(a); } catch (e) { /* struktur tanpa inisialisasi */ } }

// 2. fakta: salinan state yang dipangkas
const EXCLUDE = new Set(['lastMsg', 'settings', 'queue', 'r_queue', 'power', 'support', 'special', 'custom', 'arpa', 'pillars']);
const slim = () => {
    const out = {};
    for (const k of Object.keys(G)) {
        if (EXCLUDE.has(k)) continue;
        if (k === 'resource') { out.resource = {}; for (const r of Object.keys(G.resource)) { const x = G.resource[r]; if (x && typeof x === 'object') out.resource[r] = { amount: x.amount, max: x.max, display: x.display }; } }
        else if (k === 'stats') out.stats = { achieve: G.stats.achieve };
        else if (k === 'civic') { const c = { ...G.civic }; delete c.foreign; out.civic = c; }
        else out[k] = G[k];
    }
    return JSON.parse(JSON.stringify(out));
};
const idx = buildLibraryIndex('src');
const extFns = {};
for (const n of ['darkEffect', 'eventActive', 'get_qlevel', 'govActive', 'jobScale', 'fathomCheck', 'harmonyEffect']) {
    const file = idx[n]; if (file) extFns[n] = (await import(pathToFileURL(resolve(file)).href))[n];
}
extFns.towerSize = (await import('../../src/portal/portal.js')).towerSize;
const { govEffect } = await import('../../src/civics/gov_effect.js');
for (const n of Object.keys(govEffect)) extFns[`govEffect.${n}`] = (...a) => govEffect[n](...a);
extFns.hellSupression = (...a) => hooks.hellSupression(...a);
const ext = {};
for (const { name, args } of ast.facts.externals) {
    const key = `${name}(${JSON.stringify(args)})`;
    try { const v = extFns[name](...args); ext[key] = v === undefined ? null : JSON.parse(JSON.stringify(v)); } catch (e) { ext[key] = null; }
}
const traitVars = {};
for (const ref of ast.facts.traitRefs) {
    const [table, rest] = ref.split('.'); const [name, rank] = rest.split('@'); const t = (table === 'traits' ? traits : planetTraits)[name];
    try { traitVars[ref] = t && typeof t.vars === 'function' ? (rank === undefined ? t.vars() : t.vars(Number(rank))) : null; } catch (e) { traitVars[ref] = null; }
}
const facts = { global: slim(), ext, traitVars, pOn: {}, supportOn: {} };
for (const n of ast.facts.pOn) facts.pOn[n] = p_on[n] ?? null;
for (const n of ast.facts.supportOn) facts.supportOn[n] = support_on[n] ?? null;

// 3. rekam cost
const num = (f) => { try { const x = f(); return typeof x === 'number' && Number.isFinite(x) ? x : null; } catch (e) { return null; } };
const out = { fixture: fixturePath, version: G.version, species: G.race.species, universe: G.race.universe, facts, structs: {} };
let skipped = 0;
for (const { id, a } of structs) {
    let st; try { const p = a.struct().p; st = G[p[1]] && G[p[1]][p[0]]; } catch (e) { st = null; }
    if (!st || typeof st.count !== 'number') { skipped++; continue; }
    const orig = st.count; const rec = {};
    for (const c of COUNTS) {
        st.count = c;
        const raw = {}, adj = {};
        let costsAdj = null; try { costsAdj = adjustCosts(a, 0); } catch (e) { costsAdj = null; }
        for (const res of Object.keys(a.cost)) { const r = num(() => a.cost[res](0)); if (r !== null) raw[res] = r; }
        if (costsAdj) for (const res of Object.keys(costsAdj)) { const x = num(() => costsAdj[res]()); if (x !== null) adj[res] = x; }
        rec[c] = { raw, adj };
    }
    st.count = orig;
    out.structs[id] = rec;
}
writeFileSync(outPath, JSON.stringify(out));
console.log(`ok: ${Object.keys(out.structs).length} struktur, ${skipped} dilewati, fakta ${Math.round(JSON.stringify(facts).length / 1024)} KB -> ${outPath}`);
process.exit(0);

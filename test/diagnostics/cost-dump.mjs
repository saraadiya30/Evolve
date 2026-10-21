// Dump cost bangunan (mentah dan setelah semua adjuster) per jumlah bangunan, untuk oracle cost.
// Pakai: node test/diagnostics/cost-dump.mjs <path fixture .json> <output .json>
// Format fixture: {save: "<LZString UTF16>"}  (sama dengan test/fixtures/*.json)
import { readFileSync, writeFileSync } from 'node:fs';
const [,, fixturePath, outPath = '/tmp/cost_dump.json'] = process.argv;
const COUNTS = [0, 1, 2, 5, 10, 25, 50, 100];
const env = await import('../env-setup.mjs');
globalThis.localStorage.setItem('evolved', JSON.parse(readFileSync(fixturePath, 'utf8')).save);
env.seedMathRandom(12345); env.setFixedNow(1735689600000);
const { global: G } = await import('../../src/core/vars.js');
await import('../../src/main.js');
const { actions } = await import('../../src/core/registries.js');
const { adjustCosts } = await import('../../src/functions/cost_adjusters.js');
const { initStruct } = await import('../../src/actions/core/structure_ui.js');
env.seedMathRandom(12345); env.setFixedNow(1735689600000);

const SKIP = new Set(['tech', 'genes', 'blood', 'arpa']);
const structs = []; // {id, action}
const walk = (obj, path, depth) => {
    for (const k of Object.keys(obj || {})) {
        const v = obj[k];
        if (!v || typeof v !== 'object') continue;
        if (typeof v.cost === 'object' && typeof v.struct === 'function') structs.push({ id: [...path, k].join('.'), a: v });
        else if (depth < 2) walk(v, [...path, k], depth + 1);
    }
};
for (const top of Object.keys(actions)) if (!SKIP.has(top)) walk(actions[top], [top], 0);

const num = (f) => { try { const x = f(); return typeof x === 'number' && Number.isFinite(x) ? x : null; } catch (e) { return null; } };
const { traits } = await import('../../src/core/registries.js');
const { fathomCheck } = await import('../../src/races/trait_logic/fathom_check.js');
const { CREEP_GENE_PER_LEVEL } = await import('../../src/config/constants.js');
const { govActive } = await import('../../src/governor/gov_active.js');
const traitVars = {};
for (const k of Object.keys(G.race)) if (traits[k] && typeof traits[k].vars === 'function') { try { traitVars[k] = { rank: G.race[k], vars: traits[k].vars() }; } catch (e) { /* trait tanpa vars() */ } }
const facts = { // fakta state yang dibutuhkan mesin cost (bukan seluruh save)
    species: G.race.species, universe: G.race.universe, govern: G.civic.govern && G.civic.govern.type,
    race: Object.fromEntries(Object.entries(G.race).filter(([, v]) => typeof v === 'number' || typeof v === 'boolean')),
    tech: { ...G.tech }, genes: { creep: G.genes.creep || 0 }, ptrait: G.city.ptrait || [],
    traitVars, creepPerLevel: CREEP_GENE_PER_LEVEL, harmonyCount: (G.prestige.Harmony && G.prestige.Harmony.count) || 0, ascendedAchieve: !!(G.stats.achieve && G.stats.achieve.ascended), govNoQuestions: govActive('noquestions', 0), fathomPterodacti: fathomCheck('pterodacti'),
};
const out = { fixture: fixturePath, version: G.version, species: G.race.species, universe: G.race.universe, facts, structs: {} };
let skipped = 0;
for (const { id, a } of structs) {
    let st;
    try { initStruct(a); const p = a.struct().p; st = G[p[1]] && G[p[1]][p[0]]; } catch (e) { st = null; }
    if (!st || typeof st.count !== 'number') { skipped++; continue; }
    const orig = st.count; const rec = {};
    for (const c of COUNTS) {
        st.count = c;
        const raw = {}, adj = {};
        let costsAdj = null; try { costsAdj = adjustCosts(a, 0); } catch (e) { costsAdj = null; }
        for (const res of Object.keys(a.cost)) { const r = num(() => a.cost[res](0)); if (r !== null) raw[res] = r; }
        if (costsAdj) for (const res of Object.keys(costsAdj)) { const x = num(() => costsAdj[res]()); if (x !== null) adj[res] = x; } // semua kunci hasil adjuster (flier bisa menambah/menghapus resource)
        rec[c] = { raw, adj };
    }
    st.count = orig;
    out.structs[id] = rec;
}
writeFileSync(outPath, JSON.stringify(out));
console.log(`ok: ${Object.keys(out.structs).length} struktur, ${skipped} dilewati -> ${outPath}`);
process.exit(0);

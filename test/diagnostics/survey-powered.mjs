// Survei: seberapa banyak fungsi kebutuhan power (`powered`) / support bangunan yang bisa diterjemahkan ke bahasa deklaratif.
import { buildLibraryIndex, makeConverter, loadConstants, buildConstantIndex } from './cost-ast.mjs';
const env = await import('../env-setup.mjs');
env.seedMathRandom(12345); env.setFixedNow(1735689600000);
await import('../../src/core/vars.js'); await import('../../src/main.js');
const { actions } = await import('../../src/core/registries.js');
const idx = buildLibraryIndex('src'); const cv = makeConverter(idx, { ...buildConstantIndex('src'), ...loadConstants('src/config/constants.js') });
const SKIP = new Set(['tech', 'genes', 'blood', 'arpa']);
const found = {}; const why = {}; const stat = { fields: {}, ok: {}, fail: {} };
const walk = (obj, path, depth) => { for (const k of Object.keys(obj || {})) { const v = obj[k]; if (!v || typeof v !== 'object') continue;
    if (typeof v.cost === 'object' && typeof v.struct === 'function') {
        for (const f of ['powered', 'support', 'support_on', 'p_fuel', 'power_reqs', 'generates']) if (typeof v[f] === 'function') {
            stat.fields[f] = (stat.fields[f] || 0) + 1;
            try { cv.convertFunction(v[f].toString()); stat.ok[f] = (stat.ok[f] || 0) + 1; }
            catch (e) { stat.fail[f] = (stat.fail[f] || 0) + 1; const m = String(e.message).slice(0, 70); why[m] = (why[m] || 0) + 1; found[`${[...path, k].join('.')}.${f}`] = m; }
        }
    } else if (depth < 2) walk(v, [...path, k], depth + 1); } };
for (const top of Object.keys(actions)) if (!SKIP.has(top)) walk(actions[top], [top], 0);
console.log(JSON.stringify({ stat, why }, null, 1));
console.log(JSON.stringify(Object.entries(found).slice(0, 8)));
process.exit(0);

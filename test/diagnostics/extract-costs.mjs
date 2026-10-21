// Ekstrak definisi cost sederhana dari sumber game (bentuk `costMultiplier('x', offset, base, mult) - K`) menjadi data.
// Pakai: node test/diagnostics/extract-costs.mjs <output .json>
import { writeFileSync } from 'node:fs';
const out = process.argv[2] || '/tmp/costs.generated.json';
const env = await import('../env-setup.mjs');
env.seedMathRandom(12345); env.setFixedNow(1735689600000);
await import('../../src/core/vars.js'); await import('../../src/main.js');
const { actions } = await import('../../src/core/registries.js');

const SKIP = new Set(['tech', 'genes', 'blood', 'arpa']);
const structs = [];
const walk = (obj, path, depth) => { for (const k of Object.keys(obj || {})) { const v = obj[k]; if (!v || typeof v !== 'object') continue;
    if (typeof v.cost === 'object' && typeof v.struct === 'function') structs.push({ id: [...path, k].join('.'), a: v }); else if (depth < 2) walk(v, [...path, k], depth + 1); } };
for (const top of Object.keys(actions)) if (!SKIP.has(top)) walk(actions[top], [top], 0);

const NUM = '[0-9][0-9._eE+]*';
const GEO_CITY = new RegExp(`^costMultiplier\\(\\s*'([^']+)'\\s*,\\s*offset\\s*,\\s*(${NUM})\\s*,\\s*(${NUM})\\s*(?:,\\s*'([^']+)'\\s*)?\\)\\s*(?:([-+])\\s*(${NUM})\\s*)?$`);
const GEO_SPACE = new RegExp(`^spaceCostMultiplier\\(\\s*'([^']+)'\\s*,\\s*offset\\s*,\\s*(${NUM})\\s*,\\s*(${NUM})\\s*(?:,\\s*'([^']+)'\\s*)?(?:,\\s*(${NUM})\\s*)?\\)\\s*(?:([-+])\\s*(${NUM})\\s*)?$`);
const COND = [
    [/^global\.race\.universe\s*===\s*'(\w+)'$/, (m) => ({ type: 'universe', value: m[1] })],
    [/^global\.city\.ptrait\.includes\('(\w+)'\)$/, (m) => ({ type: 'ptrait', value: m[1] })],
    [/^global\.race\['(\w+)'\]$/, (m) => ({ type: 'trait', value: m[1] })],
];
const parseExpr = (e) => {
    let m = GEO_SPACE.exec(e);
    if (m) return { kind: 'geo', family: 'space', structure: m[1], sector: m[4] || 'space', base: +m[2], mult: +m[3], cMin: m[5] ? +m[5] : 1.0, K: m[6] ? (m[6] === '-' ? +m[7] : -m[7]) : 0 };
    m = GEO_CITY.exec(e);
    if (m) return { kind: 'geo', family: 'city', structure: m[1], sector: m[4] || 'city', base: +m[2], mult: +m[3], K: m[5] ? (m[5] === '-' ? +m[6] : -m[6]) : 0 };
    if (new RegExp(`^${NUM}$`).test(e)) return { kind: 'flat', value: +e };
    return null;
};
const parseCost = (src) => {
    const b = /\{\s*([\s\S]*)\}\s*$/.exec(src.replace(/\s+/g, ' '));
    if (!b) return null;
    let body = b[1].trim().replace(/;\s*$/, '');
    if (!body.startsWith('return ')) return null;
    body = body.slice(7).trim();
    const t = /^(.+?)\s*\?\s*(.+?)\s*:\s*0$/.exec(body);
    if (t) {
        let when = null; for (const [re, f] of COND) { const m = re.exec(t[1].trim()); if (m) { when = f(m); break; } }
        const ex = parseExpr(t[2].trim());
        return when && ex ? { ...ex, when } : null;
    }
    return parseExpr(body);
};
const data = {}; const stats = { supported: 0, custom: 0, structs: 0, structsAllSupported: 0 }; const byKind = {};
for (const { id, a } of structs) {
    stats.structs++;
    const defs = {}; let all = true;
    for (const res of Object.keys(a.cost)) {
        const src = a.cost[res].toString();
        const d = parseCost(src);
        if (d) { defs[res] = d; stats.supported++; const k = d.kind + (d.family ? ':' + d.family : '') + (d.when ? '+cond' : ''); byKind[k] = (byKind[k] || 0) + 1; }
        else { all = false; stats.custom++; defs[res] = { kind: 'custom', src: src.replace(/\s+/g, ' ').slice(0, 260) }; }
    }
    if (all) stats.structsAllSupported++;
    data[id] = defs;
}
writeFileSync(out, JSON.stringify({ stats, byKind, data }, null, 1));
console.log(JSON.stringify({ stats, byKind }));
process.exit(0);

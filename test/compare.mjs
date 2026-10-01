// Fase 0.5 — script compare
// Cara pakai: node test/compare.mjs baseline.json candidate.json
import { readFileSync } from 'node:fs';

const [, , baselinePath, candidatePath] = process.argv;
if (!baselinePath || !candidatePath) {
    console.error('Usage: node test/compare.mjs <baseline.json> <candidate.json>');
    process.exit(2);
}

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
const candidate = JSON.parse(readFileSync(candidatePath, 'utf8'));

function diffDeep(a, b, path = '', out = []) {
    if (a === b) return out;
    const aIsObj = a && typeof a === 'object';
    const bIsObj = b && typeof b === 'object';
    if (aIsObj && bIsObj) {
        const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
        for (const k of keys) {
            diffDeep(a[k], b[k], path ? `${path}.${k}` : k, out);
        }
    } else {
        out.push({ path, baseline: a, candidate: b });
    }
    return out;
}

const diffs = diffDeep(baseline, candidate);

if (diffs.length === 0) {
    console.log('SAMA PERSIS — tidak ada perbedaan dari baseline.');
    process.exit(0);
} else {
    console.log(`BEDA — ${diffs.length} key berbeda dari baseline:\n`);
    for (const d of diffs.slice(0, 50)) {
        console.log(`  ${d.path}: ${JSON.stringify(d.baseline)} -> ${JSON.stringify(d.candidate)}`);
    }
    if (diffs.length > 50) console.log(`  ... dan ${diffs.length - 50} lainnya`);
    process.exit(1);
}

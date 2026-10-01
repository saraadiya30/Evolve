// Pagar circular import: memastikan kelompok import melingkar di src/ TIDAK bertambah besar.
//   node test/cycles-check.mjs            -> cek terhadap test/snap_cycles_baseline.json (exit 1 kalau memburuk)
//   node test/cycles-check.mjs --update   -> tulis ulang baseline (setelah siklus berhasil dikurangi, supaya pagar ikut mengetat)
//   node test/cycles-check.mjs --verbose  -> tampilkan modul yang paling sering diimport di dalam siklus terbesar
// Dua metrik:
//   1) ukuran kelompok siklus terbesar dan jumlah modul yang terlibat siklus
//   2) edge "eval-time" di dalam siklus: import yang dipakai saat modul DIMUAT (di luar fungsi). Ini yang berbahaya,
//      karena hasilnya bergantung pada urutan load modul. Edge yang hanya dipakai di dalam fungsi aman (live binding ESM),
//      begitu juga re-export (`export { x } from`/`export { x }` dari binding impor): itu tidak dihitung.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const espree = createRequire(import.meta.url)('espree');
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const SRC = path.join(root, 'src');
const BASELINE = path.join(here, 'snap_cycles_baseline.json');

const files = [];
(function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p);
        else if (p.endsWith('.js')) files.push(p);
    }
})(SRC);

const resolveSpec = (f, s) => {
    if (!s.startsWith('.')) return null;
    const p = path.resolve(path.dirname(f), s);
    for (const c of [p, p + '.js', path.join(p, 'index.js')]) if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
    return null;
};
const FN = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression', 'MethodDefinition']);
function walkAst(node, fn, parents = []) {
    if (!node || typeof node.type !== 'string') return;
    fn(node, parents);
    parents.push(node);
    for (const k in node) {
        if (k === 'loc' || k === 'range') continue;
        const v = node[k];
        if (Array.isArray(v)) v.forEach((c) => c && typeof c.type === 'string' && walkAst(c, fn, parents));
        else if (v && typeof v.type === 'string') walkAst(v, fn, parents);
    }
    parents.pop();
}

const edges = new Map(); // file -> Map(target -> {top:boolean})
for (const f of files) {
    const ast = espree.parse(fs.readFileSync(f, 'utf8'), { ecmaVersion: 2022, sourceType: 'module' });
    const out = new Map();
    const local = new Map();
    for (const n of ast.body) {
        if (n.type === 'ImportDeclaration') {
            const t = resolveSpec(f, n.source.value);
            if (!t) continue;
            if (!out.has(t)) out.set(t, { top: false });
            n.specifiers.forEach((s) => local.set(s.local.name, t));
        } else if ((n.type === 'ExportNamedDeclaration' && n.source) || n.type === 'ExportAllDeclaration') {
            const t = resolveSpec(f, n.source.value);
            if (t && !out.has(t)) out.set(t, { top: false });
        }
    }
    walkAst(ast, (node, parents) => {
        if (node.type !== 'Identifier' || !local.has(node.name)) return;
        const par = parents[parents.length - 1];
        if (!par || /^Import/.test(par.type) || par.type === 'ExportSpecifier') return; // re-export = live binding, bukan pemakaian saat load
        if (par.type === 'MemberExpression' && par.property === node && !par.computed) return;
        if (par.type === 'Property' && par.key === node && !par.computed && !par.shorthand) return;
        if (!parents.some((p) => FN.has(p.type))) out.get(local.get(node.name)).top = true;
    });
    edges.set(f, out);
}

// Tarjan SCC (iteratif supaya aman untuk graf besar)
const index = new Map(), low = new Map(), onStack = new Set(), stack = [], sccs = [];
let counter = 0;
function strong(v) {
    index.set(v, counter); low.set(v, counter); counter++;
    stack.push(v); onStack.add(v);
    for (const w of edges.get(v).keys()) {
        if (!index.has(w)) { strong(w); low.set(v, Math.min(low.get(v), low.get(w))); }
        else if (onStack.has(w)) low.set(v, Math.min(low.get(v), index.get(w)));
    }
    if (low.get(v) === index.get(v)) {
        const comp = []; let w;
        do { w = stack.pop(); onStack.delete(w); comp.push(w); } while (w !== v);
        if (comp.length > 1) sccs.push(comp);
    }
}
for (const f of files) if (!index.has(f)) strong(f);
sccs.sort((a, b) => b.length - a.length);

const biggest = new Set(sccs[0] || []);
let evalEdges = 0, inEdges = 0;
const indeg = new Map();
for (const f of biggest) for (const [t, e] of edges.get(f)) {
    if (!biggest.has(t)) continue;
    inEdges++; if (e.top) evalEdges++;
    indeg.set(t, (indeg.get(t) || 0) + 1);
}
// edge eval-time di SEMUA kelompok siklus (bukan hanya yang terbesar)
let evalAll = 0;
for (const comp of sccs) {
    const set = new Set(comp);
    for (const f of comp) for (const [t, e] of edges.get(f)) if (set.has(t) && e.top) evalAll++;
}
const result = {
    modules: files.length,
    largestCycle: sccs[0]?.length || 0,
    modulesInCycles: sccs.reduce((s, c) => s + c.length, 0),
    cycleGroups: sccs.length,
    edgesInLargestCycle: inEdges,
    evalTimeEdgesInLargestCycle: evalEdges,
    evalTimeEdgesInAllCycles: evalAll,
};

if (process.argv.includes('--verbose')) {
    console.log('Paling sering diimport di dalam siklus terbesar:');
    [...indeg].sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([f, n]) => console.log(`  ${String(n).padStart(4)}  ${path.relative(SRC, f)}`));
}
if (process.argv.includes('--update') || !fs.existsSync(BASELINE)) {
    fs.writeFileSync(BASELINE, JSON.stringify(result, null, 2) + '\n');
    console.log('Baseline siklus ditulis:', JSON.stringify(result));
    process.exit(0);
}
const base = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
const KEYS = ['largestCycle', 'modulesInCycles', 'evalTimeEdgesInLargestCycle', 'evalTimeEdgesInAllCycles'];
const worse = KEYS.filter((k) => result[k] > base[k]);
const better = KEYS.filter((k) => result[k] < base[k]);
console.log(`siklus terbesar ${result.largestCycle}/${base.largestCycle} modul | modul dalam siklus ${result.modulesInCycles}/${base.modulesInCycles} | edge eval-time ${result.evalTimeEdgesInAllCycles}/${base.evalTimeEdgesInAllCycles ?? base.evalTimeEdgesInLargestCycle} (semua siklus, sekarang/baseline)`);
if (worse.length) {
    console.log(`SIKLUS MEMBURUK (${worse.join(', ')}). Import baru membuat ketergantungan melingkar atau memakai import saat load. Pakai --verbose untuk melihat hub-nya.`);
    process.exit(1);
}
if (better.length) console.log('Siklus berkurang dari baseline. Jalankan `node test/cycles-check.mjs --update` supaya pagar ikut mengetat.');
console.log('SIKLUS TIDAK BERTAMBAH');

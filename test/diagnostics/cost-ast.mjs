// Penerjemah fungsi cost Evolve (JavaScript) -> AST deklaratif (JSON). Dipakai extract-costs.mjs.
// Mendukung: return/if/switch/const/let/assignment, ekspresi biner/logika/kondisional, IIFE, optional chaining,
// akses global.*, p_on/support_on, traits.X.vars(), Math.*, hasOwnProperty/includes, costMultiplier/spaceCostMultiplier,
// dan pemanggilan fungsi pustaka (diterjemahkan juga dari sumbernya).
import * as acorn from 'acorn';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export class Unsupported extends Error {}
const bad = (msg) => { throw new Unsupported(msg); };

// ---- indeks fungsi pustaka: nama -> file (dari `export function NAME`)
// Nama fungsi yang ada di lebih dari satu file HARUS dipilih eksplisit (kalau tidak, yang pertama ketemu bisa salah).
export const PREFER = { costMultiplier: 'src/functions/cost_multipliers.js' };
export const duplicateNames = {};
export function buildLibraryIndex(srcDir) {
    const idx = {};
    const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); const st = statSync(p); if (st.isDirectory()) { if (f !== 'wiki') walk(p); } else if (f.endsWith('.js')) {
        const t = readFileSync(p, 'utf8'); for (const m of t.matchAll(/^export function (\w+)\s*\(/gm)) { if (!idx[m[1]]) idx[m[1]] = p; else if (idx[m[1]] !== p) (duplicateNames[m[1]] ||= [idx[m[1]]]).push(p); } } } };
    walk(srcDir);
    for (const [n, f] of Object.entries(PREFER)) if (duplicateNames[n] || idx[n]) idx[n] = f;
    return idx;
}
const parsedCache = new Map();
export function librarySource(name, idx) {
    const file = idx[name]; if (!file) return null;
    let ast = parsedCache.get(file);
    if (!ast) { const text = readFileSync(file, 'utf8'); ast = { text, tree: acorn.parse(text, { ecmaVersion: 'latest', sourceType: 'module' }) }; parsedCache.set(file, ast); }
    for (const n of ast.tree.body) if (n.type === 'ExportNamedDeclaration' && n.declaration && n.declaration.type === 'FunctionDeclaration' && n.declaration.id.name === name) return ast.text.slice(n.declaration.start, n.declaration.end);
    return null;
}

export function parseFunction(src) {
    for (const wrap of [(s) => `(${s})`, (s) => `({${s}})`]) {
        try {
            const tree = acorn.parse(wrap(src), { ecmaVersion: 'latest' });
            let e = tree.body[0].expression;
            if (e.type === 'ObjectExpression') e = e.properties[0].value;
            if (e.type === 'FunctionExpression' || e.type === 'ArrowFunctionExpression' || e.type === 'FunctionDeclaration') return e;
        } catch (err) { /* coba bentuk berikutnya */ }
    }
    // deklarasi `function name(...) {...}`
    const tree = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module' });
    if (tree.body[0] && tree.body[0].type === 'FunctionDeclaration') return tree.body[0];
    return bad('tidak bisa mem-parse fungsi');
}

const BIN = new Set(['+', '-', '*', '/', '%', '**', '<', '<=', '>', '>=', '===', '!==', '==', '!=']);
const BUILTIN = new Set(['Number', 'Boolean', 'isFinite', 'parseFloat', 'String']);
const VECTOR_VARS = new Set(['costs', 'newCosts']); // variabel yang berisi vektor cost (resource -> nilai)
const MATH = new Set(['round', 'min', 'max', 'floor', 'ceil', 'pow', 'abs', 'sqrt', 'log', 'log10']);
// Fungsi yang nilainya berasal dari stat/fakta lain (bukan bagian bahasa cost): disuplai lewat facts.ext.
// eventActive = bergantung tanggal kalender nyata (input waktu).
const EXTERNAL = new Set(['darkEffect', 'govActive', 'get_qlevel', 'towerSize', 'jobScale', 'fathomCheck', 'harmonyEffect', 'hellSupression', 'eventActive', 'astrologySign', 'calc_mastery']);

// Indeks konstanta tingkat-modul dari SEMUA file src (nama -> nilai). Dipakai sebagai cadangan untuk konstanta yang di-import dari modul lain.
export function buildConstantIndex(srcDir) {
    const idx = {};
    const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); const st = statSync(p); if (st.isDirectory()) { if (f !== 'wiki') walk(p); } else if (f.endsWith('.js')) {
        const t = readFileSync(p, 'utf8'); if (!/^(?:export )?const \w+\s*=/m.test(t)) continue;
        const c = loadConstants(p); for (const [k, v] of Object.entries(c)) if (!(k in idx)) idx[k] = v; } } };
    walk(srcDir); return idx;
}

export function loadConstants(file) {
    const t = readFileSync(file, 'utf8'); const c = {};
    for (const m of t.matchAll(/^(?:export )?const (\w+)\s*=\s*(-?[0-9][0-9._eE+-]*)\s*;/gm)) c[m[1]] = Number(m[2]);
    // tabel konfigurasi berupa literal objek/larik (mis. resource_values, tradeRatio): ikut jadi data
    try {
        const tree = acorn.parse(t, { ecmaVersion: 'latest', sourceType: 'module' });
        const lit = (n) => {
            if (n.type === 'Literal') return n.value;
            if (n.type === 'UnaryExpression' && n.operator === '-' && n.argument.type === 'Literal') return -n.argument.value;
            if (n.type === 'BinaryExpression' && ['+', '-', '*', '/'].includes(n.operator)) { const a = lit(n.left), b = lit(n.right); if (typeof a !== 'number' || typeof b !== 'number') throw 0; return n.operator === '+' ? a + b : n.operator === '-' ? a - b : n.operator === '*' ? a * b : a / b; }
            if (n.type === 'ArrayExpression') return n.elements.map(lit);
            if (n.type === 'ObjectExpression') { const o = {}; for (const p of n.properties) { if (p.type !== 'Property' || p.computed) throw 0; o[p.key.type === 'Identifier' ? p.key.name : p.key.value] = lit(p.value); } return o; }
            throw 0;
        };
        for (const node of tree.body) {
            const d = node.type === 'ExportNamedDeclaration' ? node.declaration : node;
            if (d && d.type === 'VariableDeclaration') for (const v of d.declarations) if (v.id.type === 'Identifier' && v.init && (v.init.type === 'ObjectExpression' || v.init.type === 'ArrayExpression') && !(v.id.name in c)) { try { c[v.id.name] = lit(v.init); } catch (e) { /* bukan literal murni */ } }
        }
    } catch (e) { /* abaikan */ }
    return c;
}


// ---- analisis statis cabang (menghindari duplikasi sisa fungsi di tiap `if`)
const flatBody = (b) => (b ? (b.type === 'BlockStatement' ? b.body : [b]) : []);
function containsReturn(stmts) {
    return stmts.some((s) => s.type === 'ReturnStatement'
        || (s.type === 'IfStatement' && (containsReturn(flatBody(s.consequent)) || containsReturn(flatBody(s.alternate))))
        || (s.type === 'BlockStatement' && containsReturn(s.body))
        || (s.type === 'SwitchStatement' && s.cases.some((c) => containsReturn(c.consequent))));
}
function terminates(stmts) { // semua jalur berakhir di return
    for (const s of stmts) {
        if (s.type === 'ReturnStatement') return true;
        if (s.type === 'BlockStatement' && terminates(s.body)) return true;
        if (s.type === 'IfStatement' && s.alternate && terminates(flatBody(s.consequent)) && terminates(flatBody(s.alternate))) return true;
    }
    return false;
}

export function makeConverter(libIdx, constants = {}) {
    const used = {};       // pustaka yang dipakai: nama -> {params, body}
    const externals = {};  // panggilan eksternal: kunci -> {name, args(literal)}
    const paths = new Set();
    const traitRefs = new Set();
    const unresolved = {};

    const ctxStack = [];
    const lit = (v) => v;
    // ---- berbagi nilai antara lewat `let` (mencegah pohon ekspresi melipat dua tiap `if`)
    let scopes = []; let letN = 0;
    const small = (e) => e === null || typeof e !== 'object' || 'ref' in e || e.op === 'undef' || e.op === 'null' || e.op === 'vecNew' || JSON.stringify(e).length <= 80;
    const bind = (e) => { if (small(e) || scopes.length === 0) return e; const name = `_t${letN++}`; scopes[scopes.length - 1].push({ name, value: e }); return { ref: 'local', name }; };
    const bindAll = (env) => { let out = env; for (const k of Object.keys(env)) { const b = bind(env[k]); if (b !== env[k]) { if (out === env) out = { ...env }; out[k] = b; } } return out; };
    const withScope = (fn) => { scopes.push([]); try { let body = fn(); const lets = scopes[scopes.length - 1]; for (let i = lets.length - 1; i >= 0; i--) body = { op: 'let', name: lets[i].name, args: [lets[i].value, body] }; return body; } finally { scopes.pop(); } };

    function conv(n, env, bool = false) {
        switch (n.type) {
            case 'Literal': if (n.regex) bad('regex'); return n.value === null ? { op: 'null' } : lit(n.value);
            case 'Identifier': {
                if (Object.prototype.hasOwnProperty.call(env, n.name)) return env[n.name];
                if (n.name === 'undefined') return { op: 'undef' };
                if (Object.prototype.hasOwnProperty.call(constants, n.name)) { const cv_ = constants[n.name]; return typeof cv_ === 'object' ? { op: 'lit', value: cv_ } : cv_; }
                return bad(`identifier tak dikenal: ${n.name}`);
            }
            case 'ChainExpression': return conv(n.expression, env, bool);
            case 'ArrowFunctionExpression': case 'FunctionExpression': {
                const params = n.params.map((p) => (p.type === 'Identifier' ? p.name : bad('parameter lambda non-sederhana')));
                const inner = { ...env }; for (const p of params) inner[p] = { ref: 'local', name: p };
                return { op: 'lambda', params, body: withScope(() => (n.body.type === 'BlockStatement' ? run(n.body.body, 0, inner) : conv(n.body, inner))) };
            }
            case 'TemplateLiteral': { const parts = []; n.quasis.forEach((q, i) => { if (q.value.cooked) parts.push(q.value.cooked); if (n.expressions[i]) parts.push(conv(n.expressions[i], env)); }); return { op: 'concat', args: parts }; }
            case 'ObjectExpression': {
                if (!n.properties.length) return { op: 'vecNew' };
                const keys = [], vals = [];
                for (const p of n.properties) {
                    if (p.type !== 'Property' || p.computed) bad('properti objek non-sederhana');
                    keys.push(p.key.type === 'Identifier' ? p.key.name : p.key.value);
                    vals.push(p.shorthand ? conv(p.key, env) : conv(p.value, env));
                }
                return { op: 'obj', keys, args: vals };
            }
            case 'ArrayExpression': return { op: 'array', args: n.elements.map((x) => conv(x, env)) };
            case 'UnaryExpression':
                if (n.operator === '!') return { op: '!', args: [conv(n.argument, env, true)] };
                if (n.operator === 'typeof') return { op: 'typeof', args: [conv(n.argument, env)] };
                if (n.operator === '-') return { op: 'neg', args: [conv(n.argument, env)] };
                if (n.operator === '+') return { op: 'num', args: [conv(n.argument, env)] };
                return bad(`unary ${n.operator}`);
            case 'BinaryExpression': if (!BIN.has(n.operator)) bad(`biner ${n.operator}`); return { op: n.operator, args: [conv(n.left, env), conv(n.right, env)] };
            case 'LogicalExpression': if (n.operator === '??') return { op: '??', args: [conv(n.left, env), conv(n.right, env)] }; return { op: n.operator, args: [conv(n.left, env, bool), conv(n.right, env, bool)] };
            case 'ConditionalExpression': return { op: '?:', args: [conv(n.test, env, true), conv(n.consequent, env), conv(n.alternate, env)] };
            case 'MemberExpression': return member(n, env, bool);
            case 'CallExpression': return call(n, env);
            default: return bad(`ekspresi ${n.type}`);
        }
    }

    function accessors(n, env) { // ratakan rantai member -> {base: node, acc: [string|Expr]}
        const acc = [];
        let cur = n;
        while (cur.type === 'MemberExpression' || cur.type === 'ChainExpression') {
            if (cur.type === 'ChainExpression') { cur = cur.expression; continue; }
            acc.unshift(cur.computed ? (cur.property.type === 'Literal' ? cur.property.value : conv(cur.property, env)) : cur.property.name);
            cur = cur.object;
        }
        return { base: cur, acc };
    }

    function member(n, env, bool = false) {
        const { base, acc } = accessors(n, env);
        if (base.type === 'Identifier' && VECTOR_VARS.has(base.name) && acc.length === 1 && Object.prototype.hasOwnProperty.call(env, base.name)) {
            // costs[res] tanpa panggilan: di posisi uji = "resource ada?", selain itu = nilainya
            return { op: bool ? 'vecHas' : 'vecGet', args: [env[base.name], acc[0]] };
        }
        if (base.type === 'Identifier' && base.name === 'c_action' && Object.prototype.hasOwnProperty.call(env, 'c_action')) {
            if (acc.length === 1 && acc[0] === 'cost') return { ref: 'rawCosts' };
            return acc.reduce((e, k) => ({ op: 'get', args: [e, k] }), env.c_action);
        }
        if (base.type === 'Identifier' && !Object.prototype.hasOwnProperty.call(env, base.name) && Object.prototype.hasOwnProperty.call(constants, base.name) && typeof constants[base.name] === 'object') {
            return acc.reduce((e, k) => ({ op: 'get', args: [e, k] }), { op: 'lit', value: constants[base.name] });
        }
        if (base.type === 'Identifier') {
            if (base.name === 'global') { const lits = acc.filter((a) => typeof a === 'string'); if (lits.length === acc.length) paths.add(acc.join('.')); else paths.add(acc.filter((a) => typeof a === 'string').join('.') + '.*'); return { ref: 'global', path: acc }; }
            if (base.name === 'p_on' || base.name === 'support_on') { if (acc.length !== 1) bad('p_on akses'); return { ref: base.name === 'p_on' ? 'pOn' : 'supportOn', name: acc[0] }; }
            if (Object.prototype.hasOwnProperty.call(env, base.name)) return acc.reduce((e, k) => ({ op: 'get', args: [e, k] }), env[base.name]);
            return bad(`member dari ${base.name}`);
        }
        // member di atas ekspresi (mis. traits.X.vars()[i])
        const baseExpr = conv(base, env);
        return acc.reduce((e, k) => ({ op: 'get', args: [e, k] }), baseExpr);
    }

    function call(n, env) {
        const c = n.callee;
        // IIFE
        if ((c.type === 'ArrowFunctionExpression' || c.type === 'FunctionExpression') && n.arguments.length === 0 && c.params.length === 0) {
            return c.body.type === 'BlockStatement' ? run(c.body.body, 0, env) : conv(c.body, env);
        }
        if (c.type === 'Identifier') {
            const name = c.name;
            if (EXTERNAL.has(name)) {
                const a = n.arguments.map((x) => conv(x, env));
                return { op: 'ext', name, args: a };
            }
            if (Object.prototype.hasOwnProperty.call(env, name) && !VECTOR_VARS.has(name)) return { op: 'apply', args: [env[name], ...n.arguments.map((x) => conv(x, env))] };
            if (BUILTIN.has(name)) return { op: 'builtin', fn: name, args: n.arguments.map((x) => conv(x, env)) };
            const src = librarySource(name, libIdx);
            if (!src) return bad(`fungsi tak dikenal: ${name}`);
            if (!used[name]) {
                used[name] = null;
                const saved = { ...constants };
                try { Object.assign(constants, loadConstants(libIdx[name])); used[name] = convertFunction(src); }
                catch (err) { throw new Unsupported(`[pustaka ${name}] ${err.message}`); }
                finally { for (const k of Object.keys(constants)) if (!(k in saved)) delete constants[k]; Object.assign(constants, saved); }
            }
            return { op: 'call', fn: name, args: n.arguments.map((x) => conv(x, env)) };
        }
        // costs[res](offset, wiki): nilai cost resource dari vektor (dievaluasi eager pada offset yang sama)
        if (c.type === 'MemberExpression' && c.computed && c.object.type === 'Identifier' && VECTOR_VARS.has(c.object.name) && Object.prototype.hasOwnProperty.call(env, c.object.name)) {
            return { op: 'vecGet', args: [env[c.object.name], c.property.type === 'Literal' ? c.property.value : conv(c.property, env)] };
        }
        if (c.type === 'MemberExpression') {
            const m = c.computed ? null : c.property.name;
            const { base, acc } = accessors(c, env);
            if (base.type === 'Identifier' && base.name === 'c_action' && acc.length === 1 && acc[0] === 'struct') return { ref: 'actionStruct' };
            if (base.type === 'Identifier' && base.name === 'govEffect' && acc.length === 1) return { op: 'ext', name: `govEffect.${acc[0]}`, args: n.arguments.map((x) => conv(x, env)) };
            if (base.type === 'Identifier' && base.name === 'Math' && acc.length === 1 && MATH.has(acc[0])) return { op: 'math', fn: acc[0], args: n.arguments.map((x) => conv(x, env)) };
            if (base.type === 'Identifier' && base.name === 'Object' && acc.length === 1 && acc[0] === 'keys') return { op: 'keys', args: [conv(n.arguments[0], env)] };
            if (m === 'hasOwnProperty') return { op: 'has', args: [conv(c.object, env), conv(n.arguments[0], env)] };
            if (m === 'toPrecision') return { op: 'toPrecision', args: [conv(c.object, env), n.arguments.length ? conv(n.arguments[0], env) : 21] };
            if (m === 'filter' && n.arguments[0] && (n.arguments[0].type === 'ArrowFunctionExpression' || n.arguments[0].type === 'FunctionExpression') && n.arguments[0].params.length === 1) {
                const f0 = n.arguments[0]; const v = f0.params[0].name;
                const inner = { ...env, [v]: { ref: 'local', name: v } };
                const body = withScope(() => (f0.body.type === 'BlockStatement' ? run(f0.body.body, 0, inner) : conv(f0.body, inner, true)));
                return { op: 'filter', var: v, args: [conv(c.object, env), body] };
            }
            if (m === 'toFixed') return { op: 'toFixed', args: [conv(c.object, env), n.arguments.length ? conv(n.arguments[0], env) : 0] };
            if (m === 'includes') return { op: 'includes', args: [conv(c.object, env), conv(n.arguments[0], env)] };
            // traits.X.vars(rank?) / planetTraits.X.vars()
            if (m === 'vars' && base.type === 'Identifier' && (base.name === 'traits' || base.name === 'planetTraits') && acc.length === 2) {
                const rank = n.arguments.length ? conv(n.arguments[0], env) : null;
                traitRefs.add(`${base.name}.${acc[0]}`);
                return { ref: 'traitVars', table: base.name, name: acc[0], rank };
            }
            // hooks.hellSupression(...)
            if (base.type === 'Identifier' && base.name === 'hooks' && acc.length === 1 && acc[0] === 'hellSupression') {
                return { op: 'ext', name: 'hellSupression', args: n.arguments.map((x) => conv(x, env)) };
            }
        }
        return bad(`chamada ${c.type}${c.type === 'MemberExpression' && !c.computed ? ': .' + c.property.name : ''}`);
    }

    // ---- statement -> Expr (nilai return)
    function run(stmts, i, env) {
        for (let k = i; k < stmts.length; k++) {
            env = bindAll(env);
            const s = stmts[k];
            const tail = () => stmts.slice(k + 1);
            switch (s.type) {
                case 'EmptyStatement': break;
                case 'VariableDeclaration':
                    env = { ...env };
                    for (const d of s.declarations) { if (d.id.type !== 'Identifier') bad('destructuring'); env[d.id.name] = d.init ? conv(d.init, env) : { op: 'undef' }; }
                    break;
                case 'ExpressionStatement': {
                    const e = s.expression;
                    if (e.type === 'AssignmentExpression' && e.left.type === 'Identifier' && Object.prototype.hasOwnProperty.call(env, e.left.name)) {
                        const cur = env[e.left.name]; const rhs = conv(e.right, env);
                        const nv = e.operator === '=' ? rhs : { op: e.operator.slice(0, -1), args: [cur, rhs] };
                        if (e.operator !== '=' && !BIN.has(e.operator.slice(0, -1))) bad(`assign ${e.operator}`);
                        env = { ...env, [e.left.name]: nv };
                    } else if (e.type === 'UpdateExpression' && e.argument.type === 'Identifier' && Object.prototype.hasOwnProperty.call(env, e.argument.name)) {
                        env = { ...env, [e.argument.name]: { op: e.operator === '++' ? '+' : '-', args: [env[e.argument.name], 1] } };
                    } else if (e.type === 'AssignmentExpression' && e.operator === '=' && e.left.type === 'MemberExpression' && e.left.computed && e.left.object.type === 'Identifier' && VECTOR_VARS.has(e.left.object.name) && Object.prototype.hasOwnProperty.call(env, e.left.object.name)) {
                        const nm = e.left.object.name;
                        env = { ...env, [nm]: { op: 'vecSet', args: [env[nm], e.left.property.type === 'Literal' ? e.left.property.value : conv(e.left.property, env), rhsValue(e.right, env)] } };
                    } else if (e.type === 'CallExpression' && e.callee.type === 'MemberExpression' && !e.callee.computed && e.callee.property.name === 'forEach'
                        && e.callee.object.type === 'CallExpression' && e.callee.object.callee.type === 'MemberExpression' && e.callee.object.callee.object.name === 'Object' && e.callee.object.callee.property.name === 'keys') {
                        const fnode = e.arguments[0];
                        if (!fnode || (fnode.type !== 'FunctionExpression' && fnode.type !== 'ArrowFunctionExpression') || fnode.params.length !== 1) bad('forEach callback');
                        const vec = conv(e.callee.object.arguments[0], env);
                        const v = fnode.params[0].name; const target = 'newCosts';
                        const body = withScope(() => runEmit(fnode.body.body, 0, { ...env, [v]: { ref: 'local', name: v } }, target));
                        env = { ...env, [target]: { op: 'vecFold', var: v, args: [env[target], vec, body] } };
                    } else bad(`statement ekspresi ${e.type}`);
                    break;
                }
                case 'ReturnStatement': return s.argument ? conv(s.argument, env) : { op: 'undef' };
                case 'BlockStatement': return run([...s.body, ...tail()], 0, env);
                case 'IfStatement': {
                    const test = conv(s.test, env, true);
                    const th = flatBody(s.consequent), el = flatBody(s.alternate);
                    if (!containsReturn(th) && !containsReturn(el)) {
                        // kedua cabang hanya mengubah variabel: gabungkan lingkungan (tanpa menggandakan sisa fungsi)
                        const e1 = execEffects(th, env), e2 = execEffects(el, env);
                        const merged = { ...env };
                        for (const key of new Set([...Object.keys(e1), ...Object.keys(e2)])) {
                            if (JSON.stringify(e1[key]) !== JSON.stringify(e2[key])) merged[key] = { op: '?:', args: [test, e1[key] ?? env[key], e2[key] ?? env[key]] };
                            else merged[key] = e1[key];
                        }
                        env = merged;
                        break;
                    }
                    const tT = terminates(th), eT = terminates(el);
                    return { op: '?:', args: [test, run(tT ? th : [...th, ...tail()], 0, env), run(eT ? el : [...el, ...tail()], 0, env)] };
                }
                case 'SwitchStatement': {
                    const d = conv(s.discriminant, env);
                    const cases = s.cases;
                    const from = (idx) => { // jalankan dari case idx sampai break/return, lalu sisa statement
                        const body = [];
                        for (let j = idx; j < cases.length; j++) { let stop = false; for (const st of cases[j].consequent) { if (st.type === 'BreakStatement') { stop = true; break; } body.push(st); } if (stop) break; }
                        return run([...body, ...tail()], 0, env);
                    };
                    const defIdx = cases.findIndex((c) => c.test === null);
                    let out = defIdx >= 0 ? from(defIdx) : run(tail(), 0, env);
                    for (let j = cases.length - 1; j >= 0; j--) if (cases[j].test) out = { op: '?:', args: [{ op: '===', args: [d, conv(cases[j].test, env)] }, from(j), out] };
                    return out;
                }
                default: bad(`statement ${s.type}`);
            }
        }
        return { op: 'undef' };
    }

    // eksekusi blok yang hanya mengubah variabel (tanpa return): mengembalikan lingkungan baru
    function execEffects(stmts, env0) {
        let env = { ...env0 };
        for (const s of stmts) {
            env = bindAll(env);
            switch (s.type) {
                case 'EmptyStatement': break;
                case 'VariableDeclaration':
                    for (const d of s.declarations) { if (d.id.type !== 'Identifier') bad('destructuring'); env[d.id.name] = d.init ? conv(d.init, env) : { op: 'undef' }; }
                    break;
                case 'BlockStatement': env = execEffects(s.body, env); break;
                case 'ExpressionStatement': {
                    const e = s.expression;
                    if (e.type === 'AssignmentExpression' && e.left.type === 'Identifier' && Object.prototype.hasOwnProperty.call(env, e.left.name)) {
                        const cur = env[e.left.name]; const rhs = conv(e.right, env);
                        if (e.operator !== '=' && !BIN.has(e.operator.slice(0, -1))) bad(`assign ${e.operator}`);
                        env[e.left.name] = e.operator === '=' ? rhs : { op: e.operator.slice(0, -1), args: [cur, rhs] };
                    } else if (e.type === 'UpdateExpression' && e.argument.type === 'Identifier' && Object.prototype.hasOwnProperty.call(env, e.argument.name)) {
                        env[e.argument.name] = { op: e.operator === '++' ? '+' : '-', args: [env[e.argument.name], 1] };
                    } else if (e.type === 'AssignmentExpression' && e.operator === '=' && e.left.type === 'MemberExpression' && e.left.computed && e.left.object.type === 'Identifier' && VECTOR_VARS.has(e.left.object.name) && Object.prototype.hasOwnProperty.call(env, e.left.object.name)) {
                        const nm = e.left.object.name;
                        env[nm] = { op: 'vecSet', args: [env[nm], e.left.property.type === 'Literal' ? e.left.property.value : conv(e.left.property, env), rhsValue(e.right, env)] };
                    } else bad(`efek dalam cabang: ${e.type}`);
                    break;
                }
                case 'IfStatement': {
                    const test = conv(s.test, env, true);
                    const e1 = execEffects(flatBody(s.consequent), env), e2 = execEffects(flatBody(s.alternate), env);
                    for (const key of new Set([...Object.keys(e1), ...Object.keys(e2)])) {
                        if (JSON.stringify(e1[key]) !== JSON.stringify(e2[key])) env[key] = { op: '?:', args: [test, e1[key] ?? env[key], e2[key] ?? env[key]] };
                        else env[key] = e1[key];
                    }
                    break;
                }
                default: bad(`statement dalam cabang: ${s.type}`);
            }
        }
        return env;
    }

    // nilai sisi kanan penugasan ke vektor: function(){ ... } (dievaluasi eager), costs[res] (salinan), atau ekspresi biasa
    function rhsValue(n, env) {
        if (n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression') return n.body.type === 'BlockStatement' ? run(n.body.body, 0, env) : conv(n.body, env);
        return conv(n, env);
    }
    // isi forEach: daftar penugasan [kunci, nilai] per iterasi (cons/pair/nil)
    function runEmit(stmts, i, env, target) {
        for (let k = i; k < stmts.length; k++) {
            env = bindAll(env);
            const s = stmts[k];
            const tail = () => stmts.slice(k + 1);
            switch (s.type) {
                case 'EmptyStatement': break;
                case 'VariableDeclaration':
                    env = { ...env };
                    for (const d of s.declarations) { if (d.id.type !== 'Identifier') bad('destructuring'); env[d.id.name] = d.init ? conv(d.init, env) : { op: 'undef' }; }
                    break;
                case 'ExpressionStatement': {
                    const e = s.expression;
                    if (e.type === 'AssignmentExpression' && e.operator === '=' && e.left.type === 'MemberExpression' && e.left.computed && e.left.object.type === 'Identifier' && e.left.object.name === target) {
                        const key = e.left.property.type === 'Literal' ? e.left.property.value : conv(e.left.property, env);
                        return { op: 'cons', args: [{ op: 'pair', args: [key, rhsValue(e.right, env)] }, runEmit(stmts, k + 1, env, target)] };
                    }
                    if (e.type === 'AssignmentExpression' && e.left.type === 'Identifier' && Object.prototype.hasOwnProperty.call(env, e.left.name)) {
                        const cur = env[e.left.name]; const rhs = conv(e.right, env);
                        env = { ...env, [e.left.name]: e.operator === '=' ? rhs : { op: e.operator.slice(0, -1), args: [cur, rhs] } };
                        break;
                    }
                    bad(`statement dalam forEach: ${e.type}`);
                    break;
                }
                case 'BlockStatement': return runEmit([...s.body, ...tail()], 0, env, target);
                case 'IfStatement': {
                    const test = conv(s.test, env, true);
                    const flat = (b) => (b ? (b.type === 'BlockStatement' ? b.body : [b]) : []);
                    return { op: '?:', args: [test, runEmit([...flat(s.consequent), ...tail()], 0, env, target), runEmit([...flat(s.alternate), ...tail()], 0, env, target)] };
                }
                default: bad(`statement dalam forEach: ${s.type}`);
            }
        }
        return { op: 'nil' };
    }

    function convertFunction(src) {
        const fn = parseFunction(src);
        const params = fn.params.map((p) => (p.type === 'Identifier' ? p.name : (p.type === 'AssignmentPattern' && p.left.type === 'Identifier' ? p.left.name : bad('parameter non-sederhana'))));
        const env = {}; for (const p of params) env[p] = p === 'wiki' ? false : p === 'c_action' ? { ref: 'action' } : { ref: 'local', name: p };
        // nilai default: dipakai bila argumen === undefined (semantik JavaScript)
        fn.params.forEach((p) => { if (p.type === 'AssignmentPattern') env[p.left.name] = { op: 'dflt', args: [{ ref: 'local', name: p.left.name }, conv(p.right, env)] }; });
        const body = withScope(() => (fn.body.type === 'BlockStatement' ? run(fn.body.body, 0, env) : conv(fn.body, env)));
        return { params, body };
    }

    return { convertFunction, used, externals, paths, traitRefs, unresolved };
}

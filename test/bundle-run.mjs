// Kesetaraan bundel produksi: bundel yang di-minify + di-split (esbuild, sama seperti buildBundles.js) harus MENGHASILKAN
// state game yang identik dengan menjalankan src/ langsung. Menjalankan 200 tick dari fixture save pada keduanya
// (seed acak dan waktu tetap) lalu membandingkan seluruh objek `global`.
// Entry uji sementara hanya mengekspor ulang main.js + core/vars.js; graf modul dan chunking sama dengan produksi.
import { createRequire } from 'node:module';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const esbuild = createRequire(import.meta.url)('esbuild');
const out = mkdtempSync(join(tmpdir(), 'evolve-brun-'));
const FIXTURE = 'user-save-1';
const TICKS = 200;
let ok = true;
try {
    const entry = join(out, 'probe_entry.js');
    writeFileSync(entry, `export * from ${JSON.stringify(join(root, 'src/main.js'))};\nexport { global } from ${JSON.stringify(join(root, 'src/core/vars.js'))};\n`);
    await esbuild.build({
        absWorkingDir: root, logLevel: 'silent', bundle: true, splitting: true, format: 'esm', minify: true, outdir: out,
        entryPoints: { 'evolve/main': entry, 'wiki/wiki': './src/wiki/wiki.js' }, chunkNames: 'evolve/chunks/[name]-[hash]',
    });
    writeFileSync(join(out, 'package.json'), '{"type":"module"}');
    const envUrl = pathToFileURL(join(here, 'env-setup.mjs')).href;
    const fixture = join(here, 'fixtures', FIXTURE + '.json');
    const body = (specifier) => `
import ${JSON.stringify(envUrl)};
import { seedMathRandom, setFixedNow } from ${JSON.stringify(envUrl)};
import { readFileSync } from 'node:fs';
globalThis.localStorage.setItem('evolved', JSON.parse(readFileSync(${JSON.stringify(fixture)}, 'utf8')).save);
seedMathRandom(12345); setFixedNow(1735689600000);
const m = await import(${JSON.stringify(specifier)});
const vars = m.global ? m : await import(${JSON.stringify(pathToFileURL(join(root, 'src/core/vars.js')).href)});
seedMathRandom(12345); setFixedNow(1735689600000);
vars.global.settings.at = 0;
for (let i = 0; i < ${TICKS}; i++) m.execGameLoops(1);
const g = JSON.parse(JSON.stringify(vars.global, (k, v) => (typeof v === 'function' ? undefined : v)));
delete g.stats.current; delete g.stats.start; delete g.settings.at;
process.stdout.write('@@' + JSON.stringify(g) + '@@');
process.exit(0);`;
    const run = (label, specifier) => {
        const r = spawnSync(process.execPath, ['--input-type=module', '-e', body(specifier)], { encoding: 'utf8', cwd: out, maxBuffer: 1 << 28 });
        const mt = /@@([\s\S]*)@@/.exec(r.stdout);
        if (r.status !== 0 || !mt) { console.log(`GAGAL menjalankan ${label}:\n` + (r.stdout + r.stderr).split('\n').slice(0, 8).join('\n')); return null; }
        return JSON.parse(mt[1]);
    };
    const a = run('src', pathToFileURL(join(root, 'src/main.js')).href);
    const b = run('bundel', pathToFileURL(join(out, 'evolve/main.js')).href);
    if (!a || !b) ok = false;
    else {
        const diffs = [];
        (function cmp(x, y, p) {
            if (diffs.length > 12) return;
            if (typeof x !== typeof y || (x === null) !== (y === null)) { diffs.push(`${p}: ${JSON.stringify(x)} vs ${JSON.stringify(y)}`); return; }
            if (x && typeof x === 'object') { for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) cmp(x[k], y[k], p + '.' + k); }
            else if (x !== y) diffs.push(`${p}: ${x} vs ${y}`);
        })(a, b, 'global');
        if (diffs.length) { ok = false; console.log(`BEDA: bundel tidak setara dengan src (${diffs.length}+ selisih):\n  ` + diffs.slice(0, 12).join('\n  ')); }
        else console.log(`OK    bundel split setara dengan src setelah ${TICKS} tick (${JSON.stringify(a).length} byte state dibandingkan)`);
    }
} finally {
    rmSync(out, { recursive: true, force: true });
}
console.log(ok ? 'BUNDEL SETARA' : 'BUNDEL TIDAK SETARA');
process.exit(ok ? 0 : 1);

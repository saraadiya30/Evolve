// Smoke test bundel PRODUKSI: (1) bundel mandiri persis seperti buildEvolve.js / buildWiki.js dan (2) bundel dengan code splitting
// persis seperti buildBundles.js (game + wiki + chunk bersama + chunk changelog lazy), lalu pastikan semuanya bisa di-load. Menangkap masalah yang tidak terlihat saat menjalankan src/ langsung
// (urutan evaluasi modul pada bundel, circular import). Build ke folder sementara; repo tidak disentuh.
import { createRequire } from 'node:module';
import { mkdtempSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const esbuild = createRequire(import.meta.url)('esbuild');
const out = mkdtempSync(join(tmpdir(), 'evolve-bundle-'));
let ok = true;
try {
    for (const [name, entry] of [['game', './src/main.js'], ['wiki', './src/wiki/wiki.js']]) {
        const file = join(out, name + '.js');
        await esbuild.build({ absWorkingDir: root, logLevel: 'silent', bundle: true, minify: true, entryPoints: [entry], outfile: file });
        writeFileSync(join(out, 'package.json'), '{"type":"module"}');
        const envUrl = pathToFileURL(join(here, 'env-setup.mjs')).href;
        const code = `import ${JSON.stringify(envUrl)};\nawait import(${JSON.stringify(pathToFileURL(file).href)});\nprocess.exit(0);`;
        const r = spawnSync(process.execPath, ['--input-type=module', '-e', code], { encoding: 'utf8', cwd: out });
        const pass = r.status === 0;
        console.log(`${pass ? 'OK   ' : 'GAGAL'} bundel ${name}`);
        if (!pass) { ok = false; console.log((r.stdout + r.stderr).split('\n').slice(0, 8).join('\n')); }
    }
    // (2) code splitting seperti buildBundles.js
    const sdir = join(out, 'split');
    await esbuild.build({
        absWorkingDir: root, logLevel: 'silent', bundle: true, splitting: true, format: 'esm', minify: true, outdir: sdir,
        entryPoints: { 'evolve/main': './src/main.js', 'wiki/wiki': './src/wiki/wiki.js' }, chunkNames: 'evolve/chunks/[name]-[hash]',
    });
    writeFileSync(join(sdir, 'package.json'), '{"type":"module"}');
    const envUrl2 = pathToFileURL(join(here, 'env-setup.mjs')).href;
    const runSplit = (label, body) => {
        const code = `import ${JSON.stringify(envUrl2)};\n${body}\nprocess.exit(0);`;
        const r = spawnSync(process.execPath, ['--input-type=module', '-e', code], { encoding: 'utf8', cwd: sdir });
        const pass = r.status === 0;
        console.log(`${pass ? 'OK   ' : 'GAGAL'} ${label}`);
        if (!pass) { ok = false; console.log((r.stdout + r.stderr).split('\n').slice(0, 8).join('\n')); }
    };
    const u = (p) => JSON.stringify(pathToFileURL(join(sdir, p)).href);
    runSplit('bundel split: game (evolve/main.js)', `await import(${u('evolve/main.js')});`);
    runSplit('bundel split: wiki (wiki/wiki.js)', `await import(${u('wiki/wiki.js')});`);
    const lazy = readdirSync(join(sdir, 'evolve', 'chunks')).find((f) => f.startsWith('change-'));
    if (!lazy) { ok = false; console.log('GAGAL chunk changelog lazy tidak ditemukan'); }
    else runSplit('bundel split: chunk changelog lazy', `await import(${u('evolve/main.js')});\nconst m = await import(${u('evolve/chunks/' + lazy)});\nif (typeof m.getTopChange !== 'function') throw new Error('getTopChange tidak ter-ekspor');`);
} finally {
    rmSync(out, { recursive: true, force: true });
}
console.log(ok ? 'BUNDEL PRODUKSI OK' : 'BUNDEL PRODUKSI GAGAL');
process.exit(ok ? 0 : 1);

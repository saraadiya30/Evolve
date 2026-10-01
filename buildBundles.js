// Build game + wiki sekaligus dengan code splitting: modul yang dipakai keduanya masuk satu chunk bersama (tidak digandakan),
// dan changelog (wiki/change.js) dimuat lazy oleh game.
//   node buildBundles.js           -> produksi (minify)
//   node buildBundles.js --debug   -> tanpa minify + sourcemap
// Output: evolve/main.js, wiki/wiki.js, dan chunk bersama di evolve/chunks/ (nama berisi hash; folder dikosongkan tiap build).
// index.html dan wiki.html sudah memuat bundel sebagai type="module", dan `npm run deploy` / Dockerfile menyalin folder evolve/ dan wiki/,
// jadi chunk ikut terbawa. PENTING: commit juga isi evolve/chunks/ (build ini tidak boleh dipakai tanpa chunk-nya).
// Build satu-satu tanpa splitting tetap ada: `npm run evolve` dan `npm run wiki` (bundel mandiri).
const fs = require('node:fs');
const esbuild = require('esbuild');

const debug = process.argv.includes('--debug');
fs.rmSync('evolve/chunks', { recursive: true, force: true });

esbuild
    .build({
        logLevel: 'info',
        entryPoints: { 'evolve/main': './src/main.js', 'wiki/wiki': './src/wiki/wiki.js' },
        bundle: true,
        splitting: true,
        format: 'esm',
        minify: !debug,
        sourcemap: debug,
        outdir: '.',
        chunkNames: 'evolve/chunks/[name]-[hash]',
    })
    .catch(() => process.exit(1));

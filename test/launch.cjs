#!/usr/bin/env node
// Peluncur untuk script npm yang butuh Node modern (test, lint): Node ^20.19 || ^22.13 || >=24.
//
// Kenapa ada: package.json punya dependency `node` yang memasang biner Node 16 ke node_modules/.bin,
// sehingga di dalam `npm run ...` perintah `node` = Node 16 (terlalu tua untuk jsdom/ESLint 9).
// npm menyimpan lokasi Node asli di env `npm_node_execpath`, jadi peluncur ini memakainya.
//
// Pakai:  node test/launch.cjs <file.js|.mjs> [argumen...]
const { spawnSync } = require('node:child_process');

// ESLint 10, espree 11, dan jsdom 30 butuh Node ^20.19 || ^22.13 || >=24.
const parse = (v) => String(v).replace(/^v/, '').split('.').map((x) => parseInt(x, 10));
const supported = (v) => { const [ma, mi] = parse(v); return ma >= 24 || (ma === 22 && mi >= 13) || (ma === 20 && mi >= 19); };

function nodeSupported(bin) {
    const r = spawnSync(bin, ['--version'], { encoding: 'utf8' });
    return r.status === 0 && supported(r.stdout.trim());
}

let bin = null;
if (supported(process.version)) bin = process.execPath;
else {
    for (const c of [process.env.npm_node_execpath, 'node'].filter(Boolean)) {
        if (c !== process.execPath && nodeSupported(c)) { bin = c; break; }
    }
}
if (!bin) {
    console.error(`Perlu Node ^20.19, ^22.13, atau >=24 (syarat ESLint 10 dan jsdom 30). Node yang terdeteksi: ${process.version}.`);
    console.error('Install Node 20.19+ (mis. via nvm), lalu jalankan ulang. Build game sendiri tetap bisa memakai Node 16.');
    process.exit(1);
}
const r = spawnSync(bin, process.argv.slice(2), { stdio: 'inherit' });
process.exit(r.status === null ? 1 : r.status);

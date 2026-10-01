// Cek struktur data besar game (techs, races, actions, events, dst): urutan key, field, nilai, dan hash source fungsi.
// Tiap bagian di-hash (sha1) lalu dibandingkan dengan test/snap_struct_baseline.json.
//   node test/struct-check.mjs            -> cek (exit 1 kalau ada bagian yang beda)
//   node test/struct-check.mjs --update   -> tulis ulang baseline (setelah perubahan yang disengaja)
// Untuk melihat detail beda, jalankan test/dump-struct.mjs di dua versi kode lalu bandingkan keluarannya.
// Pengganti tech-equiv/truepath-equiv/obj-equiv yang dulu butuh salinan *_orig_tmp.js.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASELINE = join(__dirname, 'snap_struct_baseline.json');
const tmp = mkdtempSync(join(tmpdir(), 'evolve-struct-'));
const out = join(tmp, 'struct.json');
const r = spawnSync(process.execPath, [join(__dirname, 'dump-struct.mjs'), out], { encoding: 'utf8' });
if (r.status !== 0) { console.error(r.stdout, r.stderr); rmSync(tmp, { recursive: true, force: true }); process.exit(1); }
const dump = JSON.parse(readFileSync(out, 'utf8'));
rmSync(tmp, { recursive: true, force: true });

const hashes = Object.fromEntries(Object.entries(dump).map(([k, v]) => [k, createHash('sha1').update(JSON.stringify(v)).digest('hex').slice(0, 16)]));
if (process.argv.includes('--update') || !existsSync(BASELINE)) {
    writeFileSync(BASELINE, JSON.stringify(hashes, null, 2) + '\n');
    console.log(`Baseline struktur ditulis (${Object.keys(hashes).length} bagian).`);
    process.exit(0);
}
const base = JSON.parse(readFileSync(BASELINE, 'utf8'));
const bad = [...new Set([...Object.keys(base), ...Object.keys(hashes)])].filter((k) => base[k] !== hashes[k]);
if (bad.length) { console.log('STRUKTUR BEDA di bagian:', bad.join(', ')); process.exit(1); }
console.log(`STRUKTUR SAMA (${Object.keys(hashes).length} bagian)`);

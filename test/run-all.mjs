// Jalankan semua tes otomatis (yang punya exit code nonzero saat gagal). Pakai: npm test
//   node test/run-all.mjs            -> semua
//   node test/run-all.mjs stock auto -> hanya tes yang namanya mengandung kata itu
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TESTS = [
    ['try-import.mjs'],
    ['wiki-import.mjs'],
    ['bundle-import.mjs'],
    ['bundle-run.mjs'],
    ['cycles-check.mjs'],
    ['stocks-no-market.mjs'],
    ['stock-alloc.mjs'],
    ['stock-trade-bonus.mjs'],
    ['stock-storage-crates.mjs', ['user-save-1']],
    ['auto-core.mjs'],
    ['auto-clamp-lost.mjs'],
    ['auto-big-income.mjs'],
    ['auto-huge-income.mjs', ['user-save-1']],
    ['numeric-snapshot.mjs'],
    ['format-equiv.mjs'],
    ['boost-end.mjs'],
    ['autosave-throttle.mjs'],
    ['struct-check.mjs'],
    ['golden-check.mjs'],
];
const filters = process.argv.slice(2);
const selected = TESTS.filter(([f]) => !filters.length || filters.some((w) => f.includes(w)));
let failed = 0;
const rows = [];
for (const [file, args = []] of selected) {
    const t0 = Date.now();
    const r = spawnSync(process.execPath, [join(__dirname, file), ...args], { encoding: 'utf8', timeout: 300000 });
    const ok = r.status === 0;
    if (!ok) failed++;
    rows.push(`${ok ? 'LOLOS' : 'GAGAL'}  ${file.padEnd(26)} ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    if (!ok) rows.push((r.stdout + r.stderr).trim().split('\n').slice(-8).map((l) => '        ' + l).join('\n'));
}
console.log(rows.join('\n'));
console.log(`\n${selected.length - failed}/${selected.length} lolos`);
process.exit(failed ? 1 : 0);

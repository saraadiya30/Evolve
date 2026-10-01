// Golden master: simulasi 300 periode dari tiap fixture save (seed tetap, tanpa accelerated time),
// lalu hasilnya dibandingkan dengan baseline snap_user_baseline.json / snap_user2_baseline.json.
//   node test/golden-check.mjs            -> cek (exit 1 kalau ada beda)
//   node test/golden-check.mjs --update   -> tulis ulang baseline (HANYA setelah perubahan perilaku yang disengaja)
import { spawnSync } from 'node:child_process';
import { copyFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PERIODS = '300';
const CASES = [['user-save-1', 'snap_user_baseline.json'], ['user-save-2-synthetic', 'snap_user2_baseline.json']];
const update = process.argv.includes('--update');
let failed = 0;
for (const [fixture, baseline] of CASES) {
    const tmpName = `_golden_${fixture}.json`;
    const run = spawnSync(process.execPath, [join(__dirname, 'harness.mjs'), fixture, PERIODS, tmpName], { encoding: 'utf8', env: { ...process.env, NO_ATIME: '1' } });
    if (run.status !== 0) { console.log(`GAGAL jalankan harness untuk ${fixture}\n${run.stderr}`); failed++; continue; }
    if (update) { copyFileSync(join(__dirname, tmpName), join(__dirname, baseline)); console.log(`baseline ${baseline} diperbarui`); rmSync(join(__dirname, tmpName), { force: true }); continue; }
    const cmp = spawnSync(process.execPath, [join(__dirname, 'compare.mjs'), join(__dirname, baseline), join(__dirname, tmpName)], { encoding: 'utf8' });
    rmSync(join(__dirname, tmpName), { force: true });
    console.log(`${fixture}: ${cmp.stdout.trim().split('\n')[0]}`);
    if (cmp.status !== 0) { console.log(cmp.stdout.split('\n').slice(1, 12).join('\n')); failed++; }
}
if (!update) console.log(failed ? 'GOLDEN MASTER BEDA' : 'GOLDEN MASTER SAMA');
process.exit(failed ? 1 : 0);

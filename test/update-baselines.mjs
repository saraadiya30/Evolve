// Perbarui semua baseline snapshot. HANYA dipakai setelah perubahan perilaku yang disengaja (cek `git diff test/` sesudahnya).
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
let failed = 0;
for (const f of ['numeric-snapshot.mjs', 'struct-check.mjs', 'golden-check.mjs']) {
    const r = spawnSync(process.execPath, [join(dir, f), '--update'], { stdio: 'inherit' });
    if (r.status !== 0) failed++;
}
process.exit(failed ? 1 : 0);

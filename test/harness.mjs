// Fase 0.3 — harness runner
// Cara pakai: node test/harness.mjs <nama_fixture|"new"> <jumlah_periode> <output.json>
// "new" = mulai dari game baru (newGameData(), gak butuh save fixture eksternal)
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const [, , fixtureArg = 'new', periodsArg = '500', outArg = 'snapshot.json'] = process.argv;
const periods = parseInt(periodsArg, 10);
const SEED = 12345; // seed tetap biar reproducible antar run harness
const FIXED_NOW = 1735689600000; // 2025-01-01T00:00:00Z, arbitrer tapi tetap

seedMathRandom(SEED);
setFixedNow(FIXED_NOW);

// Kalau fixture bukan "new", muat save string (hasil export dari game asli,
// format LZString-compressed base64 seperti yang dipakai localStorage['evolved'])
// ke localStorage SEBELUM main.js/vars.js di-import, karena vars.js baca save
// itu di top-level module load (lihat vars.js baris ~82-97).
if (fixtureArg !== 'new') {
    const fixturePath = join(__dirname, 'fixtures', `${fixtureArg}.json`);
    const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));
    // fixture.save diharapkan berupa string mentah hasil `save.getItem('evolved')` di game asli
    global.localStorage.setItem('evolved', fixture.save);
}

const { global: gameState, seededRandom } = await import('../src/vars.js');
const { execGameLoops } = await import('../src/main.js');

// Reset seed & waktu LAGI setelah import, karena proses import vars.js/main.js sendiri
// kemungkinan udah manggil seededRandom()/Math.random()/Date.now() beberapa kali buat
// setup awal (misal genPlanets utk race seeded) -- kita mau titik START
// simulasi tick-nya konsisten, bukan cuma dari awal proses Node.
seedMathRandom(SEED);
setFixedNow(FIXED_NOW);

execGameLoops(periods);

// --- Snapshot: ambil bagian state yang relevan, bulatkan angka desimal ---
function roundDeep(obj, decimals = 6) {
    if (typeof obj === 'number') {
        return Number.isFinite(obj) ? Number(obj.toFixed(decimals)) : obj;
    }
    if (Array.isArray(obj)) return obj.map(v => roundDeep(v, decimals));
    if (obj && typeof obj === 'object') {
        const out = {};
        for (const k of Object.keys(obj).sort()) out[k] = roundDeep(obj[k], decimals);
        return out;
    }
    return obj;
}

const snapshotKeys = ['resource', 'city', 'civic', 'race', 'tech', 'stats', 'prestige', 'arpa', 'portal', 'space', 'stocks', 'settings'];
const snapshot = {};
for (const key of snapshotKeys) {
    if (gameState[key] !== undefined) snapshot[key] = roundDeep(gameState[key]);
}

const outPath = join(__dirname, outArg);
writeFileSync(outPath, JSON.stringify(snapshot, null, 2));
console.log(`[harness] fixture=${fixtureArg} periods=${periods} seed=${SEED} -> ${outArg}`);
process.exit(0);

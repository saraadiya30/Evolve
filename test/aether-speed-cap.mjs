// Aether untuk game speed: satu panggilan execGameLoops memuat paling banyak maxLoopPeriods() (= longRatio * 12) period,
// jadi Aether yang dipakai tidak boleh melebihi yang masih muat (sisanya dulu hangus: dikurangi dari stok tapi tidak disimulasikan).
// Cek affordableSpeedDraw: batas atas, batas stok, batas setting, periods dasar > 1, input tidak valid.
// Pakai: node test/aether-speed-cap.mjs <fixture>
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const [fx = 'user-save-1'] = process.argv.slice(2);
seedMathRandom(12345); setFixedNow(1735689600000);
global.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, 'fixtures', fx + '.json'), 'utf8')).save);
const { webWorker } = await import('../src/core/vars.js');
const runner = await import('../src/loops/game_loop_runner.js');

let ok = true;
function check(label, got, want){
    const good = got === want;
    console.log(`${good ? 'OK    ' : 'GAGAL '} ${label}: ${got} (harapan ${want})`);
    if (!good) ok = false;
}

const cap = webWorker.longRatio * 12;
check('maxLoopPeriods = longRatio * 12', runner.maxLoopPeriods(), cap);
const d = runner.affordableSpeedDraw;
check('setting dan stok kecil: dipakai apa adanya', d(1, 10, 1000), 10);
check('setting lebih besar dari stok: batas stok', d(1, 500, 7), 7);
check('stok pecahan dibulatkan ke bawah', d(1, 500, 7.9), 7);
check('setting dan stok melewati batas: hanya yang muat', d(1, 500, 1000), cap - 1);
check('total period = batas persis', 1 * (1 + d(1, 500, 1000)), cap);
check('periods dasar 2: ruang berkurang', d(2, 500, 1000), Math.floor(cap / 2) - 1);
check('periods dasar 2: total tidak melewati batas', 2 * (1 + d(2, 500, 1000)) <= cap, true);
check('periods dasar sudah sama dengan batas: 0', d(cap, 500, 1000), 0);
check('periods dasar melebihi batas: 0 (tidak negatif)', d(cap * 2, 500, 1000), 0);
check('periods dasar 0: tidak ada simulasi, tidak ada yang dipakai', d(0, 500, 1000), 0);
check('setting 0', d(1, 0, 1000), 0);
check('stok 0', d(1, 500, 0), 0);
check('stok NaN', d(1, 500, NaN), 0);
check('setting undefined', d(1, undefined, 1000), 0);

console.log(ok ? 'LOLOS' : 'GAGAL');
process.exit(ok ? 0 : 1);

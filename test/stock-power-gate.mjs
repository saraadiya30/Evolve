// Stock Power (Wattbridge Grid Holdings) baru tampil setelah listrik (electricity, high_tech >= 2) ditemukan: flag
// city.powered saja tidak cukup, karena beberapa setup stage memaksanya true (semuanya sekaligus menyetel high_tech tinggi).
// Cek listed('Power') untuk: belum powered, powered tapi high_tech 1, powered dengan high_tech 2, dan high_tech tinggi.
// Pakai: node test/stock-power-gate.mjs <fixture>
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const [fx = 'user-save-1'] = process.argv.slice(2);
seedMathRandom(12345); setFixedNow(1735689600000);
global.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, 'fixtures', fx + '.json'), 'utf8')).save);
const { global: G } = await import('../src/core/vars.js');
const { execGameLoops } = await import('../src/main.js');
const stocks = await import('../src/stocks/stocks.js');
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(5);

let ok = true;
function check(label, got, want){
    const good = got === want;
    console.log(`${good ? 'OK    ' : 'GAGAL '} ${label}: ${got} (harapan ${want})`);
    if (!good) ok = false;
}

const def = { res: 'Power', fair: 90 };
G.city.powered = false; G.tech.high_tech = 1;
check('belum powered, belum listrik', stocks.listed(def), false);
G.city.powered = true; G.tech.high_tech = 1;
check('powered dipaksa true tapi electricity belum ada', stocks.listed(def), false);
G.tech.high_tech = 2;
check('electricity ditemukan', stocks.listed(def), true);
G.tech.high_tech = 7;
check('high_tech tinggi (stage khusus)', stocks.listed(def), true);
delete G.tech.high_tech;
check('tanpa high_tech sama sekali', stocks.listed(def), false);

console.log(ok ? 'LOLOS' : 'GAGAL');
process.exit(ok ? 0 : 1);

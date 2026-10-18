// Stock Army (Ironclad Garrison Corp.): tiap lot menambah 0.1 kapasitas maksimal tentara (garrison.max), dibulatkan ke bawah.
// Cek: (1) fungsi murni armyCapBonus (0 lot, di bawah 10 lot, kelipatan 10, float 30 * 0.1, input tidak valid);
// (2) Army terdaftar sebagai stock spesial dan tidak ikut alokasi storage; (3) listed('Army') menunggu garnisun
// (garrison.display); (4) mid loop menaikkan garrison.max sesuai lot dan menurunkannya lagi saat lot dijual.
// Pakai: node test/stock-army.mjs <fixture>
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const [fx = 'user-save-1'] = process.argv.slice(2);
seedMathRandom(12345); setFixedNow(1735689600000);
global.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, 'fixtures', fx + '.json'), 'utf8')).save);
const { global: G, webWorker } = await import('../src/core/vars.js');
const { execGameLoops } = await import('../src/main.js');
const core = await import('../src/stocks/stocks_core.js');
const stocks = await import('../src/stocks/stocks.js');
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(5);

let ok = true;
function check(label, got, want){
    const good = typeof want === 'number' ? Math.abs(got - want) <= Math.abs(want) * 1e-12 + 1e-12 : got === want;
    console.log(`${good ? 'OK    ' : 'GAGAL '} ${label}: ${got} (harapan ${want})`);
    if (!good) ok = false;
}

check('0 lot', core.armyCapBonus(0), 0);
check('9 lot (di bawah 1 tentara)', core.armyCapBonus(9), 0);
check('10 lot = +1', core.armyCapBonus(10), 1);
check('30 lot = +3 (float 30 * 0.1)', core.armyCapBonus(30), 3);
check('95 lot dibulatkan ke bawah', core.armyCapBonus(95), 9);
check('1000 lot = +100', core.armyCapBonus(1000), 100);
check('lot negatif', core.armyCapBonus(-50), 0);
check('lot NaN', core.armyCapBonus(NaN), 0);
check('lot undefined', core.armyCapBonus(undefined), 0);

stocks.initStocks();
const S = G.stocks;
check('Army terdaftar di market', !!S.market.Army, true);
check('Army termasuk stock spesial', stocks.isSpecial('Army'), true);
check('bonus per lot Army', stocks.specialBonusPerLot('Army'), core.ARMY_BONUS_PER_LOT);
S.market.Army.lots = 10;
check('storageLots Army = 0 (tanpa alokasi storage)', core.storageLots(S.market.Army), 0);

// Gate tampil: menunggu job tentara terbuka
const def = { res: 'Army', fair: 110 };
G.civic.garrison.display = false;
check('listed Army: garnisun belum terbuka', stocks.listed(def), false);
G.civic.garrison.display = true;
check('listed Army: garnisun terbuka', stocks.listed(def), true);

// Mid loop: kapasitas tentara naik sesuai lot, dan balik lagi saat lot dijual
const midTicks = webWorker.midRatio + 1;
S.market.Army.lots = 0;
execGameLoops(midTicks);
const base = G.civic.garrison.max;
S.market.Army.lots = 100;
execGameLoops(midTicks);
check('100 lot: garrison.max naik 10', G.civic.garrison.max, base + 10);
S.market.Army.lots = 5;
execGameLoops(midTicks);
check('5 lot: tidak menambah apa-apa', G.civic.garrison.max, base);
S.market.Army.lots = 1000;
execGameLoops(midTicks);
check('1000 lot: garrison.max naik 100', G.civic.garrison.max, base + 100);
S.market.Army.lots = 0;
execGameLoops(midTicks);
check('lot dijual: kapasitas kembali', G.civic.garrison.max, base);

// Garnisun belum terbuka: lot yang tersisa tidak menambah kapasitas
G.civic.garrison.display = false;
S.market.Army.lots = 100;
execGameLoops(midTicks);
check('garnisun belum terbuka: lot tidak menambah kapasitas', G.civic.garrison.max, base);

console.log(ok ? 'LOLOS' : 'GAGAL');
process.exit(ok ? 0 : 1);

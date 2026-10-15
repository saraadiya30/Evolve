// Bonus morale Stock Portfolio (+0.1 per lot) adalah bagian dari total morale: Current = Total yang dipotong lantai (m_min) dan
// cap. Dulu bonus ditambah SETELAH lantai dan cap, jadi total di bawah cap (mis. 134.2 dengan cap 148) tetap jadi Current = cap
// (morale sebelum bonus 12.7 dinaikkan dulu ke lantai 50, lalu +121.5 = 171.5, lalu dipotong ke cap).
// `potential` (dibaca governor untuk pajak) harus total yang sama dengan yang menurunkan Current, termasuk bonus stock.
// Pakai: node test/morale-stock-clamp.mjs [fixture]
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const fx = process.argv[2] || 'user-save-1';
seedMathRandom(12345); setFixedNow(1735689600000);
global.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, 'fixtures', fx + '.json'), 'utf8')).save);
const { global: G } = await import('../src/core/vars.js');
const { S_loops: S } = await import('../src/core/registries.js');
const { execGameLoops } = await import('../src/main.js');
const { fastLoopMoraleCap } = await import('../src/loops/fast/fast_loop_morale_cap.js');
const { MORALE_BONUS_PER_LOT } = await import('../src/stocks/stocks_core.js');
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(5);
// Keadaan netral agar hanya lantai, cap, dan bonus stock yang berperan
G.civic.govern.fr = 0;
for (const k of ['tormented', 'wish', 'optimistic', 'truepath', 'blissful']){ delete G.race[k]; }
let ok = true;
const check = (name, cond) => { console.log(`${cond ? 'ok  ' : 'GAGAL'} ${name}`); if (!cond) ok = false; };
const near = (a, b) => Math.abs(a - b) <= 0.05;
const calc = (base, lots) => {
    G.stocks.market.Morale = G.stocks.market.Morale || {};
    G.stocks.market.Morale.lots = lots;
    const ctx = { morale: base, geckoFathom: 0, global_multiplier: 1 };
    fastLoopMoraleCap(ctx);
    return { current: G.city.morale.current, cap: S.moraleCap, potential: G.city.morale.potential };
};
const { cap } = calc(100, 0);
const FLOOR = calc(-500, 0).current;
check(`lantai morale masuk akal (cap ${cap}, lantai ${FLOOR})`, FLOOR > 0 && FLOOR < cap);
// 1. Kasus laporan: morale sebelum bonus di bawah lantai, total dengan bonus di antara lantai dan cap
const base = FLOOR - 40, target = (FLOOR + cap) / 2;
let r = calc(base, (target - base) / MORALE_BONUS_PER_LOT);
check('total di bawah cap: Current = Total (bukan cap)', near(r.current, target) && r.current < cap - 1);
check('total di bawah cap: potential = Total (governor melihat angka yang sama)', near(r.potential, target) && r.potential < cap);
// 2. Total di atas cap: dipotong ke cap
r = calc(base, (cap + 500 - base) / MORALE_BONUS_PER_LOT);
check('total di atas cap: Current = cap', near(r.current, r.cap));
check('total di atas cap: potential = Total penuh (selisih ke cap terbaca governor)', near(r.potential, cap + 500));
// 3. Total (dengan bonus) masih di bawah lantai: tetap dinaikkan ke lantai
r = calc(base, ((FLOOR - 10) - base) / MORALE_BONUS_PER_LOT);
check('total di bawah lantai: Current = lantai', near(r.current, FLOOR));
// 4. Tanpa lot: perilaku lama tidak berubah
r = calc(base, 0);
check('tanpa lot: Current = lantai', near(r.current, FLOOR));
check('tanpa lot: potential = morale apa adanya (sebelum lantai)', near(r.potential, base));
r = calc(cap - 5, 0);
check('tanpa lot, di bawah cap: Current = morale', near(r.current, cap - 5));
// 5. Menjual lot menghapus bonus pada perhitungan berikutnya
calc(base, 500); r = calc(base, 0);
check('lot dijual: bonus hilang', near(r.current, FLOOR) && near(r.potential, base));
process.exit(ok ? 0 : 1);

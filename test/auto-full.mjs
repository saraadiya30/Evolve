// Auto-convert saat Money sudah penuh: "keep" yang tidak muat di storage ikut dikonversi ke Ocoin, bukan terbuang oleh cap.
// Money/s yang tampil jadi 0 saat penuh, dan tepat sebesar sisa ruang saat hampir penuh.
import { autoTradeStep, moneyToOcoin } from '../src/stocks/stocks_core.js';
let ok = true;
const check = (name, cond) => { console.log(`${cond ? 'ok  ' : 'GAGAL'} ${name}`); if (!cond) ok = false; };
const near = (a, b) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
const tick = (start, max, natural, keep) => { // produksi -> cap -> auto-balance (sama seperti fastLoop)
    const S = { ocoin: 0 }, m = { amount: start + natural, max, delta: natural };
    const lost = Math.max(0, m.amount - max); m.amount = Math.min(m.amount, max);
    const out = autoTradeStep(S, m, natural, keep, lost, start);
    return { S, m, out };
};
let r = tick(14260000, 14260000, 23225, 250);   // penuh, income 92,9K/s, keep 1000/s (per tick 0,25 s)
check('penuh: Money tetap di max', r.m.amount === 14260000);
check('penuh: Money/tick jadi 0', near(r.m.delta, 0));
check('penuh: seluruh income dikonversi', near(r.out.money, 23225) && near(r.S.ocoin, moneyToOcoin(23225)));
r = tick(14259900, 14260000, 23225, 250);       // sisa ruang 100 < keep 250
check('hampir penuh: Money/tick = sisa ruang', near(r.m.delta, 100) && r.m.amount === 14260000);
check('hampir penuh: sisanya dikonversi', near(r.out.money, 23225 - 100));
r = tick(1000000, 14260000, 23225, 250);        // jauh dari penuh: perilaku lama
check('belum penuh: Money naik tepat keep', near(r.m.delta, 250) && near(r.m.amount, 1000250));
check('belum penuh: konversi = income - keep', near(r.out.money, 23225 - 250));
r = tick(14260000, 14260000, 100, 250);         // income di bawah keep dan Money penuh: tidak ada yang dipindah
check('income < keep & penuh: tidak ada konversi', r.out.kind === 'none');
process.exit(ok ? 0 : 1);

// Money yang terpotong cap storage diubah jadi Ocoin walau Auto Convert mati (capOverflowStep), dan Money/s yang tampil jadi
// 0 saat penuh. Urutannya sama seperti stockAutoTrade: autoTradeStep kalau Auto nyala; kalau tidak ada yang dikonversi, kelebihan cap.
import { autoTradeStep, capOverflowStep, moneyToOcoin } from '../src/stocks/stocks_core.js';
let ok = true;
const check = (name, cond) => { console.log(`${cond ? 'ok  ' : 'GAGAL'} ${name}`); if (!cond) ok = false; };
const near = (a, b) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
const tick = (start, max, natural, keep, autoOn) => { // produksi -> cap -> (auto) -> kelebihan cap
    const S = { ocoin: 0 }, m = { amount: start + natural, max, delta: natural };
    const lost = Math.max(0, m.amount - max); m.amount = Math.min(m.amount, max);
    let out = { kind: 'none' };
    if (autoOn){ out = autoTradeStep(S, m, natural, keep, lost, start); }
    if (out.kind === 'none'){ out = capOverflowStep(S, m, natural, lost); }
    return { S, m, out };
};
let r = tick(14260000, 14260000, 23225, 0, false);
check('auto mati + penuh: Money tetap di max', r.m.amount === 14260000);
check('auto mati + penuh: Money/tick jadi 0', r.m.delta === 0);
check('auto mati + penuh: seluruh income jadi Ocoin', near(r.out.money, 23225) && near(r.S.ocoin, moneyToOcoin(23225)));
r = tick(14259900, 14260000, 23225, 0, false);
check('auto mati + hampir penuh: Money/tick = sisa ruang', near(r.m.delta, 100) && r.m.amount === 14260000);
check('auto mati + hampir penuh: sisanya jadi Ocoin', near(r.out.money, 23125) && near(r.S.ocoin, moneyToOcoin(23125)));
r = tick(1000000, 14260000, 23225, 0, false);
check('auto mati + belum penuh: tidak ada yang berubah', r.out.kind === 'none' && r.m.delta === 23225 && r.S.ocoin === 0);
r = tick(14260000, 1e30, 23225, 0, false);
check('storage tanpa batas: tidak ada konversi', r.out.kind === 'none' && r.m.delta === 23225);
r = tick(1e21, 1e21, 3e21, 0, false);
check('income raksasa + penuh: Money/tick tepat 0 (tanpa noise pembulatan)', r.m.delta === 0 && near(r.out.money, 3e21));
r = tick(14260000, 14260000, 100, 250, true);
check('auto nyala, income < keep, penuh: kelebihan cap tetap jadi Ocoin', r.out.kind === 'overflow' && r.m.delta === 0 && near(r.S.ocoin, moneyToOcoin(100)));
r = tick(14260000, 14260000, 23225, 250, true);
check('auto nyala: tetap pakai konversi auto (bukan overflow)', r.out.kind === 'convert' && near(r.m.delta, 0));
process.exit(ok ? 0 : 1);

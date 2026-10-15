// Konversi Aether -> Money (fast_loop_core) menambah Money langsung, tanpa modRes. Kelebihan di atas cap harus dipotong dan
// dicatat sebagai "lost" saat itu juga; kalau tidak, pengeluaran Money berikutnya di tick yang sama memotongnya tanpa catatan,
// auto-convert Ocoin hanya mengonversi sebagian, Money terkuras ke 0, dan Money/s yang tampil bukan 0 padahal sudah penuh.
import { autoTradeStep, moneyToOcoin } from '../src/stocks/stocks_core.js';
let ok = true;
const check = (name, cond) => { console.log(`${cond ? 'ok  ' : 'GAGAL'} ${name}`); if (!cond) ok = false; };
const near = (a, b) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
// Satu tick: Aether -> Money (G), lalu modRes pengeluaran (u) dan produksi (p), clamp akhir, lalu auto-balance
const tick = ({ start, max, G, u, p, keep }) => {
    const S = { ocoin: 0 }, m = { amount: start, max, delta: 0 };
    let lost = 0;
    m.amount += G; m.delta += G;
    if (m.max >= 0 && m.amount > m.max){ lost += m.amount - m.max; m.amount = m.max; } // sama seperti fast_loop_core
    const modRes = (val) => {
        let c = m.amount + val;
        if (c > m.max){ if (val > 0) lost += c - m.max; c = m.max; }
        m.amount = c; m.delta += val;
    };
    modRes(-u); modRes(p);
    if (m.amount > m.max){ lost += m.amount - m.max; m.amount = m.max; }
    const natural = m.delta;
    const out = autoTradeStep(S, m, natural, keep, lost, start);
    return { S, m, out, natural };
};
let r = tick({ start: 14270000, max: 14270000, G: 5e9, u: 1000, p: 31000, keep: 0 });
check('Aether besar + penuh: Money tetap di max', r.m.amount === 14270000);
check('Aether besar + penuh: Money/tick jadi 0', near(r.m.delta, 0));
check('Aether besar + penuh: seluruh kelebihan jadi Ocoin', near(r.out.money, r.natural) && near(r.S.ocoin, moneyToOcoin(r.natural)));
r = tick({ start: 14270000, max: 14270000, G: 5e9, u: 1000, p: 31000, keep: 250 });
check('keep 250: Money/tick = sisa ruang (0 saat penuh)', near(r.m.delta, 0) && r.m.amount === 14270000);
r = tick({ start: 1000000, max: 14270000, G: 5e9, u: 0, p: 31000, keep: 250 });
check('belum penuh: Money naik tepat keep', near(r.m.delta, 250) && near(r.m.amount, 1000250));
r = tick({ start: 14270000, max: 14270000, G: 5, u: 1000, p: 31000, keep: 0 });
check('Aether kecil + penuh: tetap 0', near(r.m.delta, 0) && r.m.amount === 14270000);
process.exit(ok ? 0 : 1);

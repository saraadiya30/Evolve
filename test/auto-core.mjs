// Tes murni autoTradeStep (tanpa game): model tick = produksi -> cap storage -> auto-balance.
// Invarian: (1) Money akhirnya penuh kalau Keep > 0 dan income > Keep, berapa pun besar income;
//           (2) selama belum penuh Money naik tepat Keep per tick; (3) Ocoin tidak pernah negatif / NaN;
//           (4) lost=0 (default) berperilaku persis seperti versi lama.
import { autoTradeStep, moneyToOcoin } from '../src/stocks_core.js';
let s = 424242; const rnd = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
function oldStep(S, money, natural, keep) { // salinan versi sebelum perbaikan
    let out = { kind: 'none', money: 0, ocoin: 0 };
    if (natural > keep) { let move = Math.min(natural - keep, Math.max(0, money.amount)); if (move > 0) { money.amount -= move; money.delta -= move; S.ocoin += moneyToOcoin(move); out = { kind: 'convert', money: move }; } }
    return out;
}
let fail = 0; const bad = m => { fail++; if (fail <= 10) console.log('GAGAL:', m); };
let stuckOld = 0, N = 3000;
for (let i = 0; i < N; i++) {
    const max = 1e3 + rnd() * 1e7, keep = max * (0.001 + rnd() * 0.05), natural = keep * (1.1 + rnd() * 400), start = rnd() * max;
    for (const variant of ['new', 'old']) {
        const S = { ocoin: 0 }, m = { amount: start, max, delta: 0 };
        let a = m.amount, lastGrowth = 0;
        for (let t = 0; t < 3000; t++) {
            a = m.amount; m.amount += natural;          // produksi
            let lost = 0; if (m.amount > m.max) { lost = m.amount - m.max; m.amount = m.max; } // cap storage
            if (variant === 'new') autoTradeStep(S, m, natural, keep, lost); else oldStep(S, m, natural, keep);
            lastGrowth = m.amount - a;
            if (!(S.ocoin >= 0) || !isFinite(m.amount)) { bad(`${variant} ocoin/amount tak valid`); break; }
            if (variant === 'new' && m.amount < max - keep - 1e-6 && a < max - keep - 1e-6 && Math.abs(lastGrowth - keep) > 1e-6 * Math.max(1, keep)) { bad(`new: naik ${lastGrowth} != keep ${keep} (amount ${a}/${max})`); break; }
        }
        if (variant === 'new' && m.amount < max - 1e-6) bad(`new: tidak penuh (${m.amount}/${max}) natural=${natural} keep=${keep}`);
        if (variant === 'old' && m.amount < max * 0.999) stuckOld++;
    }
}
// lost=0 identik dengan lama
for (let i = 0; i < 2000; i++) {
    const max = 1e4 + rnd() * 1e6, keep = rnd() * 1e3, natural = rnd() * 3e3, amount = rnd() * max;
    const A = { ocoin: rnd() * 10 }, B = { ...A }, mA = { amount, max, delta: 0 }, mB = { amount, max, delta: 0 };
    if (natural > keep) { oldStep(A, mA, natural, keep); autoTradeStep(B, mB, natural, keep); if (A.ocoin !== B.ocoin || mA.amount !== mB.amount || mA.delta !== mB.delta) bad('lost=0 beda dari lama'); }
}
console.log(`skenario: ${N} | versi LAMA mandek di bawah max: ${stuckOld} | gagal pada versi baru: ${fail}`);
console.log(fail === 0 ? 'AUTO-BALANCE OK' : 'AUTO-BALANCE GAGAL');
process.exit(fail === 0 ? 0 : 1);

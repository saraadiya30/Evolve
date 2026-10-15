// Gold Bar: konversi Ocoin <-> Gold Bar (1 bar = 1.000.000 Ocoin, tanpa komisi, bilangan bulat) dan bertahan setelah reset.
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
seedMathRandom(12345); setFixedNow(1735689600000);
const { GOLD_BAR_OCOIN, goldBarCount, maxGoldBarsFromOcoin, ocoinToGoldBars, goldBarsToOcoin } = await import('../src/stocks/stocks_core.js');
const { global: G, clearStates } = await import('../src/core/vars.js');
let ok = true;
const check = (name, cond) => { console.log(`${cond ? 'ok  ' : 'GAGAL'} ${name}`); if (!cond) ok = false; };

const S = { ocoin: 3500000 }, st = { goldBars: 0 };
check('1 bar = 1.000.000 Ocoin', GOLD_BAR_OCOIN === 1000000);
check('maks bar dari 3,5 juta Ocoin = 3', maxGoldBarsFromOcoin(S) === 3);
check('tidak bisa beli lebih dari saldo', ocoinToGoldBars(S, st, 4) === false && S.ocoin === 3500000 && st.goldBars === 0);
check('beli 2 bar: tanpa komisi', ocoinToGoldBars(S, st, 2) && S.ocoin === 1500000 && st.goldBars === 2);
check('pecahan dibulatkan ke bawah (2,9 -> 2)', goldBarsToOcoin(S, st, 2.9) && st.goldBars === 0 && S.ocoin === 3500000);
check('tidak bisa jual lebih dari bar yang dimiliki', goldBarsToOcoin(S, st, 1) === false);
check('0, negatif, NaN ditolak', !ocoinToGoldBars(S, st, 0) && !ocoinToGoldBars(S, st, -1) && !ocoinToGoldBars(S, st, NaN));
check('goldBarCount menolak data rusak', goldBarCount({ goldBars: -5 }) === 0 && goldBarCount({ goldBars: NaN }) === 0 && goldBarCount({}) === 0);
const total0 = S.ocoin + st.goldBars * GOLD_BAR_OCOIN;
ocoinToGoldBars(S, st, 1); goldBarsToOcoin(S, st, 1); ocoinToGoldBars(S, st, 3);
check('nilai total tidak berubah (tanpa komisi)', S.ocoin + st.goldBars * GOLD_BAR_OCOIN === total0);

// Bertahan setelah reset: global.stocks dikosongkan clearStates, global.settings tidak
G.settings.goldBars = 7; G.stocks = { ocoin: 123 };
clearStates();
check('Ocoin ikut ke-reset, Gold Bar tetap', G.stocks.ocoin === 0 && G.settings.goldBars === 7);
process.exit(ok ? 0 : 1);

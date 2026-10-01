// Regresi: global.stocks ada tapi global.stocks.market belum (clearStates() hanya membuat { ocoin: 0 };
// market baru dibuat initStocks() di stockTick/stockAutoTrade). Hitung morale / power grid tidak boleh crash.
// Pakai: node test/stocks-no-market.mjs [fixture]   (default user-save-1)
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = process.argv[2] || 'user-save-1';
seedMathRandom(12345);
setFixedNow(1735689600000);
const fx = JSON.parse(readFileSync(join(__dirname, 'fixtures', `${fixture}.json`), 'utf8'));
global.localStorage.setItem('evolved', fx.save);

const { global: gameState } = await import('../src/core/vars.js');
const { execGameLoops } = await import('../src/main.js');

gameState.stocks = { ocoin: 0 };   // persis hasil clearStates(): ada stocks, belum ada market
try {
    execGameLoops(3);
    console.log('LOLOS: execGameLoops tidak crash saat stocks.market belum ada');
    process.exit(0);
} catch (e) {
    console.error('GAGAL:', e.message);
    console.error(e.stack.split('\n').slice(0, 4).join('\n'));
    process.exit(1);
}

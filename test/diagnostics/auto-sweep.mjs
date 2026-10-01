// Sapu kombinasi Keep x Ocoin x isi-storage: cari kasus Money TIDAK naik padahal Keep>0 dan masih ada ruang.
import '../env-setup.mjs';
import { seedMathRandom, setFixedNow } from '../env-setup.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const fx = process.argv[2] || 'user-save-1';
seedMathRandom(12345); setFixedNow(1735689600000);
global.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, '..', 'fixtures', fx + '.json'), 'utf8')).save);
const { global: G } = await import('../../src/core/vars.js');
const { execGameLoops } = await import('../../src/main.js');
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(5);
const M = G.resource.Money;
const natural = 5661; // income alami fixture 1 per detik
const cases = [];
for (const keep of [0, 1, 500, 5000, 5661, 6000, 20000])
  for (const ocoin of [0, 0.5, 50, 1e6])
    for (const frac of [0.05, 0.72, 0.98, 1.0, 1.05]) cases.push({ keep, ocoin, frac });
const bad = [];
for (const c of cases) {
  G.settings.stockAutoOn = true; G.settings.stockAutoKeep = c.keep;
  G.stocks.ocoin = c.ocoin; G.stocks.autoAdj = 0; M.amount = c.frac * M.max;
  execGameLoops(3); // settle
  const a0 = M.amount; execGameLoops(40); const a1 = M.amount;
  const grew = a1 - a0, room = M.max - a0;
  const expect = Math.min(c.keep, natural) > 0 && room > 1000 && (c.keep <= natural || c.ocoin > 1);
  if (expect && grew <= 0) bad.push({ ...c, grew: +grew.toFixed(1), room: +room.toFixed(0), a0: +a0.toFixed(0), max: M.max });
}
console.log('kasus:', cases.length, '| TIDAK naik padahal seharusnya:', bad.length);
bad.slice(0, 12).forEach(b => console.log(JSON.stringify(b)));
process.exit(0);

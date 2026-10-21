import type { ProductionInput, ProductionResult } from '../contract';

/** Resolver produksi (semantik terverifikasi di notes/PARITY.md, "Breakdown Evolve sebagai oracle"). */
export function resolveProduction(input: ProductionInput): ProductionResult {
  let running = 0;
  let cur: number | null = null; // base sumber yang sedang dibangun
  let mult = 1;                  // pengali lokal sumber itu
  const flush = (): void => {
    if (cur !== null) running += cur * mult;
    cur = null;
    mult = 1;
  };
  for (const e of input.entries) {
    switch (e.kind) {
      case 'source': flush(); cur = e.value; break;
      case 'source-mult': if (cur !== null) mult *= 1 + e.value / 100; break;
      case 'source-add': if (cur !== null) cur += e.value; break;
      case 'running-mult': flush(); running *= 1 + e.value / 100; break;
    }
  }
  flush();
  let globalFactor = 1;
  for (const p of input.global) globalFactor *= 1 + p / 100;
  const consumption = input.consume.reduce((a, b) => a + b, 0);
  const gross = running * globalFactor;
  return { gross, globalFactor, consumption, net: gross + consumption };
}

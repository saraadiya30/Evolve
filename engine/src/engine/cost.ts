import type { CostRequest, CostResult, CostVector } from '../contract';
import { callLibrary, evalExpr, type EvalCtx } from './expr';

/**
 * Cost bangunan = dua langkah, KEDUANYA data (tidak ada aturan game di file ini):
 *  1. cost mentah per resource: evaluasi ekspresi tiap resource (geometrik `costMultiplier`/`spaceCostMultiplier`, kondisi, konstanta, pembungkus);
 *  2. rantai adjuster: fungsi pustaka `adjustCosts` (16 adjuster berurutan) yang bekerja atas vektor cost.
 * Nilai non-numerik / tak hingga dibuang, sama seperti yang dilihat pemain/oracle.
 */
export function resolveCost(req: CostRequest): CostResult {
  const offset = req.offset ?? 0;
  const base: Omit<EvalCtx, 'locals' | 'rawCosts'> = { facts: req.facts, library: req.library, entry: req.entry, count: req.count };
  const raw: CostVector = {};
  for (const res of Object.keys(req.entry.costs)) {
    const fn = req.entry.costs[res]!;
    const locals: Record<string, unknown> = {};
    if (fn.params[0]) locals[fn.params[0]] = offset;
    const v = evalExpr(fn.expr, { ...base, rawCosts: raw, locals });
    if (typeof v === 'number' && Number.isFinite(v)) raw[res] = v;
  }
  const adj = callLibrary('adjustCosts', [undefined, offset, false], { ...base, rawCosts: raw, locals: {} }) as Record<string, unknown>;
  const adjusted: CostVector = {};
  for (const [k, v] of Object.entries(adj)) if (typeof v === 'number' && Number.isFinite(v)) adjusted[k] = v;
  return { raw, adjusted };
}

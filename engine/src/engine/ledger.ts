import type { LedgerInput, LedgerResult } from '../contract';

/**
 * Resolver ledger. `total` = base + jumlah baris (label sama digabung oleh pemanggil); `potential` = total yang dibulatkan
 * (yang dibaca governor/tooltip); `current` = total setelah tahap lanjutan berurutan (bounds, mult).
 */
export function resolveLedger(input: LedgerInput): LedgerResult {
  let total = input.base;
  for (const p of input.parts) total += p.value;
  const d = input.potentialDecimals;
  const potential = d === undefined ? total : +total.toFixed(d);
  let current = total;
  for (const st of input.stages) {
    if (st.kind === 'bounds') {
      if (st.min !== undefined && current < st.min) current = st.min;
      else if (st.cap !== undefined && current > st.cap) current = st.cap + (current - st.cap) * (st.leak ?? 0) / 100;
    } else current *= st.value;
  }
  return { total, potential, current };
}

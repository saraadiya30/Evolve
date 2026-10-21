import type { CapEntry, CapResult } from '../contract';

/** Resolver cap: jumlah kontribusi flat; entri persen-dari-total-berjalan dikonversi jadi flat pada posisinya (urutan penting). */
export function resolveCap(entries: CapEntry[]): CapResult {
  let max = 0;
  const contributions: { id: string; value: number }[] = [];
  for (const e of entries) {
    let v: number;
    if (e.kind === 'flat') v = e.value;
    else {
      const raw = max * (e.value / 100);
      v = e.round ? Math.round(raw) : raw;
    }
    max += v;
    contributions.push({ id: e.id, value: v });
  }
  return { max, contributions };
}

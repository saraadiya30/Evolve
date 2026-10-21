import { describe, expect, it } from 'vitest';
import { resolveCap } from '../src';
import { capFromBreakdown, loadOracle } from './helpers/oracle';

type Snap = { name?: string; resources: Record<string, { max: number }>; c: Record<string, any> };

function check(snaps: Snap[]) {
  let total = 0; const fails: string[] = [];
  snaps.forEach((s, i) => {
    for (const res of Object.keys(s.c)) {
      const max = s.resources[res]?.max;
      if (typeof max !== 'number' || max <= 0 || typeof s.c[res] !== 'object') continue;
      total++;
      const r = resolveCap(capFromBreakdown(s.c, res));
      if (Math.abs(r.max - max) > Math.max(1, 1e-4 * max)) fails.push(`${s.name ?? i}:${res} oracle=${max} engine=${r.max}`);
    }
  });
  return { total, fails };
}

describe('cap: resolver vs breakdown Evolve (oracle)', () => {
  it('fixture late-game', () => {
    const r = check(loadOracle<{ steps: Snap[] }>('breakdown_late.json').steps);
    console.log(`late-game: ${r.total - r.fails.length}/${r.total} cap persis`);
    expect(r.fails).toEqual([]);
  });
  it('state sintetis', () => {
    const r = check(loadOracle<{ steps: Snap[] }>('breakdown_synthetic.json').steps);
    console.log(`sintetis: ${r.total - r.fails.length}/${r.total} cap persis`);
    expect(r.fails).toEqual([]);
    expect(r.total).toBeGreaterThan(500);
  });
  it('unit: persen-dari-total-berjalan dikonversi jadi flat dan bergantung urutan', () => {
    const a = resolveCap([{ id: 'x', kind: 'flat', value: 1000 }, { id: 'p', kind: 'percent-of-running', value: 10, round: true }, { id: 'y', kind: 'flat', value: 500 }]);
    const b = resolveCap([{ id: 'x', kind: 'flat', value: 1000 }, { id: 'y', kind: 'flat', value: 500 }, { id: 'p', kind: 'percent-of-running', value: 10, round: true }]);
    expect(a.max).toBe(1600); // 1000 + 100 + 500
    expect(b.max).toBe(1650); // (1000 + 500) * 1.1
  });
});

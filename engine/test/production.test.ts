import { describe, expect, it } from 'vitest';
import { resolveProduction } from '../src';
import { loadOracle, productionFromBreakdown } from './helpers/oracle';

type Snap = { name?: string; resources: Record<string, { amount: number; max: number; diff: number }>; p: Record<string, any> };

function check(snaps: Snap[]) {
  let total = 0; const fails: string[] = []; const clamped: string[] = [];
  snaps.forEach((s, i) => {
    for (const res of Object.keys(s.p)) {
      if (res === 'Global' || res === 'consume' || !s.resources[res] || typeof s.p[res] !== 'object') continue;
      const input = productionFromBreakdown(s.p, res);
      const r = resolveProduction(input);
      const { diff, amount } = s.resources[res]!;
      if (diff === 0 && r.net === 0) continue;
      // `resource.diff` dibulatkan 2 desimal dan terpotong oleh amount (konsumsi saat amount 0): lihat PARITY.md, keterbatasan 1.
      if (amount === 0 && r.net < 0 && diff > r.net) { clamped.push(`${s.name ?? i}:${res}`); continue; }
      total++;
      if (Math.abs(r.net - diff) > Math.max(0.01 * Math.abs(diff), 0.02)) fails.push(`${s.name ?? i}:${res} oracle=${diff} engine=${r.net.toFixed(3)}`);
    }
  });
  return { total, fails, clamped };
}

describe('produksi: resolver vs breakdown Evolve (oracle)', () => {
  it('fixture late-game (5 tick)', () => {
    const d = loadOracle<{ steps: Snap[] }>('breakdown_late.json');
    const r = check(d.steps);
    console.log(`late-game: ${r.total - r.fails.length}/${r.total} cocok (<=1% atau <=0.02), dilewati karena clamp: ${r.clamped.length}`);
    expect(r.fails).toEqual([]);
    expect(r.total).toBeGreaterThan(60);
  });
  it('state sintetis (universe, pemerintahan, spesies, tahap)', () => {
    const d = loadOracle<{ steps: Snap[] }>('breakdown_synthetic.json');
    const r = check(d.steps);
    console.log(`sintetis: ${r.total - r.fails.length}/${r.total} cocok, dilewati karena clamp: ${r.clamped.length}`);
    expect(r.fails).toEqual([]);
    expect(r.total).toBeGreaterThan(200);
  });
  it('unit: persen tingkat atas mengalikan total berjalan, anak mengalikan sumber, Global dikalikan', () => {
    const r = resolveProduction({
      entries: [
        { id: 'a', kind: 'source', value: 10 }, { id: 'a.m', kind: 'source-mult', value: 100 },
        { id: 'b', kind: 'source', value: 5 }, { id: 'run', kind: 'running-mult', value: 50 },
      ],
      global: [100, 50], consume: [-3],
    });
    // (10*2 + 5) * 1.5 = 37.5 ; global 2*1.5 = 3 ; 112.5 - 3
    expect(r.gross).toBeCloseTo(112.5, 9);
    expect(r.net).toBeCloseTo(109.5, 9);
  });
});

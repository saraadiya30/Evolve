import { describe, expect, it } from 'vitest';
import { resolveCost } from '../src';
import type { CostDef, CostVector, StateFacts } from '../src';
import generated from '../src/data/costs.generated.json';
import { loadOracle } from './helpers/oracle';

const DEFS = (generated as { data: Record<string, Record<string, CostDef>> }).data;
// [file, minimal nilai yang HARUS diubah adjuster (tes tidak boleh lolos kosong)]. orc_1 = tahap awal tanpa tech cement, jadi 0.
const STATES: [string, number][] = [['cost_late.json', 500], ['cost_pop_human_3.json', 100], ['cost_pop_antid_3.json', 100], ['cost_pop_kobold_2.json', 100], ['cost_pop_orc_1.json', 0]];
const same = (a: number, b: number): boolean => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

type Dump = { species: string; facts: StateFacts; structs: Record<string, Record<string, { raw: CostVector; adj: CostVector }>> };

function compare(oracle: CostVector, engine: CostVector, label: string, fails: string[]) {
  const keys = new Set([...Object.keys(oracle), ...Object.keys(engine)]);
  for (const k of keys) {
    const o = oracle[k], e = engine[k];
    if (o === undefined || e === undefined) fails.push(`${label}.${k}: kunci ${o === undefined ? 'hanya di engine' : 'hanya di oracle'} (oracle=${o} engine=${e})`);
    else if (!same(o, e)) fails.push(`${label}.${k}: oracle=${o} engine=${e}`);
  }
}

describe('cost: engine vs dump cost Evolve (oracle), PERSIS', () => {
  for (const [file, minChanged] of STATES) {
    it(`${file}`, () => {
      const d = loadOracle<Dump>(file);
      let structsTested = 0, structsSkipped = 0, values = 0, changedByAdjuster = 0; const fails: string[] = []; const skippedWhy: Record<string, number> = {};
      for (const [id, byCount] of Object.entries(d.structs)) {
        const defs = DEFS[id];
        if (!defs) { structsSkipped++; skippedWhy['tanpa definisi'] = (skippedWhy['tanpa definisi'] ?? 0) + 1; continue; }
        const first = resolveCost({ defs, facts: d.facts, count: 0 });
        if (first.unsupported.length) { structsSkipped++; const k = first.unsupported[0]!.split(':')[0]!; skippedWhy[k] = (skippedWhy[k] ?? 0) + 1; continue; }
        structsTested++;
        for (const [c, rec] of Object.entries(byCount)) {
          const r = resolveCost({ defs, facts: d.facts, count: Number(c) });
          compare(rec.raw, r.raw, `${id}@${c}.raw`, fails);
          compare(rec.adj, r.adjusted, `${id}@${c}.adj`, fails);
          values += Object.keys(rec.raw).length + Object.keys(rec.adj).length;
          for (const k of Object.keys(rec.adj)) if (rec.raw[k] === undefined || rec.raw[k] !== rec.adj[k]) changedByAdjuster++;
        }
      }
      console.log(`${file} (${d.species}): ${structsTested} bangunan diuji persis (${values} nilai, ${changedByAdjuster} diubah adjuster), ${structsSkipped} dilewati ${JSON.stringify(skippedWhy)}, gagal: ${fails.length}`);
      if (fails.length) console.log(fails.slice(0, 8).join('\n'));
      expect(fails).toEqual([]);
      expect(structsTested).toBeGreaterThan(150);
      expect(changedByAdjuster).toBeGreaterThanOrEqual(minChanged); // tes tidak boleh lolos tanpa adjuster benar-benar bekerja
    });
  }
});

describe('cost: unit modifier pertumbuhan', () => {
  const base: StateFacts = { species: 'x', universe: 'standard', govern: null, race: {}, tech: {}, genes: { creep: 0 }, ptrait: [], traitVars: {}, harmonyCount: 0, ascendedAchieve: false, govNoQuestions: false, fathomPterodacti: 0 };
  const defs: Record<string, CostDef> = { Money: { kind: 'geo', family: 'city', structure: 'cottage', sector: 'city', base: 1000, mult: 1.25, K: 0 } };
  it('tanpa modifier: round(m^count * base)', () => {
    expect(resolveCost({ defs, facts: base, count: 4 }).raw['Money']).toBe(Math.round(1.25 ** 4 * 1000));
  });
  it('gen creep dan tech housing_reduction mengurangi m secara aditif', () => {
    const f = { ...base, genes: { creep: 5 }, tech: { housing_reduction: 2 } };
    expect(resolveCost({ defs, facts: f, count: 4 }).raw['Money']).toBe(Math.round((1.25 - 0.05 - 0.04) ** 4 * 1000));
  });
  it('m di-clamp minimal 1.0 (cost datar)', () => {
    const f = { ...base, genes: { creep: 100 } };
    expect(resolveCost({ defs, facts: f, count: 50 }).raw['Money']).toBe(1000);
  });
  it('flier mengubah Cement menjadi Stone dan menghapus Cement', () => {
    const f: StateFacts = { ...base, race: { flier: 1 }, traitVars: { flier: { rank: 1, vars: [25, 1] } } };
    const d: Record<string, CostDef> = { Cement: { kind: 'flat', value: 100 } };
    const r = resolveCost({ defs: d, facts: f, count: 0 });
    expect(r.adjusted).toEqual({ Stone: Math.round(100 * 1.75 * 0.75) });
  });
});

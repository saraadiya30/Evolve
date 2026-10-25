import { describe, expect, it } from 'vitest';
import { resolveLedger } from '../src';
import { loadOracle } from './helpers/oracle';

type Step = { morale: { parts: { label: string; value: number }[]; min: number; cap: number; potential: number; current: number }; power: { parts: { label: string; value: number }[]; power_total: number } };
const STATES = ['late', 'uni_heavy', 'tr_smoldering', 'tr_heavy', 'x_nexus', 'pop_human_3', 'pop_antid_3'];

describe('ledger: morale dan pembangkitan power vs buku besar Evolve (oracle)', () => {
  for (const name of STATES) {
    it(`state ${name}: potential dan current morale, total power`, () => {
      const d = loadOracle<{ steps: Step[] }>(`ledger_${name}.json`);
      for (const st of d.steps) {
        const m = st.morale;
        // morale: dasar 100, baris berlabel, batas min/cap; tanpa governor gaslighter (leak 0) dan tanpa pengali Aether
        const r = resolveLedger({ base: 100, parts: m.parts.map((p) => ({ id: p.label, value: p.value })), potentialDecimals: 1, stages: [{ kind: 'bounds', min: m.min, cap: m.cap, leak: 0 }, { kind: 'mult', value: 1 }] });
        expect(r.potential).toBeCloseTo(m.potential, 9);
        expect(r.current).toBeCloseTo(m.current, 9); // persis (selisih terukur 0 di 35 kasus)
        // power: jumlah baris = power_total
        const p = resolveLedger({ base: 0, parts: st.power.parts.map((x) => ({ id: x.label, value: x.value })), stages: [] });
        expect(p.total).toBeCloseTo(st.power.power_total, 6);
      }
    });
  }
  it('unit: batas bawah, soft-cap dengan kebocoran, dan pengali', () => {
    const base = { base: 100, potentialDecimals: 1, parts: [{ id: 'a', value: 30 }, { id: 'b', value: 0.04 }] };
    expect(resolveLedger({ ...base, stages: [{ kind: 'bounds', min: 50, cap: 118, leak: 0 }] }).current).toBe(118);
    expect(resolveLedger({ ...base, stages: [{ kind: 'bounds', min: 50, cap: 118, leak: 50 }] }).current).toBeCloseTo(118 + 12.04 * 0.5, 9);
    expect(resolveLedger({ ...base, stages: [{ kind: 'bounds', cap: 200 }, { kind: 'mult', value: 2 }] }).current).toBeCloseTo(260.08, 9);
    expect(resolveLedger({ ...base, stages: [{ kind: 'bounds', min: 200 }] }).current).toBe(200);
    expect(resolveLedger({ ...base, stages: [] }).potential).toBe(130);
  });
});

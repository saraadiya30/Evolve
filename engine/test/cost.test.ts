import { describe, expect, it } from 'vitest';
import { resolveCost } from '../src';
import type { CostEntry, CostLibrary, CostVector, Expr, StateFacts } from '../src';
import { loadCostData } from '../src/data/load';
import { loadOracle } from './helpers/oracle';

const AST = loadCostData();
const DATA = AST.data;
const LIB = AST.library;

/**
 * [state, min nilai yang diubah adjuster, min nilai yang BERBEDA dari state `late`].
 * Kolom ketiga memastikan setiap state benar-benar menguji sesuatu: state yang tidak mengubah angka apa pun
 * dibuang dari oracle (empat jenis pemerintahan dan `living_materials` tanpa properti l_m pernah dibuang karena itu).
 */
const STATES: [string, number, number][] = [
  ['late', 500, 0],
  ['pop_human_3', 100, 5000], ['pop_antid_3', 100, 5000], ['pop_kobold_2', 100, 5000], ['pop_orc_1', 0, 5000],
  ['uni_heavy', 500, 100], ['uni_micro', 500, 5000],
  ['gov_technocracy', 1, 3000], ['gov_dictator', 1, 1000],
  ['x_gv_noble', 1, 1000], ['x_gv_bluecollar', 0, 200], ['x_gv_criminal', 0, 5000],
  ['tr_bloated', 1, 1500], ['tr_lone_survivor', 1, 4000], ['tr_truepath', 1, 3000], ['tr_inflation', 1, 1000], ['tr_kindling_kindred', 1, 800],
  ['tr_iron_wood', 1, 60], ['tr_smoldering', 1, 5000], ['tr_smart', 1, 40], ['tr_dumb', 1, 40], ['tr_heavy', 1, 500], ['tr_combo', 1, 3000],
  ['x_lmat', 1, 150], ['x_nexus', 0, 8],
];
const same = (a: number, b: number): boolean => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

type Dump = { species: string; facts: StateFacts; structs: Record<string, Record<string, { raw: CostVector; adj: CostVector }>> };

function compare(oracle: CostVector, engine: CostVector, label: string, fails: string[]) {
  for (const k of new Set([...Object.keys(oracle), ...Object.keys(engine)])) {
    const o = oracle[k], e = engine[k];
    if (o === undefined || e === undefined) fails.push(`${label}.${k}: kunci ${o === undefined ? 'hanya di engine' : 'hanya di oracle'} (oracle=${o} engine=${e})`);
    else if (!same(o, e)) fails.push(`${label}.${k}: oracle=${o} engine=${e}`);
  }
}

describe('cost: engine (SEMUA aturan = data) vs dump cost Evolve (oracle), PERSIS', () => {
  it('seluruh 325 bangunan / 1.339 cost, 16 adjuster, dan fungsi pertumbuhan sudah berupa data', () => {
    const entries = Object.values(DATA);
    const costs = entries.flatMap((e) => Object.values(e.costs));
    expect(entries.length).toBe(325);
    expect(costs.length).toBe(1339);
    expect(costs.filter((c) => (c as any).unsupported !== undefined)).toEqual([]);
    for (const fn of ['adjustCosts', 'costMultiplier', 'spaceCostMultiplier', 'bloatAdjust', 'truthAdjust', 'loneAdjust', 'inflationAdjust', 'technoAdjust', 'flierAdjust', 'kindlingAdjust', 'smolderAdjust', 'scienceAdjust', 'rebarAdjust', 'extraAdjust', 'heavyAdjust', 'dictatorAdjust', 'lMatAdjust', 'nexusAdjust', 'craftAdjust']) {
      expect(LIB[fn], fn).toBeDefined();
    }
  });
  const BASE = loadOracle<Dump>('cost_late.json');
  for (const [name, minChanged, minDiff] of STATES) {
    it(`state ${name}`, () => {
      const d = loadOracle<Dump>(`cost_${name}.json`);
      let tested = 0, missing = 0, values = 0, changed = 0, diffFromLate = 0; const fails: string[] = [];
      for (const [id, byCount] of Object.entries(d.structs)) {
        const entry = DATA[id];
        if (!entry) { missing++; continue; }
        tested++;
        for (const [c, rec] of Object.entries(byCount)) {
          const r = resolveCost({ entry, library: LIB, facts: d.facts, count: Number(c) });
          compare(rec.raw, r.raw, `${id}@${c}.raw`, fails);
          compare(rec.adj, r.adjusted, `${id}@${c}.adj`, fails);
          values += Object.keys(rec.raw).length + Object.keys(rec.adj).length;
          for (const k of Object.keys(rec.adj)) if (rec.raw[k] === undefined || rec.raw[k] !== rec.adj[k]) changed++;
          const b = BASE.structs[id]?.[c];
          for (const kind of ['raw', 'adj'] as const) for (const k of new Set([...Object.keys(rec[kind]), ...Object.keys(b?.[kind] ?? {})])) if (rec[kind][k] !== b?.[kind][k]) diffFromLate++;
        }
      }
      console.log(`${name} (${d.species}): ${tested} bangunan persis? (${values} nilai, ${changed} diubah adjuster, ${diffFromLate} beda dari late), tanpa definisi: ${missing}, gagal: ${fails.length}`);
      if (fails.length) console.log(fails.slice(0, 10).join('\n'));
      expect(fails).toEqual([]);
      expect(missing).toBe(0);
      expect(tested).toBe(324);
      expect(changed).toBeGreaterThanOrEqual(minChanged);
      expect(diffFromLate).toBeGreaterThanOrEqual(minDiff);
    });
  }
});

// ------------------------------------------------------------------ unit
const mkFacts = (global: Record<string, unknown> = {}, ext: Record<string, unknown> = {}, traitVars: Record<string, number[] | null> = {}): StateFacts => ({
  global: { race: { species: 'human', universe: 'standard' }, tech: {}, genes: {}, city: { ptrait: [], farm: { count: 0 }, cottage: { count: 0 } }, space: {}, resource: { human: { amount: 10 } }, prestige: { Harmony: { count: 0 } }, stats: { achieve: {} }, civic: { govern: { type: 'anarchy' } }, ...global },
  // semua fakta eksternal/trait yang dikenal definisi diberi nilai netral (null) kecuali ditimpa
  ext: { ...Object.fromEntries(AST.facts.externals.map((x) => [`${x.name}(${JSON.stringify(x.args)})`, null])), ...ext },
  traitVars: { ...Object.fromEntries(AST.facts.traitRefs.map((r) => [r, null])), ...traitVars },
  pOn: {}, supportOn: {},
});
const local = (name: string): Expr => ({ ref: 'local', name });
const gref = (...path: string[]): Expr => ({ ref: 'global', path });
const entryOf = (expr: Expr, self: CostEntry['self'] = null): CostEntry => ({ self, props: { path: null }, costs: { Money: { params: ['offset'], expr } } });
const run = (entry: CostEntry, facts: StateFacts, count: number, library: CostLibrary = LIB) => resolveCost({ entry, library, facts, count });

describe('cost: unit bahasa ekspresi, modifier pertumbuhan, adjuster', () => {
  const cottage: Expr = { op: 'call', fn: 'costMultiplier', args: ['cottage', local('offset'), 1000, 1.25] };
  const self = { structure: 'cottage', region: 'city' };
  it('geometrik tanpa modifier: round(m^count * base)', () => {
    expect(run(entryOf(cottage, self), mkFacts(), 4).raw['Money']).toBe(Math.round(1.25 ** 4 * 1000));
  });
  it('gen creep dan tech housing_reduction mengurangi m secara aditif (urutan operasi sama dengan Evolve)', () => {
    const f = mkFacts({ genes: { creep: 5 }, tech: { housing_reduction: 2 } });
    expect(run(entryOf(cottage, self), f, 4).raw['Money']).toBe(Math.round((1.25 - 2 * 0.02 - 5 * 0.01) ** 4 * 1000));
  });
  it('m di-clamp minimal 1.0 (cost datar)', () => {
    expect(run(entryOf(cottage, self), mkFacts({ genes: { creep: 100 } }), 50).raw['Money']).toBe(1000);
  });
  it('cost "datar selama jumlah di bawah batas" memakai jumlah bangunan sendiri (bukan snapshot)', () => {
    const e = entryOf({ op: '?:', args: [{ op: '<', args: [{ op: '+', args: [{ op: '||', args: [local('offset'), 0] }, { op: '?:', args: [gref('city', 'farm'), gref('city', 'farm', 'count'), 0] }] }, 3] }, 100, 0] }, { structure: 'farm', region: 'city' });
    expect([0, 1, 2, 3, 4].map((c) => run(e, mkFacts(), c).raw['Money'])).toEqual([100, 100, 100, 0, 0]);
  });
  it('fungsi pustaka dan fakta eksternal', () => {
    const lib: CostLibrary = { ...LIB, half: { params: ['v'], body: { op: '?:', args: [{ op: 'ext', name: 'eventActive', args: ['launch_day'] }, { op: '*', args: [local('v'), 0.5] }, local('v')] } } };
    const e = entryOf({ op: 'call', fn: 'half', args: [200] });
    expect(run(e, mkFacts({}, { 'eventActive(["launch_day"])': false }), 0, lib).raw['Money']).toBe(200);
    expect(run(e, mkFacts({}, { 'eventActive(["launch_day"])': true }), 0, lib).raw['Money']).toBe(100);
  });
  it('flier (data) mengubah Cement menjadi Stone dan menghapus Cement', () => {
    const f = mkFacts({ race: { species: 'human', universe: 'standard', flier: 1 } }, {}, { 'traits.flier': [25, 1] });
    const e: CostEntry = { self: null, props: { path: null }, costs: { Cement: { params: ['offset'], expr: 100 } } };
    expect(run(e, f, 0).adjusted).toEqual({ Stone: Math.round(100 * 1.75 * 0.75) });
  });
  it('urutan kunci memengaruhi flier: Cement dulu lalu Stone -> Stone asli menimpa hasil gabungan (perilaku Evolve dipertahankan)', () => {
    const f = mkFacts({ race: { species: 'human', universe: 'standard', flier: 1 } }, {}, { 'traits.flier': [25, 1] });
    const mk = (order: string[]): CostEntry => ({ self: null, props: { path: null }, costs: Object.fromEntries(order.map((r) => [r, { params: ['offset'], expr: r === 'Cement' ? 100 : 40 }])) });
    expect(run(mk(['Stone', 'Cement']), f, 0).adjusted).toEqual({ Stone: Math.round(40 * 0.75 + 100 * 1.8 * 0.75) });
    expect(run(mk(['Cement', 'Stone']), f, 0).adjusted).toEqual({ Stone: 40 });
  });
});

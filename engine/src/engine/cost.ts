import type { CostAdjuster, CostDef, CostRequest, CostResult, CostVector, Predicate, StateFacts } from '../contract';

type GeoDef = Extract<CostDef, { kind: 'geo' }>;

const CREEP_PER_LEVEL = 0.01;           // src/config/constants.js
const CREEP_PER_LEVEL_NO_CRISPR = 0.002; // src/config/constants.js

export function holds(p: Predicate | undefined, f: StateFacts): boolean {
  if (!p) return true;
  switch (p.type) {
    case 'universe': return f.universe === p.value;
    case 'ptrait': return f.ptrait.includes(p.value);
    case 'trait': return !!f.race[p.value];
  }
}

const tv = (f: StateFacts, trait: string, i: number): number => f.traitVars[trait]?.vars[i] ?? 0;
const nq = (f: StateFacts): number => (typeof f.govNoQuestions === 'number' ? f.govNoQuestions : 0);
const creep = (f: StateFacts): number =>
  f.genes.creep ? f.genes.creep * (f.race['no_crispr'] ? CREEP_PER_LEVEL_NO_CRISPR : CREEP_PER_LEVEL) : 0;

/**
 * Pengali pertumbuhan: modifier bersifat ADITIF terhadap `mult`, lalu di-clamp.
 * Urutan operasi sama dengan costMultiplier/spaceCostMultiplier di Evolve (penting untuk float yang persis sama).
 */
export function growthMultiplier(def: GeoDef, f: StateFacts, unsupported: Set<string>): number {
  let m = def.mult;
  if (def.family === 'city') {
    if (f.universe === 'micro') unsupported.add('growth:micro-universe(darkEffect)');
    if (f.race['small']) m -= tv(f, 'small', 0);
    if (f.race['large']) m += tv(f, 'large', 0);
    if (f.race['compact']) m -= tv(f, 'compact', 0);
    if (f.race['tunneler'] && (def.structure === 'mine' || def.structure === 'coal_mine')) m -= tv(f, 'tunneler', 0);
    const hr = f.tech['housing_reduction'];
    if (hr && (def.structure === 'basic_housing' || def.structure === 'cottage')) m -= hr * 0.02;
    if (hr && def.structure === 'captive_housing') m -= hr * 0.01;
    if (def.structure === 'basic_housing') {
      if (f.race['solitary']) m -= tv(f, 'solitary', 0);
      if (f.race['pack_mentality']) m += tv(f, 'pack_mentality', 0);
    }
    if (def.structure === 'cottage') {
      if (f.race['solitary']) m += tv(f, 'solitary', 1);
      if (f.race['pack_mentality']) m -= tv(f, 'pack_mentality', 1);
    }
    if (def.structure === 'apartment' && f.race['pack_mentality']) m -= tv(f, 'pack_mentality', 1);
    m -= creep(f);
    if (nq(f)) m -= nq(f);
    if (m < 1.0) m = 1.0;
  } else {
    if (f.universe === 'micro') unsupported.add('growth:micro-universe(darkEffect)');
    m -= creep(f);
    if (f.race['small']) m -= tv(f, 'small', 1);
    if (f.race['compact']) m -= tv(f, 'compact', 1);
    if (f.harmonyCount > 0 && f.ascendedAchieve) unsupported.add('growth:harmonyEffect');
    if (nq(f)) m -= nq(f);
    const cMin = def.cMin ?? 1.0;
    if (m < cMin) m = cMin;
  }
  return m;
}

/** Cost mentah per resource, dalam urutan kunci definisi (urutan memengaruhi flier). */
export function rawCost(defs: Record<string, CostDef>, f: StateFacts, count: number, offset: number, unsupported: Set<string>): CostVector {
  const out: CostVector = {};
  for (const res of Object.keys(defs)) {
    const d = defs[res]!;
    if (d.kind === 'custom') { unsupported.add(`custom:${res}`); continue; }
    if (!holds(d.when, f)) { out[res] = 0; continue; }
    if (d.kind === 'flat') { out[res] = d.value; continue; }
    const m = growthMultiplier(d, f, unsupported);
    out[res] = Math.round((m ** (count + offset)) * d.base) - d.K;
  }
  return out;
}

// ------------------------------------------------------------------ adjuster
const CRAFTED = ['Plywood', 'Brick', 'Wrought_Iron', 'Sheet_Metal', 'Mythril', 'Aerogel', 'Nanoweave', 'Scarletite', 'Quantium'];
const has = (c: CostVector, k: string): boolean => Object.prototype.hasOwnProperty.call(c, k);

/** flier: ubah Stone/Cement. Hasil bergantung URUTAN kunci cost (perilaku Evolve dipertahankan). */
const flier: CostAdjuster = {
  id: 'flier',
  transform(costs, f) {
    if (!f.race['flier'] || !(has(costs, 'Stone') || has(costs, 'Cement'))) return costs;
    const rate = 1 - tv(f, 'flier', 0) / 100;
    const out: CostVector = {};
    for (const res of Object.keys(costs)) {
      if (res === 'Stone' && !has(costs, 'Cement')) out[res] = Math.round(costs[res]! * rate) || 0;
      else if (res === 'Cement') {
        if (has(costs, 'Stone')) out['Stone'] = Math.round((costs['Stone']! * rate) + (costs[res]! * 1.8 * rate)) || 0;
        else out['Stone'] = Math.round(costs[res]! * 1.75 * rate);
      } else out[res] = costs[res]!;
    }
    return out;
  },
};

/** rebar: diskon Cement dari tech `cement`. */
const rebar: CostAdjuster = {
  id: 'rebar',
  transform(costs, f) {
    const lvl = f.tech['cement'];
    if (!has(costs, 'Cement') || !lvl || lvl < 2) return costs;
    const discount = lvl >= 3 ? 0.8 : 0.9;
    const out: CostVector = {};
    for (const res of Object.keys(costs)) out[res] = res === 'Cement' ? (Math.round(costs[res]! * discount) || 0) : costs[res]!;
    return out;
  },
};

/** nexus: diskon Mana (tanpa pembulatan) bila tech nexus + trait witch_hunter + roguemagic >= 7. */
const nexus: CostAdjuster = {
  id: 'nexus',
  transform(costs, f) {
    if (!(f.tech['nexus'] && f.race['witch_hunter'] && f.tech['roguemagic'] && f.tech['roguemagic'] >= 7)) return costs;
    const rate = 0.96 ** f.tech['nexus'];
    const out: CostVector = {};
    for (const res of Object.keys(costs)) out[res] = res === 'Mana' ? costs[res]! * rate : costs[res]!;
    return out;
  },
};

/** craft: diskon material crafting untuk trait hollow_bones (dan fathom pterodacti, belum didukung). */
const craft: CostAdjuster = {
  id: 'craft',
  transform(costs, f) {
    if (!(f.race['hollow_bones'] || f.fathomPterodacti > 0)) return costs;
    if (!CRAFTED.some((k) => has(costs, k))) return costs;
    const out: CostVector = {};
    for (const res of Object.keys(costs)) {
      if (CRAFTED.includes(res)) {
        let c = costs[res]!;
        if (f.race['hollow_bones']) c *= 1 - tv(f, 'hollow_bones', 0) / 100;
        out[res] = Math.round(c);
      } else out[res] = costs[res]!;
    }
    return out;
  },
};

/** Urutan sama dengan adjustCosts di Evolve; yang belum diimplementasi tidak ada di sini (lihat `unsupportedAdjusters`). */
export const ADJUSTERS: CostAdjuster[] = [flier, rebar, nexus, craft];

/** Adjuster Evolve yang belum diimplementasi tetapi akan aktif oleh fakta state ini. */
export function unsupportedAdjusters(f: StateFacts): string[] {
  const t: [string, boolean][] = [
    ['bloat', !!f.race['bloated']], ['truth', !!f.race['truepath']], ['lone', !!f.race['lone_survivor']],
    ['inflation', !!f.race['inflation']], ['techno', f.govern === 'technocracy'],
    ['kindling', !!(f.race['kindling_kindred'] || f.race['iron_wood'])], ['smolder', !!f.race['smoldering']],
    ['science', !!(f.race['smart'] || f.race['dumb'] || f.fathomPterodacti > 0)], ['heavy', !!f.race['heavy']],
    ['dictator', f.govern === 'dictator'], ['lMat', !!f.race['living_materials']],
    ['craft-fathom', f.fathomPterodacti > 0],
  ];
  return t.filter(([, on]) => on).map(([n]) => `adjuster:${n}`);
}

export function resolveCost(req: CostRequest): CostResult {
  const unsupported = new Set<string>(unsupportedAdjusters(req.facts));
  const raw = rawCost(req.defs, req.facts, req.count, req.offset ?? 0, unsupported);
  let adjusted: CostVector = raw;
  for (const a of ADJUSTERS) adjusted = a.transform(adjusted, req.facts);
  return { raw, adjusted, unsupported: [...unsupported] };
}

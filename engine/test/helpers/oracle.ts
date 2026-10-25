import { existsSync, readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { CapEntry, ProductionEntry, ProductionInput } from '../../src/contract';

const dir = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/oracle');
export const loadOracle = <T = any>(name: string): T => {
  const gz = join(dir, `${name}.gz`);
  const text = existsSync(gz) ? gunzipSync(readFileSync(gz)).toString('utf8') : readFileSync(join(dir, name), 'utf8');
  return JSON.parse(text) as T;
};

/** Nilai breakdown Evolve: '12.5v' (flat), '8%' (persen), atau angka mentah. */
export function parseBreakdownValue(v: unknown): { kind: 'v' | '%' | 'raw' | '?'; x: number } {
  if (typeof v === 'number') return { kind: 'raw', x: v };
  const m = /^\s*(-?[0-9.]+(?:e[+-]?\d+)?)\s*([v%]?)\s*$/.exec(String(v));
  if (!m) return { kind: '?', x: NaN };
  return { kind: m[2] === 'v' ? 'v' : m[2] === '%' ? '%' : 'raw', x: parseFloat(m[1]!) };
}

/** Adapter oracle -> kontrak produksi. Label breakdown dipakai sebagai id sementara (label dilokalkan; pemetaan ke ID stabil masih terbuka). */
export function productionFromBreakdown(p: Record<string, any>, res: string): ProductionInput {
  const entries: ProductionEntry[] = [];
  for (const [label, raw] of Object.entries(p[res] ?? {})) {
    const { kind, x } = parseBreakdownValue(raw);
    const child = label.startsWith('ᄂ');
    if (child) {
      if (kind === '%') entries.push({ id: label, kind: 'source-mult', value: x });
      else if (kind === 'v' || kind === 'raw') entries.push({ id: label, kind: 'source-add', value: x });
    } else if (kind === 'v' || kind === 'raw') entries.push({ id: label, kind: 'source', value: x });
    else if (kind === '%') entries.push({ id: label, kind: 'running-mult', value: x });
  }
  const global = Object.values(p['Global'] ?? {}).map(parseBreakdownValue).filter((v) => v.kind === '%').map((v) => v.x);
  const consume = Object.values(p['consume']?.[res] ?? {}).map(parseBreakdownValue).map((v) => v.x);
  return { entries, global, consume };
}

export function capFromBreakdown(c: Record<string, any>, res: string): CapEntry[] {
  return Object.entries(c[res] ?? {}).flatMap(([label, raw]) => {
    const { kind, x } = parseBreakdownValue(raw);
    return kind === 'v' ? [{ id: label, kind: 'flat' as const, value: x }] : [];
  });
}

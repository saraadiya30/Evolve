import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { CostEntry, CostLibrary } from '../contract';

export interface CostData { data: Record<string, CostEntry>; library: CostLibrary; facts: { externals: { name: string; args: unknown[] }[]; traitRefs: string[]; pOn: string[]; supportOn: string[] } }

/** Definisi cost (data) dimuat saat runtime: JSON-nya besar, jadi tidak diimpor lewat sistem tipe TypeScript. */
export function loadCostData(): CostData {
  const file = join(dirname(fileURLToPath(import.meta.url)), 'costs.ast.json');
  return JSON.parse(readFileSync(file, 'utf8')) as CostData;
}

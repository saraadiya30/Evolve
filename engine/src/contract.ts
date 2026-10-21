/**
 * KONTRAK ENGINE (DRAFT Fase 1, belum dibekukan).
 * Semua bentuk di sini diturunkan dari semantik Evolve yang SUDAH diverifikasi lewat oracle
 * (lihat notes/PARITY.md dan notes/ARCHITECTURE.md). Tiga bentuk resolver:
 *   1. Produksi  : jumlah berurutan, pengali per-sumber, pengali total-berjalan, pengali Global, lalu konsumsi.
 *   2. Cap       : jumlah kontribusi flat (persen-dari-total-berjalan dikonversi jadi flat pada tahapnya).
 *   3. Cost      : pengali pertumbuhan aditif -> geometrik -> konstanta K -> rantai adjuster (transformasi vektor).
 */

// ---------------------------------------------------------------- fakta state
/** Fakta state yang dibaca engine. Diisi oleh adapter/importer; bukan seluruh save. */
export interface StateFacts {
  species: string;
  universe: string;
  govern: string | null;
  /** trait dan flag ras -> rank (atau true). */
  race: Record<string, number | boolean>;
  tech: Record<string, number>;
  genes: { creep: number };
  ptrait: string[];
  /** nilai `vars()` tiap trait aktif pada rank-nya (tabel rank sebagai data, bukan kode). */
  traitVars: Record<string, { rank: number; vars: number[] }>;
  harmonyCount: number;
  ascendedAchieve: boolean;
  /** hasil govActive('noquestions') : 0/false bila tidak aktif. */
  govNoQuestions: number | boolean;
  /** fathomCheck('pterodacti'). */
  fathomPterodacti: number;
}

/** Predikat deklaratif, pengganti kode kondisi `global.race[...]` dst. Diperluas bertahap. */
export type Predicate =
  | { type: 'universe'; value: string }
  | { type: 'ptrait'; value: string }
  | { type: 'trait'; value: string };

// ------------------------------------------------------------------- produksi
/**
 * Entri produksi dibaca BERURUTAN (urutan bermakna).
 *  source       : menambah sumber baru (nilai flat).
 *  source-mult  : persen yang mengalikan sumber induk terakhir (saling dikalikan antar entri).
 *  source-add   : nilai flat yang menambah base sumber induk terakhir.
 *  running-mult : persen yang mengalikan SELURUH jumlah yang sudah terkumpul sebelumnya.
 */
export type ProductionEntry =
  | { id: string; kind: 'source'; value: number }
  | { id: string; kind: 'source-mult'; value: number }
  | { id: string; kind: 'source-add'; value: number }
  | { id: string; kind: 'running-mult'; value: number };

export interface ProductionInput {
  entries: ProductionEntry[];
  /** persen Global; saling DIKALIKAN (bukan dijumlah). */
  global: number[];
  /** nilai konsumsi (sudah negatif). */
  consume: number[];
}
export interface ProductionResult { gross: number; globalFactor: number; consumption: number; net: number }

// ------------------------------------------------------------------------ cap
export type CapEntry =
  | { id: string; kind: 'flat'; value: number }
  /** persen dari total berjalan pada tahap ini, dikonversi jadi flat (opsional dibulatkan), seperti `final_cap_bonuses`. */
  | { id: string; kind: 'percent-of-running'; value: number; round?: boolean };
export interface CapResult { max: number; contributions: { id: string; value: number }[] }

// ----------------------------------------------------------------------- cost
export type CostVector = Record<string, number>;

export type CostDef =
  | { kind: 'geo'; family: 'city' | 'space'; structure: string; sector: string; base: number; mult: number; K: number; cMin?: number; when?: Predicate }
  | { kind: 'flat'; value: number; when?: Predicate }
  /** bentuk yang belum bisa dinyatakan deklaratif (rumus sekali-pakai). */
  | { kind: 'custom'; src: string };

export interface CostRequest { defs: Record<string, CostDef>; facts: StateFacts; count: number; offset?: number }
export interface CostResult {
  raw: CostVector;
  adjusted: CostVector;
  /** hal yang memicu perilaku yang belum diimplementasi (custom, adjuster, modifier pertumbuhan). Hasil tidak boleh dipercaya bila tidak kosong. */
  unsupported: string[];
}

/** Adjuster cost = TRANSFORMASI VEKTOR (bisa mengubah, menambah, atau menghapus resource; mis. flier mengubah Cement menjadi Stone). */
export interface CostAdjuster {
  id: string;
  /** diurutkan sesuai urutan di `adjustCosts` Evolve. */
  transform(costs: CostVector, facts: StateFacts): CostVector;
}

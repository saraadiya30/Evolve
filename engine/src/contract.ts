/**
 * KONTRAK ENGINE (DRAFT Fase 1, belum dibekukan).
 * Semua bentuk di sini diturunkan dari semantik Evolve yang SUDAH diverifikasi lewat oracle
 * (lihat notes/PARITY.md dan notes/ARCHITECTURE.md). Tiga bentuk resolver:
 *   1. Produksi  : jumlah berurutan, pengali per-sumber, pengali total-berjalan, pengali Global, lalu konsumsi.
 *   2. Cap       : jumlah kontribusi flat (persen-dari-total-berjalan dikonversi jadi flat pada tahapnya).
 *   3. Cost      : pengali pertumbuhan aditif -> geometrik -> konstanta K -> rantai adjuster (transformasi vektor).
 */

// ---------------------------------------------------------------- fakta state
/**
 * Fakta state yang dibaca engine. Diisi oleh adapter/importer; bukan seluruh save.
 *  global     : salinan state game yang dipangkas (acuan semua rujukan `global.*` di ekspresi).
 *  ext        : keluaran fungsi eksternal (stat/fakta lain), kunci `nama(argumen-JSON)`; mis. darkEffect, towerSize, eventActive (tanggal kalender).
 *  traitVars  : `vars()` trait pada rank saat ini, kunci `traits.heavy` atau `planetTraits.dense` (tabel rank sebagai data).
 *  pOn/supportOn : jumlah bangunan yang menyala (power / support).
 */
export interface StateFacts {
  global: any;
  ext: Record<string, unknown>;
  traitVars: Record<string, number[] | null>;
  pOn: Record<string, number | null>;
  supportOn: Record<string, number | null>;
}

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

// --------------------------------------------------------------------- ledger
/**
 * LEDGER = jumlah baris berlabel (urutan bermakna, label sama digabung) lalu tahap lanjutan. Menggeneralisasi cap.
 * Terverifikasi untuk morale (potensi dan nilai akhir) dan pembangkitan power (jumlah baris = power_total), lihat notes/SURVEY_POWER_POPULASI.md.
 *  bounds : jika nilai < min -> min; jika > cap -> cap + (nilai - cap) * leak / 100  (leak = persen kelebihan yang lolos; gaslighter).
 *  mult   : pengali akhir (mis. Aether).
 */
export type LedgerStage =
  | { kind: 'bounds'; min?: number; cap?: number; leak?: number }
  | { kind: 'mult'; value: number };
export interface LedgerInput { base: number; parts: { id: string; value: number }[]; /** jumlah desimal untuk `potential` (morale: 1) */ potentialDecimals?: number; stages: LedgerStage[] }
export interface LedgerResult { total: number; potential: number; current: number }

// ----------------------------------------------------------------------- cost
/**
 * BAHASA EKSPRESI DEKLARATIF untuk cost. Semua definisi cost (1.339 cost, 325 bangunan) dinyatakan sebagai data JSON ini,
 * diterjemahkan otomatis dari sumber Evolve (`test/diagnostics/cost-ast.mjs`). Semantik operator = JavaScript
 * (kebenaran/falsiness, `||`/`&&` mengembalikan nilai, `===` ketat) supaya persis sama dengan perilaku Evolve.
 * Karena berupa data, wiki/tooltip bisa dihasilkan dari definisi yang sama.
 */
export type BinOp = '+' | '-' | '*' | '/' | '%' | '**' | '<' | '<=' | '>' | '>=' | '===' | '!==' | '==' | '!=' | '&&' | '||' | '??';
export type Expr = number | string | boolean | ExprNode;
export type ExprNode =
  | { op: BinOp; args: [Expr, Expr] }
  | { op: '!' | 'neg' | 'num' | 'typeof'; args: [Expr] }
  | { op: '?:'; args: [Expr, Expr, Expr] }
  /** pengikatan nilai antara: ikat `name` = args[0], evaluasi args[1] (berbagi hasil tanpa menggandakan pohon). */
  | { op: 'let'; name: string; args: [Expr, Expr] }
  /** nilai default parameter: args[0] bila !== undefined, selain itu args[1]. */
  | { op: 'dflt'; args: [Expr, Expr] }
  /** data tabel konfigurasi (mis. resource_values) sebagai literal JSON. */
  | { op: 'lit'; value: unknown }
  | { op: 'obj'; keys: string[]; args: Expr[] }
  | { op: 'builtin'; fn: 'Number' | 'Boolean' | 'isFinite' | 'parseFloat' | 'String'; args: Expr[] }
  | { op: 'keys'; args: [Expr] }
  | { op: 'filter'; var: string; args: [Expr, Expr] }
  | { op: 'toPrecision'; args: [Expr, Expr] }
  /** fungsi sebagai nilai (higher-order): lambda dan pemanggilannya. */
  | { op: 'lambda'; params: string[]; body: Expr }
  | { op: 'apply'; args: Expr[] }
  | { op: 'undef' }
  | { op: 'null' }
  | { op: 'array' | 'concat'; args: Expr[] }
  | { op: 'math'; fn: string; args: Expr[] }
  | { op: 'toFixed'; args: [Expr, Expr] }
  | { op: 'has' | 'includes' | 'get'; args: [Expr, Expr] }
  /** pemanggilan fungsi pustaka deklaratif (mis. costMultiplier, traitCostMod, fuel_adjust, adjustCosts), juga diterjemahkan dari sumber. */
  | { op: 'call'; fn: string; args: Expr[] }
  /** nilai dari stat/fakta lain, disuplai lewat `facts.ext` (kunci `nama(argumen-JSON)`). */
  | { op: 'ext'; name: string; args: Expr[] }
  // ---- operasi atas vektor cost (resource -> nilai), dipakai oleh adjuster
  | { op: 'vecNew' }
  | { op: 'vecGet' | 'vecHas'; args: [Expr, Expr] }
  | { op: 'vecSet'; args: [Expr, Expr, Expr] }
  /** untuk tiap kunci `vec`: ikat `var`=kunci, evaluasi `body` menjadi daftar pasangan [kunci, nilai] (cons/pair/nil) lalu tulis ke salinan `base`, berurutan. */
  | { op: 'vecFold'; var: string; args: [Expr, Expr, Expr] }
  | { op: 'cons'; args: [Expr, Expr] }
  | { op: 'pair'; args: [Expr, Expr] }
  | { op: 'nil' }
  | { ref: 'global'; path: (string | number | Expr)[] }
  | { ref: 'local'; name: string }
  | { ref: 'pOn' | 'supportOn'; name: string | Expr }
  | { ref: 'traitVars'; table: string; name: string; rank: Expr | null }
  /** objek bangunan yang sedang dihitung (properti `path`, `struct`), `struct().p`, dan vektor cost mentah. */
  | { ref: 'action' }
  | { ref: 'actionStruct' }
  | { ref: 'rawCosts' };

export type CostVector = Record<string, number>;

export interface CostFunction { params: string[]; expr: Expr }
/** Definisi cost satu bangunan: identitasnya, properti, dan cost per resource (urutan kunci bermakna). */
export interface CostEntry { self: { structure: string; region: string } | null; props: { path: string[] | null }; costs: Record<string, CostFunction> }
export type CostLibrary = Record<string, { params: string[]; body: Expr }>;

export interface CostRequest { entry: CostEntry; library: CostLibrary; facts: StateFacts; count: number; offset?: number }
export interface CostResult { raw: CostVector; adjusted: CostVector }

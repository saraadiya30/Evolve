# Kontrak Engine (DRAFT Fase 1, belum dibekukan)

Kode: `engine/src/contract.ts` (tipe), `engine/src/engine/*` (resolver dan evaluator). Tes: `engine/test/*`, dijalankan terhadap oracle Evolve di `engine/fixtures/oracle/` (berkas `.json.gz`).
Status per 2026-10-20: **draft yang sudah teruji**, belum dibekukan (lihat "Yang belum dibuktikan" dan "Belum tercakup").

## Prinsip
Setiap bentuk di kontrak diturunkan dari semantik Evolve yang sudah **diverifikasi lewat oracle**. Yang belum punya oracle belum masuk kontrak.

## Resolver (tiga) dan ledger

### 1. Produksi (`resolveProduction`)
Entri dibaca **berurutan**; urutan bermakna.
| kind | arti |
|---|---|
| `source` | menambah sumber baru (nilai flat) |
| `source-mult` | persen yang mengalikan sumber induk terakhir (antar entri **dikalikan**, bukan dijumlah) |
| `source-add` | nilai flat yang menambah base sumber induk terakhir |
| `running-mult` | persen yang mengalikan **seluruh jumlah yang sudah terkumpul sebelumnya** |

`net = (jumlah berurutan) x Π(1 + Global_i/100) + Σ konsumsi`. Global dikalikan satu sama lain.

### 2. Cap (`resolveCap`)
`max` = jumlah kontribusi flat. `percent-of-running` = persen dari total berjalan pada posisinya, dikonversi jadi flat (opsional dibulatkan), sehingga **urutan menentukan hasil**
(tes unit: 1000 + 10% + 500 = 1600, tetapi 1000 + 500 + 10% = 1650).

### 2b. Ledger (`resolveLedger`)
Jumlah baris berlabel (urutan bermakna) lalu tahap lanjutan `bounds` (min, cap, kebocoran gaslighter) dan `mult`. Menggeneralisasi cap. **Teruji:** morale (`potential` dan `current`, 35/35, selisih 0) dan pembangkitan power (`Σ baris = power_total`, 35/35) di 7 state. Lihat `SURVEY_POWER_POPULASI.md`.

### 3. Cost (`resolveCost`): SEMUA aturan adalah data [DIPUTUSKAN: deklaratif, bukan fungsi TypeScript]
Kode engine untuk cost hanyalah **evaluator ekspresi** (`engine/src/engine/expr.ts`, sekitar 100 baris). Yang berupa data JSON (`engine/src/data/costs.ast.json`):
- **1.339 cost dari 325 bangunan** (geometrik, konstanta K, kondisi, rumus sekali-pakai),
- **inti geometrik dan seluruh modifier pertumbuhan** (`costMultiplier`, `spaceCostMultiplier`, `creepGeneReduction`, ...),
- **rantai 16 adjuster** (`adjustCosts` dan bloat, truth, lone, inflation, techno, flier, kindling, smolder, science, rebar, extra, heavy, dictator, lMat, nexus, craft),
- 15 fungsi pembungkus (`traitCostMod`, `fuel_adjust`, `dirt_adjust`, ...).

Semuanya diterjemahkan otomatis dari sumber Evolve (`test/diagnostics/cost-ast.mjs`, parser acorn). Bahasa ekspresi (`Expr` di `contract.ts`; AST seluruh cost = **367 KB**): literal; rujukan state (`global.*`, `p_on`, `support_on`, `traits.X.vars()`, properti bangunan);
aritmetika, perbandingan, `?:`, `&&`/`||`/`??`, `Math.*`, `typeof`, `hasOwnProperty`/`includes`, akses properti, larik, penyambungan teks; panggilan fungsi pustaka; fakta eksternal (`ext`);
**operasi vektor cost** (`vecNew/vecGet/vecHas/vecSet`, `vecFold` dengan daftar pasangan `cons/pair/nil`), pengikatan nilai antara `let`, nilai default parameter `dflt`, tabel konstanta `lit`, objek `obj`, `builtin` (Number, Boolean, ...), `keys`, `filter`, `toPrecision`, dan fungsi sebagai nilai (`lambda`/`apply`). Semantik operator sengaja = JavaScript supaya persis sama dengan Evolve.
Karena berupa data, tooltip dan wiki bisa dihasilkan dari definisi yang sama (**belum dibangun**).

**Adjuster = transformasi vektor cost**: bisa mengubah, menambah, atau menghapus resource (`flier` mengubah Cement menjadi Stone, dan hasilnya **bergantung urutan kunci** cost; ini dipertahankan dan ada di tes unit).

### Fakta state (`StateFacts`)
`global` (salinan state yang dipangkas), `ext` (keluaran stat/fakta lain, kunci `nama(argumen-JSON)`), `traitVars` (tabel rank sebagai data, kunci `traits.heavy` atau `traits.smart@1`), `pOn`, `supportOn`.
Fakta eksternal: `darkEffect`, `eventActive` (**tanggal kalender nyata**, input waktu), `towerSize`, `hellSupression`, `jobScale`, `get_qlevel`, `govActive`, `govEffect.*`, `fathomCheck`, `harmonyEffect`.

## Hasil uji (2026-10-20)
| Resolver | Oracle | Hasil |
|---|---|---|
| Cap | breakdown Evolve | 104/104 (late-game) dan 866/866 (36 state sintetis) persis |
| Produksi | breakdown Evolve | 70/70 (late-game) dan 264/264 (36 state sintetis; 2 dilewati karena clamp amount=0) |
| Cost | dump cost Evolve, **25 state** | **seluruh 324 bangunan** x 8 jumlah bangunan, **sekitar 21.400 nilai per state, semuanya persis, 0 gagal, 0 tanpa definisi** (tes cost 39, total 47 tes lulus) |

**25 state cost:** 1 save asli late-game; 4 state sintetis (spesies dan tahap berbeda); late-game dengan universe `heavy` dan `micro`; pemerintahan `technocracy` dan `dictator`;
governor latar `noble` (extravagant), `bluecollar` (pragmatist, dirty_jobs), `criminal` (noquestions); trait `bloated`, `lone_survivor`, `truepath`, `inflation`, `kindling_kindred`, `iron_wood`, `smoldering`, `smart`, `dumb`, `heavy`,
satu kombinasi trait; `living_materials` + `sappy` dengan properti `l_m` pada bangunan; dan `nexus` (tech + witch_hunter + roguemagic 7).
**Daya uji tiap state diperiksa otomatis:** tes mensyaratkan jumlah nilai yang berbeda dari `late` (mis. `smoldering` 11.602 nilai, `criminal` 13.445, `micro` 13.627, `nexus` 16). State yang tidak mengubah angka apa pun (empat jenis pemerintahan lain, `living_materials` tanpa `l_m`, universe `antimatter` dan `evil`) dicoba lalu dibuang.

## Yang belum dibuktikan (jujur)
1. **Produksi dan cap hanya diuji sebagai semantik gabungan.** Nilai tiap kontribusi masih diambil dari breakdown Evolve, belum diturunkan dari state.
2. **Definisi diterjemahkan otomatis dari sumber Evolve.** Ini alat migrasi satu kali; hasilnya data yang bisa diedit, tetapi isinya masih berasal dari kode Evolve (termasuk keanehannya, mis. `switch` yang jatuh ke case berikutnya).
3. **Fakta eksternal masih disuplai dari dump Evolve.** Di rebuild, `darkEffect`, `towerSize`, `hellSupression`, dst. adalah stat tersendiri (graf dependensi) yang belum ada.
4. **Cabang yang belum teruji oleh oracle:** `fathomCheck > 0` (ras tawanan; dipakai adjuster science dan craft), `eventActive = true` (hanya tes unit), `offset != 0`, struktur yang bergantung kondisi planet khusus (mis. `unstable`), dan **mode `wiki`**.
5. **Mode wiki:** sumber Evolve punya cabang `wiki ? ... : ...`; penerjemah mengikat `wiki = false`. Menghasilkan wiki dari definisi masih butuh evaluasi dengan input hipotetis (seperti `darkEffect` yang menerima `inputs`), jadi klaim "wiki otomatis" **belum terbukti**.
6. Kasus khusus RNA/DNA saat gen `evolve` ikut terjemahan otomatis tetapi tidak punya state uji.
7. **Jebakan yang ketemu:** (a) AST pernah membengkak jadi 186 MB karena penerjemah menggandakan sisa fungsi di tiap `if` (diperbaiki; kini 367 KB, setara terbukti lewat seluruh tes oracle). (b) nama fungsi ganda (ada dua `costMultiplier`: bangunan kota dan proyek ARPA). Indeks pustaka sempat memilih yang salah; kini ada daftar pilihan eksplisit (`PREFER`) dan peringatan nama ganda di `extract-costs.mjs`.

## Belum tercakup kontrak (sebelum dibekukan)
- **Alokasi power dan support** (algoritma berurutan dengan umpan balik dan efek samping; **terpetakan, belum diimplementasi/diuji**), **proses acak/kalender** (pertumbuhan warga), **konversi** (smelter dll.), perdagangan, militer, waktu/tick, RNG.
  Survei (`SURVEY_POWER_POPULASI.md`) menyimpulkan kontrak butuh lima bentuk: resolver modifier, ekspresi deklaratif, ledger, alokasi, dan proses. Morale dan pembangkitan power kini tercakup (ledger).
- **ID stabil** untuk kontribusi (label breakdown Evolve dilokalkan; `id` sementara = label).
- Penurunan nilai sumber produksi dan cap dari state (workers x impact x ..., jumlah bangunan x kapasitas).

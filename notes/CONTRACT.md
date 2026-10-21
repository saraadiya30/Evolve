# Kontrak Engine (DRAFT Fase 1, belum dibekukan)

Kode: `engine/src/contract.ts` (tipe) dan `engine/src/engine/*` (resolver). Tes: `engine/test/*`, dijalankan terhadap oracle Evolve di `engine/fixtures/oracle/`.
Status per 2026-10-20: **draft yang sudah teruji**, belum dibekukan (lihat "Belum tercakup" di bawah sebelum membekukan).

## Prinsip
Setiap bentuk di kontrak diturunkan dari semantik Evolve yang sudah **diverifikasi lewat oracle** (bukan ditebak): cap, produksi, cost bangunan. Yang belum punya oracle belum masuk kontrak.

## Tiga resolver

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
(contoh tes unit: 1000 + 10% + 500 = 1600, tetapi 1000 + 500 + 10% = 1650).

### 3. Cost (`resolveCost`)
1. **Cost mentah** per resource: `round(m ** (count + offset) * base) - K`, atau `flat`, atau 0 bila predikat `when` salah.
2. `m` dimodifikasi **aditif** (creep gene, trait small/large/compact, tech housing_reduction, dst.) lalu di-clamp (>= 1.0 untuk city, `cMin` untuk space). Urutan operasi float sama dengan Evolve.
3. **Adjuster = transformasi vektor cost** (bukan sekadar pengali per resource): bisa mengubah, menambah, atau menghapus resource. Contoh: `flier` mengubah Cement menjadi Stone dan menghapus Cement.
   **Urutan kunci cost memengaruhi hasil** `flier` (perilaku Evolve dipertahankan, ada di tes unit).
4. Adjuster yang belum diimplementasi **tidak diam-diam diabaikan**: `resolveCost` mengembalikan `unsupported` bila fakta state memicunya, dan tes melewati kasus itu.

### Fakta state (`StateFacts`)
Engine tidak membaca seluruh save, hanya fakta ini: spesies, universe, pemerintahan, trait/flag ras dan rank-nya, `traitVars` (tabel rank sebagai data), tech, gen creep, `ptrait`, Harmony, noquestions, fathom.

## Hasil uji (2026-10-20)
| Resolver | Oracle | Hasil |
|---|---|---|
| Cap | breakdown Evolve | 104/104 (late-game) dan 866/866 (36 state sintetis) persis |
| Produksi | breakdown Evolve | 70/70 (late-game) dan 264/264 (36 state sintetis; 2 dilewati karena clamp amount=0) |
| Cost | dump cost Evolve, 5 state | 199 bangunan x 8 jumlah, **12.432 nilai per state, semua persis** (1.000+ nilai diubah adjuster di late-game; 208 di state sintetis) |

## Yang tidak dibuktikan oleh uji ini (jujur)
1. **Produksi dan cap hanya diuji sebagai semantik gabungan.** Nilai tiap kontribusi (mis. "Lumberjack 41.04v") masih diambil dari breakdown Evolve, belum diturunkan dari state.
   Hanya **cost** yang end-to-end dari fakta state + definisi.
2. **Definisi cost diekstrak otomatis dari teks sumber Evolve** (`test/diagnostics/extract-costs.mjs`), bukan ditulis tangan. Ini jembatan; registry asli rebuild akan dituliskan sendiri.
3. **Cakupan cost:** 917 dari 1.339 cost (68%) berbentuk deklaratif; 199 dari 324 bangunan seluruhnya tertutup. Sisa 422 cost adalah rumus sekali-pakai (mis. `jumlah < 100 ? 5000000 : 0`), butuh bahasa predikat/ekspresi atau fungsi.
4. **Keragaman state uji terbatas:** 1 save asli late-game + 4 state sintetis. Adjuster yang teruji hanya `flier`, `rebar`, `craft` (+`nexus` hanya unit); lainnya ditandai `unsupported`.
5. Belum ada: kasus khusus RNA/DNA saat gen `evolve`, `govActive` (extravagant, pragmatist), universe `micro` (darkEffect), `harmonyEffect`.

## Belum tercakup kontrak (sebelum dibekukan)
- **Power** (alokasi berurutan dari daftar prioritas), **populasi/housing**, **morale**, **konversi** (smelter dll.), perdagangan, militer, waktu/tick, RNG. Power dan populasi kemungkinan berbentuk **alokasi/algoritma**, bukan tumpukan modifier,
  sehingga kontrak butuh tipe stat "alokasi" di samping resolver modifier.
- **ID stabil** untuk kontribusi (label breakdown Evolve dilokalkan; `id` sementara = label).
- Penurunan nilai sumber produksi dan cap dari state (workers x impact x ..., jumlah bangunan x kapasitas).

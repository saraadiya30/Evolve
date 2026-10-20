# Taksonomi Efek Evolve (Fase 0, putaran 1)

Sumber: repo Evolve branch `master` @ `d29810a9`, dibaca 2026-10-19.
Label: **[FAKTA]** hasil baca/hitung repo, **[USULAN]** implikasi untuk engine baru, **[TERBUKA]** belum jelas.

## 0. Cakupan dan keterbatasan (baca ini dulu)

Ini putaran pertama. Angka-angka di bawah akurat untuk yang disebut, tetapi **belum seluruh codebase dipetakan**.

- **Dibaca (penuh atau hampir penuh):** `resources/crate_value.js`, `loops/mid/mid_loop_storage_finalize.js`,
  `functions/resource_mod.js` (`modRes`), `loops/fast/fast_loop_lumber.js`, blok `global_multiplier` di
  `loops/fast/fast_loop_core.js`, `functions/cost_multipliers.js`, `functions/cost_adjusters.js` (pipeline + sampel),
  `loops/mid/mid_loop_final_cap_bonuses.js`, `loops/fast/fast_loop_food_consumption.js`, `loops/game_loop_runner.js`,
  definisi trait `pack_rat`, `races/trait_logic/fathom_check.js`.
- **Disampling:** `sections/core/production_parts.js` (struktur dan sebagian case), `loops/fast/fast_loop_smelters.js` (awal),
  `functions/power_modifiers.js` (awal), `mid_loop_resource_caps.js` (hanya urutan pemanggilan).
- **Belum disentuh:** morale, citizen growth/housing/jobs, military/army rating, trade dan market, knowledge, crafting/alchemy,
  tahap evolusi, tech effects (`techs_data`), events, formula prestige/reset, arpa, governor, teks popover/`effect()` secara sistematis,
  ~60 fast loop dan ~40 mid loop lainnya.

## 1. Peta besar

**[FAKTA]** Tiga loop berjenjang (`loops/game_loop_runner.js`): fast (per tick; 69 file), mid (tiap `midRatio` tick; 45 file),
long (harian; 23 file). Urutan: fast, lalu mid, lalu `doCallbacks()`, lalu long.

**[FAKTA]** Choke point penambahan resource adalah `modRes(res, val, notrack, noStockBonus)`: mengalikan `timeScale()`,
menerapkan bonus stock produksi (`lotBonus`), clamp ke max/0, dan mencatat `delta`.

**[FAKTA]** Tooltip dibangun manual lewat objek `breakdown`: `breakdown.p` (produksi, 659 referensi) dan `breakdown.c`
(cap, 200 referensi), tersebar di 93 file. Format nilainya string campuran: `'12.5v'` (flat), `'8%'` (persen), dan angka mentah
(di `breakdown.p.consume`).

**[FAKTA]** Ukuran basis kondisi (kemunculan di luar `src/wiki`): `global.race[...]` 2810, `global.tech[...]` 1899,
`p_on[...]` 594, `traits.X.vars(` 648, `global.race.universe` 331, `global.stats.achieve[...]` 379, `support_on[` 211,
`global.genes[...]` 183, `global.prestige.X.count` 147, `global.city.biome` 132, `govActive(` 116, `global.civic.govern.type` 113,
`highPopAdjust(` 84, `fathomCheck(` 81, `planetTraits` 66, `govEffect.` 57.
**[USULAN]** Engine harus bisa mengekspresikan kondisi-kondisi ini secara deklaratif (predikat: `hasTrait`, `techAtLeast`,
`universeIs`, `govIs`, `biomeIs`, `achieveLevel`, `genesLevel`, ...), bukan lewat fungsi bebas di tiap sumber.

## 2. Famili efek

### A. Produksi per tick (fast loop)
**[FAKTA]** Bentuk umum: `sumber (pekerja/bangunan) x modifier per-sumber x global_multiplier x time_multiplier`, lalu `modRes`.
Contoh lengkap: `fast_loop_lumber.js`.
- **A1. Mode eksklusif.** Lumber punya 4 cabang saling lepas berdasarkan flag ras (`cataclysm`/`orbit_decayed`, `soul_eater`, `evil`, default),
  masing-masing dengan rumus sendiri. Blok `forager` ditulis ulang di dua cabang (salin-tempel).
- **A2. Modifier per-sumber (ber-scope).** `lumber_yard` (+2%/bangunan), `sawmill` (+5% atau +8% tergantung tech), bonus power
  (+4% per sawmill menyala, ditambah aditif dulu lalu dikali), `$ctx.q_multiplier` (karantina), `$ctx.hunger`, `$ctx.zigVal`.
  Tidak semua berlaku ke semua sumber (mis. di file lumber: `q_multiplier` tidak dipakai di cabang biodome, `zigVal` hanya di cabang biodome).
- **A3. Global multiplier.** `$ctx.global_multiplier` dibangun di `fast_loop_core.js` dari ~35 operasi (34 `*=`, 1 `+=`).
  Plasmid masuk **aditif dulu** (`1 + pBonus[0]`), lalu semua lainnya perkalian. Breakdown-nya di kategori terpisah `breakdown.p['Global']`.
- **A4. Base per struktur.** `production(id, val, wiki)` (`sections/core/production_parts.js`, 545 baris) mengembalikan skalar atau
  `{b, g, f}` (base, gov factor, final) per struktur dan resource, dengan banyak kondisi tech/biome/geology/ras.
- **A5. Modifier atas modifier.** Trait `discharge` memotong bonus power sawmill 50%: `(power_mult - 1) * 0.5 + 1`.
- **A6. Nilai turunan disimpan di state.** `global.city.sawmill.psaw` ditulis dari dalam loop produksi (untuk power balancer).

### B. Konsumsi
**[FAKTA]** Konsumsi = `modRes` dengan nilai negatif; breakdown di `breakdown.p.consume[res][label]` (nilai mentah negatif, tanpa suffix),
beda format dari produksi. Contoh: spoilage carnivore (dikurangi `smokehouse` secara `0.9 ** count`), trait `gnawer`.
`fast_loop_food_consumption` juga menetapkan flag `$ctx.fed` yang kemudian jadi `$ctx.hunger` (1 atau 0.5).

### C. Konversi dan kapasitas dinamis
**[FAKTA]** (hanya sampel awal) Smelter: kapasitas dijumlahkan dari banyak sumber, tiap struktur mengekspos `smelting()` sendiri
(`stellar_forge`, `hell_forge`, `demon_forge`, `sacred_smelter`, `ore_refinery`, `hell_smelter`, `geothermal`). Hasilnya **ditulis ke state**:
`global.city.smelter.cap`, `.StarCap`, `.Star`. Alokasi bahan bakar (Wood/Coal/Oil/Star/Inferno) dibatasi total kapasitas.
**[USULAN]** Pola "struktur mendeklarasikan kontribusinya sendiri" (`smelting()`) sudah bagus; ambil. **[TERBUKA]** Sisa famili konversi
(factory, crafting, alchemy, nanite, dll) belum dipetakan.

### D. Cap dan storage (mid loop)
**[FAKTA]** `midLoop` memanggil ~30 tahap berurutan yang memutasi `$ctx.caps[res]` sampai `midLoopStorageFinalize`, lalu ~14 tahap non-cap
(servants, espionage, queue riset, finalize, dst). Urutan tahap = urutan penambahan, tersirat dari posisi baris.
- **D1. Flat add** per bangunan (mis. sawmill +200 Lumber x `BHStorageMulti(spatialReasoning(...))`).
- **D2. Persen dari total berjalan, dikonversi jadi flat.** `mid_loop_final_cap_bonuses.js`: `gain = Math.round(caps['Knowledge'] * boost)`,
  lalu `caps += gain` dan breakdown ditulis sebagai `gain + 'v'`. Hasilnya **bergantung urutan dan pembulatan**, dan breakdown menampilkannya
  sebagai flat padahal sebenarnya persen.
- **D3. Nilai crate/container** (`crate_value.js`): tangga tech (`tech.container` >= 2, 4, 5, 6, 7, 8, 9 menambah 350/500/250/dst),
  dikali trait `pack_rat` (rank-based), `fathom` kobold, achieve `banana`, achieve `blackhole`, `spatialReasoning`, lalu skala x1000 (crate)
  atau x10000 (container).
- **D4. Finalisasi** (`mid_loop_storage_finalize.js`): bonus stock dikali ke base **sebelum** crate/container ditambah; crate dan container
  ditambah; lalu pengali Aether (kecuali Money dan resource spesies) dikali **sesudah** semuanya.
- **D5. Efek samping di tengah kalkulasi:** `global.prestige.Aether.count -= draw`, manipulasi DOM (`addClass`), dan penulisan
  `global.eden.fortress.detector` di file bonus cap.

### E. Cost bangunan
**[FAKTA]** Dua lapis:
- `costMultiplier(structure, offset, base, multiplier)`: modifier **mengurangi atau menambah laju pertumbuhan** (`multiplier -= ...`), di-clamp
  minimal 1.0, lalu `round(multiplier ** count * base)`. Modifier ditujukan ke struktur tertentu (`basic_housing`, `cottage`, `mine`, ...).
  Ada varian `spaceCostMultiplier` dengan `c_min` dan sektor.
- `adjustCosts(c_action, offset, wiki)`: 16 adjuster berurutan (bloat, truth, lone, inflation, techno, flier, kindling, smolder, science,
  rebar, extra, heavy, dictator, lMat, nexus, craft), masing-masing **membungkus fungsi cost per resource dalam closure baru** dan sebagian
  melakukan `Math.round` di tengah rantai. Tiap adjuster menarget daftar resource tertentu (26 percabangan target). Dipakai di 11 file.
**[USULAN]** Target cost butuh dua tingkat: `building.<id>.cost.growth` (aditif, clamp) dan `building.<id>.cost.<res>` (perkalian),
plus aturan pembulatan yang eksplisit (kapan dibulatkan mempengaruhi hasil).

### F. Power dan modifier universe
**[FAKTA]** `powerModifier` (antimatter, zodiak leo), `powerCostMod` (`emfield` x1.5), `darkEffect(universe, flag, info, inputs)` yang menerima
**input override** (`inputs.dark`, `inputs.harmony`, `inputs.sludge`) sehingga bisa dihitung untuk nilai hipotetis (pratinjau/wiki).
**[USULAN]** Pola "hitung dengan input yang bisa di-override" berguna untuk tes paritas dan pratinjau di engine baru.

### G. Trait dan kekuatannya
**[FAKTA]** Definisi trait (`races/traits/*.js`, ~197 trait dengan regex kasar) punya `vars(r)` yang mengembalikan **array berindeks ajaib** per rank
(rank bisa pecahan: 0.1, 0.25, 0.5, 1, 2, 3, ...). `pack_rat`: `[Crate Bonus, Storage Bonus]`.
`fathomCheck(race)` memberi "rank bayangan" (kekuatan trait dari ras tawanan), dipakai sebagai `vars(1)[i] / 100 * fathom`.
**Sebaran contoh:** `pack_rat` muncul di 7 file / 17 tempat (2 efek: crate bonus dan storage bonus); `kindling_kindred` di 47 file / 93 tempat.

### H. Satu efek, angka ditulis di banyak tempat (bukti masalah utama)
**[FAKTA]** Building `sawmill`:
| Efek | Lokasi angka |
|---|---|
| +200 storage Lumber | `actions/city/compost_to_rock_quarry.js` (`effect()` teks, dan `action()` menambah `max` langsung) dan `loops/mid/mid_loop_extraction_caps.js` |
| +5%/+8% produksi Lumber | `compost_to_rock_quarry.js` (`effect()`: `impact = saw>=2 ? 8 : 5`) dan `loops/fast/fast_loop_lumber.js` (`saw = ... ? 0.08 : 0.05`) |
| +4% power-bonus | `effect()` dan `fast_loop_lumber.js` |
| +0.02 Plywood per sawmill | `resources/resources.js` (crafting) |
Teks `effect()` menghitung ulang angka yang sama dengan loop, jadi mengubah balance berarti mengubah tiap salinan. Wiki (`src/wiki`, 21.924 baris)
**tidak** memanggil `production()` maupun `crateValue()/containerValue()` (0 pemanggilan), jadi angkanya ditulis sendiri.

### I. Waktu dan tick
**[FAKTA]** `timeScale()` (accelerated time x2, Aether speed), `MAX_FAST_SCALE = 4`; satu periode besar dipecah menjadi beberapa fast loop.
Produksi/konsumsi dikali `timeScale()` di `modRes` kecuali `notrack`. Komentar di kode mengakui sebagian counter progres tidak ikut diskalakan
dan pengecekan "cukup input untuk satu tick" hanya akurat untuk beberapa tick.
**[TERBUKA]** Ini sumber selisih angka yang perlu diuji khusus (tes langkah vs lintasan di `PARITY.md`).

### J. Stock portfolio
**[FAKTA]** Dua titik hook: produksi (`lotBonus(productionLots)` di `modRes`, hanya saat `stockFlags.prod`) dan storage (`storageBonus(storageLots)`
di `mid_loop_storage_finalize`). Ini fitur modifikasi (bukan Evolve asli), tapi hook-nya bagus sebagai contoh dua modifier lintas-stat dari satu sumber.

### K. Belum dipetakan (angka)
Morale, jobs/housing/citizen growth, military, trade/market, knowledge, crafting/alchemy, evolution, tech effects (bagian angka), prestige formulas, arpa, governor.

### L. Efek non-angka (contoh sudah ada, pemetaan penuh belum)
Lihat bagian 6: graf tech (`reqs`/`grant`), event (`reqs`/`condition`/`effect`), aksi sekali jalan, antrean, pesan.

## 3. Jenis operasi modifier yang ditemukan

| # | Operasi | Contoh nyata | Catatan untuk engine |
|---|---|---|---|
| 1 | Flat add | sawmill +200 storage | stage `add` |
| 2 | Flat x jumlah | `count * nilai` | nilai sumber = fungsi dari state |
| 3 | Perkalian skalar | `*= 1 + p/100` | stage `mult` |
| 4 | Grup persen aditif lalu dikali | `power_mult = 1 + n*0.04` | stage `addPct` (jumlah dulu, kali sekali) |
| 5 | Aditif ke laju pertumbuhan + clamp | `costMultiplier`, min 1.0 | target terpisah, ada `min` |
| 6 | Tangga/tier dari level tech | `tech.container >= 2, 4, 5...` | nilai berjenjang, bukan sekadar on/off |
| 7 | Persen dari total berjalan di tahap N | `Math.round(caps * boost)` | **bergantung urutan**, perlu stage berurut |
| 8 | Modifier atas modifier | `discharge`: `(m-1)*0.5+1` | modifier yang menskalakan kontribusi modifier lain |
| 9 | Mode eksklusif bersyarat | 4 cabang lumber | sumber bersyarat dengan prioritas |
| 10 | Saturasi/diminishing | `c/(c+5000)`, `x/(x+20)/10` | fungsi `final(fn)` |
| 11 | Clamp/rentang | cost min 1.0, rentang Authority | `min`/`max` per stat |
| 12 | Pembulatan di tengah rantai | `Math.round` di adjuster dan caps | aturan pembulatan harus eksplisit dan teruji |
| 13 | Pembungkus closure per resource | `adjustCosts` | modifier dengan filter target resource |
| 14 | Lookup berdasar rank | `traits.X.vars(rank)` | tabel rank sebagai data, bukan array berindeks |
| 15 | Kekuatan sekunder (fathom) | `vars(1)[i]/100*fathom` | sumber strength kedua |
| 16 | Bergantung state runtime | `p_on`, hunger, cuaca, musim, zodiak | nilai sumber dievaluasi tiap resolve |
| 17 | Transformasi skala/satuan | x1000, x10000, `spatialReasoning`, `highPopAdjust`, `BHStorageMulti` | transformasi bernama, bisa dipasang pada stat |
| 18 | Tulis efek samping | `Aether.count -=`, `psaw`, `smelter.cap`, `detector` | pisahkan: output turunan vs aksi |

## 4. Kandidat namespace target [USULAN]

`res.<R>.prod` (sumber-sumber), `res.<R>.consume`, `res.<R>.max` (stage berurut), `storage.crate`, `storage.container`,
`global.prod` (pengali semua produksi, scope global), `building.<id>.cost.growth`, `building.<id>.cost.<R>`, `power.gen`, `power.use`,
`time.scale`, `trait.<id>.strength`. Modifier perlu **scope**: `global`, `per-resource`, `per-sumber` (karena `hunger`, `q_multiplier`, `zigVal`
tidak berlaku merata).

## 5. Temuan penting untuk desain engine

1. **Breakdown Evolve adalah oracle bawaan (terverifikasi 2026-10-20, lihat PARITY.md).** `breakdown.p/c` sudah mengeluarkan `{label: nilai}` per resource, jadi bisa dibandingkan langsung
   dengan `contributions[]` engine baru (selain total). Kelemahan: format string campuran dan `Global` terpisah, perlu parser.
2. **Satu modifier butuh:** nilai (fungsi dari state), kondisi, target, stage, scope, label, urutan.
3. **Urutan harus data** (stage dan prioritas), karena D2/D4 menunjukkan hasil bergantung urutan dan pembulatan.
4. **Nilai turunan jangan disimpan di state** (`psaw`, `smelter.cap`, `detector`); engine mengekspos output turunan, state hanya primer.
5. **Teks efek/deskripsi harus dihasilkan dari modifier yang sama** (masalah H), termasuk `effect()` bangunan dan tooltip.
6. **Kondisi sangat banyak** (puluhan ribu akses `global.race`/`tech`): perlu pustaka predikat deklaratif.
7. **Pola yang sudah bagus di Evolve, ambil:** struktur mendeklarasikan kontribusinya (`smelting()`), `darkEffect` dengan input override,
   `production()` dan `costMultiplier()` sebagai titik pusat.

## 6. Pertanyaan dari survei dan jawabannya

**Terjawab pemilik (2026-10-19):**
- Wiki ikut direbuild, dari satu sumber data dengan game. **[DIPUTUSKAN]** Implikasi **[USULAN]**: definisi (building, tech, trait, resource) harus
  cukup kaya untuk menghasilkan teks wiki dan popover, bukan hanya untuk simulasi.
- Pembulatan: coba dulu atau reset; batas maksimal selisih 1%. **[DIPUTUSKAN]**
- Fitur modifikasi (stock market, Aether, tab Misc): direbuild di awal bila diperlukan. **[DIPUTUSKAN]**

**Efek non-angka: arah diputuskan [DIPUTUSKAN]** (pemilik setuju dengan usulan di bawah, 2026-10-19)
Efek non-angka = efek yang mengubah *apa yang ada atau terjadi*, bukan mengubah suatu angka stat. Contoh nyata di Evolve **[FAKTA]**:
- **Unlock/syarat (graf tech).** `src/tech/techs_data.js` sudah berbentuk data: `iron_saw: { reqs: { axe: 1, mining: 3 }, grant: ['saw',1] }`
  lalu `steel_saw: { reqs: { smelting: 2, saw: 1 }, grant: ['saw',2] }`. Riset ini tidak menambah angka; ia membuka riset/bangunan berikutnya.
  Ada ~697 `reqs:` dan ~698 `grant:` di `src/tech`.
- **Event acak.** `src/events/event_helpers.js`: tiap event punya `reqs`, `condition()`, dan `effect()` yang melakukan sesuatu sekali jalan
  (mis. mengurangi `Slave` sebanyak 1, lalu menampilkan pesan).
- **Aksi sekali jalan.** `action()` bangunan: bayar cost, tambah count, nyalakan power. Ini perubahan state, bukan stat turunan.
- **Antrean dan pesan log.** Mengatur urutan aksi dan menampilkan teks.
**[DIPUTUSKAN]** Engine modifier khusus untuk angka (stat). Efek non-angka dimodelkan sebagai modul terpisah (graf syarat/unlock, tabel event, antrean),
tapi **semua definisinya hidup di satu registry data** yang sama, supaya wiki dan UI tetap dihasilkan dari satu sumber. Kabar baik: graf tech
sudah berbentuk data deklaratif, jadi migrasinya relatif langsung.

## 7. Putaran 2 (usulan)
Tambahan dari diskusi 2026-10-20: (a) pisahkan penggunaan RNG menjadi generator (paritas seed) vs event berjalan (paritas distribusi);
(b) cari kode migrasi versi bawaan Evolve (apa yang sudah ditangani loader sebelum importer).
Petakan famili yang belum: morale, jobs/housing/citizen growth, crafting/alchemy/factory, military, trade, knowledge, tech effects, prestige.
Tiap famili: target, operasi (tabel di atas), kondisi, lokasi duplikasi. Tambahkan skrip pencacah otomatis (per resource: tempat `modRes` dipanggil
dan label breakdown-nya) supaya taksonomi tidak bergantung pada pembacaan manual.

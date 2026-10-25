# Survei: Power, Morale, dan Populasi (2026-10-20)

Tujuan: menentukan apakah power/morale/populasi berbentuk "tumpukan modifier" (seperti produksi, cap, cost) atau butuh tipe stat lain di kontrak. Metode: membaca kode `loops/` dan `systems/`, lalu menguji hipotesis dengan dump
(`test/diagnostics/ledger-dump.mjs`, `survey-powered.mjs`) pada 7 state. Label: **[FAKTA]** terukur, **[BACAAN]** dari membaca kode (belum diuji oracle), **[USULAN]**.

## Jawaban ringkas
Kontrak butuh **lima bentuk**, bukan satu. Tiga sudah teruji; dua (alokasi, proses acak) baru terpetakan.
| Bentuk | Sistem Evolve | Status |
|---|---|---|
| Resolver modifier berurutan | produksi, cap (termasuk cap populasi/housing: `breakdown.c.<spesies>`) | teruji (CONTRACT.md) |
| Ekspresi deklaratif | cost, **kebutuhan power (`powered`) dan support** | cost teruji; powered/support **bisa diterjemahkan** (lihat bawah), belum diuji nilainya |
| **Ledger + tahap lanjutan** | **morale**, **pembangkitan power**, job caps | **teruji (bagian ini)** |
| **Alokasi** (algoritma, berurutan, berefek samping) | pemakaian power, support ruang angkasa | **hanya terpetakan [BACAAN]** |
| **Proses acak/kalender** | pertumbuhan warga, event populasi | hanya terpetakan [BACAAN] |

## Ledger (morale dan pembangkitan power)
Refactor tahap awal sudah membuat buku besar (`moraleAdd`, `powerAdd`): tiap efek menambah baris berlabel, baris berlabel sama digabung, baris 0 tidak dicatat.
- **Morale [FAKTA]:** `potential = 100 + Σ baris` (dibulatkan 1 desimal); `current` = potensi setelah **bounds** (di bawah `min` -> `min`; di atas `cap` -> `cap + (kelebihan) x gaslighter/100`) lalu **pengali** (Aether, yang juga memotong `prestige.Aether.count`).
  Diuji di 7 state x 5 tick: `potential` cocok 35/35, `current` cocok 35/35 dengan **selisih 0**; jumlah baris power = `power_total` 35/35.
- **Pembangkitan power [FAKTA]:** `power_total` = Σ baris (beban yang dihitung di fase pembangkitan masuk sebagai baris negatif). Baris sudah berlabel, jadi **tooltip sudah punya oracle bawaan** (`S.powerParts`, `S.moraleParts`), seperti breakdown resource.
- **Kontrak:** `resolveLedger` (`engine/src/engine/ledger.ts`) menggeneralisasi `resolveCap`; tahap lanjutan `bounds` dan `mult`. Uji: `engine/test/ledger.test.ts`.
- Catatan: pengali Aether punya **efek samping** (mengurangi stok Aether). Di rebuild itu harus menjadi keluaran efek, bukan mutasi di tengah kalkulasi.

## Alokasi power [BACAAN dari `fast_loop_power_usage.js`; belum diuji oracle]
Ini bukan tumpukan modifier. Ciri-cirinya:
1. Bekerja **berurutan** menurut daftar prioritas `global.power` (120 entri di fixture late-game, string `region:struktur`).
2. Tiap struktur punya kebutuhan per unit (`powered()`), dan jumlah yang menyala `p_on[...]` dikurangi sampai muat dalam sisa listrik.
3. Ada fase **penyeimbang beban** (`lowPowerBalance`) yang mematikan struktur prioritas rendah dan **membaca `resource.diff` dari tick sebelumnya** (umpan balik antar-tick: alokasi bergantung pada laju produksi, yang bergantung pada alokasi).
4. Pembangkit berbahan bakar **mengonsumsi resource lewat `modRes`** selama alokasi (mutasi state di tengah algoritma), dan kekurangan bahan bakar memengaruhi jumlah yang menyala.
Keluaran yang bisa dibandingkan: `p_on` (128 entri), `power` (sisa listrik), `power_total`. Invarian yang teruji [FAKTA]: `p_on <= jumlah bangunan` (0 pelanggaran di 7 state).
**Support ruang angkasa** (`fast_loop_space_support.js`, `support_on`) tampak serupa (alokasi per wilayah) [BACAAN].

## Kebutuhan power dan support = data [FAKTA]
Penerjemah cost (`cost-ast.mjs`) pada percobaan pertama (tanpa perubahan) menerjemahkan **180 dari 203 `powered()` dan 91 dari 92 `support()`**; kegagalannya celah kecil (kalender `new Date()`, objek literal di `p_fuel`, `Boolean(...)`, `++`). Setelah penerjemah diperluas (2026-10-25): **`powered()` 202/203, `p_fuel` 15/15, `support()` 92/92**.
Satu sisa: `ascension_trigger.powered` memanggil metode milik struktur sendiri (`heatSink()`). Artinya algoritma alokasi bisa menjadi kode kecil di atas **data** kebutuhan, seperti cost.
Nilai kebutuhan **belum diuji ke oracle** (hanya terbukti bisa diterjemahkan).

## Populasi [BACAAN]
- **Cap populasi (housing):** sudah punya breakdown (`breakdown.c.<spesies>`), termasuk di 866/866 pengecekan cap; masuk resolver cap.
- **Job caps** (`mid_loop_job_caps.js`): penumpukan `lCaps[job] += ...` (bentuk ledger) bercampur **efek samping** (pesan, otomatis menarik pendudukan garnisun, mengubah `workers`).
- **Pertumbuhan warga** (`fast_loop_citizen_growth.js`): lemparan **acak** antara batas bawah dan atas, batas bawah ditambah banyak sumber (tech reproduksi, hospital, gen birth, trait, bonus stock), dan **bergantung tanggal kalender nyata** (bonus 14 Februari lewat `$ctx.date`).
  Selaras keputusan RNG: paritas distribusi, bukan per-seed; jam harus bisa di-inject.
- **Kehilangan populasi** (`mid_loop_population_loss.js`): aturan murni `kelebihan = jumlah - cap` menjadi `homeless`, plus pesan.

## Rekomendasi kontrak [USULAN]
1. Tambah **`Ledger`** (sudah ada, teruji) untuk morale, pembangkitan power, job caps.
2. Tambah tipe sistem **`Allocation`**: fungsi murni `(kapasitas, daftar prioritas berurutan, kebutuhan per unit [data/ekspresi], kebijakan penyeimbang, kondisi bahan bakar) -> {menyala, sisa, bahan bakar terpakai}`. Umpan balik antar-tick (`resource.diff`) menjadi **masukan eksplisit** dari tick sebelumnya, bukan pembacaan state tersembunyi.
3. Tambah tipe **`Process`** untuk hal acak/kalender: menerima RNG dan jam yang di-inject, mengembalikan keadaan baru.
4. **Efek sebagai keluaran**: pesan log, konsumsi stok Aether, perubahan pekerja, dan penyedotan bahan bakar dikembalikan sebagai daftar efek; inti tetap murni (ini juga yang membuat tes paritas mungkin).
5. Dua keputusan butuh persetujuanmu: (a) alokasi sebagai **modul sistem terpisah** dengan oracle berupa `p_on`/`power` per tick (bukan dipaksa jadi modifier); (b) efek samping sebagai keluaran murni.

## Belum dibuktikan
- Alokasi belum diimplementasi maupun diuji; uraian di atas dari **membaca** kode. Perilaku penyeimbang beban dan bahan bakar adalah bagian yang paling berisiko.
- Nilai `powered()`/`support()` hasil terjemahan belum dibandingkan dengan oracle.
- Oracle power/morale baru 7 state x 5 tick (morale tanpa governor gaslighter dan tanpa Aether morale; kebocoran gaslighter dan pengali Aether hanya tes unit).
- `support` ruang angkasa, `p_fuel`, dan populasi belum punya oracle.

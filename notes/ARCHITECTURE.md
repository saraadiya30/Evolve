# Arsitektur

## Masalah di Evolve sekarang [FAKTA, dibaca 2026-10-19 dari master d29810a9]
Contoh storage:
- `src/resources/crate_value.js`: `crateValue()`/`containerValue()` menumpuk pack_rat, fathom kobold,
  banana, blackhole, spatialReasoning dengan `*=` berurutan.
- `src/loops/mid/mid_loop_storage_finalize.js`: bonus stock dikali ke base SEBELUM crate ditambah,
  bonus Aether dikali SESUDAH semuanya. Urutan itu hanya implisit dari posisi baris (ada komentar
  panjang yang menjelaskan kenapa).
- Breakdown tooltip ditulis manual (`breakdown.c[res][label] = ...`), terpisah dari matematikanya.
  Satu bonus berarti rumus di satu tempat dan label di tempat lain.
- Side effect menyelip di tengah kalkulasi: `global.prestige.Aether.count -= draw` dan manipulasi DOM
  (`addClass('has-text-warning')`) di dalam loop.
- `src/resources/market_storage.js` memanggil `crateValue()` lagi untuk teks deskripsi.
Kesimpulan: bukan masalah kualitas per fungsi, tetapi tidak ada layer abstraksi untuk modifier.

## Lima layer [USULAN]
Lihat `PROJECT_BRIEF.md`. Prinsip: data deklaratif + derivasi murni + UI tipis.

## Stat engine [USULAN]
Efek dideklarasikan sekali, di tempat sumbernya (sketsa, bukan API final):

```ts
{ target: 'storage.crate', stage: 'mult', value: 1.1, label: 'trait.pack_rat', when: hasTrait('pack_rat') }
const { total, contributions } = resolve('storage.crate'); // hasil + breakdown dari satu sumber
```

- Urutan operasi menjadi data (`stage`), bukan posisi baris.
- Stat boleh bergantung pada stat lain; engine menjaga urutan evaluasi dan mendeteksi siklus.
- Dirty flag agar tidak menghitung ulang semuanya tiap tick.
- Nilai turunan tidak disimpan di save.

## Semantik stage yang terverifikasi [FAKTA, 2026-10-20; rincian di PARITY.md]
Dari rekonstruksi breakdown Evolve: (1) **cap** = jumlah kontribusi flat (persen dikonversi ke flat pada tahap tertentu, jadi urutan penting); (2) **produksi** = jumlah berurutan dari sumber,
tiap sumber dikali bonus lokalnya (perkalian antar modifier), entri persen tingkat atas mengalikan total yang sudah terkumpul, lalu dikali produk bonus Global, lalu ditambah konsumsi.
Ini menjadi dasar desain stage di Fase 1: `base/add -> per-sumber (mult) -> total-berjalan (mult, berurutan) -> global (mult) -> konsumsi (add)`.

> Implementasi dan hasil uji semantik di bawah: lihat `CONTRACT.md` dan folder `engine/`. Cost dinyatakan dengan bahasa ekspresi deklaratif (data), diputuskan pemilik 2026-10-20; terwujud penuh (termasuk adjuster dan modifier pertumbuhan).

## Semantik cost yang terverifikasi [FAKTA, 2026-10-20; rincian di PARITY.md]
Cost = `round(m ** (count + offset) * base) - K`, dengan `m` dimodifikasi **aditif** lalu di-clamp >= 1.0; sesudahnya rantai adjuster per resource (perkalian, sebagian dengan pembulatan).
Target engine: `building.<id>.cost.growth` (aditif, clamp) dan `building.<id>.cost.<res>` (konstanta K, adjuster perkalian, aturan pembulatan eksplisit).

## Efek non-angka [DIPUTUSKAN] (2026-10-19)
Engine stat hanya menangani angka. Efek yang mengubah *apa yang ada atau terjadi* (unlock lewat tech tree, event acak, aksi sekali jalan,
antrean, pesan) dimodelkan sebagai **modul terpisah**, tetapi **semua definisi tetap di satu registry data**, sehingga game, UI, dan wiki
dihasilkan dari sumber yang sama. Contoh bentuk data di Evolve yang sudah deklaratif: `src/tech/techs_data.js`
(`reqs: {...}, grant: [...]`). Detail dan contoh: lihat `EFFECT_TAXONOMY.md` bagian 6.

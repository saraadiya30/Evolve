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

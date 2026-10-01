# Test

Jalankan semua dari root repo:

```
npm install
npm test           # 17 tes otomatis (exit code 1 kalau ada yang gagal)
npm run lint       # ESLint untuk src/ dan test/
```

| Tes | Yang dicek |
|---|---|
| `try-import`, `wiki-import` | game dan wiki bisa di-load dari `src/` tanpa error (urutan import / circular import) |
| `bundle-import` | bundel PRODUKSI (mandiri dan code splitting, sama seperti `npm run build`) bisa di-load, termasuk chunk changelog lazy |
| `bundle-run` | bundel split setelah 200 tick menghasilkan state `global` yang IDENTIK dengan `src/` |
| `format-equiv` | `sizeApproximation` (dengan cache Intl.NumberFormat) identik dengan implementasi aslinya di 180 ribu kombinasi nilai, presisi, dan mode |
| `cycles-check` | pagar circular import: kelompok siklus di `src/` tidak boleh membesar (baseline `snap_cycles_baseline.json`) |
| `stock-*`, `stocks-no-market` | alokasi lot, bonus produksi vs storage, kapasitas crates/containers |
| `auto-*` | auto-convert Money <-> Ocoin (income besar, clamp, lost) |
| `numeric-snapshot` | fungsi eden + kapal di ribuan konfigurasi acak (seeded) vs `snap_numeric_baseline.json` |
| `struct-check` | struktur data besar (techs, races, actions, events, ...) vs `snap_struct_baseline.json` |
| `golden-check` | simulasi 300 periode dari 2 fixture save vs `snap_user_baseline.json` / `snap_user2_baseline.json` |

Kalau perilaku game **sengaja** diubah, perbarui baseline dengan `npm run test:update`
(lalu cek `git diff test/` untuk memastikan yang berubah memang yang diharapkan).

`test/diagnostics/` berisi skrip eksplorasi manual (tidak masuk `npm test`): `auto-sim`, `auto-sweep`, `auto-display`, `accel-equiv`, `profile-dom`, `profile-dom-writes`, `profile-dom-selects` (lihat `docs/PROFILING.md`).
`harness.mjs`, `compare.mjs`, `dump-struct.mjs` adalah alat bantu yang dipakai tes di atas.

Catatan Node: `npm test` dan `npm run lint` lewat `test/launch.cjs` supaya memakai Node >= 18 dari sistem (dependency `node` di package.json memasang Node 16 ke `node_modules/.bin`).

# Project Brief (tempel di awal setiap sesi)

## Tujuan [DIPUTUSKAN]
Membuat ulang game Evolve dari awal. Repo `saraadiya30/Evolve` (branch `master`) hanya referensi.
Alasan utama: di code Evolve (walau sudah di-refactor), perhitungan efek tersebar. Contoh: mengubah
bonus storage harus menyentuh banyak tempat. Maunya ada satu base yang diubah dan semua turunan ikut.
Masalah ini juga ada di efek lain (produksi, cost, dll), jadi solusinya harus generik.

## Syarat paritas [DIPUTUSKAN]
- UI dan gameplay harus persis sama dengan Evolve.
- Struktur code dan cara menghitung BEBAS berbeda, selama hasilnya sama.
- Toleransi angka: di bawah 1%.
- Harapan: seed sama berarti perilaku sama (lihat `PARITY.md` untuk batasan praktisnya).
- Save boleh dirombak total, tetapi WAJIB ada parser/importer dari save Evolve lama ke save baru.

## Scope tambahan [DIPUTUSKAN] (2026-10-19)
- **Wiki ikut dibuild ulang**, dihasilkan dari SATU sumber data yang sama dengan game. Alasan: sekarang update game dan wiki dikerjakan dua kali.
- **Fitur modifikasi** (stock market, Aether, tab Misc): kalau perlu direbuild, direbuild di awal (bukan ditunda).
- **Pembulatan:** boleh dicoba-coba atau direset bila gagal; batas maksimal selisih 1%, makin kecil makin bagus.
- **Efek non-angka** (unlock/tech tree, event, aksi sekali jalan, antrean): modul terpisah dari engine stat, tapi semua definisi hidup di satu registry data.

## Cara kerja [DIPUTUSKAN]
AI pelaksana = chat biasa (bukan Claude Code). Jadi tiap sesi harus berdiri sendiri: Brief + Handoff + prompt tugas.

## Arsitektur [USULAN]
Lima layer, tiap layer tidak boleh tahu layer di atasnya:
1. Definitions (data deklaratif; efek ditulis di data)
2. Stat engine (resolver modifier)
3. State (hanya state primer; nilai turunan tidak masuk save)
4. Simulation tick (fungsi murni, tanpa DOM)
5. UI (membaca nilai + breakdown, tanpa logika game)

Engine stat hanya untuk angka. Efek non-angka (graf syarat/unlock, tabel event, antrean) adalah modul terpisah [DIPUTUSKAN];
semua definisi (building, tech, trait, resource, event) ada di satu registry data, supaya game, UI, dan wiki dihasilkan dari sumber yang sama.

Aturan stat engine (ringkas):
- Target ber-namespace: `storage.crate`, `res.Iron.max`, `res.Iron.prod`, `building.farm.cost`
- Stage eksplisit: `base -> add -> addPct -> mult -> final(fn)`
- Breakdown/tooltip dihasilkan otomatis dari daftar modifier yang sama (tidak pernah ditulis manual)
- Dependency graph + deteksi siklus + dirty flag
- Kasus aneh masuk sebagai modifier `fn`, bukan special-case di engine
- Side effect (misal Aether mengurangi count) dipisah dari kalkulasi

## Larangan [USULAN]
- Jangan menyalin logika Evolve mentah-mentah tanpa lewat engine modifier.
- Jangan menulis breakdown/tooltip manual.
- Jangan menaruh DOM atau side effect di dalam kalkulasi.
- Jangan mengubah kontrak (tipe/interface) yang sudah dibekukan tanpa dicatat di HANDOFF.

## Aturan sesi [USULAN]
Satu modul per sesi. Output berupa file lengkap, tanpa placeholder. Kriteria selesai = tes yang lulus.

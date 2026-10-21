# Pertanyaan Terbuka

## Terjawab (2026-10-19 s.d. 2026-10-20)
- Wiki ikut direbuild? **Ya**, dari satu sumber data dengan game.
- Aturan pembulatan? **Coba dulu / reset boleh; batas maksimal 1%.**
- Fitur modifikasi (stock market, Aether, tab Misc)? **Direbuild di awal bila diperlukan.**
- Efek non-angka (unlock/tech tree, event, antrean)? **Modul terpisah dari engine stat, satu registry data untuk semua definisi.**
- Bahasa/tooling? **TypeScript + Vitest; framework UI diputuskan di Fase 5.**
- Cara oracle Evolve dijalankan headless? **Pakai harness jsdom yang sudah ada di `test/` master, diperluas (dump per langkah + breakdown).**
- Format save lama? **Sudah diverifikasi (lihat PARITY.md). Importer menerima hasil load Evolve setelah migrasinya.**
- RNG: port LCG atau ganti? **Port LCG persis di modul terpisah; generator = paritas seed, event = paritas distribusi.**
- Toleransi 1%? **Bertingkat (angka akhir 1%, stat antara hampir persis, bilangan bulat kecil persis).**
- Lisensi? **Proyek pribadi, tidak diperjualbelikan/tidak didistribusikan. Tinjau ulang jika kelak dibagikan.**

## Masih terbuka
- Bahasa untuk 422 cost sekali-pakai (rumus `jumlah < N ? C : 0`, dst.): perluas bahasa predikat/ekspresi deklaratif, atau izinkan fungsi TypeScript sebagai jalan keluar? (butuh keputusan; memengaruhi apakah wiki bisa dihasilkan otomatis dari definisi)
- Tipe stat "alokasi" untuk power/populasi (algoritma berurutan, bukan tumpukan modifier): perlu survei sebelum kontrak dibekukan.
- Penurunan nilai sumber produksi/cap dari state (belum dibuktikan; saat ini hanya semantik gabungannya).
- Pemetaan label breakdown (string dilokalkan) ke ID stabil untuk oracle; atau kunci locale saat dump.
- Oracle untuk stat tanpa breakdown: **cost bangunan sudah ada** (`cost-dump.mjs`, lihat PARITY.md). Tersisa: power, morale, populasi/housing, dan cost non-bangunan (tech, arpa, kapal, evolusi).
- Populasi state sintetis: tech dan bangunan city sudah beres (lewat fungsi game). Sisa: kenapa hanya 3-4 job yang tampil, region lain (space dan seterusnya), pemerintahan, dan kalibrasi supaya state mirip permainan nyata.
- Framework UI (ditunda ke Fase 5).
- Pemisahan penggunaan RNG: mana yang generator (paritas seed) dan mana yang event berjalan (paritas distribusi). Butuh survei putaran 2.
- Letak dan isi kode migrasi versi bawaan Evolve (supaya importer tahu apa yang sudah ditangani loader). Butuh survei putaran 2.

## Tugas pemilik
- ~~Kumpulkan save dari berbagai tahap~~ Diganti: generator state acak (Claude) + save asli seperlunya. Save early-game (evolusi, 1.5.0) sudah diterima; simpan sebagai fixture di branch `rebuild` (usulan: `fixtures/saves/early-evolution-v1.5.0.json`). Opsional: satu save setelah memilih spesies (awal peradaban).

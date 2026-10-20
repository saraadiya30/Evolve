# Handoff Log
Entri terbaru di atas. Di akhir tiap sesi: apa yang jadi, keputusan, kontrak terbaru, TODO.

## 2026-10-20: Sesi 3 (save early-game, koreksi versi)
**Jadi:** pemilik menyerahkan 1 save early-game (tahap evolusi, `version 1.5.0`, universe magic). Pendekatan variasi state diusulkan: generator state acak + save asli seperlunya (bukan satu save per tahap); diperlakukan sebagai disetujui karena pemilik langsung menyerahkan save, belum dikonfirmasi eksplisit.
**Koreksi:** catatan sebelumnya menyebut versi acuan 1.4.10. Yang benar: game saat ini 1.5.0 (`package.json` master); fixture lama 1.4.10 termigrasi saat di-load. PROJECT_BRIEF.md dan PARITY.md sudah dikoreksi.
**Temuan:** save punya input waktu nyata (jam harus bisa di-inject), daftar `power`/`support` berisi sisa run sebelumnya, dan angka sangat besar (Aether ~1.7e13).
**Prototipe generator (selesai):** `gen-proto.mjs`, 21 kasus tanpa NaN, mutasi universe/pemerintahan/prestige/genes/resource berpengaruh nyata dan deterministik; spesies lewat `sentience()` bekerja tetapi menghasilkan peradaban kosong (detail di PARITY.md).
**Langkah populasi (selesai sebagian):** tech via fungsi game, bangunan city, dan pekerja jalan di 15 kasus tanpa NaN; temuan kunci: `checkCosts` menolak biaya > max storage (detail di PARITY.md). Sisa: job yang tampil, region lain, pemerintahan, kalibrasi.
**Dump + breakdown (selesai):** breakdown Evolve terbukti jadi oracle yang kuat: cap persis (970/970), produksi cocok 70/70 di fixture late-game dan 263/266 dalam 1% di 36 state sintetis (aturan rekonstruksi dan keterbatasan di PARITY.md).
**Koreksi:** bonus antar modifier itu perkalian, bukan persen dijumlah (ARCHITECTURE.md memuat semantik stage terverifikasi).
**TODO berikutnya:** (pemilik) taruh save early-game di `fixtures/saves/` branch `rebuild`; (Claude) oracle untuk stat tanpa breakdown (cost, power, morale), pemetaan label ke ID, sisa populasi sintetis (job, region lain), lalu Fase 0 putaran 2 dan kontrak tipe Fase 1.

## 2026-10-20: Sesi 2 (diskusi pertanyaan terbuka)
**Jadi:** semua pertanyaan terbuka dari taksonomi dibahas dan diputuskan (lihat PROJECT_BRIEF.md bagian "Keputusan teknis" dan PARITY.md bagian "Keputusan lanjutan").
**Temuan baru:** (1) oracle headless sudah ada di `test/` master (jsdom, `Math.random` di-seed, jam dikunci, `golden-check`); (2) format save diverifikasi:
JSON seluruh `global`, LZString UTF16, 35 key top-level, `version "1.4.10"` di fixture lama (game saat ini 1.5.0, lihat sesi 3); (3) lisensi Evolve = MPL-2.0; (4) selisih kecil pada `m` membesar jadi `count * e` pada `m ** count`, jadi toleransi harus bertingkat.
**Keputusan pemilik:** TypeScript + Vitest, UI ditunda ke Fase 5; importer menerima hasil load Evolve setelah migrasinya; LCG persis di modul terpisah; toleransi bertingkat; lisensi = proyek pribadi, tidak diperjualbelikan.
**Kontrak yang dibekukan:** belum ada.
**TODO berikutnya:** (pemilik) kumpulkan save dari berbagai tahap; (Claude) Fase 0 putaran 2 + survei RNG generator vs event + lokasi kode migrasi; lalu masuk Fase 1 (engine murni + kontrak tipe).

## 2026-10-19: Sesi 1 (Fase 0, putaran 1: survei efek)
**Jadi:** `EFFECT_TAXONOMY.md` (taksonomi efek Evolve putaran 1, sudah diperbarui dengan keputusan: famili efek, 18 jenis operasi modifier, kandidat namespace target, temuan untuk desain engine).
**Temuan kunci:** (1) bukti masalah utama: building sawmill menulis angka efeknya di 5 tempat (effect(), action(), loop produksi, loop cap, resources.js); (2) hasil cap bergantung urutan dan pembulatan (persen dari total berjalan dikonversi jadi flat); (3) nilai turunan disimpan di state (psaw, smelter.cap, detector); (4) `breakdown.p/c` Evolve bisa jadi oracle per-kontribusi untuk tes paritas.
**Keputusan pemilik (akhir sesi 1):** wiki ikut direbuild dari satu sumber data; pembulatan boleh coba/reset dengan batas maksimal 1%; fitur modifikasi direbuild di awal bila perlu. Efek non-angka: disetujui, modul terpisah dari engine stat dengan satu registry data untuk semua definisi.
**Cakupan:** baru sebagian (lihat bagian 0 di EFFECT_TAXONOMY.md); morale, jobs, military, trade, crafting, tech effects, prestige belum dipetakan.
**Kontrak yang dibekukan:** belum ada.
**TODO berikutnya:** Fase 0 putaran 2 (famili yang belum), verifikasi format save lama, (pertanyaan terbuka bagian 6 sudah terjawab semua).

## 2026-10-19: Sesi 0 (diskusi perencanaan)
**Jadi:** arah proyek, definisi paritas, strategi RNG/save, struktur prompt, branch catatan ini.
**Keputusan pemilik:** lihat bagian [DIPUTUSKAN] di PROJECT_BRIEF.md dan PARITY.md.
**Belum dikerjakan:** Fase 0 (survei efek), kode apa pun.
**Kontrak yang dibekukan:** belum ada.
**TODO berikutnya:** Fase 0, survei taksonomi efek di Evolve (target/stage) dan verifikasi format save lama.

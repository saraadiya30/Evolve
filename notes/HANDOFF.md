# Handoff Log
Entri terbaru di atas. Di akhir tiap sesi: apa yang jadi, keputusan, kontrak terbaru, TODO.

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

# Rebuild Notes: Evolve dari Nol dengan Stat Engine Terpusat

Folder `notes/` ini berisi dokumen hasil diskusi perencanaan untuk membuat ulang Evolve dari awal.
Branch `rebuild` adalah tempat proyek baru; Evolve asli ada di branch `master` dan jadi **referensi/oracle**.

Terakhir diperbarui: 2026-10-19 (sesi 0 diskusi awal, sesi 1 survei efek). Acuan master saat itu: `d29810a9`.

## Cara pakai di sesi chat baru
1. Tempel isi `PROJECT_BRIEF.md` di awal chat, ATAU minta Claude membaca branch ini lewat GitHub
   (`https://github.com/saraadiya30/Evolve/tree/rebuild/notes`).
2. Tempel `HANDOFF.md` bagian entri terbaru supaya Claude tahu posisi terakhir.
3. Pakai template di `PROMPTS.md` untuk tugas yang spesifik.
4. Di akhir sesi, minta Claude menulis entri baru untuk `HANDOFF.md`, lalu commit ke branch ini.

## Peta dokumen
| File | Isi |
|---|---|
| `PROJECT_BRIEF.md` | Ringkasan tetap proyek (yang ditempel tiap sesi) |
| `ARCHITECTURE.md` | Lima layer, desain stat engine, efek non-angka, masalah di Evolve saat ini |
| `EFFECT_TAXONOMY.md` | Hasil survei Fase 0: famili efek, jenis operasi modifier, temuan (putaran 1) |
| `PARITY.md` | Definisi "sama", strategi tes, RNG, save dan importer |
| `PLAN.md` | Fase 0-6 dan risiko |
| `OPEN_QUESTIONS.md` | Yang belum diputuskan |
| `HANDOFF.md` | Log antar sesi |
| `PROMPTS.md` | Template prompt |

## Legenda status
- **[DIPUTUSKAN]**: dinyatakan langsung oleh pemilik proyek
- **[USULAN]**: saran Claude, belum disetujui eksplisit
- **[FAKTA]**: hasil pembacaan repo Evolve (bisa berubah kalau repo berubah)
- **[TERBUKA]**: belum diputuskan

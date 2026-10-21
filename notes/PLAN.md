# Rencana Fase [USULAN]

0. **Survei referensi**: katalogkan SEMUA jenis efek di Evolve (storage, produksi, konsumsi, cost scaling, cap, dll),
   klasifikasi per target/stage. Hasilnya taksonomi, yaitu spesifikasi sebenarnya. Format save lama sudah diverifikasi (lihat PARITY.md). Perluas harness oracle di `test/` (dump per langkah + breakdown per resource) dan kumpulkan
   fixture save dari berbagai tahap (tugas pemilik).
1. **Engine murni + tes**, belum ada konten game. Bekukan kontrak (tipe/interface).
1b. **Status Fase 1 (2026-10-20): draft kontrak + mesin mini selesai dan teruji** (`CONTRACT.md`, folder `engine/`): resolver produksi, cap, dan cost lulus terhadap oracle. Belum dibekukan.
2. **Vertical slice**: beberapa resource, storage, beberapa building, 1 tech, 1 trait. Tes paritas rumus Evolve vs engine baru.
3. **Tick loop + save/load** dengan versi dan migrasi, plus importer save lama.
4. **Migrasi konten per domain** (city, tech, race, space, dst), lewat template + batch.
5. **UI**, termasuk mobile dari awal.
6. **Prestige dan layer akhir** terakhir, karena paling banyak keanehan.

## Risiko
- Scope: Evolve sekitar 130k baris. Tanpa vertical slice dulu, proyek tidak akan selesai.
- Paritas rumus: menyalin semua perilaku mustahil; definisi "sama" harus tegas (lihat PARITY.md).
- Lisensi: repo Evolve punya file LICENSE. Cek kewajibannya bila menyalin data/rumus; mengacu ke mekanik biasanya lebih aman.

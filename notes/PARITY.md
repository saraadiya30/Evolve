# Paritas: definisi "sama"

## Yang diputuskan [DIPUTUSKAN]
- UI dan gameplay persis sama; struktur dan cara menghitung bebas.
- Toleransi angka < 1%.
- Seed sama diharapkan memberi perilaku sama.
- Save boleh dirombak; wajib ada importer dari save lama.

## Evolve sebagai oracle [USULAN]
Jalankan Evolve asli secara headless, rekam trace: state awal + serangkaian aksi (beli building,
riset tech, ganti kerja) lalu angka resource, max, produksi per tick. Engine baru harus menghasilkan
angka yang sama untuk input yang sama. Paritas UI dicek terpisah lewat screenshot per layar.

## Dua lapis tes angka [USULAN]
Di game idle, selisih kecil membesar secara eksponensial bila dijalankan lama. Maka:
- **Tes langkah** (utama): ambil state dari Evolve, jalankan satu tick/aksi di engine baru, bandingkan, batas < 1%.
- **Tes lintasan panjang**: beberapa skenario, batas lebih longgar, dengan checkpoint per interval.

## RNG [FAKTA, dibaca 2026-10-19]
- `seededRandom` (src/core/vars.js) adalah LCG: `(seed * 9301 + 49297) % 233280`. State di `global.seed`
  dan `global.warseed`. Dipakai di sekitar 238 tempat.
- Masih ada sekitar 23 `Math.random()` yang tidak ber-seed (mis. pembulatan starvation di makanan,
  shuffle di governor mech).
- LCG itu stateful: hasil kejadian ke-N bergantung jumlah dan urutan panggilan sebelumnya. Karena struktur
  dirombak, paritas per-seed untuk seluruh game praktis mustahil.

## Strategi RNG [USULAN]
1. Port LCG persis dan bawa `seed`/`warseed` di importer.
2. Pecah RNG di engine baru menjadi stream per sistem (event, espionage, war, dst).
3. Tes sistem acak dengan RNG yang di-inject (stub urutan nilai) atau bandingkan distribusi untuk yang `Math.random`.
4. Catatan: LCG hanya punya sekitar 233 ribu state; kualitasnya rendah. Menyalinnya demi paritas, bukan karena bagus.
   Keputusan akhir ada di pemilik proyek [TERBUKA].

## Save dan importer
- Save baru: hanya state primer + nomor versi + rantai migrasi. [USULAN]
- Importer Evolve-lama: modul terpisah, satu arah, fungsi murni `importLegacySave(data) -> state baru`. [USULAN]
- Save asli dari Evolve menjadi korpus tes: import, hitung stat turunan di engine baru, bandingkan dengan angka
  yang ditampilkan Evolve asli. Perlu dikumpulkan save dari berbagai tahap (evolusi awal, mid, late, tiap jenis prestige).
- Detail format save lama (kompresi, struktur versi) belum diverifikasi; itu tugas Fase 0. [TERBUKA]

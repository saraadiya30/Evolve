# Paritas: definisi "sama"

## Yang diputuskan [DIPUTUSKAN]
- UI dan gameplay persis sama; struktur dan cara menghitung bebas.
- Toleransi angka < 1%.
- Seed sama diharapkan memberi perilaku sama.
- Save boleh dirombak; wajib ada importer dari save lama.

## Kebijakan pembulatan [DIPUTUSKAN] (2026-10-19)
Aturan pembulatan tidak perlu dikunci dari awal: boleh dicoba dulu, dan direset/diulang bila hasilnya menyimpang.
Batas keras: selisih maksimal 1%; makin kecil makin bagus.

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
- Format save lama **[FAKTA, diverifikasi 2026-10-20 dari fixture `test/fixtures/user-save-1.json`]**: JSON dari seluruh objek `global`,
  dikompres LZString (`compressToUTF16` di localStorage; fixture menyimpannya di `{save: "..."}`). 35 key top-level (seed, warseed, resource, tech, city,
  space, civic, race, genes, stats, event, queue, prestige, settings, stocks, ...), `version` berupa string (`"1.4.10"` di fixture lama; `1.5.0` di save terbaru dan di `package.json` master), ~120 KB JSON untuk save late-game.
  Save menyimpan juga nilai turunan (mis. `city.smelter.cap`). Perlu disurvei: kode migrasi versi bawaan Evolve (putaran 2).
- **Save early-game dari pemilik [FAKTA, 2026-10-20]:** `version 1.5.0`, tahap evolusi (`race.species: protoplasm`, `tech` hanya `theology/queue/evo`), `universe: magic`, biome `forest`,
  pemerintahan `oligarchy`, `stats.reset: 77`. Bentuk top-level sama (35 key). Berisi key fitur modifikasi (`stocks`, `settings.aether*`, `settings.stock*`).
  Catatan untuk importer dan engine: (a) ada input waktu nyata (`stats.start/current`, `special.egg["2026"]`, `settings.at`), jadi jam harus bisa di-inject;
  (b) daftar `power`/`support` tetap berisi bangunan dari run sebelumnya meski save di tahap awal; (c) angka sangat besar (`prestige.Aether.count` sekitar 1.7e13).

## Keputusan lanjutan [DIPUTUSKAN] (2026-10-20)
Pemilik menyetujui seluruh usulan teknis di bawah (kecuali lisensi, yang dijawab terpisah: proyek pribadi, tidak diperjualbelikan).
- **Oracle:** harness jsdom Evolve yang sudah ada dipakai (`Math.random` di-seed dan jam dikunci via `env-setup.mjs`; `golden-check` = 300 periode dari 2 fixture).
  Kekurangan: baseline sekarang berupa state akhir; butuh dump per langkah dan breakdown per resource, plus fixture save yang lebih banyak (saat ini 2, satu sintetis).
- **Importer:** input = state `global` setelah migrasi bawaan Evolve (bukan menulis ulang migrasi versi lama); output = state baru; nilai turunan diabaikan.
- **RNG:** port LCG persis di modul terpisah; stream per sistem; generator = paritas seed, event berjalan = paritas distribusi.
  Pemisahan mana yang generator dan mana yang event masuk survei putaran 2.
- **Toleransi bertingkat:** 1% untuk angka akhir yang dilihat pemain; stat antara yang dieksponensialkan atau dikali berantai hampir persis
  (selisih relatif kecil `e` pada `m` menjadi sekitar `count * e` pada `m ** count`); bilangan bulat kecil persis (1% dari 30 itu kurang dari 1).
- **Tooling:** TypeScript + Vitest; framework UI ditunda ke Fase 5. (Catatan fakta: `lib/` punya Buefy, kerangka UI berbasis Vue, jadi UI Evolve kemungkinan Vue 2; belum diverifikasi.)

## Prototipe generator state [FAKTA, dijalankan 2026-10-20]
Skrip prototipe: `test/diagnostics/gen-proto.mjs` (di repo Evolve master, belum masuk `npm test`). Satu kasus = satu proses, karena `vars.js` memuat save saat di-import.
- 21 kasus dijalankan di atas `test/fixtures/user-save-1.json` dan state game baru: kontrol, acak jumlah resource, 6 universe, 5 pemerintahan, prestige+genes acak,
  kombinasi, dan 5 spesies. Hasil: 21 dari 21 dimuat dan jalan 20 tick tanpa NaN/Infinity. Sekitar 2-3 detik per kasus.
- Determinisme: kasus kontrol dan `universe=standard` (input identik) menghasilkan angka identik.
- Mutasi lewat edit JSON **berpengaruh nyata** dan konsisten arahnya: ganti universe mengubah produksi dan max (mis. magic: max Knowledge 51700 vs 71700),
  ganti pemerintahan mengubah income Money (5642 -> 3864 socialist -> 3401 anarchy), prestige/genes mengubah storage (max Food 1.415 juta -> 527 ribu).
  Artinya untuk kelas mutasi ini tidak perlu memanggil fungsi inisialisasi game.
- Spesies: `global.race.species = X; hooks.sentience()` (jalur yang dipakai game saat evolusi selesai) berhasil memasang trait (jumlah key `race` 12 -> 16-17,
  pemerintahan awal anarchy). Tetapi hasilnya peradaban kosong (resource 0, tanpa tech/bangunan/pekerja), sehingga belum berguna untuk tes produksi/storage.
- Belum diuji: generator set tech lewat graf `reqs/grant`, bangunan, dan pekerja (langkah "populasi" di atas peradaban kosong).
- Catatan: mengubah universe lewat flag saja tidak menjamin state seperti hasil permainan nyata; selisih dari Evolve asli tetap harus ditriase.

### Langkah populasi [FAKTA, dijalankan 2026-10-20]
Di atas peradaban kosong hasil `sentience()`, generator menambah tech, bangunan, dan pekerja. 15 kasus (5 spesies x 3 tingkat), semuanya jalan 20 tick tanpa NaN, ~3 detik per kasus.
- **Tech:** kandidat dipilih lewat `checkTechRequirements(t, false) === 'ok'` dan `condition()` (fungsi milik game, jadi graf `reqs/grant` plus syarat trait ikut terhormati).
  Penerapannya: `actions.tech[t].action()` lalu `global.tech[grant[0]] = grant[1]` (setara `gainTech` tanpa menggambar ulang UI). Langkah 30/80/150 menghasilkan 18/39/57 key tech.
- **Temuan penting:** `checkCosts` menolak biaya yang lebih besar dari **kapasitas storage** (mis. Knowledge max awal 100, tech seharga 110 tidak bisa dibeli). Amount dan max harus dinaikkan sementara
  saat menerapkan tech, lalu dipulihkan. Tanpa itu, penelusuran mentok di 23 tech karena puluhan tech gagal diam-diam.
- **Bangunan:** `checkCityRequirements(name)` lalu `initStruct(actions.city[name])`, lalu set `count`/`on` acak (14-30 jenis bangunan).
- **Hasil:** max storage ikut naik sesuai tahap (Lumber 800 -> 5975, Money 1000 -> 60000); selisih antar spesies kecil tapi nyata (mis. spesies `antid` berbeda di diff Food dan Lumber).
- **Keterbatasan yang diketahui:** (1) hanya region `city`, belum space/interstellar/portal/eden/tau; (2) hanya 3-4 job yang tampil walau 57 key tech (job `display` kemungkinan diatur logika lain),
  sehingga produksi kecil dan Food cenderung negatif; (3) pemerintahan tetap anarchy; (4) belum dikalibrasi supaya mirip permainan nyata.

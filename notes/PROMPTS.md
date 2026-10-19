# Template Prompt (chat biasa)

## A. Pembuka sesi
```
Konteks proyek ada di dokumen berikut. Baca dulu, jangan mulai mengerjakan sebelum konfirmasi paham.
[tempel PROJECT_BRIEF.md]
[tempel entri terbaru HANDOFF.md]
Ringkas pemahamanmu dalam 5 poin, lalu tunggu tugas.
```

## B. Tugas per fase
```
TUJUAN (satu hal sempit): ...
KONTRAK (tipe/interface yang tidak boleh diubah, tempel langsung): ...
INPUT (potongan rumus/data Evolve yang relevan, tempel langsung): ...
KRITERIA SELESAI (tes yang harus lulus): ...
LARANGAN: sesuai Brief, ditambah: ...
FORMAT OUTPUT: file lengkap, tanpa placeholder atau "sisanya sama". Sebutkan path tiap file.
Bila ada yang ambigu, tanyakan dulu sebelum menulis kode.
```

## C. Penutup sesi
```
Tulis entri HANDOFF untuk sesi ini: apa yang jadi, keputusan desain, kontrak/interface terbaru (tempel kodenya),
tes yang lulus/gagal, TODO berikutnya.
```

// Dampak market order besar harus bertahan (tidak "terhapus" oleh tick acak berikutnya) dan konsisten antar seed.
// Dulu: setelah beli/jual besar, satu sisi book habis sampai harga terakhir sementara sisi lain masih di harga lama.
// Tick berikutnya menarik jangkar kr balik ke harga lama kalau tekanan acaknya ke sisi itu -> harga balik sendiri
// (buy/sell all "tanpa dampak") atau bertahan (stop "terbang"), tergantung lempar koin.
// Pakai: node test/stock-requote.mjs
import * as c from '../src/stocks/stocks_core.js';

function rng(seed){ let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
let ok = true;
function check(label, good){
    console.log(`${good ? 'OK    ' : 'GAGAL '} ${label}`);
    if (!good){ ok = false; }
}

const ups = [];
const downs = [];
const small = [];
for (let seed = 1; seed <= 40; seed++){
    let r = rng(seed);
    let st = c.newStock({ fair: 30 }, r);
    c.warmUp(st, 150, r);
    let p0 = st.price;
    c.buyMarket(st, 10000, r);
    c.stepStock(st, r);
    c.stepStock(st, r);
    ups.push(st.price / p0);

    r = rng(seed);
    st = c.newStock({ fair: 30 }, r);
    c.warmUp(st, 150, r);
    p0 = st.price;
    st.lots = 3000;
    st.spent = 90000;
    c.sellMarket(st, 3000, r);
    c.stepStock(st, r);
    c.stepStock(st, r);
    downs.push(st.price / p0);

    // order kecil tidak boleh me-regenerasi book (tidak ada re-quote kalau spread masih normal)
    r = rng(seed);
    st = c.newStock({ fair: 30 }, r);
    c.warmUp(st, 150, r);
    let before = JSON.stringify(st.bids);
    c.buyMarket(st, 1, r);
    small.push(before === JSON.stringify(st.bids));
}
check('beli 10000 lot: harga 2 tick kemudian naik >= 20% di SEMUA seed (min ' + Math.min(...ups).toFixed(2) + ')', Math.min(...ups) >= 1.2);
check('jual 3000 lot: harga 2 tick kemudian turun >= 5% di SEMUA seed (maks ' + Math.max(...downs).toFixed(2) + ')', Math.max(...downs) <= 0.95);
check('beli 1 lot tidak menyentuh sisi bid (tidak ada re-quote)', small.every(Boolean));

console.log(ok ? 'LOLOS' : 'GAGAL');
process.exit(ok ? 0 : 1);

// Tab Resources > Ocoin: beli dan jual resource pakai Ocoin bebas dengan alokasi per detik (mirip Alchemy).
// Satu angka per resource: plus = beli, minus = jual.
// Beli = harga dikurangi profit trade route, jual = harga ditambah profit trade route.
// Cek: (1) harga dan daftar resource, (2) langkah per loop tidak pernah menghabiskan lebih dari Ocoin yang ada dan tidak melebihi storage,
// (3) di game sungguhan Ocoin berkurang sesuai harga dan resource bertambah, (4) Ocoin yang terkunci di order tidak ikut terpakai.
// Pakai: node test/ocoin-alchemy.mjs
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync } from 'node:fs';

let ok = true;
const check = (label, cond, extra = '') => {
    console.log(`${cond ? 'OK    ' : 'GAGAL '} ${label}${extra ? ' ' + extra : ''}`);
    ok = ok && cond;
};
const close = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

const core = await import('../src/stocks/ocoin_alchemy_core.js');
const { resource_values, tradeRatio: tradeRatioMap } = await import('../src/config/constants.js');

// (1) harga dan daftar
check('harga Iron = nilai * markup / 1000', close(core.ocoinAlchemyPrice('Iron'), resource_values.Iron * core.OCOIN_ALCH_MARKUP / 1000));
check('harga per lot = harga per unit x lot', close(core.ocoinAlchemyLotPrice('Iron'), core.ocoinAlchemyPrice('Iron') * core.OCOIN_ALCH_LOT) && core.OCOIN_ALCH_LOT === 1000);
check('harga dari biaya beli trade route (bukan nilai item): unit 5 Money -> 5 * markup / 1000', close(core.ocoinAlchemyPrice('Iron', undefined, () => 5), 5 * core.OCOIN_ALCH_MARKUP / 1000));
check('tanpa trade route (biaya 0) kembali ke nilai dasar item', close(core.ocoinAlchemyPrice('Iron', undefined, () => 0), resource_values.Iron * core.OCOIN_ALCH_MARKUP / 1000));
check('Money, Knowledge, Mana tidak punya harga/tidak masuk', core.ocoinAlchemyPrice('Money') === 0 && core.ocoinAlchemyPrice('Knowledge') === 0);
const fake = {
    Money: {}, Knowledge: {}, Mana: { tradable: false }, Iron: { tradable: true }, Genes: {}, Soul_Gem: {},
    Graphene: { tradable: false, stackable: false }, Water: { stackable: true }, Codex: {}
};
const list = core.ocoinAlchemyList(fake);
check('daftar: material masuk (termasuk yang bukan tradable)', ['Iron', 'Graphene', 'Water'].every(r => list.includes(r)), JSON.stringify(list));
check('daftar: resource khusus tidak masuk', ['Money', 'Knowledge', 'Mana', 'Genes', 'Soul_Gem', 'Codex'].every(r => !list.includes(r)));

// (2) langkah per loop
let s = core.ocoinAlchemyStep(10, 1, 1, 0.5, 100, -1);
check('beli penuh bila Ocoin cukup', close(s.units, 10) && close(s.cost, 5));
s = core.ocoinAlchemyStep(10, 1, 1, 0.5, 2, -1);
check('Ocoin kurang: beli sebanyak yang terbayar, Ocoin jadi 0 persis', close(s.units, 4) && close(s.cost, 2));
s = core.ocoinAlchemyStep(10, 1, 1, 0.5, 100, 3);
check('storage penuh: tidak beli melebihi sisa ruang', close(s.units, 3) && close(s.cost, 1.5));
s = core.ocoinAlchemyStep(10, 1, 1, 0.5, 100, 0);
check('storage penuh total: tidak beli, tidak bayar', s.units === 0 && s.cost === 0);
s = core.ocoinAlchemyStep(10, 1, 4, 0.5, 100, -1);
check('waktu dipercepat (scale 4): units x4 setelah modRes, biaya ikut x4', close(s.units * 4, 40) && close(s.cost, 20));
s = core.ocoinAlchemyStep(10, 1, 1, 0.5, 0, -1);
check('tanpa Ocoin: tidak beli', s.units === 0 && s.cost === 0);

// (2b) harga beli/jual dengan profit trade route (faktor seperti marketplace)
{
    const base = core.ocoinAlchemyPrice('Iron');
    check('tanpa profit (faktor 1): harga beli = harga jual = harga dasar', close(core.ocoinAlchemyBuyPrice('Iron'), base) && close(core.ocoinAlchemySellPrice('Iron'), base));
    check('faktor beli 0,75 / jual 1,25: beli = dasar x 0,75, jual = dasar x 1,25', close(core.ocoinAlchemyBuyPrice('Iron', undefined, null, 0.75), base * 0.75) && close(core.ocoinAlchemySellPrice('Iron', undefined, null, 1.25), base * 1.25));
    check('tidak ada batas tetap 90%: faktor beli 0,05 -> harga 5% dari dasar', close(core.ocoinAlchemyBuyPrice('Iron', undefined, null, 0.05), base * 0.05));
    check('faktor tidak valid (0, negatif, NaN) diabaikan', close(core.ocoinAlchemyBuyPrice('Iron', undefined, null, 0), base) && close(core.ocoinAlchemyBuyPrice('Iron', undefined, null, -1), base) && close(core.ocoinAlchemySellPrice('Iron', undefined, null, NaN), base));
    check('resource tanpa harga tetap 0 untuk beli dan jual', core.ocoinAlchemyBuyPrice('Money', undefined, null, 0.5) === 0 && core.ocoinAlchemySellPrice('Money', undefined, null, 2) === 0);
    let t = core.ocoinAlchemySellStep(10, 1, 1, 0.5, 100);
    check('jual penuh bila stok cukup', close(t.units, 10) && close(t.gain, 5));
    t = core.ocoinAlchemySellStep(10, 1, 1, 0.5, 4);
    check('stok kurang: jual sebanyak stok, Ocoin masuk sesuai', close(t.units, 4) && close(t.gain, 2));
    t = core.ocoinAlchemySellStep(10, 1, 1, 0.5, 0);
    check('stok kosong: tidak jual, tidak dapat Ocoin', t.units === 0 && t.gain === 0);
    t = core.ocoinAlchemySellStep(10, 1, 4, 0.5, 1000);
    check('waktu dipercepat (scale 4): units x4 setelah modRes, Ocoin ikut x4', close(t.units * 4, 40) && close(t.gain, 20));
}

// (3) game sungguhan
seedMathRandom(12345);
setFixedNow(1735689600000);
global.localStorage.setItem('evolved', JSON.parse(readFileSync(new URL('./fixtures/user-save-1.json', import.meta.url), 'utf8')).save);
const { global: G, atrack } = await import('../src/core/vars.js');
const { execGameLoops } = await import('../src/main.js');
seedMathRandom(12345);
setFixedNow(1735689600000);
execGameLoops(5);
atrack.t = 0;
G.settings.at = 0;

const { tradeRouteUnitCost, tradeBuyPrice, tradeBuyRate } = await import('../src/resources/crate_assignment.js');
const { ocoinUnitPrice, ocoinSellUnitPrice } = await import('../src/resources/ocoin_alchemy.js');
const { tradeProfitBuyFactor, tradeProfitSellFactor } = await import('../src/resources/crate_assignment.js');
const buyF = tradeProfitBuyFactor();
const sellF = tradeProfitSellFactor();
const price = ocoinUnitPrice('Iron');
const routeUnit = tradeBuyPrice('Iron') / tradeBuyRate('Iron');
check('game: biaya unit via route = harga route / unit per route', close(tradeRouteUnitCost('Iron'), routeUnit) && routeUnit > 0, `(${routeUnit.toFixed(3)} Money/unit)`);
check('game: harga beli Iron di tab = biaya route x markup / 1000 x faktor beli', close(price, routeUnit * core.OCOIN_ALCH_MARKUP / 1000 * buyF), `(faktor beli ${buyF.toFixed(4)})`);
check('game: harga jual Iron di tab = biaya route x markup / 1000 x faktor jual', close(ocoinSellUnitPrice('Iron'), routeUnit * core.OCOIN_ALCH_MARKUP / 1000 * sellF), `(faktor jual ${sellF.toFixed(4)})`);
check('game: ada profit trade route di save ini: faktor beli < 1 < faktor jual, jual > beli', buyF < 1 && sellF > 1 && ocoinSellUnitPrice('Iron') > price, `(jual ${ocoinSellUnitPrice('Iron')} > beli ${price})`);
{
    // faktor profit harus sama dengan yang dipakai marketplace: harga trade route dengan bangunan / tanpa bangunan
    const { tradeBuyPrice: tbp, tradeSellPrice: tsp } = await import('../src/resources/crate_assignment.js');
    const saved = { wharf: G.city.wharf && G.city.wharf.count, gps: G.space.gps && G.space.gps.count, railway: G.tech.railway };
    const withBuy = tbp('Iron'), withSell = tsp('Iron');
    if (G.city.wharf){ G.city.wharf.count = 0; }
    if (G.space.gps){ G.space.gps.count = 0; }
    if (G.tech.railway){ G.tech.railway = 0; }
    const noBuy = tbp('Iron'), noSell = tsp('Iron');
    if (G.city.wharf){ G.city.wharf.count = saved.wharf; }
    if (G.space.gps){ G.space.gps.count = saved.gps; }
    if (G.tech.railway){ G.tech.railway = saved.railway; }
    check('game: faktor beli = harga beli marketplace dengan bangunan / tanpa bangunan', close(withBuy / noBuy, buyF, 0.01), `(${(withBuy / noBuy).toFixed(4)} vs ${buyF.toFixed(4)})`);
    check('game: faktor jual = harga jual marketplace dengan bangunan / tanpa bangunan', close(withSell / noSell, sellF, 0.01), `(${(withSell / noSell).toFixed(4)} vs ${sellF.toFixed(4)})`);
    // soft cap: sebanyak apa pun bangunan, harga beli tidak pernah sampai 0
    const keep = G.city.wharf ? G.city.wharf.count : null;
    if (G.city.wharf){ G.city.wharf.count = 2000; }
    const deep = tradeProfitBuyFactor();
    if (G.city.wharf){ G.city.wharf.count = keep; }
    check('game: soft cap alami: 2000 wharf tetap faktor beli > 0 dan < 1 (tanpa batas buatan)', deep > 0 && deep < 1, `(${deep.toExponential(2)})`);
}
const noRoute = core.ocoinAlchemyList(G.resource ? (await import('../src/core/vars.js')).tmp_vars.resource : {}).find(r => !(r in tradeRatioMap));
check('game: resource tanpa trade route memakai nilai dasar', !noRoute || (tradeRouteUnitCost(noRoute) === 0 && close(ocoinUnitPrice(noRoute), (resource_values[noRoute] || 0) * core.OCOIN_ALCH_MARKUP / 1000 * buyF)), noRoute ? `(${noRoute})` : '(semua punya route)');
G.resource.Iron.display = true;
G.resource.Iron.max = 1e15;
G.race.ocoinAlchemy = { Iron: 10 }; // 10 lot = 10 x 1000 = 10.000 unit/detik
G.race.ocoinAlchemyLots = true;
G.stocks.ocoin = 1e6;
G.stocks.orders = G.stocks.orders || [];
const iron0 = G.resource.Iron.amount;
const ocoin0 = G.stocks.ocoin;
execGameLoops(1);
const gained = G.resource.Iron.amount - iron0;
const spent = ocoin0 - G.stocks.ocoin;
check('game: Iron bertambah', gained > 0, `(+${gained.toFixed(2)})`);
// satu loop = 0,25 detik: yang dibeli = alokasi (lot) * 1000 * 0,25 unit, biayanya unit * harga. Iron yang bertambah >= yang dibeli (ada produksi biasa juga).
const boughtUnits = spent / price;
check('game: Ocoin terpotong = unit dibeli x harga, unit = lot x 1000 x 0,25 detik', close(boughtUnits, 10 * core.OCOIN_ALCH_LOT * 0.25, 1e-3) && gained >= boughtUnits - 1e-6, `(dibeli ${boughtUnits.toFixed(3)} unit, Iron +${gained.toFixed(2)})`);

// satu langkah angka (1 lot) = 1000 unit/detik, dibayar per harga lot
{
    G.race.ocoinAlchemy = { Iron: 1 };
    G.stocks.ocoin = 1e6;
    const o0 = G.stocks.ocoin;
    execGameLoops(1);
    const spent1 = o0 - G.stocks.ocoin;
    check('game: 1 lot = 1000 unit/detik (250 unit per loop 0,25 detik)', close(spent1 / price, core.OCOIN_ALCH_LOT * 0.25, 1e-3), `(${(spent1 / price).toFixed(3)} unit)`);
    check('game: biaya 1 lot per detik = harga per 1000 unit', close(spent1 / 0.25, price * core.OCOIN_ALCH_LOT, 1e-3));
}

// migrasi: save lama menyimpan unit/detik, dikonversi sekali ke lot (dibulatkan), dan jalan juga sebelum tab pernah dibuka
{
    const { migrateOcoinAlchemyLots } = await import('../src/resources/ocoin_alchemy.js');
    G.race.ocoinAlchemy = { Iron: 10000, Water: 5, Copper: 2600 };
    delete G.race.ocoinAlchemyLots;
    migrateOcoinAlchemyLots();
    check('migrasi: 10000 -> 10 lot, 5 -> 0, 2600 -> 3', G.race.ocoinAlchemy.Iron === 10 && G.race.ocoinAlchemy.Water === 0 && G.race.ocoinAlchemy.Copper === 3 && G.race.ocoinAlchemyLots === true, JSON.stringify(G.race.ocoinAlchemy));
    migrateOcoinAlchemyLots();
    check('migrasi: tidak dikonversi dua kali', G.race.ocoinAlchemy.Iron === 10 && G.race.ocoinAlchemy.Copper === 3);

    // fast loop memicu migrasi sendiri: alokasi lama 10.000 unit/detik tidak boleh menjadi 10.000.000 unit/detik
    G.race.ocoinAlchemy = { Iron: 10000 };
    delete G.race.ocoinAlchemyLots;
    G.stocks.ocoin = 1e9;
    const o1 = G.stocks.ocoin;
    execGameLoops(1);
    const units = (o1 - G.stocks.ocoin) / price;
    check('migrasi lewat fast loop: alokasi lama 10.000 unit/detik tetap ~10.000 unit/detik', close(units, 10000 * 0.25, 1e-3) && G.race.ocoinAlchemy.Iron === 10, `(${units.toFixed(3)} unit per loop)`);
    G.race.ocoinAlchemyLots = true;
}

// pembanding: tanpa alokasi, Iron tidak berubah karena Ocoin dan Ocoin tidak berkurang
G.race.ocoinAlchemy = { Iron: 0 };
const ocoin1 = G.stocks.ocoin;
execGameLoops(1);
check('game: alokasi 0 tidak memotong Ocoin', G.stocks.ocoin === ocoin1);

// Ocoin habis: berhenti sendiri, tidak negatif
G.race.ocoinAlchemy = { Iron: 1e9 };
G.stocks.ocoin = price * 5;
execGameLoops(3);
check('game: Ocoin habis berhenti di 0, tidak negatif', G.stocks.ocoin >= 0 && G.stocks.ocoin < price * 5 + 1e-9, `(sisa ${G.stocks.ocoin})`);

// (4) Ocoin yang terkunci di order tidak ikut: G.stocks.ocoin sudah berisi hanya yang bebas (reserved dipisah di order)
G.stocks.ocoin = 0;
G.race.ocoinAlchemy = { Iron: 10 };
const iron2 = G.resource.Iron.amount;
execGameLoops(1);
check('game: Ocoin bebas 0 -> tidak membeli apa pun dari alokasi', G.resource.Iron.amount - iron2 < 1000, `(+${(G.resource.Iron.amount - iron2).toFixed(2)})`);

// jual: stok berkurang, Ocoin bertambah sebesar unit x harga jual; tidak jual lebih dari stok
{
    const sellPrice = ocoinSellUnitPrice('Iron');
    // pembanding: perubahan Iron per loop tanpa jual (produksi biasa), lalu dengan jual. Selisihnya = unit terjual.
    G.race.ocoinAlchemy = { Iron: 0 };
    G.resource.Iron.amount = 1e6;
    G.stocks.ocoin = 0;
    execGameLoops(1);
    const prodOnly = G.resource.Iron.amount - 1e6;
    G.race.ocoinAlchemy = { Iron: -1 }; // minus = jual, 1 lot = 1000 unit/detik
    G.resource.Iron.amount = 1e6;
    G.stocks.ocoin = 0;
    execGameLoops(1);
    const sold = prodOnly - (G.resource.Iron.amount - 1e6);
    const got = G.stocks.ocoin;
    check('game jual: Iron berkurang dan Ocoin bertambah walau Ocoin awal 0', sold > 0 && got > 0, `(Iron -${sold.toFixed(2)} dari produksi, Ocoin +${got.toFixed(4)})`);
    check('game jual: Ocoin masuk = unit terjual x harga jual', close(got, sold * sellPrice, 1e-2), `(${(got / sellPrice).toFixed(3)} unit)`);
    check('game jual: 1 lot = 1000 unit/detik (250 unit per loop 0,25 detik)', close(got / sellPrice, core.OCOIN_ALCH_LOT * 0.25, 0.05), `(${(got / sellPrice).toFixed(3)} unit)`);

    G.resource.Iron.amount = 3;
    G.stocks.ocoin = 0;
    G.race.ocoinAlchemy = { Iron: -1e6 };
    execGameLoops(1);
    check('game jual: stok habis berhenti di 0, tidak negatif', G.resource.Iron.amount >= 0 && G.stocks.ocoin < 3 * sellPrice * 50 + 1, `(Iron ${G.resource.Iron.amount.toFixed(3)})`);

    G.race.ocoinAlchemy = { Iron: 0 };
    G.resource.Iron.amount = 1e6;
    G.stocks.ocoin = 5;
    execGameLoops(1);
    check('game jual: alokasi 0 tidak menambah Ocoin', G.stocks.ocoin === 5);

    // plus beli, minus jual, dalam satu daftar: Iron dibeli, Copper dijual
    G.resource.Copper.display = true;
    G.resource.Copper.max = 1e15;
    G.resource.Iron.max = 1e15;
    G.race.ocoinAlchemy = { Iron: 2, Copper: -2 };
    G.resource.Copper.amount = 1e6;
    G.stocks.ocoin = 1e6;
    const o2 = G.stocks.ocoin;
    execGameLoops(1);
    const buyCost = 2 * core.OCOIN_ALCH_LOT * 0.25 * price;
    const sellGain = 2 * core.OCOIN_ALCH_LOT * 0.25 * ocoinSellUnitPrice('Copper');
    check('game: satu daftar, Iron +2 dibeli dan Copper -2 dijual: Ocoin berubah = jual - beli', close(G.stocks.ocoin - o2, sellGain - buyCost, 1e-2), `(${(G.stocks.ocoin - o2).toFixed(5)} vs ${(sellGain - buyCost).toFixed(5)})`);

    // laju Ocoin/s nyata untuk indikator di Misc > Stocks: smoothing ~10 tick, jadi setelah 80 loop hampir penuh
    G.race.ocoinAlchemy = { Iron: -1 };
    G.resource.Iron.amount = 1e9;
    G.stocks.alchemyFlow = 0;
    for (let n = 0; n < 80; n++){ G.resource.Iron.amount = 1e9; execGameLoops(1); }
    const selling = G.stocks.alchemyFlow;
    const lotSell = ocoinSellUnitPrice('Iron') * core.OCOIN_ALCH_LOT;
    check('stocks: jual 1 lot Iron -> alchemyFlow mendekati + harga jual per lot per detik', selling > 0 && close(selling, lotSell, 0.05), `(${selling.toFixed(5)} vs ${lotSell.toFixed(5)})`);
    G.race.ocoinAlchemy = { Iron: 1 };
    G.stocks.ocoin = 1e6;
    G.resource.Iron.max = 1e15;
    G.resource.Iron.amount = 1000; // jauh di bawah storage asli, supaya pembelian tidak terpotong cap
    for (let n = 0; n < 80; n++){ execGameLoops(1); }
    const buying = G.stocks.alchemyFlow;
    const lotBuy = price * core.OCOIN_ALCH_LOT;
    check('stocks: beli 1 lot Iron -> alchemyFlow mendekati - harga beli per lot per detik', buying < 0 && close(buying, -lotBuy, 0.05), `(${buying.toFixed(5)} vs ${(-lotBuy).toFixed(5)})`);
    G.race.ocoinAlchemy = { Iron: 0 };
    for (let n = 0; n < 200; n++){ execGameLoops(1); }
    check('stocks: tanpa alokasi alchemyFlow meluruh ke 0', Math.abs(G.stocks.alchemyFlow) < 1e-6, `(${G.stocks.alchemyFlow})`);

    // save dari versi sebelumnya punya daftar jual terpisah: dilebur sekali ke angka bertanda
    const { migrateOcoinAlchemyLots: migr } = await import('../src/resources/ocoin_alchemy.js');
    G.race.ocoinAlchemy = { Iron: 3, Copper: 0 };
    G.race.ocoinAlchemyLots = true;
    G.race.ocoinAlchemySell = { Iron: 1, Copper: 4, Water: 0 };
    migr();
    check('migrasi jual lama: Iron 3 - 1 = 2, Copper 0 - 4 = -4, daftar lama dihapus', G.race.ocoinAlchemy.Iron === 2 && G.race.ocoinAlchemy.Copper === -4 && !('ocoinAlchemySell' in G.race), JSON.stringify(G.race.ocoinAlchemy));
    G.race.ocoinAlchemy = { Iron: 0 };
}

// (5) Vue 2 hanya membuat reaktif key yang SUDAH ada saat vBind pertama. Kalau key alokasi ditambah setelahnya, angka di layar
// tidak pernah berubah (tombol « » terlihat mati). Jadi semua key harus sudah ada saat header (vBind pertama) dibuat.
{
    const { drawOcoinAlchemy } = await import('../src/resources/ocoin_alchemy.js');
    const { tmp_vars } = await import('../src/core/vars.js');
    const expected = core.ocoinAlchemyList(tmp_vars.resource);
    G.race.ocoinAlchemy = {};
    G.settings.tabLoad = true;
    $('body').append('<div id="resOcoinAlchemy"></div>');
    const RealVue = global.Vue;
    let keysAtFirstBind = null;
    let headerMethods = null;
    global.Vue = function(opts){
        if (opts && opts.methods && opts.methods.rate){
            headerMethods = opts.methods;
        }
        if (keysAtFirstBind === null && opts && opts.data && opts.data.a){
            keysAtFirstBind = Object.keys(opts.data.a);
        }
        return Reflect.construct(RealVue, [opts], global.Vue);
    };
    Object.assign(global.Vue, RealVue);
    drawOcoinAlchemy();
    global.Vue = RealVue;
    G.settings.tabLoad = false;
    // header: satu angka Ocoin/s = pendapatan jual - biaya beli, dengan tanda + / -
    if (headerMethods){
        G.resource.Iron.display = true;
        G.resource.Copper.display = true;
        const a = G.race.ocoinAlchemy;
        a.Iron = -2; a.Copper = 3; // Iron dijual 2 lot, Copper dibeli 3 lot
        const expectNet = 2 * ocoinSellUnitPrice('Iron') * core.OCOIN_ALCH_LOT - 3 * ocoinUnitPrice('Copper') * core.OCOIN_ALCH_LOT;
        const ctx = Object.assign({}, headerMethods);
        ctx.net = headerMethods.net;
        const net = headerMethods.net.call(ctx);
        check('header: Ocoin/s = jual - beli', close(net, expectNet, 1e-9), `(${net.toFixed(5)})`);
        const sign = (v) => { a.Iron = v; a.Copper = 0; return headerMethods.rate.call({ net: headerMethods.net }); };
        check('header: jual saja tampil dengan +, beli saja tampil dengan -, kosong tampil 0', sign(-1).startsWith('+') && sign(1).startsWith('-') && sign(0) === '0', `(${sign(-1)} / ${sign(1)} / ${sign(0)})`);
        check('header: warna hijau saat plus, merah saat minus', (a.Iron = -1, headerMethods.rateClass.call({ net: headerMethods.net })) === 'has-text-success' && (a.Iron = 1, headerMethods.rateClass.call({ net: headerMethods.net })) === 'has-text-danger');
        a.Iron = 0; a.Copper = 0;
    }
    check('header: methods Ocoin/s terpasang', headerMethods !== null);
    check('tab: ada resource yang bisa dibeli', expected.length > 5, `(${expected.length} resource)`);
    check('tab: semua key alokasi sudah ada sebelum vBind pertama', keysAtFirstBind !== null && expected.every(r => keysAtFirstBind.includes(r)),
        keysAtFirstBind ? `(${keysAtFirstBind.length}/${expected.length})` : '(vBind tidak terpanggil)');
}


// (5) beli/jual instan sekali klik: semua resource di tab, harga sama dengan alokasi per detik
{
    const b1 = core.ocoinInstantBuy(1000, 0.5, 1e9, -1);
    check('instan beli: Ocoin cukup -> beli penuh, biaya = unit x harga', b1.units === 1000 && close(b1.cost, 500));
    const b2 = core.ocoinInstantBuy(1000, 0.5, 10, -1);
    check('instan beli: Ocoin kurang -> beli sebanyak yang terbayar, bulat', b2.units === 20 && close(b2.cost, 10));
    const b3 = core.ocoinInstantBuy(1000, 0.5, 1e9, 37.9);
    check('instan beli: storage hampir penuh -> hanya sebesar sisa ruang (bulat ke bawah)', b3.units === 37 && close(b3.cost, 18.5));
    const b4 = core.ocoinInstantBuy(1000, 0.5, 1e9, 0);
    check('instan beli: storage penuh -> tidak beli, tidak bayar', b4.units === 0 && b4.cost === 0);
    const b5 = core.ocoinInstantBuy(1000, 0.5, 0, -1);
    check('instan beli: tanpa Ocoin -> tidak beli', b5.units === 0 && b5.cost === 0);
    const b6 = core.ocoinInstantBuy(1000, 0, 100, -1);
    check('instan beli: harga 0 / tidak valid -> tidak beli', b6.units === 0 && core.ocoinInstantBuy(NaN, 1, 100, -1).units === 0);
    const s1 = core.ocoinInstantSell(1000, 0.5, 1e9);
    check('instan jual: stok cukup -> jual penuh, Ocoin masuk = unit x harga', s1.units === 1000 && close(s1.gain, 500));
    const s2 = core.ocoinInstantSell(1000, 0.5, 42.7);
    check('instan jual: stok kurang -> jual sebanyak stok (bulat ke bawah)', s2.units === 42 && close(s2.gain, 21));
    const s3 = core.ocoinInstantSell(1000, 0.5, 0.9);
    check('instan jual: stok kurang dari 1 unit -> tidak jual', s3.units === 0 && s3.gain === 0);
    const Q = core.ocoinInstantQuantity;
    check('instan: jumlah = angka x 10^eksponen (1 x K = 1000, 2,5 x M = 2.500.000)', Q(1, 3) === 1000 && Q(2.5, 6) === 2500000 && Q(7, 0) === 7);
    check('instan: tanpa batas atas (1 x S = 1e24, 5000 x B = 5e12)', Q(1, 24) === 1e24 && Q(5000, 9) === 5e12 && Q(1, 30) === 1e30);
    check('instan: tidak ada noise float (4,35 x 100 = 435, 1,1 x K = 1100)', Q(4.35, 2) === 435 && Q(1.1, 3) === 1100);
    check('instan: angka tidak valid / nol / negatif -> 0', Q(0, 3) === 0 && Q(-5, 3) === 0 && Q(NaN, 3) === 0 && Q('', 3) === 0 && Q(0.4, 0) === 0);
    check('instan: daftar satuan mulai dari none (0) lalu K, M, B', core.OCOIN_INSTANT_EXPS[0] === 0 && core.OCOIN_INSTANT_EXPS.slice(1, 4).join() === '3,6,9');
    const hugeBuy = core.ocoinInstantBuy(1e30, 0.5, 100, -1);
    check('instan beli: jumlah raksasa tetap dibatasi Ocoin (100 Ocoin / 0,5 = 200 unit)', hugeBuy.units === 200 && close(hugeBuy.cost, 100));
    check('instan jual: jumlah raksasa tetap dibatasi stok', core.ocoinInstantSell(1e30, 0.5, 42.7).units === 42);
}


// (5b) instan di game sungguhan
{
    const { ocoinInstantBuyNow, ocoinInstantSellNow } = await import('../src/resources/ocoin_alchemy.js');
    G.settings.pause = false;
    G.resource.Iron.display = true;
    G.race.ocoinInstant = { coef: 1, exp: 3 };
    // beli
    G.stocks.ocoin = 1e9;
    G.resource.Iron.amount = 0;
    G.resource.Iron.max = 1e9;
    const pBuy = ocoinUnitPrice('Iron');
    const ok1 = ocoinInstantBuyNow('Iron');
    check('game instan beli: Iron +1000, Ocoin berkurang 1000 x harga beli', ok1 && G.resource.Iron.amount === 1000 && close(1e9 - G.stocks.ocoin, 1000 * pBuy));
    // storage hampir penuh
    G.resource.Iron.amount = 0; G.resource.Iron.max = 300; G.stocks.ocoin = 1e9;
    ocoinInstantBuyNow('Iron');
    check('game instan beli: storage 300 -> hanya +300, tidak ada Ocoin terbuang', G.resource.Iron.amount === 300 && close(1e9 - G.stocks.ocoin, 300 * pBuy));
    // storage penuh -> tidak melakukan apa pun
    const o2 = G.stocks.ocoin;
    const ok2 = ocoinInstantBuyNow('Iron');
    check('game instan beli: storage penuh -> false, Ocoin tidak berubah', ok2 === false && G.stocks.ocoin === o2);
    // Ocoin tidak cukup
    G.resource.Iron.amount = 0; G.resource.Iron.max = 1e9; G.stocks.ocoin = pBuy * 10.5;
    ocoinInstantBuyNow('Iron');
    check('game instan beli: Ocoin cuma cukup 10 unit -> +10, sisa Ocoin < 1 harga', G.resource.Iron.amount === 10 && G.stocks.ocoin < pBuy && G.stocks.ocoin >= 0);
    // jual
    const pSell = ocoinSellUnitPrice('Iron');
    G.resource.Iron.amount = 5000; G.stocks.ocoin = 0;
    const ok3 = ocoinInstantSellNow('Iron');
    check('game instan jual: Iron -1000, Ocoin +1000 x harga jual', ok3 && G.resource.Iron.amount === 4000 && close(G.stocks.ocoin, 1000 * pSell));
    // stok kurang dari jumlah
    G.resource.Iron.amount = 250.8; G.stocks.ocoin = 0;
    ocoinInstantSellNow('Iron');
    check('game instan jual: stok 250,8 -> jual 250, sisa 0,8, tidak negatif', close(G.resource.Iron.amount, 0.8) && close(G.stocks.ocoin, 250 * pSell));
    // jumlah lain dan pause
    G.race.ocoinInstant.coef = 10; G.race.ocoinInstant.exp = 0; G.resource.Iron.amount = 100; G.stocks.ocoin = 0;
    ocoinInstantSellNow('Iron');
    check('game instan jual: jumlah 10 dihormati', G.resource.Iron.amount === 90);
    G.race.ocoinInstant.coef = 2; G.race.ocoinInstant.exp = 6; G.resource.Iron.amount = 5e6; G.stocks.ocoin = 0;
    ocoinInstantSellNow('Iron');
    check('game instan jual: 2 x M = 2.000.000 unit sekali klik (tanpa batas 1 juta)', G.resource.Iron.amount === 3e6);
    G.race.ocoinInstant = { qty: 250 }; G.resource.Iron.amount = 1000; G.stocks.ocoin = 0;
    ocoinInstantSellNow('Iron');
    check('game instan: save versi lama (qty 250) dimigrasi ke angka 250 tanpa satuan', G.race.ocoinInstant.coef === 250 && G.race.ocoinInstant.exp === 0 && !('qty' in G.race.ocoinInstant) && G.resource.Iron.amount === 750);
    G.race.ocoinInstant = { coef: 1, exp: 3 };
    G.settings.pause = true;
    const before = G.resource.Iron.amount;
    check('game instan: saat pause tidak berjalan', ocoinInstantSellNow('Iron') === false && ocoinInstantBuyNow('Iron') === false && G.resource.Iron.amount === before);
    G.settings.pause = false;
    // Money tidak ada di tab ini, tidak boleh bisa dijual lewat jalur ini
    G.resource.Money.display = true; G.resource.Money.amount = 100; G.stocks.ocoin = 0;
    ocoinInstantSellNow('Money');
    check('game instan: Money tidak punya harga -> tidak bisa dijual', G.resource.Money.amount === 100 && G.stocks.ocoin === 0);
}

console.log(ok ? '\nLOLOS' : '\nGAGAL');
process.exit(ok ? 0 : 1);

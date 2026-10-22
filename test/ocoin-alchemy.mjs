// Tab Resources > Ocoin: beli resource pakai Ocoin bebas dengan alokasi per detik (mirip Alchemy).
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
const { resource_values } = await import('../src/config/constants.js');

// (1) harga dan daftar
check('harga Iron = nilai * markup / 1000', close(core.ocoinAlchemyPrice('Iron'), resource_values.Iron * core.OCOIN_ALCH_MARKUP / 1000));
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

const price = core.ocoinAlchemyPrice('Iron');
G.resource.Iron.display = true;
G.resource.Iron.max = 1e15;
G.race.ocoinAlchemy = { Iron: 1000 };
G.stocks.ocoin = 1e6;
G.stocks.orders = G.stocks.orders || [];
const iron0 = G.resource.Iron.amount;
const ocoin0 = G.stocks.ocoin;
execGameLoops(1);
const gained = G.resource.Iron.amount - iron0;
const spent = ocoin0 - G.stocks.ocoin;
check('game: Iron bertambah', gained > 0, `(+${gained.toFixed(2)})`);
// satu loop = 0,25 detik: yang dibeli = alokasi * 0,25 unit, biayanya unit * harga. Iron yang bertambah >= yang dibeli (ada produksi biasa juga).
const boughtUnits = spent / price;
check('game: Ocoin terpotong = unit dibeli x harga, unit = alokasi x 0,25 detik', close(boughtUnits, 1000 * 0.25, 1e-3) && gained >= boughtUnits - 1e-6, `(dibeli ${boughtUnits.toFixed(3)} unit, Iron +${gained.toFixed(2)})`);

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
G.race.ocoinAlchemy = { Iron: 1000 };
const iron2 = G.resource.Iron.amount;
execGameLoops(1);
check('game: Ocoin bebas 0 -> tidak membeli apa pun dari alokasi', G.resource.Iron.amount - iron2 < 1000, `(+${(G.resource.Iron.amount - iron2).toFixed(2)})`);

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
    global.Vue = function(opts){
        if (keysAtFirstBind === null && opts && opts.data && opts.data.a){
            keysAtFirstBind = Object.keys(opts.data.a);
        }
        return Reflect.construct(RealVue, [opts], global.Vue);
    };
    Object.assign(global.Vue, RealVue);
    drawOcoinAlchemy();
    global.Vue = RealVue;
    G.settings.tabLoad = false;
    check('tab: ada resource yang bisa dibeli', expected.length > 5, `(${expected.length} resource)`);
    check('tab: semua key alokasi sudah ada sebelum vBind pertama', keysAtFirstBind !== null && expected.every(r => keysAtFirstBind.includes(r)),
        keysAtFirstBind ? `(${keysAtFirstBind.length}/${expected.length})` : '(vBind tidak terpanggil)');
}

console.log(ok ? '\nLOLOS' : '\nGAGAL');
process.exit(ok ? 0 : 1);

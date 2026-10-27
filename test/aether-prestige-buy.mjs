// Tab Aether: beli Dark Energy dan Harmony Crystal pakai Aether (gaya Plasmid/Phage: sekali klik, kelipatan Aether utuh).
// Cek: (1) helper murni aetherBuyPrestige (jumlah, batas Aether yang dimiliki, pembulatan sesuai desimal game, input aneh),
// (2) rate 1 Aether = 10 Dark Energy dan 1 Aether = 1 Harmony Crystal, (3) baris dan method-nya ada di tab Aether.
// Pakai: node test/aether-prestige-buy.mjs
import './env-setup.mjs';
import { readFileSync } from 'node:fs';

let ok = true;
const check = (label, cond, extra = '') => {
    console.log(`${cond ? 'OK    ' : 'GAGAL '} ${label}${extra ? ' ' + extra : ''}`);
    ok = ok && cond;
};
const close = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps * Math.max(1, Math.abs(a), Math.abs(b));

const core = await import('../src/stocks/stocks_core.js');
const { aetherBuyPrestige, AETHER_DARK_RATE, AETHER_HARMONY_RATE } = core;

check('rate: 1 Aether = 10 Dark Energy', AETHER_DARK_RATE === 10);
check('rate: 1 Aether = 1 Harmony Crystal', AETHER_HARMONY_RATE === 1);

// (1) helper murni
let r = aetherBuyPrestige(100, 5, AETHER_DARK_RATE, 1, 3);
check('beli 1 Aether -> +10 Dark Energy, Aether -1', r && r.count === 15 && r.aether === 99 && r.spent === 1, JSON.stringify(r));
r = aetherBuyPrestige(100, 5, AETHER_DARK_RATE, 25, 3);
check('kelipatan 25x -> +250 Dark Energy, Aether -25', r && r.count === 255 && r.aether === 75);
r = aetherBuyPrestige(3, 0, AETHER_HARMONY_RATE, 100, 2);
check('kelipatan melebihi Aether -> dibatasi Aether yang ada (3 Aether -> 3 Harmony)', r && r.count === 3 && r.aether === 0 && r.spent === 3);
r = aetherBuyPrestige(3.9, 0, AETHER_HARMONY_RATE, 10, 2);
check('Aether pecahan hanya dihitung utuh (3,9 -> beli 3, sisa 0,9)', r && r.count === 3 && close(r.aether, 0.9));
check('Aether < 1 tidak bisa beli (null)', aetherBuyPrestige(0.99, 0, AETHER_HARMONY_RATE, 1, 2) === null);
check('Aether 0 / negatif / NaN / undefined -> null', [0, -5, NaN, undefined].every(a => aetherBuyPrestige(a, 0, 1, 1, 2) === null));
check('qty 0 / negatif / NaN -> null', [0, -1, NaN].every(q => aetherBuyPrestige(10, 0, 1, q, 2) === null));
check('rate 0 / negatif -> null (tidak mencetak currency gratis)', aetherBuyPrestige(10, 0, 0, 1, 2) === null && aetherBuyPrestige(10, 0, -1, 1, 2) === null);
r = aetherBuyPrestige(10, 0.1, AETHER_HARMONY_RATE, 1, 2);
check('pembulatan sesuai desimal game (Harmony 2 desimal): 0,1 + 1 = 1,1 tepat', r && r.count === 1.1, `(${r && r.count})`);
r = aetherBuyPrestige(10, 0.1 + 0.2, AETHER_DARK_RATE, 1, 3);
check('pembulatan Dark Energy 3 desimal tidak menyisakan ekor floating (0,3 + 10)', r && r.count === 10.3, `(${r && r.count})`);
r = aetherBuyPrestige(7.7e12, 123.456, AETHER_DARK_RATE, 1e12, 3);
check('angka besar (Aether triliunan) tetap hingga dan benar', r && isFinite(r.count) && close(r.count, 123.456 + 1e13) && close(r.aether, 6.7e12));
check('count awal undefined/NaN diperlakukan 0', aetherBuyPrestige(5, undefined, 10, 1, 3).count === 10);

// (2b) jumlah Aether yang benar-benar dipakai satu klik = yang ditampilkan di tombol/tooltip (pengali, dibatasi Aether utuh, min 1)
{
    const { aetherBuyCount } = core;
    check('tampilan: pengali x1/x10/x25/x100 dengan Aether cukup', [1, 10, 25, 100].every(m => aetherBuyCount(1e6, m) === m));
    check('tampilan: pengali dibatasi Aether utuh yang dimiliki (3,9 Aether, x10 -> 3)', aetherBuyCount(3.9, 10) === 3);
    check('tampilan: Aether habis / kurang dari 1 -> tetap tampil 1 (harga dasar, tombol mati)', aetherBuyCount(0.5, 100) === 1 && aetherBuyCount(0, 10) === 1 && aetherBuyCount(-3, 10) === 1 && aetherBuyCount(NaN, 10) === 1);
    check('tampilan: pengali aneh (0, negatif, NaN) dianggap x1', [0, -5, NaN, undefined].every(m => aetherBuyCount(50, m) === 1));
    const r2 = aetherBuyPrestige(3.9, 0, AETHER_HARMONY_RATE, 10, 2);
    check('tampilan = pembelian nyata: yang ditampilkan sama dengan yang dibeli', aetherBuyCount(3.9, 10) === r2.spent);
}

// (2c) pengali tombol (Ctrl/Shift/Alt) reaktif: teks tombol/tooltip yang memakai keyMultiplier() ikut dihitung ulang saat tombol ditekan
{
    const vars = await import('../src/core/vars.js');
    const { keyState, setKeyMap, keyMultiplier, global } = vars;
    const mk = global.settings.mKeys;
    global.settings.mKeys = true;
    const n0 = keyState.n;
    setKeyMap('x10', true);
    check('reaktif: tombol x10 ditekan -> penghitung keyState naik 1 dan pengali jadi 10', keyState.n === n0 + 1 && keyMultiplier() === 10);
    setKeyMap('x10', true);
    check('reaktif: nilai sama (mousemove berulang) tidak menaikkan penghitung', keyState.n === n0 + 1);
    setKeyMap('x25', true);
    check('reaktif: x10 + x25 -> 250', keyMultiplier() === 250 && keyState.n === n0 + 2);
    setKeyMap('x10', false); setKeyMap('x25', false);
    check('reaktif: semua dilepas -> 1', keyMultiplier() === 1 && keyState.n === n0 + 4);
    setKeyMap('x100', true); global.settings.mKeys = false;
    check('reaktif: Multiplier Keys dimatikan di Settings -> tetap 1', keyMultiplier() === 1);
    setKeyMap('x100', false); global.settings.mKeys = mk;
}

// (3) UI: baris dan method ada, dan tooltip-nya ikut aturan append-to-body
const src = readFileSync(new URL('../src/resources/aether_alchemy.js', import.meta.url), 'utf8');
check('UI: baris Dark Energy ada di tab Aether', src.includes('id="aetherDark"') && src.includes('@click="buyDark()"'));
check('UI: tombol Plasmid/Phage/Dark/Harmony menampilkan jumlah ikut pengali (bukan angka tetap)', ['buyPlasmid', 'buyPhage', 'buyDark', 'buyHarmony'].every(f => new RegExp(`@click="${f}\\(\\)">\\{\\{ buyAmt\\(`).test(src)) && src.includes(':label="buyTip('));
check('UI: baris Harmony Crystal ada di tab Aether', src.includes('id="aetherHarmony"') && src.includes('@click="buyHarmony()"'));
check('UI: method buyDark/buyHarmony memakai aetherBuyPrestige dengan desimal game (3 dan 2)', /buyDark\(\)\{[\s\S]*?AETHER_DARK_RATE, keyMultiplier\(\), 3\)/.test(src) && /buyHarmony\(\)\{[\s\S]*?AETHER_HARMONY_RATE, keyMultiplier\(\), 2\)/.test(src));
const tips = src.match(/<b-tooltip [^>]*>/g) || [];
check('UI: semua tooltip Aether tetap append-to-body dan buka ke atas', tips.length > 0 && tips.every(t => t.includes('append-to-body') && t.includes('position="is-top"')), `(${tips.length} tooltip)`);

console.log(ok ? '\nLOLOS' : '\nGAGAL');
process.exit(ok ? 0 : 1);

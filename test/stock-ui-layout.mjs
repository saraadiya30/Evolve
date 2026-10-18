// Tombol Buy/Sell di panel stock tidak boleh naik-turun saat trading. Penyebabnya dulu: tombol ada di bawah bagian yang tingginya
// berubah (tabel alokasi, panel take-profit/stop-loss yang hanya ada kalau punya lot, baris P/L yang kosong lalu panjang,
// header yang bisa membungkus). jsdom tidak punya layout engine, jadi yang dikunci di sini adalah penyebabnya:
// (1) urutan DOM: tombol berada sebelum semua bagian yang tumbuh/menyusut, dan di atasnya hanya ada elemen yang selalu sama tinggi;
// (2) baris info selalu ada, satu baris, dengan title; P/L adalah baris sendiri (bukan menempel di baris kepemilikan);
// (3) aturan CSS: header dan baris info tidak membungkus, teks panjang dipotong, tombol punya tinggi minimum;
// (4) pesan yang muncul-hilang (kenapa TP/SL atau order tidak bisa dipasang) punya slot satu baris yang selalu ada, tanpa v-if,
//     jadi tombol dan daftar order di bawahnya tidak bergeser; teks lengkapnya ada di title (hover).
// Pakai: node test/stock-ui-layout.mjs <fixture>
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const [fx = 'user-save-1'] = process.argv.slice(2);
seedMathRandom(12345); setFixedNow(1735689600000);
global.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, 'fixtures', fx + '.json'), 'utf8')).save);
await import('../src/core/vars.js');
const { execGameLoops } = await import('../src/main.js');
const { drawStocks_s1 } = await import('../src/sections/drawing/draw_stocks_parts.js');
const { joinNotes } = await import('../src/stocks/stocks.js');
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(5);

let ok = true;
function check(label, got, want){
    const good = got === want;
    console.log(`${good ? 'OK    ' : 'GAGAL '} ${label}: ${got} (harapan ${want})`);
    if (!good) ok = false;
}

$('body').append('<div id="miscNew"></div>');
drawStocks_s1({});

const main = $('#stockExchange .stk-main');
check('panel .stk-main terbentuk', main.length, 1);
const kids = main.children().toArray();
const cls = (el) => (el.getAttribute('class') || '').split(/\s+/).filter(Boolean);
const idx = (pred) => kids.findIndex(pred);
const iBtns = idx(el => cls(el).includes('stk-btns'));
const iAlloc = idx(el => cls(el).includes('stk-alloc'));
const iExit = idx(el => cls(el).includes('stk-sub'));
const iForm = idx(el => el.id === 'stockOrderForm');
const iTitle = idx(el => cls(el).includes('stk-title'));

// (1) urutan DOM
check('tombol Buy/Sell ada', iBtns >= 0, true);
check('tombol sebelum tabel alokasi', iBtns < iAlloc, true);
check('tombol sebelum panel take-profit/stop-loss', iBtns < iExit, true);
check('tombol sebelum judul dan form order', iBtns < iTitle && iBtns < iForm, true);

const above = kids.slice(0, iBtns);
const aboveClasses = above.map(el => cls(el).find(c => /^stk-(head|chart|depth|line)$/.test(c)) || el.tagName.toLowerCase());
check('di atas tombol hanya: header, chart, depth, 3 baris info', aboveClasses.join(','), 'stk-head,stk-chart,stk-depth,stk-line,stk-line,stk-line');
const conditional = above.filter(el => ['v-if', 'v-else', 'v-else-if', 'v-show'].some(a => el.hasAttribute(a)));
check('satu-satunya yang bersyarat di atas tombol: chart (v-if="c")', conditional.map(el => cls(el).join(' ')).join('|'), 'stk-chart');

// (2) baris info
const lines = above.filter(el => cls(el).includes('stk-line'));
check('ada 3 baris info (spread, kepemilikan, P/L)', lines.length, 3);
check('semua baris info punya title (teks panjang tetap terbaca)', lines.every(el => el.hasAttribute(':title')), true);
check('tiap baris info hanya satu span (P/L bukan menempel di baris kepemilikan)', lines.every(el => el.querySelectorAll('span').length === 1), true);
check('baris P/L memakai plText', lines[2].innerHTML.includes('d.plText'), true);
check('baris kepemilikan memakai holdText', lines[1].innerHTML.includes('d.holdText') && !lines[1].innerHTML.includes('d.plText'), true);
check('baris P/L tanpa v-if (selalu ada, tinggi tetap)', lines[2].hasAttribute('v-if'), false);

// (3) CSS
const css = $('#stockStyle').text().replace(/\s+/g, ' ');
const rule = (sel) => {
    const m = css.match(new RegExp('#stockExchange ' + sel.replace(/[.>*]/g, '\\$&') + ' ?\\{([^}]*)\\}'));
    return m ? m[1] : '';
};
check('header tidak membungkus', /flex-wrap:\s*nowrap/.test(rule('.stk-head')), true);
check('header punya tinggi minimum', /min-height/.test(rule('.stk-head')), true);
check('isi header tidak menyusut/membungkus', /flex:\s*none/.test(rule('.stk-head>*')) && /white-space:\s*nowrap/.test(rule('.stk-head>*')), true);
check('nama stock dipotong titik-titik, bukan membungkus', /text-overflow:\s*ellipsis/.test(rule('.stk-name')) && /overflow:\s*hidden/.test(rule('.stk-name')), true);
check('baris info tidak membungkus', /flex-wrap:\s*nowrap/.test(rule('.stk-line')) && /white-space:\s*nowrap/.test(rule('.stk-line')), true);
check('baris info punya tinggi minimum', /min-height/.test(rule('.stk-line')), true);
check('isi baris info dipotong titik-titik', /text-overflow:\s*ellipsis/.test(rule('.stk-line>*')) && /overflow:\s*hidden/.test(rule('.stk-line>*')), true);
check('tombol punya tinggi minimum', /min-height/.test(rule('.stk-btns')), true);

// (4) slot pesan tinggi tetap
const exitPanel = main.children('.stk-sub').first();
const bracketPanel = main.children('.stk-sub').last();
check('ada panel TP/SL dan panel bracket (dua .stk-sub)', main.children('.stk-sub').length, 2);

const exitMsg = exitPanel.children('.stk-msg');
check('panel TP/SL: ada tepat satu slot pesan', exitMsg.length, 1);
check('panel TP/SL: slot pesan selalu ada (tanpa v-if)', exitMsg.attr('v-if'), undefined);
check('panel TP/SL: slot pesan memakai exitErr dan title', exitMsg.attr(':title') === 'd.exitErr' && exitMsg.html().includes('d.exitErr'), true);
check('panel TP/SL: pesan tidak lagi di samping tombol Place', exitPanel.html().includes('v-if="d.exitErr"'), false);
const placeRow = exitPanel.children('div').filter((i, el) => el.querySelector('b-tooltip') !== null).first();
check('panel TP/SL: baris tombol Place tidak membungkus', /flex-wrap:\s*nowrap/.test(placeRow.attr('style') || ''), true);
check('panel TP/SL: slot pesan berada di bawah tombol Place', exitPanel.children().toArray().indexOf(exitMsg[0]) > exitPanel.children().toArray().indexOf(placeRow[0]), true);

const bracketMsg = bracketPanel.children('.stk-msg');
check('bracket: ada tepat satu slot pesan', bracketMsg.length, 1);
check('bracket: slot pesan selalu ada (tanpa v-if)', bracketMsg.attr('v-if'), undefined);
check('bracket: slot pesan memakai bracketErr dan title', bracketMsg.attr(':title') === 'bracketErr()' && bracketMsg.html().includes('bracketErr()'), true);

const notes = main.children('.stk-note');
check('form order: tepat satu slot catatan', notes.length, 1);
check('form order: slot catatan memakai formNote dan title', notes.attr(':title') === 'formNote()' && notes.html().includes('formNote()') && notes.hasClass('stk-msg'), true);
check('form order: slot catatan selalu ada (tanpa v-if)', notes.attr('v-if'), undefined);
check('tidak ada pesan bersyarat tersisa di panel (v-if pada .stk-msg/.stk-note)', main.find('.stk-msg[v-if], .stk-note[v-if]').length, 0);
check('slot catatan form tepat setelah form order', main.children().toArray().indexOf(notes[0]), main.children().toArray().indexOf($('#stockOrderForm')[0]) + 1);

check('slot pesan: tinggi minimum', /min-height/.test(rule('.stk-msg')), true);
check('slot pesan: satu baris, dipotong titik-titik', /white-space:\s*nowrap/.test(rule('.stk-msg')) && /text-overflow:\s*ellipsis/.test(rule('.stk-msg')) && /overflow:\s*hidden/.test(rule('.stk-msg')), true);
check('baris input TP/SL tidak membungkus', /flex-wrap:\s*nowrap/.test(rule('.stk-side-row')), true);
check('teks harga hasil TP/SL dipotong, bukan membungkus', /text-overflow:\s*ellipsis/.test(rule('.stk-side .stk-resolved')) && /white-space:\s*nowrap/.test(rule('.stk-side .stk-resolved')), true);

// joinNotes (menggabungkan catatan yang berbagi satu slot)
check('joinNotes: hanya yang tidak kosong', joinNotes(['', 'a', null, ' ', 'b', undefined, 5]), 'a · b');
check('joinNotes: satu catatan', joinNotes(['x']), 'x');
check('joinNotes: semuanya kosong', joinNotes(['', '  ']), '');
check('joinNotes: array kosong', joinNotes([]), '');
check('joinNotes: undefined', joinNotes(undefined), '');

console.log(ok ? 'LOLOS' : 'GAGAL');
process.exit(ok ? 0 : 1);

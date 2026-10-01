// Fase 0.1 — setup lingkungan headless (jsdom + stub jQuery/Worker/localStorage)
// Tujuan: bikin `main.js` bisa di-import di Node tanpa crash, tanpa nunggu browser beneran.
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/',
    pretendToBeVisual: true, // biar requestAnimationFrame ada
});

const { window } = dom;

// --- expose window/document sebagai global, ala browser script biasa ---
global.window = window;
global.document = window.document;
// Node 22+ punya `navigator` bawaan sbg getter read-only -> pakai defineProperty
Object.defineProperty(global, 'navigator', { value: window.navigator, configurable: true });
global.localStorage = window.localStorage;
global.sessionStorage = window.sessionStorage;

// jsdom gak nyediain matchMedia beneran -> main.js sendiri sudah guard
// `if (!window.matchMedia) return;` jadi kita BIARKAN undefined, gak perlu stub.

// --- jQuery asli (real jquery, bukan mock) dipasang ke jsdom window ---
// CATATAN: karena `global.window`/`global.document` udah di-set duluan di atas,
// UMD wrapper jQuery langsung resolve dirinya sendiri penuh saat di-require
// (module.exports = factory(window) langsung, bukan factory MENUNGGU window).
// Jadi `.default` di sini SUDAH jadi $ final, BUKAN factory yang perlu dipanggil
// lagi dengan (window) -- kalau tetap dipanggil lagi, itu malah jadi `$(window)`
// (wrap window sbg elemen) dan hasilnya object, bukan function. Makanya dicek dulu.
const jqueryModule = (await import('jquery')).default;
const $ = (typeof jqueryModule.fn !== 'undefined') ? jqueryModule : jqueryModule(window);
global.$ = $;
global.jQuery = $;
window.$ = $;
window.jQuery = $;

// --- stub $.getJSON: locale.js manggil `$.getJSON("strings/strings.json", cb)`
// secara SYNCHRONOUS (ajaxSetup async:false) buat load string table. jsdom gak
// bisa fetch file lokal lewat XHR beneran, jadi kita override getJSON supaya
// baca langsung dari filesystem Node (isi & bentuk datanya sama persis, cuma
// jalur baca-nya yang diganti dari network jadi fs). Ini persis "stub jQuery
// secukupnya" yang dimaksud di rencana Fase 0.1. ---
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..'); // test/ -> root repo

$.getJSON = function (url, callback) {
    try {
        const filePath = join(repoRoot, url);
        const data = JSON.parse(readFileSync(filePath, 'utf8'));
        if (callback) callback(data);
        return { done: (fn) => { fn && fn(data); return { fail: () => {} }; } };
    } catch (e) {
        console.warn(`[env-setup] getJSON stub gagal baca ${url}:`, e.message);
        if (callback) callback(undefined);
        return { done: () => ({ fail: (fn) => { fn && fn(e); } }) };
    }
};

// --- stub Worker: main.js cek `if (window.Worker)` sebelum makein, jadi
// cukup pastiin window.Worker undefined/falsy supaya cabang itu dilewati ---
delete window.Worker;

// --- stub minimal buat Vue & Buefy: main.js/index.js manggil `new Vue({...})`
// dan beberapa komponen Buefy (popover dkk). Untuk Fase 0 kita cuma perlu
// game LOGIC-nya jalan (execGameLoops), bukan render UI-nya. Jadi Vue kita
// stub jadi no-op constructor + $set/$delete yang beneran (dipakai logic). ---
global.Vue = function (opts) {
    // simpan opts biar bisa diintrospeksi kalau perlu, tapi gak render apa-apa
    this.$options = opts || {};
    this.$data = (opts && opts.data && typeof opts.data === 'function') ? opts.data() : {};
    this.$mount = () => this;
    this.$forceUpdate = () => {};
    this.$nextTick = (cb) => { if (cb) cb(); return Promise.resolve(); };
    this.$set = (obj, key, val) => { obj[key] = val; return val; };
    this.$delete = (obj, key) => { delete obj[key]; };
    this.$emit = () => {};
    this.$on = () => {};
    this.$refs = {};
    return this;
};
Vue.set = (obj, key, val) => { obj[key] = val; return val; };
Vue.delete = (obj, key) => { delete obj[key]; };
Vue.component = () => {};
Vue.use = () => {};
Vue.directive = () => {};
window.Vue = global.Vue;

// --- PRNG deterministik buat Math.random() (mulberry32) ---
// Game pakai 2 sumber randomness: `seededRandom()` di vars.js (LCG pakai
// global.seed/warseed, SUDAH deterministik sendiri karena seed-nya ikut
// tersimpan di save state) dan `Math.random()` langsung (dipakai di banyak
// tempat lain, termasuk event boom/crash saham) yang TIDAK seeded -> ini
// yang perlu di-override biar harness reproducible run-to-run.
function mulberry32(seed) {
    return function () {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
export function seedMathRandom(seed) {
    Math.random = mulberry32(seed);
}
// Default seed kalau harness gak eksplisit set (biar try-import.mjs dkk tetep jalan)
seedMathRandom(1);

// --- Freeze Date.now()/new Date(): beberapa state (arpa timer, dst) nyimpen
// wall-clock time asli, yang bikin snapshot beda tiap run walau logic-nya
// identik. Harness butuh waktu yang FIXED biar diff bener-bener cuma nangkep
// perubahan logic, bukan noise jam. Bisa di-override per-run lewat setFixedNow(). ---
const OriginalDate = Date;
let fixedNow = OriginalDate.now();
export function setFixedNow(ms) { fixedNow = ms; }
global.Date = class extends OriginalDate {
    constructor(...args) {
        if (args.length === 0) super(fixedNow);
        else super(...args);
    }
    static now() { return fixedNow; }
};
window.Date = global.Date;

// --- LZString: dimuat browser lewat <script src="lib/lz-string.min.js"> (var
// global biasa), bukan module. Di headless, eval isinya langsung dan expose
// sbg global, karena main.js/vars.js pakai `LZString.compressToUTF16` dkk
// buat baca/tulis save. ---
{
    const lzSrc = readFileSync(join(repoRoot, 'lib/lz-string.min.js'), 'utf8');
    const LZString = new Function(`${lzSrc}\nreturn LZString;`)();
    global.LZString = LZString;
    window.LZString = LZString;
}

console.log('[env-setup] jsdom + jquery + Vue stub siap.');

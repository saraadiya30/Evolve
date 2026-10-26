// Profil render tab Misc > stocks dengan Vue + Buefy ASLI (di jsdom; angka mutlak lebih lambat dari browser, bandingkan SEBELUM vs SESUDAH).
// Pakai: node test/launch.cjs test/diagnostics/profile-stock-ui.mjs [fixture=user-save-1] [ticks=60] [vueDir] [buefyDir]
// Argumen 5 = 'cpu' -> tambah profil CPU (self time per fungsi) untuk loop render (a).
// VUE_BUILD=dev memakai build dev Vue (nama fungsi terbaca, tapi lebih lambat dari prod).
// Butuh vue@2.7.14 dan buefy@0.9.22 (npm install di folder sementara, lalu kasih path node_modules-nya sebagai argumen 3 dan 4).
import '../env-setup.mjs';
import { seedMathRandom, setFixedNow } from '../env-setup.mjs';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const [fx = 'user-save-1', nArg = '60', vueDir = '/tmp/bench/node_modules/vue', buefyDir = '/tmp/bench/node_modules/buefy', mode = ''] = process.argv.slice(2);
const N = parseInt(nArg, 10);
seedMathRandom(12345); setFixedNow(1735689600000);
globalThis.localStorage.setItem('evolved', JSON.parse(readFileSync(join(__dirname, '..', 'fixtures', fx + '.json'), 'utf8')).save);
const { global: G } = await import('../../src/core/vars.js');
const { execGameLoops } = await import('../../src/main.js');
seedMathRandom(12345); setFixedNow(1735689600000);
execGameLoops(5);

// Vue asli + Buefy dipasang SETELAH game selesai load (selama load Vue masih stub dari env-setup)
const req = createRequire(import.meta.url);
const RealVue = req(join(vueDir, 'dist/vue.common.' + (process.env.VUE_BUILD || 'prod') + '.js'));
globalThis.Vue = RealVue; window.Vue = RealVue;
RealVue.config.productionTip = false; RealVue.config.devtools = false;
RealVue.use(req(join(buefyDir, 'dist/cjs/index.js')).default || req(join(buefyDir, 'dist/cjs/index.js')));

const { initStocks, liveStockDefs, listed, drawStocks, stockTick } = await import('../../src/stocks/stocks.js');
// Semua resource dianggap sudah terbuka, supaya list stock sepanjang mungkin
Object.keys(G.resource).forEach(r => { if (G.resource[r]) G.resource[r].display = true; });
initStocks();
// LIST_MAX=n -> batasi jumlah stock yang terdaftar (resource sisanya disembunyikan) untuk melihat biaya render vs panjang list
if (process.env.LIST_MAX){
    liveStockDefs().filter(listed).slice(parseInt(process.env.LIST_MAX, 10)).forEach(d => { if (G.resource[d.res]) G.resource[d.res].display = false; });
}
// OCOIN=1e15 -> saldo Ocoin besar: sweep "maxBuyLots" harus jalan melewati seluruh sisi ask (kasus pemain kaya)
if (process.env.OCOIN){ G.stocks.ocoin = parseFloat(process.env.OCOIN); }
const listedCount = liveStockDefs().filter(listed).length;
$('body').append('<div id="miscNew"></div>');
const flush = () => new Promise(res => RealVue.nextTick(res));
const ms = (t0) => Number(process.hrtime.bigint() - t0) / 1e6;

// Baseline: loop game TANPA panel stocks (global.stocks masih objek polos, belum diobservasi Vue)
let baseLoop = 0;
for (let i = 0; i < 40; i++){ const a = process.hrtime.bigint(); execGameLoops(1); baseLoop += ms(a); }
console.log(`(0) loop game tanpa panel: ${(baseLoop / 40).toFixed(2)} ms per fast tick`);
let t0 = process.hrtime.bigint();
drawStocks();
await flush();
const tDraw = ms(t0);
const rows = document.querySelectorAll('#stockExchange .stk-item').length;
console.log(`stock terdaftar=${listedCount} baris watchlist=${rows} elemen DOM panel=${document.querySelectorAll('#stockExchange *').length}`);
console.log(`gambar pertama (drawStocks + render): ${tDraw.toFixed(0)} ms`);

{
    // Dari mana biaya satu render: bikin vnode (render function + method di template) vs patch DOM vs jumlah dependensi
    const vm = document.querySelector('#stockExchange').__vue__;
    const kids = []; (function walk(v){ v.$children.forEach(c => { kids.push(c); walk(c); }); })(vm);
    const byName = {}; kids.forEach(c => { const n = c.$options.name || c.$options._componentTag || '?'; byName[n] = (byName[n] || 0) + 1; });
    console.log(`dependensi watcher render=${vm._watcher.deps.length} komponen anak=${kids.length}`, JSON.stringify(byName));
    let tr = 0, tp = 0; const R = 80;
    for (let i = 0; i < R; i++){
        let a = process.hrtime.bigint(); const vn = vm._render(); tr += ms(a);
        a = process.hrtime.bigint(); vm._update(vn); tp += ms(a);
    }
    console.log(`render function (bikin vnode): ${(tr / R).toFixed(2)} ms   patch DOM: ${(tp / R).toFixed(2)} ms`);
}
// Berapa banyak tulisan DOM (mutation) per render: di browser inilah yang memicu layout/paint, jsdom tidak mengukurnya.
const mutations = { n: 0, byKind: {}, byEl: {} };
const mo = new window.MutationObserver(list => list.forEach(r => {
    mutations.n++;
    mutations.byKind[r.type + (r.attributeName ? ':' + r.attributeName : '')] = (mutations.byKind[r.type + (r.attributeName ? ':' + r.attributeName : '')] || 0) + 1;
    const el = r.target.nodeType === 1 ? r.target : r.target.parentElement;
    const k = el ? (el.className && typeof el.className === 'string' ? el.tagName.toLowerCase() + '.' + el.className.split(' ')[0] : el.tagName.toLowerCase()) : '?';
    mutations.byEl[k] = (mutations.byEl[k] || 0) + 1;
}));
mo.observe(document.querySelector('#stockExchange'), { subtree: true, childList: true, attributes: true, characterData: true });
const mutReport = async (label, fn, R) => {
    mutations.n = 0; mutations.byKind = {}; mutations.byEl = {};
    for (let i = 0; i < R; i++){ fn(i); await flush(); await Promise.resolve(); }
    await new Promise(res => setTimeout(res, 0));
    const top = o => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k}=${(v / R).toFixed(1)}`).join(' ');
    console.log(`${label}: ${(mutations.n / R).toFixed(1)} tulisan DOM per render | jenis: ${top(mutations.byKind)} | elemen: ${top(mutations.byEl)}`);
};
await mutReport('DOM (a) Money berubah', i => { G.resource.Money.amount += 1 + i; }, 30);
await mutReport('DOM (b) tick market   ', () => { stockTick(); }, 30);
{
    // Loop game ASLI dengan panel terbuka: berapa kali panel di-render dan `list` dihitung ulang per fast tick
    const vm = document.querySelector('#stockExchange').__vue__;
    let renders = 0, listRuns = 0;
    const w = vm._watcher, origRun = w.run.bind(w);
    w.run = function(){ renders++; return origRun(); };
    const cw = vm._computedWatchers && vm._computedWatchers.list;
    if (cw){ const o = cw.evaluate.bind(cw); cw.evaluate = function(){ listRuns++; return o(); }; }
    const R = 40; let tLoop = 0, tFlush = 0;
    for (let i = 0; i < R; i++){
        let a = process.hrtime.bigint(); execGameLoops(1); tLoop += ms(a);
        a = process.hrtime.bigint(); await flush(); tFlush += ms(a);
    }
    console.log(`(c) loop game asli + panel terbuka: loop=${(tLoop / R).toFixed(2)} ms  flush UI=${(tFlush / R).toFixed(2)} ms  render panel=${(renders / R).toFixed(2)}x  list dihitung=${(listRuns / R).toFixed(2)}x per fast tick`);
}
{
    // Klik baris watchlist (select) dan biaya computed `d` / `c`: ini jalur yang dipakai saat pindah stock
    const vm = document.querySelector('#stockExchange').__vue__;
    const defs = liveStockDefs().filter(listed).map(d => d.res);
    const dirty = name => { const w = vm._computedWatchers[name]; const a = process.hrtime.bigint(); w.dirty = true; const v = vm[name]; return [ms(a), v]; };
    let tD = 0, tC = 0, nn = 0;
    for (let i = 0; i < 30; i++){ tD += dirty('d')[0]; tC += dirty('c')[0]; nn++; }
    console.log(`computed d (depth/quote/maxBuy) = ${(tD / nn).toFixed(2)} ms   c (chart) = ${(tC / nn).toFixed(2)} ms per hitung`);
    let tSel = 0, tSelRender = 0, worst = 0, worstRes = '';
    for (const r of defs){
        let a = process.hrtime.bigint(); vm.select(r); const t1 = ms(a);
        a = process.hrtime.bigint(); await flush(); const t2 = ms(a);
        tSel += t1; tSelRender += t2; if (t1 + t2 > worst){ worst = t1 + t2; worstRes = r; }
    }
    console.log(`(d) klik stock: select()=${(tSel / defs.length).toFixed(2)} ms  render sesudahnya=${(tSelRender / defs.length).toFixed(2)} ms  (terburuk ${worst.toFixed(1)} ms di ${worstRes})`);
}
let session = null;
if (mode === 'tick'){
    // Profil CPU hanya untuk stockTick() (dipanggil sekali per hari game)
    const inspector = (await import('node:inspector')).default;
    const ses = new inspector.Session(); ses.connect();
    const p2 = (m, q) => new Promise((res, rej) => ses.post(m, q, (e, r) => e ? rej(e) : res(r)));
    await p2('Profiler.enable'); await p2('Profiler.setSamplingInterval', { interval: 100 }); await p2('Profiler.start');
    const t1 = process.hrtime.bigint();
    for (let i = 0; i < 300; i++){ stockTick(); if (i % 10 === 0) await flush(); }
    const total1 = ms(t1);
    const { profile } = await p2('Profiler.stop');
    const nodes = new Map(profile.nodes.map(n => [n.id, n]));
    const byFn = new Map(); let total = 0;
    profile.samples.forEach((id, i) => { const us = profile.timeDeltas[i] || 0; total += us; const cf = nodes.get(id).callFrame; const file = (cf.url || '').replace(/^.*\/(src|node_modules)\//, '$1/'); const k = `${cf.functionName || '(anonim)'}  ${file}:${cf.lineNumber + 1}`; byFn.set(k, (byFn.get(k) || 0) + us); });
    console.log(`stockTick x300 = ${(total1 / 300).toFixed(2)} ms per tick, ${listedCount} stock`);
    [...byFn].sort((a, b) => b[1] - a[1]).slice(0, 16).forEach(([k, us]) => console.log(`${(100 * us / total).toFixed(1).padStart(5)}% ${(us / 1000).toFixed(0).padStart(6)}ms  ${k}`));
    process.exit(0);
}
const post = (m, p) => new Promise((res, rej) => session.post(m, p, (e, r) => e ? rej(e) : res(r)));
if (mode === 'cpu'){
    const inspector = (await import('node:inspector')).default;
    session = new inspector.Session(); session.connect();
    await post('Profiler.enable'); await post('Profiler.setSamplingInterval', { interval: 100 }); await post('Profiler.start');
}
// (a) render ulang karena Money berubah (terjadi tiap fast tick ~4x/detik): harga stock tidak berubah
let tA = 0;
for (let i = 0; i < N; i++){
    G.resource.Money.amount += 1 + i;
    t0 = process.hrtime.bigint();
    await flush();
    tA += ms(t0);
}
// (b) satu tick market + render
let tB = 0, tTick = 0;
for (let i = 0; i < N; i++){
    t0 = process.hrtime.bigint();
    stockTick();
    tTick += ms(t0);
    t0 = process.hrtime.bigint();
    await flush();
    tB += ms(t0);
}
if (session){
    const { profile } = await post('Profiler.stop');
    const nodes = new Map(profile.nodes.map(n => [n.id, n]));
    const self = new Map(); let total = 0;
    profile.samples.forEach((id, i) => { const us = profile.timeDeltas[i] || 0; self.set(id, (self.get(id) || 0) + us); total += us; });
    const byFn = new Map();
    for (const [id, us] of self){ const cf = nodes.get(id).callFrame; const file = (cf.url || '').replace(/^.*\/(src|node_modules)\//, '$1/'); const k = `${cf.functionName || '(anonim)'}  ${file}:${cf.lineNumber + 1}`; byFn.set(k, (byFn.get(k) || 0) + us); }
    console.log('\nProfil CPU (seluruh run, self time):');
    [...byFn].sort((a, b) => b[1] - a[1]).slice(0, 22).forEach(([k, us]) => console.log(`${(100 * us / total).toFixed(1).padStart(5)}% ${(us / 1000).toFixed(0).padStart(6)}ms  ${k}`));
}
console.log(`(a) render karena Money berubah : ${(tA / N).toFixed(2)} ms per render`);
console.log(`(b) stockTick() logika          : ${(tTick / N).toFixed(2)} ms per tick`);
console.log(`(b) render sesudah tick market  : ${(tB / N).toFixed(2)} ms per render`);
process.exit(0);

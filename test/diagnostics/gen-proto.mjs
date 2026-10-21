// PROTOTIPE generator state acak (rebuild Fase 0). Belum masuk `npm test`.
// Pakai:  node test/diagnostics/gen-proto.mjs            (jalankan semua kasus, ringkasan di akhir)
//         node test/diagnostics/gen-proto.mjs --case '<json>'   (satu kasus, dipakai internal)
// Satu kasus = satu proses (vars.js memuat save saat import, jadi tidak bisa di-reload di proses yang sama).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);

function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

async function runCase(c) {
    const env = await import('../env-setup.mjs');
    const out = { name: c.name, spec: c.mut || {}, ok: false };
    try {
        if (c.base === 'fixture') {
            let raw = JSON.parse(readFileSync(`test/fixtures/${c.fixture}.json`, 'utf8')).save;
            const obj = JSON.parse(globalThis.LZString.decompressFromUTF16(raw));
            const rnd = mulberry32(c.seed || 1);
            const m = c.mut || {};
            if (m.universe) obj.race.universe = m.universe;
            if (m.govern) obj.civic.govern.type = m.govern;
            if (m.prestige) {
                obj.prestige.Plasmid.count = Math.floor(rnd() * 20000);
                obj.prestige.Phage.count = Math.floor(rnd() * 500);
                obj.prestige.Dark.count = rnd() * 10;
            }
            if (m.genes) for (const k of Object.keys(obj.genes)) if (typeof obj.genes[k] === 'number') obj.genes[k] = Math.floor(rnd() * (obj.genes[k] + 1));
            if (m.resources) for (const k of Object.keys(obj.resource)) {
                const r = obj.resource[k];
                if (r && typeof r.max === 'number' && r.max > 0 && typeof r.amount === 'number') r.amount = rnd() * r.max;
            }
            globalThis.localStorage.setItem('evolved', globalThis.LZString.compressToUTF16(JSON.stringify(obj)));
        }
        env.seedMathRandom(12345); env.setFixedNow(1735689600000);
        const { global: G, tmp_vars } = await import('../../src/core/vars.js');
        const { execGameLoops } = await import('../../src/main.js');
        const { hooks } = await import('../../src/core/registries.js');
        env.seedMathRandom(12345); env.setFixedNow(1735689600000);

        const bad = (v) => typeof v === 'number' && !Number.isFinite(v);
        const scan = (o, p, acc, seen = new WeakSet(), d = 0) => {
            if (o === null || typeof o !== 'object' || d > 12 || seen.has(o)) return;
            seen.add(o);
            for (const k of Object.keys(o)) { const v = o[k]; if (bad(v)) acc.push(`${p}.${k}=${v}`); else scan(v, `${p}.${k}`, acc, seen, d + 1); }
        };
        const nan = () => { const a = []; scan(G, 'global', a); scan(tmp_vars, 'tmp', a); return a; };

        if (c.mut && c.mut.species) { G.race.species = c.mut.species; hooks.sentience(); out.sentience = 'dipanggil'; }
        if (c.mut && c.mut.populate) {
            const P = c.mut.populate;
            const { actions } = await import('../../src/core/registries.js');
            const { checkTechRequirements } = await import('../../src/actions/challenge/tech_requirements.js');
            const { checkCityRequirements } = await import('../../src/actions/challenge/requirements.js');
            const { initStruct } = await import('../../src/actions/core/structure_ui.js');
            const rnd2 = mulberry32(P.seed || 1);
            // checkCosts juga menolak biaya > max storage, jadi max dinaikkan sementara lalu dipulihkan.
            const maxSave = {}; for (const k of Object.keys(G.resource)) maxSave[k] = G.resource[k] && G.resource[k].max;
            const bigAll = () => { for (const k of Object.keys(G.resource)) { const r = G.resource[k]; if (r && typeof r.amount === 'number') { r.amount = 1e18; if (typeof r.max === 'number' && r.max >= 0) r.max = 1e18; } } };
            const bad = new Set(); let got = 0;
            for (let i = 0; i < P.steps; i++) {
                const cands = Object.keys(actions.tech).filter((t) => { if (bad.has(t)) return false; try { const a = actions.tech[t]; return checkTechRequirements(t, false) === 'ok' && (!a.condition || a.condition()); } catch (e) { return false; } });
                if (!cands.length) break;
                const t = cands[Math.floor(rnd2() * cands.length)];
                bigAll();
                let ok = false;
                try { ok = actions.tech[t].action({ isQueue: false }); } catch (e) { ok = false; }
                if (ok) { const g = actions.tech[t].grant; G.tech[g[0]] = g[1]; got++; } else bad.add(t);
            }
            for (const k of Object.keys(maxSave)) if (G.resource[k] && typeof maxSave[k] === 'number') G.resource[k].max = maxSave[k];
            let built = 0;
            for (const name of Object.keys(actions.city)) {
                const a = actions.city[name];
                try {
                    if (!a.struct || !a.reqs || !checkCityRequirements(name)) continue;
                    initStruct(a);
                    const st = G.city[name];
                    if (!st || typeof st.count !== 'number') continue;
                    const n = Math.floor(Math.pow(rnd2(), 2) * (P.maxBuild || 25));
                    st.count = n; if ('on' in st) st.on = Math.floor(rnd2() * (n + 1));
                    if (n > 0) built++;
                } catch (e) { /* struktur yang tidak bisa diinisialisasi dilewati */ }
            }
            const sp = G.race.species; const pop = 20 + Math.floor(rnd2() * 280);
            if (G.resource[sp]) { G.resource[sp].amount = pop; G.resource[sp].max = pop + 20; G.resource[sp].display = true; }
            const jobs = Object.keys(G.civic).filter((k) => G.civic[k] && typeof G.civic[k] === 'object' && G.civic[k].job && G.civic[k].display && k !== 'unemployed');
            let left = pop;
            for (const j of jobs) { const w = Math.floor(rnd2() * Math.min(left, 30)); G.civic[j].workers = w; G.civic[j].assigned = w; left -= w; }
            if (G.civic.unemployed) G.civic.unemployed.workers = left;
            for (const k of Object.keys(G.resource)) { const r = G.resource[k]; if (r && typeof r.amount === 'number' && k !== sp) r.amount = r.max > 0 ? rnd2() * r.max : 0; }
            const miss = {}; const notOk = [];
            for (const t of Object.keys(actions.tech)) {
                const a = actions.tech[t]; const g = a.grant;
                if (!g || (G.tech[g[0]] || 0) >= g[1]) continue;
                const ms = Object.entries(a.reqs || {}).filter(([k, v]) => (G.tech[k] || 0) < v);
                if (ms.length === 0) { let cond = 'n/a'; try { cond = a.condition ? a.condition() : true; } catch (e) { cond = 'throw'; } notOk.push(`${t}:cond=${cond}${bad.has(t) ? ':GAGAL-action' : ''}`); }
                else if (ms.length === 1) { const key = ms[0][0] + '>=' + ms[0][1]; miss[key] = (miss[key] || 0) + 1; }
            }
            out.debug = { reqsTerpenuhiTapiBelumDiambil: notOk.slice(0, 12), jumlah: notOk.length, kurangSatuReq: Object.entries(miss).sort((a, b) => b[1] - a[1]).slice(0, 8) };
            out.pop = { techs: got, blacklisted: bad.size, built, jobsShown: jobs.length, pop, techKeys: Object.keys(G.tech).length };
        }
        if (process.env.GEN_EXPORT_DIR) { // ekspor state sebelum tick, format sama dengan fixture ({save: LZString UTF16})
            mkdirSync(process.env.GEN_EXPORT_DIR, { recursive: true });
            writeFileSync(`${process.env.GEN_EXPORT_DIR}/${c.name}.json`, JSON.stringify({ save: globalThis.LZString.compressToUTF16(JSON.stringify(G)) }));
        }
        out.nanBefore = nan().length;
        for (let i = 0; i < (c.ticks || 20); i++) execGameLoops(1);
        const after = nan();
        out.nanAfter = after.length; out.nanSample = after.slice(0, 3);
        out.species = G.race.species; out.universe = G.race.universe; out.gov = G.civic.govern && G.civic.govern.type;
        out.traits = Object.keys(G.race).length;
        out.producing = Object.keys(G.resource).filter((k) => G.resource[k] && typeof G.resource[k].diff === 'number' && G.resource[k].diff !== 0).length;
        { // snapshot breakdown untuk analisis oracle (lihat notes/PARITY.md)
            const { breakdown } = await import('../../src/core/vars.js');
            const snap = { name: c.name, resources: {}, p: JSON.parse(JSON.stringify(breakdown.p)), c: JSON.parse(JSON.stringify(breakdown.c)) };
            for (const k of Object.keys(G.resource)) { const r = G.resource[k]; if (r && typeof r.amount === 'number') snap.resources[k] = { amount: r.amount, max: r.max, diff: r.diff, delta: r.delta, display: r.display }; }
            out.snap = snap;
        }
        out.res = {};
        for (const r of ['Food', 'Lumber', 'Stone', 'Money', 'Knowledge']) { const x = G.resource[r]; if (x) out.res[r] = { amt: +x.amount.toFixed(2), max: x.max, diff: x.diff }; }
        out.ok = true;
    } catch (e) { out.error = String(e && e.message || e).split('\n')[0].slice(0, 160); }
    console.log('RESULT:' + JSON.stringify(out));
    process.exit(0);
}

if (process.argv[2] === '--case') {
    await runCase(JSON.parse(process.argv[3]));
} else {
    const F = 'user-save-1';
    const cases = [
        { name: 'control', base: 'fixture', fixture: F },
        { name: 'resources', base: 'fixture', fixture: F, seed: 7, mut: { resources: true } },
        ...['standard', 'heavy', 'antimatter', 'evil', 'micro', 'magic'].map((u) => ({ name: 'uni_' + u, base: 'fixture', fixture: F, mut: { universe: u } })),
        ...['anarchy', 'theocracy', 'socialist', 'technocracy', 'magocracy'].map((g) => ({ name: 'gov_' + g, base: 'fixture', fixture: F, mut: { govern: g } })),
        { name: 'prestige_genes', base: 'fixture', fixture: F, seed: 3, mut: { prestige: true, genes: true } },
        { name: 'combo', base: 'fixture', fixture: F, seed: 11, mut: { resources: true, universe: 'evil', govern: 'socialist', prestige: true } },
        { name: 'fresh_control', base: 'fresh' },
        ...['human', 'orc', 'elven', 'kobold', 'antid'].map((s) => ({ name: 'species_' + s, base: 'fresh', mut: { species: s } })),
    ];
    const steps = [30, 80, 150];
    for (const sp of ['human', 'orc', 'elven', 'kobold', 'antid']) for (let k = 0; k < 3; k++) cases.push({ name: `pop_${sp}_${k + 1}`, base: 'fresh', mut: { species: sp, populate: { seed: k + 1, steps: steps[k], maxBuild: 25 } } });
    const only = process.argv[2] === '--only' ? process.argv[3] : null;
    const rows = [];
    for (const c of cases.filter((x) => !only || x.name.startsWith(only))) {
        const t0 = Date.now();
        const r = spawnSync(process.execPath, [SELF, '--case', JSON.stringify(c)], { encoding: 'utf8', timeout: 150000, cwd: process.cwd() });
        const line = (r.stdout || '').split('\n').find((l) => l.startsWith('RESULT:'));
        const res = line ? JSON.parse(line.slice(7)) : { name: c.name, ok: false, error: 'tidak ada RESULT (' + (r.signal || 'exit ' + r.status) + ') ' + (r.stderr || '').split('\n').filter(Boolean).slice(-1)[0] };
        res.sec = +((Date.now() - t0) / 1000).toFixed(1);
        rows.push(res);
        console.log(`${res.ok ? 'OK  ' : 'GAGAL'} ${c.name.padEnd(16)} nan:${res.nanBefore ?? '-'}->${res.nanAfter ?? '-'} ${res.species || ''} ${res.universe || ''} ${res.gov || ''} traits=${res.traits ?? '-'} ${res.pop ? 'tech=' + res.pop.techs + '/' + res.pop.techKeys + ' bangunan=' + res.pop.built + ' job=' + res.pop.jobsShown + ' pop=' + res.pop.pop + ' produksi=' + res.producing : ''} ${res.error ? 'ERR: ' + res.error : ''} (${res.sec}s)`);
    }
    writeFileSync('/tmp/gen_bd.json', JSON.stringify({ steps: rows.filter((r) => r.snap).map((r) => r.snap) }));
    for (const r of rows) delete r.snap;
    writeFileSync('/tmp/gen_results.json', JSON.stringify(rows, null, 1));
    console.log('\nJSON_RINGKAS:' + JSON.stringify(rows.map((r) => ({ n: r.name, ok: r.ok, nanA: r.nanAfter, err: r.error }))));
}

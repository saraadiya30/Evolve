// PROTOTIPE generator state acak (rebuild Fase 0). Belum masuk `npm test`.
// Pakai:  node test/diagnostics/gen-proto.mjs            (jalankan semua kasus, ringkasan di akhir)
//         node test/diagnostics/gen-proto.mjs --case '<json>'   (satu kasus, dipakai internal)
// Satu kasus = satu proses (vars.js memuat save saat import, jadi tidak bisa di-reload di proses yang sama).
import { readFileSync, writeFileSync } from 'node:fs';
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
        out.nanBefore = nan().length;
        for (let i = 0; i < (c.ticks || 20); i++) execGameLoops(1);
        const after = nan();
        out.nanAfter = after.length; out.nanSample = after.slice(0, 3);
        out.species = G.race.species; out.universe = G.race.universe; out.gov = G.civic.govern && G.civic.govern.type;
        out.traits = Object.keys(G.race).length;
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
    const rows = [];
    for (const c of cases) {
        const t0 = Date.now();
        const r = spawnSync(process.execPath, [SELF, '--case', JSON.stringify(c)], { encoding: 'utf8', timeout: 150000, cwd: process.cwd() });
        const line = (r.stdout || '').split('\n').find((l) => l.startsWith('RESULT:'));
        const res = line ? JSON.parse(line.slice(7)) : { name: c.name, ok: false, error: 'tidak ada RESULT (' + (r.signal || 'exit ' + r.status) + ') ' + (r.stderr || '').split('\n').filter(Boolean).slice(-1)[0] };
        res.sec = +((Date.now() - t0) / 1000).toFixed(1);
        rows.push(res);
        console.log(`${res.ok ? 'OK  ' : 'GAGAL'} ${c.name.padEnd(16)} nan:${res.nanBefore ?? '-'}->${res.nanAfter ?? '-'} ${res.species || ''} ${res.universe || ''} ${res.gov || ''} traits=${res.traits ?? '-'} ${res.error ? 'ERR: ' + res.error : ''} (${res.sec}s)`);
    }
    writeFileSync('/tmp/gen_results.json', JSON.stringify(rows, null, 1));
    console.log('\nJSON_RINGKAS:' + JSON.stringify(rows.map((r) => ({ n: r.name, ok: r.ok, nanA: r.nanAfter, err: r.error }))));
}

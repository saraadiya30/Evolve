// Gene Lab (desain race custom saat Ascension): batas genes bisa dibeli pakai Aether (1 Aether = 10 genes).
// Cek: (1) skor genome ikut bertambah sebesar aetherGenes dan tidak ikut di wiki, (2) genes bonus ikut dihitung untuk bonus untapped,
// (3) skenario "kebanyakan trait": semua trait major sekaligus (genes dibeli sampai skor 0) tetap bisa dibuat jadi race dan game jalan tanpa error/NaN.
// Pakai: node test/lab-aether-genes.mjs
import './env-setup.mjs';
import { seedMathRandom, setFixedNow } from './env-setup.mjs';

let ok = true;
const check = (label, cond, extra = '') => {
    console.log(`${cond ? 'OK    ' : 'GAGAL '} ${label}${extra ? ' ' + extra : ''}`);
    ok = ok && cond;
};

seedMathRandom(12345);
setFixedNow(1735689600000);

const { global: G } = await import('../src/core/vars.js');
const { traits, races } = await import('../src/core/registries.js');
const { calcGenomeScore } = await import('../src/functions/run_stats_helpers.js');
const { AETHER_GENES_RATE } = await import('../src/config/constants.js');
const { execGameLoops } = await import('../src/main.js');
const { customRace } = await import('../src/races/trait_logic/racial_traits.js');
const { sentience } = await import('../src/actions/evolution/sentience_stage.js');

check('rate 1 Aether = 10 genes', AETHER_GENES_RATE === 10);

// (1) skor genome
const base = () => ({ genus: 'humanoid', traitlist: [], ranks: {} });
const s0 = calcGenomeScore(base(), false);
const s1 = calcGenomeScore({ ...base(), aetherGenes: 10 }, false);
const s5 = calcGenomeScore({ ...base(), aetherGenes: 50 }, false);
check('aetherGenes 10 menambah skor 10', s1 - s0 === 10, `(${s0} -> ${s1})`);
check('aetherGenes 50 menambah skor 50', s5 - s0 === 50);
check('aetherGenes 0 / undefined / negatif / NaN tidak mengubah skor',
    calcGenomeScore({ ...base(), aetherGenes: 0 }, false) === s0
    && calcGenomeScore({ ...base(), aetherGenes: undefined }, false) === s0
    && calcGenomeScore({ ...base(), aetherGenes: -5 }, false) === s0
    && calcGenomeScore({ ...base(), aetherGenes: NaN }, false) === s0);
const wikiVars = { ascended: { standard: 0 }, technophobe: 0 };
check('di wiki aetherGenes diabaikan', calcGenomeScore({ ...base(), aetherGenes: 100 }, wikiVars) === calcGenomeScore(base(), wikiVars));

// (2) semua trait major sekaligus (kecuali yang memang tidak boleh bareng di lab: catnip/anise, deconstructor/imitation)
const skip = new Set(['anise', 'deconstructor', 'imitation']);
const all = Object.keys(traits).filter(t => traits[t].type === 'major' && !skip.has(t));
const genome = { genus: 'humanoid', traitlist: all, ranks: {} };
const deficit = -calcGenomeScore(genome, false);
console.log(`       jumlah trait major = ${all.length}, kekurangan genes = ${deficit}`);
check('semua trait sekaligus tidak muat tanpa Aether (skor negatif)', deficit > 0);
const needAether = Math.ceil(deficit / AETHER_GENES_RATE);
genome.aetherGenes = needAether * AETHER_GENES_RATE;
check('setelah beli Aether secukupnya skor >= 0', calcGenomeScore(genome, false) >= 0, `(${needAether} Aether)`);
genome.aetherGenes -= AETHER_GENES_RATE;
check('kurang 1 Aether skor kembali negatif (tidak beli berlebihan)', calcGenomeScore(genome, false) < 0);
genome.aetherGenes += AETHER_GENES_RATE;

// (3) jadikan race, lewati sentience, lalu jalankan game
G.custom = {
    race0: {
        name: 'Overflow', desc: 'x', entity: 'x', home: 'x', red: 'x', hell: 'x', gas: 'x', gas_moon: 'x', dwarf: 'x',
        titan: 'x', enceladus: 'x', triton: 'x', eris: 'x',
        genus: 'humanoid', traits: all.slice(), fanaticism: false, ranks: {}, aetherGenes: genome.aetherGenes
    }
};
races.custom = customRace(false);
G.race.species = 'custom';
const errors = [];
const origError = console.error;
// window.location.reload() bawaan game (sentience_parts) tidak bisa dijalankan jsdom -> bukan error fitur
console.error = (...a) => { const m = a.join(' '); if (!m.includes('Not implemented: navigation')){ errors.push(m); } };
let threw = null;
try {
    sentience();
    execGameLoops(300);
}
catch (e) {
    threw = e;
}
console.error = origError;
check('sentience + 300 periode dengan semua trait tidak melempar error', threw === null, threw ? String(threw.stack || threw).split('\n').slice(0, 4).join(' | ') : '');
check('console.error kosong', errors.length === 0, errors[0] || '');
check('untapped dihitung dari genes sisa (bonus tetap jalan)', typeof G.race.untapped === 'number' && G.race.untapped >= 0, `(untapped=${G.race.untapped})`);

const bad = [];
const scan = (o, path, depth) => {
    if (depth > 4 || !o || typeof o !== 'object') { return; }
    for (const k of Object.keys(o)) {
        const v = o[k];
        if (typeof v === 'number' && !Number.isFinite(v)) { bad.push(`${path}.${k}=${v}`); }
        else if (typeof v === 'object') { scan(v, `${path}.${k}`, depth + 1); }
    }
};
['resource', 'city', 'civic', 'race'].forEach(k => scan(G[k], k, 0));
check('tidak ada NaN/Infinity di resource/city/civic/race', bad.length === 0, bad.slice(0, 5).join(', '));

console.log(ok ? 'SEMUA OK' : 'ADA YANG GAGAL');
process.exit(ok ? 0 : 1);

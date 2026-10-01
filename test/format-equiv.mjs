// sizeApproximation memakai cache Intl.NumberFormat. Tes ini memastikan hasilnya IDENTIK dengan implementasi aslinya
// (value.toLocaleString(undefined, opsi) di setiap panggilan) untuk ratusan ribu nilai acak, presisi, dan mode affix.
import './env-setup.mjs';
await import('../src/main.js');
const { sizeApproximation, global, affix_list } = await import('../src/core/vars.js');

const ADD_16_ULP = 1 + (16 * Number.EPSILON);
const numFormatShort = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2, maximumSignificantDigits: 3, roundingMode: 'trunc', roundingPriority: 'lessPrecision' });
const numFormatLong = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2, maximumSignificantDigits: 4, roundingMode: 'trunc', roundingPriority: 'lessPrecision' });
// Referensi: salinan logika asli dengan toLocaleString langsung (tanpa cache).
let CLAMP = false;
function reference(value, precision = 1, precise = false, exact = false) {
    let absValue = Math.abs(value);
    let oom = Math.floor(Math.log10(absValue));
    absValue *= ADD_16_ULP;
    value = value < 0 ? -absValue : value > 0 ? absValue : value;
    if (exact) return value.toLocaleString(undefined, { maximumFractionDigits: precision, roundingMode: 'trunc' });
    else if (oom < 4 || precise) {
        let maxSigFigs = Math.max(oom + 1, precision + 1, 5);
        if (CLAMP) maxSigFigs = Math.min(maxSigFigs, 21);
        return value.toLocaleString(undefined, { maximumSignificantDigits: maxSigFigs, maximumFractionDigits: precision, roundingMode: 'trunc', roundingPriority: 'lessPrecision' });
    } else {
        const oomMod3 = oom % 3;
        const dispShort = oom === 4;
        const forceExponent = global.settings.affix !== 'eng' && oom >= 27;
        if (global.settings.affix !== 'sci' && !forceExponent) oom -= oomMod3;
        let affix;
        if (global.settings.affix === 'sci' || global.settings.affix === 'eng' || forceExponent) affix = 'e' + oom;
        else affix = affix_list[global.settings.affix][(oom / 3) - 1];
        value /= (10 ** oom);
        return (dispShort ? numFormatShort : numFormatLong).format(value) + affix;
    }
}
let seed = 987654321;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const samples = [0, 1, -1, 0.5, 9999.999, 10000, 99999, 1e5, 123456789, 1e12, 1e27, 1e33, -1234.567, 3.999999999999, 1e-7];
for (let i = 0; i < 4000; i++) samples.push((rnd() < 0.5 ? -1 : 1) * rnd() * 10 ** Math.floor(rnd() * 36 - 4));
const affixModes = Object.keys(affix_list).concat(['sci', 'eng']);
let bad = 0, n = 0, thrown = 0;
for (const mode of affixModes) {
    global.settings.affix = mode;
    for (const v of samples) for (const prec of [0, 1, 2, 3, 5]) for (const [precise, exact] of [[false, false], [true, false], [false, true]]) {
        n++;
        // Referensi asli melempar RangeError untuk mode precise pada nilai > 1e21 (batas 21 digit signifikan Intl). Perbaikannya
        // membatasi ke 21 digit: di kasus itu hasilnya harus sama dengan referensi yang dibatasi 21, dan tidak boleh melempar.
        const run = (f) => { try { return 'ok:' + f(v, prec, precise, exact); } catch (e) { return 'throw:' + e.constructor.name; } };
        CLAMP = false;
        const orig = run(reference);
        const a = run(sizeApproximation);
        let b = orig;
        if (orig.startsWith('throw:RangeError')) { thrown++; CLAMP = true; b = run(reference); CLAMP = false; }
        if (a.startsWith('throw')) { if (a !== b) { if (bad++ < 5) console.log(`BEDA(throw) v=${v}: ${a} vs ${b}`); } continue; }
        if (a !== b) { if (bad++ < 5) console.log(`BEDA mode=${mode} v=${v} prec=${prec} precise=${precise} exact=${exact}: ${a} vs ${b}`); }
    }
}
console.log(bad ? `FORMAT BEDA: ${bad} dari ${n}` : `FORMAT IDENTIK (${n} kombinasi: ${samples.length} nilai x ${affixModes.length} mode affix x 5 presisi x 3 mode; ${thrown} di antaranya dulu melempar RangeError dan sekarang dibatasi 21 digit)`);
process.exit(bad ? 1 : 0);

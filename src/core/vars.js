import { applySaveDefaults1 } from './save_defaults/save_defaults_1.js';
import { applySaveDefaults2 } from './save_defaults/save_defaults_2.js';
import { applySaveDefaults3 } from './save_defaults/save_defaults_3.js';
import { applySaveDefaults4 } from './save_defaults/save_defaults_4.js';
import { applySaveDefaults5 } from './save_defaults/save_defaults_5.js';
import { applySaveDefaults6 } from './save_defaults/save_defaults_6.js';
import { applySaveDefaults7 } from './save_defaults/save_defaults_7.js';
import { applySaveDefaults8 } from './save_defaults/save_defaults_8.js';
export let save = window.localStorage;
export let global = {
    seed: 1,
    warseed: 1,
    resource: {},
    evolution: {},
    tech: {},
    city: {},
    space: {},
    interstellar: {},
    portal: {},
    eden: {},
    tauceti: {},
    civic: {},
    race: {},
    genes: {},
    blood: {},
    stats: {
        start: Date.now(),
        days: 0,
        tdays: 0
    },
    event: {
        t: 200,
        l: false
    },
    m_event: {
        t: 499,
        l: false
    }
};
export let tmp_vars = {};
export let breakdown = {
    c: {},
    p: {}
};
export let power_generated = {};
export let p_on = {};
export let support_on = {};
export let int_on = {};
export let gal_on = {};
export let spire_on = {};
export let quantum_level = 0;
export let achieve_level = 0;
export let universe_level = 0;
export let atrack = {t:0};
export function set_qlevel(q_level){
    quantum_level = q_level;
}
export function set_alevel(a_level){
    achieve_level = a_level;
}
export function set_ulevel(u_level){
    universe_level = u_level;
}
export let hell_reports = {};
export let hell_graphs = {};
export let message_logs = {
    view: 'all'
};
export const message_filters = ['all','progress','queue','building_queue','research_queue','combat','spy','events','major_events','minor_events','achievements','hell'];
export let callback_queue = new Map();
export let active_rituals = {};

Math.rand = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

global['seed'] = 2;
global['warseed'] = 2;
export function seededRandom(min, max, alt, useSeed) {
    max = max || 1;
    min = min || 0;

    let seed = useSeed || global[alt ? 'warseed' : 'seed'];
    let newSeed = (seed * 9301 + 49297) % 233280;
    let rnd = newSeed / 233280;
    if (!useSeed){ global[alt ? 'warseed' : 'seed'] = newSeed; }
    return min + rnd * (max - min);
}

{
    let global_data = save.getItem('evolved') || false;
    if (global_data) {
        // Load pre-existing game data
        let saveState = JSON.parse(LZString.decompressFromUTF16(global_data));

        if (saveState){
            global = saveState;
        }
        else {
            newGameData();
        }
    }
    else {
        newGameData();
    }
}

export function setGlobal(gameState) {
    global = gameState;
}
applySaveDefaults1({ global, convertVersion });
applySaveDefaults2({ global, convertVersion });
applySaveDefaults3({ global, convertVersion, message_filters });
applySaveDefaults4({ global, convertVersion });
applySaveDefaults5({ global, convertVersion, message_filters, setRegionStates });
applySaveDefaults6({ global });

export function setupStats(){
    // Stat Counters
    [
        'reset','plasmid','antiplasmid','universes','phage','starved','tstarved','died','tdied',
        'sac','tsac','know','tknow','portals','dkills','attacks','cfood','tfood','cstone','tstone',
        'clumber','tlumber','mad','bioseed','cataclysm','blackhole','ascend','descend','apotheosis',
        'terraform','aiappoc','matrix','retire','eden','geck','dark','harmony','blood','cores','artifact',
        'supercoiled','cattle','tcattle','murders','tmurders','psykill','tpsykill','pdebt','uDead'
    ].forEach(function(k){
        if (!global.stats.hasOwnProperty(k)){
            global.stats[k] = 0;
        }
    });

    if (!global.stats['achieve']){
        global.stats['achieve'] = {};
    }
    if (!global.stats['feat']){
        global.stats['feat'] = {};
    }

    if (!global.stats.hasOwnProperty('womling')){
        global.stats['womling'] = {
            god: {l:0},
            lord: {l:0},
            friend: {l:0}
        };
    }

    if (!global.stats['spire']){
        global.stats['spire'] = {};
    }
    if (!global.stats['synth']){
        global.stats['synth'] = {};
    }
    if (!global.stats.hasOwnProperty('banana')){
        global.stats['banana'] = {
            b1: { l: false, h: false, a: false, e: false, m: false, mg: false }, 
            b2: { l: false, h: false, a: false, e: false, m: false, mg: false }, 
            b3: { l: false, h: false, a: false, e: false, m: false, mg: false }, 
            b4: { l: false, h: false, a: false, e: false, m: false, mg: false }, 
            b5: { l: false, h: false, a: false, e: false, m: false, mg: false }
        };
    }
    if (!global.stats.hasOwnProperty('endless_hunger')){
        global.stats['endless_hunger'] = {
            b1: { l: false, h: false, a: false, e: false, m: false, mg: false }, 
            b2: { l: false, h: false, a: false, e: false, m: false, mg: false }, 
            b3: { l: false, h: false, a: false, e: false, m: false, mg: false }, 
            b4: { l: false, h: false, a: false, e: false, m: false, mg: false }, 
            b5: { l: false, h: false, a: false, e: false, m: false, mg: false }
        };
    }
    if (!global.stats.hasOwnProperty('death_tour')){
        global.stats['death_tour'] = {
            ct: { l: 0, h: 0, a: 0, e: 0, m: 0, mg: 0 }, 
            bh: { l: 0, h: 0, a: 0, e: 0, m: 0, mg: 0 }, 
            di: { l: 0, h: 0, a: 0, e: 0, m: 0, mg: 0 }, 
            ai: { l: 0, h: 0, a: 0, e: 0, m: 0, mg: 0 }, 
            vc: { l: 0, h: 0, a: 0, e: 0, m: 0, mg: 0 },
            md: { l: 0, h: 0, a: 0, e: 0, m: 0, mg: 0 }
        };
    }
    if (global.stats['death_tour'] && !global.stats.death_tour.hasOwnProperty('md')){
        global.stats.death_tour['md'] = { l: 0, h: 0, a: 0, e: 0, m: 0, mg: 0 };
    }
    if (!global.stats['warlord']){
        global.stats['warlord'] = { k: false, p: false, a: false, r: false, g: false };
    }
}

setupStats();
applySaveDefaults7({ global });
applySaveDefaults8({ global });

function newGameData(){
    global['race'] = { species : 'protoplasm', gods: 'none', old_gods: 'none', seeded: false };
    global['seed'] = Math.rand(0,10000);
    global['warseed'] = Math.rand(0,10000);
    global['new'] = true;
}

export let keyMap = {
    x10: false,
    x25: false,
    x100: false,
    q: false
};

export function keyMultiplier(){
    let number = 1;
    if (global.settings['mKeys']){
        if (keyMap.x10){
            number *= 10;
        }
        if (keyMap.x25){
            number *= 25;
        }
        if (keyMap.x100){
            number *= 100;
        }
    }
    return number;
}

export function convertVersion(version){
    let vNum = version.split('.',3);
    vNum[0] *= 100000;
    vNum[1] *= 1000;
    return Number(vNum[0]) + Number(vNum[1]) + Number(vNum[2]);
}

export function resizeGame(){
    if ($(window).width() >= 1400 && $('#msgQueue:not(.right)')){
        let build = $('#buildQueue').detach();
        build.addClass('right');
        build.removeClass('has-text-info');

        let queue = $('#msgQueue').detach();
        queue.addClass('right');
        queue.removeClass('has-text-info');
        queue.css('resize', 'none');
        $('#queueColumn').addClass('is-one-quarter');
        $('#queueColumn').append(build);
        $('#queueColumn').append(queue);
        $('#mainColumn').removeClass('is-three-quarters');
        $('#mainColumn').addClass('is-half');

    }
    else if ($(window).width() < 1400 && $('#msgQueue').hasClass('right')){
        let build = $('#buildQueue').detach();
        build.removeClass('right');
        build.addClass('has-text-info');

        let queue = $('#msgQueue').detach();
        queue.removeClass('right');
        queue.addClass('has-text-info');
        queue.css('resize', 'vertical');
        $('#queueColumn').removeClass('is-one-quarter');
        $('#sideQueue').append(build);
        $('#sideQueue').append(queue);
        $('#mainColumn').removeClass('is-half');
        $('#mainColumn').addClass('is-three-quarters');
    }
}

export const affix_list = {
    sln: ['K','M','B','t','q','Q','s','S']
};
// Number formatting options, in the user's default locale
let numFormatShort = new Intl.NumberFormat(undefined, {maximumFractionDigits: 2, maximumSignificantDigits: 3, roundingMode: 'trunc', roundingPriority: 'lessPrecision'});
let numFormatLong = new Intl.NumberFormat(undefined, {maximumFractionDigits: 2, maximumSignificantDigits: 4, roundingMode: 'trunc', roundingPriority: 'lessPrecision'});
// Constant value that is used frequently
const ADD_16_ULP = 1 + (16 * Number.EPSILON);

// Number.prototype.toLocaleString(undefined, opts) membuat Intl.NumberFormat BARU di setiap panggilan (lambat; sizeApproximation
// dipanggil ratusan kali per tick untuk label resource). Formatter dengan opsi yang sama dipakai ulang lewat cache kecil di bawah.
// Hasilnya identik: toLocaleString(undefined, o) didefinisikan sama dengan new Intl.NumberFormat(undefined, o).format(x)
// (dijaga oleh test/format-equiv.mjs).
const exactFormats = new Map();
const fixedFormats = new Map();
function exactFormat(precision){
    let f = exactFormats.get(precision);
    if (!f){
        f = new Intl.NumberFormat(undefined, {maximumFractionDigits: precision, roundingMode: 'trunc'});
        exactFormats.set(precision, f);
    }
    return f;
}
function fixedFormat(maxSigFigs, precision){
    const key = maxSigFigs * 1000 + precision;
    let f = fixedFormats.get(key);
    if (!f){
        f = new Intl.NumberFormat(undefined, {maximumSignificantDigits: maxSigFigs, maximumFractionDigits: precision, roundingMode: 'trunc', roundingPriority: 'lessPrecision'});
        fixedFormats.set(key, f);
    }
    return f;
}

/**
 * Return a locale-dependent string that represents the significance of the input value.
 * Numbers are typically represented with 3 or 4 significant figures.
 * Abbreviations are not applied to numbers less than 10,000.
 *
 * All input values are truncated toward 0 when precision reduction is required.
 * Trailing fractional zeroes are never printed, regardless of the apparent significant figure requirement.
 *
 * @arg {Number} value - The value to format
 * @arg {Number} precision - The maximum number of fractional digits to display
 * @arg {Boolean} precise - Do not apply abbreviation and display all integer significant figures in the value.
 * @arg {Boolean} exact - Do not apply abbreviation and display all significant figures in the value.
 * @return {String}
 */
export function sizeApproximation(value, precision = 1, precise = false, exact = false){
    let absValue = Math.abs(value);
    let oom = Math.floor(Math.log10(absValue));

    // Increase magnitude of all numbers by 16 to 32 ULP to avoid rounding issues
    absValue *= ADD_16_ULP;
    // Explicitly avoid adding anything to either -0 or +0 to avoid altering the sign
    value = value<0 ? -absValue : value>0 ? absValue : value;

    // Exact mode:
    //  The number of significant figures is not limited in any way.
    //  The number of fractional digits is limited by the precision argument.
    if (exact){
        return exactFormat(precision).format(value);
    }

    // Fixed mode:
    //  The number of significant figures is at least 5, but may increase for large values.
    //  The number of fractional digits is limited by the precision argument, but may be reduced for large values.
    else if (oom < 4 || precise){
        // The objective here is to provide high precision for both large and small numbers,
        // while preventing excess precision for large numbers that also have many fractional digits.
        let maxSigFigs = Math.max(oom + 1,          // Full precision for the integer component of large numbers (at least 1e4)
                                  precision + 1,    // Requested precision for values with only 1 leading digit
                                  5);               // Always allow 5 sigfigs, not only 4, for numbers where 1e2 <= x < 1e4
        // Intl.NumberFormat hanya menerima 1..21 digit signifikan; nilai > 1e21 di mode precise dulu melempar RangeError.
        return fixedFormat(Math.min(maxSigFigs, 21), precision).format(value);
    }

    else {
        const oomMod3 = oom % 3;
        const dispShort = oom === 4; // Reduce significant figures from 4 to 3 for numbers below 100,000
        const forceExponent = global.settings.affix !== 'eng' && oom >= 27;
        // Reduce displayed order of magnitude to the nearest multiple of 3, except for scientific mode
        if (global.settings.affix !== 'sci' && !forceExponent){
            oom -= oomMod3;
        }

        let affix;
        if (global.settings.affix === 'sci' || global.settings.affix === 'eng' || forceExponent){
            // Manually build exponent suffix to guarantee that the 'e' is lowercase for aesthetic preference
            affix = 'e' + oom;
        } else {
            // Get the string suffix from the configured lookup table
            affix = affix_list[global.settings.affix][(oom / 3) - 1];
        }

        value /= (10**oom);

        if (dispShort){
            return numFormatShort.format(value) + affix;
        } else {
            return numFormatLong.format(value) + affix;
        }
    }
}

$(window).resize(function(){
    resizeGame();
});

export function srSpeak(text, priority) {
    let el = document.createElement("div");
    let id = "speak-" + Date.now();
    el.setAttribute("id", id);
    el.setAttribute("aria-live", priority || "polite");
    el.classList.add("sr-only");
    document.body.appendChild(el);

    window.setTimeout(function () {
      document.getElementById(id).innerHTML = text;
    }, 100);

    window.setTimeout(function () {
        document.body.removeChild(document.getElementById(id));
    }, 1000);
}

// executes a soft reset
window.soft_reset = function reset(source){
    try {
        source = source && source === 'replicator' ? 'replicator' : 'soft';
        gtag('event', 'reset', { 'end': source});
    } catch (err){}
    
    if (!source){
        clearSavedMessages();
    }

    let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
    let gecks = global.race.hasOwnProperty('geck') ? global.race.geck : 0;
    if (global.race.hasOwnProperty('gecked')){
        gecks += global.race.gecked;
        global.stats.geck -= global.race.gecked;
    }
    let replace = {
        species : 'protoplasm',
        universe: global.race.universe,
        seeded: global.race.seeded,
        probes: global.race.probes,
        seed: global.race.seed,
        ascended: global.race.hasOwnProperty('ascended') ? global.race.ascended : false,
        rejuvenated: global.race.hasOwnProperty('rejuvenated') ? global.race.rejuvenated : false,
    }
    if (gecks > 0){
        replace['geck'] = gecks;
    }
    if (srace){
        replace['srace'] = srace;
    }
    if (global.race['bigbang']){
        replace['bigbang'] = true;
    }
    if (global.race['gods']){
        replace['gods'] = global.race.gods;
    }
    if (global.race['old_gods']){
        replace['old_gods'] = global.race.old_gods;
    }
    if (global.race['rapid_mutation'] && global.race['rapid_mutation'] > 0){
        replace['rapid_mutation'] = global.race['rapid_mutation'];
    }
    if (global.race['ancient_ruins'] && global.race['ancient_ruins'] > 0){
        replace['ancient_ruins'] = global.race['ancient_ruins'];
    }
    if (global.race['bigbang']){
        replace.universe = 'bigbang';
    }
    if (global.race.hasOwnProperty('corruption')){
        replace['corruption'] = global.race.corruption;
    }
    global['race'] = replace;

    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;
    let geo = global.city.geology;
    global.city = {
        calendar: {
            day: 0,
            year: 0,
            weather: 2,
            temp: 1,
            moon: 0,
            wind: 0,
            orbit: orbit
        },
        biome: biome,
        ptrait: atmo,
        geology: geo
    };

    if (global.tech['theology'] && global.tech['theology'] >= 1){
        global.tech = { theology: 1 };
    }
    else {
        global.tech = {};
    }

    clearStates();
    global.new = true;
    global.seed = Math.rand(0,10000);
    global.warseed = Math.rand(0,10000);

    global.stats['current'] = Date.now();
    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}

export let webWorker = { w: false, s: false, mt: 250, midRatio: 4, longRatio: 20 };
export let intervals = {};

export function clearSavedMessages(){
    message_filters.forEach(function (filter){
        //Preserve achievements log.
        if (filter !== 'achievements'){
            global.lastMsg[filter] = [];
        }
    });
}

export function setRegionStates(reset){
    // Display Keys
    let regions = {
        base: [
            'showCiv','showCity','showIndustry','showPowerGrid','showMechLab','showShipYard',
            'showResearch','showCivic','showMil','showResources','showMarket','showStorage',
            'showGenetics','showSpace','showDeep','showGalactic','showPortal','showEden','showOuter',
            'showTau','showEjector','showCargo','showAlchemy','showGovernor','arpa','showPsychic','showWish'
        ],
        space: [
            'moon','red','hell','sun','gas','gas_moon','belt','dwarf','alpha','proxima',
            'nebula','neutron','blackhole','sirius','stargate','gateway','gorddon',
            'alien1','alien2','chthonian','titan','enceladus','triton','eris','kuiper'
        ],
        portal: ['fortress','badlands','pit','ruins','gate','lake','spire','wasteland'],
        eden: ['asphodel','elysium','isle','palace'],
        tau: ['home','red','roid','gas','gas2','star']
    };
    
    Object.keys(regions).forEach(function(r){
        if (r === 'base'){
            regions[r].forEach(function(v){
                if (!global.settings.hasOwnProperty(v) || reset){
                    global.settings[v] = false;
                }
            });
        }
        else {
            if (!global.settings.hasOwnProperty(r)){
                global.settings[r] = {};
            }
            regions[r].forEach(function(v){
                if (!global.settings[r].hasOwnProperty(v) || reset){
                    global.settings[r][v] = false;
                }
            });
        }
    });


    // Tab Indexes
    [
        'civTabs','govTabs','govTabs2','hellTabs','resTabs','spaceTabs','marketTabs','miscTabs','statsTabs'
    ].forEach(function(k){
        if (!global.settings.hasOwnProperty(k) || reset){
            global.settings[k] = 0;
        }
    });
}

export function clearStates(){
    if (webWorker.w){
        webWorker.w.terminate();
    }
    global['queue'] = { display: false, queue: [] };
    global['r_queue'] = { display: false, queue: [] };
    global['stocks'] = { ocoin: 0 };
    global.space = {};
    global.interstellar = {};
    global.galaxy = {};
    global.portal = {};
    global.eden = {};
    global.starDock = {};
    global.tauceti = {};
    global.civic = { new: 0 };
    global.civic['foreign'] = {
        gov0: {
            unrest: 0,
            hstl: Math.floor(seededRandom(80,100)),
            mil: Math.floor(seededRandom(75,125)),
            eco: Math.floor(seededRandom(60,90)),
            spy: 0,
            esp: 0,
            trn: 0,
            sab: 0,
            act: 'none',
            occ: false,
            anx: false,
            buy: false
        },
        gov1: {
            unrest: 0,
            hstl: Math.floor(seededRandom(0,20)),
            mil: Math.floor(seededRandom(125,175)),
            eco: Math.floor(seededRandom(80,120)),
            spy: 0,
            esp: 0,
            trn: 0,
            sab: 0,
            act: 'none',
            occ: false,
            anx: false,
            buy: false
        },
        gov2: {
            unrest: 0,
            hstl: Math.floor(seededRandom(40,60)),
            mil: Math.floor(seededRandom(200,300)),
            eco: Math.floor(seededRandom(130,170)),
            spy: 0,
            esp: 0,
            trn: 0,
            sab: 0,
            act: 'none',
            occ: false,
            anx: false,
            buy: false
        }
    };
    if (!global.genes['blood']){
        global.prestige.Blood_Stone.count = 0;
    }

    global.resource = {};
    global.evolution = {};
    global.event = { t: 100, l: false };
    global.m_event = { t: 499, l: false };
    global.stats.days = 0;
    global.stats.know = 0;
    global.stats.starved = 0;
    global.stats.died = 0;
    global.stats.attacks = 0;
    global.stats.dkills = 0;
    global.stats.cfood = 0;
    global.stats.cstone = 0;
    global.stats.clumber = 0;
    global.stats.sac = 0;
    global.stats.cattle = 0;
    global.stats.murders = 0;
    global.stats.uDead = 0;
    global.settings.at = 0;

    global.settings.showEvolve = true;
    global.settings.space.home = true;
    setRegionStates(true);
    global.settings.disableReset = false;
    global.settings.pause = false;
    global.arpa = {};

    delete global.race['hrt'];

    if (global.genes['queue']){
        global.tech['queue'] = 1;
        global.queue.display = true;
    }
}

// executes a hard reset
window.reset = function reset(){
    try {
        gtag('event', 'reset', { 'end': 'hard'});
    } catch (err){}
    localStorage.removeItem('evolved');
    global = null;
    if (webWorker.w){
        webWorker.w.terminate();
    }
    window.location.reload();
}

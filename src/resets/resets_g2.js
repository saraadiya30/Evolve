import { global, save, clearSavedMessages, seededRandom, webWorker } from '../core/vars.js';
import { tagEvent, calcPrestige, updateResetStats } from '../functions/functions.js';
import { unlockAchieve, unlockFeat, checkAchievements, universeAffix } from '../achievements/achieve.js';
import { planetTraits, races } from '../races/races.js';
import { grandDeathTour } from './resets_g4.js';
import { resetCommon } from './resets_g3.js';

// Fungsi-fungsi dipindah dari resets.js (urutan sumber dipertahankan). resets.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function vacuumCollapse(){
    if (global.tech.syphon >= 80 && global.race.universe === 'magic'){
        global.tech.syphon = 79;
        global.arpa.syphon.rank = 79;
        global.arpa.syphon.complete = 99;
        global.queue.queue = [];

        global.stats['current'] = Date.now();
        if (!global['sim']){
            save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
        }
        clearSavedMessages();

        tagEvent('reset',{
            'end': 'vacuum'
        });

        unlockAchieve(`extinct_${global.race.species}`);
        unlockAchieve(`pw_apocalypse`);

        if (global.space.hasOwnProperty('spaceport') && global.space.spaceport.count === 0){
            unlockAchieve(`red_dead`);
        }
        if (!global.race['modified'] && global.race.species === 'balorg'){
            unlockAchieve('pass');
        }
        if (global.race['junker'] && global.race.species === 'junker'){
            unlockFeat('the_misery');
        }
        if (global.race['decay']){
            unlockAchieve(`dissipated`);
        }
        if (global.race['steelen']){
            unlockFeat('steelem');
        }

        grandDeathTour('vc');

        let god = global.race.species;
        let old_god = global.race.gods;
        let orbit = global.city.calendar.orbit;
        let biome = global.city.biome;
        let atmo = global.city.ptrait;

        let gains = calcPrestige('vacuum');

        checkAchievements();

        global.stats.blackhole++;
        updateResetStats();

        global.prestige.Phage.count += gains.phage;
        global.stats.phage += gains.phage;
        if (global.race.universe === 'antimatter'){
            global.prestige.AntiPlasmid.count += gains.plasmid;
            global.stats.antiplasmid += gains.plasmid;
        }
        else {
            global.prestige.Plasmid.count += gains.plasmid;
            global.stats.plasmid += gains.plasmid;
        }
        global.stats.pdebt = gains.pdebt;
        global.prestige.Dark.count = +(global.prestige.Dark.count + gains.dark).toFixed(3);
        global.stats.dark = +(global.stats.dark + gains.dark).toFixed(3);
        global.stats.universes++;

        let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
        let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
        //let gecks = global.starDock.hasOwnProperty('geck') ? global.starDock.geck.count : 0;
        global['race'] = {
            species : 'protoplasm',
            gods: god,
            old_gods: old_god,
            universe: 'bigbang',
            seeded: true,
            bigbang: true,
            probes: 4,
            //geck: gecks,
            seed: Math.floor(seededRandom(10000)),
            ascended: false,
        };
        if (corruption > 0){
            global.race['corruption'] = corruption;
        }
        if (srace){
            global.race['srace'] = srace;
        }

        resetCommon({
            orbit: orbit, 
            biome: biome, 
            ptrait: atmo, 
            geology: false
        });

        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
        window.location.reload();
    }
}

// Ascension
export function ascend(){
    clearSavedMessages();

    tagEvent('reset',{
        'end': 'ascend'
    });

    let god = global.race.species;
    let old_god = global.race.gods;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;
    let geo = global.city.geology;

    let gains = calcPrestige('ascend');

    global.stats.ascend++;
    updateResetStats();

    global.prestige.Phage.count += gains.phage;
    global.stats.phage += gains.phage;
    if (global.race.universe === 'antimatter'){
        global.prestige.AntiPlasmid.count += gains.plasmid;
        global.stats.antiplasmid += gains.plasmid;
    }
    else {
        global.prestige.Plasmid.count += gains.plasmid;
        global.stats.plasmid += gains.plasmid;
    }
    global.stats.pdebt = gains.pdebt;
    global.prestige.Harmony.count = parseFloat((global.prestige.Harmony.count + gains.harmony).toFixed(2));
    global.stats.harmony = parseFloat((global.stats.harmony + gains.harmony).toFixed(2));

    atmo.forEach(function(a){
        if (planetTraits.hasOwnProperty(a)){
            unlockAchieve(`atmo_${a}`);
        }
    });

    if (typeof global.tech['world_control'] === 'undefined'){
        unlockAchieve(`cult_of_personality`);
    }

    let good_rocks = 0;
    Object.keys(global.city.geology).forEach(function (g){
        if (global.city.geology[g] > 0){
            good_rocks++;
        }
    });
    if (good_rocks >= 4) {
        unlockAchieve('miners_dream');
    }

    if (!global.galaxy.hasOwnProperty('dreadnought') || global.galaxy.dreadnought.count === 0){
        unlockAchieve(`dreaded`);
    }

    if (!global.race['modified'] && (global.race.species === 'synth' || global.race.species === 'nano') && global.race['emfield']){
        unlockFeat('digital_ascension');
    }

    if (global.race['gross_enabled'] && global.race['ooze'] && global.race.species !== 'custom' && global.race.species !== 'sludge' && global.race.species != 'hybrid'){
        unlockAchieve(`gross`);
    }

    checkAchievements();

    let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
    let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
    global['race'] = {
        species : 'protoplasm',
        gods: god,
        old_gods: old_god,
        universe: global.race.universe,
        seeded: false,
        seed: Math.floor(seededRandom(10000)),
        ascended: true,
    };
    if (corruption > 0){
        global.race['corruption'] = corruption;
    }
    if (srace){
        global.race['srace'] = srace;
    }

    Object.keys(geo).forEach(function (g){
        geo[g] = +(geo[g] + 0.02).toFixed(2);
    });

    resetCommon({
        orbit: orbit, 
        biome: biome, 
        ptrait: atmo, 
        geology: geo
    });

    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}

// Demonic Infusion
export function descension(){
    if (webWorker.w){
        webWorker.w.terminate();
    }
    if (!global['sim']){
        save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
    }
    clearSavedMessages();

    tagEvent('reset',{
        'end': 'descension'
    });

    unlockAchieve(`squished`,true);
    unlockAchieve(`extinct_${global.race.species}`);
    if (global.race['witch_hunter'] && global.tech['forbidden'] >= 5 && global.race.universe === 'magic'){
        unlockAchieve(`nightmare`);
    }
    else {
        unlockAchieve(`corrupted`);
    }
    if(global.race['fasting'] && global.tech['dish_reset']){
        //also award on outerplane summon with finalize dish tech unlocked
        let affix = universeAffix();
        global.stats['endless_hunger'].b5[affix] = true;
        if (affix !== 'm' && affix !== 'l'){
            global.stats['endless_hunger'].b5.l = true;
        }

        if (global.stats.starved === 0){
            unlockFeat('immortal');
        }
    }
    if (races[global.race.species].type === 'angelic'){
        unlockFeat('twisted');
    }
    if (global.race['junker'] && global.race.species === 'junker'){
        unlockFeat('the_misery');
    }
    if (!global.race['modified'] && global.race['junker'] && global.race.species === 'junker'){
        unlockFeat(`garbage_pie`);
    }
    if (global.race['cataclysm']){
        unlockFeat(`finish_line`);
    }
    if (global.race['ooze'] && global.race.species === 'sludge'){
        unlockFeat('slime_lord');
    }

    grandDeathTour('di');

    let gains = calcPrestige('descend');
    global.prestige.Artifact.count += gains.artifact;
    global.stats.artifact += gains.artifact;

    let affix = universeAffix();
    if (global.stats.spire.hasOwnProperty(affix)){
        if (global.stats.spire[affix].hasOwnProperty('lord')){
            global.stats.spire[affix].lord++;
        }
        else {
            global.stats.spire[affix]['lord'] = 1;
        }

        if (global.tech['dl_reset']){
            global.stats.spire[affix]['dlstr'] = 0;
        }
        else { 
            if (global.stats.spire[affix].hasOwnProperty('dlstr')){
                global.stats.spire[affix].dlstr++;
            }
            else {
                global.stats.spire[affix]['dlstr'] = 1;
            }
        }
    }

    let god = global.race.species;
    let old_god = global.race.gods;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;
    let geo = global.city.geology;

    global.stats.descend++;
    updateResetStats();
    checkAchievements();

    let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
    global['race'] = {
        species : 'protoplasm',
        gods: god,
        old_gods: old_god,
        universe: global.race.universe,
        seeded: false,
        seed: Math.floor(seededRandom(10000)),
        corruption: 5,
        ascended: global.race.hasOwnProperty('ascended') ? global.race.ascended : false,
    };
    if (srace){
        global.race['srace'] = srace;
    }

    resetCommon({
        orbit: orbit, 
        biome: biome, 
        ptrait: atmo, 
        geology: geo
    });

    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}

// Apotheosis
export function apotheosis(){
    clearSavedMessages();

    tagEvent('reset',{
        'end': 'apotheosis'
    });

    let god = global.race.species;
    let old_god = global.race.gods;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;
    let geo = global.city.geology;

    let gains = calcPrestige('apotheosis');

    global.stats.apotheosis++;
    updateResetStats();

    global.prestige.Supercoiled.count += gains.supercoiled;
    global.stats.supercoiled += gains.supercoiled;
    if (global.race.universe === 'antimatter'){
        global.prestige.AntiPlasmid.count += gains.plasmid;
        global.stats.antiplasmid += gains.plasmid;
    }
    else {
        global.prestige.Plasmid.count += gains.plasmid;
        global.stats.plasmid += gains.plasmid;
    }
    global.stats.pdebt = gains.pdebt;

    if (global.race['warlord']){
        global.prestige.Artifact.count += gains.artifact;
        global.stats.artifact += gains.artifact;
    }

    atmo.forEach(function(a){
        if (planetTraits.hasOwnProperty(a)){
            unlockAchieve(`atmo_${a}`);
        }
    });

    if (typeof global.tech['world_control'] === 'undefined'){
        unlockAchieve(`cult_of_personality`);
    }

    let good_rocks = 0;
    Object.keys(global.city.geology).forEach(function (g){
        if (global.city.geology[g] > 0){
            good_rocks++;
        }
    });
    if (good_rocks >= 4) {
        unlockAchieve('miners_dream');
    }

    if (global.race['gross_enabled'] && global.race['ooze'] && global.race.species !== 'custom' && global.race.species !== 'sludge' && global.race.species != 'hybrid'){
        unlockAchieve(`gross`);
    }

    checkAchievements();

    let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
    let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
    global['race'] = {
        species : 'protoplasm',
        gods: god,
        old_gods: old_god,
        universe: global.race.universe,
        seeded: false,
        seed: Math.floor(seededRandom(10000)),
        ascended: true,
    };
    if (corruption > 0){
        global.race['corruption'] = corruption;
    }
    if (srace){
        global.race['srace'] = srace;
    }

    Object.keys(geo).forEach(function (g){
        geo[g] = +(geo[g] + 0.02).toFixed(2);
    });

    resetCommon({
        orbit: orbit, 
        biome: biome, 
        ptrait: atmo, 
        geology: geo
    });

    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}

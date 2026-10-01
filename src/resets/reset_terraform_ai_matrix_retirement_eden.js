import { clearSavedMessages, global, seededRandom, save, webWorker, clearStates } from '../core/vars.js';
import { tagEvent } from '../functions/analytics.js';
import { calcPrestige } from '../functions/prestige_calc.js';
import { updateResetStats } from '../functions/run_stats_helpers.js';
import { planetTraits } from '../races/races.js';
import { races } from '../core/registries.js';
import { unlockAchieve, checkAchievements, unlockFeat } from '../achievements/achievement_logic.js';
import { grandDeathTour, trackWomling } from './reset_extras.js';

// Functions extracted from resets.js (source order preserved). resets.js still re-exports the previously exported names.


// Terraform
export function terraform(planet){
    clearSavedMessages();

    tagEvent('reset',{
        'end': 'terraform'
    });

    let god = global.race.species;
    let old_god = global.race.gods;
    let orbit = global.city.calendar.orbit;
    let biome = planet.biome;
    let atmo = planet.traitlist;
    let geo = planet.geology;

    let gains = calcPrestige('terraform');

    global.stats.terraform++;
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

    if (global.race['gross_enabled'] && global.race['ooze'] && global.race.species !== 'custom' && global.race.species !== 'sludge' && global.race.species !== 'hybrid'){
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
        ascended: global.race.hasOwnProperty('ascended') ? global.race.ascended : false,
        rejuvenated: true,
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
        geology: geo
    });

    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}

// AI Appocalypse
export function aiApocalypse(){
    if (!global['sim']){
        save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
    }
    clearSavedMessages();

    tagEvent('reset',{
        'end': 'ai apocalypse'
    });

    unlockAchieve(`extinct_${global.race.species}`);
    unlockAchieve(`obsolete`);

    unlockAchieve(`squished`,true);
    if (global.race['junker'] && global.race.species === 'junker'){
        unlockFeat('the_misery');
    }

    grandDeathTour('ai');

    let god = global.race.species;
    let old_god = global.race.gods;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;
    let geo = global.city.geology;

    let gains = calcPrestige('ai');
    checkAchievements();

    global.stats.aiappoc++;
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
    global.prestige.AICore.count += gains.cores;
    global.stats.cores += gains.cores;

    let srace = races[god].type !== 'synthetic' && !['junker','sludge','ultra_sludge'].includes(god) ? god : (global.race.hasOwnProperty('srace') ? global.race.srace : god);
    global.stats.synth[god] = true;

    let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
    global['race'] = {
        species : 'protoplasm',
        gods: god,
        old_gods: old_god,
        srace: srace,
        universe: global.race.universe,
        seeded: false,
        seed: Math.floor(seededRandom(10000)),
        ascended: global.race.hasOwnProperty('ascended') ? global.race.ascended : false,
    };
    if (corruption > 0){
        global.race['corruption'] = corruption;
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

// Matrix
export function matrix(){
    if (webWorker.w){
        webWorker.w.terminate();
    }
    if (!global['sim']){
        save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
    }
    clearSavedMessages();

    tagEvent('reset',{
        'end': 'matrix'
    });

    let god = global.race.species;
    let old_god = global.race.gods;
    let genus = races[god].type === 'hybrid' ? global.race.maintype : races[god].type;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;
    let geo = global.city.geology;

    let gains = calcPrestige('matrix');

    unlockAchieve(`biome_${biome}`);
    atmo.forEach(function(a){
        if (planetTraits.hasOwnProperty(a)){
            unlockAchieve(`atmo_${a}`);
        }
    });
    unlockAchieve(`genus_${genus}`);
    if (global.race['gross_enabled'] && global.race['ooze'] && global.race.species !== 'custom' && global.race.species !== 'sludge' && global.race.species !== 'hybrid'){
        unlockAchieve(`gross`);
    }
    unlockAchieve(`bluepill`);

    trackWomling();
    checkAchievements();

    global.stats.matrix++;
    updateResetStats();
    if (global.race.universe === 'antimatter'){
        global.prestige.AntiPlasmid.count += gains.plasmid;
        global.stats.antiplasmid += gains.plasmid;
    }
    else {
        global.prestige.Plasmid.count += gains.plasmid;
        global.stats.plasmid += gains.plasmid;
    }
    global.stats.pdebt = gains.pdebt;
    global.prestige.Phage.count += gains.phage;
    global.stats.phage += gains.phage;

    global.prestige.AICore.count += gains.cores;
    global.stats.cores += gains.cores;

    let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
    let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
    global['race'] = {
        species : 'protoplasm',
        gods: god,
        old_gods: old_god,
        universe: global.race.universe,
        seeded: false,
        seed: Math.floor(seededRandom(10000)),
        ascended: global.race.hasOwnProperty('ascended') ? global.race.ascended : false,
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
        geology: geo
    });

    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}

// Retirement
export function retirement(){
    if (webWorker.w){
        webWorker.w.terminate();
    }
    if (!global['sim']){
        save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
    }
    clearSavedMessages();

    tagEvent('reset',{
        'end': 'retired'
    });

    let god = global.race.species;
    let old_god = global.race.gods;
    let genus = races[god].type === 'hybrid' ? global.race.maintype : races[god].type;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;
    let geo = global.city.geology;

    let gains = calcPrestige('retired');

    unlockAchieve(`biome_${biome}`);
    atmo.forEach(function(a){
        if (planetTraits.hasOwnProperty(a)){
            unlockAchieve(`atmo_${a}`);
        }
    });
    unlockAchieve(`genus_${genus}`);
    if (global.race['gross_enabled'] && global.race['ooze'] && global.race.species !== 'custom' && global.race.species !== 'sludge' && global.race.species !== 'hybrid'){
        unlockAchieve(`gross`);
    }
    unlockAchieve(`retired`);

    trackWomling();
    checkAchievements();

    global.stats.retire++;
    updateResetStats();
    if (global.race.universe === 'antimatter'){
        global.prestige.AntiPlasmid.count += gains.plasmid;
        global.stats.antiplasmid += gains.plasmid;
    }
    else {
        global.prestige.Plasmid.count += gains.plasmid;
        global.stats.plasmid += gains.plasmid;
    }
    global.stats.pdebt = gains.pdebt;
    global.prestige.Phage.count += gains.phage;
    global.stats.phage += gains.phage;

    global.prestige.AICore.count += gains.cores;
    global.stats.cores += gains.cores;

    let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
    let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
    global['race'] = {
        species : 'protoplasm',
        gods: god,
        old_gods: old_god,
        universe: global.race.universe,
        seeded: false,
        seed: Math.floor(seededRandom(10000)),
        ascended: global.race.hasOwnProperty('ascended') ? global.race.ascended : false,
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
        geology: geo
    });

    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}

// Garden of Eden
export function gardenOfEden(){
    if (webWorker.w){
        webWorker.w.terminate();
    }
    if (!global['sim']){
        save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
    }
    clearSavedMessages();

    tagEvent('reset',{
        'end': 'eden'
    });

    let god = global.race.species;
    let old_god = global.race.gods;
    let genus = races[god].type === 'hybrid' ? global.race.maintype : races[god].type;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;
    let geo = global.city.geology;

    let gains = calcPrestige('eden');

    unlockAchieve(`biome_${biome}`);
    atmo.forEach(function(a){
        if (planetTraits.hasOwnProperty(a)){
            unlockAchieve(`atmo_${a}`);
        }
    });
    unlockAchieve(`genus_${genus}`);
    if (global.race['gross_enabled'] && global.race['ooze'] && global.race.species !== 'custom' && global.race.species !== 'sludge' && global.race.species !== 'hybrid'){
        unlockAchieve(`gross`);
    }
    unlockAchieve(`adam_eve`);

    trackWomling();
    checkAchievements();

    global.stats.eden++;
    updateResetStats();
    if (global.race.universe === 'antimatter'){
        global.prestige.AntiPlasmid.count += gains.plasmid;
        global.stats.antiplasmid += gains.plasmid;
    }
    else {
        global.prestige.Plasmid.count += gains.plasmid;
        global.stats.plasmid += gains.plasmid;
    }
    global.stats.pdebt = gains.pdebt;
    global.prestige.Phage.count += gains.phage;
    global.stats.phage += gains.phage;

    global.prestige.AICore.count += gains.cores;
    global.stats.cores += gains.cores;

    let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
    let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
    global['race'] = {
        species : 'protoplasm',
        gods: god,
        old_gods: old_god,
        universe: global.race.universe,
        seeded: false,
        seed: Math.floor(seededRandom(10000)),
        ascended: global.race.hasOwnProperty('ascended') ? global.race.ascended : false,
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
        geology: geo
    });

    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}

export function resetCommon(args){
    global.city = {
        calendar: {
            day: 0,
            year: 0,
            weather: 2,
            temp: 1,
            moon: 0,
            wind: 0,
            orbit: args.orbit
        },
        biome: args.biome,
        ptrait: args.ptrait
    };

    if (args.geology){
        global.city['geology'] = args.geology;
    }

    global.tech = { theology: 1 };
    clearStates();
    global.new = true;
    global.seed = Math.rand(0,10000);
}


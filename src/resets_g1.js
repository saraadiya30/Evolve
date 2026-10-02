import { global, save, clearSavedMessages, seededRandom, webWorker } from './vars.js';
import { tagEvent, calcPrestige, updateResetStats } from './functions.js';
import { unlockAchieve, unlockFeat, checkAchievements } from './achieve.js';
import { races, planetTraits } from './races.js';
import { grandDeathTour } from './resets_g4.js';
import { resetCommon } from './resets_g3.js';

// Fungsi-fungsi dipindah dari resets.js (urutan sumber dipertahankan). resets.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


// Mutual Assured Destruction
export function warhead(){
    if (!global.civic.mad.armed && !global.race['cataclysm']){
        if (!global['sim']){
            save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
        }
        clearSavedMessages();

        tagEvent('reset',{
            'end': 'mad'
        });

        let god = global.race.species;
        let old_god = global.race.gods;
        let orbit = global.city.calendar.orbit;
        let biome = global.city.biome;
        let atmo = global.city.ptrait;
        let geo = global.city.geology;

        let gains = calcPrestige('mad');

        global.stats.mad++;
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

        unlockAchieve(`apocalypse`);
        unlockAchieve(`squished`,true);
        unlockAchieve(`extinct_${god}`);
        if (global.civic.govern.type === 'anarchy'){
            unlockAchieve(`anarchist`);
        }
        if (global.city.biome === 'hellscape' && races[global.race.species].type !== 'demonic'){
            unlockFeat('take_no_advice');
        }
        if (global.race['truepath']){
            unlockAchieve('ashanddust');
        }
        checkAchievements();

        grandDeathTour('md');

        let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
        let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
        global['race'] = { 
            species : 'protoplasm', 
            gods: god,
            old_gods: old_god,
            rapid_mutation: 1,
            ancient_ruins: 1,
            universe: global.race.universe,
            seeded: false,
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
}

//Bioseed
export function bioseed(){
    if (!global['sim']){
        save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
    }
    clearSavedMessages();

    tagEvent('reset',{
        'end': 'bioseed'
    });

    let god = global.race.species;
    let old_god = global.race.gods;
    let genus = races[god].type === 'hybrid' ? global.race.maintype : races[god].type;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;

    let gains = calcPrestige('bioseed');

    global.stats.bioseed++;
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

    unlockAchieve(`seeder`);
    unlockAchieve(`biome_${biome}`);
    atmo.forEach(function(a){
        if (planetTraits.hasOwnProperty(a)){
            unlockAchieve(`atmo_${a}`);
        }
    });
    unlockAchieve(`genus_${genus}`);
    
    if (global.race['gravity_well']){
        unlockAchieve(`escape_velocity`);
    }
    if (global.race['truepath']){
        unlockAchieve(`exodus`);
    }
    if (atmo.includes('dense') && global.race.universe === 'heavy'){
        unlockAchieve(`double_density`);
    }
    if (global.race['junker'] && global.race.species === 'junker'){
        unlockFeat('organ_harvester');
    }
    if (global.city.biome === 'hellscape' && races[global.race.species].type !== 'demonic'){
        unlockFeat('ill_advised');
    }
    if (typeof global.tech['world_control'] === 'undefined'){
        unlockAchieve(`cult_of_personality`);
    }

    if (global.race['cataclysm']){
        unlockAchieve('iron_will',false,5);
    }
    if (global.race['gross_enabled'] && global.race['ooze'] && global.race.species !== 'custom' && global.race.species !== 'sludge' && global.race.species != 'hybrid'){
        unlockAchieve(`gross`);
    }

    let good_rocks = 0;
    let bad_rocks = 0;
    Object.keys(global.city.geology).forEach(function (g){
        if (global.city.geology[g] > 0) {
            good_rocks++;
        }
        else if (global.city.geology[g] < 0){
            bad_rocks++;
        }
    });
    if (good_rocks >= 4) {
        unlockAchieve('miners_dream');
    }
    if (bad_rocks >= 3){
        unlockFeat('rocky_road');
    }
    if (global.race['steelen'] && global.race['steelen'] >= 1){
        unlockAchieve(`steelen`);
    }

    switch (global.race.universe){
        case 'micro':
            if (global.race['small'] || global.race['compact']){
                unlockAchieve(`macro`,true);
            }
            else {
                unlockAchieve(`marble`,true);
            }
            break;
        default:
            break;
    }

    checkAchievements();

    let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
    let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
    let probes = global.starDock.probes.count + 1;
    let gecks = global.starDock.hasOwnProperty('geck') ? global.starDock.geck.count : 0;
    if (global.stats.achieve['explorer']){
        probes += global.stats.achieve['explorer'].l;
    }
    global['race'] = {
        species : 'protoplasm',
        gods: god,
        old_gods: old_god,
        universe: global.race.universe,
        seeded: true,
        probes: probes,
        geck: gecks,
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

// Cataclysm
export function cataclysm_end(){
    if (global.city.ptrait.includes('unstable') && global.tech['quaked']){
        if (webWorker.w){
            webWorker.w.terminate();
        }
        if (!global['sim']){
            save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
        }

        tagEvent('reset',{
            'end': 'cataclysm'
        });

        clearSavedMessages();

        let gains = calcPrestige('cataclysm');

        global.stats.cataclysm++;
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

        unlockAchieve(`squished`,true);
        unlockAchieve(`extinct_${global.race.species}`);
        if (global.city.biome === 'hellscape' && races[global.race.species].type !== 'demonic'){
            unlockFeat('take_no_advice');
        }
        checkAchievements();
        unlockAchieve('shaken');
        if (global.race['cataclysm']){
            unlockAchieve('failed_history');
        }

        grandDeathTour('ct');

        let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
        let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
        let mainType = global.race.hasOwnProperty('maintype') ? global.race.maintype : false;
        global['race'] = {
            species : global.race.species,
            gods: global.race.gods,
            old_gods: global.race.old_gods,
            universe: global.race.universe,
            seeded: false,
            ascended: global.race.hasOwnProperty('ascended') ? global.race.ascended : false,
        };
        if (corruption > 0){
            global.race['corruption'] = corruption;
        }
        if (srace){
            global.race['srace'] = srace;
        }
        if (mainType){
            global.race['maintype'] = mainType;
        }
             
        resetCommon({
            orbit: global.city.calendar.orbit, 
            biome: global.city.biome, 
            ptrait: global.city.ptrait, 
            geology: global.city.geology
        });

        if (global.race.universe === 'antimatter') {
            global.race['weak_mastery'] = 1;
        }
        else {
            global.race['no_plasmid'] = 1;
        }

        let genes = ['crispr','trade','craft'];
        for (let i=0; i<genes.length; i++){
            global.race[`no_${genes[i]}`] = 1;
        }

        global.race['start_cataclysm'] = 1;
        global.race['cataclysm'] = 1;
        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
        window.location.reload();
    }
}

// Blackhole
export function big_bang(){
    if (!global['sim']){
        save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
    }
    clearSavedMessages();

    tagEvent('reset',{
        'end': 'blackhole'
    });

    unlockAchieve(`extinct_${global.race.species}`);
    switch (global.race.universe){
        case 'heavy':
            unlockAchieve(`heavy`);
            break;
        case 'antimatter':
            unlockAchieve(`canceled`);
            break;
        case 'evil':
            unlockAchieve(`eviltwin`);
            break;
        case 'micro':
            unlockAchieve(`microbang`,true);
            break;
        case 'standard':
            unlockAchieve(`whitehole`);
            break;
        default:
            break;
    }

    if (global.space.hasOwnProperty('spaceport') && global.space.spaceport.count === 0){
        unlockAchieve(`red_dead`);
    }

    unlockAchieve(`squished`,true);
    if (global.race.universe === 'evil' && races[global.race.species].type === 'angelic'){
        unlockFeat('nephilim');
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

    grandDeathTour('bh');

    let god = global.race.species;
    let old_god = global.race.gods;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;

    let gains = calcPrestige('bigbang');

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
        ascended: false
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

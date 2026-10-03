import { global, seededRandom, tmp_vars, save, webWorker } from '../core/vars.js';
import { simulation, cataclysm, aiStart } from '../actions/actions_f9.js';
import { setJType, races, setTraitRank, genus_def, setImitation, combineTraits, renderSupernatural, neg_roll_traits, traits, basicRace, randomMinorTrait, shapeShift, altRace } from '../races/races.js';
import { clearElement, clearPopper, eventActive, getHalloween, popover, calcGenomeScore, genCivName, messageQueue, flib, calcPillar, calc_mastery, tagEvent } from '../functions/functions.js';
import { actions } from '../actions/actions_registry.js';
import { alevel, checkAdept } from '../achievements/achieve.js';
import { loc } from '../core/locale.js';
import { defineResources, initResourceTabs, containerItem, marketItem, tradeSummery } from '../resources/resources.js';
import { resource_values } from '../config/trade.js';
import { registerTech, drawCity } from '../actions/actions_f3.js';
import { addAction } from '../actions/actions_f4.js';
import { universe_affixes } from '../space/space.js';
import { defineJobs } from '../civics/jobs.js';
import { commisionGarrison, defineGovernment, defineGarrison, buildGarrison, foreignGov } from '../civics/civics.js';
import { loneSurvivor } from '../truepath/truepath.js';
import { warlordSetup } from '../portal/portal.js';
import { defineIndustry } from '../industry/industry.js';
import { arpa } from '../arpa/arpa.js';
import { loadTab } from '../core/index.js';

// Bagian dari sentience (actions_f8.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function sentience_s1($ctx){
        if (global.race['simulation']){
        simulation();
    }
    if (global['sim']){
        global.settings.showGenetics = true;
        global.settings.arpa.physics = false;
        global.settings.arpa.crispr = true;
        global.settings.arpa.arpaTabs = 2;
    }

    if (global.resource.hasOwnProperty('RNA')){
        global.resource.RNA.display = false;
    }
    if (global.resource.hasOwnProperty('DNA')){
        global.resource.DNA.display = false;
    }

    if (global.race.species === 'junker' || global.race.species === 'sludge' || global.race.species === 'ultra_sludge'){
        setJType();
    }
    if (global.race.species !== 'junker'){
        delete global.race['junker'];
    }
    if (global.race.species !== 'sludge'){
        delete global.race['sludge'];
    }
    if (global.race.species !== 'ultra_sludge'){
        delete global.race['ultra_sludge'];
    }

    var evolve_actions = ['rna','dna','membrane','organelles','nucleus','eukaryotic_cell','mitochondria'];
    for (var i = 0; i < evolve_actions.length; i++) {
        if (global.race[evolve_actions[i]]){
            clearElement($('#'+actions.evolution[evolve_actions[i]].id),true);
            clearPopper(actions.evolution[evolve_actions[i]].id);
        }
    }

    if (global.race['warlord']){
        let trait = races[global.race.species].fanaticism;
        global.race['absorbed'] = [global.race.species];
        global.race['origin'] = global.race.species;
        global.race.species = 'hellspawn';
        if (trait === 'kindling_kindred'){ trait = 'iron_wood'; }
        setTraitRank(trait, { set: 0.5 });
    }
    else {
        let typeList = global.stats.achieve['godslayer'] && races[global.race.species].type === 'hybrid' ? races[global.race.species].hybrid : [races[global.race.species].type];
        typeList.forEach(function(type){
            Object.keys(genus_def[type].traits).forEach(function (trait) {
                let mainspec = global.tech[`evo_${type}`] >= 2 ? true : false;
                if (mainspec){
                    global.race['maintype'] = type;
                    setTraitRank(trait,{ set: genus_def[type].traits[trait] });
                    if (global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 4){
                        setTraitRank(trait);
                    }
                }
                else {
                    setTraitRank(trait,{ set: genus_def[type].traits[trait] });
                    setTraitRank(trait, {down:true});
                }
            });
        });

        Object.keys(races[global.race.species].traits).forEach(function (trait) {
            setTraitRank(trait,{ set: races[global.race.species].traits[trait] });
        });

        if (global.race['evil'] && global.race['maintype'] && global.race.maintype === 'angelic'){
            delete global.race['evil'];
        }

        if (global.race['imitation'] && global.race['srace']){
            setImitation(false);
        }
    }
    if(!global.race.inactiveTraits){
        global.race.inactiveTraits = {};
    }
    combineTraits();

    Object.keys(global.tech).forEach(function (tech){
        if (tech.substring(0,4) === 'evo_'){
            delete global.tech[tech];
        }
    });
    delete global.tech['evo'];
    global.evolution = {};

    if (global.race['ocular_power']){
        global.settings.showWish = true;
        global.race['ocularPowerConfig'] = {
            d: false, p: false, w: false, t: false, f: false, c: false, ds: 0
        };
        renderSupernatural();
    }

    const date = new Date();
    if (!global.settings.boring && date.getMonth() === 11 && date.getDate() >= 17){
        if (global.race.species === 'elven'){
            setTraitRank('slaver',{ set: 2 });
            setTraitRank('resourceful',{ set: 0.5 });
            setTraitRank('small',{ set: 0.25 });
        }
        else if (global.race.species === 'capybara'){
            setTraitRank('beast_of_burden',{ set: 1 });
            setTraitRank('pack_rat',{ set: 0.5 });
            setTraitRank('musical',{ set: 0.25 });
        }
        else if (global.race.species === 'centaur'){
            setTraitRank('beast_of_burden',{ set: 1 });
            setTraitRank('curious',{ set: 0.5 });
            setTraitRank('blissful',{ set: 0.25 });
        }
        else if (global.race.species === 'wendigo'){
            setTraitRank('immoral',{ set: 3 });
            setTraitRank('cannibalize',{ set: 0.5 });
            setTraitRank('claws',{ set: 0.25 });
        }
        else if (global.race.species === 'yeti'){
            setTraitRank('scavenger',{ set: 3 });
            setTraitRank('regenerative',{ set: 0.5 });
            setTraitRank('musical',{ set: 0.25 });
        }
        else if (global.race.species === 'entish'){
            setTraitRank('photosynth',{ set: 3 });
            setTraitRank('optimistic',{ set: 0.5 });
            setTraitRank('armored',{ set: 0.25 });
        }
    }

    const easter = eventActive('easter');
    if (global.race.species === 'wolven' && easter.active){
        setTraitRank('hyper',{ set: 1 });
        setTraitRank('fast_growth',{ set: 1 });
        setTraitRank('rainbow',{ set: 1 });
        setTraitRank('optimistic',{ set: 1 });
    }
    else if (global.race.species === 'vulpine' && easter.active){
        setTraitRank('cannibalize',{ set: 2 });
        setTraitRank('rage',{ set: 1 });
        setTraitRank('blood_thirst',{ set: 1 });
        setTraitRank('sticky',{ set: 1 });
    }

    const hallowed = getHalloween();
    if (global.race.species === 'unicorn' && hallowed.active){
        setTraitRank('gloomy',{ set: 1 });
        setTraitRank('darkness',{ set: 1 });
        delete global.race['rainbow'];
    }
    else if (global.race.species === 'human' && hallowed.active){
        setTraitRank('anthropophagite',{ set: 1 });
        setTraitRank('cannibalize',{ set: 2 });
        setTraitRank('infectious',{ set: 3 });
    }
    else if (global.race.species === 'tortoisan' && hallowed.active){   
        setTraitRank('hyper',{ set: 0.25 });
        setTraitRank('swift',{ set: 0.5 });
        setTraitRank('infiltrator',{ set: 1 });
        delete global.race['slow'];
    }

    if (global.race['no_crispr'] || global.race['badgenes']){
        let repeat = global.race['badgenes'] ? 3 : 1;
        for (let j=0; j<repeat; j++){
            for (let i=0; i<10; i++){
                let trait = neg_roll_traits[Math.rand(0,neg_roll_traits.length)];
                if (global.race[trait]){
                    if (global.race[trait] == 0.25){
                        continue;
                    }
                    setTraitRank(trait,{down:true});
                    if (j === 0 && global.race['badgenes']){
                        setTraitRank(trait,{down:true});
                    }
                    break;
                }
                else if ((global.race['smart'] && trait === 'dumb')) {
                    continue;
                }
                if (!global.race[trait]){
                    let rank = 1;
                    if (global.race['badgenes']){
                        rank = j === 0 ? 0.5 : 2;
                    }
                    global.race[trait] = rank;
                    break;
                }
            }
        }
    }

    if (global.race.universe === 'evil'){
        if (global.race['evil']){
            delete global.race['evil'];
        }
        else if (races[global.race.species].type !== 'angelic'){
            global.race['evil'] = 1;
        }
    }
    else if (global.race.universe === 'antimatter' && (!global.stats.feat['annihilation'] || global.stats.feat['annihilation'] < alevel())){
        global.race['amexplode'] = 1;
    }

    if (global.race['unified']){
        global.tech['world_control'] = 1;
        global.tech['unify'] = 2;
    }

    if (global.race['orbit_decay']){
        global.race['orbit_decay'] = 5000;

        popover(`infoTimer`, function(){
            return global.race['orbit_decayed'] ? '' : loc('evo_challenge_orbit_decay_impact',[global.race['orbit_decay'] - global.stats.days]);
        },
        {
            elm: `#infoTimer`,
            classes: `has-background-light has-text-dark`
        });
    }

    clearElement($('#resources'));
    defineResources();
    if (!global.race['kindling_kindred'] && !global.race['smoldering']){
        global.resource.Lumber.display = true;
    }
    else {
        global.resource.Stone.display = true;
    }
    registerTech('club');

    global.city.calendar.day = 0;

    var city_actions = global.race['kindling_kindred'] || global.race['smoldering'] ? ['food','stone'] : ['food','lumber','stone'];
    if (global.race['smoldering']){
        city_actions.push('chrysotile');
    }
    if (global.race['evil'] && !global.race['kindling_kindred'] && !global.race['smoldering']){
        global.city['slaughter'] = 1;
        city_actions = ['slaughter'];
    }
    for (var i = 0; i < city_actions.length; i++) {
        if (global.city[city_actions[i]]){
            addAction('city',city_actions[i]);
        }
    }

    if (global.race.species === 'custom' && global.custom.hasOwnProperty('race0')){
        global.race['untapped'] = calcGenomeScore({
            name: global.custom.race0.name,
            desc: global.custom.race0.desc,
            entity: global.custom.race0.entity,
            home: global.custom.race0.home,
            red: global.custom.race0.red,
            hell: global.custom.race0.hell,
            gas: global.custom.race0.gas,
            gas_moon: global.custom.race0.gas_moon,
            dwarf: global.custom.race0.dwarf,
            genes: 0,
            genus: global.custom.race0.genus,
            traitlist: global.custom.race0.traits,
            ranks: global.custom.race0?.ranks || {} 
        });
    }

    if (global.race.species === 'hybrid' && global.custom.hasOwnProperty('race1')){
        global.race['untapped'] = calcGenomeScore({
            name: global.custom.race1.name,
            desc: global.custom.race1.desc,
            entity: global.custom.race1.entity,
            home: global.custom.race1.home,
            red: global.custom.race1.red,
            hell: global.custom.race1.hell,
            gas: global.custom.race1.gas,
            gas_moon: global.custom.race1.gas_moon,
            dwarf: global.custom.race1.dwarf,
            genes: 0,
            genus: global.custom.race1.genus,
            hybrid: global.custom.race1.hybrid,
            traitlist: global.custom.race1.traits,
            ranks: global.custom.race1?.ranks || {} 
        });
    }

    if (global.race.unfathomable){
        global.city['surfaceDwellers'] = [];
        while (global.city.surfaceDwellers.length < traits.unfathomable.vars()[0]){
            global.city.surfaceDwellers.push(basicRace(global.city.surfaceDwellers));
        }
    }

    global.settings.civTabs = 1;
    global.settings.showEvolve = false;
    global.settings.showCiv = true;
    global.settings.showCity = true;

    global.civic.govern.type = 'anarchy';
    global.civic.govern.rev = 0;
    global.civic.govern.fr = 0;
    
    if (global.genes['queue']){
        global.tech['queue'] = 1;
        global.tech['r_queue'] = 1;
        global.queue.display = true;
        global.r_queue.display = true;
        if (!global.settings.msgFilters.queue.unlocked){
            global.settings.msgFilters.queue.unlocked = true;
            global.settings.msgFilters.queue.vis = true;
        }
        if (!global.settings.msgFilters.building_queue.unlocked){
            global.settings.msgFilters.building_queue.unlocked = true;
            global.settings.msgFilters.building_queue.vis = true;
            global.settings.msgFilters.research_queue.unlocked = true;
            global.settings.msgFilters.research_queue.vis = true;
        }
        // No need to check for civTab setting because it was set to another tab above
        if (global.settings.tabLoad){
            $(`#resQueue`).removeAttr('style');
        }
    }

    Object.keys(global.genes.minor).forEach(function (trait){
        global.race[trait] = trait === 'mastery' ? global.genes.minor[trait] : global.genes.minor[trait] * 2;
    });
    
    let tempMTOrder = [];
    global.settings.mtorder.forEach(function(trait){
       if (global.genes.minor[trait] || trait === 'mastery'){
           tempMTOrder.push(trait);
       }
    });
    global.settings.mtorder = tempMTOrder;

    if (global.genes['evolve'] && global.genes['evolve'] >= 2){
        for (let i=1; i<8; i++){
            if (global.genes['evolve'] >= i+1){
                randomMinorTrait(i);
            }
        }
    }

    let civ0name = genCivName();
    global.civic.foreign.gov0['name'] = {
        s0: civ0name.s0,
        s1: civ0name.s1
    };
    let civ1name = genCivName();
    while (civ0name.s0 === civ1name.s0 && civ0name.s1 === civ1name.s1){
        civ1name = genCivName();
    }
    global.civic.foreign.gov1['name'] = {
        s0: civ1name.s0,
        s1: civ1name.s1
    };
    let civ2name = genCivName();
    while ((civ0name.s0 === civ2name.s0 && civ0name.s1 === civ2name.s1) || (civ1name.s0 === civ2name.s0 && civ1name.s1 === civ2name.s1)){
        civ2name = genCivName();
    }
    global.civic.foreign.gov2['name'] = {
        s0: civ2name.s0,
        s1: civ2name.s1
    };
}

export function sentience_s2($ctx){
        if (global.race['truepath'] || global.race['lone_survivor']){
        global.civic.foreign.gov0.mil = Math.round(global.civic.foreign.gov0.mil * 1.5);
        global.civic.foreign.gov1.mil = Math.round(global.civic.foreign.gov1.mil * 1.4);
        global.civic.foreign.gov2.mil = Math.round(global.civic.foreign.gov2.mil * 1.25);
    
        global.civic.foreign['gov3'] = {
            unrest: 0,
            hstl: Math.floor(seededRandom(20,40)),
            mil: Math.floor(seededRandom(650,750)),
            eco: Math.floor(seededRandom(250,300)),
            spy: 0,
            esp: 0,
            trn: 0,
            sab: 0,
            act: 'none'
        };

        let civAltName = genCivName(true);
        global.civic.foreign.gov3['name'] = {
            s0: civAltName.s0,
            s1: civAltName.s1
        };

        global.civic.foreign['gov4'] = {
            unrest: 0,
            hstl: 100,
            mil: 300,
            eco: 100,
            spy: 0,
            esp: 0,
            trn: 0,
            sab: 0,
            act: 'none'
        };

        let civAltName2 = genCivName(true);
        while (civAltName2.s1 === civAltName.s1){
            civAltName2 = genCivName(true);
        }
        global.civic.foreign.gov4['name'] = {
            s0: 99,
            s1: civAltName2.s1
        };
    }

    if (global.race['cataclysm']){
        messageQueue(loc('cataclysm_sentience',[races[global.race.species].home,flib('name')]),'info',false,['progress']);
    }
    else {
        messageQueue(loc('sentience',[loc('genelab_genus_' + (global.race.maintype || races[global.race.species].type)),races[global.race.species].entity,flib('name')]),'info',false,['progress']);
    }

    if (global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 1){
        global.resource.Steel.display = true;
        global.resource.Steel.amount = 25;
        if (global.stats.achieve.technophobe.l >= 3){
            if (!global.race['truepath'] && !global.race['lone_survivor']){
                global.resource.Soul_Gem.display = true;
            }
            let gems = 1;
            for (let i=1; i<universe_affixes.length; i++){
                if (global.stats.achieve.technophobe[universe_affixes[i]] && global.stats.achieve.technophobe[universe_affixes[i]] >= 5){
                    gems++;
                }
            }
            global.resource.Soul_Gem.amount = gems;
        }
    }

    if (global.race.species === 'tortoisan'){
        let color = Math.floor(seededRandom(100));
        if (color === 99){
            global.race['shell_color'] = 'rainbow';
        }
        else if (color >= 97 && color <= 98){
            global.race['shell_color'] = 'white';
        }
        else if (color >= 93 && color <= 96){
            global.race['shell_color'] = 'red';
        }
        else if (color >= 89 && color <= 92){
            global.race['shell_color'] = 'orange';
        }
        else if (color >= 85 && color <= 88){
            global.race['shell_color'] = 'yellow';
        }
        else if (color >= 75 && color <= 84){
            global.race['shell_color'] = 'purple';
        }
        else if (color >= 65 && color <= 74){
            global.race['shell_color'] = 'blue';
        }
        else {
            global.race['shell_color'] = 'green';
        }
    }

    if (global.race.species === 'vulpine'){
        let color = Math.floor(seededRandom(100));
        if (color >= 85){
            global.race['fox_color'] = 'white';
        }
        else if (color >= 70 && color <= 84){
            global.race['fox_color'] = 'tan';
        }
        else if (color >= 55 && color <= 69){
            global.race['fox_color'] = 'silver';
        }
        else if (color >= 35 && color <= 54){
            global.race['fox_color'] = 'grey';
        }
        else {
            global.race['fox_color'] = 'red';
        }
    }
    
    calcPillar(true);

    if (global.blood['aware']){
        global.settings.arpa['blood'] = true;
        global.tech['b_stone'] = 2;
    }

    defineJobs(true);
    commisionGarrison();
    defineGovernment(true);

    if (global.race['shapeshifter']){
        shapeShift(false,true);
    }

    if (global.race['carnivore'] || global.race['soul_eater'] || global.race['unfathomable']){
        global.civic.d_job = 'hunter';
        global.civic.hunter.display = true;
    }
    else if (global.race['forager']){
        global.civic.d_job = 'forager';
        global.civic.forager.display = true;
    }
    else {
        global.civic.d_job = 'unemployed';
        global.civic.unemployed.display = true;
    }

    if (global.race['hooved']){
        global.resource.Horseshoe.display = true;
        global.resource.Horseshoe.amount = 5;
        global.race['shoecnt'] = 5;
    }

    if (global.race['deconstructor']){
        global.resource.Nanite.display = true;
        global.city['nanite_factory'] = { count: 1,
            Lumber: 0, Chrysotile: 0, Stone: 0, Crystal: 0, 
            Furs: 0, Copper: 0, Iron: 0, Aluminium: 0,
            Cement: 0, Coal: 0, Oil: 0, Uranium: 0,
            Steel: 0, Titanium: 0, Alloy: 0, Polymer: 0,
            Iridium: 0, Helium_3: 0, Water: 0, Deuterium: 0,
            Neutronium: 0, Adamantite: 0, Bolognium: 0, Orichalcum: 0,
        };
        global.settings.showIndustry = true;
    }

    calc_mastery(true);

    if (global.race['truepath'] || global.race['lone_survivor']){
        Object.keys(resource_values).forEach(function(res){
            if (global.resource.hasOwnProperty(res)){
                global.resource[res].value = resource_values[res] * 2;
            }
        });
    }

    altRace(global.race.species,true);

    tagEvent('sentience',{
        'species': global.race.species,
        'challenge': alevel() - 1
    });

    if (global.stats.feat['adept']){
        let rank = checkAdept();
        global.resource.Food.amount += rank * 100;
        global.resource.Stone.max += rank * 60;
        global.resource.Stone.amount += rank * 100;
        if (global.race['smoldering']){
            global.resource.Chrysotile.max += rank * 60;
            global.resource.Chrysotile.amount += rank * 100;
        }
        else {
            global.resource.Lumber.max += rank * 60;
            global.resource.Lumber.amount += rank * 100;
        }
    }

    if(global.race['fasting']){
        global.resource.Food.amount = 0;
    }
    if (global.race['cataclysm']){
        cataclysm();
    }
    else if (global.race['lone_survivor']){
        loneSurvivor();
    }
    else if (global.race['warlord']){
        warlordSetup();
    }
    else if (global.race['artifical']){
        aiStart();
    }

    if (global.settings.tabLoad){
        drawCity();
        clearElement($(`#r_civics`));
        defineGovernment();
        defineGarrison();
        buildGarrison($('#c_garrison'),false);
        foreignGov();
        defineIndustry();
        initResourceTabs('market');
        initResourceTabs('storage');

        if (tmp_vars.hasOwnProperty('resource')){
            Object.keys(tmp_vars.resource).forEach(function(name){
                let color = tmp_vars.resource[name].color;
                let tradable = tmp_vars.resource[name].tradable;
                let stackable = tmp_vars.resource[name].stackable;
                if (stackable){
                    var market_item = $(`<div id="stack-${name}" class="market-item" v-show="display"></div>`);
                    $('#resStorage').append(market_item);
                    containerItem(`#stack-${name}`,market_item,name,color,true);
                }
                if (tradable){
                    var market_item = $(`<div id="market-${name}" class="market-item" v-show="r.display"></div>`);
                    $('#market').append(market_item);
                    marketItem(`#market-${name}`,market_item,name,color,true);
                }
            });
        }
        tradeSummery();

        arpa('Genetics');
        arpa('Crispr');
        arpa('Blood');
    }
    else {
        loadTab('mTabCivil');
    }

    if (global.queue.hasOwnProperty('queue')){
        global.queue.queue = [];
    }

    if (global.race['slow'] || global.race['hyper'] || global.race.species === 'junker'){
        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
        if (webWorker.w){
            webWorker.w.terminate();
        }
        window.location.reload();
    }
}

import { loc } from './locale.js';
import { global, sizeApproximation } from './vars.js';
import { costMultiplier, powerModifier, vBind, darkEffect, powerCostMod } from './functions.js';
import { biomes, planetTraits, traits, races, traitCostMod } from './races.js';
import { BHStorageMulti, payCosts, structName, checkPowerRequirements, powerOnNewStruct, buildTemplate, storageMultipler, bananaPerk, bank_vault, conceal_adjust } from './actions.js';
import { spatialReasoning, unlockCrates, unlockContainers } from './resources.js';
import { incrementStruct } from './space.js';
import { jobScale } from './jobs.js';
import { govActive } from './governor.js';
import { defineIndustry } from './industry.js';

// Bagian dari actions_city (18 entri: compost .. rock_quarry), dipisah dari ac_city.js. Urutan entri sama persis.
export const actions_cityPart2 = {
        compost: {
            id: 'city-compost',
            title: loc('city_compost_heap'),
            desc: loc('city_compost_heap_desc'),
            category: 'residential',
            reqs: { compost: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){
                    offset = offset || 0;
                    if ((global.city['compost'] ? global.city['compost'].count : 0) + offset >= 3){
                        return costMultiplier('compost', offset, 50, 1.32);
                    }
                    else {
                        return 0;
                    }
                },
                Lumber(offset){ return costMultiplier('compost', offset, 12, 1.36); },
                Stone(offset){ return costMultiplier('compost', offset, 12, 1.36); }
            },
            effect(){
                let generated = 1.2 + ((global.tech['compost'] ? global.tech['compost'] : 0) * 0.8);
                generated *= global.city.biome === 'grassland' ? biomes.grassland.vars()[0] : 1;
                generated *= global.city.biome === 'savanna' ? biomes.savanna.vars()[0] : 1;
                generated *= global.city.biome === 'ashland' ? biomes.ashland.vars()[0] : 1;
                generated *= global.city.biome === 'volcanic' ? biomes.volcanic.vars()[0] : 1;
                generated *= global.city.biome === 'hellscape' ? biomes.hellscape.vars()[0] : 1;
                generated *= global.city.ptrait.includes('trashed') ? planetTraits.trashed.vars()[0] : 1;
                generated = +(generated).toFixed(2);
                let store = BHStorageMulti(spatialReasoning(200));
                let wood = global.race['kindling_kindred'] || global.race['smoldering'] ? `` : `<div class="has-text-caution">${loc('city_compost_heap_effect2',[0.5,global.resource.Lumber.name])}</div>`;
                return `<div>${loc('city_compost_heap_effect',[generated])}</div><div>${loc('city_compost_heap_effect3',[store])}</div>${wood}`;
            },
            switchable(){ return true; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('compost','city');
                    global.city.compost.on++;
                    global['resource']['Food'].max += BHStorageMulti(spatialReasoning(200));
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['compost','city']
                };
            }
        },
        mill: {
            id: 'city-mill',
            title(){
                return global.tech['agriculture'] >= 5 ? structName('windmill') : loc('city_mill_title1');
            },
            desc(){
                let bonus = global.tech['agriculture'] >= 5 ? 5 : 3;
                if (global.tech['agriculture'] >= 6){
                    let power = $(this)[0].powered() * -1;
                    return loc('city_mill_desc2',[bonus,power]);
                }
                else {
                    return loc('city_mill_desc1',[bonus]);
                }
            },
            category: 'utility',
            reqs: { agriculture: 4 },
            not_tech: ['wind_plant'],
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('mill', offset, 1000, 1.31); },
                Lumber(offset){ return costMultiplier('mill', offset, 600, 1.33); },
                Iron(offset){ return costMultiplier('mill', offset, 150, 1.33); },
                Cement(offset){ return costMultiplier('mill', offset, 125, 1.33); },
            },
            powered(){ return powerModifier(global.race['environmentalist'] ? -(traits.environmentalist.vars()[1]) : -1); },
            power_reqs: { agriculture: 6 },
            effect(){
                if (global.tech['agriculture'] >= 6){
                    return `<span class="has-text-success">${loc('city_on')}</span> ${loc('city_mill_effect1')} <span class="has-text-danger">${loc('city_off')}</span> ${loc('city_mill_effect2')}`;
                }
                else {
                    return false;
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('mill','city');
                    // Prevent alwaysPower from enabling mills that were built before researching Wind Turbines
                    if (checkPowerRequirements($(this)[0])){
                        powerOnNewStruct($(this)[0]);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['mill','city']
                };
            },
        },
        windmill: {
            id: 'city-windmill',
            title(){
                return global.race['unfathomable'] ? loc('tech_watermill') : structName('windmill');
            },
            desc(){
                return global.race['unfathomable'] ? loc('tech_watermill') : structName('windmill');
            },
            wiki: false,
            category: 'utility',
            reqs: { wind_plant: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            powered(){ return powerModifier(global.race['environmentalist'] ? -(traits.environmentalist.vars()[1]) : -1); },
            power_reqs: { false: 1 },
            cost: {
                Money(offset){ return costMultiplier('windmill', offset, 1000, 1.31); },
                Lumber(offset){ return costMultiplier('windmill', offset, 600, 1.33); },
                Iron(offset){ return costMultiplier('windmill', offset, 150, 1.33); },
                Cement(offset){ return costMultiplier('windmill', offset, 125, 1.33); },
            },
            effect(){
                let power = $(this)[0].powered() * -1;
                return `<div>${loc('space_dwarf_reactor_effect1',[power])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('windmill','city');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['windmill','city']
                };
            },
        },
        silo: {
            id: 'city-silo',
            title: loc('city_silo'),
            desc: loc('city_food_storage'),
            category: 'trade',
            reqs: { agriculture: 3 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('silo', offset, 85, 1.32); },
                Lumber(offset){ return costMultiplier('silo', offset, 65, 1.36) },
                Stone(offset){ return costMultiplier('silo', offset, 50, 1.36); },
                Iron(offset){ return ((global.city.silo ? global.city.silo.count : 0) + (offset || 0)) >= 4 && global.city.ptrait.includes('unstable') ? costMultiplier('silo', offset, 10, 1.36) : 0; }
            },
            effect(){
                let food = BHStorageMulti(spatialReasoning(500));
                return loc('plus_max_resource',[food, global.resource.Food.name]);
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('silo','city');
                    global['resource']['Food'].max += BHStorageMulti(spatialReasoning(500));
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['silo','city']
                };
            },
        },
        assembly: buildTemplate(`assembly`,'city'),
        garrison: {
            id: 'city-garrison',
            title(){ return global.race['flier'] ? loc('city_garrison_flier') : loc('city_garrison'); },
            desc: loc('city_garrison_desc'),
            category: 'military',
            reqs: { military: 1, housing: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('garrison', offset, 240, 1.5); },
                Stone(offset){ return costMultiplier('garrison', offset, 260, 1.46); },
                Iron(offset){ return ((global.city['garrison'] ? global.city.garrison.count : 0) + (offset || 0)) >= 4 && global.city.ptrait.includes('unstable') ? costMultiplier('garrison', offset, 50, 1.4) : 0; },
                Horseshoe(){ return global.race['hooved'] ? (global.race['chameleon'] ? 1 : 2) : 0; }
            },
            effect(){
                let bunks = $(this)[0].soldiers();
                let desc = `<div>${loc('plus_max_resource',[bunks,loc('civics_garrison_soldiers')])}</div>`;
                if (global.race.universe === 'evil'){
                    desc += `<div>${loc('plus_max_resource',[0.5,global.resource.Authority.name])}</div>`;
                }
                return desc;
            },
            switchable(){ return true; },
            action(args){
                if (payCosts($(this)[0])){
                    global.settings['showMil'] = true;
                    if (!global.settings.msgFilters.combat.unlocked){
                        global.settings.msgFilters.combat.unlocked = true;
                        global.settings.msgFilters.combat.vis = true;
                    }
                    if (!global.civic.garrison.display){
                        global.civic.garrison.display = true;
                        vBind({el: `#garrison`},'update');
                        vBind({el: `#c_garrison`},'update');
                    }
                    global.civic['garrison'].max += $(this)[0].soldiers();
                    incrementStruct('garrison','city');
                    global.city['garrison'].on++;
                    global.resource.Furs.display = true;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['garrison','city']
                };
            },
            soldiers(){
                let soldiers = global.tech['military'] >= 5 ? 3 : 2;
                if (global.race['chameleon']){
                    soldiers--;
                }
                if (global.race['grenadier']){
                    soldiers--;
                }
                if (soldiers <= 0){ return 1; }
                return jobScale(soldiers);
            }
        },
        hospital: {
            id: 'city-hospital',
            title(){ return structName('hospital'); },
            desc: loc('city_hospital_desc'),
            category: 'military',
            reqs: { medic: 1 },
            not_trait: ['cataclysm','artifical'],
            cost: {
                Money(offset){ return costMultiplier('hospital', offset, 22000, 1.32); },
                Furs(offset){ return costMultiplier('hospital', offset, 4000, 1.32); },
                Iron(offset){ return global.city.ptrait.includes('unstable') ? costMultiplier('hospital', offset, 500, 1.32) : 0; },
                Aluminium(offset){ return costMultiplier('hospital', offset, 10000, 1.32); },
            },
            effect(){
                let clinic = global.tech['reproduction'] && global.tech.reproduction >= 2 ? `<div>${loc('city_hospital_effect2')}</div>` : ``;
                let healing = (global.tech['medic'] ?? 1) * 5;
                let desc = `<div>${loc('city_hospital_effect',[healing])}</div>${clinic}`;
                if (!global.race['artifical'] && global.race.hasOwnProperty('vax')){
                    desc = desc + `<div>${loc('tau_home_disease_lab_vax',[+global.race.vax.toFixed(2)])}</div>`;
                }
                return desc;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('hospital','city');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['hospital','city']
                };
            },
        },
        boot_camp: {
            id: 'city-boot_camp',
            title(){ return global.race['artifical'] ? loc('city_boot_camp_art') : loc('city_boot_camp'); },
            desc(){ return global.race['artifical'] ? loc('city_boot_camp_art_desc',[races[global.race.species].name]) : loc('city_boot_camp_desc'); },
            category: 'military',
            reqs: { boot_camp: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('boot_camp', offset, 50000, 1.32); },
                Lumber(offset){ return costMultiplier('boot_camp', offset, 21500, 1.32); },
                Iron(offset){ return global.city.ptrait.includes('unstable') ? costMultiplier('boot_camp', offset, 300, 1.32) : 0; },
                Aluminium(offset){ return costMultiplier('boot_camp', offset, 12000, 1.32); },
                Brick(offset){ return costMultiplier('boot_camp', offset, 1400, 1.32); },
            },
            effect(){
                let rate = global.tech['boot_camp'] >= 2 ? 8 : 5;
                if (global.blood['lust']){
                    rate += global.blood.lust * 0.2;
                }
                let milVal = govActive('militant',0);
                if (milVal){
                    rate *= 1 + (milVal / 100);
                }
                let effect = global.tech['spy'] && global.tech['spy'] >= 3 ? `<div>${loc('city_boot_camp_effect',[rate])}</div><div>${loc('city_boot_camp_effect2',[10])}</div>` : `<div>${loc('city_boot_camp_effect',[rate])}</div>`;
                if (global.race['artifical'] && !global.race['orbit_decayed']){
                    let repair = global.tech['medic'] || 1;
                    effect += `<div>${loc('city_boot_camp_art_effect',[repair * 5])}</div>`;
                }
                if (global.race['artifical'] && global.race.hasOwnProperty('vax')){
                    effect += `<div>${loc('tau_home_disease_lab_vax',[+global.race.vax.toFixed(2)])}</div>`;
                }
                return effect;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('boot_camp','city');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['boot_camp','city']
                };
            },
        },
        shed: {
            id: 'city-shed',
            title(){
                return global.tech['storage'] >= 3 ? (global.tech['storage'] >= 4 ? loc('city_shed_title3') : loc('city_shed_title2')) : loc('city_shed_title1');
            },
            desc(){
                let storage = global.tech['storage'] >= 3 ? (global.tech['storage'] >= 4 ? loc('city_shed_desc_size3') : loc('city_shed_desc_size2')) : loc('city_shed_desc_size1');
                return loc('city_shed_desc',[storage]);
            },
            category: 'trade',
            reqs: { storage: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('shed', offset, 75, 1.22); },
                Lumber(offset){
                    if (global.tech['storage'] && global.tech['storage'] < 4){
                        return costMultiplier('shed', offset, 55, 1.32);
                    }
                    else {
                        return 0;
                    }
                },
                Stone(offset){
                    if (global.tech['storage'] && global.tech['storage'] < 3){
                        return costMultiplier('shed', offset, 45, 1.32);
                    }
                    else {
                        return 0;
                    }
                },
                Iron(offset){
                    if (global.tech['storage'] && global.tech['storage'] >= 4){
                        return costMultiplier('shed', offset, 22, 1.32);
                    }
                    else {
                        return 0;
                    }
                },
                Cement(offset){
                    if (global.tech['storage'] && global.tech['storage'] >= 3){
                        return costMultiplier('shed', offset, 18, 1.32);
                    }
                    else {
                        return 0;
                    }
                }
            },
            res(){
                let r_list = ['Lumber','Stone','Chrysotile','Crystal','Furs','Copper','Iron','Aluminium','Cement','Coal'];
                if (global.tech['storage'] >= 3 && global.resource.Steel.display){
                    r_list.push('Steel');
                }
                if (global.tech['storage'] >= 4 && global.resource.Titanium.display){
                    r_list.push('Titanium');
                }
                if (global.tech['shelving'] && global.tech.shelving >= 3 && global.resource.Graphene.display){
                    r_list.push('Graphene');
                }
                if (global.tech['shelving'] && global.tech.shelving >= 3 && global.resource.Stanene.display){
                    r_list.push('Stanene');
                }
                if (global.race['unfathomable']){
                    r_list.push('Food');
                }
                return r_list;
            },
            val(res){
                switch (res){
                    case 'Food':
                        return 50;
                    case 'Lumber':
                        return 300;
                    case 'Stone':
                        return 300;
                    case 'Chrysotile':
                        return 300;
                    case 'Crystal':
                        return 8;
                    case 'Furs':
                        return 125;
                    case 'Copper':
                        return 90;
                    case 'Iron':
                        return 125;
                    case 'Aluminium':
                        return 90;
                    case 'Cement':
                        return 100;
                    case 'Coal':
                        return 75;
                    case 'Steel':
                        return 40;
                    case 'Titanium':
                        return 20;
                    case 'Graphene':
                        return 15;
                    case 'Stanene':
                        return 25;
                    default:
                        return 0;
                }
            },
            effect(wiki){
                let storage = '<div class="aTable">';
                let multiplier = storageMultipler(1, wiki);
                for (const res of $(this)[0].res()){
                    if (global.resource[res].display){
                        let val = sizeApproximation(+(spatialReasoning($(this)[0].val(res)) * multiplier).toFixed(0),1);
                        storage = storage + `<span>${loc('plus_max_resource',[val,global.resource[res].name])}</span>`;
                    }
                };
                storage = storage + '</div>';
                return storage;
            },
            wide: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('shed','city');
                    let multiplier = storageMultipler();
                    for (const res of $(this)[0].res()){
                        if (global.resource[res].display){
                            global.resource[res].max += (spatialReasoning($(this)[0].val(res) * multiplier));
                        }
                    };
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['shed','city']
                };
            },
        },
        storage_yard: {
            id: 'city-storage_yard',
            title(){ return structName('storage_yard'); },
            desc: loc('city_storage_yard_desc'),
            category: 'trade',
            reqs: { container: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('storage_yard', offset, 10, bananaPerk(1.00)); },
                Brick(offset){ return costMultiplier('storage_yard', offset, 3, bananaPerk(1.00)); },
                Wrought_Iron(offset){ return costMultiplier('storage_yard', offset, 5, bananaPerk(1.00)); }
            },
            effect(){
                let cap = global.tech.container >= 3 ? 20 : 10;
                if (global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 1){
                    cap += 10;
                }
                if (global.tech['world_control']){
                    cap += 10;
                }
                if (global.tech['particles'] && global.tech['particles'] >= 2){
                    cap *= 2;
                }
                if (global.tech['trade'] && global.tech['trade'] >= 3){
                    return `<div>${loc('plus_max_resource',[cap,global.resource.Crates.name])}</div><div>${loc('city_trade_effect',[100])}</div>`;
                }
                else {
                    return loc('plus_max_resource',[cap,global.resource.Crates.name]);
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('storage_yard','city');
                    let cap = global.tech.container >= 3 ? 20 : 10;
                    if (global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 1){
                        cap += 10;
                    }
                    if (global.tech['world_control']){
                        cap += 10;
                    }
                    if (global.tech['particles'] && global.tech['particles'] >= 2){
                        cap *= 2;
                    }
                    global.resource.Crates.max += cap;
                    // A freight yard is always required, so this is the only struct that can unlock crates
                    // Any scenario where a freight yard is unnecessary will begin with crates unlocked
                    if (!global.resource.Crates.display){
                        unlockCrates();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['storage_yard','city']
                };
            },
        },
        warehouse: {
            id: 'city-warehouse',
            title: loc('city_warehouse'),
            desc: loc('city_warehouse_desc'),
            category: 'trade',
            reqs: { steel_container: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('warehouse', offset, 400, bananaPerk(1.00)); },
                Cement(offset){ return costMultiplier('warehouse', offset, 75, bananaPerk(1.00)); },
                Sheet_Metal(offset){ return costMultiplier('warehouse', offset, 25, bananaPerk(1.00)); }
            },
            effect(){
                let cap = global.tech.steel_container >= 2 ? 20 : 10;
                if (global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 2){
                    cap += 10;
                }
                if (global.tech['world_control']){
                    cap += 10;
                }
                if (global.tech['particles'] && global.tech['particles'] >= 2){
                    cap *= 2;
                }
                return loc('plus_max_resource',[cap,global.resource.Containers.name]);
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('warehouse','city');
                    let cap = global.tech['steel_container'] >= 2 ? 20 : 10;
                    if (global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 2){
                        cap += 10;
                    }
                    if (global.tech['world_control']){
                        cap += 10;
                    }
                    if (global.tech['particles'] && global.tech['particles'] >= 2){
                        cap *= 2;
                    }
                    global.resource.Containers.max += cap;
                    if (!global.resource.Containers.display){
                        unlockContainers();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['warehouse','city']
                };
            },
        },
        bank: {
            id: 'city-bank',
            title: loc('city_bank'),
            desc(){
                let planet = races[global.race.species].home;
                return loc('city_bank_desc',[planet]);
            },
            category: 'commercial',
            reqs: { banking: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('bank', offset, traitCostMod('untrustworthy',250), 1.35); },
                Lumber(offset){ return costMultiplier('bank', offset, traitCostMod('untrustworthy',75), 1.32); },
                Stone(offset){ return costMultiplier('bank', offset, traitCostMod('untrustworthy',100), 1.35); },
                Iron(offset){ return ((global.city['bank'] ? global.city.bank.count : 0) + (offset || 0)) >= 2 && global.city.ptrait.includes('unstable') ? costMultiplier('bank', offset, traitCostMod('untrustworthy',30), 1.3) : 0; }
            },
            effect(){
                let vault = bank_vault();
                vault = spatialReasoning(vault);
                vault = (+(vault).toFixed(0)).toLocaleString();

                if (global.tech['banking'] >= 2){
                    return `<div>${loc('plus_max_resource',[`\$${vault}`,loc('resource_Money_name')])}</div><div>${loc('plus_max_resource',[jobScale(1),loc('banker_name')])}</div>`;
                }
                else {
                    return loc('plus_max_resource',[`\$${vault}`,loc('resource_Money_name')]);
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    global['resource']['Money'].max += spatialReasoning(1800);
                    incrementStruct('bank','city');
                    global.civic.banker.max = jobScale(global.city.bank.count);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['bank','city']
                };
            }
        },
        pylon: {
            id: 'city-pylon',
            title: loc('city_pylon'),
            desc: loc('city_pylon'),
            category: 'industrial',
            reqs: { magic: 2 },
            not_trait: ['cataclysm','orbit_decayed'],
            cost: {
                Money(offset){
                    offset = offset || 0;
                    if ((global.city['pylon'] ? global.city['pylon'].count : 0) + offset >= 2){
                        return costMultiplier('pylon', offset, 10, 1.48);
                    }
                    else {
                        return 0;
                    }
                },
                Stone(offset){ return costMultiplier('pylon', offset, 12, 1.42); },
                Crystal(offset){ return costMultiplier('pylon', offset, 8, 1.42) - 3; }
            },
            effect(){
                let max = spatialReasoning(5);
                let mana = +(0.01 * darkEffect('magic')).toFixed(3);
                return `<div>${loc('gain',[mana,global.resource.Mana.name])}</div><div>${loc('plus_max_resource',[max,global.resource.Mana.name])}</div>`;
            },
            special(){ return global.tech['magic'] && global.tech.magic >= 3 ? true : false; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('pylon','city');
                    global.resource.Mana.max += spatialReasoning(5);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['pylon','city']
                };
            }
        },
        conceal_ward: {
            id: 'city-conceal_ward',
            title: loc('city_conceal_ward'),
            desc: loc('city_conceal_ward'),
            category: 'industrial',
            reqs: { roguemagic: 3 },
            not_trait: ['cataclysm','orbit_decayed'],
            cost: {
                Money(offset){return costMultiplier('conceal_ward', offset, 500, 1.25);  },
                Mana(offset){ return costMultiplier('conceal_ward', offset, conceal_adjust(42), 1.25); },
                Crystal(offset){ return costMultiplier('conceal_ward', offset, 5, 1.25); }
            },
            effect(){
                let ward = global.tech['roguemagic'] && global.tech.roguemagic >= 8 ? 1.25 : 1;
                return `<div>${loc('city_conceal_ward_effect',[ward])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('conceal_ward','city');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['conceal_ward','city']
                };
            }
        },
        graveyard: {
            id: 'city-graveyard',
            title: loc('city_graveyard'),
            desc: loc('city_graveyard_desc'),
            category: 'industrial',
            reqs: { reclaimer: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){
                    offset = offset || 0;
                    if ((global.city['graveyard'] ? global.city['graveyard'].count : 0) + offset >= 5){
                        return costMultiplier('graveyard', offset, 5, 1.85);
                    }
                    else {
                        return 0;
                    }
                },
                Lumber(offset){ return costMultiplier('graveyard', offset, 2, 1.95); },
                Stone(offset){ return costMultiplier('graveyard', offset, 6, 1.9); }
            },
            effect(){
                let lum = BHStorageMulti(spatialReasoning(100));
                return `<div>${loc('city_graveyard_effect',[8])}</div><div>${loc('plus_max_resource',[lum,global.resource.Lumber.name])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('graveyard','city');
                    global['resource']['Lumber'].max += BHStorageMulti(spatialReasoning(100));
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['graveyard','city']
                };
            }
        },
        lumber_yard: {
            id: 'city-lumber_yard',
            title(){ return structName('lumberyard'); },
            desc(){ return structName('lumberyard'); },
            category: 'industrial',
            reqs: { axe: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){
                    offset = offset || 0;
                    if ((global.city['lumber_yard'] ? global.city['lumber_yard'].count : 0) + offset >= 5){
                        return costMultiplier('lumber_yard', offset, 5, 1.85);
                    }
                    else {
                        return 0;
                    }
                },
                Lumber(offset){ return costMultiplier('lumber_yard', offset, 6, 1.9); },
                Stone(offset){ return costMultiplier('lumber_yard', offset, 2, 1.95); }
            },
            effect(){
                let lum = BHStorageMulti(spatialReasoning(100));
                return `<div>${loc('production',[2,global.resource.Lumber.name])}</div><div>${loc('plus_max_resource',[lum,global.resource.Lumber.name])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('lumber_yard','city');
                    global.civic.lumberjack.display = true;
                    global['resource']['Lumber'].max += BHStorageMulti(spatialReasoning(100));
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['lumber_yard','city']
                };
            }
        },
        sawmill: {
            id: 'city-sawmill',
            title(){ return structName('sawmill'); },
            desc(){ return structName('sawmill'); },
            category: 'industrial',
            reqs: { saw: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('sawmill', offset, 3000, 1.26); },
                Iron(offset){ return costMultiplier('sawmill', offset, 400, 1.26); },
                Cement(offset){ return costMultiplier('sawmill', offset, 420, 1.26); }
            },
            effect(){
                let impact = global.tech['saw'] >= 2 ? 8 : 5;
                let lum = BHStorageMulti(spatialReasoning(200));
                let desc = `<div>${loc('plus_max_resource',[lum,global.resource.Lumber.name])}</div><div>${loc('production',[impact,global.resource.Lumber.name])}</div>`;
                if (global.tech['foundry'] && global.tech['foundry'] >= 4){
                    desc = desc + `<div>${loc('crafting',[2,global.resource.Plywood.name])}</div>`;
                }
                if (global.city.powered){
                    desc = desc + `<div class="has-text-caution">${loc('city_sawmill_effect3',[4,$(this)[0].powered()])}</div>`;
                }
                return desc;
            },
            powered(){ return powerCostMod(1); },
            powerBalancer(){
                return global.city.sawmill.hasOwnProperty('psaw')
                    ? [{ r: 'Lumber', k: 'psaw' }]
                    : false;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('sawmill','city');
                    global['resource']['Lumber'].max += BHStorageMulti(spatialReasoning(200));
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['sawmill','city']
                };
            }
        },
        rock_quarry: {
            id: 'city-rock_quarry',
            title(){ return global.race['flier'] ? loc('city_rock_quarry_alt') : loc('city_rock_quarry'); },
            desc(){ return global.race['flier'] ? loc('city_rock_quarry_desc_alt',[global.resource.Stone.name]) : loc('city_rock_quarry_desc'); },
            category: 'industrial',
            reqs: { mining: 1 },
            not_trait: ['cataclysm','sappy'],
            cost: {
                Money(offset){
                    offset = offset || 0;
                    if ((global.city['rock_quarry'] ? global.city['rock_quarry'].count : 0) + offset >= 2){
                        return costMultiplier('rock_quarry', offset, 20, 1.45);
                    }
                    else {
                        return 0;
                    }
                },
                Lumber(offset){ return costMultiplier('rock_quarry', offset, 50, 1.36); },
                Stone(offset){ return costMultiplier('rock_quarry', offset, 10, 1.36); }
            },
            effect(){
                let stone = BHStorageMulti(spatialReasoning(100));
                let asbestos = global.race['smoldering'] ? `<div>${loc('plus_max_resource',[stone,global.resource.Chrysotile.name])}</div>` : '';
                if (global.tech['mine_conveyor']){
                    return `<div>${loc('city_rock_quarry_effect1',[2])}</div><div>${loc('plus_max_resource',[stone,global.resource.Stone.name])}</div>${asbestos}<div class="has-text-caution">${loc('city_rock_quarry_effect2',[4,$(this)[0].powered()])}</div>`;
                }
                else {
                    return `<div>${loc('city_rock_quarry_effect1',[2])}</div><div>${loc('plus_max_resource',[stone,global.resource.Stone.name])}</div>${asbestos}`;
                }
            },
            special(){ return global.race['smoldering'] ? true : false; },
            powered(){ return powerCostMod(1); },
            powerBalancer(){
                if (global.city.rock_quarry.hasOwnProperty('cnvay')){
                    if (global.city.hasOwnProperty('metal_refinery') && global.city.rock_quarry.hasOwnProperty('almcvy')){
                        return [
                            { r: 'Stone', k: 'cnvay' },
                            { r: 'Aluminium', k: 'almcvy' },
                        ];
                    }
                    return [{ r: 'Stone', k: 'cnvay' }];
                }
                return false;
            },
            power_reqs: { mine_conveyor: 1 },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('rock_quarry','city');
                    global.civic.quarry_worker.display = true;
                    let stone = BHStorageMulti(spatialReasoning(100));
                    global['resource']['Stone'].max += stone;
                    if (global.race['smoldering'] && global.resource.Chrysotile.display){
                        global['resource']['Chrysotile'].max += stone;
                        if (global.city.rock_quarry.count === 1){
                            global.settings.showCivic = true;
                            global.settings.showIndustry = true;
                            defineIndustry();
                        }
                    }
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: {
                        count: 0,
                        on: 0,
                        asbestos: 50
                    },
                    p: ['rock_quarry','city']
                };
            },
        },
};

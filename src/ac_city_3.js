import { loc } from './locale.js';
import { costMultiplier, powerCostMod, messageQueue } from './functions.js';
import { global } from './vars.js';
import { jobScale, loadFoundry } from './jobs.js';
import { payCosts, powerOnNewStruct, structName, dirt_adjust, buildTemplate, casinoEffect, templeEffect } from './actions.js';
import { incrementStruct, isStargateOn } from './space.js';
import { defineIndustry, addSmelter } from './industry.js';
import { races, traits, traitCostMod } from './races.js';
import { production } from './prod.js';
import { spatialReasoning, unlockContainers } from './resources.js';
import { actions } from './actions_registry.js';
import { govActive } from './governor.js';

// Bagian dari actions_city (20 entri: cement_plant .. meditation), dipisah dari ac_city.js. Urutan entri sama persis.
export const actions_cityPart3 = {
        cement_plant: {
            id: 'city-cement_plant',
            title: loc('city_cement_plant'),
            desc: loc('city_cement_plant_desc'),
            category: 'industrial',
            reqs: { cement: 1 },
            not_trait: ['cataclysm','lone_survivor','flier'],
            cost: {
                Money(offset){ return costMultiplier('cement_plant', offset, 3000, 1.5); },
                Lumber(offset){ return costMultiplier('cement_plant', offset, 1800, 1.36); },
                Stone(offset){ return costMultiplier('cement_plant', offset, 2000, 1.32); },
                Iron(offset){ return global.city.ptrait.includes('unstable') ? costMultiplier('cement_plant', offset, 275, 1.32) : 0; }
            },
            effect(){
                if (global.tech['cement'] >= 5){
                    let screws = global.tech['cement'] >= 6 ? 8 : 5;
                    return `<div>${loc('plus_max_resource',[jobScale(2),loc(`job_cement_worker`)])}</div><div class="has-text-caution">${loc('city_cement_plant_effect2',[$(this)[0].powered(),screws])}</div>`;
                }
                else {
                    return loc('plus_max_resource',[jobScale(2),loc(`job_cement_worker`)]);
                }
            },
            powered(){ return powerCostMod(2); },
            powerBalancer(){
                return global.city.cement_plant.hasOwnProperty('cnvay')
                    ? [{ r: 'Cement', k: 'cnvay' }]
                    : false;
            },
            power_reqs: { cement: 5 },
            action(args){
                if (payCosts($(this)[0])){
                    global.resource.Cement.display = true;
                    incrementStruct('cement_plant','city');
                    global.civic.cement_worker.display = true;
                    global.civic.cement_worker.max = global.city.cement_plant.count * jobScale(2);
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['cement_plant','city']
                };
            }
        },
        foundry: {
            id: 'city-foundry',
            title: loc('city_foundry'),
            desc: loc('city_foundry_desc'),
            category: 'industrial',
            reqs: { foundry: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('foundry', offset, 750, 1.36); },
                Stone(offset){ return costMultiplier('foundry', offset, 100, 1.36); },
                Copper(offset){ return costMultiplier('foundry', offset, 250, 1.36); },
                Iron(offset){ return global.city.ptrait.includes('unstable') ? costMultiplier('foundry', offset, 40, 1.36) : 0; },
            },
            effect(){
                let desc = `<div>${loc('city_foundry_effect1',[jobScale(1)])}</div>`;
                if (global.tech['foundry'] >= 2){
                    let skill = global.tech['foundry'] >= 5 ? (global.tech['foundry'] >= 8 ? 8 : 5) : 3;
                    desc = desc + `<div>${loc('city_crafted_mats',[skill])}</div>`;
                }
                if (global.tech['foundry'] >= 6){
                    desc = desc + `<div>${loc('city_foundry_effect2',[2])}</div>`;
                }
                return desc;
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.city['foundry'].count === 0){
                        if (global.race['no_craft']) {
                            messageQueue(loc('city_foundry_msg2'),'info',false,['progress']);
                        }
                        else {
                            messageQueue(loc('city_foundry_msg1'),'info',false,['progress']);
                        }
                    }
                    incrementStruct('foundry','city');
                    global.civic.craftsman.max += jobScale(1);
                    global.civic.craftsman.display = true;
                    if (!global.race['kindling_kindred'] && !global.race['smoldering']){
                        global.resource.Plywood.display = true;
                    }
                    global.resource.Brick.display = true;
                    if (global.resource.Iron.display){
                        global.resource.Wrought_Iron.display = true;
                    }
                    if (global.resource.Aluminium.display){
                        global.resource.Sheet_Metal.display = true;
                    }
                    loadFoundry();
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: {
                        count: 0,
                        crafting: 0,
                        Plywood: 0,
                        Brick: 0,
                        Bronze: 0,
                        Wrought_Iron: 0,
                        Sheet_Metal: 0,
                        Mythril: 0,
                        Aerogel: 0,
                        Nanoweave: 0,
                        Scarletite: 0,
                        Quantium: 0,
                    },
                    p: ['foundry','city']
                };
            }
        },
        factory: {
            id: 'city-factory',
            title(){ return structName('factory'); },
            desc: `<div>${loc('city_factory_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            category: 'industrial',
            reqs: { high_tech: 3 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('factory', offset, 25000, dirt_adjust(1.32)); },
                Cement(offset){ return costMultiplier('factory', offset, 1000, dirt_adjust(1.32)); },
                Steel(offset){ return costMultiplier('factory', offset, 7500, dirt_adjust(1.32)); },
                Titanium(offset){ return costMultiplier('factory', offset, 2500, dirt_adjust(1.32)); }
            },
            effect(){
                let desc = `<div>${loc('city_factory_effect')}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                if (global.tech['foundry'] >= 7){
                    desc = desc + `<div>${loc('city_crafted_mats',[5])}</div>`;
                }
                return desc;
            },
            powered(){ return powerCostMod(3); },
            special: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('factory','city');
                    if (global.city.factory.count === 1){
                        global.resource.Alloy.display = true;
                        if (global.tech['polymer']){
                            global.resource.Polymer.display = true;
                        }
                        global.settings.showIndustry = true;
                        defineIndustry();
                    }
                    if (powerOnNewStruct($(this)[0])){
                        global.city.factory.Alloy++;
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: {
                        count: 0,
                        on: 0,
                        Lux: 0,
                        Furs: 0,
                        Alloy: 0,
                        Polymer: 0,
                        Nano: 0,
                        Stanene: 0
                    },
                    p: ['factory','city']
                };
            },
        },
        nanite_factory: buildTemplate(`nanite_factory`,'city'),
        smelter: {
            id: 'city-smelter',
            title: loc('city_smelter'),
            desc: loc('city_smelter_desc'),
            category: 'industrial',
            reqs: { smelting: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('smelter', offset, 1000, dirt_adjust(1.32)); },
                Iron(offset){ return costMultiplier('smelter', offset, 500, dirt_adjust(1.33)); }
            },
            effect(){
                var iron_yield = global.tech['smelting'] >= 3 ? (global.tech['smelting'] >= 7 ? 15 : 12) : 10;
                if (global.race['pyrophobia']){
                    iron_yield *= 0.9;
                }
                if (global.tech['smelting'] >= 2 && !global.race['steelen']){
                    return loc('city_smelter_effect2',[iron_yield]);
                }
                else {
                    return loc('city_smelter_effect1',[iron_yield]);
                }
            },
            special: true,
            smelting(){
                return 1;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('smelter','city');
                    let fuel = 'Wood';
                    if (global.race['artifical']){
                        fuel = 'Oil';
                    }
                    else if ((global.race['kindling_kindred'] || global.race['smoldering']) && !global.race['evil']) {
                        fuel = 'Coal';
                    }
                    addSmelter($(this)[0].smelting(), 'Iron', fuel);
                    if (global.city.smelter.count === 1){
                        global.settings.showIndustry = true;
                        defineIndustry();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: {
                        count: 0,
                        cap: 0,
                        Wood: 0,
                        Coal: 0,
                        Oil: 0,
                        Star: 0,
                        StarCap: 0,
                        Inferno: 0,
                        Iron: 0,
                        Steel: 0,
                        Iridium: 0
                    },
                    p: ['smelter','city']
                };
            },
            flair: `<div>${loc('city_smelter_flair1')}<div></div>${loc('city_smelter_flair2')}</div>`
        },
        metal_refinery: {
            id: 'city-metal_refinery',
            title: loc('city_metal_refinery'),
            desc: loc('city_metal_refinery_desc'),
            category: 'industrial',
            reqs: { alumina: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('metal_refinery', offset, 2500, 1.35); },
                Iron(offset){ return global.city.ptrait.includes('unstable') ? costMultiplier('metal_refinery', offset, 125, 1.35) : 0; },
                Steel(offset){ return costMultiplier('metal_refinery', offset, 350, 1.35); }
            },
            powered(){ return powerCostMod(2); },
            powerBalancer(){
                return global.city.metal_refinery.hasOwnProperty('pwr')
                    ? [{ r: 'Aluminium', k: 'cnvay' }]
                    : false;
            },
            power_reqs: { alumina: 2 },
            effect(){
                let label = global.race['sappy'] ? 'city_metal_refinery_effect_alt' : 'city_metal_refinery_effect';
                if (global.tech['alumina'] >= 2){
                    return `<span>${loc(label,[6])}</span> <span class="has-text-caution">${loc('city_metal_refinery_effect2',[6,12,$(this)[0].powered()])}</span>`;
                }
                else {
                    return loc(label,[6]);
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('metal_refinery','city');
                    global.resource.Aluminium.display = true;
                    if (global.city['foundry'] && global.city.foundry.count > 0 && !global.resource.Sheet_Metal.display){
                        global.resource.Sheet_Metal.display = true;
                        loadFoundry();
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
                    },
                    p: ['metal_refinery','city']
                };
            },
        },
        mine: {
            id: 'city-mine',
            title(){ return structName('mine'); },
            desc: loc('city_mine_desc'),
            category: 'industrial',
            reqs: { mining: 2 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('mine', offset, 60, dirt_adjust(1.6)); },
                Lumber(offset){ return costMultiplier('mine', offset, 175, dirt_adjust(1.38)); }
            },
            effect(){
                if (global.tech['mine_conveyor']){
                    return `<div>${loc('plus_max_resource',[jobScale(1),loc(`job_miner`)])}</div><div class="has-text-caution">${loc('city_mine_effect2',[$(this)[0].powered(),5])}</div>`;
                }
                else {
                    return loc('plus_max_resource',[jobScale(1),loc(`job_miner`)]);
                }
            },
            powered(){ return powerCostMod(1); },
            powerBalancer(){
                return global.city.mine.hasOwnProperty('cpow') && global.city.mine.hasOwnProperty('ipow')
                    ? [{ r: 'Copper', k: 'cpow' },{ r: 'Iron', k: 'ipow' }]
                    : false;
            },
            power_reqs: { mine_conveyor: 1 },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct($(this)[0]);
                    global.resource.Copper.display = true;
                    global.civic.miner.display = true;
                    global.civic.miner.max = jobScale(global.city.mine.count);
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['mine','city']
                };
            },
            flair(){
                return races[global.race.species].type === 'avian' ? loc(`city_mine_flair_avian`) : '';
            }
        },
        coal_mine: {
            id: 'city-coal_mine',
            title(){ return structName('coal_mine'); },
            desc: loc('city_coal_mine_desc'),
            category: 'industrial',
            reqs: { mining: 4 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('coal_mine', offset, 480, dirt_adjust(1.4)); },
                Lumber(offset){ return costMultiplier('coal_mine', offset, 250, dirt_adjust(1.36)); },
                Iron(offset){ return global.city.ptrait.includes('unstable') ? costMultiplier('coal_mine', offset, 28, dirt_adjust(1.36)) : 0; },
                Wrought_Iron(offset){ return costMultiplier('coal_mine', offset, 18, dirt_adjust(1.36)); }
            },
            effect(){
                if (global.tech['mine_conveyor']){
                    return `<div>${loc('plus_max_resource',[jobScale(1),loc(`job_coal_miner`)])}</div><div class="has-text-caution">${loc('city_coal_mine_effect2',[$(this)[0].powered(),5])}</div>`;
                }
                else {
                    return loc('plus_max_resource',[jobScale(1),loc(`job_coal_miner`)]);
                }
            },
            powered(){ return powerCostMod(1); },
            powerBalancer(){
                return global.city.coal_mine.hasOwnProperty('cpow') && global.city.coal_mine.hasOwnProperty('upow') && global.resource.Uranium.display
                    ? [{ r: 'Coal', k: 'cpow' },{ r: 'Uranium', k: 'upow' }]
                    : (global.city.coal_mine.hasOwnProperty('cpow') ? [{ r: 'Coal', k: 'cpow' }] : false);
            },
            power_reqs: { mine_conveyor: 1 },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct($(this)[0]);
                    global.resource.Coal.display = true;
                    global.civic.coal_miner.display = true;
                    global.civic.coal_miner.max = jobScale(global.city.coal_mine.count);
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['coal_mine','city']
                };
            },
        },
        oil_well: {
            id: 'city-oil_well',
            title(){ return global.race['blubber'] ? loc('tech_oil_refinery') : loc('city_oil_well'); },
            desc(){ return global.race['blubber'] ? loc('city_oil_well_blubber') : loc('city_oil_well_desc'); },
            category: 'industrial',
            reqs: { oil: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('oil_well', offset, 5000, dirt_adjust(1.5)); },
                Iron(offset){ return global.city.ptrait.includes('unstable') ? costMultiplier('oil_well', offset, 450, dirt_adjust(1.5)) : 0; },
                Cement(offset){ return costMultiplier('oil_well', offset, 5250, dirt_adjust(1.5)); },
                Steel(offset){ return costMultiplier('oil_well', offset, 6000, dirt_adjust(1.5)); }
            },
            effect(){
                let oil = +(production('oil_well')).toFixed(2);
                let oc = spatialReasoning(500);
                let desc = `<div>${loc('city_oil_well_effect',[oil,oc])}</div>`;
                if (global.race['blubber'] && global.city.hasOwnProperty('oil_well')){
                    let maxDead = global.city.oil_well.count + (global.space['oil_extractor'] ? global.space.oil_extractor.count : 0);
                    desc += `<div>${loc('city_oil_well_bodies',[+(global.city.oil_well.dead).toFixed(1),50 * maxDead])}</div>`;
                    desc += `<div>${loc('city_oil_well_consume',[traits.blubber.vars()[0]])}</div>`;
                }
                return desc;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('oil_well','city');
                    global['resource']['Oil'].max += spatialReasoning(500);
                    if (global.city.oil_well.count === 1) {
                        global.resource.Oil.display = true;
                        defineIndustry();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, dead: 0 },
                    p: ['oil_well','city']
                };
            },
            flair: loc('city_oil_well_flair')
        },
        oil_depot: {
            id: 'city-oil_depot',
            title: loc('city_oil_depot'),
            desc: loc('city_oil_depot_desc'),
            category: 'trade',
            reqs: { oil: 2 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('oil_depot', offset, 2500, dirt_adjust(1.46)); },
                Iron(offset){ return global.city.ptrait.includes('unstable') ? costMultiplier('oil_depot', offset, 325, dirt_adjust(1.36)) : 0; },
                Cement(offset){ return costMultiplier('oil_depot', offset, 3750, dirt_adjust(1.46)); },
                Sheet_Metal(offset){ return costMultiplier('oil_depot', offset, 100, dirt_adjust(1.45)); }
            },
            effect() {
                let oil = spatialReasoning(1000);
                oil *= global.tech['world_control'] ? 1.5 : 1;
                let effect = `<div>${loc('plus_max_resource',[oil,global.resource.Oil.name])}.</div>`;
                if (global.resource['Helium_3'].display){
                    let val = spatialReasoning(400);
                    val *= global.tech['world_control'] ? 1.5 : 1;
                    effect = effect + `<div>${loc('plus_max_resource',[val,global.resource.Helium_3.name])}.</div>`;
                }
                if (global.tech['uranium'] >= 2){
                    let val = spatialReasoning(250);
                    val *= global.tech['world_control'] ? 1.5 : 1;
                    effect = effect + `<div>${loc('plus_max_resource',[val,global.resource.Uranium.name])}.</div>`;
                }
                return effect;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('oil_depot','city');
                    global['resource']['Oil'].max += spatialReasoning(1000) * (global.tech['world_control'] ? 1.5 : 1);
                    if (global.resource['Helium_3'].display){
                        global['resource']['Helium_3'].max += spatialReasoning(400) * (global.tech['world_control'] ? 1.5 : 1);
                    }
                    if (global.tech['uranium'] >= 2){
                        global['resource']['Uranium'].max += spatialReasoning(250) * (global.tech['world_control'] ? 1.5 : 1);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['oil_depot','city']
                };
            },
        },
        trade: {
            id: 'city-trade',
            title: loc('city_trade'),
            desc: loc('city_trade_desc'),
            category: 'trade',
            reqs: { trade: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('trade', offset, 500, 1.00); },
                Lumber(offset){ return costMultiplier('trade', offset, 125, 1.00); },
                Stone(offset){ return costMultiplier('trade', offset, 50, 1.00); },
                Iron(offset){ return global.city.ptrait.includes('unstable') ? costMultiplier('trade', offset, 15, 1.00) : 0; },
                Furs(offset){ return costMultiplier('trade', offset, 65, 1.00); }
            },
            effect(){
                return loc('city_trade_effect',[$(this)[0].routes()]);
            },
            routes(){
                let routes = (global.tech['trade'] >= 2) ? 3 : 2;
                if (global.race['xenophobic'] || global.race['nomadic']){
                    routes--;
                }
                if (global.race['flier']){
                    routes += traits.flier.vars()[1];
                }
                return routes * 100;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('trade','city');
                    global.city.market.mtrade += $(this)[0].routes();
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['trade','city']
                };
            }
        },
        wharf: {
            id: 'city-wharf',
            title: loc('city_wharf'),
            desc: loc('city_wharf_desc'),
            category: 'trade',
            era: 'industrialized',
            reqs: { wharf: 1 },
            not_trait: ['thalassophobia','cataclysm','warlord'],
            cost: {
                Money(offset){ return costMultiplier('wharf', offset, 62000, 1.00); },
                Lumber(offset){ return costMultiplier('wharf', offset, 44000, 1.00); },
                Iron(offset){ return global.city.ptrait.includes('unstable') ? costMultiplier('wharf', offset, 200, 1.00) : 0; },
                Cement(offset){ return costMultiplier('wharf', offset, 3000, 1.00); },
                Oil(offset){ return costMultiplier('wharf', offset, 750, 1.00); }
            },
            effect(){
                let containers = global.tech['world_control'] ? 15 : 10;
                if (global.tech['particles'] && global.tech['particles'] >= 2){
                    containers *= 2;
                }
                return `<div>${loc('city_trade_effect',[200])}</div><div>${loc('city_wharf_effect')}</div><div>${loc('plus_max_crates',[containers])}</div><div>${loc('plus_max_containers',[containers])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('wharf','city');
                    global.city.market.mtrade += 200;
                    let vol = global.tech['world_control'] ? 15 : 10;
                    if (global.tech['particles'] && global.tech['particles'] >= 2){
                        vol *= 2;
                    }
                    global.resource.Crates.max += vol;
                    global.resource.Containers.max += vol;
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
                    p: ['wharf','city']
                };
            }
        },
        tourist_center: {
            id: 'city-tourist_center',
            title: loc('city_tourist_center'),
            desc: loc('city_tourist_center_desc'),
            category: 'commercial',
            reqs: { monument: 2 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('tourist_center', offset, 100000, 1.36); },
                Stone(offset){ return costMultiplier('tourist_center', offset, 25000, 1.36); },
                Iron(offset){ return global.city.ptrait.includes('unstable') ? costMultiplier('tourist_center', offset, 1000, 1.36) : 0; },
                Furs(offset){ return costMultiplier('tourist_center', offset, 7500, 1.36); },
                Plywood(offset){ return costMultiplier('tourist_center', offset, 5000, 1.36); },
            },
            effect(wiki){
                let xeno = global.tech['monument'] && global.tech.monument >= 3 && isStargateOn(wiki) ? 3 : 1;
                let amp = (global.civic.govern.type === 'corpocracy' ? 2 : 1) * xeno;
                let cas = (global.civic.govern.type === 'corpocracy' ? 10 : 5) * xeno;
                let mon = (global.civic.govern.type === 'corpocracy' ? 4 : 2) * xeno;

                let desc = `<div class="has-text-caution">${loc('city_tourist_center_effect1',[global.resource.Food.name])}</div>`;
                desc += `<div>${loc('city_tourist_center_effect2',[amp,actions.city.amphitheatre.title()])}</div>`;
                desc += `<div>${loc('city_tourist_center_effect2',[cas,structName('casino')])}</div>`;
                desc += `<div>${loc('city_tourist_center_effect2',[mon,loc(`arpa_project_monument_title`)])}</div>`;
                if (global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 4){
                    desc += `<div>${loc(`city_tourist_center_effect2`,[(global.civic.govern.type === 'corpocracy' ? 6 : 3) * xeno, loc('city_trade')])}</div>`;
                }
                let piousVal = govActive('pious',1);
                if (piousVal){
                    desc += `<div>${loc(`city_tourist_center_effect2`,[(global.civic.govern.type === 'corpocracy' ? (piousVal * 2) : piousVal) * xeno, structName('temple')])}</div>`;
                }

                return desc;
            },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('tourist_center','city');
                    global.city.tourist_center.on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['tourist_center','city']
                };
            },
        },
        amphitheatre: {
            id: 'city-amphitheatre',
            title(){
                if (global.race.universe === 'evil'){
                    return loc('city_colosseum');
                }
                let athVal = govActive('athleticism',0);
                return athVal ? loc('city_stadium') : loc('city_amphitheatre');
            },
            desc(){
                if (global.race.universe === 'evil'){
                    return loc('city_colosseum');
                }
                let athVal = govActive('athleticism',0);
                return athVal ? loc('city_stadium') : loc('city_amphitheatre_desc');
            },
            category: 'commercial',
            reqs: { theatre: 1 },
            not_trait: ['joyless','cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('amphitheatre', offset, 500, 1.55); },
                Lumber(offset){ return costMultiplier('amphitheatre', offset, 50, 1.75); },
                Stone(offset){ return costMultiplier('amphitheatre', offset, 200, 1.75); },
                Iron(offset){ return global.city.ptrait.includes('unstable') ? costMultiplier('amphitheatre', offset, 18, 1.36) : 0; },
            },
            effect(){
                let athVal1 = govActive('athleticism',0);
                let athVal2 = govActive('athleticism',1);
                return`<div>${loc('plus_max_resource',[jobScale(athVal2 ? athVal2 : 1),loc(`job_entertainer`)])}</div><div>${loc('city_max_morale',[athVal1 ? athVal1 : 1])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('amphitheatre','city');
                    let athVal2 = govActive('athleticism',1);
                    global.civic.entertainer.max += jobScale(athVal2 ? athVal2 : 1);
                    global.civic.entertainer.display = true;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, evil: 0 },
                    p: ['amphitheatre','city']
                };
            },
            flair(){
                if (global.race.universe === 'evil'){
                    return loc('city_colosseum_flair');
                }
                let athVal = govActive('athleticism',0);
                return athVal ? loc('city_stadium_flair') : loc('city_amphitheatre_flair');
            },
        },
        casino: {
            id: 'city-casino',
            title(){ return structName('casino'); },
            desc(){ return structName('casino'); },
            category: 'commercial',
            reqs: { gambling: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('casino', offset, traitCostMod('untrustworthy',350000), 1.35); },
                Iron(offset){ return global.city.ptrait.includes('unstable') ? costMultiplier('casino', offset, traitCostMod('untrustworthy',2000), 1.35) : 0; },
                Furs(offset){ return costMultiplier('casino', offset, traitCostMod('untrustworthy',60000), 1.35); },
                Plywood(offset){ return costMultiplier('casino', offset, traitCostMod('untrustworthy',10000), 1.35); },
                Brick(offset){ return costMultiplier('casino', offset, traitCostMod('untrustworthy',6000), 1.35); }
            },
            effect(){
                let desc = casinoEffect();
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 2 ? 2 : 3); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('casino','city');
                    if (global.tech['theatre'] && !global.race['joyless']){
                        global.civic.entertainer.max += jobScale(1);
                        global.civic.entertainer.display = true;
                    }
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['casino','city']
                };
            },
            flair: loc('city_casino_flair')
        },
        temple: {
            id: 'city-temple',
            title(){ return structName('temple'); },
            desc(){
                let entity = global.race.gods !== 'none' ? races[global.race.gods.toLowerCase()].entity : races[global.race.species].entity;
                return global.race.universe === 'evil' && global.civic.govern.type != 'theocracy' ? loc('city_temple_desc_evil',[entity]) : loc('city_temple_desc',[entity]);
            },
            category: 'commercial',
            reqs: { theology: 2 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('temple', offset, 50, 1.36); },
                Lumber(offset){ return costMultiplier('temple', offset, 25, 1.36); },
                Iron(offset){ return global.city.ptrait.includes('unstable') ? costMultiplier('temple', offset, 6, 1.36) : 0; },
                Furs(offset){ return costMultiplier('temple', offset, 15, 1.36); },
                Cement(offset){ return costMultiplier('temple', offset, 10, 1.36); }
            },
            effect(){
                let desc = templeEffect();
                if (global.genes['ancients'] && global.genes['ancients'] >= 2){
                    desc = desc + `<div>${loc('plus_max_resource',[jobScale(1),global.civic?.priest?.name || loc(`job_priest`)])}</div>`;
                }
                if (global.race.universe === 'evil'){
                    desc += `<div>${loc('plus_max_resource',[0.5,global.resource.Authority.name])}</div>`;
                }
                return desc;
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.genes['ancients'] && global.genes['ancients'] >= 2){
                        global.civic.priest.display = true;
                        global.civic.priest.max += jobScale(1);
                    }
                    incrementStruct('temple','city');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['temple','city']
                };
            },
        },
        wonder_lighthouse: {
            id: 'city-wonder_lighthouse',
            title(){
                return loc('city_wonder_lighthouse',[races[global.race.species].home]);
            },
            desc(){
                return loc('city_wonder_lighthouse',[races[global.race.species].home]);
            },
            category: 'commercial',
            reqs: {},
            condition(){
                return global.race['wish'] && global.race['wishStats'] && global.city['wonder_lighthouse'] ? true : false;
            },
            trait: ['wish'],
            wiki: false,
            queue_complete(){ return false; },
            effect(){
                return loc(`city_wonder_effect`,[5]);
            },
            action(args){
                return false;
            }
        },
        wonder_pyramid: {
            id: 'city-wonder_pyramid',
            title(){
                return loc('city_wonder_pyramid',[races[global.race.species].name]);
            },
            desc(){
                return loc('city_wonder_pyramid',[races[global.race.species].name]);
            },
            category: 'commercial',
            reqs: {},
            condition(){
                return global.race['wish'] && global.race['wishStats'] && global.city['wonder_pyramid'] ? true : false;
            },
            trait: ['wish'],
            wiki: false,
            queue_complete(){ return false; },
            effect(){
                return loc(`city_wonder_effect`,[5]);
            },
            action(args){
                return false;
            }
        },
        shrine: buildTemplate(`shrine`,'city'),
        meditation: buildTemplate(`meditation`,'city'),
};

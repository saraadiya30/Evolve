import { global, sizeApproximation } from '../core/vars.js';
import { vBind, messageQueue, powerCostMod, powerModifier, spaceCostMultiplier, darkEffect } from '../functions/functions.js';
import { races, traits } from '../races/races.js';
import { spatialReasoning, unlockContainers } from '../resources/resources.js';
import { jobScale, loadFoundry, limitCraftsmen } from '../civics/jobs.js';
import { production } from '../resources/prod.js';
import { payCosts, powerOnNewStruct, drawTech, bank_vault, buildTemplate, casinoEffect, housingLabel, structName, initStruct } from '../actions/actions.js';
import { int_fuel_adjust, incrementStruct } from '../space/space.js';
import { govActive } from '../governor/governor.js';
import { defineIndustry } from '../industry/industry.js';
import { loc } from '../core/locale.js';
import { tauCetiModules } from './truepath_registry.js';
import { drawShips } from './truepath.js';
import { tpStorageMultiplier, tauEnabled, wom_recycle } from './tp_support.js';

// Region 'tau_home' dari tauCetiModules (dipisah dari truepath.js). Isi/urutan entri sama persis; digabung via truepath_registry.js di truepath.js.
export const tauHome = {
        info: {
            name(){
                return loc('tau_planet',[races[global.race.species].home]);
            },
            desc(){
                return loc('tau_home',[races[global.race.species].home]);
            },
            support: 'orbital_station',
            extra(region){
                if (global.tech['tau_home'] && global.tech.tau_home >= 2 && !tauEnabled()){
                    $(`#${region}`).append(`<div id="${region}Mats" v-show="tauShow()" class="syndThreat has-text-warning">${loc('resource_Materials_name')} <span class="has-text-info">{{ amount | round | locale }}</span> / <span class="has-text-info">{{ max | locale }}</span></div>`);
                    vBind({
                        el: `#${region}Mats`,
                        data: global.resource.Materials,
                        methods: {
                            tauShow(){
                                return !tauEnabled();
                            }
                        },
                        filters: {
                            round(v){
                                return +v.toFixed(0);
                            },
                            locale(v){
                                return v.toLocaleString();
                            }
                        }
                    });
                }
            }
        },
        home_mission: {
            id: 'tauceti-home_mission',
            title(){ return loc('tau_new_mission_title',[races[global.race.species].home]); },
            desc(){ return loc('tau_new_mission_title',[races[global.race.species].home]); },
            reqs: { tauceti: 2 },
            grant: ['tau_home',1],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_home >= 1 ? 0 : 1; },
            cost: {
                Money(){ return 1000000000; }
            },
            effect(){ return loc('tau_new_mission_effect',[races[global.race.species].home]); },
            action(){
                if (payCosts($(this)[0])){
                    initStruct(tauCetiModules.tau_home.colony);
                    initStruct(tauCetiModules.tau_home.mining_pit);
                    messageQueue(loc('tau_home_mission_result',[races[global.race.species].home]),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        dismantle: {
            id: 'tauceti-dismantle',
            title(){ return loc('tau_home_dismantle'); },
            desc(){ return loc('tau_home_dismantle'); },
            reqs: { tau_home: 1 },
            grant: ['tau_home',2],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_home >= 2 ? 0 : 1; },
            cost: {
                Money(){ return 100000000; }
            },
            effect(){
                let explorer = 'Explorer';
                if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
                    let shipId = global.space.shipyard.ships.findIndex(x => x.location === 'tauceti' && x.class === 'explorer');
                    if (shipId !== -1){
                        explorer = global.space.shipyard.ships[shipId].name;
                    }
                }
                return loc('tau_home_dismantle_effect',[explorer]);
            },
            action(){
                let shipId = -1;
                if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
                    shipId = global.space.shipyard.ships.findIndex(x => x.location === 'tauceti' && x.class === 'explorer');
                }
                if (shipId >= 0 && payCosts($(this)[0])){
                    global.space.shipyard.ships.splice(shipId,1);
                    incrementStruct('orbital_station','tauceti');
                    incrementStruct('colony','tauceti');
                    incrementStruct('mining_pit','tauceti');
                    global.civic.pit_miner.display = true;
                    global.resource.Materials.display = true;
                    if (powerOnNewStruct($(tauCetiModules.tau_home.orbital_station)[0])){
                        global.tauceti.colony.on++;
                        global.tauceti.mining_pit.on++;

                        let hiredMax = $(tauCetiModules.tau_home.mining_pit)[0].workers();
                        global.civic.pit_miner.max += hiredMax;

                        let hired = Math.min(hiredMax, global.civic[global.civic.d_job].workers);
                        global.civic[global.civic.d_job].workers -= hired;
                        global.civic.pit_miner.workers += hired;
                    }
                    drawShips();
                    return true;
                }
                return false;
            }
        },
        orbital_station: {
            id: 'tauceti-orbital_station',
            title: loc('tau_home_orbital_station'),
            desc: `<div>${loc('tau_home_orbital_station')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { tau_home: 2 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('orbital_station', offset, 80000000, 1.3, 'tauceti'); },
                Materials(offset){ return tauEnabled() ? 0 : spaceCostMultiplier('orbital_station', offset, 500000, 1.3, 'tauceti'); },
                Helium_3(offset){ return tauEnabled() ? spaceCostMultiplier('orbital_station', offset, int_fuel_adjust(250000), 1.3, 'tauceti') : 0; },
                Copper(offset){ return tauEnabled() ? spaceCostMultiplier('orbital_station', offset, 1250000, 1.3, 'tauceti') : 0; },
                Adamantite(offset){ return tauEnabled() ? spaceCostMultiplier('orbital_station', offset, 900000, 1.3, 'tauceti') : 0; },
            },
            effect(){
                let helium = spatialReasoning(15000);
                let fuel = +int_fuel_adjust($(this)[0].support_fuel().a).toFixed(1);
                let desc = `<div>${loc('space_red_spaceport_effect1',[loc('tau_planet',[races[global.race.species].home]),$(this)[0].support()])}</div>`;
                desc += `<div>${loc('plus_max_resource',[helium.toLocaleString(),global.resource.Helium_3.name])}</div>`;
                if (global.race.universe === 'evil' && (global.race['lone_survivor'] || global.tech['isolation'])){
                    desc += `<div>${loc('plus_max_resource',[1,global.resource.Authority.name])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('spend_power',[fuel,global.resource[$(this)[0].support_fuel().r].name,$(this)[0].powered()])}</div>`;
                return desc;
            },
            support_fuel(){ return { r: 'Helium_3', a: global.tech['isolation'] ? (global.race['lone_survivor'] ? 5 : 25) : 400 }; },
            support(){ return 3; },
            powered(){ return powerCostMod(global.tech['isolation'] ? (global.race['lone_survivor'] ? 4 : 6) : 30); },
            refresh: true,
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('orbital_station','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['orbital_station','tauceti']
                };
            }
        },
        colony: {
            id: 'tauceti-colony',
            title: loc('tau_home_colony'),
            desc(){
                return `<div>${loc('tau_home_colony_desc',[races[global.race.species].home])}</div><div class="has-text-special">${loc('requires_power_support_combo',[races[global.race.species].home,global.resource.Food.name])}</div>`;
            },
            reqs: { tau_home: 2 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('colony', offset, 15750000, 1.225, 'tauceti'); },
                Materials(offset){ return tauEnabled() ? 0 : spaceCostMultiplier('colony', offset, 650000, 1.225, 'tauceti'); },
                Furs(offset){ return tauEnabled() ? spaceCostMultiplier('colony', offset, 720000, 1.225, 'tauceti') : 0; },
                Graphene(offset){ return tauEnabled() ? spaceCostMultiplier('colony', offset, 485000, 1.225, 'tauceti') : 0; },
                Brick(offset){ return tauEnabled() ? spaceCostMultiplier('colony', offset, wom_recycle(880000), 1.225, 'tauceti') : 0; },
            },
            effect(){
                let pop = $(this)[0].citizens();
                let containers = global.tech['isolation'] ? 900 : 250;
                let fuel = +($(this)[0].support_fuel().a).toFixed(1);
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[$(this)[0].support(), races[global.race.species].home])}</div>`;
                
                if (!global.race['lone_survivor']){
                    desc = desc + `<div>${loc('plus_max_citizens',[pop])}</div>`;
                }

                if (global.tech['isolation']){
                    let vault = bank_vault() * 25;
                    vault = spatialReasoning(vault);
                    vault = (+(vault).toFixed(0)).toLocaleString();
                    desc += `<div>${loc('plus_max_resource',[`\$${vault}`,global.resource.Money.name])}</div>`;
                }

                desc += `<div>${loc('tau_home_colony_effect',[50,races[global.race.species].home])}</div>`;
                
                if (global.tech['isolation']){
                    let gasVal = govActive('gaslighter',0);
                    let mVal = ((gasVal || 0) + (global.tech.broadcast || 0)) * 2;
                    desc += `<div>${loc('space_red_vr_center_effect1',[mVal])}</div>`;
                }
                
                desc += `<div>${loc('plus_max_resource',[containers,global.resource.Crates.name])}</div><div>${loc('plus_max_resource',[containers,global.resource.Containers.name])}</div>`;

                if (global.race.universe === 'evil' && (global.race['lone_survivor'] || global.tech['isolation'])){
                    desc += `<div>${loc('plus_resource',[5,global.resource.Authority.name])}</div>`;
                }

                if (global.race['lone_survivor']){
                    desc += `<div>${loc('gain',[-(fuel),global.resource[$(this)[0].support_fuel().r].name])}</div>`;
                }
                else {
                    desc += `<div class="has-text-caution">${loc('spend',[fuel,global.resource[$(this)[0].support_fuel().r].name])}</div>`;
                }
                return desc;
            },
            s_type: 'tau_home',
            support(){ return -2; },
            support_fuel(){ return { r: 'Food', a: global.tech['isolation'] ? (global.race['lone_survivor'] ? -2 : 75) : 1000 }; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('colony','tauceti');
                    powerOnNewStruct($(this)[0]);
                    if (!global.resource.Containers.display){
                        unlockContainers();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['colony','tauceti']
                };
            },
            citizens(){
                let pop = global.tech['isolation'] ? 8 : 5;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return global.race['lone_survivor'] ? 0 : pop;
            }
        },
        tau_housing: {
            id: 'tauceti-tau_housing',
            title(){
                return housingLabel('small');
            },
            desc(){
                return $(this)[0].citizens() === 1 ? loc('city_basic_housing_desc') : loc('city_basic_housing_desc_plural',[$(this)[0].citizens()]);
            },
            category: 'residential',
            reqs: { housing: 1, isolation: 1 },
            condition(){ return global.race['lone_survivor'] ? false : true; },
            cost: {
                Money(offset){return spaceCostMultiplier('tau_housing', offset, 150000, 1.15, 'tauceti'); },
                Lumber(offset){ return global.race['kindling_kindred'] || global.race['smoldering'] ? 0 : spaceCostMultiplier('tau_housing', offset, 125000, 1.25, 'tauceti'); },
                Stone(offset){ return global.race['kindling_kindred'] ? spaceCostMultiplier('tau_housing', offset, 125000, 1.25, 'tauceti') : 0; },
                Chrysotile(offset){ return global.race['smoldering'] ? spaceCostMultiplier('tau_housing', offset, 50000, 1.25, 'tauceti') : 0; },
                Horseshoe(){ return global.race['hooved'] ? 1 : 0; }
            },
            effect(){
                let pop = $(this)[0].citizens();
                return global.race['sappy'] ? `<div>${loc('plus_max_resource',[pop,loc('citizen')])}</div><div>${loc('city_grove_effect',[2.5])}</div>` : loc('plus_max_resource',[pop,loc('citizen')]);
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('tau_housing','tauceti');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['tau_housing','tauceti']
                };
            },
            citizens(){
                let pop = 1;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
            }
        },
        captive_housing: buildTemplate(`captive_housing`,'tauceti'),
        pylon: {
            id: 'tauceti-pylon',
            title: loc('tau_home_pylon'),
            desc: loc('tau_home_pylon'),
            reqs: { magic: 2 },
            condition(){ return global.tech['isolation'] && global.tauceti.hasOwnProperty('pylon') ? true : false; },
            cost: {
                Money(offset){ return spaceCostMultiplier('pylon', offset, 50, 1.48, 'tauceti'); },
                Stone(offset){ return spaceCostMultiplier('pylon', offset, 100, 1.42, 'tauceti'); },
                Crystal(offset){ return spaceCostMultiplier('pylon', offset, 8, 1.42, 'tauceti') - 3; }
            },
            effect(){
                let max = spatialReasoning(2);
                let mana = +(0.0125 * darkEffect('magic')).toFixed(3);
                return `<div>${loc('gain',[mana,global.resource.Mana.name])}</div><div>${loc('plus_max_resource',[max,global.resource.Mana.name])}</div>`;
            },
            special(){ return global.tech['magic'] && global.tech.magic >= 3 ? true : false; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('pylon','tauceti');
                    global.resource.Mana.max += spatialReasoning(2);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['pylon','tauceti']
                };
            }
        },
        cloning_facility: {
            id: `tauceti-cloning_facility`,
            title: loc('tau_home_cloning'),
            desc(){ return loc('tau_home_cloning_desc',[races[global.race.species].name]); },
            category: 'military',
            reqs: { cloning: 1 },
            path: ['truepath'],
            queue_complete(){ return global.resource[global.race.species].max - global.resource[global.race.species].amount; },
            cost: {
                Money(offset){ return global['resource'][global.race.species].amount ? spaceCostMultiplier('citizen', offset, Math.round((global.race['high_pop'] ? 100000 : 125000) / jobScale(1)), global.race['high_pop'] ? 1.01 : 1.02, 'tauceti', global.race['high_pop'] ? 1.003 : 1.005) : 0; },
                Copper(offset){ return !global.race['artifical'] || global.race['deconstructor'] ? 0 : global['resource'][global.race.species].amount >= 5 ? spaceCostMultiplier('citizen', offset, Math.round(50 / jobScale(1)), 1.01, 'tauceti', global.race['high_pop'] ? 1.0032 : 1.005) : 0; },
                Aluminium(offset){ return !global.race['artifical'] || global.race['deconstructor'] ? 0 : global['resource'][global.race.species].amount >= 5 ? spaceCostMultiplier('citizen', offset, Math.round(50 / jobScale(1)), 1.01, 'tauceti', global.race['high_pop'] ? 1.0032 : 1.005) : 0; },
                Nanite(offset){ return global.race['deconstructor'] ? (global['resource'][global.race.species].amount >= 3 ? spaceCostMultiplier('citizen', offset, Math.round(500 / jobScale(1)), 1.01, 'tauceti', global.race['high_pop'] ? 1.0032 : 1.005) : 0) : 0; },
            },
            effect(){
                let warn = '';
                if (global['resource'][global.race.species].max === global['resource'][global.race.species].amount){
                    warn = `<div class="has-text-caution">${loc('city_assembly_effect_warn')}</div>`;
                }
                return `<div>${loc('tau_home_cloning_effect',[races[global.race.species].name])}</div>${warn}`;
            },
            action(){
                if (global['resource'][global.race.species].max > global['resource'][global.race.species].amount && payCosts($(this)[0])){
                    global['resource'][global.race.species].amount++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['cloning_facility','tauceti']
                };
            }
        },
        horseshoe: buildTemplate(`horseshoe`,'tauceti'),
        bonfire: buildTemplate(`bonfire`,'tauceti'),
        firework: buildTemplate(`firework`,'tauceti'),
        assembly: buildTemplate(`assembly`,'tauceti'),
        nanite_factory: buildTemplate(`nanite_factory`,'tauceti'),
        tau_farm: {
            id: 'tauceti-tau_farm',
            title: loc('tau_home_tau_farm'),
            desc(){
                return `<div>${loc('tau_home_tau_farm')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { tau_home: 7 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('tau_farm', offset, 135000000, 1.25, 'tauceti'); },
                Stone(offset){ return  spaceCostMultiplier('tau_farm', offset, 9210000, 1.25, 'tauceti'); },
                Steel(offset){ return spaceCostMultiplier('tau_farm', offset, 6295000, 1.25, 'tauceti'); },
                Water(offset){ return spaceCostMultiplier('tau_farm', offset, 10000, 1.25, 'tauceti'); },
            },
            effect(){
                let desc = `<div>${loc('space_red_spaceport_effect1',[loc('tau_planet',[races[global.race.species].home]),$(this)[0].support()])}</div>`;
                desc = desc + `<div>${loc('produce',[+(production('tau_farm','food')).toFixed(2),global.resource.Food.name])}</div>`;
                if (!global.race['kindling_kindred'] && !global.race['smoldering']){
                    desc = desc + `<div>${loc('produce',[+(production('tau_farm','lumber')).toFixed(2),global.resource.Lumber.name])}</div>`;
                }
                if (global.tech['isolation']){
                    let water = +(production('tau_farm','water')).toFixed(2);
                    desc = desc + `<div>${loc('produce',[water,global.resource.Water.name])}</div>`;
                    if (global.race['artifical']){
                        let sig_cap = spatialReasoning(350);
                        desc = desc + `<div>${loc('city_transmitter_effect',[sig_cap])}</div>`;
                    }
                }
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            support(){ return 1; },
            powered(){ return powerCostMod(global.tech['isolation'] ? 1 : 4); },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('tau_farm','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['tau_farm','tauceti']
                };
            }
        },
        mining_pit: {
            id: 'tauceti-mining_pit',
            title: loc('tau_home_mining_pit'),
            desc(){
                return `<div>${loc('tau_home_mining_pit')}</div><div class="has-text-special">${loc('space_support',[races[global.race.species].home])}</div>`;
            },
            reqs: { tau_home: 2 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('mining_pit', offset, 4250000, 1.225, 'tauceti'); },
                Materials(offset){ return tauEnabled() ? 0 : spaceCostMultiplier('mining_pit', offset, 350000, 1.225, 'tauceti'); },
                Lumber(offset){ return tauEnabled() ? spaceCostMultiplier('mining_pit', offset, 2350000, 1.225, 'tauceti') : 0; },
                Iron(offset){ return tauEnabled() ? spaceCostMultiplier('mining_pit', offset, 835000, 1.225, 'tauceti') : 0; },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[$(this)[0].support(), races[global.race.species].home])}</div>`;
                desc = desc + `<div>${loc('plus_max_resource',[$(this)[0].workers(),loc('job_pit_miner')])}</div>`;
                if (!tauEnabled()){
                    desc = desc + `<div>${loc('plus_max_resource',[1000000,loc('resource_Materials_name')])}</div>`;
                    desc = desc + `<div>${loc('tau_home_mining_pit_effect',[global.resource.Materials.name])}</div>`;
                }
                else {
                    if (global.tech['isolation']){
                        if (global.race['lone_survivor']){
                            let res_list = [global.resource.Bolognium.name,global.resource.Adamantite.name,global.resource.Stone.name,global.resource.Copper.name,global.resource.Iron.name,global.resource.Aluminium.name,global.resource.Coal.name];
                            if (global.race['smoldering']){
                                res_list.push(global.resource.Chrysotile.name);
                                desc = desc + `<div>${loc('tau_home_mining_pit_effect2cs',res_list)}</div>`;
                            }
                            else {
                                desc = desc + `<div>${loc('tau_home_mining_pit_effect2c',res_list)}</div>`;
                            }
                        }
                        else {
                            let res_list = [global.resource.Bolognium.name,global.resource.Adamantite.name,global.resource.Stone.name,global.resource.Copper.name,global.resource.Coal.name];
                            if (global.race['smoldering']){
                                res_list.push(global.resource.Chrysotile.name);
                                desc = desc + `<div>${loc('tau_home_mining_pit_effect2bs',res_list)}</div>`;
                            }
                            else {
                                desc = desc + `<div>${loc('tau_home_mining_pit_effect2b',res_list)}</div>`;
                            }
                        }
                        desc = desc + `<div>${loc('production',[8,global.resource.Cement.name])}</div>`;
                    }
                    else {
                        let res_list = [global.resource.Bolognium.name,global.resource.Adamantite.name,global.resource.Stone.name];
                        if (global.race['smoldering']){
                            res_list.push(global.resource.Chrysotile.name);
                            desc = desc + `<div>${loc('tau_home_mining_pit_effect2s',res_list)}</div>`;
                        }
                        else {
                            desc = desc + `<div>${loc('tau_home_mining_pit_effect2',res_list)}</div>`;
                        }
                    }
                }
                return desc;
            },
            s_type: 'tau_home',
            support(){ return -1; },
            powered(){ return 0; },
            workers(){ return jobScale(global.tech['isolation'] ? 6 : 8); },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('mining_pit','tauceti');
                    if (powerOnNewStruct($(this)[0])){
                        let hiredMax = $(this)[0].workers();
                        global.civic.pit_miner.max += hiredMax;

                        let hired = Math.min(hiredMax, global.civic[global.civic.d_job].workers);
                        global.civic[global.civic.d_job].workers -= hired;
                        global.civic.pit_miner.workers += hired;
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['mining_pit','tauceti']
                };
            }
        },
        excavate: {
            id: 'tauceti-excavate',
            title: loc('tau_home_excavate'),
            desc(){
                return `<div>${loc('tau_home_excavate')}</div>`;
            },
            reqs: { tau_home: 2 },
            grant: ['tau_home',3],
            path: ['truepath'],
            cost: {
                Money(o){ return 1650000000; },
                Materials(o){ return 750000; },
            },
            effect(){
                return loc('tau_home_excavate_effect');
            },
            action(){
                if (payCosts($(this)[0])){
                    messageQueue(loc('tau_home_excavate_msg'),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        alien_outpost: {
            id: 'tauceti-alien_outpost',
            title: loc('tech_alien_outpost'),
            desc(){
                return `<div>${loc('tech_alien_outpost')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { tau_home: 4 },
            path: ['truepath'],
            cost: {},
            queue_complete(){ return 0; },
            effect(){
                let desc = `<div>${loc('plus_max_resource',[20+'%',global.resource.Knowledge.name])}</div>`;
                if (global.tech['isolation']){
                    desc = desc + `<div>${loc('plus_max_resource',[(global.race['lone_survivor'] ? 3500000 : 6500000).toLocaleString(),global.resource.Knowledge.name])}</div>`;
                    desc = desc + `<div>${loc('plus_max_resource',[(200000).toLocaleString(),global.resource.Cipher.name])}</div>`;
                    desc = desc + `<div>${loc(`space_lander_effect3`,[production('alien_outpost'),global.resource.Cipher.name])}</div>`;
                }
                if (global.tech['outpost_boost']){
                    desc = desc + `<div>${loc('tech_alien_outpost_effect2')}</div>`;
                }
                if (global.race['lone_survivor']){
                    desc = desc + `<div>${loc('city_wardenclyffe_effect1',[jobScale(1), global.civic.professor.name])}</div>`;
                }
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(global.tech['isolation'] ? (global.race['lone_survivor'] ? 8 : 25) : 100); },
            special(){
                return global.tech['replicator'] ? true : false;
            },
            action(){
                return false;
            },
            struct(){
                return {
                    d: { count: 1, on: 0 },
                    p: ['alien_outpost','tauceti']
                };
            }
        },
        jump_gate: {
            id: 'tauceti-jump_gate',
            title: loc('tau_jump_gate'),
            desc(wiki){
                if (!global.tauceti.hasOwnProperty('jump_gate') || global.tauceti.jump_gate.count < 100 || wiki){
                    return `<div>${loc('tau_jump_gate')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                else {
                    return `<div>${loc('tau_jump_gate')}</div>`;
                }
            },
            reqs: { tauceti: 3 },
            condition(){ return global.tech['isolation'] ? 0 : 1; },
            path: ['truepath'],
            queue_size: 10,
            queue_complete(){ return 100 - global.tauceti.jump_gate.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('jump_gate') ? global.tauceti.jump_gate.count : 0)) < 100 ? 1000000 : 0; },
                Materials(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('jump_gate') ? global.tauceti.jump_gate.count : 0)) < 100 ? 12500 : 0; },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.tauceti.hasOwnProperty('jump_gate') ? global.tauceti.jump_gate.count : 0);
                if (count < 100){
                    let remain = 100 - count;
                    return `<div>${loc('tau_jump_gate_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return loc('tau_jump_gate_effect');
                }
            },
            action(){
                if (payCosts($(this)[0])){
                    if (global.tauceti.jump_gate.count < 100){
                        incrementStruct('jump_gate','tauceti');
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['jump_gate','tauceti']
                };
            }
        },
        fusion_generator: {
            id: 'tauceti-fusion_generator',
            title: loc('tech_fusion_generator'),
            desc(){
                return `<div>${loc('tech_fusion_generator')}</div><div class="has-text-special">${loc('requires_res',[global.resource.Helium_3.name])}</div>`;
            },
            reqs: { tau_home: 6 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('fusion_generator', offset, 188000000, 1.25, 'tauceti'); },
                Iridium(offset){ return  spaceCostMultiplier('fusion_generator', offset, 5550000, 1.25, 'tauceti'); },
                Stanene(offset){ return spaceCostMultiplier('fusion_generator', offset, 7003500, 1.25, 'tauceti'); },
                Sheet_Metal(offset){ return spaceCostMultiplier('fusion_generator', offset, wom_recycle(95000), 1.25, 'tauceti'); },
            },
            effect(){
                let fuel = +int_fuel_adjust($(this)[0].p_fuel().a).toFixed(1);
                let desc = `<div>${loc('space_dwarf_reactor_effect1',[-($(this)[0].powered())])}</div>`;
                if (global.race['lone_survivor']){
                    desc = desc + `<div>${loc('gain',[-(fuel),global.resource[$(this)[0].p_fuel().r].name])}</div>`;
                }
                else {
                    desc = desc + `<div class="has-text-caution">${loc('spend',[fuel,global.resource[$(this)[0].p_fuel().r].name])}</div>`;
                }
                return desc;
            },
            p_fuel(){ return { r: 'Helium_3', a: global.tech['isolation'] ? (global.race['lone_survivor'] ? -15 : 75) : 500 }; },
            powered(){ return powerModifier(-32); },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('fusion_generator','tauceti');
                    global.tauceti.fusion_generator.on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['fusion_generator','tauceti']
                };
            }
        },
        repository: {
            id: 'tauceti-repository',
            title: loc('tech_repository'),
            desc: loc('tech_repository'),
            reqs: { tau_home: 5 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('repository', offset, 10280000, 1.28, 'tauceti'); },
                Iron(offset){ return spaceCostMultiplier('repository', offset, 1800000, 1.28, 'tauceti'); },
                Cement(offset){ return spaceCostMultiplier('repository', offset, 1500000, 1.28, 'tauceti'); },
                Neutronium(offset){ return spaceCostMultiplier('repository', offset, 215000, 1.28, 'tauceti'); },
            },
            wide: true,
            res(){
                let res = [
                    'Lumber','Stone','Furs','Copper','Iron','Aluminium','Cement','Coal','Steel','Titanium','Crystal',
                    'Alloy','Polymer','Iridium','Chrysotile','Nano_Tube','Neutronium','Adamantite','Unobtainium'
                ];
                if (global.tech['isolation']){
                    res.push('Oil');
                    res.push('Helium_3');
                    res.push('Uranium');
                    res.push('Water');
                    //res.push('Elerium');
                }
                return res;
            },
            val(res){
                switch (res){
                    case 'Lumber':
                        return 30000;
                    case 'Stone':
                        return 30000;
                    case 'Chrysotile':
                        return 30000;
                    case 'Crystal':
                        return 10;
                    case 'Furs':
                        return 17000;
                    case 'Copper':
                        return 15200;
                    case 'Iron':
                        return 14000;
                    case 'Aluminium':
                        return 12800;
                    case 'Cement':
                        return 11200;
                    case 'Coal':
                        return 4800;
                    case 'Steel':
                        return 2400;
                    case 'Titanium':
                        return 1600;
                    case 'Alloy':
                        return 1800;
                    case 'Polymer':
                        return 1500;
                    case 'Iridium':
                        return 1750;
                    case 'Nano_Tube':
                        return 1200;
                    case 'Neutronium':
                        return 640;
                    case 'Adamantite':
                        return 720;
                    case 'Unobtainium':
                        return 1000;
                    case 'Oil':
                        return 680;
                    case 'Helium_3':
                        return 575;
                    case 'Uranium':
                        return 125;
                    case 'Water':
                        return 15;
                    case 'Elerium':
                        return 3;
                    default:
                        return 0;
                }
            },
            effect(wiki){
                let storage = '<div class="aTable">';
                let multiplier = tpStorageMultiplier('repository',false,wiki);
                let containers = 250;
                for (const res of $(this)[0].res()){
                    if (global.resource[res].display){
                        let val = sizeApproximation(+(spatialReasoning($(this)[0].val(res)) * multiplier).toFixed(0),1);
                        storage = storage + `<span>${loc('plus_max_resource',[val,global.resource[res].name])}</span>`;
                    }
                };
                if (global.tech['isolation']){
                    storage = storage + `<span>${loc('plus_max_resource',[containers,global.resource.Crates.name])}</span><span>${loc('plus_max_resource',[containers,global.resource.Containers.name])}</span>`;
                }
                storage = storage + '</div>';
                return storage;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('repository','tauceti');

                    let containers = 250;
                    global.resource.Crates.max += containers;
                    global.resource.Containers.max += containers;
                    if (!global.resource.Containers.display){
                        unlockContainers();
                    }

                    let multiplier = tpStorageMultiplier('repository');
                    for (const res of $(this)[0].res()){
                        if (global.resource[res].display){
                            global.resource[res].max += (spatialReasoning($(this)[0].val(res)) * multiplier);
                        }
                    };
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0 },
                    p: ['repository','tauceti']
                };
            }
        },
        tau_factory: {
            id: 'tauceti-tau_factory',
            title: loc('tau_home_tau_factory'),
            desc(){
                return `<div>${loc('tau_home_tau_factory')}</div><div class="has-text-special">${loc('requires_power_support',[races[global.race.species].home])}</div>`;
            },
            reqs: { tau_home: 8 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('tau_factory', offset, 269000000, 1.25, 'tauceti'); },
                Titanium(offset){ return spaceCostMultiplier('tau_factory', offset, 3000000, 1.25, 'tauceti'); },
                Elerium(offset){ return spaceCostMultiplier('tau_factory', offset, 850, 1.25, 'tauceti'); },
                Bolognium(offset){ return spaceCostMultiplier('tau_factory', offset, 250000, 1.25, 'tauceti'); },
                Quantium(offset){ return spaceCostMultiplier('tau_factory', offset, wom_recycle(425000), 1.25, 'tauceti'); },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[$(this)[0].support(), races[global.race.species].home])}</div>`;
                desc = desc + `<div>${loc('tau_home_tau_factory_effect',[$(this)[0].manufacturing()])}</div>`;
                if (global.tech['isolation']){
                    if (!global.race['flier']){
                        desc = desc + `<div>${loc('plus_max_resource',[jobScale(2),loc(`job_cement_worker`)])}</div>`;
                    }
                    desc = desc + `<div>${loc('space_red_fabrication_effect1',[jobScale(5)])}</div>`;
                }
                desc = desc + `<div>${loc('city_crafted_mats',[global.tech['isolation'] ? 275 : 90])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            special: true,
            s_type: 'tau_home',
            support(){ return -1; },
            powered(){ return powerCostMod(global.tech['isolation'] ? 2 : 5); },
            manufacturing() { return global.tech['isolation'] ? 5 : 3; },
            action(){
                if (payCosts($(this)[0])){
                    global.civic.craftsman.display = true; // Needed in Lone Survivor
                    incrementStruct('tau_factory','tauceti');
                    if (powerOnNewStruct($(this)[0])){
                        global.city.factory.Alloy += $(this)[0].manufacturing();
                    }
                    return true;
                }
                return false;
            },
            post(){
                if (global.race['lone_survivor']){
                    defineIndustry();
                }
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['tau_factory','tauceti']
                };
            }
        },
        infectious_disease_lab: {
            id: 'tauceti-infectious_disease_lab',
            title(){ return global.tech['isolation'] ? loc('tech_infectious_disease_lab_alt') : (loc(global.race['artifical'] ? 'tech_infectious_disease_lab_s' : 'tech_infectious_disease_lab')); },
            desc(){
                return `<div>${$(this)[0].title()}</div><div class="has-text-special">${loc('requires_power_support',[races[global.race.species].home])}</div>`;
            },
            reqs: { disease: 1 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('infectious_disease_lab', offset, 1000000000, 1.25, 'tauceti'); },
                Alloy(offset){ return spaceCostMultiplier('infectious_disease_lab', offset, 32500000, 1.25, 'tauceti'); },
                Polymer(offset){ return spaceCostMultiplier('infectious_disease_lab', offset, 50000000, 1.25, 'tauceti'); },
                Bolognium(offset){ return spaceCostMultiplier('infectious_disease_lab', offset, 2500000, 1.25, 'tauceti'); },
                Unobtainium(offset){ return spaceCostMultiplier('infectious_disease_lab', offset, 64000, 1.25, 'tauceti'); },
            },
            effect(){
                let sci = 39616;
                if (global.tech['supercollider'] && global.tech['isolation']){
                    let ratio = global.tech['tp_particles'] || (global.tech['particles'] && global.tech['particles'] >= 3) ? 12.5: 25;
                    sci *= (global.tech['supercollider'] / ratio) + 1;
                }
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[$(this)[0].support(), races[global.race.species].home])}</div>`;
                desc = desc + `<div>${loc('city_max_knowledge',[Math.round(sci).toLocaleString()])}</div>`;
                if (global.tech['isolation']){
                    let elerium = spatialReasoning(375);
                    desc = desc + `<div>${loc('plus_max_resource',[elerium,global.resource.Elerium.name])}</div>`;
                    desc = desc + `<div>${loc('city_wardenclyffe_effect1',[jobScale(2), global.civic.professor.name])}</div>`;
                    desc = desc + `<div>${loc('city_wardenclyffe_effect1',[jobScale(1), global.civic.scientist.name])}</div>`;
                    desc = desc + `<div>${loc('space_zero_g_lab_effect',[jobScale(1)])}</div>`;
                    desc = desc + `<div>${loc('city_library_effect',[75])}</div>`;
                }
                if (global.tech['alien_crafting']){
                    desc = desc + `<div>${loc('production',[65,global.resource.Quantium.name])}</div>`;
                }
                if (global.tech['focus_cure']){
                    desc = desc + `<div>${loc('tau_home_disease_lab_cure',[+global.tauceti.infectious_disease_lab.cure.toFixed(1)])}</div>`;
                    if (global.race.hasOwnProperty('vax')){
                        desc = desc + `<div>${loc('tau_home_disease_lab_vax',[+global.race.vax.toFixed(2)])}</div>`;
                    }
                }
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            s_type: 'tau_home',
            support(){ return -1; },
            powered(){ return powerCostMod(global.tech['isolation'] ? (global.race['lone_survivor'] ? 2 : 8) : 35); },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('infectious_disease_lab','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0, cure: 0 },
                    p: ['infectious_disease_lab','tauceti']
                };
            },
            post(){
                if (global.tech.disease === 1){
                    global.tech.disease = 2;
                    messageQueue(loc('tau_plague4',[loc('tab_tauceti')]),'info',false,['progress']);
                    drawTech();
                }
                loadFoundry();
            },
            postPower(on){
                limitCraftsmen('Quantium');
            }
        },
        tauceti_casino: {
            id: 'tauceti-tauceti_casino',
            title: loc('city_casino'),
            desc: loc('city_casino'),
            category: 'commercial',
            reqs: { gambling: 1, isolation: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('tauceti_casino', offset, 1450000, 1.35, 'tauceti'); },
                Furs(offset){ return spaceCostMultiplier('tauceti_casino', offset, 95000, 1.35, 'tauceti'); },
                Cement(offset){ return spaceCostMultiplier('tauceti_casino', offset, 120000, 1.35, 'tauceti'); },
                Plywood(offset){ return spaceCostMultiplier('tauceti_casino', offset, wom_recycle(55000), 1.35, 'tauceti'); }
            },
            effect(){
                let pop = $(this)[0].citizens();
                let desc = global.race['lone_survivor'] ? `` : `<div>${loc('plus_max_resource',[pop,loc('citizen')])}</div>`;
                desc = desc + casinoEffect();
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(global.race['lone_survivor'] ? 1 : 2); },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('tauceti_casino','tauceti');
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
                    p: ['tauceti_casino','tauceti']
                };
            },
            citizens(){
                let gain = 1;
                if (global.race['high_pop']){
                    gain *= traits.high_pop.vars()[0];
                }
                return global.race['lone_survivor'] ? 0 : gain;
            },
            flair: loc('city_casino_flair')
        },
        tau_cultural_center: {
            id: 'tauceti-tau_cultural_center',
            title: loc('tech_cultural_center'),
            desc(){
                return `<div>${loc('tech_cultural_center')}</div><div class="has-text-special">${loc('space_electrolysis_req',[global.resource[$(this)[0].p_fuel().r].name])}</div>`;
            },
            category: 'commercial',
            reqs: { tau_culture: 1 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('tau_cultural_center', offset, 91450000, 1.35, 'tauceti'); },
                Copper(offset){ return spaceCostMultiplier('tau_cultural_center', offset, 5850000, 1.35, 'tauceti'); },
                Coal(offset){ return spaceCostMultiplier('tau_cultural_center', offset, 465000, 1.35, 'tauceti'); },
                Polymer(offset){ return spaceCostMultiplier('tau_cultural_center', offset, 3792000, 1.35, 'tauceti'); },
            },
            effect(){
                let womling = 8;
                let modifier = 1;
                if (global.civic.govern.type === 'corpocracy'){
                    modifier = 2;
                }
                else if (global.civic.govern.type === 'socialist'){
                    modifier = 0.8;
                }

                let cas = 20 * modifier;
                let mon = 5 * modifier;
                let bake = 15 * modifier;

                let desc = `<div class="has-text-caution">${loc('tau_home_cultureal_effect1',[$(this)[0].p_fuel().a,global.resource[$(this)[0].p_fuel().r].name,$(this)[0].title])}</div>`;
                desc += `<div>${loc('city_tourist_center_effect2',[cas,structName('casino')])}</div>`;
                desc += `<div>${loc('city_tourist_center_effect2',[mon,loc(`arpa_project_monument_title`)])}</div>`;
                desc += `<div>${loc('tau_home_cultureal_effect2',[womling,loc('tau_red_womlings')])}</div>`;
                if (global.tech.tau_culture >= 2){
                    desc += `<div>${loc('tau_home_cultureal_effect3',[bake,loc(`tau_gas2_alien_station_data2_r${global.race.tau_food_item || 0}`)])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(1); },
            p_fuel(){ return { r: 'Food', a: (global.race['lone_survivor'] ? 25 : 500) }; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('tau_cultural_center','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['tau_cultural_center','tauceti']
                };
            }
        },
    };

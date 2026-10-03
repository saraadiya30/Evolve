import { global } from '../core/vars.js';
import { vBind, messageQueue, powerCostMod, spaceCostMultiplier } from '../functions/functions.js';
import { races } from '../races/races.js';
import { spatialReasoning } from '../resources/resources.js';
import { payCosts, powerOnNewStruct, initStruct } from '../actions/actions.js';
import { int_fuel_adjust, incrementStruct, planetName } from '../space/space.js';
import { loc } from '../core/locale.js';
import { tauCetiModules } from './truepath_registry.js';
import { tauEnabled, wom_recycle, wom_repulse } from './tp_support.js';

// Region 'tau_red' dari tauCetiModules (dipisah dari truepath.js). Isi/urutan entri sama persis; digabung via truepath_registry.js di truepath.js.
function defineWomlings(){
    initStruct(tauCetiModules.tau_red.overseer);
    initStruct(tauCetiModules.tau_red.womling_village);
    initStruct(tauCetiModules.tau_red.womling_mine);
    initStruct(tauCetiModules.tau_red.womling_fun);
    initStruct(tauCetiModules.tau_red.womling_farm);
    if (global.race['lone_survivor']){
        global.tauceti.womling_village.count = 2;
        global.tauceti.womling_village.on = 2;
        global.tauceti.womling_mine.count = 1;
        global.tauceti.womling_mine.on = 1;
    }
}

export const tauRed = {
        info: {
            name(){
                return loc('tau_planet',[planetName().red]);
            },
            desc(){
                return loc('tau_red',[planetName().red]);
            },
            support: 'orbital_platform',
            extra(region){
                if (global.tech['tau_red'] && global.tech.tau_red >= 5){
                    $(`#${region}`).append(`<div id="${region}Womlings" class="syndThreat has-text-warning">${loc('tau_red_womling_prod')} <span class="has-text-info">{{ prod }}%</span></div>`);
                    vBind({
                        el: `#${region}Womlings`,
                        data: global.tauceti.overseer,
                    });
                }
            }
        },
        red_mission: {
            id: 'tauceti-red_mission',
            title(){ return loc('tau_new_mission_title',[planetName().red]); },
            desc(){ return loc('tau_new_mission_title',[planetName().red]); },
            reqs: { tauceti: 2 },
            grant: ['tau_red',1],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_red >= 1 ? 0 : 1; },
            cost: {
                Money(){ return 1000000000; }
            },
            effect(){ return loc('tau_new_mission_effect',[planetName().red]); },
            action(){
                if (payCosts($(this)[0])){
                    global.tauceti['settlement'] = { count: 0, on: 0 };
                    messageQueue(loc('tau_red_mission_result',[planetName().red]),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        orbital_platform: {
            id: 'tauceti-orbital_platform',
            title: loc('tau_red_orbital_platform'),
            desc: `<div>${loc('tau_red_orbital_platform')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { tau_red: 1, tauceti: 4 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('orbital_platform', offset, 50000000, 1.3, 'tauceti'); },
                Oil(offset){ return tauEnabled() ? spaceCostMultiplier('orbital_platform', offset, int_fuel_adjust(wom_repulse(275000)), 1.3, 'tauceti') : 0; },
                Aluminium(offset){ return spaceCostMultiplier('orbital_platform', offset, 1780000, 1.3, 'tauceti'); },
                Bolognium(offset){ return spaceCostMultiplier('orbital_platform', offset, 450000, 1.3, 'tauceti'); },
            },
            effect(){
                let oil = spatialReasoning(17500);
                let fuel = +int_fuel_adjust($(this)[0].support_fuel().a).toFixed(1);
                let desc = `<div>${loc('space_red_spaceport_effect1',[loc('tau_planet',[planetName().red]),$(this)[0].support()])}</div>`;
                desc = desc + `<div>${loc('plus_max_resource',[oil.toLocaleString(),global.resource.Oil.name])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('spend_power',[fuel,global.resource[$(this)[0].support_fuel().r].name,$(this)[0].powered()])}</div>`;
                return desc;
            },
            support_fuel(){ return { r: global.race['lone_survivor'] ? 'Helium_3' : 'Oil', a: global.tech['isolation'] ? (global.race['lone_survivor'] ? 8 : 32) : 125 }; },
            support(){
                let sup = global.tech['womling_logistics'] ? 2.5 : 2;
                if (global.race['lone_survivor']){ sup *= 2; }
                return sup;
            },
            powered(){ return powerCostMod(global.tech['isolation'] ? (global.race['lone_survivor'] ? 2 : 3) : 18); },
            refresh: true,
            action(){
                if (tauEnabled() && payCosts($(this)[0])){
                    incrementStruct('orbital_platform','tauceti');
                    powerOnNewStruct($(this)[0]);
                    if (global.tech['tau_red'] === 1){
                        global.tech['tau_red'] = 2;
                        messageQueue(loc('tau_red_orbital_platform_msg',[loc('tau_planet',[planetName().red]),loc('tau_planet',[races[global.race.species].home])]),'info',false,['progress']);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['orbital_platform','tauceti']
                };
            }
        },
        contact: {
            id: 'tauceti-contact',
            title(){ return loc('tau_red_contact'); },
            desc(){ return loc('tau_red_contact'); },
            reqs: { tau_red: 4 },
            grant: ['tau_red',5],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_red >= 5 ? 0 : 1; },
            cost: {
                Money(){ return 600000000; },
                Food(){ return global.race['lone_survivor'] && global.race['artifical'] ? 62000 : 2500000; }
            },
            effect(){ return loc('tau_red_contact_effect'); },
            action(){
                if (payCosts($(this)[0])){
                    global.race['womling_friend'] = 1;
                    defineWomlings();
                    return true;
                }
                return false;
            }
        },
        introduce: {
            id: 'tauceti-introduce',
            title(){ return loc('tau_red_introduce'); },
            desc(){ return loc('tau_red_introduce'); },
            reqs: { tau_red: 4 },
            grant: ['tau_red',5],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_red >= 5 ? 0 : 1; },
            cost: {
                Knowledge(){ return 7000000; }
            },
            effect(){ return loc('tau_red_introduce_effect'); },
            action(){
                if (payCosts($(this)[0])){
                    global.race['womling_god'] = 1;
                    defineWomlings();
                    return true;
                }
                return false;
            }
        },
        subjugate: {
            id: 'tauceti-subjugate',
            title(){ return loc('tau_red_subjugate'); },
            desc(){ return loc('tau_red_subjugate'); },
            reqs: { tau_red: 4 },
            grant: ['tau_red',5],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_red >= 5 ? 0 : 1; },
            cost: {
                Money(){ return 2850000000; }
            },
            effect(){ return loc('tau_red_subjugate_effect'); },
            action(){
                if (payCosts($(this)[0])){
                    global.race['womling_lord'] = 1;
                    defineWomlings();
                    return true;
                }
                return false;
            }
        },
        jeff: {
            id: 'tauceti-jeff',
            title(){ return loc('tau_red_jeff'); },
            desc(){ return loc('tau_red_jeff'); },
            reqs: { tau_red: 5 },
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_red >= 5 ? 0 : 1; },
            cost: {},
            effect(){
                let injured = global.tauceti['overseer'] ? global.tauceti.overseer.injured : 0;
                if (global.tauceti['overseer'] && global.tauceti.overseer.pop < injured){ injured = global.tauceti.overseer.pop; }
                let desc = `<div>${loc('tau_red_jeff_effect1',[global.tauceti['overseer'] ? global.tauceti.overseer.pop : 0])}</div>`;
                desc = desc + `<div>${loc('tau_red_jeff_effect2',[global.tauceti['overseer'] ? global.tauceti.overseer.working : 0])}</div>`;
                desc = desc + `<div>${loc('tau_red_jeff_effect3',[injured])}</div>`;
                desc = desc + `<div>${loc('tau_red_jeff_effect4',[global.tauceti['overseer'] ? global.tauceti.overseer.loyal : 0])}</div>`;
                desc = desc + `<div>${loc('tau_red_jeff_effect5',[global.tauceti['overseer'] ? global.tauceti.overseer.morale : 0])}</div>`;
                if (global.tech.hasOwnProperty('womling_tech')){
                    desc = desc + `<div>${loc('tau_red_jeff_effect6',[global.tech.womling_tech])}</div>`;
                }
                desc = desc + `<div class="divide-line">${loc('job_farmer')}: ${global.tauceti['womling_farm'] ? global.tauceti.womling_farm.farmers : 0}</div>`;
                desc = desc + `<div>${loc('job_miner')}: ${global.tauceti['womling_mine'] ? global.tauceti.womling_mine.miners : 0}</div>`;
                if (global.tauceti['womling_lab']){
                    desc = desc + `<div>${loc('job_scientist')}: ${global.tauceti['womling_lab'] ? global.tauceti.womling_lab.scientist : 0}</div>`;
                }
                return desc;
            },
            action(){
                return false;
            }
        },
        overseer: {
            id: 'tauceti-overseer',
            title(){ return $(this)[0].name(); },
            desc(){ return `<div>${$(this)[0].name()}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            name(){
                if (global.race['womling_lord']){
                    return loc('tau_red_overseer');
                }
                else if (global.race['womling_god']){
                    return loc('tau_red_womgod');
                }
                else {
                    return loc('tau_red_womally');
                }
            },
            reqs: { tau_red: 5 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('overseer', offset, 6000000, 1.28, 'tauceti'); },
                Cement(offset){ return spaceCostMultiplier('overseer', offset, 2450000, 1.28, 'tauceti'); },
                Alloy(offset){ return global.race['womling_friend'] ? spaceCostMultiplier('overseer', offset, 1850000, 1.28, 'tauceti') : 0; },
                Neutronium(offset){ return global.race['womling_lord'] ? spaceCostMultiplier('overseer', offset, 165000, 1.28, 'tauceti') : 0; },
                Titanium(offset){ return global.race['womling_god'] ? spaceCostMultiplier('overseer', offset, 2250000, 1.28, 'tauceti') : 0; },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[$(this)[0].support(), planetName().red])}</div>`;
                desc = desc + `<div>${loc('tau_red_overseer_effect',[$(this)[0].val()])}</div>`;
                return desc;
            },
            val(){
                let val = 0;
                if (global.race['womling_lord']){
                    val = global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5 ? 12 : 10;
                }
                else if (global.race['womling_god']){
                    val = global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5 ? 6 : 5;
                }
                else if (global.race['womling_friend']){
                    val = global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5 ? 10 : 8;
                }
                if (global.race['lone_survivor']){
                    val *= 2;
                }
                return val;
            },
            s_type: 'tau_red',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('overseer','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0, pop: 0, working: 0, injured: 0, morale: 0, loyal: 0, prod: 0 },
                    p: ['overseer','tauceti']
                };
            }
        },
        womling_village: {
            id: 'tauceti-womling_village',
            title: loc('tau_red_womling_village'),
            desc(){ return `<div>${loc('tau_red_womling_village')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            reqs: { tau_red: 5 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('womling_village', offset, 10000000, 1.28, 'tauceti'); },
                Stone(offset){ return spaceCostMultiplier('womling_village', offset, 2250000, 1.28, 'tauceti'); },
                Plywood(offset){ return spaceCostMultiplier('womling_village', offset, wom_recycle(1250000), 1.28, 'tauceti'); },
                Wrought_Iron(offset){ return spaceCostMultiplier('womling_village', offset, wom_recycle(400000), 1.28, 'tauceti'); },
            },
            effect(){
                let pop = global.tech['womling_pop'] && global.tech.womling_pop >= 2 ? 6 : 5;
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[$(this)[0].support(), planetName().red])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_village_effect',[pop])}</div>`;
                if (global.tech['tau_junksale']){
                    desc = desc + `<div>${loc('tau_red_womling_village_effect2',[40,loc(`tau_gas2_alien_station_data4_r${global.race.tau_junk_item || 0}`)])}</div>`;
                }
                return desc;
            },
            s_type: 'tau_red',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('womling_village','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 1, on: 1 },
                    p: ['womling_village','tauceti']
                };
            }
        },
        womling_farm: {
            id: 'tauceti-womling_farm',
            title: loc('tau_red_womling_farm'),
            desc(){ return `<div>${loc('tau_red_womling_farm')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            reqs: { tau_red: 5 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('womling_farm', offset, 24000000, 1.28, 'tauceti'); },
                Iron(offset){ return spaceCostMultiplier('womling_farm', offset, 9500000, 1.28, 'tauceti'); },
                Water(offset){ return spaceCostMultiplier('womling_farm', offset, 5000, 1.28, 'tauceti'); },
            },
            effect(){
                let food = global.tech['womling_pop'] ? 16 : 12;
                if (global.tech['womling_gene']){ food += 4; }
                let farmers = global.tauceti.hasOwnProperty('womling_farm') ? global.tauceti.womling_farm.farmers : 0;
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[$(this)[0].support(), planetName().red])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_farm_effect',[food])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_employ',[2])}</div>`;
                if (global.tech['isolation']){
                    desc = desc + `<div>${loc('tau_red_womling_generate',[global.resource.Furs.name])}</div>`;
                }
                desc = desc + `<div>${loc('tau_red_womling_farm_effect2',[food / 2 * farmers])}</div>`;
                return desc;
            },
            s_type: 'tau_red',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('womling_farm','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 1, on: 1, farmers: 0 },
                    p: ['womling_farm','tauceti']
                };
            }
        },
        womling_mine: {
            id: 'tauceti-womling_mine',
            title: loc('tau_red_womling_mine'),
            desc(){ return `<div>${loc('tau_red_womling_mine')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            reqs: { tau_red: 5 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('womling_mine', offset, 12500000, 1.28, 'tauceti'); },
                Lumber(offset){ return spaceCostMultiplier('womling_mine', offset, 12800000, 1.28, 'tauceti'); },
                Steel(offset){ return spaceCostMultiplier('womling_mine', offset, 4500000, 1.28, 'tauceti'); },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[$(this)[0].support(), planetName().red])}</div>`;
                if (global.tech['isolation']){
                    if (global.race['lone_survivor']){
                        desc = desc + `<div>${loc('tau_red_womling_mine_effect_c',[
                            global.resource.Unobtainium.name,global.resource.Uranium.name,global.resource.Titanium.name,global.resource.Iron.name,
                            global.resource.Copper.name,global.resource.Aluminium.name,global.resource.Neutronium.name,global.resource.Iridium.name
                        ])}</div>`;
                    }
                    else {
                        desc = desc + `<div>${loc('tau_red_womling_mine_effect_b',[global.resource.Unobtainium.name,global.resource.Uranium.name,global.resource.Titanium.name])}</div>`;
                    }
                }
                else {
                    desc = desc + `<div>${loc('tau_red_womling_mine_effect_a',[global.resource.Unobtainium.name])}</div>`;
                }
                desc = desc + `<div>${loc('tau_red_womling_employ',[6])}</div>`;
                return desc;
            },
            s_type: 'tau_red',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('womling_mine','tauceti');
                    global.resource.Unobtainium.display = true;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0, miners: 0 },
                    p: ['womling_mine','tauceti']
                };
            },
            flair(){ return loc('tau_red_womling_mine_flair'); }
        },
        womling_fun: {
            id: 'tauceti-womling_fun',
            title(){ return $(this)[0].name(); },
            desc(){ return `<div>${$(this)[0].name()}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            name(){
                if (global.race['womling_lord']){
                    return loc('tau_red_womling_fun1');
                }
                else if (global.race['womling_god']){
                    return loc('tau_red_womling_fun2');
                }
                else {
                    return loc('tau_red_womling_fun3');
                }
            },
            reqs: { tau_red: 6 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('womling_fun', offset, 3800000, 1.28, 'tauceti'); },
                Food(offset){ return global.race['womling_friend'] ? spaceCostMultiplier('womling_fun', offset, 175000, 1.28, 'tauceti') : 0; },
                Lumber(offset){ return spaceCostMultiplier('womling_fun', offset, 500000, 1.28, 'tauceti'); },
                Stone(offset){ return spaceCostMultiplier('womling_fun', offset, 500000, 1.28, 'tauceti'); },
                Furs(offset){ return global.race['womling_lord'] || global.race['womling_god'] ? spaceCostMultiplier('womling_fun', offset, 835000, 1.28, 'tauceti') : 0; },
                Copper(offset){ return global.race['womling_lord'] ? spaceCostMultiplier('womling_fun', offset, 1125000, 1.28, 'tauceti') : 0; },
                Alloy(offset){ return global.race['womling_god'] ? spaceCostMultiplier('womling_fun', offset, 656000, 1.28, 'tauceti') : 0; },
                Water(offset){ return global.race['womling_friend'] ? spaceCostMultiplier('womling_fun', offset, 3500, 1.28, 'tauceti') : 0; },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[$(this)[0].support(), planetName().red])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_fun_effect',[$(this)[0].val()])}</div>`;
                return desc;
            },
            val(){
                let val = 0;
                if (global.race['womling_lord']){
                    val = global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5 ? 24 : 20;
                }
                else if (global.race['womling_god']){
                    val = global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5 ? 12 : 10;
                }
                else if (global.race['womling_friend']){
                    val = global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5 ? 18 : 15;
                }
                if (global.race['lone_survivor']){
                    val *= 2;
                }
                return val;
            },
            s_type: 'tau_red',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('womling_fun','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['womling_fun','tauceti']
                };
            },
        },
        womling_lab: {
            id: 'tauceti-womling_lab',
            title: loc('interstellar_laboratory_title'),
            desc(){ return `<div>${loc('interstellar_laboratory_title')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            reqs: { tau_red: 7 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('womling_lab', offset, 65000000, 1.28, 'tauceti'); },
                Elerium(offset){ return spaceCostMultiplier('womling_lab', offset, 1200, 1.28, 'tauceti'); },
                Orichalcum(offset){ return spaceCostMultiplier('womling_lab', offset, 2500000, 1.28, 'tauceti'); },
                Unobtainium(offset){ return spaceCostMultiplier('womling_lab', offset, 10000, 1.28, 'tauceti'); },
                Quantium(offset){ return spaceCostMultiplier('womling_lab', offset, wom_recycle(95000), 1.28, 'tauceti'); },
            },
            effect(){
                let overseer = global.tauceti.hasOwnProperty('overseer') ? global.tauceti.overseer.prod : 100;
                let know = Math.round(25000 * overseer / 100);
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[$(this)[0].support(), planetName().red])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_lab_effect',[know])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_employ_single',[1])}</div>`;
                return desc;
            },
            s_type: 'tau_red',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('womling_lab','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0, scientist: 0, tech: 0 },
                    p: ['womling_lab','tauceti']
                };
            },
        },
    };

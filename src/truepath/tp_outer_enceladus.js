import { global } from '../core/vars.js';
import { vBind, messageQueue, powerCostMod, spaceCostMultiplier } from '../functions/functions.js';
import { races } from '../races/races.js';
import { unlockContainers } from '../resources/resources.js';
import { jobScale, loadFoundry, limitCraftsmen } from '../civics/jobs.js';
import { production } from '../resources/prod.js';
import { payCosts, powerOnNewStruct } from '../actions/actions.js';
import { fuel_adjust, incrementStruct, planetName } from '../space/space.js';
import { loc } from '../core/locale.js';
import { syndicate } from './truepath.js';

// Region 'spc_enceladus' dari outerTruth (dipisah dari truepath.js). Isi/urutan entri sama persis; digabung via truepath_registry.js di truepath.js.
export const outerEnceladus = {
        info: {
            name(){
                return planetName().enceladus;
            },
            desc(){
                return loc('space_enceladus_info_desc',[planetName().enceladus, races[global.race.species].home]);
            },
            support: 'titan_spaceport',
            zone: 'outer',
            syndicate(){ return global.tech['titan'] && global.tech.titan >= 3 && global.tech['enceladus'] && global.tech.enceladus >= 2 ? true : false; },
            syndicate_cap(){
                if (global.tech['triton']){
                    return global.tech.outer >= 4 ? 1500 : 1000;
                }
                return 600;
            }
        },
        enceladus_mission: {
            id: 'space-enceladus_mission',
            title(){
                return loc('space_mission_title',[planetName().enceladus]);
            },
            desc(){
                return loc('space_mission_desc',[planetName().enceladus]);
            },
            reqs: { outer: 1 },
            grant: ['enceladus',1],
            path: ['truepath'],
            queue_complete(){ return global.tech.enceladus >= 1 ? 0 : 1; },
            cost: {
                Helium_3(offset,wiki){ return +fuel_adjust(250000,false,wiki).toFixed(0); },
                Elerium(){ return 100; }
            },
            effect(){
                return loc('space_titan_mission_effect',[planetName().enceladus]);
            },
            action(){
                if (payCosts($(this)[0])){
                    messageQueue(loc('space_enceladus_mission_action',[planetName().enceladus]),'info',false,['progress']);
                    global.resource.Water.display = true;
                    return true;
                }
                return false;
            }
        },
        water_freighter: {
            id: 'space-water_freighter',
            title: loc('space_water_freighter_title'),
            desc(){
                return `<div>${loc('space_water_freighter_title')}</div><div class="has-text-special">${loc('space_support',[planetName().enceladus])}</div>`;
            },
            reqs: { enceladus: 2 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('water_freighter', offset, 450000, 1.25); },
                Iron(offset){ return spaceCostMultiplier('water_freighter', offset, 362000, 1.25); },
                Nano_Tube(offset){ return spaceCostMultiplier('water_freighter', offset, 125000, 1.25); },
                Sheet_Metal(offset){ return spaceCostMultiplier('water_freighter', offset, 75000, 1.25); }
            },
            effect(wiki){
                let helium = +fuel_adjust(5,true,wiki).toFixed(2);
                let water = +(production('water_freighter')).toFixed(2);
                return `<div class="has-text-caution">${loc('space_used_support',[planetName().enceladus])}</div><div>${loc('produce',[water,global.resource.Water.name])}</div><div class="has-text-caution">${loc(`space_belt_station_effect3`,[helium])}</div>`;
            },
            s_type: 'enceladus',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('water_freighter');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['water_freighter','space']
                };
            }
        },
        zero_g_lab: {
            id: 'space-zero_g_lab',
            title: loc('tech_zero_g_lab'),
            desc(){
                return `<div>${loc('tech_zero_g_lab')}</div><div class="has-text-special">${loc('requires_power_support',[planetName().enceladus])}</div>`;
            },
            reqs: { enceladus: 3 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('zero_g_lab', offset, 5000000, 1.25); },
                Alloy(offset){ return spaceCostMultiplier('zero_g_lab', offset, 125000, 1.25); },
                Graphene(offset){ return spaceCostMultiplier('zero_g_lab', offset, 225000, 1.25); },
                Stanene(offset){ return spaceCostMultiplier('zero_g_lab', offset, 600000, 1.25); }
            },
            effect(){
                let synd = syndicate('spc_enceladus');
                let know = Math.round(10000 * synd);

                let desc = `<div class="has-text-caution">${loc('space_used_support',[planetName().enceladus])}</div><div>${loc('city_max_knowledge',[know])}</div>`;
                if (global.resource.Quantium.display){
                    desc = desc + `<div>${loc('space_zero_g_lab_effect',[jobScale(1)])}</div>`;
                }
                if (global.resource.Cipher.display){
                    desc = desc + `<div>${loc('plus_max_resource',[10000,global.resource.Cipher.name])}</div>`;
                }
                return desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            s_type: 'enceladus',
            support(){ return -1; },
            powered(){ return powerCostMod(12); },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('zero_g_lab');
                    powerOnNewStruct($(this)[0]);
                    if (global.space.zero_g_lab.count === 1 && global.tech['quantium']){
                        loadFoundry();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['zero_g_lab','space']
                };
            },
            postPower(on){
                limitCraftsmen('Quantium');
            }
        },
        operating_base: {
            id: 'space-operating_base',
            title: loc('tech_operating_base'),
            desc(){
                return `<div>${loc('tech_operating_base')}</div><div class="has-text-special">${loc('requires_power_support',[planetName().enceladus])}</div>`;
            },
            reqs: { enceladus: 4 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('operating_base', offset, 7500000, 1.3); },
                Furs(offset){ return spaceCostMultiplier('operating_base', offset, 500000, 1.3); },
                Adamantite(offset){ return spaceCostMultiplier('operating_base', offset, 375000, 1.3); },
                Stanene(offset){ return spaceCostMultiplier('operating_base', offset, 750000, 1.3); },
                Mythril(offset){ return spaceCostMultiplier('operating_base', offset, 225000, 1.3); },
                Horseshoe(){ return global.race['hooved'] ? 4 : 0; }
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('space_used_support',[planetName().enceladus])}</div>`;
                desc += `<div>${loc('galaxy_defense_platform_effect',[50])}</div>`;
                desc += loc('plus_max_resource',[$(this)[0].soldiers(),loc('civics_garrison_soldiers')]);
                if (global.race['orbit_decayed']){
                    let healing = global.tech['medic'] * 5;
                    desc += `<div>${loc('city_hospital_effect',[healing])}</div>`;
                }
                return desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            s_type: 'enceladus',
            support(){ return -1; },
            powered(){ return powerCostMod(10); },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('operating_base');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['operating_base','space']
                };
            },
            soldiers(){
                let soldiers = global.race['grenadier'] ? 3 : 4;
                return jobScale(soldiers);
            },
            post(){
                vBind({el: `#spc_enceladussynd`},'update');
            }
        },
        munitions_depot: {
            id: 'space-munitions_depot',
            title: loc('tech_munitions_depot'),
            desc: loc('tech_munitions_depot'),
            category: 'storage',
            era: 'solar',
            reqs: { enceladus: 5 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('munitions_depot', offset, 5000000, 1.22); },
                Iron(offset){ return spaceCostMultiplier('munitions_depot', offset, 185000, 1.22); },
                Sheet_Metal(offset){ return spaceCostMultiplier('munitions_depot', offset, 100000, 1.22); },
            },
            effect(){
                let containers = 25;
                return `<div>${loc('plus_max_crates',[containers])}</div><div>${loc('plus_max_containers',[containers])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('munitions_depot');
                    global.resource.Crates.max += 25;
                    global.resource.Containers.max += 25;
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
                    p: ['munitions_depot','space']
                };
            },
        }
    };

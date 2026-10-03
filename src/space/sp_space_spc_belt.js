import { loc } from '../core/locale.js';
import { global } from '../core/vars.js';
import { payCosts, powerOnNewStruct } from '../actions/actions.js';
import { messageQueue, spaceCostMultiplier, powerCostMod } from '../functions/functions.js';
import { spatialReasoning } from '../resources/resources.js';
import { jobScale } from '../civics/jobs.js';
import { production } from '../resources/prod.js';
import { planetName, fuel_adjust, incrementStruct } from './space.js';

// Region 'spc_belt' dari spaceProjects (dipisah dari space.js). Isi sama persis; digabung via space_registry.js di space.js.
export const spaceProjects_spc_belt = {
        info: {
            name(){
                return loc('space_belt_info_name');
            },
            desc(){
                return global.space['space_station'] && global.space.space_station.count > 0
                    ? `<div>${loc('space_belt_info_desc',[planetName().red,planetName().gas])}</div><div class="has-text-special">${loc('space_belt_info_desc2')}</div>`
                    : loc('space_belt_info_desc',[planetName().red,planetName().gas]);
            },
            support: 'space_station',
            zone: 'inner',
            syndicate(){ return true; }
        },
        belt_mission: {
            id: 'space-belt_mission',
            title(){
                return loc('space_belt_mission_title');
            },
            desc(){
                return loc('space_belt_mission_desc');
            },
            reqs: { space: 5 },
            grant: ['asteroid',1],
            queue_complete(){ return global.tech.asteroid >= 1 ? 0 : 1; },
            cost: {
                Helium_3(offset,wiki){ return +fuel_adjust(25000,false,wiki).toFixed(0); }
            },
            effect(){
                return loc('space_belt_mission_effect1');
            },
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('space_belt_mission_action'),'info',false,['progress']);
                    global.settings.space.dwarf = true;
                    return true;
                }
                return false;
            }
        },
        space_station: {
            id: 'space-space_station',
            title: loc('space_belt_station_title'),
            desc(){
                return `<div>${loc('space_belt_station_desc')}</div><div class="has-text-special">${loc('requires_power_space',[global.resource.Food.name])}</div>`;
            },
            reqs: { asteroid: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('space_station', offset, 250000, 1.3); },
                Iron(offset){ return spaceCostMultiplier('space_station', offset, 85000, 1.3); },
                Polymer(offset){ return spaceCostMultiplier('space_station', offset, 18000, 1.3); },
                Iridium(offset){ return spaceCostMultiplier('space_station', offset, 2800, 1.28); },
                Helium_3(offset,wiki){ return spaceCostMultiplier('space_station', offset, fuel_adjust(2000,false,wiki), 1.3); },
                Mythril(offset){ return spaceCostMultiplier('space_station', offset, 75, 1.25); }
            },
            effect(wiki){
                let helium = +(fuel_adjust(2.5,true,wiki)).toFixed(2);
                let food = global.race['cataclysm'] ? 1 : 10;
                let elerium_cap = spatialReasoning(5);
                let elerium = global.tech['asteroid'] >= 5 ? `<div>${loc('plus_max_resource',[elerium_cap, global.resource.Elerium.name])}</div>` : '';
                if(global.race['fasting']){
                    return `<div>${loc('plus_max_resource',[jobScale(3),loc('job_space_miner')])}</div>${elerium}<div class="has-text-caution">${loc('space_belt_station_effect5',[helium,$(this)[0].powered()])}</div>`;
                }
                return `<div>${loc('plus_max_resource',[jobScale(3),loc('job_space_miner')])}</div>${elerium}<div class="has-text-caution">${loc('space_belt_station_effect3',[helium])}</div><div class="has-text-caution">${loc('space_belt_station_effect4',[food,$(this)[0].powered(),global.resource.Food.name])}</div>`;
            },
            support(){ return jobScale(3); },
            powered(){ return powerCostMod(3); },
            refresh: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('space_station');
                    global.civic.space_miner.display = true;
                    if (global.tech['asteroid'] < 3){
                        global.tech['asteroid'] = 3;
                    }
                    if (powerOnNewStruct($(this)[0])){
                        let hiredMax = jobScale(3);
                        global.civic.space_miner.max += hiredMax;

                        let hired = Math.min(hiredMax, global.civic[global.civic.d_job].workers);
                        global.civic[global.civic.d_job].workers -= hired;
                        global.civic.space_miner.workers += hired;
                    }
                    if (global.race['orbit_decay'] && global.race.orbit_decay > global.stats.days + 1000){
                        global.race.orbit_decay = global.stats.days + 1000;
                        messageQueue(loc('evo_challenge_orbit_decayed_accelerated',[global.race.orbit_decay - global.stats.days]),'info',false,['progress']);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['space_station','space']
                };
            }
        },
        elerium_ship: {
            id: 'space-elerium_ship',
            title: loc('space_belt_elerium_ship_title'),
            desc(){
                return loc('space_belt_elerium_ship_title');
            },
            reqs: { asteroid: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('elerium_ship', offset, 500000, 1.3); },
                Uranium(offset){ return spaceCostMultiplier('elerium_ship', offset, 2500, 1.3); },
                Titanium(offset){ return spaceCostMultiplier('elerium_ship', offset, 10000, 1.3); },
                Mythril(offset){ return spaceCostMultiplier('elerium_ship', offset, 500, 1.3); },
                Helium_3(offset,wiki){ return spaceCostMultiplier('elerium_ship', offset, fuel_adjust(5000,false,wiki), 1.3); }
            },
            effect(){
                let elerium = +(production('elerium_ship')).toFixed(4);
                return `<div class="has-text-caution">${loc('space_belt_elerium_ship_effect1',[jobScale(2)])}</div><div>${loc('space_belt_elerium_ship_effect2',[elerium])}</div>`;
            },
            s_type: 'belt',
            support(){ return jobScale(-2); },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('elerium_ship');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['elerium_ship','space']
                };
            }
        },
        iridium_ship: {
            id: 'space-iridium_ship',
            title: loc('space_belt_iridium_ship_title'),
            desc(){
                return loc('space_belt_iridium_ship_title');
            },
            reqs: { asteroid: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('iridium_ship', offset, 120000, 1.3); },
                Uranium(offset){ return spaceCostMultiplier('iridium_ship', offset, 1000, 1.3); },
                Alloy(offset){ return spaceCostMultiplier('iridium_ship', offset, 48000, 1.3); },
                Iridium(offset){ return spaceCostMultiplier('iridium_ship', offset, 2800, 1.3); },
                Helium_3(offset,wiki){ return spaceCostMultiplier('iridium_ship', offset, fuel_adjust(1800,false,wiki), 1.3); }
            },
            effect(){
                let iridium = +(production('iridium_ship')).toFixed(3);
                return `<div class="has-text-caution">${loc('space_belt_iridium_ship_effect1',[jobScale(1)])}</div><div>${loc('space_belt_iridium_ship_effect2',[iridium])}</div>`;
            },
            s_type: 'belt',
            support(){ return jobScale(-1); },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('iridium_ship');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['iridium_ship','space']
                };
            }
        },
        iron_ship: {
            id: 'space-iron_ship',
            title: loc('space_belt_iron_ship_title'),
            desc(){
                return loc('space_belt_iron_ship_title');
            },
            reqs: { asteroid: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('iron_ship', offset, 80000, 1.3); },
                Steel(offset){ return spaceCostMultiplier('iron_ship', offset, 42000, 1.3); },
                Aluminium(offset){ return spaceCostMultiplier('iron_ship', offset, 38000, 1.3); },
                Polymer(offset){ return spaceCostMultiplier('iron_ship', offset, 16000, 1.3); },
                Helium_3(offset,wiki){ return spaceCostMultiplier('iron_ship', offset, fuel_adjust(1200,false,wiki), 1.3); }
            },
            effect(){
                let iron = +(production('iron_ship')).toFixed(2);
                if (global.tech['solar'] && global.tech['solar'] >= 5){
                    return `<div class="has-text-caution">${loc('space_belt_iron_ship_effect1',[jobScale(1)])}</div><div>${loc('space_belt_iron_ship_effect2',[iron])}</div><div>${loc('space_belt_iron_ship_effect3')}</div>`;
                }
                else {
                    return `<div class="has-text-caution">${loc('space_belt_iron_ship_effect1',[jobScale(1)])}</div><div>${loc('space_belt_iron_ship_effect2',[iron])}</div>`;
                }
            },
            s_type: 'belt',
            support(){ return jobScale(-1); },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('iron_ship');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['iron_ship','space']
                };
            }
        },
    };

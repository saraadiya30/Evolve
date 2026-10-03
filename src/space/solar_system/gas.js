import { loc } from '../../core/locale.js';
import { races } from '../../races/races.js';
import { global } from '../../core/vars.js';
import { payCosts, initStruct, powerOnNewStruct } from '../../actions/actions.js';
import { messageQueue, spaceCostMultiplier, powerCostMod } from '../../functions/functions.js';
import { production } from '../../resources/prod.js';
import { spatialReasoning } from '../../resources/resources.js';
import { spaceProjects } from '../space_registry.js';
import { planetName, fuel_adjust, incrementStruct } from '../space.js';

// Region 'spc_gas' dari spaceProjects (dipisah dari space.js). Isi sama persis; digabung via space_registry.js di space.js.
export const spaceProjects_spc_gas = {
        info: {
            name(){
                return planetName().gas;
            },
            desc(){
                return loc('space_gas_info_desc',[planetName().gas, races[global.race.species].home]);
            },
            zone: 'outer',
            syndicate(){ return true; }
        },
        gas_mission: {
            id: 'space-gas_mission',
            title(){
                return loc('space_mission_title',[planetName().gas]);
            },
            desc(){
                return loc('space_mission_desc',[planetName().gas]);
            },
            reqs: { space: 4, space_explore: 4 },
            grant: ['space',5],
            queue_complete(){ return global.tech.space >= 5 ? 0 : 1; },
            cost: {
                Helium_3(offset,wiki){ return +fuel_adjust(12500,false,wiki).toFixed(0); }
            },
            effect(){
                return loc('space_gas_mission_effect',[planetName().gas]);
            },
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('space_gas_mission_action',[planetName().gas]),'info',false,['progress']);
                    global.settings.space.gas_moon = true;
                    global.settings.space.belt = true;
                    initStruct(spaceProjects.spc_belt.space_station);
                    return true;
                }
                return false;
            }
        },
        gas_mining: {
            id: 'space-gas_mining',
            title: loc('space_gas_mining_title'),
            desc(){
                return `<div>${loc('space_gas_mining_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { gas_giant: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('gas_mining', offset, 250000, 1.32); },
                Uranium(offset){ return spaceCostMultiplier('gas_mining', offset, 500, 1.32); },
                Alloy(offset){ return spaceCostMultiplier('gas_mining', offset, 10000, 1.32); },
                Helium_3(offset,wiki){ return spaceCostMultiplier('gas_mining', offset, fuel_adjust(2500,false,wiki), 1.32); },
                Mythril(offset){ return spaceCostMultiplier('gas_mining', offset, 25, 1.32); }
            },
            effect(){
                let helium = +(production('gas_mining')).toFixed(2);
                return `<div>${loc('space_gas_mining_effect1',[helium])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(2); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('gas_mining');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['gas_mining','space']
                };
            }
        },
        gas_storage: {
            id: 'space-gas_storage',
            title(){ return loc('space_gas_storage_title',[planetName().gas]); },
            desc(){
                return `<div>${loc('space_gas_storage_desc')}</div>`;
            },
            reqs: { gas_giant: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('gas_storage', offset, 125000, 1.32); },
                Iridium(offset){ return spaceCostMultiplier('gas_storage', offset, 3000, 1.32); },
                Sheet_Metal(offset){ return spaceCostMultiplier('gas_storage', offset, 2000, 1.32); },
                Helium_3(offset,wiki){ return spaceCostMultiplier('gas_storage', offset, fuel_adjust(1000,false,wiki), 1.32); },
            },
            effect(){
                let oil = spatialReasoning(3500) * (global.tech['world_control'] ? 1.5 : 1);
                let helium = spatialReasoning(2500) * (global.tech['world_control'] ? 1.5 : 1);
                let uranium = spatialReasoning(1000) * (global.tech['world_control'] ? 1.5 : 1);
                return `<div>${loc('plus_max_resource',[oil,global.resource.Oil.name])}</div><div>${loc('plus_max_resource',[helium,global.resource.Helium_3.name])}</div><div>${loc('plus_max_resource',[uranium,global.resource.Uranium.name])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('gas_storage');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['gas_storage','space']
                };
            }
        },
        star_dock: {
            id: 'space-star_dock',
            title(){ return loc('space_gas_star_dock_title'); },
            desc(){
                return `<div>${loc('space_gas_star_dock_title')}</div><div class="has-text-special">${loc('space_gas_star_dock_desc_req')}</div>`;
            },
            reqs: { genesis: 3 },
            queue_complete(){ return 1 - global.space.star_dock.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.space.hasOwnProperty('star_dock') ? global.space.star_dock.count : 0)) === 0 ? 1500000 : 0; },
                Steel(offset){ return ((offset || 0) + (global.space.hasOwnProperty('star_dock') ? global.space.star_dock.count : 0)) === 0 ? 500000 : 0; },
                Helium_3(offset,wiki){ return ((offset || 0) + (global.space.hasOwnProperty('star_dock') ? global.space.star_dock.count : 0)) === 0 ? Math.round(fuel_adjust(global.race['gravity_well'] ? 25000 : 10000,false,wiki)) : 0; },
                Nano_Tube(offset){ return ((offset || 0) + (global.space.hasOwnProperty('star_dock') ? global.space.star_dock.count : 0)) === 0 ? 250000 : 0; },
                Mythril(offset){ return ((offset || 0) + (global.space.hasOwnProperty('star_dock') ? global.space.star_dock.count : 0)) === 0 ? 10000 : 0; },
            },
            effect(){
                return `<div>${loc('space_gas_star_dock_effect1')}</div>`;
            },
            special: true,
            action(args){
                if (global.space.star_dock.count === 0 && payCosts($(this)[0])){
                    incrementStruct('star_dock');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: {
                        count: 0,
                        ship: 0,
                        probe: 0,
                        template: global.race.species
                    },
                    p: ['star_dock','space']
                };
            }
        },
    };

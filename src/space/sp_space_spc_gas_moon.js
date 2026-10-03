import { loc } from '../core/locale.js';
import { global } from '../core/vars.js';
import { payCosts, initStruct, powerOnNewStruct } from '../actions/actions.js';
import { messageQueue, spaceCostMultiplier, powerCostMod } from '../functions/functions.js';
import { production } from '../resources/prod.js';
import { spatialReasoning } from '../resources/resources.js';
import { traits } from '../races/races.js';
import { spaceProjects } from './space_registry.js';
import { planetName, fuel_adjust, incrementStruct } from './space.js';

// Region 'spc_gas_moon' dari spaceProjects (dipisah dari space.js). Isi sama persis; digabung via space_registry.js di space.js.
export const spaceProjects_spc_gas_moon = {
        info: {
            name(){
                return planetName().gas_moon;
            },
            desc(){
                return loc('space_gas_moon_info_desc',[planetName().gas_moon,planetName().gas]);
            },
            zone: 'outer',
            syndicate(){ return true; }
        },
        gas_moon_mission: {
            id: 'space-gas_moon_mission',
            title(){
                return loc('space_mission_title',[planetName().gas_moon]);
            },
            desc(){
                return loc('space_mission_desc',[planetName().gas_moon]);
            },
            reqs: { space: 5 },
            grant: ['space',6],
            queue_complete(){ return global.tech.space >= 6 ? 0 : 1; },
            cost: {
                Helium_3(offset,wiki){ return +fuel_adjust(30000,false,wiki).toFixed(0); }
            },
            effect(){
                return loc('space_gas_moon_mission_effect',[planetName().gas_moon]);
            },
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('space_gas_moon_mission_action',[planetName().gas_moon]),'info',false,['progress']);
                    initStruct(spaceProjects.spc_gas_moon.outpost);
                    global.tech['gas_moon'] = 1;
                    return true;
                }
                return false;
            }
        },
        outpost: {
            id: 'space-outpost',
            title: loc('space_gas_moon_outpost_title'),
            desc(){
                return `<div>${loc('space_gas_moon_outpost_desc')}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Oil.name])}</div>`;
            },
            reqs: { gas_moon: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('outpost', offset, 666000, 1.3); },
                Titanium(offset){ return spaceCostMultiplier('outpost', offset, 18000, 1.3); },
                Iridium(offset){ return spaceCostMultiplier('outpost', offset, 2500, 1.3); },
                Helium_3(offset,wiki){ return spaceCostMultiplier('outpost', offset, fuel_adjust(6000,false,wiki), 1.3); },
                Mythril(offset){ return spaceCostMultiplier('outpost', offset, 300, 1.3); }
            },
            effect(wiki){
                let p_values = production('outpost');
                let neutronium = p_values.b;
                let max = spatialReasoning(500);
                let oil = +(fuel_adjust(2,true,wiki)).toFixed(2);
                return `<div>${loc('space_gas_moon_outpost_effect1',[neutronium])}</div><div>${loc('plus_max_resource',[max,global.resource.Neutronium.name])}</div><div class="has-text-caution">${loc('space_gas_moon_outpost_effect3',[oil,$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(3); },
            powerBalancer(){
                return [{ r: 'Neutronium', k: 'lpmod' }];
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('outpost');
                    global.resource['Neutronium'].display = true;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['outpost','space']
                };
            }
        },
        drone: {
            id: 'space-drone',
            title: loc('space_gas_moon_drone_title'),
            desc(){
                return `<div>${loc('space_gas_moon_drone_desc')}</div>`;
            },
            reqs: { gas_moon: 1, drone: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('drone', offset, 250000, 1.3); },
                Steel(offset){ return spaceCostMultiplier('drone', offset, 20000, 1.3); },
                Neutronium(offset){ return spaceCostMultiplier('drone', offset, 500, 1.3); },
                Elerium(offset){ return spaceCostMultiplier('drone', offset, 25, 1.3); },
                Nano_Tube(offset){ return spaceCostMultiplier('drone', offset, 45000, 1.3); }
            },
            effect(){
                let value = global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 3 ? 12 : 6;
                return `<div>${loc('space_gas_moon_drone_effect1',[value])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('drone');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['drone','space']
                };
            }
        },
        oil_extractor: {
            id: 'space-oil_extractor',
            title: loc('space_gas_moon_oil_extractor_title'),
            desc(){
                return `<div>${loc('space_gas_moon_oil_extractor_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { gas_moon: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('oil_extractor', offset, 666000, 1.3); },
                Polymer(offset){ return spaceCostMultiplier('oil_extractor', offset, 7500, 1.3); },
                Helium_3(offset,wiki){ return spaceCostMultiplier('oil_extractor', offset, fuel_adjust(2500,false,wiki), 1.3); },
                Wrought_Iron(offset){ return spaceCostMultiplier('oil_extractor', offset, 5000, 1.3); },
            },
            effect(){
                let oil = +(production('oil_extractor')).toFixed(2);

                let desc = `<div>${loc('space_gas_moon_oil_extractor_effect1',[oil])}</div>`;
                if (global.race['blubber'] && global.city.hasOwnProperty('oil_well')){
                    let maxDead = global.city.oil_well.count + (global.space['oil_extractor'] ? global.space.oil_extractor.count : 0);
                    desc += `<div>${loc('city_oil_well_bodies',[+(global.city.oil_well.dead).toFixed(1),50 * maxDead])}</div>`;
                    desc += `<div>${loc('city_oil_well_consume',[traits.blubber.vars()[0]])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(1); },
            powerBalancer(){
                return [{ r: 'Oil', k: 'lpmod' }];
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('oil_extractor');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['oil_extractor','space']
                };
            }
        },
    };

import { loc } from '../core/locale.js';
import { global, p_on } from '../core/vars.js';
import { races } from '../races/races.js';
import { payCosts, initStruct, powerOnNewStruct } from '../actions/actions.js';
import { messageQueue, spaceCostMultiplier, powerCostMod, get_qlevel } from '../functions/functions.js';
import { production } from '../resources/prod.js';
import { spatialReasoning } from '../resources/resources.js';
import { jobScale } from '../civics/jobs.js';
import { addSmelter } from '../industry/industry.js';
import { interstellarProjects } from './space_registry.js';
import { int_fuel_adjust, incrementStruct } from './space.js';

// Region 'int_neutron' dari interstellarProjects (dipisah dari space.js). Isi sama persis; digabung via space_registry.js di space.js.
export const interstellarProjects_int_neutron = {
        info: {
            name: loc('interstellar_neutron_name'),
            desc(){ return global.tech['neutron'] ? loc('interstellar_neutron_desc2',[races[global.race.species].home]) : loc('interstellar_neutron_desc1'); },
        },
        neutron_mission: {
            id: 'interstellar-neutron_mission',
            title: loc('space_mission_title', [loc('interstellar_neutron_name')]),
            desc: loc('space_mission_desc', [loc('interstellar_neutron_name')]),
            reqs: { nebula: 1, high_tech: 14 },
            grant: ['neutron',1],
            queue_complete(){ return global.tech.neutron >= 1 ? 0 : 1; },
            cost: {
                Helium_3(){ return +int_fuel_adjust(60000).toFixed(0); },
                Deuterium(){ return +int_fuel_adjust(10000).toFixed(0); }
            },
            effect: loc('interstellar_neutron_mission_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    initStruct(interstellarProjects.int_neutron.neutron_miner);
                    messageQueue(loc('interstellar_neutron_mission_result'),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        neutron_miner: {
            id: 'interstellar-neutron_miner',
            title: loc('interstellar_neutron_miner_title'),
            desc(){ return `<div>${loc('interstellar_neutron_miner_desc')}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Helium_3.name])}</div>`; },
            reqs: { neutron: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('neutron_miner', offset, 1000000, 1.32, 'interstellar'); },
                Titanium(offset){ return spaceCostMultiplier('neutron_miner', offset, 45000, 1.32, 'interstellar'); },
                Stanene(offset){ return spaceCostMultiplier('neutron_miner', offset, 88000, 1.32, 'interstellar'); },
                Elerium(offset){ return spaceCostMultiplier('neutron_miner', offset, 20, 1.32, 'interstellar'); },
                Aerogel(offset){ return spaceCostMultiplier('neutron_miner', offset, 50, 1.32, 'interstellar'); },
            },
            effect(){
                let neutronium = +(production('neutron_miner')).toFixed(3);
                let max_neutronium = spatialReasoning(500);
                let helium = +int_fuel_adjust(3).toFixed(2);
                return `<div>${loc('space_gas_moon_outpost_effect1',[neutronium])}</div><div>${loc('plus_max_resource',[max_neutronium,global.resource.Neutronium.name])}</div><div class="has-text-caution">${loc('interstellar_alpha_starport_effect2',[helium,$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(6); },
            powerBalancer(){
                return [{ r: 'Neutronium', k: 'lpmod' }];
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('neutron_miner','interstellar');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['neutron_miner','interstellar']
                };
            }
        },
        citadel: {
            id: 'interstellar-citadel',
            title: loc('interstellar_citadel_title'),
            desc: `<div>${loc('interstellar_citadel_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { neutron: 1, high_tech: 15 },
            cost: {
                Money(offset){ return spaceCostMultiplier('citadel', offset, 5000000, 1.25, 'interstellar'); },
                Knowledge(offset){ return spaceCostMultiplier('citadel', offset, 1500000, 1.15, 'interstellar'); },
                Graphene(offset){ return spaceCostMultiplier('citadel', offset, 50000, 1.25, 'interstellar'); },
                Stanene(offset){ return spaceCostMultiplier('citadel', offset, 100000, 1.25, 'interstellar'); },
                Elerium(offset){ return spaceCostMultiplier('citadel', offset, 250, 1.25, 'interstellar'); },
                Soul_Gem(offset){ return spaceCostMultiplier('citadel', offset, 1, 1.25, 'interstellar'); },
            },
            wide: true,
            effect(wiki){
                let quantum_lv = get_qlevel(wiki);
                let desc = `<div class="has-text-warning">${loc('interstellar_citadel_stat',[+(quantum_lv).toFixed(1)])}</div><div>${loc('interstellar_citadel_effect',[5])}</div>`;
                if (global.tech['ai_core']){
                    let cement = +(quantum_lv / 1.75).toFixed(1);
                    if (!global.race['flier']){
                        desc = desc + `<div>${loc('interstellar_citadel_effect2',[cement])}</div>`;
                    }
                    if (global.tech['ai_core'] >= 2){
                        desc = desc + `<div>${loc('interstellar_citadel_effect3',[2])}</div>`;
                    }
                    if (global.tech['ai_core'] >= 3){
                        let graph = +(quantum_lv / 5).toFixed(1);
                        desc = desc + `<div>${loc('interstellar_citadel_effect4',[graph])}</div>`;
                    }
                    if (global.tech['ai_core'] >= 4){
                        desc = desc + `<div>${loc('interstellar_citadel_effect5',[1])}</div>`;
                    }
                }
                return `${desc}<div class="has-text-caution">${loc('interstellar_citadel_power',[$(this)[0].powered(wiki),powerCostMod(2.5)])}</div>`;
            },
            powered(wiki){
                let num_powered = wiki ? 0 : p_on['citadel'];
                if (num_powered > 1){
                    return powerCostMod(30 + ((num_powered - 1) * 2.5));
                }
                return powerCostMod(30);
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('citadel','interstellar');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['citadel','interstellar']
                };
            },
            flair(){
                return loc('interstellar_citadel_flair');
            }
        },
        stellar_forge: {
            id: 'interstellar-stellar_forge',
            title: loc('interstellar_stellar_forge_title'),
            desc: `<div>${loc('interstellar_stellar_forge_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { star_forge: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('stellar_forge', offset, 1200000, 1.25, 'interstellar'); },
                Iridium(offset){ return spaceCostMultiplier('stellar_forge', offset, 250000, 1.25, 'interstellar'); },
                Bolognium(offset){ return spaceCostMultiplier('stellar_forge', offset, 35000, 1.25, 'interstellar'); },
                Aerogel(offset){ return spaceCostMultiplier('stellar_forge', offset, 75000, 1.25, 'interstellar'); },
            },
            effect(){
                let desc = `<div>${loc('city_foundry_effect1',[jobScale(2)])}</div><div>${loc('interstellar_stellar_forge_effect',[10])}</div><div>${loc('interstellar_stellar_forge_effect2',[5])}</div>`;
                let num_smelters = $(this)[0].smelting();
                if (num_smelters > 0){
                    desc += `<div>${loc('interstellar_stellar_forge_effect3',[num_smelters])}</div>`;
                }
                return `${desc}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(3); },
            special: true,
            smelting(){
                return global.tech?.star_forge >= 2 ? 2 : 0;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('stellar_forge','interstellar');
                    if (powerOnNewStruct($(this)[0])){
                        global.civic.craftsman.max += jobScale(2);
                        let num_smelters = $(this)[0].smelting();
                        if (num_smelters > 0){
                            addSmelter(num_smelters, 'Iron', 'Star');
                        }
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['stellar_forge','interstellar']
                };
            },
            flair(){
                return loc('interstellar_stellar_forge_flair');
            }
        },
    };

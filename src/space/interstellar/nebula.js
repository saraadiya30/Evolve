import { loc } from '../../core/locale.js';
import { global } from '../../core/vars.js';
import { payCosts, initStruct, powerOnNewStruct } from '../../actions/actions.js';
import { messageQueue, spaceCostMultiplier, powerCostMod } from '../../functions/functions.js';
import { spatialReasoning } from '../../resources/resources.js';
import { production } from '../../resources/prod.js';
import { interstellarProjects } from '../space_registry.js';
import { int_fuel_adjust, incrementStruct } from '../space.js';

// Region 'int_nebula' dari interstellarProjects (dipisah dari space.js). Isi sama persis; digabung via space_registry.js di space.js.
export const interstellarProjects_int_nebula = {
        info: {
            name: loc('interstellar_nebula_name'),
            desc(){ return global.tech['nebula'] ? loc('interstellar_nebula_desc2') : loc('interstellar_nebula_desc1'); },
            support: 'nexus'
        },
        nebula_mission: {
            id: 'interstellar-nebula_mission',
            title: loc('space_mission_title',[loc('interstellar_nebula_name')]),
            desc: loc('space_mission_desc',[loc('interstellar_nebula_name')]),
            reqs: { alpha: 1 },
            grant: ['nebula',1],
            queue_complete(){ return global.tech.nebula >= 1 ? 0 : 1; },
            cost: {
                Helium_3(){ return +int_fuel_adjust(55000).toFixed(0); }
            },
            effect: loc('interstellar_nebula_mission_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('interstellar_nebula_mission_result'),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        nexus: {
            id: 'interstellar-nexus',
            title: loc('interstellar_nexus_title'),
            desc(){ return `<div>${loc('interstellar_nexus_title')}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Money.name])}</div>`; },
            reqs: { nebula: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('nexus', offset, 900000, 1.24, 'interstellar'); },
                Adamantite(offset){ return spaceCostMultiplier('nexus', offset, 7500, 1.24, 'interstellar'); },
                Infernite(offset){ return spaceCostMultiplier('nexus', offset, 250, 1.24, 'interstellar'); },
                Sheet_Metal(offset){ return spaceCostMultiplier('nexus', offset, 14000, 1.24, 'interstellar'); },
                Nano_Tube(offset){ return spaceCostMultiplier('nexus', offset, 17500, 1.24, 'interstellar'); },
            },
            effect(){
                let oil = spatialReasoning(3500);
                let helium = spatialReasoning(4000);
                let deuterium = spatialReasoning(3000);
                let elerium = spatialReasoning(25);
                return `<div>${loc('interstellar_nexus_effect1',[$(this)[0].support()])}</div><div>${loc('plus_max_resource',[oil,global.resource.Oil.name])}</div><div>${loc('plus_max_resource',[helium,global.resource.Helium_3.name])}</div><div>${loc('plus_max_resource',[deuterium,global.resource.Deuterium.name])}</div><div>${loc('plus_max_resource',[elerium,global.resource.Elerium.name])}</div><div class="has-text-caution">${loc('interstellar_nexus_effect2',[$(this)[0].powered(),350])}</div>`;
            },
            support(){ return 2; },
            powered(){ return powerCostMod(8); },
            powerBalancer(){
                return [{ s: global.interstellar.nexus.s_max - global.interstellar.nexus.support }];
            },
            refresh: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('nexus','interstellar');
                    global.resource.Deuterium.display = true;
                    if (global.tech['nebula'] === 1){
                        initStruct(interstellarProjects.int_nebula.harvester);
                        global.tech['nebula'] = 2;
                    }
                    if (powerOnNewStruct($(this)[0])){
                        global['resource']['Oil'].max += spatialReasoning(2500);
                        global['resource']['Helium_3'].max += spatialReasoning(4000);
                        global['resource']['Deuterium'].max += spatialReasoning(3000);
                        global['resource']['Elerium'].max += spatialReasoning(25);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['nexus','interstellar']
                };
            }
        },
        harvester: {
            id: 'interstellar-harvester',
            title: loc('interstellar_harvester_title'),
            desc: `<div>${loc('interstellar_harvester_title')}</div><div class="has-text-special">${loc('space_support',[loc('interstellar_nebula_name')])}</div>`,
            reqs: { nebula: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('harvester', offset, 650000, 1.28, 'interstellar'); },
                Copper(offset){ return spaceCostMultiplier('harvester', offset, 80000, 1.28, 'interstellar'); },
                Alloy(offset){ return spaceCostMultiplier('harvester', offset, 45000, 1.28, 'interstellar'); },
                Iridium(offset){ return spaceCostMultiplier('harvester', offset, 8000, 1.28, 'interstellar'); }
            },
            effect(){
                let helium = +(production('harvester','helium')).toFixed(3);
                let deuterium = +(production('harvester','deuterium')).toFixed(3);
                let ram = global.tech['ram_scoop'] ? `<div>${loc('interstellar_harvester_effect',[deuterium])}</div>` : '';
                return `<div class="has-text-caution">${loc('space_used_support',[loc('interstellar_nebula_name')])}</div><div>${loc('space_gas_mining_effect1',[helium])}</div>${ram}`;
            },
            s_type: 'nebula',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('harvester','interstellar');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['harvester','interstellar']
                };
            }
        },
        elerium_prospector: {
            id: 'interstellar-elerium_prospector',
            title: loc('interstellar_elerium_prospector_title'),
            desc: `<div>${loc('interstellar_elerium_prospector_title')}</div><div class="has-text-special">${loc('space_support',[loc('interstellar_nebula_name')])}</div>`,
            reqs: { nebula: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('elerium_prospector', offset, 825000, 1.28, 'interstellar'); },
                Steel(offset){ return spaceCostMultiplier('elerium_prospector', offset, 18000, 1.28, 'interstellar'); },
                Polymer(offset){ return spaceCostMultiplier('elerium_prospector', offset, 22000, 1.28, 'interstellar'); },
                Graphene(offset){ return spaceCostMultiplier('elerium_prospector', offset, 82000, 1.28, 'interstellar'); },
                Stanene(offset){ return spaceCostMultiplier('elerium_prospector', offset, 57000, 1.28, 'interstellar'); }
            },
            effect(){
                let elerium = +(production('elerium_prospector')).toFixed(3);
                return `<div class="has-text-caution">${loc('space_used_support',[loc('interstellar_nebula_name')])}</div><div>${loc('space_belt_elerium_ship_effect2',[elerium])}</div>`;
            },
            s_type: 'nebula',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('elerium_prospector','interstellar');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['elerium_prospector','interstellar']
                };
            }
        },
    };

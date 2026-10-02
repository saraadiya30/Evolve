import { loc } from './locale.js';
import { global, gal_on, p_on, sizeApproximation } from './vars.js';
import { flib, spaceCostMultiplier, powerCostMod, vBind } from './functions.js';
import { spatialReasoning, unlockContainers } from './resources.js';
import { payCosts, initStruct, powerOnNewStruct, updateDesc } from './actions.js';
import { galaxyProjects } from './space_registry.js';
import { isStargateOn, incrementStruct, galaxySpace, gatewayStorage } from './space.js';

// Region 'gxy_stargate' dari galaxyProjects (dipisah dari space.js). Isi sama persis; digabung via space_registry.js di space.js.
export const galaxyProjects_gxy_stargate = {
        info: {
            name: loc('galaxy_stargate'),
            desc(){ return global.tech['piracy'] ? loc('galaxy_stargate_desc_alt') : loc('galaxy_stargate_desc'); },
            control(){
                return {
                    name: flib('name'),
                    color: 'success',
                };
            }
        },
        gateway_station: {
            id: 'galaxy-gateway_station',
            title: loc('galaxy_gateway_station'),
            desc(){ return `<div>${loc('galaxy_gateway_station_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            reqs: { stargate: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('gateway_station', offset, 5000000, 1.25, 'galaxy'); },
                Aluminium(offset){ return spaceCostMultiplier('gateway_station', offset, 520000, 1.25, 'galaxy'); },
                Polymer(offset){ return spaceCostMultiplier('gateway_station', offset, 350000, 1.25, 'galaxy'); },
                Neutronium(offset){ return spaceCostMultiplier('gateway_station', offset, 17500, 1.25, 'galaxy'); },
            },
            effect(wiki){
                let helium = spatialReasoning(2000);
                let deuterium = spatialReasoning(4500);
                let elerium = spatialReasoning(50);
                let gateway = '';
                if (global.tech['gateway'] && global.tech['gateway'] >= 2){
                    gateway = `<div>${loc('galaxy_gateway_support',[$(this)[0].support()])}</div>`;
                }
                return `${gateway}<div>${loc('plus_max_resource',[helium,global.resource.Helium_3.name])}</div><div>${loc('plus_max_resource',[deuterium,global.resource.Deuterium.name])}</div><div>${loc('plus_max_resource',[elerium,global.resource.Elerium.name])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered(wiki)])}</div>`;
            },
            support(){ return 0.5; },
            powered(wiki){ return powerCostMod(isStargateOn(wiki) ? 4 : 0); },
            powerBalancer(){
                return global.galaxy.hasOwnProperty('starbase') ? [{ s: global.galaxy.starbase.s_max - global.galaxy.starbase.support }] : false;
            },
            refresh: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('gateway_station','galaxy');
                    global['resource']['Helium_3'].max += spatialReasoning(2000);
                    global['resource']['Deuterium'].max += spatialReasoning(4500);
                    if (global.tech['stargate'] === 4){
                        initStruct(galaxyProjects.gxy_stargate.telemetry_beacon);
                        global.tech['stargate'] = 5;
                    }
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['gateway_station','galaxy']
                };
            }
        },
        telemetry_beacon: {
            id: 'galaxy-telemetry_beacon',
            title: loc('galaxy_telemetry_beacon'),
            desc(){ return `<div>${loc('galaxy_telemetry_beacon')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            reqs: { stargate: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('telemetry_beacon', offset, 2250000, 1.25, 'galaxy'); },
                Copper(offset){ return spaceCostMultiplier('telemetry_beacon', offset, 685000, 1.25, 'galaxy'); },
                Alloy(offset){ return spaceCostMultiplier('telemetry_beacon', offset, 425000, 1.25, 'galaxy'); },
                Iridium(offset){ return spaceCostMultiplier('telemetry_beacon', offset, 177000, 1.25, 'galaxy'); },
            },
            effect(wiki){
                let base = global.tech['telemetry'] ? 1200 : 800;
                if (global.tech.science >= 17){
                    let num_scout_ship_on = wiki ? (global.galaxy?.scout_ship?.on ?? 0) : gal_on['scout_ship'];
                    base += num_scout_ship_on * 25;
                }
                let num_telemetry_on = wiki ? (global.galaxy?.telemetry_beacon?.on ?? 0) : p_on['telemetry_beacon'];
                let know = num_telemetry_on ? base * num_telemetry_on : 0;
                let gateway = '';
                if (global.tech['gateway'] && global.tech['gateway'] >= 2){
                    gateway = `<div>${loc('galaxy_gateway_support',[$(this)[0].support()])}</div>`;
                }
                return `${gateway}<div>${loc('galaxy_telemetry_beacon_effect1',[base])}</div><div>${loc('galaxy_telemetry_beacon_effect2',[know])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered(wiki)])}</div>`;
            },
            support(){ return global.tech['telemetry'] ? 0.75 : 0.5; },
            powered(wiki){ return powerCostMod(isStargateOn(wiki) ? 4 : 0); },
            powerBalancer(){
                return global.galaxy.hasOwnProperty('starbase') ? [{ s: global.galaxy.starbase.s_max - global.galaxy.starbase.support }] : false;
            },
            postPower(o){
                updateDesc($(this)[0],'galaxy','telemetry_beacon');
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('telemetry_beacon','galaxy');
                    if (powerOnNewStruct($(this)[0])){
                        global['resource']['Knowledge'].max += 1750;
                    }
                    if (!global.tech['gateway']){
                        initStruct(galaxyProjects.gxy_gateway.starbase);
                        global.settings.space.gateway = true;
                        global.tech['gateway'] = 1;
                        galaxySpace();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['telemetry_beacon','galaxy']
                };
            }
        },
        gateway_depot: {
            id: 'galaxy-gateway_depot',
            title: loc('galaxy_gateway_depot'),
            desc: `<div>${loc('galaxy_gateway_depot')}</div>`,
            reqs: { gateway: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('gateway_depot', offset, 4000000, 1.25, 'galaxy'); },
                Neutronium(offset){ return spaceCostMultiplier('gateway_depot', offset, 80000, 1.25, 'galaxy'); },
                Stanene(offset){ return spaceCostMultiplier('gateway_depot', offset, 500000, 1.25, 'galaxy'); },
                Vitreloy(offset){ return spaceCostMultiplier('gateway_depot', offset, 2500, 1.25, 'galaxy'); },
            },
            wide: true,
            effect(wiki){
                let containers = global.tech['world_control'] ? 150 : 100;
                let elerium = spatialReasoning(200);
                let multiplier = gatewayStorage();
                let uranium = sizeApproximation(+(spatialReasoning(3000 * multiplier)).toFixed(0),1);
                let nano = sizeApproximation(+(spatialReasoning(250000 * multiplier)).toFixed(0),1);
                let neutronium = sizeApproximation(+(spatialReasoning(9001 * multiplier)).toFixed(0),1);
                let infernite = sizeApproximation(+(spatialReasoning(6660 * multiplier)).toFixed(0),1);
                let desc = '<div class="aTable">';
                desc = desc + `<span>${loc('plus_max_crates',[containers])}</span><span>${loc('plus_max_containers',[containers])}</span>`;
                desc = desc + `<span>${loc('plus_max_resource',[uranium,global.resource.Uranium.name])}</span>`;
                desc = desc + `<span>${loc('plus_max_resource',[nano,global.resource.Nano_Tube.name])}</span>`;
                desc = desc + `<span>${loc('plus_max_resource',[neutronium,global.resource.Neutronium.name])}</span>`;
                desc = desc + `<span>${loc('plus_max_resource',[infernite,global.resource.Infernite.name])}</span>`;
                desc = desc + '</div>';
                return `${desc}<div>${loc('galaxy_gateway_depot_effect',[elerium,global.resource.Elerium.name])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered(wiki)])}</div>`;
            },
            powered(wiki){ return powerCostMod(isStargateOn(wiki) ? 10 : 0); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('gateway_depot','galaxy');

                    let containers = global.tech['world_control'] ? 150 : 100;
                    global.resource.Crates.max += containers;
                    global.resource.Containers.max += containers;
                    if (!global.resource.Containers.display){
                        unlockContainers();
                    }

                    let multiplier = gatewayStorage();
                    global['resource']['Uranium'].max += (spatialReasoning(3000 * multiplier));
                    global['resource']['Nano_Tube'].max += (spatialReasoning(250000 * multiplier));
                    global['resource']['Neutronium'].max += (spatialReasoning(9001 * multiplier));
                    global['resource']['Infernite'].max += (spatialReasoning(6660 * multiplier));
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['gateway_depot','galaxy']
                };
            }
        },
        defense_platform: {
            id: 'galaxy-defense_platform',
            title: loc('galaxy_defense_platform'),
            desc(){ return `<div>${loc('galaxy_defense_platform')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            reqs: { stargate: 6 },
            cost: {
                Money(offset){ return spaceCostMultiplier('defense_platform', offset, 750000, 1.25, 'galaxy'); },
                Adamantite(offset){ return spaceCostMultiplier('defense_platform', offset, 425000, 1.25, 'galaxy'); },
                Elerium(offset){ return spaceCostMultiplier('defense_platform', offset, 800, 1.25, 'galaxy'); },
                Vitreloy(offset){ return spaceCostMultiplier('defense_platform', offset, 1250, 1.25, 'galaxy'); },
                Wrought_Iron(offset){ return spaceCostMultiplier('defense_platform', offset, 75000, 1.25, 'galaxy'); },
            },
            effect(wiki){
                return `<div class="has-text-advanced">${loc('galaxy_defense_platform_effect',[20])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered(wiki)])}</div>`;
            },
            powered(wiki){ return powerCostMod(isStargateOn(wiki) ? 5 : 0); },
            postPower(o){
                vBind({el: `#gxy_stargate`},'update');
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('defense_platform','galaxy');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['defense_platform','galaxy']
                };
            }
        },
    };

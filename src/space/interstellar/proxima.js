import { loc } from '../../core/locale.js';
import { global } from '../../core/vars.js';
import { payCosts } from '../../actions/core/action_costs.js';
import { initStruct } from '../../actions/core/structure_ui.js';
import { powerOnNewStruct } from '../../actions/evolution/planet_setup.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { messageQueue } from '../../functions/message_log.js';
import { spaceCostMultiplier } from '../../functions/cost_multipliers.js';
import { get_qlevel } from '../../functions/quantum_level.js';
import { powerCostMod, powerModifier } from '../../functions/power_modifiers.js';
import { spatialReasoning } from '../../resources/resources.js';
import { unlockContainers } from '../../resources/market_storage.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { unlockAchieve } from '../../achievements/achievement_logic.js';
import { interstellarProjects } from '../../core/registries.js';
import { int_fuel_adjust } from '../planet_generation.js';
import { incrementStruct } from '../space_requirements.js';

// Region 'int_proxima' dari interstellarProjects (dipisah dari space.js). Isi sama persis; digabung via core/registries.js di space.js.
export const interstellarProjects_int_proxima = {
        info: {
            name: loc('interstellar_proxima_name'),
            desc(){ return global.tech['proxima'] ? loc('interstellar_proxima_desc2') : loc('interstellar_proxima_desc1'); },
        },
        proxima_mission: {
            id: 'interstellar-proxima_mission',
            title: loc('space_mission_title',[loc('interstellar_proxima_name')]),
            desc: loc('space_mission_desc',[loc('interstellar_proxima_name')]),
            reqs: { alpha: 1 },
            grant: ['proxima',1],
            queue_complete(){ return global.tech.proxima >= 1 ? 0 : 1; },
            cost: {
                Helium_3(){ return +int_fuel_adjust(42000).toFixed(0); }
            },
            effect: loc('interstellar_proxima_mission_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    initStruct(interstellarProjects.int_proxima.xfer_station);
                    messageQueue(loc('interstellar_proxima_mission_result'),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        xfer_station: {
            id: 'interstellar-xfer_station',
            title: loc('interstellar_xfer_station_title'),
            desc(){ return `<div>${loc('interstellar_xfer_station_desc')}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Uranium.name])}</div>`; },
            reqs: { proxima: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('xfer_station', offset, 1200000, 1.28, 'interstellar'); },
                Neutronium(offset){ return spaceCostMultiplier('xfer_station', offset, 1500, 1.28, 'interstellar'); },
                Adamantite(offset){ return spaceCostMultiplier('xfer_station', offset, 6000, 1.28, 'interstellar'); },
                Polymer(offset){ return spaceCostMultiplier('xfer_station', offset, 12000, 1.28, 'interstellar'); },
                Wrought_Iron(offset){ return spaceCostMultiplier('xfer_station', offset, 3500, 1.28, 'interstellar'); },
            },
            effect(){
                let fuel = 0.28;
                let helium = spatialReasoning(5000);
                let oil = spatialReasoning(4000);
                let uranium = spatialReasoning(2500);
                let det = '';
                if (global.resource.Deuterium.display){
                    det = `<div>${loc('plus_max_resource',[spatialReasoning(2000),global.resource.Deuterium.name])}</div>`;
                }
                return `<div>${loc('interstellar_alpha_starport_effect1',[$(this)[0].support()])}</div><div>${loc('plus_max_resource',[oil,global.resource.Oil.name])}</div><div>${loc('plus_max_resource',[helium,global.resource.Helium_3.name])}</div><div>${loc('plus_max_resource',[uranium,global.resource.Uranium.name])}</div>${det}<div class="has-text-caution">${loc('city_fission_power_effect',[fuel])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            support(){ return 1; },
            powered(){ return powerCostMod(1); },
            powerBalancer(){
                return [{ s: global.interstellar.starport.s_max - global.interstellar.starport.support }];
            },
            refresh: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('xfer_station','interstellar');
                    if (powerOnNewStruct($(this)[0])){
                        global['resource']['Uranium'].max += spatialReasoning(2500);
                        global['resource']['Helium_3'].max += spatialReasoning(5000);
                        global['resource']['Oil'].max += spatialReasoning(4000);
                        global['resource']['Deuterium'].max += spatialReasoning(2000);
                    }
                    if (global.tech['proxima'] === 1){
                        global.tech['proxima'] = 2;
                        initStruct(interstellarProjects.int_proxima.cargo_yard);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['xfer_station','interstellar']
                };
            }
        },
        cargo_yard: {
            id: 'interstellar-cargo_yard',
            title: loc('interstellar_cargo_yard_title'),
            desc: loc('interstellar_cargo_yard_title'),
            reqs: { proxima: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('cargo_yard', offset, 275000, 1.28, 'interstellar'); },
                Graphene(offset){ return spaceCostMultiplier('cargo_yard', offset, 7500, 1.28, 'interstellar'); },
                Mythril(offset){ return spaceCostMultiplier('cargo_yard', offset, 6000, 1.28, 'interstellar'); },
            },
            effect(wiki){
                let containers = 50;
                let neutronium = spatialReasoning(200);
                let infernite = spatialReasoning(150);
                let desc = `<div>${loc('plus_max_resource',[containers,global.resource.Crates.name])}</div><div>${loc('plus_max_resource',[containers,global.resource.Containers.name])}</div>`;
                desc = desc + `<div>${loc('plus_max_resource',[neutronium,global.resource.Neutronium.name])}</div><div>${loc('plus_max_resource',[infernite,global.resource.Infernite.name])}</div>`;
                if (global.tech['storage'] >= 7){
                    let boost = +(get_qlevel(wiki)).toFixed(3);
                    desc = desc + `<div>${loc('interstellar_cargo_yard_effect',[boost])}</div>`;
                }
                return desc;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('cargo_yard','interstellar');

                    let vol = 50;
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
                    p: ['cargo_yard','interstellar']
                };
            }
        },
        cruiser: {
            id: 'interstellar-cruiser',
            title: loc('interstellar_cruiser_title'),
            desc: loc('interstellar_cruiser_title'),
            reqs: { cruiser: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('cruiser', offset, 875000, 1.28, 'interstellar'); },
                Aluminium(offset){ return spaceCostMultiplier('cruiser', offset, 195000, 1.28, 'interstellar'); },
                Deuterium(offset){ return spaceCostMultiplier('cruiser', offset, +int_fuel_adjust(1500).toFixed(0), 1.28, 'interstellar'); },
                Neutronium(offset){ return spaceCostMultiplier('cruiser', offset, 2000, 1.28, 'interstellar'); },
                Aerogel(offset){ return spaceCostMultiplier('cruiser', offset, 250, 1.28, 'interstellar'); },
                Horseshoe(){ return global.race['hooved'] ? 3 : 0; }
            },
            powered(){ return 0; },
            effect(){
                let helium = +int_fuel_adjust(6).toFixed(2);
                let troops = $(this)[0].soldiers();
                let desc = `<div>${loc('plus_max_soldiers',[troops])}</div>`;
                if (global.race.universe === 'evil'){
                    desc += `<div>${loc('plus_max_resource',[1,global.resource.Authority.name])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('space_belt_station_effect3',[helium])}</div>`;
                return desc;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('cruiser','interstellar');
                    global.interstellar.cruiser.on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['cruiser','interstellar']
                };
            },
            soldiers(){
                let soldiers = global.race['fasting'] ? 4 : 3;
                if (global.race['grenadier']){
                    soldiers--;
                }
                return jobScale(soldiers);
            }
        },
        dyson: {
            id: 'interstellar-dyson',
            title: loc('interstellar_dyson_title'),
            desc(wiki){
                if (!global.interstellar.hasOwnProperty('dyson') || global.interstellar.dyson.count < 100 || wiki){
                    return `<div>${loc('interstellar_dyson_title')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                else {
                    return `<div>${loc('interstellar_dyson_title')}</div>`;
                }
            },
            reqs: { proxima: 3 },
            queue_size: 10,
            queue_complete(){ return 100 - global.interstellar.dyson.count; },
            condition(){
                return global.interstellar.dyson.count >= 100 && global.tech['dyson'] ? false : true;
            },
            cost: {
                Money(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('dyson') ? global.interstellar.dyson.count : 0)) < 100 ? 250000 : 0; },
                Adamantite(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('dyson') ? global.interstellar.dyson.count : 0)) < 100 ? 10000 : 0; },
                Infernite(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('dyson') ? global.interstellar.dyson.count : 0)) < 100 ? 25 : 0; },
                Stanene(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('dyson') ? global.interstellar.dyson.count : 0)) < 100 ? 100000 : 0; }
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.interstellar.hasOwnProperty('dyson') ? global.interstellar.dyson.count : 0);
                if (count < 100){
                    let power = count > 0 ? `<div>${loc('space_dwarf_reactor_effect1',[powerModifier(count * 1.25)])}</div>` : ``;
                    let remain = 100 - count;
                    return `<div>${loc('interstellar_dyson_effect')}</div>${power}<div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return loc('interstellar_dyson_complete',[powerModifier(175)]);
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.interstellar.dyson.count < 100){
                        incrementStruct('dyson','interstellar');
                        if (global.interstellar.dyson.count >= 100){
                            drawTech();
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['dyson','interstellar']
                };
            }
        },
        dyson_sphere: {
            id: 'interstellar-dyson_sphere',
            title: loc('interstellar_dyson_sphere_title'),
            desc(wiki){
                if (!global.interstellar.hasOwnProperty('dyson_sphere') || global.interstellar.dyson_sphere.count < 100 || wiki){
                    return `<div>${loc('interstellar_dyson_sphere_title')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                else {
                    return `<div>${loc('interstellar_dyson_sphere_title')}</div>`;
                }
            },
            reqs: { proxima: 3, dyson: 1 },
            queue_size: 10,
            queue_complete(){ return 100 - global.interstellar.dyson_sphere.count; },
            condition(){
                return global.interstellar.dyson.count >= 100 && global.tech['dyson'] && global.tech.dyson === 1 ? true : false;
            },
            cost: {
                Money(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('dyson_sphere') ? global.interstellar.dyson_sphere.count : 0)) < 100 ? 5000000 : 0; },
                Bolognium(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('dyson_sphere') ? global.interstellar.dyson_sphere.count : 0)) < 100 ? 25000 : 0; },
                Vitreloy(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('dyson_sphere') ? global.interstellar.dyson_sphere.count : 0)) < 100 ? 1250 : 0; },
                Aerogel(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('dyson_sphere') ? global.interstellar.dyson_sphere.count : 0)) < 100 ? 75000 : 0; }
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.interstellar.hasOwnProperty('dyson_sphere') ? global.interstellar.dyson_sphere.count : 0);
                if (count < 100){
                    let power = 175 + (count * 5);
                    let remain = 100 - count;
                    return `<div>${loc('interstellar_dyson_sphere_effect')}</div><div>${loc('space_dwarf_reactor_effect1',[powerModifier(power)])}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return loc('interstellar_dyson_sphere_complete',[powerModifier(750)]);
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.interstellar.dyson_sphere.count < 100){
                        incrementStruct('dyson_sphere','interstellar');
                        if (global.interstellar.dyson_sphere.count >= 100){
                            drawTech();
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['dyson_sphere','interstellar']
                };
            }
        },
        orichalcum_sphere: {
            id: 'interstellar-orichalcum_sphere',
            title: loc('interstellar_dyson_sphere_title'),
            desc(wiki){
                if (!global.interstellar.hasOwnProperty('orichalcum_sphere') || global.interstellar.orichalcum_sphere.count < 100 || wiki){
                    return `<div>${loc('interstellar_orichalcum_sphere_desc')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                else {
                    return `<div>${loc('interstellar_orichalcum_sphere_desc')}</div>`;
                }
            },
            reqs: { proxima: 3, dyson: 2 },
            queue_size: 10,
            queue_complete(){ return 100 - global.interstellar.orichalcum_sphere.count; },
            condition(){
                if ((global.tech['dyson'] ?? 0) < 2){
                    return false;
                }
                return global.interstellar.dyson_sphere.count >= 100 && (global.tech.dyson === 2 || global.interstellar.orichalcum_sphere.count < 100);
            },
            cost: {
                Money(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('orichalcum_sphere') ? global.interstellar.orichalcum_sphere.count : 0)) < 100 ? 25000000 : 0; },
                Orichalcum(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('orichalcum_sphere') ? global.interstellar.orichalcum_sphere.count : 0)) < 100 ? 75000 : 0; }
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.interstellar.hasOwnProperty('orichalcum_sphere') ? global.interstellar.orichalcum_sphere.count : 0);
                if (count < 100){
                    let power = 750 + (count * 8);
                    let remain = 100 - count;
                    return `<div>${loc('interstellar_orichalcum_sphere_effect')}</div><div>${loc('space_dwarf_reactor_effect1',[powerModifier(power)])}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return loc('interstellar_dyson_sphere_complete',[powerModifier(1750)]);
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.interstellar.orichalcum_sphere.count < 100){
                        incrementStruct('orichalcum_sphere','interstellar');
                        if (global.interstellar.orichalcum_sphere.count >= 100){
                            unlockAchieve('blacken_the_sun');
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['orichalcum_sphere','interstellar']
                };
            }
        },
        elysanite_sphere: {
            id: 'interstellar-elysanite_sphere',
            title: loc('interstellar_dyson_sphere_title'),
            desc(wiki){
                if (!global.interstellar.hasOwnProperty('elysanite_sphere') || global.interstellar.elysanite_sphere.count < 1000 || wiki){
                    return `<div>${loc('interstellar_elysanite_sphere_desc')}</div><div class="has-text-special">${loc('requires_segments',[1000])}</div>`;
                }
                else {
                    return `<div>${loc('interstellar_elysanite_sphere_desc')}</div>`;
                }
            },
            reqs: { proxima: 3, dyson: 3 },
            queue_size: 50,
            queue_complete(){ return 1000 - global.interstellar.elysanite_sphere.count; },
            condition(){
                return global.interstellar.orichalcum_sphere.count >= 100 && global.tech['dyson'] && global.tech.dyson === 3 ? true : false;
            },
            cost: {
                Money(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('elysanite_sphere') ? global.interstellar.elysanite_sphere.count : 0)) < 1000 ? 1000000000 : 0; },
                Asphodel_Powder(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('elysanite_sphere') ? global.interstellar.elysanite_sphere.count : 0)) < 1000 ? 25000 : 0; },
                Elysanite(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('elysanite_sphere') ? global.interstellar.elysanite_sphere.count : 0)) < 1000 ? 100000 : 0; },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.interstellar.hasOwnProperty('elysanite_sphere') ? global.interstellar.elysanite_sphere.count : 0);
                if (count < 1000){
                    let power = 1750 + (count * 18);
                    let remain = 1000 - count;
                    return `<div>${loc('interstellar_elysanite_sphere_effect')}</div><div>${loc('space_dwarf_reactor_effect1',[powerModifier(power)])}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return loc('interstellar_dyson_sphere_complete',[powerModifier(22500)]);
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.interstellar.elysanite_sphere.count < 1000){
                        incrementStruct('elysanite_sphere','interstellar');
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['elysanite_sphere','interstellar']
                };
            }
        },
    };

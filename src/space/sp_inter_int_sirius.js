import { global, p_on } from '../core/vars.js';
import { loc } from '../core/locale.js';
import { races } from '../races/races.js';
import { flib, clearPopper, powerCostMod, spaceCostMultiplier } from '../functions/functions.js';
import { payCosts, initStruct, powerOnNewStruct } from '../actions/actions.js';
import { interstellarProjects } from './space_registry.js';
import { int_fuel_adjust, incrementStruct, deepSpace, universe_affixes, astrialProjection, ascendLab } from './space.js';

// Region 'int_sirius' dari interstellarProjects (dipisah dari space.js). Isi sama persis; digabung via space_registry.js di space.js.
export const interstellarProjects_int_sirius = {
        info: {
            name(){ return global.tech.ascension >= 3 ? loc('interstellar_sirius_b_name') : loc('interstellar_sirius_name'); },
            desc(){ return global.tech.ascension >= 3 ? loc('interstellar_sirius_b_desc') : loc('interstellar_sirius_desc',[races[global.race.species].home]); },
        },
        sirius_mission: {
            id: 'interstellar-sirius_mission',
            title: loc('space_mission_title', [loc('interstellar_sirius_name')]),
            desc: loc('space_mission_desc', [loc('interstellar_sirius_name')]),
            reqs: { ascension: 2 },
            grant: ['ascension',3],
            queue_complete(){ return global.tech.ascension >= 3 ? 0 : 1; },
            cost: {
                Helium_3(){ return +int_fuel_adjust(480000).toFixed(0); },
                Deuterium(){ return +int_fuel_adjust(225000).toFixed(0); }
            },
            effect(){ return loc('interstellar_sirius_mission_effect',[flib('name'),races[global.race.species].home]); },
            action(args){
                if (payCosts($(this)[0])){
                    return true;
                }
                return false;
            }
        },
        sirius_b: {
            id: 'interstellar-sirius_b',
            title: loc('interstellar_sirius_b'),
            desc: loc('interstellar_sirius_b'),
            reqs: { ascension: 3 },
            grant: ['ascension',4],
            queue_complete(){ return global.tech.ascension >= 4 ? 0 : 1; },
            cost: {
                Knowledge(){ return 20000000; },
            },
            effect(){ return loc('interstellar_sirius_b_effect'); },
            action(args){
                if (payCosts($(this)[0])){
                    initStruct(interstellarProjects.int_sirius.space_elevator);
                    return true;
                }
                return false;
            }
        },
        space_elevator: {
            id: 'interstellar-space_elevator',
            title: loc('interstellar_space_elevator'),
            desc(wiki){
                if (!global.interstellar.hasOwnProperty('space_elevator') || global.interstellar.space_elevator.count < 100 || wiki){
                    return `<div>${loc('interstellar_space_elevator')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                else {
                    return `<div>${loc('interstellar_space_elevator')}</div>`;
                }
            },
            reqs: { ascension: 4 },
            condition(){
                return global.interstellar.space_elevator.count >= 100 ? false : true;
            },
            queue_size: 5,
            queue_complete(){ return 100 - global.interstellar.space_elevator.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('space_elevator') ? global.interstellar.space_elevator.count : 0)) < 100 ? 20000000 : 0; },
                Nano_Tube(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('space_elevator') ? global.interstellar.space_elevator.count : 0)) < 100 ? 500000 : 0; },
                Bolognium(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('space_elevator') ? global.interstellar.space_elevator.count : 0)) < 100 ? 100000 : 0; },
                Mythril(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('space_elevator') ? global.interstellar.space_elevator.count : 0)) < 100 ? 125000 : 0; },
            },
            effect(wiki){
                let effectText = `<div>${loc('interstellar_space_elevator_effect')}</div>`;
                let count = (wiki?.count ?? 0) + (global.interstellar.hasOwnProperty('space_elevator') ? global.interstellar.space_elevator.count : 0);
                if (count < 100){
                    let remain = 100 - count;
                    effectText += `<div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                return effectText;
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.interstellar.space_elevator.count < 100){
                        incrementStruct('space_elevator','interstellar');
                        if (global.interstellar.space_elevator.count >= 100){
                            global.tech['ascension'] = 5;
                            initStruct(interstellarProjects.int_sirius.gravity_dome);
                            deepSpace();
                            clearPopper();
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['space_elevator','interstellar']
                };
            }
        },
        gravity_dome: {
            id: 'interstellar-gravity_dome',
            title: loc('interstellar_gravity_dome'),
            desc(wiki){
                if (!global.interstellar.hasOwnProperty('gravity_dome') || global.interstellar.gravity_dome.count < 100 || wiki){
                    return `<div>${loc('interstellar_gravity_dome')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                else {
                    return `<div>${loc('interstellar_gravity_dome')}</div>`;
                }
            },
            reqs: { ascension: 5 },
            condition(){
                return global.interstellar.gravity_dome.count >= 100 ? false : true;
            },
            queue_size: 5,
            queue_complete(){ return 100 - global.interstellar.gravity_dome.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('gravity_dome') ? global.interstellar.gravity_dome.count : 0)) < 100 ? 35000000 : 0; },
                Cement(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('gravity_dome') ? global.interstellar.gravity_dome.count : 0)) < 100 ? 1250000 : 0; },
                Adamantite(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('gravity_dome') ? global.interstellar.gravity_dome.count : 0)) < 100 ? 650000 : 0; },
                Aerogel(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('gravity_dome') ? global.interstellar.gravity_dome.count : 0)) < 100 ? 180000 : 0; },
            },
            effect(wiki){
                let effectText = `<div>${loc('interstellar_gravity_dome_effect',[races[global.race.species].home])}</div>`;
                let count = (wiki?.count ?? 0) + (global.interstellar.hasOwnProperty('gravity_dome') ? global.interstellar.gravity_dome.count : 0);
                if (count < 100){
                    let remain = 100 - count;
                    effectText += `<div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                return effectText;
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.interstellar.gravity_dome.count < 100){
                        incrementStruct('gravity_dome','interstellar');
                        if (global.interstellar.gravity_dome.count >= 100){
                            global.tech['ascension'] = 6;
                            initStruct(interstellarProjects.int_sirius.ascension_machine);
                            initStruct(interstellarProjects.int_sirius.thermal_collector);
                            deepSpace();
                            clearPopper();
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['gravity_dome','interstellar']
                };
            }
        },
        ascension_machine: {
            id: 'interstellar-ascension_machine',
            title: loc('interstellar_ascension_machine'),
            desc(wiki){
                if (!global.interstellar.hasOwnProperty('ascension_machine') || global.interstellar.ascension_machine.count < 100 || wiki){
                    return `<div>${loc('interstellar_ascension_machine')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>` + (global.interstellar.hasOwnProperty('ascension_machine') && global.interstellar.ascension_machine.count >= 100 ? `<div class="has-text-special">${loc('requires_power')}</div>` : ``);
                }
                else {
                    return `<div>${loc('interstellar_ascension_machine')}</div>`;
                }
            },
            reqs: { ascension: 6 },
            condition(){
                return global.interstellar.ascension_machine.count >= 100 ? false : true;
            },
            queue_size: 5,
            queue_complete(){ return 100 - global.interstellar.ascension_machine.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('ascension_machine') ? global.interstellar.ascension_machine.count : 0)) < 100 ? 75000000 : 0; },
                Alloy(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('ascension_machine') ? global.interstellar.ascension_machine.count : 0)) < 100 ? 750000 : 0; },
                Neutronium(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('ascension_machine') ? global.interstellar.ascension_machine.count : 0)) < 100 ? 125000 : 0; },
                Elerium(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('ascension_machine') ? global.interstellar.ascension_machine.count : 0)) < 100 ? 1000 : 0; },
                Orichalcum(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('ascension_machine') ? global.interstellar.ascension_machine.count : 0)) < 100 ? 250000 : 0; },
                Nanoweave(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('ascension_machine') ? global.interstellar.ascension_machine.count : 0)) < 100 ? 75000 : 0; },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.interstellar.hasOwnProperty('ascension_machine') ? global.interstellar.ascension_machine.count : 0);
                if (count < 100){
                    let remain = 100 - count;
                    return `<div>${loc('interstellar_ascension_machine_effect',[flib('name')])}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return interstellarProjects.int_sirius.ascension_trigger.effect();
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.interstellar.ascension_machine.count < 100){
                        incrementStruct('ascension_machine','interstellar');
                        if (global.interstellar.ascension_machine.count >= 100){
                            global.tech['ascension'] = 7;
                            initStruct(interstellarProjects.int_sirius.ascension_trigger);
                            incrementStruct('ascension_trigger','interstellar');
                            if (global.settings.alwaysPower){
                                powerOnNewStruct(interstellarProjects.int_sirius.ascension_trigger);
                            }
                            deepSpace();
                            clearPopper();
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['ascension_machine','interstellar']
                };
            }
        },
        ascension_trigger: {
            id: 'interstellar-ascension_trigger',
            title: loc('interstellar_ascension_machine'),
            desc(){ return `<div>${loc('interstellar_ascension_machine')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            wiki: false,
            reqs: { ascension: 7 },
            condition(){
                return global.interstellar.ascension_machine.count >= 100 ? true : false;
            },
            queue_complete(){ return 0; },
            cost: {},
            powered(){
                let power = $(this)[0].heatSink();
                if (power < 0){
                    power = 0;
                }
                return power;
            },
            heatSink(){
                let heatsink = 100;
                if (global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 2){
                    heatsink += global.stats.achieve.technophobe.l >= 4 ? 25 : 10;
                    for (let i=1; i<universe_affixes.length; i++){
                        if (global.stats.achieve.technophobe[universe_affixes[i]] && global.stats.achieve.technophobe[universe_affixes[i]] >= 5){
                            heatsink += 5;
                        }
                    }
                }
                let power = Math.round(powerCostMod(10000) - (heatsink * (global.interstellar.hasOwnProperty('thermal_collector') ? global.interstellar.thermal_collector.count : 0)));
                return power;
            },
            special(){ return global.tech['science'] && global.tech.science >= 24 ? true : false; },
            sAction(){
                global.eden.encampment.asc = global.eden.encampment.asc ? false : true;
                deepSpace();
            },
            postPower(o){
                if (o && p_on['ascension_trigger']){
                    // Powered on and energized
                    global.tech.ascension = 8;
                    deepSpace();
                }
                else {
                    if (global.tech.ascension > 7){
                        // Disabled or lost power
                        global.tech.ascension = 7;
                        deepSpace();
                    }
                    if (o){
                        // Not powered yet, check again soon
                        return true;
                    }
                }
            },
            effect(){
                if (global.eden.hasOwnProperty('encampment') && global.eden.encampment.asc){
                    let heatSink = $(this)[0].heatSink();
                    heatSink = heatSink < 0 ? Math.abs(heatSink) : 0;

                    let omniscience = 150 + (heatSink ** 0.95 / 10);
                    let desc = `<div>${loc(`eden_ascension_machine_effect1`,[loc(`eden_encampment_title`),+omniscience.toFixed(0),global.resource.Omniscience.name])}</div>`;
                    if (heatSink > 0){
                        let stabilizer = heatSink / 175;
                        desc += `<div>${loc(`eden_ascension_machine_effect2`,[loc(`eden_stabilizer_title`),+stabilizer.toFixed(2)])}</div>`;

                        let ghost = heatSink / 125;
                        desc += `<div>${loc(`eden_ascension_machine_effect2`,[loc(`job_ghost_trapper`),+ghost.toFixed(2)])}</div>`;
                    }
                    
                    return desc;
                }
                else {
                    let reward = astrialProjection();
                    let power = $(this)[0].powered();
                    let power_label = power > 0 ? `<div class="has-text-caution">${loc('minus_power',[power])}</div>` : '';
                    return `<div>${loc('interstellar_ascension_trigger_effect')}</div>${reward}${power_label}`;
                }
            },
            action(args){
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['ascension_trigger','interstellar']
                };
            }
        },
        ascend: {
            id: 'interstellar-ascend',
            title: loc('interstellar_ascend'),
            desc: loc('interstellar_ascend'),
            reqs: { ascension: 8 },
            condition(){
                return !global.eden.hasOwnProperty('encampment') || !global.eden.encampment.asc;
            },
            queue_complete(){ return 0; },
            no_multi: true,
            cost: {},
            effect(){
                let reward = astrialProjection();
                return `<div>${loc('interstellar_ascend_effect')}</div>${reward}`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    ascendLab(false);
                    return true;
                }
                return false;
            }
        },
        thermal_collector: {
            id: 'interstellar-thermal_collector',
            title: loc('interstellar_thermal_collector'),
            desc: loc('interstellar_thermal_collector'),
            reqs: { ascension: 6 },
            cost: {
                Money(offset){ return spaceCostMultiplier('thermal_collector', offset, 5000000, 1.08, 'interstellar'); },
                Infernite(offset){ return spaceCostMultiplier('thermal_collector', offset, 25000, 1.08, 'interstellar'); },
                Stanene(offset){ return spaceCostMultiplier('thermal_collector', offset, 1000000, 1.08, 'interstellar'); },
                Vitreloy(offset){ return spaceCostMultiplier('thermal_collector', offset, 100000, 1.08, 'interstellar'); },
            },
            effect(){
                let heatsink = 100;
                if (global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 2){
                    heatsink += global.stats.achieve.technophobe.l >= 4 ? 25 : 10;
                    for (let i=1; i<universe_affixes.length; i++){
                        if (global.stats.achieve.technophobe[universe_affixes[i]] && global.stats.achieve.technophobe[universe_affixes[i]] >= 5){
                            heatsink += 5;
                        }
                    }
                }
                return loc('interstellar_thermal_collector_effect',[heatsink]);
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('thermal_collector','interstellar');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['thermal_collector','interstellar']
                };
            }
        },
    };

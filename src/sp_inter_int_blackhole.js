import { loc } from './locale.js';
import { races } from './races.js';
import { global } from './vars.js';
import { calcPrestige, messageQueue, spaceCostMultiplier, powerCostMod, powerModifier, timeFormat, clearPopper } from './functions.js';
import { payCosts, initStruct, powerOnNewStruct, drawTech } from './actions.js';
import { atomic_mass, drawResourceTab } from './resources.js';
import { loadTab } from './index.js';
import { defineGovernor } from './governor.js';
import { interstellarProjects } from './space_registry.js';
import { int_fuel_adjust, incrementStruct, galaxyProjects, deepSpace } from './space.js';

// Region 'int_blackhole' dari interstellarProjects (dipisah dari space.js). Isi sama persis; digabung via space_registry.js di space.js.
export const interstellarProjects_int_blackhole = {
        info: {
            name: loc('interstellar_blackhole_name'),
            desc(){
                let home = races[global.race.species].home;
                if (global.tech['blackhole'] >= 5){
                    let mass = +(global.interstellar.stellar_engine.mass).toFixed(10);
                    let exotic = +(global.interstellar.stellar_engine.exotic).toFixed(10);
                    if (global.tech['roid_eject']){
                        mass += 0.225 * global.tech['roid_eject'] * (1 + (global.tech['roid_eject'] / 12));
                    }
                    if (global.tech['whitehole']){
                        let gains = calcPrestige('bigbang');
                        let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
                        return `<div>${loc('interstellar_blackhole_desc4',[home,mass,exotic])}</div><div class="has-text-advanced">${loc('interstellar_blackhole_desc5',[gains.plasmid,gains.phage,gains.dark,plasmidType])}</div>`;
                    }
                    else {
                        return global.interstellar.stellar_engine.exotic > 0 ? loc('interstellar_blackhole_desc4',[home,mass,exotic]) : loc('interstellar_blackhole_desc3',[home,mass]);
                    }
                }
                else {
                    return global.tech['blackhole'] ? loc('interstellar_blackhole_desc2',[home]) : loc('interstellar_blackhole_desc1',[home]);
                }
            },
        },
        blackhole_mission: {
            id: 'interstellar-blackhole_mission',
            title: loc('space_mission_title', [loc('interstellar_blackhole_name')]),
            desc: loc('space_mission_desc', [loc('interstellar_blackhole_name')]),
            reqs: { nebula: 1 },
            grant: ['blackhole',1],
            queue_complete(){ return global.tech.blackhole >= 1 ? 0 : 1; },
            cost: {
                Helium_3(){ return +int_fuel_adjust(75000).toFixed(0); },
                Deuterium(){ return +int_fuel_adjust(25000).toFixed(0); }
            },
            effect: loc('interstellar_blackhole_mission_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    initStruct(interstellarProjects.int_blackhole.far_reach);
                    messageQueue(loc('interstellar_blackhole_mission_result'),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        far_reach: {
            id: 'interstellar-far_reach',
            title: loc('interstellar_far_reach'),
            desc: `<div>${loc('interstellar_far_reach_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { blackhole: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('far_reach', offset, 1000000, 1.32, 'interstellar'); },
                Knowledge(offset){ return spaceCostMultiplier('far_reach', offset, 100000, 1.32, 'interstellar'); },
                Neutronium(offset){ return spaceCostMultiplier('far_reach', offset, 2500, 1.32, 'interstellar'); },
                Elerium(offset){ return spaceCostMultiplier('far_reach', offset, 100, 1.32, 'interstellar'); },
                Aerogel(offset){ return spaceCostMultiplier('far_reach', offset, 1000, 1.32, 'interstellar'); },
            },
            effect(){
                return `<div>${loc('interstellar_far_reach_effect',[1])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(5); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('far_reach','interstellar');
                    powerOnNewStruct($(this)[0]);
                    if (global.tech['blackhole'] === 1){
                        global.tech['blackhole'] = 2;
                        drawTech();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['far_reach','interstellar']
                };
            },
            flair: loc('interstellar_far_reach_flair')
        },
        stellar_engine: {
            id: 'interstellar-stellar_engine',
            title: loc('interstellar_stellar_engine'),
            desc(wiki){
                if (!global.interstellar.hasOwnProperty('stellar_engine') || global.interstellar.stellar_engine.count < 100 || wiki){
                    return `<div>${loc('interstellar_stellar_engine')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                else {
                    return `<div>${loc('interstellar_stellar_engine')}</div>`;
                }
            },
            reqs: { blackhole: 3 },
            queue_size: 10,
            queue_complete(){ return 100 - global.interstellar.stellar_engine.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stellar_engine') ? global.interstellar.stellar_engine.count : 0)) < 100 ? 500000 : 0; },
                Neutronium(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stellar_engine') ? global.interstellar.stellar_engine.count : 0)) < 100 ? 450 : 0; },
                Adamantite(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stellar_engine') ? global.interstellar.stellar_engine.count : 0)) < 100 ? 17500 : 0; },
                Infernite(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stellar_engine') ? global.interstellar.stellar_engine.count : 0)) < 100 ? 225 : 0; },
                Graphene(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stellar_engine') ? global.interstellar.stellar_engine.count : 0)) < 100 ? 45000 : 0; },
                Mythril(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stellar_engine') ? global.interstellar.stellar_engine.count : 0)) < 100 ? 250 : 0; },
                Aerogel(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stellar_engine') ? global.interstellar.stellar_engine.count : 0)) < 100 ? 75 : 0; },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.interstellar.hasOwnProperty('stellar_engine') ? global.interstellar.stellar_engine.count : 0);
                if (count < 100){
                    let remain = 100 - count;
                    return `<div>${loc('interstellar_stellar_engine_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    let output = -$(this)[0].powered();
                    if (global.tech['blackhole'] >= 5){
                        let r_mass = global.interstellar.stellar_engine.mass;
                        let exotic = global.interstellar.stellar_engine.exotic;
                        if (global.tech['roid_eject']){
                            r_mass += 0.225 * global.tech['roid_eject'] * (1 + (global.tech['roid_eject'] / 12));
                        }
                        let blackhole = exotic > 0 ? loc('interstellar_stellar_engine_effect3',[+r_mass.toFixed(10),+exotic.toFixed(10)]) : loc('interstellar_stellar_engine_effect2',[r_mass]);
                        return `<div>${loc('interstellar_stellar_engine_complete',[+output.toFixed(2)])}</div><div>${blackhole}</div>`;
                    }
                    else {
                        return loc('interstellar_stellar_engine_complete',[+output.toFixed(2)]);
                    }
                }
            },
            switchable(){ return false; },
            powered(){
                let waves = global.tech['gravity'] && global.tech['gravity'] >= 2 ? 13.5 : 7.5;
                let r_mass = global.interstellar?.stellar_engine?.mass ?? 8;
                let exotic = global.interstellar?.stellar_engine?.exotic ?? 0;
                if (global.tech['roid_eject']){
                    r_mass += 0.225 * global.tech['roid_eject'] * (1 + (global.tech['roid_eject'] / 12));
                }
                let gWell = 1 + (global.stats.achieve['escape_velocity'] && global.stats.achieve.escape_velocity['h'] ? global.stats.achieve.escape_velocity['h'] * 0.02 : 0);
                let output = powerModifier((20 + (r_mass - 8 + exotic * 10) * waves) * gWell);
                if (output > 10000){
                    output = 10000 + (output - 10000) ** 0.975;
                    if (output > 20000){ output = 20000 + (output - 20000) ** 0.95; }
                    if (output > 30000){ output = 30000 + (output - 30000) ** 0.925; }
                }
                output = +output.toFixed(2);
                return -output;
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.interstellar.stellar_engine.count < 100){
                        incrementStruct('stellar_engine','interstellar');
                        if (global.interstellar.stellar_engine.count >= 100 && global.tech['blackhole'] === 3){
                            global.tech['blackhole'] = 4;
                            drawTech();
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, mass: 8, exotic: 0 },
                    p: ['stellar_engine','interstellar']
                };
            }
        },
        mass_ejector: {
            id: 'interstellar-mass_ejector',
            title: loc('interstellar_mass_ejector'),
            desc: `<div>${loc('interstellar_mass_ejector')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { blackhole: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('mass_ejector', offset, 750000, 1.25, 'interstellar'); },
                Adamantite(offset){ return spaceCostMultiplier('mass_ejector', offset, 125000, 1.25, 'interstellar'); },
                Infernite(offset){ return spaceCostMultiplier('mass_ejector', offset, 275, 1.25, 'interstellar'); },
                Elerium(offset){ return spaceCostMultiplier('mass_ejector', offset, 100, 1.25, 'interstellar'); },
                Mythril(offset){ return spaceCostMultiplier('mass_ejector', offset, 10000, 1.25, 'interstellar'); },
            },
            effect(wiki){
                let desc = `<div>${loc('interstellar_mass_ejector_effect')}</div>`;
                if (global.race.universe !== 'magic' && (wiki || global.stats.blackhole)){
                    let exoticEjectDone = global.interstellar?.stellar_engine?.exotic ?? 0;
                    let exoticEjectNeeded = (0.025 - exoticEjectDone) * 1e10;
                    let exoticEjectRate = (global.interstellar?.mass_ejector?.Elerium ?? 0) * atomic_mass['Elerium'];
                    exoticEjectRate += (global.interstellar?.mass_ejector?.Infernite ?? 0) * atomic_mass['Infernite'];

                    if (exoticEjectNeeded <= 0){
                        desc += `<div class="has-text-danger-pulse">${loc('interstellar_mass_ejector_reached')}</div>`;
                    }
                    else if (exoticEjectRate <= 0){
                        desc += `<div class="has-text-danger">${loc('interstellar_mass_ejector_timer',[loc('time_never')])}</div>`;
                    }
                    else {
                        let timeReq = timeFormat(Math.round(exoticEjectNeeded / exoticEjectRate));
                        desc += `<div class="has-text-caution">${loc('interstellar_mass_ejector_timer',[timeReq])}</div>`;
                    }
                }
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(3); },
            special: true,
            sAction(){
                global.settings.civTabs = 4;
                global.settings.marketTabs = 2;
                if (!global.settings.tabLoad){
                    loadTab('mTabResource');
                    clearPopper(`interstellar-mass_ejector`);
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('mass_ejector','interstellar');
                    powerOnNewStruct($(this)[0]);

                    if (global.interstellar.mass_ejector.count === 1){
                        messageQueue(loc('interstellar_mass_ejector_msg'),'info',false,['progress']);
                        global.settings.showEjector = true;
                        defineGovernor();
                    }
                    drawResourceTab('ejector');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: {
                        count: 0, on: 0, total: 0, mass: 0,
                        Food: 0, Lumber: 0,
                        Chrysotile: 0, Stone: 0,
                        Crystal: 0, Furs: 0,
                        Copper: 0, Iron: 0,
                        Aluminium: 0, Cement: 0,
                        Coal: 0, Oil: 0,
                        Uranium: 0, Steel: 0,
                        Titanium: 0, Alloy: 0,
                        Polymer: 0, Iridium: 0,
                        Helium_3: 0, Deuterium: 0,
                        Neutronium: 0, Adamantite: 0,
                        Infernite: 0, Elerium: 0,
                        Nano_Tube: 0, Graphene: 0,
                        Stanene: 0, Bolognium: 0,
                        Vitreloy: 0, Orichalcum: 0,
                        Plywood: 0, Brick: 0,
                        Wrought_Iron: 0, Sheet_Metal: 0,
                        Mythril: 0, Aerogel: 0,
                        Nanoweave: 0, Scarletite: 0
                    },
                    p: ['mass_ejector','interstellar']
                };
            },
            flair(){
                return loc('interstellar_mass_ejector_flair');
            }
        },
        jump_ship: {
            id: 'interstellar-jump_ship',
            title: loc('interstellar_jump_ship'),
            desc: loc('interstellar_jump_ship_desc'),
            reqs: { stargate: 1 },
            grant: ['stargate',2],
            queue_complete(){ return global.tech.stargate >= 2 ? 0 : 1; },
            cost: {
                Money(){ return 20000000; },
                Copper(){ return 2400000; },
                Aluminium(){ return 4000000; },
                Titanium(){ return 1250000; },
                Adamantite(){ return 750000; },
                Stanene(){ return 900000; },
                Aerogel(){ return 100000; }
            },
            effect: loc('interstellar_jump_ship_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    return true;
                }
                return false;
            }
        },
        wormhole_mission: {
            id: 'interstellar-wormhole_mission',
            title: loc('space_mission_title', [loc('interstellar_wormhole_name')]),
            desc: loc('space_mission_desc', [loc('interstellar_wormhole_name')]),
            reqs: { stargate: 2 },
            grant: ['stargate',3],
            queue_complete(){ return global.tech.stargate >= 3 ? 0 : 1; },
            cost: {
                Helium_3(){ return +int_fuel_adjust(150000).toFixed(0); },
                Deuterium(){ return +int_fuel_adjust(75000).toFixed(0); }
            },
            effect: loc('interstellar_wormhole_mission_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    initStruct(interstellarProjects.int_blackhole.stargate);
                    initStruct(galaxyProjects.gxy_stargate.gateway_station);
                    messageQueue(loc('interstellar_wormhole_mission_result'),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        stargate: {
            id: 'interstellar-stargate',
            title: loc('interstellar_stargate'),
            desc(wiki){
                if (!global.interstellar.hasOwnProperty('stargate') || global.interstellar.stargate.count < 200 || wiki){
                    return `<div>${loc('interstellar_stargate')}</div><div class="has-text-special">${loc('requires_segments',[200])}</div>` + (global.interstellar.hasOwnProperty('stargate') && global.interstellar.stargate.count >= 200 ? `<div class="has-text-special">${loc('requires_power')}</div>` : ``);
                }
                else {
                    return `<div>${loc('interstellar_stargate')}</div>`;
                }
            },
            reqs: { stargate: 3 },
            condition(){
                return global.interstellar.stargate.count >= 200 ? false : true;
            },
            queue_size: 10,
            queue_complete(){ return 200 - global.interstellar.stargate.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stargate') ? global.interstellar.stargate.count : 0)) < 200 ? 1000000 : 0; },
                Neutronium(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stargate') ? global.interstellar.stargate.count : 0)) < 200 ? 4800 : 0; },
                Infernite(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stargate') ? global.interstellar.stargate.count : 0)) < 200 ? 666 : 0; },
                Elerium(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stargate') ? global.interstellar.stargate.count : 0)) < 200 ? 75 : 0; },
                Nano_Tube(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stargate') ? global.interstellar.stargate.count : 0)) < 200 ? 12000 : 0; },
                Stanene(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stargate') ? global.interstellar.stargate.count : 0)) < 200 ? 60000 : 0; },
                Mythril(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stargate') ? global.interstellar.stargate.count : 0)) < 200 ? 3200 : 0; }
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.interstellar.hasOwnProperty('stargate') ? global.interstellar.stargate.count : 0);
                if (count < 200){
                    let remain = 200 - count;
                    return `<div>${loc('interstellar_stargate_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return interstellarProjects.int_blackhole.s_gate.effect();
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.interstellar.stargate.count < 200){
                        incrementStruct('stargate','interstellar');
                        if (global.interstellar.stargate.count >= 200){
                            global.tech['stargate'] = 4;
                            initStruct(interstellarProjects.int_blackhole.s_gate);
                            incrementStruct('s_gate','interstellar');
                            // Require the force power-on setting to automatically power end-of-era structs, even when power is abundant
                            if (global.settings.alwaysPower){
                                powerOnNewStruct(interstellarProjects.int_blackhole.s_gate);
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
                    p: ['stargate','interstellar']
                };
            }
        },
        s_gate: {
            id: 'interstellar-s_gate',
            title: loc('interstellar_stargate'),
            desc(){
                return `<div>${loc('interstellar_stargate')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { stargate: 4 },
            condition(){
                return global.interstellar.stargate.count >= 200 ? true : false;
            },
            wiki: false,
            queue_complete(){ return 0; },
            cost: {},
            powered(){
                return powerCostMod(250);
            },
            effect(){
                return `<div>${loc('interstellar_s_gate_effect')}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(args){
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['s_gate','interstellar']
                };
            }
        },
    };

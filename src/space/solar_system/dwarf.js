import { loc } from '../../core/locale.js';
import { global, p_on } from '../../core/vars.js';
import { payCosts } from '../../actions/core/action_costs.js';
import { initStruct } from '../../actions/core/structure_ui.js';
import { powerOnNewStruct } from '../../actions/evolution/planet_setup.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { messageQueue } from '../../functions/message_log.js';
import { clearPopper } from '../../functions/popover.js';
import { spaceCostMultiplier } from '../../functions/cost_multipliers.js';
import { powerCostMod, powerModifier } from '../../functions/power_modifiers.js';
import { spatialReasoning } from '../../resources/resources.js';
import { universeAffix } from '../../functions/universe_utils.js';
import { loadTab } from '../../core/index.js';
import { drawShipYard } from '../../truepath/tau_ceti_shipyard.js';
import { spaceProjects } from '../../core/registries.js';
import { planetName, fuel_adjust } from '../planet_generation.js';
import { incrementStruct, renderSpace } from '../space_requirements.js';

// Region 'spc_dwarf' dari spaceProjects (dipisah dari space.js). Isi sama persis; digabung via core/registries.js di space.js.
export const spaceProjects_spc_dwarf = {
        info: {
            name(){
                return planetName().dwarf;
            },
            desc(){
                return loc('space_dwarf_info_desc',[planetName().dwarf]);
            },
            zone: 'inner',
            syndicate(){ return false; }
        },
        dwarf_mission: {
            id: 'space-dwarf_mission',
            title(){
                return loc('space_mission_title',[planetName().dwarf]);
            },
            desc(){
                return loc('space_mission_desc',[planetName().dwarf]);
            },
            reqs: { asteroid: 1, elerium: 1 },
            grant: ['dwarf',1],
            queue_complete(){ return global.tech.dwarf >= 1 ? 0 : 1; },
            cost: {
                Helium_3(offset,wiki){ return +fuel_adjust(45000,false,wiki).toFixed(0); }
            },
            effect(){
                return loc('space_dwarf_mission_effect1',[planetName().dwarf]);
            },
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('space_dwarf_mission_action',[planetName().dwarf]),'info',false,['progress']);
                    initStruct(spaceProjects.spc_dwarf.elerium_contain);
                    return true;
                }
                return false;
            }
        },
        elerium_contain: {
            id: 'space-elerium_contain',
            title: loc('space_dwarf_elerium_contain_title'),
            desc(){
                return `<div>${loc('space_dwarf_elerium_contain_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { dwarf: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('elerium_contain', offset, 800000, 1.28); },
                Cement(offset){ return spaceCostMultiplier('elerium_contain', offset, 120000, 1.28); },
                Iridium(offset){ return spaceCostMultiplier('elerium_contain', offset, 50000, 1.28); },
                Neutronium(offset){ return spaceCostMultiplier('elerium_contain', offset, 250, 1.28); }
            },
            effect(){
                let elerium = spatialReasoning(100);
                return `<div>${loc('plus_max_resource',[elerium,global.resource.Elerium.name])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(6); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('elerium_contain');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['elerium_contain','space']
                };
            }
        },
        e_reactor: {
            id: 'space-e_reactor',
            title: loc('space_dwarf_reactor_title'),
            desc(){
                return `<div>${loc('space_dwarf_reactor_title')}</div><div class="has-text-special">${loc('space_dwarf_reactor_desc_req')}</div>`;
            },
            reqs: { elerium: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('e_reactor', offset, 1250000, 1.28); },
                Steel(offset){ return spaceCostMultiplier('e_reactor', offset, 350000, 1.28); },
                Neutronium(offset){ return spaceCostMultiplier('e_reactor', offset, 1250, 1.28); },
                Mythril(offset){ return spaceCostMultiplier('e_reactor', offset, 2500, 1.28); }
            },
            effect(){
                let elerium = $(this)[0].p_fuel().a;
                let power = $(this)[0].powered() * -1;
                return `<div>${loc('space_dwarf_reactor_effect1',[power])}</div><div  class="has-text-caution">${loc('space_dwarf_reactor_effect2',[elerium])}</div>`;
            },
            powered(){ return powerModifier(-25); },
            p_fuel(){ return { r: 'Elerium', a: 0.05 }; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('e_reactor');
                    global.space['e_reactor'].on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['e_reactor','space']
                };
            }
        },
        world_collider: {
            id: 'space-world_collider',
            title: loc('space_dwarf_collider_title'),
            desc(wiki){
                if (!global.space.hasOwnProperty('world_collider') || global.space.world_collider.count < 1859 || wiki){
                    return `<div>${loc('space_dwarf_collider_desc')}</div><div class="has-text-special">${loc('space_dwarf_collider_desc_req')}</div>` + (global.space.hasOwnProperty('world_collider') && global.space.world_collider.count >= 1859 ? `<div class="has-text-special">${loc('requires_power')}</div>` : ``);
                }
            },
            reqs: { science: 10 },
            path: ['standard'],
            condition(){
                return global.space.world_collider.count < 1859 ? true : false;
            },
            queue_size: 100,
            queue_complete(){ return 1859 - global.space.world_collider.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.space.hasOwnProperty('world_collider') ? global.space.world_collider.count : 0)) < 1859 ? 25000 : 0; },
                Copper(offset){ return ((offset || 0) + (global.space.hasOwnProperty('world_collider') ? global.space.world_collider.count : 0)) < 1859 ? 750 : 0; },
                Alloy(offset){ return ((offset || 0) + (global.space.hasOwnProperty('world_collider') ? global.space.world_collider.count : 0)) < 1859 ? 125 : 0; },
                Neutronium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('world_collider') ? global.space.world_collider.count : 0)) < 1859 ? 12 : 0; },
                Elerium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('world_collider') ? global.space.world_collider.count : 0)) < 1859 ? 1 : 0; },
                Mythril(offset){ return ((offset || 0) + (global.space.hasOwnProperty('world_collider') ? global.space.world_collider.count : 0)) < 1859 ? 10 : 0; }
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.space.hasOwnProperty('world_collider') ? global.space.world_collider.count : 0);
                if (count < 1859){
                    let remain = 1859 - count;
                    return `<div>${loc('space_dwarf_collider_effect1')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return spaceProjects.spc_dwarf.world_controller.effect();
                }
            },
            action(args){
                if (global.space.world_collider.count < 1859 && payCosts($(this)[0])){
                    incrementStruct('world_collider');
                    if (global.space.world_collider.count >= 1859){
                        global.tech['science'] = 11;
                        initStruct(spaceProjects.spc_dwarf.world_controller);
                        incrementStruct('world_controller');
                        // Require the force power-on setting to automatically power end-of-era structs, even when power is abundant
                        if (global.settings.alwaysPower){
                            powerOnNewStruct(spaceProjects.spc_dwarf.world_controller);
                        }
                        drawTech();
                        renderSpace();
                        if (global.race['banana']){
                            let affix = universeAffix();
                            global.stats.banana.b2[affix] = true;
                            if (affix !== 'm' && affix !== 'l'){
                                global.stats.banana.b2.l = true;
                            }
                        }
                        clearPopper();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['world_collider','space']
                };
            },
            flair: loc('space_dwarf_collider_flair')
        },
        world_controller: {
            id: 'space-world_controller',
            title: loc('space_dwarf_collider_title'),
            desc(){
                return `<div>${loc('space_dwarf_collider_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            wiki: false,
            reqs: { science: 11 },
            path: ['standard'],
            condition(){
                return global.space.world_collider.count < 1859 ? false : true;
            },
            queue_complete(){ return 0; },
            cost: {},
            effect(wiki){
                let boost = 25;
                if (global.interstellar['far_reach']){
                    let num_farpoint_on = wiki ? global.interstellar.far_reach.on : p_on['far_reach'];
                    if (num_farpoint_on > 0){
                        boost += num_farpoint_on; // 1% per Farpoint
                    }
                }
                if (global.tech.science >= 19){
                    boost += 15;
                }
                return `<div>${loc('plus_max_resource',[boost+'%',global.resource.Knowledge.name])}</div><div>${loc('space_dwarf_controller_effect3')}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(20); },
            action(args){
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['world_controller','space']
                };
            },
            flair: loc('space_dwarf_controller_flair')
        },
        shipyard: {
            id: 'space-shipyard',
            title: loc('outer_shipyard_title'),
            desc(){
                return `<div>${loc('outer_shipyard_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { shipyard: 1 },
            path: ['truepath'],
            cost: {
                Money(offset){ return ((offset || 0) + (global.space.hasOwnProperty('shipyard') ? global.space.shipyard.count : 0)) < 1 ? 10000000 : 0; },
                Aluminium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('shipyard') ? global.space.shipyard.count : 0)) < 1 ? 1000000 : 0; },
                Titanium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('shipyard') ? global.space.shipyard.count : 0)) < 1 ? 650000 : 0; },
                Iridium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('shipyard') ? global.space.shipyard.count : 0)) < 1 ? 250000 : 0; },
                Neutronium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('shipyard') ? global.space.shipyard.count : 0)) < 1 ? 10000 : 0; },
                Mythril(offset){ return ((offset || 0) + (global.space.hasOwnProperty('shipyard') ? global.space.shipyard.count : 0)) < 1 ? 500000 : 0; },
            },
            queue_complete(){ return 1 - global.space.shipyard.count; },
            effect(){
                return `<div>${loc('outer_shipyard_effect')}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(50); },
            special: true,
            sAction(){
                if (p_on['shipyard']){
                    global.settings.civTabs = 2;
                    global.settings.govTabs = 5;
                    if (!global.settings.tabLoad){
                        loadTab('mTabCivic');
                        clearPopper(`space-shipyard`);
                    }
                }
            },
            action(args){
                if (global.space.shipyard.count < 1 && payCosts($(this)[0])){
                    incrementStruct('shipyard');
                    if (powerOnNewStruct($(this)[0])){
                        global.settings.showShipYard = true;
                    }
                    global.tech['syard_class'] = 2;
                    global.tech['syard_armor'] = 3;
                    global.tech['syard_weapon'] = 1;
                    global.tech['syard_engine'] = 2;
                    global.tech['syard_power'] = 3;
                    global.tech['syard_sensor'] = 3;
                    drawShipYard();
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, ships: [], expand: true, sort: true },
                    p: ['shipyard','space']
                };
            }
        },
        mass_relay: {
            id: 'space-mass_relay',
            title: loc('space_dwarf_mass_relay_title'),
            desc(wiki){
                if (!global.space.hasOwnProperty('mass_relay') || global.space.mass_relay.count < 100 || wiki){
                    return `<div>${loc('space_dwarf_mass_relay_title')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
            },
            reqs: { outer: 5 },
            path: ['truepath'],
            condition(){
                return global.space.mass_relay.count < 100 ? true : false;
            },
            queue_size: 5,
            queue_complete(){ return 100 - global.space.mass_relay.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.space.hasOwnProperty('mass_relay') ? global.space.mass_relay.count : 0)) < 100 ? 10000000 : 0; },
                Neutronium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('mass_relay') ? global.space.mass_relay.count : 0)) < 100 ? 7500 : 0; },
                Adamantite(offset){ return ((offset || 0) + (global.space.hasOwnProperty('mass_relay') ? global.space.mass_relay.count : 0)) < 100 ? 18000 : 0; },
                Elerium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('mass_relay') ? global.space.mass_relay.count : 0)) < 100 ? 125 : 0; },
                Stanene(offset){ return ((offset || 0) + (global.space.hasOwnProperty('mass_relay') ? global.space.mass_relay.count : 0)) < 100 ? 100000 : 0; },
                Quantium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('mass_relay') ? global.space.mass_relay.count : 0)) < 100 ? 25000 : 0; },
            },
            effect(wiki){
                let count = ((wiki?.count ?? 0) + (global.space.hasOwnProperty('mass_relay') ? global.space.mass_relay.count : 0));
                if (count < 100){
                    let remain = 100 - count;
                    return `<div>${loc('space_dwarf_mass_relay_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return spaceProjects.spc_dwarf.m_relay.effect();
                }
            },
            action(args){
                if (global.space.mass_relay.count < 100 && payCosts($(this)[0])){
                    global.space.mass_relay.count++;
                    if (global.space.mass_relay.count >= 100){
                        global.tech['outer'] = 6;
                        initStruct(spaceProjects.spc_dwarf.m_relay);
                        incrementStruct('m_relay','space');
                        powerOnNewStruct(spaceProjects.spc_dwarf.m_relay);
                        drawTech();
                        renderSpace();
                        clearPopper();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['mass_relay','space']
                };
            }
        },
        m_relay: {
            id: 'space-m_relay',
            title: loc('space_dwarf_mass_relay_title'),
            desc(){
                return `<div>${loc('space_dwarf_mass_relay_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { outer: 6 },
            path: ['truepath'],
            condition(){
                return global.space.mass_relay.count >= 100 ? true : false;
            },
            wiki: false,
            queue_complete(){ return 0; },
            cost: {},
            powered(){
                return powerCostMod(100);
            },
            effect(){
                let charge = Math.floor(global.space.m_relay.charged / 10) / 10;
                return `<div>${loc('space_dwarf_mass_relay_effect2',[planetName().dwarf])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div><div>${loc('space_dwarf_mass_relay_charged',[charge])}</div>`;
            },
            action(args){
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, charged: 0 },
                    p: ['m_relay','space']
                };
            }
        },
    };

import { loc } from '../../core/locale.js';
import { races } from '../../races/races.js';
import { global } from '../../core/vars.js';
import { payCosts } from '../../actions/actions.js';
import { spaceCostMultiplier, get_qlevel, powerModifier } from '../../functions/functions.js';
import { fuel_adjust, incrementStruct, swarm_adjust } from '../space.js';

// Region 'spc_sun' dari spaceProjects (dipisah dari space.js). Isi sama persis; digabung via space_registry.js di space.js.
export const spaceProjects_spc_sun = {
        info: {
            name(){
                return loc('space_sun_info_name');
            },
            desc(){
                return loc('space_sun_info_desc',[races[global.race.species].home]);
            },
            support: 'swarm_control',
            zone: 'inner',
            syndicate(){ return false; }
        },
        sun_mission: {
            id: 'space-sun_mission',
            title(){
                return loc('space_sun_mission_title');
            },
            desc(){
                return loc('space_sun_mission_desc');
            },
            reqs: { space_explore: 4 },
            grant: ['solar',1],
            queue_complete(){ return global.tech.solar >= 1 ? 0 : 1; },
            cost: {
                Helium_3(offset,wiki){ return +fuel_adjust(15000,false,wiki).toFixed(0); }
            },
            effect(){
                return loc('space_sun_mission_effect1');
            },
            action(args){
                if (payCosts($(this)[0])){
                    return true;
                }
                return false;
            }
        },
        swarm_control: {
            id: 'space-swarm_control',
            title: loc('space_sun_swarm_control_title'),
            desc(){
                return `<div>${loc('space_sun_swarm_control_desc')}</div>`;
            },
            reqs: { solar: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('swarm_control', offset, 100000, 1.3); },
                Knowledge(offset){ return spaceCostMultiplier('swarm_control', offset, 60000, 1.3); },
                Alloy(offset){ return spaceCostMultiplier('swarm_control', offset, 7500, 1.3); },
                Helium_3(offset,wiki){ return spaceCostMultiplier('swarm_control', offset, fuel_adjust(2000,false,wiki), 1.3); },
                Mythril(offset){ return spaceCostMultiplier('swarm_control', offset, 250, 1.3); }
            },
            effect(wiki){
                return loc('space_sun_swarm_control_effect1',[$(this)[0].support(wiki)]);
            },
            support(wiki){ return global.tech['swarm'] && global.tech['swarm'] >= 2 ? (global.tech['high_tech'] >= 11 ? 11 + Math.round(get_qlevel(wiki)) : 12) : 10; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('swarm_control');
                    global.space['swarm_control'].s_max += $(this)[0].support();
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, support: 0, s_max: 0 },
                    p: ['swarm_control','space']
                };
            }
        },
        swarm_satellite: {
            id: 'space-swarm_satellite',
            title: loc('space_sun_swarm_satellite_title'),
            desc(){
                return `<div>${loc('space_sun_swarm_satellite_desc')}</div><div class="has-text-special">${loc('space_sun_swarm_satellite_desc_req')}</div>`;
            },
            reqs: { solar: 3 },
            cost: {
                Money(offset,wiki){ return spaceCostMultiplier('swarm_satellite', offset, swarm_adjust(5000,wiki), 1.1); },
                Copper(offset,wiki){ return spaceCostMultiplier('swarm_satellite', offset, swarm_adjust(2500,wiki), 1.1); },
                Iridium(offset,wiki){ return spaceCostMultiplier('swarm_satellite', offset, swarm_adjust(150,wiki), 1.1); },
                Helium_3(offset,wiki){ return spaceCostMultiplier('swarm_satellite', offset, swarm_adjust(fuel_adjust(50,false,wiki),wiki), 1.1); }
            },
            effect(){
                let solar = 0.35;
                if (global.tech.swarm >= 4){
                    solar += 0.15 * (global.tech.swarm - 3);
                }
                if (global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 1){ solar += 0.15; }
                if (global.blood['illuminate']){
                    solar += 0.01 * global.blood.illuminate;
                }
                solar = +(solar).toFixed(2);
                return `<span>${loc('space_dwarf_reactor_effect1',[powerModifier(solar)])}</span>, <span class="has-text-caution">${loc('space_sun_swarm_satellite_effect1',[1])}</span>`;
            },
            support(){ return -1; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('swarm_satellite');
                    global.space['swarm_control'].support++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['swarm_satellite','space']
                };
            }
        },
        jump_gate: {
            id: 'space-jump_gate',
            title: loc('tau_jump_gate'),
            desc(wiki){
                if (!global.space.hasOwnProperty('jump_gate') || global.space.jump_gate.count < 100 || wiki){
                    return `<div>${loc('tau_jump_gate')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                else {
                    return `<div>${loc('tau_jump_gate')}</div>`;
                }
            },
            reqs: { tauceti: 3 },
            path: ['truepath'],
            queue_size: 10,
            queue_complete(){ return 100 - global.space.jump_gate.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.space.hasOwnProperty('jump_gate') ? global.space.jump_gate.count : 0)) < 100 ? 1000000 : 0; },
                Alloy(offset){ return ((offset || 0) + (global.space.hasOwnProperty('jump_gate') ? global.space.jump_gate.count : 0)) < 100 ? 50000 : 0; },
                Adamantite(offset){ return ((offset || 0) + (global.space.hasOwnProperty('jump_gate') ? global.space.jump_gate.count : 0)) < 100 ? 12500 : 0; },
                Graphene(offset){ return ((offset || 0) + (global.space.hasOwnProperty('jump_gate') ? global.space.jump_gate.count : 0)) < 100 ? 42000 : 0; },
                Orichalcum(offset){ return ((offset || 0) + (global.space.hasOwnProperty('jump_gate') ? global.space.jump_gate.count : 0)) < 100 ? 35000 : 0; },
                Quantium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('jump_gate') ? global.space.jump_gate.count : 0)) < 100 ? 25000 : 0; },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.space.hasOwnProperty('jump_gate') ? global.space.jump_gate.count : 0);
                if (count < 100){
                    let remain = 100 - count;
                    return `<div>${loc('tau_jump_gate_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return loc('tau_jump_gate_effect');
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.space.jump_gate.count < 100){
                        global.space.jump_gate.count++;
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['jump_gate','space']
                };
            }
        },
    };

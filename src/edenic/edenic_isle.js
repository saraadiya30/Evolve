import { global, p_on } from '../core/vars.js';
import { powerCostMod, spaceCostMultiplier, timeFormat } from '../functions/functions.js';
import { payCosts, powerOnNewStruct, drawTech } from '../actions/actions.js';
import { incrementStruct } from '../space/space.js';
import { loc } from '../core/locale.js';

// Region 'eden_isle' dari edenicModules (dipisah dari edenic.js). Urutan/isi entri sama persis; digabung di edenic.js.
export const edenIsle = {
        info: {
            name: loc('eden_isle_name'),
            desc: loc('eden_isle_desc'),
        },
        south_pier: {
            id: 'eden-south_pier',
            title(){ return loc('eden_pier',[loc('south')]); },
            desc(wiki){
                if (wiki || !global.eden.hasOwnProperty('rune_gate') || global.eden.south_pier.count < 10){
                    return `<div>${loc('eden_pier',[loc('south')])}</div><div class="has-text-special">${loc('requires_segments',[10])}</div>`;
                }
                else {
                    return `<div>${loc('eden_pier',[loc('south')])}</div>`;
                }
            },
            reqs: { isle: 2 },
            queue_complete(){ return 10 - global.eden.south_pier.count; },
            cost: {
                Money(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('south_pier') ? global.eden.south_pier.count : 0) < 10 ? 7500000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('south_pier') || (global.eden.south_pier.count < 10) ? 7500000000 : 0;
                },
                Iron(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('south_pier') ? global.eden.south_pier.count : 0) < 10 ? 500000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('south_pier') || (global.eden.south_pier.count < 10) ? 500000000 : 0;
                },
                Plywood(offset){
                    if (global.race['kindling_kindred'] || global.race['smoldering']){ return 0; }
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('south_pier') ? global.eden.south_pier.count : 0) < 10 ? 250000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('south_pier') || (global.eden.south_pier.count < 10) ? 250000000 : 0;
                },
                Sheet_Metal(offset){
                    if (!global.race['kindling_kindred'] && !global.race['smoldering']){ return 0; }
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('south_pier') ? global.eden.south_pier.count : 0) < 10 ? 62500000 : 0;
                    }
                    return !global.eden.hasOwnProperty('south_pier') || (global.eden.south_pier.count < 10) ? 62500000 : 0;
                },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.eden.hasOwnProperty('south_pier') ? global.eden.south_pier.count : 0);
                if (count >= 10){
                    let desc = `<div>${loc('eden_pier_effect',[loc('eden_pier',[loc('north')]),loc('eden_elysium_name')])}</div>`;
                    return desc;
                }
                else {
                    let size = 10;
                    let remain = size - count;
                    return `<div>${loc('eden_pier_effect',[loc('eden_pier',[loc('north')]),loc('eden_elysium_name')])}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
            },
            action(args){
                if (global.eden.south_pier.count < 10 && payCosts($(this)[0])){
                    incrementStruct('south_pier','eden');
                    if (global.eden.south_pier.count === 10 && global.eden.north_pier.count === 10 && global.tech.isle === 2){
                        global.tech.isle = 3;
                        drawTech();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['south_pier','eden']
                };
            }
        },
        west_tower: { 
            id: 'eden-west_tower',
            title(){ return global.eden['enemy_isle'] && global.eden.enemy_isle.wt === 0 ? loc('eden_rampart_ruin',[loc('west')]) : loc('eden_rampart_title',[loc('west')]); },
            desc(){ return global.eden['enemy_isle'] && global.eden.enemy_isle.wt === 0 ? loc('eden_rampart_ruin',[loc('west')]) : loc('eden_rampart_title',[loc('west')]); },
            queue_complete(){ return 0; },
            reqs: { isle: 1 },
            effect(){ 
                if (global.eden['enemy_isle'] && global.eden.enemy_isle.wt === 0){
                    return `<div>${loc('eden_tower_destroyed')}</div>`;
                }
                else {
                    return `<div>${loc('eden_tower_intact',[global.eden['enemy_isle'] ? global.eden.enemy_isle.wt : 100])}</div>`;
                }
            },
            action(args){
                return false;
            }
        },
        isle_garrison: { 
            id: 'eden-isle_garrison',
            title(){ return global.eden['enemy_isle'] && global.eden.enemy_isle.g === 0 ? loc('eden_garrison_ruin') : loc('eden_garrison_title'); },
            desc(){ return global.eden['enemy_isle'] && global.eden.enemy_isle.g === 0 ? loc('eden_garrison_ruin') : loc('eden_garrison_title'); },
            queue_complete(){ return 0; },
            reqs: { isle: 1 },
            effect(){ 
                if (global.eden['enemy_isle'] && global.eden.enemy_isle.g === 0){
                    return `<div>${loc('eden_tower_destroyed')}</div>`;
                }
                else {
                    return `<div>${loc('eden_tower_intact',[global.eden['enemy_isle'] ? global.eden.enemy_isle.g : 100])}</div>`;
                }
            },
            action(args){
                return false;
            }
        },
        east_tower: { 
            id: 'eden-east_tower',
            title(){ return global.eden['enemy_isle'] && global.eden.enemy_isle.et === 0 ? loc('eden_rampart_ruin',[loc('east')]) : loc('eden_rampart_title',[loc('east')]); },
            desc(){ return global.eden['enemy_isle'] && global.eden.enemy_isle.et === 0 ? loc('eden_rampart_ruin',[loc('east')]) : loc('eden_rampart_title',[loc('east')]); },
            queue_complete(){ return 0; },
            reqs: { isle: 1 },
            effect(){ 
                if (global.eden['enemy_isle'] && global.eden.enemy_isle.et === 0){
                    return `<div>${loc('eden_tower_destroyed')}</div>`;
                }
                else {
                    return `<div>${loc('eden_tower_intact',[global.eden['enemy_isle'] ? global.eden.enemy_isle.et : 100])}</div>`;
                }
            },
            action(args){
                return false;
            }
        },
        spirit_vacuum: {
            id: 'eden-spirit_vacuum',
            title(){ return loc('eden_spirit_vacuum_title'); },
            desc(){
                return `<div>${loc('eden_spirit_vacuum_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { isle: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('spirit_vacuum', offset, 30000000000, 1.1, 'eden'); },
                Neutronium(offset){ return spaceCostMultiplier('spirit_vacuum', offset, 175000000, 1.1, 'eden'); },
                Stanene(offset){ return spaceCostMultiplier('spirit_vacuum', offset, 1000000000, 1.1, 'eden'); },
                Elerium(offset){ return spaceCostMultiplier('spirit_vacuum', offset, 240000, 1.1, 'eden'); },
                Soul_Gem(offset){ return spaceCostMultiplier('spirit_vacuum', offset, 1000, 1.1, 'eden'); },
            },
            effect(){
                let desc = `<div>${loc('eden_spirit_vacuum_effect')}</div>`;
                if (global.eden.hasOwnProperty('palace') && global.eden.palace.rate > 0 && global.eden.palace.energy > 0){
                    desc += `<div>${loc(`eden_spirit_vacuum_time`,[timeFormat(global.eden.palace.energy / global.eden.palace.rate)])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(wiki){
                let num_battery = wiki ? (global.eden?.spirit_battery?.on ?? 0) : (p_on['spirit_battery'] || 0);
                let factor = num_battery || 0;
                let coefficent = 0.9;
                if (global.race['warlord'] && global.eden['corruptor'] && global.tech?.asphodel >= 13){
                    coefficent = 1 - (1 + (p_on['corruptor'] || 0) * 0.03) / 10;
                }
                return +(powerCostMod(18000 * (coefficent ** factor))).toFixed(2);
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('spirit_vacuum','eden');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['spirit_vacuum','eden']
                };
            },
            flair(){ return loc(`eden_spirit_vacuum_flair`); }
        },
        spirit_battery: {
            id: 'eden-spirit_battery',
            title(){ return loc('eden_spirit_battery_title'); },
            desc(){
                return `<div>${loc('eden_spirit_battery_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { isle: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('spirit_battery', offset, 18000000000, 1.2, 'eden'); },
                Copper(offset){ return spaceCostMultiplier('spirit_battery', offset, 5000000000, 1.2, 'eden'); },
                Vitreloy(offset){ return spaceCostMultiplier('spirit_battery', offset, 50000000, 1.2, 'eden'); },
                Elysanite(offset){ return spaceCostMultiplier('spirit_battery', offset, 100000000, 1.2, 'eden'); },
            },
            effect(){
                let power = 10;
                let drain = 8;
                if (global.race['warlord'] && global.eden['corruptor'] && global.tech?.asphodel >= 13){
                    let multiplier = 1 + (p_on['corruptor'] || 0) * 0.03;
                    power *= multiplier;
                    drain *= multiplier;
                }

                let desc = `<div>${loc('eden_spirit_battery_effect',[loc('eden_spirit_vacuum_title'),+power.toFixed(2)])}</div>`;
                if (global.tech['isle'] && global.tech.isle >= 6){
                    desc += `<div>${loc('eden_spirit_battery_effect2',[loc('eden_spirit_vacuum_title'),+drain.toFixed(2)])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){
                return powerCostMod(500);
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('spirit_battery','eden');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['spirit_battery','eden']
                };
            }
        },
        soul_compactor: {
            id: 'eden-soul_compactor',
            title(){ return loc('eden_soul_compactor_title'); },
            desc(){ return `<div>${loc('eden_soul_compactor_title')}</div>`; },
            reqs: { isle: 7 },
            cost: {
                Money(o,wiki){ return global.eden?.soul_compactor?.count === 0 || wiki ? 50000000000 : 0; },
                Iron(o,wiki){ return global.eden?.soul_compactor?.count === 0 || wiki ? (global.race['warlord'] ? 10000000000 : 22500000000) : 0; },
                Uranium(o,wiki){ return global.eden?.soul_compactor?.count === 0 || wiki ? 4000000 : 0; },
                Scarletite(o,wiki){ return global.eden?.soul_compactor?.count === 0 || wiki ? 300000000 : 0; },
            },
            queue_complete(){ return 1 - (global.eden?.soul_compactor?.count || 0); },
            effect(){
                let desc = `<div>${loc('eden_soul_compactor_effect1',[global.eden?.soul_compactor?.energy.toLocaleString() || 0])}</div>`;
                desc += `<div>${loc('eden_soul_compactor_effect2',[(1000000000).toLocaleString()])}</div>`;
                desc += `<div>${loc('eden_soul_compactor_effect3',[global.resource.Soul_Gem.name])}</div>`;
                return desc;
            },
            action(args){
                if (global.eden.soul_compactor.count === 0 && payCosts($(this)[0])){
                    incrementStruct('soul_compactor','eden');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, energy: 0, report: 0 },
                    p: ['soul_compactor','eden']
                };
            },
            flair(){
                return loc(`eden_soul_compactor_flair`);
            }
        },
    };

import { global, p_on, sizeApproximation } from './vars.js';
import { loc } from './locale.js';
import { spaceCostMultiplier } from './functions.js';
import { storageMultipler, payCosts, actions, powerOnNewStruct } from './actions.js';
import { spatialReasoning } from './resources.js';
import { incrementStruct } from './space.js';
import { renderEdenic } from './edenic_render.js';
import { govActive } from './governor.js';
import { jobScale } from './jobs.js';

// Bagian dari edenAsphodel (6 entri: warehouse .. bliss_den), dipisah dari edenic_asphodel.js. Urutan entri sama persis.
export const edenAsphodelPart2 = {
        warehouse: {
            id: 'eden-warehouse',
            title(){
                return global.tech['storage'] <= 2 ? loc('city_shed_title1') : (global.tech['storage'] >= 4 ? loc('city_shed_title3') : loc('city_shed_title2'));
            },
            desc(){
                let storage = global.tech['storage'] >= 3 ? (global.tech['storage'] >= 4 ? loc('city_shed_desc_size3') : loc('city_shed_desc_size2')) : loc('city_shed_desc_size1');
                return loc('city_shed_desc',[storage]);
            },
            reqs: { asphodel: 7 },
            cost: {
                Money(offset){ return spaceCostMultiplier('warehouse', offset, 300000000, 1.28, 'eden'); },
                Steel(offset){ return spaceCostMultiplier('warehouse', offset, 15000000, 1.28, 'eden'); },
                Alloy(offset){ return spaceCostMultiplier('warehouse', offset, 18000000, 1.28, 'eden'); },
                Cement(offset){ return spaceCostMultiplier('warehouse', offset, 27500000, 1.28, 'eden'); }
            },
            res(){
                let r_list = [
                    'Lumber','Stone','Chrysotile','Furs','Copper','Iron','Aluminium','Cement','Coal',
                    'Nano_Tube','Neutronium','Adamantite','Infernite','Alloy','Polymer','Iridium',
                    'Graphene','Stanene','Bolognium','Orichalcum','Asphodel_Powder',
                ];
                if (global.tech['storage'] >= 3 && global.resource.Steel.display){
                    r_list.push('Steel');
                }
                if (global.tech['storage'] >= 4 && global.resource.Titanium.display){
                    r_list.push('Titanium');
                }
                return r_list;
            },
            val(res){
                switch (res){
                    case 'Lumber':
                        return global.race['warlord'] ? 5500 : 3750
                    case 'Stone':
                        return global.race['warlord'] ? 5500 : 3750;
                    case 'Chrysotile':
                        return 3750;
                    case 'Furs':
                        return 2125;
                    case 'Copper':
                        return global.race['warlord'] ? 3800 : 1900;
                    case 'Iron':
                        return global.race['warlord'] ? 3300 : 1750;
                    case 'Aluminium':
                        return global.race['warlord'] ? 3750 : 1600;
                    case 'Cement':
                        return global.race['warlord'] ? 1800 : 1400;
                    case 'Coal':
                        return global.race['warlord'] ? 800 : 600;
                    case 'Steel':
                        return global.race['warlord'] ? 450 : 300;
                    case 'Titanium':
                        return global.race['warlord'] ? 325 : 200;
                    case 'Nano_Tube':
                        return global.race['warlord'] ? 350 : 150;
                    case 'Neutronium':
                        return global.race['warlord'] ? 65 : 40;
                    case 'Adamantite':
                        return global.race['warlord'] ? 120 : 90;
                    case 'Infernite':
                        return global.race['warlord'] ? 22 : 18;
                    case 'Alloy':
                        return global.race['warlord'] ? 350 : 250;
                    case 'Polymer':
                        return global.race['warlord'] ? 350 : 250;
                    case 'Iridium':
                        return global.race['warlord'] ? 375 : 225;
                    case 'Graphene':
                        return global.race['warlord'] ? 250 : 175;
                    case 'Stanene':
                        return global.race['warlord'] ? 250 : 175;
                    case 'Bolognium':
                        return global.race['warlord'] ? 75 : 45;
                    case 'Orichalcum':
                        return global.race['warlord'] ? 62 : 22;
                    case 'Asphodel_Powder':
                        return global.eden['stabilizer'] 
                            ? 0.1 + (global.eden.stabilizer.count * 0.015 * (
                                global.race['warlord'] && global.eden['corruptor'] && p_on['corruptor'] ? 1 + (p_on['corruptor'] * 0.05) : 1
                            )) 
                            : 0.1;
                    default:
                        return 0;
                }
            },
            wide: true,
            effect(){
                let storage = '<div class="aTable">';
                let multiplier = storageMultipler(global.race['warlord'] ? 1 : 0.2);
                if (global.race['warlord'] && global.eden['corruptor']){
                    multiplier *= 1 + (p_on['corruptor'] || 0) * (global.tech.asphodel >= 12 ? (global.tech.asphodel >= 13 ? 0.16 : 0.12) : 0.08);
                }
                for (const res of $(this)[0].res()){
                    if (global.resource[res].display){
                        let val = sizeApproximation(+(spatialReasoning(+($(this)[0].val(res) * multiplier)).toFixed(0)));
                        storage = storage + `<span>${loc('plus_max_resource',[val,global.resource[res].name])}</span>`;
                    }
                };
                storage = storage + '</div>';
                return storage;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('warehouse','eden');
                    let multiplier = storageMultipler(global.race['warlord'] ? 1 : 0.2);
                    if (global.race['warlord'] && global.eden['corruptor']){
                        multiplier *= 1 + (p_on['corruptor'] || 0) * (global.tech.asphodel >= 12 ? (global.tech.asphodel >= 13 ? 0.16 : 0.12) : 0.08);
                    }
                    for (const res of $(this)[0].res()){
                        if (global.resource[res].display){
                            global.resource[res].max += (spatialReasoning($(this)[0].val(res) * multiplier));
                        }
                    };
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['warehouse','eden']
                };
            }
        },
        stabilizer: {
            id: 'eden-stabilizer',
            title(){ return loc('eden_stabilizer_title'); },
            desc(){ return loc('eden_stabilizer_title'); },
            reqs: { asphodel: 8 },
            cost: {
                Money(offset){ return spaceCostMultiplier('stabilizer', offset, 800000000, 1.25, 'eden'); },
                Neutronium(offset){ return spaceCostMultiplier('stabilizer', offset, 7500000, 1.25, 'eden'); },
                Vitreloy(offset){ return spaceCostMultiplier('stabilizer', offset, 29000000, 1.25, 'eden'); },
                Elerium(offset){ return spaceCostMultiplier('stabilizer', offset, 7500, 1.25, 'eden'); },
                Asphodel_Powder(offset){ return spaceCostMultiplier('stabilizer', offset, 4250, 1.25, 'eden'); },
            },
            queue_complete(){ return global.eden.warehouse.count - global.eden.stabilizer.count; },
            effect(){
                let desc = `<div class="has-text-caution">${loc('eden_stabilizer_requirement',[loc('city_shed_title3')])}</div>`;

                let store = 15;
                let stabilize = 8;
                if (p_on['ascension_trigger'] && global.eden.hasOwnProperty('encampment') && global.eden.encampment.asc){
                    let heatSink = actions.interstellar.int_sirius.ascension_trigger.heatSink();
                    heatSink = heatSink < 0 ? Math.abs(heatSink) : 0;
                    if (heatSink > 0){
                        stabilize *= 1 + (heatSink / 17500);
                    }
                }
                if (global.race['warlord'] && global.eden['corruptor'] && p_on['corruptor']){
                    stabilize += 0.4 * p_on['corruptor'];
                    store *= 1 + (p_on['corruptor'] * 0.05);
                }
                if (stabilize > 99){ stabilize = 99; }

                

                desc += `<div>${loc('eden_stabilizer_effect1',[global.resource.Asphodel_Powder.name, +stabilize.toFixed(1)])}</div>`;
                desc += `<div>${loc('eden_stabilizer_effect2',[global.resource.Asphodel_Powder.name, loc('city_shed_title3'), +store.toFixed(1)])}</div>`;
                desc += `<div class="has-text-special">${loc('eden_stabilizer_limit',[global?.eden?.warehouse?.count || 0])}</div>`;
                return desc;
            },
            action(args){
                if (global.eden.stabilizer.count < global.eden.warehouse.count && payCosts($(this)[0])){
                    incrementStruct('stabilizer','eden');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['stabilizer','eden']
                };
            }
        },
        rune_gate: {
            id: 'eden-rune_gate',
            title: loc('eden_rune_gate_title'),
            desc(wiki){
                if (!global.eden.hasOwnProperty('rune_gate') || global.eden.rune_gate.count < 100 || wiki){
                    return `<div>${loc('eden_rune_gate_title')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                else {
                    return `<div>${loc('eden_rune_gate_title')}</div>`;
                }
            },
            reqs: { elysium: 1 },
            condition(){
                return global.eden.rune_gate.count < 100 ? true : false;
            },
            queue_size: 10,
            queue_complete(){ return 100 - global.eden.rune_gate.count; },
            cost: {
                Money(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('rune_gate') ? global.eden.rune_gate.count : 0) < 100 ? 1000000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('rune_gate') || (global.eden.rune_gate.count < 100) ? 1000000000 : 0;
                },
                Omniscience(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('rune_gate') ? global.eden.rune_gate.count : 0) < 100 ? 10000 : 0;
                    }
                    return !global.eden.hasOwnProperty('rune_gate') || (global.eden.rune_gate.count < 100) ? 10000 : 0;
                },
                Copper(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('rune_gate') ? global.eden.rune_gate.count : 0) < 100 ? 420000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('rune_gate') || (global.eden.rune_gate.count < 100) ? 420000000 : 0;
                },
                Nano_Tube(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('rune_gate') ? global.eden.rune_gate.count : 0) < 100 ? 35000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('rune_gate') || (global.eden.rune_gate.count < 100) ? 35000000 : 0;
                },
                Bolognium(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('rune_gate') ? global.eden.rune_gate.count : 0) < 100 ? 7500000 : 0;
                    }
                    return !global.eden.hasOwnProperty('rune_gate') || (global.eden.rune_gate.count < 100) ? 7500000 : 0;
                },
                Asphodel_Powder(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('rune_gate') ? global.eden.rune_gate.count : 0) < 100 ? 25000 : 0;
                    }
                    return !global.eden.hasOwnProperty('rune_gate') || (global.eden.rune_gate.count < 100) ? 25000 : 0;
                },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.eden.hasOwnProperty('rune_gate') ? global.eden.rune_gate.count : 0);
                if (count >= 100){
                    let desc = `<div>${loc('eden_rune_gate_effect')}</div>`;
                    return desc;
                }
                else {
                    let size = 100;
                    let remain = size - count;
                    return `<div>${loc('eden_rune_gate_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
            },
            action(args){
                if (global.eden.rune_gate.count < 100 && payCosts($(this)[0])){
                    incrementStruct('rune_gate','eden');
                    if (global.eden.rune_gate.count === 100){
                        global.eden.rune_gate_open.count = 1;
                        global.settings.eden.elysium = true;
                        global.tech.elysium = 2;
                        renderEdenic();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['rune_gate','eden']
                };
            }
        },
        rune_gate_open: {
            id: 'space-rune_gate_complete',
            title: loc('eden_rune_gate_title'),
            desc(){
                return `<div>${loc('eden_rune_gate_title')}</div>`;
            },
            wiki: false,
            reqs: { elysium: 1 },
            condition(){
                return global.eden.rune_gate.count === 100 ? true : false;
            },
            queue_complete(){ return 0; },
            cost: {},
            effect(){
                return `<div>${loc('eden_rune_gate_open',[loc('eden_elysium_name')])}</div>`;
            },
            action(args){
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['rune_gate_open','eden']
                };
            }
        },
        bunker: {
            id: 'eden-bunker',
            title: loc('eden_bunker_title'),
            desc: `<div>${loc('eden_bunker_title')}</div><div class="has-text-special">${loc('space_support',[loc('eden_asphodel_name')])}</div>`,
            reqs: { asphodel: 9 },
            cost: {
                Money(offset){ return spaceCostMultiplier('bunker', offset, 777000000, 1.2, 'eden'); },
                Stone(offset){ return spaceCostMultiplier('bunker', offset, 358000000, 1.2, 'eden'); },
                Furs(offset){ return spaceCostMultiplier('bunker', offset, 66600000, 1.2, 'eden'); },
                Asphodel_Powder(offset){ return spaceCostMultiplier('bunker', offset, 9999, 1.2, 'eden'); },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('space_used_support',[loc('eden_asphodel_name')])}</div>`;
                desc += `<div>${loc('plus_max_soldiers',[$(this)[0].soldiers()])}</div>`;
                if (global.race.universe === 'evil' && global.race['warlord']){
                    desc += `<div>${loc('plus_max_resource',[1,global.resource.Authority.name])}</div>`;
                }
                if (global.tech['celestial_warfare'] && global.tech.celestial_warfare >= 4 && (!global.tech['elysium'] || global.tech.elysium < 8)){
                    desc += `<div>${loc('eden_bunker_effect',[3])}</div>`;
                }
                if (global.tech['celestial_warfare'] && global.tech.celestial_warfare >= 5){
                    let rate = 10;
                    if (global.blood['lust']){
                        rate += global.blood.lust * 0.2;
                    }
                    let milVal = govActive('militant',0);
                    if (milVal){
                        rate *= 1 + (milVal / 100);
                    }
                    desc += `<div>${loc('city_boot_camp_effect',[+rate.toFixed(2)])}</div>`;
                }
                return desc;
            },
            s_type: 'asphodel',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('bunker','eden');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['bunker','eden']
                };
            },
            soldiers(){
                let soldiers = global.race['grenadier'] ? 3 : 5;
                return jobScale(soldiers);
            }
        },
        bliss_den: {
            id: 'eden-bliss_den',
            title: loc('eden_bliss_den_title'),
            desc: `<div>${loc('eden_bliss_den_title')}</div><div class="has-text-special">${loc('space_support',[loc('eden_asphodel_name')])}</div>`,
            reqs: { asphodel: 10 },
            cost: {
                Money(offset){ return spaceCostMultiplier('bliss_den', offset, 450000000, 1.22, 'eden'); },
                Furs(offset){ return spaceCostMultiplier('bliss_den', offset, 29000000, 1.22, 'eden'); },
                Asphodel_Powder(offset){ return spaceCostMultiplier('bliss_den', offset, 35000, 1.22, 'eden'); },
                Plywood(offset){ return spaceCostMultiplier('bliss_den', offset, 10000000, 1.22, 'eden'); },
                Soul_Gem(offset){ return spaceCostMultiplier('bliss_den', offset, 10, 1.22, 'eden'); },
            },
            effect(){
                let morale = 8;
                let max = 2;

                let desc = `<div class="has-text-caution">${loc('space_used_support',[loc('eden_asphodel_name')])}</div>`;
                if (!global.race['joyless']){
                    desc += `<div>${loc('space_red_vr_center_effect1',[morale])}</div>`;
                }
                desc += `<div>${loc('space_red_vr_center_effect2',[max])}</div>`;

                return desc;
            },
            s_type: 'asphodel',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('bliss_den','eden');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['bliss_den','eden']
                };
            },
            flair(){
                return loc(`eden_bliss_den_flair`);
            }
        },
};

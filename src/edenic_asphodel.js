import { global, p_on, sizeApproximation } from './vars.js';
import { powerCostMod, spaceCostMultiplier, messageQueue, powerModifier } from './functions.js';
import { spatialReasoning } from './resources.js';
import { actions, payCosts, powerOnNewStruct, storageMultipler } from './actions.js';
import { incrementStruct, piracy } from './space.js';
import { jobScale, workerScale } from './jobs.js';
import { production, highPopAdjust } from './prod.js';
import { loc } from './locale.js';
import { govActive } from './governor.js';
import { traits, racialTrait } from './races.js';
import { edenicModules } from './edenic_registry.js';
import { renderEdenic } from './edenic_render.js';

// Region 'eden_asphodel' dari edenicModules (dipisah dari edenic.js). Urutan/isi entri sama persis; digabung di edenic.js.
export const edenAsphodel = {
        info: {
            name: loc('eden_asphodel_name'),
            desc(){ 
                if (global.tech['asphodel'] && global.tech.asphodel >= 5){
                    return `${loc('eden_asphodel_desc')} ${loc('eden_asphodel_desc_hostile')}`;
                }
                else {
                    return `${loc('eden_asphodel_desc')} ${loc('eden_asphodel_desc_peaceful')}`;
                }
            },
            support: 'encampment'
        },
        survery_meadows: {
            id: 'eden-survery_meadows',
            title(){
                return loc('eden_survery_meadows_title');
            },
            desc(){
                return $(this)[0].title();
            },
            reqs: { edenic: 3 },
            grant: ['edenic',4],
            queue_complete(){ return global.tech.edenic >= 4 ? 0 : 1; },
            cost: {
                Oil(offset,wiki){ return 10000000; }
            },
            effect(){
                return loc('eden_survery_meadows_effect');
            },
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('eden_survery_meadows_action'),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        encampment: {
            id: 'eden-encampment',
            title: loc('eden_encampment_title'),
            desc(){ return `<div>${loc('eden_encampment_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            reqs: { edenic: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('encampment', offset, 1590000000, 1.235, 'eden'); },
                Lumber(offset){ return spaceCostMultiplier('encampment', offset, 860000000, 1.235, 'eden'); },
                Iron(offset){ return spaceCostMultiplier('encampment', offset, 190000000, 1.235, 'eden'); },
                Coal(offset){ return spaceCostMultiplier('encampment', offset, 23500000, 1.235, 'eden'); },
            },
            effect(){
                let desc = `<div>${loc('eden_encampment_effect',[$(this)[0].support()])}</div>`;
                
                if (global.tech.hasOwnProperty('asphodel') && global.tech.asphodel >= 1){
                    let powder = spatialReasoning(250);
                    desc += `<div>${loc('plus_max_resource',[powder,global.resource.Asphodel_Powder.name])}</div>`;
                }
                if (p_on['ascension_trigger'] && global.eden.hasOwnProperty('encampment') && global.eden.encampment.asc){
                    let heatSink = actions.interstellar.int_sirius.ascension_trigger.heatSink();
                    heatSink = heatSink < 0 ? Math.abs(heatSink) : 0;
                    let omniscience = 150 + (heatSink ** 0.95 / 10);

                    desc += `<div>${loc('plus_max_resource',[+omniscience.toFixed(0),global.resource.Omniscience.name])}</div>`;
                }
                if (global.race['warlord'] && global.portal['mortuary'] && global.portal['corpse_pile'] && p_on['mortuary']){
                    let omniscience = global.portal.corpse_pile.count * p_on['mortuary'] * 2;
                    desc += `<div>${loc('plus_max_resource',[+omniscience.toFixed(0),global.resource.Omniscience.name])}</div>`;
                }

                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            support(){ return 8; },
            powered(){ return powerCostMod(616); },
            /*powerBalancer(){
                return [{ s: global.eden.encampment.s_max - global.eden.encampment.support }];
            },*/
            refresh: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('encampment','eden');
                    powerOnNewStruct($(this)[0]);
                    global['resource']['Asphodel_Powder'].max += spatialReasoning(250);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0, asc: false },
                    p: ['encampment','eden']
                };
            }
        },
        soul_engine: {
            id: 'eden-soul_engine',
            title(){ return loc('eden_soul_engine_title'); },
            desc(){ return `<div>${loc('eden_soul_engine_title')}</div><div class="has-text-special">${loc('space_support',[loc('eden_asphodel_name')])}</div>`; },
            reqs: { asphodel: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('soul_engine', offset, 98312500, 1.235, 'eden'); },
                Neutronium(offset){ return spaceCostMultiplier('soul_engine', offset, 4500000, 1.235, 'eden'); },
                Orichalcum(offset){ return spaceCostMultiplier('soul_engine', offset, 37500000, 1.235, 'eden'); },
                Asphodel_Powder(offset){ return spaceCostMultiplier('soul_engine', offset, 3450, 1.235, 'eden'); }
            },
            effect(){
                return `<div class="has-text-caution">${loc('space_used_support',[loc('eden_asphodel_name')])}</div><div>${loc('space_dwarf_reactor_effect1',[-($(this)[0].powered().toFixed(1))])}</div>`;
            },
            s_type: 'asphodel',
            support(){ return -1; },
            powered(){
                let power = -375;
                if (global.race['warlord'] && global.eden['corruptor'] && global.tech.asphodel >= 12){
                    power *= 1 + (p_on['corruptor'] || 0) * 0.06;
                }
                return powerModifier(power);
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('soul_engine','eden');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['soul_engine','eden']
                };
            }
        },
        mech_station: {
            id: 'eden-mech_station',
            title(){ return global.race['warlord'] ? loc('eden_demon_station_title') : loc('eden_mech_station_title'); },
            desc(wiki){
                if (!global.eden.hasOwnProperty('mech_station') || global.eden.mech_station.count < 10 || wiki){
                    return `<div>${global.race['warlord'] ? loc('eden_demon_station_title') : loc('eden_mech_station_title')}</div><div class="has-text-special">${loc('requires_segments',[10])}</div>`;
                }
                else {
                    return `<div>${global.race['warlord'] ? loc('eden_demon_station_title') : loc('eden_mech_station_title')}</div>`;
                }
            },
            reqs: { asphodel: 6 },
            queue_size: 1,
            queue_complete(){ return 10 - global.eden.mech_station.count; },
            cost: {
                Money(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('mech_station') ? global.eden.mech_station.count : 0) < 10 ? 6750000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('mech_station') || (global.eden.mech_station.count < 10) ? 6750000000 : 0;
                },
                Graphene(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('mech_station') ? global.eden.mech_station.count : 0) < 10 ? 82500000 : 0;
                    }
                    return !global.eden.hasOwnProperty('mech_station') || (global.eden.mech_station.count < 10) ? 82500000 : 0;
                },
                Infernite(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('mech_station') ? global.eden.mech_station.count : 0) < 10 ? 7500000 : 0;
                    }
                    return !global.eden.hasOwnProperty('mech_station') || (global.eden.mech_station.count < 10) ? 7500000 : 0;
                },
                Vitreloy(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('mech_station') ? global.eden.mech_station.count : 0) < 10 ? 66600000 : 0;
                    }
                    return !global.eden.hasOwnProperty('mech_station') || (global.eden.mech_station.count < 10) ? 66600000 : 0;
                },
                Asphodel_Powder(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('mech_station') ? global.eden.mech_station.count : 0) < 10 ? 7500 : 0;
                    }
                    return !global.eden.hasOwnProperty('mech_station') || (global.eden.mech_station.count < 10) ? 7500 : 0;
                },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.eden.hasOwnProperty('mech_station') ? global.eden.mech_station.count : 0);
                if (count >= 10){
                    let desc = `<div>${global.race['warlord'] ? loc('eden_demon_station_effect') : loc('eden_mech_station_effect')}</div>`;
                    desc += `<div>${global.race['warlord'] ? loc('eden_demon_station_mechs',[global.eden.mech_station.mechs]) : loc('eden_mech_station_mechs',[global.eden.mech_station.mechs])}</div>`;
                    desc += `<div>${loc('eden_mech_station_effective',[global.eden.mech_station.effect])}</div>`;
                    return desc;
                }
                else {
                    let size = 10;
                    let remain = size - count;
                    return `<div>${global.race['warlord'] ? loc('eden_demon_station_effect') : loc('eden_mech_station_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
            },
            special(){ return global.eden.hasOwnProperty('mech_station') && global.eden.mech_station.count === 10 ? true : false; },
            action(args){
                if (global.eden.mech_station.count < 10 && payCosts($(this)[0])){
                    incrementStruct('mech_station','eden');
                    if (global.eden.mech_station.count === 10){
                        renderEdenic();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, mode: 3, mechs: 0, effect: 0 },
                    p: ['mech_station','eden']
                };
            }
        },
        asphodel_harvester: {
            id: 'eden-asphodel_harvester',
            title(){ return loc('eden_asphodel_harvester_title'); },
            desc(){ return `<div>${loc('eden_asphodel_harvester_title')}</div><div class="has-text-special">${loc('space_support',[loc('eden_asphodel_name')])}</div>`; },
            reqs: { asphodel: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('asphodel_harvester', offset, 34280000, 1.24, 'eden'); },
                Aluminium(offset){ return spaceCostMultiplier('asphodel_harvester', offset, 22288800, 1.24, 'eden'); },
                Infernite(offset){ return spaceCostMultiplier('asphodel_harvester', offset, 666999, 1.24, 'eden'); },
                Soul_Gem(offset){ return spaceCostMultiplier('asphodel_harvester', offset, 2, 1.18, 'eden'); },
            },
            effect(){
                let powder = +(production('asphodel_harvester','powder')).toFixed(3);
                let desc = `<div class="has-text-caution">${loc('space_used_support',[loc('eden_asphodel_name')])}</div><div>${loc('produce',[powder, global.resource.Asphodel_Powder.name])}</div>`;

                if (global.tech['hell_spire'] && global.tech.hell_spire >= 11){
                    desc += `<div>${loc('eden_asphodel_harvester_upgrade',[2])}</div>`;
                }

                return desc;
            },
            s_type: 'asphodel',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('asphodel_harvester','eden');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['asphodel_harvester','eden']
                };
            }
        },
        ectoplasm_processor: {
            id: 'eden-ectoplasm_processor',
            title: loc('eden_ectoplasm_processor_title'),
            desc: `<div>${loc('eden_ectoplasm_processor_title')}</div><div class="has-text-special">${loc('space_support',[loc('eden_asphodel_name')])}</div>`,
            reqs: { asphodel: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('ectoplasm_processor', offset, 22650000, 1.24, 'eden'); },
                Titanium(offset){ return spaceCostMultiplier('ectoplasm_processor', offset, 15000000, 1.24, 'eden'); },
                Stanene(offset){ return spaceCostMultiplier('ectoplasm_processor', offset, 18000000, 1.24, 'eden'); },
                Asphodel_Powder(offset){ return spaceCostMultiplier('ectoplasm_processor', offset, 1000, 1.24, 'eden'); },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('space_used_support',[loc('eden_asphodel_name')])}</div>`;
                desc += `<div>${loc('plus_max_resource',[jobScale(5),loc(`job_ghost_trapper`)])}</div>`;
                return desc;
            },
            s_type: 'asphodel',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('ectoplasm_processor','eden');
                    powerOnNewStruct($(this)[0]);
                    global.civic.ghost_trapper.display = true;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['ectoplasm_processor','eden']
                };
            },
            flair(){ return loc('eden_ectoplasm_processor_flair'); }
        },
        research_station: {
            id: 'eden-research_station',
            title(){ return loc('eden_research_station_title'); },
            desc: `<div>${loc('eden_research_station_title')}</div><div class="has-text-special">${loc('space_support',[loc('eden_asphodel_name')])}</div>`,
            reqs: { asphodel: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('research_station', offset, 39185000, 1.24, 'eden'); },
                Cement(offset){ return spaceCostMultiplier('research_station', offset, 100000000, 1.24, 'eden'); },
                Asphodel_Powder(offset){ return spaceCostMultiplier('research_station', offset, 1250, 1.24, 'eden'); },
                Soul_Gem(offset){ return spaceCostMultiplier('research_station', offset, 10, 1.12, 'eden'); },
            },
            effect(){
                let attact = global.blood['attract'] ? global.blood.attract * 5 : 0;
                let souls = 200 + attact;
                if (global.tech['science'] && global.tech.science >= 22 && p_on['embassy'] && p_on['symposium']){
                    souls *= 1 + (p_on['symposium'] * piracy('gxy_gorddon'));
                }
                let desc = `<div class="has-text-caution">${loc('space_used_support',[loc('eden_asphodel_name')])}</div>`;
                desc += `<div>${loc('eden_research_station_effect',[highPopAdjust(souls).toFixed(0), loc('job_ghost_trapper')])}</div>`;
                if (global.tech['science'] && global.tech.science >= 22){
                    let boost = 1;
                    if (global.race['warlord'] && global.eden['corruptor']){
                        boost = 1 + (p_on['corruptor'] || 0) * 0.04;
                    }

                    desc += `<div>${loc('plus_max_resource',[Math.round(777 * boost),global.resource.Omniscience.name])}</div>`;

                    let ghost_base = workerScale(global.civic.ghost_trapper.workers,'ghost_trapper');
                    ghost_base *= racialTrait(ghost_base,'science');
                    ghost_base *= global.race['pompous'] ? (1 - traits.pompous.vars()[0] / 100) : 1;
                    ghost_base = highPopAdjust(ghost_base);
                    let ghost_gain = ghost_base * 0.0000325 * boost;
                    desc += `<div>${loc('gain',[+ghost_gain.toFixed(5),global.resource.Omniscience.name])}</div>`;
                }
                return desc;
            },
            s_type: 'asphodel',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('research_station','eden');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['research_station','eden']
                };
            }
        },
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
        rectory: {
            id: 'eden-rectory',
            title: loc('eden_rectory_title'),
            desc: `<div>${loc('eden_rectory_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { asphodel: 11 },
            not_trait: ['warlord'],
            cost: {
                Money(offset){ return spaceCostMultiplier('rectory', offset, 275000000, 1.24, 'eden'); },
                Copper(offset){ return spaceCostMultiplier('rectory', offset, 18200000, 1.24, 'eden'); },
                Brick(offset){ return spaceCostMultiplier('rectory', offset, 7500000, 1.24, 'eden'); },
                Soul_Gem(offset){ return spaceCostMultiplier('rectory', offset, 18, 1.24, 'eden'); },
            },
            effect(){
                let desc = `<div>${loc('eden_encampment_effect',[$(this)[0].support()])}</div>`;
                desc += `<div>${loc('plus_max_citizens',[$(this)[0].citizens()])}</div>`;
                if (global.genes['ancients'] && global.genes['ancients'] >= 4){
                    desc += `<div>${loc('plus_max_resource',[jobScale(1),global.civic?.priest?.name || loc(`job_priest`)])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            support(){ return 1; },
            powered(){ return powerCostMod(50); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('rectory','eden');
                    if (powerOnNewStruct($(this)[0])){
                        global['resource'][global.race.species].max += $(this)[0].citizens();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['rectory','eden']
                };
            },
            citizens(){
                let pop = 4;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
            },
            flair(){
                return loc(`eden_rectory_flair`);
            }
        },
        corruptor: {
            id: 'eden-corruptor',
            title: loc('eden_corruptor_title'),
            desc: `<div>${loc('eden_corruptor_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { asphodel: 11 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('corruptor', offset, 275000000, 1.24, 'eden'); },
                Furs(offset){ return spaceCostMultiplier('corruptor', offset, 17500000, 1.24, 'eden'); },
                Copper(offset){ return spaceCostMultiplier('corruptor', offset, 18200000, 1.24, 'eden'); },
                Soul_Gem(offset){ return spaceCostMultiplier('corruptor', offset, 8, 1.24, 'eden'); },
            },
            effect(){
                let elerium = sizeApproximation(spatialReasoning(200));
                let warehouse = global.tech?.asphodel >= 12 ? edenicModules.eden_asphodel.warehouse.title() : `${loc('wiki_tech_tree_asphodel')} ${edenicModules.eden_asphodel.warehouse.title()}`;

                let desc = `<div>${loc('eden_encampment_effect',[$(this)[0].support()])}</div>`;
                desc += `<div>${loc('eden_corruptor_effect',[4,edenicModules.eden_asphodel.research_station.title(),global.resource.Omniscience.name])}</div>`;
                desc += `<div>${loc('eden_corruptor_effect',[global.tech?.asphodel >= 12 ? (global.tech?.asphodel >= 13 ? 16 : 12) : 8,warehouse,loc('tab_storage')])}</div>`;
                if (global.tech?.asphodel >= 12){
                    desc += `<div>${loc('eden_corruptor_effect',[global.tech?.asphodel >= 13 ? 12 : 10,actions.portal.prtl_lake.harbor.title(),loc('tab_storage')])}</div>`;
                }
                desc += `<div>${loc('eden_corruptor_effect2',[5,edenicModules.eden_asphodel.stabilizer.title()])}</div>`;
                desc += `<div>${loc('production',[6,edenicModules.eden_asphodel.asphodel_harvester.title()])}</div>`;
                if (global.tech?.asphodel >= 12){
                    desc += `<div>${loc('eden_corruptor_effect',[8,edenicModules.eden_elysium.eternal_bank.title(),loc('resource_Money_name')])}</div>`;
                    desc += `<div>${loc('eden_corruptor_effect',[6,edenicModules.eden_asphodel.soul_engine.title(),loc('power')])}</div>`;
                }
                if (global.tech?.asphodel >= 13){
                    desc += `<div>${loc('eden_corruptor_effect2',[3,edenicModules.eden_isle.spirit_battery.title()])}</div>`;
                }
                desc += `<div>${loc('plus_max_resource',[elerium,global.resource.Elerium.name])}</div>`;
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            support(){ return 1; },
            powered(){ return powerCostMod(25); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('corruptor','eden');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['corruptor','eden']
                };
            }
        },
    };

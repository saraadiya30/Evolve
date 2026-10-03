import { loc } from '../../core/locale.js';
import { global, p_on } from '../../core/vars.js';
import { payCosts, actions, powerOnNewStruct } from '../../actions/actions.js';
import { messageQueue, spaceCostMultiplier, powerCostMod, powerModifier } from '../../functions/functions.js';
import { spatialReasoning } from '../../resources/resources.js';
import { incrementStruct, piracy } from '../../space/space.js';
import { renderEdenic } from '../edenic_render.js';
import { production, highPopAdjust } from '../../resources/prod.js';
import { jobScale, workerScale } from '../../civics/jobs.js';
import { racialTrait, traits } from '../../races/races.js';

// Bagian dari edenAsphodel (8 entri: info .. research_station), dipisah dari asphodel.js. Urutan entri sama persis.
export const edenAsphodelPart1 = {
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
};

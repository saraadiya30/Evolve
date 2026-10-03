import { loc } from '../core/locale.js';
import { global, support_on, spire_on } from '../core/vars.js';
import { popCost, messageQueue, spaceCostMultiplier, powerCostMod, clearPopper } from '../functions/functions.js';
import { payCosts, powerOnNewStruct, initStruct, drawTech, actions, bank_vault } from '../actions/actions.js';
import { incrementStruct } from '../space/space.js';
import { loadTab } from '../core/index.js';
import { defineGovernor } from '../governor/governor.js';
import { renderEdenic } from '../edenic/edenic.js';
import { spatialReasoning } from '../resources/resources.js';
import { fortressModules } from './portal_registry.js';
import { spireCreep, renderFortress, genSpireFloor, drawMechLab, updateMechbay, bossResists } from './portal.js';

// Region 'prtl_spire' dari fortressModules (dipisah dari portal.js). Isi sama persis; digabung via portal_registry.js di portal.js.
export const fortressModules_prtl_spire = {
        info: {
            name: loc('portal_spire_name'),
            desc: loc('portal_spire_desc'),
            support: 'purifier',
            prop(){
                let desc = ` - <span class="has-text-advanced">${loc('portal_spire_supply')}:</span> <span class="has-text-caution">{{ supply | filter }} / {{ sup_max | filter }}</span>`;
                return desc + ` (<span class="has-text-success">+{{ diff | filter(2) }}/s</span>)`;
            },
            filter(v,fix){
                let val = fix ? +(v).toFixed(fix) : Math.floor(v);
                return val.toLocaleString();
            }
        },
        spire_mission: {
            id: 'portal-spire_mission',
            title: loc('portal_spire_mission_title'),
            desc: loc('portal_spire_mission_title'),
            reqs: { hell_spire: 1 },
            grant: ['hell_spire',2],
            queue_complete(){ return global.tech.hell_spire >= 2 ? 0 : 1; },
            cost: {
                Species(){ return popCost(50); },
                Oil(){ return 900000; },
                Helium_3(){ return 750000; },
                Structs(){
                    return {
                        portal: {
                            bireme: { s: 'prtl_lake', count: 1, on: 1 },
                            transport: { s: 'prtl_lake', count: 1, on: 1 },
                        }
                    };
                }
            },
            effect: loc('portal_spire_mission_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('portal_spire_mission_result'),'info',false,['progress','hell']);
                    return true;
                }
                return false;
            },
            flair: loc('portal_spire_mission_flair'),
        },
        purifier: {
            id: 'portal-purifier',
            title(){ return global.race['warlord'] ? loc('portal_putrifier_title') : loc('portal_purifier_title'); },
            desc(){
                return `<div>${global.race['warlord'] ? loc('portal_putrifier_desc') : loc('portal_purifier_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_spire: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('purifier', offset, 85000000, spireCreep(1.15), 'portal'); },
                Supply(offset){ return global.portal['purifier'] && global.portal.purifier.count === 0 ? 100 : spaceCostMultiplier('purifier', offset, 4200, spireCreep(1.2), 'portal'); },
            },
            powered(){ return global.stats.achieve['what_is_best'] && global.stats.achieve.what_is_best.e >= 2 ? powerCostMod(100) : powerCostMod(125); },
            support(){
                let base = global.tech['b_stone'] && global.tech.b_stone >= 3 ? 1.25 : 1;
                if (global.tech['hell_spire'] && global.tech.hell_spire >= 11 && global.eden['asphodel_harvester'] && support_on['asphodel_harvester']){
                    base *= 1 + (support_on['asphodel_harvester'] / 50);
                }
                return +(base).toFixed(2);
            },
            effect(){
                return `<div>${loc('portal_purifier_effect',[$(this)[0].support()])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('purifier','portal');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0, supply: 0, sup_max: 100, diff: 0 },
                    p: ['purifier','portal']
                };
            },
        },
        port: {
            id: 'portal-port',
            title: loc('portal_port_title'),
            desc(){
                return `<div>${loc('portal_port_title')}</div><div class="has-text-special">${loc('portal_spire_support')}</div>`;
            },
            reqs: { hell_spire: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('port', offset, 135000000, spireCreep(1.2), 'portal'); },
                Supply(offset){ return global.portal.hasOwnProperty('port') && global.portal.port.count === 0 ? 100 : spaceCostMultiplier('port', offset, 6250, spireCreep(1.2), 'portal'); },
            },
            powered(){ return 0; },
            s_type: 'spire',
            support(){ return -1; },
            effect(wiki){
                let port_value = 10000;
                let num_base_camps_on = wiki ? (global.portal?.base_camp?.on ?? 0) : spire_on['base_camp'];
                if (num_base_camps_on > 0){
                    port_value *= 1 + (num_base_camps_on * 0.4);
                }
                return `<div class="has-text-caution">${loc('portal_port_effect1',[$(this)[0].support()])}</div><div>${loc('portal_port_effect2',[Math.round(port_value)])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('port','portal');
                    powerOnNewStruct($(this)[0]);
                    if (global.tech.hell_spire === 3){
                        global.tech.hell_spire = 4;
                        initStruct(fortressModules.prtl_spire.base_camp);
                        renderFortress();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['port','portal']
                };
            }
        },
        base_camp: {
            id: 'portal-base_camp',
            title: loc('portal_base_camp_title'),
            desc(){
                return `<div>${loc('portal_base_camp_title')}</div><div class="has-text-special">${loc('portal_spire_support')}</div>`;
            },
            reqs: { hell_spire: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('base_camp', offset, 425000000, spireCreep(1.2), 'portal'); },
                Supply(offset){ return spaceCostMultiplier('base_camp', offset, 50000, spireCreep(1.2), 'portal'); },
            },
            powered(){ return 0; },
            s_type: 'spire',
            support(){ return -1; },
            effect(){
                return `<div class="has-text-caution">${loc('portal_port_effect1',[$(this)[0].support()])}</div><div>${loc('portal_base_camp_effect',[40])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('base_camp','portal');
                    powerOnNewStruct($(this)[0]);
                    if (global.tech.hell_spire === 4){
                        global.tech.hell_spire = 5;
                        initStruct(fortressModules.prtl_spire.bridge);
                        messageQueue(loc('portal_spire_bridge_collapse'),'info',false,['progress','hell']);
                        renderFortress();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['base_camp','portal']
                };
            }
        },
        bridge: {
            id: 'portal-bridge',
            title: loc('portal_bridge_title'),
            desc(wiki){
                if (!global.portal.hasOwnProperty('bridge') || global.portal.bridge.count < 10 || wiki){
                    return `<div>${loc('portal_bridge_title')}</div><div class="has-text-special">${loc('requires_segments',[10])}</div>`;
                }
                else {
                    return `<div>${loc('portal_bridge_title')}</div>`;
                }
            },
            reqs: { hell_spire: 5 },
            not_trait: ['warlord'],
            queue_size: 1,
            queue_complete(){ return 10 - global.portal.bridge.count; },
            cost: {
                Species(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('bridge') ? global.portal.bridge.count : 0)) < 10 ? popCost(10) : 0; },
                Money(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('bridge') ? global.portal.bridge.count : 0)) < 10 ? 500000000 : 0; },
                Supply(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('bridge') ? global.portal.bridge.count : 0)) < 10 ? 100000 : 0; },
            },
            effect(wiki){
                let size = 10;
                let count = (wiki?.count ?? 0) + (global.portal.hasOwnProperty('bridge') ? global.portal.bridge.count : 0);
                if (count < size){
                    let remain = size - count;
                    return `<div>${loc('portal_bridge_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div><div class="has-text-caution">${loc('portal_bridge_effect2')}</div>`;
                }
                else {
                    return loc('portal_bridge_complete');
                }
            },
            action(args){
                if (global.portal.bridge.count < 10 && payCosts($(this)[0])){
                    incrementStruct('bridge','portal');
                    if (global.portal.bridge.count >= 10){
                        initStruct(fortressModules.prtl_spire.sphinx);
                        global.tech.hell_spire = 6;
                        renderFortress();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['bridge','portal']
                };
            }
        },
        sphinx: {
            id: 'portal-sphinx',
            title(){ return global.race['warlord'] ? loc('portal_sphinx_warlord') : (global.tech.hell_spire === 7 ? loc('portal_sphinx_solve') : loc('portal_sphinx_title')); },
            desc(){ return global.race['warlord'] ? loc('portal_sphinx_warlord_desc') : loc('portal_sphinx_desc'); },
            reqs: { hell_spire: 6 },
            queue_complete(){ return 8 - global.tech.hell_spire; },
            cost: {
                Knowledge(offset){
                    let count = (offset || 0) + (!global.tech['hell_spire'] || global.tech.hell_spire < 7 ? 0 : global.tech.hell_spire === 7 ? 1 : 2);
                    return count === 1 ? 50000000 : count === 0 ? 40000000 : 0;
                }
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (!global.tech['hell_spire'] || global.tech.hell_spire < 7 ? 0 : global.tech.hell_spire === 7 ? 1 : 2);
                if (count === 1){
                    return loc('portal_sphinx_effect2');
                }
                else if (count === 2){
                    return global.race['warlord'] ? loc('portal_sphinx_warlord_effect') :loc('portal_sphinx_effect3');
                }
                return loc('portal_sphinx_effect');
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.tech.hell_spire === 6){
                        global.tech.hell_spire = 7;
                        messageQueue(loc('portal_sphinx_msg'),'info',false,['progress','hell']);
                        renderFortress();
                        return true;
                    }
                    else if (global.tech.hell_spire === 7){
                        global.tech.hell_spire = 8;
                        renderFortress();
                        messageQueue(loc('portal_sphinx_answer_msg'),'info',false,['progress','hell']);  
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['sphinx','portal']
                };
            }
        },
        bribe_sphinx: {
            id: 'portal-bribe_sphinx',
            title: loc('portal_sphinx_bribe'),
            desc: loc('portal_sphinx_desc'),
            reqs: { hell_spire: 7 },
            not_trait: ['warlord'],
            condition(){
                return global.tech['hell_spire'] && global.tech.hell_spire === 7 && !global.tech['sphinx_bribe'] ? true : false;
            },
            cost: {
                Soul_Gem(){ return 250; },
                Supply(){ return 500000; }
            },
            effect(){
                return loc('portal_sphinx_bribe_effect');
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.tech.hell_spire === 7 && !global.tech['sphinx_bribe']){
                        global.tech['sphinx_bribe'] = 1;
                        global.resource.Codex.display = true;
                        global.resource.Codex.amount = 1;
                        messageQueue(loc('portal_sphinx_bribe_msg'),'info',false,['progress','hell']);                        
                        return true;
                    }
                }
                return false;
            },
            post(){
                if (global.tech['sphinx_bribe']){
                    drawTech();
                    renderFortress();
                    clearPopper('portal-bribe_sphinx');
                }
            }
        },
        spire_survey: {
            id: 'portal-spire_survey',
            title: loc('portal_spire_survey_title'),
            desc: loc('portal_spire_survey_title'),
            reqs: { hell_spire: 8 },
            grant: ['hell_spire',9],
            not_trait: ['warlord'],
            queue_complete(){ return global.tech.hell_spire >= 9 ? 0 : 1; },
            cost: {
                Oil(){ return 1200000; },
                Helium_3(){ return 900000; },
            },
            effect: loc('portal_spire_survey_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    initStruct(fortressModules.prtl_spire.mechbay);
                    initStruct(fortressModules.prtl_spire.spire);
                    genSpireFloor();
                    messageQueue(loc('portal_spire_survey_msg'),'info',false,['progress','hell']);
                    return true;
                }
                return false;
            },
            post(){
                if (global.tech['hell_spire'] && global.tech.hell_spire === 9){
                    renderFortress();
                    clearPopper('portal-spire_survey');
                }
            }
        },
        mechbay: {
            id: 'portal-mechbay',
            title(){ return global.race['warlord'] ? loc('portal_demon_artificer_title') : loc('portal_mechbay_title'); },
            desc(){
                return `<div>${$(this)[0].title()}</div><div class="has-text-special">${loc('portal_spire_support')}</div>`;
            },
            reqs: { hell_spire: 9 },
            cost: {
                Money(offset){ return spaceCostMultiplier('mechbay', offset, 100000000, 1.2, 'portal'); },
                Supply(offset){ return spaceCostMultiplier('mechbay', offset, 250000, 1.2, 'portal'); },
            },
            powered(){ return 0; },
            s_type: 'spire',
            support(){ return -1; },
            special: true,
            sAction(){
                global.settings.civTabs = 2;
                global.settings.govTabs = 4;
                if (!global.settings.tabLoad){
                    loadTab('mTabCivic');
                    clearPopper(`portal-mechbay`);
                }
            },
            effect(){
                let bay = global.portal.hasOwnProperty('mechbay') ? global.portal.mechbay.bay : 0;
                let max = global.portal.hasOwnProperty('mechbay') ? global.portal.mechbay.max : 0;
                return `<div class="has-text-caution">${loc('portal_port_effect1',[$(this)[0].support()])}</div><div>${loc(global.race['warlord'] ? 'portal_demon_artificer_effect' : 'portal_mechbay_effect')}</div><div>${loc('portal_mechbay_effect2',[bay,max])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('mechbay','portal');
                    if (powerOnNewStruct($(this)[0])){
                        global.portal.mechbay.max += 25;
                    }
                    global.settings.showMechLab = true;
                    if (global.portal.mechbay.count === 1){
                        messageQueue(loc('portal_mechbay_unlocked'),'info',false,['progress','hell']);
                        drawMechLab();
                        defineGovernor();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, bay: 0, max: 0, active: 0, scouts: 0, mechs: [] },
                    p: ['mechbay','portal']
                };
            },
            postPower(){
                updateMechbay();
            }
        },
        spire: {
            id: 'portal-spire',
            title: loc('portal_spire_title'),
            desc: loc('portal_spire_title'),
            reqs: { hell_spire: 9 },
            queue_complete(){ return 0; },
            cost: {},
            effect(){
                let floor = global.portal.hasOwnProperty('spire') ? global.portal.spire.count : 0;
                let terrain = global.portal.hasOwnProperty('spire') ? `<span class="has-text-warning">${loc(`portal_spire_type_${global.portal.spire.type}`)}</span>` : '?';
                let status = ``;
                if (global.portal.hasOwnProperty('spire') && Object.keys(global.portal.spire.status).length > 0){
                    status = `<div>${loc('portal_spire_hazard',[Object.keys(global.portal.spire.status).map(v => `<span class="has-text-warning">${loc(`portal_spire_status_${v}`)}</span>`).join(', ')])}</div>`;
                }
                let progress = global.portal.hasOwnProperty('spire') ? `<span class="has-text-warning">${+(global.portal.spire.progress).toFixed(3)}%</span>` : '0%';
                let leftSide = `<div>${loc('portal_spire_effect',[floor])}</div><div>${loc('portal_spire_type',[terrain])}</div>${status}<div>${loc('portal_spire_progress',[progress])}</div>`;
                
                let boss = global.portal.hasOwnProperty('spire') ? global.portal.spire.boss : 'crazed';
                let threat = `<div>${loc('portal_spire_mob',[`<span class="has-text-danger">${loc(`portal_mech_boss_${boss}`)}</span>`])}</div>`;

                let weak = `???`;
                let resist = `???`;
                if (global.stats['spire']){
                    let resists = bossResists(boss);
                    let level = $(this)[0].mscan();
                    if (level > 0){
                        weak = loc(`portal_mech_weapon_${resists.w}`);
                    }
                    if (level >= 5){
                        resist = loc(`portal_mech_weapon_${resists.r}`);
                    }
                }
                let rightSide = `<div>${threat}<div>${loc('portal_spire_mob_weak',[`<span class="has-text-warning">${weak}</span>`])}</div><div>${loc('portal_spire_mob_resist',[`<span class="has-text-warning">${resist}</span>`])}</div></div>`;

                return `<div class="split"><div>${leftSide}</div><div>${rightSide}</div></div>`;
            },
            mscan(){
                let level = 0;
                Object.keys(global.stats.spire).forEach(function(uni){
                    let boss = global.portal.hasOwnProperty('spire') ? global.portal.spire.boss : 'crazed';
                    if (global.stats.spire.hasOwnProperty(uni) && global.stats.spire[uni].hasOwnProperty(boss) && global.stats.spire[uni][boss] > level){
                        level = global.stats.spire[uni][boss];
                    }
                });
                return level;
            },
            wide: true,
            action(args){
                return false;
            },
            struct(){
                return {
                    d: { count: 1, progress: 0, boss: '', type: '', status: {} },
                    p: ['spire','portal']
                };
            },
        },
        waygate: {
            id: 'portal-waygate',
            title: loc('portal_waygate_title'),
            desc(wiki){
                if (!global.portal.hasOwnProperty('waygate') || (global.tech['waygate'] && global.tech.waygate < 2) || wiki){
                    return `<div>${loc('portal_waygate_title')}</div><div class="has-text-special">${loc('requires_segments',[10])}</div>`;
                }
                else {
                    return `<div>${loc('portal_waygate_title')}</div>`;
                }
            },
            reqs: { waygate: 1 },
            condition(){
                return global.tech['edenic'] && global.tech.edenic >= 2 ? false : true;
            },
            queue_size: 1,
            queue_complete(){ return global.tech.waygate >= 2 ? 0 : 10 - global.portal.waygate.count; },
            cost: {
                Species(offset){
                    if (offset){
                        return offset + (global.portal.hasOwnProperty('waygate') ? global.portal.waygate.count : 0) < 10 ? popCost(25) : 0;
                    }
                    return !global.portal.hasOwnProperty('waygate') || (global.tech['waygate'] && global.tech.waygate < 2) ? popCost(25) : 0;
                },
                Money(offset){
                    if (offset){
                        return offset + (global.portal.hasOwnProperty('waygate') ? global.portal.waygate.count : 0) < 10 ? 1000000000 : 0;
                    }
                    return !global.portal.hasOwnProperty('waygate') || (global.tech['waygate'] && global.tech.waygate < 2) ? 1000000000 : 0;
                },
                Supply(offset){
                    if (offset){
                        return offset + (global.portal.hasOwnProperty('waygate') ? global.portal.waygate.count : 0) < 10 ? 500000 : 0;
                    }
                    return !global.portal.hasOwnProperty('waygate') || (global.tech['waygate'] && global.tech.waygate < 2) ? 500000 : 0;
                },
                Blood_Stone(offset){
                    if (offset){
                        return offset + (global.portal.hasOwnProperty('waygate') ? global.portal.waygate.count : 0) < 10 ? 5 : 0;
                    }
                    return !global.portal.hasOwnProperty('waygate') || (global.tech['waygate'] && global.tech.waygate < 2) ?  5 : 0;
                },
            },
            powered(){
                return global.portal.hasOwnProperty('waygate') && global.portal.waygate.count >= 10 ? 1 : 0;
            },
            power_reqs: { waygate: 2 },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.tech['waygate'] && global.tech.waygate >= 2 ? 10 : global.portal.hasOwnProperty('waygate') ? global.portal.waygate.count : 0);
                if (count >= 10){
                    let progress = global.portal.hasOwnProperty('waygate') ? `<span class="has-text-warning">${+(global.portal.waygate.progress).toFixed(3)}%</span>` : '0%';
                    return `<div>${loc('portal_waygate_open')}</div><div>${loc('portal_waygate_progress',[progress])}</div>`;
                }
                else {
                    let size = 10;
                    let remain = size - count;
                    return `<div>${loc('portal_waygate_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
            },
            action(args){
                if (global.portal.waygate.count < 10 && global.tech['waygate'] && global.tech.waygate === 1 && payCosts($(this)[0])){
                    incrementStruct('waygate','portal');
                    if (global.portal.waygate.count >= 10){
                        global.tech.waygate = 2;
                        global.portal.waygate.count = 1;
                        if (global.settings.alwaysPower){
                            global.portal.waygate.on = 1;
                        }
                        renderFortress();
                        drawTech();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, progress: 0, on: 0 },
                    p: ['waygate','portal']
                };
            },
        },
        edenic_gate:{
            id: 'portal-edenic_gate',
            title(wiki){
                return loc(global.tech['edenic'] && global.tech.edenic >= 3 ? 'portal_edenic_gate_title' : 'portal_waygate_title');
            },
            desc(wiki){
                return $(this)[0].title();
            },
            reqs: { waygate: 3, edenic: 2 },
            queue_size: 1,
            queue_complete(){ return global.tech.edenic >= 3 ? 0 : 1; },
            cost: {
                Money(o){
                    return global.tech['edenic'] && global.tech.edenic < 3 ? 10000000000 : 0;
                },
                Supply(o){
                    return global.tech['edenic'] && global.tech.edenic < 3 ? 1000000 : 0;
                },
                Blessed_Essence(o){
                    return global.tech['edenic'] && global.tech.edenic < 3 ? 1 : 0;
                },
            },
            effect(wiki){
                if (global.tech['edenic'] && global.tech.edenic <= 2){
                    return `<div>${loc('portal_edenic_gate_effect')}</div>`;
                }
                else {
                    return `<div>${loc('portal_edenic_gate_effect_complete')}</div>`;
                }
            },
            action(args){
                if (global.tech['edenic'] && global.tech.edenic === 2 && payCosts($(this)[0])){
                    global.tech.edenic = 3;
                    global.settings.showEden = true;
                    global.settings.eden.asphodel = true;
                    global.settings.spaceTabs = 7;
                    global.resource.Blessed_Essence.display = false;
                    initStruct(actions.eden.eden_asphodel.encampment);
                    renderFortress();
                    renderEdenic();
                    return true;
                }
                return false;
            }
        },
        bazaar: {
            id: 'portal-bazaar',
            title: loc('portal_bazaar_title'),
            desc: loc('portal_bazaar_title'),
            reqs: { hellspawn: 8 },
            trait: ['warlord'],
            cost: {
                Money(offset){ return spaceCostMultiplier('bazaar', offset, 1000000000, 1.25, 'portal'); },
                Supply(offset){ return spaceCostMultiplier('bazaar', offset, 250000, 1.25, 'portal'); },
            },
            effect(wiki){
                let vault = spatialReasoning(bank_vault() * (global.portal?.spire?.count || 1) / 3);
                vault = +(vault).toFixed(0);
                let containers = (global.portal?.spire?.count || 1) * 8;
                let mon = (global.portal?.spire?.count || 1);

                let desc = `<div>${loc('plus_max_resource',[`\$${vault.toLocaleString()}`,loc('resource_Money_name')])}</div>`;
                desc += `<div>${loc('city_tourist_center_effect2',[mon,loc(`arpa_project_monument_title`)])}</div>`;
                desc += `<div>${loc('plus_max_resource',[containers,global.resource.Crates.name])}</div><div>${loc('plus_max_resource',[containers,global.resource.Containers.name])}</div>`;
                desc += `<div>${loc('city_trade_effect',[(global.portal?.spire?.count || 1)])}</div>`;

                return desc;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('bazaar','portal');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['bazaar','portal']
                };
            },
        },
    };

import { loc } from './locale.js';
import { global, sizeApproximation } from './vars.js';
import { powerCostMod, spaceCostMultiplier } from './functions.js';
import { payCosts, powerOnNewStruct, initStruct, actions, drawTech } from './actions.js';
import { incrementStruct } from './space.js';
import { traits } from './races.js';
import { alevel } from './achieve.js';
import { loadFoundry } from './jobs.js';
import { rankDesc, checkSkillPointAssignments, renderFortress } from './portal.js';

// Region 'prtl_badlands' dari fortressModules (dipisah dari portal.js). Isi sama persis; digabung via portal_registry.js di portal.js.
export const fortressModules_prtl_badlands = {
        info: {
            name: loc('portal_badlands_name'),
            desc: loc('portal_badlands_desc'),
            support: 'minions',
            hide_support: true,
            prop(){
                let desc = '';
                if (global.portal['minions'] && global.portal.minions.count > 0){
                    desc = ` <span class="has-text-danger">${loc('portal_minions_bd')}:</span> <span class="has-text-caution">{{ spawns | approx }}</span>`;
                }
                return desc;
            },
            filter(v,type){
                switch (type){
                    case 'approx':
                        return sizeApproximation(v);
                }
            }
        },
        war_drone: {
            id: 'portal-war_drone',
            title: loc('portal_war_drone_title'),
            desc(){
                return `<div>${loc('portal_war_drone_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { portal: 3 },
            not_trait: ['warlord'],
            powered(){ return powerCostMod(5); },
            cost: {
                Money(offset){ return spaceCostMultiplier('war_drone', offset, 650000, 1.28, 'portal'); },
                Alloy(offset){ return spaceCostMultiplier('war_drone', offset, 60000, 1.28, 'portal'); },
                Graphene(offset){ return spaceCostMultiplier('war_drone', offset, 100000, 1.28, 'portal'); },
                Elerium(offset){ return spaceCostMultiplier('war_drone', offset, 25, 1.28, 'portal'); },
                Soul_Gem(offset){ return spaceCostMultiplier('war_drone', offset, 1, 1.28, 'portal'); }
            },
            effect(){
                return `<div>${loc('portal_war_drone_effect')}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('war_drone','portal');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['war_drone','portal']
                };
            },
            flair: loc('portal_war_drone_flair')
        },
        sensor_drone: {
            id: 'portal-sensor_drone',
            title: loc('portal_sensor_drone_title'),
            desc(){
                return `<div>${loc('portal_sensor_drone_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { infernite: 2 },
            not_trait: ['warlord'],
            powered(){ return powerCostMod(3); },
            cost: {
                Money(offset){ return spaceCostMultiplier('sensor_drone', offset, 500000, 1.25, 'portal'); },
                Polymer(offset){ return spaceCostMultiplier('sensor_drone', offset, 25000, 1.25, 'portal'); },
                Adamantite(offset){ return spaceCostMultiplier('sensor_drone', offset, 12500, 1.25, 'portal'); },
                Infernite(offset){ return spaceCostMultiplier('sensor_drone', offset, 100, 1.25, 'portal'); }
            },
            effect(){
                let bonus = global.tech.infernite >= 4 ? (global.tech.infernite >= 6 ? 50 : 20) : 10;
                let know = global.tech.infernite >= 6 ? 2500 : 1000;
                let sci_bonus = global.race['cataclysm'] ? `<div>${loc('space_moon_observatory_cata_effect',[2])}</div>` : `<div>${loc('space_moon_observatory_effect',[2])}</div><div>${loc('portal_sensor_drone_effect2',[2])}</div>`;
                let sci = global.tech['science'] >= 14 ? `<div>${loc('city_max_knowledge',[know])}</div>${sci_bonus}` : '';
                return `<div>${loc('portal_sensor_drone_effect',[bonus])}</div>${sci}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('sensor_drone','portal');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['sensor_drone','portal']
                };
            }
        },
        attractor: {
            id: 'portal-attractor',
            title: loc('portal_attractor_title'),
            desc(){
                return `<div>${loc('portal_attractor_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { portal: 4 },
            not_trait: ['warlord'],
            powered(){ return powerCostMod(3); },
            cost: {
                Money(offset){ return spaceCostMultiplier('attractor', offset, 350000, 1.25, 'portal'); },
                Aluminium(offset){ return spaceCostMultiplier('attractor', offset, 175000, 1.25, 'portal'); },
                Stanene(offset){ return spaceCostMultiplier('attractor', offset, 90000, 1.25, 'portal'); },
            },
            effect(){
                return `<div>${loc('portal_attractor_effect1')}</div><div>${loc('portal_attractor_effect2',[global.resource.Soul_Gem.name])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('attractor','portal');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['attractor','portal']
                };
            }
        },
        minions: {
            id: 'portal-minions',
            title: loc('portal_minions_title'),
            desc(){ return rankDesc(loc('portal_minions_title'),'minions'); },
            reqs: { hellspawn: 3 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('minions', offset, 150000, 1.22, 'portal'); },
                Furs(offset){ return spaceCostMultiplier('minions', offset, 35000, 1.22, 'portal'); },
                Infernite(offset){ return spaceCostMultiplier('minions', offset, 500, 1.22, 'portal'); },
                Orichalcum(offset){ return spaceCostMultiplier('minions', offset, 25000, 1.22, 'portal'); },
            },
            powered(){ return 0; },
            effect(){
                let troops = $(this)[0].soldiers();
                let low_troops = troops - 10;
                if (global.race['infectious']){
                    troops += traits.infectious.vars()[1];
                    low_troops += traits.infectious.vars()[0];
                }
                let desc = `<div>${loc('portal_minions_effect',[low_troops,troops])}</div>`;
                desc += `<div>${loc('plus_max_resource',[1,global.resource.Authority.name])}</div>`;
                return desc;
            },
            action(args){
                if (!args.isQueue && global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.minions.rank < 5){
                    global.portal.throne.points--;
                    global.portal.minions.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('minions','portal');
                    global.portal.minions.on++;
                    if (global.portal.minions.count === 1){
                        renderFortress();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, spawns: 0, rank: 1 },
                    p: ['minions','portal']
                };
            },
            soldiers(){
                let absorb = (global.race?.absorbed?.length || 1);
                return 20 + absorb + (global.portal.minions?.rank || 1);
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.minions?.rank < 5){
                    return 'blue';
                }
                return false;
            },
            flair(){ return loc('portal_minions_flair'); }
        },
        reaper: {
            id: 'portal-reaper',
            title: loc('portal_reaper_title'),
            desc(){ return rankDesc(loc('portal_reaper_title'),'reaper'); },
            reqs: { hellspawn: 4 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('reaper', offset, 1200000, 1.2, 'portal'); },
                Furs(offset){ return spaceCostMultiplier('reaper', offset, 118000, 1.2, 'portal'); },
                Iron(offset){ return spaceCostMultiplier('reaper', offset, 340000, 1.2, 'portal'); },
                Soul_Gem(offset){ return spaceCostMultiplier('reaper', offset, 1, 1.1, 'portal'); },
            },
            effect(){
                let desc = `<div>${loc('portal_reaper_effect')}</div>`;
                return desc;
            },
            action(args){
                if (!args.isQueue && global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.reaper.rank < 5){
                    global.portal.throne.points--;
                    global.portal.reaper.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('reaper','portal');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, rank: 1 },
                    p: ['reaper','portal']
                };
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.reaper?.rank < 5){
                    return 'blue';
                }
                return false;
            }
        },
        corpse_pile: {
            id: 'portal-corpse_pile',
            title: loc('portal_corpse_pile_title'),
            desc(){ return rankDesc(loc('portal_corpse_pile_desc'),'corpse_pile'); },
            reqs: { hellspawn: 7 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('corpse_pile', offset, 2500000, 1.25, 'portal'); },
                Lumber(offset){ return spaceCostMultiplier('corpse_pile', offset, 2420000, 1.25, 'portal'); },
                Furs(offset){ return spaceCostMultiplier('corpse_pile', offset, 1563000, 1.25, 'portal'); },
            },
            effect(){
                let power = 0.75 + (global.portal?.corpse_pile?.rank || 1) * 0.25;
                let desc = `<div>${loc('portal_corpse_pile_effect',[power,loc('portal_incinerator_title')])}</div>`;
                return desc;
            },
            action(args){
                if (!args.isQueue && global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.corpse_pile.rank < 5){
                    global.portal.throne.points--;
                    global.portal.corpse_pile.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('corpse_pile','portal');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, rank: 1 },
                    p: ['corpse_pile','portal']
                };
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.corpse_pile?.rank < 5){
                    return 'blue';
                }
                return false;
            }
        },
        mortuary: {
            id: 'portal-mortuary',
            title: loc('portal_mortuary_title'),
            desc(){ return `<div>${loc('portal_mortuary_desc',[loc('portal_corpse_pile_title')])}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            reqs: { hellspawn: 9 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('mortuary', offset, 1010101010, 1.25, 'portal'); },
                Alloy(offset){ return spaceCostMultiplier('mortuary', offset, 56565656, 1.25, 'portal'); },
                Scarletite(offset){ return spaceCostMultiplier('mortuary', offset, 4545450, 1.25, 'portal'); },
            },
            powered(){ return powerCostMod(10); },
            effect(){
                let omniscience = (global.portal?.corpse_pile?.count || 0) * 2;
                let desc = `<div>${loc(`eden_ascension_machine_effect1`,[loc(`eden_encampment_title`),+omniscience.toFixed(0),global.resource.Omniscience.name])}</div>`;

                let ghost = (global.portal?.corpse_pile?.count || 0) / 8;
                desc += `<div>${loc(`eden_ascension_machine_effect2`,[loc(`job_ghost_trapper`),+ghost.toFixed(2)])}</div>`;

                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('mortuary','portal');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['mortuary','portal']
                };
            }
        },
        codex: {
            id: 'portal-codex',
            title: loc('portal_codex_title'),
            desc: loc('portal_codex_title'),
            reqs: { war_vault: 1 },
            trait: ['warlord'],
            condition(){ return global.portal?.codex?.count === 0 ? true : false; },
            wiki: global.race['warlord'] ? true : false,
            queue_complete(){ 
                if (global.portal.codex.s >= 10 && global.portal.minions.spawns >= 2500){
                    return 1 - global.portal.codex.count; 
                }
                else {
                    return 0;
                }
            },
            cost: {
                Money(o){ return 100000000; },
                Furs(o){ return 35000000; },
            },
            effect(){
                let desc = `<div>${loc('portal_codex_effect',[])}</div>`;
                desc += `<div class="has-text-${global.resource.Money.amount >= $(this)[0].cost.Money() ? 'success' : 'danger'}">${loc('portal_codex_money',[sizeApproximation(global.resource.Money.amount),sizeApproximation($(this)[0].cost.Money())])}</div>`;
                desc += `<div class="has-text-${global.resource.Furs.amount >= $(this)[0].cost.Furs() ? 'success' : 'danger'}">${loc('portal_codex_res',[sizeApproximation(global.resource.Furs.amount),sizeApproximation($(this)[0].cost.Furs()),global.resource.Furs.name])}</div>`;
                desc += `<div class="has-text-${global.portal.minions?.spawns >= 3000 ? 'success' : 'danger'}">${loc('portal_codex_res',[(global.portal.minions?.spawns || 0),3000,loc('portal_codex_demon')])}</div>`;
                desc += `<div class="has-text-${global.portal.codex?.s >= 10 ? 'success' : 'danger'}">${loc('portal_codex_res',[(global.portal.codex?.s || 0),10,loc('portal_codex_sac')])}</div>`;
                return desc;
            },
            action(args){
                if (global.portal.minions.spawns >= 3000 && global.portal.codex.s >= 10 && global.portal.codex.count === 0 && payCosts($(this)[0])){
                    global.portal.minions.spawns -= 3000;
                    global.resource.Codex.amount = 1;
                    global.resource.Codex.display = true;
                    global.tech['scarletite'] = 1;
                    global.tech['hell_ruins'] = 4;
                    global.resource.Scarletite.display = true;
                    initStruct(actions.portal.prtl_ruins.hell_forge);
                    if (global.race.universe !== 'micro' && !global.pillars[global.race.species]){
                        global.tech['fusable'] = 1;
                    }
                    else {
                        if (global.race.universe !== 'micro'){
                            let rank = alevel();
                            if (rank > global.pillars[global.race.species]){
                                global.pillars[global.race.species] = rank;
                            }
                        }
                        global.tech['pillars'] = 2;
                    }
                    incrementStruct('codex','portal');
                    loadFoundry();
                    drawTech();
                    renderFortress();
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, s: 0 },
                    p: ['codex','portal']
                };
            }
        },
    };

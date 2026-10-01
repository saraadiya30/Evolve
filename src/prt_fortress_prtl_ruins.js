import { loc } from './locale.js';
import { global, p_on } from './vars.js';
import { payCosts, initStruct, powerOnNewStruct, drawTech, bank_vault } from './actions.js';
import { messageQueue, spaceCostMultiplier, powerCostMod, vBind, clearPopper, get_qlevel, powerModifier, calcPillar } from './functions.js';
import { traits, fathomCheck, traitCostMod, races } from './races.js';
import { armyRating } from './civics.js';
import { jobScale, loadFoundry, limitCraftsmen } from './jobs.js';
import { incrementStruct } from './space.js';
import { spatialReasoning, unlockContainers } from './resources.js';
import { addSmelter } from './industry.js';
import { alevel, unlockAchieve } from './achieve.js';
import { fortressModules } from './portal_registry.js';
import { hellSupression, soulForgeSoldiers, renderFortress, checkWarlordAchieve, towerSize } from './portal.js';

// Region 'prtl_ruins' dari fortressModules (dipisah dari portal.js). Isi sama persis; digabung via portal_registry.js di portal.js.
export const fortressModules_prtl_ruins = {
        info: {
            name: loc('portal_ruins_name'),
            desc: loc('portal_ruins_desc'),
            support: 'guard_post',
            prop(){
                if (global.race['warlord']){ return ''; }
                let desc = ` - <span class="has-text-advanced">${loc('portal_ruins_security')}:</span> <span class="has-text-caution">{{ on | filter('army') }}</span>`;
                desc = desc + ` - <span class="has-text-advanced">${loc('portal_ruins_supressed')}:</span> <span class="has-text-caution">{{ on | filter('sup') }}</span>`;
                return desc;
            },
            filter(v,type){
                let sup = hellSupression('ruins');
                switch (type){
                    case 'army':
                        return Math.round(sup.rating);
                    case 'sup':
                        let supress = +(sup.supress * 100).toFixed(2);
                        return `${supress}%`;
                }
            }
        },
        ruins_mission: {
            id: 'portal-ruins_mission',
            title: loc('portal_ruins_mission_title'),
            desc: loc('portal_ruins_mission_title'),
            reqs: { hell_ruins: 1 },
            grant: ['hell_ruins',2],
            queue_complete(){ return global.tech.hell_ruins >= 2 ? 0 : 1; },
            cost: {
                Money(){ return 100000000; },
                Oil(){ return 500000; },
                Helium_3(){ return 500000; }
            },
            effect: loc('portal_ruins_mission_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('portal_ruins_mission_result'),'info',false,['progress','hell']);
                    global.portal['stonehedge'] = { count: 0 };
                    initStruct(fortressModules.prtl_ruins.vault);
                    initStruct(fortressModules.prtl_ruins.archaeology);
                    return true;
                }
                return false;
            }
        },
        guard_post: {
            id: 'portal-guard_post',
            title: loc('portal_guard_post_title'),
            desc(){
                return `<div>${loc('portal_guard_post_title')}</div><div class="has-text-special">${loc('requires_soldiers')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_ruins: 2 },
            not_trait: ['warlord'],
            cost: {
                Money(offset){ return spaceCostMultiplier('guard_post', offset, 8000000, 1.06, 'portal'); },
                Lumber(offset){ return spaceCostMultiplier('guard_post', offset, 6500000, 1.06, 'portal'); },
                Sheet_Metal(offset){ return spaceCostMultiplier('guard_post', offset, 300000, 1.06, 'portal'); },
            },
            powered(){ return powerCostMod(5); },
            support(){ return 1; },
            effect(){
                let holy = global.race['holy'] ? 1 + (traits.holy.vars()[1] / 100) : 1;
                let unicornFathom = fathomCheck('unicorn');
                if (unicornFathom > 0){
                    holy *= 1 + (traits.holy.vars(1)[1] / 100 * unicornFathom);
                }
                let rating = Math.round(holy * armyRating(jobScale(1),'hellArmy',0));
                return `<div>${loc('portal_guard_post_effect1',[rating])}</div><div class="has-text-caution">${loc('portal_guard_post_effect2',[jobScale(1),$(this)[0].powered()])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('guard_post','portal');

                    let army = global.portal.fortress.garrison - (global.portal.fortress.patrols * global.portal.fortress.patrol_size);
                    if (p_on['soul_forge']){
                        let forge = soulForgeSoldiers();
                        if (forge <= army){
                            army -= forge;
                        }
                    }
                    if (army >= jobScale(global.portal.guard_post.on + 1)){
                        // Don't power on unless there are enough guards
                        powerOnNewStruct($(this)[0]);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['guard_post','portal']
                };
            },
            postPower(){
                vBind({el: `#srprtl_ruins`},'update');
                vBind({el: `#srprtl_gate`},'update');
            }
        },
        vault: {
            id: 'portal-vault',
            title: loc('portal_vault_title'),
            desc: loc('portal_vault_title'),
            reqs: { hell_ruins: 2, hell_vault: 1 },
            not_trait: ['warlord'],
            wiki: global.race['warlord'] ? false : true,
            condition(){
                return global.portal.vault.count >= 2 ? false : true;
            },
            queue_complete(){ return 2 - global.portal.vault.count; },
            cost: {
                Soul_Gem(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('vault') ? global.portal.vault.count : 0)) === 0 ? 100 : 0; },
                Money(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('vault') ? global.portal.vault.count : 0)) === 1 ? 250000000 : 0; },
                Adamantite(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('vault') ? global.portal.vault.count : 0)) === 1 ? 12500000 : 0; },
                Orichalcum(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('vault') ? global.portal.vault.count : 0)) === 1 ? 30000000 : 0; },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.portal.hasOwnProperty('vault') ? global.portal.vault.count : 0);
                return count < 1 ? loc('portal_vault_effect',[100]) : loc('portal_vault_effect2'); },
            action(args){
                if (global.portal.vault.count < 2 && payCosts($(this)[0])){
                    incrementStruct('vault','portal');
                    if (global.portal.vault.count === 2){
                        global.tech.hell_ruins = 3;
                        global.resource.Codex.display = true;
                        global.resource.Codex.amount = 1;
                        messageQueue(loc('portal_vault_result'),'info',false,['progress','hell']);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['vault','portal']
                };
            },
            post(){
                if (global.portal.vault.count === 2){
                    drawTech();
                    renderFortress();
                    clearPopper();
                }
            }
        },
        war_vault: {
            id: 'portal-war_vault',
            title: loc('portal_vault_title'),
            desc: loc('portal_vault_title'),
            reqs: { hell_ruins: 2, war_vault: 1 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            queue_complete(){ return 1 - global.portal.war_vault.count; },
            cost: {
                Codex(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('war_vault') ? global.portal.war_vault.count : 0)) === 0 ? 1 : 0; },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.portal.hasOwnProperty('war_vault') ? global.portal.war_vault.count : 0);
                return count < 1 ? loc('portal_war_vault_effect',[100,global.resource.Soul_Gem.name]) : loc('portal_war_vault_effect2'); },
            action(args){
                if (global.portal.war_vault.count < 1){
                    if (payCosts($(this)[0])){
                        incrementStruct('war_vault','portal');
                        if (global.portal.war_vault.count === 1){
                            global.resource.Codex.display = false;
                            global.resource.Soul_Gem.amount += 100;
                            messageQueue(loc('portal_war_vault_result',[global.resource.Soul_Gem.name]),'info',false,['progress','hell']);
                        }
                        return true;
                    }
                    else {
                        messageQueue(loc('portal_war_vault_fail',[global.resource.Soul_Gem.name]),'info',false,['progress','hell']);
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['war_vault','portal']
                };
            },
            post(){
                if (global.portal.war_vault.count === 2){
                    drawTech();
                    renderFortress();
                    clearPopper();
                }
            }
        },
        archaeology: {
            id: 'portal-archaeology',
            title: loc('portal_archaeology_title'),
            desc(){
                return `<div>${loc('portal_archaeology_title')}</div><div class="has-text-special">${loc('requires_security')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_ruins: 2 },
            not_trait: ['warlord'],
            cost: {
                Money(offset){ return spaceCostMultiplier('archaeology', offset, 100000000, 1.25, 'portal'); },
                Titanium(offset){ return spaceCostMultiplier('archaeology', offset, 3750000, 1.25, 'portal'); },
                Mythril(offset){ return spaceCostMultiplier('archaeology', offset, 1250000, 1.25, 'portal'); },
            },
            powered(){ return powerCostMod(8); },
            effect(){
                return `<div>${loc('portal_archaeology_effect',[jobScale(2)])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('archaeology','portal');
                    global.civic.archaeologist.display = true;
                    if (powerOnNewStruct($(this)[0])){
                        let hiredMax = jobScale(2);
                        global.civic.archaeologist.max += hiredMax;

                        let hired = Math.min(hiredMax, global.civic[global.civic.d_job].workers);
                        global.civic[global.civic.d_job].workers -= hired;
                        global.civic.archaeologist.workers += hired;
                    }  
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['archaeology','portal']
                };
            },
        },
        arcology: {
            id: 'portal-arcology',
            title: loc('portal_arcology_title'),
            desc(){
                return `<div>${loc('portal_arcology_title')}</div><div class="has-text-special">${loc('requires_security')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { housing: 4 },
            not_trait: ['warlord'],
            cost: {
                Money(offset){ return spaceCostMultiplier('arcology', offset, traitCostMod('untrustworthy',180000000), 1.22, 'portal'); },
                Graphene(offset){ return spaceCostMultiplier('arcology', offset, traitCostMod('untrustworthy',7500000), 1.22, 'portal'); },
                Bolognium(offset){ return spaceCostMultiplier('arcology', offset, traitCostMod('untrustworthy',2800000), 1.22, 'portal'); },
                Orichalcum(offset){ return spaceCostMultiplier('arcology', offset, traitCostMod('untrustworthy',5500000), 1.22, 'portal'); },
                Nanoweave(offset){ return spaceCostMultiplier('arcology', offset, traitCostMod('untrustworthy',650000), 1.22, 'portal'); },
                Horseshoe(){ return global.race['hooved'] ? 13 : 0; }
            },
            powered(){ return powerCostMod(25); },
            effect(wiki){
                let sup = hellSupression('ruins', 0, wiki);
                let vault = spatialReasoning(bank_vault() * 8 * sup.supress);
                vault = +(vault).toFixed(0);
                let containers = Math.round(get_qlevel(wiki)) * 10;
                let container_string = `<div>${loc('plus_max_resource',[containers,global.resource.Crates.name])}</div><div>${loc('plus_max_resource',[containers,global.resource.Containers.name])}</div>`;
                return `<div>${loc('plus_max_resource',[`\$${vault.toLocaleString()}`,loc('resource_Money_name')])}</div><div>${loc('plus_max_citizens',[$(this)[0].citizens()])}</div><div>${loc('plus_max_resource',[$(this)[0].soldiers(),loc('civics_garrison_soldiers')])}</div><div>${loc('portal_guard_post_effect1',[75])}</div>${container_string}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('arcology','portal');

                    if (powerOnNewStruct($(this)[0])){
                        global['resource'][global.race.species].max += 8;
                    }
                    if (!global.resource.Containers.display){
                        unlockContainers();
                    }
                    return true;
                }
                return false;
            },
            postPower(){
                vBind({el: `#srprtl_ruins`},'update');
                vBind({el: `#srprtl_gate`},'update');
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['arcology','portal']
                };
            },
            soldiers(){
                let soldiers = global.race['grenadier'] ? 3 : 5;
                return jobScale(soldiers);
            },
            citizens(){
                return jobScale(8);
            }
        },
        hell_forge: {
            id: 'portal-hell_forge',
            title(){ return loc('portal_hell_forge_title'); },
            desc(){
                return `<div>${loc('portal_hell_forge_title')}</div><div class="has-text-special">${loc('requires_security')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { scarletite: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('hell_forge', offset, 250000000, 1.15, 'portal'); },
                Coal(offset){ return spaceCostMultiplier('hell_forge', offset, 1650000, 1.22, 'portal'); },
                Steel(offset){ return spaceCostMultiplier('hell_forge', offset, 3800000, 1.22, 'portal'); },
                Iridium(offset){ return spaceCostMultiplier('hell_forge', offset, 1200000, 1.22, 'portal'); },
                Neutronium(offset){ return spaceCostMultiplier('hell_forge', offset, 280000, 1.22, 'portal'); },
                Soul_Gem(offset){ return spaceCostMultiplier('hell_forge', offset, 5, 1.22, 'portal'); },
            },
            powered(){ return powerCostMod(12); },
            smelting(){
                return 3;
            },
            special: true,
            effect(wiki){
                let sup = hellSupression('ruins', 0, wiki);
                let craft = +(75 * sup.supress).toFixed(1);
                let reactor = global.tech['inferno_power'] ? `<div>${loc('portal_hell_forge_effect2',[global.stats.achieve['what_is_best'] && global.stats.achieve.what_is_best.e >= 1 ? 12 : 10,loc(`portal_inferno_power_title`)])}</div>` : ``;
                return `<div>${loc('portal_hell_forge_effect',[jobScale(1)])}</div>${reactor}<div>${loc('interstellar_stellar_forge_effect3',[$(this)[0].smelting()])}</div><div>${loc('interstellar_stellar_forge_effect',[craft])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('hell_forge','portal');
                    if (powerOnNewStruct($(this)[0])){
                        addSmelter($(this)[0].smelting());
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['hell_forge','portal']
                };
            },
            post(){
                loadFoundry();
            },
            postPower(on){
                limitCraftsmen('Scarletite');
            }
        },
        inferno_power: {
            id: 'portal-inferno_power',
            title: loc('portal_inferno_power_title'),
            desc(){
                return `<div>${loc('portal_inferno_power_title')}</div>`;
            },
            reqs: { inferno_power: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('inferno_power', offset, 275000000, 1.16, 'portal'); },
                Neutronium(offset){ return spaceCostMultiplier('inferno_power', offset, 3750000, 1.18, 'portal'); },
                Stanene(offset){ return spaceCostMultiplier('inferno_power', offset, 12000000, 1.18, 'portal'); },
                Bolognium(offset){ return spaceCostMultiplier('inferno_power', offset, 8000000, 1.18, 'portal'); },
            },
            powered(wiki){
                let power = 20;
                let infernal_forges_on = wiki ? (global.portal?.hell_forge?.on ?? 0) : p_on['hell_forge'];
                if (infernal_forges_on){
                    power += infernal_forges_on * (global.stats.achieve['what_is_best'] && global.stats.achieve.what_is_best.e >= 1 ? 12 : 10); 
                }
                return powerModifier(-(power));
            },
            fuel: {
                Infernite: 5,
                Coal: 100,
                Oil: 80
            },
            effect(wiki){
                let fuel = $(this)[0].fuel;
                return `<div>${loc('space_dwarf_reactor_effect1',[-($(this)[0].powered(wiki))])}</div><div class="has-text-caution">${loc('portal_inferno_power_effect',[fuel.Infernite,global.resource.Infernite.name,fuel.Coal,global.resource.Coal.name,fuel.Oil,global.resource.Oil.name])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('inferno_power','portal');
                    global.portal.inferno_power.on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['inferno_power','portal']
                };
            },
            post(){
                vBind({el: `#foundry`},'update');
            },
        },
        ancient_pillars: {
            id: 'portal-ancient_pillars',
            title: loc('portal_ancient_pillars_title'),
            desc: loc('portal_ancient_pillars_desc'),
            reqs: { hell_ruins: 2 },
            queue_complete(){ return global.tech['pillars'] && global.tech.pillars === 1 && global.race.universe !== 'micro' ? 1 : 0; },
            cost: {
                Harmony(offset,wiki){
                    if (offset !== undefined){
                        return offset + Object.keys(global.pillars).length < Object.keys(races).length - 1 ? 1 : 0;
                    }
                    return global.race.universe !== 'micro' && global.tech['pillars'] && global.tech.pillars === 1 ? 1 : 0;
                },
                Scarletite(offset,wiki){
                    if (offset !== undefined){
                        let pillars = offset + Object.keys(global.pillars).length;
                        return pillars < Object.keys(races).length - 1 ? pillars * 125000 + 1000000 : 0;
                    }
                    return global.race.universe !== 'micro' && global.tech['pillars'] && global.tech.pillars === 1 ? Object.keys(global.pillars).length * 125000 + 1000000 : 0;
                },
            },
            count(){
                return Object.keys(races).length - 1;
            },
            on(){
                return Object.keys(global.pillars).length;
            },
            effect(wiki){
                let pillars = (wiki?.count ?? 0) + Object.keys(global.pillars).length;
                if (pillars >= 1){
                    return `<div>${loc('portal_ancient_pillars_effect2',[Object.keys(races).length - 1,pillars])}</div>`;
                }
                else {
                    return `<div>${loc('portal_ancient_pillars_effect',[Object.keys(races).length - 1])}</div>`;
                }
            },
            action(args){
                if (global.tech['pillars'] && global.tech.pillars === 1 && global.race.universe !== 'micro'){
                    if (payCosts($(this)[0])){
                        global.pillars[global.race.species] = alevel();
                        global.tech.pillars = 2;
                        spatialReasoning(0,false,true);
                        calcPillar(true);
                        if (global.race['warlord']){
                            global.stats.warlord.p = true;
                            checkWarlordAchieve();
                        }
                        else if (global.tech?.hell_gate >= 2){
                            towerSize(true);
                            fortressModules.prtl_gate.west_tower.post(); //unlock towers if both are complete now
                            fortressModules.prtl_gate.east_tower.post();
                        }
                        unlockAchieve('resonance');
                        vBind({el: `#portal-ancient_pillars`},'update');
                        return true;
                    }
                }
                return false;
            }
        },
    };

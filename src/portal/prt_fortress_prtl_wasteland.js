import { loc } from '../core/locale.js';
import { global, sizeApproximation, p_on } from '../core/vars.js';
import { shrineBonusActive, getShrineBonus, spaceCostMultiplier, powerModifier, powerCostMod } from '../functions/functions.js';
import { govActive } from '../governor/governor.js';
import { traits, races, traitCostMod } from '../races/races.js';
import { absorbRace, initStruct, drawTech, payCosts, powerOnNewStruct, storageMultipler, structName, casinoEffect, buildTemplate } from '../actions/actions.js';
import { garrisonSize } from '../civics/civics.js';
import { incrementStruct } from '../space/space.js';
import { spatialReasoning } from '../resources/resources.js';
import { jobScale, jobName } from '../civics/jobs.js';
import { addSmelter, defineIndustry } from '../industry/industry.js';
import { production } from '../resources/prod.js';
import { fortressModules } from './portal_registry.js';
import { checkSkillPointAssignments, genSpireFloor, checkWarlordAchieve, soulForgeSoldiers, renderFortress, rankDesc } from './portal.js';

// Region 'prtl_wasteland' dari fortressModules (dipisah dari portal.js). Isi sama persis; digabung via portal_registry.js di portal.js.
export const fortressModules_prtl_wasteland = {
        info: {
            name: loc('portal_wasteland_name'),
            desc: loc('portal_wasteland_desc'),
        },
        throne: {
            id: 'portal-throne',
            title: loc('portal_throne_of_evil_title'),
            desc: loc('portal_throne_of_evil_desc'),
            reqs: { hellspawn: 1 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {},
            queue_complete(){ return 0; },
            wide: true,
            class: 'w30',
            effect(wiki){
                let knowCap = (global.race?.absorbed?.length || 1) * 500000;
                if (shrineBonusActive()){
                    let shrineBonus = getShrineBonus('know');
                    knowCap *= shrineBonus.mult;
                }
                let desc = `<div>${loc('plus_max_resource',[sizeApproximation(knowCap),global.resource.Knowledge.name])}</div>`;

                let muckVal2 = govActive('muckraker',2);
                let know = muckVal2 ? (5 - muckVal2) : 5;
                if (global.race['autoignition']){
                    know -= traits.autoignition.vars()[0];
                    if (know < 0){ know = 0; }
                }
                desc += `<div>${loc('city_library_effect',[Math.round((global.race?.absorbed?.length || 1) * 10 * know)])}</div>`;
                desc += `<div>${loc('plus_res_duo',[500,global.resource.Crates.name,global.resource.Containers.name])}</div>`;
                desc += `<div>${loc('plus_max_resource',[(global.race?.absorbed?.length || 1),global.resource.Authority.name])}</div>`;

                if (global.race['absorbed']){
                    let essense = global.race.absorbed.map(r => races[r].name).join(', ');
                    desc += `<div>${loc('portal_throne_of_evil_effect',[essense])}</div>`;
                }
                
                if (global.portal['throne'] && global.portal.throne.hearts.length > 0){
                    let hearts = global.portal.throne.hearts.map(r => races[r].name).join(', ');
                    desc += `<div class="has-text-success">${loc('portal_throne_of_evil_capture',[hearts])}</div>`;
                    desc += `<div class="has-text-danger">${loc('portal_throne_of_evil_capture2',[races[global.portal.throne.hearts[0]].name])}</div>`;
                }
                else if (global.portal.throne.points > 0 && checkSkillPointAssignments() > 0){
                    if (global.portal.throne.skill){
                        desc += `<div class="has-text-info">${loc('portal_throne_of_evil_skill2')} ${loc('portal_throne_of_evil_skill',[global.portal.throne.points])}</div>`;
                    }
                    else {
                        desc += `<div class="has-text-info">${loc('portal_throne_of_evil_skill1')} ${loc('portal_throne_of_evil_skill',[global.portal.throne.points])}</div>`;
                    }
                }

                return desc;
            },
            action(args){
                if (global.portal['throne'] && global.portal.throne.hearts.length === 0 && global.portal.throne.points > 0){
                    global.portal.throne.skill = global.portal.throne.skill ? false : true;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (global.portal['throne'] && global.portal.throne.hearts.length > 0){
                    let redraw = false;
                    let heart = global.portal.throne.hearts[0];
                    if (!global.race.absorbed.includes(heart)){
                        global.portal.throne.points++;
                    }
                    absorbRace(heart);
                    global.portal.throne.hearts.splice(0,1);
                    if (global.portal.throne.hearts.length === 0){
                        $(`#portal-throne .orange`).removeClass('orange');
                    }
                    if (['mantis','unicorn','capybara'].includes(heart)){
                        redraw = true;
                    }
                    if (!global.settings.portal.pit){
                        global.settings.portal.pit = true;
                        global.tech['hell_pit'] = 5;
                        redraw = true;
                    }
                    else if (!global.tech['war_vault'] && global.race?.absorbed?.length >= 13){
                        global.tech['hell_ruins'] = 2;
                        global.tech['war_vault'] = 1;
                        global.settings.portal.ruins = true;
                        initStruct(fortressModules.prtl_ruins.war_vault);
                        initStruct(fortressModules.prtl_badlands.codex);
                        redraw = true;
                    }
                    else if (global.tech['war_vault'] && global.portal['codex'] && global.portal.codex.s < 10){
                        global.portal.codex.s++;
                    }
                    else if (!global.settings.portal.lake && global.race?.absorbed?.length >= 33){
                        global.tech['hell_lake'] = 6;
                        global.tech['hell_spire'] = 9;
                        global.settings.portal.lake = true;
                        global.settings.portal.spire = true;
                        global.settings.showCargo = true;
                        initStruct(fortressModules.prtl_lake.harbor);
                        initStruct(fortressModules.prtl_lake.cooling_tower);
                        initStruct(fortressModules.prtl_lake.bireme);
                        initStruct(fortressModules.prtl_lake.transport);
                        initStruct(fortressModules.prtl_spire.purifier);
                        initStruct(fortressModules.prtl_spire.port);
                        initStruct(fortressModules.prtl_spire.base_camp);
                        initStruct(fortressModules.prtl_spire.mechbay);
                        initStruct(fortressModules.prtl_spire.spire);
                        genSpireFloor();
                        redraw = true;
                    }
                    else if (global.race?.absorbed?.length >= 43 && global.tech.hellspawn === 4){
                        global.tech.hellspawn = 5;
                        redraw = true;
                    }
                    if (global.race?.absorbed?.length >= 53){
                        global.stats.warlord.k = true;
                        checkWarlordAchieve();
                    }
                    if (p_on['soul_forge']){
                        let troops = garrisonSize(false,{no_forge: true});
                        let forge = soulForgeSoldiers();
                        if (forge <= troops){
                            global.portal.soul_forge.kills += 250000;
                        }
                    }
                    if (redraw){
                        renderFortress();
                        drawTech();
                    }
                    return true;
                }
                return false;
            },
            aura(){
                if (global.portal['throne'] && global.portal.throne.hearts.length > 0){
                    return 'orange';
                }
                else if (global.portal['throne'] && global.portal.throne.skill){
                    return 'green';
                }
                return false;
            },
            struct(){
                return {
                    d: { enemy: [], hearts: [], spawned: [], points: 1, skill: false },
                    p: ['throne','portal']
                };
            },
        },
        incinerator: {
            id: 'portal-incinerator',
            title: loc('portal_incinerator_title'),
            desc(){ return rankDesc(loc('portal_incinerator_desc'),'incinerator'); },
            reqs: { hellspawn: 1 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('incinerator', offset, 220000, 1.3, 'portal'); },
                Coal(offset){ return spaceCostMultiplier('incinerator', offset, 80000, 1.3, 'portal'); },
                Neutronium(offset){ return spaceCostMultiplier('incinerator', offset, 5000, 1.3, 'portal'); },
                Infernite(offset){ return spaceCostMultiplier('incinerator', offset, 4000, 1.3, 'portal'); },
            },
            powered(wiki){
                let power = 22.5 + (global.portal?.incinerator?.rank || 1) * 2.5;
                if (global.race['forge']){
                    power += traits.forge.vars()[0] * 5;
                }
                if (global.tech['hellspawn'] && global.tech.hellspawn >= 6){
                    power += (global.portal?.incinerator?.rank || 1) * 2.5;
                }
                if (global.tech['hellspawn'] && global.tech.hellspawn >= 7 && global.portal['corpse_pile']){
                    power += (0.75 + global.portal.corpse_pile.rank * 0.25) * global.portal.corpse_pile.count;
                }
                return powerModifier(-(power));
            },
            effect(wiki){
                let desc = `<div>${loc('space_dwarf_reactor_effect1',[-($(this)[0].powered(wiki))])}</div>`;
                if ((global.portal?.incinerator?.rank || 1) > 1){
                    let rank = global.portal.incinerator.rank - 1;
                    desc += `<div>${loc('portal_incinerator_effect',[15 * rank,loc('portal_twisted_lab_title'),global.resource.Graphene.name])}</div>`;
                }
                return desc;
            },
            action(args){
                if (!args.isQueue && global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.incinerator.rank < 5){
                    global.portal.throne.points--;
                    global.portal.incinerator.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('incinerator','portal');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, rank: 1 },
                    p: ['incinerator','portal']
                };
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.incinerator?.rank < 5){
                    return 'blue';
                }
                return false;
            },
            flair: loc('portal_incinerator_flair')
        },
        warehouse: {
            id: 'portal-warehouse',
            title(){ return loc('city_shed_title3'); },
            desc(){ return rankDesc(loc('city_shed_title3'),'warehouse'); },
            reqs: { hellspawn: 1 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('warehouse', offset, 175000, 1.28, 'portal'); },
                Lumber(offset){ return spaceCostMultiplier('warehouse', offset, 300000, 1.28, 'portal'); },
                Aluminium(offset){ return spaceCostMultiplier('warehouse', offset, 180000, 1.28, 'portal'); },
                Cement(offset){ return spaceCostMultiplier('warehouse', offset, 95000, 1.28, 'portal'); }
            },
            res(){
                let r_list = [
                    'Lumber','Stone','Chrysotile','Furs','Copper','Iron','Aluminium','Steel','Titanium',
                    'Cement','Coal','Uranium','Alloy','Polymer','Iridium','Nano_Tube','Neutronium',
                    'Adamantite','Infernite','Bolognium','Orichalcum','Graphene','Stanene','Oil','Helium_3'
                ];
                return r_list;
            },
            val(res){
                switch (res){
                    case 'Lumber':
                        return 650 + (global.portal?.warehouse?.rank || 1) * 100;
                    case 'Stone':
                        return 650 + (global.portal?.warehouse?.rank || 1) * 100;
                    case 'Chrysotile':
                        return 700 + (global.portal?.warehouse?.rank || 1) * 50;
                    case 'Furs':
                        return 400 + (global.portal?.warehouse?.rank || 1) * 25;
                    case 'Copper':
                        return 330 + (global.portal?.warehouse?.rank || 1) * 50;
                    case 'Iron':
                        return 320 + (global.portal?.warehouse?.rank || 1) * 30;
                    case 'Aluminium':
                        return 290 + (global.portal?.warehouse?.rank || 1) * 30;
                    case 'Cement':
                        return 260 + (global.portal?.warehouse?.rank || 1) * 20;
                    case 'Coal':
                        return 135 + (global.portal?.warehouse?.rank || 1) * 15;
                    case 'Steel':
                        return 52 + (global.portal?.warehouse?.rank || 1) * 8;
                    case 'Titanium':
                        return 32 + (global.portal?.warehouse?.rank || 1) * 8;
                    case 'Uranium':
                        return global.portal?.warehouse?.rank || 1;
                    case 'Alloy':
                        return 31 + (global.portal?.warehouse?.rank || 1) * 4;
                    case 'Polymer':
                        return 31 + (global.portal?.warehouse?.rank || 1) * 4;
                    case 'Iridium':
                        return 28 + (global.portal?.warehouse?.rank || 1) * 4;
                    case 'Nano_Tube':
                        return 50 + (global.portal?.warehouse?.rank || 1) * 18;
                    case 'Neutronium':
                        return 12 + (global.portal?.warehouse?.rank || 1) * 4;
                    case 'Adamantite':
                        return 15 + (global.portal?.warehouse?.rank || 1) * 3;
                    case 'Infernite':
                        return 3 + global.portal?.warehouse?.rank || 1;
                    case 'Bolognium':
                        return 6 + global.portal?.warehouse?.rank || 3;
                    case 'Orichalcum':
                        return 8 + global.portal?.warehouse?.rank || 4;
                    case 'Graphene':
                        return 14 + global.portal?.warehouse?.rank || 3;
                    case 'Stanene':
                        return 14 + global.portal?.warehouse?.rank || 3;
                    case 'Oil':
                        return 18 + global.portal?.warehouse?.rank || 2;
                    case 'Helium_3':
                        return 17 + global.portal?.warehouse?.rank || 2;
                    default:
                        return 0;
                }
            },
            wide: true,
            effect(wiki){
                let storage = '<div class="aTable">';
                let multiplier = storageMultipler(1, wiki);
                if (global.race['warlord'] && global.eden['corruptor'] && global.tech.asphodel >= 12){
                    multiplier *= 1 + (p_on['corruptor'] || 0) * (global.tech.asphodel >= 13 ? 0.16 : 0.12);
                }
                for (const res of $(this)[0].res()){
                    if (global.resource[res].display){
                        let val = sizeApproximation(+(spatialReasoning($(this)[0].val(res)) * multiplier).toFixed(0),1);
                        storage += `<span>${loc('plus_max_resource',[val,global.resource[res].name])}</span>`;
                    }
                };
                storage += `<span>${loc('plus_max_resource',[65 + (global.portal?.warehouse?.rank || 1) * 35, global.resource.Crates.name])}</span>`;
                storage += `<span>${loc('plus_max_resource',[65 + (global.portal?.warehouse?.rank || 1) * 35, global.resource.Containers.name])}</span>`;
                storage += '</div>';
                return storage;
            },
            action(args){
                if (!args.isQueue && global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.warehouse.rank < 5){
                    global.portal.throne.points--;
                    global.portal.warehouse.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('warehouse','portal');
                    let multiplier = storageMultipler();
                    if (global.race['warlord'] && global.eden['corruptor'] && global.tech.asphodel >= 12){
                        multiplier *= 1 + (p_on['corruptor'] || 0) * (global.tech.asphodel >= 13 ? 0.16 : 0.12);
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
                    d: { count: 0, rank: 1 },
                    p: ['warehouse','portal']
                };
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.warehouse?.rank < 5){
                    return 'blue';
                }
                return false;
            }
        },
        hovel: {
            id: 'portal-hovel',
            title: loc('portal_hovel_title'),
            desc(){ return rankDesc(loc('portal_hovel_title'),'hovel'); },
            reqs: { hellspawn: 1 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('hovel', offset, 145000, 1.3, 'portal'); },
                Stone(offset){ return spaceCostMultiplier('hovel', offset, 185000, 1.3, 'portal'); },
                Furs(offset){ return spaceCostMultiplier('hovel', offset, 66600, 1.3, 'portal'); },
            },
            effect(){
                let pop = $(this)[0].citizens();
                return global.race['sappy'] ? `<div>${loc('plus_max_resource',[pop,loc('citizen')])}</div><div>${loc('city_grove_effect',[2.5])}</div>` : loc('plus_max_resource',[pop,loc('citizen')]);
            },
            action(args){
                if (!args.isQueue && global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.hovel.rank < 5){
                    global.portal.throne.points--;
                    global.portal.hovel.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('hovel','portal');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, rank: 1 },
                    p: ['hovel','portal']
                };
            },
            citizens(){
                let pop = 18 + (global.portal?.hovel?.rank || 1) * 2;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.hovel?.rank < 5){
                    return 'blue';
                }
                return false;
            }
        },
        hell_casino: {
            id: 'portal-hell_casino',
            title(){ return structName('casino'); },
            desc(){ return `<div>${rankDesc(structName('casino'),'hell_casino')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            reqs: { hellspawn: 1, gambling: 1 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('hell_casino', offset, traitCostMod('untrustworthy',400000), 1.3, 'portal'); },
                Furs(offset){ return spaceCostMultiplier('hell_casino', offset, traitCostMod('untrustworthy',175000), 1.3, 'portal'); },
                Stone(offset){ return spaceCostMultiplier('hell_casino', offset, traitCostMod('untrustworthy',350000), 1.3, 'portal'); },
                Plywood(offset){ return spaceCostMultiplier('hell_casino', offset, traitCostMod('untrustworthy',65000), 1.3, 'portal'); }
            },
            effect(){
                let desc = casinoEffect();
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 2 ? 2 : 3); },
            action(args){
                if (!args.isQueue && global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.hell_casino.rank < 5){
                    global.portal.throne.points--;
                    global.portal.hell_casino.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('hell_casino','portal');
                    if (global.tech['theatre'] && !global.race['joyless']){
                        global.civic.entertainer.max += jobScale(3);
                        global.civic.entertainer.display = true;
                    }
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, rank: 1 },
                    p: ['hell_casino','portal']
                };
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.hell_casino?.rank < 5){
                    return 'blue';
                }
                return false;
            },
            flair: loc('portal_casino_flair')
        },
        twisted_lab: {
            id: 'portal-twisted_lab',
            title: loc('portal_twisted_lab_title'),
            desc(){ return `<div>${rankDesc(loc('portal_twisted_lab_title'),'twisted_lab')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            reqs: { hellspawn: 1, science: 9 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('twisted_lab', offset, 350000, 1.3, 'portal'); },
                Knowledge(offset){ return spaceCostMultiplier('twisted_lab', offset, 69000, 1.3, 'portal'); },
                Copper(offset){ return spaceCostMultiplier('twisted_lab', offset, 375000, 1.3, 'portal'); },
                Polymer(offset){ return spaceCostMultiplier('twisted_lab', offset, 289000, 1.3, 'portal'); },
                Graphene(offset){ return spaceCostMultiplier('twisted_lab', offset, 230000, 1.3, 'portal'); }
            },
            effect(){
                let baseVal = 6000 + (global.portal?.twisted_lab?.rank || 1) * 2000;
                let know = global.race['absorbed'] ? global.race.absorbed.length * baseVal : baseVal;
                if (global.tech['supercollider']){
                    let ratio = global.tech['tp_particles'] || (global.tech['particles'] && global.tech['particles'] >= 3) ? 12.5: 25;
                    know *= (global.tech['supercollider'] / ratio) + 1;
                }
                let desc = `<div>${loc('plus_max_resource',[(+know.toFixed(0)).toLocaleString(),global.resource.Knowledge.name])}</div>`;
                desc += `<div>${loc('city_university_effect',[jobScale(3)])}</div>`;
                desc += `<div>${loc('plus_max_resource',[jobScale(2),jobName('scientist')])}</div>`;
                desc += `<div>${loc('interstellar_g_factory_effect')}</div>`;
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return 4; },
            special: true,
            action(args){
                if (!args.isQueue && global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.twisted_lab.rank < 5){
                    global.portal.throne.points--;
                    global.portal.twisted_lab.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('twisted_lab','portal');
                    if (powerOnNewStruct($(this)[0])){
                        global.portal.twisted_lab.Coal++;
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, Lumber: 0, Coal: 0, Oil: 0, rank: 1 },
                    p: ['twisted_lab','portal']
                };
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.twisted_lab?.rank < 5){
                    return 'blue';
                }
                return false;
            },
            flair(){ return loc('portal_twisted_lab_flair'); }
        },
        demon_forge: {
            id: 'portal-demon_forge',
            title: loc('portal_demon_forge_title'),
            desc(){ return `<div>${rankDesc(loc('portal_demon_forge_title'),'demon_forge')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            reqs: { hellspawn: 1 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('demon_forge', offset, 480000, 1.3, 'portal'); },
                Iridium(offset){ return spaceCostMultiplier('demon_forge', offset, 265000, 1.3, 'portal'); },
                Iron(offset){ return spaceCostMultiplier('demon_forge', offset, 535000, 1.3, 'portal'); },
                Sheet_Metal(offset){ return spaceCostMultiplier('demon_forge', offset, 155000, 1.3, 'portal'); },
            },
            effect(){
                let desc = `<div>${loc('city_foundry_effect1',[jobScale($(this)[0].crafters())])}</div><div>${loc('interstellar_stellar_forge_effect',[$(this)[0].crafting()])}</div>`;
                let num_smelters = $(this)[0].smelting();
                if (num_smelters > 0){
                    desc += `<div>${loc('interstellar_stellar_forge_effect3',[num_smelters])}</div>`;
                }
                return `${desc}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(3); },
            special: true,
            smelting(){
                return 4 + (global.portal?.demon_forge?.rank || 1) * 4;
            },
            crafting(){
                return 20 + (global.portal?.demon_forge?.rank || 1) * 12;
            },
            crafters(){
                return 5 + (global.portal?.demon_forge?.rank || 1);
            },
            action(args){
                if (!args.isQueue && global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.demon_forge.rank < 5){
                    global.portal.throne.points--;
                    global.portal.demon_forge.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('demon_forge','portal');
                    if (powerOnNewStruct($(this)[0])){
                        global.civic.craftsman.max += jobScale(10);
                        let num_smelters = $(this)[0].smelting();
                        if (num_smelters > 0){
                            addSmelter(Math.floor(num_smelters / 2), 'Iron', 'Coal');
                            addSmelter(Math.floor(num_smelters / 2), 'Steel', 'Coal');
                        }
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, rank: 1 },
                    p: ['demon_forge','portal']
                };
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.demon_forge?.rank < 5){
                    return 'blue';
                }
                return false;
            }
        },
        hell_factory: {
            id: 'portal-hell_factory',
            title: loc('portal_factory_title'),
            desc(){ return `<div>${rankDesc(loc('portal_factory_title'),'hell_factory')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            reqs: { hellspawn: 1 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('hell_factory', offset, 720000, 1.3, 'portal'); },
                Titanium(offset){ return spaceCostMultiplier('hell_factory', offset, 550000, 1.3, 'portal'); },
                Nano_Tube(offset){ return spaceCostMultiplier('hell_factory', offset, 55000, 1.3, 'portal'); },
                Stanene(offset){ return spaceCostMultiplier('hell_factory', offset, 375000, 1.3, 'portal'); }
            },
            effect(){
                let desc = `<div>${loc('portal_factory_effect',[$(this)[0].lines()])}</div><div>${loc('city_crafted_mats',[25])}</div>`;
                desc += `<div>${loc('plus_max_resource',[jobScale(5),jobName('cement_worker')])}</div>`;
                if ((global.portal?.hell_factory?.rank || 1) > 1){
                    desc += `<div>${loc('production',[(global.portal?.hell_factory?.rank || 1) * 8 - 8,global.resource.Cement.name])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(5); },
            special: true,
            action(args){
                if (!args.isQueue && global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.hell_factory.rank < 5){
                    global.portal.throne.points--;
                    global.portal.hell_factory.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('hell_factory','portal');
                    if (powerOnNewStruct($(this)[0])){
                        global.city.factory.Alloy += $(this)[0].lines();
                        defineIndustry();
                    }
                    return true;
                }
                return false;
            },
            lines(){
                return 3 + (global.portal?.hell_factory?.rank || 1);
            },
            struct(){
                return {
                    d: { count: 0, on: 0, rank: 1 },
                    p: ['hell_factory','portal']
                };
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.hell_factory?.rank < 5){
                    return 'blue';
                }
                return false;
            },
            flair(){ return loc(`portal_factory_flair`); }
        },
        pumpjack: {
            id: 'portal-pumpjack',
            title(){ return loc('portal_pumpjack_title'); },
            desc(){ return rankDesc(loc('portal_pumpjack_title'),'pumpjack'); },
            reqs: { hellspawn: 1, oil: 1 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('pumpjack', offset, 295000, 1.3, 'portal'); },
                Cement(offset){ return spaceCostMultiplier('pumpjack', offset, 185000, 1.3, 'portal'); },
                Steel(offset){ return spaceCostMultiplier('pumpjack', offset, 275000, 1.3, 'portal'); }
            },
            effect(){
                let oil = +(production('oil_well')).toFixed(2);
                let oc = spatialReasoning(500);
                let desc = `<div>${loc('plus_res_combo',[oil,oc,global.resource.Oil.name])}</div>`;

                let storage = spatialReasoning(250);
                let values = production('helium_mine');
                let helium = +(values.b).toFixed(3);
                desc += `<div>${loc('plus_res_combo',[helium,storage,global.resource.Helium_3.name])}</div>`;

                if (global.race['blubber'] && global.portal.hasOwnProperty('pumpjack')){
                    let maxDead = global.portal.pumpjack.count;
                    desc += `<div>${loc('city_oil_well_bodies',[+(global.city.oil_well.dead).toFixed(1),50 * maxDead])}</div>`;
                    desc += `<div>${loc('city_oil_well_consume',[traits.blubber.vars()[0]])}</div>`;
                }
                return desc;
            },
            action(args){
                if (!args.isQueue && global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.pumpjack.rank < 5){
                    global.portal.throne.points--;
                    global.portal.pumpjack.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('pumpjack','portal');
                    global['resource']['Oil'].max += spatialReasoning(500);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, dead: 0, rank: 1 },
                    p: ['pumpjack','portal']
                };
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.pumpjack?.rank < 5){
                    return 'blue';
                }
                return false;
            },
            flair: loc('portal_pumpjack_flair')
        },
        dig_demon: {
            id: 'portal-dig_demon',
            title: loc('portal_dig_demon_title'),
            desc(){ return rankDesc(loc('portal_dig_demon_title'),'dig_demon'); },
            reqs: { hellspawn: 1 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('dig_demon', offset, 315000, 1.3, 'portal'); },
                Adamantite(offset){ return spaceCostMultiplier('dig_demon', offset, 188000, 1.3, 'portal'); },
                Wrought_Iron(offset){ return spaceCostMultiplier('dig_demon', offset, 150000, 1.3, 'portal'); },
            },
            powered(){ return true; },
            effect(wiki){
                let pop = $(this)[0].citizens();
                return loc('plus_resource',[pop,jobName('miner')]);
            },
            action(args){
                if (!args.isQueue && global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.dig_demon.rank < 5){
                    global.portal.throne.points--;
                    global.portal.dig_demon.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('dig_demon','portal');
                    if (powerOnNewStruct($(this)[0])){
                        let count = $(this)[0].citizens();
                        global.resource[global.race.species].max += count;
                        global.resource[global.race.species].amount += count;
                        global.civic.miner.max += count;
                        global.civic.miner.workers += count;
                        global.civic.miner.assigned += count;
                    }
                    return true;
                }
                return false;
            },
            postPower(o){
                const prev_count = global.civic.miner.max;
                const new_count = $(this)[0].citizens() * global.portal.dig_demon.on;
                const delta = new_count - prev_count;
                global.resource[global.race.species].max = Math.max(0, global.resource[global.race.species].max + delta);
                global.resource[global.race.species].amount = Math.max(0, global.resource[global.race.species].amount + delta);
                global.civic.miner.max = new_count;
                global.civic.miner.workers = new_count;
                global.civic.miner.assigned = new_count;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, rank: 1 },
                    p: ['dig_demon','portal']
                };
            },
            citizens(){
                let pop = 15 + (global.portal?.dig_demon?.rank || 1);
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.dig_demon?.rank < 5){
                    return 'blue';
                }
                return false;
            }
        },
        tunneler: {
            id: 'portal-tunneler',
            title: loc('portal_tunneler_title'),
            desc(){ return rankDesc(loc('portal_tunneler_desc'),'tunneler'); },
            reqs: { hellspawn: 2 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('tunneler', offset, 275000, 1.3, 'portal'); },
                Food(offset){ return spaceCostMultiplier('tunneler', offset, 135000, 1.3, 'portal'); },
                Uranium(offset){ return spaceCostMultiplier('tunneler', offset, 135, 1.3, 'portal'); },
            },
            effect(wiki){
                let boost = (global.portal?.tunneler?.rank || 1) + 3;
                let desc = `<div>${loc('portal_tunneler_effect',[boost])}</div>`;
                desc += `<div>${loc('portal_tunneler_effect2')}</div>`;
                return desc;
            },
            action(args){
                if (!args.isQueue && global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.tunneler.rank < 5){
                    global.portal.throne.points--;
                    global.portal.tunneler.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('tunneler','portal');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, rank: 1 },
                    p: ['tunneler','portal']
                };
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.tunneler?.rank < 5){
                    return 'blue';
                }
                return false;
            }
        },
        brute: {
            id: 'portal-brute',
            title: loc('portal_brute_title'),
            desc(){ return rankDesc(loc('portal_brute_title'),'brute'); },
            reqs: { hellspawn: 1 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('brute', offset, 300000, 1.25, 'portal'); },
                Alloy(offset){ return spaceCostMultiplier('brute', offset, 238000, 1.25, 'portal'); },
                Bolognium(offset){ return spaceCostMultiplier('brute', offset, 65000, 1.25, 'portal'); },
                Mythril(offset){ return spaceCostMultiplier('brute', offset, 178000, 1.25, 'portal'); },
            },
            powered(){ return 0; },
            effect(){
                let troops = $(this)[0].soldiers();
                let desc = `<div>${loc('plus_max_soldiers',[troops])}</div>`;
                desc += `<div>${loc('plus_max_resource',[1,global.resource.Authority.name])}</div>`;
                return desc;
            },
            action(args){
                if (!args.isQueue && global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.brute.rank < 5){
                    global.portal.throne.points--;
                    global.portal.brute.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('brute','portal');
                    global.portal.brute.on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, rank: 1 },
                    p: ['brute','portal']
                };
            },
            soldiers(){
                let soldiers = 7 + (global.portal?.brute?.rank || 1);
                if (global.race['grenadier']){
                    soldiers -= 4;
                }
                return jobScale(soldiers);
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.brute?.rank < 5){
                    return 'blue';
                }
                return false;
            },
            flair(){ return loc('portal_brute_flair'); }
        },
        s_alter: buildTemplate(`s_alter`,'portal'),
        shrine: buildTemplate(`shrine`,'portal'),
        meditation: buildTemplate(`meditation`,'portal'),
        wonder_gardens: {
            id: 'portal-wonder_gardens',
            title(){
                return loc('portal_wonder_skulls');
            },
            desc(){
                return loc('portal_wonder_skulls');
            },
            reqs: {},
            condition(){
                return global.race['wish'] && global.race['wishStats'] && global.portal['wonder_gardens'] ? true : false;
            },
            trait: ['wish'],
            queue_complete(){ return false; },
            effect(){
                return loc(`city_wonder_effect`,[5]);
            },
            action(args){
                return false;
            },
            flair(){ return loc('portal_wonder_skulls_flair'); }
        },
    };

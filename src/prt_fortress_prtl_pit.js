import { loc } from './locale.js';
import { global, p_on } from './vars.js';
import { payCosts, powerOnNewStruct, updateDesc } from './actions.js';
import { messageQueue, powerCostMod, vBind, spaceCostMultiplier, calcPrestige } from './functions.js';
import { armyRating } from './civics.js';
import { traits } from './races.js';
import { incrementStruct, astrialProjection, ascendLab } from './space.js';
import { jobScale } from './jobs.js';
import { descension } from './resets.js';
import { spatialReasoning } from './resources.js';
import { production } from './prod.js';
import { soulForgeSoldiers } from './portal.js';

// Region 'prtl_pit' dari fortressModules (dipisah dari portal.js). Isi sama persis; digabung via portal_registry.js di portal.js.
export const fortressModules_prtl_pit = {
        info: {
            name: loc('portal_pit_name'),
            desc: loc('portal_pit_desc'),
        },
        pit_mission: {
            id: 'portal-pit_mission',
            title: loc('portal_pit_mission_title'),
            desc: loc('portal_pit_mission_title'),
            reqs: { hell_pit: 1 },
            grant: ['hell_pit',2],
            queue_complete(){ return global.tech.hell_pit >= 2 ? 0 : 1; },
            cost: {
                Money(){ return 5000000; },
                Helium_3(){ return 300000; },
                Deuterium(){ return 200000; }
            },
            effect: loc('portal_pit_mission_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('portal_pit_mission_result'),'info',false,['progress','hell']);
                    return true;
                }
                return false;
            }
        },
        assault_forge: {
            id: 'portal-assault_forge',
            title: loc('portal_assault_forge_title'),
            desc: loc('portal_assault_forge_title'),
            reqs: { hell_pit: 2 },
            grant: ['hell_pit',3],
            queue_complete(){ return global.tech.hell_pit >= 3 ? 0 : 1; },
            cost: {
                Money(){ return 10000000; },
                HellArmy(){
                    return Math.round(650 / armyRating(1,'hellArmy'));
                },
                Cement(){ return 10000000; },
                Adamantite(){ return 1250000; },
                Elerium(){ return 2400; },
                Stanene(){ return 900000; }
            },
            effect: loc('portal_assault_forge_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('portal_assault_forge_result'),'info',false,['progress','hell']);
                    return true;
                }
                return false;
            }
        },
        soul_forge: {
            id: 'portal-soul_forge',
            title(){ return loc('portal_soul_forge_title'); },
            desc(){
                return `<div>${loc('portal_soul_forge_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_pit: 4 },
            queue_complete(){ return 1 - global.portal.soul_forge.count; },
            powered(){ return powerCostMod(30); },
            postPower(o){
                vBind({el: `#fort`},'update');
            },
            cost: {
                Money(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_forge') ? global.portal.soul_forge.count : 0)) < 1 ? 25000000 : 0; },
                Graphene(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_forge') ? global.portal.soul_forge.count : 0)) < 1 ? 1500000 : 0; },
                Infernite(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_forge') ? global.portal.soul_forge.count : 0)) < 1 ? 25000 : 0; },
                Bolognium(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_forge') ? global.portal.soul_forge.count : 0)) < 1 ? (global.race['warlord'] ? 500000 : 100000) : 0; },
            },
            effect(wiki){
                let desc = `<div>${loc(global.race['warlord'] ? 'portal_soul_forge_warlord' : 'portal_soul_forge_effect',[global.resource.Soul_Gem.name])}</div>`;
                let count = (wiki?.count ?? 0) + (global.portal.hasOwnProperty('soul_forge') ? global.portal.soul_forge.count : 0);
                if (count >= 1){
                    let cap = global.tech.hell_pit >= 6 ? 750000 : 1000000;
                    let num_s_attractor_on = (wiki ? global.portal.soul_attractor.on : p_on['soul_attractor']);
                    if (global.tech.hell_pit >= 7 && num_s_attractor_on > 0){
                        cap *= (global.stats.achieve['what_is_best'] && global.stats.achieve.what_is_best.e >= 3 ? 0.96 : 0.97) ** num_s_attractor_on;
                    }
                    if (global.race['ghostly'] && global.race['warlord']){
                        cap *= 2 - traits.ghostly.vars()[1];
                    }
                    desc = desc + `<div>${loc('portal_soul_forge_effect2',[global.portal['soul_forge'] ? global.portal.soul_forge.kills.toLocaleString() : 0,Math.round(cap).toLocaleString()])}</div>`;
                }
                let soldiers = soulForgeSoldiers(wiki);
                return `${desc}<div><span class="has-text-caution">${loc('portal_soul_forge_soldiers',[soldiers])}</span>, <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span></div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.portal.soul_forge.count < 1){
                        incrementStruct('soul_forge','portal');
                        powerOnNewStruct($(this)[0]);
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, kills: 0 },
                    p: ['soul_forge','portal']
                };
            }
        },
        gun_emplacement: {
            id: 'portal-gun_emplacement',
            title: loc('portal_gun_emplacement_title'),
            desc(){
                return `<div>${loc('portal_gun_emplacement_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_gun: 1 },
            powered(){ return powerCostMod(3); },
            cost: {
                Money(offset){ return spaceCostMultiplier('gun_emplacement', offset, 4000000, 1.25, 'portal'); },
                Coal(offset){ return spaceCostMultiplier('gun_emplacement', offset, 250000, 1.25, 'portal'); },
                Steel(offset){ return spaceCostMultiplier('gun_emplacement', offset, 1200000, 1.25, 'portal'); },
                Wrought_Iron(offset){ return spaceCostMultiplier('gun_emplacement', offset, 200000, 1.25, 'portal'); },
            },
            effect(){
                let soldiers = global.tech.hell_gun >= 2 ? jobScale(2) : jobScale(1);
                let min = global.tech.hell_gun >= 2 ? 35 : 20;
                let max = global.tech.hell_gun >= 2 ? 75 : 40;
                return `<div>${loc('portal_gun_emplacement_effect',[soldiers])}</div><div>${loc('portal_gun_emplacement_effect2',[min,max])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('gun_emplacement','portal');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['gun_emplacement','portal']
                };
            }
        },
        soul_attractor: {
            id: 'portal-soul_attractor',
            title(){ return loc('portal_soul_attractor_title'); },
            desc(){
                return `<div>${loc('portal_soul_attractor_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_pit: 5 },
            powered(){ return powerCostMod(4); },
            cost: {
                Money(offset){ return spaceCostMultiplier('soul_attractor', offset, 12000000, 1.25, 'portal'); },
                Stone(offset){ return spaceCostMultiplier('soul_attractor', offset, 23000000, 1.25, 'portal'); },
                Nano_Tube(offset){ return spaceCostMultiplier('soul_attractor', offset, 314159, 1.25, 'portal'); },
                Vitreloy(offset){ return spaceCostMultiplier('soul_attractor', offset, 1618, 1.25, 'portal'); },
                Aerogel(offset){ return spaceCostMultiplier('soul_attractor', offset, 180000, 1.25, 'portal'); },
            },
            effect(){
                let attract = global.blood['attract'] ? global.blood.attract * 5 : 0;
                if (global.tech['hell_pit'] && global.tech.hell_pit >= 8){ attract *= 2; }
                let low = 40 + attract;
                let high = 120 + attract;

                if (global.race['ghostly'] && global.race['warlord']){
                    low *= 1 + (traits.ghostly.vars()[0] / 100);
                    low = Math.round(low);
                    high *= 1 + (traits.ghostly.vars()[0] / 100);
                    high = Math.round(high);
                }

                let desc = `<div>${loc('portal_soul_attractor_effect',[low, high])}</div>`;
                if (global.tech.hell_pit >= 7){
                    desc += `<div>${loc('portal_soul_attractor_effect2',[global.stats.achieve['what_is_best'] && global.stats.achieve.what_is_best.e >= 3 ? 4 : 3])}</div>`;
                }
                if (global.tech['pitspawn']){
                    desc += `<div>${loc('production',[global.tech.pitspawn >= 3 ? 20 : 10,loc('portal_shadow_mine_title')])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;

                return desc;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('soul_attractor','portal');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['soul_attractor','portal']
                };
            }
        },
        soul_capacitor: {
            id: 'portal-soul_capacitor',
            title: loc('portal_soul_capacitor_title'),
            desc(){
                return `<div>${loc('portal_soul_capacitor_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { forbidden: 2 },
            powered(){ return powerCostMod(125); },
            queue_complete(){ return 40 - global.portal.soul_capacitor.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_capacitor') ? global.portal.soul_capacitor.count : 0)) >= 40 ? 0 : spaceCostMultiplier('soul_capacitor', offset, 750000000, 1.01, 'portal'); },
                Crystal(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_capacitor') ? global.portal.soul_capacitor.count : 0)) >= 40 ? 0 : spaceCostMultiplier('soul_capacitor', offset, 1250000, 1.01, 'portal'); },
                Adamantite(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_capacitor') ? global.portal.soul_capacitor.count : 0)) >= 40 ? 0 : spaceCostMultiplier('soul_capacitor', offset, 6500000, 1.01, 'portal'); },
                Infernite(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_capacitor') ? global.portal.soul_capacitor.count : 0)) >= 40 ? 0 : spaceCostMultiplier('soul_capacitor', offset, 10000, 1.01, 'portal'); },
                Stanene(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_capacitor') ? global.portal.soul_capacitor.count : 0)) >= 40 ? 0 : spaceCostMultiplier('soul_capacitor', offset, 2500000, 1.01, 'portal'); },
                Bolognium(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_capacitor') ? global.portal.soul_capacitor.count : 0)) >= 40 ? 0 : spaceCostMultiplier('soul_capacitor', offset, 1000000, 1.01, 'portal'); },
                Soul_Gem(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_capacitor') ? global.portal.soul_capacitor.count : 0)) >= 40 ? 0 : spaceCostMultiplier('soul_capacitor', offset, 3, 1.01, 'portal'); },
                Mythril(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_capacitor') ? global.portal.soul_capacitor.count : 0)) >= 40 ? 0 : spaceCostMultiplier('soul_capacitor', offset, 1250000, 1.01, 'portal'); },
            },
            effect(){
                let cap = 2500000;
                let eCap = global.portal.hasOwnProperty('soul_capacitor') ? global.portal.soul_capacitor.ecap : 0;
                let energy = global.portal.hasOwnProperty('soul_capacitor') ? global.portal.soul_capacitor.energy : 0;
                let desc = `<div>${loc('portal_soul_capacitor_effect',[energy.toLocaleString()])}</div>`;
                desc += `<div>${loc('portal_soul_capacitor_effect2',[eCap.toLocaleString()])}</div>`;
                desc += `<div>${loc('portal_soul_capacitor_effect3',[cap.toLocaleString()])}</div>`;
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            action(args){
                if (global.portal.soul_capacitor.count < 40 && payCosts($(this)[0])){
                    global.portal.soul_capacitor.count++;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, energy: 0, ecap: 0 },
                    p: ['soul_capacitor','portal']
                };
            },
            postPower(){
                updateDesc($(this)[0],'portal','soul_capacitor');
            },
        },
        absorption_chamber: {
            id: 'portal-absorption_chamber',
            title: loc('portal_absorption_chamber_title'),
            desc(wiki){
                if (!global.interstellar.hasOwnProperty('absorption_chamber') || global.portal.absorption_chamber.count < 100 || wiki){
                    return `<div>${loc('portal_absorption_chamber_title')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                else {
                    return `<div>${loc('portal_absorption_chamber_title')}</div>`;
                }
            },
            reqs: { forbidden: 3 },
            queue_size: 5,
            queue_complete(){ return 100 - global.portal.absorption_chamber.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('absorption_chamber') ? global.portal.absorption_chamber.count : 0)) < 100 ? 75000000 : 0; },
                Alloy(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('absorption_chamber') ? global.portal.absorption_chamber.count : 0)) < 100 ? 750000 : 0; },
                Neutronium(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('absorption_chamber') ? global.portal.absorption_chamber.count : 0)) < 100 ? 125000 : 0; },
                Elerium(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('absorption_chamber') ? global.portal.absorption_chamber.count : 0)) < 100 ? 1000 : 0; },
                Orichalcum(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('absorption_chamber') ? global.portal.absorption_chamber.count : 0)) < 100 ? 250000 : 0; },
                Nanoweave(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('absorption_chamber') ? global.portal.absorption_chamber.count : 0)) < 100 ? 75000 : 0; },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.portal.hasOwnProperty('absorption_chamber') ? global.portal.absorption_chamber.count : 0);
                if (count < 100){
                    let remain = 100 - count;
                    return `<div>${loc('portal_absorption_chamber_incomplete')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    if (global.tech.forbidden === 5){
                        return `<div>${loc('portal_absorption_chamber_effect_eld',[(100000000).toLocaleString()])}</div><div class="has-text-special">${loc('tech_demonic_infusion_effect2',[calcPrestige('descend').artifact])}</div>`;
                    }
                    else {
                        let reward = astrialProjection();
                        return `<div>${loc(`portal_absorption_chamber_effect`,[(100000000).toLocaleString()])}</div><div>${reward}</div>`;
                    }
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.portal.absorption_chamber.count < 100){
                        incrementStruct('absorption_chamber','portal');
                        if (global.portal.absorption_chamber.count >= 100){
                            global.tech.forbidden = 4;
                        }
                        return true;
                    }
                    else if (global.portal.soul_capacitor.energy >= 100000000){
                        if (global.tech.forbidden === 5){
                            descension();
                        }
                        else {
                            ascendLab();
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['absorption_chamber','portal']
                };
            }
        },
        shadow_mine: {
            id: 'portal-shadow_mine',
            title: loc('portal_shadow_mine_title'),
            desc(){
                return `<div>${loc('portal_shadow_mine_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { pitspawn: 1 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            powered(){ return powerCostMod(5); },
            powerBalancer(){
                return [{ r: 'Infernite', k: 'lpmod' }];
            },
            cost: {
                Money(offset){ return spaceCostMultiplier('shadow_mine', offset, 10000000, 1.25, 'portal'); },
                Lumber(offset){ return spaceCostMultiplier('shadow_mine', offset, 4650000, 1.25, 'portal'); },
                Adamantite(offset){ return spaceCostMultiplier('shadow_mine', offset, 2350000, 1.25, 'portal'); },
            },
            effect(wiki){
                let elerium_cap = spatialReasoning(200);
                let elerium = production('shadow_mine', 'elerium', wiki);
                let infernite = production('shadow_mine', 'infernite', wiki);
                let vitreloy = production('shadow_mine', 'vitreloy', wiki);
                let desc = `<div>${loc('gain',[+(elerium).toFixed(3), global.resource.Elerium.name])}</div>`;
                desc += `<div>${loc('gain',[+(infernite).toFixed(3), global.resource.Infernite.name])}</div>`;
                desc += `<div>${loc('gain',[+(vitreloy).toFixed(3), global.resource.Vitreloy.name])}</div>`;
                desc += `<div>${loc('plus_max_resource',[elerium_cap, global.resource.Elerium.name])}</div>`;
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('shadow_mine','portal');
                    powerOnNewStruct($(this)[0]);
                    global.resource.Vitreloy.display = true;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['shadow_mine','portal']
                };
            },
            flair(){ return loc('portal_shadow_mine_flair'); }
        },
        tavern: {
            id: 'portal-tavern',
            title: loc('portal_tavern_title'),
            desc(){
                return `<div>${loc('portal_tavern_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { pitspawn: 2 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            powered(){ return powerCostMod(3); },
            powerBalancer(){
                return [{ r: 'Infernite', k: 'lpmod' }];
            },
            cost: {
                Money(offset){ return spaceCostMultiplier('tavern', offset, 12500000, 1.25, 'portal'); },
                Food(offset){ return spaceCostMultiplier('tavern', offset, 250000, 1.25, 'portal'); },
                Oil(offset){ return spaceCostMultiplier('tavern', offset, 125000, 1.25, 'portal'); },
                Brick(offset){ return spaceCostMultiplier('tavern', offset, 138000, 1.25, 'portal'); },
            },
            effect(wiki){
                let desc = '';
                if (!global.race['joyless']){
                    desc += `<div>${loc('plus_resource_per',[0.35,loc('morale'),loc('portal_shadow_mine_title')])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('tavern','portal');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['tavern','portal']
                };
            },
            flair(){ return loc('portal_tavern_flair'); }
        },
    };

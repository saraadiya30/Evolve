import { loc } from './locale.js';
import { global, sizeApproximation, seededRandom, p_on } from './vars.js';
import { payCosts, drawTech, initStruct, powerOnNewStruct, bank_vault } from './actions.js';
import { incrementStruct } from './space.js';
import { renderEdenic } from './edenic_render.js';
import { armyRating } from './civics.js';
import { messageQueue, spaceCostMultiplier, powerCostMod } from './functions.js';
import { edenicModules } from './edenic_registry.js';
import { jobScale } from './jobs.js';
import { addSmelter } from './industry.js';
import { spatialReasoning } from './resources.js';
import { traitCostMod } from './races.js';

// Bagian dari edenElysium (7 entri: fire_support_base .. eternal_bank), dipisah dari edenic_elysium.js. Urutan entri sama persis.
export const edenElysiumPart2 = {
        fire_support_base: {
            id: 'eden-fire_support_base',
            title: loc('eden_fire_support_base_title'),
            desc(wiki){
                if (!global.eden.hasOwnProperty('fire_support_base') || global.eden.fire_support_base.count < 100 || wiki){
                    return `<div>${loc('eden_fire_support_base_title')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                else {
                    return `<div>${loc('eden_fire_support_base_title')}</div>`;
                }
            },
            reqs: { elysium: 8 },
            queue_size: 10,
            queue_complete(){ return 100 - global.eden.fire_support_base.count; },
            cost: {
                Money(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('fire_support_base') ? global.eden.fire_support_base.count : 0) < 100 ? 2500000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('fire_support_base') || (global.eden.fire_support_base.count < 100) ? 2500000000 : 0;
                },
                Stone(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('fire_support_base') ? global.eden.fire_support_base.count : 0) < 100 ? 235000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('fire_support_base') || (global.eden.fire_support_base.count < 100) ? 235000000 : 0;
                },
                Neutronium(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('fire_support_base') ? global.eden.fire_support_base.count : 0) < 100 ? 3750000 : 0;
                    }
                    return !global.eden.hasOwnProperty('fire_support_base') || (global.eden.fire_support_base.count < 100) ? 3750000 : 0;
                },
                Polymer(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('fire_support_base') ? global.eden.fire_support_base.count : 0) < 100 ? 65000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('fire_support_base') || (global.eden.fire_support_base.count < 100) ? 65000000 : 0;
                },
                Elysanite(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('fire_support_base') ? global.eden.fire_support_base.count : 0) < 100 ? 625000 : 0;
                    }
                    return !global.eden.hasOwnProperty('fire_support_base') || (global.eden.fire_support_base.count < 100) ? 625000 : 0;
                },
                Elerium(){
                    return global.tech.elysium >= 10 && global.eden.fire_support_base.count === 100 && global.tech['isle'] && global.tech.isle === 1 ? 250000 : 0;
                }
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.eden.hasOwnProperty('fire_support_base') ? global.eden.fire_support_base.count : 0);
                if (count >= 100){
                    let desc = `<div>${loc('plus_max_soldiers',[$(this)[0].soldiers()])}</div>`;
                    if (global.tech['elysium'] && global.tech.elysium >= 10 && global.tech.isle === 1){
                        if (global.resource.Elerium.amount >= 250000){
                            desc += `<div class="has-text-success">${loc('eden_fire_support_base_effect')}</div>`;
                        }
                        else {
                            desc += `<div class="has-text-danger">${loc('eden_fire_support_base_effect')}</div>`;
                        }
                        desc += `<div class="has-text-caution">${loc('eden_fire_support_base_effect2',[sizeApproximation(250000),global.resource.Elerium.name])}</div>`;
                    }
                    return desc;
                }
                else {
                    let size = 100;
                    let remain = size - count;
                    return `<div>${loc('eden_fire_support_base_build')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
            },
            action(args){
                if (global.eden.fire_support_base.count < 100 && payCosts($(this)[0])){
                    incrementStruct('fire_support_base','eden');
                    if (global.eden.fire_support_base.count === 100 && !global.tech['isle']){
                        global.eden['enemy_isle'] = { wt: 100, et: 100, g: 100 };
                        global.tech['isle'] = 1;
                        renderEdenic();
                        drawTech();
                    }
                    return true;
                }
                else if (global.eden.fire_support_base.count === 100 && global.tech.elysium >= 10 && global.tech['isle'] && global.tech.isle === 1 && payCosts($(this)[0])){
                    let target = null, element = null;
                    let targets = [];
                    if (!global.eden['enemy_isle']){ global.eden['enemy_isle'] = { wt: 100, et: 100, g: 100 }; }
                    if (global.eden.enemy_isle.wt > 0){ targets.push('wt'); }
                    if (global.eden.enemy_isle.g > 0){ targets.push('g'); }
                    if (global.eden.enemy_isle.et > 0){ targets.push('et'); }

                    if (global.eden['pillbox'] && global.eden.pillbox.staffed > 0){
                        let rating = +(Math.round(armyRating(global.eden.pillbox.staffed,'army',0)) / (global.race['warlord'] ? 1250 : 75)).toFixed(0);
                        if (rating > 100){ rating = 100; }
                        global.eden.fire_support_base.count = Math.floor(rating);
                    }
                    else {
                        global.eden.fire_support_base.count = 0;
                    }

                    if (global.eden.fire_support_base.count < 100){
                        messageQueue(loc('eden_fire_support_base_counterattack',[loc('eden_fire_support_base_title')]),'danger',false,['progress']);
                    }

                    target = targets[Math.floor(seededRandom(0,targets.length))];
                    if (target === 'wt'){
                        element = '#eden-west_tower .button';
                    }
                    else if (target === 'et'){
                        element = '#eden-east_tower .button';
                    }
                    else if (target === 'g'){
                        element = '#eden-isle_garrison .button';
                    }

                    let redraw = false;
                    global.eden.enemy_isle[target] -= Math.floor(seededRandom(25,75));
                    if (global.eden.enemy_isle[target] <= 0){
                        global.eden.enemy_isle[target] = 0;
                        redraw = true;
                    }

                    let nuke = $('<div class="mininuke"></div>');
                    $(element).append(nuke);
                    setTimeout(function(){
                        nuke.addClass('burn');
                    }, 500);
                    setTimeout(function(){
                        nuke.addClass('b');
                    }, 600);
                    setTimeout(function(){
                        nuke.addClass('c');
                    }, 2500);
                    setTimeout(function(){
                        $(`${element} .mininuke`).remove();
                    }, 4500);

                    if (global.eden.enemy_isle.wt === 0 && global.eden.enemy_isle.g === 0 && global.eden.enemy_isle.et === 0){
                        global.tech.isle = 2;
                        global.settings.eden.palace = true;
                        initStruct(edenicModules.eden_elysium.north_pier);
                        initStruct(edenicModules.eden_isle.south_pier);
                        drawTech();
                        renderEdenic();
                        return true;
                    }
                    else if (redraw){
                        renderEdenic();
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['fire_support_base','eden']
                };
            },
            soldiers(){
                let soldiers = global.race['grenadier'] ? 15 : 25;
                return jobScale(soldiers);
            }
        },
        elysanite_mine: {
            id: 'eden-elysanite_mine',
            title: loc('eden_elysanite_mine_title'),
            desc: `<div>${loc('eden_elysanite_mine_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { elysium: 6 },
            cost: {
                Money(offset){ return spaceCostMultiplier('elysanite_mine', offset, 566000000, 1.24, 'eden'); },
                Adamantite(offset){ return spaceCostMultiplier('elysanite_mine', offset, 18000000, 1.24, 'eden'); },
                Wrought_Iron(offset){ return spaceCostMultiplier('elysanite_mine', offset, 10000000, 1.24, 'eden'); },
            },
            effect(){
                let desc = `<div>${loc('plus_max_resource',[jobScale(2),loc(`job_elysium_miner`)])}</div>`;
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(25); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('elysanite_mine','eden');
                    powerOnNewStruct($(this)[0]);
                    global.civic.elysium_miner.display = true;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['elysanite_mine','eden']
                };
            }
        },
        sacred_smelter: {
            id: 'eden-sacred_smelter',
            title(){ return loc('eden_sacred_smelter_title'); },
            desc(){ return `<div>${loc('eden_sacred_smelter_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            reqs: { elysium: 7 },
            cost: {
                Money(offset){ return spaceCostMultiplier('sacred_smelter', offset, 625000000, 1.25, 'eden'); },
                Iridium(offset){ return spaceCostMultiplier('sacred_smelter', offset, 25000000, 1.25, 'eden'); },
                Elysanite(offset){ return spaceCostMultiplier('sacred_smelter', offset, 4500000, 1.25, 'eden'); },
                Scarletite(offset){ return spaceCostMultiplier('sacred_smelter', offset, 1250000, 1.25, 'eden'); },
            },
            effect(){
                let desc = `<div>${loc('interstellar_stellar_forge_effect3',[$(this)[0].smelting()])}</div>`;
                if (global.tech['elysium'] && global.tech.elysium >= 18){
                    desc += `<div>${loc('city_foundry_effect1',[jobScale(3)])}</div>`;
                }
                return `${desc}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(33); },
            smelting(){
                return 5;
            },
            special: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('sacred_smelter','eden');
                    if (powerOnNewStruct($(this)[0])){
                        addSmelter($(this)[0].smelting(), 'Steel');
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['sacred_smelter','eden']
                };
            }
        },
        elerium_containment: {
            id: 'eden-elerium_containment',
            title(){ return loc('eden_elerium_containment',[global.resource.Elerium.name]); },
            desc(){
                return `<div>${loc('eden_elerium_containment',[global.resource.Elerium.name])}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { elysium: 11 },
            cost: {
                Money(offset){ return spaceCostMultiplier('elerium_containment', offset, 4500000000, 1.28, 'eden'); },
                Graphene(offset){ return spaceCostMultiplier('elerium_containment', offset, 100000000, 1.28, 'eden'); },
                Aerogel(offset){ return spaceCostMultiplier('elerium_containment', offset, 88000000, 1.28, 'eden'); },
                Elysanite(offset){ return spaceCostMultiplier('elerium_containment', offset, 25000000, 1.28, 'eden'); }
            },
            effect(){
                let elerium = sizeApproximation(spatialReasoning(1000));
                return `<div>${loc('plus_max_resource',[elerium,global.resource.Elerium.name])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(50); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('elerium_containment','eden');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['elerium_containment','eden']
                };
            }
        },
        pillbox: {
            id: 'eden-pillbox',
            title(){ return loc('eden_pillbox_title'); },
            desc(){
                return `<div>${loc('eden_pillbox_title',)}</div><div class="has-text-special">${loc('requires_soldiers')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { elysium: 9 },
            cost: {
                Money(offset){ return spaceCostMultiplier('pillbox', offset, 1500000000, 1.26, 'eden'); },
                Cement(offset){ return spaceCostMultiplier('pillbox', offset, 500000000, 1.26, 'eden'); },
                Steel(offset){ return spaceCostMultiplier('pillbox', offset, 65000000, 1.26, 'eden'); },
                Nanoweave(offset){ return spaceCostMultiplier('pillbox', offset, 38000000, 1.26, 'eden'); },
            },
            effect(){
                let rating = +(Math.round(armyRating(global.eden['pillbox'] && global.eden.pillbox.staffed ? global.eden.pillbox.staffed : jobScale(10),'army',0)) / (global.race['warlord'] ? 1250 : 75)).toFixed(1);
                if (rating > 100){ rating = 100; }

                let desc = ``;
                if (!global.tech['isle'] || global.tech.isle === 1){
                    desc += `<div>${loc('eden_pillbox_effect',[rating])}</div>`;
                }
                if (global.tech['elysium'] && global.tech.elysium >= 12 && !global.race['joyless']){
                    desc += `<div>${loc('eden_restaurant_effect',[0.35,loc(`eden_restaurant_bd`)])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('portal_guard_post_effect2',[jobScale(10),$(this)[0].powered()])}</div>`;

                return desc;
            },
            powered(){ return powerCostMod(12); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('pillbox','eden');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, staffed: 0 },
                    p: ['pillbox','eden']
                };
            }
        },
        restaurant: {
            id: 'eden-restaurant',
            title(){ return global.eden['restaurant'] && global.eden.restaurant.count >= 10 ? loc('eden_restaurant_bd') : loc('eden_restaurant_title'); },
            desc(){
                return `<div>${loc('eden_restaurant_title',)}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Food.name])}</div>`;
            },
            reqs: { elysium: 12 },
            cost: {
                Money(offset){ return spaceCostMultiplier('restaurant', offset, 4250000000, 1.26, 'eden'); },
                Oil(offset){ return spaceCostMultiplier('restaurant', offset, 1000000, 1.26, 'eden'); },
                Polymer(offset){ return spaceCostMultiplier('restaurant', offset, 110000000, 1.26, 'eden'); },
                Sheet_Metal(offset){ return spaceCostMultiplier('restaurant', offset, 25000000, 1.26, 'eden'); },
            },
            effect(){
                let food = 250000;
                let morale = 0;
                morale += global.eden.hasOwnProperty('pillbox') && p_on['pillbox'] ? 0.35 * p_on['pillbox'] : 0;
                morale += (global.civic?.elysium_miner?.workers ?? 0) * 0.15;
                morale += global.eden.hasOwnProperty('archive') && p_on['archive'] ? 0.4 * p_on['archive'] : 0;

                let desc =  '';
                if (!global.race['joyless']){
                    desc += `<div>${loc('space_red_vr_center_effect1',[morale.toFixed(1)])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('interstellar_alpha_starport_effect3',[sizeApproximation(food),global.resource.Food.name])}</div>`;
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(25); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('restaurant','eden');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['restaurant','eden']
                };
            }
        },
        eternal_bank: {
            id: 'eden-eternal_bank',
            title(){ return loc('eden_eternal_bank_title'); },
            desc(){
                return `<div>${loc('eden_eternal_bank_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { elysium: 13 },
            cost: {
                Money(offset){ return spaceCostMultiplier('eternal_bank', offset, traitCostMod('untrustworthy',2500000000), 1.26, 'eden'); },
                Bolognium(offset){ return spaceCostMultiplier('eternal_bank', offset, traitCostMod('untrustworthy',10000000), 1.26, 'eden'); },
                Orichalcum(offset){ return spaceCostMultiplier('eternal_bank', offset, traitCostMod('untrustworthy',12500000), 1.26, 'eden'); },
                Mythril(offset){ return spaceCostMultiplier('eternal_bank', offset, traitCostMod('untrustworthy',7500000), 1.26, 'eden'); }
            },
            effect(){
                let vault = spatialReasoning(bank_vault() * (global.race['warlord'] ? 20 : 10));
                if (global.race['warlord'] && global.eden['corruptor'] && global.tech.asphodel >= 12){
                    vault *= 1 + (p_on['corruptor'] || 0) * 0.08;
                }
                vault = (+(vault).toFixed(0)).toLocaleString();
                return loc('plus_max_resource',[`\$${vault}`,loc('resource_Money_name')]);
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('eternal_bank','eden');
                    global['resource']['Money'].max += spatialReasoning(bank_vault() * (global.race['warlord'] ? 20 : 10));
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['eternal_bank','eden']
                };
            }
        },
};

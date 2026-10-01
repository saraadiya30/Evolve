import { loc } from '../../core/locale.js';
import { global } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { messageQueue } from '../../functions/message_log.js';
import { getHalloween } from '../../functions/event_dates.js';
import { costMultiplier } from '../../functions/cost_multipliers.js';
import { powerCostMod } from '../../functions/power_modifiers.js';
import { drawCity, BHStorageMulti } from '../challenge/challenge_rules.js';
import { buildTemplate } from '../evolution/evolution_screen.js';
import { payCosts } from '../core/action_costs.js';
import { housingLabel, structName } from '../core/structure_ui.js';
import { powerOnNewStruct } from '../evolution/planet_setup.js';
import { traits } from '../../core/registries.js';
import { incrementStruct } from '../../space/space_requirements.js';
import { spatialReasoning } from '../../resources/resources.js';
import { govActive } from '../../governor/governor.js';
import { production } from '../../resources/prod.js';

// Bagian dari actions_city (21 entri: gift .. farm), dipisah dari city.js. Urutan entri sama persis.
export const actions_cityPart1 = {
        gift: {
            id: 'city-gift',
            title: loc('city_gift'),
            desc: loc('city_gift_desc'),
            wiki: false,
            category: 'outskirts',
            reqs: { primitive: 1 },
            queue_complete(){ return 0; },
            not_tech: ['santa'],
            not_trait: ['cataclysm','lone_survivor'],
            class: ['hgift'],
            condition(){
                const date = new Date();
                if (date.getMonth() !== 11 || (date.getMonth() === 11 && (date.getDate() <= 16 || date.getDate() >= 25))){
                    let active_gift = false;
                    if (global['special'] && global.special['gift']){
                        Object.keys(global.special.gift).forEach(function(g){
                            if (global.special.gift[g]){
                                active_gift = true;
                            }
                        });
                    }
                    return active_gift;
                }
                return false;
            },
            count(){
                let gift_count = 0;
                if (global['special'] && global.special['gift']){
                    Object.keys(global.special.gift).forEach(function(g){
                        if (global.special.gift[g]){
                            gift_count++;
                        }
                    });
                }
                return gift_count;
            },
            action(args){
                if (!global.settings.pause){
                    const date = new Date();

                    let active_gift = false;
                    if (global['special'] && global.special['gift']){
                        Object.keys(global.special.gift).forEach(function(g){
                            if (global.special.gift[g]){
                                active_gift = g;
                            }
                        });
                    }
                    
                    if (date.getMonth() !== 11 || (date.getMonth() === 11 && (date.getDate() <= 16 || date.getDate() >= 25))){
                        if (active_gift === `g2019`){
                            if (global['special'] && global.special['gift']){
                                delete global.special.gift[active_gift];
                                if (global.race.universe === 'antimatter'){
                                    global.prestige.AntiPlasmid.count += 100;
                                    global.stats.antiplasmid += 100;
                                    messageQueue(loc('city_gift_msg',[100,loc('arpa_genepool_effect_antiplasmid')]),'info',false,['events']);
                                }
                                else {
                                    global.prestige.Plasmid.count += 100;
                                    global.stats.plasmid += 100;
                                    messageQueue(loc('city_gift_msg',[100,loc('arpa_genepool_effect_plasmid')]),'info',false,['events']);
                                }
                                drawCity();
                            }
                        }
                        else {
                            if (global['special'] && global.special['gift']){
                                delete global.special.gift[active_gift];
                                
                                let resets = global.stats.hasOwnProperty('reset') ? global.stats.reset : 0;
                                let mad = global.stats.hasOwnProperty('mad') ? global.stats.mad : 0;
                                let bioseed = global.stats.hasOwnProperty('bioseed') ? global.stats.bioseed : 0;
                                let cataclysm = global.stats.hasOwnProperty('cataclysm') ? global.stats.cataclysm : 0;
        
                                let plasmid = 100 + resets + mad;
                                let phage = bioseed + cataclysm;
                                let gift = [];

                                if (global.stats.died + global.stats.tdied > 0){
                                    let dead = global.stats.died + global.stats.tdied;
                                    global.resource.Coal.amount += dead;
                                    gift.push(`${dead.toLocaleString()} ${loc(`resource_Coal_name`)}`);
                                }

                                if (global.race.universe === 'antimatter'){
                                    global.prestige.AntiPlasmid.count += plasmid;
                                    global.stats.antiplasmid += plasmid;
                                    gift.push(`${plasmid.toLocaleString()} ${loc(`resource_AntiPlasmid_plural_name`)}`);
                                }
                                else {
                                    global.prestige.Plasmid.count += plasmid;
                                    global.stats.plasmid += plasmid;
                                    gift.push(`${plasmid.toLocaleString()} ${loc(`resource_Plasmid_plural_name`)}`);
                                }
                                if (phage > 0){
                                    global.prestige.Phage.count += phage;
                                    global.stats.phage += phage;
                                    gift.push(`${phage.toLocaleString()} ${loc(`resource_Phage_name`)}`);
                                }
        
                                if (global.stats.hasOwnProperty('achieve')){
                                    let universe = global.stats.achieve['whitehole'] ? global.stats.achieve['whitehole'].l : 0;
                                    universe += global.stats.achieve['heavy'] ? global.stats.achieve['heavy'].l : 0;
                                    universe += global.stats.achieve['canceled'] ? global.stats.achieve['canceled'].l : 0;
                                    universe += global.stats.achieve['eviltwin'] ? global.stats.achieve['eviltwin'].l : 0;
                                    universe += global.stats.achieve['microbang'] ? global.stats.achieve['microbang'].l : 0;
                                    universe += global.stats.achieve['pw_apocalypse'] ? global.stats.achieve['pw_apocalypse'].l : 0;
        
                                    let ascended = global.stats.achieve['ascended'] ? global.stats.achieve['ascended'].l : 0;
                                    let descend = global.stats.achieve['corrupted'] ? global.stats.achieve['corrupted'].l : 0;
                                    let ai = global.stats.achieve['obsolete'] ? global.stats.achieve['obsolete'].l : 0;
        
                                    if (universe > 30){ universe = 30; }
                                    if (ascended > 5){ ascended = 5; }
                                    if (descend > 5){ descend = 5; }
                                    
                                    if (universe > 0){
                                        let dark = +(universe / 7.5).toFixed(2);
                                        global.prestige.Dark.count += dark;
                                        global.stats.dark += dark;
                                        gift.push(`${dark} ${loc(`resource_Dark_name`)}`);
                                    }
                                    if (ascended > 0){
                                        global.prestige.Harmony.count += ascended;
                                        global.stats.harmony += ascended;
                                        gift.push(`${ascended} ${loc(`resource_Harmony_name`)}`);
                                    }
                                    if (descend > 0){
                                        let blood = descend * 5;
                                        let art = descend;
                                        global.prestige.Blood_Stone.count += blood;
                                        global.stats.blood += blood;
                                        global.prestige.Artifact.count += art;
                                        global.stats.artifact += art;
                                        gift.push(`${blood} ${loc(`resource_Blood_Stone_name`)}`);
                                        gift.push(`${art} ${loc(`resource_Artifact_name`)}`);
                                    }
                                    if (active_gift !== `g2020` && ai > 0){
                                        global.prestige.AICore.count += ai;
                                        global.stats.cores += ai;
                                        gift.push(`${ai} ${loc(`resource_AICore_name`)}`);
                                    }
                                }

                                messageQueue(loc('city_gift2_msg',[gift.join(", ")]),'info',false,['events']);
                                drawCity();
                            }
                        }
                    }
                }
                return false;
            },
            touchlabel: loc(`open`)
        },
        food: {
            id: 'city-food',
            title(){
                let hallowed = getHalloween();
                if (hallowed.active){
                    return global.tech['conjuring'] ? loc('city_trick_conjure') : loc('city_trick');
                }
                else {
                    return global.tech['conjuring'] ? loc('city_food_conjure') : loc('city_food');
                }
            },
            desc(){
                let gain = $(this)[0].val(false);
                let hallowed = getHalloween();
                if(global.race['fasting']){
                    return loc('city_food_fasting');
                }
                if (hallowed.active){
                    return global.tech['conjuring'] ? loc('city_trick_conjure_desc',[gain]) : loc('city_trick_desc',[gain]);
                }
                else {
                    return global.tech['conjuring'] ? loc('city_food_conjure_desc',[gain]) : loc('city_food_desc',[gain]);
                }
            },
            category: 'outskirts',
            reqs: { primitive: 1 },
            not_trait: ['cataclysm','artifical'],
            condition(){
                let hallowed = getHalloween();
                if (hallowed && global.race['soul_eater'] && !global.race['evil']){
                    return true;
                }
                return global.race['soul_eater'] ? false : true;
            },
            queue_complete(){ return 0; },
            cost: {
                Mana(){ return global.tech['conjuring'] ? 1 : 0; },
            },
            action(args){
                if (!global.settings.pause){
                    if(global['resource']['Food'].amount < global['resource']['Food'].max && !global.race['fasting']){
                        modRes('Food',$(this)[0].val(true),true);
                    }
                    global.stats.cfood++;
                    global.stats.tfood++;
                }
                return false;
            },
            val(spend){
                let gain = global.race['strong'] ? traits.strong.vars()[0] : 1;
                if (global.genes['enhance']){
                    gain *= 2;
                }
                if (global.tech['conjuring'] && global.resource.Mana.amount >= 1){
                    gain *= 10;
                    if (global['resource']['Food'].amount < global['resource']['Food'].max && spend){
                        modRes('Mana',-1,true);
                    }
                }
                return gain;
            },
            touchlabel: loc(`harvest`)
        },
        lumber: {
            id: 'city-lumber',
            title(){
                let hallowed = getHalloween();
                if (hallowed.active){
                    return global.tech['conjuring'] && global.tech['conjuring'] >= 2 ? loc('city_dig_conjour') : loc('city_dig');
                }
                else {
                    return global.tech['conjuring'] && global.tech['conjuring'] >= 2 ? loc('city_lumber_conjure') : loc('city_lumber');
                }
            },
            desc(){
                let gain = $(this)[0].val(false);
                let hallowed = getHalloween();
                if (hallowed.active){
                    return global.tech['conjuring'] && global.tech['conjuring'] >= 2 ? loc('city_dig_conjour_desc',[gain]) : loc('city_dig_desc',[gain]);
                }
                else {
                    return global.tech['conjuring'] && global.tech['conjuring'] >= 2 ? loc('city_lumber_conjure_desc',[gain]) : loc('city_lumber_desc',[gain]);
                }
            },
            category: 'outskirts',
            reqs: {},
            not_trait: ['evil','cataclysm'],
            queue_complete(){ return 0; },
            cost: {
                Mana(){ return global.tech['conjuring'] && global.tech['conjuring'] >= 2 ? 1 : 0; },
            },
            action(args){
                if (!global.settings.pause){
                    if (global['resource']['Lumber'].amount < global['resource']['Lumber'].max){
                        modRes('Lumber',$(this)[0].val(true),true);
                    }
                    global.stats.clumber++;
                    global.stats.tlumber++;
                }
                return false;
            },
            val(spend){
                let gain = global.race['strong'] ? traits.strong.vars()[0] : 1;
                if (global.genes['enhance']){
                    gain *= 2;
                }
                if (global.tech['conjuring'] && global.tech['conjuring'] >= 2 && global.resource.Mana.amount >= 1){
                    gain *= 10;
                    if (global['resource']['Lumber'].amount < global['resource']['Lumber'].max && spend){
                        modRes('Mana',-1,true);
                    }
                }
                return gain;
            },
            touchlabel: loc(`harvest`)
        },
        stone: {
            id: 'city-stone',
            title(){
                if (global.tech['conjuring'] && global.tech['conjuring'] >= 2){
                    return loc(`city_conjour`,[global.resource.Stone.name]);
                }
                else {
                    return loc(`city_gather`,[global.resource.Stone.name]);
                }                
            },
            desc(){
                let gain = $(this)[0].val(false);
                if (global.tech['conjuring'] && global.tech['conjuring'] >= 2){
                    return loc('city_stone_conjour_desc',[gain,global.resource.Stone.name]);
                }
                else {
                    return loc(global.race['sappy'] ? 'city_amber_desc' : 'city_stone_desc',[gain,global.resource.Stone.name]);
                }                
            },
            category: 'outskirts',
            reqs: { primitive: 2 },
            not_trait: ['cataclysm','lone_survivor'],
            queue_complete(){ return 0; },
            cost: {
                Mana(){ return global.tech['conjuring'] && global.tech['conjuring'] >= 2 ? 1 : 0; },
            },
            action(args){
                if (!global.settings.pause){
                    if (global['resource']['Stone'].amount < global['resource']['Stone'].max){
                        modRes('Stone',$(this)[0].val(true),true);
                    }
                    global.stats.cstone++;
                    global.stats.tstone++;
                }
                return false;
            },
            val(spend){
                let gain = global.race['strong'] ? traits.strong.vars()[0] : 1;
                if (global.genes['enhance']){
                    gain *= 2;
                }
                if (global.tech['conjuring'] && global.tech['conjuring'] >= 2 && global.resource.Mana.amount >= 1){
                    gain *= 10;
                    if (global['resource']['Stone'].amount < global['resource']['Stone'].max && spend){
                        modRes('Mana',-1,true);
                    }
                }
                return gain;
            },
            touchlabel: loc(`harvest`)
        },
        chrysotile: {
            id: 'city-chrysotile',
            title(){
                if (global.tech['conjuring'] && global.tech['conjuring'] >= 2){
                    return loc('city_chrysotile_conjour');
                }
                else {
                    return loc(`city_gather`,[global.resource.Chrysotile.name]);
                }                
            },
            desc(){
                let gain = $(this)[0].val(false);
                if (global.tech['conjuring'] && global.tech['conjuring'] >= 2){
                    return loc('city_stone_conjour_desc',[gain,global.resource.Chrysotile.name]);
                }
                else {
                    return loc('city_stone_desc',[gain,global.resource.Chrysotile.name]);
                }                
            },
            category: 'outskirts',
            reqs: { primitive: 2 },
            trait: ['smoldering'],
            not_trait: ['cataclysm','lone_survivor'],
            queue_complete(){ return 0; },
            cost: {
                Mana(){ return global.tech['conjuring'] && global.tech['conjuring'] >= 2 ? 1 : 0; },
            },
            action(args){
                if (!global.settings.pause){
                    if (global['resource']['Chrysotile'].amount < global['resource']['Chrysotile'].max){
                        modRes('Chrysotile',$(this)[0].val(true),true);
                    }
                }
                return false;
            },
            val(spend){
                let gain = global.race['strong'] ? traits.strong.vars()[0] : 1;
                if (global.genes['enhance']){
                    gain *= 2;
                }
                if (global.tech['conjuring'] && global.tech['conjuring'] >= 2 && global.resource.Mana.amount >= 1){
                    gain *= 10;
                    if (global['resource']['Chrysotile'].amount < global['resource']['Chrysotile'].max && spend){
                        modRes('Mana',-1,true);
                    }
                }
                return gain;
            },
            touchlabel: loc(`harvest`)
        },
        slaughter: {
            id: 'city-slaughter',
            title: loc('city_evil'),
            desc(){
                if (global.race['soul_eater']){
                    return global.tech['primitive'] ? (global.resource.hasOwnProperty('furs') && global.resource.Furs.display ? loc('city_evil_desc3') : loc('city_evil_desc2')) : loc('city_evil_desc1');
                }
                else {
                    return global.resource.hasOwnProperty('furs') && global.resource.Furs.display ? loc('city_evil_desc4') : loc('city_evil_desc1');
                }
            },
            category: 'outskirts',
            reqs: {},
            trait: ['evil'],
            not_trait: ['kindling_kindred','smoldering','cataclysm'],
            queue_complete(){ return 0; },
            action(args){
                if (!global.settings.pause){
                    let gain = global.race['strong'] ? traits.strong.vars()[0] : 1;
                    if (global.genes['enhance']){
                        gain *= 2;
                    }
                    if (!global.race['smoldering']){
                        if (global['resource']['Lumber'].amount < global['resource']['Lumber'].max){
                            modRes('Lumber',gain,true);
                        }
                        global.stats.clumber++;
                        global.stats.tlumber++;
                    }
                    if (global.race['soul_eater']){
                        if (global.tech['primitive'] && global['resource']['Food'].amount < global['resource']['Food'].max){
                            modRes('Food',gain,true);
                        }
                        global.stats.cfood++;
                        global.stats.tfood++;
                    }
                    if (global.resource.Furs.display && global['resource']['Furs'].amount < global['resource']['Furs'].max){
                        modRes('Furs',gain,true);
                    }
                }
                return false;
            },
            touchlabel: loc(`kill`)
        },
        horseshoe: buildTemplate(`horseshoe`,'city'),
        bonfire: buildTemplate(`bonfire`,'city'),
        firework: buildTemplate(`firework`,'city'),
        slave_market: {
            id: 'city-slave_market',
            title(){ return loc('city_slaver_market',[global.resource.Slave.name]); },
            desc(){ return loc('city_slaver_market_desc',[global.resource.Slave.name]); },
            category: 'outskirts',
            reqs: { slaves: 2 },
            trait: ['slaver'],
            not_trait: ['cataclysm','lone_survivor'],
            inflation: false,
            cost: {
                Money(){ return 25000; },
            },
            queue_complete(){ return global.city['slave_pen'] ? global.city.slave_pen.count * 4 - global.resource.Slave.amount : 0; },
            action(args){
                if (global.city['slave_pen'] && global.city.slave_pen.count * 4 > global.resource.Slave.amount){
                    if (payCosts($(this)[0])){
                        global.resource.Slave.amount++;
                        return true;
                    }
                }
                return false;
            },
            touchlabel: loc(`purchase`)
        },
        s_alter: buildTemplate(`s_alter`,'city'),
        basic_housing: {
            id: 'city-basic_housing',
            title(){
                return housingLabel('small');
            },
            desc(){
                return $(this)[0].citizens() === 1 ? loc('city_basic_housing_desc') : loc('city_basic_housing_desc_plural',[$(this)[0].citizens()]);
            },
            category: 'residential',
            reqs: { housing: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){
                    offset = offset || 0;
                    if ((global.city['basic_housing'] ? global.city['basic_housing'].count : 0) + offset >= 5){
                        return costMultiplier('basic_housing', offset, 20, 1.17);
                    }
                    else {
                        return 0;
                    }
                },
                Lumber(offset){ return global.race['kindling_kindred'] || global.race['smoldering'] ? 0 : costMultiplier('basic_housing', offset, 10, 1.23); },
                Stone(offset){ return global.race['kindling_kindred'] ? costMultiplier('basic_housing', offset, 10, 1.23) : 0; },
                Chrysotile(offset){ return global.race['smoldering'] ? costMultiplier('basic_housing', offset, 10, 1.23) : 0; },
                Horseshoe(){ return global.race['hooved'] ? 1 : 0; }
            },
            effect(){
                let pop = $(this)[0].citizens();
                return global.race['sappy'] ? `<div>${loc('plus_max_resource',[pop,loc('citizen')])}</div><div>${loc('city_grove_effect',[2.5])}</div>` : loc('plus_max_resource',[pop,loc('citizen')]);
            },
            action(args){
                if (payCosts($(this)[0])){
                    global['resource'][global.race.species].display = true;
                    global['resource'][global.race.species].max += $(this)[0].citizens();
                    incrementStruct($(this)[0]);
                    global.settings.showCivic = true;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['basic_housing','city']
                };
            },
            citizens(){
                let pop = 1;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
            }
        },
        cottage: {
            id: 'city-cottage',
            title(){
                return housingLabel('medium');
            },
            desc(){
                return loc('city_cottage_desc',[$(this)[0].citizens()]);
            },
            category: 'residential',
            reqs: { housing: 2 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('cottage', offset, 900, 1.15); },
                Plywood(offset){ return costMultiplier('cottage', offset, 25, 1.25); },
                Brick(offset){ return costMultiplier('cottage', offset, 20, 1.25); },
                Wrought_Iron(offset){ return costMultiplier('cottage', offset, 15, 1.25); },
                Iron(offset){ return global.city.ptrait.includes('unstable') ? costMultiplier('cottage', offset, 5, 1.25) : 0; },
                Horseshoe(){ return global.race['hooved'] ? 2 : 0; }
            },
            effect(){
                let pop = $(this)[0].citizens();
                if (global.tech['home_safe']){
                    let safe = spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? 5000 : 2000) : 1000);
                    return `<div>${loc('plus_max_citizens',[pop])}</div><div>${loc('plus_max_resource',[`\$${safe.toLocaleString()}`,loc('resource_Money_name')])}</div>`;
                }
                else {
                    return loc('plus_max_citizens',[pop]);
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    global['resource'][global.race.species].max += $(this)[0].citizens();
                    incrementStruct('cottage','city');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['cottage','city']
                };
            },
            citizens(){
                let pop = 2;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
            }
        },
        apartment: {
            id: 'city-apartment',
            title(){
                return housingLabel('large');
            },
            desc(){
                return `<div>${loc('city_apartment_desc',[$(this)[0].citizens()])}</div><div class="has-text-special">${loc('requires_power')}</div>`
            },
            category: 'residential',
            reqs: { housing: 3 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('apartment', offset, 1750, 1.26) - 500; },
                Crystal(offset){ return global.race.universe === 'magic' ? costMultiplier('apartment', offset, 25, 1.22) : 0; },
                Furs(offset){ return costMultiplier('apartment', offset, 725, 1.32) - 500; },
                Copper(offset){ return costMultiplier('apartment', offset, 650, 1.32) - 500; },
                Cement(offset){ return costMultiplier('apartment', offset, 700, 1.32) - 500; },
                Steel(offset){ return costMultiplier('apartment', offset, 800, 1.32) - 500; },
                Horseshoe(){ return global.race['hooved'] ? 5 : 0; }
            },
            effect(){
                let extraVal = govActive('extravagant',2);
                let pop = $(this)[0].citizens();
                if (global.tech['home_safe']){
                    let safe = spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? 10000 : 5000) : 2000);
                    if (extraVal){
                        safe *= 2;
                    }
                    return `<div>${loc('plus_max_citizens',[pop])}. <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span></div><div>${loc('plus_max_resource',[`\$${safe.toLocaleString()}`,loc('resource_Money_name')])}</div>`;
                }
                else {
                    return `${loc('plus_max_citizens',[pop])}. <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span>`;
                }
            },
            powered(){
                let extraVal = govActive('extravagant',1);
                return powerCostMod(extraVal ? extraVal : 1);
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('apartment','city');
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
                    p: ['apartment','city']
                };
            },
            citizens(){
                let extraVal = govActive('extravagant',2);
                let pop = extraVal ? 5 + extraVal : 5;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
            }
        },
        lodge: {
            id: 'city-lodge',
            title: loc('city_lodge'),
            desc(){ return global.race['detritivore'] ? loc('city_lodge_desc_alt') : loc('city_lodge_desc'); },
            category: 'residential',
            reqs: { housing: 1, currency: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            condition(){
                return ((global.race['soul_eater'] || global.race['detritivore'] || global.race['artifical'] || global.race['unfathomable'] || global.race['forager']) && global.tech['s_lodge']) || (global.tech['hunting'] && global.tech['hunting'] >= 2) ? true : false;
            },
            cost: {
                Money(offset){ return costMultiplier('lodge', offset, 50, 1.32); },
                Lumber(offset){ return costMultiplier('lodge', offset, 20, 1.36); },
                Stone(offset){ return costMultiplier('lodge', offset, 10, 1.36); },
                Horseshoe(){ return global.race['hooved'] ? 1 : 0; }
            },
            effect(){
                let pop = $(this)[0].citizens();
                return global.race['carnivore'] && !global.race['artifical'] ? `<div>${loc('plus_max_resource',[pop,loc('citizen')])}</div><div>${loc('city_lodge_effect',[5])}</div>` : loc('plus_max_resource',[pop,loc('citizen')]);
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('lodge','city');
                    global['resource'][global.race.species].display = true;
                    global['resource'][global.race.species].max += 1;
                    global.settings.showCivic = true;
                    return true;
                }
                return false;
            },
            citizens(){
                let pop = 1;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['lodge','city']
                };
            }
        },
        smokehouse: {
            id: 'city-smokehouse',
            title(){ return global.race['hrt'] && ['wolven','vulpine'].includes(global.race['hrt']) ? loc('city_smokehouse_easter') : loc('city_smokehouse'); },
            desc: loc('city_smokehouse_desc'),
            category: 'trade',
            reqs: { hunting: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('smokehouse', offset, 85, 1.32); },
                Lumber(offset){ return costMultiplier('smokehouse', offset, 65, 1.36) },
                Stone(offset){ return costMultiplier('smokehouse', offset, 50, 1.36); }
            },
            effect(){
                let food = BHStorageMulti(spatialReasoning(100));
                return `<div>${loc('plus_max_resource',[food, global.resource.Food.name])}</div><div>${loc('city_smokehouse_effect',[10])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('smokehouse','city');
                    global['resource']['Food'].max += BHStorageMulti(spatialReasoning(100));
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['smokehouse','city']
                };
            }
        },
        soul_well: {
            id: 'city-soul_well',
            title: loc('city_soul_well'),
            desc: loc('city_soul_well_desc'),
            category: 'trade',
            reqs: { soul_eater: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){
                    offset = offset || 0;
                    if ((global.city['soul_well'] ? global.city['soul_well'].count : 0) + offset >= 3){
                        return costMultiplier('soul_well', offset, 50, 1.32);
                    }
                    else {
                        return 0;
                    }
                },
                Lumber(offset){ return costMultiplier('soul_well', offset, 20, 1.36); },
                Stone(offset){ return costMultiplier('soul_well', offset, 10, 1.36); }
            },
            effect(){
                let souls = BHStorageMulti(spatialReasoning(500));
                let production = global.race['ghostly'] ? (2 + traits.ghostly.vars()[1]) : 2;
                return `<div>${loc('city_soul_well_effect',[production])}</div><div>${loc('plus_max_resource',[souls, loc('resource_Souls_name')])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('soul_well','city');
                    global['resource']['Food'].max += BHStorageMulti(spatialReasoning(500));
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['soul_well','city']
                };
            }
        },
        slave_pen: {
            id: 'city-slave_pen',
            title(){ return loc('city_slave_housing',[global.resource.Slave.name]); },
            desc(){ return loc('city_slave_housing',[global.resource.Slave.name]); },
            category: 'commercial',
            reqs: { slaves: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('slave_pen', offset, 250, 1.32); },
                Lumber(offset){ return costMultiplier('slave_pen', offset, 100, 1.36); },
                Stone(offset){ return costMultiplier('slave_pen', offset, 75, 1.36); },
                Copper(offset){ return costMultiplier('slave_pen', offset, 10, 1.36); },
                Nanite(offset){ return global.race['deconstructor'] ? costMultiplier('slave_pen', offset, 4, 1.36) : 0; },
            },
            effect(){
                return `<div>${loc('plus_max_resource',[4,global.resource.Slave.name])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('slave_pen','city');
                    global.resource.Slave.display = true;
                    global.resource.Slave.max = global.city.slave_pen.count * 4;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['slave_pen','city']
                };
            }
        },
        transmitter: {
            id: 'city-transmitter',
            title: loc('city_transmitter'),
            desc(){ return `<div>${loc('city_transmitter_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            category: 'residential',
            reqs: { high_tech: 4 },
            trait: ['artifical'],
            cost: {
                Money(offset){ if (global.city['transmitter'] && global.city['transmitter'].count >= 3){ return costMultiplier('transmitter', offset, 50, 1.32);} else { return 0; } },
                Copper(offset){ return costMultiplier('transmitter', offset, 20, 1.36); },
                Steel(offset){ return costMultiplier('transmitter', offset, 10, 1.36); },
            },
            effect(){
                let signal = +(production('transmitter')).toFixed(2);
                let sig_cap = spatialReasoning(100);
                return `<div>${loc('gain',[signal, global.resource.Food.name])}</div><div>${loc('city_transmitter_effect',[sig_cap])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(0.5); },
            powerBalancer(){
                return [{ r: 'Food', k: 'lpmod' }];
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('transmitter','city');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['transmitter','city']
                };
            }
        },
        captive_housing: buildTemplate(`captive_housing`,'city'),
        farm: {
            id: 'city-farm',
            title(){ return structName('farm'); },
            desc: loc('city_farm_desc'),
            category: 'residential',
            reqs: { agriculture: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){
                    offset = offset || 0;
                    if ((global.city['farm'] ? global.city['farm'].count : 0) + offset >= 3){
                        return costMultiplier('farm', offset, 50, 1.32);
                    }
                    else {
                        return 0;
                    }
                },
                Lumber(offset){ return costMultiplier('farm', offset, 20, 1.36); },
                Stone(offset){ return costMultiplier('farm', offset, 10, 1.36); },
                Horseshoe(offset){ return global.race['hooved'] && ((global.city['farm'] ? global.city['farm'].count : 0) + (offset || 0)) >= 2 ? 1 : 0; }
            },
            effect(){
                let pop = $(this)[0].citizens();
                return global.tech['farm'] ? `<div>${loc('city_farm_effect')}</div><div>${loc('plus_max_resource',[pop,loc('citizen')])}</div>` : loc('city_farm_effect');
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('farm','city');
                    if(global.race['fasting']){
                        global.civic.farmer.display = false;
                        global.civic.farmer.assigned = 0;
                    }
                    else{
                        global.civic.farmer.display = true;
                    }
                    if (global.tech['farm']){
                        global['resource'][global.race.species].display = true;
                        global['resource'][global.race.species].max += $(this)[0].citizens();
                        global.settings.showCivic = true;
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['farm','city']
                };
            },
            citizens(){
                let pop = 1;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
            },
            flair(){ return global.tech.agriculture >= 7 ? loc('city_farm_flair2') : loc('city_farm_flair1'); }
        },
};

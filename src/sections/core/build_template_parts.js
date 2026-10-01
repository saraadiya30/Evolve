import { global } from '../../core/vars.js';
import { loc } from '../../core/locale.js';
import { hoovedRename, getShrineBonus } from '../../functions/run_stats_helpers.js';
import { eventActive } from '../../functions/event_dates.js';
import { costMultiplier } from '../../functions/cost_multipliers.js';
import { timeFormat } from '../../functions/time_format.js';
import { modRes } from '../../functions/resource_mod.js';
import { payCosts, dirt_adjust } from '../../actions/core/action_costs.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { traits, races } from '../../core/registries.js';
import { traitRank } from '../../races/trait_logic/trait_ranks.js';
import { blubberFill } from '../../races/powers/psychic_powers.js';
import { spatialReasoning } from '../../resources/resources.js';
import { incrementStruct } from '../../space/space_requirements.js';
import { defineIndustry } from '../../industry/industry_smelter.js';

// Bagian dari buildTemplate (evolution_screen.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function buildTemplate_s1($ctx){
        $ctx.tName = global.race['orbit_decay'] ? 'orbit_decayed' : (global.race['warlord'] ? 'warlord' :'cataclysm');

    $ctx.tKey = function(a,k,r){
        if (r === 'space' || r === 'portal'){
            if (a.hasOwnProperty('trait')){
                a.trait.push(k);
            }
            else {
                a['trait'] = [k];
            }
        }
        else if (r === 'tauceti'){
            a.reqs['isolation'] = 1;
        }
        else {
            if (a.hasOwnProperty('not_trait')){
                a.not_trait.push(k);
            }
            else {
                a['not_trait'] = [k];
            }
        }
        return a;
    };
}

export function buildTemplate_s2($ctx){
        switch ($ctx.key){
        case 'bonfire':
        {
            let action = {
                id: `${$ctx.region}-bonfire`,
                title: loc('city_bonfire'),
                desc: loc('city_bonfire_desc'),
                category: 'outskirts',
                wiki: false,
                reqs: { primitive: 3  },
                condition(){
                    return eventActive(`summer`);
                },
                queue_complete(){ return 0; },
                effect(){
                    let morale = (global.resource.Thermite.diff * 2.5) / (global.resource.Thermite.diff * 2.5 + 500) * 500;
                    let thermite = 100000 + global.stats.reset * 9000;
                    if (thermite > 1000000){ thermite = 1000000; }
                    let goal = global.resource.Thermite.amount < thermite ? `<div class="has-text-warning">${loc('city_bonfire_effect3',[(thermite).toLocaleString()])}</div><div class="has-text-caution">${loc('city_bonfire_effect4',[(+(global.resource.Thermite.amount).toFixed(0)).toLocaleString(),(thermite).toLocaleString()])}</div>` : ``;
                    return `<div>${loc(`city_bonfire_effect`,[global.resource.Thermite.diff])}</div><div>${loc(`city_bonfire_effect2`,[+(morale).toFixed(1)])}</div>${goal}`;
                },
                action(args){
                    return false;
                },
                flair(){
                    return loc(`city_bonfire_flair`);
                }
            };
            return {$r:  $ctx.tKey(action,$ctx.tName,$ctx.region)};
        }
        case 'firework':
        {
            let action = {
                id: `${$ctx.region}-firework`,
                title: loc('city_firework'),
                desc: loc('city_firework'),
                category: 'outskirts',
                wiki: false,
                reqs: { mining: 3 },
                condition(){
                    return eventActive(`firework`) && global[$ctx.region].firework && (global.tech['cement'] || global.race['flier']);
                },
                cost: {
                    Money(){ return global[$ctx.region].firework.count === 0 ? 50000 : 0; },
                    Iron(){ return global[$ctx.region].firework.count === 0 ? 7500 : 0; },
                    Cement(){ return global[$ctx.region].firework.count === 0 ? 10000 : 0; }
                },
                queue_complete(){ return 1 - global[$ctx.region].firework.count; },
                switchable(){ return true; },
                effect(){
                    return global[$ctx.region].firework.count === 0 ? loc(`city_firework_build`) : loc(`city_firework_effect`);
                },
                action(args){
                    if (global[$ctx.region].firework.count === 0 && payCosts($(this)[0])){
                        global[$ctx.region].firework.count = 1;
                        return true;
                    }
                    return false;
                }
            };
            return {$r:  $ctx.tKey(action,$ctx.tName,$ctx.region)};
        }
        case 'assembly':
        {
            let assemblyCostAdjust = function(v){
                let cost = highPopAdjust(v);
                if (global.race['promiscuous']){
                    cost /= 1 + traits.promiscuous.vars()[1] * global.race['promiscuous'];
                }
                return Math.round(cost);
            }
            let action = {
                id: `${$ctx.region}-assembly`,
                title: loc('city_assembly'),
                desc(){ return loc('city_assembly_desc',[races[global.race.species].name]); },
                category: 'military',
                reqs: {},
                trait: ['artifical'],
                queue_complete(){ return global.resource[global.race.species].max - global.resource[global.race.species].amount; },
                cost: {
                    Money(offset){ return global['resource'][global.race.species].amount ? costMultiplier('citizen', offset, assemblyCostAdjust(125), 1.01) : 0; },
                    Copper(offset){ return global.race['deconstructor'] ? 0 : global['resource'][global.race.species].amount >= 5 ? costMultiplier('citizen', offset, assemblyCostAdjust(50), 1.01) : 0; },
                    Aluminium(offset){ return global.race['deconstructor'] ? 0 : global['resource'][global.race.species].amount >= 5 ? costMultiplier('citizen', offset, assemblyCostAdjust(50), 1.01) : 0; },
                    Nanite(offset){ return global.race['deconstructor'] ? (global['resource'][global.race.species].amount >= 3 ? costMultiplier('citizen', offset, assemblyCostAdjust(500), 1.01) : 0) : 0; },
                },
                effect(){
                    let warn = '';
                    if (global['resource'][global.race.species].max === global['resource'][global.race.species].amount){
                        warn = `<div class="has-text-caution">${loc('city_assembly_effect_warn')}</div>`;
                    }
                    else if (global.race['parasite']){
                        let buffer = 6;
                        switch (traitRank('parasite')){
                            case 0.25:
                                buffer = 5;
                                break;
                            case 0.5:   
                                buffer = 4;
                                break;
                            case 1:
                            case 2:
                            case 3:
                            case 4:
                                buffer = 4 - traitRank('parasite');
                                break;
                        }
                        if (global.race['last_assembled'] && global.race.last_assembled + buffer >= global.stats.days){
                            warn = `<div class="has-text-caution">${loc('city_assembly_effect_parasite',[global.race.last_assembled + buffer + 1 - global.stats.days])}</div>`;
                        }
                        else {
                            warn = `<div class="has-text-success">${loc('city_assembly_effect_parasite_ok')}</div>`;
                        }
                    }
                    return `<div>${loc('city_assembly_effect',[races[global.race.species].name])}</div>${warn}`;
                },
                action(args){
                    if (global.race['parasite'] && (global.race['cataclysm'] || global.race['orbit_decayed'])){
                        let buffer = 6;
                        switch (traitRank('parasite')){
                            case 0.25:
                                buffer = 5;
                                break;
                            case 0.5:   
                                buffer = 4;
                                break;
                            case 1:
                            case 2:
                            case 3:
                            case 4:
                                buffer = 4 - traitRank('parasite');
                                break;
                        }
                        if (global.race['last_assembled'] && global.race.last_assembled + buffer >= global.stats.days){
                            return false;
                        }
                    }
                    if (global.race['vax'] && global.race.vax >= 100){
                        return true;
                    }
                    else if (global['resource'][global.race.species].max > global['resource'][global.race.species].amount && payCosts($(this)[0])){
                        global['resource'][global.race.species].amount++;
                        global.civic[global.civic.d_job].workers++;
                        global.race['last_assembled'] = global.stats.days;
                        return true;
                    }
                    return false;
                }
            };
            return {$r:  $ctx.tKey(action,$ctx.tName,$ctx.region)};
        }
        case 'nanite_factory':
        {
            let action = {
                id: `${$ctx.region}-nanite_factory`,
                title: loc('city_nanite_factory'),
                desc: loc('city_nanite_factory'),
                category: 'industrial',
                reqs: {},
                trait: ['deconstructor'],
                region: 'city',
                cost: {
                    Money(offset){ return costMultiplier('nanite_factory', offset, 25000, dirt_adjust(1.25)); },
                    Copper(offset){ return costMultiplier('nanite_factory', offset, 1200, dirt_adjust(1.25)); },
                    Steel(offset){ return costMultiplier('nanite_factory', offset, 1000, dirt_adjust(1.25)); }
                },
                effect(){
                    let val = spatialReasoning(2500);
                    return `<div>${loc('city_nanite_factory_effect',[global.resource.Nanite.name])}</div><div>${loc('plus_max_resource',[val,global.resource.Nanite.name])}.</div>`;
                },
                special: true,
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct('nanite_factory','city');
                        if (global.city.nanite_factory.count === 1){
                            global.settings.showIndustry = true;
                            defineIndustry();
                        }
                        return true;
                    }
                    return false;
                },
                flair: loc(`city_nanite_factory_flair`)
            };
            return {$r:  $ctx.tKey(action,$ctx.tName,$ctx.region)};
        }
        case 'captive_housing':
        {
            let action = {
                id: `${$ctx.region}-captive_housing`,
                title: loc('city_captive_housing'),
                desc: loc('city_captive_housing_desc'),
                category: 'residential',
                reqs: { unfathomable: 1 },
                trait: ['unfathomable'],
                region: 'city',
                cost: {
                    Money(offset){ return costMultiplier('captive_housing', offset, 40, 1.35); },
                    Lumber(offset){ return costMultiplier('captive_housing', offset, 30, 1.35); },
                    Stone(offset){ return costMultiplier('captive_housing', offset, 18, 1.35); },
                },
                effect(){
                    let desc = ``;
                    if (!global.race['artifical'] && !global.race['detritivore'] && !global.race['carnivore'] && !global.race['soul_eater']){
                        let cattle = global.city.hasOwnProperty('captive_housing') ? global.city.captive_housing.cattle : 0;
                        let cattleCap = global.city.hasOwnProperty('captive_housing') ? global.city.captive_housing.cattleCap : 0;
                        desc += `<div>${loc(`city_captive_housing_cattle`,[cattle,cattleCap])}</div>`;
                    }

                    let usedCap = 0;
                    if (global.city.hasOwnProperty('surfaceDwellers')){
                        for (let i = 0; i < global.city.surfaceDwellers.length; i++){
                            let r = global.city.surfaceDwellers[i];
                            let mindbreak = global.city.captive_housing[`race${i}`];
                            let jailed = global.city.captive_housing[`jailrace${i}`];
                            usedCap += mindbreak + jailed;
                            desc += `<div>${loc(`city_captive_housing_broken`,[races[r].name,mindbreak])}</div>`;
                            desc += `<div>${loc(`city_captive_housing_untrained`,[races[r].name,jailed])}</div>`;
                        }
                    }

                    let raceCap = global.city.hasOwnProperty('captive_housing') ? global.city.captive_housing.raceCap : 0;
                    desc += `<div>${loc(`city_captive_housing_capacity`,[usedCap,raceCap])}</div>`;
                    if (global.tech['unfathomable'] && global.tech.unfathomable >= 2){
                        desc += `<div>${loc(`plus_max_resource`,[1,loc('job_torturer')])}</div>`;
                    }
                    return desc;
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct('captive_housing','city');
                        let houses = global.city.captive_housing.count;
                        global.city.captive_housing.raceCap = houses * (global.tech['unfathomable'] && global.tech.unfathomable >= 3 ? 3 : 2);
                        global.city.captive_housing.cattleCap = houses * 5;
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: {
                            count: 0, cattle: 0, cattleCatch: 0,
                            race0: 0, jailrace0: 0,
                            race1: 0, jailrace1: 0,
                            race2: 0, jailrace2: 0,
                            raceCap: 0, cattleCap: 0,
                        },
                        p: ['captive_housing','city']
                    };
                },
            };
            return {$r:  $ctx.tKey(action,$ctx.tName,$ctx.region)};
        }
        case 'horseshoe':
        {
            let action = {
                id: `${$ctx.region}-horseshoe`,
                title(){ return loc(`city_${hoovedRename(true)}`,[hoovedRename(false)]); },
                desc(){ return loc(`city_${hoovedRename(true)}_desc`,[hoovedRename(false)]); },
                category: 'outskirts',
                reqs: { primitive: 3 },
                condition(){
                    return global.race['hooved'] || eventActive('fool',2023);
                },
                inflation: false,
                cost: {
                    Lumber(offset){
                        let shoes = (global.race['shoecnt'] || 0) + (offset || 0);
                        let active = !global.race['kindling_kindred'] && !global.race['smoldering']
                            && (!global.resource.Copper.display || shoes <= 12) ? true : false;
                        return active ? Math.round((shoes > 12 ? 25 : 5) * (shoes <= 5 ? 1 : shoes - 4) * (traits.hooved.vars()[0] / 100)) : 0;
                    },
                    Copper(offset){
                        let shoes = (global.race['shoecnt'] || 0) + (offset || 0);
                        let lum = (global.race['kindling_kindred'] || global.race['smoldering']) ? false : true;
                        let active = (!lum || (lum && shoes > 12 && global.resource.Copper.display))
                            && (!global.resource.Iron.display || shoes <= 75) ? true : false;
                        return active ? Math.round((shoes > 75 ? 20 : 5) * (shoes <= 12 ? 1 : shoes - 11) * (traits.hooved.vars()[0] / 100)) : 0;
                    },
                    Iron(offset){
                        let shoes = (global.race['shoecnt'] || 0) + (offset || 0);
                        return global.resource.Iron.display && shoes > 75 && (!global.resource.Steel.display || shoes <= 150) ? Math.round((shoes <= 150 ? 12 : 28) * shoes * (traits.hooved.vars()[0] / 100)) : 0;
                    },
                    Steel(offset){
                        let shoes = (global.race['shoecnt'] || 0) + (offset || 0);
                        return global.resource.Steel.display && shoes > 150 && (!global.resource.Adamantite.display || shoes <= 500) ? Math.round((shoes <= 500 ? 40 : 100) * shoes * (traits.hooved.vars()[0] / 100)) : 0;
                    },
                    Adamantite(offset){
                        let shoes = (global.race['shoecnt'] || 0) + (offset || 0);
                        return global.resource.Adamantite.display && shoes > 500 && (!global.resource.Orichalcum.display || shoes <= 5000) ? Math.round((shoes <= 5000 ? 5 : 25) * shoes * (traits.hooved.vars()[0] / 100)) : 0;
                    },
                    Orichalcum(offset){
                        let shoes = (global.race['shoecnt'] || 0) + (offset || 0);
                        return global.resource.Orichalcum.display && shoes > 5000 ? Math.round((25 * shoes - 120000) * (traits.hooved.vars()[0] / 100)) : 0;
                    }
                },
                action(args){
                    if (!global.race['hooved'] && eventActive('fool',2023)){
                        return true;
                    }
                    if (global.resource.Horseshoe.display && payCosts($(this)[0])){
                        global.resource.Horseshoe.amount++;
                        global.race.shoecnt++;

                        if ((global.race.shoecnt === 5001 && global.resource.Orichalcum.display) ||
                            (global.race.shoecnt === 501 && global.resource.Adamantite.display) ||
                            (global.race.shoecnt === 151 && global.resource.Steel.display) ||
                            (global.race.shoecnt === 76 && global.resource.Iron.display) ||
                            (global.race.shoecnt === 13 && global.resource.Copper.display && global.resource.Lumber.display)){
                            return 0;
                        }
                        return true;
                    }
                    return false;
                }
            };
            return {$r:  $ctx.tKey(action,$ctx.tName,$ctx.region)};
        }
        case 's_alter':   
        {
            let action = {
                id: `${$ctx.region}-s_alter`,
                title: loc('city_s_alter'),
                desc(){
                    return global.city.hasOwnProperty('s_alter') && global.city['s_alter'].count >= 1 ? `<div>${loc('city_s_alter')}</div><div class="has-text-special">${loc('city_s_alter_desc')}</div>` : loc('city_s_alter');
                },
                category: 'outskirts',
                reqs: { mining: 1 },
                trait: ['cannibalize'],
                not_trait: ['cataclysm','lone_survivor'],
                inflation: false,
                region: 'city',
                cost: {
                    Stone(offset){ return ((offset || 0) + (global.city.hasOwnProperty('s_alter') ? global.city['s_alter'].count : 0)) >= 1 ? 0 : 100; }
                },
                effect(){
                    let sacrifices = global.civic[global.civic.d_job] ? global.civic[global.civic.d_job].workers : 0;
                    let desc = `<div class="has-text-caution">${loc('city_s_alter_sacrifice',[sacrifices])}</div>`;
                    if (global.city.hasOwnProperty('s_alter') && global.city.s_alter.rage > 0){
                        desc = desc + `<div>${loc('city_s_alter_rage',[traits.cannibalize.vars()[0],timeFormat(global.city.s_alter.rage)])}</div>`;
                    }
                    if (global.city.hasOwnProperty('s_alter') && global.city.s_alter.regen > 0){
                        desc = desc + `<div>${loc('city_s_alter_regen',[traits.cannibalize.vars()[0],timeFormat(global.city.s_alter.regen)])}</div>`;
                    }
                    if (global.city.hasOwnProperty('s_alter') && global.city.s_alter.mind > 0){
                        desc = desc + `<div>${loc('city_s_alter_mind',[traits.cannibalize.vars()[0],timeFormat(global.city.s_alter.mind)])}</div>`;
                    }
                    if (global.city.hasOwnProperty('s_alter') && global.city.s_alter.mine > 0){
                        desc = desc + `<div>${loc('city_s_alter_mine',[traits.cannibalize.vars()[0],timeFormat(global.city.s_alter.mine)])}</div>`;
                    }
                    if (global.city.hasOwnProperty('s_alter') && global.city.s_alter.harvest > 0){
                        let jobType = global.race['evil'] && !global.race['soul_eater'] ? loc('job_reclaimer') : loc('job_lumberjack');
                        desc = desc + `<div>${loc('city_s_alter_harvest',[traits.cannibalize.vars()[0],timeFormat(global.city.s_alter.harvest),jobType])}</div>`;
                    }
                    return desc;
                },
                action(args){
                    if (payCosts($(this)[0])){
                        if (global.city['s_alter'].count === 0){
                            incrementStruct('s_alter','city');
                        }
                        else {
                            let sacrifices = global.civic[global.civic.d_job].workers;
                            if (sacrifices > 0){
                                global.resource[global.race.species].amount--;
                                global.civic[global.civic.d_job].workers--;
                                global.stats.sac++;
                                blubberFill(1);
                                modRes('Food', Math.rand(250,1000), true);
                                let low = 300;
                                let high = 600;
                                if (global.tech['sacrifice']){
                                    switch (global.tech['sacrifice']){
                                        case 1:
                                            low = 600;
                                            high = 1500;
                                            break;
                                        case 2:
                                            low = 1800;
                                            high = 3600;
                                            break;
                                        case 3:
                                            low = 5400;
                                            high = 16200;
                                            break;
                                    }
                                }
                                switch (global.race['kindling_kindred'] || global.race['smoldering'] ? Math.rand(0,4) : Math.rand(0,5)){
                                    case 0:
                                        global.city.s_alter.rage += Math.rand(low,high);
                                        break;
                                    case 1:
                                        global.city.s_alter.mind += Math.rand(low,high);
                                        break;
                                    case 2:
                                        global.city.s_alter.regen += Math.rand(low,high);
                                        break;
                                    case 3:
                                        global.city.s_alter.mine += Math.rand(low,high);
                                        break;
                                    case 4:
                                        global.city.s_alter.harvest += Math.rand(low,high);
                                        break;
                                }
                            }
                        }
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: {
                            count: 0,
                            rage: 0,
                            mind: 0,
                            regen: 0,
                            mine: 0,
                            harvest: 0,
                        },
                        p: ['s_alter','city']
                    };
                },
                touchlabel: loc(`tech_dist_sacrifice`)
            };
            return {$r:  $ctx.tKey(action,$ctx.tName,$ctx.region)};
        }
        case 'shrine':
        {
            let action = {
                id: `${$ctx.region}-shrine`,
                title: loc('city_shrine'),
                desc(){
                    return global.race['warlord'] ? loc('city_shrine_warlord_desc') : loc('city_shrine_desc');
                },
                category: 'commercial',
                reqs: { theology: 2 },
                trait: ['magnificent'],
                not_trait: ['cataclysm','lone_survivor'],
                region: 'city',
                cost: {
                    Money(offset){ return costMultiplier('shrine', offset, 75, 1.32); },
                    Stone(offset){ return costMultiplier('shrine', offset, 65, 1.32); },
                    Furs(offset){ return costMultiplier('shrine', offset, 10, 1.32); },
                    Copper(offset){ return costMultiplier('shrine', offset, 15, 1.32); }
                },
                effect(){
                    let morale = getShrineBonus('morale');
                    let metal = getShrineBonus('metal');
                    let know = getShrineBonus('know');
                    let tax = getShrineBonus('tax');
    
                    let desc = `<div class="has-text-special">${loc('city_shrine_effect')}</div>`;
                    if (global.city['shrine'] && morale.active){
                        desc = desc + `<div>${loc('city_shrine_morale',[+(morale.add).toFixed(1)])}</div>`;
                    }
                    if (global.city['shrine'] && metal.active){
                        desc = desc + `<div>${loc('city_shrine_metal',[+((metal.mult - 1) * 100).toFixed(2)])}</div>`;
                    }
                    if (global.city['shrine'] && know.active){
                        desc = desc + `<div>${loc('city_shrine_know',[(+(know.add).toFixed(1)).toLocaleString()])}</div>`;
                        desc = desc + `<div>${loc(global.race['warlord'] ? 'city_shrine_warlord' : 'city_shrine_know2',[+((know.mult - 1) * 100).toFixed(1)])}</div>`;
                    }
                    if (global.city['shrine'] && tax.active){
                        desc = desc + `<div>${loc('city_shrine_tax',[+((tax.mult - 1) * 100).toFixed(1)])}</div>`;
                    }
                    return desc;
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct('shrine','city');
                        if (global.city.calendar.moon > 0 && global.city.calendar.moon < 7){
                            global.city.shrine.morale++;
                        }
                        else if (global.city.calendar.moon > 7 && global.city.calendar.moon < 14){
                            global.city.shrine.metal++;
                        }
                        else if (global.city.calendar.moon > 14 && global.city.calendar.moon < 21){
                            global.city.shrine.know++;
                        }
                        else if (global.city.calendar.moon > 21){
                            global.city.shrine.tax++;
                        }
                        else {
                            global.city.shrine.cycle++;
                        }
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: {
                            count: 0,
                            morale: 0,
                            metal: 0,
                            know: 0,
                            tax: 0,
                            cycle: 0,
                        },
                        p: ['shrine','city']
                    };
                },
            };
            return {$r:  $ctx.tKey(action,$ctx.tName,$ctx.region)};
        }
        case 'meditation':
        {
            let action = {
                id: `${$ctx.region}-meditation`,
                title: loc('city_meditation'),
                desc: loc('city_meditation'),
                category: 'commercial',
                reqs: { primitive: 3 },
                trait: ['calm'],
                not_trait: ['cataclysm','lone_survivor'],
                region: 'city',
                cost: {
                    Money(offset){ return costMultiplier('meditation', offset, 50, 1.2); },
                    Stone(offset){ return costMultiplier('meditation', offset, 25, 1.2); },
                    Furs(offset){ return costMultiplier('meditation', offset, 8, 1.2); }
                },
                effect(){
                    let zen = global.resource.Zen.amount / (global.resource.Zen.amount + 5000);
                    return `<div>${loc(`city_meditation_effect`,[traits.calm.vars()[0]])}</div><div class="has-text-special">${loc(`city_meditation_effect2`,[2])}</div><div class="has-text-special">${loc(`city_meditation_effect3`,[1])}</div><div>${loc(`city_meditation_effect4`,[`${(zen * 100).toFixed(2)}%`])}</div>`;
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct('meditation','city');
                        global.resource.Zen.max += traits.calm.vars()[0];
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['meditation','city']
                    };
                },
            };
            return {$r:  $ctx.tKey(action,$ctx.tName,$ctx.region)};
        }
    }
}

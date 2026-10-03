import { loc } from '../core/locale.js';
import { global, p_on, sizeApproximation, gal_on } from '../core/vars.js';
import { payCosts, powerOnNewStruct, initStruct } from '../actions/actions.js';
import { messageQueue, powerCostMod, spaceCostMultiplier, clearPopper, popCost } from '../functions/functions.js';
import { spatialReasoning, drawResourceTab } from '../resources/resources.js';
import { incrementStruct } from '../space/space.js';
import { traits } from '../races/races.js';
import { loadTab } from '../core/index.js';
import { fortressModules } from './portal_registry.js';
import { spireCreep, renderFortress } from './portal.js';

// Region 'prtl_lake' dari fortressModules (dipisah dari portal.js). Isi sama persis; digabung via portal_registry.js di portal.js.
export const fortressModules_prtl_lake = {
        info: {
            name: loc('portal_lake_name'),
            desc: loc('portal_lake_desc'),
            support: 'harbor',
        },
        lake_mission: {
            id: 'portal-lake_mission',
            title: loc('portal_lake_mission_title'),
            desc: loc('portal_lake_mission_title'),
            reqs: { hell_lake: 1 },
            grant: ['hell_lake',2],
            queue_complete(){ return global.tech.hell_lake >= 2 ? 0 : 1; },
            cost: {
                Money(){ return 500000000; },
                Oil(){ return 750000; },
                Helium_3(){ return 600000; }
            },
            effect: loc('portal_lake_mission_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('portal_lake_mission_result'),'info',false,['progress','hell']);
                    return true;
                }
                return false;
            }
        },
        harbor: {
            id: 'portal-harbor',
            title(){ return loc('portal_harbor_title'); },
            desc(){
                return `<div>${loc('portal_harbor_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_lake: 3 },
            powered(wiki){
                let num_cooling_tower = wiki ? (global.portal?.cooling_tower?.on ?? 0) : p_on['cooling_tower'];
                let factor = num_cooling_tower || 0;
                return +(powerCostMod(500 * (0.92 ** factor))).toFixed(2);
            },
            support(){ return 1; },
            cost: {
                Money(offset){ return spaceCostMultiplier('harbor', offset, 225000000, spireCreep(1.18), 'portal'); },
                Cement(offset){ return spaceCostMultiplier('harbor', offset, 50000000, spireCreep(1.18), 'portal'); },
                Iridium(offset){ return spaceCostMultiplier('harbor', offset, 7500000, spireCreep(1.18), 'portal'); },
                Infernite(offset){ return spaceCostMultiplier('harbor', offset, 800000, spireCreep(1.18), 'portal'); },
                Stanene(offset){ return spaceCostMultiplier('harbor', offset, 17500000, spireCreep(1.18), 'portal'); },
            },
            wide: true,
            res(){
                let list = [
                    'Oil','Alloy','Polymer','Iridium','Helium_3','Deuterium','Neutronium','Adamantite',
                    'Infernite','Nano_Tube','Graphene','Stanene','Bolognium','Orichalcum'
                ];
                if (global.race['warlord']){
                    list.push('Lumber');
                    list.push('Stone');
                    list.push('Copper');
                    list.push('Iron');
                    list.push('Aluminium');
                    list.push('Cement');
                    list.push('Steel');
                    list.push('Titanium');
                    list.push('Coal');
                }
                return list;
            },
            val(res){
                switch (res){
                    case 'Oil':
                        return 30000;
                    case 'Alloy':
                        return 250000;
                    case 'Polymer':
                        return 250000;
                    case 'Iridium':
                        return 200000;
                    case 'Helium_3':
                        return 18000;
                    case 'Deuterium':
                        return 12000;
                    case 'Neutronium':
                        return 180000;
                    case 'Adamantite':
                        return 150000;
                    case 'Infernite':
                        return 75000;
                    case 'Nano_Tube':
                        return 750000;
                    case 'Graphene':
                        return 1200000;
                    case 'Stanene':
                        return 1200000;
                    case 'Bolognium':
                        return 130000;
                    case 'Orichalcum':
                        return 130000;
                    case 'Lumber':
                        return 1500000;
                    case 'Stone':
                        return 1500000;
                    case 'Copper':
                        return 650000;
                    case 'Iron':
                        return 650000;
                    case 'Steel':
                        return 650000;
                    case 'Aluminium':
                        return 425000;
                    case 'Titanium':
                        return 350000;
                    case 'Cement':
                        return 550000;
                    case 'Coal':
                        return 275000;
                    default:
                        return 0;
                }
            },
            effect(wiki){
                let storage = '<div class="aTable">';
                let multiplier = 1;
                if (global.race['warlord'] && global.eden['corruptor'] && global.tech?.asphodel >= 12){
                    multiplier *= 1 + (p_on['corruptor'] || 0) * (global.tech?.asphodel >= 13 ? 0.12 : 0.1);
                }
                for (const res of $(this)[0].res()){
                    if (global.resource[res].display){
                        let val = sizeApproximation(+(spatialReasoning($(this)[0].val(res) * multiplier)).toFixed(0),1);
                        storage = storage + `<span>${loc('plus_max_resource',[val,global.resource[res].name])}</span>`;
                    }
                };
                storage = storage + '</div>';
                return `<div>${loc('portal_harbor_effect',[1])}</div>${storage}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered(wiki)])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('harbor','portal');
                    if (powerOnNewStruct($(this)[0])){
                        let multiplier = 1;
                        if (global.race['warlord'] && global.eden['corruptor'] && global.tech?.asphodel >= 12){
                            multiplier *= 1 + (p_on['corruptor'] || 0) * (global.tech?.asphodel >= 13 ? 0.12 : 0.1);
                        }
                        for (const res of $(this)[0].res()){
                            if (global.resource[res].display){
                                global.resource[res].max += (spatialReasoning($(this)[0].val(res) * multiplier));
                            }
                        };
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['harbor','portal']
                };
            },
        },
        cooling_tower: {
            id: 'portal-cooling_tower',
            title: loc('portal_cooling_tower_title'),
            desc(){
                return `<div>${loc('portal_cooling_tower_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_lake: 6 },
            powered(){ return powerCostMod(10); },
            cost: {
                Money(offset){ return spaceCostMultiplier('cooling_tower', offset, 250000000, 1.2, 'portal'); },
                Polymer(offset){ return spaceCostMultiplier('cooling_tower', offset, 12000000, 1.2, 'portal'); },
                Orichalcum(offset){ return spaceCostMultiplier('cooling_tower', offset, 8500000, 1.2, 'portal'); },
                Brick(offset){ return spaceCostMultiplier('cooling_tower', offset, 250000, 1.2, 'portal'); },
            },
            effect(){
                return `<div>${loc('portal_cooling_tower_effect',[8])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('cooling_tower','portal');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['cooling_tower','portal']
                };
            },
        },
        bireme: {
            id: 'portal-bireme',
            title: loc('portal_bireme_title'),
            desc(){
                return `<div>${loc('portal_bireme_title')}</div><div class="has-text-special">${loc('space_support',[loc('lake')])}</div>`;
            },
            reqs: { hell_lake: 4 },
            powered(){ return 0; },
            s_type: 'lake',
            support(){ return -1; },
            cost: {
                Money(offset){ return spaceCostMultiplier('bireme', offset, 190000000, 1.24, 'portal'); },
                Helium_3(offset){ return spaceCostMultiplier('bireme', offset, 225000, 1.24, 'portal'); },
                Adamantite(offset){ return spaceCostMultiplier('bireme', offset, 15000000, 1.24, 'portal'); },
                Nano_Tube(offset){ return spaceCostMultiplier('bireme', offset, 18000000, 1.24, 'portal'); },
                Soul_Gem(offset){ return spaceCostMultiplier('bireme', offset, 10, 1.24, 'portal'); },
                Scarletite(offset){ return spaceCostMultiplier('bireme', offset, 125000, 1.24, 'portal'); },
            },
            effect(){
                let rating = global.blood['spire'] && global.blood.spire >= 2 ? 20 : 15;
                return `<div class="has-text-caution">${loc('space_used_support',[loc('lake')])}</div><div>${loc('portal_bireme_effect',[rating])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil()])}</div>`;
            },
            ship: {
                civ(){ return 0; },
                mil(){ return global.race['high_pop'] ? traits.high_pop.vars()[0] * 2 : 2; },
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('bireme','portal');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0, mil: 0 },
                    p: ['bireme','portal']
                };
            }
        },
        transport: {
            id: 'portal-transport',
            title(){ return loc('portal_transport_title'); },
            desc(){
                return `<div>${loc('portal_transport_title')}</div><div class="has-text-special">${loc('space_support',[loc('lake')])}</div>`;
            },
            reqs: { hell_lake: 5 },
            powered(){ return 0; },
            s_type: 'lake',
            support(){ return -1; },
            cost: {
                Money(offset){ return spaceCostMultiplier('transport', offset, 300000000, 1.22, 'portal'); },
                Oil(offset){ return spaceCostMultiplier('transport', offset, 180000, 1.22, 'portal'); },
                Alloy(offset){ return spaceCostMultiplier('transport', offset, 18000000, 1.22, 'portal'); },
                Graphene(offset){ return spaceCostMultiplier('transport', offset, 12500000, 1.22, 'portal'); },
                Soul_Gem(offset){ return spaceCostMultiplier('transport', offset, 5, 1.22, 'portal'); },
                Scarletite(offset){ return spaceCostMultiplier('transport', offset, 250000, 1.22, 'portal'); },
            },
            effect(wiki){
                let rating = global.blood['spire'] && global.blood.spire >= 2 ? 0.8 : 0.85;
                let num_on = wiki ? (global.portal?.bireme?.on ?? 0) : gal_on['bireme'];
                let bireme = +((rating ** num_on) * 100).toFixed(1);
                return `<div class="has-text-caution">${loc('space_used_support',[loc('lake')])}</div><div>${loc('portal_transport_effect',[global.stats.achieve['what_is_best'] && global.stats.achieve.what_is_best.e >= 4 ? 8 : 5])}</div><div class="has-text-danger">${loc('portal_transport_effect2',[bireme])}</div><div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ()])}</div>`;
            },
            special: true,
            sAction(){
                global.settings.civTabs = 4;
                global.settings.marketTabs = 3;
                if (!global.settings.tabLoad){
                    loadTab('mTabResource');
                    clearPopper(`portal-transport`);
                }
            },
            ship: {
                civ(){ return global.race['high_pop'] ? traits.high_pop.vars()[0] * 3 : 3; },
                mil(){ return 0; },
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('transport','portal');
                    powerOnNewStruct($(this)[0]);
                    if (!global.settings.portal.spire){
                        global.settings.portal.spire = true;
                        global.settings.showCargo = true;
                        global.tech['hell_spire'] = 1;
                        initStruct(fortressModules.prtl_spire.purifier);
                        initStruct(fortressModules.prtl_spire.port);
                        messageQueue(loc('portal_transport_unlocked'),'info',false,['progress','hell']);
                        drawResourceTab('supply');
                        renderFortress();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: {
                        count: 0, on: 0, crew: 0, mil: 0,
                        cargo: {
                            used: 0, max: 0,
                            Crystal: 0, Lumber: 0,
                            Stone: 0, Furs: 0,
                            Copper: 0, Iron: 0,
                            Aluminium: 0, Cement: 0,
                            Coal: 0, Oil: 0,
                            Uranium: 0, Steel: 0,
                            Titanium: 0, Alloy: 0,
                            Polymer: 0, Iridium: 0,
                            Helium_3: 0, Deuterium: 0,
                            Neutronium: 0, Adamantite: 0,
                            Infernite: 0, Elerium: 0,
                            Nano_Tube: 0, Graphene: 0,
                            Stanene: 0, Bolognium: 0,
                            Vitreloy: 0, Orichalcum: 0,
                            Plywood: 0, Brick: 0,
                            Wrought_Iron: 0, Sheet_Metal: 0,
                            Mythril: 0, Aerogel: 0,
                            Nanoweave: 0, Scarletite: 0
                        }
                    },
                    p: ['transport','portal']
                };
            }
        },
        oven: {
            id: 'portal-oven',
            title: loc('portal_oven_title'),
            desc(wiki){
                if (!global.portal.hasOwnProperty('oven') || global.portal.oven.count < 100 || wiki){
                    return `<div>${loc('portal_oven_title')}</div><div class="has-text-special">${loc('requires_segments', [100])}</div>` + (global.portal.hasOwnProperty('oven') && global.portal.oven.count >= 100 ? `<div class="has-text-special">${loc('requires_power')}</div>` : ``);
                }
            },
            reqs: { dish:2 },
            condition(){
                return global.portal.oven.count < 100;
            },
            queue_size: 10,
            queue_complete(){ return 100 - global.portal.oven.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('oven') ? global.portal.oven.count : 0)) < 100 ? 190000000 : 0; },
                Steel(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('oven') ? global.portal.oven.count : 0)) < 100 ? 2000000 : 0; },
                Infernite(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('oven') ? global.portal.oven.count : 0)) < 100 ? 600000 : 0; },
                Bolognium(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('oven') ? global.portal.oven.count : 0)) < 100 ? 1000000 : 0; },
                Scarletite(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('oven') ? global.portal.oven.count : 0)) < 100 ? 15000 : 0; }
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.portal.hasOwnProperty('oven') ? global.portal.oven.count : 0);
                if (count < 100){
                    let remain = 100 - count;
                    return `<div>${loc('portal_oven_effect1')}</div><div class="has-text-special">${loc('requires_segments',[remain])}</div>`;
                }
                else {
                    return fortressModules.prtl_lake.oven_complete.effect();
                }
            },
            action(args){
                if (global.portal.oven.count < 100 && payCosts($(this)[0])){
                    global.portal['oven'].count++;
                    if (global.portal.oven.count >= 100){
                        global.tech['dish'] = 3;
                        initStruct(fortressModules.prtl_lake.oven_complete);
                        incrementStruct('oven_complete','portal');
                        if (global.settings.alwaysPower){
                            powerOnNewStruct(fortressModules.prtl_lake.oven_complete);
                        }
                        initStruct(fortressModules.prtl_lake.devilish_dish);
                        renderFortress();
                        clearPopper();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['oven','portal']
                };
            },
        },
        oven_complete: {
            id: 'portal-oven_complete',
            title: loc('portal_oven_title'),
            desc(){
                return `<div>${loc('portal_oven_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            wiki: false,
            reqs: { dish: 3 },
            condition(){
                return global.portal.oven.count >= 100;
            },
            queue_complete(){ return 0; },
            cost: {},
            effect(wiki){
                let fuel = $(this)[0].p_fuel();
                return `<div>${loc(`portal_oven_desc`)}</div>${global.tech['dish'] === 4 ? `<div class="has-text-special">${loc('portal_oven_desc2')}</div>` : ``}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}, ${loc('spend', [fuel.a, fuel.r])}</div>`;
            },
            powered(){ return powerCostMod(3500); },
            p_fuel(){ return { r: 'Infernite', a: 225 }},
            action(args){
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['oven_complete','portal']
                };
            }
        },
        devilish_dish: {
            id: 'portal-devilish_dish',
            title: loc('portal_devilish_dish_title'),
            desc: loc('portal_devilish_dish_title'),
            reqs: { dish: 3 },
            queue_complete(){ return 0; },
            cost: {},
            effect(){
                const progress = (global.portal['devilish_dish'] ? global.portal['devilish_dish'].done : 0);
                return `<div>${loc(`portal_devilish_dish_desc`,[progress.toFixed(1)])}</div><div>${loc(`portal_devilish_dish_flavor${progress >= 100 ? 6 : Math.ceil(progress/20)}`)}</div>`;
            },
            action(args){
                return false;
            },
            struct(){
                return {
                    d: { count: 0, done: 0, time: 0 },
                    p: ['devilish_dish','portal']
                };
            }
        },
        dish_soul_steeper: {
            id: 'portal-dish_soul_steeper',
            title: loc('portal_dish_soul_steeper_title'),
            desc: loc('portal_dish_soul_steeper_desc'),
            reqs: { dish: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('dish_soul_steeper', offset, 750000000, spireCreep(1.3), 'portal'); },
                Bolognium(offset){ return spaceCostMultiplier('dish_soul_steeper', offset, 12000000, spireCreep(1.3), 'portal'); },
                Scarletite(offset){ return spaceCostMultiplier('dish_soul_steeper', offset, 300000, spireCreep(1.3), 'portal'); },
            },
            powered(){ return 0; },
            effect(){
                return `<div>${loc('portal_dish_soul_steeper_effect1')}</div><div class="has-text-danger">${loc('portal_dish_soul_steeper_effect2', [3 + (global.race['malnutrition'] ? 1 : 0) + (global.race['angry'] ? -1 : 0)])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    global.portal['dish_soul_steeper'].count++;
                    global.portal['dish_soul_steeper'].on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['dish_soul_steeper','portal']
                };
            },
            flair: loc('portal_dish_soul_steeper_flair')
        },
        dish_life_infuser: {
            id: 'portal-dish_life_infuser',
            title: loc('portal_dish_life_infuser_title'),
            desc: loc('portal_dish_life_infuser_desc'),
            reqs: { dish: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('dish_life_infuser', offset, 280000000, spireCreep(1.2), 'portal'); },
                Bolognium(offset){ return spaceCostMultiplier('dish_life_infuser', offset, 8000000, spireCreep(1.2), 'portal'); },
                Orichalcum(offset){ return spaceCostMultiplier('dish_life_infuser', offset, 8000000, spireCreep(1.2), 'portal'); },
                Species(offset){ return popCost(10)}
            },
            powered(){ return 0; },
            effect(){
                return `<div>${loc('portal_dish_life_infuser_effect1', [15])}</div><div class="has-text-danger">${loc('portal_dish_life_infuser_effect2', [5])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    global.portal['dish_life_infuser'].count++;
                    global.portal['dish_life_infuser'].on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['dish_life_infuser','portal']
                };
            },
            flair: loc('portal_dish_life_infuser_flair')
        }
    };

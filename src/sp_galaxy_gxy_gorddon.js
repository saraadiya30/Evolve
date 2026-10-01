import { loc } from './locale.js';
import { races, traits } from './races.js';
import { global } from './vars.js';
import { payCosts, powerOnNewStruct, initStruct, structName } from './actions.js';
import { messageQueue, powerCostMod, spaceCostMultiplier } from './functions.js';
import { drawResourceTab } from './resources.js';
import { universeAffix } from './achieve.js';
import { highPopAdjust } from './prod.js';
import { galaxyProjects } from './space_registry.js';
import { int_fuel_adjust, xeno_race, isStargateOn, incrementStruct, piracy } from './space.js';

// Region 'gxy_gorddon' dari galaxyProjects (dipisah dari space.js). Isi sama persis; digabung via space_registry.js di space.js.
export const galaxyProjects_gxy_gorddon = {
        info: {
            name: loc('galaxy_gorddon'),
            desc(){ return loc('galaxy_gorddon_desc'); },
            control(){
                return {
                    name: races[global.galaxy.alien1.id].name,
                    color: 'advanced',
                };
            },
        },
        gorddon_mission: {
            id: 'galaxy-gorddon_mission',
            title: loc('galaxy_gorddon_mission'),
            desc: loc('galaxy_gorddon_mission_desc'),
            reqs: { xeno: 2 },
            grant: ['xeno',3],
            queue_complete(){ return global.tech.xeno >= 3 ? 0 : 1; },
            cost: {
                Structs(){
                    return {
                        galaxy: {
                            scout_ship: { s: 'gxy_gateway', count: 2, on: 2 },
                            corvette_ship: { s: 'gxy_gateway', count: 1, on: 1 },
                        }
                    };
                },
                Helium_3(){ return +int_fuel_adjust(230000).toFixed(0); },
                Deuterium(){ return +int_fuel_adjust(125000).toFixed(0); }
            },
            effect: loc('galaxy_gorddon_mission_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    xeno_race();
                    global.galaxy.defense.gxy_gateway.scout_ship -= 2;
                    global.galaxy.defense.gxy_gorddon.scout_ship += 2;
                    global.galaxy.defense.gxy_gateway.corvette_ship--;
                    global.galaxy.defense.gxy_gorddon.corvette_ship++;
                    let s1name = races[global.galaxy.alien1.id].name;
                    let s1desc = races[global.galaxy.alien1.id].entity;
                    let s2name = races[global.galaxy.alien2.id].name;
                    let s2desc = races[global.galaxy.alien2.id].entity;
                    messageQueue(loc('galaxy_gorddon_mission_result',[s1desc,s1name,s2desc,s2name]),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        embassy: {
            id: 'galaxy-embassy',
            title: loc('galaxy_embassy'),
            desc(){ return `<div>${loc('galaxy_embassy')}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Food.name])}</div>`; },
            reqs: { xeno: 4 },
            queue_complete(){ return 1 - global.galaxy.embassy.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.galaxy.hasOwnProperty('embassy') ? global.galaxy.embassy.count : 0)) < 1 ? 30000000 : 0; },
                Lumber(offset){ return ((offset || 0) + (global.galaxy.hasOwnProperty('embassy') ? global.galaxy.embassy.count : 0)) < 1 ? 38000000 : 0; },
                Stone(offset){ return ((offset || 0) + (global.galaxy.hasOwnProperty('embassy') ? global.galaxy.embassy.count : 0)) < 1 ? 32000000 : 0; },
                Furs(offset){ return ((offset || 0) + (global.galaxy.hasOwnProperty('embassy') ? global.galaxy.embassy.count : 0)) < 1 ? 18000000 : 0; },
                Wrought_Iron(offset){ return ((offset || 0) + (global.galaxy.hasOwnProperty('embassy') ? global.galaxy.embassy.count : 0)) < 1 ? 6000000 : 0; }
            },
            effect(wiki){
                let food = 7500;
                let housing = '';
                if (global.tech.xeno >= 11){
                    housing = `<div>${loc('plus_max_citizens',[$(this)[0].citizens()])}</div>`;
                }
                let foodDesc = '';
                if(!global.race['fasting']){
                    foodDesc = `<div class="has-text-caution">${loc('interstellar_alpha_starport_effect3',[food,global.resource.Food.name])}</div>`;
                }
                return `<div>${loc('galaxy_embassy_effect',[races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name])}</div>${housing}${foodDesc}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered(wiki)])}</div>`;
            },
            powered(wiki){ return powerCostMod(isStargateOn(wiki) ? 25 : 0); },
            refresh: true,
            action(args){
                if (global.galaxy.embassy.count < 1 && payCosts($(this)[0])){
                    incrementStruct('embassy','galaxy');
                    powerOnNewStruct($(this)[0]);
                    if (global.tech['xeno'] === 4){
                        global.tech['xeno'] = 5;
                        initStruct(galaxyProjects.gxy_gorddon.freighter);
                        global.galaxy['trade'] = { max: 0, cur: 0, f0: 0, f1: 0, f2: 0, f3: 0, f4: 0, f5: 0, f6: 0, f7: 0, f8: 0 };
                        drawResourceTab('market');
                        messageQueue(loc('galaxy_embassy_complete',[races[global.galaxy.alien1.id].name,races[global.galaxy.alien2.id].name]),'info',false,['progress']);
                    }
                    if (global.race['fasting']){
                        let affix = universeAffix();
                        global.stats['endless_hunger'].b1[affix] = true;
                        if (affix !== 'm' && affix !== 'l'){
                            global.stats['endless_hunger'].b1.l = true;
                        }
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['embassy','galaxy']
                };
            },
            citizens(){
                let pop = 20;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
            }
        },
        dormitory: {
            id: 'galaxy-dormitory',
            title(){ return structName('dormitory'); },
            desc(){
                return `<div>${structName('dormitory')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { xeno: 6 },
            cost: {
                Money(offset){ return spaceCostMultiplier('dormitory', offset, 10000000, 1.25, 'galaxy'); },
                Furs(offset){ return spaceCostMultiplier('dormitory', offset, 700000, 1.25, 'galaxy'); },
                Cement(offset){ return spaceCostMultiplier('dormitory', offset, 1200000, 1.25, 'galaxy'); },
                Plywood(offset){ return spaceCostMultiplier('dormitory', offset, 85000, 1.25, 'galaxy'); },
                Horseshoe(){ return global.race['hooved'] ? 3 : 0; }
            },
            effect(){
                return `<div class="has-text-caution">${loc(`requires_res`,[loc('galaxy_embassy')])}</div><div>${loc('plus_max_citizens',[$(this)[0].citizens()])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(3); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('dormitory','galaxy');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['dormitory','galaxy']
                };
            },
            citizens(){
                let pop = 3;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
            }
        },
        symposium: {
            id: 'galaxy-symposium',
            title: loc('galaxy_symposium'),
            desc(){
                return `<div>${loc('galaxy_symposium')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { xeno: 6 },
            cost: {
                Money(offset){ return spaceCostMultiplier('symposium', offset, 8000000, 1.25, 'galaxy'); },
                Food(offset){ return global.race['ravenous'] ? 0 : spaceCostMultiplier('symposium', offset, global.race['artifical'] ? 45000 : 125000, 1.25, 'galaxy'); },
                Lumber(offset){ return spaceCostMultiplier('symposium', offset, 460000, 1.25, 'galaxy'); },
                Brick(offset){ return spaceCostMultiplier('symposium', offset, 261600, 1.25, 'galaxy'); },
            },
            effect(wiki){
                let pirate = piracy('gxy_gorddon',false,false,wiki);
                let desc = `<div class="has-text-caution">${loc(`requires_res`,[loc('galaxy_embassy')])}</div>`;
                desc += `<div>${loc('galaxy_symposium_effect',[(1750 * pirate).toFixed(0)])}</div>`;
                desc += `<div>${loc('galaxy_symposium_effect2',[(650 * pirate).toFixed(0)])}</div>`;
                if (global.tech.xeno >= 7){
                    desc += `<div>${loc('galaxy_symposium_effect3',[+highPopAdjust(300 * pirate).toFixed(2)])}</div>`;
                    desc += `<div>${loc('galaxy_symposium_effect3b',[+highPopAdjust(100 * pirate).toFixed(2)])}</div>`;
                }
                if(global.tech.science >= 22){
                    desc += `<div>${loc('galaxy_symposium_effect4',[+(100 * pirate).toFixed(2), loc('eden_research_station_title')])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`
                return desc;
            },
            powered(){ return powerCostMod(4); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('symposium','galaxy');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['symposium','galaxy']
                };
            },
        },
        freighter: {
            id: 'galaxy-freighter',
            title: loc('galaxy_freighter'),
            desc(){
                return `<div>${loc('galaxy_freighter')}</div><div class="has-text-special">${loc('galaxy_crew_fuel',[global.resource.Helium_3.name])}</div>`;
            },
            reqs: { xeno: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('freighter', offset, 6000000, 1.2, 'galaxy'); },
                Uranium(offset){ return spaceCostMultiplier('freighter', offset, 10000, 1.2, 'galaxy'); },
                Adamantite(offset){ return spaceCostMultiplier('freighter', offset, 460000, 1.2, 'galaxy'); },
                Stanene(offset){ return spaceCostMultiplier('freighter', offset, 261600, 1.2, 'galaxy'); },
                Bolognium(offset){ return spaceCostMultiplier('freighter', offset, 66000, 1.2, 'galaxy'); },
            },
            effect(){
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                let bank = '';
                if (global.tech.banking >= 13){
                    bank = `<div>${loc('interstellar_exchange_boost',[3])}</div>`;
                }
                return `<div class="has-text-caution">${loc(`requires_res`,[loc('galaxy_embassy')])}</div><div>${loc('galaxy_freighter_effect',[2,races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name])}</div>${bank}<div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ()])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            ship: {
                civ(){ return global.race['high_pop'] ? traits.high_pop.vars()[0] * 3 : 3; },
                mil(){ return 0; },
                helium: 12
            },
            special: true,
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('freighter','galaxy');
                    global.galaxy['freighter'].on++;
                    global.resource.Vitreloy.display = true;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0 },
                    p: ['freighter','galaxy']
                };
            }
        },
    };

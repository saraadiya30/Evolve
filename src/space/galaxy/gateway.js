import { loc } from '../../core/locale.js';
import { flib } from '../../functions/run_stats_helpers.js';
import { spaceCostMultiplier } from '../../functions/cost_multipliers.js';
import { powerCostMod } from '../../functions/power_modifiers.js';
import { global, p_on } from '../../core/vars.js';
import { payCosts } from '../../actions/core/action_costs.js';
import { powerOnNewStruct } from '../../actions/evolution/planet_setup.js';
import { initStruct } from '../../actions/core/structure_ui.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { production } from '../../resources/prod.js';
import { traits } from '../../core/registries.js';
import { galaxyProjects } from '../../core/registries.js';
import { int_fuel_adjust } from '../planet_generation.js';
import { xeno_race, incrementStruct } from '../space_requirements.js';
import { isStargateOn } from '../terraform_lab.js';

// Region 'gxy_gateway' dari galaxyProjects (dipisah dari space.js). Isi sama persis; digabung via core/registries.js di space.js.
export const galaxyProjects_gxy_gateway = {
        info: {
            name: loc('galaxy_gateway'),
            desc(){ return loc('galaxy_gateway_desc'); },
            control(){
                return {
                    name: flib('name'),
                    color: 'success',
                };
            },
            support: 'starbase'
        },
        gateway_mission: {
            id: 'galaxy-gateway_mission',
            title: loc('galaxy_gateway_mission'),
            desc: loc('galaxy_gateway_mission'),
            reqs: { gateway: 1 },
            grant: ['gateway',2],
            queue_complete(){ return global.tech.gateway >= 2 ? 0 : 1; },
            cost: {
                Helium_3(){ return +int_fuel_adjust(212000).toFixed(0); },
                Deuterium(){ return +int_fuel_adjust(110000).toFixed(0); }
            },
            effect: loc('galaxy_gateway_mission_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    xeno_race();
                    global.galaxy['defense'] = {
                        gxy_stargate: {
                            scout_ship: 0,
                            corvette_ship: 0,
                            frigate_ship: 0,
                            cruiser_ship: 0,
                            dreadnought: 0
                        },
                        gxy_gateway: {
                            scout_ship: 0,
                            corvette_ship: 0,
                            frigate_ship: 0,
                            cruiser_ship: 0,
                            dreadnought: 0
                        },
                        gxy_gorddon: {
                            scout_ship: 0,
                            corvette_ship: 0,
                            frigate_ship: 0,
                            cruiser_ship: 0,
                            dreadnought: 0
                        },
                        gxy_alien1: {
                            scout_ship: 0,
                            corvette_ship: 0,
                            frigate_ship: 0,
                            cruiser_ship: 0,
                            dreadnought: 0
                        },
                        gxy_alien2: {
                            scout_ship: 0,
                            corvette_ship: 0,
                            frigate_ship: 0,
                            cruiser_ship: 0,
                            dreadnought: 0
                        },
                        gxy_chthonian: {
                            scout_ship: 0,
                            corvette_ship: 0,
                            frigate_ship: 0,
                            cruiser_ship: 0,
                            dreadnought: 0
                        }
                    };
                    return true;
                }
                return false;
            }
        },
        starbase: {
            id: 'galaxy-starbase',
            title: loc('galaxy_starbase'),
            desc(){ return `<div>${loc('galaxy_starbase')}</div><div class="has-text-special">${loc('requires_power_space',[global.resource.Food.name])}</div>`; },
            reqs: { gateway: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('starbase', offset, 4200000, 1.25, 'galaxy'); },
                Elerium(offset){ return spaceCostMultiplier('starbase', offset, 1000, 1.25, 'galaxy'); },
                Mythril(offset){ return spaceCostMultiplier('starbase', offset, 90000, 1.25, 'galaxy'); },
                Graphene(offset){ return spaceCostMultiplier('starbase', offset, 320000, 1.25, 'galaxy'); },
                Horseshoe(){ return global.race['hooved'] ? 5 : 0; }
            },
            effect(wiki){
                let helium = +(int_fuel_adjust(25)).toFixed(2);
                let food = 250;
                let soldiers = $(this)[0].soldiers();
                return `<div class="has-text-advanced">${loc('galaxy_defense_platform_effect',[25])}</div><div>${loc('galaxy_gateway_support',[$(this)[0].support()])}</div><div>${loc('plus_max_soldiers',[soldiers])}</div><div class="has-text-caution">${loc('interstellar_alpha_starport_effect2',[helium,$(this)[0].powered(wiki)])}</div><div class="has-text-caution">${loc('interstellar_alpha_starport_effect3',[food,global.resource.Food.name])}</div>`;
            },
            support(){ return 2; },
            powered(wiki){ return powerCostMod(isStargateOn(wiki) ? 12 : 0); },
            powerBalancer(){
                return [{ s: global.galaxy.starbase.s_max - global.galaxy.starbase.support }];
            },
            refresh: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('starbase','galaxy');
                    powerOnNewStruct($(this)[0]);
                    if (global.tech['gateway'] === 2){
                        initStruct(galaxyProjects.gxy_gateway.bolognium_ship);
                        global.tech['gateway'] = 3;
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['starbase','galaxy']
                };
            },
            soldiers(){
                let soldiers = global.tech.marines >= 2 ? (global.race['grenadier'] ? 5 : 8) : (global.race['grenadier'] ? 3 : 5);
                return jobScale(soldiers);
            }
        },
        ship_dock: {
            id: 'galaxy-ship_dock',
            title: loc('galaxy_ship_dock'),
            desc: `<div>${loc('galaxy_ship_dock')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { gateway: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('ship_dock', offset, 3600000, 1.25, 'galaxy'); },
                Steel(offset){ return spaceCostMultiplier('ship_dock', offset, 880000, 1.25, 'galaxy'); },
                Aluminium(offset){ return spaceCostMultiplier('ship_dock', offset, 1200000, 1.25, 'galaxy'); },
                Bolognium(offset){ return spaceCostMultiplier('ship_dock', offset, 75000, 1.25, 'galaxy'); },
            },
            effect(wiki){
                if(global.race['fasting']){
                    return `<div>${loc('galaxy_ship_dock_effect_fasting',[0.1])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered(wiki)])}</div>`;
                }
                return `<div>${loc('galaxy_ship_dock_effect',[0.25])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered(wiki)])}</div>`;
            },
            support(wiki){
                if(global.race['fasting']){
                    let num_gateways_on = wiki ? global.galaxy.gateway_station.on : p_on['gateway_station'];
                    return num_gateways_on ? 0.1 * num_gateways_on : 0;
                }
                else {
                    let num_starbases_on = wiki ? global.galaxy.starbase.on : p_on['starbase'];
                    return num_starbases_on ? 0.25 * num_starbases_on : 0;
                }
            },
            powered(wiki){ return powerCostMod(isStargateOn(wiki) ? 4 : 0); },
            powerBalancer(){
                if(global.race['fasting']){
                    return [{ s: global.galaxy.gateway_station.s_max - global.galaxy.gateway_station.support }];
                }
                return [{ s: global.galaxy.starbase.s_max - global.galaxy.starbase.support }];
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('ship_dock','galaxy');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['ship_dock','galaxy']
                };
            }
        },
        bolognium_ship: {
            id: 'galaxy-bolognium_ship',
            title: loc('galaxy_bolognium_ship'),
            desc(){
                return `<div>${loc('galaxy_bolognium_ship_desc')}</div><div class="has-text-special">${loc('galaxy_starbase_support',[global.resource.Helium_3.name])}</div>`;
            },
            reqs: { gateway: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('bolognium_ship', offset, 1400000, 1.22, 'galaxy'); },
                Iron(offset){ return spaceCostMultiplier('bolognium_ship', offset, 560000, 1.22, 'galaxy'); },
                Infernite(offset){ return spaceCostMultiplier('bolognium_ship', offset, 1800, 1.22, 'galaxy'); },
                Nano_Tube(offset){ return spaceCostMultiplier('bolognium_ship', offset, 475000, 1.22, 'galaxy'); },
            },
            effect(){
                let bolognium = +(production('bolognium_ship')).toFixed(3);
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                return `<div>${loc('gain',[bolognium,global.resource.Bolognium.name])}</div><div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ()])}</div><div class="has-text-caution">${loc('galaxy_gateway_used_support',[-($(this)[0].support())])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            s_type: 'gateway',
            support(){ return -1; },
            ship: {
                civ(){ return global.race['high_pop'] ? traits.high_pop.vars()[0] * 2 : 2; },
                mil(){ return 0; },
                helium: 5
            },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('bolognium_ship','galaxy');
                    global.resource.Bolognium.display = true;
                    global.civic.crew.display = true;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0 },
                    p: ['bolognium_ship','galaxy']
                };
            }
        },
        scout_ship: {
            id: 'galaxy-scout_ship',
            title: loc('galaxy_scout_ship'),
            desc(){
                return `<div>${loc('galaxy_scout_ship')}</div><div class="has-text-special">${loc('galaxy_starbase_support',[global.resource.Helium_3.name])}</div>`;
            },
            reqs: { andromeda: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('scout_ship', offset, 1600000, 1.25, 'galaxy'); },
                Titanium(offset){ return spaceCostMultiplier('scout_ship', offset, 325000, 1.25, 'galaxy'); },
                Graphene(offset){ return spaceCostMultiplier('scout_ship', offset, 118000, 1.25, 'galaxy'); },
                Soul_Gem(offset){ return spaceCostMultiplier('scout_ship', offset, 1, 1.02, 'galaxy'); },
            },
            effect(){
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                let sensors = global.tech.science >= 17 ? `<div>${loc('galaxy_scout_ship_effect2',[25])}</div>` : '';
                return `<div class="has-text-advanced">${loc('galaxy_ship_rating',[$(this)[0].ship.rating()])}</div><div>${loc('galaxy_scout_ship_effect')}</div>${sensors}<div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ()])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil()])}</div><div class="has-text-caution">${loc('galaxy_gateway_used_support',[-($(this)[0].support())])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            s_type: 'gateway',
            support(){ return -1; },
            ship: {
                civ(){ return global.race['grenadier'] ? 0 : global.race['high_pop'] ? traits.high_pop.vars()[0] * 1 : 1; },
                mil(){
                    let base = global.race['high_pop'] ? traits.high_pop.vars()[0] * 1 : 1;
                    return global.race['grenadier'] ? Math.ceil(base / 2) : base;
                },
                helium: 6,
                rating(){ 
                    let rating = global.race['banana'] ? 7 : 10; 
                    if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.ship){
                        rating += global.race['banana'] ? 1 : 5;
                    }
                    return rating;
                }
            },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('scout_ship','galaxy');
                    global.galaxy.defense.gxy_gateway.scout_ship++;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0, mil: 0 },
                    p: ['scout_ship','galaxy']
                };
            }
        },
        corvette_ship: {
            id: 'galaxy-corvette_ship',
            title: loc('galaxy_corvette_ship'),
            desc(){
                return `<div>${loc('galaxy_corvette_ship')}</div><div class="has-text-special">${loc('galaxy_starbase_support',[global.resource.Helium_3.name])}</div>`;
            },
            reqs: { andromeda: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('corvette_ship', offset, 4500000, 1.25, 'galaxy'); },
                Steel(offset){ return spaceCostMultiplier('corvette_ship', offset, 1750000, 1.25, 'galaxy'); },
                Infernite(offset){ return spaceCostMultiplier('corvette_ship', offset, 16000, 1.25, 'galaxy'); },
                Bolognium(offset){ return spaceCostMultiplier('corvette_ship', offset, 35000, 1.25, 'galaxy'); },
                Soul_Gem(offset){ return spaceCostMultiplier('corvette_ship', offset, 1, 1.25, 'galaxy'); },
            },
            effect(){
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                return `<div class="has-text-advanced">${loc('galaxy_ship_rating',[$(this)[0].ship.rating()])}</div><div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ()])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil()])}</div><div class="has-text-caution">${loc('galaxy_gateway_used_support',[-($(this)[0].support())])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            s_type: 'gateway',
            support(){ return -1; },
            ship: {
                civ(){ return global.race['high_pop'] ? traits.high_pop.vars()[0] * 2 : 2; },
                mil(){
                    let base = global.race['grenadier'] ? 2 : 3;
                    return global.race['high_pop'] ? traits.high_pop.vars()[0] * base : base;
                },
                helium: 10,
                rating(){ 
                    let rating = global.race['banana'] ? 21 : 30; 
                    if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.ship){
                        rating += global.race['banana'] ? 4 : 10;
                    }
                    return rating;
                }
            },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('corvette_ship','galaxy');
                    global.galaxy.defense.gxy_gateway.corvette_ship++;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0, mil: 0 },
                    p: ['corvette_ship','galaxy']
                };
            }
        },
        frigate_ship: {
            id: 'galaxy-frigate_ship',
            title: loc('galaxy_frigate_ship'),
            desc(){
                return `<div>${loc('galaxy_frigate_ship')}</div><div class="has-text-special">${loc('galaxy_starbase_support',[global.resource.Helium_3.name])}</div>`;
            },
            reqs: { andromeda: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('frigate_ship', offset, 18000000, 1.25, 'galaxy'); },
                Elerium(offset){ return spaceCostMultiplier('frigate_ship', offset, 1250, 1.25, 'galaxy'); },
                Mythril(offset){ return spaceCostMultiplier('frigate_ship', offset, 350000, 1.25, 'galaxy'); },
                Sheet_Metal(offset){ return spaceCostMultiplier('frigate_ship', offset, 800000, 1.25, 'galaxy'); },
                Soul_Gem(offset){ return spaceCostMultiplier('frigate_ship', offset, 2, 1.25, 'galaxy'); },
            },
            effect(){
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                return `<div class="has-text-advanced">${loc('galaxy_ship_rating',[$(this)[0].ship.rating()])}</div><div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ()])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil()])}</div><div class="has-text-caution">${loc('galaxy_gateway_used_support',[-($(this)[0].support())])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            s_type: 'gateway',
            support(){ return -2; },
            ship: {
                civ(){ return global.race['high_pop'] ? traits.high_pop.vars()[0] * 3 : 3; },
                mil(){
                    let base = global.race['grenadier'] ? 3 : 5;
                    return global.race['high_pop'] ? traits.high_pop.vars()[0] * base : base;
                },
                helium: 25,
                rating(){ 
                    let rating = global.race['banana'] ? 56 : 80;
                    if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.ship){
                        rating += global.race['banana'] ? 14 : 20;
                    }
                    return rating;
                }
            },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('frigate_ship','galaxy');
                    global.galaxy.defense.gxy_gateway.frigate_ship++;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0, mil: 0 },
                    p: ['frigate_ship','galaxy']
                };
            },
            flair: loc('tech_frigate_ship_flair')
        },
        cruiser_ship: {
            id: 'galaxy-cruiser_ship',
            title: loc('galaxy_cruiser_ship'),
            desc(){
                return `<div>${loc('galaxy_cruiser_ship')}</div><div class="has-text-special">${loc('galaxy_starbase_support',[global.resource.Deuterium.name])}</div>`;
            },
            reqs: { andromeda: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('cruiser_ship', offset, 75000000, 1.25, 'galaxy'); },
                Copper(offset){ return spaceCostMultiplier('cruiser_ship', offset, 6000000, 1.25, 'galaxy'); },
                Adamantite(offset){ return spaceCostMultiplier('cruiser_ship', offset, 1000000, 1.25, 'galaxy'); },
                Vitreloy(offset){ return spaceCostMultiplier('cruiser_ship', offset, 750000, 1.25, 'galaxy'); },
                Elerium(offset){ return spaceCostMultiplier('cruiser_ship', offset, 1800, 1.25, 'galaxy'); },
                Soul_Gem(offset){ return spaceCostMultiplier('cruiser_ship', offset, 5, 1.25, 'galaxy'); },
            },
            effect(){
                let deuterium = +int_fuel_adjust($(this)[0].ship.deuterium).toFixed(2);
                return `<div class="has-text-advanced">${loc('galaxy_ship_rating',[$(this)[0].ship.rating()])}</div><div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ()])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil()])}</div><div class="has-text-caution">${loc('galaxy_gateway_used_support',[-($(this)[0].support())])}</div><div class="has-text-caution">${loc('spend',[deuterium,global.resource.Deuterium.name])}</div>`;
            },
            s_type: 'gateway',
            support(){ return -3; },
            ship: {
                civ(){ return global.race['high_pop'] ? traits.high_pop.vars()[0] * 6 : 6; },
                mil(){
                    let base = global.race['grenadier'] ? 6 : 10;
                    return global.race['high_pop'] ? traits.high_pop.vars()[0] * base : base;
                },
                deuterium: 25,
                rating(){ 
                    let rating = global.race['banana'] ? 175 : 250;
                    if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.ship){
                        rating += global.race['banana'] ? 25 : 50;
                    }
                    return rating;
                }
            },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('cruiser_ship','galaxy');
                    global.galaxy.defense.gxy_gateway.cruiser_ship++;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0, mil: 0 },
                    p: ['cruiser_ship','galaxy']
                };
            },
        },
        dreadnought: {
            id: 'galaxy-dreadnought',
            title: loc('galaxy_dreadnought'),
            desc(){
                return `<div>${loc('galaxy_dreadnought')}</div><div class="has-text-special">${loc('galaxy_starbase_support',[global.resource.Deuterium.name])}</div>`;
            },
            reqs: { andromeda: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('dreadnought', offset, 225000000, 1.25, 'galaxy'); },
                Neutronium(offset){ return spaceCostMultiplier('dreadnought', offset, 250000, 1.25, 'galaxy'); },
                Bolognium(offset){ return spaceCostMultiplier('dreadnought', offset, 1500000, 1.25, 'galaxy'); },
                Vitreloy(offset){ return spaceCostMultiplier('dreadnought', offset, 1000000, 1.25, 'galaxy'); },
                Infernite(offset){ return spaceCostMultiplier('dreadnought', offset, 400000, 1.25, 'galaxy'); },
                Aerogel(offset){ return spaceCostMultiplier('dreadnought', offset, 800000, 1.25, 'galaxy'); },
                Soul_Gem(offset){ return spaceCostMultiplier('dreadnought', offset, 25, 1.25, 'galaxy'); },
            },
            effect(){
                let deuterium = +int_fuel_adjust($(this)[0].ship.deuterium).toFixed(2);
                return `<div class="has-text-advanced">${loc('galaxy_ship_rating',[$(this)[0].ship.rating()])}</div><div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ()])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil()])}</div><div class="has-text-caution">${loc('galaxy_gateway_used_support',[-($(this)[0].support())])}</div><div class="has-text-caution">${loc('spend',[deuterium,global.resource.Deuterium.name])}</div>`;
            },
            s_type: 'gateway',
            support(){ return -5; },
            ship: {
                civ(){ return global.race['high_pop'] ? traits.high_pop.vars()[0] * 10 : 10; },
                mil(){
                    let base = global.race['grenadier'] ? 12 : 20;
                    return global.race['high_pop'] ? traits.high_pop.vars()[0] * base : base;
                },
                deuterium: 80,
                rating(){ 
                    let rating = global.race['banana'] ? 1260 : 1800;
                    if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.ship){
                        rating += global.race['banana'] ? 140 : 200;
                    }
                    return rating;
                }
            },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('dreadnought','galaxy');
                    global.galaxy.defense.gxy_gateway.dreadnought++;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0, mil: 0 },
                    p: ['dreadnought','galaxy']
                };
            },
        },
    };

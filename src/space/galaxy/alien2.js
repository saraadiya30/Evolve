import { loc } from '../../core/locale.js';
import { races, traits } from '../../core/registries.js';
import { global } from '../../core/vars.js';
import { payCosts } from '../../actions/core/action_costs.js';
import { powerOnNewStruct } from '../../actions/evolution/planet_setup.js';
import { initStruct } from '../../actions/core/structure_ui.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { messageQueue } from '../../functions/message_log.js';
import { spaceCostMultiplier } from '../../functions/cost_multipliers.js';
import { powerCostMod } from '../../functions/power_modifiers.js';
import { galaxyProjects } from '../../core/registries.js';
import { isStargateOn } from '../terraform_lab.js';
import { incrementStruct, galaxySpace, piracy } from '../space_requirements.js';
import { int_fuel_adjust } from '../planet_generation.js';

// Region 'gxy_alien2' dari galaxyProjects (dipisah dari space.js). Isi sama persis; digabung via core/registries.js di space.js.
export const galaxyProjects_gxy_alien2 = {
        info: {
            name(){ return loc('galaxy_alien',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].solar.red]); },
            desc(){ return loc('galaxy_alien2_desc',[
                    races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].solar.red,
                    races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name
                ]);
            },
            control(){
                return {
                    name: races[global.galaxy.alien2.id].name,
                    color: 'danger',
                };
            },
            support: 'foothold'
        },
        alien2_mission: {
            id: 'galaxy-alien2_mission',
            title(){ return loc('galaxy_alien2_mission',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].solar.red]); },
            desc(){ return loc('galaxy_alien2_mission_desc',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].solar.red]); },
            reqs: { andromeda: 4 },
            grant: ['conflict',1],
            queue_complete(){ return global.tech.conflict >= 1 ? 0 : 1; },
            cost: {
                Custom(){
                    if (global.galaxy.hasOwnProperty('defense') && global.galaxy.defense.hasOwnProperty('gxy_alien2')){
                        let total = 0;
                        Object.keys(global.galaxy.defense.gxy_alien2).forEach(function(ship){
                            total += galaxyProjects.gxy_gateway[ship].ship.rating() * global.galaxy.defense.gxy_alien2[ship];
                        });
                        return {
                            label: loc(`galaxy_fleet_rating`,[`<span${total < 400 ? ` class="has-text-danger"` : ''}>400</span>`]),
                            met: total < 400 ? false : true
                        };
                    }
                    return {
                        label: loc(`galaxy_fleet_rating`,[`<span class="has-text-danger">400</span>`]),
                        met: false
                    };
                }
            },
            effect(){
                let total = 0;
                if (global.galaxy.hasOwnProperty('defense') && global.galaxy.defense.hasOwnProperty('gxy_alien2')){
                    Object.keys(global.galaxy.defense.gxy_alien2).forEach(function(ship){
                        total += galaxyProjects.gxy_gateway[ship].ship.rating() * global.galaxy.defense.gxy_alien2[ship];
                    });
                }
                let odds = total >= 650 ? `<span class="has-text-success">${loc(`galaxy_piracy_low`)}</span>` : `<span class="has-text-warning">${loc(`galaxy_piracy_avg`)}</span>`;
                return `<div>${loc('galaxy_alien2_mission_effect2',[total])}</div><div>${loc('galaxy_alien2_mission_effect3',[odds])}</div><div class="has-text-caution">${loc('galaxy_alien2_mission_effect',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    let total = 0;
                    Object.keys(global.galaxy.defense.gxy_alien2).forEach(function(ship){
                        total += galaxyProjects.gxy_gateway[ship].ship.rating() * global.galaxy.defense.gxy_alien2[ship];
                    });
                    if (total >= 400){
                        messageQueue(loc('galaxy_alien2_mission_result2',[races[global.galaxy.alien2.id].solar.red]),'info',false,['progress']);
                        if (total < 650){
                            let wreck = 80;
                            if (global.race['instinct']){
                                wreck /= 2;
                            }
                            let loss = [];
                            Object.keys(global.galaxy.defense.gxy_alien2).forEach(function(ship){
                                for (let i=0; i<global.galaxy.defense.gxy_alien2[ship]; i++){
                                    if (wreck > 0){
                                        wreck -= galaxyProjects.gxy_gateway[ship].ship.rating();
                                        loss.push(ship);
                                    }
                                }
                            });
                            messageQueue(loc('galaxy_chthonian_mission_result_losses',[ loss.map( v => loc(`galaxy_${v}`) ).join(', ') ]),'danger',false,['progress']);
                            for (let i=0; i<loss.length; i++){
                                let ship = loss[i];
                                global.galaxy.defense.gxy_alien2[ship]--;
                                global.galaxy[ship].on--;
                                global.galaxy[ship].count--;
                                global.galaxy[ship].crew -= galaxyProjects.gxy_gateway[ship].ship.civ();
                                global.galaxy[ship].mil -= galaxyProjects.gxy_gateway[ship].ship.mil();
                                global.resource[global.race.species].amount -= galaxyProjects.gxy_gateway[ship].ship.civ();
                                global.civic.garrison.workers -= galaxyProjects.gxy_gateway[ship].ship.mil();
                            }
                        }
                        return true;
                    }
                    return false;
                }
                return false;
            }
        },
        foothold: {
            id: 'galaxy-foothold',
            title: loc('galaxy_foothold'),
            desc(){ return `<div>${loc('galaxy_foothold')}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Elerium.name])}</div>`; },
            reqs: { conflict: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('foothold', offset, 25000000, 1.25, 'galaxy'); },
                Titanium(offset){ return spaceCostMultiplier('foothold', offset, 3000000, 1.25, 'galaxy'); },
                Polymer(offset){ return spaceCostMultiplier('foothold', offset, 1750000, 1.25, 'galaxy'); },
                Iridium(offset){ return spaceCostMultiplier('foothold', offset, 900000, 1.25, 'galaxy'); },
                Bolognium(offset){ return spaceCostMultiplier('foothold', offset, 50000, 1.25, 'galaxy'); },
            },
            effect(wiki){
                let elerium = 2.5;
                return `<div class="has-text-advanced">${loc('galaxy_defense_platform_effect',[50])}</div><div>${loc('galaxy_foothold_effect',[$(this)[0].support(),races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].solar.red])}</div><div class="has-text-caution">${loc('galaxy_foothold_effect2',[elerium,$(this)[0].powered(wiki)])}</div>`;
            },
            support(){ return 4; },
            powered(wiki){ return powerCostMod(isStargateOn(wiki) ? 20 : 0); },
            powerBalancer(){
                return [{ s: global.galaxy.foothold.s_max - global.galaxy.foothold.support }];
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('foothold','galaxy');
                    powerOnNewStruct($(this)[0]);
                    if (global.tech['conflict'] === 1){
                        initStruct(galaxyProjects.gxy_alien2.armed_miner);
                        global.tech['conflict'] = 2;
                        galaxySpace();
                        drawTech();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['foothold','galaxy']
                };
            }
        },
        armed_miner: {
            id: 'galaxy-armed_miner',
            title: loc('galaxy_armed_miner'),
            desc(){
                return `<div>${loc('galaxy_armed_miner')}</div>`;
            },
            reqs: { conflict: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('armed_miner', offset, 5000000, 1.25, 'galaxy'); },
                Steel(offset){ return spaceCostMultiplier('armed_miner', offset, 1800000, 1.25, 'galaxy'); },
                Stanene(offset){ return spaceCostMultiplier('armed_miner', offset, 1975000, 1.25, 'galaxy'); },
                Vitreloy(offset){ return spaceCostMultiplier('armed_miner', offset, 20000, 1.25, 'galaxy'); },
                Soul_Gem(offset){ return spaceCostMultiplier('armed_miner', offset, 1, 1.25, 'galaxy'); },
            },
            effect(){
                let bolognium = 0.032;
                let adamantite = 0.23;
                let iridium = 0.65;
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                return `<div class="has-text-advanced">${loc('galaxy_ship_rating',[$(this)[0].ship.rating()])}</div><div>${loc('gain',[bolognium,global.resource.Bolognium.name])}</div><div>${loc('gain',[adamantite,global.resource.Adamantite.name])}</div><div>${loc('gain',[iridium,global.resource.Iridium.name])}</div><div class="has-text-caution">${loc('galaxy_alien2_support',[$(this)[0].support(),races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].solar.red])}</div><div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ()])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil()])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            ship: {
                civ(){ return global.race['high_pop'] ? traits.high_pop.vars()[0] * 2 : 2; },
                mil(){ return global.race['high_pop'] ? traits.high_pop.vars()[0] * 1 : 1; },
                helium: 10,
                rating(){ 
                    let rating = global.race['banana'] ? 4 : 5;
                    if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.ship){
                        rating += global.race['banana'] ? 2 : 5;
                    }
                    return rating;
                }
            },
            s_type: 'alien2',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('armed_miner','galaxy');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0, mil: 0 },
                    p: ['armed_miner','galaxy']
                };
            }
        },
        ore_processor: {
            id: 'galaxy-ore_processor',
            title: loc('galaxy_ore_processor'),
            desc(){
                return `<div>${loc('galaxy_ore_processor')}</div>`;
            },
            reqs: { conflict: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('ore_processor', offset, 3000000, 1.25, 'galaxy'); },
                Iron(offset){ return spaceCostMultiplier('ore_processor', offset, 5000000, 1.25, 'galaxy'); },
                Coal(offset){ return spaceCostMultiplier('ore_processor', offset, 3750000, 1.25, 'galaxy'); },
                Graphene(offset){ return spaceCostMultiplier('ore_processor', offset, 2250000, 1.25, 'galaxy'); }
            },
            effect(){
                return `<div>${loc('galaxy_ore_processor_effect',[10])}</div><div class="has-text-caution">${loc('galaxy_alien2_support',[$(this)[0].support(),races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].solar.red])}</div>`;
            },
            s_type: 'alien2',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('ore_processor','galaxy');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['ore_processor','galaxy']
                };
            }
        },
        scavenger: {
            id: 'galaxy-scavenger',
            title: loc('galaxy_scavenger'),
            desc: loc('galaxy_scavenger_desc'),
            reqs: { conflict: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('scavenger', offset, 7500000, 1.25, 'galaxy'); },
                Alloy(offset){ return spaceCostMultiplier('scavenger', offset, 1250000, 1.25, 'galaxy'); },
                Aluminium(offset){ return spaceCostMultiplier('scavenger', offset, 6800000, 1.25, 'galaxy'); },
                Neutronium(offset){ return spaceCostMultiplier('scavenger', offset, 75000, 1.25, 'galaxy'); },
                Elerium(offset){ return spaceCostMultiplier('scavenger', offset, 750, 1.25, 'galaxy'); }
            },
            effect(wiki){
                let pirate = piracy('gxy_alien2',false,false,wiki);
                let know = Math.round(pirate * 25000);
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                let boost = global.race['cataclysm'] ? `<div>${loc('galaxy_scavenger_effect2_cata',[+(pirate * 100 * 0.75).toFixed(1)])}</div>` : `<div>${loc('galaxy_scavenger_effect2',[+(pirate * 100 / 4).toFixed(1)])}</div>`;
                return `<div>${loc('galaxy_scavenger_effect',[know])}</div>${boost}<div class="has-text-caution">${loc('galaxy_alien2_support',[$(this)[0].support(),races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].solar.red])}</div><div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ()])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            ship: {
                civ(){ return global.race['high_pop'] ? traits.high_pop.vars()[0] * 1 : 1; },
                mil(){ return 0; },
                helium: 12,
            },
            s_type: 'alien2',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('scavenger','galaxy');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0 },
                    p: ['scavenger','galaxy']
                };
            }
        },
    };

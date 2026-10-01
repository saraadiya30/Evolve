import { loc } from '../../core/locale.js';
import { races, traits } from '../../core/registries.js';
import { global } from '../../core/vars.js';
import { payCosts } from '../../actions/core/action_costs.js';
import { powerOnNewStruct } from '../../actions/evolution/planet_setup.js';
import { messageQueue } from '../../functions/message_log.js';
import { spaceCostMultiplier } from '../../functions/cost_multipliers.js';
import { powerCostMod } from '../../functions/power_modifiers.js';
import { vBind } from '../../functions/dom_helpers.js';
import { production } from '../../resources/prod.js';
import { galaxyProjects } from '../../core/registries.js';
import { int_fuel_adjust } from '../planet_generation.js';
import { incrementStruct } from '../space_requirements.js';

// Region 'gxy_chthonian' dari galaxyProjects (dipisah dari space.js). Isi sama persis; digabung via core/registries.js di space.js.
export const galaxyProjects_gxy_chthonian = {
        info: {
            name(){ return loc('galaxy_chthonian'); },
            desc(){ return loc('galaxy_chthonian_desc',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name]); },
            control(){
                return {
                    name: races[global.galaxy.alien2.id].name,
                    color: 'danger',
                };
            },
        },
        chthonian_mission: {
            id: 'galaxy-chthonian_mission',
            title(){ return loc('galaxy_alien2_mission',[loc('galaxy_chthonian')]); },
            desc(){ return loc('galaxy_alien2_mission_desc',[loc('galaxy_chthonian')]); },
            reqs: { chthonian: 1 },
            grant: ['chthonian',2],
            queue_complete(){ return global.tech.chthonian >= 2 ? 0 : 1; },
            cost: {
                Custom(){
                    if (global.galaxy.hasOwnProperty('defense') && global.galaxy.defense.hasOwnProperty('gxy_chthonian')){
                        let total = 0;
                        Object.keys(global.galaxy.defense.gxy_chthonian).forEach(function(ship){
                            total += galaxyProjects.gxy_gateway[ship].ship.rating() * global.galaxy.defense.gxy_chthonian[ship];
                        });
                        return {
                            label: loc(`galaxy_fleet_rating`,[`<span${total < 1250 ? ` class="has-text-danger"` : ``}>1250</span>`]),
                            met: total < 1250 ? false : true
                        };
                    }
                    return {
                        label: loc(`galaxy_fleet_rating`,[`<span class="has-text-danger">1250</span>`]),
                        met: false
                    };
                }
            },
            effect(){
                let total = 0;
                if (global.galaxy.hasOwnProperty('defense') && global.galaxy.defense.hasOwnProperty('gxy_chthonian')){
                    Object.keys(global.galaxy.defense.gxy_chthonian).forEach(function(ship){
                        total += galaxyProjects.gxy_gateway[ship].ship.rating() * global.galaxy.defense.gxy_chthonian[ship];
                    });
                }
                let odds = total >= 4500 ? `<span class="has-text-success">${loc(`galaxy_piracy_low`)}</span>` : (total >= 2500 ? `<span class="has-text-warning">${loc(`galaxy_piracy_avg`)}</span>` : `<span class="has-text-danger">${loc(`galaxy_piracy_high`)}</span>`);
                return `<div>${loc('galaxy_alien2_mission_effect2',[total])}</div><div>${loc('galaxy_alien2_mission_effect3',[odds])}</div><div class="has-text-caution">${loc('galaxy_alien2_mission_effect',[loc('galaxy_chthonian')])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){

                    let total = 0;
                    Object.keys(global.galaxy.defense.gxy_chthonian).forEach(function(ship){
                        total += galaxyProjects.gxy_gateway[ship].ship.rating() * global.galaxy.defense.gxy_chthonian[ship];
                    });

                    if (total >= 1250){
                        let wreck = 500;
                        let loss = [];
                        messageQueue(loc('galaxy_chthonian_mission_result'),'info',false,['progress']);

                        if (total >= 2500){
                            wreck = total >= 4500 ? 80 : 160;
                        }
                        if (global.race['instinct']){
                            wreck /= 2;
                        }

                        Object.keys(global.galaxy.defense.gxy_chthonian).forEach(function(ship){
                            for (let i=0; i<global.galaxy.defense.gxy_chthonian[ship]; i++){
                                if (wreck > 0){
                                    wreck -= galaxyProjects.gxy_gateway[ship].ship.rating();
                                    loss.push(ship);
                                }
                            }
                        });

                        messageQueue(loc('galaxy_chthonian_mission_result_losses',[ loss.map( v => loc(`galaxy_${v}`) ).join(', ') ]),'danger',false,['progress']);

                        for (let i=0; i<loss.length; i++){
                            let ship = loss[i];
                            global.galaxy.defense.gxy_chthonian[ship]--;
                            global.galaxy[ship].on--;
                            global.galaxy[ship].count--;
                            global.galaxy[ship].crew -= galaxyProjects.gxy_gateway[ship].ship.civ();
                            global.galaxy[ship].mil -= galaxyProjects.gxy_gateway[ship].ship.mil();
                            global.resource[global.race.species].amount -= galaxyProjects.gxy_gateway[ship].ship.civ();
                            global.civic.garrison.workers -= galaxyProjects.gxy_gateway[ship].ship.mil();
                        }
                        return true;
                    }
                    return false;
                }
                return false;
            }
        },
        minelayer: {
            id: 'galaxy-minelayer',
            title: loc('galaxy_minelayer'),
            desc(){
                return `<div>${loc('galaxy_minelayer')}</div>`;
            },
            reqs: { chthonian: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('minelayer', offset, 9000000, 1.25, 'galaxy'); },
                Iron(offset){ return spaceCostMultiplier('minelayer', offset, 4800000, 1.25, 'galaxy'); },
                Nano_Tube(offset){ return spaceCostMultiplier('minelayer', offset, 1250000, 1.25, 'galaxy'); },
                Nanoweave(offset){ return spaceCostMultiplier('minelayer', offset, 100000, 1.25, 'galaxy'); },
            },
            effect(){
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                return `<div class="has-text-caution">${loc(`requires_res`,[loc('galaxy_starbase')])}</div><div class="has-text-advanced">${loc('galaxy_defense_platform_effect',[$(this)[0].ship.rating()])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil()])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            ship: {
                civ(){ return 0; },
                mil(){
                    let base = global.race['high_pop'] ? traits.high_pop.vars()[0] * 1 : 1;
                    return global.race['grenadier'] ? Math.ceil(base / 2) : base;
                },
                helium: 8,
                rating(){ 
                    let rating = global.race['banana'] ? 35 : 50;
                    if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.ship){
                        rating += global.race['banana'] ? 15 : 25;
                    }
                    return rating;
                }
            },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('minelayer','galaxy');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0, mil: 0 },
                    p: ['minelayer','galaxy']
                };
            },
            postPower(){
                vBind({el: `#gxy_chthonian`},'update');
            }
        },
        excavator: {
            id: 'galaxy-excavator',
            title: loc('galaxy_excavator'),
            desc(){
                return `<div>${loc('galaxy_excavator')}</div>`;
            },
            reqs: { chthonian: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('excavator', offset, 12000000, 1.25, 'galaxy'); },
                Polymer(offset){ return spaceCostMultiplier('excavator', offset, 4400000, 1.25, 'galaxy'); },
                Iridium(offset){ return spaceCostMultiplier('excavator', offset, 3600000, 1.25, 'galaxy'); },
                Mythril(offset){ return spaceCostMultiplier('excavator', offset, 180000, 1.25, 'galaxy'); },
            },
            effect(){
                let orichalcum = +(production('excavator')).toFixed(3);
                return `<div>${loc('gain',[orichalcum,global.resource.Orichalcum.name])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(8); },
            powerBalancer(){
                return [{ r: 'Orichalcum', p: production('excavator') }];
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('excavator','galaxy');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['excavator','galaxy']
                };
            }
        },
        raider: {
            id: 'galaxy-raider',
            title: loc('galaxy_raider'),
            desc(){
                return `<div>${loc('galaxy_raider')}</div>`;
            },
            reqs: { chthonian: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('raider', offset, 12000000, 1.25, 'galaxy'); },
                Titanium(offset){ return spaceCostMultiplier('raider', offset, 1250000, 1.25, 'galaxy'); },
                Bolognium(offset){ return spaceCostMultiplier('raider', offset, 600000, 1.25, 'galaxy'); },
                Vitreloy(offset){ return spaceCostMultiplier('raider', offset, 125000, 1.25, 'galaxy'); },
                Stanene(offset){ return spaceCostMultiplier('raider', offset, 825000, 1.25, 'galaxy'); },
            },
            effect(){
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                let deuterium = 0.65;
                let vitreloy = 0.05;
                let polymer = 2.3;
                let neutronium = 0.8;
                return `<div class="has-text-caution">${loc(`requires_res`,[loc('galaxy_starbase')])}</div><div class="has-text-advanced">${loc('galaxy_ship_rating',[$(this)[0].ship.rating()])}</div><div>${loc('gain',[deuterium,global.resource.Deuterium.name])}</div><div>${loc('gain',[vitreloy,global.resource.Vitreloy.name])}</div><div>${loc('gain',[polymer,global.resource.Polymer.name])}</div><div>${loc('gain',[neutronium,global.resource.Neutronium.name])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil()])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            ship: {
                civ(){ return 0; },
                mil(){
                    let base = global.race['grenadier'] ? 1 : 2;
                    return global.race['high_pop'] ? traits.high_pop.vars()[0] * base : base;
                },
                helium: 18,
                rating(){ 
                    let rating = global.race['banana'] ? 9 : 12;
                    if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.ship){
                        rating += global.race['banana'] ? 3 : 6;
                    }
                    return rating;
                }
            },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('raider','galaxy');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0, mil: 0 },
                    p: ['raider','galaxy']
                };
            },
            postPower(){
                vBind({el: `#gxy_chthonian`},'update');
            }
        },
    };

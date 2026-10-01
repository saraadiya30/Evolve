import { loc } from '../../core/locale.js';
import { races, traits } from '../../core/registries.js';
import { traitCostMod } from '../../races/trait_logic/racial_traits.js';
import { global } from '../../core/vars.js';
import { payCosts } from '../../actions/core/action_costs.js';
import { initStruct } from '../../actions/core/structure_ui.js';
import { powerOnNewStruct } from '../../actions/evolution/planet_setup.js';
import { spaceCostMultiplier } from '../../functions/cost_multipliers.js';
import { powerCostMod } from '../../functions/power_modifiers.js';
import { spatialReasoning } from '../../resources/resources.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { production } from '../../resources/prod.js';
import { galaxyProjects } from '../../core/registries.js';
import { incrementStruct } from '../space_requirements.js';
import { int_fuel_adjust } from '../planet_generation.js';

// Region 'gxy_alien1' dari galaxyProjects (dipisah dari space.js). Isi sama persis; digabung via core/registries.js di space.js.
export const galaxyProjects_gxy_alien1 = {
        info: {
            name(){ return loc('galaxy_alien',[races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].home]); },
            desc(){ return loc('galaxy_alien1_desc',[
                races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].home,
                races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name,
            ]); },
            control(){
                return {
                    name: races[global.galaxy.alien1.id].name,
                    color: 'advanced',
                };
            },
        },
        consulate: {
            id: 'galaxy-consulate',
            title: loc('galaxy_consulate'),
            desc(){
                return loc('galaxy_consulate_desc',[races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].home]);
            },
            reqs: { xeno: 8 },
            queue_complete(){ return 1 - global.galaxy.consulate.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.galaxy.hasOwnProperty('consulate') ? global.galaxy.consulate.count : 0)) < 1 ? 90000000 : 0; },
                Stone(offset){ return ((offset || 0) + (global.galaxy.hasOwnProperty('consulate') ? global.galaxy.consulate.count : 0)) < 1 ? 75000000 : 0; },
                Furs(offset){ return ((offset || 0) + (global.galaxy.hasOwnProperty('consulate') ? global.galaxy.consulate.count : 0)) < 1 ? 30000000 : 0; },
                Iron(offset){ return ((offset || 0) + (global.galaxy.hasOwnProperty('consulate') ? global.galaxy.consulate.count : 0)) < 1 ? 45000000 : 0; },
                Horseshoe(offset){ return global.race['hooved'] && (((offset || 0) + (global.galaxy.hasOwnProperty('consulate') ? global.galaxy.consulate.count : 0)) < 1) ? 10 : 0; }
            },
            effect(){
                return loc('plus_max_citizens',[$(this)[0].citizens()]);
            },
            refresh: true,
            action(args){
                if (payCosts($(this)[0])){
                    if (global.galaxy.consulate.count < 1){
                        incrementStruct('consulate','galaxy');
                        initStruct(galaxyProjects.gxy_alien1.resort);
                        initStruct(galaxyProjects.gxy_alien1.super_freighter);
                        global.tech.xeno = 9;
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['consulate','galaxy']
                };
            },
            citizens(){
                let pop = 10;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
            }
        },
        resort: {
            id: 'galaxy-resort',
            title: loc('galaxy_resort'),
            desc(){
                return `<div>${loc('galaxy_resort')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { xeno: 9 },
            cost: {
                Money(offset){ return spaceCostMultiplier('resort', offset, traitCostMod('untrustworthy',33000000), 1.25, 'galaxy'); },
                Stone(offset){ return spaceCostMultiplier('resort', offset, traitCostMod('untrustworthy',25000000), 1.25, 'galaxy'); },
                Furs(offset){ return spaceCostMultiplier('resort', offset, traitCostMod('untrustworthy',10000000), 1.25, 'galaxy'); },
                Oil(offset){ return spaceCostMultiplier('resort', offset, traitCostMod('untrustworthy',int_fuel_adjust(125000)), 1.25, 'galaxy'); },
            },
            effect(){
                let money = spatialReasoning(global.tech['world_control'] ? 1875000 : 1500000);
                let joy = (global.tech['theatre'] && !global.race['joyless']) ? `<div>${loc('plus_max_resource',[jobScale(2),loc(`job_entertainer`)])}</div>` : '';
                let desc = `<div>${loc('plus_max_resource',[`\$${money.toLocaleString()}`,loc('resource_Money_name')])}</div>${joy}<div>${loc('space_red_vr_center_effect2',[2])}</div>`;
                return desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(5); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('resort','galaxy');
                    if (powerOnNewStruct($(this)[0])){
                        if (global.tech['theatre'] && !global.race['joyless']){
                            global.civic.entertainer.max += jobScale(2);
                            global.civic.entertainer.display = true;
                        }
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['resort','galaxy']
                };
            }
        },
        vitreloy_plant: {
            id: 'galaxy-vitreloy_plant',
            title: loc('galaxy_vitreloy_plant'),
            desc(){
                return `<div>${loc('galaxy_vitreloy_plant')}</div><div class="has-text-special">${loc('galaxy_vitreloy_plant_desc')}</div>`;
            },
            reqs: { xeno: 10 },
            cost: {
                Money(offset){ return spaceCostMultiplier('vitreloy_plant', offset, 35000000, 1.25, 'galaxy'); },
                Cement(offset){ return spaceCostMultiplier('vitreloy_plant', offset, 1800000, 1.25, 'galaxy'); },
                Neutronium(offset){ return spaceCostMultiplier('vitreloy_plant', offset, 250000, 1.25, 'galaxy'); },
                Iridium(offset){ return spaceCostMultiplier('vitreloy_plant', offset, 850000, 1.25, 'galaxy'); },
                Aerogel(offset){ return spaceCostMultiplier('vitreloy_plant', offset, 400000, 1.25, 'galaxy'); },
            },
            effect(){
                let vitreloy = +(production('vitreloy_plant')).toFixed(2);
                let bolognium = 2.5;
                let stanene = 100;
                let cash = 50000;
                return `<div>${loc('galaxy_vitreloy_plant_effect',[vitreloy])}</div><div class="has-text-caution">${loc('galaxy_vitreloy_plant_effect2',[bolognium,stanene])}</div><div class="has-text-caution">${loc('galaxy_vitreloy_plant_effect3',[cash,$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(10); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('vitreloy_plant','galaxy');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['vitreloy_plant','galaxy']
                };
            },
        },
        super_freighter: {
            id: 'galaxy-super_freighter',
            title: loc('galaxy_super_freighter'),
            desc(){
                return `<div>${loc('galaxy_super_freighter')}</div><div class="has-text-special">${loc('galaxy_crew_fuel',[global.resource.Helium_3.name])}</div>`;
            },
            reqs: { xeno: 9 },
            cost: {
                Money(offset){ return spaceCostMultiplier('super_freighter', offset, 28000000, 1.2, 'galaxy'); },
                Aluminium(offset){ return spaceCostMultiplier('super_freighter', offset, 3500000, 1.2, 'galaxy'); },
                Alloy(offset){ return spaceCostMultiplier('super_freighter', offset, 1000000, 1.2, 'galaxy'); },
                Graphene(offset){ return spaceCostMultiplier('super_freighter', offset, 750000, 1.2, 'galaxy'); },
            },
            effect(){
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                let bank = '';
                if (global.tech.banking >= 13){
                    bank = `<div>${loc('interstellar_exchange_boost',[8])}</div>`;
                }
                return `<div class="has-text-caution">${loc(`requires_res`,[loc('galaxy_embassy')])}</div><div>${loc('galaxy_freighter_effect',[5,races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name])}</div>${bank}<div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ()])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            ship: {
                civ(){ return global.race['high_pop'] ? traits.high_pop.vars()[0] * 5 : 5; },
                mil(){ return 0; },
                helium: 25
            },
            special: true,
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('super_freighter','galaxy');
                    global.galaxy['super_freighter'].on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0 },
                    p: ['super_freighter','galaxy']
                };
            },
        },
    };

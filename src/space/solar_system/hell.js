import { loc } from '../../core/locale.js';
import { global } from '../../core/vars.js';
import { payCosts } from '../../actions/core/action_costs.js';
import { initStruct, structName } from '../../actions/core/structure_ui.js';
import { casinoEffect } from '../../actions/challenge/challenge_rules.js';
import { powerOnNewStruct } from '../../actions/evolution/planet_setup.js';
import { buildTemplate } from '../../actions/evolution/evolution_screen.js';
import { messageQueue } from '../../functions/message_log.js';
import { spaceCostMultiplier } from '../../functions/cost_multipliers.js';
import { get_qlevel } from '../../functions/quantum_level.js';
import { powerModifier, powerCostMod } from '../../functions/power_modifiers.js';
import { traits } from '../../core/registries.js';
import { traitCostMod } from '../../races/trait_logic/racial_traits.js';
import { addSmelter } from '../../industry/industry_smelter.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { spaceProjects } from '../../core/registries.js';
import { planetName, fuel_adjust, iron_adjust } from '../planet_generation.js';
import { incrementStruct } from '../space_requirements.js';

// Region 'spc_hell' dari spaceProjects (dipisah dari space.js). Isi sama persis; digabung via core/registries.js di space.js.
export const spaceProjects_spc_hell = {
        info: {
            name(){
                return planetName().hell;
            },
            desc(){
                return loc('space_hell_info_desc',[planetName().hell]);
            },
            zone: 'inner',
            syndicate(){ return false; }
        },
        hell_mission: {
            id: 'space-hell_mission',
            title(){
                return loc('space_mission_title',[planetName().hell]);
            },
            desc(){
                return loc('space_mission_desc',[planetName().hell]);
            },
            reqs: { space: 3, space_explore: 3 },
            grant: ['hell',1],
            queue_complete(){ return global.tech.hell >= 1 ? 0 : 1; },
            cost: {
                Helium_3(offset,wiki){ return +fuel_adjust(6500,false,wiki).toFixed(0); }
            },
            effect(){
                return loc('space_hell_mission_effect1',[planetName().hell]);
            },
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('space_hell_mission_action',[planetName().hell]),'info',false,['progress']);
                    initStruct(spaceProjects.spc_hell.geothermal);
                    return true;
                }
                return false;
            }
        },
        geothermal: {
            id: 'space-geothermal',
            title: loc('space_hell_geothermal_title'),
            desc(){
                return `<div>${loc('space_hell_geothermal_desc')}</div><div class="has-text-special">${loc('space_hell_geothermal_desc_req')}</div>`;
            },
            reqs: { hell: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('geothermal', offset, 38000, 1.35); },
                Steel(offset){ return spaceCostMultiplier('geothermal', offset, 15000, 1.35); },
                Polymer(offset){ return spaceCostMultiplier('geothermal', offset, 9500, 1.35); }
            },
            effect(wiki){
                let helium = +(fuel_adjust($(this)[0].p_fuel().a,true,wiki)).toFixed(2);
                let num_smelters = $(this)[0].smelting();
                let smelter = num_smelters > 0 ? `<div>${loc('interstellar_stellar_forge_effect3',[num_smelters])}</div>` : ``;
                return `${smelter}<span>${loc('space_dwarf_reactor_effect1',[-($(this)[0].powered())])}</span>, <span class="has-text-caution">${loc('space_belt_station_effect3',[helium])}</span>`;
            },
            special(){ return $(this)[0].smelting() > 0; },
            powered(){
                let power = -8;
                if (global.race['forge']){
                    power -= traits.forge.vars()[0];
                }
                if (global.stats.achieve['failed_history'] && global.stats.achieve.failed_history.l >= 5){ power -= 2; }
                return powerModifier(power);
            },
            smelting(){
                if (global.race['cataclysm'] || global.race['orbit_decayed']){
                    return 1;
                }
                return 0;
            },
            p_fuel(){ return { r: 'Helium_3', a: 0.5 }; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('geothermal');
                    global.space['geothermal'].on++;
                    let num_smelters = $(this)[0].smelting();
                    if (num_smelters > 0){
                        addSmelter(num_smelters);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['geothermal','space']
                };
            }
        },
        hell_smelter: {
            id: 'space-hell_smelter',
            title(){
                return loc('space_hell_smelter_title',[planetName().hell]);
            },
            desc(){
                return loc('space_hell_smelter_title',[planetName().hell]);
            },
            reqs: { hell: 1, m_smelting: 1 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('hell_smelter', offset, 250000, 1.24); },
                Adamantite(offset){ return spaceCostMultiplier('hell_smelter', offset, 15000, 1.24); }
            },
            effect(){
                return `<div>${loc('interstellar_stellar_forge_effect3',[$(this)[0].smelting()])}</div>`;
            },
            special: true,
            smelting(){
                return 2;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('hell_smelter');
                    addSmelter($(this)[0].smelting(), 'Steel');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['hell_smelter','space']
                };
            }
        },
        spc_casino: {
            id: 'space-spc_casino',
            title(){ return structName('casino'); },
            desc(){ return structName('casino'); },
            category: 'commercial',
            reqs: { hell: 1, gambling: 1 },
            condition(){
                return global.race['cataclysm'] || (global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 5) ? true : false;
            },
            cost: {
                Money(offset){ return spaceCostMultiplier('spc_casino', offset, traitCostMod('untrustworthy',400000), 1.35); },
                Furs(offset){ return spaceCostMultiplier('spc_casino', offset, traitCostMod('untrustworthy',75000), 1.35); },
                Cement(offset){ return spaceCostMultiplier('spc_casino', offset, traitCostMod('untrustworthy',100000), 1.35); },
                Plywood(offset){ return spaceCostMultiplier('spc_casino', offset, traitCostMod('untrustworthy',20000), 1.35); }
            },
            effect(){
                let desc = casinoEffect();
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 2 ? 2 : 3); },
            action(args){
                if (payCosts($(this)[0])){
                    global.space.spc_casino.count++;
                    if (global.tech['theatre'] && !global.race['joyless']){
                        global.civic.entertainer.max += jobScale(1);
                        global.civic.entertainer.display = true;
                    }
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['spc_casino','space']
                };
            },
            flair: loc('city_casino_flair')
        },
        swarm_plant: {
            id: 'space-swarm_plant',
            title: loc('space_hell_swarm_plant_title'),
            desc(){
                return `<div>${loc('space_hell_swarm_plant_desc')}</div>`;
            },
            reqs: { solar: 4, hell: 1 },
            cost: {
                Money(offset, wiki){ return spaceCostMultiplier('swarm_plant', offset, iron_adjust(75000, wiki), 1.28); },
                Iron(offset, wiki){ return spaceCostMultiplier('swarm_plant', offset, iron_adjust(65000, wiki), 1.28); },
                Neutronium(offset, wiki){ return spaceCostMultiplier('swarm_plant', offset, iron_adjust(75, wiki), 1.28); },
                Brick(offset, wiki){ return spaceCostMultiplier('swarm_plant', offset, iron_adjust(2500, wiki), 1.28); },
                Mythril(offset, wiki){ return spaceCostMultiplier('swarm_plant', offset, iron_adjust(100, wiki), 1.28); }
            },
            effect(wiki){
                let reduce = global.tech['swarm'] ? 0.88 : 0.94;
                if (global.tech['swarm'] >= 3){
                    reduce -= get_qlevel(wiki) / 100;
                }
                if (reduce < 0.05){
                    reduce = 0.05;
                }
                reduce = +((1 - reduce) * 100).toFixed(2);
                return loc('space_hell_swarm_plant_effect1',[reduce]);
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('swarm_plant');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['swarm_plant','space']
                };
            }
        },
        firework: buildTemplate(`firework`,'space'),
    };

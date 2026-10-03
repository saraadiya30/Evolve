import { loc } from '../../core/locale.js';
import { spaceCostMultiplier, powerCostMod } from '../../functions/functions.js';
import { global, sizeApproximation } from '../../core/vars.js';
import { jobScale } from '../../civics/jobs.js';
import { payCosts, powerOnNewStruct, actions } from '../../actions/actions.js';
import { incrementStruct } from '../../space/space.js';
import { traits } from '../../races/races.js';
import { spatialReasoning } from '../../resources/resources.js';
import { edenicModules } from '../registry.js';

// Bagian dari edenAsphodel (2 entri: rectory .. corruptor), dipisah dari asphodel.js. Urutan entri sama persis.
export const edenAsphodelPart3 = {
        rectory: {
            id: 'eden-rectory',
            title: loc('eden_rectory_title'),
            desc: `<div>${loc('eden_rectory_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { asphodel: 11 },
            not_trait: ['warlord'],
            cost: {
                Money(offset){ return spaceCostMultiplier('rectory', offset, 275000000, 1.24, 'eden'); },
                Copper(offset){ return spaceCostMultiplier('rectory', offset, 18200000, 1.24, 'eden'); },
                Brick(offset){ return spaceCostMultiplier('rectory', offset, 7500000, 1.24, 'eden'); },
                Soul_Gem(offset){ return spaceCostMultiplier('rectory', offset, 18, 1.24, 'eden'); },
            },
            effect(){
                let desc = `<div>${loc('eden_encampment_effect',[$(this)[0].support()])}</div>`;
                desc += `<div>${loc('plus_max_citizens',[$(this)[0].citizens()])}</div>`;
                if (global.genes['ancients'] && global.genes['ancients'] >= 4){
                    desc += `<div>${loc('plus_max_resource',[jobScale(1),global.civic?.priest?.name || loc(`job_priest`)])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            support(){ return 1; },
            powered(){ return powerCostMod(50); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('rectory','eden');
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
                    p: ['rectory','eden']
                };
            },
            citizens(){
                let pop = 4;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
            },
            flair(){
                return loc(`eden_rectory_flair`);
            }
        },
        corruptor: {
            id: 'eden-corruptor',
            title: loc('eden_corruptor_title'),
            desc: `<div>${loc('eden_corruptor_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { asphodel: 11 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('corruptor', offset, 275000000, 1.24, 'eden'); },
                Furs(offset){ return spaceCostMultiplier('corruptor', offset, 17500000, 1.24, 'eden'); },
                Copper(offset){ return spaceCostMultiplier('corruptor', offset, 18200000, 1.24, 'eden'); },
                Soul_Gem(offset){ return spaceCostMultiplier('corruptor', offset, 8, 1.24, 'eden'); },
            },
            effect(){
                let elerium = sizeApproximation(spatialReasoning(200));
                let warehouse = global.tech?.asphodel >= 12 ? edenicModules.eden_asphodel.warehouse.title() : `${loc('wiki_tech_tree_asphodel')} ${edenicModules.eden_asphodel.warehouse.title()}`;

                let desc = `<div>${loc('eden_encampment_effect',[$(this)[0].support()])}</div>`;
                desc += `<div>${loc('eden_corruptor_effect',[4,edenicModules.eden_asphodel.research_station.title(),global.resource.Omniscience.name])}</div>`;
                desc += `<div>${loc('eden_corruptor_effect',[global.tech?.asphodel >= 12 ? (global.tech?.asphodel >= 13 ? 16 : 12) : 8,warehouse,loc('tab_storage')])}</div>`;
                if (global.tech?.asphodel >= 12){
                    desc += `<div>${loc('eden_corruptor_effect',[global.tech?.asphodel >= 13 ? 12 : 10,actions.portal.prtl_lake.harbor.title(),loc('tab_storage')])}</div>`;
                }
                desc += `<div>${loc('eden_corruptor_effect2',[5,edenicModules.eden_asphodel.stabilizer.title()])}</div>`;
                desc += `<div>${loc('production',[6,edenicModules.eden_asphodel.asphodel_harvester.title()])}</div>`;
                if (global.tech?.asphodel >= 12){
                    desc += `<div>${loc('eden_corruptor_effect',[8,edenicModules.eden_elysium.eternal_bank.title(),loc('resource_Money_name')])}</div>`;
                    desc += `<div>${loc('eden_corruptor_effect',[6,edenicModules.eden_asphodel.soul_engine.title(),loc('power')])}</div>`;
                }
                if (global.tech?.asphodel >= 13){
                    desc += `<div>${loc('eden_corruptor_effect2',[3,edenicModules.eden_isle.spirit_battery.title()])}</div>`;
                }
                desc += `<div>${loc('plus_max_resource',[elerium,global.resource.Elerium.name])}</div>`;
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            support(){ return 1; },
            powered(){ return powerCostMod(25); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('corruptor','eden');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['corruptor','eden']
                };
            }
        },
};

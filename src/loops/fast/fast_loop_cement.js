// Produksi Cement per tick (cement worker dan pabrik).
import { global, breakdown, p_on, support_on, quantum_level } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { traits } from '../../core/registries.js';
import { biomes } from '../../races/planet_data.js';
import { racialTrait } from '../../races/trait_logic/racial_traits.js';
import { govActive } from '../../governor/gov_active.js';
import { govEffect } from '../../civics/gov_effect.js';
import { production } from '../../resources/prod.js';
import { loc } from '../../core/locale.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';

export function fastLoopCement($ctx){
        // Cement
        if (global.resource.Cement.display){
            let unit_price = global.race['high_pop'] ? 3 / traits.high_pop.vars()[0] : 3;
            if (global.city.biome === 'ashland'){
                unit_price *= biomes.ashland.vars()[1];
            }
            let stone_cost = workerScale(global.civic.cement_worker.workers,'cement_worker') * unit_price;
            let workDone = workerScale(global.civic.cement_worker.workers,'cement_worker');
            while (stone_cost * $ctx.time_multiplier > global.resource.Stone.amount && stone_cost > 0){
                stone_cost -= unit_price;
                workDone--;
            }

            let tauBonus = global.tech['isolation'] ? 1 + ((support_on['colony'] || 0) * 0.5) : 1;
            breakdown.p.consume.Stone[loc(global.tech['isolation'] ? 'job_cement_worker_bd' : 'city_cement_plant_bd')] = -(stone_cost);
            modRes('Stone', -(stone_cost * $ctx.time_multiplier));

            let cement_base = global.tech['cement'] >= 4 ? (global.tech.cement >= 7 ? 1.45 : 1.2) : 1;
            cement_base *= global.civic.cement_worker.impact;
            cement_base *= racialTrait(workerScale(global.civic.cement_worker.workers,'cement_worker'),'factory');
            if (global.city.biome === 'ashland'){
                cement_base *= biomes.ashland.vars()[1];
            }
            if (global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 3){
                cement_base *= 1.1;
            }

            let factory_output = workDone * cement_base * production('psychic_boost','Cement');
            if (global.civic.govern.type === 'corpocracy'){
                factory_output *= 1 + (govEffect.corpocracy()[4] / 100);
            }
            if (global.civic.govern.type === 'socialist'){
                factory_output *= 1 + (govEffect.socialist()[1] / 100);
            }
            let dirtVal = govActive('dirty_jobs',2);
            if (dirtVal){
                factory_output *= 1 + (dirtVal / 100);
            }

            let powered_mult = 1;
            let power_single = 1;
            if (global.city.powered && p_on['cement_plant']){
                let rate = global.tech['cement'] >= 6 ? 0.08 : 0.05;
                powered_mult += (p_on['cement_plant'] * rate);
                power_single += rate;
            }

            let ai_core = 1;
            if (global.tech['ai_core'] && p_on['citadel'] > 0){
                let ai = +(quantum_level / 1.75).toFixed(1) / 100;
                ai_core += (p_on['citadel'] * ai);
            }

            let hell_factory = 1;
            if (global.race['warlord'] && global.portal['hell_factory'] && p_on['hell_factory'] > 0){
                hell_factory += p_on['hell_factory'] * 8 * (global.portal.hell_factory.rank - 1) / 100
            }

            let mining_pit = global.tech['isolation'] ? 1 + (support_on['mining_pit'] * 0.08) : 1;

            let cq_multiplier = global.tech['isolation'] ? 1 : $ctx.q_multiplier;
            breakdown.p['Cement'][loc(global.tech['isolation'] ? 'job_cement_worker_bd' : 'city_cement_plant_bd')] = factory_output + 'v';
            if (factory_output > 0){
                if (global.tech['isolation']){
                    breakdown.p['Cement'][`ᄂ${loc('tau_home_colony')}+0`] = ((tauBonus - 1) * 100) + '%';
                    breakdown.p['Cement'][`ᄂ${loc('tau_home_mining_pit')}+0`] = ((mining_pit - 1) * 100) + '%';
                }
                breakdown.p['Cement'][`ᄂ${loc('power')}+0`] = ((powered_mult - 1) * 100) + '%';
                breakdown.p['Cement'][`ᄂ${loc('quarantine')}+0`] = ((cq_multiplier - 1) * 100) + '%';
            }

            if (hell_factory > 1){
                breakdown.p['Cement'][`ᄂ${loc('portal_factory_title')}+0`] = ((hell_factory - 1) * 100) + '%';
            }

            if (global.race['discharge'] && global.race['discharge'] > 0 && p_on['cement_plant'] > 0){
                powered_mult = (powered_mult - 1) * 0.5 + 1;
                power_single = (power_single - 1) * 0.5 + 1;
                breakdown.p['Cement'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
            }

            let delta = factory_output * ai_core * tauBonus * mining_pit * hell_factory;
            if (global.city['cement_plant']){
                global.city.cement_plant['cnvay'] = +(delta * $ctx.hunger * cq_multiplier * $ctx.global_multiplier * (power_single - 1)).toFixed(5);
            }
            delta *= powered_mult * $ctx.hunger * cq_multiplier * $ctx.global_multiplier;

            if (global.tech['ai_core'] && p_on['citadel'] > 0){
                breakdown.p['Cement'][loc('interstellar_citadel_effect_bd')] = ((ai_core - 1) * 100) + '%';
            }
            breakdown.p['Cement'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
            modRes('Cement', delta * $ctx.time_multiplier);
        }
}

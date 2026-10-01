// Pit miner, tau farm, bonus shrine, dan Bolognium dari s_gate per tick.
import { global, breakdown, gal_on, p_on, support_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { shrineBonusActive } from '../../functions/run_stats_helpers.js';
import { racialTrait } from '../../races/trait_logic/racial_traits.js';
import { production } from '../../resources/prod.js';
import { loc } from '../../core/locale.js';
import { piracy } from '../../space/space_requirements.js';
import { jobName } from '../../civics/jobs/job_name.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';
import { tauEnabled } from '../../truepath/support.js';

export function fastLoopPitMiner($ctx){
        // Pit Miner
        if (global.civic.pit_miner.display){
            if (tauEnabled()){
                let miner_base = workerScale(global.civic.pit_miner.workers,'pit_miner');
                miner_base *= racialTrait(miner_base,'miner');
                let colony_val = 1 + ((support_on['colony'] || 0) * 0.5);

                { // Bolognium
                    let bol_base = miner_base * production('psychic_boost','Bolognium');
                    bol_base *= production('mining_pit','bolognium');
                    let delta = bol_base * $ctx.global_multiplier * colony_val;

                    breakdown.p['Bolognium'][jobName('pit_miner')] = bol_base + 'v';
                    if (bol_base > 0){
                        breakdown.p['Bolognium'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                    }

                    modRes('Bolognium', delta * $ctx.time_multiplier);
                }

                { // Stone
                    let stone_base = miner_base * production('psychic_boost','Stone');
                    stone_base *= production('mining_pit','stone');
                    let delta = stone_base * $ctx.global_multiplier * colony_val;

                    breakdown.p['Stone'][jobName('pit_miner')] = stone_base + 'v';
                    if (stone_base > 0){
                        breakdown.p['Stone'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                    }

                    modRes('Stone', delta * $ctx.time_multiplier);
                }

                if (global.race['smoldering']){ // Chrysotile
                    let cry_base = miner_base * production('psychic_boost','Chrysotile');
                    cry_base *= production('mining_pit','chrysotile');
                    let delta = cry_base * $ctx.global_multiplier * colony_val * $ctx.hunger;

                    breakdown.p['Chrysotile'][jobName('pit_miner')] = cry_base + 'v';
                    if (cry_base > 0){
                        breakdown.p['Chrysotile'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                        breakdown.p['Chrysotile'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
                    }
                    modRes('Chrysotile', delta * $ctx.time_multiplier);
                }

                { // Adamantite
                    let adam_base = miner_base * production('psychic_boost','Adamantite');
                    adam_base *= production('mining_pit','adamantite');
                    let delta = adam_base * $ctx.shrineMetal.mult * $ctx.global_multiplier * colony_val;

                    breakdown.p['Adamantite'][jobName('pit_miner')] = adam_base + 'v';
                    if (adam_base > 0){
                        breakdown.p['Adamantite'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                    }

                    modRes('Adamantite', delta * $ctx.time_multiplier);
                }

                if (global.tech['isolation']){
                    { // Copper
                        let copper_base = miner_base * production('psychic_boost','Copper');
                        copper_base *= production('mining_pit','copper');
                        let delta = copper_base * $ctx.shrineMetal.mult * $ctx.global_multiplier * colony_val;

                        breakdown.p['Copper'][jobName('pit_miner')] = copper_base + 'v';
                        if (copper_base > 0){
                            breakdown.p['Copper'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                        }

                        modRes('Copper', delta * $ctx.time_multiplier);
                    }

                    { // Coal
                        let coal_base = miner_base * production('psychic_boost','Coal');
                        coal_base *= production('mining_pit','coal');
                        let delta = coal_base * $ctx.global_multiplier * colony_val;

                        breakdown.p['Coal'][jobName('pit_miner')] = coal_base + 'v';
                        if (coal_base > 0){
                            breakdown.p['Coal'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                        }

                        modRes('Coal', delta * $ctx.time_multiplier);
                    }

                    if (global.race['lone_survivor']){ // Aluminium
                        let alum_base = miner_base * production('psychic_boost','Aluminium');
                        alum_base *= production('mining_pit','aluminium');
                        let delta = alum_base * $ctx.shrineMetal.mult * $ctx.global_multiplier * colony_val;

                        breakdown.p['Aluminium'][jobName('pit_miner')] = alum_base + 'v';
                        if (alum_base > 0){
                            breakdown.p['Aluminium'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                        }

                        modRes('Aluminium', delta * $ctx.time_multiplier);
                    }
                }
            }
            else {
                let materials_bd = {};
                let miner_base = workerScale(global.civic.pit_miner.workers,'pit_miner');
                miner_base *= racialTrait(miner_base,'miner');
                miner_base *= production('mining_pit','materials');

                let colony_val = 1 + ((support_on['colony'] || 0) * 0.5);
                let delta = miner_base * $ctx.global_multiplier * colony_val;

                materials_bd[jobName('pit_miner')] = miner_base + 'v';
                if (miner_base > 0){
                    materials_bd[`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                }

                breakdown.p['Materials'] = materials_bd;
                modRes('Materials', delta * $ctx.time_multiplier);
            }
        }

        if (global.tauceti['tau_farm'] && p_on['tau_farm']){
            let colony_val = 1 + ((support_on['colony'] || 0) * 0.5);

            if (!global.race['kindling_kindred'] && !global.race['smoldering']){
                let lumber_base = production('tau_farm','lumber') * p_on['tau_farm'] * production('psychic_boost','Lumber');
                let delta = lumber_base * $ctx.global_multiplier * colony_val;

                breakdown.p['Lumber'][loc('tau_home_tau_farm')] = lumber_base + 'v';
                if (lumber_base > 0){
                    breakdown.p['Lumber'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                }

                modRes('Lumber', delta * $ctx.time_multiplier);
            }
        }

        if (shrineBonusActive()){
            breakdown.p['Adamantite'][loc('city_shrine')] = (($ctx.shrineMetal.mult - 1) * 100).toFixed(1) + '%';
        }

        if (p_on['s_gate'] && global.resource.Bolognium.display && global.galaxy['armed_miner'] && gal_on['armed_miner'] > 0){
            let base = gal_on['armed_miner'] * 0.032 * production('psychic_boost','Bolognium');
            let foothold = 1 + ((gal_on['ore_processor'] ?? 0)* 0.1);
            let pirate = piracy('gxy_alien2');
            let delta = base * $ctx.global_multiplier * pirate * foothold * $ctx.zigVal;

            breakdown.p['Bolognium'][loc('galaxy_armed_miner_bd')] = base + 'v';
            if (base > 0){
                breakdown.p['Bolognium'][`ᄂ${loc('galaxy_ore_processor')}`] = -((1 - foothold) * 100) + '%';
                breakdown.p['Bolognium'][`ᄂ${loc('galaxy_piracy')}+1`] = -((1 - pirate) * 100) + '%';
                breakdown.p['Bolognium'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = (($ctx.zigVal - 1) * 100) + '%';
                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.5;
                    breakdown.p['Bolognium'][`ᄂ${loc('evo_challenge_discharge')}+1`] = '-50%';
                }
            }

            modRes('Bolognium', delta * $ctx.time_multiplier);
        }
}

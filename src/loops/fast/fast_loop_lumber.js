// Produksi Lumber per tick (lumberjack, biodome, dan sumber lain).
import { global, breakdown, p_on, support_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { traits, hooks, actions } from '../../core/registries.js';
import { biomes } from '../../races/planet_data.js';
import { racialTrait, servantTrait } from '../../races/trait_logic/racial_traits.js';
import { weaponTechModifer } from '../../civics/military/army_rating.js';
import { garrisonSize } from '../../civics/military/garrison.js';
import { production } from '../../resources/prod.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { loc } from '../../core/locale.js';
import { jobName } from '../../civics/jobs/job_name.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';
import { jobScale } from '../../civics/jobs/job_scale.js';

export function fastLoopLumber($ctx){
        // Lumber
        { //block scope
            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                if (global.tech['mars'] && support_on['biodome'] && !global.race['kindling_kindred'] && !global.race['smoldering']){
                    let lumber = support_on['biodome'] * workerScale(global.civic.colonist.workers,'colonist') * production('biodome','lumber') * production('psychic_boost','Lumber');

                    breakdown.p['Lumber'][actions.space.spc_red.biodome.title()] = lumber  + 'v';
                    if (lumber > 0){
                        breakdown.p['Lumber'][`ᄂ${loc('space_red_ziggurat_title')}`] = (($ctx.zigVal - 1) * 100) + '%';
                    }
                    breakdown.p['Lumber'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';

                    modRes('Lumber', lumber * $ctx.hunger * $ctx.global_multiplier * $ctx.time_multiplier * $ctx.zigVal);
                }
            }
            else if (global.race['soul_eater'] && global.race.species !== 'wendigo' && global.race['evil']){
                let weapons = weaponTechModifer();
                let hunters = workerScale(global.civic.hunter.workers,'hunter');
                hunters *= racialTrait(hunters,'hunting');

                if (global.race['servants']){
                    let serve = jobScale(global.race.servants.jobs.hunter);
                    serve *= servantTrait(global.race.servants.jobs.hunter,'hunting');
                    hunters += highPopAdjust(serve);
                }

                hunters *= weapons / 2;
                hunters *= production('psychic_boost','Lumber');

                let soldiers = hooks.armyRating(garrisonSize(),'hunting') / 3;
                soldiers *= production('psychic_boost','Lumber');

                breakdown.p['Lumber'][jobName('hunter')] = hunters  + 'v';
                breakdown.p['Lumber'][loc('soldiers')] = soldiers  + 'v';
                breakdown.p['Lumber'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
                modRes('Lumber', hunters * $ctx.hunger * $ctx.global_multiplier * $ctx.time_multiplier);
                modRes('Lumber', soldiers * $ctx.hunger * $ctx.global_multiplier * $ctx.time_multiplier);
            }
            else if (global.race['evil']){
                let reclaimers = workerScale(global.civic.lumberjack.workers,'lumberjack');
                reclaimers *= racialTrait(reclaimers,'lumberjack');

                if (global.race['servants']){
                    let serve = global.race.servants.jobs.lumberjack;
                    serve *= servantTrait(global.race.servants.jobs.lumberjack,'lumberjack');
                    reclaimers += serve;
                }

                reclaimers *= production('psychic_boost','Lumber');

                let graveyard = 1;
                if (global.city['graveyard']){
                    graveyard += global.city['graveyard'].count * 0.08;
                }

                let soldiers = hooks.armyRating(garrisonSize(),'hunting') / 5;
                soldiers *= production('psychic_boost','Lumber');

                breakdown.p['Lumber'][jobName('lumberjack')] = reclaimers  + 'v';
                if (reclaimers > 0){
                    breakdown.p['Lumber'][`ᄂ${loc('city_graveyard')}+0`] = ((graveyard - 1) * 100) + '%';
                    breakdown.p['Lumber'][`ᄂ${loc('quarantine')}+0`] = (($ctx.q_multiplier - 1) * 100) + '%';
                }
                breakdown.p['Lumber'][loc('soldiers')] = soldiers  + 'v';
                if (soldiers > 0){
                    breakdown.p['Lumber'][`ᄂ${loc('quarantine')}+1`] = (($ctx.q_multiplier - 1) * 100) + '%';
                }
                if (global.race['forager']){
                    let forage = 1;
                    let foragers = workerScale(global.civic.forager.workers,'forager');
                    foragers *= racialTrait(foragers,'forager');

                    if (global.race['servants']){
                        let serve = global.race.servants.jobs.forager;
                        serve *= servantTrait(global.race.servants.jobs.forager,'forager');
                        foragers += serve;
                    }

                    let forage_base = foragers * forage * 0.25;
                    breakdown.p['Lumber'][jobName('forager')] = forage_base  + 'v';
                    if (forage_base > 0){
                        breakdown.p['Lumber'][`ᄂ${loc('city_graveyard')}+1`] = ((graveyard - 1) * 100) + '%';
                        breakdown.p['Lumber'][`ᄂ${loc('quarantine')}+2`] = (($ctx.q_multiplier - 1) * 100) + '%';
                    }
                    modRes('Lumber', forage_base * $ctx.hunger * graveyard * $ctx.global_multiplier * $ctx.q_multiplier * $ctx.time_multiplier);
                }
                breakdown.p['Lumber'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
                modRes('Lumber', reclaimers * $ctx.hunger * graveyard * $ctx.global_multiplier * $ctx.q_multiplier * $ctx.time_multiplier);
                modRes('Lumber', soldiers * $ctx.hunger * $ctx.global_multiplier * $ctx.q_multiplier * $ctx.time_multiplier);
            }
            else {
                let lumber_base = workerScale(global.civic.lumberjack.workers,'lumberjack');
                lumber_base *= racialTrait(lumber_base,'lumberjack');

                if (global.race['servants']){
                    let serve = global.race.servants.jobs.lumberjack;
                    serve *= servantTrait(global.race.servants.jobs.lumberjack,'lumberjack');
                    lumber_base += serve;
                }

                lumber_base *= global.city.biome === 'forest' ? biomes.forest.vars()[0] : 1;
                lumber_base *= global.city.biome === 'savanna' ? biomes.savanna.vars()[2] : 1;
                lumber_base *= global.city.biome === 'desert' ? biomes.desert.vars()[2] : 1;
                lumber_base *= global.city.biome === 'swamp' ? biomes.swamp.vars()[2] : 1;
                lumber_base *= global.city.biome === 'taiga' ? biomes.taiga.vars()[0] : 1;
                lumber_base *= global.civic.lumberjack.impact;
                if (global.race['living_tool']){
                    lumber_base *= traits.living_tool.vars()[0] * (global.tech['science'] && global.tech.science > 0 ? global.tech.science * 0.25 : 0) + 1;
                }
                else {
                    lumber_base *= (global.tech['axe'] && global.tech.axe > 1 ? (global.tech.axe - 1) * 0.35 : 0) + 1;
                }
                lumber_base *= production('psychic_boost','Lumber');

                let sawmills = 1;
                if (global.city['sawmill']){
                    let saw = global.tech['saw'] >= 2 ? 0.08 : 0.05;
                    sawmills *= (global.city.sawmill.count * saw) + 1;
                }
                let power_mult = 1;
                let power_single = 1;
                if (global.city.powered && global.city.sawmill && p_on['sawmill']){
                    power_mult += (p_on['sawmill'] * 0.04);
                    power_single += 0.04;
                }
                let lumber_yard = 1;
                if (global.city['lumber_yard']){
                    lumber_yard += global.city['lumber_yard'].count * 0.02;
                }

                breakdown.p['Lumber'][jobName('lumberjack')] = lumber_base + 'v';
                if (lumber_base > 0){
                    breakdown.p['Lumber'][`ᄂ${loc('city_lumber_yard')}`] = ((lumber_yard - 1) * 100) + '%';
                    breakdown.p['Lumber'][`ᄂ${loc('city_sawmill')}`] = ((sawmills - 1) * 100) + '%';
                    breakdown.p['Lumber'][`ᄂ${loc('power')}`] = ((power_mult - 1) * 100) + '%';
                    breakdown.p['Lumber'][`ᄂ${loc('quarantine')}+0`] = (($ctx.q_multiplier - 1) * 100) + '%';
                }
                if (global.race['discharge'] && global.race['discharge'] > 0 && p_on['sawmill'] > 0){
                    power_mult = (power_mult - 1) * 0.5 + 1;
                    power_single = (power_single - 1) * 0.5 + 1;
                    breakdown.p['Lumber'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }

                let delta = lumber_base * sawmills * lumber_yard;
                if (global.city['sawmill']){
                    global.city.sawmill['psaw'] = +(delta * $ctx.hunger * $ctx.q_multiplier * $ctx.global_multiplier * (power_single - 1)).toFixed(5);
                }
                delta *= power_mult * $ctx.hunger * $ctx.q_multiplier * $ctx.global_multiplier;

                if (global.race['forager']){
                    let forage = 1;
                    let foragers = workerScale(global.civic.forager.workers,'forager');
                    foragers *= racialTrait(foragers,'forager');

                    if (global.race['servants']){
                        let serve = global.race.servants.jobs.forager;
                        serve *= servantTrait(global.race.servants.jobs.forager,'forager');
                        foragers += serve;
                    }

                    let forage_base = foragers * forage * 0.25 * production('psychic_boost','Lumber');
                    breakdown.p['Lumber'][jobName('forager')] = forage_base  + 'v';
                    if (lumber_base > 0){
                        breakdown.p['Lumber'][`ᄂ${loc('city_lumber_yard')}`] = ((lumber_yard - 1) * 100) + '%';
                        breakdown.p['Lumber'][`ᄂ${loc('city_sawmill')}`] = ((sawmills - 1) * 100) + '%';
                        breakdown.p['Lumber'][`ᄂ${loc('power')}`] = ((power_mult - 1) * 100) + '%';
                        breakdown.p['Lumber'][`ᄂ${loc('quarantine')}+0`] = (($ctx.q_multiplier - 1) * 100) + '%';
                    }

                    modRes('Lumber', forage_base * $ctx.hunger * $ctx.q_multiplier * sawmills * lumber_yard * power_mult * $ctx.global_multiplier * $ctx.time_multiplier);
                }

                breakdown.p['Lumber'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
                modRes('Lumber', delta * $ctx.time_multiplier);
            }
        }
}

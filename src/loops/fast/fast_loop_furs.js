// Produksi Furs per tick (hunter, trait evil/unfathomable, isolasi). Dulu bagian dari fastLoopCore_s7.
import { global, breakdown } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { traits, hooks } from '../../core/registries.js';
import { biomes } from '../../races/planet_data.js';
import { racialTrait, servantTrait } from '../../races/trait_logic/racial_traits.js';
import { weaponTechModifer } from '../../civics/military/army_rating.js';
import { garrisonSize } from '../../civics/military/garrison.js';
import { production } from '../../resources/prod.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { loc } from '../../core/locale.js';
import { tradeRatio } from '../../config/constants.js';
import { jobName } from '../../civics/jobs/job_name.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';
import { jobScale } from '../../civics/jobs/job_scale.js';

export function fastLoopFurs($ctx){
        // Furs
        if (global.resource.Furs.display){
            if (global.race['evil'] || global.race['artifical'] || global.race['unfathomable']){
                let weapons = weaponTechModifer();
                let hunters = workerScale(global.civic.hunter.workers,'hunter');
                hunters *= racialTrait(hunters,'hunting');
                if (global.race['servants']){
                    let serve = global.race.servants.jobs.hunter;
                    serve *= servantTrait(global.race.servants.jobs.hunter,'hunting');
                    hunters += serve;
                }
                if (global.city.biome === 'oceanic'){
                    hunters *= biomes.oceanic.vars()[2];
                }
                else if (global.city.biome === 'tundra'){
                    hunters *= biomes.tundra.vars()[0];
                }
                hunters *= weapons / 20;
                hunters *= production('psychic_boost','Furs');
                breakdown.p['Furs'][jobName('hunter')] = hunters  + 'v';
                if (hunters > 0){
                    breakdown.p['Furs'][`ᄂ${loc('quarantine')}+0`] = (($ctx.q_multiplier - 1) * 100) + '%';
                }
                modRes('Furs', hunters * $ctx.hunger * $ctx.global_multiplier * $ctx.time_multiplier * $ctx.q_multiplier);

                if (!global.race['soul_eater'] && global.race['evil']){
                    let reclaimers = workerScale(global.civic.lumberjack.workers,'lumberjack');
                    reclaimers *= racialTrait(reclaimers,'lumberjack');
                    if (global.race['warlord'] && global.race['playful']){
                        reclaimers *= 1 + traits.playful.vars()[0];
                    }

                    if (global.race['servants']){
                        let serve = global.race.servants.jobs.lumberjack;
                        serve *= servantTrait(global.race.servants.jobs.lumberjack,'lumberjack');
                        reclaimers += serve;
                    }

                    reclaimers /= 4;
                    reclaimers *= production('psychic_boost','Furs');
                    breakdown.p['Furs'][jobName('lumberjack')] = reclaimers  + 'v';
                    if (reclaimers > 0){
                        breakdown.p['Furs'][`ᄂ${loc('quarantine')}+1`] = (($ctx.q_multiplier - 1) * 100) + '%';
                    }
                    modRes('Furs', reclaimers * $ctx.hunger * $ctx.global_multiplier * $ctx.time_multiplier * $ctx.q_multiplier);
                }
            }

            let hunting = hooks.armyRating(garrisonSize(),'hunting') / 10;
            if (global.city.biome === 'oceanic'){
                hunting *= biomes.oceanic.vars()[2];
            }
            else if (global.city.biome === 'tundra'){
                hunting *= biomes.tundra.vars()[0];
            }
            hunting *= production('psychic_boost','Furs');

            breakdown.p['Furs'][loc('soldiers')] = hunting  + 'v';
            if (hunting > 0){
                breakdown.p['Furs'][`ᄂ${loc('quarantine')}+2`] = (($ctx.q_multiplier - 1) * 100) + '%';
            }
            modRes('Furs', hunting * $ctx.hunger * $ctx.global_multiplier * $ctx.q_multiplier * $ctx.time_multiplier);

            if (global.race['forager']){
                let forage = 1 + (global.tech['foraging'] ? 0.5 * global.tech['foraging'] : 0);
                let foragers = workerScale(global.civic.forager.workers,'forager');
                foragers *= racialTrait(foragers,'forager');

                if (global.race['servants']){
                    let serve = global.race.servants.jobs.forager;
                    serve *= servantTrait(global.race.servants.jobs.forager,'forager');
                    foragers += serve;
                }

                let forage_base = foragers * forage * 0.05 * production('psychic_boost','Furs');
                breakdown.p['Furs'][jobName('forager')] = forage_base + 'v';
                if (forage_base > 0){
                    breakdown.p['Furs'][`ᄂ${loc('quarantine')}+3`] = (($ctx.q_multiplier - 1) * 100) + '%';
                }
                modRes('Furs', forage_base * $ctx.hunger * $ctx.q_multiplier * $ctx.time_multiplier);
            }
        }

        if (global.resource.Furs.display && global.tech['isolation'] && global.tauceti['womling_farm']){
            let base = global.tauceti.womling_farm.farmers * production('psychic_boost','Furs');
            let delta = base * $ctx.global_multiplier;
            breakdown.p['Furs'][loc('tau_red_womlings')] = base + 'v';
            modRes('Furs', delta);
        }

        if (global.race['unfathomable'] && global.civic.hunter.display){
            let weapons = weaponTechModifer();
            let hunters = workerScale(global.civic.hunter.workers,'hunter');
            hunters *= racialTrait(hunters,'hunting');

            if (global.race['servants']){
                let serve = jobScale(global.race.servants.jobs.hunter);
                serve *= servantTrait(global.race.servants.jobs.hunter,'hunting');
                hunters += highPopAdjust(serve);
            }

            hunters *= weapons / 20;

            let stealable = ['Lumber','Chrysotile','Stone','Crystal','Copper','Iron','Aluminium','Cement','Coal','Oil','Uranium','Steel','Titanium','Alloy','Polymer','Iridium'];
            stealable.forEach(function(res){
                if (global.resource[res].display){
                    let raid = hunters * production('psychic_boost',res) * tradeRatio[res] / 5;
                    if (['Crystal','Uranium'].includes(res)){ raid *= 0.2; }
                    else if (['Alloy','Polymer','Iridium'].includes(res)){ raid *= 0.35; }
                    else if (['Steel','Cement'].includes(res)){ raid *= 0.85; }
                    else if (['Titanium'].includes(res)){ raid *= 0.65; }
                    breakdown.p[res][jobName('hunter')] = raid  + 'v';
                    if (raid > 0){
                        breakdown.p[res][`ᄂ${loc('quarantine')}+99`] = (($ctx.q_multiplier - 1) * 100) + '%';
                    }
                    modRes(res, raid * $ctx.hunger * $ctx.global_multiplier * $ctx.time_multiplier * $ctx.q_multiplier);
                }
            });
        }
}

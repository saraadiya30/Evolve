// Produksi Stone dan Amber per tick: metal refinery ($ctx.refinery), quarry, sappy, dan petrifikasi ocular power. Dulu bagian dari fastLoopCore_s10.
import { global, breakdown, p_on, support_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { flib } from '../../functions/run_stats_helpers.js';
import { traits, hooks } from '../../core/registries.js';
import { biomes } from '../../races/planet_data.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';
import { racialTrait, servantTrait } from '../../races/trait_logic/racial_traits.js';
import { production } from '../../resources/prod.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { loc } from '../../core/locale.js';
import { structName, housingLabel } from '../../actions/core/structure_ui.js';
import { jobName } from '../../civics/jobs/job_name.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';
import { jobScale } from '../../civics/jobs/job_scale.js';

export function fastLoopStone($ctx){
        $ctx.refinery = global.city['metal_refinery'] ? global.city['metal_refinery'].count * 6 : 0;
        $ctx.refinery *= $ctx.q_multiplier;

        // Stone / Amber
        if (global.race['sappy']){
            if (global.tech['mining'] && global.resource[global.race.species].amount > 0){
                let stone_base = global.resource[global.race.species].amount * traits.sappy.vars()[0] * production('psychic_boost','Stone');
                if (global.race['high_pop']){
                    stone_base = highPopAdjust(stone_base);
                }
                let cactiFathom = fathomCheck('cacti');
                if (cactiFathom > 0){
                    stone_base *= 1 + (0.32 * cactiFathom);
                }
                breakdown.p['Stone'][flib('name')] = stone_base + 'v';
                if (global.city.hasOwnProperty('basic_housing')){
                    let grove = global.city.basic_housing.count * 0.025;
                    stone_base *= 1 + grove;
                    breakdown.p['Stone'][`ᄂ${housingLabel('small')}`] = (grove * 100) + '%';
                }

                let soldiers = 0;
                if (global.civic.hasOwnProperty('garrison')){
                    soldiers = global.civic.garrison.workers * traits.sappy.vars()[0];
                    if (global.race['high_pop']){
                        soldiers = highPopAdjust(soldiers);
                    }
                    breakdown.p['Stone'][loc('soldiers')] = soldiers + 'v';
                }

                let delta = (stone_base + soldiers) * $ctx.hunger * $ctx.global_multiplier;
                breakdown.p['Stone'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';

                modRes('Stone', delta * $ctx.time_multiplier);
            }
        }
        else {
            let quarriers = global.race['warlord'] ? global.civic.miner.workers : global.civic.quarry_worker.workers;
            let stone_prod_name = global.race['warlord'] ? jobName('miner') : loc('workers');
            quarriers = workerScale(quarriers,'quarry_worker');
            let stone_base = quarriers * racialTrait(quarriers,'miner');
            let cactiFathom = fathomCheck('cacti');
            if (cactiFathom > 0){
                stone_base *= 1 + (0.32 * cactiFathom);
            }

            if (global.race['servants']){
                let serve = global.race.servants.jobs.quarry_worker;
                serve *= servantTrait(global.race.servants.jobs.quarry_worker,'miner');
                stone_base += serve;
            }
            stone_base *= global.civic.quarry_worker.impact;

            let asbestos_base = 0;

            let forage_base = 0;
            if (global.race['forager'] && global.resource.Stone.display){
                let foragers = workerScale(global.civic.forager.workers,'forager');
                forage_base = foragers * racialTrait(foragers,'forager');

                if (global.race['servants']){
                    let serve = global.race.servants.jobs.forager;
                    serve *= servantTrait(global.race.servants.jobs.forager,'forager');
                    forage_base += serve;
                }
                forage_base *= 0.22;
            }

            // Foragers excluded from use of tools
            if (global.race['living_tool'] || global.race['tusk']){
                // buffed twice with racial trait on purpose
                const balance = global.race['hivemind'] ? traits.hivemind.vars()[0] : 1;
                let tusk = global.race['tusk'] ? 1 + ((traits.tusk.vars()[0] / 100) * (hooks.armyRating(jobScale(balance),'army',0) / balance / 100)) : 1;
                let lt = global.race['living_tool'] ? traits.living_tool.vars()[0] * (global.tech['science'] && global.tech.science > 0 ? global.tech.science * 0.06 : 0) + 1 : 1;
                stone_base *= lt > tusk ? lt : tusk;
            }
            else {
                stone_base *= (global.tech['hammer'] && global.tech['hammer'] > 0 ? global.tech['hammer'] * 0.4 : 0) + 1;
            }

            let stone_environment = 1;
            if (global.city.biome === 'desert'){
                stone_environment *= biomes.desert.vars()[0];
            }
            if (global.city.biome === 'swamp'){
                stone_environment *= biomes.swamp.vars()[3];
            }
            if (global.tech['explosives'] && global.tech.explosives >= 2){
                stone_environment *= 1 + (global.tech.explosives * 0.25);
            }

            stone_base *= stone_environment;
            forage_base *= stone_environment;

            let tunneler = 1;
            if (global.race['warlord'] && global.portal['tunneler']){
                tunneler = 1 + (global.portal.tunneler.rank + 3) / 100 * global.portal.tunneler.count;
            }

            let rock_quarry = 1;
            let power_single = 1;
            let power_mult = 1;
            let quarry_discharge = false;
            let zigValStone = 1;
            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                stone_prod_name = structName('mine');

                if (global.tech['mars'] && support_on['red_mine']){
                    let mine_base = support_on['red_mine'] * workerScale(global.civic.colonist.workers,'colonist');
                    stone_base = mine_base * production('red_mine','stone');
                    zigValStone = $ctx.zigVal;

                    if (global.race['smoldering'] && global.resource.Chrysotile.display){
                        asbestos_base = mine_base * production('red_mine','asbestos');
                        asbestos_base *= production('psychic_boost','Chrysotile');
                    }
                }
            }
            else if (global.city['rock_quarry']){
                rock_quarry += global.city['rock_quarry'].count * 0.02;
                if (p_on['rock_quarry']){
                    power_single += 0.04;
                    power_mult += (p_on['rock_quarry'] * 0.04);
                    quarry_discharge = global.race['discharge'] && global.race['discharge'] > 0;
                }

                // Foragers cannot find any chrysotile without rock quarries
                if (global.race['smoldering'] && global.resource.Chrysotile.display){
                    let asbestos_ratio = global.city.rock_quarry.asbestos / 100;
                    asbestos_base = (stone_base + forage_base) * asbestos_ratio;
                    asbestos_base *= production('psychic_boost','Chrysotile');

                    let stone_ratio = (100 - global.city.rock_quarry.asbestos) / 100;
                    stone_base *= stone_ratio;
                    forage_base *= stone_ratio;
                }
            }
            // Deferred until here so that Chrysotile cannot get both boosts
            stone_base *= production('psychic_boost','Stone');
            forage_base *= production('psychic_boost','Stone');

            breakdown.p['Stone'][stone_prod_name] = stone_base + 'v';
            if (stone_base > 0){
                if (zigValStone > 1){
                    breakdown.p['Stone'][`ᄂ${loc('space_red_ziggurat_title')}`] = (($ctx.zigVal - 1) * 100) + '%';
                }
                breakdown.p['Stone'][`ᄂ${loc('city_rock_quarry')}`] = ((rock_quarry - 1) * 100) + '%';
                breakdown.p['Stone'][`ᄂ${loc('power')}`] = ((power_mult - 1) * 100) + '%';
                if (quarry_discharge){
                    breakdown.p['Stone'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }
                breakdown.p['Stone'][`ᄂ${loc('portal_tunneler_bd')}`] = ((tunneler - 1) * 100) + '%';
                breakdown.p['Stone'][`ᄂ${loc('quarantine')}+0`] = (($ctx.q_multiplier - 1) * 100) + '%';
            }

            if (global.race['smoldering'] && global.resource.Chrysotile.display){
                breakdown.p['Chrysotile'][stone_prod_name] = asbestos_base + 'v';
                if (asbestos_base > 0){
                    if (zigValStone > 1){
                        breakdown.p['Chrysotile'][`ᄂ${loc('space_red_ziggurat_title')}`] = (($ctx.zigVal - 1) * 100) + '%';
                    }
                    breakdown.p['Chrysotile'][`ᄂ${loc('city_rock_quarry')}`] = ((rock_quarry - 1) * 100) + '%';
                    breakdown.p['Chrysotile'][`ᄂ${loc('power')}`] = ((power_mult - 1) * 100) + '%';
                    if (quarry_discharge){
                        breakdown.p['Chrysotile'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                    }
                    breakdown.p['Chrysotile'][`ᄂ${loc('portal_tunneler_bd')}`] = ((tunneler - 1) * 100) + '%';
                    breakdown.p['Chrysotile'][`ᄂ${loc('quarantine')}+0`] = (($ctx.q_multiplier - 1) * 100) + '%';
                }
            }

            if (forage_base > 0){
                breakdown.p['Stone'][jobName('forager')] = forage_base + 'v';
                if (forage_base > 0){
                    breakdown.p['Stone'][`ᄂ${loc('city_rock_quarry')}+1`] = ((rock_quarry - 1) * 100) + '%';
                    breakdown.p['Stone'][`ᄂ${loc('power')}+1`] = ((power_mult - 1) * 100) + '%';
                    if (quarry_discharge){
                        breakdown.p['Stone'][`ᄂ${loc('evo_challenge_discharge')}+1`] = '-50%';
                    }
                    breakdown.p['Stone'][`ᄂ${loc('portal_tunneler_bd')}+1`] = ((tunneler - 1) * 100) + '%';
                    breakdown.p['Stone'][`ᄂ${loc('quarantine')}+1`] = (($ctx.q_multiplier - 1) * 100) + '%';
                }
            }

            if (quarry_discharge){
                power_mult = (power_mult - 1) * 0.5 + 1;
                power_single = (power_single - 1) * 0.5 + 1;
            }

            let delta = (stone_base * zigValStone + forage_base) * rock_quarry * tunneler;
            if (global.city['rock_quarry']){
                global.city.rock_quarry['cnvay'] = +(delta * $ctx.hunger * $ctx.q_multiplier * $ctx.global_multiplier * (power_single - 1)).toFixed(5);
            }
            delta *= power_mult * $ctx.hunger * $ctx.q_multiplier * $ctx.global_multiplier;

            breakdown.p['Stone'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
            modRes('Stone', delta * $ctx.time_multiplier);

            if (global.race['smoldering'] && global.resource.Chrysotile.display){
                // Different implementation from stone is intentional: foragers find 100% stone / 0% chrysotile without rock quarries
                let a_delta = asbestos_base * zigValStone * rock_quarry * tunneler;
                a_delta *=  power_mult * $ctx.hunger * $ctx.q_multiplier * $ctx.global_multiplier;

                breakdown.p['Chrysotile'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
                modRes('Chrysotile', a_delta * $ctx.time_multiplier);
            }

            // Aluminium
            if (global.city['metal_refinery'] && (global.city['metal_refinery'].count > 0 || global.race['cataclysm'] || global.race['orbit_decayed'] || global.race['warlord'])){
                let alum_ratio = global.race['cataclysm'] ? 0.16 : 0.08;
                let base = stone_base * alum_ratio;

                // Temporarily undo the effects of Discharge for better breakdown clarity
                if (quarry_discharge){
                    power_mult = (power_mult - 1) * 2 + 1;
                    power_single = (power_single - 1) * 2 + 1;
                }

                if (base > 0){
                    // This works in Cataclysm and Orbital Decay
                    if (global.city.geology['Aluminium']){
                        base *= global.city.geology['Aluminium'] + 1;
                    }
                    base *= production('psychic_boost','Aluminium');

                    breakdown.p['Aluminium'][stone_prod_name] = base + 'v';
                    if (global.race['cataclysm'] || global.race['orbit_decayed']){
                        breakdown.p['Aluminium'][`ᄂ${loc('space_red_ziggurat_title')}`] = (($ctx.zigVal - 1) * 100) + '%';
                    }
                    breakdown.p['Aluminium'][`ᄂ${loc('city_rock_quarry')}+0`] = ((rock_quarry - 1) * 100) + '%';
                    breakdown.p['Aluminium'][`ᄂ${loc('power')}+0`] = ((power_mult - 1) * 100) + '%';
                    if (quarry_discharge){
                        breakdown.p['Aluminium'][`ᄂ${loc('evo_challenge_discharge')}+0`] = '-50%';
                    }
                    breakdown.p['Aluminium'][`ᄂ${loc('portal_tunneler_bd')}+0`] = ((tunneler - 1) * 100) + '%';
                    breakdown.p['Aluminium'][`ᄂ${loc('quarantine')}+0`] = (($ctx.q_multiplier - 1) * 100) + '%';
                }

                let forage_alum_base = forage_base * alum_ratio;
                if (forage_alum_base > 0){
                    if (global.city.geology['Aluminium']){
                        forage_alum_base *= global.city.geology['Aluminium'] + 1;
                    }
                    forage_alum_base *= production('psychic_boost','Aluminium');

                    breakdown.p['Aluminium'][jobName('forager')] = forage_alum_base + 'v';
                    breakdown.p['Aluminium'][`ᄂ${loc('city_rock_quarry')}+1`] = ((rock_quarry - 1) * 100) + '%';
                    breakdown.p['Aluminium'][`ᄂ${loc('power')}+1`] = ((power_mult - 1) * 100) + '%';
                    if (quarry_discharge){
                        breakdown.p['Aluminium'][`ᄂ${loc('evo_challenge_discharge')}+1`] = '-50%';
                    }
                    breakdown.p['Aluminium'][`ᄂ${loc('portal_tunneler_bd')}+1`] = ((tunneler - 1) * 100) + '%';
                    breakdown.p['Aluminium'][`ᄂ${loc('quarantine')}+1`] = (($ctx.q_multiplier - 1) * 100) + '%';
                }

                // Redo the effects of Discharge
                if (quarry_discharge){
                    power_mult = (power_mult - 1) * 0.5 + 1;
                    power_single = (power_single - 1) * 0.5 + 1;
                }

                // Factors for rock quarries and rock quarry power are applied quadratically on purpose
                let delta = (base * zigValStone + forage_alum_base);
                delta *= rock_quarry * tunneler * $ctx.shrineMetal.mult * $ctx.hunger * $ctx.q_multiplier * $ctx.global_multiplier;
                global.city.metal_refinery['cnvay'] = +(delta * (power_single - 1)).toFixed(5);
                global.city.rock_quarry['almcvy'] = global.city.metal_refinery['cnvay'];
                delta *= power_mult;

                if (global.tech['alumina'] >= 2){
                    $ctx.refinery += p_on['metal_refinery'] * 6 * $ctx.q_multiplier;
                    let ref_single = 6 * $ctx.q_multiplier / 100;
                    global.city.metal_refinery['pwr'] = +(delta * ref_single).toFixed(5);
                }

                delta *= 1 + ($ctx.refinery / 100);
                breakdown.p['Aluminium'][loc('city_shrine')] = (($ctx.shrineMetal.mult - 1) * 100).toFixed(1) + '%';
                breakdown.p['Aluminium'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';

                modRes('Aluminium', delta * $ctx.time_multiplier);
            }
        }

        if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.p && global.race.ocularPowerConfig.ds > 0){
            if (!global.race.ocularPowerConfig.hasOwnProperty('ticks') || global.race.ocularPowerConfig.ticks <= 0){
                global.race.ocularPowerConfig['dsl'] = Math.round(global.race.ocularPowerConfig.ds / 10);
                global.race.ocularPowerConfig.ds = 0;
                global.race.ocularPowerConfig['ticks'] = Math.round(10 / $ctx.time_multiplier);
                
            }

            let base = global.race.ocularPowerConfig.dsl;
            let delta = base * $ctx.hunger * $ctx.q_multiplier * $ctx.global_multiplier;
            global.race.ocularPowerConfig.ticks--;

            breakdown.p['Stone'][loc('ocular_petrification')] = base + 'v';
            modRes('Stone', delta * $ctx.time_multiplier);
        }
}

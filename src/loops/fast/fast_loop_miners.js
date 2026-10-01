// Penambangan Copper, Iron, dan Aluminium per tick: miner, mining droid, red mine (Mars), serta label breakdown shrine, hunger, dan coal ash.
import { global, breakdown, p_on, support_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { shrineBonusActive } from '../../functions/run_stats_helpers.js';
import { traits } from '../../core/registries.js';
import { planetTraits, biomes } from '../../races/planet_data.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';
import { racialTrait, servantTrait } from '../../races/trait_logic/racial_traits.js';
import { production, teamster } from '../../resources/prod.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { loc } from '../../core/locale.js';
import { structName } from '../../actions/core/structure_ui.js';
import { jobName } from '../../civics/jobs/job_name.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { syndicate } from '../../truepath/orbit_math.js';
import { planetName } from '../../space/planet_name.js';

export function fastLoopMiners($ctx){
        // Miners
        if (global.resource.Copper.display || global.resource.Iron.display){
            let miner_base = workerScale(global.civic.miner.workers,'miner');
            miner_base *= racialTrait(miner_base,'miner');
            miner_base *= global.civic.miner.impact;
            if (global.race['tough']){
                miner_base *= 1 + (traits.tough.vars()[0] / 100);
            }
            let ogreFathom = fathomCheck('ogre');
            if (ogreFathom > 0){
                miner_base *= 1 + (traits.tough.vars(1)[0] / 100 * ogreFathom);
            }
            if (global.race['industrious']){
                let bonus = 1 + (traits.industrious.vars()[0] * global.race['industrious'] / 100);
                miner_base *= bonus;
            }
            if (global.city.ptrait.includes('dense')){
                miner_base *= planetTraits.dense.vars()[0];
            }
            if (global.city.ptrait.includes('permafrost')){
                miner_base *= planetTraits.permafrost.vars()[0];
            }
            if (!global.race['living_tool'] && !global.race['tusk']){
                miner_base *= (global.tech['pickaxe'] && global.tech.pickaxe > 0 ? global.tech.pickaxe * 0.15 : 0) + 1;
            }
            if (global.tech['explosives'] && global.tech.explosives >= 2){
                miner_base *= 0.95 + (global.tech.explosives * 0.15);
            }

            let power_mult = 1;
            let pow_single = 1;
            if (global.city['mine']['on']){
                power_mult += (p_on['mine'] * 0.05);
                pow_single += 1.05;
            }

            let tunneler = 1;
            if (global.race['warlord'] && global.portal['tunneler']){
                tunneler = 1 + (global.portal.tunneler.rank + 3) / 100 * global.portal.tunneler.count;
            }

            // Copper
            if (global.resource.Copper.display){
                let copper_mult = 1/7;
                if (global.tech['copper']) {
                    copper_mult *= 1.2;
                }

                let copper_base = miner_base * copper_mult * production('psychic_boost','Copper');
                if (global.city.geology['Copper']){
                    copper_base *= global.city.geology['Copper'] + 1;
                }

                if (global.city.biome === 'volcanic'){
                    copper_base *= biomes.volcanic.vars()[1];
                }
                else if (global.city.biome === 'ashland'){
                    copper_base *= biomes.ashland.vars()[2];
                }

                let copper_power = power_mult;
                let cop_single = pow_single;
                breakdown.p['Copper'][jobName('miner')] = (copper_base) + 'v';
                if (copper_base > 0){
                    breakdown.p['Copper'][`ᄂ${loc('power')}`] = ((copper_power - 1) * 100) + '%';
                    breakdown.p['Copper'][`ᄂ${loc('portal_tunneler_bd')}`] = ((tunneler - 1) * 100) + '%';
                    breakdown.p['Copper'][`ᄂ${loc('quarantine')}+0`] = (($ctx.q_multiplier - 1) * 100) + '%';
                    if (global.race['discharge'] && global.race['discharge'] > 0 && p_on['mine'] > 0){
                        copper_power = (copper_power - 1) * 0.5 + 1;
                        cop_single = (cop_single - 1) * 0.5 + 1;
                        breakdown.p['Copper'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                    }
                }
                let delta = copper_base * $ctx.shrineMetal.mult * tunneler * $ctx.hunger * $ctx.q_multiplier * $ctx.global_multiplier;
                global.city.mine['cpow'] = +(delta * (cop_single - 1)).toFixed(5);
                delta *= copper_power;

                modRes('Copper', delta * $ctx.time_multiplier);

                if (global.race['forager'] && global.tech['dowsing']){
                    let forage = global.tech.dowsing >= 2 ? 5 : 1;
                    let foragers = workerScale(global.civic.forager.workers,'forager');
                    foragers *= racialTrait(foragers,'forager');

                    if (global.race['servants']){
                        let serve = global.race.servants.jobs.forager;
                        serve *= servantTrait(global.race.servants.jobs.forager,'forager');
                        foragers += serve;
                    }

                    let forage_base = foragers * forage * 0.025 * production('psychic_boost','Copper');
                    if (global.city.geology['Copper']){
                        forage_base *= global.city.geology['Copper'] + 1;
                    }
                    if (global.city.biome === 'volcanic'){
                        forage_base *= biomes.volcanic.vars()[1];
                    }
                    else if (global.city.biome === 'ashland'){
                        forage_base *= biomes.ashland.vars()[2];
                    }
                    breakdown.p['Copper'][jobName('forager')] = forage_base  + 'v';
                    if (forage_base > 0){
                        breakdown.p['Copper'][`ᄂ${loc('quarantine')}+1`] = (($ctx.q_multiplier - 1) * 100) + '%';
                    }
                    modRes('Copper', forage_base * $ctx.hunger * $ctx.global_multiplier * $ctx.q_multiplier * $ctx.time_multiplier);
                }
            }

            // Iron
            if (global.resource.Iron.display){
                let iron_mult = 1/4;
                let iron_base = miner_base * iron_mult * production('psychic_boost','Iron');
                if (global.race['iron_allergy']){
                    iron_base *= 1 - (traits.iron_allergy.vars()[0] / 100);
                }
                let smelter_mult = 1 + ($ctx.iron_smelter * 0.1);

                if (global.city.geology['Iron']){
                    iron_base *= global.city.geology['Iron'] + 1;
                }

                if (global.city.biome === 'volcanic'){
                    iron_base *= biomes.volcanic.vars()[2];
                }
                else if (global.city.biome === 'ashland'){
                    iron_base *= biomes.ashland.vars()[2];
                }

                let space_iron = 0;

                let synd = syndicate('spc_belt');
                if (support_on['iron_ship']){
                    space_iron = support_on['iron_ship'] * production('iron_ship') * production('psychic_boost','Iron');
                    space_iron *= synd;
                }

                let iron_power = power_mult;
                let iron_single = power_mult;
                breakdown.p['Iron'][jobName('miner')] = (iron_base) + 'v';
                if (iron_base > 0){
                    breakdown.p['Iron'][`ᄂ${loc('portal_tunneler_bd')}`] = ((tunneler - 1) * 100) + '%';
                    breakdown.p['Iron'][`ᄂ${loc('power')}`] = ((iron_power - 1) * 100) + '%';
                    if (global.race['discharge'] && global.race['discharge'] > 0 && p_on['mine'] > 0){
                        iron_power = (iron_power - 1) * 0.5 + 1;
                        iron_single = (iron_single - 1) * 0.5 + 1;
                        breakdown.p['Iron'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                    }
                    breakdown.p['Iron'][`ᄂ${loc('quarantine')}+0`] = (($ctx.q_multiplier - 1) * 100) + '%';
                }

                let pit_miner = 0; let womling = 0;
                if (global.tech['isolation'] && global.race['lone_survivor']){
                    { // Pit Miner
                        let miner_base = workerScale(global.civic.pit_miner.workers,'pit_miner');
                        miner_base *= racialTrait(miner_base,'miner');
                        let colony_val = 1 + ((support_on['colony'] || 0) * 0.5);

                        let pit_base = miner_base * production('psychic_boost','Iron');
                        pit_base *= production('mining_pit','iron');
                        pit_miner = pit_base * colony_val;

                        breakdown.p['Iron'][jobName('pit_miner')] = pit_base + 'v';
                        if (pit_base > 0){
                            breakdown.p['Iron'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                        }
                    }

                    if (global.tauceti.hasOwnProperty('womling_mine') && global.tauceti.hasOwnProperty('overseer')){ // Womling Mine
                        let prod = global.tauceti.overseer.prod / 100;
                        let iron_base = global.tauceti.womling_mine.miners * production('womling_mine','iron') * production('psychic_boost','Iron');
                        breakdown.p['Iron'][loc('tau_red_womlings')] = iron_base + 'v';
                        womling = iron_base * prod;

                        if (iron_base > 0){
                            breakdown.p['Iron'][`ᄂ${loc('tau_red_womling_prod_label')}`] = -((1 - prod) * 100) + '%';
                        }
                    }
                }

                breakdown.p['Iron'][jobName('space_miner')] = space_iron + 'v';
                if (space_iron > 0){
                    breakdown.p['Iron'][`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                    breakdown.p['Iron'][`ᄂ${loc('space_red_ziggurat_title')}`] = (($ctx.zigVal - 1) * 100) + '%';
                    breakdown.p['Iron'][`ᄂ${loc('quarantine')}+1`] = (($ctx.qs_multiplier - 1) * 100) + '%';
                }
                if (global.race['gravity_well']){ space_iron = teamster(space_iron); }
                if (global.race['gravity_well']){
                    breakdown.p['Iron'][`ᄂ${loc('evo_challenge_gravity_well')}+1`] = -((1 - teamster(1)) * 100) + '%';
                }

                let eship_iron = $ctx.e_ship['iron'] ? $ctx.e_ship.iron * $ctx.womling_technician : 0;
                let delta = ((iron_base * tunneler * iron_power * $ctx.q_multiplier) + (space_iron * $ctx.qs_multiplier * $ctx.zigVal) + (eship_iron) + (pit_miner) + (womling)) * smelter_mult * $ctx.shrineMetal.mult;
                global.city.mine['ipow'] = +(iron_base * $ctx.q_multiplier * $ctx.hunger * $ctx.global_multiplier * (iron_single - 1)).toFixed(5);
                delta *= $ctx.hunger * $ctx.global_multiplier;

                if ($ctx.e_ship['iron'] && $ctx.e_ship.iron > 0){
                    breakdown.p['Iron'][loc('tau_roid_mining_ship')] = $ctx.e_ship.iron + 'v';
                    if ($ctx.womling_technician > 1){
                        breakdown.p['Iron'][`ᄂ${loc('tau_red_womlings')}+0`] = (($ctx.womling_technician - 1) * 100) + '%';
                    }
                }

                breakdown.p['Iron'][loc('city_smelter')] = ((smelter_mult - 1) * 100) + '%';
                breakdown.p['Iron'][loc('city_shrine')] = (($ctx.shrineMetal.mult - 1) * 100).toFixed(1) + '%';

                if (global.race['forager'] && global.tech['dowsing']){
                    let forage = global.tech.dowsing >= 2 ? 2 : 1;
                    let foragers = workerScale(global.civic.forager.workers,'forager');
                    foragers *= racialTrait(foragers,'forager');

                    if (global.race['servants']){
                        let serve = global.race.servants.jobs.forager;
                        serve *= servantTrait(global.race.servants.jobs.forager,'forager');
                        foragers += serve;
                    }

                    let forage_base = foragers * forage * 0.035 * production('psychic_boost','Iron');;
                    if (global.city.geology['Iron']){
                        forage_base *= global.city.geology['Iron'] + 1;
                    }
                    if (global.city.biome === 'volcanic'){
                        forage_base *= biomes.volcanic.vars()[2];
                    }
                    else if (global.city.biome === 'ashland'){
                        forage_base *= biomes.ashland.vars()[2];
                    }
                    breakdown.p['Iron'][jobName('forager')] = forage_base  + 'v';
                    if (forage_base > 0){
                        breakdown.p['Iron'][`ᄂ${loc('quarantine')}+2`] = (($ctx.q_multiplier - 1) * 100) + '%';
                    }
                    modRes('Iron', forage_base * $ctx.hunger * $ctx.global_multiplier * $ctx.q_multiplier * $ctx.time_multiplier);
                }

                breakdown.p['Iron'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
                modRes('Iron', delta * $ctx.time_multiplier);

                if (global.tech['titanium'] && global.tech['titanium'] >= 2){
                    let labor_base = highPopAdjust(workerScale(global.civic.miner.workers,'miner')) / 4;
                    if(support_on['iron_ship']){
                        labor_base += support_on['iron_ship'] / 2;
                    }
                    let iron = labor_base * $ctx.iron_smelter * 0.1;
                    delta = iron * $ctx.global_multiplier;
                    if ($ctx.star_forge > 0){
                        delta *= 1 + ($ctx.star_forge / 50);
                    }
                    if (global.city.geology['Titanium']){
                        delta *= global.city.geology['Titanium'] + 1;
                    }
                    if (global.city.biome === 'oceanic'){
                        delta *= biomes.oceanic.vars()[0];
                    }
                    delta *= $ctx.shrineMetal.mult * production('psychic_boost','Titanium');
                    let divisor = global.tech['titanium'] >= 3 ? 10 : 25;
                    modRes('Titanium', (delta * $ctx.time_multiplier) / divisor);
                    breakdown.p['Titanium'][loc('resource_Iron_name')] = (iron / divisor) + 'v';
                }
            }

            if (global.race['sappy']){
                // Alt Aluminium
                if ((global.city['metal_refinery'] && global.city['metal_refinery'].count > 0) || global.race['cataclysm'] || global.race['orbit_decayed']){
                    let base = 0;
                    if (global.race['cataclysm'] || global.race['orbit_decayed']){
                        if (global.tech['mars'] && support_on['red_mine']){
                            base = support_on['red_mine'] * workerScale(global.civic.colonist.workers,'colonist') * production('red_mine','aluminium');
                        }
                    }
                    else {
                        base = miner_base * power_mult * 0.088;
                    }

                    if (global.city.geology['Aluminium']){
                        base *= global.city.geology['Aluminium'] + 1;
                    }
                    base *= production('psychic_boost','Aluminium');

                    let delta = base * $ctx.shrineMetal.mult * $ctx.hunger * $ctx.global_multiplier;

                    if (global.tech['alumina'] >= 2){
                        $ctx.refinery += p_on['metal_refinery'] * 6;
                    }

                    delta *= 1 + ($ctx.refinery / 100);

                    breakdown.p['Aluminium'][`${global.race['cataclysm'] || global.race['orbit_decayed'] ? structName('mine') : jobName('miner')}+2`] = base + 'v';
                    if ((global.race['cataclysm'] || global.race['orbit_decayed']) && base > 0 && $ctx.zigVal > 0){
                        delta *= $ctx.zigVal;
                        breakdown.p['Aluminium'][`ᄂ${loc('space_red_ziggurat_title')}`] = (($ctx.zigVal - 1) * 100) + '%';
                    }
                    breakdown.p['Aluminium'][loc('city_shrine')] = (($ctx.shrineMetal.mult - 1) * 100) + '%';
                    breakdown.p['Aluminium'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';

                    modRes('Aluminium', delta * $ctx.time_multiplier);
                }

                // Alt Chrysotile
                if (global.race['smoldering'] && global.resource.Chrysotile.display){
                    let cry_base = miner_base / 2 * production('psychic_boost','Chrysotile');
                    let cry_power = power_mult;
                    breakdown.p['Chrysotile'][jobName('miner')] = (cry_base) + 'v';
                    if (cry_base > 0){
                        breakdown.p['Chrysotile'][`ᄂ${loc('power')}`] = ((cry_power - 1) * 100) + '%';
                        if (global.race['discharge'] && global.race['discharge'] > 0 && p_on['mine'] > 0){
                            cry_power = (cry_power - 1) * 0.5 + 1;
                            breakdown.p['Chrysotile'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                        }
                    }
                    let delta = cry_base * cry_power;
                    delta *= $ctx.hunger * $ctx.global_multiplier;

                    breakdown.p['Chrysotile'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
                    modRes('Chrysotile', delta * $ctx.time_multiplier);
                }
            }
        }

        {
            // Aluminium Mining Droids
            if (global.interstellar['mining_droid'] && $ctx.miner_droids['alum'] > 0){
                let base = $ctx.miner_droids['alum'] * 2.75 * production('psychic_boost','Aluminium');
                let delta = base * $ctx.shrineMetal.mult * $ctx.global_multiplier * $ctx.zigVal;
                delta *= 1 + ($ctx.refinery / 100);

                breakdown.p['Aluminium'][loc('interstellar_mining_droid_title')] = base + 'v';
                if (base > 0){
                    breakdown.p['Aluminium'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = (($ctx.zigVal - 1) * 100) + '%';
                }

                modRes('Aluminium', delta * $ctx.time_multiplier);
            }

            // Aluminium Titan Mines
            if (global.resource.Aluminium.display && global.space['titan_mine']){
                let synd = syndicate('spc_titan');
                let titan_colonists = p_on['ai_colonist'] ? workerScale(global.civic.titan_colonist.workers,'titan_colonist') + jobScale(p_on['ai_colonist']) : workerScale(global.civic.titan_colonist.workers,'titan_colonist');
                let alum_base = production('titan_mine','aluminium') * support_on['titan_mine'] * titan_colonists * production('psychic_boost','Aluminium');
                let alum_delta = alum_base * $ctx.shrineMetal.mult * $ctx.global_multiplier * $ctx.qs_multiplier * synd * $ctx.zigVal;
                alum_delta *= 1 + ($ctx.refinery / 100);
                breakdown.p['Aluminium'][`${loc('city_mine')}+0`] = +(alum_base).toFixed(3) + 'v';
                if (alum_base > 0){
                    breakdown.p['Aluminium'][`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                    breakdown.p['Aluminium'][`ᄂ${loc('space_red_ziggurat_title')}+2`] = (($ctx.zigVal - 1) * 100) + '%';
                    breakdown.p['Aluminium'][`ᄂ${loc('quarantine')}+2`] = (($ctx.qs_multiplier - 1) * 100) + '%';
                }
                modRes('Aluminium', alum_delta * $ctx.time_multiplier);
            }

            // Aluminium Extractor Ship
            if (global.resource.Aluminium.display && $ctx.e_ship['aluminium'] && $ctx.e_ship.aluminium > 0){
                let alum_delta = $ctx.e_ship.aluminium * $ctx.shrineMetal.mult * $ctx.global_multiplier * $ctx.womling_technician;
                alum_delta *= 1 + ($ctx.refinery / 100);
                breakdown.p['Aluminium'][loc('tau_roid_mining_ship')] = $ctx.e_ship.aluminium + 'v';
                if ($ctx.womling_technician > 1){
                    breakdown.p['Aluminium'][`ᄂ${loc('tau_red_womlings')}+0`] = (($ctx.womling_technician - 1) * 100) + '%';
                }
                modRes('Aluminium', alum_delta * $ctx.time_multiplier);
            }

            if ($ctx.refinery > 0){
                breakdown.p['Aluminium'][loc('city_metal_refinery')] = $ctx.refinery + '%';
                breakdown.p['Aluminium'][`ᄂ${loc('quarantine')}+3`] = (($ctx.q_multiplier - 1) * 100) + '%';
            }
        }

        // Mars Mining
        if (support_on['red_mine'] && support_on['red_mine'] > 0){
            let synd = syndicate('spc_red');

            let copper_base = support_on['red_mine'] * workerScale(global.civic.colonist.workers,'colonist') * production('red_mine','copper').f;
            copper_base *= production('psychic_boost','Copper');
            breakdown.p['Copper'][loc('space_red_mine_desc_bd', [planetName().red])] = (copper_base) + 'v';
            if (copper_base > 0){
                breakdown.p['Copper'][`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                breakdown.p['Copper'][`ᄂ${loc('space_red_ziggurat_title')}`] = (($ctx.zigVal - 1) * 100) + '%';
                breakdown.p['Copper'][`ᄂ${loc('quarantine')}+1`] = (($ctx.qs_multiplier - 1) * 100) + '%';
            }
            modRes('Copper', copper_base * $ctx.shrineMetal.mult * $ctx.time_multiplier * $ctx.global_multiplier * $ctx.qs_multiplier * $ctx.hunger * synd * $ctx.zigVal);

            let titanium_base = support_on['red_mine'] * workerScale(global.civic.colonist.workers,'colonist') * $ctx.hunger * production('red_mine','titanium').f;
            titanium_base *= production('psychic_boost','Titanium');
            breakdown.p['Titanium'][loc('space_red_mine_desc_bd', [planetName().red])] = (titanium_base) + 'v';
            if (titanium_base > 0){
                breakdown.p['Titanium'][`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                breakdown.p['Titanium'][`ᄂ${loc('space_red_ziggurat_title')}`] = (($ctx.zigVal - 1) * 100) + '%';
                breakdown.p['Titanium'][`ᄂ${loc('quarantine')}+0`] = (($ctx.qs_multiplier - 1) * 100) + '%';
            }
            modRes('Titanium', titanium_base * $ctx.shrineMetal.mult * $ctx.time_multiplier * $ctx.global_multiplier * $ctx.qs_multiplier * synd * $ctx.zigVal);
        }
        if (shrineBonusActive()){
            breakdown.p['Copper'][loc('city_shrine')] = (($ctx.shrineMetal.mult - 1) * 100).toFixed(1) + '%';
            breakdown.p['Titanium'][loc('city_shrine')] = (($ctx.shrineMetal.mult - 1) * 100).toFixed(1) + '%';
        }
        breakdown.p['Copper'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';

        if (breakdown.p['Uranium'].hasOwnProperty(loc('city_coal_ash'))){
            breakdown.p['Uranium'][loc('city_coal_ash')] = breakdown.p['Uranium'][loc('city_coal_ash')] + 'v';
        }
}

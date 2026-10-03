import { global, breakdown, p_on, support_on, active_rituals } from '../core/vars.js';
import { modRes, shrineBonusActive, flib, darkEffect } from '../functions/functions.js';
import { traits, planetTraits, fathomCheck, biomes, racialTrait, servantTrait } from '../races/races.js';
import { govEffect, garrisonSize, weaponTechModifer, armyRating } from '../civics/civics.js';
import { highPopAdjust, production, teamster } from '../resources/prod.js';
import { loc } from '../core/locale.js';
import { actions, structName, drawTech, housingLabel } from '../actions/actions.js';
import { jobScale, workerScale, jobName } from '../civics/jobs.js';
import { syndicate } from '../truepath/truepath.js';
import { renderEdenic } from '../edenic/edenic.js';
import { ritual_types, manaCost, maxRitualNum } from '../industry/industry.js';
import { planetName } from '../space/space.js';

// Bagian dari fastLoopCore (main.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function fastLoopCore_s10($ctx){
        if (global.tech['isolation'] && global.tauceti['alien_outpost'] && p_on['alien_outpost']){
            let base = production('alien_outpost');
            let colony_val = 1 + ((support_on['colony'] || 0) * 0.5);

            breakdown.p['Cipher'][loc('tech_alien_outpost')] = base + 'v';
            if (base > 0){
                breakdown.p['Cipher'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
            }

            let delta = base * $ctx.global_multiplier * colony_val;
            modRes('Cipher', delta * $ctx.time_multiplier);
        }

        // Extractor Ship & Ore Refinery
        $ctx.e_ship = {};
        if (global.tauceti['ore_refinery'] && global.tauceti['mining_ship'] && global.tech['tau_roid'] && global.tech.tau_roid >= 4){
            global.tauceti.ore_refinery.max = global.tauceti.ore_refinery.count * 1000;

            // Refine Ore
            if (global.tauceti.ore_refinery.fill > 0){
                let raw = p_on['ore_refinery'] * production('ore_refinery');
                if (raw > global.tauceti.ore_refinery.fill){
                    raw = global.tauceti.ore_refinery.fill;
                }
                global.tauceti.ore_refinery.fill -= raw * $ctx.time_multiplier;

                let c_ratio = global.tech.tau_roid >= 5 ? 0.6 : 0.64;
                let u_ratio = global.tech.tau_roid >= 5 ? 0.35 : 0.36;

                $ctx.e_ship['iron'] = raw * c_ratio * (100 - global.tauceti.mining_ship.common) / 100 * production('mining_ship_ore','iron') * production('psychic_boost','Iron');
                $ctx.e_ship['aluminium'] = raw * c_ratio * global.tauceti.mining_ship.common / 100 * production('mining_ship_ore','aluminium') * production('psychic_boost','Aluminium');
                $ctx.e_ship['iridium'] = raw * u_ratio * (100 - global.tauceti.mining_ship.uncommon) / 100 * production('mining_ship_ore','iridium') * production('psychic_boost','Iridium');
                $ctx.e_ship['neutronium'] = raw * u_ratio * global.tauceti.mining_ship.uncommon / 100 * production('mining_ship_ore','neutronium') * production('psychic_boost','Neutronium');

                if (global.tech.tau_roid >= 5){
                    $ctx.e_ship['orichalcum'] = raw * 0.05 * (100 - global.tauceti.mining_ship.rare) / 10 * production('mining_ship_ore','orichalcum') * production('psychic_boost','Orichalcum');
                    $ctx.e_ship['elerium'] = raw * 0.05 * global.tauceti.mining_ship.rare / 10 * production('mining_ship_ore','elerium') * production('psychic_boost','Elerium');
                }
            }

            // Get new Ore
            let ore = support_on['mining_ship'] * production('mining_ship');
            global.tauceti.ore_refinery.fill += ore * $ctx.time_multiplier;
            if (global.tauceti.ore_refinery.fill > global.tauceti.ore_refinery.max){
                global.tauceti.ore_refinery.fill = global.tauceti.ore_refinery.max;
            }
        }

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

                let soldiers = armyRating(garrisonSize(),'hunting') / 3;
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

                let soldiers = armyRating(garrisonSize(),'hunting') / 5;
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
                let tusk = global.race['tusk'] ? 1 + ((traits.tusk.vars()[0] / 100) * (armyRating(jobScale(balance),'army',0) / balance / 100)) : 1;
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

        // Water
        if (global.resource.Water.display){
            if (support_on['water_freighter']){
                let synd = syndicate('spc_enceladus');

                let base = production('water_freighter') * support_on['water_freighter'] * production('psychic_boost','Water');;
                let delta = base * $ctx.hunger * $ctx.global_multiplier * synd * $ctx.zigVal;

                breakdown.p['Water'][loc('space_water_freighter_title')] = base + 'v';
                if (base > 0){
                    breakdown.p['Water'][`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                    breakdown.p['Water'][`ᄂ${loc('space_red_ziggurat_title')}`] = (($ctx.zigVal - 1) * 100) + '%';
                    breakdown.p['Water'][`ᄂ${loc('hunger')}`] = (($ctx.hunger - 1) * 100) + '%';
                }

                modRes('Water', delta * $ctx.time_multiplier);
            }

            if (global.tech['isolation'] && global.tauceti['tau_farm'] && p_on['tau_farm']){
                let colony_val = 1 + ((support_on['colony'] || 0) * 0.5);

                let base = production('tau_farm','water') * p_on['tau_farm'] * production('psychic_boost','Water');
                let delta = base * $ctx.global_multiplier * colony_val;

                breakdown.p['Water'][loc('tau_home_tau_farm')] = base + 'v';
                if (base > 0){
                    breakdown.p['Water'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                }

                modRes('Water', delta * $ctx.time_multiplier);
            }
        }
}

export function fastLoopCore_s11($ctx){
        if (global.eden['palace'] && p_on['spirit_vacuum'] && global.tech['isle']){
            let drain = 1653439 * p_on['spirit_vacuum'];
            if (global.tech.isle >= 6 && p_on['spirit_battery']){
                let battery = p_on['spirit_battery'] || 0;
                let boost = 0.08;
                if (global.race['warlord'] && global.eden['corruptor'] && global.tech?.asphodel >= 13){
                    boost *= 1 + (p_on['corruptor'] || 0) * 0.03;
                }
                drain *= 1 + (battery * boost);
            }

            if (global.eden['soul_compactor'] && global.eden.soul_compactor.count === 1){
                global.eden.soul_compactor.energy += Math.round(drain / 2);
                if (global.eden.soul_compactor.energy >= 1000000000){
                    global.eden.soul_compactor.energy -= 1000000000;
                    global.resource.Soul_Gem.amount++;
                    global.eden.soul_compactor.report++;
                }
            }

            if (global.eden.palace.energy > 0){
                global.eden.palace.rate = drain;
                global.eden.palace.energy -= drain * $ctx.time_multiplier;
                global.eden.palace.energy = Math.round(global.eden.palace.energy);

                if (global.eden.palace.energy <= 0){
                    global.eden.palace.energy = 0;
                    global.tech['palace'] = 1;
                    drawTech();
                    renderEdenic();
                }
            }
        }

        // Mana
        if (global.resource.Mana.display){
            if (global.race['casting']){
                ritual_types.forEach(function (spell){
                    if (global.race.casting[spell]){
                        if (global.race.casting[spell] > 0){
                            const consume_mana = manaCost(global.race.casting[spell]);
                            const consume_mana_dt = consume_mana * $ctx.time_multiplier;
                            if (consume_mana_dt > global.resource.Mana.amount){
                                active_rituals[spell] = maxRitualNum(global.resource.Mana.amount, $ctx.time_multiplier);
                            }
                            else {
                                active_rituals[spell] = global.race.casting[spell];
                            }
                            breakdown.p.consume.Mana[loc(`modal_pylon_spell_${spell}`)] = -(consume_mana);

                            modRes('Mana', -(consume_mana_dt));
                        }
                        else {
                            active_rituals[spell] = 0;
                        }
                    }
                });
            }

            if (global.city['pylon'] || global.space['pylon'] || global.tauceti['pylon']){
                let mana_base = 0;
                let name = 'city_pylon';
                if ((global.race['cataclysm'] || global.race['orbit_decayed']) && global.space['pylon']){
                    mana_base = global.space.pylon.count * 0.005;
                    name = 'space_red_pylon';
                }
                else if (global.tech['isolation'] && global.tauceti['pylon']){
                    mana_base = global.tauceti.pylon.count * 0.0125;
                    name = 'tau_home_pylon';
                }
                else if (global.city['pylon']){
                    mana_base = global.city.pylon.count * 0.01;
                }

                mana_base *= darkEffect('magic');

                let delta = mana_base * $ctx.hunger * $ctx.global_multiplier;
                breakdown.p['Mana'][loc(name)] = mana_base+'v';

                if (global.tech['nexus']){
                    let nexus = global.tech['nexus'] * 5;
                    delta *= 1 + (nexus / 100);
                    breakdown.p['Mana'][`ᄂ${loc('arpa_projects_nexus_title')}`] = nexus+'%';
                }

                modRes('Mana', delta * $ctx.time_multiplier);
            }

            if (global.tech['cleric'] && global.civic.priest.display){
                let mana_base = workerScale(global.civic.priest.workers,'priest') * 0.0025;
                if (global.race['high_pop']){
                    mana_base = highPopAdjust(mana_base);
                }
                mana_base *= darkEffect('magic');
                let delta = mana_base * $ctx.hunger * $ctx.global_multiplier;

                breakdown.p['Mana'][jobName('priest')] = mana_base+'v';
                modRes('Mana', delta * $ctx.time_multiplier);
            }

            if (global.race.universe === 'magic' && global.civic.scientist.display){
                let mana_base = workerScale(global.civic.scientist.workers,'scientist') * 0.025;
                if (global.race['high_pop']){
                    mana_base = highPopAdjust(mana_base);
                }
                mana_base *= darkEffect('magic');

                let delta = mana_base * $ctx.hunger * $ctx.global_multiplier;
                breakdown.p['Mana'][jobName('wizard')] = mana_base+'v';

                if (global.civic.govern.type === 'magocracy'){
                    delta *= 1 + (govEffect.magocracy()[0] / 100);
                    breakdown.p['Mana'][`ᄂ${loc('govern_magocracy')}`] = govEffect.magocracy()[0] + '%';
                }

                modRes('Mana', delta * $ctx.time_multiplier);
            }

            if (global.race.universe === 'magic' && global.tech['syphon']){
                let mana_base = global.tech.syphon / 3;
                mana_base *= darkEffect('magic');

                let delta = mana_base * $ctx.hunger * $ctx.global_multiplier;
                breakdown.p['Mana'][loc('arpa_syphon_title')] = mana_base+'v';

                modRes('Mana', delta * $ctx.time_multiplier);
            }

            breakdown.p['Mana'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
        }

        // Crystal
        if (global.resource.Crystal.display){
            let crystal_base = workerScale(global.civic.crystal_miner.workers,'crystal_miner');
            crystal_base *= racialTrait(crystal_base,'miner');

            if (global.race['servants']){
                let serve = global.race.servants.jobs.crystal_miner;
                serve *= servantTrait(global.race.servants.jobs.crystal_miner,'miner');
                crystal_base += serve;
            }

            crystal_base *= global.civic.crystal_miner.impact * production('psychic_boost','Crystal');

            breakdown.p['Crystal'][jobName('crystal_miner')] = crystal_base + 'v';

            if (global.civic.govern.type === 'magocracy'){
                let bonus = govEffect.magocracy()[1];
                crystal_base *= 1 + (bonus / 100);
                breakdown.p['Crystal'][`ᄂ${loc('govern_magocracy')}`] = `${bonus}%`;
            }

            let delta = crystal_base * $ctx.hunger * $ctx.global_multiplier;

            breakdown.p['Crystal'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
            modRes('Crystal', delta * $ctx.time_multiplier);
        }

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

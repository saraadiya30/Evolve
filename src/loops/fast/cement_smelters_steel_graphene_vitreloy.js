import { global, breakdown, gal_on, p_on, support_on, int_on, quantum_level } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { getShrineBonus } from '../../functions/run_stats_helpers.js';
import { traits } from '../../core/registries.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';
import { biomes } from '../../races/races.js';
import { racialTrait } from '../../races/trait_logic/racial_traits.js';
import { govActive } from '../../governor/governor.js';
import { govEffect } from '../../civics/civics.js';
import { production, teamster, factoryBonus } from '../../resources/prod.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { loc } from '../../core/locale.js';
import { piracy } from '../../space/space_requirements.js';
import { actions } from '../../core/registries.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { workerScale } from '../../civics/jobs/job_definitions.js';
import { syndicate } from '../../truepath/ship_orbits.js';
import { f_rate } from '../../industry/industry.js';
import { luxGoodPrice } from '../../industry/factory_panels.js';
import { smelterUnlocked, smelterFuelConfig } from '../../industry/industry_smelter.js';
import { INFERNO_SMELTER_RATE } from '../../config/constants.js';

// Bagian dari fastLoopCore (main.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function fastLoopCore_s8($ctx){
        if (global.city['factory']){
            let on_factories = (p_on['factory'] || 0)
                + (p_on['red_factory'] || 0)
                + ((p_on['int_factory'] || 0) * 2)
                + ((p_on['hell_factory'] || 0) * actions.portal.prtl_wasteland.hell_factory.lines())
                + ((support_on['tau_factory'] || 0) * (global.tech['isolation'] ? 5 : 3));
            let max_factories = global.city['factory'].on
                + (global.space['red_factory'] ? global.space['red_factory'].on : 0)
                + (global.interstellar['int_factory'] ? global.interstellar['int_factory'].on * 2 : 0)
                + (global.portal['hell_factory'] ? global.portal['hell_factory'].on * actions.portal.prtl_wasteland.hell_factory.lines() : 0)
                + (global.tauceti['tau_factory'] ? global.tauceti['tau_factory'].on * (global.tech['isolation'] ? 5 : 3) : 0);
            let eff = max_factories > 0 ? on_factories / max_factories : 0;
            let remaining = max_factories;

            ['Lux','Furs','Alloy','Polymer','Nano','Stanene'].forEach(function(res){
                remaining -= global.city.factory[res];
                if (remaining < 0) {
                    global.city.factory[res] += remaining;
                    remaining = 0;
                }
            });

            let assembly = global.tech['factory'] || 0;
            let tauBonus = global.tech['isolation'] ? 1 + ((support_on['colony'] || 0) * 0.5) : 1;

            if (global.city.factory['Lux'] && global.city.factory['Lux'] > 0){
                let fur_cost = global.city.factory.Lux * f_rate.Lux.fur[assembly] * eff;
                let workDone = global.city.factory.Lux;

                while (fur_cost * $ctx.time_multiplier > global.resource.Furs.amount && fur_cost > 0){
                    fur_cost -= f_rate.Lux.fur[assembly] * eff;
                    workDone--;
                }

                breakdown.p.consume.Furs[loc('city_factory')] = -(fur_cost);
                modRes('Furs', -(fur_cost * $ctx.time_multiplier));

                let demand = highPopAdjust(global.resource[global.race.species].amount) * f_rate.Lux.demand[assembly] * eff;
                demand = luxGoodPrice(demand);

                let delta = workDone * demand;
                if (global.race['gravity_well']){ delta = teamster(delta); }
                $ctx.FactoryMoney = delta;

                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.5;
                }

                modRes('Money', delta * $ctx.hunger * $ctx.global_multiplier * $ctx.time_multiplier);
            }

            if (global.city.factory['Furs'] && global.city.factory['Furs'] > 0){
                let moneyIncrement = f_rate.Furs.money[assembly] * eff;
                let polymerIncrement =  f_rate.Furs.polymer[assembly] * eff;
                let money_cost = global.city.factory.Furs * moneyIncrement;
                let polymer_cost = global.city.factory.Furs * polymerIncrement;
                let workDone = global.city.factory.Furs;

                while (polymer_cost * $ctx.time_multiplier > global.resource.Polymer.amount && polymer_cost > 0){
                    polymer_cost -= polymerIncrement;
                    money_cost -= moneyIncrement;
                    workDone--;
                }
                while (money_cost * $ctx.time_multiplier > global.resource.Money.amount && money_cost > 0){
                    polymer_cost -= polymerIncrement;
                    money_cost -= moneyIncrement;
                    workDone--;
                }

                breakdown.p.consume.Money[loc('city_factory')] = -(money_cost);
                breakdown.p.consume.Polymer[loc('city_factory')] = -(polymer_cost);
                modRes('Money', -(money_cost * $ctx.time_multiplier));
                modRes('Polymer', -(polymer_cost * $ctx.time_multiplier));

                let factory_output = workDone * f_rate.Furs.output[assembly] * eff * production('psychic_boost','Furs');
                factory_output = factoryBonus(factory_output);

                let delta = factory_output * tauBonus;
                delta *= $ctx.hunger * $ctx.global_multiplier;
                if (global.race['gravity_well']){ delta = teamster(delta); }

                breakdown.p['Furs'][loc('city_factory')] = factory_output + 'v';

                if (delta > 0){
                    if (tauBonus > 0){
                        breakdown.p['Furs'][`ᄂ${loc('tau_home_colony')}`] = ((tauBonus - 1) * 100) + '%';
                    }

                    if (global.race['discharge'] && global.race['discharge'] > 0){
                        delta *= 0.5;
                        breakdown.p['Furs'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                    }

                    if (global.tech['q_factory']){
                        let q_bonus = (quantum_level - 1) / 8 + 1;
                        delta *= q_bonus;
                        breakdown.p['Furs'][`ᄂ${loc('quantum')}`] = ((q_bonus - 1) * 100) + '%';
                    }
                }

                if (global.race['gravity_well']){
                    breakdown.p['Furs'][`ᄂ${loc('evo_challenge_gravity_well')}+0`] = -((1 - teamster(1)) * 100) + '%';
                }

                modRes('Furs', delta * $ctx.time_multiplier);
            }

            if (global.city.factory['Alloy'] && global.city.factory['Alloy'] > 0){
                let copper_cost = global.city.factory.Alloy * f_rate.Alloy.copper[assembly] * eff;
                let aluminium_cost = global.city.factory.Alloy * f_rate.Alloy.aluminium[assembly] * eff;
                let workDone = global.city.factory.Alloy;

                while (copper_cost * $ctx.time_multiplier > global.resource.Copper.amount && copper_cost > 0){
                    copper_cost -= f_rate.Alloy.copper[assembly] * eff;
                    aluminium_cost -= f_rate.Alloy.aluminium[assembly] * eff;
                    workDone--;
                }
                while (aluminium_cost * $ctx.time_multiplier > global.resource.Aluminium.amount && aluminium_cost > 0){
                    copper_cost -= f_rate.Alloy.copper[assembly] * eff;
                    aluminium_cost -= f_rate.Alloy.aluminium[assembly] * eff;
                    workDone--;
                }

                breakdown.p.consume.Copper[loc('city_factory')] = -(copper_cost);
                breakdown.p.consume.Aluminium[loc('city_factory')] = -(aluminium_cost);
                modRes('Copper', -(copper_cost * $ctx.time_multiplier));
                modRes('Aluminium', -(aluminium_cost * $ctx.time_multiplier));

                let factory_output = workDone * f_rate.Alloy.output[assembly] * eff * production('psychic_boost','Alloy');
                factory_output = factoryBonus(factory_output);

                if (global.tech['alloy']){
                    factory_output *= 1.37;
                }
                if (global.race['metallurgist']){
                    factory_output *= 1 + (traits.metallurgist.vars()[0] * global.race['metallurgist'] / 100);
                }

                let delta = factory_output * tauBonus;
                delta *= $ctx.hunger * $ctx.global_multiplier;
                if (global.race['gravity_well']){ delta = teamster(delta); }

                breakdown.p['Alloy'][loc('city_factory')] = factory_output + 'v';

                if (delta > 0){
                    if (tauBonus > 0){
                        breakdown.p['Alloy'][`ᄂ${loc('tau_home_colony')}`] = ((tauBonus - 1) * 100) + '%';
                    }

                    if (global.race['discharge'] && global.race['discharge'] > 0){
                        delta *= 0.5;
                        breakdown.p['Alloy'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                    }

                    if (global.tech['q_factory']){
                        let q_bonus = (quantum_level - 1) / 2 + 1;
                        delta *= q_bonus;
                        breakdown.p['Alloy'][`ᄂ${loc('quantum')}`] = ((q_bonus - 1) * 100) + '%';
                    }
                    breakdown.p['Alloy'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
                }

                if (global.race['gravity_well']){
                    breakdown.p['Alloy'][`ᄂ${loc('evo_challenge_gravity_well')}+0`] = -((1 - teamster(1)) * 100) + '%';
                }

                modRes('Alloy', delta * $ctx.time_multiplier);
            }
            else {
                breakdown.p['Alloy'] = 0;
            }

            if (global.city.factory['Polymer'] && global.city.factory['Polymer'] > 0){
                let oilIncrement = global.race['kindling_kindred'] || global.race['smoldering'] ? f_rate.Polymer.oil_kk[assembly] * eff : f_rate.Polymer.oil[assembly] * eff;
                let lumberIncrement = global.race['kindling_kindred'] || global.race['smoldering'] ? 0 : f_rate.Polymer.lumber[assembly] * eff;
                let oil_cost = global.city.factory.Polymer * oilIncrement;
                let lumber_cost = global.city.factory.Polymer * lumberIncrement;
                let workDone = global.city.factory.Polymer;

                while (lumber_cost * $ctx.time_multiplier > global.resource.Lumber.amount && lumber_cost > 0){
                    lumber_cost -= lumberIncrement;
                    oil_cost -= oilIncrement;
                    workDone--;
                }
                while (oil_cost * $ctx.time_multiplier > global.resource.Oil.amount && oil_cost > 0){
                    lumber_cost -= lumberIncrement;
                    oil_cost -= oilIncrement;
                    workDone--;
                }

                breakdown.p.consume.Lumber[loc('city_factory')] = -(lumber_cost);
                breakdown.p.consume.Oil[loc('city_factory')] = -(oil_cost);
                modRes('Lumber', -(lumber_cost * $ctx.time_multiplier));
                modRes('Oil', -(oil_cost * $ctx.time_multiplier));

                let factory_output = workDone * f_rate.Polymer.output[assembly] * eff * production('psychic_boost','Polymer');
                factory_output = factoryBonus(factory_output);
                
                if (global.tech['polymer'] >= 2){
                    factory_output *= 1.42;
                }

                let delta = factory_output * tauBonus;
                delta *= $ctx.hunger * $ctx.global_multiplier;
                if (global.race['gravity_well']){ delta = teamster(delta); }

                breakdown.p['Polymer'][loc('city_factory')] = factory_output + 'v';

                if (delta > 0){
                    if (tauBonus > 0){
                        breakdown.p['Polymer'][`ᄂ${loc('tau_home_colony')}`] = ((tauBonus - 1) * 100) + '%';
                    }

                    if (global.race['discharge'] && global.race['discharge'] > 0){
                        delta *= 0.5;
                        breakdown.p['Polymer'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                    }

                    if (global.tech['q_factory']){
                        let q_bonus = (quantum_level - 1) / 2 + 1;
                        delta *= q_bonus;
                        breakdown.p['Polymer'][`ᄂ${loc('quantum')}`] = ((q_bonus - 1) * 100) + '%';
                    }
                }

                if (global.race['gravity_well']){
                    breakdown.p['Polymer'][`ᄂ${loc('evo_challenge_gravity_well')}+0`] = -((1 - teamster(1)) * 100) + '%';
                }

                modRes('Polymer', delta * $ctx.time_multiplier);
            }

            if (p_on['s_gate'] && global.galaxy['raider'] && gal_on['raider'] > 0){
                let base = gal_on['raider'] * 2.3 * production('psychic_boost','Polymer');
                let pirate = piracy('gxy_chthonian');
                let delta = base * $ctx.global_multiplier * pirate * $ctx.hunger * $ctx.zigVal;

                breakdown.p['Polymer'][loc('galaxy_raider')] = base + 'v';
                if (base > 0){
                    breakdown.p['Polymer'][`ᄂ${loc('galaxy_piracy')}`] = -((1 - pirate) * 100) + '%';
                    breakdown.p['Polymer'][`ᄂ${loc('space_red_ziggurat_title')}`] = (($ctx.zigVal - 1) * 100) + '%';
                }
                modRes('Polymer', delta * $ctx.time_multiplier);
            }
            breakdown.p['Polymer'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';

            if (global.city.factory['Nano'] && global.city.factory['Nano'] > 0){
                let coalIncrement = f_rate.Nano_Tube.coal[assembly] * eff;
                let neutroniumIncrement = f_rate.Nano_Tube.neutronium[assembly] * eff;
                let coal_cost = global.city.factory.Nano * coalIncrement;
                let neutronium_cost = global.city.factory.Nano * neutroniumIncrement;
                let workDone = global.city.factory.Nano;

                while (neutronium_cost * $ctx.time_multiplier > global.resource.Neutronium.amount && neutronium_cost > 0){
                    neutronium_cost -= neutroniumIncrement;
                    coal_cost -= coalIncrement;
                    workDone--;
                }
                while (coal_cost * $ctx.time_multiplier > global.resource.Coal.amount && coal_cost > 0){
                    neutronium_cost -= neutroniumIncrement;
                    coal_cost -= coalIncrement;
                    workDone--;
                }

                breakdown.p.consume.Coal[loc('city_factory')] = -(coal_cost);
                breakdown.p.consume.Neutronium[loc('city_factory')] = -(neutronium_cost);
                modRes('Neutronium', -(neutronium_cost * $ctx.time_multiplier));
                modRes('Coal', -(coal_cost * $ctx.time_multiplier));

                let factory_output = workDone * f_rate.Nano_Tube.output[assembly] * eff * production('psychic_boost','Nano_Tube');
                factory_output = factoryBonus(factory_output);

                let delta = factory_output * tauBonus;
                delta *= $ctx.hunger * $ctx.global_multiplier;
                if (global.race['gravity_well']){ delta = teamster(delta); }

                breakdown.p['Nano_Tube'][loc('city_factory')] = factory_output + 'v';

                if (delta > 0){
                    if (tauBonus > 0){
                        breakdown.p['Nano_Tube'][`ᄂ${loc('tau_home_colony')}`] = ((tauBonus - 1) * 100) + '%';
                    }

                    if (global.race['discharge'] && global.race['discharge'] > 0){
                        delta *= 0.5;
                        breakdown.p['Nano_Tube'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                    }

                    if (global.tech['q_factory']){
                        let q_bonus = (quantum_level - 1) / 2 + 1;
                        delta *= q_bonus;
                        breakdown.p['Nano_Tube'][`ᄂ${loc('quantum')}`] = ((q_bonus - 1) * 100) + '%';
                    }
                    breakdown.p['Nano_Tube'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
                }

                if (global.race['gravity_well']){
                    breakdown.p['Nano_Tube'][`ᄂ${loc('evo_challenge_gravity_well')}+0`] = -((1 - teamster(1)) * 100) + '%';
                }

                modRes('Nano_Tube', delta * $ctx.time_multiplier);
            }
            else {
                breakdown.p['Nano_Tube'] = 0;
            }

            if (global.city.factory['Stanene'] && global.city.factory['Stanene'] > 0){
                let alumIncrement = f_rate.Stanene.aluminium[assembly] * eff;
                let nanoIncrement = f_rate.Stanene.nano[assembly] * eff;
                let alum_cost = global.city.factory.Stanene * alumIncrement;
                let nano_cost = global.city.factory.Stanene * nanoIncrement;
                let workDone = global.city.factory.Stanene;

                while (alum_cost * $ctx.time_multiplier > global.resource.Aluminium.amount && alum_cost > 0){
                    nano_cost -= nanoIncrement;
                    alum_cost -= alumIncrement;
                    workDone--;
                }
                while (nano_cost * $ctx.time_multiplier > global.resource.Nano_Tube.amount && nano_cost > 0){
                    nano_cost -= nanoIncrement;
                    alum_cost -= alumIncrement;
                    workDone--;
                }

                breakdown.p.consume.Aluminium[loc('city_factory')] = breakdown.p.consume.Aluminium[loc('city_factory')] ? breakdown.p.consume.Aluminium[loc('city_factory')] - alum_cost : -(alum_cost);
                breakdown.p.consume.Nano_Tube[loc('city_factory')] = -(nano_cost);
                modRes('Aluminium', -(alum_cost * $ctx.time_multiplier));
                modRes('Nano_Tube', -(nano_cost * $ctx.time_multiplier));

                let factory_output = workDone * f_rate.Stanene.output[assembly] * eff * production('psychic_boost','Stanene');
                factory_output = factoryBonus(factory_output);

                let delta = factory_output * tauBonus;
                delta *= $ctx.hunger * $ctx.global_multiplier;
                if (global.race['gravity_well']){ delta = teamster(delta); }

                breakdown.p['Stanene'][loc('city_factory')] = factory_output + 'v';

                if (delta > 0){
                    if (tauBonus > 0){
                        breakdown.p['Stanene'][`ᄂ${loc('tau_home_colony')}`] = ((tauBonus - 1) * 100) + '%';
                    }

                    if (global.race['discharge'] && global.race['discharge'] > 0){
                        delta *= 0.5;
                        breakdown.p['Stanene'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                    }

                    if (global.tech['q_factory']){
                        let q_bonus = (quantum_level - 1) / 2 + 1;
                        delta *= q_bonus;
                        breakdown.p['Stanene'][`ᄂ${loc('quantum')}`] = ((q_bonus - 1) * 100) + '%';
                    }
                    breakdown.p['Stanene'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
                }

                if (global.race['gravity_well']){
                    breakdown.p['Stanene'][`ᄂ${loc('evo_challenge_gravity_well')}+0`] = -((1 - teamster(1)) * 100) + '%';
                }

                modRes('Stanene', delta * $ctx.time_multiplier);
            }
            else {
                breakdown.p['Stanene'] = 0;
            }
        }

        if (global.resource.Furs.display){
            breakdown.p['Furs'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
        }

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

        $ctx.shrineMetal = getShrineBonus('metal');

        // Smelters
        $ctx.iron_smelter = 0;
        $ctx.star_forge = 0;
        $ctx.iridium_smelter = 0;
}

export function fastLoopCore_s9($ctx){
        if (smelterUnlocked()){
            let capacity = global.city.smelter.count;
            if (p_on['stellar_forge']){
                $ctx.star_forge = p_on['stellar_forge'] * actions.interstellar.int_neutron.stellar_forge.smelting();
                global.city.smelter.Star = Math.max(global.city.smelter.Star, $ctx.star_forge);
                capacity += $ctx.star_forge;
            }
            if (p_on['hell_forge']){
                capacity += p_on['hell_forge'] * actions.portal.prtl_ruins.hell_forge.smelting();
            }
            if (p_on['demon_forge']){
                capacity += p_on['demon_forge'] * actions.portal.prtl_wasteland.demon_forge.smelting();
            }
            if (p_on['sacred_smelter']){
                capacity += p_on['sacred_smelter'] * actions.eden.eden_elysium.sacred_smelter.smelting();
            }
            if (p_on['ore_refinery']){
                capacity += p_on['ore_refinery'] * actions.tauceti.tau_gas.ore_refinery.smelting();
            }
            if (global.space['hell_smelter']){
                capacity += global.space.hell_smelter.count * actions.space.spc_hell.hell_smelter.smelting();
            }
            if (p_on['geothermal']){
                capacity += p_on['geothermal'] * actions.space.spc_hell.geothermal.smelting();
            }
            global.city.smelter.cap = capacity;
            global.city.smelter.StarCap = $ctx.star_forge;

            if (global.race['forge']){
                global.city.smelter.Wood = 0;
                global.city.smelter.Coal = 0;
                global.city.smelter.Oil = Math.max(0, global.city.smelter.cap - global.city.smelter.Star - global.city.smelter.Inferno);
            }

            if ((global.race['kindling_kindred'] || global.race['smoldering']) && !global.race['evil']){
                if (global.city.smelter.Wood !== 0){
                    global.city.smelter.Coal += global.city.smelter.Wood;
                    global.city.smelter.Wood = 0;
                }
            }

            let total_fuel = 0;
            ['Wood', 'Coal', 'Oil', 'Star', 'Inferno'].forEach(function(fuel){
                if (total_fuel + global.city.smelter[fuel] > global.city.smelter.cap){
                    global.city.smelter[fuel] = global.city.smelter.cap - total_fuel;
                }
                total_fuel += global.city.smelter[fuel]
            });

            if (global.city.smelter.Iron + global.city.smelter.Steel + global.city.smelter.Iridium > total_fuel){
                let overflow = global.city.smelter.Iron + global.city.smelter.Steel + global.city.smelter.Iridium - total_fuel;
                global.city.smelter.Iron -= overflow;
                if (global.city.smelter.Iron < 0){
                    overflow = global.city.smelter.Iron;
                    global.city.smelter.Iron = 0;
                    global.city.smelter.Iridium += overflow;
                    if (global.city.smelter.Iridium < 0){
                        overflow = global.city.smelter.Iridium;
                        global.city.smelter.Iridium = 0;
                    }
                    else {
                        overflow = 0;
                    }
                    global.city.smelter.Steel += overflow;
                    if (global.city.smelter.Steel < 0){
                        global.city.smelter.Steel = 0;
                    }
                }
            }
            else if (global.city.smelter.Iron + global.city.smelter.Steel + global.city.smelter.Iridium < total_fuel){
                let irid_smelt = global.tech['irid_smelting'] || (global.tech['m_smelting'] && global.tech.m_smelting >= 2) ? true : false;
                if (!(global.resource.Iridium.display && irid_smelt) && !(global.resource.Steel.display && global.tech.smelting >= 2 && !global.race['steelen'])){
                    global.city.smelter.Iron++;
                }
            }

            if (global.city.smelter.Star > global.city.smelter.StarCap){
                let overflow = global.city.smelter.Star - global.city.smelter.StarCap;
                global.city.smelter.Star = global.city.smelter.StarCap;
                global.city.smelter.Oil += overflow;
            }

            let fuel_config = smelterFuelConfig();
            let consume_wood = global.city.smelter.Wood * fuel_config.l_cost;
            let consume_coal = global.city.smelter.Coal * fuel_config.c_cost;
            let consume_oil = global.city.smelter.Oil * fuel_config.o_cost;
            $ctx.iron_smelter = global.city.smelter.Iron;
            let steel_smelter = global.city.smelter.Steel;
            $ctx.iridium_smelter = global.city.smelter.Iridium;
            let oil_bonus = global.city.smelter.Oil;
            let inferno_bonus = global.city.smelter.Inferno;

            if (global.race['steelen']) {
                $ctx.iron_smelter += steel_smelter;
                steel_smelter = 0;
            }

            let disable_smelters = Math.max(0, $ctx.iron_smelter + steel_smelter + $ctx.iridium_smelter - total_fuel);

            if (consume_wood > 0){
                let max_operable = Math.max(0, Math.floor(global.resource[fuel_config.l_type].amount / (fuel_config.l_cost * $ctx.time_multiplier)));
                if (max_operable < global.city.smelter.Wood){
                    disable_smelters += global.city.smelter.Wood - max_operable;
                    consume_wood = max_operable * fuel_config.l_cost;
                }
            }

            if (consume_coal > 0){
                let max_operable = Math.max(0, Math.floor(global.resource.Coal.amount / (fuel_config.c_cost * $ctx.time_multiplier)));
                if (max_operable < global.city.smelter.Coal){
                    disable_smelters += global.city.smelter.Coal - max_operable;
                    consume_coal = max_operable * fuel_config.c_cost;
                }
            }

            if (consume_oil > 0){
                let max_operable = Math.max(0, Math.floor(global.resource.Oil.amount / (fuel_config.o_cost * $ctx.time_multiplier)));
                if (max_operable < oil_bonus){
                    disable_smelters += oil_bonus - max_operable;
                    consume_oil = max_operable * fuel_config.o_cost;
                    oil_bonus = max_operable;
                }
            }

            if (inferno_bonus > 0){
                let inferno_rate = INFERNO_SMELTER_RATE;
                let max_operable_oil = Math.floor((global.resource.Oil.amount - consume_oil) / (inferno_rate.Oil * $ctx.time_multiplier));
                let max_operable_coal = Math.floor((global.resource.Coal.amount - consume_coal) / (inferno_rate.Coal * $ctx.time_multiplier));
                let max_operable_infernite = Math.floor(global.resource.Infernite.amount / (inferno_rate.Infernite * $ctx.time_multiplier));
                let max_operable = Math.max(0, Math.min(max_operable_oil, max_operable_coal, max_operable_infernite));
                if (max_operable < inferno_bonus){
                    disable_smelters += inferno_bonus - max_operable;
                    inferno_bonus = max_operable;
                }

                consume_oil += inferno_rate.Oil * inferno_bonus;
                consume_coal += inferno_rate.Coal * inferno_bonus;

                let consume_infernite = inferno_rate.Infernite * inferno_bonus;
                breakdown.p.consume.Infernite[loc('city_smelter')] = -(consume_infernite);
                modRes('Infernite', -(consume_infernite * $ctx.time_multiplier));
            }

            if (disable_smelters > 0){
                let disable_steel = Math.min(disable_smelters, steel_smelter);
                steel_smelter -= disable_steel;
                disable_smelters -= disable_steel;

                let disable_iron = Math.min(disable_smelters, $ctx.iron_smelter);
                $ctx.iron_smelter -= disable_iron;
                disable_smelters -= disable_iron;

                let disable_iridium = Math.min(disable_smelters, $ctx.iridium_smelter);
                $ctx.iridium_smelter -= disable_iridium;
                disable_smelters -= disable_iridium;
            }

            $ctx.iron_smelter *= global.tech['smelting'] >= 3 ? 1.2 : 1;
            $ctx.iridium_smelter *= 0.05;

            let dirtVal = govActive('dirty_jobs',2);
            if (dirtVal){
                $ctx.iron_smelter *= 1 + (dirtVal / 100);
                $ctx.iridium_smelter *= 1 + (dirtVal / 100);
            }
            if (global.tech['smelting'] >= 7){
                $ctx.iron_smelter *= 1.25;
                $ctx.iridium_smelter *= 1.25;
            }
            if (oil_bonus > 0){
                $ctx.iron_smelter *= 1 + (oil_bonus / 200);
                $ctx.iridium_smelter *= 1 + (oil_bonus / 200);
            }
            if (inferno_bonus > 0){
                $ctx.iron_smelter *= 1 + (inferno_bonus / 125);
                $ctx.iridium_smelter *= 1 + (inferno_bonus / 125);
            }
            if ($ctx.star_forge > 0){
                $ctx.iron_smelter *= 1 + ($ctx.star_forge / 500);
                $ctx.iridium_smelter *= 1 + ($ctx.star_forge / 75);
            }
            if (global.race['pyrophobia']){
                $ctx.iron_smelter *= 1 - (traits.pyrophobia.vars()[0] / 100);
                $ctx.iridium_smelter *= 1 - (traits.pyrophobia.vars()[0] / 100);
            }
            if (global.race['elemental'] && traits.elemental.vars()[0] === 'fire'){
                $ctx.iron_smelter *= 1 + highPopAdjust(traits.elemental.vars()[3] * global.resource[global.race.species].amount / 100);
                $ctx.iridium_smelter *= 1 + highPopAdjust(traits.elemental.vars()[3] * global.resource[global.race.species].amount / 100);
            }

            let salFathom = fathomCheck('salamander');
            if (salFathom > 0){
                $ctx.iron_smelter *= 1 + (0.2 * salFathom);
                $ctx.iridium_smelter *= 1 + (0.2 * salFathom);
            }

            breakdown.p.consume[fuel_config.l_type][loc('city_smelter')] = -(consume_wood);
            breakdown.p.consume.Coal[loc('city_smelter')] = -(consume_coal);
            breakdown.p.consume.Oil[loc('city_smelter')] = -(consume_oil);

            modRes(fuel_config.l_type, -(consume_wood * $ctx.time_multiplier));
            modRes('Coal', -(consume_coal * $ctx.time_multiplier));
            modRes('Oil', -(consume_oil * $ctx.time_multiplier));

            // Uranium Ash (from coal smelters)
            if (consume_coal > 0 && global.tech['uranium'] && global.tech['uranium'] >= 3){
                let ash = consume_coal / 65;
                if (global.city.geology['Uranium']){
                    ash *= global.city.geology['Uranium'] + 1;
                }
                ash *= production('psychic_boost','Uranium');
                modRes('Uranium', ash * $ctx.time_multiplier);
                // Display on the right side of the breakdown to demonstrate that there is no global production scaling
                breakdown.p.consume['Uranium'][loc('city_coal_ash')] = (breakdown.p.consume['Uranium'][loc('city_coal_ash')] ?? 0) + ash;
            }

            //Steel Production
            if (global.resource.Steel.display){
                let iron_consume = steel_smelter * 2;
                let coal_consume = steel_smelter * 0.25;
                while ((iron_consume * $ctx.time_multiplier > global.resource.Iron.amount && iron_consume > 0) || (coal_consume * $ctx.time_multiplier > global.resource.Coal.amount && coal_consume > 0)){
                    iron_consume -= 2;
                    coal_consume -= 0.25;
                    steel_smelter--;
                }

                breakdown.p.consume.Coal[loc('city_smelter')] -= coal_consume;
                breakdown.p.consume.Iron[loc('city_smelter')] = -(iron_consume);
                modRes('Iron', -(iron_consume * $ctx.time_multiplier));
                modRes('Coal', -(coal_consume * $ctx.time_multiplier));

                let steel_base = 1;
                if (global.stats.achieve['steelen'] && global.stats.achieve['steelen'].l >= 1){
                    let steelen_bonus = (global.stats.achieve['steelen'].l * 2) / 100;
                    steel_base *= (1 + steelen_bonus);
                }
                if (global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 2){
                    steel_base *= 1.1;
                }
                for ($ctx.i = 4; $ctx.i <= 6; $ctx.i++) {
                    if (global.tech['smelting'] >= $ctx.i){
                        steel_base *= 1.2;
                    }
                }
                if (global.tech['smelting'] >= 7){
                    steel_base *= 1.25;
                }

                if (oil_bonus > 0){
                    steel_smelter *= 1 + (oil_bonus / 200);
                }
                if (inferno_bonus > 0){
                    steel_smelter *= 1 + (inferno_bonus / 125);
                }
                if ($ctx.star_forge){
                    steel_smelter *= 1 + ($ctx.star_forge / 500);
                }
                if (dirtVal){
                    steel_smelter *= 1 + (dirtVal / 100);
                }
                if (global.race['elemental'] && traits.elemental.vars()[0] === 'fire'){
                    steel_smelter *= 1 + highPopAdjust(traits.elemental.vars()[3] * global.resource[global.race.species].amount / 100);
                }
                if (salFathom > 0){
                    steel_smelter *= 1 + (0.2 * salFathom);
                }

                let smelter_output = steel_smelter * steel_base * production('psychic_boost','Steel');
                if (global.race['pyrophobia']){
                    smelter_output *= 1 - (traits.pyrophobia.vars()[0] / 100);
                }

                let delta = smelter_output;
                delta *= $ctx.hunger * $ctx.global_multiplier * $ctx.shrineMetal.mult;

                breakdown.p['Steel'][loc('city_smelter')] = smelter_output + 'v';
                breakdown.p['Steel'][loc('city_shrine')] = (($ctx.shrineMetal.mult - 1) * 100).toFixed(1) + '%';
                breakdown.p['Steel'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
                modRes('Steel', delta * $ctx.time_multiplier);

                if (global.tech['titanium'] && global.tech['titanium'] >= 1){
                    let titanium = smelter_output * $ctx.hunger * production('psychic_boost','Titanium');
                    if ($ctx.star_forge > 0){
                        delta *= 1 + ($ctx.star_forge / 50);
                    }
                    if (global.city.geology['Titanium']){
                        delta *= global.city.geology['Titanium'] + 1;
                    }
                    if (global.city.biome === 'oceanic'){
                        delta *= biomes.oceanic.vars()[1];
                    }
                    delta *= $ctx.shrineMetal.mult;
                    let divisor = global.tech['titanium'] >= 3 ? 10 : 25;
                    modRes('Titanium', (delta * $ctx.time_multiplier) / divisor);
                    breakdown.p['Titanium'][loc('resource_Steel_name')] = (titanium / divisor) + 'v';
                }
            }
        }

        // Graphene
        let graph_source = global.race['truepath'] ? 'space' : 'interstellar';
        let graph_struct = 'g_factory';
        if (global.race['warlord']){
            graph_source = 'portal'; graph_struct = 'twisted_lab';
        }
        if (global[graph_source][graph_struct] && global[graph_source][graph_struct].count > 0){
            let on_graph = global.race['truepath'] ? support_on['g_factory'] : (global.race['warlord'] ? p_on['twisted_lab'] : int_on['g_factory']);
            let max_graph = global[graph_source][graph_struct].on;
            let eff = max_graph > 0 ? on_graph / max_graph : 0;
            let remaining = max_graph;

            if (global.race['kindling_kindred'] || global.race['smoldering']){
                global[graph_source][graph_struct].Lumber = 0;
            }

            ['Oil','Coal','Lumber'].forEach(function(res){
                remaining -= global[graph_source][graph_struct][res];
                if (remaining < 0) {
                    global[graph_source][graph_struct][res] += remaining;
                    remaining = 0;
                }
            });

            let graphene_production = global[graph_source][graph_struct].Lumber + global[graph_source][graph_struct].Coal + global[graph_source][graph_struct].Oil;
            if (graphene_production > 0){
                let consume_wood = global[graph_source][graph_struct].Lumber * 350 * eff;
                let consume_coal = global[graph_source][graph_struct].Coal * 25 * eff;
                let consume_oil = global[graph_source][graph_struct].Oil * 15 * eff;

                while (consume_wood * $ctx.time_multiplier > global.resource.Lumber.amount && consume_wood > 0){
                    consume_wood -= 350 * eff;
                    graphene_production--;
                }
                while (consume_coal * $ctx.time_multiplier > global.resource.Coal.amount && consume_coal > 0){
                    consume_coal -= 25 * eff;
                    graphene_production--;
                }
                while (consume_oil * $ctx.time_multiplier > global.resource.Oil.amount && consume_oil > 0){
                    consume_oil -= 15 * eff;
                    graphene_production--;
                }

                graphene_production *= production('g_factory') * production('psychic_boost','Graphene');

                breakdown.p.consume.Lumber[global.race['warlord'] ? loc('portal_twisted_lab_title') : loc('interstellar_g_factory_bd')] = -(consume_wood);
                breakdown.p.consume.Coal[global.race['warlord'] ? loc('portal_twisted_lab_title') : loc('interstellar_g_factory_bd')] = -(consume_coal);
                breakdown.p.consume.Oil[global.race['warlord'] ? loc('portal_twisted_lab_title') : loc('interstellar_g_factory_bd')] = -(consume_oil);

                modRes('Lumber', -(consume_wood * $ctx.time_multiplier));
                modRes('Coal', -(consume_coal * $ctx.time_multiplier));
                modRes('Oil', -(consume_oil * $ctx.time_multiplier));

                if (global.civic.govern.type === 'corpocracy'){
                    graphene_production *= 1 + (govEffect.corpocracy()[4] / 100);
                }
                if (global.civic.govern.type === 'socialist'){
                    graphene_production *= 1 + (govEffect.socialist()[1] / 100);
                }

                let ai = 1;
                if (global.tech['ai_core'] >= 3){
                    let graph = +(quantum_level / 5).toFixed(1) / 100;
                    ai += graph * p_on['citadel'];
                }

                let incinerator = 1;
                if (global.race['warlord'] && global.portal.hasOwnProperty('incinerator') && global.portal.incinerator.rank > 1){
                    let rank = global.portal.incinerator.rank - 1;
                    incinerator += rank * 15 * global.portal.incinerator.on / 100;
                }

                let synd = global.race['truepath'] ? syndicate('spc_titan') : 1;
                let delta = graphene_production * ai * $ctx.zigVal * $ctx.hunger * $ctx.global_multiplier * synd * eff * incinerator;
                breakdown.p['Graphene'][global.race['warlord'] ? loc('portal_twisted_lab_title') : loc('interstellar_g_factory_bd')] = (graphene_production) + 'v';
                if (global.tech['isolation'] && graphene_production > 0){
                    delta *= $ctx.womling_technician;
                    if ($ctx.womling_technician > 1){
                        breakdown.p['Graphene'][`ᄂ${loc('tau_red_womlings')}+0`] = (($ctx.womling_technician - 1) * 100) + '%';
                    }
                }

                if (incinerator > 1){
                    breakdown.p['Graphene'][`ᄂ${loc('portal_incinerator_title')}`] = ((incinerator - 1) * 100) + '%';
                }

                if (graphene_production > 0){
                    breakdown.p['Graphene'][`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                    breakdown.p['Graphene'][`ᄂ${loc('space_red_ziggurat_title')}`] = (($ctx.zigVal - 1) * 100) + '%';
                }

                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.5;
                    breakdown.p['Graphene'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }

                if (p_on['citadel'] > 0){
                    breakdown.p['Graphene'][loc('interstellar_citadel_effect_bd')] = ((ai - 1) * 100) + '%';
                }
                breakdown.p['Graphene'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
                modRes('Graphene', delta * $ctx.time_multiplier);
            }
            else {
                breakdown.p['Graphene'] = 0;
            }
        }

        // Vitreloy
        if (global.galaxy['vitreloy_plant'] && p_on['vitreloy_plant'] > 0){

            let consume_money = 50000;
            let consume_bolognium = 2.5;
            let consume_stanene = 100;
            let vitreloy_production = p_on['vitreloy_plant'];

            vitreloy_production = Math.min(vitreloy_production, Math.floor(global.resource.Money.amount / (consume_money * $ctx.time_multiplier)));
            vitreloy_production = Math.min(vitreloy_production, Math.floor(global.resource.Bolognium.amount / (consume_bolognium * $ctx.time_multiplier)));
            vitreloy_production = Math.min(vitreloy_production, Math.floor(global.resource.Stanene.amount / (consume_stanene * $ctx.time_multiplier)));
            vitreloy_production = Math.max(vitreloy_production, 0);

            if (vitreloy_production > 0){
                consume_money *= vitreloy_production;
                consume_bolognium *= vitreloy_production;
                consume_stanene *= vitreloy_production;
                vitreloy_production *= production('vitreloy_plant') * production('psychic_boost','Vitreloy');

                breakdown.p.consume.Money[loc('galaxy_vitreloy_plant_bd')] = -(consume_money);
                breakdown.p.consume.Bolognium[loc('galaxy_vitreloy_plant_bd')] = -(consume_bolognium);
                breakdown.p.consume.Stanene[loc('galaxy_vitreloy_plant_bd')] = -(consume_stanene);

                modRes('Money', -(consume_money * $ctx.time_multiplier));
                modRes('Bolognium', -(consume_bolognium * $ctx.time_multiplier));
                modRes('Stanene', -(consume_stanene * $ctx.time_multiplier));

                let pirate = piracy('gxy_alien1');

                breakdown.p['Vitreloy'][loc('galaxy_vitreloy_plant_bd')] = (vitreloy_production) + 'v';

                if (global.race['discharge'] && global.race['discharge'] > 0){
                    vitreloy_production *= 0.5;
                    breakdown.p['Vitreloy'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }

                if (vitreloy_production > 0){
                    breakdown.p['Vitreloy'][`ᄂ${loc('galaxy_piracy')}+0`] = -((1 - pirate) * 100) + '%';
                    breakdown.p['Vitreloy'][`ᄂ${loc('space_red_ziggurat_title')}+0`] = (($ctx.zigVal - 1) * 100) + '%';
                }
                modRes('Vitreloy', vitreloy_production * $ctx.hunger * $ctx.global_multiplier * pirate * $ctx.time_multiplier * $ctx.zigVal);
            }
        }

        if (p_on['shadow_mine']){
            let attract = p_on['soul_attractor'] ? 1 + (p_on['soul_attractor'] * (global.tech.pitspawn >= 3 ? 0.2 : 0.1)) : 1;

            if (global.resource.Vitreloy.display){ // Vitreloy
                let rate = production('shadow_mine','vitreloy');
                let mine_base = p_on['shadow_mine'] * rate * production('psychic_boost','Vitreloy');
                let mine_delta = mine_base * attract * $ctx.global_multiplier;

                if (mine_base > 0){
                    breakdown.p['Vitreloy'][loc('portal_shadow_mine_title')] = mine_base + 'v';
                    breakdown.p['Vitreloy'][`ᄂ${loc('portal_soul_attractor_title')}+0`] = ((attract - 1) * 100) + '%';
                }
                modRes('Vitreloy', mine_delta * $ctx.time_multiplier);
            }
            
            if (global.resource.Elerium.display){ // Elerium
                let rate = production('shadow_mine','elerium');
                let mine_base = p_on['shadow_mine'] * rate * production('psychic_boost','Elerium');

                let mine_delta = mine_base * attract * $ctx.global_multiplier;

                if (mine_base > 0){
                    breakdown.p['Elerium'][loc('portal_shadow_mine_title')] = mine_base + 'v';
                    breakdown.p['Elerium'][`ᄂ${loc('portal_soul_attractor_title')}+0`] = ((attract - 1) * 100) + '%';
                }
                modRes('Elerium', mine_delta * $ctx.time_multiplier);
            }

            if (global.resource.Infernite.display){ // Infernite
                let rate = production('shadow_mine','infernite');
                let mine_base = p_on['shadow_mine'] * rate * production('psychic_boost','Infernite');

                let mine_delta = mine_base * attract * $ctx.global_multiplier;

                if (mine_base > 0){
                    breakdown.p['Infernite'][loc('portal_shadow_mine_title')] = mine_base + 'v';
                    breakdown.p['Infernite'][`ᄂ${loc('portal_soul_attractor_title')}+0`] = ((attract - 1) * 100) + '%';
                }
                modRes('Infernite', mine_delta * $ctx.time_multiplier);
            }
        }

        if (p_on['s_gate'] && global.galaxy['raider'] && gal_on['raider'] > 0){
            let base = gal_on['raider'] * 0.05 * production('psychic_boost','Vitreloy');
            let pirate = piracy('gxy_chthonian');
            let delta = base * $ctx.global_multiplier * pirate * $ctx.hunger * $ctx.zigVal;

            breakdown.p['Vitreloy'][loc('galaxy_raider')] = base + 'v';
            if (base > 0){
                breakdown.p['Vitreloy'][`ᄂ${loc('galaxy_piracy')}+1`] = -((1 - pirate) * 100) + '%';
                breakdown.p['Vitreloy'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = (($ctx.zigVal - 1) * 100) + '%';
            }
            modRes('Vitreloy', delta * $ctx.time_multiplier);
        }
        breakdown.p['Vitreloy'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';

        if (!global.tech['isolation'] && global.space['lander'] && global.space['crashed_ship'] && global.space.crashed_ship.count === 100){
            let synd = syndicate('spc_triton');
            let base = support_on['lander'] * production('lander');
            let delta = base * $ctx.global_multiplier * synd * $ctx.hunger;

            breakdown.p['Cipher'][loc('space_lander_title')] = base + 'v';
            breakdown.p['Cipher'][`ᄂ${loc('space_syndicate')}+0`] = -((1 - synd) * 100) + '%';
            breakdown.p['Cipher'][`ᄂ${loc('hunger')}`] = (($ctx.hunger - 1) * 100) + '%';

            modRes('Cipher', delta * $ctx.time_multiplier);

            if (global.resource.Cipher.display && global.tech['outer'] && global.tech.outer === 2){
                global.tech.outer = 3;
                drawTech();
            }
        }

        if (!global.tech['isolation'] && global.space['digsite'] && global.space.digsite.count === 100){
            if (!global.tech['dig_control']){
                global.tech['dig_control'] = 1;
                drawTech();
            }

            let synd = syndicate('spc_eris');
            let shock_base = support_on['shock_trooper'] * production('shock_trooper');
            let tank_base = support_on['tank'] * production('tank');

            if (support_on['shock_trooper']){
                breakdown.p['Cipher'][loc('space_shock_trooper_title')] = shock_base + 'v';
                breakdown.p['Cipher'][`ᄂ${loc('space_syndicate')}+1`] = -((1 - synd) * 100) + '%';
            }
            if (support_on['tank']){
                breakdown.p['Cipher'][loc('space_tank_title')] = tank_base + 'v';
                breakdown.p['Cipher'][`ᄂ${loc('space_syndicate')}+2`] = -((1 - synd) * 100) + '%';
            }

            let delta = (shock_base + tank_base) * $ctx.global_multiplier * synd;
            modRes('Cipher', delta * $ctx.time_multiplier);
        }
        
        if(global.portal['oven_complete'] && p_on['oven_complete'] && !global.tech['dish_reset'] && global.portal['devilish_dish'].done >= 100){
            global.tech['dish_reset'] = 1;
            drawTech();
        }
}

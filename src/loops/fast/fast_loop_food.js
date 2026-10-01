// Produksi makanan per tick (farm, soul well, hunter, trait ras, dan sumber lain).
import { global, breakdown, p_on, support_on, int_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { flib } from '../../functions/run_stats_helpers.js';
import { traits, hooks, actions } from '../../core/registries.js';
import { planetTraits, biomes } from '../../races/planet_data.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';
import { racialTrait, servantTrait } from '../../races/trait_logic/racial_traits.js';
import { blubberFill } from '../../races/powers/psychic_powers.js';
import { weaponTechModifer } from '../../civics/military/army_rating.js';
import { garrisonSize } from '../../civics/military/garrison.js';
import { production } from '../../resources/prod.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { loc } from '../../core/locale.js';
import { astroVal } from '../../functions/astrology.js';
import { jobName } from '../../civics/jobs/job_name.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { syndicate } from '../../truepath/orbit_math.js';

export function fastLoopFood($ctx){
        if (global.resource[global.race.species].amount >= 1 || global.city['farm'] || global.city['soul_well'] || global.city['compost'] || global.city['tourist_center'] || global.city['transmitter']){
            let food_base = 0;
            let virgo = $ctx.astroSign === 'virgo' ? 1 + (astroVal('virgo')[0] / 100) : 1;

            if (global.race['artifical']){
                if (global.city['transmitter']){
                    food_base = p_on['transmitter'] * production('transmitter') * production('psychic_boost','Food');
                    breakdown.p['Food'][loc('city_transmitter')] = food_base + 'v';
                    global.city.transmitter['lpmod'] = production('transmitter') * $ctx.global_multiplier * production('psychic_boost','Food');
                }
            }
            else {
                if (global.race['detritivore']){
                    if (global.city['compost']){
                        let operating = global.city.compost.on;
                        if (!global.race['kindling_kindred'] && !global.race['smoldering']){
                            let lumberIncrement = 0.5;
                            let lumber_cost = operating * lumberIncrement;

                            while (lumber_cost * $ctx.time_multiplier > global.resource.Lumber.amount && lumber_cost > 0){
                                lumber_cost -= lumberIncrement;
                                operating--;
                            }

                            breakdown.p.consume.Lumber[loc('city_compost_heap')] = -(lumber_cost);
                            modRes('Lumber', -(lumber_cost * $ctx.time_multiplier));
                        }
                        let c_factor = traits.detritivore.vars()[0] / 100;
                        let food_compost = operating * (1.2 + (global.tech['compost'] * c_factor));
                        food_compost *= global.city.biome === 'grassland' ? biomes.grassland.vars()[0] : 1;
                        food_compost *= global.city.biome === 'savanna' ? biomes.savanna.vars()[0] : 1;
                        food_compost *= global.city.biome === 'ashland' ? biomes.ashland.vars()[0] : 1;
                        food_compost *= global.city.biome === 'volcanic' ? biomes.volcanic.vars()[0] : 1;
                        food_compost *= global.city.biome === 'hellscape' ? biomes.hellscape.vars()[0] : 1;
                        food_compost *= global.city.ptrait.includes('trashed') ? planetTraits.trashed.vars()[0] : 1;
                        food_compost *= production('psychic_boost','Food');
                        breakdown.p['Food'][loc('city_compost_heap')] = food_compost + 'v';
                        food_base += food_compost;
                    }
                }
                else if (global.race['carnivore'] || global.race['soul_eater']){
                    let strength = weaponTechModifer();
                    let food_hunt = workerScale(global.civic.hunter.workers,'hunter');
                    food_hunt *= racialTrait(food_hunt,'hunting');
                    if (global.race['servants']){
                        let serve_hunt = global.race.servants.jobs.hunter;
                        serve_hunt *= servantTrait(global.race.servants.jobs.hunter,'hunting');
                        food_hunt += serve_hunt;
                    }
                    food_hunt *= strength * (global.race['carnivore'] ? 2 : 0.5);
                    if (global.race['ghostly']){
                        food_hunt *= 1 + (traits.ghostly.vars()[0] / 100);
                    }
                    food_hunt *= production('psychic_boost','Food');
                    breakdown.p['Food'][jobName('hunter')] = food_hunt + 'v';

                    if (global.race['carnivore'] && global.city['lodge'] && food_hunt > 0){
                        food_hunt *= 1 + (global.city.lodge.count / 20);
                        breakdown.p['Food'][`ᄂ${loc('city_lodge')}`] = (global.city.lodge.count * 5) + '%';
                    }

                    if (global.city['soul_well']){
                        let souls = global.city['soul_well'].count * (global.race['ghostly'] ? (2 + traits.ghostly.vars()[1]) : 2);
                        food_hunt += souls * production('psychic_boost','Food');
                        breakdown.p['Food'][loc('city_soul_well')] = souls + 'v';
                    }
                    food_base += food_hunt;
                }
                else if (global.race['unfathomable']){
                    if (global.city['captive_housing']){
                        let strength = weaponTechModifer();
                        let hunt = workerScale(global.civic.hunter.workers,'hunter')
                        hunt *= racialTrait(hunt,'hunting') * strength;
                        if (global.race['servants']){
                            let serve_hunt = global.race.servants.jobs.hunter * strength;
                            serve_hunt *= servantTrait(global.race.servants.jobs.hunter,'hunting');
                            hunt += serve_hunt;
                        }
                        let minHunt = hunt * 0.008;

                        if (global.city.captive_housing.cattle < global.city.captive_housing.cattleCap && hunt > 0){
                            hunt -= Math.round(global.city.captive_housing.cattle ** 1.25);
                            if (hunt < minHunt){ hunt = minHunt; }
                            global.city.captive_housing.cattleCatch += hunt * $ctx.time_multiplier;
                            if (global.city.captive_housing.cattleCatch >= global.city.captive_housing.cattle ** 2){
                                global.city.captive_housing.cattle++;
                                global.city.captive_housing.cattleCatch = 0;
                            }
                        }

                        if (global.city.captive_housing.cattle > 0){
                            let food = global.city.captive_housing.cattle / 3 * production('psychic_boost','Food');
                            breakdown.p['Food'][loc('city_captive_housing_cattle_bd')] = food + 'v';
                            food_base += food;
                            if (global.resource.Food.amount < global.resource.Food.max * 0.01){
                                global.city.captive_housing.cattle--;
                                modRes('Food', 1000 * production('psychic_boost','Food') * $ctx.global_multiplier, true);
                                global.stats.cattle++;
                            }
                        }
                    }
                }
                else if (global.city['farm'] || global.race['forager'] || global.race['warlord']) {
                    let weather_multiplier = 1;
                    if (!global.race['submerged']){
                        if (global.city.calendar.temp === 0){
                            if (global.city.calendar.weather === 0){
                                weather_multiplier *= global.race['chilled'] ? (1 + traits.chilled.vars()[3] / 100) : 0.7;
                            }
                            else {
                                weather_multiplier *= global.race['chilled'] ? (1 + traits.chilled.vars()[4] / 100) : 0.85;
                            }
                        }
                        if (global.city.calendar.weather === 2){
                            weather_multiplier *= global.race['chilled'] ? (1 - traits.chilled.vars()[5] / 100) : 1.1;
                        }
                    }

                    if (global.race['forager']){
                        let forage = 1 + (global.tech['foraging'] ? 0.75 * global.tech['foraging'] : 0);
                        let foragers = workerScale(global.civic.forager.workers,'forager');
                        foragers *= racialTrait(foragers,'forager');
                        if (global.race['servants']){
                            let serve = global.race.servants.jobs.forager;
                            serve *= servantTrait(global.race.servants.jobs.forager,'forager');
                            foragers += serve;
                        }
                        let food_forage = foragers * forage * 0.35;
                        breakdown.p['Food'][jobName('forager')] = food_forage + 'v';
                        food_base += food_forage;
                    }

                    if (global.race['warlord']){
                        let food = workerScale(global.civic.lumberjack.workers,'farmer') * hooks.farmerValue(true);
                        breakdown.p['Food'][jobName('lumberjack')] = food + 'v';
                        food_base += food;
                    }

                    if (global.city['farm']){
                        let farmers = workerScale(global.civic.farmer.workers,'farmer');
                        let farmhands = 0;
                        if (farmers > jobScale(global.city.farm.count)){
                            farmhands = farmers - jobScale(global.city.farm.count);
                            farmers = jobScale(global.city.farm.count);
                        }
                        let food = (farmers * hooks.farmerValue(true)) + (farmhands * hooks.farmerValue(false));

                        if (global.race['servants']){
                            let servants = global.race.servants.jobs.farmer;
                            let servehands = 0;
                            let open = global.city.farm.count - (farmers / (global.race['high_pop'] ? traits.high_pop.vars()[0] : 1));
                            if (servants > open){
                                servehands = servants - open;
                                servants = open;
                            }
                            food += (servants * hooks.farmerValue(true,true)) + (servehands * hooks.farmerValue(false,true));
                        }

                        let mill_multiplier = 1;
                        if (global.city['mill']){
                            let mill_bonus = global.tech['agriculture'] >= 5 ? 0.05 : 0.03;
                            let working = global.city['mill'].count - global.city['mill'].on;
                            mill_multiplier += (working * mill_bonus);
                        }

                        breakdown.p['Food'][jobName('farmer')] = (food) + 'v';
                        food_base += (food * virgo * weather_multiplier * mill_multiplier * $ctx.q_multiplier * production('psychic_boost','Food'));

                        if (food > 0){
                            breakdown.p['Food'][`ᄂ${loc('city_mill_title1')}`] = ((mill_multiplier - 1) * 100) + '%';
                            breakdown.p['Food'][`ᄂ${loc('sign_virgo')}+0`] = ((virgo - 1) * 100) + '%';
                            breakdown.p['Food'][`ᄂ${loc('morale_weather')}`] = ((weather_multiplier - 1) * 100) + '%';
                            breakdown.p['Food'][`ᄂ${loc('quarantine')}+0`] = (($ctx.q_multiplier - 1) * 100) + '%';
                        }
                    }
                }
            }

            if (global.tauceti['tau_farm'] && p_on['tau_farm']){
                let colony_val = 1 + ((support_on['colony'] || 0) * 0.5);
                let food_base = production('tau_farm','food') * p_on['tau_farm'] * production('psychic_boost','Food');
                let delta = food_base * $ctx.global_multiplier * colony_val;

                breakdown.p['Food'][loc('tau_home_tau_farm')] = food_base + 'v';
                if (food_base > 0){
                    breakdown.p['Food'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                }

                modRes('Food', delta * $ctx.time_multiplier);
            }

            let hunting = 0;
            if (global.tech['military']){
                hunting = (global.race['herbivore'] && !global.race['carnivore']) || global.race['artifical'] ? 0 : hooks.armyRating(garrisonSize(),'hunting') / 3;
                hunting *= production('psychic_boost','Food');
            }

            let biodome = 0;
            let red_synd = syndicate('spc_red');
            if (global.tech['mars']){
                biodome = support_on['biodome'] * workerScale(global.civic.colonist.workers,'colonist') * production('biodome','food') * production('psychic_boost','Food');
                if (global.race['cataclysm'] || global.race['orbit_decayed']){
                    biodome += support_on['biodome'] * production('biodome','cat_food') * production('psychic_boost','Food');
                }
            }

            breakdown.p['Food'][actions.space.spc_red.biodome.title()] = biodome + 'v';
            if (biodome > 0){
                breakdown.p['Food'][`ᄂ${loc('space_syndicate')}+0`] = -((1 - red_synd) * 100) + '%';
                breakdown.p['Food'][`ᄂ${loc('space_red_ziggurat_title')}+0`] = (($ctx.zigVal - 1) * 100) + '%';
                breakdown.p['Food'][`ᄂ${loc('sign_virgo')}+0`] = ((virgo - 1) * 100) + '%';
            }

            let generated = food_base + (hunting * $ctx.q_multiplier) + (biodome * red_synd * $ctx.zigVal * virgo);
            generated *= $ctx.global_multiplier;

            let soldiers = global.civic.garrison.workers;
            if (global.race['parasite'] && !global.tech['isolation']){
                soldiers -= jobScale(traits.parasite.vars()[0]);
                if (soldiers < 0){
                    soldiers = 0;
                }
            }

            let consume = 0;
            let food_consume_mod = 1;
            if(global.race['gluttony']){
                food_consume_mod *= 1 + traits.gluttony.vars()[0] / 100;
            }
            if (global.race['high_metabolism']){
                food_consume_mod *= 1 + (traits.high_metabolism.vars()[0] / 100);
            }
            if (global.race['sticky']){
                food_consume_mod *= 1 - (traits.sticky.vars()[0] / 100);
            }
            let pingFathom = fathomCheck('pinguicula');
            if (pingFathom > 0){
                food_consume_mod *= 1 - (traits.sticky.vars(1)[0] / 100 * pingFathom);
            }
            if (global.race['photosynth']){
                switch(global.city.calendar.weather){
                    case 0:
                        food_consume_mod *= global.city.calendar.temp === 0 ? 1 : (1 - (traits.photosynth.vars()[2] / 100));
                        break;
                    case 1:
                        food_consume_mod *= 1 - (traits.photosynth.vars()[1] / 100);
                        break;
                    case 2:
                        food_consume_mod *= 1 - (traits.photosynth.vars()[0] / 100);
                        break;
                }
            }
            if (global.race['ravenous']){
                food_consume_mod *= 1 + (traits.ravenous.vars()[0] / 100);
            }
            if (global.race['hibernator'] && global.city.calendar.season === 3){
                food_consume_mod *= 1 - (traits.hibernator.vars()[0] / 100);
            }
            if (global.race['high_pop']){
                food_consume_mod /= traits.high_pop.vars()[0];
            }
            let banquet = 1;
            if(global.city.banquet){
                if(global.city.banquet.on){
                    banquet *= ((global.city.banquet.level >= 5 ? 1.02 : 1.022)**global.city.banquet.strength);
                }
                else{
                    global.city.banquet.strength = 0;
                }
            }

            let ravenous = 0;
            let tourism = 0;
            let spaceport = 0;
            let starport = 0;
            let starbase = 0;
            let space_station = 0;
            let space_marines = 0;
            let embassy = 0;
            let zoo = 0;
            let restaurant = 0;
            if(!global.race['fasting']){
                consume = (global.resource[global.race.species].amount + soldiers - ((global.civic.unemployed.workers + workerScale(global.civic.hunter.workers,'hunter')) * 0.5)) * food_consume_mod;
                if (global.race['forager']){
                    consume -= workerScale(global.civic.forager.workers,'forager');
                }
                if(global.race['ravenous']){
                    ravenous = (global.resource.Food.amount / traits.ravenous.vars()[1]);
                }
                breakdown.p.consume.Food[flib('name')] = -(consume + ravenous);
                if(global.city.banquet && global.city.banquet.on){
                    consume = Math.max(consume, 100); //minimum consumption for banquet hall
                }
                if(consume * banquet + ravenous >= global.resource.Food.amount){
                    if(global.city.banquet && banquet > 1){
                        global.city.banquet.strength = 0;
                    }
                }
                else{
                    if(banquet > 1){
                        breakdown.p.consume.Food[`${loc('city_banquet')}`] = -(consume*(banquet-1));
                    }
                    consume *= banquet;
                }

                if (global.city['tourist_center']){
                    tourism = global.city['tourist_center'].on * 50;
                    breakdown.p.consume.Food[loc('tech_tourism')] = -(tourism);
                }

                if (global.space['spaceport']){
                    spaceport = p_on['spaceport'] * (global.race['cataclysm'] || global.race['orbit_decayed'] ? 2 : 25);
                    breakdown.p.consume.Food[loc('space_red_spaceport_title')] = -(spaceport);
                }

                if (global.interstellar['starport']){
                    starport = p_on['starport'] * 100;
                    breakdown.p.consume.Food[loc('interstellar_alpha_starport_title')] = -(starport);
                }

                if (global.galaxy['starbase']){
                    starbase = p_on['s_gate'] * p_on['starbase'] * 250;
                    breakdown.p.consume.Food[loc('galaxy_starbase')] = -(starbase);
                }

                if (global.space['space_station']){
                    space_station = p_on['space_station'] * (global.race['cataclysm'] ? 1 : 10);
                    breakdown.p.consume.Food[loc('space_belt_station_title')] = -(space_station);
                }

                if (global.space['space_barracks'] && !global.race['cataclysm']){
                    space_marines = global.space.space_barracks.on * 10;
                    breakdown.p.consume.Food[loc('tech_space_marines_bd')] = -(space_marines);
                }

                if (global.galaxy['embassy']){
                    embassy = p_on['s_gate'] * p_on['embassy'] * 7500;
                    breakdown.p.consume.Food[loc('galaxy_embassy')] = -(embassy);
                }

                if (global.interstellar['zoo']){
                    zoo = int_on['zoo'] * 12000;
                    breakdown.p.consume.Food[loc('tech_zoo')] = -(zoo);
                }

                if (global.eden['restaurant']){
                    restaurant = p_on['restaurant'] * 250000;
                    breakdown.p.consume.Food[loc('eden_restaurant_bd')] = -(restaurant);
                }
            }

            breakdown.p['Food'][loc('soldiers')] = hunting + 'v';
            if (hunting > 0){
                breakdown.p['Food'][`ᄂ${loc('quarantine')}+1`] = (($ctx.q_multiplier - 1) * 100) + '%';
            }
            if(global.race['fasting']){
                breakdown.p['Food'][`${loc('evo_challenge_fasting')}`] = '-100%';
                generated *= 0;
            }

            let delta = generated - consume - ravenous - tourism - spaceport - starport - starbase - space_station - space_marines - embassy - zoo - restaurant;

            if (!modRes('Food', delta * $ctx.time_multiplier) || global.race['fasting']){
                if (global.race['anthropophagite'] && global.resource[global.race.species].amount > 1 && !global.race['fasting']){
                    global.resource[global.race.species].amount--;
                    modRes('Food', 10000 * traits.anthropophagite.vars()[0]);
                    global.stats.murders++;
                    blubberFill(1);
                }
                else {
                    $ctx.fed = false;
                    if(global.resource[global.race.species].amount > 0){
                        let threshold = 1.25;
                        let digestion = 0;
                        let humpback = 0;
                        let meditators = 0;
                        let atrophy = 0;
                        let infusion = 1;
                        if (global.race['slow_digestion']){
                            digestion += traits.slow_digestion.vars()[0];
                        }
                        let fathom = fathomCheck('slitheryn');
                        if (fathom > 0){
                            digestion += traits.slow_digestion.vars(1)[0] * fathom;
                        }
                        if (global.race['humpback']){
                            humpback = traits.humpback.vars()[0];
                        }
                        if(global.race['fasting']){
                            meditators = highPopAdjust(global.civic.meditator.workers) * 0.03;
                        }
                        if (global.race['atrophy']){
                            atrophy = traits.atrophy.vars()[0];
                        }
                        if(global.portal['dish_life_infuser'] && global.portal['dish_life_infuser'].on){
                            infusion = 0.95 ** global.portal['dish_life_infuser'].on;
                        }
                        threshold += digestion + humpback + meditators;
                        threshold -= atrophy;
                        threshold *= infusion
                        if(global.race['fasting']){
                            let base = global.resource[global.race.species].amount/100;
                            breakdown.p.consume[global.race.species][global.resource[global.race.species].name] = -(base).toFixed(2);
                            breakdown.p.consume[global.race.species][loc('genelab_traits')] = (1 - food_consume_mod) * (base).toFixed(2);
                            breakdown.p.consume[global.race.species][loc('Threshold')] = (threshold).toFixed(2);
                            global.resource[global.race.species].delta = -(base * food_consume_mod - threshold) * $ctx.time_multiplier;
                            /*for(const x in breakdown.p.consume[global.race.species]){
                                breakdown.p.consume[global.race.species][x] = (breakdown.p.consume[global.race.species][x] / time_multiplier).toFixed(2);
                            }*/
                        }
                        // threshold can be thought of as the inverse of nutrition ratio per unit of food.
                        // So if the generated food doesn't have enough nutrition for the consuming population, they starve.
                        if (Math.rand(0, 10) === 0){
                            if(global.race['fasting']){
                                let starved = (global.resource[global.race.species].amount) / 100 * food_consume_mod - threshold;
                                if(starved < 0){
                                    starved = 0;
                                }
                                if(starved%1 > Math.random()){
                                    starved = Math.ceil(starved);
                                }
                                else{
                                    starved = Math.floor(starved);
                                }
                                if(starved > global.resource[global.race.species].amount){
                                    starved = global.resource[global.race.species].amount;
                                }
                                global.resource[global.race.species].amount -= starved;
                                global.stats.starved += starved;
                                blubberFill(starved);
                            }
                            else if (generated < consume / threshold){
                                global['resource'][global.race.species].amount--;
                                global.stats.starved++;
                                blubberFill(1);
                            }
                        }
                    }
                }
            }

            if (global.race['anthropophagite'] && global.resource[global.race.species].amount > 1 && Math.rand(0,400) === 0){
                global.resource[global.race.species].amount--;
                modRes('Food', 10000 * traits.anthropophagite.vars()[0]);
                global.stats.murders++;
                blubberFill(1);
            }
        }
}

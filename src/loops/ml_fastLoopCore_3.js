import { global, breakdown, p_on, support_on, int_on } from '../core/vars.js';
import { modRes, flib, messageQueue, timeScale } from '../functions/functions.js';
import { traits, planetTraits, fathomCheck, biomes, racialTrait, servantTrait, blubberFill } from '../races/races.js';
import { govActive } from '../governor/governor.js';
import { govEffect, garrisonSize, weaponTechModifer, armyRating } from '../civics/civics.js';
import { highPopAdjust, production } from '../resources/prod.js';
import { loc } from '../core/locale.js';
import { faithTempleCount } from '../resources/resources.js';
import { tradeRatio } from '../config/trade.js';
import { astroVal } from '../systems/seasons.js';
import { actions, drawTech } from '../actions/actions.js';
import { jobScale, workerScale, jobName, farmerValue } from '../civics/jobs.js';
import { S } from '../main/main_state.js';
import { syndicate, shipFuelUse } from '../truepath/truepath.js';
import { BIRTH_BONUS_PER_LOT } from '../stocks/stocks_core.js';
import { sequenceLabs } from '../arpa/arpa.js';

// Bagian dari fastLoopCore (main.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function fastLoopCore_s6($ctx){
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
                        let food = workerScale(global.civic.lumberjack.workers,'farmer') * farmerValue(true);
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
                        let food = (farmers * farmerValue(true)) + (farmhands * farmerValue(false));

                        if (global.race['servants']){
                            let servants = global.race.servants.jobs.farmer;
                            let servehands = 0;
                            let open = global.city.farm.count - (farmers / (global.race['high_pop'] ? traits.high_pop.vars()[0] : 1));
                            if (servants > open){
                                servehands = servants - open;
                                servants = open;
                            }
                            food += (servants * farmerValue(true,true)) + (servehands * farmerValue(false,true));
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
                hunting = (global.race['herbivore'] && !global.race['carnivore']) || global.race['artifical'] ? 0 : armyRating(garrisonSize(),'hunting') / 3;
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

        // Fortress Repair
        if (global.portal['fortress'] && global.portal.fortress.walls < 100){
            if (modRes('Stone', -(200 * $ctx.time_multiplier))){
                global.portal.fortress.repair++;
                breakdown.p.consume.Stone[loc('portal_fortress_name')] = -200;
            }
            if (global.portal.fortress.repair >= actions.portal.prtl_fortress.info.repair()){
                global.portal.fortress.repair = 0;
                global.portal.fortress.walls++;
            }
        }

        // Energy Recharge
        if (global.race['psychic'] && global.resource.Energy.display){
            let energy_bd = {};
            let charge = traits.psychic.vars()[2];
            energy_bd[loc('trait_psychic_name')] = charge + 'v';
            modRes(`Energy`, (charge * $ctx.time_multiplier));
            breakdown.p['Energy'] = energy_bd;
        }

        // Citizen Growth
        if (global.civic.homeless > 0){
            let missing = Math.min(global.civic.homeless, global.resource[global.race.species].max - global.resource[global.race.species].amount);
            global.civic.homeless -= missing;
            global.resource[global.race.species].amount += missing;
            global.civic[global.civic.d_job].workers += missing;
        }
        else if ((($ctx.fed && global['resource']['Food'].amount > 0) || global.race['fasting']) && global['resource'][global.race.species].max > global['resource'][global.race.species].amount){
            if (global.race['artifical'] || (global.race['spongy'] && global.city.calendar.weather === 0)){
                // Do Nothing
            }
            else if (global.race['parasite'] && global.city.calendar.wind === 0 && !global.race['cataclysm'] && !global.race['orbit_decayed']){
                // Do Nothing
            }
            else if (global.race['vax'] && global.race.vax >= 100){
                // Do Nothing
            }
            else {
                let lowerBound = global.tech['reproduction'] ? global.tech['reproduction'] : 0;
                let upperBound = global['resource'][global.race.species].amount;

                if (global.tech['reproduction'] && $ctx.date.getMonth() === 1 && $ctx.date.getDate() === 14){
                    lowerBound += 5;
                }
                if (global.race['fast_growth']){
                    lowerBound *= traits.fast_growth.vars()[0];
                    lowerBound += traits.fast_growth.vars()[1];
                }
                if (global.race['spores'] && global.city.calendar.wind === 1){
                    if (global.race['parasite']){
                        lowerBound += traits.spores.vars()[2];
                    }
                    else {
                        lowerBound += traits.spores.vars()[0];
                        lowerBound *= traits.spores.vars()[1];
                    }
                }
                if (global.tech['reproduction'] && global.tech.reproduction >= 2 && global.city['hospital']){
                    lowerBound += global.city.hospital.count;
                }
                if (global.genes['birth']){
                    lowerBound += global.genes['birth'];
                }
                // Stock portfolio birth rate bonus: same flat/reversible pattern as the Morale and Power stock
                // bonuses above - recomputed every roll from current holdings, so selling lots removes it again.
                if (global.stocks && global.stocks.market &&  global.stocks.market.Birthrate && global.stocks.market.Birthrate.lots > 0){
                    lowerBound += global.stocks.market.Birthrate.lots * BIRTH_BONUS_PER_LOT;
                }
                if (global.race['promiscuous']){
                    lowerBound += traits.promiscuous.vars()[0] * global.race['promiscuous'];
                }
                if(global.race['fasting']){
                    lowerBound += highPopAdjust(global.civic.meditator.workers) * 0.15;
                }
                if(global.city.banquet && global.city.banquet.on && global.city.banquet.level >= 1){
                    lowerBound *= 1 + (global.city.banquet.strength ** 0.75) / 100;
                }
                if ($ctx.astroSign === 'libra'){
                    lowerBound *= 1 + (astroVal('libra')[0] / 100);
                }
                if (global.race['high_pop']){
                    lowerBound *= traits.high_pop.vars()[2];
                    upperBound /= jobScale(1);
                }
                if (global.city.biome === 'taiga'){
                    lowerBound *= biomes.taiga.vars()[1];
                }
                if (global.city.ptrait.includes('toxic')){
                    upperBound *= planetTraits.toxic.vars()[1];
                }
                if (global.race['parasite'] && (global.race['cataclysm'] || global.race['orbit_decayed'])){
                    lowerBound = Math.round(lowerBound / 5);
                    upperBound *= 3;
                }

                upperBound *= (3 - (2 ** $ctx.time_multiplier));
                // Accelerated time: one real tick is worth several ticks, so the birth roll is made once per tick of game time
                for (let roll = timeScale(); roll > 0; roll--){
                    if (global['resource'][global.race.species].amount >= global['resource'][global.race.species].max){
                        break;
                    }
                    if(Math.rand(0, upperBound) <= lowerBound){
                        global['resource'][global.race.species].amount++;
                        global.civic[global.civic.d_job].workers++;
                    }
                }
            }
        }
}

export function fastLoopCore_s7($ctx){
        if (global.space['shipyard'] && global.space.shipyard['ships']){
            let fuels = {
                Oil: 0,
                Helium_3: 0,
                Uranium: 0,
                Elerium: 0
            };
            global.space.shipyard.ships.forEach(function(ship){
                if (ship.location !== 'spc_dwarf' || ship.transit !== 0){
                    let fuel = shipFuelUse(ship);
                    if (fuel.res && fuel.burn > 0){
                        if (fuel.burn * $ctx.time_multiplier < global.resource[fuel.res].amount + (global.resource[fuel.res].diff > 0 ? global.resource[fuel.res].diff * $ctx.time_multiplier : 0)){
                            modRes(fuel.res, -(fuel.burn * $ctx.time_multiplier));
                            ship.fueled = true;
                            fuels[fuel.res] += fuel.burn;
                        }
                        else {
                            ship.fueled = false;
                        }
                    }
                    else {
                        ship.fueled = true;
                    }
                }
            });

            breakdown.p.consume.Oil[loc('outer_shipyard_fleet')] = -(fuels.Oil);
            breakdown.p.consume.Helium_3[loc('outer_shipyard_fleet')] = -(fuels.Helium_3);
            breakdown.p.consume.Uranium[loc('outer_shipyard_fleet')] = -(fuels.Uranium);
            breakdown.p.consume.Elerium[loc('outer_shipyard_fleet')] = -(fuels.Elerium);
        }

        if (global.race['emfield']){
            if (global.race['discharge'] && global.race['discharge'] > 0){
                global.race.discharge--;
            }
            else {
                global.race.emfield++;
                if (Math.rand(0,500) === 0){
                    global.race['discharge'] = global.race.emfield;
                    global.race.emfield = 1;
                }
            }
        }

        // Resource Income
        $ctx.hunger = $ctx.fed ? 1 : 0.5;
        if (global.race['angry'] && $ctx.fed === false){
            $ctx.hunger -= traits.angry.vars()[0] / 100;
        }
        if (global.race['malnutrition'] && $ctx.fed === false){
            $ctx.hunger += traits.malnutrition.vars()[0] / 100;
        }
        if(global.portal['dish_soul_steeper'] && global.portal['dish_soul_steeper'].on){
            $ctx.hunger -= (0.03 + (global.race['malnutrition'] ? 0.01 : 0) + (global.race['angry'] ? -0.01 : 0)) * global.portal['dish_soul_steeper'].on;
        }
        $ctx.hunger = Math.max($ctx.hunger, 0);

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

            let hunting = armyRating(garrisonSize(),'hunting') / 10;
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

        // Knowledge
        { //block scope
            let sundial_base = global.tech['primitive'] && global.tech['primitive'] >= 3 ? 1 : 0;
            if (global.race['ancient_ruins']){
                sundial_base++;
            }
            if (global.stats.achieve['extinct_junker'] && global.stats.achieve['extinct_junker'].l >= 1){
                sundial_base++;
            }
            if (global.city.ptrait.includes('magnetic')){
                sundial_base += planetTraits.magnetic.vars()[0];
            }
            if (global.race['ascended']){
                sundial_base += 2;
            }

            let professors_base = workerScale(global.civic.professor.workers,'professor');
            let prof_impact = global.race['studious'] ? global.civic.professor.impact + traits.studious.vars()[0] : global.civic.professor.impact;
            let fathom = fathomCheck('elven');
            if (fathom > 0){
                prof_impact += traits.studious.vars(1)[0] * fathom;
            }
            professors_base *= prof_impact
            professors_base *= global.race['pompous'] ? (1 - traits.pompous.vars()[0] / 100) : 1;
            professors_base *= racialTrait(workerScale(global.civic.professor.workers,'professor'),'science');
            if (global.tech['anthropology'] && global.tech['anthropology'] >= 3){
                professors_base *= 1 + faithTempleCount() * 0.05;
            }
            if (global.civic.govern.type === 'theocracy'){
                professors_base *= 1 - (govEffect.theocracy()[1] / 100);
            }

            let scientist_base = workerScale(global.civic.scientist.workers,'scientist');
            scientist_base *= global.civic.scientist.impact;
            scientist_base *= racialTrait(workerScale(global.civic.scientist.workers,'scientist'),'science');
            if (global.tech['science'] >= 6 && global.city['wardenclyffe']){
                let professor = workerScale(global.civic.professor.workers,'professor');
                if (global.race['high_pop']){
                    professor = highPopAdjust(professor);
                }
                scientist_base *= 1 + (professor * p_on['wardenclyffe'] * 0.01);
            }
            if (global.space['satellite']){
                scientist_base *= 1 + (global.space.satellite.count * 0.01);
            }
            if (global.civic.govern.type === 'theocracy'){
                scientist_base *= 1 - (govEffect.theocracy()[2] / 100);
            }

            let gene_consume = 0;
            if (global.arpa['sequence'] && global.arpa.sequence.on && global.arpa.sequence.time > 0 && sequenceLabs() > 0){
                let gene_cost = 50 + (global.race.mutation * 10);
                if (global.arpa.sequence.boost){
                    gene_cost *= 4;
                }
                if (gene_cost * $ctx.time_multiplier <= global.resource.Knowledge.amount){
                    gene_consume = gene_cost;
                    S.gene_sequence = true;
                }
                else {
                    S.gene_sequence = false;
                }
            }
            else {
                if (global.arpa.hasOwnProperty('sequence') && global.arpa.sequence.time === null){
                    global.arpa.sequence.time = global.arpa.sequence.max;
                }
                S.gene_sequence = false;
            }

            let womling = global.tauceti.hasOwnProperty('womling_lab') ? global.tauceti.womling_lab.scientist * (global.tech['womling_gene'] ? 10 : 8) : 0;

            let delta = professors_base + scientist_base + womling;
            delta *= $ctx.hunger * $ctx.global_multiplier;
            delta += sundial_base * $ctx.global_multiplier;

            breakdown.p['Knowledge'][jobName('professor')] = professors_base + 'v';
            if (global.race.universe === 'magic'){
                breakdown.p['Knowledge'][jobName('wizard')] = scientist_base + 'v';
            }
            else {
                breakdown.p['Knowledge'][(global.civic?.scientist?.name || jobName('scientist'))] = scientist_base + 'v';
            }
            breakdown.p['Knowledge'][loc('tau_red_womlings')] = womling + 'v';
            breakdown.p['Knowledge'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
            breakdown.p['Knowledge'][global.race['unfathomable'] ? loc('tech_moondial') : loc('tech_sundial')] = sundial_base + 'v';

            if (global.race['inspired']){
                breakdown.p['Knowledge'][loc('event_inspiration_bd')] = '100%';
                delta *= 2;
            }
            if (global.city['library'] || global.race['warlord']){
                let lib_multiplier = 0.05;
                let muckVal = govActive('muckraker',2);
                if (muckVal){
                    lib_multiplier -= (muckVal / 100);
                }
                if (global.race['autoignition']){
                    lib_multiplier -= (traits.autoignition.vars()[0] / 100);
                    if (lib_multiplier < 0){
                        lib_multiplier = 0;
                    }
                }
                let lib_count = global.race['warlord'] ? ((global.race?.absorbed?.length || 1) * 10) : global.city.library.count;
                let library_mult = 1 + (lib_count * lib_multiplier);
                breakdown.p['Knowledge'][global.race['warlord'] ? loc('portal_throne_of_evil_title') : loc('city_library')] = ((library_mult - 1) * 100) + '%';
                delta *= library_mult;
            }
            if ($ctx.astroSign === 'gemini'){
                let astro_mult = 1 + (astroVal('gemini')[0] / 100);
                breakdown.p['Knowledge'][loc(`sign_${$ctx.astroSign}`)] = ((astro_mult - 1) * 100) + '%';
                delta *= astro_mult;
            }
            if (global.tech['isolation'] && support_on['infectious_disease_lab']){
                let lab_mult = 1 + support_on['infectious_disease_lab'] * 0.75;
                breakdown.p['Knowledge'][actions.tauceti.tau_home.infectious_disease_lab.title()] = ((lab_mult - 1) * 100) + '%';
                delta *= lab_mult;
            }
            if (global.civic.govern.type === 'technocracy'){
                breakdown.p['Knowledge'][loc('govern_technocracy')] = govEffect.technocracy()[2] + '%';
                delta *= 1 + (govEffect.technocracy()[2] / 100);
            }

            delta *= $ctx.aetherProdMult;

            if (gene_consume > 0) {
                delta -= gene_consume;
                breakdown.p.consume.Knowledge[loc('genome_bd')] = -(gene_consume);
            }

            modRes('Knowledge', delta * $ctx.time_multiplier);

            if (global.tech['tau_gas2'] && global.tech.tau_gas2 >= 6 && (!global.tech['alien_data'] || global.tech.alien_data < 6) && global.tauceti['alien_space_station'] && p_on['alien_space_station']) {
                let focus = (global.tauceti.alien_space_station.focus / 100) * delta
                breakdown.p.consume.Knowledge[loc('tau_gas2_alien_station')] = -(focus);
                modRes('Knowledge', -(focus) * $ctx.time_multiplier);
                global.tauceti.alien_space_station.decrypted += +(focus).toFixed(3);
                global.stats.know += +(focus).toFixed(0);
                if (global.tauceti.alien_space_station.decrypted >= (global.race['lone_survivor'] ? 1000000 : 250000000) && !global.tech['alien_data']){
                    global.tech['alien_data'] = 1;
                    messageQueue(loc('tau_gas2_alien_station_data1',[loc('tech_dist_womling')]),'success',false,['progress']);
                    drawTech();
                }
                else if (global.tauceti.alien_space_station.decrypted >= (global.race['lone_survivor'] ? 2000000 : 500000000) && global.tech['alien_data'] && global.tech.alien_data === 1){
                    global.tech.alien_data = 2;
                    global.race.tau_food_item = Math.rand(0,10);
                    messageQueue(loc('tau_gas2_alien_station_data2',[loc(`tau_gas2_alien_station_data2_r${global.race.tau_food_item || 0}`)]),'success',false,['progress']);
                    drawTech();
                }
                else if (global.tauceti.alien_space_station.decrypted >= (global.race['lone_survivor'] ? 3000000 : 750000000) && global.tech['alien_data'] && global.tech.alien_data === 2){
                    global.tech.alien_data = 3;
                    messageQueue(loc('tau_gas2_alien_station_data3'),'success',false,['progress']);
                    drawTech();
                }
                else if (global.tauceti.alien_space_station.decrypted >= (global.race['lone_survivor'] ? 4800000 : 1200000000) && global.tech['alien_data'] && global.tech.alien_data === 3){
                    global.tech.alien_data = 4;
                    global.race.tau_junk_item = Math.rand(0,10);
                    messageQueue(loc('tau_gas2_alien_station_data4',[loc(`tau_gas2_alien_station_data4_r${global.race.tau_junk_item || 0}`)]),'success',false,['progress']);
                    drawTech();
                }
                else if (global.tauceti.alien_space_station.decrypted >= (global.race['lone_survivor'] ? 6000000 : 1500000000) && global.tech['alien_data'] && global.tech.alien_data === 4){
                    global.tech.alien_data = 5;
                    messageQueue(loc('tau_gas2_alien_station_data5'),'success',false,['progress']);
                    drawTech();
                }
                else if (global.tauceti.alien_space_station.decrypted >= (global.race['lone_survivor'] ? 10000000 : 2500000000) && global.tech['alien_data'] && global.tech.alien_data === 5){
                    global.tech.alien_data = 6;
                    global.tauceti.alien_space_station.decrypted = 2500000000;
                    if (global.race['lone_survivor']){
                        global.settings.tau.star = true;
                        global.tech['matrix'] = 2;
                        global.tauceti['ringworld'] = { count: 0 };
                        messageQueue(loc('tau_gas2_alien_station_data6_alt'),'success',false,['progress']);
                    }
                    else {
                        messageQueue(loc('tau_gas2_alien_station_data6'),'success',false,['progress']);
                    }
                    drawTech();
                }
            }
        }

        // Omniscience
        if (global.resource.Omniscience.display){
            if (support_on['research_station']){
                let ghost_base = workerScale(global.civic.ghost_trapper.workers,'ghost_trapper');
                ghost_base *= racialTrait(ghost_base,'science');
                ghost_base *= global.race['pompous'] ? (1 - traits.pompous.vars()[0] / 100) : 1;
                let corruptor = 1;
                if (global.race['warlord'] && global.eden['corruptor']){
                    corruptor = 1 + (p_on['corruptor'] || 0) * 0.04;
                }

                let ghost_gain = support_on['research_station'] * ghost_base * 0.0000325 * corruptor;
                breakdown.p['Omniscience'][loc('eden_research_station_title')] = ghost_gain + 'v';
                if (corruptor > 1){
                    breakdown.p['Omniscience'][`ᄂ${loc('eden_corruptor_title')}`] = ((corruptor - 1) * 100) + '%';
                }

                let delta = ghost_gain;
                delta *= $ctx.hunger * $ctx.global_multiplier;

                modRes('Omniscience', delta * $ctx.time_multiplier);
            }

            if (global.tech['science'] && global.tech.science >= 23){
                let scientist = workerScale(global.civic.scientist.workers,'scientist');
                scientist *= racialTrait(scientist,'science');
                scientist *= global.race['pompous'] ? (1 - traits.pompous.vars()[0] / 100) : 1;

                let sci_gain = scientist * 0.000707;
                breakdown.p['Omniscience'][global.civic.scientist.name] = sci_gain + 'v';

                let delta = sci_gain;
                delta *= $ctx.hunger * $ctx.global_multiplier;

                modRes('Omniscience', delta * $ctx.time_multiplier);
            }
        }

        // Factory
        $ctx.FactoryMoney = 0;
}

// Factory per tick: produksi alloy, polymer, nano tube, stanene, dan Furs dari factory.
import { global, breakdown, gal_on, p_on, support_on, quantum_level } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { traits, actions } from '../../core/registries.js';
import { production, teamster, factoryBonus } from '../../resources/prod.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { loc } from '../../core/locale.js';
import { piracy } from '../../space/space_requirements.js';
import { f_rate } from '../../industry/industry.js';
import { luxGoodPrice } from '../../industry/factory_panels.js';

export function fastLoopFactory($ctx){
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
}

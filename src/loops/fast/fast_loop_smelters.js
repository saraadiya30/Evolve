// Smelter per tick: bonus shrine metal, reset penghitung smelter, dan produksi Iron/Steel/Iridium dari smelter dan star forge. Dulu ujung fastLoopCore_s8 dan awal fastLoopCore_s9.
import { global, breakdown, p_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { getShrineBonus } from '../../functions/run_stats_helpers.js';
import { traits, actions } from '../../core/registries.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';
import { biomes } from '../../races/planet_data.js';
import { govActive } from '../../governor/gov_active.js';
import { production } from '../../resources/prod.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { loc } from '../../core/locale.js';
import { smelterUnlocked } from '../../industry/industry_smelter.js';
import { smelterFuelConfig } from '../../industry/smelter_fuel.js';
import { INFERNO_SMELTER_RATE } from '../../config/constants.js';

export function fastLoopSmelters($ctx){
        $ctx.shrineMetal = getShrineBonus('metal');

        // Smelters
        $ctx.iron_smelter = 0;
        $ctx.star_forge = 0;
        $ctx.iridium_smelter = 0;

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
}

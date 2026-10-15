// Pembangkitan listrik per tick: semua sumber masuk buku besar listrik (powerAdd). Megastruktur (ringworld, elysanite sphere, stellar engine), dan seluruh pembangkit.
import { global, breakdown, p_on, support_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { powerModifier } from '../../functions/power_modifiers.js';
import { actions, traits } from '../../core/registries.js';
import { fuel_adjust, int_fuel_adjust } from '../../space/planet_generation.js';
import { convertSpaceSector } from '../../space/space_requirements.js';
import { production } from '../../resources/prod.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { loc } from '../../core/locale.js';
import { powerBegin, powerAdd } from '../../systems/power_core.js';
import { POWER_BONUS_PER_LOT } from '../../stocks/stocks_core.js';

export function fastLoopPowerGeneration($ctx){
        powerBegin($ctx);

        if (global.tauceti['ringworld'] && global.tauceti.ringworld.count >= 1000){
            let output = global.race['lone_survivor'] ? 100 : 10000;
            powerAdd($ctx, loc('tau_star_ringworld'), output);
        }

        if (global.interstellar['elysanite_sphere'] && global.interstellar.elysanite_sphere.count > 0){
            let output = 0;
            if (global.interstellar.elysanite_sphere.count >= 1000){
                output = powerModifier(22500);
            }
            else {
                output = powerModifier(1750 + (global.interstellar.elysanite_sphere.count * 18));
            }
            powerAdd($ctx, loc('interstellar_dyson_sphere_title'), output);
        }
        else if (global.interstellar['orichalcum_sphere'] && global.interstellar.orichalcum_sphere.count > 0){
            let output = 0;
            if (global.interstellar.orichalcum_sphere.count >= 100){
                output = powerModifier(1750);
            }
            else {
                output = powerModifier(750 + (global.interstellar.orichalcum_sphere.count * 8));
            }
            powerAdd($ctx, loc('interstellar_dyson_sphere_title'), output);
        }
        else if (global.interstellar['dyson_sphere'] && global.interstellar.dyson_sphere.count > 0){
            let output = 0;
            if (global.interstellar.dyson_sphere.count >= 100){
                output = powerModifier(750);
            }
            else {
                output = powerModifier(175 + (global.interstellar.dyson_sphere.count * 5));
            }
            powerAdd($ctx, loc('interstellar_dyson_sphere_title'), output);
        }
        else if (global.interstellar['dyson'] && global.interstellar.dyson.count >= 1){
            let output = 0;
            if (global.interstellar.dyson.count >= 100){
                output = powerModifier(175);
            }
            else {
                output = powerModifier(global.interstellar.dyson.count * 1.25);
            }
            powerAdd($ctx, loc('tech_dyson_net'), output);
        }

        if (global.interstellar['stellar_engine'] && global.interstellar.stellar_engine.count >= 100){
            let output = actions.interstellar.int_blackhole.stellar_engine.powered();
            powerAdd($ctx, loc('tech_stellar_engine'), -output);
        }

        [
            {r:'city',s:'coal_power'},{r:'city',s:'oil_power'},{r:'city',s:'fission_power'},{r:'spc_hell',s:'geothermal'},{r:'spc_dwarf',s:'e_reactor'},
            {r:'int_alpha',s:'fusion'},{r:'tau_home',s:'fusion_generator'},{r:'tau_gas2',s:'alien_space_station'}
        ].forEach(function(generator){
            let space = convertSpaceSector(generator.r);
            let region = generator.r === 'city' ? generator.r : space;
            let c_action = generator.r === 'city' ? actions.city : actions[space][generator.r];
            let title = typeof c_action[generator.s].title === 'string' ? c_action[generator.s].title : c_action[generator.s].title();

            if (global[region][generator.s] && global[region][generator.s]['on']){
                let watts = c_action[generator.s].powered();
                p_on[generator.s] = global[region][generator.s].on;

                if (c_action[generator.s].hasOwnProperty('p_fuel')){
                    let s_fuels = c_action[generator.s].p_fuel();
                    if (!Array.isArray(s_fuels)){
                        s_fuels = [s_fuels];
                    }
                    for (let j=0; j<s_fuels.length; j++){
                        let fuel = s_fuels[j];
                        let fuel_cost = fuel.a;
                        if (['Oil','Helium_3'].includes(fuel.r) && region !== 'city'){
                            fuel_cost = region === 'space' ? +fuel_adjust(fuel_cost,true) : +int_fuel_adjust(fuel_cost);
                        }

                        let mb_consume = p_on[generator.s] * fuel_cost;
                        breakdown.p.consume[fuel.r][title] = -(mb_consume);
                        for (let k=0; k<p_on[generator.s]; k++){
                            if (!modRes(fuel.r, -($ctx.time_multiplier * fuel_cost))){
                                mb_consume -= (p_on[generator.s] * fuel_cost) - (k * fuel_cost);
                                p_on[generator.s] = k;
                                break;
                            }
                        }
                    }
                }

                let power = p_on[generator.s] * watts;
                powerAdd($ctx, title, -power);

                if (p_on[generator.s] !== global[region][generator.s].on){
                    $(`#${region}-${generator.s} .on`).addClass('warn');
                    $(`#${region}-${generator.s} .on`).prop('title',`ON ${p_on[generator.s]}/${global[region][generator.s].on}`);
                }
                else {
                    $(`#${region}-${generator.s} .on`).removeClass('warn');
                    $(`#${region}-${generator.s} .on`).prop('title',`ON`);
                }
            }
            else {
                p_on[generator.s] = 0;
                $(`#${region}-${generator.s} .on`).removeClass('warn');
                $(`#${region}-${generator.s} .on`).prop('title',`ON`);
            }
        });

        // Uranium Ash (from coal powerplants)
        if (global.tech['uranium'] && global.tech['uranium'] >= 3 && p_on['coal_power']){
            const fuel = actions.city.coal_power.p_fuel();
            if (fuel.r === 'Coal' && fuel.a > 0){
                let coal = p_on['coal_power'] * fuel.a;
                let ash = coal / 65;
                if (global.city.geology['Uranium']){
                    ash *= global.city.geology['Uranium'] + 1;
                }
                ash *= production('psychic_boost','Uranium');
                modRes('Uranium', ash * $ctx.time_multiplier);
                // Display on the right side of the breakdown to demonstrate that there is no global production scaling
                breakdown.p.consume['Uranium'][loc('city_coal_ash')] = ash;
            }
        }

        if (global.space['hydrogen_plant']){
            let output = actions.space.spc_titan.hydrogen_plant.powered();
            if (global.space.hydrogen_plant.on > global.space.electrolysis.on){
                global.space.hydrogen_plant.on = global.space.electrolysis.on;
            }
            let power = global.space.hydrogen_plant.on * output;
            powerAdd($ctx, loc('space_hydrogen_plant_title'), -power);
        }

        if (global.portal['incinerator']){
            let output = actions.portal.prtl_wasteland.incinerator.powered();
            let power = global.portal.incinerator.on * output;
            powerAdd($ctx, loc('portal_incinerator_title'), -power);
        }

        if (global.portal['inferno_power']){
            let fuels = actions.portal.prtl_ruins.inferno_power.fuel;
            let operating = global.portal.inferno_power.on;

            Object.keys(fuels).forEach(function(fuel){
                let consume = operating * fuels[fuel];
                while (consume * $ctx.time_multiplier > global.resource[fuel].amount + (global.resource[fuel].diff > 0 ? global.resource[fuel].diff * $ctx.time_multiplier : 0) && consume > 0){
                    operating--;
                    consume -= fuels[fuel];
                }
                breakdown.p.consume[fuel][loc('portal_inferno_power_title')] = -(consume);
                modRes(fuel, -(consume * $ctx.time_multiplier));
            });
            let power = operating * actions.portal.prtl_ruins.inferno_power.powered();

            powerAdd($ctx, loc('portal_inferno_power_title'), -power);
        }

        if (global.eden['soul_engine'] && global.tech['asphodel'] && global.tech.asphodel >= 4){
            let power = (support_on['soul_engine'] || 0) * actions.eden.eden_asphodel.soul_engine.powered();
            powerAdd($ctx, loc('eden_soul_engine_title'), -power);
        }

        if (global.space['swarm_satellite'] && global.space['swarm_control']){
            let active = global.space.swarm_satellite.count;
            if (active > global.space.swarm_control.s_max){
                active = global.space.swarm_control.s_max;
            }
            global.space.swarm_control.support = active;
            let solar = 0.35;
            if (global.tech.swarm >= 4){
                solar += 0.15 * (global.tech.swarm - 3);
            }
            if (global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 1){ solar += 0.15; }
            if (global.blood['illuminate']){
                solar += 0.01 * global.blood.illuminate;
            }
            solar = +(solar).toFixed(2);
            let output = powerModifier(active * solar);
            powerAdd($ctx, loc('space_sun_swarm_satellite_title'), output);
        }

        if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.potato){
            let power = powerModifier(global.race.wishStats.potato);
            powerAdd($ctx, loc('wish_potato'), power);
        }

        if (global.city['mill'] && global.tech['agriculture'] && global.tech['agriculture'] >= 6){
            let power = powerModifier(global.city.mill.on * actions.city.mill.powered());
            powerAdd($ctx, loc('city_mill_title2'), -power);
        }

        if (global.city['windmill'] && global.tech['wind_plant']){
            let power = powerModifier(global.city.windmill.count * actions.city.windmill.powered());
            powerAdd($ctx, loc('city_mill_title2'), -power);
        }

        if (global.race['elemental'] && traits.elemental.vars()[0] === 'electric'){
            let power = powerModifier(highPopAdjust((global.resource[global.race.species].amount * traits.elemental.vars()[1]) ** 1.28));
            powerAdd($ctx, loc('trait_elemental_name'), power);
        }

        if (global.prestige.hasOwnProperty('Aether') && global.settings.aetherPower > 0){
            let draw = Math.min(global.settings.aetherPower, global.prestige.Aether.count);
            if (draw > 0){
                global.prestige.Aether.count -= draw;
                let power = draw * 100000000; // 0.00001 Aether = 1000 watts
                powerAdd($ctx, loc('resource_Aether_name'), power);
            }
        }

        // Stock portfolio power bonus: a flat +1 Watt per lot held, recomputed every tick from current holdings, so selling lots
        // takes it away again. It is a source like any other and goes in here, before fastLoopPowerUsage decides which
        // buildings keep running.
        if (global.stocks && global.stocks.market && global.stocks.market.Power && global.stocks.market.Power.lots > 0){
            powerAdd($ctx, loc('stock_bonus_label'), global.stocks.market.Power.lots * POWER_BONUS_PER_LOT);
        }

        if (global.race['powered']){
            let citizens = traits.powered.vars()[0] * global.resource[global.race.species].amount;
            if (global.race['discharge'] && global.race['discharge'] > 0){
                citizens = +(citizens * 1.25).toFixed(3);
            }
            $ctx.power_grid -= citizens;
        }

        if (global.race['replicator']){
            global.city['replicator'] = { count: global.race.replicator.pow, on: global.race.replicator.pow };
        }
}

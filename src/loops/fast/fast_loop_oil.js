// Produksi Oil per tick (oil well, whaling ship, whale, dan lain-lain). Dulu bagian dari fastLoopCore_s12.
import { global, breakdown, p_on, support_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { traits } from '../../core/registries.js';
import { production, teamster } from '../../resources/prod.js';
import { loc } from '../../core/locale.js';
import { syndicate } from '../../truepath/orbit_math.js';

export function fastLoopOil($ctx){
        // Oil
        if (global.resource.Oil.display){
            // Whaling Ship & Whale Processor
            let whale_oil = 0;
            if (global.tauceti['whaling_station'] && global.tauceti['whaling_ship']){
                global.tauceti.whaling_station.max = global.tauceti.whaling_station.count * 750;

                // Refine Oil
                if (global.tauceti.whaling_station.fill > 0){
                    let raw = p_on['whaling_station'] * production('whaling_station');
                    if (raw > global.tauceti.whaling_station.fill){
                        raw = global.tauceti.whaling_station.fill;
                    }
                    global.tauceti.whaling_station.fill -= raw * $ctx.time_multiplier;

                    whale_oil = raw * production('whaling_ship_oil') * production('psychic_boost','Oil');
                }

                let blubber = support_on['whaling_ship'] * production('whaling_ship');
                global.tauceti.whaling_station.fill += blubber * $ctx.time_multiplier;
                if (global.tauceti.whaling_station.fill > global.tauceti.whaling_station.max){
                    global.tauceti.whaling_station.fill = global.tauceti.whaling_station.max;
                }
            }

            let synd = syndicate('spc_gas_moon');
            let fueled_oil_wells = global.race['warlord'] ? global.portal.pumpjack.count : global.city.oil_well.count;
            let fueled_oil_extractor = p_on['oil_extractor'];
            let oil_prod = global.city['oil_well'] ? production('oil_well') : 0;
            let oil_prod_mod = $ctx.q_multiplier;
            let extract_prod = global.space['oil_extractor'] ? production('oil_extractor') : 0;
            let extract_prod_mod = $ctx.qs_multiplier * synd * $ctx.zigVal;
            if (global.race['blubber']){
                let tick = traits.blubber.vars()[0] * $ctx.time_multiplier / 5;
                let check_dead = function(amount){
                    if (amount > 0){
                        if (global.city.oil_well.dead < amount * tick){
                            amount = Math.floor(global.city.oil_well.dead / tick);
                        }
                        global.city.oil_well.dead -= amount * tick;
                        if (global.city.oil_well.dead < tick){
                            global.city.oil_well.dead = 0;
                        }
                    }
                    return amount;
                }
                if(oil_prod * oil_prod_mod >= extract_prod * extract_prod_mod){ /* swap order of extractors and wells based on which produces more */
                    fueled_oil_wells = check_dead(fueled_oil_wells);
                    fueled_oil_extractor = check_dead(fueled_oil_extractor);
                }
                else{
                    fueled_oil_extractor = check_dead(fueled_oil_extractor);
                    fueled_oil_wells = check_dead(fueled_oil_wells);
                }
            }
            let oil_well = oil_prod * fueled_oil_wells;
            let oil_extractor = extract_prod * fueled_oil_extractor;
            oil_extractor *= production('psychic_boost','Oil');
            oil_well *= production('psychic_boost','Oil');

            let delta = (oil_well * oil_prod_mod) + (oil_extractor * extract_prod_mod) + (whale_oil * $ctx.womling_technician);
            delta *= $ctx.hunger * $ctx.global_multiplier;
            if (global.race['gravity_well']){ delta = teamster(delta); }

            if (global.space['oil_extractor']){
                global.space.oil_extractor['lpmod'] = production('oil_extractor') * $ctx.qs_multiplier * synd * $ctx.zigVal;
            }

            breakdown.p['Oil'][global.race['warlord'] ? loc('portal_pumpjack_title') : loc('city_oil_well')] = oil_well + 'v';
            if (oil_well > 0){
                breakdown.p['Oil'][`ᄂ${loc('quarantine')}+0`] = (($ctx.q_multiplier - 1) * 100) + '%';
            }
            breakdown.p['Oil'][loc('space_gas_moon_oil_extractor_title')] = oil_extractor + 'v';
            if (oil_extractor > 0){
                breakdown.p['Oil'][`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                breakdown.p['Oil'][`ᄂ${loc('space_red_ziggurat_title')}`] = (($ctx.zigVal - 1) * 100) + '%';
                breakdown.p['Oil'][`ᄂ${loc('quarantine')}+1`] = (($ctx.qs_multiplier - 1) * 100) + '%';
            }
            breakdown.p['Oil'][loc('tau_roid_whaling_ship')] = whale_oil + 'v';
            if ($ctx.womling_technician > 1){
                breakdown.p['Oil'][`ᄂ${loc('tau_red_womlings')}+0`] = (($ctx.womling_technician - 1) * 100) + '%';
            }
            if (global.race['gravity_well']){
                breakdown.p['Oil'][`${loc('evo_challenge_gravity_well')}+0`] = -((1 - teamster(1)) * 100) + '%';
            }

            breakdown.p['Oil'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
            modRes('Oil', delta * $ctx.time_multiplier);
        }
}

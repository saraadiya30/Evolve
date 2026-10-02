import { global, breakdown, gal_on, p_on, support_on, int_on } from './vars.js';
import { modRes, shrineBonusActive, getShrineBonus } from './functions.js';
import { traits, fathomCheck, racialTrait } from './races.js';
import { govActive } from './governor.js';
import { govEffect, govCivics } from './civics.js';
import { highPopAdjust, production, teamster } from './prod.js';
import { loc } from './locale.js';
import { piracy } from './space.js';
import { actions, structName } from './actions.js';
import { jobScale, workerScale, jobName } from './jobs.js';
import { syndicate, tauEnabled } from './truepath.js';
import { faithTempleCount } from './resources.js';
import { asphodelResist } from './edenic.js';

// Bagian dari fastLoopCore (main.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function fastLoopCore_s12($ctx){
        if (global.resource.Coal.display){
            let coal_base = workerScale(global.race['warlord'] ? global.civic.miner.workers : global.civic.coal_miner.workers,'coal_miner');
            coal_base *= racialTrait(coal_base,'miner');
            if (global.race['tough']){
                coal_base *= 1 + (traits.tough.vars()[0] / 100);
            }
            let ogreFathom = fathomCheck('ogre');
            if (ogreFathom > 0){
                coal_base *= 1 + (traits.tough.vars(1)[0] / 100 * ogreFathom);
            }
            if (global.race['resilient']){
                let bonus = 1 + (traits.resilient.vars()[0] * global.race['resilient'] / 100);
                coal_base *= bonus;
            }
            if (!global.race['living_tool'] && !global.race['tusk']){
                coal_base *= (global.tech['pickaxe'] && global.tech.pickaxe > 0 ? global.tech.pickaxe * 0.12 : 0) + 1;
            }
            if (global.tech['explosives'] && global.tech.explosives >= 2){
                coal_base *= 0.95 + (global.tech.explosives * 0.15);
            }
            if (global.city.geology['Coal']){
                coal_base *= global.city.geology['Coal'] + 1;
            }

            let power_mult = 1;
            let coal_single = 1;
            if (global.city['coal_mine']['on']){
                power_mult += (p_on['coal_mine'] * 0.05);
                coal_single += 0.05;
            }

            let tunneler = 1;
            if (global.race['warlord'] && global.portal['tunneler']){
                tunneler = 1 + (global.portal.tunneler.rank + 3) / 100 * global.portal.tunneler.count;
            }

            coal_base *= global.civic.coal_miner.impact * production('psychic_boost','Coal');
            breakdown.p['Coal'][global.race['warlord'] ? jobName('miner') : jobName('coal_miner')] = coal_base + 'v';
            if (coal_base > 0){
                breakdown.p['Coal'][`ᄂ${loc('power')}`] = ((power_mult - 1) * 100) + '%';
                breakdown.p['Coal'][`ᄂ${loc('portal_tunneler_bd')}`] = ((tunneler - 1) * 100) + '%';
                breakdown.p['Coal'][`ᄂ${loc('quarantine')}+0`] = (($ctx.q_multiplier - 1) * 100) + '%';
            }

            if (global.race['discharge'] && global.race['discharge'] > 0 && p_on['coal_mine'] > 0){
                power_mult = (power_mult - 1) * 0.5 + 1;
                coal_single = (coal_single - 1) * 0.5 + 1;
                breakdown.p['Coal'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
            }

            if (global.race['cataclysm'] && support_on['iridium_mine']){
                coal_base = support_on['iridium_mine'] * production('iridium_mine','coal');
                coal_base *= production('psychic_boost','Coal');
                breakdown.p['Coal'][loc('space_moon_iridium_mine_title')] = coal_base + 'v';
                if (coal_base > 0){
                    breakdown.p['Coal'][`ᄂ${loc('space_red_ziggurat_title')}`] = (($ctx.zigVal - 1) * 100) + '%';
                    breakdown.p['Coal'][`ᄂ${loc('quarantine')}+0`] = (($ctx.q_multiplier - 1) * 100) + '%';
                }
                power_mult = 1 * $ctx.zigVal;
            }

            let delta = coal_base * tunneler * $ctx.hunger * $ctx.q_multiplier * $ctx.global_multiplier;
            global.city.coal_mine['cpow'] = +(delta * (coal_single - 1)).toFixed(5);
            delta *= power_mult;

            breakdown.p['Coal'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';

            if (global.interstellar['mining_droid'] && $ctx.miner_droids['coal'] > 0){
                let driod_base = $ctx.miner_droids['coal'] * 3.75 * production('psychic_boost','Coal');
                let driod_delta = driod_base * $ctx.global_multiplier * $ctx.zigVal;
                breakdown.p['Coal'][loc('interstellar_mining_droid_title')] = driod_base + 'v';
                if (driod_base > 0){
                    breakdown.p['Coal'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = (($ctx.zigVal - 1) * 100) + '%';
                }
                modRes('Coal', driod_delta * $ctx.time_multiplier);
            }

            modRes('Coal', delta * $ctx.time_multiplier);

            // Uranium (from coal miners)
            if (global.resource.Uranium.display){
                let uranium = delta / (global.race['cataclysm'] ? 48 : 115) * production('psychic_boost','Uranium');
                global.city.coal_mine['upow'] = +(global.city.coal_mine['cpow'] / (global.race['cataclysm'] ? 48 : 115)).toFixed(5);
                if (global.city.geology['Uranium']){
                    uranium *= global.city.geology['Uranium'] + 1;
                }
                // Exclude global multiplier to get the base value for display purpose
                breakdown.p['Uranium'][global.race['cataclysm'] ? loc('space_moon_iridium_mine_title') : (global.race['warlord'] ? jobName('miner') : jobName('coal_miner'))] = uranium / $ctx.global_multiplier + 'v';

                let u_delta = uranium * tunneler;
                if (u_delta > 0){
                    breakdown.p['Uranium'][`ᄂ${loc('portal_tunneler_bd')}`] = ((tunneler - 1) * 100) + '%';
                }

                modRes('Uranium', u_delta * $ctx.time_multiplier);
            }
        }

        // Warlord Supplimental Resources
        if (global.race['warlord'] && global.portal['tunneler'] && global.portal.tunneler.count > 0){
            let res_base = workerScale(global.civic.miner.workers,'miner');
            res_base *= racialTrait(res_base,'miner');
            if (global.race['tough']){
                res_base *= 1 + (traits.tough.vars()[0] / 100);
            }
            let ogreFathom = fathomCheck('ogre');
            if (ogreFathom > 0){
                res_base *= 1 + (traits.tough.vars(1)[0] / 100 * ogreFathom);
            }
            if (global.race['resilient']){
                let bonus = 1 + (traits.resilient.vars()[0] * global.race['resilient'] / 100);
                res_base *= bonus;
            }
            if (!global.race['living_tool'] && !global.race['tusk']){
                res_base *= (global.tech['pickaxe'] && global.tech.pickaxe > 0 ? global.tech.pickaxe * 0.12 : 0) + 1;
            }
            if (global.tech['explosives'] && global.tech.explosives >= 2){
                res_base *= 0.95 + (global.tech.explosives * 0.15);
            }

            let tunneler = 1;
            if (global.race['warlord'] && global.portal['tunneler']){
                tunneler = 1 + (global.portal.tunneler.rank + 3) / 100 * global.portal.tunneler.count;
            }

            ['Neutronium','Adamantite','Bolognium','Orichalcum'].forEach(function(res){
                let cur_base = res_base;
                cur_base *= production('psychic_boost',res);
                switch (res){
                    case 'Neutronium':
                        cur_base /= 10;
                        break;
                    case 'Adamantite':
                        cur_base /= 5;
                        break;
                    case 'Bolognium':
                        cur_base /= 8;
                        break;
                    case 'Orichalcum':
                        cur_base /= 6;
                        break;
                }

                breakdown.p[res][jobName('miner')] = cur_base + 'v';
                if (cur_base > 0){
                    breakdown.p[res][`ᄂ${loc('portal_tunneler_bd')}`] = ((tunneler - 1) * 100) + '%';
                    breakdown.p[res][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
                }

                let delta = cur_base * tunneler;
                delta *= $ctx.hunger * $ctx.q_multiplier * $ctx.global_multiplier;

                modRes(res, delta * $ctx.time_multiplier);
            });
        }

        // Space Uranium
        if (global.interstellar['mining_droid'] && $ctx.miner_droids['uran'] > 0){
            let driod_base = $ctx.miner_droids['uran'] * 0.12 * production('psychic_boost','Uranium');
            let driod_delta = driod_base * $ctx.global_multiplier * $ctx.zigVal;
            breakdown.p['Uranium'][loc('interstellar_mining_droid_title')] = driod_base + 'v';
            if (driod_base > 0){
                breakdown.p['Uranium'][`ᄂ${loc('space_red_ziggurat_title')}`] = (($ctx.zigVal - 1) * 100) + '%';
            }
            modRes('Uranium', driod_delta * $ctx.time_multiplier);
        }

        // Kuiper Uranium
        if (global.space['uranium_mine'] && p_on['uranium_mine']){
            let synd = syndicate('spc_kuiper');

            let mine_base = p_on['uranium_mine'] * production('uranium_mine') * production('psychic_boost','Uranium');
            let mine_delta = mine_base * $ctx.global_multiplier * $ctx.qs_multiplier * synd * $ctx.zigVal;
            breakdown.p['Uranium'][loc('space_kuiper_mine',[global.resource.Uranium.name])] = mine_base + 'v';
            if (mine_base > 0){
                breakdown.p['Uranium'][`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                breakdown.p['Uranium'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = (($ctx.zigVal - 1) * 100) + '%';
                breakdown.p['Uranium'][`ᄂ${loc('quarantine')}+0`] = (($ctx.qs_multiplier - 1) * 100) + '%';
            }
            modRes('Uranium', mine_delta * $ctx.time_multiplier);
        }

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

        // Iridium
        let iridium_smelter_mult = 1 + $ctx.iridium_smelter;
        if (support_on['iridium_mine'] || global.race['warlord']){
            let iridium_base = 0;

            if (global.race['warlord']){
                iridium_base = workerScale(global.civic.miner.workers,'miner');
                iridium_base *= racialTrait(iridium_base,'miner');
                iridium_base *= 0.45;
            }
            else {
                iridium_base = support_on['iridium_mine'] * production('iridium_mine','iridium').f;
            }

            let tunneler = 1;
            if (global.race['warlord'] && global.portal['tunneler']){
                tunneler = 1 + (global.portal.tunneler.rank + 3) / 100 * global.portal.tunneler.count;
            }

            iridium_base *= production('psychic_boost','Iridium');
            let synd = syndicate('spc_moon');
            let delta = iridium_base * tunneler * $ctx.hunger * $ctx.shrineMetal.mult * $ctx.global_multiplier * synd * $ctx.qs_multiplier * iridium_smelter_mult * $ctx.zigVal;
            if (global.race['gravity_well']){ delta = teamster(delta); }

            breakdown.p['Iridium'][global.race['warlord'] ? jobName('miner') : loc('space_moon_iridium_mine_title')] = iridium_base + 'v';
            if (iridium_base > 0){
                breakdown.p['Iridium'][`ᄂ${loc('city_smelter')}+0`] = ($ctx.iridium_smelter * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('portal_tunneler_bd')}+0`] = ((tunneler - 1) * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('space_syndicate')}+0`] = -((1 - synd) * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('space_red_ziggurat_title')}+0`] = (($ctx.zigVal - 1) * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('quarantine')}+0`] = (($ctx.qs_multiplier - 1) * 100) + '%';
                if (global.race['gravity_well']){
                    breakdown.p['Iridium'][`ᄂ${loc('evo_challenge_gravity_well')}+0`] = -((1 - teamster(1)) * 100) + '%';
                }
            }
            modRes('Iridium', delta * $ctx.time_multiplier);
        }

        if (support_on['iridium_ship']){
            let iridium_base = support_on['iridium_ship'] * production('iridium_ship');
            iridium_base *= production('psychic_boost','Iridium');
            let synd = syndicate('spc_belt');
            let delta = iridium_base * $ctx.hunger * $ctx.shrineMetal.mult * $ctx.global_multiplier * synd * $ctx.qs_multiplier * iridium_smelter_mult * $ctx.zigVal;
            if (global.race['gravity_well']){ delta = teamster(delta); }

            breakdown.p['Iridium'][jobName('space_miner')] = iridium_base + 'v';
            if (iridium_base > 0){
                breakdown.p['Iridium'][`ᄂ${loc('city_smelter')}+1`] = ($ctx.iridium_smelter * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('space_syndicate')}+1`] = -((1 - synd) * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = (($ctx.zigVal - 1) * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('quarantine')}+1`] = (($ctx.qs_multiplier - 1) * 100) + '%';
                if (global.race['gravity_well']){
                    breakdown.p['Iridium'][`ᄂ${loc('evo_challenge_gravity_well')}+1`] = -((1 - teamster(1)) * 100) + '%';
                }
            }
            modRes('Iridium', delta * $ctx.time_multiplier);
        }

        if (p_on['s_gate'] && global.resource.Adamantite.display && global.galaxy['armed_miner'] && gal_on['armed_miner'] > 0){
            let base = gal_on['armed_miner'] * 0.65 * production('psychic_boost','Iridium');
            let foothold = 1 + ((gal_on['ore_processor'] ?? 0) * 0.1);
            let pirate = piracy('gxy_alien2');
            let delta = base * $ctx.global_multiplier * pirate * foothold * $ctx.hunger * $ctx.shrineMetal.mult * iridium_smelter_mult * $ctx.zigVal;
            if (global.race['gravity_well']){ delta = teamster(delta); }

            breakdown.p['Iridium'][loc('galaxy_armed_miner_bd')] = base + 'v';
            if (base > 0){
                breakdown.p['Iridium'][`ᄂ${loc('galaxy_ore_processor')}`] = -((1 - foothold) * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('city_smelter')}+2`] = ($ctx.iridium_smelter * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('galaxy_piracy')}`] = -((1 - pirate) * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('space_red_ziggurat_title')}+2`] = (($ctx.zigVal - 1) * 100) + '%';
                if (global.race['gravity_well']){
                    breakdown.p['Iridium'][`ᄂ${loc('evo_challenge_gravity_well')}+2`] = -((1 - teamster(1)) * 100) + '%';
                }
            }
            modRes('Iridium', delta * $ctx.time_multiplier);
        }

        // Iridium Extractor Ship
        if (global.resource.Iridium.display && $ctx.e_ship['iridium'] && $ctx.e_ship.iridium > 0){
            let iridium_delta = $ctx.e_ship.iridium * $ctx.shrineMetal.mult * $ctx.global_multiplier * iridium_smelter_mult * $ctx.hunger * $ctx.womling_technician;
            if (global.race['gravity_well']){
                iridium_delta = teamster(iridium_delta);
            }
            breakdown.p['Iridium'][loc('tau_roid_mining_ship')] = $ctx.e_ship.iridium + 'v';
            breakdown.p['Iridium'][`ᄂ${loc('city_smelter')}+3`] = ($ctx.iridium_smelter * 100) + '%';
            if ($ctx.womling_technician > 1){
                breakdown.p['Iridium'][`ᄂ${loc('tau_red_womlings')}+0`] = (($ctx.womling_technician - 1) * 100) + '%';
            }
            if (global.race['gravity_well']){
                breakdown.p['Iridium'][`ᄂ${loc('evo_challenge_gravity_well')}+3`] = -((1 - teamster(1)) * 100) + '%';
            }
            modRes('Iridium', iridium_delta * $ctx.time_multiplier);
        }

        // Helium 3
        if ((global.space['moon_base'] && support_on['helium_mine']) || global.race['warlord']){
            let helium_base = (global.race['warlord'] ? global.portal.pumpjack.count : support_on['helium_mine']) * production('helium_mine').f;
            helium_base *= production('psychic_boost','Helium_3');
            let synd = syndicate('spc_moon');
            let delta = helium_base * $ctx.hunger * $ctx.global_multiplier * synd * $ctx.qs_multiplier * $ctx.zigVal;
            if (global.race['gravity_well']){ delta = teamster(delta); }

            breakdown.p['Helium_3'][global.race['warlord'] ? loc('portal_pumpjack_title') : loc('space_moon_helium_mine_title')] = helium_base + 'v';
            if (helium_base > 0){
                breakdown.p['Helium_3'][`ᄂ${loc('space_syndicate')}+0`] = -((1 - synd) * 100) + '%';
                breakdown.p['Helium_3'][`ᄂ${loc('space_red_ziggurat_title')}`] = (($ctx.zigVal - 1) * 100) + '%';
                breakdown.p['Helium_3'][`ᄂ${loc('quarantine')}+0`] = (($ctx.qs_multiplier - 1) * 100) + '%';
                if (global.race['gravity_well']){
                    breakdown.p['Helium_3'][`ᄂ${loc('evo_challenge_gravity_well')}+0`] = -((1 - teamster(1)) * 100) + '%';
                }
            }
            modRes('Helium_3', delta * $ctx.time_multiplier);
        }

        if (global.space['gas_mining'] && p_on['gas_mining']){
            let gas_mining = p_on['gas_mining'] * production('gas_mining');
            gas_mining *= production('psychic_boost','Helium_3');
            let synd = syndicate('spc_gas');
            let delta = gas_mining * $ctx.hunger * $ctx.global_multiplier * synd * $ctx.qs_multiplier * $ctx.zigVal;
            if (global.race['gravity_well']){ delta = teamster(delta); }

            breakdown.p['Helium_3'][loc('space_gas_mining_title')] = gas_mining + 'v';
            if (gas_mining > 0){
                breakdown.p['Helium_3'][`ᄂ${loc('space_syndicate')}+1`] = -((1 - synd) * 100) + '%';
                breakdown.p['Helium_3'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = (($ctx.zigVal - 1) * 100) + '%';
                breakdown.p['Helium_3'][`ᄂ${loc('quarantine')}+1`] = (($ctx.qs_multiplier - 1) * 100) + '%';
                if (global.race['gravity_well']){
                    breakdown.p['Helium_3'][`ᄂ${loc('evo_challenge_gravity_well')}+1`] = -((1 - teamster(1)) * 100) + '%';
                }
            }
            modRes('Helium_3', delta * $ctx.time_multiplier);
        }

        if (p_on['refueling_station']){
            let gas_mining = (p_on['refueling_station'] * production('refueling_station'));
            gas_mining *= production('psychic_boost','Helium_3');
            let delta = gas_mining * $ctx.hunger * $ctx.global_multiplier * $ctx.womling_technician;

            breakdown.p['Helium_3'][loc('tau_gas_refueling_station_title')] = gas_mining + 'v';
            if ($ctx.womling_technician > 1){
                breakdown.p['Helium_3'][`ᄂ${loc('tau_red_womlings')}+0`] = (($ctx.womling_technician - 1) * 100) + '%';
            }
            modRes('Helium_3', delta * $ctx.time_multiplier);
        }

        if (global.interstellar['harvester'] && int_on['harvester']){
            let gas_mining = int_on['harvester'] * production('harvester','helium');
            gas_mining *= production('psychic_boost','Helium_3');
            let delta = gas_mining * $ctx.hunger * $ctx.global_multiplier * $ctx.zigVal;

            breakdown.p['Helium_3'][loc('interstellar_harvester_title')] = gas_mining + 'v';
            if (gas_mining > 0){
                breakdown.p['Helium_3'][`ᄂ${loc('space_red_ziggurat_title')}+2`] = (($ctx.zigVal - 1) * 100) + '%';
                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.5;
                    breakdown.p['Helium_3'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }
            }

            modRes('Helium_3', delta * $ctx.time_multiplier);

            if (global.tech['ram_scoop']){
                let deut_mining = int_on['harvester'] * production('harvester','deuterium');
                deut_mining *= production('psychic_boost','Deuterium');
                let deut_delta = deut_mining * $ctx.hunger * $ctx.global_multiplier * $ctx.zigVal;

                breakdown.p['Deuterium'][loc('interstellar_harvester_title')] = deut_mining + 'v';
                if (deut_mining > 0){
                    breakdown.p['Deuterium'][`ᄂ${loc('space_red_ziggurat_title')}`] = (($ctx.zigVal - 1) * 100) + '%';
                }
                modRes('Deuterium', deut_delta * $ctx.time_multiplier);

            }
        }

        if (p_on['s_gate'] && global.galaxy['raider'] && gal_on['raider'] > 0){
            let base = gal_on['raider'] * 0.65 * production('psychic_boost','Deuterium');
            let pirate = piracy('gxy_chthonian');
            let delta = base * $ctx.global_multiplier * pirate * $ctx.hunger * $ctx.zigVal;

            breakdown.p['Deuterium'][loc('galaxy_raider')] = base + 'v';
            if (base > 0){
                breakdown.p['Deuterium'][`ᄂ${loc('galaxy_piracy')}`] = -((1 - pirate) * 100) + '%';
                breakdown.p['Deuterium'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = (($ctx.zigVal - 1) * 100) + '%';
            }
            modRes('Deuterium', delta * $ctx.time_multiplier);
        }

        breakdown.p['Helium_3'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
        breakdown.p['Deuterium'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';

        // Neutronium
        if (p_on['outpost']){
            let p_values = production('outpost');
            let psy = production('psychic_boost','Neutronium');

            breakdown.p['Neutronium'][loc('space_gas_moon_outpost_bd')] = (p_values.b * psy * p_on['outpost']) + 'v';
            if (global.tech['drone']){
                breakdown.p['Neutronium'][`ᄂ${loc('tech_worker_drone')}`] = (p_values.d * 100) + '%';
            }
            let synd = syndicate('spc_gas_moon');

            let delta = p_on['outpost'] * p_values.n * psy * $ctx.hunger * $ctx.global_multiplier * $ctx.qs_multiplier * synd * $ctx.zigVal;
            global.space.outpost['lpmod'] = p_values.n * psy * $ctx.hunger * $ctx.global_multiplier * $ctx.qs_multiplier * synd * $ctx.zigVal;
            if (global.race['gravity_well']){ delta = teamster(delta); }
            if (p_values.b > 0){
                breakdown.p['Neutronium'][`ᄂ${loc('space_syndicate')}+0`] = -((1 - synd) * 100) + '%';
                breakdown.p['Neutronium'][`ᄂ${loc('space_red_ziggurat_title')}+0`] = (($ctx.zigVal - 1) * 100) + '%';
                breakdown.p['Neutronium'][`ᄂ${loc('quarantine')}+0`] = (($ctx.qs_multiplier - 1) * 100) + '%';
                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.5;
                    global.space.outpost['lpmod'] *= 0.5;
                    breakdown.p['Neutronium'][`ᄂ${loc('evo_challenge_discharge')}+0`] = '-50%';
                }
                if (global.race['gravity_well']){
                    breakdown.p['Neutronium'][`ᄂ${loc('evo_challenge_gravity_well')}+0`] = -((1 - teamster(1)) * 100) + '%';
                }
            }

            modRes('Neutronium', delta * $ctx.time_multiplier);
        }

        if (p_on['neutron_miner']){
            let n_base = p_on['neutron_miner'] * production('neutron_miner') * production('psychic_boost','Neutronium');
            let delta = n_base * $ctx.hunger * $ctx.global_multiplier * $ctx.zigVal;
            breakdown.p['Neutronium'][loc('interstellar_neutron_miner_bd')] = n_base + 'v';
            global.interstellar.neutron_miner['lpmod'] = production('neutron_miner') * $ctx.hunger * $ctx.global_multiplier * $ctx.zigVal;

            if (n_base > 0){
                breakdown.p['Neutronium'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = (($ctx.zigVal - 1) * 100) + '%';
                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.5;
                    global.interstellar.neutron_miner['lpmod'] *= 0.5;
                    breakdown.p['Neutronium'][`ᄂ${loc('evo_challenge_discharge')}+1`] = '-50%';
                }
            }

            modRes('Neutronium', delta * $ctx.time_multiplier);
        }

        if (p_on['s_gate'] && global.galaxy['raider'] && gal_on['raider'] > 0){
            let base = gal_on['raider'] * 0.8 * production('psychic_boost','Neutronium');
            let pirate = piracy('gxy_chthonian');
            let delta = base * $ctx.global_multiplier * pirate * $ctx.hunger * $ctx.zigVal;

            breakdown.p['Neutronium'][loc('galaxy_raider')] = base + 'v';
            if (base > 0){
                breakdown.p['Neutronium'][`ᄂ${loc('galaxy_piracy')}`] = -((1 - pirate) * 100) + '%';
                breakdown.p['Neutronium'][`ᄂ${loc('space_red_ziggurat_title')}+2`] = (($ctx.zigVal - 1) * 100) + '%';
            }
            modRes('Neutronium', delta * $ctx.time_multiplier);
        }

        // Kuiper Neutronium
        if (global.space['neutronium_mine'] && p_on['neutronium_mine']){
            let synd = syndicate('spc_kuiper');

            let mine_base = p_on['neutronium_mine'] * production('neutronium_mine') * production('psychic_boost','Neutronium');
            let mine_delta = mine_base * $ctx.global_multiplier * $ctx.qs_multiplier * synd * $ctx.zigVal;
            breakdown.p['Neutronium'][loc('space_kuiper_mine',[global.resource.Neutronium.name])] = mine_base + 'v';
            if (mine_base > 0){
                breakdown.p['Neutronium'][`ᄂ${loc('space_syndicate')}+1`] = -((1 - synd) * 100) + '%';
                breakdown.p['Neutronium'][`ᄂ${loc('space_red_ziggurat_title')}+3`] = (($ctx.zigVal - 1) * 100) + '%';
                breakdown.p['Neutronium'][`ᄂ${loc('quarantine')}+1`] = (($ctx.qs_multiplier - 1) * 100) + '%';
            }
            modRes('Neutronium', mine_delta * $ctx.time_multiplier);
        }

        // Neutronium Extractor Ship
        if (global.resource.Neutronium.display && $ctx.e_ship['neutronium'] && $ctx.e_ship.neutronium > 0){
            let neutronium_delta = $ctx.e_ship.neutronium * $ctx.global_multiplier * $ctx.womling_technician;
            breakdown.p['Neutronium'][loc('tau_roid_mining_ship')] = $ctx.e_ship.neutronium + 'v';
            if ($ctx.womling_technician > 1){
                breakdown.p['Neutronium'][`ᄂ${loc('tau_red_womlings')}+0`] = (($ctx.womling_technician - 1) * 100) + '%';
            }
            modRes('Neutronium', neutronium_delta * $ctx.time_multiplier);
        }

        // Elerium
        if (support_on['elerium_ship']){
            let elerium_base = support_on['elerium_ship'] * production('elerium_ship') * production('psychic_boost','Elerium');
            let synd = syndicate('spc_belt');
            let delta = elerium_base * $ctx.hunger * $ctx.global_multiplier * $ctx.qs_multiplier * synd * $ctx.zigVal;
            if (global.race['gravity_well']){ delta = teamster(delta); }
            breakdown.p['Elerium'][jobName('space_miner')] = elerium_base + 'v';

            if (elerium_base > 0){
                breakdown.p['Elerium'][`ᄂ${loc('space_syndicate')}+0`] = -((1 - synd) * 100) + '%';
                breakdown.p['Elerium'][`ᄂ${loc('space_red_ziggurat_title')}+0`] = (($ctx.zigVal - 1) * 100) + '%';
                breakdown.p['Elerium'][`ᄂ${loc('quarantine')}+0`] = (($ctx.qs_multiplier - 1) * 100) + '%';
                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.75;
                    breakdown.p['Elerium'][`ᄂ${loc('evo_challenge_discharge')}`] = '-25%';
                }
                if (global.race['gravity_well']){
                    breakdown.p['Elerium'][`ᄂ${loc('evo_challenge_gravity_well')}+1`] = -((1 - teamster(1)) * 100) + '%';
                }
            }

            modRes('Elerium', delta * $ctx.time_multiplier);
        }
}

export function fastLoopCore_s13($ctx){
        if (int_on['elerium_prospector']){
            let elerium_base = int_on['elerium_prospector'] * production('elerium_prospector') * production('psychic_boost','Elerium');
            let delta = elerium_base * $ctx.hunger * $ctx.global_multiplier * $ctx.zigVal;
            breakdown.p['Elerium'][loc('interstellar_elerium_prospector_bd')] = elerium_base + 'v';
            if (elerium_base > 0){
                breakdown.p['Elerium'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = (($ctx.zigVal - 1) * 100) + '%';
            }
            modRes('Elerium', delta * $ctx.time_multiplier);
        }

        // Kuiper Elerium
        if (global.space['elerium_mine'] && p_on['elerium_mine']){
            let synd = syndicate('spc_kuiper');

            let mine_base = p_on['elerium_mine'] * production('elerium_mine') * production('psychic_boost','Elerium');
            let mine_delta = mine_base * $ctx.global_multiplier * $ctx.qs_multiplier * synd * $ctx.hunger * $ctx.zigVal;
            breakdown.p['Elerium'][loc('space_kuiper_mine',[global.resource.Elerium.name])] = mine_base + 'v';
            if (mine_base > 0){
                breakdown.p['Elerium'][`ᄂ${loc('space_syndicate')}+1`] = -((1 - synd) * 100) + '%';
                breakdown.p['Elerium'][`ᄂ${loc('space_red_ziggurat_title')}+2`] = (($ctx.zigVal - 1) * 100) + '%';
                breakdown.p['Elerium'][`ᄂ${loc('quarantine')}+1`] = (($ctx.qs_multiplier - 1) * 100) + '%';
            }
            modRes('Elerium', mine_delta * $ctx.time_multiplier);
        }

        // Elerium Extractor Ship
        if (global.resource.Elerium.display && $ctx.e_ship['elerium'] && $ctx.e_ship.elerium > 0){
            let elerium_delta = $ctx.e_ship.elerium * $ctx.global_multiplier * $ctx.womling_technician;
            breakdown.p['Elerium'][loc('tau_roid_mining_ship')] = $ctx.e_ship.elerium + 'v';
            if ($ctx.womling_technician > 1){
                breakdown.p['Elerium'][`ᄂ${loc('tau_red_womlings')}+0`] = (($ctx.womling_technician - 1) * 100) + '%';
            }
            modRes('Elerium', elerium_delta * $ctx.time_multiplier);
        }

        breakdown.p['Elerium'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';

        // Adamantite
        if (global.resource.Adamantite.display && global.interstellar['mining_droid'] && $ctx.miner_droids['adam'] > 0){
            let driod_base = $ctx.miner_droids['adam'] * 0.075 * production('psychic_boost','Adamantite');
            let driod_delta = driod_base * $ctx.shrineMetal.mult * $ctx.global_multiplier * $ctx.zigVal;
            breakdown.p['Adamantite'][loc('interstellar_mining_droid_title')] = driod_base + 'v';
            if (driod_base > 0){
                if (global.interstellar['processing'] && int_on['processing']){
                    let rate = 0.12;
                    if (global.tech['ai_core'] && global.tech['ai_core'] >= 2 && p_on['citadel'] > 0){
                        rate += (p_on['citadel'] * 0.02);
                    }
                    let bonus = int_on['processing'] * rate;
                    breakdown.p['Adamantite'][`ᄂ${loc('interstellar_processing_title')}`] = (bonus * 100) + '%';

                    if (global.race['discharge'] && global.race['discharge'] > 0){
                        bonus *= 0.5;
                        breakdown.p['Adamantite'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                    }
                    driod_delta *= 1 + bonus;
                }
                breakdown.p['Adamantite'][`ᄂ${loc('space_red_ziggurat_title')}`] = (($ctx.zigVal - 1) * 100) + '%';
            }
            modRes('Adamantite', driod_delta * $ctx.time_multiplier);
        }

        if (p_on['s_gate'] && global.resource.Adamantite.display && global.galaxy['armed_miner'] && gal_on['armed_miner'] > 0){
            let base = gal_on['armed_miner'] * 0.23 * production('psychic_boost','Adamantite');
            let foothold = 1 + ((gal_on['ore_processor'] ?? 0) * 0.1);
            let pirate = piracy('gxy_alien2');
            let delta = base * $ctx.global_multiplier * pirate * foothold * $ctx.shrineMetal.mult * $ctx.zigVal;

            breakdown.p['Adamantite'][loc('galaxy_armed_miner_bd')] = base + 'v';
            if (base > 0){
                breakdown.p['Adamantite'][`ᄂ${loc('galaxy_ore_processor')}`] = -((1 - foothold) * 100) + '%';
                breakdown.p['Adamantite'][`ᄂ${loc('galaxy_piracy')}`] = -((1 - pirate) * 100) + '%';
                breakdown.p['Adamantite'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = (($ctx.zigVal - 1) * 100) + '%';
            }
            modRes('Adamantite', delta * $ctx.time_multiplier);
        }

        if (global.resource.Adamantite.display && global.space['titan_mine']){
            let synd = syndicate('spc_titan');
            let titan_colonists = p_on['ai_colonist'] ? workerScale(global.civic.titan_colonist.workers,'titan_colonist') + jobScale(p_on['ai_colonist']) : workerScale(global.civic.titan_colonist.workers,'titan_colonist');
            let adam_base = production('titan_mine','adamantite') * support_on['titan_mine'] * titan_colonists * production('psychic_boost','Adamantite');
            let adam_delta = adam_base * $ctx.shrineMetal.mult * $ctx.global_multiplier * $ctx.qs_multiplier * synd * $ctx.zigVal;
            breakdown.p['Adamantite'][loc('city_mine')] = adam_base + 'v';
            if (adam_base > 0){
                breakdown.p['Adamantite'][`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                breakdown.p['Adamantite'][`ᄂ${loc('space_red_ziggurat_title')}+2`] = (($ctx.zigVal - 1) * 100) + '%';
                breakdown.p['Adamantite'][`ᄂ${loc('quarantine')}+0`] = (($ctx.qs_multiplier - 1) * 100) + '%';
            }
            modRes('Adamantite', adam_delta * $ctx.time_multiplier);
        }

        // Infernite
        if (global.resource.Infernite.display){

            let workers = global.race['warlord'] ? (global.tech?.hellspawn >= 2 && global.portal?.tunneler?.count >= 1 ? global.civic.miner.workers : 0) : global.civic.hell_surveyor.workers;
            if (workers > 0){
                let rate = global.tech.infernite >= 3 ? 0.015 : 0.01;
                if (global.race['warlord']){ rate = 0.0075; }
                let surveyor_base = workerScale(highPopAdjust(workers),'hell_surveyor') * rate * production('psychic_boost','Infernite');

                let sensors = 1;
                if (global.tech['infernite'] >= 2 && p_on['sensor_drone']){
                    let drone_rate = global.tech.infernite >= 4 ? (global.tech.infernite >= 6 ? 0.5 : 0.2) : 0.1;
                    sensors = 1 + (p_on['sensor_drone'] * drone_rate);
                }

                let runner = govActive('runner',1);
                let runBonus = 1;
                if(runner){
                    runBonus = 1 + (runner / 100);
                }

                let tunneler = 1;
                if (global.race['warlord'] && global.portal['tunneler']){
                    tunneler = 1 + (global.portal.tunneler.rank + 3) / 100 * global.portal.tunneler.count;
                }

                let surveyor_delta = surveyor_base * tunneler * sensors * runBonus * $ctx.global_multiplier;

                breakdown.p['Infernite'][global.race['warlord'] ? jobName('miner') : jobName('hell_surveyor')] = surveyor_base + 'v';
                breakdown.p['Infernite'][`ᄂ${loc('portal_sensor_drone_title')}`] = ((sensors - 1) * 100) + '%';
                breakdown.p['Infernite'][`ᄂ${loc('portal_tunneler_bd')}`] = ((tunneler - 1) * 100) + '%';
                modRes('Infernite', surveyor_delta * $ctx.time_multiplier);
            }

            if (p_on['infernite_mine']){
                let rate = production('infernite_mine');
                let mine_base = p_on['infernite_mine'] * rate * production('psychic_boost','Infernite');

                let mine_delta = mine_base * $ctx.global_multiplier;
                global.portal.infernite_mine['lpmod'] = rate * $ctx.global_multiplier;

                breakdown.p['Infernite'][loc('city_mine')] = mine_base + 'v';
                modRes('Infernite', mine_delta * $ctx.time_multiplier);
            }
        }

        // Bolognium
        if (p_on['s_gate'] && global.resource.Bolognium.display && global.galaxy['bolognium_ship'] && gal_on['bolognium_ship'] > 0){
            let base = gal_on['bolognium_ship'] * production('bolognium_ship') * production('psychic_boost','Bolognium');
            let pirate = piracy('gxy_gateway');
            let delta = base * $ctx.global_multiplier * pirate * $ctx.zigVal;

            breakdown.p['Bolognium'][loc('galaxy_bolognium_ship')] = base + 'v';
            if (base > 0){
                breakdown.p['Bolognium'][`ᄂ${loc('galaxy_piracy')}+0`] = -((1 - pirate) * 100) + '%';
                breakdown.p['Bolognium'][`ᄂ${loc('space_red_ziggurat_title')}`] = (($ctx.zigVal - 1) * 100) + '%';
                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.5;
                    breakdown.p['Bolognium'][`ᄂ${loc('evo_challenge_discharge')}+0`] = '-50%';
                }
            }

            modRes('Bolognium', delta * $ctx.time_multiplier);
        }

        if (global.eden['asphodel_harvester'] && support_on['asphodel_harvester']){
            let powder_base = support_on['asphodel_harvester'] * production('asphodel_harvester','powder');
            powder_base *= production('psychic_boost','Asphodel_Powder');
            let delta = powder_base * $ctx.hunger * $ctx.global_multiplier;
            
            breakdown.p['Asphodel_Powder'][loc('eden_asphodel_harvester_title')] = powder_base + 'v';

            if (global.tech.asphodel >= 5){
                let penalty = asphodelResist();
                delta *= penalty;
                if (penalty <= 1){
                    breakdown.p['Asphodel_Powder'][`ᄂ${loc('eden_asphodel_hostility')}+0`] = -((1 - penalty) * 100) + '%';
                }
                else {
                    breakdown.p['Asphodel_Powder'][`ᄂ${loc('eden_mech_station_overkill')}+0`] = ((penalty - 1) * 100) + '%';
                }
            }

            modRes('Asphodel_Powder', delta * $ctx.time_multiplier);
        }

        // Elysanite
        if (global.resource.Elysanite.display){
            if (global.civic.elysium_miner.display){
                let miner_base = workerScale(global.civic.elysium_miner.workers,'elysium_miner');
                miner_base *= racialTrait(miner_base,'miner') * 0.36;

                if (!global.race['living_tool'] && !global.race['tusk']){
                    miner_base *= (global.tech['pickaxe'] && global.tech.pickaxe > 0 ? global.tech.pickaxe * 0.15 : 0) + 1;
                }
                if (global.tech['explosives'] && global.tech.explosives >= 2){
                    miner_base *= 0.95 + (global.tech.explosives * 0.15);
                }
                if (global.race['tough']){
                    miner_base *= 1 + (traits.tough.vars()[0] / 100);
                }
                let ogreFathom = fathomCheck('ogre');
                if (ogreFathom > 0){
                    miner_base *= 1 + (traits.tough.vars(1)[0] / 100 * ogreFathom);
                }
                miner_base *= production('psychic_boost','Elysanite');

                breakdown.p['Elysanite'][jobName('elysium_miner')] = miner_base + 'v';

                let delta = miner_base;
                delta *= $ctx.hunger * $ctx.global_multiplier;

                modRes('Elysanite', delta * $ctx.time_multiplier);
            }
        }

        // Pit Miner
        if (global.civic.pit_miner.display){
            if (tauEnabled()){
                let miner_base = workerScale(global.civic.pit_miner.workers,'pit_miner');
                miner_base *= racialTrait(miner_base,'miner');
                let colony_val = 1 + ((support_on['colony'] || 0) * 0.5);

                { // Bolognium
                    let bol_base = miner_base * production('psychic_boost','Bolognium');
                    bol_base *= production('mining_pit','bolognium');
                    let delta = bol_base * $ctx.global_multiplier * colony_val;

                    breakdown.p['Bolognium'][jobName('pit_miner')] = bol_base + 'v';
                    if (bol_base > 0){
                        breakdown.p['Bolognium'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                    }

                    modRes('Bolognium', delta * $ctx.time_multiplier);
                }

                { // Stone
                    let stone_base = miner_base * production('psychic_boost','Stone');
                    stone_base *= production('mining_pit','stone');
                    let delta = stone_base * $ctx.global_multiplier * colony_val;

                    breakdown.p['Stone'][jobName('pit_miner')] = stone_base + 'v';
                    if (stone_base > 0){
                        breakdown.p['Stone'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                    }

                    modRes('Stone', delta * $ctx.time_multiplier);
                }

                if (global.race['smoldering']){ // Chrysotile
                    let cry_base = miner_base * production('psychic_boost','Chrysotile');
                    cry_base *= production('mining_pit','chrysotile');
                    let delta = cry_base * $ctx.global_multiplier * colony_val * $ctx.hunger;

                    breakdown.p['Chrysotile'][jobName('pit_miner')] = cry_base + 'v';
                    if (cry_base > 0){
                        breakdown.p['Chrysotile'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                        breakdown.p['Chrysotile'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
                    }
                    modRes('Chrysotile', delta * $ctx.time_multiplier);
                }

                { // Adamantite
                    let adam_base = miner_base * production('psychic_boost','Adamantite');
                    adam_base *= production('mining_pit','adamantite');
                    let delta = adam_base * $ctx.shrineMetal.mult * $ctx.global_multiplier * colony_val;

                    breakdown.p['Adamantite'][jobName('pit_miner')] = adam_base + 'v';
                    if (adam_base > 0){
                        breakdown.p['Adamantite'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                    }

                    modRes('Adamantite', delta * $ctx.time_multiplier);
                }

                if (global.tech['isolation']){
                    { // Copper
                        let copper_base = miner_base * production('psychic_boost','Copper');
                        copper_base *= production('mining_pit','copper');
                        let delta = copper_base * $ctx.shrineMetal.mult * $ctx.global_multiplier * colony_val;

                        breakdown.p['Copper'][jobName('pit_miner')] = copper_base + 'v';
                        if (copper_base > 0){
                            breakdown.p['Copper'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                        }

                        modRes('Copper', delta * $ctx.time_multiplier);
                    }

                    { // Coal
                        let coal_base = miner_base * production('psychic_boost','Coal');
                        coal_base *= production('mining_pit','coal');
                        let delta = coal_base * $ctx.global_multiplier * colony_val;

                        breakdown.p['Coal'][jobName('pit_miner')] = coal_base + 'v';
                        if (coal_base > 0){
                            breakdown.p['Coal'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                        }

                        modRes('Coal', delta * $ctx.time_multiplier);
                    }

                    if (global.race['lone_survivor']){ // Aluminium
                        let alum_base = miner_base * production('psychic_boost','Aluminium');
                        alum_base *= production('mining_pit','aluminium');
                        let delta = alum_base * $ctx.shrineMetal.mult * $ctx.global_multiplier * colony_val;

                        breakdown.p['Aluminium'][jobName('pit_miner')] = alum_base + 'v';
                        if (alum_base > 0){
                            breakdown.p['Aluminium'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                        }

                        modRes('Aluminium', delta * $ctx.time_multiplier);
                    }
                }
            }
            else {
                let materials_bd = {};
                let miner_base = workerScale(global.civic.pit_miner.workers,'pit_miner');
                miner_base *= racialTrait(miner_base,'miner');
                miner_base *= production('mining_pit','materials');

                let colony_val = 1 + ((support_on['colony'] || 0) * 0.5);
                let delta = miner_base * $ctx.global_multiplier * colony_val;

                materials_bd[jobName('pit_miner')] = miner_base + 'v';
                if (miner_base > 0){
                    materials_bd[`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                }

                breakdown.p['Materials'] = materials_bd;
                modRes('Materials', delta * $ctx.time_multiplier);
            }
        }

        if (global.tauceti['tau_farm'] && p_on['tau_farm']){
            let colony_val = 1 + ((support_on['colony'] || 0) * 0.5);

            if (!global.race['kindling_kindred'] && !global.race['smoldering']){
                let lumber_base = production('tau_farm','lumber') * p_on['tau_farm'] * production('psychic_boost','Lumber');
                let delta = lumber_base * $ctx.global_multiplier * colony_val;

                breakdown.p['Lumber'][loc('tau_home_tau_farm')] = lumber_base + 'v';
                if (lumber_base > 0){
                    breakdown.p['Lumber'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                }

                modRes('Lumber', delta * $ctx.time_multiplier);
            }
        }

        if (shrineBonusActive()){
            breakdown.p['Adamantite'][loc('city_shrine')] = (($ctx.shrineMetal.mult - 1) * 100).toFixed(1) + '%';
        }

        if (p_on['s_gate'] && global.resource.Bolognium.display && global.galaxy['armed_miner'] && gal_on['armed_miner'] > 0){
            let base = gal_on['armed_miner'] * 0.032 * production('psychic_boost','Bolognium');
            let foothold = 1 + ((gal_on['ore_processor'] ?? 0)* 0.1);
            let pirate = piracy('gxy_alien2');
            let delta = base * $ctx.global_multiplier * pirate * foothold * $ctx.zigVal;

            breakdown.p['Bolognium'][loc('galaxy_armed_miner_bd')] = base + 'v';
            if (base > 0){
                breakdown.p['Bolognium'][`ᄂ${loc('galaxy_ore_processor')}`] = -((1 - foothold) * 100) + '%';
                breakdown.p['Bolognium'][`ᄂ${loc('galaxy_piracy')}+1`] = -((1 - pirate) * 100) + '%';
                breakdown.p['Bolognium'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = (($ctx.zigVal - 1) * 100) + '%';
                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.5;
                    breakdown.p['Bolognium'][`ᄂ${loc('evo_challenge_discharge')}+1`] = '-50%';
                }
            }

            modRes('Bolognium', delta * $ctx.time_multiplier);
        }

        // Orichalcum
        if (p_on['s_gate'] && global.resource.Orichalcum.display && global.galaxy['excavator'] && p_on['excavator'] > 0){
            let base = p_on['excavator'] * production('excavator') * production('psychic_boost','Orichalcum');
            let pirate = piracy('gxy_chthonian');
            let delta = base * $ctx.global_multiplier * pirate * $ctx.zigVal;
            global.galaxy.excavator['lpmod'] = production('excavator') * $ctx.global_multiplier * pirate * $ctx.zigVal

            breakdown.p['Orichalcum'][loc('galaxy_excavator')] = base + 'v';
            if (base > 0){
                breakdown.p['Orichalcum'][`ᄂ${loc('galaxy_piracy')}`] = -((1 - pirate) * 100) + '%';
                breakdown.p['Orichalcum'][`ᄂ${loc('space_red_ziggurat_title')}`] = (($ctx.zigVal - 1) * 100) + '%';
                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.5;
                    global.galaxy.excavator['lpmod'] *= 0.5;
                    breakdown.p['Orichalcum'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }
            }

            modRes('Orichalcum', delta * $ctx.time_multiplier);
        }

        // Kuiper Orichalcum
        if (global.space['orichalcum_mine'] && p_on['orichalcum_mine']){
            let synd = syndicate('spc_kuiper');

            let mine_base = p_on['orichalcum_mine'] * production('orichalcum_mine') * production('psychic_boost','Orichalcum');
            let mine_delta = mine_base * $ctx.global_multiplier * $ctx.qs_multiplier * synd * $ctx.zigVal;
            breakdown.p['Orichalcum'][loc('space_kuiper_mine',[global.resource.Orichalcum.name])] = mine_base + 'v';
            if (mine_base > 0){
                breakdown.p['Orichalcum'][`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                breakdown.p['Orichalcum'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = (($ctx.zigVal - 1) * 100) + '%';
                breakdown.p['Orichalcum'][`ᄂ${loc('quarantine')}+0`] = (($ctx.qs_multiplier - 1) * 100) + '%';
            }
            modRes('Orichalcum', mine_delta * $ctx.time_multiplier);
        }

        // Orichalcum Extractor Ship
        if (global.resource.Orichalcum.display && $ctx.e_ship['orichalcum'] && $ctx.e_ship.orichalcum > 0){
            let orichalcum_delta = $ctx.e_ship.orichalcum * $ctx.global_multiplier * $ctx.womling_technician;
            breakdown.p['Orichalcum'][loc('tau_roid_mining_ship')] = $ctx.e_ship.orichalcum + 'v';
            if ($ctx.womling_technician > 1){
                breakdown.p['Orichalcum'][`ᄂ${loc('tau_red_womlings')}+0`] = (($ctx.womling_technician - 1) * 100) + '%';
            }
            modRes('Orichalcum', orichalcum_delta * $ctx.time_multiplier);
        }

        // Womling Production
        if (global.race['truepath'] && global.tech['tau_red'] && global.tech.tau_red >= 5){
            if (global.tauceti['womling_mine'] && global.tauceti['overseer']){
                let miner_base = global.tauceti.womling_mine.miners * production('womling_mine','unobtainium') * production('psychic_boost','Unobtainium');
                let prod = global.tauceti.overseer.prod / 100;
                let miner_delta = miner_base * prod * $ctx.global_multiplier;

                breakdown.p['Unobtainium'][loc('tau_red_womlings')] = miner_base + 'v';
                if (miner_base > 0){
                    breakdown.p['Unobtainium'][`ᄂ${loc('tau_red_womling_prod_label')}`] = -((1 - prod) * 100) + '%';
                }
                modRes('Unobtainium', miner_delta * $ctx.time_multiplier);

                if (global.tech['isolation']){
                    let uranium_base = global.tauceti.womling_mine.miners * production('womling_mine','uranium') * production('psychic_boost','Uranium');
                    breakdown.p['Uranium'][loc('tau_red_womlings')] = uranium_base + 'v';
                    let uranium_delta = uranium_base * prod * $ctx.global_multiplier;

                    if (uranium_base > 0){
                        breakdown.p['Uranium'][`ᄂ${loc('tau_red_womling_prod_label')}`] = -((1 - prod) * 100) + '%';
                    }
                    modRes('Uranium', uranium_delta * $ctx.time_multiplier);

                    let titanium_base = global.tauceti.womling_mine.miners * production('womling_mine','titanium') * production('psychic_boost','Titanium');
                    breakdown.p['Titanium'][loc('tau_red_womlings')] = titanium_base + 'v';
                    let titanium_delta = titanium_base * prod * $ctx.shrineMetal.mult * $ctx.global_multiplier;

                    if (titanium_base > 0){
                        breakdown.p['Titanium'][`ᄂ${loc('tau_red_womling_prod_label')}`] = -((1 - prod) * 100) + '%';
                    }
                    modRes('Titanium', titanium_delta * $ctx.time_multiplier);

                    if (global.race['lone_survivor']){
                        let copper_base = global.tauceti.womling_mine.miners * production('womling_mine','copper') * production('psychic_boost','Copper');
                        breakdown.p['Copper'][loc('tau_red_womlings')] = copper_base + 'v';
                        let copper_delta = copper_base * prod * $ctx.shrineMetal.mult * $ctx.global_multiplier;

                        if (copper_delta > 0){
                            breakdown.p['Copper'][`ᄂ${loc('tau_red_womling_prod_label')}`] = -((1 - prod) * 100) + '%';
                        }
                        modRes('Copper', copper_delta * $ctx.time_multiplier);

                        let alumina_base = global.tauceti.womling_mine.miners * production('womling_mine','aluminium') * production('psychic_boost','Aluminium');
                        breakdown.p['Aluminium'][loc('tau_red_womlings')] = alumina_base + 'v';
                        let alumina_delta = alumina_base * prod * $ctx.shrineMetal.mult * $ctx.global_multiplier;

                        if (alumina_base > 0){
                            breakdown.p['Aluminium'][`ᄂ${loc('tau_red_womling_prod_label')}`] = -((1 - prod) * 100) + '%';
                        }
                        modRes('Aluminium', alumina_delta * $ctx.time_multiplier);

                        let iridium_base = global.tauceti.womling_mine.miners * production('womling_mine','iridium') * production('psychic_boost','Iridium');
                        breakdown.p['Iridium'][loc('tau_red_womlings')] = iridium_base + 'v';
                        let iridium_delta = iridium_base * prod * $ctx.hunger * $ctx.shrineMetal.mult * $ctx.global_multiplier;

                        if (iridium_base > 0){
                            breakdown.p['Iridium'][`ᄂ${loc('tau_red_womling_prod_label')}`] = -((1 - prod) * 100) + '%';
                        }
                        modRes('Iridium', iridium_delta * $ctx.time_multiplier);

                        let neutronium_base = global.tauceti.womling_mine.miners * production('womling_mine','neutronium') * production('psychic_boost','Neutronium');
                        breakdown.p['Neutronium'][loc('tau_red_womlings')] = neutronium_base + 'v';
                        let neutronium_delta = neutronium_base * prod * $ctx.hunger * $ctx.global_multiplier;

                        if (neutronium_base > 0){
                            breakdown.p['Neutronium'][`ᄂ${loc('tau_red_womling_prod_label')}`] = -((1 - prod) * 100) + '%';
                        }
                        modRes('Neutronium', neutronium_delta * $ctx.time_multiplier);
                    }
                }
            }
        }

        breakdown.p['Neutronium'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';

        if (shrineBonusActive()){
            breakdown.p['Iridium'][loc('city_shrine')] = (($ctx.shrineMetal.mult - 1) * 100).toFixed(1) + '%';
        }
        breakdown.p['Iridium'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';

        // Income
        $ctx.rawCash = $ctx.FactoryMoney ? $ctx.FactoryMoney * $ctx.global_multiplier * $ctx.hunger : 0;
        if ($ctx.FactoryMoney && global.race['discharge'] && global.race['discharge'] > 0){$ctx.rawCash *= 0.5;}
        if (global.tech['currency'] >= 1){
            let citizens = global.resource[global.race.species].amount + global.civic.garrison.workers - global.civic.unemployed.workers;
            let income_base = citizens;
            if (global.race['high_pop']){
                income_base = highPopAdjust(income_base);
            }
            income_base *= global.race['truepath'] ? 0.2 : 0.4;
            if (global.race['greedy']){
                income_base *= 1 - (traits.greedy.vars()[0] / 100);
            }
            if (global.tech['isolation']){
                income_base *= 15;
            }
            income_base *= production('psychic_cash');

            if ($ctx.fed && global.tech['banking'] && global.tech['banking'] >= 2){
                let impact = +workerScale(global.civic.banker.impact,'banker');
                if (global.tech['banking'] >= 10){
                    impact += 0.02 * global.tech['stock_exchange'];
                }
                if (global.race['truthful']){
                    impact *= 1 - (traits.truthful.vars()[0] / 100);
                }
                if (global.civic.govern.type === 'republic'){
                    impact *= 1 + (govEffect.republic()[0] / 100);
                }
                if (global.race['high_pop']){
                    impact = highPopAdjust(impact);
                }
                income_base *= 1 + (global.civic.banker.workers * impact);
            }
            
            let extra_income = 0;
            if (govActive('extravagant',0) && global.city['apartment']){
                let mult = income_base / citizens;
                let pop = p_on['apartment'] * actions.city.apartment.citizens();
                pop = Math.min(citizens, pop);
                extra_income = pop * mult * (govCivics('tax_cap') / 20); //citizens in mansions pay max taxes always.
                income_base -= pop * mult;
            }
            income_base *= (global.civic.taxes.tax_rate / 20);
            income_base += extra_income;
            if (global.civic.govern.type === 'oligarchy'){
                income_base *= 1 - (govEffect.oligarchy()[0] / 100);
            }
            if (global.civic.govern.type === 'corpocracy'){
                income_base *= 0.5;
            }
            if (global.civic.govern.type === 'socialist'){
                income_base *= 1 - (govEffect.socialist()[3] / 100);
            }
            if (global.race['banana']){
                income_base *= 0.05;
            }

            let temple_mult = 1;
            if (global.tech['anthropology'] && global.tech['anthropology'] >= 4 && !global.race['truepath']){
                temple_mult += faithTempleCount() * 0.025;
            }

            let upkeep = 0;
            if (!global.tech['world_control'] && global.civic.govern.type !== 'federation'){
                for (let i=0; i<3; i++){
                    if (global.civic.foreign[`gov${i}`].buy){
                        upkeep += income_base * 0.2;
                    }
                }
            }

            let getShrineResult = getShrineBonus('tax');

            let delta = (income_base - upkeep) * temple_mult * $ctx.hunger * getShrineResult.mult;
            delta *= $ctx.global_multiplier;

            breakdown.p['Money'][loc('morale_tax')] = (income_base) + 'v';
            if (income_base > 0){
                breakdown.p['Money'][`ᄂ${loc('civics_spy_purchase_bd')}`] = -(upkeep) + 'v';
                breakdown.p['Money'][global.race['cataclysm'] || global.race['orbit_decayed'] ? `ᄂ${loc('space_red_ziggurat_title')}` : `ᄂ${structName('temple')}`] = ((temple_mult - 1) * 100) + '%';
                breakdown.p['Money'][`ᄂ${loc('city_shrine')}`] = ((getShrineResult.mult - 1) * 100) + '%';
            }
            breakdown.p['Money'][loc('city_factory')] = $ctx.FactoryMoney + 'v';
            if (global.race['discharge'] && global.race['discharge'] > 0 && $ctx.FactoryMoney > 0){
                breakdown.p['Money'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
            }
            modRes('Money', +(delta * $ctx.time_multiplier).toFixed(2));
            $ctx.rawCash += delta;
        }
}

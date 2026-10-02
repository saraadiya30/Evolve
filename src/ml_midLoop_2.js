import { global, breakdown, int_on, support_on, p_on, gal_on } from './vars.js';
import { actions, templeCount, structName, bank_vault, wardenLabel, casino_vault, drawTech } from './actions.js';
import { loc } from './locale.js';
import { highPopAdjust } from './prod.js';
import { workerScale, jobScale, jobName, limitCraftsmen, loadServants } from './jobs.js';
import { traits, planetTraits, races } from './races.js';
import { spatialReasoning, faithTempleCount, crateValue, containerValue } from './resources.js';
import { govActive } from './governor.js';
import { messageQueue, shrineBonusActive, getShrineBonus } from './functions.js';
import { hellSupression } from './portal.js';
import { planetName, piracy, galaxy_ship_types, gatewayArmada } from './space.js';
import { syndicate } from './truepath.js';
import { storageBonus } from './stocks_core.js';

// Bagian dari midLoop (main.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function midLoop_s4($ctx){
        if (global.city['wardenclyffe']){
            let gain_base = 1000;
            if (global.city.ptrait.includes('magnetic')){
                gain_base += planetTraits.magnetic.vars()[1];
            }
            let gain = global.city['wardenclyffe'].count * gain_base;
            $ctx.lCaps['scientist'] += jobScale(global.city['wardenclyffe'].count);
            let powered_gain = global.tech['science'] >= 7 ? 1500 : 1000;
            gain += (p_on['wardenclyffe'] * powered_gain);
            if (global.tech['supercollider']){
                let ratio = global.tech['tp_particles'] || (global.tech['particles'] && global.tech['particles'] >= 3) ? 12.5: 25;
                gain *= (global.tech['supercollider'] / ratio) + 1;
            }
            if (global.space['satellite']){
                gain *= 1 + (global.space.satellite.count * 0.04);
            }
            let athVal = govActive('athleticism',2);
            if (athVal){
                gain *= 1 - (athVal / 100);
            }
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[wardenLabel()] = gain+'v';

            if (global.race.universe === 'magic'){
                let mana = global.city.wardenclyffe.count * spatialReasoning(8);
                $ctx.caps['Mana'] += mana;
                breakdown.c.Mana[wardenLabel()] = mana+'v';
            }

            if (global.race['artifical']){
                let gain = p_on['wardenclyffe'] * spatialReasoning(250);
                $ctx.caps['Food'] += gain;
                breakdown.c.Food[wardenLabel()] = gain+'v';
            }
        }
        if (global.race['logical']){
            let factor = global.tech.hasOwnProperty('high_tech') ? global.tech.high_tech : 0;
            factor += global.tech.hasOwnProperty('science') ? global.tech.science : 0;
            let gain = global.resource[global.race.species].amount * traits.logical.vars()[1] * factor;
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[races[global.race.species].name] = gain+'v';
        }
        if (global.portal['sensor_drone']){
            let gain = p_on['sensor_drone'] * (global.tech.infernite >= 6 ? 2500 : 1000);
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('portal_sensor_drone_title')] = gain+'v';
        }
        if (global.space['satellite']){
            let gain = (global.space.satellite.count * (global.race['cataclysm'] || global.race['orbit_decayed'] ? 2000 : 750));
            if ((global.race['cataclysm'] || global.race['orbit_decayed']) && global.tech['supercollider']){
                let ratio = global.tech['tp_particles'] || (global.tech['particles'] && global.tech['particles'] >= 3) ? 5: 10;
                gain *= (global.tech['supercollider'] / ratio) + 1;
            }
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('space_home_satellite_title')] = gain+'v';
        }
        if (global.space['observatory'] && global.space.observatory.count > 0){
            let gain = (support_on['observatory'] * 5000);
            if (global.race['cataclysm'] && global.space['satellite'] && global.space.satellite.count > 0){
                gain *= 1 + (global.space.satellite.count * 0.25);
            }

            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('space_moon_observatory_title')] = gain+'v';

            if (global.race['cataclysm']){
                $ctx.lCaps['professor'] += jobScale(support_on['observatory']);
            }
        }
        if (global.interstellar['laboratory'] && int_on['laboratory'] > 0){
            if (global.tech.science >= 16){
                $ctx.lCaps['scientist'] += jobScale(int_on['laboratory']);
            }
            let gain = (int_on['laboratory'] * 10000);
            if (global.tech.science >= 15){
                gain *= 1 + ((global.race['cataclysm'] ? support_on['exotic_lab'] : global.city.wardenclyffe.count) * 0.02);
            }
            if (global.race['cataclysm'] && p_on['s_gate'] && gal_on['scavenger']){
                gain *= 1 + (gal_on['scavenger'] * piracy('gxy_alien2') * 0.75);
            }
            if (global.tech['science'] >= 21){
                gain *= 1.45;
            }
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc(global.race.universe === 'magic' ? 'tech_sanctum' : 'interstellar_laboratory_title')] = gain+'v';

            if (global.race.universe === 'magic'){
                let mana = int_on['laboratory'] * spatialReasoning(12);
                $ctx.caps['Mana'] += mana;
                breakdown.c.Mana[loc(global.race.universe === 'magic' ? 'tech_sanctum' : 'interstellar_laboratory_title')] = mana+'v';
            }
        }
        if (global.city['biolab']){
            let gain = 3000;
            if (global.portal['sensor_drone'] && global.tech['science'] >= 14){
                gain *= 1 + (p_on['sensor_drone'] * 0.02);
            }
            if (global.tech['science'] >= 20){
                gain *= 3;
            }
            if (global.tech['science'] >= 21){
                gain *= 1.45;
            }
            if (global.tech['biotech'] >= 1){
                gain *= 2.5;
            }
            if (global.race['elemental'] && traits.elemental.vars()[0] === 'frost'){
                gain *= 1 + highPopAdjust(traits.elemental.vars()[4] * global.resource[global.race.species].amount / 100);
            }

            $ctx.caps['Knowledge'] += (p_on['biolab'] * gain);
            breakdown.c.Knowledge[loc('city_biolab')] = (p_on['biolab'] * gain)+'v';
        }
        if (global.space['zero_g_lab'] && Math.min(support_on['zero_g_lab'],p_on['zero_g_lab']) > 0){
            let using = Math.min(support_on['zero_g_lab'],p_on['zero_g_lab']);
            let synd = syndicate('spc_enceladus');
            let gain = Math.round(using * 10000 * synd);
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('tech_zero_g_lab')] = gain+'v';

            if (global.resource.Cipher.display){
                let cipher = 10000 * using;
                $ctx.caps['Cipher'] += cipher;
                breakdown.c.Cipher[loc('tech_zero_g_lab')] = cipher+'v';
            }
        }
        if (global.race['warlord']){
            let gain = (global.race?.absorbed?.length || 1) * 500000;
            if (shrineBonusActive()){
                let shrineBonus = getShrineBonus('know');
                gain *= shrineBonus.mult;
            }
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('portal_throne_of_evil_title')] = gain+'v';

            $ctx.caps['Crates'] += 500;
            breakdown.c.Crates[loc('portal_throne_of_evil_title')] = 500 + 'v';
            $ctx.caps['Containers'] += 500;
            breakdown.c.Containers[loc('portal_throne_of_evil_title')] = 500 + 'v';
        }
        if (global.portal['twisted_lab'] && global.portal.twisted_lab.count > 0 && global.race['absorbed']){
            let baseVal = 6000 + global.portal.twisted_lab.rank * 2000;
            let gain = (p_on['twisted_lab'] * baseVal * global.race.absorbed.length);
            if (global.tech['supercollider'] && global.race['warlord']){
                let ratio = global.tech['tp_particles'] || (global.tech['particles'] && global.tech['particles'] >= 3) ? 12.5: 25;
                gain *= (global.tech['supercollider'] / ratio) + 1;
            }
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('portal_twisted_lab_title')] = gain+'v';
        }

        //Omniscience
        if (global.resource.Omniscience.display){
            if (global.eden['research_station']){
                let corruptor = 1;
                if (global.race['warlord'] && global.eden['corruptor']){
                    corruptor = 1 + (p_on['corruptor'] || 0) * 0.04;
                }
                let gain = (support_on['research_station'] || 0) * Math.round(777 * corruptor);
                $ctx.caps['Omniscience'] += gain;
                breakdown.c.Omniscience[loc('eden_research_station_title')] = gain+'v';
            }

            if (global.race['warlord'] && global.portal['mortuary'] && global.portal['corpse_pile']){
                let gain = global.portal.corpse_pile.count * (p_on['mortuary'] || 0) * (p_on['encampment'] || 0) * 2; 
                $ctx.caps['Omniscience'] += gain;
                breakdown.c.Omniscience[loc('eden_encampment_title')] = gain+'v';
            }
            else if (p_on['ascension_trigger'] && global.eden.hasOwnProperty('encampment') && global.eden.encampment.asc){
                let heatSink = actions.interstellar.int_sirius.ascension_trigger.heatSink();
                heatSink = heatSink < 0 ? Math.abs(heatSink) : 0;
                let omniscience = +(150 + (heatSink ** 0.95 / 10)).toFixed(0);

                let gain = (p_on['encampment'] || 0) * omniscience;
                $ctx.caps['Omniscience'] += gain;
                breakdown.c.Omniscience[loc('eden_encampment_title')] = gain+'v';
            }

            if (global.eden['archive']){
                let gain = (p_on['archive'] || 0) * 1013;
                $ctx.caps['Omniscience'] += gain;
                breakdown.c.Omniscience[loc('eden_archive_bd')] = gain+'v';
            }
        }

        if (global.tech['isolation'] && global.tauceti['alien_outpost'] && global.resource.Cipher.display){
            let cipher = 200000;
            $ctx.caps['Cipher'] += cipher;
            breakdown.c.Cipher[loc('tech_alien_outpost')] = cipher+'v';
        }

        if (global.portal['archaeology']){
            let sup = hellSupression('ruins');
            let value = 250000;
            if (global.race['high_pop']){
                value = highPopAdjust(value);
            }
            let gain = Math.round(value * sup.supress);
            $ctx.caps['Knowledge'] += (workerScale(global.civic.archaeologist.workers,'archaeologist') * gain);
            breakdown.c.Knowledge[loc('portal_archaeology_bd')] = (workerScale(global.civic.archaeologist.workers,'archaeologist') * gain)+'v';
        }

        if (p_on['embassy'] && global.galaxy['symposium']){
            let dorm = 1750 * p_on['dormitory'];
            let gtrade = 650 * global.galaxy.trade.cur;
            let leave = 0;
            if (global.tech.xeno >= 7){
                for (let j = 0; j < galaxy_ship_types.length; j++){
                    const area = galaxy_ship_types[j].area;
                    const region = galaxy_ship_types[j].region;
                    if (area !== 'galaxy') { continue; }

                    let crew = 0;
                    for (const ship of gatewayArmada){
                        crew += global.galaxy.defense[region][ship] * (actions[area]['gxy_gateway'][ship].ship.civ() + actions[area]['gxy_gateway'][ship].ship.mil());
                    }

                    for (let i=0; i<galaxy_ship_types[j].ships.length; i++){
                        const ship = galaxy_ship_types[j].ships[i];
                        if (!gatewayArmada.includes(ship) && actions[area][region][ship].hasOwnProperty('ship') && gal_on[ship]){
                            // Every ship with the 'ship' property has both civ() and mil() functions
                            crew += gal_on[ship] * (actions[area][region][ship].ship.civ() + actions[area][region][ship].ship.mil());
                        }
                    }

                    if (region === 'gxy_gorddon'){
                        leave += +highPopAdjust(crew).toFixed(2) * 300;
                    }
                    else {
                        leave += +highPopAdjust(crew).toFixed(2) * 100 * piracy(region);
                    }
                }
            }
            let pirate = piracy('gxy_gorddon');
            let know = (dorm + gtrade + leave) * pirate * p_on['symposium'];
            $ctx.caps['Knowledge'] += know;
            breakdown.c.Knowledge[loc('galaxy_symposium')] = know +'v';
        }

        if (global.city['bank'] || (global.race['cataclysm'] && p_on['spaceport'])){
            let vault = global.race['cataclysm'] || global.race['orbit_decayed'] ? bank_vault() * 4 : bank_vault();
            let banks = global.race['cataclysm'] || global.race['orbit_decayed'] ? p_on['spaceport'] : global.city['bank'].count;

            let gain = (banks * spatialReasoning(vault));
            $ctx.caps['Money'] += gain;

            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                breakdown.c.Money[loc('space_red_spaceport_title')] = gain+'v';
            }
            else {
                breakdown.c.Money[loc('city_bank')] = gain+'v';
            }

            if (global.interstellar['exchange']){
                if (global.eden['eternal_bank']){ banks += global.eden.eternal_bank.count * 2; }
                let g_vault = spatialReasoning(int_on['exchange'] * (vault * banks / 18));
                if (global.race['inflation']){
                    g_vault *= 2;
                }
                if (global.tech.banking >= 13){
                    if (global.galaxy['freighter']){
                        g_vault *= 1 + (gal_on['freighter'] * 0.03);
                    }
                    if (global.galaxy['super_freighter']){
                        g_vault *= 1 + (gal_on['super_freighter'] * 0.08);
                    }
                }
                g_vault = Math.round(g_vault);
                $ctx.caps['Money'] += g_vault;
                breakdown.c.Money[loc('interstellar_exchange_bd')] = g_vault+'v';
            }
        }

        if (global.eden['eternal_bank']){
            let vault = bank_vault() * (global.race['warlord'] ? 20 : 10);
            if (global.race['warlord'] && global.eden['corruptor'] && global.tech.asphodel >= 12){
                vault *= 1 + (p_on['corruptor'] || 0) * 0.08;
            }
            let banks = global.eden.eternal_bank.count;
            let gain = (banks * spatialReasoning(vault));
            $ctx.caps['Money'] += gain;
            breakdown.c.Money[loc('eden_eternal_bank_title')] = gain+'v';
        }

        if (global.space['titan_bank']){
            let vault = bank_vault() * 2;
            let banks = global.space.titan_bank.count;
            let gain = (banks * spatialReasoning(vault));
            $ctx.caps['Money'] += gain;
            breakdown.c.Money[`${planetName().titan} ${loc('city_bank')}`] = gain+'v';
        }

        if (global.tauceti['colony'] && global.tech['isolation']){
            let vault = bank_vault() * 25;
            let gain = (global.tauceti.colony.count * spatialReasoning(vault));
            $ctx.caps['Money'] += gain;
            breakdown.c.Money[loc('tau_home_colony')] = gain+'v';
        }

        if (global.city['casino'] || global.space['spc_casino'] || global.tauceti['tauceti_casino'] || global.portal['hell_casino']){
            let casinos = 0;
            if (global.city['casino'] && global.city.casino.count > 0){
                casinos += global.city.casino.count;
            }
            if (global.space['spc_casino'] && global.space.spc_casino.count > 0){
                casinos += global.space.spc_casino.count;
            }
            if (global.tauceti['tauceti_casino'] && global.tauceti.tauceti_casino.count > 0){
                casinos += global.tauceti.tauceti_casino.count;
            }
            if (global.portal['hell_casino'] && global.portal.hell_casino.count > 0){
                casinos += global.portal.hell_casino.count;
            }

            let vault = casinos * casino_vault();
            $ctx.caps['Money'] += vault;
            breakdown.c.Money[structName('casino')] = vault+'v';
        }
        if (global.galaxy['resort']){
            let vault = p_on['resort'] * spatialReasoning(global.tech['world_control'] ? 1875000 : 1500000);
            $ctx.caps['Money'] += vault;
            breakdown.c.Money[loc('galaxy_resort')] = vault+'v';
        }
        if (global.tech['banking'] >= 4){
            let cm = 250;
            if (global.tech.banking >= 14){
                cm = 1000000;
            }
            else if (global.tech.banking >= 11){
                cm = 1000;
            }
            else if (global.tech.banking >= 6){
                cm = 600;
            }
            let gain = cm * (global.resource[global.race.species].amount + global.civic.garrison.workers);
            if (global.race['high_pop']){
                gain = highPopAdjust(gain);
            }
            $ctx.caps['Money'] += gain;
            breakdown.c.Money[global.tech.banking >= 14 ? loc('tech_crypto_currency') : loc('tech_bonds')] = gain+'v';
        }
        if (p_on['moon_base']){
            let gain = p_on['moon_base'] * spatialReasoning(500);
            $ctx.caps['Iridium'] += gain;
            breakdown.c.Iridium[loc('space_moon_base_title')] = gain+'v';
        }
        if (p_on['space_station']){
            $ctx.lCaps['space_miner'] += jobScale(p_on['space_station'] * 3);
            if (global.tech['asteroid'] >= 5){
                let gain = p_on['space_station'] * spatialReasoning(5);
                $ctx.caps['Elerium'] += gain;
                breakdown.c.Elerium[loc('space_belt_station_title')] = gain+'v';
            }
        }
        if (support_on['exotic_lab']){
            let el_gain = support_on['exotic_lab'] * spatialReasoning(10);
            $ctx.caps['Elerium'] += el_gain;
            breakdown.c.Elerium[loc('space_red_exotic_lab_bd')] = el_gain+'v';
            let sci = 500;
            if (global.tech['science'] >= 13 && global.interstellar['laboratory']){
                sci += int_on['laboratory'] * 25;
            }
            if (global.tech['ancient_study'] && global.tech['ancient_study'] >= 2){
                sci += templeCount(true) * 15;
            }
            if (global.tech.mass >= 2){
                let brain = workerScale(global.civic.scientist.workers,'scientist');
                if (global.race['high_pop']){
                    brain = highPopAdjust(brain);
                }
                sci += p_on['mass_driver'] * brain;
            }
            if (global.race['cataclysm'] && support_on['observatory']){
                sci *= 1 + (support_on['observatory'] * 0.25);
            }
            if ((global.race['cataclysm'] || global.race['orbit_decayed']) && global.portal['sensor_drone'] && global.tech['science'] >= 14){
                sci *= 1 + (p_on['sensor_drone'] * 0.02);
            }
            if (global.tech['science'] >= 21){
                sci *= 1.45;
            }
            if (global.race['high_pop']){
                sci = highPopAdjust(sci);
            }
            let gain = support_on['exotic_lab'] * workerScale(global.civic.colonist.workers,'colonist') * sci;
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('tech_exotic_bd')] = gain+'v';

            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                $ctx.lCaps['scientist'] += jobScale(support_on['exotic_lab']);
            }
        }

        if (support_on['research_station']){
            let attact = global.blood['attract'] ? global.blood.attract * 5 : 0;
            let sci = 200 + attact;
            if (global.tech['science'] && global.tech.science >= 22 && p_on['embassy'] && p_on['symposium']){
                sci *= 1 + (p_on['symposium'] * piracy('gxy_gorddon'));
            }
            let gain = support_on['research_station'] * highPopAdjust(global.civic.ghost_trapper.workers) * sci;
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('eden_research_station_title')] = gain+'v';
        }

        if (global.tech['isolation'] && support_on['infectious_disease_lab']){
            $ctx.lCaps['professor'] += jobScale(support_on['infectious_disease_lab'] * 2);
            $ctx.lCaps['scientist'] += jobScale(support_on['infectious_disease_lab']);
        }

        if (global.race['warlord'] && p_on['twisted_lab']){
            $ctx.lCaps['professor'] += jobScale(p_on['twisted_lab'] * 3);
            $ctx.lCaps['scientist'] += jobScale(p_on['twisted_lab'] * 2);
        }

        if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.prof){
            $ctx.lCaps['scientist'] += jobScale(global.race.wishStats.prof);
        }

        if (support_on['decoder']){
            let titan_colonists = p_on['ai_colonist'] ? workerScale(global.civic.titan_colonist.workers,'titan_colonist') + jobScale(p_on['ai_colonist']) : workerScale(global.civic.titan_colonist.workers,'titan_colonist');
            let gain = support_on['decoder'] * titan_colonists * 2500;
            if (global.race['high_pop']){
                gain = highPopAdjust(gain);
            }
            if (p_on['ai_core2']){
                gain *= 1.25;
            }
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('space_decoder_title')] = gain+'v';
        }
        if (p_on['elerium_contain']){
            let el_gain = p_on['elerium_contain'] * spatialReasoning(100);
            $ctx.caps['Elerium'] += el_gain;
            breakdown.c.Elerium[loc('space_dwarf_elerium_contain_title')] = el_gain+'v';
        }
        if (p_on['elerium_containment']){
            let el_gain = p_on['elerium_containment'] * spatialReasoning(1000);
            $ctx.caps['Elerium'] += el_gain;
            breakdown.c.Elerium[loc('eden_elerium_containment',[global.resource.Elerium.name])] = el_gain+'v';
        }
        if (p_on['shadow_mine']){
            let el_gain = p_on['shadow_mine'] * spatialReasoning(200);
            $ctx.caps['Elerium'] += el_gain;
            breakdown.c.Elerium[loc('portal_shadow_mine_title')] = el_gain+'v';
        }
        if (p_on['corruptor']){
            let el_gain = p_on['corruptor'] * spatialReasoning(200);
            $ctx.caps['Elerium'] += el_gain;
            breakdown.c.Elerium[loc('eden_corruptor_title')] = el_gain+'v';
        }
        if (global.city['foundry']){
            $ctx.lCaps['craftsman'] += jobScale(global.city['foundry'].count);
        }
        if (support_on['fabrication']){
            $ctx.lCaps['craftsman'] += jobScale(support_on['fabrication']);
            if (global.race['cataclysm']){
                $ctx.lCaps['cement_worker'] += jobScale(support_on['fabrication']);
            }
        }
        if (global.tech['isolation'] && support_on['tau_factory']){
            $ctx.lCaps['craftsman'] += jobScale(support_on['tau_factory'] * 5);
            $ctx.lCaps['cement_worker'] += jobScale(support_on['tau_factory'] * 2);
        }
        if (global.race['warlord'] && p_on['hell_factory']){
            $ctx.lCaps['cement_worker'] += jobScale(p_on['hell_factory'] * 5);
        }
        if (p_on['womling_station']){
            $ctx.lCaps['craftsman'] += jobScale(p_on['womling_station'] * 1);
            $ctx.lCaps['cement_worker'] += jobScale(p_on['womling_station'] * 1);
        }
        if (p_on['stellar_forge']){
            $ctx.lCaps['craftsman'] += jobScale(p_on['stellar_forge'] * 2);
        }
        if (p_on['demon_forge']){
            $ctx.lCaps['craftsman'] += jobScale(p_on['demon_forge'] * actions.portal.prtl_wasteland.demon_forge.crafters());
        }
        if (global.tech['elysium'] && global.tech.elysium >= 18 && p_on['sacred_smelter']){
            $ctx.lCaps['craftsman'] += jobScale(p_on['sacred_smelter'] * 3);
        }
        if (global.portal['carport']){
            $ctx.lCaps['hell_surveyor'] += jobScale(global.portal.carport.count) - global.portal.carport.damaged;
        }
        if (p_on['archaeology']){
            $ctx.lCaps['archaeologist'] += jobScale(p_on['archaeology'] * 2);
        }
        if (support_on['ectoplasm_processor']){
            $ctx.lCaps['ghost_trapper'] += jobScale(support_on['ectoplasm_processor'] * 5);
        }
        if (p_on['elysanite_mine']){
            $ctx.lCaps['elysium_miner'] += jobScale(p_on['elysanite_mine'] * 2);
        }
        if (p_on['nexus']){
            let helium_gain = p_on['nexus'] * spatialReasoning(4000);
            $ctx.caps['Helium_3'] += helium_gain;
            breakdown.c.Helium_3[loc('interstellar_nexus_title')] = helium_gain+'v';

            let oil_gain = (p_on['nexus'] * spatialReasoning(3500));
            $ctx.caps['Oil'] += oil_gain;
            breakdown.c.Oil[loc('interstellar_nexus_title')] = oil_gain+'v';

            let deuterium_gain = p_on['nexus'] * spatialReasoning(3000);
            $ctx.caps['Deuterium'] += deuterium_gain;
            breakdown.c.Deuterium[loc('interstellar_nexus_title')] = deuterium_gain+'v';

            let elerium_gain = p_on['nexus'] * spatialReasoning(25);
            $ctx.caps['Elerium'] += elerium_gain;
            breakdown.c.Elerium[loc('interstellar_nexus_title')] = elerium_gain+'v';
        }
        if (p_on['s_gate'] && global.galaxy['gateway_station']){
            let helium_gain = p_on['gateway_station'] * spatialReasoning(2000);
            $ctx.caps['Helium_3'] += helium_gain;
            breakdown.c.Helium_3[loc('galaxy_gateway_station')] = helium_gain+'v';

            let deuterium_gain = p_on['gateway_station'] * spatialReasoning(4500);
            $ctx.caps['Deuterium'] += deuterium_gain;
            breakdown.c.Deuterium[loc('galaxy_gateway_station')] = deuterium_gain+'v';

            let gain = p_on['gateway_station'] * spatialReasoning(50);
            $ctx.caps['Elerium'] += gain;
            breakdown.c.Elerium[loc('galaxy_gateway_station')] = gain+'v';
        }
        if (p_on['s_gate'] && p_on['telemetry_beacon']){
            let base_val = global.tech['telemetry'] ? 1200 : 800;
            if (global.tech.science >= 17){
                base_val += gal_on['scout_ship'] * 25;
            }
            let gain = p_on['telemetry_beacon'] ** 2 * base_val;
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('galaxy_telemetry_beacon_bd')] = gain+'v';
        }
        if (p_on['s_gate'] && gal_on['scavenger']){
            let gain = gal_on['scavenger'] * Math.round($ctx.pirate_alien2 * 25000);
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('galaxy_scavenger')] = gain+'v';
        }

        if (global.eden['encampment']){
            let powder = global.eden.encampment.count * spatialReasoning(250);
            $ctx.caps['Asphodel_Powder'] += powder;
            breakdown.c.Asphodel_Powder[loc('eden_encampment_title')] = powder+'v';
        }

        breakdown['t_route'] = {};
        global.city.market.mtrade = 0;
        if (global.race['banana']){
            global.city.market.mtrade++;
            breakdown.t_route[loc('base')] = 1;
        }
        if (global.city['trade']){
            let routes = global.race['nomadic'] || global.race['xenophobic'] ? global.tech.trade : global.tech.trade + 1;
            if (global.tech['trade'] && global.tech['trade'] >= 3){
                routes--;
            }
            if (global.race['flier']){
                routes += traits.flier.vars()[1];
            }
            routes *= 100;
            global.city.market.mtrade += routes * global.city.trade.count;
            breakdown.t_route[loc('city_trade')] = routes * global.city.trade.count;
            if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 3){
                let r_count = faithTempleCount();
                global.city.market.mtrade += r_count;
                breakdown.t_route[global.race['cataclysm'] ? loc('space_red_ziggurat_title') : structName('temple')] = r_count;
            }
        }
}

export function midLoop_s5($ctx){
        if (global.city['wharf']){
            let r_count = global.city.wharf.count * 2 * 100;
            global.city.market.mtrade += r_count;
            breakdown.t_route[loc('city_wharf')] = r_count;
        }
        if (global.space['gps'] && global.space.gps.count >= 4){
            let r_count = global.space.gps.count * 2 * 100;
            global.city.market.mtrade += global.space.gps.count * 2 * 100;
            breakdown.t_route[loc('space_home_gps_title')] = r_count;
        }
        if (global.city['storage_yard'] && global.tech['trade'] && global.tech['trade'] >= 3){
            let r_count = global.city.storage_yard.count * 100;
            global.city.market.mtrade += r_count;
            breakdown.t_route[loc('city_storage_yard')] = r_count;
        }
        if (global.portal['bazaar'] && global.portal['spire']){
            let r_count = global.portal.bazaar.count * global.portal.spire.count;
            global.city.market.mtrade += r_count;
            breakdown.t_route[loc('portal_bazaar_title')] = r_count;
        }
        if (global.tech['railway']){
            let routes = 0;
            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                routes = global.space['gps'] ? Math.floor(global.space.gps.count / 3) : 0;
            }
            else if (global.race['warlord']){
                routes = 5;
            }
            else {
                routes = global.city['storage_yard'] ? Math.floor(global.city.storage_yard.count / 6) : 0;
            }
            if (global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 2){
                routes++;
            }
            routes *= 10000;
            global.city.market.mtrade += global.tech['railway'] * routes;
            breakdown.t_route[loc('arpa_projects_railway_title')] = global.tech['railway'] * routes;
        }
        if (p_on['titan_spaceport']){
            let water = p_on['titan_spaceport'] * spatialReasoning(250);
            $ctx.caps['Water'] += water;
            breakdown.c.Water[loc('space_red_spaceport_title')] = water+'v';
        }

        if (global.tauceti['mining_pit']){
            $ctx.lCaps['pit_miner'] += jobScale(support_on['mining_pit'] * (global.tech['isolation'] ? 6 : 8));
            $ctx.caps['Materials'] += support_on['mining_pit'] * 1000000;
        }

        if (global.civic.torturer.display && global.tech['unfathomable'] && global.tech.unfathomable >= 2){
            $ctx.lCaps['torturer'] = global.city.captive_housing.count;
        }

        if (global.race['universe'] === 'magic' && global.race['witch_hunter']){
            let sus = 0;

            if (global.city['wardenclyffe']){
                let wiz = global.city.wardenclyffe.count;
                wiz += p_on['wardenclyffe'];

                if (global.tech['roguemagic'] && global.tech.roguemagic >= 6){
                    wiz /= 2;
                }

                breakdown.c.Sus[wardenLabel()] = wiz+'v';
                sus += wiz;
            }

            if (global.civic.scientist.workers > 0){
                let wiz = global.civic.scientist.workers;
                if (global.civic.govern.type === 'magocracy'){
                    wiz /= 2;
                }
                wiz = highPopAdjust(wiz);
                breakdown.c.Sus[jobName('wizard')] = wiz+'v';
                sus += wiz;
            }

            if (global.city['coal_power'] && !global.race['environmentalist']){
                let mana_engine = p_on['coal_power'];

                if (global.tech['roguemagic'] && global.tech.roguemagic >= 6){
                    mana_engine /= 2;
                }

                breakdown.c.Sus[loc('city_mana_engine')] = mana_engine+'v';
                sus += mana_engine;
            }

            if (global.city['pylon'] || global.space['pylon'] || global.tauceti['pylon']){
                let p_count = 0;
                let name = 'city_pylon';
                if ((global.race['cataclysm'] || global.race['orbit_decayed']) && global.space['pylon']){
                    p_count = global.space.pylon.count;
                    name = 'space_red_pylon';
                }
                else if (global.tech['isolation'] && global.tauceti['pylon']){
                    p_count = global.tauceti.pylon.count;
                    name = 'tau_home_pylon';
                }
                else if (global.city['pylon']){
                    p_count = global.city.pylon.count;
                }

                if (global.tech['roguemagic'] && global.tech.roguemagic >= 5){
                    p_count /= 3;
                }

                breakdown.c.Sus[loc(name)] = p_count+'v';
                sus += p_count;
            }

            if (global.race['casting']){
                let ritual = global.race.casting.total;
                if (global.tech['roguemagic'] && global.tech.roguemagic >= 2){
                    if (global.tech.roguemagic >= 4){
                        ritual /= 4;
                    }

                    ritual -= highPopAdjust(global.civic.priest.workers);
                    if (ritual < 0){
                        ritual = 0;
                    }
                }
                breakdown.c.Sus[loc('tech_rituals')] = ritual+'v';
                sus += ritual;
            }

            if (global.race['totTransmute'] && global.race.totTransmute > 0){
                let transmute = global.race.totTransmute / 5;
                breakdown.c.Sus[loc('tech_alchemy')] = transmute+'v';
                sus += transmute;
            }

            let mtech = 0;
            if (global.tech['explosives']){
                mtech += 4;
            }
            if (global.tech['military']){
                if (global.tech.military >= 10){
                    mtech += 28;
                }
                else if (global.tech.military >= 9){
                    mtech += 24;
                }
                else if (global.tech.military >= 8){
                    mtech += 20;
                }
                else if (global.tech.military >= 7){
                    mtech += 16;
                }
                else if (global.tech.military >= 6){
                    mtech += 12;
                }
                else if (global.tech.military >= 4){
                    mtech += 8;
                }
                else if (global.tech.military >= 3){
                    mtech += 4;
                }
            }
            breakdown.c.Sus[loc('witch_hunter_magic_tech')] = mtech+'v';
            sus += mtech;

            if (!global.tech['roguemagic']){
                breakdown.c.Sus[loc('overt')] = (sus*5-sus)+'v';
                sus *= 5;
            }

            if (global.tech['nexus']){
                let nexus = global.tech['nexus'] * 0.15;
                breakdown.c.Sus[loc('arpa_projects_nexus_title')] = nexus+'v';
                sus += nexus;
            }

            if (global.tech['syphon']){
                let syphon = global.tech['syphon'] * 2.5;
                breakdown.c.Sus[loc('arpa_syphon_title')] = syphon+'v';
                sus += syphon;
            }

            if (global.portal.hasOwnProperty('soul_capacitor')){
                let capacitors = p_on['soul_capacitor'] || 0;
                global.portal.soul_capacitor['ecap'] = 2500000 * capacitors;
                breakdown.c.Sus[loc('portal_soul_capacitor_title')] = (capacitors / 3)+'v';
                sus += capacitors / 3;
            }

            if (global.tech['roguemagic'] && global.tech.roguemagic >= 3 && global.city['conceal_ward']){
                let wards = global.city.conceal_ward.count;
                if (global.tech.roguemagic >= 8){
                    wards *= 1.25;
                }
                breakdown.c.Sus[loc('city_conceal_ward')] = -(wards)+'v';
                sus -= wards;
            }

            if (sus < 0){ sus = 0; }
            sus = Math.floor(sus);
            global.resource.Sus.amount = sus;

            if (sus >= 50 && !global.race['witch_hunter_warned']){
                global.race['witch_hunter_warned'] = 1;
                messageQueue(loc('witch_hunter_warning'),'danger',false,['progress']);
            }
            else if (sus >= 80 && global.race['witch_hunter_warned'] && global.race.witch_hunter_warned === 1){
                global.race.witch_hunter_warned = 2;
                messageQueue(loc('witch_hunter_warning2'),'danger',false,['progress']);
            }

            if (sus >= 100){
                global.civic.foreign.gov0.hstl = 100;
                global.civic.foreign.gov1.hstl = 100;
                global.civic.foreign.gov2.hstl = 100;
                if (global.race['truepath']){
                    global.civic.foreign.gov3.hstl = 100;
                }
            }
        }

        breakdown['gt_route'] = {};
        if (global.galaxy['freighter']){
            breakdown.gt_route[loc('galaxy_freighter')] = gal_on['freighter'] * 2;
        }
        if (global.galaxy['super_freighter']){
            breakdown.gt_route[loc('galaxy_super_freighter')] = gal_on['super_freighter'] * 5;
        }
        if (global.galaxy['bolognium_ship']){
            $ctx.lCaps['crew'] += global.galaxy.bolognium_ship.on * actions.galaxy.gxy_gateway.bolognium_ship.ship.civ();
        }
        if (global.galaxy['scout_ship']){
            $ctx.lCaps['crew'] += global.galaxy.scout_ship.on * actions.galaxy.gxy_gateway.scout_ship.ship.civ();
        }
        if (global.galaxy['corvette_ship']){
            $ctx.lCaps['crew'] += global.galaxy.corvette_ship.on * actions.galaxy.gxy_gateway.corvette_ship.ship.civ();
        }
        if (global.galaxy['frigate_ship']){
            $ctx.lCaps['crew'] += global.galaxy.frigate_ship.on * actions.galaxy.gxy_gateway.frigate_ship.ship.civ();
        }
        if (global.galaxy['cruiser_ship']){
            $ctx.lCaps['crew'] += global.galaxy.cruiser_ship.on * actions.galaxy.gxy_gateway.cruiser_ship.ship.civ();
        }
        if (global.galaxy['dreadnought']){
            $ctx.lCaps['crew'] += global.galaxy.dreadnought.on * actions.galaxy.gxy_gateway.dreadnought.ship.civ();
        }
        if (global.galaxy['freighter']){
            $ctx.lCaps['crew'] += global.galaxy.freighter.on * actions.galaxy.gxy_gorddon.freighter.ship.civ();
        }
        if (global.galaxy['super_freighter']){
            $ctx.lCaps['crew'] += global.galaxy.super_freighter.on * actions.galaxy.gxy_alien1.super_freighter.ship.civ();
        }
        if (global.galaxy['armed_miner']){
            $ctx.lCaps['crew'] += global.galaxy.armed_miner.on * actions.galaxy.gxy_alien2.armed_miner.ship.civ();
        }
        if (global.galaxy['scavenger']){
            $ctx.lCaps['crew'] += global.galaxy.scavenger.on * actions.galaxy.gxy_alien2.scavenger.ship.civ();
        }
        if (global.portal['transport']){
            $ctx.lCaps['crew'] += global.portal.transport.on * actions.portal.prtl_lake.transport.ship.civ();
        }

        if (global.tauceti['infectious_disease_lab']){
            let gain = 39616;
            if (global.tech['supercollider'] && global.tech['isolation']){
                let ratio = global.tech['tp_particles'] || (global.tech['particles'] && global.tech['particles'] >= 3) ? 12.5: 25;
                gain *= (global.tech['supercollider'] / ratio) + 1;
            }
            $ctx.caps['Knowledge'] += (p_on['infectious_disease_lab'] * Math.round(gain));
            breakdown.c.Knowledge[actions.tauceti.tau_home.infectious_disease_lab.title()] = (p_on['infectious_disease_lab'] * gain)+'v';

            if (global.tech['isolation']){
                let el_gain = support_on['infectious_disease_lab'] * spatialReasoning(375);
                $ctx.caps['Elerium'] += el_gain;
                breakdown.c.Elerium[actions.tauceti.tau_home.infectious_disease_lab.title()] = el_gain+'v';
            }
        }

        // Womlings
        if (global.race['truepath'] && global.tauceti['overseer'] && global.tech['tau_red'] && global.tech.tau_red >= 5){
            let pop = 0; let injured = global.tauceti.overseer.injured; let morale = 0; let loyal = 0; let prod = 0;

            if (global.race['womling_friend']){
                loyal += 25 + (support_on['overseer'] * actions.tauceti.tau_red.overseer.val());
                morale += 75 + (support_on['womling_fun'] * actions.tauceti.tau_red.womling_fun.val());
            }
            else if (global.race['womling_god']){
                loyal += 75 + (support_on['overseer'] * actions.tauceti.tau_red.overseer.val());
                morale += 40 + (support_on['womling_fun'] * actions.tauceti.tau_red.womling_fun.val());
            }
            else if (global.race['womling_lord']){
                loyal += support_on['overseer'] * actions.tauceti.tau_red.overseer.val();
                morale += 30 + (support_on['womling_fun'] * actions.tauceti.tau_red.womling_fun.val());
            }

            let vil_pop = global.tech['womling_pop'] && global.tech.womling_pop >= 2 ? 6 : 5;
            pop = support_on['womling_village'] * vil_pop;
            let farmers = support_on['womling_farm'] * 2;
            if (farmers > pop){ farmers = pop; }
            let crop_per_farmer = global.tech['womling_pop'] ? 8 : 6;
            if (global.tech['womling_gene']){ crop_per_farmer += 2; }
            if (pop > farmers * crop_per_farmer){
                pop = farmers * crop_per_farmer;
            }
            let unemployed = pop - farmers - injured;

            let scientist = 0;
            if (support_on['womling_lab']){
                scientist = support_on['womling_lab'];
                if (scientist > unemployed){ scientist = unemployed; }
                unemployed -= scientist;

                let gain = scientist * Math.round(25000 * global.tauceti.overseer.prod / 100);
                $ctx.caps['Knowledge'] += gain;
                breakdown.c.Knowledge[loc('interstellar_laboratory_title')] = gain+'v';

                if (Math.rand(0,10) < global.tauceti.womling_lab.scientist){
                    global.tauceti.womling_lab.tech += Math.rand(0,global.tauceti.womling_lab.scientist + 1);
                    let expo = global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5 ? 4.9 : 5;
                    if (global.race['lone_survivor']){ expo -= 0.1; }
                    if (global.tauceti.womling_lab.tech >= Math.round((global.tech.womling_tech + 2) ** expo)){
                        global.tech.womling_tech++;
                        global.tauceti.womling_lab.tech = 0;
                        messageQueue(loc('tau_red_womling_advancement',[global.tech.womling_tech]),'advanced',false,['progress']);
                        drawTech();
                    }
                }
            }

            let miners = support_on['womling_mine'] * 6;
            if (miners > unemployed){ miners = unemployed; }
            unemployed -= miners;

            let heal_chance = global.tech['tech_womling_firstaid'] ? 3 : 4;
            if (Math.rand(0,10) === 0){
                let raw = Math.rand(0,miners + scientist);
                if (raw > injured){
                    injured = raw;
                }
            }
            else if (injured > 0 && Math.rand(0,heal_chance) === 0){
                injured--;
            }

            if (global.tauceti.hasOwnProperty('womling_farm')){
                global.tauceti.womling_farm.farmers = farmers;
            }
            if (global.tauceti.hasOwnProperty('womling_mine')){
                global.tauceti.womling_mine.miners = miners;
            }
            if (global.tauceti.hasOwnProperty('womling_lab')){
                global.tauceti.womling_lab.scientist = scientist;
            }

            loyal -= miners;
            morale -= miners;
            morale -= farmers;
            morale -= injured;
            if (loyal > 100){ loyal = 100; }
            else if (loyal < 0){ loyal = 0; }
            if (morale > 100){ morale = 100; }
            else if (morale < 0){ morale = 0; }

            prod = Math.round((loyal + morale) / 2);
            global.tauceti.overseer.loyal = loyal;
            global.tauceti.overseer.morale = morale;
            global.tauceti.overseer.pop = pop;
            global.tauceti.overseer.working = farmers + miners + scientist;
            global.tauceti.overseer.injured = injured;
            global.tauceti.overseer.prod = prod;
        }

        ['inspired','distracted','stimulated','motivated'].forEach(function(t){
            if (global.race[t]){
                global.race[t]--;
                if (global.race[t] <= 0){
                    delete global.race[t];
                }
            }
        });

        let pop_loss = global.resource[global.race.species].amount - $ctx.caps[global.race.species];
        if (pop_loss > 0){
            if (global.race['orbit_decayed'] && global.stats.days === global.race['orbit_decay']){
                messageQueue(loc('tragic_death',[pop_loss]),'danger');
            }
            else {
                messageQueue(loc(pop_loss === 1 ? 'abandon1' : 'abandon2',[pop_loss]),'danger');
                global.civic.homeless += pop_loss;
            }
        }

        if (p_on['world_controller']){
            let boost = 0.25;
            if (global.interstellar['far_reach'] && p_on['far_reach'] > 0){
                boost += p_on['far_reach'] * 0.01;
            }
            if (global.tech.science >= 19){
                boost += 0.15;
            }
            let gain = Math.round($ctx.caps['Knowledge'] * boost);
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('space_dwarf_collider_title')] = gain+'v';
        }

        if (p_on['alien_outpost']){
            let iso = 0;
            if (global.tech['isolation']){
                iso = global.race['lone_survivor'] ? 3500000 : 6500000;
                $ctx.caps['Knowledge'] += iso;
            }
            let boost = 0.2;
            let gain = Math.round($ctx.caps['Knowledge'] * boost);
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('tech_alien_outpost')] = gain+iso+'v';
        }

        if (global.eden['fortress'] && global.tech.hasOwnProperty('celestial_warfare')){
            let warefare_bonus = global.tech.celestial_warfare * 10;
            if (warefare_bonus > 30){ warefare_bonus = 30; }
            global.eden.fortress.detector = 100 - warefare_bonus;
            if (support_on['bunker'] && global.tech.celestial_warfare >= 4){
                global.eden.fortress.detector -= support_on['bunker'] * 3;
                if (global.eden.fortress.detector < 0){ global.eden.fortress.detector = 0; }
            }
        }

        let tempCrates = $ctx.caps['Crates'], tempContainers = $ctx.caps['Containers'];
        Object.keys($ctx.caps).forEach(function (res){
            $ctx.caps['Crates'] -= global.resource[res].crates;
        });
        Object.keys($ctx.caps).forEach(function (res){
            $ctx.caps['Containers'] -= global.resource[res].containers;
        });
        if ($ctx.caps['Crates'] < 0){
            let diff = 0 - $ctx.caps['Crates'];
            Object.keys($ctx.caps).forEach(function (res){
                if (diff > 0){
                    let subAmount = global.resource[res].crates;
                    if (subAmount > diff){
                        subAmount = diff;
                    }
                    $ctx.caps['Crates'] += subAmount;
                    global.resource[res].crates -= subAmount;
                    diff -= subAmount;
                }
            });
        }
        if ($ctx.caps['Containers'] < 0){
            let diff = 0 - $ctx.caps['Containers'];
            Object.keys($ctx.caps).forEach(function (res){
                if (diff > 0){
                    let subAmount = global.resource[res].containers;
                    if (subAmount > diff){
                        subAmount = diff;
                    }
                    $ctx.caps['Containers'] += subAmount;
                    global.resource[res].containers -= subAmount;
                    diff -= subAmount;
                }
            });
        }

        breakdown.c.Crates[loc('crates_used')] = ($ctx.caps['Crates'] - tempCrates) + 'v';
        breakdown.c.Containers[loc('crates_used')] = ($ctx.caps['Containers'] - tempContainers) + 'v';

        let create_value = crateValue();
        let container_value = containerValue();

        let aetherStorageMult = 1;
        if (global.prestige.hasOwnProperty('Aether') && global.settings.aetherStorage > 0){
            let draw = Math.min(global.settings.aetherStorage, global.prestige.Aether.count);
            if (draw > 0){
                global.prestige.Aether.count -= draw;
                aetherStorageMult = 1 + (draw / 0.00000000001);
            }
        }

        Object.keys($ctx.caps).forEach(function (res){
            // Stock portfolio storage bonus: +1% storage per lot held of that resource's company. Applied to the base storage
            // only, BEFORE crates and containers are added, so it does not enlarge what crates/containers give.
            if (global.stocks && global.stocks.market && global.stocks.market[res] && global.stocks.market[res].lots > 0){
                let mult = storageBonus(global.stocks.market[res].lots);
                $ctx.caps[res] *= mult;
                if (breakdown.c[res]){
                    // Breakdown values are parsed as parseFloat(raw.slice(0,-1)) - a number plus one suffix char
                    // ('v' for a flat amount, '%' for a bonus). 'x1.87' broke that (sliced to 'x1.8', NaN, silently
                    // dropped from the tooltip), which is why this line never showed up next to the others. Written
                    // as a '%' bonus instead, same convention as the production bonus below in stocks.js.
                    breakdown.c[res][loc('stock_bonus_label')] = +((mult - 1) * 100).toFixed(2) + '%';
                }
            }
            let crate = global.resource[res].crates * create_value;
            $ctx.caps[res] += crate;
            let container = global.resource[res].containers * container_value;
            $ctx.caps[res] += container;
            if (res !== 'Money' && res !== global.race.species){
                $ctx.caps[res] *= aetherStorageMult;
            }
            if (breakdown.c[res]){
                breakdown.c[res][loc('resource_Crates_plural')] = crate+'v';
                breakdown.c[res][loc('resource_Containers_plural')] = container+'v';
            }
            global.resource[res].max = $ctx.caps[res];
            if (global.resource[res].amount > global.resource[res].max && res != 'Sus' && res != 'Money'){
                global.resource[res].amount = global.resource[res].max;
            }
            else if (global.resource[res].amount < 0){
                //global.resource[res].amount = 0;
            }
            if (global.resource[res].amount >= global.resource[res].max * 0.99){
                if (!$(`#res${res} .count`).hasClass('has-text-warning')){
                    $(`#res${res} .count`).addClass('has-text-warning');
                }
            }
            else if ($(`#res${res} .count`).hasClass('has-text-warning')){
                $(`#res${res} .count`).removeClass('has-text-warning');
            }
        });

        let unlock_servants = false;
        let total_servants = 0;
        let not_scavanger_jobs_avail = 0;
        Object.keys($ctx.lCaps).forEach(function (job){
            if (global.civic[job].max === -1 && global.civic[job].display && job !== 'unemployed' && job !== 'scavenger'){
                not_scavanger_jobs_avail++;
            }
        });

        // Limit craftsmen for resources that require specific structs. Combined craftsman worker limits are done below.
        ['Scarletite','Quantium'].forEach(function (res){
            limitCraftsmen(res);
        });

        Object.keys($ctx.lCaps).forEach(function (job){
            global.civic[job].max = $ctx.lCaps[job];
            if (global.civic[job].workers > global.civic[job].max && global.civic[job].max !== -1){
                global.civic[job].workers = global.civic[job].max;
            }
            else if (!global.civic[job].display || global.civic[job].workers < 0){
                global.civic[job].workers = 0;
            }

            if (global.race['servants']){
                if (global.civic[job].max === -1 && !global.race.servants.jobs.hasOwnProperty(job)){
                    global.race.servants.jobs[job] = 0;
                    unlock_servants = true;
                }
                if (global.race.servants.jobs.hasOwnProperty(job)){
                    if (!global.civic[job].display && (job !== 'scavenger' || not_scavanger_jobs_avail > 0)){
                        global.race.servants.jobs[job] = 0;
                    }
                    else {
                        total_servants += global.race.servants.jobs[job];
                    }
                    if (total_servants > global.race.servants.max && global.race.servants.jobs[job] > 0){
                        global.race.servants.jobs[job]--;
                        total_servants--;
                    }
                }
            }
        });
        if (unlock_servants){
            loadServants();
        }
        else if (global.race['servants']){
            global.race.servants['force_scavenger'] = not_scavanger_jobs_avail === 0 ? true : false;
            global.race.servants.used = total_servants;
        }
}

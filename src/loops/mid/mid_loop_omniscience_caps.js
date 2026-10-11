// Batas Omniscience, alien outpost isolasi, archaeology, dan embassy symposium. Dulu bagian dari midLoop_s4.
import { global, breakdown, support_on, p_on, gal_on } from '../../core/vars.js';
import { actions, hooks } from '../../core/registries.js';
import { loc } from '../../core/locale.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';
import { piracy } from '../../space/space_requirements.js';
import { galaxy_ship_types, gatewayArmada } from '../../space/space.js';

export function midLoopOmniscienceCaps($ctx){
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
            let sup = hooks.hellSupression('ruins');
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
}

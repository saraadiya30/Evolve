// Produksi Helium-3 dan Deuterium per tick (moon base, gas mining, harvester, raider) beserta label hunger.
import { global, breakdown, gal_on, p_on, support_on, int_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { production, teamster } from '../../resources/prod.js';
import { loc } from '../../core/locale.js';
import { piracy } from '../../space/space_requirements.js';
import { syndicate } from '../../truepath/orbit_math.js';

export function fastLoopHelium($ctx){
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
}

// Produksi Neutronium per tick (outpost, neutron miner, raider, tambang, kapal ekstraktor).
import { global, breakdown, gal_on, p_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { production, teamster } from '../../resources/prod.js';
import { loc } from '../../core/locale.js';
import { piracy } from '../../space/space_requirements.js';
import { syndicate } from '../../truepath/orbit_math.js';

export function fastLoopNeutronium($ctx){
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
}

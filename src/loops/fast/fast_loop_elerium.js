// Produksi Elerium per tick (kapal, prospector, tambang, Kuiper).
import { global, breakdown, p_on, support_on, int_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { production, teamster } from '../../resources/prod.js';
import { loc } from '../../core/locale.js';
import { jobName } from '../../civics/jobs/job_name.js';
import { syndicate } from '../../truepath/orbit_math.js';

export function fastLoopElerium($ctx){
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
}

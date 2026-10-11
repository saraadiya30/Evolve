// Produksi Orichalcum per tick (s_gate, tambang, kapal ekstraktor). Dulu bagian dari fastLoopCore_s13.
import { global, breakdown, p_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { production } from '../../resources/prod.js';
import { loc } from '../../core/locale.js';
import { piracy } from '../../space/space_requirements.js';
import { syndicate } from '../../truepath/orbit_math.js';

export function fastLoopOrichalcum($ctx){
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
}

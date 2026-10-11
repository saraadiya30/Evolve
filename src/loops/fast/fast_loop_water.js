// Produksi Water per tick (water freighter, siphon, dan sumber lain). Dulu ujung fastLoopCore_s10.
import { global, breakdown, p_on, support_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { production } from '../../resources/prod.js';
import { loc } from '../../core/locale.js';
import { syndicate } from '../../truepath/orbit_math.js';

export function fastLoopWater($ctx){
        // Water
        if (global.resource.Water.display){
            if (support_on['water_freighter']){
                let synd = syndicate('spc_enceladus');

                let base = production('water_freighter') * support_on['water_freighter'] * production('psychic_boost','Water');;
                let delta = base * $ctx.hunger * $ctx.global_multiplier * synd * $ctx.zigVal;

                breakdown.p['Water'][loc('space_water_freighter_title')] = base + 'v';
                if (base > 0){
                    breakdown.p['Water'][`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                    breakdown.p['Water'][`ᄂ${loc('space_red_ziggurat_title')}`] = (($ctx.zigVal - 1) * 100) + '%';
                    breakdown.p['Water'][`ᄂ${loc('hunger')}`] = (($ctx.hunger - 1) * 100) + '%';
                }

                modRes('Water', delta * $ctx.time_multiplier);
            }

            if (global.tech['isolation'] && global.tauceti['tau_farm'] && p_on['tau_farm']){
                let colony_val = 1 + ((support_on['colony'] || 0) * 0.5);

                let base = production('tau_farm','water') * p_on['tau_farm'] * production('psychic_boost','Water');
                let delta = base * $ctx.global_multiplier * colony_val;

                breakdown.p['Water'][loc('tau_home_tau_farm')] = base + 'v';
                if (base > 0){
                    breakdown.p['Water'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                }

                modRes('Water', delta * $ctx.time_multiplier);
            }
        }
}

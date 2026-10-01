// Produksi Uranium per tick (mining droid, tambang Uranium, Kuiper).
import { global, breakdown, p_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { production } from '../../resources/prod.js';
import { loc } from '../../core/locale.js';
import { syndicate } from '../../truepath/orbit_math.js';

export function fastLoopUranium($ctx){
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
}

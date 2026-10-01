// Produksi Bolognium per tick (s_gate).
import { global, breakdown, gal_on, p_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { production } from '../../resources/prod.js';
import { loc } from '../../core/locale.js';
import { piracy } from '../../space/space_requirements.js';

export function fastLoopBolognium($ctx){
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
}

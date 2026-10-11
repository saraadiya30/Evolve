// Hasil eksplorasi per tick: Cipher dari lander, unlock dig_control dari digsite, dan unlock dish_reset dari oven. Dulu ujung fastLoopCore_s9.
import { global, breakdown, p_on, support_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { production } from '../../resources/prod.js';
import { loc } from '../../core/locale.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { syndicate } from '../../truepath/orbit_math.js';

export function fastLoopExplorationUnlocks($ctx){
        if (!global.tech['isolation'] && global.space['lander'] && global.space['crashed_ship'] && global.space.crashed_ship.count === 100){
            let synd = syndicate('spc_triton');
            let base = support_on['lander'] * production('lander');
            let delta = base * $ctx.global_multiplier * synd * $ctx.hunger;

            breakdown.p['Cipher'][loc('space_lander_title')] = base + 'v';
            breakdown.p['Cipher'][`ᄂ${loc('space_syndicate')}+0`] = -((1 - synd) * 100) + '%';
            breakdown.p['Cipher'][`ᄂ${loc('hunger')}`] = (($ctx.hunger - 1) * 100) + '%';

            modRes('Cipher', delta * $ctx.time_multiplier);

            if (global.resource.Cipher.display && global.tech['outer'] && global.tech.outer === 2){
                global.tech.outer = 3;
                drawTech();
            }
        }

        if (!global.tech['isolation'] && global.space['digsite'] && global.space.digsite.count === 100){
            if (!global.tech['dig_control']){
                global.tech['dig_control'] = 1;
                drawTech();
            }

            let synd = syndicate('spc_eris');
            let shock_base = support_on['shock_trooper'] * production('shock_trooper');
            let tank_base = support_on['tank'] * production('tank');

            if (support_on['shock_trooper']){
                breakdown.p['Cipher'][loc('space_shock_trooper_title')] = shock_base + 'v';
                breakdown.p['Cipher'][`ᄂ${loc('space_syndicate')}+1`] = -((1 - synd) * 100) + '%';
            }
            if (support_on['tank']){
                breakdown.p['Cipher'][loc('space_tank_title')] = tank_base + 'v';
                breakdown.p['Cipher'][`ᄂ${loc('space_syndicate')}+2`] = -((1 - synd) * 100) + '%';
            }

            let delta = (shock_base + tank_base) * $ctx.global_multiplier * synd;
            modRes('Cipher', delta * $ctx.time_multiplier);
        }
        
        if(global.portal['oven_complete'] && p_on['oven_complete'] && !global.tech['dish_reset'] && global.portal['devilish_dish'].done >= 100){
            global.tech['dish_reset'] = 1;
            drawTech();
        }
}

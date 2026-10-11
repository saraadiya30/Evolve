// Batas garnisun dari garrison, barracks, cruiser, brute, s_gate starbase, bunker, dan fire support base. Dulu ujung midLoop_s2.
import { global, int_on, support_on, p_on } from '../../core/vars.js';
import { actions } from '../../core/registries.js';
import { jobScale } from '../../civics/jobs/job_scale.js';

export function midLoopGarrisonCaps($ctx){
        if (global.city['garrison']){
            $ctx.lCaps['garrison'] += global.city.garrison.on * actions.city.garrison.soldiers();
        }
        if (global.space['space_barracks'] && !global.race['fasting']){
            let soldiers = actions.space.spc_red.space_barracks.soldiers();
            $ctx.lCaps['garrison'] += Math.round(global.space.space_barracks.on * soldiers);
        }
        if (global.interstellar['cruiser']){
            let soldiers = actions.interstellar.int_proxima.cruiser.soldiers();
            $ctx.lCaps['garrison'] += int_on['cruiser'] * soldiers;
        }
        if (global.portal['brute']){
            let soldiers = actions.portal.prtl_wasteland.brute.soldiers();
            $ctx.lCaps['garrison'] += global.portal.brute.on * soldiers;
        }
        if (global.race['wish'] && global.race['wishStats']){
            $ctx.lCaps['garrison'] += jobScale(global.race.wishStats.troop);
        }
        if (p_on['s_gate'] && global.galaxy['starbase']){
            let soldiers = actions.galaxy.gxy_gateway.starbase.soldiers();
            $ctx.lCaps['garrison'] += p_on['starbase'] * soldiers;
        }
        if (global.eden['bunker']){
            let soldiers = actions.eden.eden_asphodel.bunker.soldiers();
            $ctx.lCaps['garrison'] += support_on['bunker'] * soldiers;
        }
        if (global.eden['fire_support_base'] && global.eden.fire_support_base.count === 100){
            $ctx.lCaps['garrison'] += actions.eden.eden_elysium.fire_support_base.soldiers();
        }
}

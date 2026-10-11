// Batas pekerja dari cement plant, eden cement, red factory, dan parasite. Dulu bagian dari midLoop_s2.
import { global, p_on } from '../../core/vars.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { traits } from '../../core/registries.js';

export function midLoopFactoryJobCaps($ctx){
        if (global.city['cement_plant']){
            $ctx.lCaps['cement_worker'] += jobScale(global.city.cement_plant.count * 2);
        }
        if (global.eden['eden_cement']){
            let ec = p_on['eden_cement'] || 0;
            $ctx.lCaps['cement_worker'] += jobScale(ec * 5);
        }
        if (global.race['orbit_decayed'] && p_on['red_factory']){
            $ctx.lCaps['cement_worker'] += jobScale(p_on['red_factory']);
        }
        if (global.race['parasite'] && !global.tech['isolation']){
            $ctx.lCaps['garrison'] += jobScale(traits.parasite.vars()[0]);
        }
}

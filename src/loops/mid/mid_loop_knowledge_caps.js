// Batas Knowledge dari university, outpost lone survivor, dan library, serta $ctx.pirate_alien2.
import { global, breakdown } from '../../core/vars.js';
import { actions, traits } from '../../core/registries.js';
import { loc } from '../../core/locale.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';
import { faithTempleCount } from '../../resources/aether_alchemy.js';
import { govActive } from '../../governor/gov_active.js';
import { piracy } from '../../space/space_requirements.js';

export function midLoopKnowledgeCaps($ctx){
        $ctx.pirate_alien2 = piracy('gxy_alien2');
        if (global.city['university']){
            let gain = actions.city.university.knowVal() * global.city.university.count;
            $ctx.lCaps['professor'] += jobScale(global.city.university.count);
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('city_university')] = gain+'v';
        }
        if (global.race['lone_survivor'] && global.tauceti['alien_outpost']){
            $ctx.lCaps['professor'] += jobScale(global.tauceti.alien_outpost.count);
        }
        if (global.city['library']){
            let shelving = 125;
            if (global.race['nearsighted']){
                shelving *= 1 - (traits.nearsighted.vars()[0] / 100);
            }
            if (global.race['studious']){
                shelving *= 1 + (traits.studious.vars()[1] / 100);
            }
            let fathom = fathomCheck('elven');
            if (fathom > 0){
                shelving *= 1 + (traits.studious.vars(1)[1] / 100 * fathom);
            }
            if (global.tech['science'] && global.tech['science'] >= 8){
                shelving *= 1.4;
            }
            if (global.tech['science'] && global.tech['science'] >= 5){
                let sci_val = workerScale(global.civic.scientist.workers,'scientist');
                if (global.race['high_pop']){
                    sci_val = highPopAdjust(sci_val);
                }
                shelving *= 1 + (sci_val * 0.12);
            }
            if (global.tech['anthropology'] && global.tech['anthropology'] >= 2){
                shelving *= 1 + faithTempleCount() * 0.05;
            }
            let teachVal = govActive('teacher',0);
            if (teachVal){
                shelving *= 1 + (teachVal / 100);
            }
            let athVal = govActive('athleticism',2);
            if (athVal){
                shelving *= 1 - (athVal / 100);
            }
            let muckVal = govActive('muckraker',1);
            if (muckVal){
                shelving *= 1 + (muckVal / 100);
            }
            let gain = Math.round(global.city.library.count * shelving);
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('city_library')] = gain+'v';
            if (global.tech['science'] && global.tech['science'] >= 3){
                global.civic.professor.impact = 0.5 + (global.city.library.count * 0.01)
            }
        }
}

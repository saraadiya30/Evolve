// Bonus batas dari shrine, gen ancients (temple, ziggurat, rectory), dan wish.
import { global, breakdown, p_on } from '../../core/vars.js';
import { templeCount } from '../../functions/temple_count.js';
import { loc } from '../../core/locale.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { shrineBonusActive, getShrineBonus } from '../../functions/run_stats_helpers.js';

export function midLoopBonusCaps($ctx){
        if (shrineBonusActive()){
            let getShrineResult = getShrineBonus('know');
            $ctx.caps['Knowledge'] += getShrineResult.add;
            breakdown.c.Knowledge[loc('city_shrine')] = getShrineResult.add+'v';
        }
        if (global.city['temple'] && global.genes['ancients'] && global.genes['ancients'] >= 2){
            $ctx.lCaps['priest'] += jobScale(templeCount());
        }
        if (global.space['ziggurat'] && global.genes['ancients'] && global.genes['ancients'] >= 4){
            $ctx.lCaps['priest'] += jobScale(templeCount(true));
        }
        if (global.eden['rectory'] && global.genes['ancients'] && global.genes['ancients'] >= 2 && p_on['rectory']){
            $ctx.lCaps['priest'] += jobScale(p_on['rectory']);
        }
        if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.priest){
            $ctx.lCaps['priest'] += jobScale(global.race.wishStats.priest);
        }
}

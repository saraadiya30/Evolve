// Batas pekerja pit miner dan torturer.
import { global, support_on } from '../../core/vars.js';
import { jobScale } from '../../civics/jobs/job_scale.js';

export function midLoopMiscJobCaps($ctx){
        if (global.tauceti['mining_pit']){
            $ctx.lCaps['pit_miner'] += jobScale(support_on['mining_pit'] * (global.tech['isolation'] ? 6 : 8));
            $ctx.caps['Materials'] += support_on['mining_pit'] * 1000000;
        }

        if (global.civic.torturer.display && global.tech['unfathomable'] && global.tech.unfathomable >= 2){
            $ctx.lCaps['torturer'] = global.city.captive_housing.count;
        }
}

// Label breakdown Neutronium dan Iridium per tick (shrine, hunger).
import { breakdown } from '../../core/vars.js';
import { shrineBonusActive } from '../../functions/run_stats_helpers.js';
import { loc } from '../../core/locale.js';

export function fastLoopMiningBreakdown($ctx){
        breakdown.p['Neutronium'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';

        if (shrineBonusActive()){
            breakdown.p['Iridium'][loc('city_shrine')] = (($ctx.shrineMetal.mult - 1) * 100).toFixed(1) + '%';
        }
        breakdown.p['Iridium'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
}

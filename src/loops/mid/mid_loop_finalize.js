// Penutup midLoop: update soul forge dan checkAchievements. Dulu ujung midLoop_s7.
import { p_on } from '../../core/vars.js';
import { vBind } from '../../functions/dom_helpers.js';
import { checkAchievements } from '../../achievements/achievement_logic.js';

export function midLoopFinalize($ctx){
        if (p_on['soul_forge']){
            vBind({el: `#fort`},'update');
        }

        checkAchievements();
}

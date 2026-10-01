// Palace Eden per tick: drain energi spirit vacuum, soul compactor, dan unlock palace.
import { global, p_on } from '../../core/vars.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { renderEdenic } from '../../edenic/edenic_render.js';

export function fastLoopEdenPalace($ctx){
        if (global.eden['palace'] && p_on['spirit_vacuum'] && global.tech['isle']){
            let drain = 1653439 * p_on['spirit_vacuum'];
            if (global.tech.isle >= 6 && p_on['spirit_battery']){
                let battery = p_on['spirit_battery'] || 0;
                let boost = 0.08;
                if (global.race['warlord'] && global.eden['corruptor'] && global.tech?.asphodel >= 13){
                    boost *= 1 + (p_on['corruptor'] || 0) * 0.03;
                }
                drain *= 1 + (battery * boost);
            }

            if (global.eden['soul_compactor'] && global.eden.soul_compactor.count === 1){
                global.eden.soul_compactor.energy += Math.round(drain / 2);
                if (global.eden.soul_compactor.energy >= 1000000000){
                    global.eden.soul_compactor.energy -= 1000000000;
                    global.resource.Soul_Gem.amount++;
                    global.eden.soul_compactor.report++;
                }
            }

            if (global.eden.palace.energy > 0){
                global.eden.palace.rate = drain;
                global.eden.palace.energy -= drain * $ctx.time_multiplier;
                global.eden.palace.energy = Math.round(global.eden.palace.energy);

                if (global.eden.palace.energy <= 0){
                    global.eden.palace.energy = 0;
                    global.tech['palace'] = 1;
                    drawTech();
                    renderEdenic();
                }
            }
        }
}

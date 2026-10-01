// Event trait per siklus: fasting (oven complete), asphodel, dan cannibalize.
import { global, p_on } from '../../core/vars.js';
import { actions, traits } from '../../core/registries.js';
import { updateDesc } from '../../actions/core/action_costs.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { loc } from '../../core/locale.js';
import { messageQueue } from '../../functions/message_log.js';
import { timeFormat } from '../../functions/time_format.js';

export function midLoopTraitEvents($ctx){
        if(global.race['fasting'] && global.portal['oven_complete']){
            let progress = 0;
            if(p_on['oven_complete']){
                progress = 0.00025;
                if(global.portal['dish_life_infuser'] && global.portal['dish_life_infuser'].on){
                    progress *= 1 + (0.15 * global.portal['dish_life_infuser'].on);
                }
                if(global.portal['dish_soul_steeper'] && global.portal['dish_soul_steeper'].on && global.portal['spire']){
                    let hunger = 0.5;
                    if (global.race['angry']){
                        hunger -= traits.angry.vars()[0] / 100;
                    }
                    if (global.race['malnutrition']){
                        hunger += traits.malnutrition.vars()[0] / 100;
                    }
                    let mult = (0.03 + (global.race['malnutrition'] ? 0.01 : 0) + (global.race['angry'] ? -0.01 : 0));
                    let working = Math.min(global.portal['dish_soul_steeper'].on, Math.floor(hunger / mult));
                    progress *= 1 + (0.05 * (global.portal['spire'].count-1) * working);
                }
                global.portal['devilish_dish'].done += progress;
                global.portal['devilish_dish'].done = Math.min(global.portal['devilish_dish'].done, 100);
                global.portal['devilish_dish'].count = Math.floor(global.portal['devilish_dish'].done);
                if(global.portal['devilish_dish'].done >= 0.05 && global.tech['dish'] === 3){
                    messageQueue(loc('dish_progress'),'info',false,['progress']);
                    global.tech['dish'] = 4;
                    drawTech();
                }
            }
            global.portal['devilish_dish'].time = progress === 0 ? timeFormat(-1) : timeFormat((100 - global.portal['devilish_dish'].done) / progress);
        }

        if (global.tech['asphodel'] && global.tech.asphodel === 4 && Math.rand(0,25) === 0){
            global.tech['asphodel'] = 5;
            drawTech();
            messageQueue(loc('eden_asphodel_hostile'),'info',false,['progress']);
        }

        if (global.race['cannibalize'] && global.city['s_alter']){
            if (global.city.s_alter.rage > 0){
                global.city.s_alter.rage--;
            }
            if (global.city.s_alter.regen > 0){
                global.city.s_alter.regen--;
            }
            if (global.city.s_alter.mind > 0){
                global.city.s_alter.mind--;
            }
            if (global.city.s_alter.mine > 0){
                global.city.s_alter.mine--;
            }
            if (global.city.s_alter.harvest > 0){
                global.city.s_alter.harvest--;
            }

            if ($(`#popper[data-id="city-s_alter"]`).length > 0){
                updateDesc(actions.city.s_alter,'city','s_alter');
            }
        }
}

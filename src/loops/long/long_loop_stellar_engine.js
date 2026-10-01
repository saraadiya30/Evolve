// Stellar engine dan unlock whitehole per detik.
import { global } from '../../core/vars.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { messageQueue } from '../../functions/message_log.js';
import { loc } from '../../core/locale.js';

export function longLoopStellarEngine($ctx){
        if (!global.tech['whitehole'] && global.interstellar['stellar_engine'] && global.interstellar.stellar_engine.exotic >= 0.025){
            global.tech['whitehole'] = 1;
            if (global.tech['stablized']){
                delete global.tech['stablized'];
            }
            if (!global.race.governor.config.hasOwnProperty('trash') || (global.race.governor.config.hasOwnProperty('trash') && !global.race.governor.config.trash['stab'])){
                messageQueue(loc('interstellar_blackhole_unstable'),'danger',false,['progress']);
            }
            drawTech();
        }
        else if (global.interstellar['stellar_engine'] && global.interstellar.stellar_engine.exotic >= 0.025){
            if (global.tech['whitehole'] && global.tech['stablized']){
                delete global.tech['stablized'];
                drawTech();
            }
        }
}

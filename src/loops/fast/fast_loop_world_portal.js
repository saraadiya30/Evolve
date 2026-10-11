// World controller dan kemajuan portal/fortress per tick. Dulu bagian dari fastLoopCore_s14.
import { global, p_on } from '../../core/vars.js';
import { drawTech } from '../../actions/core/action_runner.js';

export function fastLoopWorldPortal($ctx){
        if (p_on['world_controller'] && p_on['world_controller'] > 0){
            if (global.tech['wsc'] === 0){
                global.tech['wsc'] = 1;
                drawTech();
            }
        }
        else if (global.tech['wsc'] !== 0){
            global.tech['wsc'] = 0;
            drawTech();
        }

        if (global.tech['portal'] >= 2){
            if (global.portal.fortress.garrison > 0){
                global.tech['portal_guard'] = 1;
            }
            else {
                global.tech['portal_guard'] = 0;
            }
        }
}

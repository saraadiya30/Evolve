// Unlock piracy saat firstRun. Dulu ujung fastLoopCore_s14.
import { global } from '../../core/vars.js';
import { vBind } from '../../functions/dom_helpers.js';
import { renderSpace } from '../../space/space_requirements.js';
import { firstRun } from '../../core/run_state.js';

export function fastLoopPiracyUnlock($ctx){
        if (firstRun){
            if (global.tech['piracy']){
                renderSpace();
            }
            if (global.settings.portal.ruins){
                vBind({el: `#srprtl_ruins`},'update');
                vBind({el: `#foundry`},'update');
            }
            if (global.settings.portal.gate){
                vBind({el: `#srprtl_gate`},'update');
            }
        }
}

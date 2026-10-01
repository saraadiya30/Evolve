import { global } from '../../core/vars.js';
import { clearElement } from '../../functions/dom_helpers.js';
import { deepClone } from '../../core/object_utils.js';
import { payCosts } from '../../actions/core/action_costs.js';
import { mechSize } from './mechbay.js';
import { drawMechLab_s1, drawMechLab_s2 } from '../../sections/portal/draw_mech_lab_parts.js';
import { buildMech } from './mech_valid.js';



export function drawMechLab(){
    const $ctx = {};
    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 4)){
        return;
    }
    clearElement($('#mechLab'));
    if (global.portal.hasOwnProperty('mechbay') && global.settings.showMechLab){
        drawMechLab_s1($ctx);
        drawMechLab_s2($ctx);
    }
}

export function buildMechQueue(action){
    let size = mechSize(action.bp.size);
    let avail = global.portal.mechbay.max - global.portal.mechbay.bay;
    if (avail >= size && payCosts(false, action.cost)){
        buildMech(deepClone(action.bp,true));
        return true;
    }
    return false;
}


import { global } from '../../core/vars.js';
import { bloodwar_s1, bloodwar_s2 } from '../../sections/portal/bloodwar_parts.js';
import { warlordSetup_s1, warlordSetup_s2 } from '../../sections/portal/warlord_setup_parts.js';

// Dua fungsi pembungkus kecil dari portal.js (dulu bloodwar_panel.js dan warlord_setup.js), digabung jadi satu file.
// portal.js tetap mengekspor ulang nama yang tadinya ter-ekspor.

export function bloodwar(){
    const $ctx = {};
    bloodwar_s1($ctx);
    bloodwar_s2($ctx);
}

export function warlordSetup(){
    const $ctx = {};
    if (global.race['warlord'] && global.race.universe === 'evil'){
        warlordSetup_s1($ctx);
        warlordSetup_s2($ctx);
    }
}

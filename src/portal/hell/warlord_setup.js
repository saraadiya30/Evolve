import { global } from '../../core/vars.js';
import { bloodwar_s1, bloodwar_s2 } from '../../sections/portal/bloodwar_parts.js';
import { warlordSetupSequence } from '../../sections/portal/warlord_setup_sequence.js';


export function bloodwar(){
    const $ctx = {};
    bloodwar_s1($ctx);
    bloodwar_s2($ctx);
}

export function warlordSetup(){
    const $ctx = {};
    if (global.race['warlord'] && global.race.universe === 'evil'){
        warlordSetupSequence($ctx);
    }
}

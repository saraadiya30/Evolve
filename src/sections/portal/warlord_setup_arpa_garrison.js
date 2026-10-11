// Garnisun, sekuens ARPA, tech railway, dan tipe monument awal skenario Warlord. Dulu bagian dari warlordSetup_s1/_s2 (pecahan mekanis).
import { global } from '../../core/vars.js';
import { hooks } from '../../core/registries.js';

export function warlordSetupArpaGarrison($ctx){
        global.civic['garrison'] = {
            display: true,
            disabled: false,
            progress: 0,
            tactic: 0,
            workers: 2,
            wounded: 0,
            raid: 0,
            max: 2
        };

        global.arpa['sequence'] = {
            max: 50000,
            progress: 0,
            time: 50000,
            on: true,
            boost: false,
            auto: false,
            labs: 0,
        };

        global.tech['stock_exchange'] = 0;
        global.tech['monuments'] = 0;
        global.tech['supercollider'] = 0;
        global.tech['railway'] = 0;
        global.arpa['m_type'] = hooks.arpa('Monument');
}

import { global } from './vars.js';
import { warlordSetup_s1, warlordSetup_s2 } from './sec_warlordSetup_1.js';

// Fungsi-fungsi dipindah dari portal.js (urutan sumber dipertahankan). portal.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function warlordSetup(){
    const $ctx = {};
    if (global.race['warlord'] && global.race.universe === 'evil'){
        warlordSetup_s1($ctx);
        warlordSetup_s2($ctx);
    }
}

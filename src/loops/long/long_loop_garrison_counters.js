// Penghitung mundur garnisun (fatigue, protest, m_use) dan rainbow per detik.
import { global } from '../../core/vars.js';
import { traits } from '../../core/registries.js';

export function longLoopGarrisonCounters($ctx){
        if (global.civic.garrison['fatigue'] && global.civic.garrison.fatigue > 0){
            global.civic.garrison.fatigue--;
        }

        if (global.civic.garrison['protest'] && global.civic.garrison.protest > 0){
            global.civic.garrison.protest--;
        }

        if (global.civic.garrison['m_use'] && global.civic.garrison.m_use > 0){
            let merc_bound = global.tech['mercs'] && global.tech['mercs'] >= 2 ? 3 : 4;
            let max_merc_roll = global.race['high_pop'] ? traits.high_pop.vars()[0] : 1;
            let num_restore = 0;
            for (let roll_num = 0; roll_num < max_merc_roll; roll_num++){
                if (Math.rand(0, merc_bound) === 0){
                    num_restore++;
                }
            }
            global.civic.garrison.m_use = Math.max(0, global.civic.garrison.m_use - num_restore);
        }

        if (global.race['rainbow_active'] && global.race['rainbow_active'] > 1){
            global.race['rainbow_active']--;
        }
}

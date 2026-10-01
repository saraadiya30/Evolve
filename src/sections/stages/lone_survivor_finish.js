// Penutup skenario Lone Survivor: tech akhir, flag truepath/isolation, lalu gambar ulang tech, Tau Ceti, ARPA, dan foundry.
import { global } from '../../core/vars.js';
import { hooks } from '../../core/registries.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { loadFoundry } from '../../civics/jobs/foundry_panel.js';

export function loneSurvivorFinish($ctx){
        global.tech['stock_exchange'] = 0;
        global.tech['monuments'] = 0;
        global.tech['supercollider'] = 0;
        global.tech['tp_depot'] = 0;
        global.tech['railway'] = 0;
        global.tech['isolation'] = 1;
        global.race['truepath'] = 1;
        global.arpa['m_type'] = hooks.arpa('Monument');

        drawTech();
        hooks.renderTauCeti();
        hooks.arpa('Physics');
        loadFoundry();
}

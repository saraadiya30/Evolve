import { global } from '../../../core/vars.js';
import { jobScale } from '../../../civics/jobs.js';
import { buildGarrison } from '../../../civics/civics.js';
import { defineGovernor, removeTask } from '../../../governor/governor.js';
import { techsPart5 } from '../registry.js';
import { techsPart5Part1 } from './rebar_to_indoctrination.js';
import { techsPart5Part2 } from './missionary_to_dyson_net.js';
import { techsPart5Part3 } from './dyson_sphere2_to_interstellar.js';
import { techsPart5Part4 } from './genesis_ship_to_infusion_confirm.js';

// Bagian 5 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
export function uniteEffect(){
    global.tech['world_control'] = 1;
    buildGarrison($('#garrison'),true);
    buildGarrison($('#c_garrison'),false);
    for (let i=0; i<3; i++){
        if (global.civic.foreign[`gov${i}`].occ){
            let occ_amount = jobScale(global.civic.govern.type === 'federation' ? 15 : 20);
            global.civic['garrison'].max += occ_amount;
            global.civic['garrison'].workers += occ_amount;
            global.civic.foreign[`gov${i}`].occ = false;
        }
        global.civic.foreign[`gov${i}`].buy = false;
        global.civic.foreign[`gov${i}`].anx = false;
        global.civic.foreign[`gov${i}`].sab = 0;
        global.civic.foreign[`gov${i}`].act = 'none';
    }
    removeTask('spy');
    removeTask('spyop');
    removeTask('combo_spy');
    defineGovernor();
}

Object.assign(techsPart5,
    techsPart5Part1,
    techsPart5Part2,
    techsPart5Part3,
    techsPart5Part4
);
export { techsPart5 };


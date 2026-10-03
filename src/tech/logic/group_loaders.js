// Penggabung (loader) semua grup techs: dulu 8 file group_loader.js (satu per folder grup), sekarang satu file.
// HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
// Urutan import = urutan tech.js lama (grup 1..8) supaya urutan evaluasi modul tidak berubah.
import { techsPart1, techsPart2, techsPart3, techsPart4, techsPart5, techsPart6, techsPart7, techsPart8 } from './registry.js';
import { techsPart1Part1 } from './club_to_elysis_process/club_to_torture.js';
import { techsPart1Part2 } from './club_to_elysis_process/thrall_quarters_to_adv_mulching.js';
import { techsPart1Part3 } from './club_to_elysis_process/agriculture_to_theatre.js';
import { techsPart1Part4 } from './club_to_elysis_process/playwright_to_elysis_process.js';
import { techsPart2Part1 } from './smelting_to_tourism/smelting_to_cranes.js';
import { techsPart2Part2 } from './smelting_to_tourism/titanium_crates_to_republic.js';
import { techsPart2Part3 } from './smelting_to_tourism/socialist_to_bonds.js';
import { techsPart2Part4 } from './smelting_to_tourism/steel_vault_to_tourism.js';
import { techsPart3Part1 } from './xeno_tourism_to_breeder_reactor/xeno_tourism_to_preparation_methods.js';
import { techsPart3Part2 } from './xeno_tourism_to_breeder_reactor/final_ingredient_to_quantum_computing.js';
import { techsPart3Part3 } from './xeno_tourism_to_breeder_reactor/virtual_reality_to_lake_analysis.js';
import { techsPart3Part4 } from './xeno_tourism_to_breeder_reactor/lake_threat_to_breeder_reactor.js';
import { techsPart4Part1 } from './mine_conveyor_to_cement/mine_conveyor_to_steel_shovel.js';
import { techsPart4Part2 } from './mine_conveyor_to_cement/titanium_shovel_to_steel_hoe.js';
import { techsPart4Part3 } from './mine_conveyor_to_cement/titanium_hoe_to_gauss_rifles.js';
import { techsPart4Part4 } from './mine_conveyor_to_cement/cyborg_soldiers_to_cement.js';
import { global } from '../../core/vars.js';
import { jobScale } from '../../civics/jobs.js';
import { buildGarrison } from '../../civics/civics.js';
import { defineGovernor, removeTask } from '../../governor/governor.js';
import { techsPart5Part1 } from './rebar_to_infusion_confirm/rebar_to_indoctrination.js';
import { techsPart5Part2 } from './rebar_to_infusion_confirm/missionary_to_dyson_net.js';
import { techsPart5Part3 } from './rebar_to_infusion_confirm/dyson_sphere2_to_interstellar.js';
import { techsPart5Part4 } from './rebar_to_infusion_confirm/genesis_ship_to_infusion_confirm.js';
import { techsPart6Part1 } from './stabilize_blackhole_to_protocol66a/stabilize_blackhole_to_xeno_linguistics.js';
import { techsPart6Part2 } from './stabilize_blackhole_to_protocol66a/xeno_culture_to_advanced_emplacement.js';
import { techsPart6Part3 } from './stabilize_blackhole_to_protocol66a/dial_it_to_11_to_concealment.js';
import { techsPart6Part4 } from './stabilize_blackhole_to_protocol66a/improved_concealment_to_protocol66a.js';
import { techsPart7Part1 } from './terraforming_tp_to_outer_tau_survey/terraforming_tp_to_adamantite_crates.js';
import { techsPart7Part2 } from './terraforming_tp_to_outer_tau_survey/bolognium_crates_tp_to_alien_outpost.js';
import { techsPart7Part3 } from './terraforming_tp_to_outer_tau_survey/jumpgates_to_decode_virus.js';
import { techsPart7Part4 } from './terraforming_tp_to_outer_tau_survey/vaccine_campaign_to_outer_tau_survey.js';
import { techsPart8Part1 } from './alien_research_to_ultimate_corruption/alien_research_to_outer_plane_study.js';
import { techsPart8Part2 } from './alien_research_to_ultimate_corruption/camouflage_to_divine_infuser.js';
import { techsPart8Part3 } from './alien_research_to_ultimate_corruption/might_to_ultimate_corruption.js';

// Bagian 1 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
Object.assign(techsPart1,
    techsPart1Part1,
    techsPart1Part2,
    techsPart1Part3,
    techsPart1Part4
);
export { techsPart1 };

// Bagian 2 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
Object.assign(techsPart2,
    techsPart2Part1,
    techsPart2Part2,
    techsPart2Part3,
    techsPart2Part4
);
export { techsPart2 };

// Bagian 3 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
Object.assign(techsPart3,
    techsPart3Part1,
    techsPart3Part2,
    techsPart3Part3,
    techsPart3Part4
);
export { techsPart3 };

// Bagian 4 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
Object.assign(techsPart4,
    techsPart4Part1,
    techsPart4Part2,
    techsPart4Part3,
    techsPart4Part4
);
export { techsPart4 };

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

// Bagian 6 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
Object.assign(techsPart6,
    techsPart6Part1,
    techsPart6Part2,
    techsPart6Part3,
    techsPart6Part4
);
export { techsPart6 };

// Bagian 7 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
Object.assign(techsPart7,
    techsPart7Part1,
    techsPart7Part2,
    techsPart7Part3,
    techsPart7Part4
);
export { techsPart7 };

// Bagian 8 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
Object.assign(techsPart8,
    techsPart8Part1,
    techsPart8Part2,
    techsPart8Part3
);
export { techsPart8 };

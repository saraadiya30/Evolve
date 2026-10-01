// Penggabung (loader) semua grup techs: dulu 8 file group_loader.js (satu per folder grup), sekarang satu file.
// HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
// Urutan import = urutan tech.js lama (grup 1..8) supaya urutan evaluasi modul tidak berubah.
import { techsPart1, techsPart2, techsPart3, techsPart4, techsPart5, techsPart6, techsPart7, techsPart8 } from '../../core/registries.js';
import { global } from '../../core/vars.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { buildGarrison } from '../../civics/military/government_operations.js';
import { defineGovernor, removeTask } from '../../governor/governor.js';

// Bagian 1 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
export { techsPart1 };

// Bagian 2 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
export { techsPart2 };

// Bagian 3 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
export { techsPart3 };

// Bagian 4 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
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

export { techsPart5 };

// Bagian 6 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
export { techsPart6 };

// Bagian 7 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
export { techsPart7 };

// Bagian 8 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
export { techsPart8 };

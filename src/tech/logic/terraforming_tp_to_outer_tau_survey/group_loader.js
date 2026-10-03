import { techsPart7 } from '../registry.js';
import { techsPart7Part1 } from './terraforming_tp_to_adamantite_crates.js';
import { techsPart7Part2 } from './bolognium_crates_tp_to_alien_outpost.js';
import { techsPart7Part3 } from './jumpgates_to_decode_virus.js';
import { techsPart7Part4 } from './vaccine_campaign_to_outer_tau_survey.js';

// Bagian 7 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
Object.assign(techsPart7,
    techsPart7Part1,
    techsPart7Part2,
    techsPart7Part3,
    techsPart7Part4
);
export { techsPart7 };


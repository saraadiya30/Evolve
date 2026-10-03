import { techsPart1 } from '../registry.js';
import { techsPart1Part1 } from './club_to_torture.js';
import { techsPart1Part2 } from './thrall_quarters_to_adv_mulching.js';
import { techsPart1Part3 } from './agriculture_to_theatre.js';
import { techsPart1Part4 } from './playwright_to_elysis_process.js';

// Bagian 1 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
Object.assign(techsPart1,
    techsPart1Part1,
    techsPart1Part2,
    techsPart1Part3,
    techsPart1Part4
);
export { techsPart1 };


import { techsPart1 } from './techs_registry.js';
import { techsPart1Part1 } from './tl1_1.js';
import { techsPart1Part2 } from './tl1_2.js';
import { techsPart1Part3 } from './tl1_3.js';
import { techsPart1Part4 } from './tl1_4.js';

// Bagian 1 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
Object.assign(techsPart1,
    techsPart1Part1,
    techsPart1Part2,
    techsPart1Part3,
    techsPart1Part4
);
export { techsPart1 };


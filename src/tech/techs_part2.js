import { techsPart2 } from './techs_registry.js';
import { techsPart2Part1 } from './tl2_1.js';
import { techsPart2Part2 } from './tl2_2.js';
import { techsPart2Part3 } from './tl2_3.js';
import { techsPart2Part4 } from './tl2_4.js';

// Bagian 2 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
Object.assign(techsPart2,
    techsPart2Part1,
    techsPart2Part2,
    techsPart2Part3,
    techsPart2Part4
);
export { techsPart2 };


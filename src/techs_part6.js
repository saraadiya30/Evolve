import { techsPart6 } from './techs_registry.js';
import { techsPart6Part1 } from './tl6_1.js';
import { techsPart6Part2 } from './tl6_2.js';
import { techsPart6Part3 } from './tl6_3.js';
import { techsPart6Part4 } from './tl6_4.js';

// Bagian 6 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
Object.assign(techsPart6,
    techsPart6Part1,
    techsPart6Part2,
    techsPart6Part3,
    techsPart6Part4
);
export { techsPart6 };


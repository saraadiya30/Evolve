import { techsPart3 } from './techs_registry.js';
import { techsPart3Part1 } from './tl3_1.js';
import { techsPart3Part2 } from './tl3_2.js';
import { techsPart3Part3 } from './tl3_3.js';
import { techsPart3Part4 } from './tl3_4.js';

// Bagian 3 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
Object.assign(techsPart3,
    techsPart3Part1,
    techsPart3Part2,
    techsPart3Part3,
    techsPart3Part4
);
export { techsPart3 };


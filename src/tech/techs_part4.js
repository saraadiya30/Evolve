import { techsPart4 } from './techs_registry.js';
import { techsPart4Part1 } from './tl4_1.js';
import { techsPart4Part2 } from './tl4_2.js';
import { techsPart4Part3 } from './tl4_3.js';
import { techsPart4Part4 } from './tl4_4.js';

// Bagian 4 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
Object.assign(techsPart4,
    techsPart4Part1,
    techsPart4Part2,
    techsPart4Part3,
    techsPart4Part4
);
export { techsPart4 };


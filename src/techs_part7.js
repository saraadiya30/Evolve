import { techsPart7 } from './techs_registry.js';
import { techsPart7Part1 } from './tl7_1.js';
import { techsPart7Part2 } from './tl7_2.js';
import { techsPart7Part3 } from './tl7_3.js';
import { techsPart7Part4 } from './tl7_4.js';

// Bagian 7 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
Object.assign(techsPart7,
    techsPart7Part1,
    techsPart7Part2,
    techsPart7Part3,
    techsPart7Part4
);
export { techsPart7 };


import { techsPart8 } from './techs_registry.js';
import { techsPart8Part1 } from './tl8_1.js';
import { techsPart8Part2 } from './tl8_2.js';
import { techsPart8Part3 } from './tl8_3.js';

// Bagian 8 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
Object.assign(techsPart8,
    techsPart8Part1,
    techsPart8Part2,
    techsPart8Part3
);
export { techsPart8 };


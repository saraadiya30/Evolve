import { techsPart4 } from '../registry.js';
import { techsPart4Part1 } from './mine_conveyor_to_steel_shovel.js';
import { techsPart4Part2 } from './titanium_shovel_to_steel_hoe.js';
import { techsPart4Part3 } from './titanium_hoe_to_gauss_rifles.js';
import { techsPart4Part4 } from './cyborg_soldiers_to_cement.js';

// Bagian 4 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
Object.assign(techsPart4,
    techsPart4Part1,
    techsPart4Part2,
    techsPart4Part3,
    techsPart4Part4
);
export { techsPart4 };


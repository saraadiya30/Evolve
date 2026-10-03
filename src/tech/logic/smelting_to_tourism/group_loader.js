import { techsPart2 } from '../registry.js';
import { techsPart2Part1 } from './smelting_to_cranes.js';
import { techsPart2Part2 } from './titanium_crates_to_republic.js';
import { techsPart2Part3 } from './socialist_to_bonds.js';
import { techsPart2Part4 } from './steel_vault_to_tourism.js';

// Bagian 2 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
Object.assign(techsPart2,
    techsPart2Part1,
    techsPart2Part2,
    techsPart2Part3,
    techsPart2Part4
);
export { techsPart2 };


import { techsPart6 } from '../registry.js';
import { techsPart6Part1 } from './stabilize_blackhole_to_xeno_linguistics.js';
import { techsPart6Part2 } from './xeno_culture_to_advanced_emplacement.js';
import { techsPart6Part3 } from './dial_it_to_11_to_concealment.js';
import { techsPart6Part4 } from './improved_concealment_to_protocol66a.js';

// Bagian 6 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
Object.assign(techsPart6,
    techsPart6Part1,
    techsPart6Part2,
    techsPart6Part3,
    techsPart6Part4
);
export { techsPart6 };


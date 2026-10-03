import { techsPart3 } from '../registry.js';
import { techsPart3Part1 } from './xeno_tourism_to_preparation_methods.js';
import { techsPart3Part2 } from './final_ingredient_to_quantum_computing.js';
import { techsPart3Part3 } from './virtual_reality_to_lake_analysis.js';
import { techsPart3Part4 } from './lake_threat_to_breeder_reactor.js';

// Bagian 3 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
Object.assign(techsPart3,
    techsPart3Part1,
    techsPart3Part2,
    techsPart3Part3,
    techsPart3Part4
);
export { techsPart3 };


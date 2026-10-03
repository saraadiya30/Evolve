import { techsPart8 } from '../registry.js';
import { techsPart8Part1 } from './alien_research_to_outer_plane_study.js';
import { techsPart8Part2 } from './camouflage_to_divine_infuser.js';
import { techsPart8Part3 } from './might_to_ultimate_corruption.js';

// Bagian 8 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
Object.assign(techsPart8,
    techsPart8Part1,
    techsPart8Part2,
    techsPart8Part3
);
export { techsPart8 };


import { edenAsphodel } from '../eden_regions_registry.js';
import { edenAsphodelPart1 } from './info_to_research_station.js';
import { edenAsphodelPart2 } from './warehouse_to_bliss_den.js';
import { edenAsphodelPart3 } from './rectory_to_corruptor.js';

// Region 'eden_asphodel' dari edenicModules (dipisah dari edenic.js). Urutan/isi entri sama persis; digabung di edenic.js.
Object.assign(edenAsphodel,
    edenAsphodelPart1,
    edenAsphodelPart2,
    edenAsphodelPart3
);
export { edenAsphodel };

